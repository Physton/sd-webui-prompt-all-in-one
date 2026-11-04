import type { ITSTypeAndStringLiteral } from 'ts-type'

/**
 * mojibake 還原方法。
 *
 * none      — 未還原（非 mojibake、或證據不足以安全還原）
 * round-trip — 完整還原：所有 bytes 俱在，Latin-1 / Windows-1252 反向對映後以 UTF-8 嚴格解碼即得原文
 * gap-fill  — 最佳努力：部分續接位元組（0x80–0x9F，Latin-1 下為不可見 C1 控制字元）在傳輸中被丟棄，
 *             以候選枚舉 + 詞典評分重建缺口；結果為推測，信心分數較低
 */
export const enum EnumMojibakeRepairMethod {
    none = 'none',
    roundTrip = 'round-trip',
    gapFill = 'gap-fill',
}

/**
 * mojibake 還原方法（相容於 js：接受原始字串）。
 */
export type IMojibakeRepairMethod = ITSTypeAndStringLiteral<EnumMojibakeRepairMethod>

/**
 * 還原結果。
 */
export interface IMojibakeRepairResult {
    /** 還原後的文字；未還原時為原文字 */
    text: string
    /** 套用的還原方法 */
    method: EnumMojibakeRepairMethod
    /** 信心 0–1：round-trip 為確定性還原（≥0.8）；gap-fill 為推測（≤0.8） */
    confidence: number
    /** 是否有變動 */
    changed: boolean
}

/* ====================================================================
 *  Windows-1252 反向對映（僅列與 Latin-1 不同的 0x80–0x9F 區段）
 *
 *  誤讀鏈為「UTF-8 bytes 被以 Windows-1252 解讀」時，這些可見符號
 *  各自還原為原 byte；Latin-1 讀法下的同位字元（U+0080–U+009F 控制
 *  字元、U+00A0–U+00FF 可見字母）與 codepoint 同值，無須對映。
 * ==================================================================== */

