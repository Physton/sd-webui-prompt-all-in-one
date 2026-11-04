
import { describe, it } from 'node:test'
import type { TestContext } from 'node:test'
import crypto from 'node:crypto'
import { IPromptTagValue } from '#/src/utils/promptTags/tag-types'
import type {
    IOriginalComparisonSnap,
    IRunCasesSnap,
    ISplitTagsPipelineSnap,
    ISplitTagsSnap,
} from './types/snap-types'
import type {
    IRunCase,
    IRunCasesOptions,
    ISplitTagsFn,
    ISplitTagsPipelineCase,
    ISplitTagsTestsOptions,
} from './types/node-test-case-types'
import { assertSplitShape } from './node-test-helper2'

/** caseTitle 需要的最小案例形狀（各類案例皆滿足）。 */
interface ICaseBare {
    input: unknown
    args?: unknown[]
    note?: string
}

/**
 * 比較兩份結果是否不同。
 *
 * 以 JSON 序列化比較：被測函式回傳的是純資料陣列（無函式、無 undefined 欄位），
 * 序列化結果與結構相等一致。
 */
export function resultsDiffer(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) !== JSON.stringify(b)
}

/**
 * 逐案例註冊 it()；skip 為 true 的案例改以 it.skip 註冊。
 *
 * @param cases   - 案例陣列
 * @param toTitle - 由案例產生標題
 * @param handler - 案例主體（已帶上 tc，呼叫端不必在閉包重取）
 */
export function forEachCase<TCase>(
    cases: readonly TCase[],
    /**
     * toTitle 以 NoInfer 包住：caseTitle 的參數是較寬的 ICaseBare，
     * 若讓此參數參與 TCase 推斷，TS 會以 ICaseBare 統一各候選值，
     * 使 handler 內的 tc 喪失具體案例欄位。
     */
    toTitle: (tc: NoInfer<TCase>) => string,
    handler: (tc: TCase, t: TestContext) => void | Promise<void>,
): void {
    for (const tc of cases) {
        const title = toTitle(tc)
        /** 案例可宣告 skip（IRunCase / ISplitTagsCase / IUpdatePromptCase 皆有此欄位） */
        const skip = (tc as { skip?: boolean }).skip === true
        const run = (t: TestContext) => handler(tc, t)
        if (skip) {
            it.skip(title, run)
        } else {
            it(title, run)
        }
    }
}

/**
 * 截斷字串並以 "…" 結尾（共用工具）。
 */
export function truncate(str: string, maxLen = 60): string {
    if (str.length <= maxLen) return str
    return str.slice(0, maxLen) + '…'
}

/**
 * 將輸入值字串化為可讀的展示字串：JSON.stringify（精確轉義引號/控制字元）+ 超長截斷。
 * 例：
 *   a. b. c                          → "a. b. c"
 *   with "Small joys." below.        → "with \"Small joys.\" below."（引號正確轉義）
 *   a<newline>b                      → "a\nb"
 */
export function formatTitle(input: unknown, maxLen = 60): string {
    const notString = typeof input !== 'string'
    const raw = notString ? String(input) : input
    const truncated = truncate(raw, maxLen)

    /**
     * 非字串且未被截斷時，改以「原值」序列化。
     * raw 是 String(input) 的結果，會把物件壓成 "[object Object]"，
     * 保留原值才能讓 JSON.stringify 呈現結構。
     */
    if (notString && truncated.length === raw.length) {
        return JSON.stringify(input)
    }

    return JSON.stringify(truncated)
}

/**
 * 產生測試標題 — splitTags 與 splitByPeriod 共用。
 *
 * 規則：
 *   - 字串輸入 + 有 note ：「note — [sha256前8碼] "引號包裹值"」（note、hash、值完整呈現）
 *   - 字串輸入 + 無 note ：「[sha256前8碼] "引號包裹值"」
 *   - 非字串輸入        ：note，無 note 時以 formatTitle 呈現值
 *   - 有 args 時附加「 ({...})」後綴（同輸入不同參數時避免標題碰撞）
 *
 */
