# 第三方声明

本项目代码以 AGPL-3.0 发布。以下第三方组件按各自的许可使用：

| 组件 | 用途 | 许可 |
|---|---|---|
| tsx | 开发期直接运行 TypeScript 构建脚本（`tools/data/`） | MIT |
| Phosphor Icons（Regular） | 界面图标，以内联 SVG 路径写入 `src/ui/kit/icons.ts` | MIT |
| Foundry dnd5e 6.1.0 | 2014 SRD 结构化字段的交叉校验与部分 uses/effects/activities；只取不带 24 的目录 | 系统代码 MIT；SRD 5.1 内容 CC BY 4.0 |
| 5e-bits/5e-database | 2014 法术位/职业资源值的公开 API 对照，不导入 | MIT（底层 SRD OGL 1.0a） |
| Open5e | 公开 SRD 数据对照，不导入 | 修改版 MIT（SRD OGL 1.0a） |
| sharp | 开发期头像解码、缩放、灰度（`art:focus`） | Apache-2.0 |
| @techstark/opencv-js | 开发期 token 模板匹配（`art:focus`） | Apache-2.0 |
| smartcrop-sharp | 开发期头像画面重心裁切（`art:focus`） | MIT |
| game-icons.net | 生物类型图标（`src/ui/kit/creatureIcons.ts`） | CC BY 3.0；作者：Lorc（beast-eye、flat-paw-print、flat-star、gear-hammer、dragon-head、flame-tunnel、fairy、daemon-skull、monster-grasp、goo-skull、flamed-leaf、crowned-skull、uncertainty）、Delapouite（giant、person） |
| js-yaml | 开发期把 dnd5e 作者 YAML 资料包原样转 JSON（`tools/vendor-kernel-data.mjs`） | MIT |
| ajv 8.18.0 | 自制 JSON 结构校验：开发期把作者结构定义预编译成独立校验器（`tools/build-brew-validator.mjs`，P5 B-12），产物 `vendor/brew-schema/validator.js` 里带着它的两个运行时小函数 | MIT |
| esbuild 0.28.2 | 开发期把上面的校验器压缩打包成单个文件 | MIT |
| fast-uri 3.1.0 | 同上，开发期 ajv 解析结构文件之间的相对引用；固定在 3.1.0（3.1.9 起解析相对引用的结果变了，编译会失败） | BSD-3-Clause |
| json-source-map 0.6.1 | 同上，运行时给校验错误标出原文行列（作者的校验器用的也是它） | MIT |
| 5etools-utils 0.17.24 的 `schema/brew`（`vendor/brew-schema/schema/`，由 `tools/vendor-brew-schema.mjs` 原样取自 npm） | 作者的自制数据结构定义，校验自制 JSON 用 | MIT（包的 package.json 声明；包内无单独许可文件） |
| 5etools-cn `validate-homebrew-json-shim.mjs` 里的结构扩展（`tools/build-brew-validator.mjs` 的 `applyCnSchemaExtensions`，照抄其做法并注明出处） | 给作者自制结构定义补中文仓库自己加的 `ENG_name`（及 `_meta.translators`），避免中文自制被误判不合格 | MIT（5etools-cn 的 `package.json` 与 LICENSE 第 I 部分：源码为 MIT） |
| plutonium-scenes 的 `test/schema/shared.json`（`vendor/brew-schema/remote/`） | 上面结构定义里唯一的外部引用（作者测试器联网取，这里随插件带一份，约 7 KB） | 该仓库未声明许可（GitHub 查不到许可证）；随插件带属驾驶员判断承担的风险，与结构定义同属 5etools 生态 |

## 结算小窗随插件带的原件（`vendor/foundry/`，P3-2）

| 组件 | 用途 | 许可 |
|---|---|---|
| Foundry Virtual Tabletop 客户端（`scripts/foundry.mjs`、官方页面引用的脚本、模板、语言） | 结算小窗内无界面运行官方规则 | Foundry Gaming LLC 商业许可，非开源；随插件带原文属驾驶员判断承担的风险（蓝图决定 8） |
| Foundry 官方页面附带的第三方脚本（jQuery、PIXI、Socket.IO 等） | 同上，原样加载 | 各自开源许可（多为 MIT），以原件内声明为准 |
| dnd5e 系统 6.1.0（`systems/dnd5e/`、`packs/`） | 2014 规则实现与 SRD 资料包 | 代码 MIT（版权 Andrew Clayton，原文随附 `systems/dnd5e/LICENSE.txt`）；SRD 5.1 内容 CC BY 4.0 |
| libWrapper 1.13.5.1（`modules/lib-wrapper/`） | Plutonium 依赖 | LGPL-3.0；许可原文随附 `modules/lib-wrapper/LICENSE`，未修改 |
| Plutonium 2.20.1.v14（`modules/plutonium/`，仅录到的文件） | 把 5etools 条目转成 dnd5e 数据 | 原包 `module.json` 标为 UNLICENSED（未授予开源许可）；随插件带属驾驶员判断承担的风险 |

5etools 条目本身不随插件带：Plutonium 读 5etools 数据时由玩家安装的【库】回答。

数据内容的来源与许可见 `packs/DATA-NOTICE.md` 与各条目的 `credit`。