const CP1252_BYTE_BY_CODEPOINT: ReadonlyMap<number, number> = new Map<number, number>([
    [0x20AC, 0x80], [0x201A, 0x82], [0x0192, 0x83], [0x201E, 0x84],
    [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02C6, 0x88],
    [0x2030, 0x89], [0x0160, 0x8A], [0x2039, 0x8B], [0x0152, 0x8C],
    [0x017D, 0x8E], [0x2018, 0x91], [0x2019, 0x92], [0x201C, 0x93],
    [0x201D, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
    [0x02DC, 0x98], [0x2122, 0x99], [0x0161, 0x9A], [0x203A, 0x9B],
    [0x0153, 0x9C], [0x017E, 0x9E], [0x0178, 0x9F],
])

/* ====================================================================
 *  詞典（啓發式評分用，非完整字集）
 *
 *  COMMON_CHARS：常用日中漢字（頻序近似），用於缺口候選排序
 *  COMMON_WORDS：常用詞，具雙重職責——
 *    1. 缺口候選加分（詞救援：相鄰缺口可拼出已知詞時大幅提升）
 *    2. gap-fill 接受門檻：最終文本須命中至少一詞，否則寧可不動
 * ==================================================================== */

const COMMON_CHARS = '的一是了人我不在有他這这中大來来上國国個个到說说們们為为子和你地出道也時时年得就那要下以生會会自著着去之過过家學学對对她她裡里後后小天心多好都然沒没日於于起發发成事只作當当想看文無无開开手十用主行明經经頭头方又如前所本見见長长間门問问理月半安點点實实內内全表機机太海車车白兒儿爭争北才領领切呢活爾尔反特許许建先像做女真写東东業业電話电话攝影摄影撮影動画动画音楽音乐風景风景美人美女世界日本中国時間时间写真集電車电车新幹線天気天气料理会社学生先生機場机场感謝谢谢'

const COMMON_CHAR_SET: ReadonlySet<string> = new Set(Array.from(COMMON_CHARS))

/** 高頻通用標點（mojibake 重建時優先選中：彎引號 / 破折號 / 省略號等） */
const COMMON_PUNCT = '–—‘’“”…‰‡'

const COMMON_WORDS: readonly string[] = [
    '写真', '写真集', '撮影', '東京', '东京', '日本', '中国', '世界',
    '美人', '美女', '風景', '风景', '人物', '動画', '动画', '音樂', '音乐',
    '時間', '时间', '電話', '电话', '電車', '电车', '新幹線', '新干线',
    '天気', '天气', '料理', '会社', '学生', '先生', '機場', '机场',
    'ありがとう', 'こんにちは', 'おはよう', 'すみません', '撮影会',
]

/* ====================================================================
 *  缺口重建參數
 *
 *  被剝除的續接位元組範圍：Latin-1 解讀下 0x80–0x9F 為 C1 控制字元，
 *  肉眼不可見、常在聊天/網頁傳輸中被丟棄；續接位元組 0xA0–0xBF 為可見
 *  符號（± » ¬ 等）會存活，成為重建時的錨點。
 * ==================================================================== */

const STRIPPED_CONT_LO = 0x80
const STRIPPED_CONT_HI = 0x9F

/** 每個缺口保留的最高分候選數（枚舉全數後裁剪） */
const MAX_CANDIDATES_PER_GAP = 48

/** beam search 寬度 */
const BEAM_WIDTH = 8

/** 詞典救援加分（使已知詞候選優先於同分的普通常用字） */
const WORD_RESCUE_BONUS = 6

/** 最終文本命中常用詞的加分（已計入 beam 階段評分） */
const COMMON_WORD_BONUS = 5

const UTF8_DECODER = new TextDecoder('utf-8', { fatal: true })

/** 缺口描述：lead 位元組後所需的續接位元組不足，差額即被剝除的數量 */
interface IGap {
    /** lead 位元組在 bytes 陣列中的位置 */
    index: number
    /** UTF-8 lead byte（0xE0–0xEF 或 0xF0–0xF4） */
    lead: number
    /** 該序列所需續接位元組總數 */
    needed: number
    /** 原地存活的續接位元組（0xA0–0xBF，已按原順序） */
    present: readonly number[]
}

/** 缺口候選：一組可填入的續接位元組及其解出的字元 */
interface IGapCandidate {
    conts: readonly number[]
    char: string
    score: number
}

interface IBeamHyp {
    /** 至目前為止各缺口選定的續接位元組 */
    fills: (readonly number[])[]
    /** 套用 fills 後、截至目前缺口的前綴文本（供詞評分） */
    prefix: string
    score: number
}

/**
 * 字元 → 誤讀前的 byte。
 *
 * U+0000–U+00FF 與 codepoint 同值（Latin-1 讀法涵蓋全部 256 個 byte）；
 * 其餘先查 Windows-1252 對映；皆不中則回傳 null（真正的 Unicode 文字，
 * 不屬於 mojibake 鏈）。
 *
 * @param {string} ch - 單一字元
 * @returns {number | null}
 */
function charToByte(ch: string): number | null {
    const cp = ch.codePointAt(0)
    if (cp === undefined) return null
    if (cp <= 0xFF) return cp
    const mapped = CP1252_BYTE_BY_CODEPOINT.get(cp)
    return mapped === undefined ? null : mapped
}

/**
 * 嚴格 UTF-8 解碼：任何無效序列（含被截斷的尾端、獨立出現的續接位元組）
 * 一律回傳 null，絕不產生替代字元。
 *
 * @param {readonly number[]} bytes - 待解碼位元組
 * @returns {string | null} 解碼文本；無效時為 null
 */
function strictDecodeUtf8(bytes: readonly number[]): string | null {
    try {
        return UTF8_DECODER.decode(Uint8Array.from(bytes))
    } catch {
        return null
    }
}

/**
 * 字串 → 誤讀前的 byte 陣列。
 *
 * @param {string} line - 單行文字
 * @returns {number[] | null} byte 陣列；含無法對映字元時為 null
 */
function lineToBytes(line: string): number[] | null {
    const bytes: number[] = []
    for (const ch of line) {
        const byte = charToByte(ch)
        if (byte === null) return null
        bytes.push(byte)
    }
    return bytes
}

/**
 * 是否存在「誤讀鏈證據」字元（C1 控制字元或 Windows-1252 專屬符號）。
 * round-trip 接受門檻用：純 Latin 字母文字（如合法法文）不具此類字元。
 *
 * @param {string} line - 單行文字
 * @returns {boolean}
 */
function hasMojibakeMarker(line: string): boolean {
    for (const ch of line) {
        const cp = ch.codePointAt(0) ?? 0
        if (cp >= 0x80 && cp <= 0x9F) return true
        if (cp > 0xFF && CP1252_BYTE_BY_CODEPOINT.has(cp)) return true
    }
    return false
}

/**
 * 字元是否為「lead-like」：Latin-1 高位字元中，落在 UTF-8 lead byte
 * 範圍（0xC2–0xF4）者。mojibake 骨架偵測與詞救援相容性判斷用。
 *
 * @param {number} cp - codepoint
 * @returns {boolean}
 */
function isLeadLike(cp: number): boolean {
    return cp >= 0xC2 && cp <= 0xF4
}

/**
 * 是否存在 lead + 存活續接位元組相鄰的骨架（mojibake 強證據；
 * 合法拉丁文字的高位字元之間不會相鄰成此形）。
 *
 * @param {readonly number[]} bytes - byte 陣列
 * @returns {boolean}
 */
function hasLeadContAdjacency(bytes: readonly number[]): boolean {
    for (let i = 0; i + 1 < bytes.length; i++) {
        if (isLeadLike(bytes[i]) && bytes[i + 1] >= 0xA0 && bytes[i + 1] <= 0xBF) return true
    }
    return false
}

/**
 * 不同 lead-like byte 的數量（0xC2–0xF4）。
 *
 * gap-fill 第三道證據：單一 lead 重複（如合法芬蘭語 ää）不放行，
 * 至少兩種不同 lead 才視為 mojibake 骨架——合法文字同時出現兩種
 * 以上此類高位且都落在缺口結構上，機率極低。
 *
 * @param {readonly number[]} bytes - byte 陣列
 * @returns {number} 相異 lead-like byte 數
 */
function countDistinctLeadLike(bytes: readonly number[]): number {
    const leads = new Set<number>()
    for (const b of bytes) {
        if (isLeadLike(b)) leads.add(b)
    }
    return leads.size
}

/**
 * 偵測 byte 陣列中的缺口（被剝除的續接位元組）。
 *
 * 遇到下列情形回傳 null（非本機制可安全處理的結構）：
 *   - 續接位元組獨立出現（0x80–0xC1）：非剝除特徵
 *   - 二元組（C2–DF）lead 的續接位元組缺失：原文該處本就是 C1 控制字元，
 *     還原無意義且會誤傷合法 Latin 文字（如 café → caf間）
 *   - 存活續接位元組超過所需：結構異常
 *
 * @param {readonly number[]} bytes - byte 陣列
 * @returns {IGap[] | null} 缺口清單；無可處理結構時為 null
 */
function detectGaps(bytes: readonly number[]): IGap[] | null {
    const gaps: IGap[] = []
    let i = 0
    while (i < bytes.length) {
        const b = bytes[i]
        if (b < 0x80) {
            i++
            continue
        }
        let needed = 0
        if (b >= 0xC2 && b <= 0xDF) needed = 1
        else if (b >= 0xE0 && b <= 0xEF) needed = 2
        else if (b >= 0xF0 && b <= 0xF4) needed = 3
        else return null

        const present: number[] = []
        let j = i + 1
        while (j < bytes.length && bytes[j] >= 0x80 && bytes[j] <= 0xBF) {
            present.push(bytes[j])
            j++
        }
        if (present.length > needed) return null
        if (present.length < needed) {
            if (needed === 1) return null
            gaps.push({ index: i, lead: b, needed, present })
        }
        i = j
    }
    return gaps
}

/**
 * 單一字元評分（缺口候選排序）。
 *
 * 平/片假名與 CJK 標點幾乎必為正當文字給高分；常用漢字 4 分、
 * 其餘 CJK 1 分；通用標點（U+2000–U+206F）中高頻者 3 分、其餘 1 分
 * ——英文彎引號 / 破折號類 mojibake 依此優先選中原字。
 * 非目標範圍（Latin 高位、私用區、其他符號）給 0，由呼叫端過濾——
 * 這道過濾同時擋掉以 0xEF 等 lead 開頭的私用區填充
 * （合法法文 héroïque 之類的誤傷防線）。
 *
 * @param {number} cp - 候選字元 codepoint
 * @returns {number} 分數；0 表示拒絕
 */
function charScore(cp: number): number {
    if (cp >= 0x3040 && cp <= 0x30FF) return 3
    if (cp >= 0x3000 && cp <= 0x303F) return 2
    if (cp >= 0x4E00 && cp <= 0x9FFF) return COMMON_CHAR_SET.has(String.fromCodePoint(cp)) ? 4 : 1
    if (cp >= 0x3400 && cp <= 0x4DBF) return 1
    if (cp >= 0xFF00 && cp <= 0xFFEF) return 2
    if (cp >= 0x2000 && cp <= 0x206F) return COMMON_PUNCT.includes(String.fromCodePoint(cp)) ? 3 : 1
    if (cp >= 0x20A0 && cp <= 0x20BF) return 2
    return 0
}

/**
 * 由 lead + 續接位元組算 codepoint（3-byte / 4-byte 序列）。
 *
 * @param {number} lead - UTF-8 lead byte
 * @param {readonly number[]} conts - 全部續接位元組
 * @returns {number} codepoint
 */
function codePointFrom(lead: number, conts: readonly number[]): number {
    let cp = lead & (lead >= 0xF0 ? 0x07 : 0x0F)
    for (const c of conts) {
        cp = (cp << 6) | (c & 0x3F)
    }
    return cp
}

/**
 * 由 codepoint 反推三元組續接位元組（詞救援候選用；詞彙皆為 BMP 常用字）。
 *
 * @param {number} cp - codepoint（0x800–0xFFFF）
 * @returns {readonly number[] | null} 續接位元組；非三元組範圍時為 null
 */
function contsFromCodePoint(cp: number): readonly number[] | null {
    if (cp < 0x800 || cp > 0xFFFF) return null
    return [0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F)]
}

