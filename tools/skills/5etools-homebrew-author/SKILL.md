---
name: 5etools-homebrew-author
description: 按作者（TheGiddyLimit / 5etools）的自制数据格式，生成并校验 5etools 自制 JSON 数据包：种族、背景、职业、子职、专长、可选特性、物品、法术、怪物等各类条目。用于“帮我做一个自制种族/专长/法术/怪物/子职…”“把这段文字做成 5etools 自制包”“生成能导入 TRPG 助手的自制数据”。Generate and validate 5etools homebrew JSON (races, backgrounds, classes, subclasses, feats, optional features, items, spells, creatures…) using the author's schema and sample files; never invent a new format.
---

# 5etools 自制数据生成

目标：让 AI 写出的自制 JSON 是**作者格式**、**过作者的结构校验**、**能被 TRPG 助手导入**。
根本原则（来自项目 `AGENTS.md` / `SELF CHECK.md`）：**格式归作者定，不自己造字段、不自己造 schema、不凭 D&D 印象猜字段。** 作者的结构定义是权威（作者 wiki *Homebrew/FromZeroToHero*：“the authoritative specification for what JSON 5eTools understands and accepts”）。

## 先弄清路径（本 skill 在 TRPG 助手仓库里：`tools/skills/5etools-homebrew-author/`）

| 要用的东西 | 在哪 |
|---|---|
| 校验脚本 | `scripts/validate.mjs`（本 skill 自带；用仓库里的作者结构校验器，不联网） |
| 类别索引（类别 → 结构定义 / 必填字段 / wiki 页 / 作者样例） | `references/类别索引.md`（机器版 `.json`） |
| 作者结构定义（权威） | 仓库 `vendor/brew-schema/schema/`（作者 5etools-utils 的 schema/brew，原样） |
| 作者 wiki 文本（各类别写法） | `BREW_WIKI`，默认 `/Users/xxx/tavern-trpg-data-next/_upstream/author-docs/wiki.tercept.net/`，文件 `Homebrew__TableOfReference__<类别>.txt`、`Homebrew__FromZeroToHero.txt`、`Homebrew__Lexicon.txt`；**文件头 `_meta` 各字段的含义**在 `Homebrew__TableOfReference___meta.txt`（三个下划线） |
| 作者 README 与 `_copy` 规格 | `BREW_POOL`，默认 `/Users/xxx/DND- reference（DO NO DELETE！）/homebrew-master/` 的 `README.md`、`_doc/Spec_Copy.md` |
| 作者样例文件 | 同上目录里，路径见类别索引；**参考库只读，不许往里写** |

命令里的 `tools/skills/…` 是相对仓库根的：**先 `cd` 到 TRPG 助手仓库根再运行**（或写绝对路径）。
装到别处（如 `~/.codex/skills`、`~/.claude/skills`）请用**软链接**指回仓库里这个目录，不要复制：脚本靠相对位置找仓库里的校验器，复制后会找不到（或设环境变量 `TRPG_REPO` / `BREW_VALIDATOR`）。作者 wiki / 自制仓库副本是本机路径，换机器要设 `BREW_WIKI` / `BREW_POOL`；找不到时校验脚本会明说“没查重名”，但写法就只能靠结构定义和校验器了。

## 工作流程（一步一步，不跳）

1. **问清要做什么**。缺什么问什么，见下面「必须问用户、不许编的信息」。不能提问的场合（自动化跑、用户不在）：先给建议值，并在交付清单里逐条标“建议值，待确认”，**不要悄悄当成用户给的**。
2. **查类别索引**：这个条目是哪个顶层类别（`race`、`feat`、`spell`、`monster`…），看它的必填字段和作者样例。条目类型对不上时（例如用户说“职业专长”）先读 wiki 对应页，不猜。
3. **读该类别的 wiki 页和作者样例文件**，**复制样例当模板**（作者 README：“The easiest way to make your own is to copy one of the existing 'brews as a template”），把值换成用户要的。**样例里的字段不用全照抄**：作者样例常带抗性、免疫之类的复杂写法，删到只剩用户给了的信息。需要字段全貌时读 `vendor/brew-schema/schema/` 里索引指出的结构定义文件，不要凭记忆补字段。值域（枚举）去结构定义里找，例：法术学派是单字母编码（`V` = 塑能，见 `util.json` 的 `spellSchool`），施法时间 / 持续时间的写法见 `util-time.json`（持续 1 分钟且专注 = `{"type":"timed","duration":{"type":"minute","amount":1,"upTo":true},"concentration":true}`）；拿不准就写上去跑校验，报错里有允许的值。
4. **写文件**，约定（作者 README *Conventions to Follow*）：
   - 文件名 `作者名; 自制名.json`；缩进用 **tab**，换行 **LF**，**UTF-8 无 BOM**；
   - `_meta.sources[].json` 是来源名，要**全库唯一**（例 `ANOtherHistoryOfDragons`，不显示，长丑都行）；没有网址时 `url` 填 `https://github.com/TheGiddyLimit/homebrew`；
   - `authors` 只写内容作者，转换者（你/用户）写在 `convertedBy`；
   - `_meta` 里 `sources`、`dateAdded`、`dateLastModified`、`edition` 都是结构定义要求的必填项（时间戳是 Unix **秒**的整数，用 `date +%s` 取当前值，不要编）；
   - 条目的 `source`（多数类别必填，看类别索引的“必填字段”列）填 `_meta.sources[].json` 里自己的来源名。
