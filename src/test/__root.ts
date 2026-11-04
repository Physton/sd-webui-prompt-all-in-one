/**
 * 測試路徑架構 / Test Path Structure
 *
 * test/
 * ├── fixtures/              ← 測試資料夾（唯讀）
 * └── temp/                 ← 臨時檔案（可寫，永遠建立子資料夾）
 *     ├── fake-lib/
 *     └── temp-pkg/
 */
/// <reference types="node" />
/**
 * 如果不需要 upath2 可改用 path
 */
// import path from 'path';
import path from 'path';
// @ts-ignore
import { __ROOT_CORE } from './__root-core.cjs';

/**
 * 專案根目錄
 */
export const __ROOT = path.normalize(__ROOT_CORE);

export const isWin = process.platform === "win32";

/**
 * 測試資料夾
 * 基於 {@link __ROOT}
 *
 * @default test
 */
export const __TEST_ROOT = path.join(__ROOT, 'test');

/**
 * 測試資料夾（唯讀）
 * 基於 {@link __TEST_ROOT}
 *
 * @default test/fixture
 */
export const __TEST_FIXTURES = path.join(__TEST_ROOT, 'fixture');

/**
 * 臨時檔案（可寫，永遠建立子資料夾）
 * 基於 {@link __TEST_ROOT}
 *
 * test/
 * ├── fixtures/              ← 測試資料夾（唯讀）
 * └── temp/                 ← 臨時檔案（可寫，永遠建立子資料夾）
 *     ├── fake-lib/
 *     └── temp-pkg/
 *
 * @default test/temp
 */
export const __TEST_TEMP = path.join(__TEST_ROOT, 'temp');


export const __PROJECT_ROOT = path.join(__ROOT, '..');

export const __PROJECT_STORAGE = path.join(__PROJECT_ROOT, 'storage');
