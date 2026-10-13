/**
 * build:css（以參數選擇本次任務目標）
 *
 *   node build-css.js main        編譯 ../styles/main.less → ../styles/main.min.css
 *   node build-css.js extensions  遞迴編譯 ../styles/extensions/ 下所有 .less → 同目錄 .min.css
 *
 * 工具鏈與原 `lessc --clean-css` 相同（less + less-plugin-clean-css），
 * 並以 format: 'keep-breaks' 保留換行（效果為一行一規則），
 * 兼顧檔案大小與可讀性。
 *
 * 輸出命名沿用 main.min.css 慣例：<name>.less → <name>.min.css
 */
const fs = require('fs')
const path = require('path')
const less = require('less')
const CleanCSSPlugin = require('less-plugin-clean-css')

const STYLES_DIR = path.resolve(__dirname, '..', 'styles')
const MAIN_LESS = path.join(STYLES_DIR, 'main.less')
const EXTENSIONS_DIR = path.join(STYLES_DIR, 'extensions')

const USAGE = [
    'Usage: node build-css.js <main|extensions|all>',
    '  main        compile styles/main.less -> styles/main.min.css',
    '  extensions  compile styles/extensions/**/*.less -> sibling .min.css',
    '  all         compile both all',
].join('\n')

/**
 * 遞迴收集目錄下的 .less 檔
 *
 * @param {string} dir
 * @returns {string[]}
 */
function findLessFiles(dir) {
    const files = []
    if (!fs.existsSync(dir)) return files
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            files.push(...findLessFiles(fullPath))
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.less')) {
            files.push(fullPath)
        }
    }
    return files
}

/**
 * 各任務目標要編譯的 .less 清單
 */
const TARGETS = {
    main: () => [MAIN_LESS],
    extensions: () => findLessFiles(EXTENSIONS_DIR),
    all: () => [...TARGETS.main(), ...TARGETS.extensions()],
}

/**
 * 編譯單一 .less 檔並輸出 .min.css
 *
 * @param {string} file - .less 檔的絕對路徑
 * @returns {Promise<string>} 輸出的 .min.css 路徑
 */
async function compile(file) {
    const source = fs.readFileSync(file, 'utf8')
    // filename 讓檔案內的相對 @import 能正確解析
    // format: 'keep-breaks'：維持 minify（壓縮空白、縮短數值等），
    // 僅保留 less 輸出中原有的換行 → 效果為一行一規則，
    // 檔案大小幾乎不變（每規則 +1 byte），diff／人工檢視更友善
    const result = await less.render(source, {
        filename: file,
        plugins: [new CleanCSSPlugin({
            format: 'keep-breaks',
        })],
    })
    const outFile = file.replace(/\.less$/i, '.min.css')
    fs.writeFileSync(outFile, result.css, 'utf8')
    return outFile
}

async function main() {
    const target = process.argv[2]
    if (!target || !TARGETS[target]) {
        console.error(USAGE)
        process.exitCode = 1
        return
    }
    const files = TARGETS[target]()
    if (files.length === 0) {
        console.log(`[build:css] no .less files found for target '${target}'`)
        return
    }
    let failed = 0
    for (const file of files) {
        try {
            const outFile = await compile(file)
            console.log(`[build:css] ${path.relative(process.cwd(), file)} -> ${path.relative(process.cwd(), outFile)}`)
        } catch (err) {
            failed++
            console.error(`[build:css] FAILED: ${path.relative(process.cwd(), file)}`)
            console.error((err && err.message) || err)
        }
    }
    // 任一檔案失敗即以非 0 結束，供 CI/建置流程中斷
    if (failed > 0) process.exitCode = 1
}

main().catch(err => {
    console.error((err && err.message) || err)
    process.exitCode = 1
})