5. **跑校验**：`node tools/skills/5etools-homebrew-author/scripts/validate.mjs <你的文件.json>`。它先过作者结构校验，再查上面的写法约定和来源名重名。
   - 不过就**按报错改内容**，再重跑；报错的位置带行列。不许改结构定义、不许删校验器、不许为了过校验删掉用户要的字段。
   - 一次改一类问题；改不出来时把报错原样给用户，不要换个写法碰运气。
6. **交付**：文件路径 + 校验输出原样 + 一张“哪些字段是我按用户描述填的 / 哪些是照样例默认写的 / 哪些我没把握”的清单。**没过校验就不说“完成”**。

## 必须问用户、不许编的信息

- 来源名（`json`）、缩写（`abbreviation`）、全名（`full`）、作者名（`authors`）、版本（`version`，结构定义要求必填）；用户不给时先建议值，**说明是建议值**，让用户确认。
- 规则版本 `_meta.edition`：只能是 `classic`（旧写法，含 2014）或 `one`（新版，2024 一类，作者说明：标 `one` 的条目显示前不会被按新规则改写）。TRPG 助手当前走 2014 规则，**默认 `classic`，但要告诉用户**。
- 数值、等级、费用、范围等**规则数据**：只写用户给出的；用户没给就问或标“待确认”，不凭印象补平衡数值。

## 特殊情况

- **基于现成条目改一点**（做变体）：用 `_copy` 机制，规则在 `_doc/Spec_Copy.md`；用了 `_copy` 要在 `_meta` 里声明 `dependencies` / `internalCopies`（同文件）。
- **一个文件放多个类别**可以：顶层是 `_meta` 加多个类别数组。最小骨架（必填项取自结构定义，`_meta` 全部含义见 wiki 的 `_meta` 页）：
  ```json
  {
  	"_meta": {
  		"sources": [{ "json": "来源名", "abbreviation": "缩写", "full": "全名", "version": "1.0.0", "authors": ["作者"] }],
  		"dateAdded": 0, "dateLastModified": 0, "edition": "classic"
  	},
  	"race": [ { "name": "…", "source": "来源名" } ]
  }
  ```
  （这只是结构骨架：上面这份实测能过校验，但别的类别条目的最小写法没逐个试过，以类别索引里的必填字段和校验器为准。`dateAdded` / `dateLastModified` 填 `date +%s` 的当前秒数。`_dateLastModifiedHash` 是作者构建流程自己写的，结构里不是必填，不要写。）类别索引里“配套的背景故事”（`xxxFluff`）是另放的一个数组。
- 要用作者没有的自定义枚举值（法术学派、可选特性类型、专长类别、超能力类型…）时，`_meta` 里有对应声明键（`spellSchools`、`optionalFeatureTypes`、`featCategories`、`psionicTypes`…），写法看结构定义里该键的说明。
- **法术、怪物没有 wiki 的 TableOfReference 页**：只能靠结构定义 + 作者样例 + 校验器；作者另有浏览器里的 Homebrew Builder 和 Text Converter（`5eTools__HelpPages__makebrew.txt` 说明 Builder 界面），本 skill 不集成它们。
- 中文自制：中文仓库在带 `name` 的对象上加了 `ENG_name`（英文名），本项目校验器已允许；其余仍照作者结构。**TRPG 助手认一个自制文件是中文，看的是顶层条目有没有字符串 `ENG_name`**，并用它做显示、配对、英文名搜索，所以中文自制的**每个顶层条目**都要有 `ENG_name`（用户给的英文名）。嵌套对象（特性、动作）上的 `ENG_name` 校验器允许，但项目里有没有人读它没查过：用户没给英文名就**不要编、不要加**。做中文条目前先读 `references/易错点.md` 的“和 TRPG 助手对接”一节。

## 红线

1. 不造新格式、不改作者结构定义、不另写校验逻辑；校验只用 `validate.mjs`（它用的就是插件导入时用的同一个校验器）。
2. 不把没过校验的文件当成果交付；不往作者自制仓库（`BREW_POOL`）里写任何东西；不往 5etools 站点的 `homebrew/index.json` 发布（那是另一件事）。
3. 不编元数据（来源名重名风险、时间戳、版本、作者）；不编规则数值；**不凭对 D&D 的印象补规则文字、英文名、筛选标签**（`miscTags`、`traitTags`、`senseTags`、`wondrous` 等可选项；官方通用特性的说明文字也不手写）。结构化字段已经表达了的内容（例如种族的 `darkvision`）不要再另写一条文字特性重复它。用户没给的，要么不写，要么按“建议值”标出来。
4. 不逐条手改上游官方数据；本 skill 只生成**新的自制**条目。
5. 导入由 TRPG 助手完成（用户在插件里导入），本 skill 只负责产出文件和校验。

## 重新生成索引

结构定义换版本（`tools/vendor-brew-schema.mjs`）或本机作者副本更新后：`node scripts/build-index.mjs`。
