# G3 执行 agent 交接文本（显示整理）

> **驾驶员：把本文件整份原样粘贴给执行 agent。**
> 做法在 `docs/handoff/G3_显示整理_执行文档.md`（下称「执行文档」）。两者冲突以执行文档为准，并在报告里写明。

---

## 0. 你是谁、这次做什么

- **你是谁**：G3 的执行 agent。项目是 SillyTavern 扩展「TRPG 跑团助手」（Vue 3 + TypeScript），资料库已有 87 个 D&D 5e（2014）内容包，版本 1.5.0，扩展 0.3.0。
- **这次做什么**：资料库界面的显示整理，九块（执行文档 §2 范围总表 S、F、E、V、I、T、A、W、R）。数据**只改 `summary` 一个字段**，其余全是界面。
- **一次做完**：批 0 到批 6 按顺序做，**批与批之间不停、不等任何人**。每批结束本地提交一次，提交信息以「G3 批 N：」开头。
- **交回什么**：报告 `docs/probes/G3_报告.md`、`NEXT.md` 更新、两个仓库的 `g3` 分支（已推送）、最后一条回复（格式见第 6 节）。

## 1. 开工前（逐条做）

1. **只在干净副本里工作**，驾驶员主工作区一律不碰：

   ```bash
   cd /Users/xxx/tavern-trpg-assistant
   git fetch origin
   git worktree add ../tta-g3 origin/main
   ln -s "$PWD/reference" ../tta-g3/reference
   cd ../tta-g3 && git checkout -b g3
   git merge origin/claude/peaceful-volta-af2qp2    # 带上执行文档；有冲突就停
   npm ci
   ```

   数据仓库：`cd /Users/xxx/tavern-trpg-data && git fetch origin && git checkout -b g3 origin/main`。

2. **起点验证**：`npm run check`、`npm run test:data` 全绿；`TRPG_DATA_TAG=main npm run build:data` 跑两次，哈希相同且和数据仓库 `main`（`697c786`）一致（只有 `catalog.json` 时间戳变化就还原）。
3. **按顺序读完**：执行文档全文；`docs/handoff/D1.2_后续流程大纲.md` §G3；`docs/units/L1B_全库搜索与资料阅读.md` §3、§4；`docs/开发规范.md` §5.3–§5.5、§8；`src/ui/library/` 下 `EntryDetailPage.vue`、`facts.ts`、`joins.ts`、`PackDetailPage.vue`、`TextBlocks.vue`；`src/stores/toast.ts`、`src/stores/dice.ts`；`tools/data/summary/summary.ts`。
4. 在报告开头用三句话写目标、红线、验收，然后开始批 0。

## 2. 你可以改的文件

只有执行文档 §9 表里的那些。重点再说一遍：

- **数据**：只有 `tools/data/summary/summary.ts` 与 `PACK_VERSION`；包文件只由 `build:data` 生成。
- **schema 不碰**（`src/rules/dnd5e2014/data/**`），`src/core/**` 不碰。
- **已有测试的断言不改**；唯一例外是断言写死了本次要修的旧样子（如 `CR0.25`），改成新样子并在报告逐处列出。
- **不做**：推送 `main`、打标签、刷新 CDN、安装、删除用户数据、启动别的 agent。**允许**：结束时推送两个仓库的 `g3` 分支（驾驶员粘贴本文即授权这一次）。

## 3. 最容易出错的地方

1. **`facts.ts` 先纯搬家、后加功能**，两步分开提交；搬家前后同一批条目的事实输出必须逐字相同。
2. **摘要只在构建端改**，不要在界面上用正则把 `CR0.25` 换成 `1/4`。
3. **数据比对**：除了 `summary`，任何路径变了都是停整站，不许加放行规则绕过去。
4. **事实补齐按规则**（schema 有结构化字段就要有事实行），不是按 14 类清单补完就算；测试也按规则写，不钉死行数。
5. **可见文字不许有英文字段名、驼峰、`{{…}}`**；翻不准的标签先用直白中文，列进报告「待规划者定的标签」。
6. **掷表、复制格式、裁切都是纯函数**，放在执行文档指定的文件里，带单测；界面只调用。
7. **没有 `at` 的表**（背景的特点／理念／牵挂／缺陷就是）归「本条目的表」一组，不要因为没有 `at` 就不显示。
8. **头像**：token 不当头像；没立绘、加载失败、`$asset` 一律显示生物类型图标，**不显示名字首字**；列表行不放头像。
9. **图标许可**：game-icons.net 是 CC BY 3.0，每个图标的作者都要写进 `THIRD_PARTY_NOTICES.md`。
10. **store 只加可选字段**（提示条动作、掷骰记录的 `table`），旧数据照常读；报告写明为什么不需要迁移。
11. **单文件 ≤ 400 行**，快超了就拆；**不写空 catch**。
12. **向导长列表**：D1.2b 为了避开长列表让 library e2e 用「核心-only catalog」，这个保留；另加一个用完整 catalog 的 e2e 测折叠。
13. **构建副产物**（`docs/probes/D1.1_人物数据_报告.md`、`D1_抽检.md`、`D1_构建报告.md`、`D1.2a_R13_对照报告.md`、`D1.2a_R14_清洁报告.md`、`dist`、`docs/reviews`）只有日期变化就还原。

## 4. 停止条件

**停整站**（立即停手、写报告、回复驾驶员）只有四种：

1. 两次构建哈希不同；
2. 数据比对出 `summary` 以外的变化；
3. 要改 schema、字段形状或执行文档 §9 以外的文件才能继续；
4. `g2-oldext` 失败。

**其余只停当前一项**：写理由与证据，接着做下一项，不留「以后再做」。清单外的发现只记 `NEXT.md`「待议」。

## 5. 每批结束自查（逐条打勾写进报告）

- [ ] 只改了允许的文件（`git diff --stat` 贴进报告）
- [ ] 没改已有测试的断言（例外逐处列出）
- [ ] `npm run check` 通过
- [ ] 两次构建哈希相同（批 1 起）
- [ ] 本批数字与截图清单写进报告
- [ ] 本地提交，信息以「G3 批 N：」开头

## 6. 回复格式（全部做完，或停整站时）

```
【G3 完成 / 停在批 N】
一句话结果：…
提交：扩展仓库 g3 <哈希>；数据仓库 g3 <哈希>（已推 g3 分支，未推 main）
验证：check X/Y；test:data X/Y；build:data 两次哈希相同；e2e library X/0（Chrome、WebKit）、upgrade X/0；g2-oldext 通过
数字：摘要改动 N 条（CR 分数 …、双体型 …、阵营 …、多 AC …、物品普通 …、模板家族 …）；补事实的类型 …；物品种类未归组的键 …
请驾驶员看：生物类型图标总图 <路径>；截图目录 <路径>；报告 docs/probes/G3_报告.md
停了的项目：…（每项一句理由）
未做 / 未验证：真机未看；…
```
