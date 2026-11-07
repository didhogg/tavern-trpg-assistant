# D2-P3-2 b～e 段交接（给接手的 agent）

日期：2026-11-07。上一位 agent 完成 a 段（本地提交 `e08a97f`）后交接。
做什么、怎样算完成：见 `D2-P3-2_b-e_执行文档.md`。本文讲**现状、怎么跑、坑、红线**。

## 0. 开工前必读（按顺序，一个都不能跳）

1. 仓库根目录 `RULE LIST.md`（驾驶员规则，文件名有空格）
2. `AGENTS.md`（含“强制自检触发”）、`NEXT.md`、`docs/开发规范.md` §0
3. `docs/handoff/D2-P3_整体设计.md` §3（P3-2 规矩）
4. `docs/handoff/D2-P3-2_结算内核实现蓝图.md`（全文，226 行）
5. `docs/handoff/D2-P3-2_a_接手进度.md`（a 段结果与已知异常）
6. `docs/handoff/D2-P3-2_⓪探路报告.md`（Plutonium 怎么调、边界数从哪来）
7. `docs/handoff/D2-P3-2_b-e_执行文档.md`（本次要做的）
8. 报告前读 `SELF CHECK.md`

上下文被压缩或换会话后，**先重读以上文件再动手**（上一位 agent 因为没重读被驾驶员批评）。

## 1. 授权与范围

- 授权：P3-2 的 b→e，按执行文档连续做，每段一个本地提交；e 结束报告并停下。
- **不做**：P3-3（存档）、任何界面、推送 / 打标签 / 发布 / 安装 / 删除用户数据（都要另外授权）。
- 不开分支、不开 git worktree；只在 `main` 上本地提交。
- 不读各 `归档/` 与 `docs/probes/` 的旧报告，除非驾驶员点名。

## 2. 现在的结构（a 段交付）

```
 插件页面
   src/rules/kernel/host.ts  startKernel() / kernelHandlers()
     文件请求的回答：
       packs/<包>.json              → 插件自带 vendor/foundry/packs/（dnd5e 作者 YAML 原样转）
       modules/plutonium/data/<路径> → 先问【库】英文官方原件 data/<路径>（驾驶员定 A），没有再读插件自带
       modules/<模块>/…              → 插件自带 vendor/foundry/modules/（录到的原包文件）
       data/…                       → 【库】
     作者存储只放内存（结算不存东西）
        │ call('boot', 世界输入) / call(命令, …)
        ▼
 vendor/foundry/frame.html（隐藏小窗，一个战役一个）
   官方 foundry.mjs + dnd5e 6.1.0 + libWrapper + Plutonium 2.20.1 原样运行
   src/rules/kernel/frame/
     main.ts      启动（官方 Game.initialize，只省画布/键鼠/音视频/界面渲染）
     world.ts     组世界数据（服务器下发的形状）
     server.ts    本地回答 Socket.IO 请求；写入记成“变更计划”
     random.ts    确定随机源（编号稳定，掷骰不走它）
     commands.ts  结算命令：roll damage rest save skill attack levelUpSteps attribution unsupported convert
                  operate(points, fn) 统一包结果：五种状态 complete/pending/unsupported/missing/error
```

骰子：已掷点数按顺序喂进 `CONFIG.Dice.randomUniform`，不够就返回 `missing` + 还要掷的骰子。骰盘用作者骰子（`src/library/runtime/dice.ts`）。

**新命令放哪**：`commands.ts` 已 234 行，单文件上限 400 行。b～e 每段新开 `frame/commands-<段>.ts`（例如 `commands-items.ts`），在 `KERNEL_COMMANDS` 合并登记；复用 `operate`，不另起结果格式。官方页（`official.mjs`）注入的是同一份命令代码，新文件要一起打包进去（看 `official.mjs` 顶部 esbuild 入口）。

## 3. 怎么跑（cwd = 仓库根目录）

| 命令 | 做什么 | 约用时 |
|---|---|---|
| `node tests/e2e/kernel/candidate.mjs` | 352 对象 + 全部场景，插件小窗 vs 官方 | 每浏览器数分钟 |
| `node tests/e2e/kernel/convert.mjs` | Plutonium 全量转换 35,067 条对答案 | 约 4 分钟/浏览器 |
| `node tests/e2e/kernel/session.mjs` | 重放（300 场景两次全新启动）+ 战役隔离 | 数分钟 |
| `node tests/e2e/kernel/dice.mjs` | 骰子题组 | 数分钟 |
| `npm run check` | 类型 + lint + 单元测试（现 153 项） | 约 1 分钟 |
| `npm run build` | 更新 `dist/`（`dist/` 进仓库，提交前要跑） | 数秒 |

