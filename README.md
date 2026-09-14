# Propostas eleitorais 2026

Painel dos planos de governo registrados no TSE para as eleições de 2026 —
Presidência e governo do Distrito Federal — com a leitura literal dos
documentos, a classificação editorial de cada proposta e o histórico do que já
foi tentado antes. Há ainda duas abas que não saem do TSE: **Chances**, com
estimativas de terceiros sobre quem vence, e **Senado DF**, com a corrida pelas
duas vagas do Distrito Federal.

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

## Os arquivos de dados

| Arquivo | Conteúdo | Muda |
|---|---|---|
| `data/site.json` | candidatos, propostas, setores, tópicos | quase nunca |
| `data/live.json` | odds, pesquisas, carimbo de captura | todo dia |
| `data/senado_stf.json` | posição pública de cada candidato ao Senado pelo DF sobre impeachment de ministros do STF | à mão, a cada revisão |

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

### As seis fontes

| Fonte | O que traz |
|---|---|
| [Plano Político — agregador](https://www.planopolitico.com.br/agregador/presidente/) | pesquisas nacionais, por instituto |
| [Plano Político — modelo presidencial](https://www.planopolitico.com.br/modelos-eleitorais/presidencial/) | probabilidade de vitória e a série diária |
| [Plano Político — modelo de governadores](https://www.planopolitico.com.br/modelos-eleitorais/governadores/) | cenário do DF |
| [Plano Político — modelo do Senado](https://www.planopolitico.com.br/modelos-eleitorais/senado/) | chance de cada nome ficar com uma das duas vagas do DF |
| [Plano Político — agregador do Senado](https://www.planopolitico.com.br/agregador/senado/) | média do DF, série semanal e cada pesquisa registrada |
| [Polymarket](https://polymarket.com/event/brazil-presidential-election) | preço dos contratos e a série de preço |

Cada uma anda no próprio ritmo, e o painel no topo da aba Chances mostra a data
de cada uma separadamente, com a idade contada contra o relógio do leitor.

### As duas sub-abas de Chances

Modelo e mercado respondem à mesma pergunta por caminhos que não se encostam:
um simula a eleição a partir de pesquisas, o outro lê o preço que apostadores
estão pagando. Empilhados na mesma rolagem viravam um borrão de porcentagens
parecidas, então a aba se divide em **📈 Modelo e pesquisas** (Plano Político) e
**💵 Mercado de apostas** (Polymarket). Nenhum número de uma aparece na outra —
`site/shim.js` verifica isso a cada rodada. O cabeçalho de procedência fica
fora das duas, porque a ressalva vale para ambas.

No recorte do DF a sub-aba de mercado fica vazia de propósito: o Polymarket não
abre contrato para o governo do Distrito Federal.

### A aba Senado DF

Só aparece no recorte do Distrito Federal — senador é disputa de unidade da
federação, e na Presidência a aba não teria o que mostrar.

**Ali não existe plano de governo para ler**, e não é lacuna deste projeto: a
Lei 9.504/97, art. 11, § 1º, IX só manda instruir o pedido de registro com as
"propostas defendidas pelo candidato a Prefeito, a Governador de Estado e a
Presidente da República". Senador ficou de fora da lista, e o pacote
`proposta_governo_2026_DF` confirma a letra da lei — os onze PDFs que ele traz
são todos de candidatura ao governo do DF. A aba mostra, então, só a corrida
medida: a chance de cada nome pelo modelo, a média do agregador em votos
válidos, a série semanal e as treze pesquisas registradas, uma a uma, cada
cartão abrindo a divulgação original — mais uma seção sobre impeachment de
ministros do STF, descrita abaixo.

Duas ressalvas moram no topo da aba porque mudam a leitura de tudo: 2026 é ano
de renovação de dois terços do Senado, então o DF elege **dois** senadores e as
chances do modelo somam 200%; e os percentuais são os do agregador, em votos
válidos, que por isso não batem com a manchete do instituto — essa costuma
trazer o percentual sobre o total de entrevistados.

### Impeachment de ministros do STF, na aba Senado DF

É a única coisa que a aba mostra além da corrida, e o motivo é de competência:
quem processa e julga ministro do STF por crime de responsabilidade é o
Senado (Constituição, art. 52, II), e a condenação só sai com dois terços dos
votos — 54 dos 81 senadores (art. 52, parágrafo único). Em 2026 estão em jogo
54 cadeiras, duas pelo DF.

A seção vem de `data/senado_stf.json`, **levantamento feito à mão**. O
`refresh.py` não toca nele e ele não se atualiza sozinho: quem revisa reconfere
as fontes e troca a data em `verificado`, que a página mostra num selo. O
`build.py` só o embute como `senadoSTF`.

Critérios:

- só entra declaração ou ato público com data e link, e texto em `citacao` é
  literal;
- crítica ao STF ou a um ministro, sozinha, não conta como compromisso;
- ninguém é classificado pelo partido — a exigência do Novo aparece na ficha
  de Sebastião Coelho só como contexto, ao lado da fala dele;
- assinar pedido de impeachment é pedir que o processo seja aberto, não o voto
  final, e por isso tem categoria própria;
- "sem posição pública encontrada" quer dizer que a busca não achou nada, não
  que a pessoa seja contra ou a favor.

Na verificação de 14/09/2026:

| Posição | Quem |
|---|---|
| Promete apoiar o impeachment | Bia Kicis (PL) · Sebastião Coelho (Novo) |
| Assinou pedido de impeachment | Leila do Vôlei (PDT) — mudou de posição entre maio e setembro |
| Contra a pauta do impeachment | Erika Kokay (PT) |
| Sem posição pública encontrada | Michelle Bolsonaro (PL) e os outros oito |

Michelle Bolsonaro critica o STF em público, mas não há compromisso dela com
impeachment registrado nas fontes consultadas — e a regra acima não converte
crítica em compromisso.

O [Placar STF](https://placarstf.com.br/), criado por um filiado ao Novo, serviu
só de cruzamento: as quatro posições do DF que ele registra batem com as daqui,
e toda posição da seção foi confirmada na reportagem citada no cartão.

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

O Pages não deixa configurar cabeçalho de resposta, e os dois que o Netlify
mandava tiveram destinos diferentes:

- **Referrer-Policy** virou `<meta name="referrer">` no `body.html`, que o
  navegador respeita igual.
- **X-Content-Type-Options: nosniff** se perdeu — o Pages não o envia (confira
  com `curl -I`) e não existe `<meta>` equivalente. Aqui o efeito prático é
  nulo: o site é um único HTML servido com `content-type: text/html;
  charset=utf-8` correto, sem nenhum outro arquivo que um navegador pudesse
  interpretar como tipo diferente do declarado.

De brinde, o Pages manda `Strict-Transport-Security`, que o Netlify não
mandava.

## Verificações

```bash
cd site && node chk.js && node chk2.js && node shim.js
```

Conferem posicionamento de rótulos na matriz, sobreposições, soma das barras de
veredito e integridade das séries de pesquisa. O `shim.js` desenha todas as
abas nas duas esferas e falha se alguma quebrar, se um número do mercado
aparecer na sub-aba do modelo (ou o contrário) ou se a aba Senado DF sair com
`undefined`. As três rodam no workflow, antes da publicação.

## Dados de origem

Os `.zip` na raiz são os pacotes de dados abertos do TSE. `data/raw/` e
`data/txt/` são extrações locais deles e não entram no git.

## Ressalvas

- As coordenadas e os vereditos são **classificação editorial** deste projeto
  sobre o texto literal registrado, não dado oficial.
- Plano registrado não é promessa de governo: o TSE exige o registro e não
  verifica conteúdo, viabilidade ou custo.
- As abas Chances e Senado DF são as únicas que não vêm do TSE: a primeira traz
  estimativas de terceiros sobre quem vence, a segunda a corrida pelas duas
  vagas do DF. Nenhuma das duas tem proposta registrada a mostrar — no caso do
  Senado porque a lei não exige que exista. A posição sobre impeachment de
  ministros do STF, na aba Senado DF, sai de declarações e atos públicos com
  fonte, reunidos à mão, e vale para a data do selo.
- Os gráficos de série dessa aba abrem recortados na **campanha oficial** — de
  16/08/2026 em diante —, que é o período em que a corrida medida é a que está
  em jogo. O seletor ao lado de cada título traz a série inteira de volta. Onde
  o recorte deixaria menos de dois pontos, o gráfico volta sozinho para a série
  inteira e avisa na legenda; é o caso da maioria dos institutos de pesquisa,
  que não voltaram a campo duas vezes desde 16/08.