/**
 * 由 codepoint 反推 lead byte。
 *
 * @param {number} cp - codepoint
 * @returns {number} lead byte
 */
function leadFromCodePoint(cp: number): number {
    if (cp < 0x800) return 0xC0 | (cp >> 6)
    if (cp <= 0xFFFF) return 0xE0 | (cp >> 12)
    return 0xF0 | (cp >> 18)
}

/**
 * 詞候選續接位元組是否與缺口相容：lead 相符且存活錨點皆在其中（保序）。
 *
 * @param {IGap} gap - 缺口
 * @param {number} cp - 詞字元 codepoint
 * @returns {boolean}
 */
function wordCandidateFits(gap: IGap, cp: number): boolean {
    if (leadFromCodePoint(cp) !== gap.lead) return false
    const conts = contsFromCodePoint(cp)
    if (conts === null || conts.length !== gap.needed) return false
    /** 存活錨點須全部保留；其餘槽位只能填可剝除值（0x80–0x9F），假設外的值不採 */
    const remainingPresent = [...gap.present]
    for (const c of conts) {
        const at = remainingPresent.indexOf(c)
        if (at >= 0) {
            remainingPresent.splice(at, 1)
        } else if (c < STRIPPED_CONT_LO || c > STRIPPED_CONT_HI) {
            return false
        }
    }
    return remainingPresent.length === 0
}