export function caseTitle(tc: ICaseBare): string {
    let title: string
    if (typeof tc.input === 'string') {
        const identified = `[${promptHash(tc.input)}] ${formatTitle(tc.input)}`
        title = tc.note ? `${tc.note} — ${identified}` : identified
    } else {
        title = tc.note || formatTitle(tc.input)
    }
    if (tc.args !== undefined && tc.args.length > 0) {
        const args = tc.args.map(a => typeof a === 'object' && a !== null
            ? `{${Object.entries(a).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join(', ')}}`
            : JSON.stringify(a)
        ).join(', ')
        title += ` (${args})`
    }
    return title
}

/**
 * 執行一組 data-driven 的測試案例。
 *
 * @example
 *   // 直接傳入已載入的函式
 *   runCases('basic', myFn, [
 *     { input: 'a. b. c', expected: ['a.', 'b.', 'c'] },
 *   ])
 *
 *   // 部分比對與自訂 callback（callback 拿得到 t，可用 t.assert.* 續寫）
 *   runCases('basic', myFn, [
 *     { input: { a: 1, b: 2 }, partialExpected: { a: 1 } },
 *     { input: 'a', assert: (result, t) => t.assert.match(result, /^a$/) },
 *   ])
 *
 *   // 啟用快照
 *   runCases('basic', myFn, [ ... ], { suiteSnapshot: true })
 *
 *   // 只記錄快照、不斷言的案例：一般測試組不開 suiteAllowSnapshotOnly，個別案例自行標記
 *   runCases('basic', myFn, [
 *     { input: 'a', caseAllowSnapshotOnly: true },
 *   ], { suiteSnapshot: true })
 *
 *   // 專存快照的測試組：整組允許省略斷言，不必逐筆標記（個別案例可用 caseAllowSnapshotOnly: false 收回）
 *   runCases('snapshots', myFn, [ ... ], { suiteSnapshot: true, suiteAllowSnapshotOnly: true })
 *
 *   // 傳入 factory function（lazy import）
 *   runCases('basic', () => import('./myModule.js').then(m => m.default), [
 *     { input: 'a. b. c', expected: ['a.', 'b.', 'c'] },
 *   ])
 */
