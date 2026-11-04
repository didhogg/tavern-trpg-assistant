"""取 Foundry dnd5e 系统本体的开源数据（SRD 5.1／5.2 内容，物品、职业特性等），转成 JSON 放到缓存目录 ~/.cache/tavern-trpg/foundry-dnd5e-open/（仓库外；也不写进参考资料文件夹）。

  python3 -I tools/data/fetch/foundry_dnd5e_open.py   # 默认读参考资料里的 dnd5e-6.1.x（只读、不联网）；找不到才需 --allow-network 按固定提交克隆
来源：https://github.com/foundryvtt/dnd5e （代码 MIT；数据条目的 system.source.license 为 CC-BY-4.0，署名见各包 credit）。
固定提交写在 COMMIT；换提交要同时更新 tools/data/config/foundryOpen.ts 里的同名常量。
"""
import glob, json, os, subprocess, sys
import yaml

COMMIT = '0a247dd7d88d4646930ac140d73363282d25b24e'
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
REFERENCE = os.environ.get('TRPG_REFERENCE') or '/Users/xxx/DND- reference（DO NO DELETE！）'
CACHE = os.environ.get('TRPG_CACHE') or os.path.join(os.path.expanduser('~'), '.cache', 'tavern-trpg')
OUT = os.path.join(CACHE, 'foundry-dnd5e-open')  # 缓存在仓库外，也不写进参考资料文件夹
# 默认直接读参考资料里的 Foundry 系统源文件（只读、不联网）；换位置用 TRPG_FOUNDRY_SRC。
LOCAL = os.environ.get('TRPG_FOUNDRY_SRC') or os.path.join(REFERENCE, 'dnd5e-6.1.x')
CLONE = os.path.join(OUT, 'repo')
LOCAL_OK = os.path.isdir(os.path.join(LOCAL, 'packs', '_source'))
REPO = LOCAL if LOCAL_OK else CLONE
PACKS = {'items': 'items', 'classfeatures': 'classfeatures'}  # 只取 2014 规则的两个包；2024 的包不用（规则可能不同）

def ensure_repo():
    if os.path.isdir(os.path.join(REPO, 'packs', '_source')):
        return
    # 本地没有源文件时才需要联网：必须显式加 --allow-network（联网下载要驾驶员授权）。
    if '--allow-network' not in sys.argv:
        sys.exit(f'找不到 Foundry 系统源文件：{LOCAL}\n（联网按固定提交下载需要驾驶员授权，并加参数 --allow-network）')
    os.makedirs(OUT, exist_ok=True)
    subprocess.run(['git', 'clone', '--filter=blob:none', '--sparse', 'https://github.com/foundryvtt/dnd5e.git', CLONE], check=True)
    subprocess.run(['git', '-C', CLONE, 'sparse-checkout', 'set', 'packs/_source'], check=True)
    subprocess.run(['git', '-C', CLONE, 'checkout', COMMIT], check=True)

def source_label():
    if REPO == LOCAL:
        try:
            version = json.load(open(os.path.join(LOCAL, 'system.json'), encoding='utf-8')).get('version', '?')
        except OSError:
            version = '?'
        return f'local:dnd5e-{version}'
    head = subprocess.run(['git', '-C', REPO, 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
    if head != COMMIT:
        print(f'警告：副本提交 {head} 不是固定提交 {COMMIT}', file=sys.stderr)
    return COMMIT

def main():
    ensure_repo()
    os.makedirs(OUT, exist_ok=True)
    label = source_label()
    for pack, folder in PACKS.items():
        rows = []
        for f in sorted(glob.glob(os.path.join(REPO, 'packs', '_source', folder, '**', '*.yml'), recursive=True)):
            if os.path.basename(f).startswith('_'):
                continue
            d = yaml.safe_load(open(f, encoding='utf-8'))
            if not isinstance(d, dict) or not d.get('name'):
                continue
            if str((d.get('system') or {}).get('source', {}).get('rules', '2014')) != '2014':
                continue
            d['_path'] = os.path.relpath(f, os.path.join(REPO, 'packs', '_source'))
            rows.append(d)
        json.dump({'commit': label, 'license': 'CC-BY-4.0（数据）／MIT（代码）', 'entries': rows}, open(os.path.join(OUT, pack + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
        print(pack, len(rows))

main()