/**
 * 枚舉單一缺口的基礎候選：存活續接位元組在槽位中的所有擺放方式 ×
 * 缺失槽位以 0x80–0x9F 全值填充，解出 codepoint 後以 charScore 過濾排序。
 *
 * @param {IGap} gap - 缺口
 * @returns {IGapCandidate[]} 截斷至 MAX_CANDIDATES_PER_GAP 的候選（依分數降冪）
 */
function enumerateGapCandidates(gap: IGap): IGapCandidate[] {
    const present = gap.present
    const candidates: IGapCandidate[] = []
    const seen = new Set<string>()

    /** 存活續接位元組佔據的槽位組合（保序；needed ≤ 3，組合數 ≤ 3） */
    const presentSlotCombos: number[][] = []
    const chooseSlots = (start: number, remaining: number, chosen: number[]): void => {
        if (remaining === 0) {
            presentSlotCombos.push([...chosen])
            return
        }
        for (let slot = start; slot + remaining - 1 < gap.needed; slot++) {
            chooseSlots(slot + 1, remaining - 1, [...chosen, slot])
        }
    }
    chooseSlots(0, present.length, [])

    for (const slots of presentSlotCombos) {
        const fixed = new Map<number, number>()
        slots.forEach((slot, i) => fixed.set(slot, present[i]))
        const fillSlots: number[] = []
        for (let slot = 0; slot < gap.needed; slot++) {
            if (!fixed.has(slot)) fillSlots.push(slot)
        }

        const total = Math.pow(STRIPPED_CONT_HI - STRIPPED_CONT_LO + 1, fillSlots.length)
        for (let n = 0; n < total; n++) {
            const conts: number[] = []
            let rest = n
            for (let slot = 0; slot < gap.needed; slot++) {
                if (fixed.has(slot)) {
                    conts.push(fixed.get(slot) as number)
                } else {
                    const slotIndex = fillSlots.indexOf(slot)
                    const divisor = Math.pow(STRIPPED_CONT_HI - STRIPPED_CONT_LO + 1, fillSlots.length - 1 - slotIndex)
                    conts.push(STRIPPED_CONT_LO + Math.floor(rest / divisor))
                    rest %= divisor
                }
            }
            const cp = codePointFrom(gap.lead, conts)
            if (cp >= 0xD800 && cp <= 0xDFFF) continue
            const score = charScore(cp)
            if (score <= 0) continue
            const char = String.fromCodePoint(cp)
            if (seen.has(char)) continue
            seen.add(char)
            candidates.push({ conts, char, score })
        }
    }

    candidates.sort((a, b) => b.score - a.score)
    return candidates.slice(0, MAX_CANDIDATES_PER_GAP)
}

