import re
SUF=[(r'aticas$','áticas'),(r'aticos$','áticos'),(r'atica$','ática'),(r'atico$','ático'),
 (r'ericas$','éricas'),(r'ericos$','éricos'),(r'erica$','érica'),(r'erico$','érico'),
 (r'eticas$','éticas'),(r'eticos$','éticos'),(r'etica$','ética'),(r'etico$','ético'),
 (r'iticas$','íticas'),(r'iticos$','íticos'),(r'itica$','ítica'),(r'itico$','ítico'),
 (r'ogicas$','ógicas'),(r'ogicos$','ógicos'),(r'ogica$','ógica'),(r'ogico$','ógico'),
 (r'coes$','ções'),(r'cao$','ção'),(r'oes$','ões'),(r'encias$','ências'),(r'encia$','ência'),
 (r'aveis$','áveis'),(r'avel$','ável'),(r'iveis$','íveis'),(r'ivel$','ível'),
 (r'orios$','órios'),(r'orio$','ório'),(r'arios$','ários'),(r'ario$','ário'),
 (r'arias$','árias'),(r'aria$','ária')]
SUFEXC={'cao','oes','poes','maria','aria','varia','diretoria','maioria','categoria','teoria',
        'paulo','pratica','praticas'}
D={}
def add(s):
    for pair in s.split():
        a,b=pair.split('|'); D[a]=b
