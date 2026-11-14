---
name: 5etools-homebrew-author
description: 按作者（TheGiddyLimit / 5etools）的自制数据格式，生成并校验 5etools 自制 JSON 数据包：种族、背景、职业、子职、专长、可选特性、物品、法术、怪物等各类条目；并可借作者中文站大译名表（术语表）把英文自制包做成对应的中文版。用于“帮我做一个自制种族/专长/法术/怪物/子职…”“把这段文字做成 5etools 自制包”“生成能导入 TRPG 助手的自制数据”“把这份英文自制包译成中文版 / 查这个词的官方译名”。Generate and validate 5etools homebrew JSON (races, backgrounds, classes, subclasses, feats, optional features, items, spells, creatures…) using the author's schema and sample files; never invent a new format.
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
| 术语表（做中文版用） | `TAVERN_TERMS_FILE`，默认 `/Users/xxx/tavern-trpg-data-next/_upstream/cn/docs/terms-20261015-105551.json`（作者中文站大译名表，15 MB，不进仓库） |
| 作者的标签分类 / 结构比对脚本 | `BREW_RENDER_JS`（作者站 `js/render.js`）、`CHECK_STRUCTURE`（作者中文 fork 的 `compare_json_structure.py`）；默认路径见 `scripts/paths.mjs` |

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

## 做中文版（把一份英文自制包做成对应的中文版）

用于“把这份英文包译成中文版”。翻译本身由你（AI）做；工具只给术语依据和交付前的核对，**不替你翻、不替你选**。（下面命令里的 `scripts/` 指本 skill 目录；不在这个目录时写完整路径，例如 `node ~/.codex/skills/5etools-homebrew-author/scripts/brew-terms.mjs …`。）

```
英文包 ─① validate.mjs─▶ ② brew-terms.mjs ─▶ 术语单 ─▶ ③ 你翻译 ─▶ ④ check-translation.mjs ─▶ ⑤ validate.mjs(中文版) ─▶ 交付
 (先确认英文包本身合格)   抽词 + 查术语表      (en→候选)   选译名、记 reason   结构一致 / ENG_name / 译名      结构定义校验
```