/**
 * 計入指定缺口數的 byte 陣列（缺口 0..uptoGap-1 已以 fills 填補）。
 *
 * 評分用前綴必須在第 uptoGap 個缺口處截斷（includeTail=false）：其後
 * 尚未填補的截斷序列會使 UTF-8 嚴格解碼失敗；最終結果才帶上尾段
 * （includeTail=true，此時所有缺口已填滿）。
 *
 * @param {readonly number[]} bytes - 原 byte 陣列
 * @param {readonly IGap[]} gaps - 缺口清單
 * @param {readonly (readonly number[])[]} fills - 各缺口選定的續接位元組
 * @param {number} uptoGap - 填補至第幾個缺口（不含）
 * @param {boolean} includeTail - 是否接上 uptoGap 之後的原始尾段
 * @returns {number[]} byte 陣列
 */
function buildPrefixBytes(
    bytes: readonly number[],
    gaps: readonly IGap[],
    fills: readonly (readonly number[])[],
    uptoGap: number,
    includeTail: boolean,
): number[] {
    const out: number[] = []
    let cursor = 0
    for (let gi = 0; gi < uptoGap; gi++) {
        const gap = gaps[gi]
        out.push(...bytes.slice(cursor, gap.index + 1))
        out.push(...(fills[gi] ?? gap.present))
        cursor = gap.index + 1 + gap.present.length
    }
    if (includeTail) {
        out.push(...bytes.slice(cursor))
    }
    return out
}

/**
 * 文本命中常用詞的次數（非重疊掃描）。
 *
 * @param {string} text - 待評分文本
 * @returns {number} 命中次數
 */
function wordBonus(text: string): number {
    let hits = 0
    for (const word of COMMON_WORDS) {
        let from = 0
        for (;;) {
            const at = text.indexOf(word, from)
            if (at < 0) break
            hits++
            from = at + word.length
        }
    }
    return hits
}

/**
 * 以 beam search 重建全部缺口。
 *
 * 逐缺口擴展假設並以「候選字元分數 + 前綴詞命中」評分，保留前
 * BEAM_WIDTH 名；詞典救援候選（可拼出已知詞的字元）自帶加分，
 * 使其優先於同分的普通常用字。最終文本須通過 repairGapFilledOutput
 * 的接受檢核才會被採用。
 *
 * @param {readonly number[]} bytes - byte 陣列
 * @param {readonly IGap[]} gaps - 缺口清單
 * @param {boolean} hadMarker - 輸出行是否帶 C1 / Windows-1252 專屬符號等鏈證據（B 層接受閘用）
 * @returns {string | null} 還原文本；任一缺口無候選或解碼失敗時為 null
 */