环境变量：
- `ENGINE=chrome|webkit`：只跑一个浏览器（日常调试用，段末两个都跑）。
- `KERNEL_FILES=plugin`（默认，插件真实接线）`|reference`（直接读参考原件，用来**录制**模块文件）。
- `LIMIT=n`：`session.mjs` 场景数。
- `KERNEL_FILE_LOG=1`：打印小窗要的每个文件——**查“它实际读什么”先用这个**。

结果文件在 `work/p3-2-a/`（忽略目录）：`candidate-*.json`、`convert-*.json`、`session-*.json`、`dice-*.json`。

重新生成 `vendor/foundry/`（只在 Plutonium 读到新的独有文件时需要，例如 d 段怪物导入）：
```sh
KERNEL_FILES=reference node tests/e2e/kernel/convert.mjs     # 录下读过的模块文件 → work/p3-2-a/module-files-*.json
KERNEL_FILES=reference node tests/e2e/kernel/candidate.mjs
node tools/vendor-kernel-data.mjs                             # 资料包 + 录到的文件 + dnd5e 许可原文
```
`tools/vendor-foundry-kernel.mjs`（从演示站重录官方原件）会重写 `manifest.json`，跑完必须再跑一次 `vendor-kernel-data.mjs`。一般不需要重录。

## 4. 坑（a 段踩过的）

1. **Plutonium 不读 `data/`**，读它原包里的 `modules/plutonium/data/`。现已统一改为先问【库】（插件 `host.ts`、官方页 `official.mjs` 同一规则）。新加数据读取时两边必须同规则，否则对答案无意义。
2. **Plutonium 的 Bundle.js 一个小窗只能执行一次**（再执行报 “Cannot redefine property: IS_VTT”）。要两种数据就开两个小窗。
3. **出错结果的 `error` 只放说明，堆栈放 `stack`**：堆栈含页面地址，两边不同，放进比对会出几百条假差异。新命令沿用 `operate`。
4. **随机编号**：官方迁移会随机生成 `_id`；两边都装 `random.ts` 的确定随机源才能逐项比。新命令不要绕开它。
5. **Plutonium 的 `module.api` 在 ready 之后异步就绪**；`boot` 已等它。
6. **小窗 0×0 的“窗口尺寸不足”报错**与 Plutonium 可缺后端的 404 已单列（`kernel-page.mjs` 的 `unexpectedErrors`）；其余报错一律算失败，不要往单列里随便加。
7. **演示站是 14.365**，dnd5e 要求 ≥14.367。只能对应到这个版本差的差异单列并报告。
8. **作者骰子读不了 dnd5e 专用写法**（如 `1d20min10`、`dis`），已单列；结算走 dnd5e 自己的骰子，不受影响。
9. **整套界面 e2e（`npm run e2e` / `tests/e2e/smoke.mjs`）会覆盖 `docs/reviews/M3-*.png` 截图**（驾驶员的验收截图）。b～e 不需要跑界面 e2e；万一要跑，先把这 8 张备份到临时目录，跑完放回。
10. 插件启动时就会开作者小窗（骰盘 `setOwner` → 读骰式），不是 bug。

## 5. 已单列的项（回归里允许出现，其余都算失败）

| 项 | 说明 |
|---|---|
| Entrap（AATM 怪物动作） | 官方页按批量顺序转换时超时/报错（Chrome、WebKit 都出现过），插件小窗正常转出。转换回归里固定差 1 条 |
| 骰子：Foundry 读不了（含 ×）、官方也算不完（含 PB 等占位词） | 不算差异 |
| 作者读不了的 dnd5e 专用写法 14 种、`min10` 读法不同 1 种 | 不算差异 |
| 没装【库】时作者导航读不到 `gendata-nav-adventure-book-index.json` | 界面 e2e 单列 |
| 无画布结算小窗：活动要摆放测量模板 | 官方在 0×0 无画布时只报模板摆放失败（Chrome `grid`、WebKit `canvas.scene.grid`）；使用/消耗/恢复结果仍照常返回，不算结算差异 |
| 活动需要配置窗/选择窗 | 界面空类按设计抛 `KERNEL_NEEDS_INPUT`，命令结果状态是 `pending`，不算失败 |