export function runCases<TInput, TArgs extends unknown[], TResult>(
    suiteName: string,
    fn: (input: TInput, ...args: TArgs) => TResult | Promise<TResult>,
    cases: readonly IRunCase<TInput, TArgs, TResult>[],
    options: IRunCasesOptions = {},
): void {
    /**
     * suiteSnapshot: true 時整組寫入快照 { input, args?, result }（與 splitTags 同格式）。
     * suiteAllowSnapshotOnly: true 是「整組允許省略斷言」，只給專存快照的測試組；
     * 一般測試組靠案例自己的 caseAllowSnapshotOnly 逐筆決定。
     */
    const { suiteSnapshot = false, suiteAllowSnapshotOnly = false } = options
    describe(suiteName, async () => {
        forEachCase(cases, caseTitle, async (tc, t: TestContext) => {
            /**
             * 快照是否落盤：case 級 true 時即使 suite 未開也寫，
             * 其餘（省略與 false）一律跟隨 suiteSnapshot，不另建 case 級關閉邏輯。
             */
            const writeSnapshot = tc.caseSnapshot === true || suiteSnapshot
            /**
             * 此案例是否獲准省略斷言：
             * case 級明確 true → 允許、明確 false → 收回，省略時跟隨 suiteAllowSnapshotOnly。
             *
             * 以 in 而非 !== undefined 判斷期望欄位：允許案例明寫 expected: undefined
             * 描述「回傳 undefined」的合法結果。
             *
             * 缺斷言的兩道把關（快照只是回歸紀錄，不構成斷言）：
             *   1. 未獲允許 — 拋錯，避免新增案例漏寫期望卻靜默通過
             *   2. 已獲允許但無處可記 — 拋錯，案例既無斷言也無快照等於空跑
             */
            const hasExpected = 'expected' in tc
            const hasPartialExpected = 'partialExpected' in tc
            const hasAssert = tc.assert !== undefined
            const hasVerdict = hasExpected || hasPartialExpected || hasAssert
            if (!hasVerdict) {
                const allowed = tc.caseAllowSnapshotOnly ?? suiteAllowSnapshotOnly
                if (!allowed) {
                    /** case 級明確 false 代表收回 suite 的允許，訊息須指出是誰要求斷言 */
                    const reason = tc.caseAllowSnapshotOnly === false
                        ? 'caseAllowSnapshotOnly: false 已收回 suiteAllowSnapshotOnly 的允許，此案例仍缺少 expected / partialExpected / assert'
                        : '案例缺少必要性驗證（需提供 expected、partialExpected、assert，或標記 caseAllowSnapshotOnly: true；專存快照的測試組可改用 suiteAllowSnapshotOnly）'
                    throw new Error(`${reason}：${caseTitle(tc)}`)
                }
                if (!writeSnapshot) {
                    throw new Error(`允許省略斷言的案例須搭配快照（suiteSnapshot 或 caseSnapshot: true），否則此案例既無斷言也無紀錄：${caseTitle(tc)}`)
                }
            }
            /** args 為空時展開空陣列：等價於「不傳額外參數」 */
            const result = await fn(tc.input, ...(tc.args ?? ([] as unknown as TArgs)))
            if (writeSnapshot) {
                /** key 順序 input → args? → result 會被序列化到 .snapshot，須與既有快照一致 */
                const snap: IRunCasesSnap<TInput, TArgs, TResult> = tc.args !== undefined
                    ? { input: tc.input, args: tc.args, result }
                    : { input: tc.input, result }
                t.assert.snapshot(snap)
            }
            /**
             * 案例宣告的斷言全部執行，任一失敗即中止該案例：
             * expected 走 deepEqual 完全比對、partialExpected 走 partialDeepStrictEqual 部分比對、
             * assert 為自訂 callback（拿到 t，可用 t.assert.* 續寫）。
             * 允許省略斷言的案例在此必定三者皆無，不需分支。
             */
            if (hasExpected) {
                t.assert.deepEqual(result, tc.expected)
            }
            if (hasPartialExpected) {
                t.assert.partialDeepStrictEqual(result, tc.partialExpected)
            }
            tc.assert?.(result, t)
        })
    })
}

/**
 * 執行一組 splitTags 測試案例（可選接上 splitByPeriod 管線）。
 *
 * splitTags 單獨測試、splitTags → splitByPeriod 管線測試、
 * 管線專屬測試與 issues 回歸測試共用此函式，
 * 差別僅在是否接 splitByPeriod，以及案例上帶的斷言欄位。
 *
 * 流程：
 *   Step 1    splitTags 切割
 *   Step 1.5  形狀不變式（assertSplitShape，無條件）
 *   Step 1.6  案例級 assertResult
 *   Step 2    splitByPeriod 管線
 *   Step 2.5  形狀不變式（assertSplitShape，僅管線時）
 *   Step 2.6  案例級 assertPipeline
 *   Step 3    與原版比較並對照 expectOriginalChanged
 *   Step 4    組裝快照
 *
 * 形狀不變式與原版比較的驗證排在案例級斷言與快照之前：兩者與案例宣告與否無關，
 * 失敗即中止，該案例不會寫入快照。
 */
