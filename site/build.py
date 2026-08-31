#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Monta site/espectro-2026.html a partir das partes.

    body.html + app.js            ->  tpl.html
    data/site.json + live.json    ->  injetado em tpl.html  ->  espectro-2026.html

app.js é a fonte de verdade do JavaScript: js.part e tpl.html são derivados e
podem ser regravados a qualquer momento.
"""
import json
import os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(RAIZ, "site")


def caminho(*p):
    return os.path.join(SITE, *p)


def main():
    body = open(caminho("body.html"), encoding="utf-8").read()
    app = open(caminho("app.js"), encoding="utf-8").read()

    js = "<script>\n" + app + "</script>\n"
    tpl = body + js
    if "/*DATA*/" not in tpl:
        raise SystemExit("body.html perdeu o marcador /*DATA*/")

    dados = json.load(open(os.path.join(RAIZ, "data", "site.json"), encoding="utf-8"))
    # data/live.json traz o que o refresh.py rebaixa (odds, pesquisas, carimbo).
    # Fica separado para o commit diário ser pequeno; aqui os dois viram um só.
    vivo = os.path.join(RAIZ, "data", "live.json")
    if os.path.exists(vivo):
        dados.update(json.load(open(vivo, encoding="utf-8")))
    elif "odds" not in dados:
        raise SystemExit("falta data/live.json — rode antes: python3 site/refresh.py")
    # separators compacto: o arquivo já passa de 1 MB embutido no HTML.
    # "</" vira "<\/" para que nenhum valor consiga fechar a tag <script>.
    bruto = json.dumps(dados, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    html = tpl.replace("/*DATA*/", bruto)

    open(caminho("js.part"), "w", encoding="utf-8").write(js)
    open(caminho("tpl.html"), "w", encoding="utf-8").write(tpl)
    open(caminho("espectro-2026.html"), "w", encoding="utf-8").write(html)
    print("espectro-2026.html: %.1f MB" % (len(html.encode("utf-8")) / 1e6))


if __name__ == "__main__":
    main()
