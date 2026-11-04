"""比较两组已构建的包（目录里的 *.trpgpack），生成大白话差异清单（Markdown）。
用法：python3 -I tools/data/report/pack_diff.py <旧包目录> <新包目录> [输入文件差异清单.txt] > 报告.md
只读两个目录，不写任何文件（报告走标准输出）。"""
import glob, hashlib, json, os, sys, zipfile, collections

def load(path):
    z = zipfile.ZipFile(path); out = {}
    for n in z.namelist():
        if n.startswith('entries/') and n.endswith('.json'):
            j = json.loads(z.read(n)); items = j if isinstance(j, list) else j['entries']
            for e in items: out[e['id']] = e
    return out

def pack_files(d):
    out = {}
    for f in glob.glob(os.path.join(d, '*.trpgpack')):
        b = os.path.basename(f)[:-len('.trpgpack')]
        out[b.rsplit('-1.', 1)[0] if '-1.' in b else b] = f
    return out

def diff_paths(a, b, at=''):
    if json.dumps(a, sort_keys=True) == json.dumps(b, sort_keys=True): return []
    if isinstance(a, dict) and isinstance(b, dict):
        o = []
        for k in set(a) | set(b):
            if k not in a or k not in b: o.append((at + '/' + k, None))
            else: o += diff_paths(a[k], b[k], at + '/' + k)
        return o
    if isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b): return [(at, 'len')]
        o = []
        for x, y in zip(a, b): o += diff_paths(x, y, at + '/*')
        return o
    if isinstance(a, str) and isinstance(b, str): return [(at, 'text')]
    return [(at, 'value')]

def first_diff(a, b, at=''):
    """找到第一处文字差异的 (前, 后)。"""
    if isinstance(a, dict) and isinstance(b, dict):
        for k in a:
            if k in b:
                r = first_diff(a[k], b[k]);
                if r: return r
    elif isinstance(a, list) and isinstance(b, list) and len(a) == len(b):
        for x, y in zip(a, b):
            r = first_diff(x, y)
            if r: return r
    elif isinstance(a, str) and isinstance(b, str) and a != b:
        i = 0
        while i < min(len(a), len(b)) and a[i] == b[i]: i += 1
        return (a[max(0, i - 12):i + 28], b[max(0, i - 12):i + 28])
    return None

def main():
    A, B = sys.argv[1], sys.argv[2]
    inputs = [l.strip() for l in open(sys.argv[3], encoding='utf8')] if len(sys.argv) > 3 else []
    inputs = [l.replace('reference/5etools-cn-main（数据库）/data/', '').replace('reference/dnd-data-main（数据库）/data/', '[dnd-data] ') for l in inputs if l]
    pa, pb = pack_files(A), pack_files(B)
    added_packs = sorted(set(pb) - set(pa)); gone_packs = sorted(set(pa) - set(pb))
    same = 0; diffpacks = {}; kinds = collections.Counter(); bytype = collections.Counter(); bypack = collections.Counter()
    added = []; removed = []; nontext = []; changes = []
    for k in sorted(set(pa) & set(pb)):
        if hashlib.sha256(open(pa[k], 'rb').read()).digest() == hashlib.sha256(open(pb[k], 'rb').read()).digest(): same += 1; continue
        ea, eb = load(pa[k]), load(pb[k]); diffpacks[k] = 0
        added += [i for i in eb if i not in ea]; removed += [i for i in ea if i not in eb]
        for i in ea:
            if i not in eb: continue
            ps = diff_paths(ea[i], eb[i])
            if not ps: continue
            diffpacks[k] += 1; bypack[k] += 1; bytype[ea[i]['type']] += 1
            for p, kind in ps:
                kinds[kind or 'key'] += 1
                if kind != 'text': nontext.append((i, p, kind))
            changes.append((k, i, ea[i], eb[i], ps))
    print('# 新版 5etools 重新构建 ↔ 已发布包：差异清单\n')
    print(f'- 旧：`{A}`（{len(pa)} 个包）　新：`{B}`（{len(pb)} 个包）')
    print(f'- 哈希完全相同的包 **{same}** 个，有差异的包 **{len(diffpacks)}** 个；新增包 {len(added_packs)}、消失包 {len(gone_packs)}')
    print(f'- 条目：**新增 {len(added)}、删除 {len(removed)}、有改动 {len(changes)}**')
    print(f'- 改动性质：文字→文字 {kinds["text"]} 处；数组增减 {kinds["len"]} 处；键增删 {kinds["key"]} 处；数值/类型变化 {kinds["value"]} 处\n')
    print('## 输入文件（与上次构建快照哈希不同）\n')
    print(f'共 {len(inputs)} 个：' + '、'.join(inputs) + '\n' if inputs else '（未提供）\n')
    print('## 按条目类型\n'); print('| 类型 | 改动条数 |\n|---|---|')
    for t, c in bytype.most_common(): print(f'| {t} | {c} |')
    print('\n## 按包（前 12）\n'); print('| 包 | 改动条数 |\n|---|---|')
    for k, c in bypack.most_common(12): print(f'| {k} | {c} |')
    print('\n## 不是"文字→文字"的改动（逐条列出）\n')
    if not nontext: print('无。')
    for i, p, kind in nontext: print(f'- `{i}` `{p}`：{ {"len": "数组长度变化", "value": "数值/类型变化", None: "键增删"}.get(kind, kind) }')
    print('\n## 人物相关类型逐条（背景、特性、子职业、亚种、法术、物品、规则、神祇）\n')
    for k, i, a, b, ps in changes:
        if a['type'] in ('background', 'feature', 'subclass', 'subrace', 'spell', 'item', 'rule', 'deity', 'race', 'class', 'feat', 'condition'):
            fd = first_diff(a, b)
            print(f'- `{i}` {a.get("name","")}：{", ".join(sorted({p for p,_ in ps})[:3])}' + (f'\n  - 前：「{fd[0]}」\n  - 后：「{fd[1]}」' if fd else ''))
    print('\n## 抽样（怪物 / 随机表 / 书，每类 6 条）\n')
    shown = collections.Counter()
    for k, i, a, b, ps in changes:
        t = a['type']
        if t in ('monster', 'table', 'book', 'lore') and shown[t] < 6:
            shown[t] += 1; fd = first_diff(a, b)
            if fd: print(f'- {t} `{i}`：「{fd[0]}」→「{fd[1]}」')
main()
