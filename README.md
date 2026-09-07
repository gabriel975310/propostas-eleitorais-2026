# Propostas eleitorais 2026

Painel dos planos de governo registrados no TSE para as eleições de 2026 —
Presidência e governo do Distrito Federal — com a leitura literal dos
documentos, a classificação editorial de cada proposta e o histórico do que já
foi tentado antes.

**No ar:** https://gabriel975310.github.io/propostas-eleitorais-2026/

## Como o site é montado

O resultado é um único HTML autocontido (~1,4 MB): fotos, dados e código vão
embutidos, sem nenhuma requisição a não ser as fontes do Google.

```
site/body.html  +  site/app.js            ->  site/tpl.html
data/site.json  +  data/live.json         ->  injetados em tpl.html
                                          ->  site/espectro-2026.html
```

`site/espectro-2026.html`, `site/tpl.html`, `site/js.part` e `dist/` são
**derivados** e não entram no git. Para gerá-los:

```bash
python3 site/build.py
```

## Os dois arquivos de dados

| Arquivo | Conteúdo | Muda |
|---|---|---|
| `data/site.json` | candidatos, propostas, setores, tópicos | quase nunca |
| `data/live.json` | odds, pesquisas, carimbo de captura | todo dia |

Ficam separados porque o segundo é reescrito a cada atualização: 138 KB por
rodada em vez de 1,2 MB. O `build.py` junta os dois na hora de montar o HTML.

## Atualizar os dados

```bash
python3 site/refresh.py         # rebaixa as fontes e reconstrói o HTML
python3 site/deploy.py --so-montar   # monta dist/ para conferir localmente
python3 site/deploy.py          # dispara a publicação pelo Actions
```

`refresh.py --dry-run` mostra o que mudaria sem gravar nada.

O Pages deste repositório recebe só do GitHub Actions, então `deploy.py` sem
`--so-montar` não envia nada daqui: pede uma rodada do workflow, que rebaixa as
fontes de novo e publica o que ele mesmo capturar. Para olhar o resultado local
antes, use `--so-montar` e abra `dist/index.html`.

### As quatro fontes

| Fonte | O que traz |
|---|---|
| [Plano Político — agregador](https://www.planopolitico.com.br/agregador/presidente/) | pesquisas nacionais, por instituto |
| [Plano Político — modelo presidencial](https://www.planopolitico.com.br/modelos-eleitorais/presidencial/) | probabilidade de vitória e a série diária |
| [Plano Político — modelo de governadores](https://www.planopolitico.com.br/modelos-eleitorais/governadores/) | cenário do DF |
| [Polymarket](https://polymarket.com/event/brazil-presidential-election) | preço dos contratos e a série de preço |

Cada uma anda no próprio ritmo, e o painel no topo da aba Chances mostra a data
de cada uma separadamente, com a idade contada contra o relógio do leitor.

### Pré-campanha e campanha oficial

As pesquisas são marcadas conforme tenham ido a campo antes ou depois de
**16/08/2026**, primeiro dia em que a propaganda eleitoral é permitida
(Lei 9.504/97, art. 36), no dia seguinte ao prazo de registro das candidaturas.
Comparar um número de março com um de agosto mede sobretudo a passagem do
tempo, e a marcação existe para deixar isso à vista.

## Atualização automática

`.github/workflows/atualizar.yml` roda **de duas em duas horas**: rebaixa as
fontes, reconstrói, roda as verificações, publica, e commita `data/live.json`
apenas quando as fontes trouxeram algo novo — sem isso cada rodada geraria um
commit só porque o carimbo de captura mudou.

O minuto `:17` é deliberado: agendamentos na hora cheia caem na faixa mais
congestionada da fila do GitHub, onde disparos atrasam ou se perdem. A
frequência alta é o que cobre um disparo perdido — o atraso máximo vira duas
horas em vez de um dia.

Não precisa de segredo nenhum: quem publica é o `GITHUB_TOKEN` da própria
rodada. A única configuração é feita uma vez, à mão, em *Settings > Pages >
Build and deployment > Source*, que precisa ficar em **GitHub Actions**.

Esse passo não dá para automatizar: criar o site do Pages exige permissão de
admin, que o `GITHUB_TOKEN` não tem nem com `pages: write` — o
`actions/configure-pages` com `enablement` responde *403 Resource not
accessible by integration*. Depois de criado, o token publica sem problema.

Por isso o repositório é público: o GitHub Pages só é gratuito assim, e em
repositório público os minutos de Actions também são ilimitados. Tudo que está
versionado aqui já é público de origem — os pacotes de dados abertos do TSE, o
código do painel e a classificação editorial que o site mostra.

### Cabeçalhos

O Pages não deixa configurar cabeçalho de resposta. Ele já manda
`X-Content-Type-Options: nosniff` por conta própria, e a política de referrer
virou uma `<meta name="referrer">` no `body.html`.

## Verificações

```bash
cd site && node chk.js && node chk2.js
```

Conferem posicionamento de rótulos na matriz, sobreposições, soma das barras de
veredito e integridade das séries de pesquisa.

## Dados de origem

Os `.zip` na raiz são os pacotes de dados abertos do TSE. `data/raw/` e
`data/txt/` são extrações locais deles e não entram no git.

## Ressalvas

- As coordenadas e os vereditos são **classificação editorial** deste projeto
  sobre o texto literal registrado, não dado oficial.
- Plano registrado não é promessa de governo: o TSE exige o registro e não
  verifica conteúdo, viabilidade ou custo.
- A aba Chances é a única parte que não vem do TSE, e traz estimativas de
  terceiros sobre quem vence.