## 6. 工作区保护（提交时）

- **只 `git add` 本段文件**，绝不 `git add -A` / `git add .`。
- 下列是驾驶员的未提交文件，**不要提交、覆盖、清理**：`AGENTS.md`、`SELF CHECK.md`、`RULE LIST.md`、`docs/任务总纲.md`、`docs/handoff/D2-P2_B1_后端整体分块.md`、`docs/reviews/M3-*.png`、`tests/e2e/b0/`。
- 参考资料 `/Users/xxx/DND- reference（DO NO DELETE！）` **只读**，任何命令不得写入、移动、删除。
- 临时脚本放 `work/p3-2-a/tmp/`（忽略目录）。
- 提交信息末尾加 `Co-Authored-By` 行（按会话提示）。

## 7. 未完成 / 未验证（从 a 段带过来）

- 手机加载负担未测（`vendor/foundry/` 共 60MB，资料包 38MB）。
- 中英对照全量没做：中文条目直接转换会坏规则数据，中文战役必须喂英文对照条目；配对用 P3-1 的中英配对，留到 P3-3。
- Plutonium 原包标 UNLICENSED，随插件带属驾驶员授权承担的风险（蓝图 §8）。
- c 段未覆盖：12 个现成角色里没有兼职/术士契约，这两类法术位未用真实角色验证；带 duration 的回合到期没有单独的简单法术样本，已用“专注中断→效果删除”验证到期路径；结束战斗按官方确认弹窗返回 `pending`，自动测试没有强制确认。
- d 段方式：完整怪物导入走 Plutonium 公开 API `game.modules.get('plutonium').api.importer.creature.pImportEntry(entry, { isTemp: true })`；全量用临时 Actor 验证（不把 4,124 只都常驻世界），抽样 12 只真实放进世界跑攻击，3 只传奇、5 只施法。AC 只在真实 Actor 样本比对；临时 Actor 的装备未自动穿上，AC 不作为全量比对项。
- d 段新录的 Plutonium 自有文件（vendor/foundry/modules/plutonium/data/）：`bestiary/foundry-integration-token-subjects.json`、`ddb-importer/generic-monster-features.json`、`ddb-importer/named-monster-features.json`、`ddb-importer/items.json`、`dnd-star/items.json`。以后 Plutonium 再读新文件，按交接 §3 重录。

## 8. 进度表（每段结束更新这一节）

| 段 | 状态 | 提交 | 备注 |
|---|---|---|---|
| a | ✔ | `e08a97f` | 见 `D2-P3-2_a_接手进度.md` |
| b 物品装备 | ✔ 2026-11-07 | 本段提交 | 穿/脱、同调、使用次数、短休/长休/黎明恢复；Chrome/WebKit 各 3,083 场景 0 差异；session/dice/convert 回归 0 差异 |
| c 战斗 | ✔ 2026-11-07 | 本段提交 | 开战/先攻、回合/轮次、施法扣法术位、受伤专注检定、状态加/移除；Chrome/WebKit 各 3,095 场景 0 差异；session/dice/convert 回归 0（convert 仅 Entrap 单列） |
| d 怪物 NPC | ✔ 2026-11-07 | 本段提交 | Plutonium 公开导入器全量 4,124 只，两浏览器 0 错误/0 差异；12 攻击、3 传奇、5 施法样本 0 差异；5etools 写值与 dnd5e 算值差异只列出（save 50、hp 71、passive 25、skill 31、ac 2） |
| e 建卡升级 | 未开始 | | |

## 9. 上一位 agent 的教训（务必避免）

a 段返工四次：手写 Foundry 底座 → 删；手写字段题组 → 删；自写骰子 → 改用作者骰子；假设 Plutonium 读 `data/` 就跑全量 → 作废。共同根因：**没先看原件实际怎么做就写代码，把“测试变绿”当进度**。
所以：先读文档和作者清单 → 先用 `KERNEL_FILE_LOG` / 官方页看实际行为 → 先预览 → 再写；第一次失败先查方法；需要手写任何数据或名单，先停下按 `AGENTS.md` 自检并报告。