export function runSplitTagsTests({
    cases,
    splitTags,
    originalFn,
    splitByPeriod,
}: ISplitTagsTestsOptions): void {
    forEachCase(cases, caseTitle, (tc, t) => {
        /** Step 1: splitTags 切割 */
        const tagResult: IPromptTagValue[] = splitTags(tc.input, ...(tc.args ?? []))

        /** Step 1.5: 形狀不變式 */
        assertSplitShape(tagResult, t)

        /** Step 1.6: 案例級 assertResult */
        if (tc.assertResult) tc.assertResult(tagResult, t)

        /** Step 2: splitByPeriod 管線 */
        let finalResult: IPromptTagValue[] = tagResult
        let changed = false
        if (splitByPeriod) {
            finalResult = tagResult.flatMap(tag => splitByPeriod(tag, tc.splitByPeriodOptions))
            changed = resultsDiffer(tagResult, finalResult)

            if (tc.expectChanged !== undefined) {
                t.assert.equal(changed, tc.expectChanged)
            }

            if (changed) {
                console.log(`  ⚠ splitByPeriodChanged: true  (${tagResult.length} → ${finalResult.length} segments)`)
            } else {
                console.log(`  ✓ splitByPeriodChanged: false`)
            }
        }

        /** Step 2.5: 形狀不變式（未接管線時 finalResult 即 tagResult，已於 Step 1.5 驗證） */
        if (splitByPeriod) assertSplitShape(finalResult, t)

        /** Step 2.6: 案例級 assertPipeline */
        tc.assertPipeline?.(finalResult, t, tc)

        /** Step 3: 與原版比較並對照案例期望 */
        const originalComparison = compareWithOriginal(originalFn, tc, tagResult, t)

        /** Step 4: 組裝快照（key 順序與既有 .snapshot 一致，不可隨意重排） */
        let snap: ISplitTagsPipelineSnap | ISplitTagsSnap
        if (splitByPeriod) {
            const pipelineSnap: ISplitTagsPipelineSnap = {
                input: tc.input,
                splitTagsResult: tagResult,
                splitByPeriodChanged: changed,
            }
            if (changed) pipelineSnap.splitByPeriodResult = finalResult
            snap = pipelineSnap
        } else {
            snap = { input: tc.input, result: tagResult }
        }

        attachOriginalComparison(snap, originalComparison)
        t.assert.snapshot(snap)
    })
}

/**
 * 與原版比較後的結果。
 * 是否提供原版函式由 hasOriginal 辨識：未提供時沒有可比較的對象，
 * 兩個比較欄位不存在。
 */
export type IOriginalComparison =
    | { hasOriginal: false }
    | {
        hasOriginal: true
        /** 與原版結果是否有差異 */
        changedFromOriginal: boolean
        /** 原版輸出；僅在 changedFromOriginal=true 時寫入快照 */
        originalResult: IPromptTagValue[]
    }

/**
 * 與原版比較，並對照案例宣告的 expectOriginalChanged。
 *
 * 案例期望的是「差異狀態」而非原版輸出本身，故比較與對照同屬一個步驟，
 * 由本函式一併完成。
 *
 * @param originalFn - 原版函式；不傳表示無從比較
 * @param tc         - 測試案例（取 input / args / expectOriginalChanged）
 * @param result     - 被測函式的輸出
 * @param t          - node:test 的 TestContext（提供 assert）
 */
export function compareWithOriginal(
    originalFn: ISplitTagsFn | undefined,
    tc: ISplitTagsPipelineCase,
    result: IPromptTagValue[],
    t: TestContext,
): IOriginalComparison {
    if (!originalFn) return { hasOriginal: false }

    const originalResult = originalFn(tc.input, ...(tc.args ?? []))
    const changedFromOriginal = resultsDiffer(result, originalResult)
    if (tc.expectOriginalChanged !== undefined) {
        t.assert.equal(changedFromOriginal, tc.expectOriginalChanged,
            `與原版的差異狀態不符：expected=${tc.expectOriginalChanged}, actual=${changedFromOriginal}`)
    }
    return { hasOriginal: true, changedFromOriginal, originalResult }
}

/**
 * 將原版比較結果附加到快照物件。
 * 無原版可比時兩個欄位都不寫入；有差異時才附加 originalResult，
 * 未差異者不落盤以避免快照膨脹。
 *
 * @param snap       - 快照物件（會被 mutate；附加欄位須排在既有欄位之後）
 * @param comparison - compareWithOriginal 的回傳值
 */
export function attachOriginalComparison(
    snap: IOriginalComparisonSnap,
    comparison: IOriginalComparison,
): void {
    if (!comparison.hasOriginal) return
    snap.changedFromOriginal = comparison.changedFromOriginal
    if (comparison.changedFromOriginal) snap.originalResult = comparison.originalResult
}

/**
 * 產生輸入字串的短期雜湊（前 8 碼 hex），用於長輸入的快照標題。
 */
export function promptHash(str: string): string {
    return crypto.createHash('sha256').update(str).digest('hex').slice(0, 8)
}
