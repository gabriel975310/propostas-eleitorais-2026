# -*- coding: utf-8 -*-
"""Mapas de nome -> sq (número de registro TSE) usados pelos coletores.

Os três provedores externos escrevem o nome de cada candidato de um jeito.
Só entra em `sq` quem tem plano de governo neste site; o resto fica com None
e o dashboard marca com "·".
"""

# nomes curtos do modelo do Plano Político
SQ_MODELO = {
    "Lula": "280002542548",
    "Flávio": "280002551544",
    "Renan": "280002540694",
    "Caiado": "280002551932",
    "Zema": "280002539826",
    "Cury": "280002551547",
}

# nomes como saem no agregador de pesquisas
SQ_PESQUISA = {
    "Lula": "280002542548",
    "Flávio Bolsonaro": "280002551544",
    "Renan Santos": "280002540694",
    "Ronaldo Caiado": "280002551932",
    "Romeu Zema": "280002539826",
    "Augusto Cury": "280002551547",
}

# títulos dos contratos no Polymarket
SQ_MERCADO = {
    "Luiz Inácio Lula da Silva": ("Lula", "280002542548"),
    "Flávio Bolsonaro": ("Flávio", "280002551544"),
    "Renan Santos": ("Renan", "280002540694"),
    "Ronaldo Caiado": ("Caiado", "280002551932"),
    "Romeu Zema": ("Zema", "280002539826"),
    "Augusto Cury": ("Cury", "280002551547"),
}

# candidatos ao governo do DF
SQ_DF = {
    "Celina Leão": "70002553055",
    "Leandro Grass": "70002552496",
    "José Roberto Arruda": "70002552586",
    "Cappelli": "70002551557",
}

# 16/08/2026: primeiro dia em que a propaganda eleitoral é permitida
# (Lei 9.504/97, art. 36), no dia seguinte ao prazo de registro das
# candidaturas. É a fronteira entre pré-campanha e corrida oficial.
INICIO_CAMPANHA = "2026-08-16"
