# 日常改完代码只跑和改动相关的检查（约 20 秒）：相关单元测试 + 类型检查 + 改动文件的 lint。
# 全量回归和 e2e 不在这里，按需单独跑。比较某次提交的改动：make test-changed SINCE=HEAD~1
.PHONY: test-changed
test-changed:
	npm run test:fast$(if $(SINCE), -- --since $(SINCE),)
