"""中英并排对齐：原样调用 tjliqy/5e-translator 自己的 JsonAnalyser 与 align_manual_translations（参考库里的 5e-translator-main，只读使用）。
对每个 data-bak 英文文件，找到同路径的中文文件，让它的对齐器按键名、按数组下标并排对齐；
数组长度不一致、缺字段它会报错——这里原样记录这些错误，不猜、不补。
没有数据库也能跑：它自己会回退到内存词典。输出一个 JSON，给 TypeScript 构建读取。
用法：python align.py <工具目录> <5etools中文仓库根> <输出json>
"""
import json, os, re, sqlite3, sys

tool, repo, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
os.environ.update({"DB_HOST": "127.0.0.1", "DB_PORT": "1", "DB_USER": "x", "DB_PASSWORD": "x", "DB_DATABASE": "x", "DS_KEY": "x",
                   "5ETOOLS_EN_PATH": f"{repo}/data-bak", "OUTPUT_PATH": os.path.dirname(os.path.abspath(out_path)), "CHM_ROOT_DIR": "/nonexistent"})
sys.dont_write_bytecode = True
sys.modules["pysqlite3"] = sqlite3  # 工具里向量库模块要求的占位；对齐用不到
sys.path.insert(0, tool)
os.chdir(os.path.dirname(os.path.abspath(out_path)))  # 工具会在当前目录写 log/，让它写在输出目录，不写进参考库

from app.cli.sync_from_cn import align_manual_translations, _read_json, resolve_cn_path  # noqa: E402
from app.core.translator import JsonAnalyser  # noqa: E402

SEG = re.compile(r"^/([^/\[\]]+)\[(\d+)\]")
en_root = f"{repo}/data-bak"
files = sorted(os.path.relpath(os.path.join(d, f), en_root) for d, _, fs in os.walk(en_root) for f in fs if f.endswith(".json"))
analyser = JsonAnalyser(read_only=True, preserve_job_markers=True)
result = {"files": {}}
for rel in files:
    en_path = f"{en_root}/{rel}"
    rec = {}
    cn_path = str(resolve_cn_path(en_path, None, announce=False))
    rec["cnExists"] = os.path.exists(cn_path)
    info = next(analyser.invoke([en_path], config={"metadata": {"mode": "5et", "force_title": False}}), None)
    if info is None:
        rec["status"] = "工具未产出"  # 它自己的跳过规则（如 generated/ 查找表）或没有可翻译内容
    else:
        al = align_manual_translations(info.json_obj, _read_json(cn_path), info.job_list)
        ents = {}
        for leaf in al.leaves:
            m = SEG.match(leaf.path)
            if m:
                k = f"{m.group(1)}[{m.group(2)}]"
                ents[k] = ents.get(k, 0) + 1
        rec.update(status="ok", jobs=len(info.job_list), translated=len(al.translations), errors=al.errors, entityLeaves=ents)
    result["files"][rel] = rec
json.dump(result, open(out_path, "w"), ensure_ascii=False)
ok = [r for r in result["files"].values() if r["status"] == "ok"]
print(f"文件 {len(files)}；工具处理 {len(ok)}；工具未产出 {len(files) - len(ok)}；翻译单元 {sum(r['jobs'] for r in ok)}；对上 {sum(r['translated'] for r in ok)}；对齐错误 {sum(len(r['errors']) for r in ok)}")
