#!/bin/sh
# 在仓库根目录建立 reference/ 里的符号链接，指向外部的参考资料文件夹。
# 真数据放在仓库外（默认 /Users/xxx/DND- reference（DO NO DELETE！）），所以 git 无论怎么覆盖 reference/，丢的只有链接，不会丢数据。
# 用法：sh tools/setup-reference.sh [参考资料文件夹]
set -e
SRC="${1:-/Users/xxx/DND- reference（DO NO DELETE！）}"
cd "$(dirname "$0")/.."
[ -d "$SRC" ] || { echo "找不到参考资料文件夹：$SRC" >&2; exit 1; }
if [ -L reference ]; then rm reference; fi
mkdir -p reference
link() { [ -e "$SRC/$1" ] && ln -sfn "$SRC/$1" "reference/$2" && echo "已链接 $2" || echo "没找到 $1，跳过" >&2; }
link 5etools-cn-main "5etools-cn-main（数据库）"
link dnd-data-main "dnd-data-main（数据库）"
link dnd5e-6.1.x "dnd5e-6.1.x（开源VTT）"
link wiki-dnd-parser-master "wiki-dnd-parser-master（中英文对换）"
