# AGENTS.md

## 測試

- 測試一律使用 `package.json` → `scripts` 內設計的指令執行：
  - 全量：`node --run test`（或 `node --run test:node`）
  - 特定測試檔：`node --run test:node:target -- <測試檔路徑>`（可多檔；與全量同路徑，照樣先執行 typecheck）
- **不區分**「有更新快照」與「沒有更新快照」的指令；不得自行替換旗標或另造指令變體（例如直接呼叫 `tsx --test` 並增減 `--test-update-snapshots`）。
- 快照隨設計指令更新屬預期行為。若顧慮某案例的行為會隨快照更新而漂移，應在該測試案例內以 `expected` / `assert` 明確斷言意圖，而不是改用不同指令來避開快照變更。
