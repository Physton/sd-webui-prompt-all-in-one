# 中文翻译词库 danbooru.zh_ALL.csv

一份面向 Danbooru tag 的高覆盖中文翻译词表（两列 CSV：`tag,中文`），约 **43.8 万条**，
可直接用于 sd-webui-prompt-all-in-one 的「本地 CSV 翻译」以及
a1111-sd-webui-tagcomplete 的 Translation filename 设置。

## 基本信息

| 项目 | 值 |
|---|---|
| 文件 | `danbooru.zh_ALL.csv`（UTF-8，约 17 MB） |
| 词条数 | 437,789 |
| 格式 | 两列：`tag,中文`（与 tagcomplete 新版翻译格式一致） |
| 键规范 | 全小写、空格→下划线，与 danbooru tag 一致 |

## 翻译来源（按优先级分层覆盖，高层覆盖低层）

| 优先级 | 来源 | 特点 |
|---|---|---|
| 1 | [EhTagTranslation](https://github.com/EhTagTranslation/Database) | 人工翻译，画师/角色/作品条目最准 |
| 2 | [byzod/a1111-sd-webui-tagcomplete-CN](https://github.com/byzod/a1111-sd-webui-tagcomplete-CN)（Tags-zh-full-pack.csv） | 人工精校通用词条 |
| 3 | [ffdkj 翻译表](https://github.com/ffdkj/ffdkj-Danbooru_Tag-Chinese-English-Translation-Table) | Gemini 翻译+人工校对，约 31 万条，广覆盖兜底 |
| 4 | [wfjsw/danbooru-diffusion-prompt-builder](https://github.com/wfjsw/danbooru-diffusion-prompt-builder)（魔咒百科） | 中文社区分类词表 |
| 5 | tagcomplete 生态的 danbooru.zh_CN_SFW.csv 汉化 | 机翻兜底 |

## 合并时的关键处理

- **键规范化**：所有来源统一小写、空格→下划线，保证同一 tag 在不同来源间能对上
- **EhTag ↔ danbooru 角色名对齐**：EhTag 用「名 姓」且不带作品名（如
  `sumika fujimiya`），danbooru 是「姓_名_(作品)」（`fujimiya_sumika_(isekai_ojisan)`）。
  匹配时同时尝试词序反转和去 `_(作品名)` 后缀的基名索引，一条 EhTag 译文可同时
  挂到多个带不同作品后缀的变体上
- **作品名后缀合成**：对带 `_(作品)` 后缀的 tag，名字部分取优先级栈最优译
  （EhTag 压顶），后缀里每个 `_(...)` 用 ffdkj 的作品名词典单独翻译再拼回去，
  兼顾角色名准确度与作品名不丢失（解决重名角色问题）
- **括号转义变体**：含括号的 tag 额外输出一行 `\(` `\)` 转义版本（共 10.4 万行）。
  sd-webui-prompt-all-in-one 面板查翻译时不剥转义符，没有这一行，提示词里插入的
  转义形式 tag 在标签条下方显示不出中文

## 效果示例

| 输入 tag | 中文显示 |
|---|---|
| `1girl` | 1个女孩 |
| `hatsune_miku` | 初音未来 |
| `fujimiya_sumika_(isekai_ojisan)` | 藤宫澄夏 (异世界舅舅) |
| `amiya_(act_ii)_(arknights)` | 阿米娅 (升变阶段) (明日方舟) |
| `amiya_\(act_ii\)_\(arknights\)` | 阿米娅 (升变阶段) (明日方舟) ← 转义变体行 |

## 在 sd-webui-prompt-all-in-one 中使用

**从本分支安装插件则无需任何配置**：词表已内置在 `tags/danbooru.zh_ALL.csv`，
并通过 `storage/tagCompleteFile.json` 默认指向它，安装重启后中文翻译直接生效。

单独使用时：把词表放入插件 `tags/` 目录，然后在 设置 → 翻译设置 → 本地CSV
中选中它；或直接在 `storage/tagCompleteFile.json` 中写入：

```json
"\\extensions\\sd-webui-prompt-all-in-one\\tags\\danbooru.zh_ALL.csv"
```

注意：`tags/` 目录在仓库中被 `.gitignore` 整体排除（属运行时数据），
本分支通过 `tags/.gitignore` 中的 `!danbooru.zh_ALL.csv` 例外规则将其纳入版本管理；
`storage/tagCompleteFile.json` 同理。若更新插件时 git 提示这两个文件与本地已有
文件冲突，保留你本地已有的版本即可（说明你此前已自行配置过）。

## 许可证说明

本词表是上述多个第三方数据源的聚合产物，各来源适用其各自的许可证
（如 EhTagTranslation 数据库为 CC BY-NC-SA 4.0，含非商用条款）。
使用/分发本词表请一并遵守各来源的许可条款。