function beamFill(bytes: readonly number[], gaps: readonly IGap[], hadMarker: boolean): string | null {
    const perGap: IGapCandidate[][] = gaps.map(gap => enumerateGapCandidates(gap))

    /** 相鄰缺口視為一個 run，run 內嘗試詞典救援 */
    let runStart = -1
    for (let gi = 0; gi <= gaps.length; gi++) {
        const adjacent = gi < gaps.length && runStart >= 0
            && gaps[gi].index === gaps[gi - 1].index + 1 + gaps[gi - 1].present.length
        if (adjacent) continue
        if (runStart >= 0 && gi - runStart >= 2) {
            applyWordRescue(gaps, perGap, runStart, gi)
        }
        runStart = gi < gaps.length ? gi : -1
    }

    let hyps: IBeamHyp[] = [{ fills: [], prefix: '', score: 0 }]
    for (let gi = 0; gi < gaps.length; gi++) {
        if (perGap[gi].length === 0) return null
        const next: IBeamHyp[] = []
        for (const hyp of hyps) {
            for (const cand of perGap[gi]) {
                const fills = [...hyp.fills, cand.conts]
                const prefix = strictDecodeUtf8(buildPrefixBytes(bytes, gaps, fills, gi + 1, false))
                if (prefix === null) continue
                next.push({ fills, prefix, score: hyp.score + cand.score + wordBonus(prefix) * COMMON_WORD_BONUS })
            }
        }
        next.sort((a, b) => b.score - a.score)
        hyps = next.slice(0, BEAM_WIDTH)
        if (hyps.length === 0) return null
    }

    const full = strictDecodeUtf8(buildPrefixBytes(bytes, gaps, hyps[0].fills, gaps.length, true))
    if (full === null) return null
    return repairGapFilledOutput(full, hadMarker) ? full : null
}

/**
 * 詞典救援：run 內每個已知詞依各偏移嘗試嵌入，與缺口 lead/錨點相容的
 * 字元以加權候選注入該缺口，使「多個全缺缺口恰組成已知詞」（如聊天
 * 傳輸後僅剩 â 級殘骸的文字）得以被選中。
 *
 * @param {readonly IGap[]} gaps - 缺口清單
 * @param {IGapCandidate[][]} perGap - 各缺口候選（原地注入）
 * @param {number} runStart - run 起始缺口索引（含）
 * @param {number} runEnd - run 結束缺口索引（不含）
 * @returns {void}
 */
function applyWordRescue(
    gaps: readonly IGap[],
    perGap: IGapCandidate[][],
    runStart: number,
    runEnd: number,
): void {
    const runLength = runEnd - runStart
    for (const word of COMMON_WORDS) {
        const chars = Array.from(word)
        if (chars.length < 2 || chars.length > runLength) continue
        for (let offset = 0; offset + chars.length <= runLength; offset++) {
            for (let ci = 0; ci < chars.length; ci++) {
                const gap = gaps[runStart + offset + ci]
                const cp = chars[ci].codePointAt(0) ?? 0
                if (!wordCandidateFits(gap, cp)) continue
                const conts = contsFromCodePoint(cp)
                if (conts === null) continue
                const score = charScore(cp)
                if (score <= 0) continue
                const bucket = perGap[runStart + offset + ci]
                if (bucket.some(c => c.char === chars[ci])) continue
                bucket.push({ conts, char: chars[ci], score: score + WORD_RESCUE_BONUS })
            }
        }
    }
}

/**
 * gap-fill 結果的接受檢核（兩層閘）。
 *
 *   A 層（日中重建）：輸出含 ≥2 個假名/CJK 且命中至少一個常用詞——
 *     詞典是「重建正確」的硬證據，缺一不可。
 *   B 層（純標點/英文重建）：輸出行本身帶 C1 鏈證據（原始 C1 控制
 *     字元仍在）才放行——英文彎引號類 mojibake 沒有詞典可依，但
 *     C1 的存在本身就是誤讀鏈的直接證明；無 C1 的合法外文
 *     （法文、芬蘭文）在此被擋下。
 *
 * 兩層共同要求：輸出嚴格解碼成功（呼叫端保證）且不含殘留 C1。
 *
 * @param {string} output - 還原候選文本
 * @param {boolean} hadMarker - 輸出行是否帶 C1 / Windows-1252 專屬符號等鏈證據
 * @returns {boolean} 是否採用
 */
function repairGapFilledOutput(output: string, hadMarker: boolean): boolean {
    let cjkCount = 0
    for (const ch of output) {
        const cp = ch.codePointAt(0) ?? 0
        if (cp >= 0x80 && cp <= 0x9F) return false
        if ((cp >= 0x3000 && cp <= 0x30FF) || (cp >= 0x4E00 && cp <= 0x9FFF)) cjkCount++
    }
    if (cjkCount === 0) return hadMarker
    return cjkCount >= 2 && wordBonus(output) >= 1
}

/**
 * round-trip 結果的接受檢核。
 *
 * 純 Latin 高位文字（合法法文等）誤傷防線：解碼結果須消除誤讀鏈證據
 * 字元（C1 / Windows-1252 專屬符號 / mojibake 形態的 Ã），或解出
 * CJK/假名——否則視為巧合的合法文字，不動。
 *
 * @param {string} input - 原文字
 * @param {string} output - 嚴格解碼結果
 * @returns {boolean} 是否採用
 */