add("""nao|não sao|são pais|país saude|saúde publico|público publica|pública publicos|públicos publicas|públicas
seguranca|segurança servico|serviço servicos|serviços forca|força forcas|forças crianca|criança criancas|crianças
preco|preço precos|preços comeco|começo avanco|avanço avancos|avanços comecou|começou avancou|avançou
politica|política politicas|políticas politico|político politicos|políticos ja|já ha|há so|só
evidencia|evidência tecnica|técnica tecnico|técnico tecnicos|técnicos tecnicas|técnicas
economico|econômico economica|econômica economicos|econômicos economicas|econômicas
medico|médico medicos|médicos medica|médica medicas|médicas basico|básico basica|básica basicos|básicos basicas|básicas
unico|único unica|única unicos|únicos unicas|únicas indice|índice indices|índices
minimo|mínimo minima|mínima minimos|mínimos minimas|mínimas maximo|máximo maxima|máxima
proprio|próprio propria|própria proprios|próprios proprias|próprias
numero|número numeros|números area|área areas|áreas nivel|nível niveis|níveis
possivel|possível dificil|difícil facil|fácil util|útil movel|móvel moveis|móveis
periodo|período periodos|períodos criterio|critério criterios|critérios ministerio|ministério
territorio|território territorios|territórios patrimonio|patrimônio consorcio|consórcio
orgao|órgão orgaos|órgãos regiao|região regioes|regiões razao|razão razoes|razões
gestao|gestão pressao|pressão questao|questão questoes|questões
padrao|padrão padroes|padrões cidadao|cidadão cidadaos|cidadãos
ate|até apos|após atras|atrás alem|além porem|porém tambem|também ninguem|ninguém
esta|está estao|estão estavel|estável estaveis|estáveis
seculo|século historia|história historico|histórico historica|histórica historicos|históricos historicas|históricas
memoria|memória obrigatoria|obrigatória obrigatorias|obrigatórias obrigatorio|obrigatório
media|média medias|médias medio|médio medios|médios imovel|imóvel imoveis|imóveis
credito|crédito creditos|créditos debito|débito deficit|déficit
saida|saída saidas|saídas juizo|juízo juizes|juízes
familia|família familias|famílias auxilio|auxílio auxilios|auxílios
salario|salário salarios|salários ferias|férias
divida|dívida dividas|dívidas duvida|dúvida
industria|indústria industrias|indústrias
policia|polícia policias|polícias
justica|justiça judiciario|judiciário
democratico|democrático democratica|democrática
analise|análise analises|análises
metodo|método metodos|métodos
diagnostico|diagnóstico diagnosticos|diagnósticos
academico|acadêmico academica|acadêmica
juridico|jurídico juridica|jurídica juridicos|jurídicos juridicas|jurídicas
fisico|físico fisica|física fisicas|físicas quimico|químico quimica|química
climatico|climático climatica|climática climaticas|climáticas
estrategico|estratégico estrategica|estratégica estrategicos|estratégicos estrategicas|estratégicas estrategia|estratégia estrategias|estratégias
logistica|logística logistico|logístico logisticos|logísticos
eletronico|eletrônico eletronica|eletrônica eletronicos|eletrônicos eletronicas|eletrônicas
autonomo|autônomo autonoma|autônoma autonomia|autonomia
cronico|crônico cronica|crônica cronicos|crônicos cronicas|crônicas
organico|orgânico hidrico|hídrico hidrica|hídrica hidricos|hídricos hidricas|hídricas
genetico|genético genetica|genética genomico|genômico
epidemiologico|epidemiológico epidemiologica|epidemiológica biologico|biológico
psicologico|psicológico psicossocial|psicossocial psiquiatrico|psiquiátrico psiquiatrica|psiquiátrica
pedagogico|pedagógico pedagogica|pedagógica tecnologico|tecnológico tecnologica|tecnológica
ideologico|ideológico ideologica|ideológica geografico|geográfico geografica|geográfica
automatico|automático automatica|automática automaticos|automáticos automaticas|automáticas
progressao|progressão prisao|prisão prisoes|prisões prisional|prisional presidio|presídio presidios|presídios
faccao|facção faccoes|facções
homicidio|homicídio homicidios|homicídios feminicidio|feminicídio feminicidios|feminicídios suicidio|suicídio
subsidio|subsídio subsidios|subsídios subsidiado|subsidiado subsidiada|subsidiada
municipio|município municipios|municípios
constituicao|Constituição constitucional|constitucional inconstitucional|inconstitucional
orcamento|orçamento orcamentos|orçamentos orcamentaria|orçamentária orcamentario|orçamentário orcamentarias|orçamentárias orcamentarios|orçamentários
tributaria|tributária tributario|tributário tributarias|tributárias
aliquota|alíquota aliquotas|alíquotas
previdenciario|previdenciário previdenciaria|previdenciária previdencia|previdência
beneficio|benefício beneficios|benefícios beneficiario|beneficiário beneficiarios|beneficiários beneficiaria|beneficiária
domicilio|domicílio domiciliar|domiciliar
farmacia|farmácia farmacias|farmácias farmaceutica|farmacêutica
laboratorio|laboratório laboratorios|laboratórios
oncologico|oncológico terapeutica|terapêutica
sanitaria|sanitária sanitario|sanitário sanitarias|sanitárias
veterinario|veterinário veterinaria|veterinária
agricola|agrícola agricolas|agrícolas agropecuaria|agropecuária agronegocio|agronegócio
semiarido|semiárido
energetico|energético energetica|energética energeticas|energéticas
eletrico|elétrico eletrica|elétrica eletricos|elétricos eletricas|elétricas
combustivel|combustível combustiveis|combustíveis petroleo|petróleo
mineracao|mineração minerio|minério minerios|minérios
ambiental|ambiental ambientais|ambientais
residuo|resíduo residuos|resíduos
rodoviario|rodoviário rodoviaria|rodoviária ferroviario|ferroviário ferroviaria|ferroviária
aereo|aéreo aerea|aérea
portuario|portuário maritima|marítima
urbanistico|urbanístico urbanistica|urbanística
fundiario|fundiário fundiaria|fundiária fundiarias|fundiárias imobiliario|imobiliário imobiliaria|imobiliária
predio|prédio predios|prédios
curriculo|currículo curriculos|currículos magisterio|magistério
universitario|universitário universitaria|universitária
cientifico|científico cientifica|científica cientificos|científicos cientificas|científicas ciencia|ciência ciencias|ciências
inteligencia|inteligência algoritmica|algorítmica algoritmico|algorítmico
biometrico|biométrico biometrica|biométrica
video|vídeo videos|vídeos camera|câmera cameras|câmeras
satelite|satélite satelites|satélites
civico|cívico civica|cívica
penitenciario|penitenciário penitenciaria|penitenciária penitenciarias|penitenciárias
socioeducativo|socioeducativo socioeducativa|socioeducativa
idoso|idoso idosos|idosos
deficiencia|deficiência deficiencias|deficiências inclusao|inclusão
indigena|indígena indigenas|indígenas
etnico|étnico etnica|étnica
genero|gênero
violencia|violência violencias|violências vitima|vítima vitimas|vítimas
protecao|proteção
partidario|partidário partidaria|partidária
eleicao|eleição eleicoes|eleições
diplomatico|diplomático diplomacia|diplomacia
geopolitico|geopolítico geopolitica|geopolítica
soberania|soberania
governanca|governança financeiro|financeiro financeira|financeira financeiros|financeiros financeiras|financeiras
bancario|bancário bancaria|bancária
microcredito|microcrédito
empresario|empresário
sindical|sindical
qualificacao|qualificação capacitacao|capacitação
corrupcao|corrupção
auditavel|auditável rastreavel|rastreável
transparencia|transparência prestacao|prestação
reeleicao|reeleição
sumula|súmula acordao|acórdão
inquerito|inquérito processual|processual
penal|penal reincidencia|reincidência ressocializacao|ressocialização
trafico|tráfico traficante|traficante
milicia|milícia milicias|milícias
apreensao|apreensão
inedito|inédito inedita|inédita
reversao|reversão
especifico|específico especifica|específica especificos|específicos especificas|específicas
sucessivo|sucessivo sucessiva|sucessiva sucessivas|sucessivas
proximo|próximo proxima|próxima proximos|próximos proximas|próximas
ultimo|último ultima|última ultimos|últimos ultimas|últimas
inicio|início varios|vários varias|várias voluntario|voluntário voluntaria|voluntária
necessario|necessário necessaria|necessária
disponivel|disponível disponiveis|disponíveis
comparavel|comparável comparaveis|comparáveis
sustentavel|sustentável sustentaveis|sustentáveis sustentabilidade|sustentabilidade
irreversivel|irreversível
relevancia|relevância importancia|importância instancia|instância instancias|instâncias distancia|distância
circunstancia|circunstância substancia|substância
vigilancia|vigilância ambulancia|ambulância
denuncia|denúncia denuncias|denúncias renuncia|renúncia renuncias|renúncias
sequencia|sequência consequencia|consequência consequencias|consequências frequencia|frequência
experiencia|experiência experiencias|experiências evidencias|evidências
eficiencia|eficiência ineficiencia|ineficiência
competencia|competência competencias|competências
transferencia|transferência transferencias|transferências referencia|referência referencias|referências
permanencia|permanência ocorrencia|ocorrência ocorrencias|ocorrências
emergencia|emergência emergencias|emergências urgencia|urgência urgencias|urgências
independencia|independência dependencia|dependência
audiencia|audiência audiencias|audiências
tendencia|tendência tendencias|tendências
carencia|carência ausencia|ausência presenca|presença
existencia|existência resistencia|resistência assistencia|assistência
influencia|influência
paciencia|paciência ciencia|ciência consciencia|consciência
avancar|avançar avancada|avançada avancado|avançado avancados|avançados avancadas|avançadas
alcance|alcance alcancou|alcançou alcancar|alcançar alcancado|alcançado
lancado|lançado lancada|lançada lancou|lançou lancamento|lançamento
financas|finanças licenca|licença licencas|licenças licenciamento|licenciamento
diferenca|diferença diferencas|diferenças heranca|herança cobranca|cobrança cobrancas|cobranças
confianca|confiança esperanca|esperança mudanca|mudança mudancas|mudanças
sentenca|sentença
peca|peça pecas|peças cabeca|cabeça
funcao|função funcoes|funções funcional|funcional funcionamento|funcionamento
producao|produção producoes|produções
correcao|correção correcoes|correções
excecao|exceção excecoes|exceções
inflacao|inflação fracao|fração fracoes|frações
solucao|solução solucoes|soluções
posicao|posição posicoes|posições oposicao|oposição
comissao|comissão comissoes|comissões
concessao|concessão concessoes|concessões
transmissao|transmissão emissao|emissão emissoes|emissões
discussao|discussão discussoes|discussões
decisao|decisão decisoes|decisões previsao|previsão previsoes|previsões
supervisao|supervisão revisao|revisão revisoes|revisões
extensao|extensão dimensao|dimensão dimensoes|dimensões
suspensao|suspensão compreensao|compreensão
expansao|expansão tensao|tensão intencao|intenção
manutencao|manutenção prevencao|prevenção intervencao|intervenção intervencoes|intervenções
convencao|convenção convencoes|convenções
retencao|retenção detencao|detenção atencao|atenção
sancao|sanção sancoes|sanções
uniao|União reuniao|reunião reunioes|reuniões
opiniao|opinião opinioes|opiniões
milhao|milhão milhoes|milhões bilhao|bilhão bilhoes|bilhões trilhao|trilhão trilhoes|trilhões
caminhao|caminhão caminhoes|caminhões
mao|mão maos|mãos irmaos|irmãos
grao|grão graos|grãos
codigo|código codigos|códigos legitima|legítima legitimo|legítimo
veiculo|veículo veiculos|veículos capitulo|capítulo titulo|título titulos|títulos
calculo|cálculo calculos|cálculos vinculo|vínculo vinculos|vínculos estimulo|estímulo estimulos|estímulos
obstaculo|obstáculo obstaculos|obstáculos modulo|módulo
otimo|ótimo otima|ótima
continuo|contínuo continua|contínua
prejuizo|prejuízo prejuizos|prejuízos
agua|água aguas|águas
serie|série series|séries especie|espécie especies|espécies
superavit|superávit sindrome|síndrome
principio|princípio principios|princípios
exercicio|exercício exercicios|exercícios
comercio|comércio silencio|silêncio
horario|horário horarios|horários diario|diário diaria|diária
proteina|proteína
saudavel|saudável saudaveis|saudáveis
tres|três mes|mês meses|meses
portugues|português ingles|inglês""")

def restore(t):
    if not t: return t
    def f(m):
        w=m.group(0); lw=w.lower()
        r=D.get(lw)
        if r is None and lw not in SUFEXC:
            for pat,rep in SUF:
                if re.search(pat,lw): r=re.sub(pat,rep,lw); break
        if r is None: return w
        if w.isupper(): return r.upper()
        if w[0].isupper(): return r[0].upper()+r[1:]
        return r
    return re.sub(r"[A-Za-z]+",f,t)
