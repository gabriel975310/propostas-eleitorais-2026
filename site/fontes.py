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

# ---------------------------------------------------------------- Senado (DF)
# Os 13 registros de senador no DF, na grafia com que o Plano Político escreve
# cada nome -> (sq, número na urna, partido, nome completo no TSE).
#
# Aqui o `sq` não serve para achar plano de governo: senador não registra
# nenhum. A Lei 9.504/97, art. 11, § 1º, IX, só exige "propostas defendidas
# pelo candidato a Prefeito, a Governador de Estado e a Presidente da
# República" — e o pacote proposta_governo_2026_DF do TSE confirma a letra da
# lei: os 11 PDFs que ele traz são todos de candidatura a governador. O sq
# existe para amarrar cada linha ao registro oficial, e o número da urna para
# o leitor reconhecer quem é.
SQ_SENADO_DF = {
    "Michelle Bolsonaro": ("70002552936", "222", "PL", "MICHELLE DE PAULA FIRMO REINALDO BOLSONARO"),
    "Bia Kicis": ("70002552934", "223", "PL", "BEATRIZ KICIS TORRENTS DE SORDI"),
    "Leila do Vôlei": ("70002552492", "123", "PDT", "LEILA GOMES DE BARROS RÊGO"),
    "Erika Kokay": ("70002552490", "131", "PT", "ERIKA JUCÁ KOKAY"),
    "Sebastião Coelho": ("70002548624", "300", "NOVO", "SEBASTIAO COELHO DA SILVA"),
    "Ronaldo Fonseca": ("70002553751", "555", "PSD", "RONALDO FONSECA DE SOUZA"),
    "Guto Felício dos Santos": ("70002553296", "456", "PSDB", "PAULO AUGUSTO PIMENTA FELICIO DOS SANTOS"),
    "Marley": ("70002552582", "700", "AVANTE", "MARLEY MENDONCA ALVES"),
    "Tiago": ("70002551323", "360", "AGIR", "TIAGO TÁRSIS ADALDO"),
    "Avenir Rosa": ("70002553859", "355", "DEMOCRATA", "AVENIR ANGELO ROSA FILHO"),
    "Zanata": ("70002536445", "161", "PSTU", "EDUARDO RENNÓ ZANATA"),
    "Professor Guilherme Amorim": ("70002537112", "800", "UP", "GUILHERME DE AMORIM LINO"),
    "David Horn": ("70002551426", "290", "PCO", "DAVID HORN PUREZA"),
}

# Cor (tema claro, tema escuro) por candidato ao Senado. Quem divide legenda
# com alguém que já está no site herda a mesma cor — Erika Kokay fica com o
# vermelho do PT do Lula e do Leandro Grass, Ronaldo Fonseca com o verde do PSD
# do Caiado e do Arruda. A exceção é o PL: Michelle e Bia Kicis disputam pelo
# mesmo partido, e duas linhas idênticas num gráfico de treze não distinguem
# ninguém, então a segunda fica com um azul mais fundo da mesma família.
COR_SENADO_DF = {
    "Michelle Bolsonaro": ("#2C68F5", "#80A7FF"),
    "Bia Kicis": ("#1B3A8F", "#4E86E8"),
    "Leila do Vôlei": ("#C0398F", "#F58ACB"),
    "Erika Kokay": ("#9F0633", "#FF5A7F"),
    "Sebastião Coelho": ("#C2410C", "#E8763C"),
    "Ronaldo Fonseca": ("#6BAA35", "#7ACB3C"),
    "Guto Felício dos Santos": ("#1D86C4", "#5FC4F0"),
    "Marley": ("#15A29A", "#01C5B7"),
    "Tiago": ("#8A6A22", "#CFA94A"),
    "Avenir Rosa": ("#525F75", "#9AA8BF"),
    "Zanata": ("#D33A2C", "#FF8A7A"),
    "Professor Guilherme Amorim": ("#8E24AA", "#D98BE8"),
    "David Horn": ("#6E1418", "#C87A7E"),
}