1. `node scripts/validate.mjs <英文包.json>` 先确认英文包本身合格。
2. `node scripts/brew-terms.mjs <英文包.json> --out=<术语单.json>`：抽出条目名和 `{@spell …}` `{@item …}` 这类**引用标签**里的名字，逐个查作者中文站大译名表。每项分三种：**候选唯一** / **多个候选**（要按上下文选）/ **没查到**（多半是原创名，按作者习惯自己译，**不要说成查到过**）。单个词也能查：`node scripts/glossary.mjs "Fireball" "Fly" [--category=spell]`。
3. **翻译**，规则（出处：作者中文 fork `5etools-json-translate/references/localization-rules.md`、`homebrew-workflow.md`）：
   - 键名、ID、来源码、骰子、公式、URL、布尔 / 数字 / 数组对象结构**不翻不改**；`_copy` 里引用的现成条目保持原样。
   - `{@spell …}` 之类标签：标签类型、分隔符、竖线段数、来源码都不动，**只把名字（第一段）或显示文字换成中文**。真实中文自制里就是 `{@condition 倒地}` 这种写法。
   - **每个你译了 `name` 的对象都要带 `ENG_name`，值逐字等于英文包里的原 `name`**（含其中的标签，如 `Explosive Bolt {@recharge 5}`）。包括：顶层条目（**必须**，插件靠它认这是中文文件）、嵌套的特性 / 动作、`legendaryGroup`、`token` 这类引用对象。依据：作者中文 fork 的本地化规则（译了对象的 `name` 就把英文原名留在 `ENG_name`）；作者自己的中文样例里 12 个带 `name` 的对象 12 个都有；上一次试跑漏了嵌套的就被 `check-translation.mjs` 抓到。英文原名在英文包里是现成的，**不是编的**。
   - 引用对象（`legendaryGroup`、`token` 等）的 `name` 译不译：看作者中文数据在这个位置译没译（作者规则：只在中文数据于该位置用了译名时才译引用的名字）。作者那份怪物样例的中文版里，`legendaryGroup` 引用和 `token` 引用的 `name` 都译了并带 `ENG_name`；`source` 等来源码不动。
   - 中文自然语句用中文双引号“……”，嵌套用‘……’；标签、公式里的字符不动。
   - **整句查，不要拆词**（作者规则 *Query full phrases*）。术语表候选是**证据不是答案**：多个候选时看条目类别、标签类型、来源和上下文再选；分类为空的那批（约 3/4）质量没评估过，更要看上下文。例：`Fly` 在法术里是「飞行术」，别处是「飞行」；`grappled` 有「擒抱」「受擒」两个候选，本机中文自制（spell、creature 目录）里 `{@condition 受擒}` 出现了 744 次，这类“已有中文数据的习惯用法”是比术语表更强的旁证，可以用 `grep -rhoE "\{@condition [^}]*\}"` 数一数（macOS 的 grep 是 ugrep，正则写复杂了会报 `exceeds complexity limits`，写简单点）。
   - **术语表里的“分类”是作者术语表自己的 `category` 字段**，不是我们加的：`bestiary` 是怪物页的数据栏标题类用词（如生命值、巢穴动作），`variantrule` 是规则术语，`spell` / `creature` / `item` / `deity` 等是专名，无分类的是作者的 words 数据库同步来的、没标分类（出处：`docs/handoff/P5.5_第5步_字段翻译交接.md` §4.2）。同一个中文被几个分类同时给出，说明这个说法在术语表里被多处采用，但仍要看上下文，不是保证。
   - **哪些字段要翻**：作者的翻译分析程序本机没有，拿不准时按作者规则——键名、标识符、来源码、骰子、公式、数字不翻，除非作者现有的中文版证明这个字段被本地化了。办法：找一份作者的中文数据，看同一个键在里面是不是中文。作者那份怪物样例的中文版里：`senses`、`languages`、`immune` 里的 `note` 文字译了；`immune` / `conditionImmune` 里的枚举值（`poison`、`bludgeoning` 等）不译；`_meta.sources[].abbreviation` 保持原样；`{@hit +6}` 这类机械参数连加号原样保留。这只是这一份样例里看到的，别的类别要自己去对照。
   - **怪物的固定句式和单位**（“尺”“豁免检定”“先攻”“借机攻击”等，术语表覆盖不到）：作者给怪物翻译专门写了一份规范，`<作者中文 fork>/codex-skills/5etools-json-translate/references/bestiary-xmm-style.md`（本机在 `/Users/xxx/tavern-trpg-data-next/_upstream/cn/codex-skills/5etools-json-translate/references/`）。它从 XMM（5etools 里新版怪物图鉴的来源码）的英中对照归纳，作者自己写明“不是可无条件复制的真值”：数值、目标、距离、伤害类型、标签以当前英文为准，只借可靠措辞；近义表达（豁免 / 豁免检定、受擒 / 擒抱）在同一份文件里别随意切换。本项目走 2014 规则，措辞只借通用的部分。
   - **自译清单**：术语表没有、你自己译的词（原创名，以及你靠旁证或自己定的词和句式），都要进术语单：在 `entries` 里补一项 `{ "en": 英文, "chosen": 中文, "reason": "自译" 或旁证来源, "status": "补充" }`，交付时把这些列给用户核对。`check-translation.mjs` 的 ③ 会一并检查。
   - 每个**多个候选**的词，在术语单里填 `chosen`（中文）和 `reason`；**没查到的原创名**也填 `chosen`，`reason` 写“自译”。
   - **_meta 里的数字（`dateAdded`、`dateLastModified` 等）和英文版保持一致**（作者的比对脚本把它们当非文字标量，改了就算结构不一致）。英文包里已有的 `_dateLastModifiedHash`（作者构建流程自己写、“不要手动创建或编辑”）也原样保留，不要自己造。条目数量、顺序、数组长度都不许变：插件按“文件—数组—下标”把中英包逐条配对。
   - 文件名 `<作者>; <中文资源名>.json`。作者的规则是在英文文件名的**第一个 `; `** 处切开，前面整段（例 `Sample - Giddy`）逐字节保留，后面是资源名，译成中文：先查术语表对这个资源名有没有精确译法；没有，再看 `_meta.sources[].full`——**只有它表示的正是同一个资源标题时**才用它的译名（作者提醒：不要假设 `full` 是标题，它可能是作者或出版方名）；仍不确定就问用户。
   - `_meta.sources[].full` 自己译不译，按它实际表示的内容定（作者那份样例的中文版里它被改成了另一个名字，没有统一规律，拿不准问用户并记进自译清单）；`abbreviation` 保持原样。