function repairRoundTripOutput(input: string, output: string): boolean {
    if (output === input) return false
    let hadSuspicious = false
    let hasCjk = false
    for (const ch of input) {
        const cp = ch.codePointAt(0) ?? 0
        if ((cp >= 0x80 && cp <= 0x9F) || (cp > 0xFF && CP1252_BYTE_BY_CODEPOINT.has(cp)) || cp === 0xC3) {
            hadSuspicious = true
            break
        }
    }
    for (const ch of output) {
        const cp = ch.codePointAt(0) ?? 0
        if ((cp >= 0x3000 && cp <= 0x30FF) || (cp >= 0x4E00 && cp <= 0x9FFF)) {
            hasCjk = true
            break
        }
    }
    return hadSuspicious || hasCjk
}

/** 行 / 段級還原結果（內部使用） */
type IRepairLineResult = { text: string; method: EnumMojibakeRepairMethod; confidence: number }

/**
 * 單一「全可對映字串段」的還原嘗試：round-trip → gap-fill。
 *
 * @param {string} segment - 段內每字皆可對映為誤讀前 byte
 * @returns {IRepairLineResult | null} 還原結果；未還原時為 null
 */
function repairRunSegment(segment: string): IRepairLineResult | null {
    const bytes = lineToBytes(segment)
    if (bytes === null) return null

    const marker = hasMojibakeMarker(segment)

    /** round-trip：全 bytes 俱在時的確定性還原 */
    const decoded = strictDecodeUtf8(bytes)
    if (decoded !== null && repairRoundTripOutput(segment, decoded)) {
        return { text: decoded, method: EnumMojibakeRepairMethod.roundTrip, confidence: marker ? 0.95 : 0.8 }
    }

    /** gap-fill：C1 續接位元組被剝除時的最佳努力重建 */
    const evidence = marker || hasLeadContAdjacency(bytes) || countDistinctLeadLike(bytes) >= 2
    if (!evidence) return null
    const gaps = detectGaps(bytes)
    if (gaps === null || gaps.length === 0) return null
    const filled = beamFill(bytes, gaps, marker)
    if (filled === null) return null
    const confidence = Math.min(0.8, Math.max(0.1, 0.35 + wordBonus(filled) * 0.15 - Math.max(0, gaps.length - 1) * 0.03))
    return { text: filled, method: EnumMojibakeRepairMethod.gapFill, confidence }
}

/**
 * 以 cp1252 專屬符號（codepoint > 0xFF 且可對映者）為界細分後逐一還原。
 *
 * 整段反向對映會把「正確文字中的符號」（如正確的 em-dash —）轉成孤立
 * byte 破壞解碼，使整段失敗；細分後符號原樣保留，只剩 Latin/ASCII/C1
 * 子段參與還原，正確文字與 mojibake 殘骸得以共存於同一行。
 * 僅在整段嘗試失敗後才細分，故 â€™ 類由符號構成的 mojibake 仍在上一層
 * 被完整 round-trip，不會被誤拆。
 *
 * @param {string} segment - 已確認為全可對映但還原失敗的字串段
 * @returns {IRepairLineResult | null} 還原結果；細分後仍無一段可還原時為 null
 */
function repairRunWithSpecialBoundaries(segment: string): IRepairLineResult | null {
    const pieces: string[] = []
    const applied: IRepairLineResult[] = []
    let cur = ''
    const flush = (): void => {
        if (cur === '') return
        const r = repairRunSegment(cur)
        if (r === null) pieces.push(cur)
        else {
            applied.push(r)
            pieces.push(r.text)
        }
        cur = ''
    }
    for (const ch of segment) {
        if ((ch.codePointAt(0) ?? 0) > 0xFF) {
            flush()
            pieces.push(ch)
        } else {
            cur += ch
        }
    }
    flush()
    if (applied.length === 0) return null
    return {
        text: pieces.join(''),
        method: applied.some(a => a.method === EnumMojibakeRepairMethod.gapFill)
            ? EnumMojibakeRepairMethod.gapFill
            : EnumMojibakeRepairMethod.roundTrip,
        confidence: Math.min(...applied.map(a => a.confidence)),
    }
}

