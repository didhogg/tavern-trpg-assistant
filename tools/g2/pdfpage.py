"""T7 读原书 PDF（只用来核对，原书文字不得抄进仓库）。

  python3 -I tools/g2/pdfpage.py vgm --find "Cloud Giant"     列出命中的页（PDF 页序号，从 0 开始）
  python3 -I tools/g2/pdfpage.py mtf --page 240               打印该页文字
  python3 -I tools/g2/pdfpage.py mtf --page 240 --image       另存该页图片并打印路径（OCR 读不清时让人看原页）

VGM 有文字层（pypdf 直接读）；MTF 是纯扫描图：用 pypdf 抽出页面图片，再交给本机的 tesseract OCR。
OCR 有杂音（0↔O、6↔4、l↔1）：读数字一定要用算式自洽确认。结果缓存在 tools/data/out/pdf-cache/（不入库）。
"""
import json
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

import pypdf

BOOKS = {
    "vgm": "/Users/xxx/Downloads/龙与地下城官方资料/Volo's Guide to Monsters By Wizards of the Coast.pdf",
    "mtf": "/Users/xxx/Downloads/龙与地下城官方资料/D&D MORDENKAINEN'S TOME OF FOES.pdf",
}
CACHE = os.path.join(os.getcwd(), "tools", "data", "out", "pdf-cache")


def fail(msg):
    print(msg, file=sys.stderr)
    sys.exit(1)


def page_image(reader, book, i):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, f"{book}-{i}.png")
    if not os.path.exists(path):
        images = reader.pages[i].images
        if not images:
            fail(f"{book} 第 {i} 页没有图片可 OCR")
        images[0].image.save(path)
    return path


def page_text(reader, book, i):
    os.makedirs(CACHE, exist_ok=True)
    cached = os.path.join(CACHE, f"{book}-{i}.txt")
    if os.path.exists(cached):
        return open(cached, encoding="utf-8").read()
    text = reader.pages[i].extract_text() or ""
    if len(text.strip()) < 20:  # 没有文字层：OCR
        img = page_image(reader, book, i)
        out = os.path.join(CACHE, f"{book}-{i}")
        subprocess.run(["tesseract", img, out, "--psm", "1"], stderr=subprocess.DEVNULL, check=True)
        text = open(out + ".txt", encoding="utf-8").read()
    open(cached, "w", encoding="utf-8").write(text)
    return text


def main():
    args = sys.argv[1:]
    if not args or args[0] not in BOOKS:
        fail(__doc__)
    book = args[0]
    path = BOOKS[book]
    if not os.path.exists(path):
        fail(f"找不到原书文件：{path}（原书只在驾驶员本机；改 tools/g2/pdfpage.py 顶部的 BOOKS 路径）")
    reader = pypdf.PdfReader(path)
    n = len(reader.pages)
    if "--find" in args:
        pattern = re.compile(args[args.index("--find") + 1], re.I)
        with ThreadPoolExecutor(8) as ex:
            texts = list(ex.map(lambda i: page_text(reader, book, i), range(n)))
        hits = [i for i, t in enumerate(texts) if pattern.search(t)]
        print(f"{book} 共 {n} 页；命中 {len(hits)} 页：{hits[:60]}")
    elif "--page" in args:
        i = int(args[args.index("--page") + 1])
        if not 0 <= i < n:
            fail(f"页序号超出范围 0–{n - 1}")
        if "--image" in args:
            print(page_image(reader, book, i))
        else:
            print(page_text(reader, book, i))
    else:
        fail(__doc__)


main()