4. `node scripts/check-translation.mjs <英文包.json> <中文版.json> --sheet=<术语单.json>`：① 结构一致（直接调作者的 `compare_json_structure.py`，需要 python3）；② `ENG_name`：顶层条目都要有，译了 `name` 的嵌套对象也要有，值等于英文原名；③ 术语单里选定的译名有没有出现在译文里、有没有没选定的、多候选有没有写理由。**有 ✗ 就改，不要绕过**。
5. `node scripts/validate.mjs <中文版.json> --zh-of=<英文包.json>`：中文版同样要过作者结构校验。中文版**必须和英文版共用来源名**（`_meta.sources[].json`，插件靠它配对），所以要带 `--zh-of`，否则会被当成“来源名重名”。
6. 交付：中文版文件 + 术语单（含 `chosen` / `reason`）+ 两个检查的输出原样 + “自译清单”（术语表没有、你自己译的词）。

**没做 / 限制（照实说，不要假装有）**：
- 作者判断“哪些值要翻”用的是翻译器分析程序（`/data/5e-translator`），**本机没有**，所以本 skill 只抽“条目名 + 引用标签”，**不是翻译范围清单**；正文、动作描述等要翻的文字靠你按作者规则自己判断。
- 术语表是作者中文站导出的一份文件（48,032 条），不是作者翻译时用的完整数据库。路径用环境变量 `TAVERN_TERMS_FILE`（15 MB，不进仓库）。
- 作者要求：涉及**非 D&D 的第三方作品**（例如《怪物猎人》）时，要先上网查该作品的官方中文名再翻。本 skill 不含这一步；遇到时告诉用户，不要凭印象译。

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
- 中文自制：中文仓库在带 `name` 的对象上加了 `ENG_name`（英文名），本项目校验器已允许；其余仍照作者结构。**TRPG 助手认一个自制文件是中文，看的是顶层条目有没有字符串 `ENG_name`**，并用它做显示、配对、英文名搜索，所以中文自制的**每个顶层条目**都要有 `ENG_name`（用户给的英文名）。从零做的中文自制（没有英文版）里，嵌套对象（特性、动作）没有现成的英文原名，用户没给就**不要编**；而**翻译一份现成的英文包时相反**，英文原名现成，译了 `name` 就要留 `ENG_name`（见上面“做中文版”）。项目里谁读嵌套对象上的 `ENG_name`，没查过。做中文条目前先读 `references/易错点.md` 的“和 TRPG 助手对接”一节。

## 红线

1. 不造新格式、不改作者结构定义、不另写校验逻辑；校验只用 `validate.mjs`（它用的就是插件导入时用的同一个校验器）。
2. 不把没过校验的文件当成果交付；不往作者自制仓库（`BREW_POOL`）里写任何东西；不往 5etools 站点的 `homebrew/index.json` 发布（那是另一件事）。
3. 不编元数据（来源名重名风险、时间戳、版本、作者）；不编规则数值；**不凭对 D&D 的印象补规则文字、英文名、筛选标签**（`miscTags`、`traitTags`、`senseTags`、`wondrous` 等可选项；官方通用特性的说明文字也不手写）。结构化字段已经表达了的内容（例如种族的 `darkvision`）不要再另写一条文字特性重复它。用户没给的，要么不写，要么按“建议值”标出来。
4. 不逐条手改上游官方数据；本 skill 只生成**新的自制**条目。
5. 导入由 TRPG 助手完成（用户在插件里导入），本 skill 只负责产出文件和校验。

## 重新生成索引

结构定义换版本（`tools/vendor-brew-schema.mjs`）或本机作者副本更新后：`node scripts/build-index.mjs`。