/**
 * 單行 mojibake 還原。
 *
 * 快路：整行單段一次還原（單純 mojibake 的常態）。
 * 混合路：整行失敗時，以不可對映字元（真 Unicode 文字）切段逐段還原，
 * 仍失敗的段再以 cp1252 專屬符號細分——正確文字（漢字、符號）原樣
 * 保留，只有 Latin/ASCII/C1 殘骸段被修復。
 *
 * @param {string} line - 單行文字
 * @returns {IRepairLineResult | null} 還原結果；未還原時為 null（由呼叫端決定保留原樣）
 */
function repairLine(line: string): IRepairLineResult | null {
    let hasHigh = false
    for (const ch of line) {
        if ((ch.codePointAt(0) ?? 0) > 0x7F) {
            hasHigh = true
            break
        }
    }
    if (!hasHigh) return null

    /** 快路：整行一次還原 */
    const whole = repairRunSegment(line)
    if (whole !== null) return whole

    /** 混合路：真 Unicode 字元為硬邊界；失敗段再以 cp1252 符號細分 */
    const pieces: string[] = []
    const applied: IRepairLineResult[] = []
    let cur = ''
    const flush = (): void => {
        if (cur === '') return
        const r = repairRunSegment(cur) ?? repairRunWithSpecialBoundaries(cur)
        if (r === null) pieces.push(cur)
        else {
            applied.push(r)
            pieces.push(r.text)
        }
        cur = ''
    }
    for (const ch of line) {
        if (charToByte(ch) === null) {
            flush()
            pieces.push(ch)
        } else {
            cur += ch
        }
    }
    flush()
    if (applied.length === 0) return null
    return {
        text: pieces.join(''),
        method: applied.some(a => a.method === EnumMojibakeRepairMethod.gapFill)
            ? EnumMojibakeRepairMethod.gapFill
            : EnumMojibakeRepairMethod.roundTrip,
        confidence: Math.min(...applied.map(a => a.confidence)),
    }
}

/**
 * mojibake 還原：把「被以 Latin-1 / Windows-1252 誤讀的 UTF-8 文字」
 * 盡可能還原為原始文字。
 *
 * 誤讀鏈：原文 → UTF-8 bytes → 以 Latin-1 或 Windows-1252 解讀成字串。
 * 逐行處理（\n 為結構，不受影響）；行內整行還原失敗時，再以真 Unicode /
 * cp1252 專屬符號分段，正確文字原樣保留。兩級策略：
 *   1. round-trip（確定性）：bytes 俱在時反向對映再以 UTF-8 嚴格解碼，
 *      例如 cafÃ© → café、ä<0x9D>±äº¬ → 東京。
 *   2. gap-fill（推測性）：C1 續接位元組（0x80–0x9F）在傳輸中被丟棄時，
 *      以存活錨點 + 常用字/詞典重建缺口；日中重建須命中已知詞、
 *      純標點重建須輸出行帶 C1 鏈證據，否則不採用。
 *
 * 注意：
 *   - 透過剪貼簿進入應用程式的 mojibake 通常 bytes 完整，走級 1 即可精確還原；
 *     經聊天室顯示再複製的文字可能丟失更多可見度低的 bytes（不止 C1），
 *     此時僅剩的資訊不足以還原，工具會保守地不動。
 *   - 未確認的輸入不會被修改；呼叫端可依 confidence 決定是否採用或提示使用者。
 *
 * @param {string} text - 疑似 mojibake 的文字
 * @returns {IMojibakeRepairResult} 還原結果（未還原時 text 為原文字、method 為 none）
 */
export function repairMojibake(text: string): IMojibakeRepairResult {
    const lines = text.split('\n')
    const repaired: string[] = []
    let anyChanged = false
    let weakestMethod: EnumMojibakeRepairMethod = EnumMojibakeRepairMethod.none
    let minConfidence = 1

    for (const line of lines) {
        const result = repairLine(line)
        if (result === null) {
            repaired.push(line)
            continue
        }
        anyChanged = true
        repaired.push(result.text)
        weakestMethod = EnumMojibakeRepairMethod.gapFill === result.method
            ? EnumMojibakeRepairMethod.gapFill
            : (weakestMethod === EnumMojibakeRepairMethod.none ? result.method : weakestMethod)
        minConfidence = Math.min(minConfidence, result.confidence)
    }

    if (!anyChanged) {
        return {
            text,
            method: EnumMojibakeRepairMethod.none,
            confidence: 0,
            changed: false,
        }
    }
    return {
        text: repaired.join('\n'),
        method: weakestMethod,
        confidence: minConfidence,
        changed: true,
    }
}

export default repairMojibake
