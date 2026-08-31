#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Repuxa as fontes vivas da aba Chances e regrava data/site.json.

    python3 site/refresh.py            # baixa, grava site.json e reconstrói o HTML
    python3 site/refresh.py --dry-run  # só mostra o que mudaria

O que é estático (candidatos, propostas, setores) fica em data/site.json e
quase nunca muda. O que chega novo todo dia (odds, pesquisas) fica em
data/live.json — 138 KB em vez de 1,2 MB, para o histórico do git não inchar
com uma cópia inteira por rodada. O build.py junta os dois.

Fontes:
  · Plano Político — agregador de pesquisas (pesquisas nacionais)
  · Plano Político — modelo presidencial (probabilidade de vitória + série)
  · Plano Político — modelo de governadores (DF)
  · Polymarket     — preço dos contratos + série de preço

Cada bloco carrega o próprio `atualizado` (a data do dado na fonte) e o
`capturado` (o instante em que este script rodou). São coisas diferentes e a
página mostra as duas.
"""
import json
import os
import re
import sys
import time
import urllib.request
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fontes import SQ_DF, SQ_MERCADO, SQ_MODELO  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_JSON = os.path.join(RAIZ, "data", "site.json")
LIVE_JSON = os.path.join(RAIZ, "data", "live.json")

URL_AGG = "https://www.planopolitico.com.br/agregador/presidente/"
URL_PRES = "https://www.planopolitico.com.br/modelos-eleitorais/presidencial/"
URL_GOV = "https://www.planopolitico.com.br/modelos-eleitorais/governadores/"
URL_PM_EVENTO = "https://gamma-api.polymarket.com/events?slug=brazil-presidential-election"
URL_PM_SERIE = "https://clob.polymarket.com/prices-history?market={}&interval=max&fidelity=1440"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"

BRT = timezone(timedelta(hours=-3))


def log(*a):
    print(*a, file=sys.stderr, flush=True)


def baixa(url, tentativas=3):
    erro = None
    for i in range(tentativas):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=45) as r:
                return r.read().decode("utf-8", "replace")
        except Exception as e:  # rede instável: tenta de novo antes de desistir
            erro = e
            time.sleep(1.5 * (i + 1))
    raise RuntimeError("falhou baixar %s: %s" % (url, erro))


def blob(html, ident):
    """Extrai um <script type="application/json" id="..."> da página."""
    m = re.search(
        r'<script[^>]*id="%s"[^>]*type="application/json"[^>]*>(.*?)</script>' % re.escape(ident),
        html, re.S) or re.search(
        r'<script[^>]*type="application/json"[^>]*id="%s"[^>]*>(.*?)</script>' % re.escape(ident),
        html, re.S)
    if not m:
        raise RuntimeError("não achei o bloco JSON #%s" % ident)
    return json.loads(m.group(1))


# ---------------------------------------------------------------- utilidades

def d(s):
    return date.fromisoformat(s)


def deltas(serie, chaves):
    """Variação contra 1, 7 e 30 dias atrás, com a data de referência usada.

    `serie` é uma lista [(data, {chave: valor})] em ordem crescente. Quando a
    série não alcança a data de referência o delta vira None — melhor um "sem
    histórico" honesto do que uma variação contra o começo da série.
    """
    if not serie:
        return {}
    datas = [x[0] for x in serie]
    idx = {x[0]: x[1] for x in serie}
    fim = d(datas[-1])
    ref = {}
    for n in (1, 7, 30):
        cand = [x for x in datas if d(x) <= fim - timedelta(days=n)]
        ref[n] = cand[-1] if cand else None
    out = {}
    for k in chaves:
        agora = idx[datas[-1]].get(k)
        if agora is None:
            continue
        o = {"agora": round(agora, 1)}
        for n, rot in ((1, "d1"), (7, "d7"), (30, "d30")):
            r = ref[n]
            base = idx[r].get(k) if r else None
            o[rot] = round(agora - base, 1) if base is not None else None
        o["ref"] = {"d1": ref[1], "d7": ref[7], "d30": ref[30]}
        out[k] = o
    return out


# ------------------------------------------------------------------ modelo BR

def modelo_br():
    html = baixa(URL_PRES)
    dat = blob(html, "modelo-2026-data")
    hst = blob(html, "modelo-2026-history")
    meta = dat["meta"]

    pwin = dat["p_wins_overall"]
    t1v = dat["t1_valid"]
    pt2 = dat["p_makes_t2"]
    linhas = []
    for nome in sorted(pwin, key=lambda k: -pwin[k]):
        v = t1v.get(nome, {})
        linhas.append({
            "nome": nome,
            "sq": SQ_MODELO.get(nome),
            "pwin": round(pwin[nome], 2),
            "t2": round(pt2.get(nome, 0), 1),
            "r1": round(v.get("mean", 0), 1),
            "lo": round(v.get("p5", 0), 1),
            "hi": round(v.get("p95", 0), 1),
        })

    t2 = {}
    for adv, o in dat.get("t2_by_opponent", {}).items():
        t2[adv] = {
            "chance": round(o["share_of_runoffs"], 1),
            "lulaVence": round(o["p_lula_wins"], 1),
            "lulaVotos": round(o["mean"], 1),
        }

    hist = [{"d": s["as_of"], "p": s["p_wins"]} for s in hst["series"]]
    hist.sort(key=lambda x: x["d"])

    modelo = {
        "fonte": "Plano Político",
        "url": URL_PRES,
        "versao": "v" + str(meta.get("model_version", "")),
        "npesq": "%d nacionais + %d estaduais" % (meta["n_natl"], meta["n_state"]),
        "atualizado": meta["as_of"],
        "linhas": linhas,
        "t1out": round(dat["p_t1_outright_any"], 2),
        "t2": t2,
    }
    dl = deltas([(h["d"], h["p"]) for h in hist], [l["nome"] for l in linhas])
    for nome, o in dl.items():
        o["sq"] = SQ_MODELO.get(nome)
    log("  modelo BR: %s · %d linhas · série %s→%s (%d dias)"
        % (meta["as_of"], len(linhas), hist[0]["d"], hist[-1]["d"], len(hist)))
    return modelo, hist, dl


# ------------------------------------------------------------------ modelo DF

def modelo_df():
    html = baixa(URL_GOV)
    dat = blob(html, "modelo-gov-2026-data")
    df = dat["states"]["DF"]
    linhas = []
    for c in df["candidates"]:
        linhas.append({
            "nome": c["name"],
            "curto": c.get("short") or c["name"],
            "partido": c.get("party"),
            "sq": SQ_DF.get(c["name"]),
            "pwin": round(c["p_win"], 2),
            "r1": round(c["share"], 1),
            "lo": round(c["lo"], 1),
            "hi": round(c["hi"], 1),
        })
    linhas.sort(key=lambda l: -l["r1"])
    r2 = [{"nome": x["name"], "curto": x.get("short") or x["name"], "p": round(x["p"], 1)}
          for x in df.get("r2_reach", [])]
    n = df.get("n_polls", 0)
    modelo = {
        "fonte": "Plano Político",
        "url": URL_GOV,
        "npesq": "%d pesquisa%s no DF" % (n, "" if n == 1 else "s"),
        "atualizado": df.get("as_of") or dat["meta"]["as_of"],
        "pRunoff": round(df["p_runoff"]),
        "linhas": linhas,
        "r2": r2,
    }
    log("  modelo DF: %s · %d candidatos · %d pesquisas" % (modelo["atualizado"], len(linhas), n))
    return modelo


# ------------------------------------------------------------------- mercado

def mercado():
    ev = json.loads(baixa(URL_PM_EVENTO))
    if not ev:
        raise RuntimeError("Polymarket devolveu evento vazio")
    ev = ev[0]

    linhas, series = [], {}
    for m in ev.get("markets", []):
        if "outcomePrices" not in m or not m.get("active", True):
            continue  # contrato ainda não abriu: não tem preço
        titulo = m.get("groupItemTitle") or m.get("question")
        preco = float(json.loads(m["outcomePrices"])[0]) * 100
        linhas.append({
            "nome": titulo,
            "p": round(preco, 2),
            "vol": round(m.get("volumeNum") or 0),
            "sq": (SQ_MERCADO.get(titulo) or (None, None))[1],
        })
        if titulo in SQ_MERCADO:
            curto, sq = SQ_MERCADO[titulo]
            tok = json.loads(m["clobTokenIds"])[0]
            h = json.loads(baixa(URL_PM_SERIE.format(tok))).get("history", [])
            por_dia = {}
            for p in h:  # a série vem em UTC; um ponto por dia
                por_dia[datetime.fromtimestamp(p["t"], timezone.utc).date().isoformat()] = round(p["p"] * 100, 2)
            if por_dia:
                series[curto] = {
                    "sq": sq,
                    "pts": [{"d": k, "p": por_dia[k]} for k in sorted(por_dia)],
                }

    linhas.sort(key=lambda l: -l["p"])
    linhas = [l for l in linhas if l["p"] >= 0.1][:8]

    # deltas de mercado: cada contrato tem a própria série, que começa no dia
    # em que passou a ser negociado — por isso o cálculo é um por candidato.
    dl = {}
    for curto, s in series.items():
        o = deltas([(p["d"], {curto: p["p"]}) for p in s["pts"]], [curto]).get(curto)
        if not o:
            continue
        o.pop("ref", None)
        o["sq"] = s["sq"]
        o["desde"] = s["pts"][0]["d"]
        o["n"] = len(s["pts"])
        dl[curto] = o

    ult = max((s["pts"][-1]["d"] for s in series.values()), default=None)
    mk = {
        "fonte": "Polymarket",
        "url": "https://polymarket.com/event/" + ev["slug"],
        "volume": round(ev.get("volume") or 0),
        "liquidez": round(ev.get("liquidity") or 0),
        "atualizado": ult,
        "linhas": linhas,
        "deltas": dl,
        "hist": series,
    }
    log("  mercado: %s · %d contratos · %d séries" % (ult, len(linhas), len(series)))
    return mk


# ------------------------------------------------------------------ pesquisas

def pesquisas():
    html = baixa(URL_AGG)
    agg = blob(html, "agg-data")
    rec = agg["presidente_t1"]["recent_polls"]

    def bloco(chave):
        brs = [r for r in rec[chave] if r.get("scope") == "BR"]
        por_inst = defaultdict(list)
        for r in brs:
            por_inst[r["instituto"]].append(r)
        saida = []
        for inst, lst in por_inst.items():
            lst.sort(key=lambda r: (r["dt_fim"], r.get("dt_divulgacao") or ""))
            hist = [{
                "ini": r.get("dt_inicio"),
                "fim": r.get("dt_fim"),
                "div": r.get("dt_divulgacao"),
                "n": r.get("n"),
                "m": r.get("method"),
                "reg": r.get("registro"),
                "url": r.get("url"),
                # share nulo = o instituto não colocou esse nome no cartão.
                # Some a chave: ausência é diferente de zero.
                "s": {k: v for k, v in (r.get("shares") or {}).items() if v is not None},
            } for r in lst]
            atual = hist[-1]
            prev = hist[-2] if len(hist) > 1 else None
            var = None
            if prev:
                var = {k: round(v - prev["s"][k], 1)
                       for k, v in atual["s"].items()
                       if v is not None and prev["s"].get(k) is not None}
            saida.append({
                "inst": inst,
                "n_hist": len(hist),
                "atual": atual,
                "prev": prev,
                "var": var,
                "hist": hist,
            })
        # mais recente primeiro: é o que o leitor procura ao abrir a aba
        saida.sort(key=lambda r: (r["atual"]["fim"] or "", r["atual"].get("div") or ""), reverse=True)
        return saida

    t1, t2 = bloco("t1"), bloco("t2")
    divs = [r["atual"].get("div") or r["atual"]["fim"] for r in t1 + t2]
    q = {
        "fonte": "Plano Político",
        "url": "https://www.planopolitico.com.br/agregador/presidente/",
        "atualizado": max(divs) if divs else agg.get("generated_at"),
        "geradoFonte": agg.get("generated_at"),
        "t1": t1,
        "t2": t2,
    }
    log("  pesquisas: última divulgação %s · %d institutos 1º turno, %d no 2º"
        % (q["atualizado"], len(t1), len(t2)))
    return q


# ----------------------------------------------------------------------- main

def main():
    seco = "--dry-run" in sys.argv
    agora = datetime.now(BRT)

    log("baixando fontes…")
    mo_br, hist_br, dl_br = modelo_br()
    mo_df = modelo_df()
    mk = mercado()
    q = pesquisas()

    antes = ""
    if os.path.exists(LIVE_JSON):
        velho = json.load(open(LIVE_JSON, encoding="utf-8"))
        velho.pop("capturado", None)   # o carimbo muda sempre; não conta como mudança
        antes = json.dumps(velho, ensure_ascii=False, sort_keys=True)

    live = {
        "capturado": agora.strftime("%Y-%m-%dT%H:%M-03:00"),
        "odds": {
            "atualizado": max(x for x in [mo_br["atualizado"], mo_df["atualizado"], mk["atualizado"]] if x),
            "br": {"mercado": mk, "modelo": mo_br, "hist": hist_br, "deltas": dl_br},
            "df": {"mercado": None, "modelo": mo_df},
        },
        "pesquisas": q,
    }

    comparavel = dict(live)
    comparavel.pop("capturado", None)
    if antes == json.dumps(comparavel, ensure_ascii=False, sort_keys=True):
        log("nada mudou nas fontes desde a última rodada.")
    if seco:
        log("--dry-run: nada foi gravado.")
        return 0

    with open(LIVE_JSON, "w", encoding="utf-8") as f:
        json.dump(live, f, ensure_ascii=False, separators=(",", ":"))
    log("gravado %s (%.0f KB)" % (os.path.relpath(LIVE_JSON, RAIZ), os.path.getsize(LIVE_JSON) / 1024))

    import build
    build.main()
    return 0


if __name__ == "__main__":
    sys.exit(main())
