# TRPG 跑团助手

SillyTavern / TauriTavern 前端扩展（Vue 3 + TypeScript）：手动管理 TRPG 战役、快速掷骰与结算、把战役事实交给酒馆 AI。

## 每次开工
1. 读 `NEXT.md`，确认当前里程碑与当前任务。
2. 读 `docs/任务总纲.md` 中当前里程碑；按需读 `docs/基本蓝图.md`、`docs/开发规范.md` 相关章节、当前 Unit 的 `docs/units/*.md`。
3. 用三句话把目标、红线、验收写入 `NEXT.md` 的"当前任务"，再动手。

## 常驻规则
- **截图必须自己看**：执行 agent 能用 `read` 工具直接读图片（PNG/JPG/截图）。每批 UI 改动后、交付前、写视觉评审前，必须逐张看自己的截图；不能只看 DOM 尺寸、文字描述或让别人代替自己看。看不清就重截大图/局部图再读。
- 只做 `NEXT.md` 指定范围；范围外写入 `NEXT.md` 的“待议”。
- 没有定稿单元蓝图的 Unit 不开工。
- 状态只经 store；规则是纯函数；数据只在内容包；结构变更必带迁移。
- 不写空 catch；单文件 ≤400 行；控件按 `docs/开发规范.md` §5.3。
- 数据错了只改 `tools/data/overlay/*.json`，不写代码修正；测试不写死条目数量（`docs/开发规范.md` §12.5）。
- 完成须有证据（`docs/开发规范.md` §8）；真机验收只能由驾驶员给出。
- **只在两个文件夹里工作**：`tavern-trpg-assistant`（助手）与 `tavern-trpg-data`（数据），直接在 `main` 上做；不开任务分支、不开 `git worktree` 副本夹（`docs/handoff/` 里旧交接文本的 `git worktree add`、`ln -s reference` 步骤作废）。
- **一个任务一个本地提交**；做坏了用 `git revert` 回退（细则见 `docs/开发规范.md` §9）。
- **仓库里不放 `reference/`**：参考资料只在仓库外 `/Users/xxx/DND- reference（DO NO DELETE！）`，只读；任何脚本、任何命令都不得写入、移动或删除它。
- 收尾更新 `NEXT.md` 并本地提交；推送、打标签、发布、安装、删除用户数据须单独授权。
- 面向驾驶员的说明用中文大白话，先说结果再说依据。
