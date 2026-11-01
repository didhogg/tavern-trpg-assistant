"""取 Foundry dnd5e 系统本体的开源数据（SRD 5.1／5.2 内容，物品、职业特性等），转成 JSON 放到 reference/foundry-dnd5e-open/（不入库，和 5etools 副本同样处理）。

  python3 -I tools/data/fetch/foundry_dnd5e_open.py            # 已有副本就直接转换；没有就按固定提交克隆
来源：https://github.com/foundryvtt/dnd5e （代码 MIT；数据条目的 system.source.license 为 CC-BY-4.0，署名见各包 credit）。
固定提交写在 COMMIT；换提交要同时更新 tools/data/config/foundryOpen.ts 里的同名常量。
"""
import glob, json, os, subprocess, sys
import yaml

COMMIT = '0a247dd7d88d4646930ac140d73363282d25b24e'
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = os.path.join(ROOT, 'reference', 'foundry-dnd5e-open')
REPO = os.path.join(OUT, 'repo')
PACKS = {'items': 'items', 'classfeatures': 'classfeatures'}  # 只取 2014 规则的两个包；2024 的包不用（规则可能不同）

def ensure_repo():
    if os.path.isdir(os.path.join(REPO, 'packs', '_source')):
        return
    os.makedirs(OUT, exist_ok=True)
    subprocess.run(['git', 'clone', '--filter=blob:none', '--sparse', 'https://github.com/foundryvtt/dnd5e.git', REPO], check=True)
    subprocess.run(['git', '-C', REPO, 'sparse-checkout', 'set', 'packs/_source'], check=True)
    subprocess.run(['git', '-C', REPO, 'checkout', COMMIT], check=True)

def main():
    ensure_repo()
    head = subprocess.run(['git', '-C', REPO, 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
    if head != COMMIT:
        print(f'警告：副本提交 {head} 不是固定提交 {COMMIT}', file=sys.stderr)
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
        json.dump({'commit': COMMIT, 'license': 'CC-BY-4.0（数据）／MIT（代码）', 'entries': rows}, open(os.path.join(OUT, pack + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, sort_keys=True)
        print(pack, len(rows))

main()
