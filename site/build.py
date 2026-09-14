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
    # data/senado_stf.json é levantamento editorial feito à mão: o que cada
    # candidatura ao Senado pelo DF já disse ou fez em público sobre impeachment
    # de ministros do STF, com citação literal e link. Nenhuma fonte automática
    # traz isso com o critério da aba, então não passa pelo refresh.py e só muda
    # quando alguém refaz a verificação. A checagem abaixo é a regra de ouro do
    # arquivo: posição que não seja "sem" precisa de registro datado e com link,
    # senão o build para e nada vai para o HTML.
    stf = os.path.join(RAIZ, "data", "senado_stf.json")
    if os.path.exists(stf):
        dados["senadoSTF"] = json.load(open(stf, encoding="utf-8"))
        for sq, c in dados["senadoSTF"]["candidatos"].items():
            nome = c.get("nome", sq)
            if c.get("posicao") not in ("promete", "assinou", "contra", "sem"):
                raise SystemExit("senado_stf.json: posição inválida para %s: %r" % (nome, c.get("posicao")))
            evs = c.get("evidencias") or []
            if c["posicao"] != "sem" and not evs:
                raise SystemExit("senado_stf.json: %s está como %r sem nenhum registro" % (nome, c["posicao"]))
            for e in evs:
                if not e.get("data") or not e.get("url"):
                    raise SystemExit("senado_stf.json: registro sem data ou sem link em %s" % nome)
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
