(function(){
"use strict";
var D=JSON.parse(document.getElementById('dados').textContent);
var C=D.candidatos,P=D.propostas,SET=D.setores,TOP=D.topicos;
var byId={},setById={};
C.forEach(function(c){byId[c.sq]=c;});
SET.forEach(function(s){setById[s.id]=s;});
var root=document.documentElement;
function isDark(){var t=root.getAttribute('data-theme');
  return t?t==='dark':matchMedia('(prefers-color-scheme:dark)').matches;}
function pc(c){return isDark()?c.corD:c.cor;}
function sc(id){var s=setById[id];return s?(isDark()?s.corD:s.cor):'#888';}
var VT={forte:['Evidência forte','var(--v-forte)'],promissora:['Promissora','var(--v-prom)'],
 arriscada:['Arriscada','var(--v-risc)'],ja_falhou:['Já falhou','var(--v-falh)'],
 sem_precedente:['Sem precedente','var(--v-sem)']};
var RES={funcionou:['Funcionou','var(--v-forte)'],parcial:['Parcial','var(--v-risc)'],
 fracassou:['Fracassou','var(--v-falh)'],revertido:['Revertido','var(--v-sem)'],
 em_curso:['Em curso','var(--v-prom)'],inconclusivo:['Inconclusivo','var(--v-sem)'],
 inedito:['Inédito','var(--v-sem)']};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(m){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m];});};
var f1=function(n){return (n>0?'+':'')+Number(n).toFixed(2);};
/* ---- datas, idade do dado e fronteira da campanha ---------------------- */
/* 16/08/2026 é o primeiro dia de propaganda eleitoral permitida (Lei 9.504/97,
   art. 36), no dia seguinte ao prazo de registro das candidaturas. O que foi
   medido antes disso pegou uma corrida ainda informal. */
var CAMP='2026-08-16',CAMP_T=Date.parse(CAMP+'T00:00:00Z');
var MESES=['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
var MESESL=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto',
            'setembro','outubro','novembro','dezembro'];
function dbr(d){var p=String(d||'').split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:'—';}
function dcurta(d){var p=String(d||'').split('-');return p.length===3?(+p[2])+' '+MESES[+p[1]-1]:'—';}
function dlonga(d){var p=String(d||'').split('-');
  return p.length===3?(+p[2])+' de '+MESESL[+p[1]-1]+' de '+p[0]:'—';}
function dhora(t){var m=String(t||'').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/);
  return m?dbr(m[1]+'-'+m[2]+'-'+m[3])+' às '+m[4]:null;}
/* idade em dias corridos entre a data do dado e o relógio de quem lê */
function idade(d){var t=Date.parse(String(d||'').slice(0,10)+'T12:00:00Z');
  if(!t)return null;return Math.floor((Date.now()-t)/864e5);}
function grau(n){return n==null?'':(n<=1?'ok':(n<=6?'wrn':'old'));}
function quando(n){return n==null?'':(n<=0?'hoje':(n===1?'ontem':'há '+n+' dias'));}
/* selo compacto para cabeçalho de seção */
function selo(d,rot){var n=idade(d);
  return '<span class="stamp '+grau(n)+'"><b>'+esc(rot||'dado de')+'</b>'+dbr(d)+
    (n==null?'':'<i>'+quando(n)+'</i>')+'</span>';}
/* cartão do painel de procedência */
function cartao(ic,tit,sub,d){var n=idade(d);
  return '<div class="updc '+grau(n)+'"><div class="uh">'+ic+' '+esc(tit)+'</div>'+
    '<span class="us">'+esc(sub)+'</span>'+
    '<div class="ud">'+dbr(d)+(n==null?'':'<em>'+quando(n)+'</em>')+'</div></div>';}
function pre(d){var t=Date.parse(String(d||'').slice(0,10)+'T00:00:00Z');
  return t?t<CAMP_T:false;}
function tagFase(d){return pre(d)
  ?'<span class="fase pre">pré-campanha</span>'
  :'<span class="fase pos">campanha oficial</span>';}
/* x da fronteira num eixo indexado por posição (séries diárias contínuas);
   null quando 16/08 cai fora do intervalo desenhado */
function xFronteira(datas,X){
  var i,n=datas.length;
  for(i=0;i<n;i++)if(datas[i]>=CAMP)break;
  if(i===0||i>=n)return null;
  if(datas[i]===CAMP)return X(i);
  var a=Date.parse(datas[i-1]+'T00:00:00Z'),b=Date.parse(datas[i]+'T00:00:00Z');
  return X(i-1)+(CAMP_T-a)/(b-a)*(X(i)-X(i-1));
}
/* faixa sombreada + régua tracejada marcando 16/08 num gráfico de série;
   x = posição da fronteira, x0 = borda esquerda da área de plotagem */
function marcaCamp(x,x0,y,h,rot){
  var s='<rect class="campzone" x="'+x0.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+
      Math.max(x-x0,0).toFixed(1)+'" height="'+h.toFixed(1)+'"/>'+
    '<line class="camprule" x1="'+x.toFixed(1)+'" y1="'+y.toFixed(1)+'" x2="'+x.toFixed(1)+
      '" y2="'+(y+h).toFixed(1)+'"/>';
  if(rot!==false)s+='<text class="camplab mut" x="'+(x-6).toFixed(1)+'" y="'+(y+10).toFixed(1)+
      '" text-anchor="end">pré-campanha ◀</text>'+
    '<text class="camplab" x="'+(x+6).toFixed(1)+'" y="'+(y+10).toFixed(1)+
      '">▶ campanha oficial</text>';
  return s;
}
function legCamp(){return '<span class="lgi"><i class="swc" style="background:var(--ink-3);opacity:.3"></i>'+
  'área clara = antes de '+dbr(CAMP)+', quando a campanha ainda não era oficial</span>';}
var brl=function(n){return Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});};
var S={esf:null,view:'matriz',gran:'cand',cand:null,tema:null,topico:null,q:'',soCom:false,selC:new Set(),selS:new Set()};
function cands(){return C.filter(function(c){return c.esfera===S.esf;});}
function props(){return P.filter(function(p){return p.esf===S.esf;});}

function shape(kind,cx,cy,r){
  var pts=[],i,a;
  if(kind==='square'){var s=r*0.9;return '<rect x="'+(cx-s)+'" y="'+(cy-s)+'" width="'+(2*s)+'" height="'+(2*s)+'" rx="'+(r*0.22)+'"';}
  if(kind==='diamond'){var d=r*1.18;
    return '<path d="M'+cx+' '+(cy-d)+'L'+(cx+d)+' '+cy+'L'+cx+' '+(cy+d)+'L'+(cx-d)+' '+cy+'Z"';}
  if(kind==='triangle'){var t=r*1.25;
    return '<path d="M'+cx+' '+(cy-t)+'L'+(cx+t*0.9)+' '+(cy+t*0.68)+'L'+(cx-t*0.9)+' '+(cy+t*0.68)+'Z"';}
  if(kind==='hex'){for(i=0;i<6;i++){a=Math.PI/180*(60*i-90);pts.push((cx+r*1.08*Math.cos(a)).toFixed(1)+' '+(cy+r*1.08*Math.sin(a)).toFixed(1));}
    return '<path d="M'+pts.join('L')+'Z"';}
  if(kind==='star'){for(i=0;i<10;i++){a=Math.PI/180*(36*i-90);var rr=i%2?r*0.52:r*1.32;
      pts.push((cx+rr*Math.cos(a)).toFixed(1)+' '+(cy+rr*Math.sin(a)).toFixed(1));}
    return '<path d="M'+pts.join('L')+'Z"';}
  return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'"';
}
function mark(c,size){var r=size/2-2.2;
  return '<svg class="mk" viewBox="0 0 '+size+' '+size+'" width="'+size+'" height="'+size+'" aria-hidden="true">'+
    shape(c.forma,size/2,size/2,r)+' fill="'+pc(c)+'" stroke="var(--ink)" stroke-opacity=".28" stroke-width="1.1"/></svg>';}
function foto(c,cls){return c.foto?'<img class="pfoto '+(cls||'')+'" src="'+c.foto+'" alt="'+esc(c.nome)+'" loading="lazy">':'';}
var tip=document.getElementById('tip');
function showTip(h,ev){tip.innerHTML=h;tip.classList.add('on');
  var r=tip.getBoundingClientRect();
  var x=Math.min(Math.max(8,ev.clientX+15),innerWidth-r.width-10);
  var y=ev.clientY-r.height-14; if(y<8)y=ev.clientY+20;
  tip.style.left=x+'px';tip.style.top=y+'px';}
function hideTip(){tip.classList.remove('on');}
function axb(v,kind){
  var col=v===0?'var(--ink-3)':(v<0?'var(--pole-a)':'var(--pole-b)');
  return '<span class="axb" style="color:'+col+';border-color:'+col+'">'+(kind==='e'?'ECON':'SOC')+' '+(v>0?'+':'')+v+'</span>';}
function pill(r){var d=RES[r]||['—','var(--v-sem)'];
  return '<span class="pill" style="background:'+d[1]+'">'+d[0]+'</span>';}
function secTag(id){var s=setById[id];
  return '<span class="tagsec" style="background:'+sc(id)+'">'+s.ic+' '+esc(s.nome)+'</span>';}
function whoTag(c){return '<span class="tagwho"><i style="background:'+pc(c)+'"></i>'+esc(c.nome)+' · '+esc(c.partido)+'</span>';}
function ficha(p,showWho){
  var c=byId[p.sq],v=VT[p.vt]||VT.sem_precedente;
  return '<article class="ficha"><div class="stripe" style="background:'+pc(c)+'"></div>'+
   '<button class="fhead" aria-expanded="false">'+
    '<div class="fmeta">'+secTag(p.setor)+(showWho?whoTag(c):'')+
      (p.sub?'<span class="tagsub">'+esc(p.sub)+'</span>':'')+
      '<span class="axbox">'+axb(p.e,'e')+axb(p.s,'s')+'</span></div>'+
    '<h4>'+esc(p.t)+'</h4><p class="fres">'+esc(p.r)+'</p>'+
    '<div class="verd" style="border-color:'+v[1]+'"><span class="vlab" style="color:'+v[1]+'">'+v[0]+'</span>'+
      '<p>'+esc(p.vd)+'</p></div></button>'+
   '<div class="fbody" hidden>'+
    '<blockquote class="quote" style="border-color:'+sc(p.setor)+'">'+esc(p.c)+
      '<span class="src">'+(p.ap?'Paráfrase — ':'Trecho literal — ')+esc(c.doc)+(p.pg?' · p. '+p.pg:'')+' · peso '+p.w+'</span></blockquote>'+
    '<div class="hist">'+
      '<div class="hbox"><div class="hl"><b>🇧🇷 Já tentaram no Brasil</b>'+pill(p.hbr)+'</div><p>'+esc(p.hb)+'</p></div>'+
      '<div class="hbox"><div class="hl"><b>🌍 E fora do Brasil</b>'+pill(p.hmr)+'</div><p>'+esc(p.hm)+'</p></div></div>'+
    '<span class="conf">Confiança da avaliação histórica: '+esc(p.cf||'—')+'</span></div></article>';}
document.addEventListener('click',function(e){
  var b=e.target.closest('.fhead'); if(!b)return;
  var body=b.nextElementSibling,open=b.getAttribute('aria-expanded')==='true';
  b.setAttribute('aria-expanded',open?'false':'true'); body.hidden=open;});
function specHTML(){return SET.map(function(s){return '<i style="background:'+sc(s.id)+'"></i>';}).join('');}
function rankChart(title,cap,rows,fmt,icon){
  var mx=Math.max.apply(null,rows.map(function(r){return Math.abs(r.v);}))||1;
  var neg=rows.some(function(r){return r.v<0;});
  return '<div class="rank"><h4>'+icon+' '+esc(title)+'</h4><span class="cap">'+esc(cap)+'</span>'+
    rows.map(function(r){
      var w=Math.abs(r.v)/mx*100;
      var left=neg?(r.v<0?50-w/2:50):0,wd=neg?w/2:w;
      return '<div class="rrow"><span class="nm" style="color:'+r.col+'">'+esc(r.nm)+'</span>'+
        '<span class="rbar">'+(neg?'<i style="left:50%;width:1.5px;background:var(--ink-3);opacity:.5;border-radius:0"></i>':'')+
        '<i style="left:'+left+'%;width:'+Math.max(wd,1.5)+'%;background:'+r.col+'"></i></span>'+
        '<span class="rval">'+fmt(r.v)+'</span></div>';}).join('')+'</div>';}
/* ================= FILTROS ================= */
function selSet(){return S.selS.size?S.selS:new Set(SET.map(function(s){return s.id;}));}
function coordFor(c){
  var ss=selSet(),ps=props().filter(function(p){return p.sq===c.sq&&ss.has(p.setor);});
  if(!ps.length)return null;
  var tw=ps.reduce(function(a,p){return a+p.w;},0);
  return {e:ps.reduce(function(a,p){return a+p.e*p.w;},0)/tw,
          s:ps.reduce(function(a,p){return a+p.s*p.w;},0)/tw,n:ps.length};
}
function filtChips(){
  var CC=cands();
  var allC=S.selC.size===CC.length,allS=S.selS.size===SET.length;
  var cch=CC.map(function(c){var on=S.selC.has(c.sq);
    return '<button class="chip" data-cs="'+c.sq+'" aria-pressed="'+on+'"'+
      (on?' style="background:'+pc(c)+'"':'')+'>'+mark(c,15)+esc(c.nome)+'</button>';}).join('');
  var sch=SET.map(function(s){var on=S.selS.has(s.id);
    return '<button class="chip" data-ss="'+s.id+'" aria-pressed="'+on+'"'+
      (on?' style="background:'+sc(s.id)+'"':'')+'><span class="sw" style="background:'+sc(s.id)+'"></span>'+
      s.ic+' '+esc(s.nome)+'</button>';}).join('');
  return '<div class="filtbox">'+
    '<div class="fline"><div class="fhd"><span class="flab">Candidatos</span>'+
      '<span class="fcount mn">'+S.selC.size+'/'+CC.length+'</span>'+
      '<span class="ftog"><button class="tgb'+(allC?' on':'')+'" data-call="c">Todos</button>'+
      '<button class="tgb'+(!S.selC.size?' on':'')+'" data-cnone="c">Nenhum</button></span></div>'+
      '<div class="chips">'+cch+'</div></div>'+
    '<div class="fline"><div class="fhd"><span class="flab">Temas</span>'+
      '<span class="fcount mn">'+S.selS.size+'/'+SET.length+'</span>'+
      '<span class="ftog"><button class="tgb'+(allS?' on':'')+'" data-call="s">Todos</button>'+
      '<button class="tgb'+(!S.selS.size?' on':'')+'" data-cnone="s">Nenhum</button></span></div>'+
      '<div class="chips">'+sch+'</div></div></div>';
}
function bindFilt(el,redraw){
  el.querySelectorAll('[data-cs]').forEach(function(b){b.onclick=function(){
    var k=b.dataset.cs; S.selC.has(k)?S.selC.delete(k):S.selC.add(k); redraw();};});
  el.querySelectorAll('[data-ss]').forEach(function(b){b.onclick=function(){
    var k=b.dataset.ss; S.selS.has(k)?S.selS.delete(k):S.selS.add(k); redraw();};});
  el.querySelectorAll('[data-call]').forEach(function(b){b.onclick=function(){
    if(b.dataset.call==='c')cands().forEach(function(c){S.selC.add(c.sq);});
    else SET.forEach(function(s){S.selS.add(s.id);}); redraw();};});
  el.querySelectorAll('[data-cnone]').forEach(function(b){b.onclick=function(){
    if(b.dataset.cnone==='c')S.selC.clear(); else S.selS.clear(); redraw();};});
}
/* ================= MATRIZ ================= */
function drawMatriz(){
  var el=document.getElementById('v-matriz');
  var gr='<div class="chips" style="margin-bottom:14px">'+
    ['cand','prop'].map(function(g){var on=S.gran===g;
      return '<button class="chip" data-gran="'+g+'" aria-pressed="'+on+'"'+
        (on?' style="background:var(--accent-2);border-color:var(--accent-2)"':'')+'>'+
        (g==='cand'?'◍ Média por candidato':'∴ Cada proposta')+'</button>';}).join('')+'</div>';
  el.innerHTML='<section><div class="sechead"><h2>Matriz ideológica</h2>'+
    '<span class="pill-n">'+(S.esf==='br'?'Presidência':'Distrito Federal')+'</span></div>'+
    '<p class="lead">Horizontal: <b style="color:var(--pole-a)">Estado e redistribuição</b> ↔ <b style="color:var(--pole-b)">mercado e iniciativa privada</b>. '+
    'Vertical: <b style="color:var(--pole-a)">progressista e libertário</b> ↔ <b style="color:var(--pole-b)">conservador e de autoridade</b>. '+
    'Cada candidato tem cor e forma próprias. Ligue e desligue candidatos e temas — a média é recalculada só com o que estiver ligado.</p>'+
    filtChips()+gr+
    '<div class="plotwrap"><svg class="plot" id="svg" viewBox="0 0 860 700" role="img" aria-label="Matriz ideológica"></svg>'+
    '<div class="legend" id="lg"></div></div><div id="drill"></div></section>';
  bindFilt(el,drawMatriz);
  el.querySelectorAll('[data-gran]').forEach(function(b){b.onclick=function(){S.gran=b.dataset.gran;drawMatriz();};});
  plot();
}
/* nome curto para o gráfico: tira pronome de tratamento e limita a 2 palavras */
var HON={ESCRITOR:1,DR:1,'DR.':1,DRA:1,'DRA.':1,PROFESSOR:1,PROFESSORA:1,PROF:1,'PROF.':1,
  DELEGADO:1,DELEGADA:1,SARGENTO:1,CORONEL:1,CAPITAO:1,PASTOR:1,PADRE:1,SENADOR:1,DEPUTADO:1,GOVERNADOR:1};
function curto(c){
  var w=c.nome.split(/\s+/).filter(function(x){return !HON[x.toUpperCase()];});
  if(w.length>2)w=w.slice(0,2);
  return w.join(' ')||c.nome;
}
function twd(t,f){return t.length*f;}
function plot(){
  var svg=document.getElementById('svg'),W=860,H=700,m={l:96,r:58,t:52,b:84};
  var pw=W-m.l-m.r,ph=H-m.t-m.b;
  var CC=cands().filter(function(c){return S.selC.has(c.sq);});
  var ss=selSet();
  var PP=props().filter(function(p){return S.selC.has(p.sq)&&ss.has(p.setor);});
  var DOM=2.35,TICKS=[-2,-1,1,2];
  if(S.gran==='cand'){
    var mx=0;CC.forEach(function(c){var q=coordFor(c);if(q)mx=Math.max(mx,Math.abs(q.e),Math.abs(q.s));});
    DOM=Math.max(0.55,mx*1.30);
    var step=DOM>1.7?0.5:DOM>0.9?0.25:0.1;TICKS=[];
    for(var k=-Math.floor(DOM/step);k<=Math.floor(DOM/step);k++)if(k)TICKS.push(+(k*step).toFixed(2));
  }
  var X=function(v){return m.l+(v+DOM)/(2*DOM)*pw;},Y=function(v){return m.t+(DOM-v)/(2*DOM)*ph;};
  var s='<defs><linearGradient id="qa" x1="0" y1="0" x2="1" y2="1">'+
    '<stop offset="0" stop-color="var(--pole-a)" stop-opacity=".07"/><stop offset="1" stop-color="var(--pole-a)" stop-opacity="0"/></linearGradient>'+
    '<linearGradient id="qb" x1="1" y1="1" x2="0" y2="0">'+
    '<stop offset="0" stop-color="var(--pole-b)" stop-opacity=".07"/><stop offset="1" stop-color="var(--pole-b)" stop-opacity="0"/></linearGradient></defs>';
  s+='<rect x="'+m.l+'" y="'+m.t+'" width="'+(pw/2)+'" height="'+(ph/2)+'" fill="url(#qa)"/>'+
     '<rect x="'+(m.l+pw/2)+'" y="'+(m.t+ph/2)+'" width="'+(pw/2)+'" height="'+(ph/2)+'" fill="url(#qb)"/>';
  TICKS.forEach(function(g){
    s+='<line class="grid-l" x1="'+X(g)+'" y1="'+m.t+'" x2="'+X(g)+'" y2="'+(m.t+ph)+'"/>'+
       '<line class="grid-l" x1="'+m.l+'" y1="'+Y(g)+'" x2="'+(m.l+pw)+'" y2="'+Y(g)+'"/>'+
       '<text class="tick" x="'+X(g)+'" y="'+(m.t+ph+18)+'" text-anchor="middle">'+(g>0?'+':'')+g+'</text>'+
       '<text class="tick" x="'+(m.l-11)+'" y="'+(Y(g)+3.5)+'" text-anchor="end">'+(g>0?'+':'')+g+'</text>';});
  s+='<rect x="'+m.l+'" y="'+m.t+'" width="'+pw+'" height="'+ph+'" fill="none" stroke="var(--rule)" stroke-width="1.5" rx="10"/>'+
     '<line class="axline" x1="'+X(0)+'" y1="'+m.t+'" x2="'+X(0)+'" y2="'+(m.t+ph)+'"/>'+
     '<line class="axline" x1="'+m.l+'" y1="'+Y(0)+'" x2="'+(m.l+pw)+'" y2="'+Y(0)+'"/>';
  /* --- quadrantes: nome da família política + glosa --- */
  var QD=[
    {x:m.l+16,     y:m.t+22,      a:'start', c:'var(--pole-a)', t:'Nacional-estatista',  g:'Estado forte · costumes tradicionais'},
    {x:m.l+pw-16,  y:m.t+22,      a:'end',   c:'var(--pole-b)', t:'Liberal-conservador', g:'Mercado livre · ordem e autoridade'},
    {x:m.l+16,     y:m.t+ph-24,   a:'start', c:'var(--pole-a)', t:'Social-progressista', g:'Estado forte · liberdades e direitos'},
    {x:m.l+pw-16,  y:m.t+ph-24,   a:'end',   c:'var(--pole-b)', t:'Liberal-libertário',  g:'Mercado livre · liberdades e direitos'}];
  QD.forEach(function(q){
    var w=twd(q.t,7.6)+22,x0=q.a==='start'?q.x-9:q.x-w+9;
    s+='<rect class="quadchip" x="'+x0.toFixed(1)+'" y="'+(q.y-15)+'" width="'+w.toFixed(1)+'" height="21" rx="6" fill="'+q.c+'" fill-opacity=".1"/>'+
       '<text class="quad" x="'+q.x+'" y="'+q.y+'" text-anchor="'+q.a+'" fill="'+q.c+'">'+q.t+'</text>'+
       '<text class="quadsub" x="'+q.x+'" y="'+(q.y+14)+'" text-anchor="'+q.a+'">'+q.g+'</text>';});
  /* --- eixos: números em uma coluna, rótulo em outra --- */
  var yl=m.l-54;
  s+='<text class="axlab" x="'+m.l+'" y="'+(m.t+ph+49)+'" fill="var(--pole-a)">← Estado · redistribuição</text>'+
     '<text class="axlab" x="'+(m.l+pw)+'" y="'+(m.t+ph+49)+'" text-anchor="end" fill="var(--pole-b)">Mercado · iniciativa privada →</text>'+
     '<text class="axlab" x="'+yl+'" y="'+(m.t+2)+'" text-anchor="end" fill="var(--pole-b)" transform="rotate(-90 '+yl+' '+(m.t+2)+')">Conservador · autoridade →</text>'+
     '<text class="axlab" x="'+yl+'" y="'+(m.t+ph)+'" text-anchor="start" fill="var(--pole-a)" transform="rotate(-90 '+yl+' '+(m.t+ph)+')">← Progressista · libertário</text>';
  var lg='';
  if(!CC.length||!ss.size){
    s+='<text x="'+(m.l+pw/2)+'" y="'+(m.t+ph/2)+'" text-anchor="middle" class="axlab" fill="var(--ink-3)">Ligue ao menos um candidato e um tema</text>';
    svg.innerHTML=s;document.getElementById('lg').innerHTML='';return;}
  if(S.gran==='prop'){
    var jit=function(i){return((i*2654435761)%997/997-0.5)*0.42;};
    PP.forEach(function(p,i){
      var c=byId[p.sq],r=3.4+p.w*1.1;
      var x=X(p.e+jit(i)),y=Y(p.s+jit(i*3+11));
      s+=shape(c.forma,+x.toFixed(1),+y.toFixed(1),r)+' class="pdot" fill="'+pc(c)+'" fill-opacity=".82" '+
         'stroke="var(--ink)" stroke-opacity=".3" stroke-width="1" data-pid="'+p.id+'"/>';});
    lg=CC.map(function(c){return '<span class="lgi">'+mark(c,15)+esc(c.nome)+'</span>';}).join('')+
      '<span class="lgi">tamanho do ponto = peso estrutural</span>'+
      '<span class="lgi">'+PP.length+' propostas visíveis</span>';
  }else{
    var pts=[];
    CC.forEach(function(c){var q=coordFor(c);if(q)pts.push({c:c,q:q,x:X(q.e),y:Y(q.s)});});
    /* rótulo colado no ícone, com busca de posição livre em volta */
    var R=13,MK=pts.map(function(o){return {x0:o.x-R-3,x1:o.x+R+3,y0:o.y-R-3,y1:o.y+R+3};});
    var BX={x0:8,x1:W-8,y0:m.t-18,y1:H-10};
    var POS=[{dx:R+7,dy:1,a:'start'},{dx:-R-7,dy:1,a:'end'},
             {dx:R+4,dy:-21,a:'start'},{dx:R+4,dy:23,a:'start'},
             {dx:-R-4,dy:-21,a:'end'},{dx:-R-4,dy:23,a:'end'},
             {dx:0,dy:-R-19,a:'middle'},{dx:0,dy:R+33,a:'middle'},
             {dx:30,dy:-38,a:'start'},{dx:-30,dy:-38,a:'end'},
             {dx:30,dy:42,a:'start'},{dx:-30,dy:42,a:'end'},
             {dx:48,dy:-60,a:'start'},{dx:-48,dy:-60,a:'end'},
             {dx:48,dy:64,a:'start'},{dx:-48,dy:64,a:'end'}];
    function ov(a,b){var w=Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0),h=Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0);
      return w>0&&h>0?w*h:0;}
    function fora(b){return Math.max(0,BX.x0-b.x0)+Math.max(0,b.x1-BX.x1)+
                            Math.max(0,BX.y0-b.y0)+Math.max(0,b.y1-BX.y1);}
    var dens=function(o){return pts.filter(function(u){return u!==o&&Math.abs(u.x-o.x)<110&&Math.abs(u.y-o.y)<70;}).length;};
    var posto=[];
    pts.slice().sort(function(a,b){return dens(b)-dens(a)||a.y-b.y;}).forEach(function(o){
      o.nm=curto(o.c); o.sub=o.c.partido+' · '+o.q.n+' prop.';
      var w=Math.max(twd(o.nm,7.9),twd(o.sub,5.8)),best=null;
      POS.forEach(function(P,i){
        var cx=o.x+P.dx,cy=o.y+P.dy;
        var x0=P.a==='start'?cx:(P.a==='end'?cx-w:cx-w/2);
        var b={x0:x0,x1:x0+w,y0:cy-13,y1:cy+15},sc=i*2.4+fora(b)*9;
        MK.forEach(function(k){sc+=ov(b,k)/55;});
        posto.forEach(function(k){sc+=ov(b,k)/26;});
        if(!best||sc<best.sc)best={sc:sc,b:b,x:cx,y:cy,a:P.a,d:Math.abs(P.dx)+Math.abs(P.dy)};
      });
      posto.push(best.b);o.L=best;});
    pts.forEach(function(o){                       /* guia curta quando o rótulo se afasta */
      if(o.L.d>44)s+='<line x1="'+o.x.toFixed(1)+'" y1="'+o.y.toFixed(1)+'" x2="'+o.L.x.toFixed(1)+
        '" y2="'+(o.L.y-3).toFixed(1)+'" stroke="'+pc(o.c)+'" stroke-width="1.2" stroke-opacity=".45"/>';});
    pts.forEach(function(o){
      s+=shape(o.c.forma,o.x,o.y,R)+' class="pdot" fill="'+pc(o.c)+
         '" stroke="var(--surface)" stroke-width="2.5" data-sq="'+o.c.sq+'"/>'+
         shape(o.c.forma,o.x,o.y,R)+' fill="none" stroke="var(--ink)" stroke-opacity=".22" stroke-width="1" pointer-events="none"/>';});
    pts.forEach(function(o){
      s+='<text class="dotlab" x="'+o.L.x.toFixed(1)+'" y="'+o.L.y.toFixed(1)+'" text-anchor="'+o.L.a+
         '" fill="'+pc(o.c)+'">'+esc(o.nm)+'</text>'+
         '<text class="dotlab s2" x="'+o.L.x.toFixed(1)+'" y="'+(o.L.y+12).toFixed(1)+'" text-anchor="'+o.L.a+'">'+esc(o.sub)+'</text>';});
    lg=CC.map(function(c){return '<span class="lgi">'+mark(c,15)+esc(c.partido)+'</span>';}).join('')+
      '<span class="lgi">escala −'+DOM.toFixed(2)+' a +'+DOM.toFixed(2)+'</span>'+
      '<span class="lgi">'+(S.selS.size===SET.length?'todos os temas':S.selS.size+' de '+SET.length+' temas')+'</span>';
  }
  svg.innerHTML=s;document.getElementById('lg').innerHTML=lg;
  svg.querySelectorAll('.pdot').forEach(function(d){
    d.addEventListener('mousemove',function(ev){
      if(d.dataset.sq){var c=byId[d.dataset.sq],q=coordFor(c);
        showTip('<span class="tt" style="color:'+pc(c)+'">'+esc(c.nome)+'</span><span class="tm">'+esc(c.partido)+' · '+q.n+' propostas</span>'+
          '<div class="mn" style="font-size:12.5px;margin-top:6px">econ '+f1(q.e)+' · social '+f1(q.s)+'</div>',ev);
      }else{var p=PP.filter(function(x){return x.id===d.dataset.pid;})[0],cc=byId[p.sq],v=VT[p.vt];
        showTip('<span class="tt">'+esc(p.t)+'</span><span class="tm" style="color:'+sc(p.setor)+'">'+setById[p.setor].ic+' '+esc(setById[p.setor].nome)+'</span>'+
          '<div class="mn" style="font-size:12px;margin-top:5px;color:'+pc(cc)+'">'+esc(cc.nome)+'</div>'+
          '<div class="mn" style="font-size:12px;margin-top:3px">econ '+(p.e>0?'+':'')+p.e+' · social '+(p.s>0?'+':'')+p.s+
          ' · <span style="color:'+v[1]+'">'+v[0]+'</span></div>',ev);}});
    d.addEventListener('mouseleave',hideTip);
    d.addEventListener('click',function(){
      if(d.dataset.sq){S.cand=d.dataset.sq;go('cands');}
      else{var p=PP.filter(function(x){return x.id===d.dataset.pid;})[0];
        var dr=document.getElementById('drill');
        dr.innerHTML='<div class="sechead" style="margin-top:26px"><h3>Proposta selecionada</h3></div>'+ficha(p,true);
        var f=dr.querySelector('.fhead');f.click();f.scrollIntoView({behavior:'smooth',block:'center'});}});
  });
}
/* ================= CANDIDATOS ================= */
function rankSpectrum(title,cap,rows,esq,dir,icon){
  var mx=Math.max.apply(null,rows.map(function(r){return Math.abs(r.v);}))||1;
  return '<div class="rank"><h4>'+icon+' '+esc(title)+'</h4><span class="cap">'+esc(cap)+'</span>'+
    '<div class="axends"><span style="color:var(--pole-a)">◀ '+esc(esq)+'</span><span style="color:var(--pole-b)">'+esc(dir)+' ▶</span></div>'+
    rows.map(function(r){
      var w=Math.abs(r.v)/mx*46;
      var left=r.v<0?50-w:50;
      return '<div class="rrow"><span class="nm" style="color:'+r.col+'">'+esc(r.nm)+'</span>'+
        '<span class="rbar"><i style="left:50%;width:1.5px;background:var(--ink-3);opacity:.55;border-radius:0"></i>'+
        '<i style="left:'+left+'%;width:'+Math.max(w,1.5)+'%;background:'+r.col+'"></i></span>'+
        '<span class="rval" style="color:'+(r.v<0?'var(--pole-a)':'var(--pole-b)')+'">'+f1(r.v)+'</span></div>';}).join('')+'</div>';
}
function vtBars(CC){
  var K=Object.keys(VT);
  var rows=CC.map(function(c){
    var v=c.vts||{},tot=K.reduce(function(a,k){return a+(v[k]||0);},0)||1;
    return {c:c,tot:tot,seg:K.map(function(k){return {k:k,n:v[k]||0,p:(v[k]||0)/tot*100};})};
  }).sort(function(a,b){
    var f=function(o){var g=function(k){return (o.seg.filter(function(x){return x.k===k;})[0]||{p:0}).p;};
      return g('forte')+g('promissora');};
    return f(b)-f(a);});
  return '<div class="rank wide"><h4>🧪 Que tipo de proposta cada um faz</h4>'+
    '<span class="cap">Distribuição do veredito editorial sobre o histórico de cada proposta — % do plano de cada candidato</span>'+
    '<div class="legend" style="margin:2px 0 12px">'+K.map(function(k){
      return '<span class="lgi"><b style="width:9px;height:9px;border-radius:3px;background:'+VT[k][1]+
        ';display:inline-block"></b>'+VT[k][0]+'</span>';}).join('')+'</div>'+
    rows.map(function(r){
      var acc=0;
      return '<div class="rrow stk"><span class="nm" style="color:'+pc(r.c)+'">'+esc(curto(r.c))+'</span>'+
        '<span class="rbar stk">'+r.seg.map(function(g){
          if(g.p<=0)return '';
          var left=acc;acc+=g.p;
          return '<i class="sg" style="left:'+left.toFixed(2)+'%;width:'+g.p.toFixed(2)+'%;background:'+VT[g.k][1]+
            '" data-vtt="'+esc(VT[g.k][0])+' — '+g.n+' de '+r.tot+' ('+Math.round(g.p)+'%)"></i>'+
            (g.p>=11?'<u style="left:'+(left+g.p/2).toFixed(2)+'%">'+Math.round(g.p)+'%</u>':'');
        }).join('')+'</span>'+
        '<span class="rval mn">'+r.tot+'</span></div>';}).join('')+'</div>';
}
function bindVtBars(el){
  el.querySelectorAll('.sg[data-vtt]').forEach(function(i){
    i.addEventListener('mousemove',function(ev){showTip('<span class="tt">'+i.dataset.vtt+'</span>',ev);});
    i.addEventListener('mouseleave',hideTip);});
}
function drawCands(){
  var el=document.getElementById('v-cands'),CC=cands();
  if(!S.cand){
    var mk=function(arr,key){return arr.map(function(c){return{nm:c.nome,v:c[key],col:pc(c)};});};
    var byAge=CC.slice().sort(function(a,b){return b.idadePosse-a.idadePosse;});
    var byBens=CC.slice().sort(function(a,b){return b.totalBens-a.totalBens;});
    var byE=CC.slice().sort(function(a,b){return a.econ-b.econ;});
    var byS=CC.slice().sort(function(a,b){return a.social-b.social;});
    el.innerHTML='<section><div class="sechead"><h2>Quem são</h2>'+
      '<span class="pill-n">'+CC.length+' candidaturas</span></div>'+
      '<p class="lead">Clique num cartão para ver o plano inteiro, proposta por proposta. Cada candidato tem uma <b>cor</b> e uma <b>forma</b> que o acompanham em todos os gráficos.</p>'+
      '<div class="grid g3">'+CC.map(function(c){
        return '<button class="ccard" data-sq="'+c.sq+'"><div class="top" style="background:'+pc(c)+'"></div>'+
        '<div class="cw">'+foto(c,'lg')+'<div class="ci"><h3>'+esc(c.nome)+'</h3>'+
        '<div class="sub">'+esc(c.partido)+' · nº '+esc(c.numero)+'</div>'+
        '<div class="sub" style="margin-top:5px;color:var(--ink-3)">'+c.n+' propostas</div></div>'+
        '<span class="badge">'+mark(c,20)+'</span></div></button>';}).join('')+'</div></section>'+
      '<section><div class="sechead"><h2>Como se comparam</h2></div>'+
      '<div class="g2sym">'+
      rankSpectrum('Posição econômica','Média ponderada pelo peso das propostas',mk(byE,'econ'),'Estado, redistribuição','Mercado, iniciativa privada','📊')+
      rankSpectrum('Posição social','Média ponderada pelo peso das propostas',mk(byS,'social'),'Progressista, libertário','Conservador, autoridade','⚖')+
      rankChart('Idade ao assumir o cargo','Em 1º de janeiro de 2027',mk(byAge,'idadePosse'),function(v){return v+' anos';},'🎂')+
      rankChart('Bens declarados ao TSE','Soma dos bens informados no registro',mk(byBens,'totalBens'),brl,'💰')+
      '</div>'+vtBars(CC)+'</section>';
    el.querySelectorAll('[data-sq]').forEach(function(b){b.onclick=function(){S.cand=b.dataset.sq;drawCands();scrollTo(0,0);};});
    bindVtBars(el);
    return;
  }
  var c=byId[S.cand],mine=props().filter(function(p){return p.sq===c.sq;});
  var G={};mine.forEach(function(p){(G[p.setor]=G[p.setor]||[]).push(p);});
  var order=SET.map(function(s){return s.id;}).filter(function(i){return G[i];});
  var vt=c.vts||{};
  var vtrow=Object.keys(VT).filter(function(k){return vt[k];}).map(function(k){
    return '<span class="lgi" style="border-color:'+VT[k][1]+'"><b style="width:9px;height:9px;border-radius:50%;background:'+
      VT[k][1]+';display:inline-block"></b>'+VT[k][0]+' <b class="mn">'+vt[k]+'</b></span>;'.replace(';','');}).join('');
  var jud=c.jud&&c.jud.length;
  el.innerHTML='<button class="backlink" id="bk">← todos os candidatos</button>'+
   '<section><div class="sechead">'+foto(c,'lg')+'<h2 style="color:'+pc(c)+'">'+esc(c.nome)+'</h2>'+mark(c,22)+
   '<span class="pill-n">'+esc(c.partido)+' · nº '+esc(c.numero)+'</span>'+
   (jud?'<span class="pill-n" style="background:var(--v-falh);color:#fff">⚖ tem ficha judicial</span>':'')+'</div>'+
   '<div class="stat-strip">'+
     '<div class="st"><b>'+c.n+'</b><span>Propostas</span></div>'+
     '<div class="st"><b>'+c.idadePosse+'</b><span>Anos na posse</span></div>'+
     '<div class="st"><b style="color:'+(c.econ<0?'var(--pole-a)':'var(--pole-b)')+'">'+f1(c.econ)+'</b><span>Eixo econômico</span></div>'+
     '<div class="st"><b style="color:'+(c.social<0?'var(--pole-a)':'var(--pole-b)')+'">'+f1(c.social)+'</b><span>Eixo social</span></div>'+
     '<div class="st"><b style="font-size:18px">'+brl(c.totalBens)+'</b><span>Bens declarados</span></div>'+
   '</div>'+
   '<p class="lead">'+esc(c.resumoDoc)+'</p>'+
   (c.alertaDoc?'<div class="note warn"><b>⚠ Sobre o documento</b>'+esc(c.alertaDoc)+'</div>':'')+
   '<div class="legend" style="margin:6px 0 18px">'+vtrow+'</div>'+
   '<div class="tblwrap"><table class="tbl"><tbody>'+
   '<tr><th>Nome completo</th><td>'+esc(c.nomeCompleto)+'</td><th>Coligação</th><td>'+esc(c.coligacao||c.partido)+'</td></tr>'+
   '<tr><th>Nascimento</th><td class="mn">'+esc(c.nasc)+' · '+esc(c.ufNasc)+' — <b>'+c.idadePosse+' anos</b> ao assumir</td>'+
   '<th>Ocupação declarada</th><td>'+esc(c.ocupacao)+'</td></tr>'+
   '<tr><th>Instrução</th><td>'+esc(c.instrucao)+'</td><th>Gênero · cor declarada</th><td>'+esc(c.genero)+' · '+esc(c.raca)+'</td></tr>'+
   '<tr><th>Bens declarados</th><td class="mn">'+brl(c.totalBens)+' em '+c.nBens+' itens</td>'+
   '<th>Documento no TSE</th><td class="mn">'+esc(c.doc)+'</td></tr>'+
   '</tbody></table></div>'+
   (c.bens&&c.bens.length?'<div class="sechead" style="margin-top:22px"><h3>💰 Maiores bens declarados</h3></div>'+
     '<div class="tblwrap"><table class="tbl"><tbody>'+c.bens.map(function(b){
       return '<tr><th style="width:170px">'+esc(b.t)+'</th><td>'+esc(b.d)+'</td><td class="mn" style="text-align:right;white-space:nowrap">'+brl(b.v||0)+'</td></tr>';}).join('')+'</tbody></table></div>':'')+
   '</section>'+
   order.map(function(id){var s=setById[id];
     return '<section><div class="sechead"><span class="tagsec" style="background:'+sc(id)+';font-size:12px;padding:5px 12px">'+s.ic+' '+esc(s.nome)+'</span>'+
       '<span class="pill-n">'+G[id].length+' propostas</span></div>'+
       G[id].map(function(p){return ficha(p,false);}).join('')+'</section>';}).join('');
  document.getElementById('bk').onclick=function(){S.cand=null;drawCands();scrollTo(0,0);};
}
/* ================= TEMAS ================= */
function drawTemas(){
  var el=document.getElementById('v-temas'),PP=props();
  var t=S.tema||SET[0].id;
  var chips=SET.map(function(s){
    var n=PP.filter(function(p){return p.setor===s.id;}).length,on=t===s.id;
    return '<button class="chip" data-t="'+s.id+'" aria-pressed="'+on+'"'+(on?' style="background:'+sc(s.id)+'"':'')+
      '><span class="sw" style="background:'+sc(s.id)+'"></span>'+s.ic+' '+esc(s.nome)+' <b class="mn">'+n+'</b></button>';}).join('');
  var s=setById[t],list=PP.filter(function(p){return p.setor===t;});
  var byC={};list.forEach(function(p){(byC[p.sq]=byC[p.sq]||[]).push(p);});
  var ord=cands().filter(function(c){return byC[c.sq];});
  el.innerHTML='<section><div class="sechead"><h2>Propostas por tema</h2><span class="pill-n">'+PP.length+' no total</span></div>'+
    '<div class="chips">'+chips+'</div>'+
    '<div class="note info" style="border-color:'+sc(t)+'"><b style="color:'+sc(t)+'">'+s.ic+' '+esc(s.nome)+'</b>'+esc(s.desc)+'</div></section>'+
    ord.map(function(c){var sd=c.setores[t];
      return '<section><div class="sechead">'+foto(c,'tn')+'<h3 style="color:'+pc(c)+'">'+esc(c.nome)+'</h3>'+
      '<span class="pill-n">'+esc(c.partido)+' · '+byC[c.sq].length+' propostas</span>'+
      (sd?'<span class="pill-n mn">econ '+f1(sd.econ)+' · social '+f1(sd.social)+'</span>':'')+'</div>'+
      byC[c.sq].map(function(p){return ficha(p,false);}).join('')+'</section>';}).join('');
  el.querySelectorAll('[data-t]').forEach(function(b){b.onclick=function(){S.tema=b.dataset.t;drawTemas();scrollTo(0,0);};});
}
/* ================= POLÊMICAS ================= */
function drawPolem(){
  var el=document.getElementById('v-polem'),T=TOP[S.esf]||[];
  if(S.topico===null){
    el.innerHTML='<section><div class="sechead"><h2>⚡ Onde eles divergem</h2></div>'+
      '<p class="lead">Temas em que a diferença entre os planos é grande — ou em que a proposta é polêmica por natureza. Clique para ver, lado a lado, o que cada candidato escreveu.</p>'+
      '<div class="topics">'+T.map(function(tp,i){
        return '<button class="topic" data-i="'+i+'"><span class="em">'+tp.ic+'</span>'+
          '<h4>'+esc(tp.nome)+'</h4><span class="n">'+tp.n+' propostas · '+tp.nc+' de '+cands().length+' candidatos</span></button>';}).join('')+
      '</div></section>';
    el.querySelectorAll('[data-i]').forEach(function(b){b.onclick=function(){S.topico=+b.dataset.i;drawPolem();scrollTo(0,0);};});
    return;
  }
  var tp=T[S.topico],ids={};tp.ids.forEach(function(i){ids[i]=1;});
  var list=props().filter(function(p){return ids[p.id];});
  var byC={};list.forEach(function(p){(byC[p.sq]=byC[p.sq]||[]).push(p);});
  el.innerHTML='<button class="backlink" id="bk2">← todas as polêmicas</button>'+
    '<section><div class="sechead"><h2>'+tp.ic+' '+esc(tp.nome)+'</h2><span class="pill-n">'+list.length+' propostas</span></div></section>'+
    cands().map(function(c){
      if(!byC[c.sq])return '<section><div class="sechead">'+foto(c,'tn')+'<h3 style="color:'+pc(c)+'">'+esc(c.nome)+'</h3>'+
        '<span class="pill-n">'+esc(c.partido)+'</span></div>'+
        '<div class="note info">Nenhuma proposta deste plano trata do tema.</div></section>';
      return '<section><div class="sechead">'+foto(c,'tn')+'<h3 style="color:'+pc(c)+'">'+esc(c.nome)+'</h3>'+
        '<span class="pill-n">'+esc(c.partido)+' · '+byC[c.sq].length+'</span></div>'+
        byC[c.sq].map(function(p){return ficha(p,false);}).join('')+'</section>';}).join('');
  document.getElementById('bk2').onclick=function(){S.topico=null;drawPolem();scrollTo(0,0);};
}
/* ================= COMPARAR ================= */
function keyOf(p){return (p.sub||'—').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').trim();}
function drawComp(){
  var el=document.getElementById('v-comp');
  var CC=cands().filter(function(c){return S.selC.has(c.sq);});
  var ss=selSet();
  el.innerHTML='<section><div class="sechead"><h2>⇄ Comparar lado a lado</h2>'+
    '<span class="pill-n">'+CC.length+' candidato'+(CC.length===1?'':'s')+'</span></div>'+
    '<p class="lead">Cada linha é um assunto; cada coluna, um candidato. Quando dois planos tratam do <b>mesmo assunto</b>, as propostas aparecem lado a lado na mesma linha. Clique numa proposta para abrir a ficha inteira.</p>'+
    '<div class="chips" style="margin-bottom:12px">'+
      '<button class="chip" data-only="1" aria-pressed="'+S.soCom+'"'+(S.soCom?' style="background:var(--accent-2);border-color:var(--accent-2)"':'')+
      '>⇄ Só assuntos em que mais de um propõe</button></div>'+
    filtChips()+'<div id="cmpout"></div></section>';
  bindFilt(el,drawComp);
  var ob=el.querySelector('[data-only]');
  if(ob)ob.onclick=function(){S.soCom=!S.soCom;drawComp();};
  var out=document.getElementById('cmpout');
  if(!CC.length||!ss.size){out.innerHTML='<p class="empty">Ligue ao menos um candidato e um tema acima.</p>';return;}
  var cols='240px repeat('+CC.length+',minmax(215px,1fr))';
  var html='',any=false;
  SET.filter(function(s){return ss.has(s.id);}).forEach(function(s){
    var here=props().filter(function(p){return p.setor===s.id&&S.selC.has(p.sq);});
    if(!here.length)return;
    var keys={};
    here.forEach(function(p){var k=keyOf(p);(keys[k]=keys[k]||{lab:p.sub||'Outros',cand:{}});
      (keys[k].cand[p.sq]=keys[k].cand[p.sq]||[]).push(p);});
    var rows=Object.keys(keys).map(function(k){
      return {k:k,lab:keys[k].lab,cand:keys[k].cand,nc:Object.keys(keys[k].cand).length,
              n:Object.keys(keys[k].cand).reduce(function(a,q){return a+keys[k].cand[q].length;},0)};});
    if(S.soCom) rows=rows.filter(function(r){return r.nc>1;});
    if(!rows.length)return;
    any=true;
    rows.sort(function(a,b){return b.nc-a.nc||a.lab.localeCompare(b.lab);});
    html+='<div class="cmpwrap"><div class="cmptable" style="grid-template-columns:'+cols+'">'+
      '<div class="cmpsecrow"><span class="tagsec" style="background:'+sc(s.id)+'">'+s.ic+' '+esc(s.nome)+'</span>'+
        '<span class="pill-n">'+rows.length+' assunto'+(rows.length===1?'':'s')+'</span></div>'+
      '<div class="cmph rowhead">Assunto</div>'+
      CC.map(function(c){return '<div class="cmph">'+foto(c,'xs')+'<div><b style="color:'+pc(c)+'">'+esc(c.nome)+'</b>'+
        '<span>'+esc(c.partido)+'</span></div></div>';}).join('')+
      rows.map(function(r,ri){
        var rid=s.id+'-'+ri;
        return '<div class="cmpkey"><b>'+esc(r.lab)+'</b><span class="kn">'+r.nc+' de '+CC.length+' propõem</span></div>'+
          CC.map(function(c){
            var mine=r.cand[c.sq]||[];
            if(!mine.length)return '<div class="cmpcell"><div class="cmpnone">não trata</div></div>';
            return '<div class="cmpcell">'+mine.map(function(p){var v=VT[p.vt];
              return '<button class="cmpitem" data-pid="'+p.id+'" data-row="'+rid+'" aria-expanded="false"'+
                ' style="border-left-color:'+v[1]+'">'+
                '<span class="ct">'+esc(p.t)+'</span>'+
                '<span class="cv" style="color:'+v[1]+'">'+v[0]+'</span>'+
                '<span class="cax mn">'+(p.e>0?'+':'')+p.e+' / '+(p.s>0?'+':'')+p.s+'</span></button>';}).join('')+'</div>';}).join('')+
          /* a gaveta é irmã das células e ocupa a largura toda da grade, então
             a ficha abre exatamente sob a linha em que se clicou */
          '<div class="cmpdrill" data-drill="'+rid+'" hidden></div>';
      }).join('')+'</div></div>';
  });
  out.innerHTML=any?html:'<p class="empty">Nenhum assunto em comum entre os candidatos e temas selecionados. Desligue o filtro acima para ver todos.</p>';
  medeCmp();
  out.querySelectorAll('[data-pid]').forEach(function(b){b.onclick=function(){
    var box=out.querySelector('[data-drill="'+b.dataset.row+'"]');
    if(!box)return;
    var mesmo=box.dataset.pid===b.dataset.pid&&!box.hidden;
    /* só os botões desta linha mudam de estado; as outras gavetas ficam como estão */
    out.querySelectorAll('[data-row="'+b.dataset.row+'"]').forEach(function(o){
      o.setAttribute('aria-expanded','false');});
    if(mesmo){box.hidden=true;box.dataset.pid='';return;}
    var p=P.filter(function(x){return x.id===b.dataset.pid;})[0];
    if(!p)return;
    box.dataset.pid=p.id;
    box.innerHTML='<div class="din"><div class="dtop"><h4>Proposta completa</h4>'+
      '<button class="dclose" type="button" aria-label="Fechar a ficha">✕ fechar</button></div>'+
      ficha(p,true)+'</div>';
    var fh=box.querySelector('.fhead');            /* já abre com o texto à vista */
    if(fh){fh.setAttribute('aria-expanded','true');
      var fb=fh.nextElementSibling; if(fb)fb.hidden=false;}
    box.querySelector('.dclose').onclick=function(ev){
      ev.stopPropagation();box.hidden=true;box.dataset.pid='';
      b.setAttribute('aria-expanded','false');b.scrollIntoView({block:'nearest'});};
    box.hidden=false;
    b.setAttribute('aria-expanded','true');
    /* 'nearest' só rola se a ficha tiver ficado fora da tela */
    box.scrollIntoView({behavior:'smooth',block:'nearest',inline:'nearest'});};});
}
/* a gaveta ocupa a largura da grade, que pode ser maior que a tela; --vis diz
   ao conteúdo até onde ele pode crescer sem exigir rolagem horizontal */
function medeCmp(){
  document.querySelectorAll('#cmpout .cmpwrap').forEach(function(w){
    w.style.setProperty('--vis',w.clientWidth+'px');});
}
/* guarda porque chk.js e chk2.js avaliam este arquivo fora do navegador,
   num DOM simulado que não tem addEventListener global */
if(typeof addEventListener==='function')addEventListener('resize',medeCmp);
/* ================= CHANCES ================= */
function dsign(v){if(v==null)return '<span class="dlt eq">—</span>';
  var c=v>0.05?'up':(v<-0.05?'dn':'eq'),a=v>0.05?'▲':(v<-0.05?'▼':'=');
  return '<span class="dlt '+c+'">'+a+' '+(v>0?'+':'')+v.toFixed(1)+'</span>';}
function drawOdds(){
  var el=document.getElementById('v-odds'),O=D.odds[S.esf];
  function bars(rows,key){
    var mx=Math.max.apply(null,rows.map(function(r){return r[key];}))||1;
    return rows.map(function(r){
      var c=r.sq?byId[r.sq]:null,col=c?pc(c):'var(--ink-3)';
      return '<div class="rrow"><span class="nm" style="color:'+col+'">'+(c?'':'· ')+esc(r.curto||r.nome)+'</span>'+
        '<span class="rbar"><i style="width:'+Math.max(r[key]/mx*100,1.2)+'%;background:'+col+'"></i></span>'+
        '<span class="rval">'+r[key].toFixed(1)+'%</span></div>';}).join('');}
  var Q=(S.esf==='br')?D.pesquisas:null;
  var maisNovo=[O.modelo&&O.modelo.atualizado,O.mercado&&O.mercado.atualizado,Q&&Q.atualizado]
    .filter(Boolean).sort().pop();
  var baixado=D.capturado?(dhora(D.capturado)||dbr(D.capturado)):null;
  var h='<section><div class="sechead"><h2>🎲 Chances de vitória</h2>'+
    selo(maisNovo,'dado mais novo')+
    (baixado?'<span class="pill-n">baixado em '+esc(baixado)+'</span>':'')+'</div>'+
    '<div class="note warn"><b>⚠ Isto não é proposta de ninguém</b>Esta aba é a única do site que não vem dos planos registrados no TSE. '+
    'São estimativas de terceiros sobre quem vence, que <b>mudam todo dia</b>. Probabilidade não é previsão: '+
    'um candidato com 3% de chance vence 3 em cada 100 eleições parecidas.</div>'+
    '<div class="sechead" style="margin-top:20px"><h3>🕒 Quando cada número foi atualizado</h3>'+
      '<span class="pill-n">cada fonte anda no próprio ritmo</span></div>'+
    '<p class="lead" style="font-size:15px">Três fontes independentes, três relógios. A data é a do <b>dado na fonte</b>; '+
    'a idade é contada contra o relógio do seu aparelho'+(baixado?', e esta cópia foi baixada em '+esc(baixado):'')+'.</p>'+
    '<div class="updgrid">'+
      cartao('📈','Modelo estatístico',O.modelo.fonte+' · '+O.modelo.npesq,O.modelo.atualizado)+
      (O.mercado?cartao('💵','Mercado de apostas',O.mercado.fonte+' · último pregão',O.mercado.atualizado)
                :'<div class="updc"><div class="uh">💵 Mercado de apostas</div>'+
                 '<span class="us">não existe contrato para o DF</span>'+
                 '<div class="ud" style="font-size:13px;color:var(--ink-3)">—</div></div>')+
      (Q?cartao('📋','Pesquisas nacionais',Q.fonte+' · última divulgação',Q.atualizado):'')+
    '</div>';
  var md=O.deltas,mkd=(O.mercado&&O.mercado.deltas)||null;
  if(md){
    var ds=Object.keys(md).map(function(k){return {k:k,v:md[k]};}).sort(function(a,b){return b.v.agora-a.v.agora;});
    h+='<div class="sechead" style="margin-top:24px"><h3>📊 Como mudou</h3>'+
       '<span class="pill-n">probabilidade de vitória</span>'+selo(O.modelo.atualizado)+'</div>'+
      '<p class="lead" style="font-size:15px">Variação em pontos percentuais contra o dia, a semana e o mês anteriores. '+
      'Duas fontes independentes: o <b>modelo</b> sobre pesquisas e o <b>mercado</b> de apostas.</p>'+
      '<div class="delta-strip">'+ds.map(function(o){
        var d=o.v,c=d.sq?byId[d.sq]:null,col=c?pc(c):'var(--ink-3)';
        var m=mkd?mkd[o.k]:null;
        return '<div class="dcard" style="border-left-color:'+col+'">'+
          '<div class="dn2">'+(c?mark(c,16):'')+'<span style="color:'+col+'">'+esc(o.k)+'</span></div>'+
          '<div class="dv">'+d.agora.toFixed(1)+'%</div>'+
          '<div class="dgrid2"><div><div class="dh">📈 modelo</div>'+
            '<div class="dr"><span><b>dia</b>'+dsign(d.d1)+'</span><span><b>sem</b>'+dsign(d.d7)+'</span><span><b>mês</b>'+dsign(d.d30)+'</span></div></div>'+
          '<div><div class="dh">💵 mercado'+(m?' ('+m.agora.toFixed(1)+'%)':'')+'</div>'+
            (m?'<div class="dr"><span><b>dia</b>'+dsign(m.d1)+'</span><span><b>sem</b>'+dsign(m.d7)+'</span><span><b>mês</b>'+dsign(m.d30)+'</span></div>'
              :'<div class="dr"><span style="color:var(--ink-3);font-size:10.5px">sem histórico</span></div>')+
          '</div></div></div>';}).join('')+'</div>';
  }
  if(O.mercado){
    var mk=O.mercado;
    h+='<div class="sechead" style="margin-top:26px"><h3>💵 Mercado de apostas</h3>'+
      '<span class="pill-n">'+esc(mk.fonte)+'</span><span class="pill-n mn">US$ '+(mk.volume/1e6).toFixed(0)+' mi negociados</span>'+
      selo(mk.atualizado,'último pregão')+'</div>'+
      '<p class="lead">Preço que apostadores reais estão pagando por cada resultado. Com esse volume, o preço incorpora informação rápido — e também reflete quem tem dinheiro para apostar, não o eleitorado.</p>'+
      '<div class="rank">'+bars(mk.linhas,'p')+
      '<span class="cap" style="margin-top:12px;display:block">Fonte: '+esc(mk.fonte)+' · preço de '+dbr(mk.atualizado)+' · “·” marca quem não tem plano neste site</span></div>';
  }
  var mo=O.modelo;
  h+='<div class="sechead" style="margin-top:30px"><h3>📈 Modelo estatístico</h3>'+
    '<span class="pill-n">'+esc(mo.fonte)+'</span><span class="pill-n mn">'+esc(mo.npesq)+'</span>'+
    selo(mo.atualizado)+'</div>'+
    '<p class="lead">Projeção construída a partir de pesquisas agregadas e simulações. Não é uma pesquisa: é um modelo sobre pesquisas.</p>'+
    '<div class="g2sym"><div class="rank"><h4>🏆 Probabilidade de vitória</h4><span class="cap">Em 100 eleições simuladas</span>'+
    bars(mo.linhas,'pwin')+'</div>'+
    '<div class="rank"><h4>🗳 Votos no primeiro turno</h4><span class="cap">Mediana das simulações, votos válidos</span>'+
    mo.linhas.map(function(r){
      var c=r.sq?byId[r.sq]:null,col=c?pc(c):'var(--ink-3)',mx=Math.max.apply(null,mo.linhas.map(function(x){return x.hi;}));
      return '<div class="rrow"><span class="nm" style="color:'+col+'">'+(c?'':'· ')+esc(r.curto||r.nome)+'</span>'+
        '<span class="rbar"><i style="left:'+(r.lo/mx*100)+'%;width:'+Math.max((r.hi-r.lo)/mx*100,1)+'%;background:'+col+';opacity:.28"></i>'+
        '<i style="left:'+(r.r1/mx*100)+'%;width:2.5px;background:'+col+';border-radius:1px"></i></span>'+
        '<span class="rval">'+r.r1.toFixed(1)+'%</span></div>';}).join('')+
    '<span class="cap" style="margin-top:10px;display:block">Barra clara = faixa de 90% · traço = mediana</span></div></div>';
  if(S.esf==='br'&&mo.t2){
    h+='<div class="sechead" style="margin-top:26px"><h3>⚔ Se houver segundo turno</h3></div>'+
      '<div class="tblwrap"><table class="tbl"><thead><tr><th>Adversário de Lula</th><th style="text-align:right">Chance deste 2º turno</th>'+
      '<th style="text-align:right">Votos de Lula</th><th style="text-align:right">Lula vence</th></tr></thead><tbody>'+
      Object.keys(mo.t2).map(function(k){var t=mo.t2[k];
        return '<tr><td><b>'+esc(k)+'</b></td><td class="mn" style="text-align:right">'+t.chance+'%</td>'+
        '<td class="mn" style="text-align:right">'+t.lulaVotos+'%</td>'+
        '<td class="mn" style="text-align:right;color:'+(t.lulaVence>50?'var(--v-forte)':'var(--v-falh)')+'">'+t.lulaVence+'%</td></tr>';}).join('')+
      '</tbody></table></div><p class="lead" style="margin-top:12px">A eleição se decide no primeiro turno em apenas <b>'+mo.t1out+'%</b> das simulações.</p>';
  }
  if(S.esf==='df')h+='<p class="lead" style="margin-top:20px">O modelo aponta segundo turno no DF em <b>'+mo.pRunoff+'%</b> das simulações. Não existe mercado de apostas para o governo do Distrito Federal — só para a Presidência e alguns estados.</p>';
  if(S.esf==='br'&&D.odds.br.hist)h+=histChart();
  if(S.esf==='br'&&O.mercado&&O.mercado.hist)h+=mktChart();
  if(S.esf==='br'&&D.pesquisas)h+=pollsBlock();
  var nv=idade(maisNovo);
  h+='<div class="note info" style="margin-top:26px"><b>Fontes e datas</b>'+
    '<ul style="margin:6px 0 0;padding-left:18px">'+
    (O.mercado?'<li>Mercado: <a href="'+esc(O.mercado.url)+'" target="_blank" rel="noopener">'+esc(O.mercado.fonte)+
      '</a> — preço de '+dlonga(O.mercado.atualizado)+'.</li>':'')+
    '<li>Modelo: <a href="'+esc(mo.url)+'" target="_blank" rel="noopener">'+esc(mo.fonte)+'</a> — rodada de '+
      dlonga(mo.atualizado)+(mo.versao?' ('+esc(mo.versao)+')':'')+'.</li>'+
    (Q?'<li>Pesquisas: <a href="'+esc(Q.url)+'" target="_blank" rel="noopener">'+esc(Q.fonte)+
      '</a> — última divulgação em '+dlonga(Q.atualizado)+'.</li>':'')+
    '</ul>'+
    (baixado?'<span style="display:block;margin-top:8px">Esta cópia foi baixada em <b>'+esc(baixado)+
      '</b>, horário de Brasília. A página não se atualiza sozinha: quem publica precisa rodar '+
      '<span class="mn">site/refresh.py</span> de novo.</span>':'')+
    (nv!=null&&nv>2?'<span style="display:block;margin-top:8px;color:var(--v-risc)"><b>⚠ Este recorte tem '+nv+
      ' dias.</b> Em campanha isso é bastante: pesquisa nova costuma sair todo dia. '+
      'Confira a fonte antes de citar qualquer número daqui.</span>':'')+
    '</div></section>';
  el.innerHTML=h;
  bindHist(); bindMkt(); bindPolls();
}
var HIST_GEO=null;
function histChart(){
  var H=D.odds.br.hist,W=860,Ht=300,m={l:46,r:120,t:18,b:34};
  var pw=W-m.l-m.r,ph=Ht-m.t-m.b;
  var names=Object.keys(H[H.length-1].p);
  var NM={"Lula":"280002542548","Flávio":"280002551544","Renan":"280002540694","Caiado":"280002551932",
          "Zema":"280002539826","Cury":"280002551547"};
  var X=function(i){return m.l+i/(H.length-1)*pw;},Y=function(v){return m.t+(1-v/100)*ph;};
  HIST_GEO={H:H,names:names,NM:NM,m:m,pw:pw,ph:ph,W:W,Ht:Ht};
  var s='';
  [0,25,50,75,100].forEach(function(g){
    s+='<line class="grid-l" x1="'+m.l+'" y1="'+Y(g)+'" x2="'+(m.l+pw)+'" y2="'+Y(g)+'"/>'+
       '<text class="tick" x="'+(m.l-8)+'" y="'+(Y(g)+3.5)+'" text-anchor="end">'+g+'%</text>';});
  var xc=xFronteira(H.map(function(h){return h.d;}),X);
  if(xc!=null)s+=marcaCamp(xc,m.l,m.t,ph);
  var ly=[],rot=[];
  names.forEach(function(n){
    var c=NM[n]?byId[NM[n]]:null,col=c?pc(c):'var(--ink-3)',d='',aberto=false,nPts=0;
    H.forEach(function(h,i){var v=h.p[n];
      if(v==null){aberto=false;return;}                 /* candidato ainda não estava no modelo */
      d+=(aberto?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1);aberto=true;nPts++;});
    if(!d)return;
    s+='<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>';
    var last=H[H.length-1].p[n];
    if(last!=null)rot.push({n:n,col:col,v:last,nPts:nPts});});
  /* rótulos da direita: empilha para não se sobreporem no rodapé do gráfico */
  rot.sort(function(a,b){return b.v-a.v;}).forEach(function(o){
    var y=Y(o.v)+4;
    while(ly.some(function(u){return Math.abs(u-y)<13;}))y+=13;
    ly.push(y);
    s+='<text class="dotlab" x="'+(m.l+pw+8)+'" y="'+y.toFixed(1)+'" fill="'+o.col+'" font-size="12">'+
       esc(o.n)+' '+o.v.toFixed(0)+'%'+(o.nPts<H.length?' *':'')+'</text>';});
  [0,Math.floor(H.length/3),Math.floor(2*H.length/3),H.length-1].forEach(function(i){
    s+='<text class="tick" x="'+X(i)+'" y="'+(m.t+ph+18)+'" text-anchor="middle">'+H[i].d.split('-').reverse().slice(0,2).join('/')+'</text>';});
  s+='<line id="hx" x1="0" y1="'+m.t+'" x2="0" y2="'+(m.t+ph)+'" stroke="var(--ink-3)" stroke-width="1" opacity="0"/>';
  s+='<rect id="hcap" x="'+m.l+'" y="'+m.t+'" width="'+pw+'" height="'+ph+'" fill="transparent" style="cursor:crosshair"/>';
  return '<div class="sechead" style="margin-top:30px"><h3>📉 Como mudou desde abril</h3>'+
    '<span class="pill-n">passe o mouse para ver cada dia</span>'+selo(H[H.length-1].d)+'</div>'+
    '<div class="plotwrap"><svg class="plot" id="histsvg" viewBox="0 0 '+W+' '+Ht+'" role="img" aria-label="Evolução da probabilidade de vitória">'+s+'</svg>'+
    '<div class="legend"><span class="lgi">'+H.length+' medições diárias entre '+dbr(H[0].d)+' e '+dbr(H[H.length-1].d)+'</span>'+
    (rot.some(function(o){return o.nPts<H.length;})
      ?'<span class="lgi">* entrou no modelo depois do começo da série</span>':'')+
    (xc!=null?legCamp():'')+'</div></div>';
}
function bindHist(){
  var g=HIST_GEO,svg=document.getElementById('histsvg');if(!g||!svg)return;
  var cap=document.getElementById('hcap'),line=document.getElementById('hx');
  cap.addEventListener('mousemove',function(ev){
    var r=svg.getBoundingClientRect(),sx=(ev.clientX-r.left)/r.width*g.W;
    var i=Math.round((sx-g.m.l)/g.pw*(g.H.length-1));
    i=Math.max(0,Math.min(g.H.length-1,i));
    var x=g.m.l+i/(g.H.length-1)*g.pw;
    line.setAttribute('x1',x);line.setAttribute('x2',x);line.setAttribute('opacity','.55');
    var h=g.H[i];
    var rows=g.names.map(function(n){var c=g.NM[n]?byId[g.NM[n]]:null,v=h.p[n];
      return '<div style="display:flex;gap:7px;align-items:center;font-size:12.5px'+(v==null?';opacity:.5':'')+
        '"><i style="width:9px;height:9px;border-radius:50%;background:'+
        (c?pc(c):'var(--ink-3)')+';display:inline-block"></i>'+esc(n)+
        '<b class="mn" style="margin-left:auto">'+(v==null?'não estava no modelo':v.toFixed(1)+'%')+'</b></div>';}).join('');
    showTip('<span class="tm">'+dbr(h.d)+'</span> '+tagFase(h.d)+
      '<div style="margin-top:6px;display:flex;flex-direction:column;gap:3px">'+rows+'</div>',ev);
  });
  cap.addEventListener('mouseleave',function(){line.setAttribute('opacity','0');hideTip();});
}
function mtag(m){
  var col={'Presencial':'var(--v-forte)','Telefone':'var(--v-prom)','Internet':'var(--v-risc)','Misto':'var(--v-sem)'}[m]||'var(--v-sem)';
  var ic={'Presencial':'🚶','Telefone':'📞','Internet':'💻','Misto':'🔀'}[m]||'❓';
  return '<span class="mtag" style="color:'+col+';border-color:'+col+'">'+ic+' '+esc(m||'não informado')+'</span>';}
function pollRows(sh,vr){
  /* nome sem número = não estava no cartão daquela pesquisa; some da barra */
  var ks=Object.keys(sh).filter(function(k){return k!=='Indecisos'&&k!=='Outros'&&sh[k]!=null;})
    .sort(function(a,b){return sh[b]-sh[a];});
  var mx=Math.max.apply(null,ks.map(function(k){return sh[k];}))||1;
  var NM={"Lula":"280002542548","Flávio Bolsonaro":"280002551544","Renan Santos":"280002540694",
          "Ronaldo Caiado":"280002551932","Romeu Zema":"280002539826","Augusto Cury":"280002551547"};
  return ks.map(function(k){var c=NM[k]?byId[NM[k]]:null,col=c?pc(c):'var(--ink-3)';
    return '<div class="pbrow"><span class="pn" style="color:'+col+'">'+esc(k)+'</span>'+
      '<span class="pbar"><i style="width:'+Math.max(sh[k]/mx*100,1)+'%;background:'+col+'"></i></span>'+
      '<span class="pbv">'+sh[k].toFixed(1)+'%'+(vr&&vr[k]!=null?dsign(vr[k]):'')+'</span></div>';}).join('');
}
function pollsBlock(){
  var Q=D.pesquisas;
  function bloco(lst,tit,sub,pref){
    var naCamp=lst.filter(function(r){return !pre(r.atual.fim);}).length;
    return '<div class="sechead" style="margin-top:24px"><h3>'+tit+'</h3><span class="pill-n">'+lst.length+' institutos</span>'+
      '<span class="pill-n">'+naCamp+' já mediram na campanha oficial</span></div>'+
      '<p class="lead" style="font-size:15px">'+sub+'</p>'+
      lst.map(function(r,i){var a=r.atual;
        var nPos=(r.hist||[]).filter(function(h){return !pre(h.fim);}).length;
        return '<button class="pollcard" data-poll="'+pref+i+'">'+
          '<div class="pollhead"><h5>'+esc(r.inst)+'</h5>'+mtag(a.m)+tagFase(a.fim)+
          '<span class="pill-n mn" title="fim da coleta">campo até '+dbr(a.fim)+'</span>'+
          (a.div?'<span class="pill-n mn" title="data de divulgação">div. '+dbr(a.div)+'</span>':'')+
          (a.n?'<span class="pill-n mn">n='+a.n+'</span>':'')+
          '<span class="pill-n">'+r.n_hist+' pesquisa'+(r.n_hist===1?'':'s')+
            (nPos?' · '+nPos+' na campanha':'')+'</span>'+
          '<span style="margin-left:auto;font-family:Archivo;font-size:11.5px;font-weight:700;color:var(--accent-2)">ver histórico ▾</span></div>'+
          '<div class="pollbars">'+pollRows(a.s,r.var)+'</div>'+
          '<div class="polldet" hidden>'+
            '<div class="ph2">📉 histórico de '+esc(r.inst)+' — '+r.n_hist+' pesquisa'+(r.n_hist===1?'':'s')+' nacionais</div>'+
            pollHist(r,pref+i)+
          '</div></button>';}).join('');
  }
  return '<div class="sechead" style="margin-top:32px"><h2>📋 Pesquisas nacionais</h2>'+
    '<span class="pill-n">'+esc(Q.fonte)+'</span>'+selo(Q.atualizado,'última divulgação')+'</div>'+
    '<p class="lead">A pesquisa nacional mais recente de cada instituto, do campo mais novo para o mais antigo, com o método de coleta e a variação contra a pesquisa nacional anterior <em>do mesmo instituto</em> — comparar institutos diferentes entre si mede metodologia, não movimento do eleitorado. Clique para abrir todo o histórico.</p>'+
    '<div class="note info"><b>🏁 Antes e depois de '+dbr(CAMP)+'</b>'+
    'A propaganda eleitoral só é permitida a partir de <b>'+dlonga(CAMP)+'</b> (Lei 9.504/97, art. 36), no dia seguinte ao '+
    'prazo de registro das candidaturas. O que foi a campo antes disso mediu uma corrida ainda informal: nem todos os nomes '+
    'estavam confirmados, não havia horário eleitoral e boa parte do eleitorado ainda não tinha ligado a chave. Por isso cada '+
    'pesquisa aparece marcada como <span class="fase pre">pré-campanha</span> ou <span class="fase pos">campanha oficial</span>, '+
    'e nos gráficos a área clara é o período anterior à data. <b>Comparar um número de março com um de agosto mede sobretudo a '+
    'passagem do tempo</b>, não a mudança de opinião de quem já tinha decidido.</div>'+
    bloco(Q.t1,'🗳 Primeiro turno','Intenção de voto estimulada, como divulgada pelo instituto.','a')+
    bloco(Q.t2,'⚔ Segundo turno','Cenário Lula contra Flávio Bolsonaro.','b');
}
function bindPolls(){
  document.querySelectorAll('[data-poll]').forEach(function(b){b.onclick=function(){
    var d=b.querySelector('.polldet'),lab=b.querySelector('.pollhead span:last-child');
    d.hidden=!d.hidden; if(lab)lab.textContent=d.hidden?'ver histórico ▾':'fechar ▴'; if(!d.hidden)bindPP();};});
}
/* ================= MERCADO: histórico de preço ================= */
var MKT_GEO=null;
function mktChart(){
  var Hm=D.odds.br.mercado.hist,DL=D.odds.br.mercado.deltas||{};
  var names=Object.keys(Hm),ds={};
  names.forEach(function(n){Hm[n].pts.forEach(function(q){ds[q.d]=1;});});
  var dates=Object.keys(ds).sort();
  var W=860,Ht=320,m={l:48,r:118,t:18,b:34},pw=W-m.l-m.r,ph=Ht-m.t-m.b;
  var X=function(i){return m.l+i/(dates.length-1)*pw;},Y=function(v){return m.t+(1-v/100)*ph;};
  var idx={};dates.forEach(function(d,i){idx[d]=i;});
  var series=names.map(function(n){
    var c=Hm[n].sq?byId[Hm[n].sq]:null,mp={};
    Hm[n].pts.forEach(function(q){mp[q.d]=q.p;});
    return {n:n,c:c,col:c?pc(c):'var(--ink-3)',mp:mp,last:Hm[n].pts[Hm[n].pts.length-1].p};});
  MKT_GEO={dates:dates,series:series,m:m,pw:pw,W:W};
  var s='';
  [0,25,50,75,100].forEach(function(g){
    s+='<line class="grid-l" x1="'+m.l+'" y1="'+Y(g)+'" x2="'+(m.l+pw)+'" y2="'+Y(g)+'"/>'+
       '<text class="tick" x="'+(m.l-8)+'" y="'+(Y(g)+3.5)+'" text-anchor="end">'+g+'¢</text>';});
  var xc=xFronteira(dates,X);
  if(xc!=null)s+=marcaCamp(xc,m.l,m.t,ph);
  series.forEach(function(o){
    var d='',open=false;
    dates.forEach(function(dt,i){
      var v=o.mp[dt];
      if(v==null){open=false;return;}
      d+=(open?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1);open=true;});
    if(d)s+='<path d="'+d+'" fill="none" stroke="'+o.col+'" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" opacity=".92"/>';});
  var lb=series.slice().sort(function(a,b){return b.last-a.last;}),ly=[];
  lb.forEach(function(o){var y=Y(o.last)+4;
    while(ly.some(function(u){return Math.abs(u-y)<13;}))y+=13;
    ly.push(y);
    s+='<text class="dotlab" x="'+(m.l+pw+8)+'" y="'+y.toFixed(1)+'" fill="'+o.col+'" font-size="12">'+
       esc(o.n)+' '+o.last.toFixed(0)+'¢</text>';});
  [0,Math.floor(dates.length/3),Math.floor(2*dates.length/3),dates.length-1].forEach(function(i){
    s+='<text class="tick" x="'+X(i)+'" y="'+(m.t+ph+18)+'" text-anchor="middle">'+dates[i].split('-').reverse().slice(0,2).join('/')+'</text>';});
  s+='<line id="mx" x1="0" y1="'+m.t+'" x2="0" y2="'+(m.t+ph)+'" stroke="var(--ink-3)" stroke-width="1" opacity="0"/>'+
     '<rect id="mcap" x="'+m.l+'" y="'+m.t+'" width="'+pw+'" height="'+ph+'" fill="transparent" style="cursor:crosshair"/>';
  var cards=names.map(function(n){var o=DL[n];if(!o)return '';
    var c=o.sq?byId[o.sq]:null;
    return '<div class="mkdc"><b style="color:'+(c?pc(c):'var(--ink-3)')+'">'+esc(n)+'</b>'+
      '<span class="big">'+o.agora.toFixed(1)+'¢</span>'+
      '<span class="dl"><span>1d '+dsign(o.d1)+'</span><span>7d '+dsign(o.d7)+'</span><span>30d '+dsign(o.d30)+'</span></span></div>';}).join('');
  return '<div class="sechead" style="margin-top:30px"><h3>💹 Preço no mercado de apostas, dia a dia</h3>'+
    '<span class="pill-n">'+dates.length+' pregões</span>'+selo(dates[dates.length-1],'último pregão')+'</div>'+
    '<p class="lead">Cada contrato paga 100¢ se o candidato vencer, então o preço é lido direto como probabilidade. Abaixo, a variação em 1 dia, 7 dias e 30 dias.</p>'+
    '<div class="mkd">'+cards+'</div>'+
    '<div class="plotwrap"><svg class="plot" id="mktsvg" viewBox="0 0 '+W+' '+Ht+'" role="img" aria-label="Histórico de preço no mercado de apostas">'+s+'</svg>'+
    '<div class="legend"><span class="lgi">'+dbr(dates[0])+' a '+dbr(dates[dates.length-1])+
    '</span><span class="lgi">linha começa quando o contrato passou a ser negociado</span>'+
    (xc!=null?legCamp():'')+'</div></div>';
}
function bindMkt(){
  var g=MKT_GEO,svg=document.getElementById('mktsvg');if(!g||!svg)return;
  var cap=document.getElementById('mcap'),line=document.getElementById('mx');
  if(!cap||!line)return;
  cap.addEventListener('mousemove',function(ev){
    var r=svg.getBoundingClientRect(),sx=(ev.clientX-r.left)/r.width*g.W;
    var i=Math.round((sx-g.m.l)/g.pw*(g.dates.length-1));
    i=Math.max(0,Math.min(g.dates.length-1,i));
    var x=g.m.l+i/(g.dates.length-1)*g.pw,dt=g.dates[i];
    line.setAttribute('x1',x);line.setAttribute('x2',x);line.setAttribute('opacity','.55');
    var rows=g.series.filter(function(o){return o.mp[dt]!=null;})
      .sort(function(a,b){return b.mp[dt]-a.mp[dt];})
      .map(function(o){return '<div style="display:flex;gap:7px;align-items:center;font-size:12.5px">'+
        '<i style="width:9px;height:9px;border-radius:50%;background:'+o.col+';display:inline-block"></i>'+esc(o.n)+
        '<b class="mn" style="margin-left:auto">'+o.mp[dt].toFixed(1)+'¢</b></div>';}).join('');
    showTip('<span class="tm">'+dbr(dt)+'</span> '+tagFase(dt)+
      '<div style="margin-top:6px;display:flex;flex-direction:column;gap:3px">'+rows+'</div>',ev);});
  cap.addEventListener('mouseleave',function(){line.setAttribute('opacity','0');hideTip();});
}
/* ================= PESQUISAS: histórico por instituto ================= */
var POLL_NM={"Lula":"280002542548","Flávio Bolsonaro":"280002551544","Renan Santos":"280002540694",
  "Ronaldo Caiado":"280002551932","Romeu Zema":"280002539826","Augusto Cury":"280002551547"};
function pollTable(r){
  /* da mais recente para a mais antiga, com uma régua onde a campanha começou */
  var linhas=r.hist.slice().reverse(),cortou=false,tb='';
  linhas.forEach(function(h){
    var ant=pre(h.fim);
    if(ant&&!cortou){cortou=true;
      tb+='<tr class="corte"><td colspan="5"><span class="cortec">🏁 início da campanha oficial · '+dbr(CAMP)+'</span></td></tr>';}
    tb+='<tr'+(ant?' class="pre"':'')+'><td>'+dbr(h.ini)+' a '+dbr(h.fim)+'</td>'+
      '<td>'+dbr(h.div)+'</td><td>'+esc(h.m||'—')+'</td>'+
      '<td>'+(h.n?'n='+h.n:'—')+'</td><td>'+esc(h.reg||'—')+'</td></tr>';});
  return '<div class="tblwrap"><table class="hsttbl"><thead><tr><th>Campo</th><th>Divulgação</th><th>Método</th>'+
    '<th>Amostra</th><th>Registro TSE</th></tr></thead><tbody>'+tb+'</tbody></table></div>';
}
function pollHist(r,id){
  var Hs=r.hist||[];
  if(Hs.length<2)return '<p class="cap" style="display:block;padding:6px 2px">Este instituto divulgou uma única pesquisa nacional'+
    (Hs.length?', ainda '+(pre(Hs[0].fim)?'na pré-campanha':'já na campanha oficial'):'')+
    ' — não há série para traçar.</p>'+pollTable(r);
  var tot={};
  Hs.forEach(function(h){Object.keys(h.s).forEach(function(k){
    if(k==='Indecisos'||k==='Outros')return;
    tot[k]=Math.max(tot[k]||0,h.s[k]);});});
  var ks=Object.keys(tot).filter(function(k){return tot[k]>=2||POLL_NM[k];})
    .sort(function(a,b){return tot[b]-tot[a];}).slice(0,7);
  var W=820,Ht=230,m={l:40,r:132,t:14,b:30},pw=W-m.l-m.r,ph=Ht-m.t-m.b;
  var t=function(d){return Date.parse(d+'T00:00:00Z')||0;};
  var t0=t(Hs[0].fim),t1=t(Hs[Hs.length-1].fim),sp=(t1-t0)||1;
  var mx=Math.max.apply(null,ks.map(function(k){return tot[k];}));
  var top=Math.ceil((mx+3)/10)*10;
  var X=function(h){return m.l+(t(h.fim)-t0)/sp*pw;},Y=function(v){return m.t+(1-v/top)*ph;};
  var s='';
  for(var g=0;g<=top;g+=10)
    s+='<line class="grid-l" x1="'+m.l+'" y1="'+Y(g)+'" x2="'+(m.l+pw)+'" y2="'+Y(g)+'"/>'+
       '<text class="tick" x="'+(m.l-7)+'" y="'+(Y(g)+3.5)+'" text-anchor="end">'+g+'%</text>';
  /* aqui o eixo é temporal, então a fronteira sai por conta direta */
  var xc=m.l+(CAMP_T-t0)/sp*pw,dentro=xc>m.l+2&&xc<m.l+pw-2;
  if(dentro)s+=marcaCamp(xc,m.l,m.t,ph,false);
  var ly=[];
  ks.forEach(function(k){
    var c=POLL_NM[k]?byId[POLL_NM[k]]:null,col=c?pc(c):'var(--ink-3)',d='',open=false;
    Hs.forEach(function(h){var v=h.s[k];
      if(v==null){open=false;return;}
      d+=(open?'L':'M')+X(h).toFixed(1)+' '+Y(v).toFixed(1);open=true;});
    s+='<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>';
    Hs.forEach(function(h){var v=h.s[k];if(v==null)return;
      s+='<circle class="pp" cx="'+X(h).toFixed(1)+'" cy="'+Y(v).toFixed(1)+'" r="3.6" fill="'+col+
         '" stroke="var(--surface)" stroke-width="1.6" data-ptt="'+esc(k)+' · '+v.toFixed(1)+'% — '+
         dbr(h.fim)+(h.n?' · n='+h.n:'')+(h.m?' · '+esc(h.m):'')+
         ' · '+(pre(h.fim)?'pré-campanha':'campanha oficial')+'"/>';});
    var lv=Hs[Hs.length-1].s[k];
    if(lv!=null){var y=Y(lv)+4;
      while(ly.some(function(u){return Math.abs(u-y)<12;}))y+=12;
      ly.push(y);
      s+='<text class="dotlab" x="'+(m.l+pw+8)+'" y="'+y.toFixed(1)+'" fill="'+col+'" font-size="11.5">'+
         esc(k.split(' ')[0])+' '+lv.toFixed(1)+'%</text>';}});
  [Hs[0],Hs[Hs.length-1]].forEach(function(h,i){
    s+='<text class="tick" x="'+X(h).toFixed(1)+'" y="'+(m.t+ph+16)+'" text-anchor="'+(i?'end':'start')+'">'+
       (h.fim||'').split('-').reverse().slice(0,2).join('/')+'</text>';});
  var nPre=Hs.filter(function(h){return pre(h.fim);}).length,nPos=Hs.length-nPre;
  return '<div class="plotwrap" style="padding:10px;background:var(--surface-2)">'+
    '<svg class="plot" viewBox="0 0 '+W+' '+Ht+'" role="img" aria-label="Histórico de '+esc(r.inst)+'">'+s+'</svg>'+
    '<div class="legend" style="margin-top:8px">'+
      (dentro?'<span class="lgi"><i class="swc" style="background:var(--ink-3);opacity:.3"></i>área clara: antes de '+dbr(CAMP)+'</span>':'')+
      '<span class="lgi">'+nPre+' na pré-campanha · '+nPos+' na campanha oficial</span></div></div>'+
    pollTable(r);
}
function bindPP(){
  document.querySelectorAll('.pp[data-ptt]').forEach(function(i){
    i.addEventListener('mousemove',function(ev){ev.stopPropagation();showTip('<span class="tt">'+i.dataset.ptt+'</span>',ev);});
    i.addEventListener('mouseleave',hideTip);});
}
/* ================= FICHA JUDICIAL ================= */
var JS_={anulado:['Condenação anulada','var(--v-sem)'],arquivado:['Investigação arquivada','var(--v-sem)'],
 cassado:['Mandato cassado','var(--v-falh)'],misto:['Desfechos divergentes','var(--v-risc)'],
 condenado:['Condenação vigente','var(--v-falh)']};
function drawJud(){
  var el=document.getElementById('v-jud'),CC=cands();
  var comFicha=CC.filter(function(c){return c.jud&&c.jud.length;}).length;
  el.innerHTML='<section><div class="sechead"><h2>⚖ Ficha judicial</h2>'+
    '<span class="pill-n">'+comFicha+' de '+CC.length+' com registro</span></div>'+
    '<div class="note crit"><b>⚠ Leia isto antes</b>'+
    'As certidões criminais não estão neste site — e não é por escolha. Elas não fazem parte do pacote de dados abertos do TSE: '+
    'só existem no DivulgaCandContas, consultadas uma candidatura por vez. As tentativas de baixá-las deste ambiente foram bloqueadas '+
    'pelo firewall do TSE, que recusa conexões vindas de fora do Brasil. O arquivo de motivos de cassação do TSE para 2026, também baixado, '+
    'está vazio: só o cabeçalho, sem nenhum registro.</div>'+
    '<div class="note info"><b>Como ler</b>'+
    'Abaixo, cada processo aparece como uma linha do tempo, passo a passo. <b>Processo em curso não é condenação</b>, e condenação anulada '+
    'não é condenação. Ausência de registro significa que não localizamos processo criminal de conhecimento público — <em>não</em> equivale '+
    'a certidão negativa.</div>'+
    CC.map(function(c){
      var it=c.jud||[];
      return '<div class="judcard"><div class="jh" style="border-left:6px solid '+pc(c)+'">'+foto(c,'sm')+
        '<h3 style="font-size:18px">'+esc(c.nome)+'</h3><span class="pill-n">'+esc(c.partido)+'</span>'+
        (it.length?'<span class="pill-n" style="background:var(--v-risc);color:#fff">'+it.length+' processo'+(it.length>1?'s':'')+'</span>'
                  :'<span class="pill-n">sem registro localizado</span>')+'</div>'+
        '<div class="jb">'+(it.length?it.map(function(j){var st=JS_[j.s]||['—','var(--v-sem)'];
          return '<div class="jitem" style="border-color:'+st[1]+'"><h5>'+esc(j.t)+'</h5>'+
            '<span class="yr">'+esc(j.a)+' · <b style="color:'+st[1]+'">'+st[0]+'</b></span>'+
            '<div class="tline">'+(j.tl||[]).map(function(e){
              var MK={grave:['hi','var(--v-falh)','momento decisivo'],virada:['hi2','var(--v-prom)','virada'],
                      atencao:['hi3','var(--v-risc)','em disputa']};
              var k=MK[e.mk],cls=k?' '+k[0]:'',dot=k?k[1]:st[1];
              return '<div class="tev'+cls+'"><span style="position:absolute;left:-19px;top:'+(k?13:5)+'px;width:'+(k?11:9)+'px;height:'+(k?11:9)+
                'px;border-radius:50%;background:var(--surface);border:'+(k?3:2.5)+'px solid '+dot+';display:block"></span>'+
                '<span class="tdt">'+esc(e.d)+(k?'<span class="mkl" style="background:'+dot+'">'+k[2]+'</span>':'')+'</span>'+
                '<p'+(k?' style="font-weight:600"':'')+'>'+esc(e.t)+'</p></div>';}).join('')+'</div></div>';}).join('')
          :'<p style="margin:0;color:var(--ink-2);font-size:15px">Não localizamos, no registro público consolidado, processo criminal com condenação ou cassação. '+
           'Isso não substitui a certidão criminal, que segue indisponível.</p>')+'</div></div>';}).join('')+
    '<div class="note info"><b>Como obter as certidões</b>'+
    'De uma conexão brasileira, a consulta pode ser feita em divulgacandcontas.tse.jus.br, buscando cada candidato pelo número de registro '+
    'que aparece na ficha dele neste site. As certidões cobrem Justiça Estadual, Federal, Eleitoral e Militar.</div></section>';
}
/* ================= BUSCA ================= */
function nrm(s){return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
var STOP={};'a o e de da do das dos que para com uma um os as no na nos nas por como mais mas foi ser sem sobre tem ate apos onde quando ja ha entre pelo pela seu sua seus suas isso esse essa este esta ao aos nao sao tambem porque muito pode podem deve devem sao ou se lhe nem tal cada todo toda todos todas outro outra outros outras mesmo mesma ainda apenas depois antes desde durante contra sob sobre entao assim tanto quanto qual quais cujo cuja em plano proposta propostas governo brasil brasileiro brasileira df distrito federal candidato'.split(' ').forEach(function(w){STOP[w]=1;});
function tokens(s){return nrm(s).split(/[^a-z0-9]+/).filter(function(w){return w.length>=4&&!STOP[w];});}
function drawBusca(){
  var el=document.getElementById('v-busca');
  el.innerHTML='<section><div class="sechead"><h2>⌕ Buscar</h2>'+
    '<span class="pill-n">'+props().length+' propostas</span></div>'+
    '<input type="search" id="q" placeholder="reconhecimento facial, creche, El Salvador, imposto, fila do SUS…" autocomplete="off">'+
    '<div class="sugg" id="sug"></div>'+
    '<p class="lead" style="margin-top:12px;font-size:14.5px">Busca em títulos, resumos, citações, vereditos e nas notas históricas. Todas as palavras digitadas precisam aparecer.</p>'+
    '<div id="res"></div></section>';
  var inp=el.querySelector('#q');
  if(inp){inp.value=S.q;inp.addEventListener('input',function(){S.q=inp.value;runBusca();});if(S.q)inp.focus();}
  runBusca();
}
function matches(p,terms){
  var c=byId[p.sq];
  var blob=nrm(p.t+' '+p.r+' '+p.c+' '+p.hb+' '+p.hm+' '+p.vd+' '+(p.sub||'')+' '+c.nome+' '+c.partido);
  return terms.every(function(t){return blob.indexOf(t)>=0;});
}
function runBusca(){
  var r=document.getElementById('res'),sg=document.getElementById('sug');if(!r)return;
  var terms=nrm(S.q).split(/\s+/).filter(function(t){return t.length>=2;});
  if(!terms.length){r.innerHTML='<p class="empty">Digite ao menos duas letras.</p>';sg.innerHTML='';return;}
  var hits=props().filter(function(p){return matches(p,terms);});
  var freq={},tot=hits.length;
  hits.forEach(function(p){
    var seen={};
    tokens(p.t+' '+p.r+' '+(p.sub||'')+' '+p.vd).forEach(function(w){
      if(seen[w])return;seen[w]=1;
      if(terms.some(function(t){return w.indexOf(t)>=0||t.indexOf(w)>=0;}))return;
      freq[w]=(freq[w]||0)+1;});});
  var sug=Object.keys(freq).filter(function(w){return freq[w]>=2&&freq[w]<tot;})
    .sort(function(a,b){return freq[b]-freq[a];}).slice(0,10);
  sg.innerHTML=(tot&&sug.length)?'<span class="sl">Refinar com</span>'+sug.map(function(w){
      return '<button class="sgb" data-add="'+esc(w)+'">+ '+esc(w)+'<b>'+freq[w]+'</b></button>';}).join(''):'';
  sg.querySelectorAll('[data-add]').forEach(function(b){b.onclick=function(){
    S.q=(S.q.trim()+' '+b.dataset.add).trim();
    var i=document.getElementById('q');if(i)i.value=S.q;
    runBusca();};});
  r.innerHTML='<div class="sechead" style="margin-top:20px"><h3>'+hits.length+' resultado'+(hits.length===1?'':'s')+'</h3></div>'+
    (hits.length?hits.slice(0,120).map(function(p){return ficha(p,true);}).join('')+
      (hits.length>120?'<p class="empty">Mostrando os 120 primeiros. Refine a busca.</p>':'')
     :'<p class="empty">Nada encontrado.</p>');
}
/* ================= MÉTODO ================= */
function drawMetodo(){
  var el=document.getElementById('v-metodo');
  var tot=P.length,ap=P.filter(function(p){return p.ap;}).length;
  var cv={};P.forEach(function(p){cv[p.vt]=(cv[p.vt]||0)+1;});
  var cb={},cm={};P.forEach(function(p){cb[p.hbr]=(cb[p.hbr]||0)+1;cm[p.hmr]=(cm[p.hmr]||0)+1;});
  el.innerHTML='<section class="prose"><div class="sechead"><h2>☰ Método e limites</h2></div>'+
  '<p>Tudo parte de uma fonte só: os arquivos públicos de dados abertos do TSE para 2026 — as propostas de governo em PDF registradas com cada candidatura, mais candidatos, bens declarados, fotos e coligações. Nenhum discurso, entrevista ou material de campanha entrou. A única exceção é a aba Chances, explicada adiante.</p>'+
  '<h3>🔀 Por que as duas disputas são separadas</h3>'+
  '<p>Presidência e Governo do DF disputam poderes diferentes, com competências diferentes. Comparar a posição econômica de quem propõe reforma tributária federal com a de quem propõe regularização fundiária distrital produziria um número sem significado. Por isso os dois ambientes não se cruzam em nenhum gráfico, lista ou ranking.</p>'+
  '<h3>📐 Os dois eixos</h3>'+
  '<p>Cada proposta recebe duas notas de −2 a +2. O eixo <b>econômico</b> vai de Estado e redistribuição a mercado e iniciativa privada. O <b>social</b>, de progressista e libertário a conservador e de autoridade. Uma proposta genuinamente neutra num eixo — um prontuário interoperável não é de esquerda nem de direita — recebe 0, e puxa a média para o centro. Planos mais técnicos aparecem mais perto da origem, e isso é informação sobre eles.</p>'+
  '<p>Cada proposta tem ainda um <b>peso de 1 a 3</b> conforme o quanto altera a estrutura do Estado ou da economia; a média é ponderada por ele, para que uma reforma tributária não valha o mesmo que a criação de um selo.</p>'+
  '<h3>⚖ O veredito</h3>'+
  '<p>Cada proposta recebe uma leitura editorial explícita, em cinco graus. Não é previsão de resultado — é o que o histórico da política sugere sobre ela.</p>'+
  '<div class="tblwrap"><table class="tbl"><thead><tr><th>Veredito</th><th>Significado</th><th style="text-align:right">Propostas</th></tr></thead><tbody>'+
  [['forte','A evidência disponível sustenta a proposta com clareza.'],
   ['promissora','Funciona sob condições específicas, e a nota diz quais.'],
   ['arriscada','Evidência mista ou risco relevante de repetir um erro conhecido.'],
   ['ja_falhou','Já foi tentada e falhou, aqui ou fora, sem mudança de desenho que justifique outro resultado.'],
   ['sem_precedente','Ninguém tentou em escala comparável; não há histórico para julgar.']].map(function(x){
    return '<tr><td><span class="pill" style="background:'+VT[x[0]][1]+'">'+VT[x[0]][0]+'</span></td><td>'+x[1]+'</td>'+
      '<td class="mn" style="text-align:right">'+(cv[x[0]]||0)+'</td></tr>';}).join('')+'</tbody></table></div>'+
  '<h3>🕰 O histórico</h3>'+
  '<p>Para cada uma das '+tot+' propostas há duas notas — o que já foi tentado no Brasil e o que foi tentado fora — com o desfecho classificado e um nível de confiança declarado.</p>'+
  '<div class="tblwrap"><table class="tbl"><thead><tr><th>Desfecho</th><th style="text-align:right">Brasil</th><th style="text-align:right">Exterior</th></tr></thead><tbody>'+
  Object.keys(RES).map(function(k){
    return '<tr><td>'+pill(k)+'</td><td class="mn" style="text-align:right">'+(cb[k]||0)+'</td><td class="mn" style="text-align:right">'+(cm[k]||0)+'</td></tr>';}).join('')+'</tbody></table></div>'+
  '<h3>❝ Fidelidade das citações</h3>'+
  '<p>'+(tot-ap)+' das '+tot+' citações foram recuperadas caractere a caractere do PDF original, com a página localizada automaticamente. As outras '+ap+' aparecem marcadas como paráfrase: o trecho existe no documento, mas a colagem exata não pôde ser confirmada por quebra de linha ou hifenização.</p>'+
  '<h3>🎨 Sobre as cores</h3>'+
  '<p>Cada partido tem uma cor e uma <b>forma de marcador</b> própria. A forma existe porque seis cores distinguíveis por quem enxerga bem não são necessariamente distinguíveis por quem tem daltonismo: as combinações foram testadas em simulação de protanopia, deuteranopia e tritanopia, e a forma garante a leitura quando a cor falha. As doze cores dos temas formam uma roda de matizes e vêm <em>sempre</em> acompanhadas do nome do tema, nunca sozinhas.</p>'+
  '<p>As cores dos eixos são deliberadamente neutras — verde-azulado e âmbar — para não importar a carga das cores partidárias brasileiras.</p>'+
  '<h3>🎲 Sobre a aba Chances</h3>'+
  '<p>É a única parte do site que não vem dos planos do TSE. Traz três coisas de terceiros: um mercado de apostas, um modelo estatístico sobre pesquisas agregadas e as pesquisas nacionais mais recentes de cada instituto. Cada fonte tem a própria data e anda no próprio ritmo — o painel no topo da aba mostra as três lado a lado com a idade de cada uma'+(D.capturado?', e esta cópia foi baixada em '+esc(dhora(D.capturado)||dbr(D.capturado)):'')+'. A página não se atualiza sozinha: quem publica roda <span class="mn">site/refresh.py</span>, que rebaixa as quatro fontes e reconstrói o HTML. Não existe mercado de apostas para o governo do DF.</p>'+
  '<p>As pesquisas trazem uma marca de fase: <b>pré-campanha</b> para o que foi a campo antes de '+dbr(CAMP)+' e <b>campanha oficial</b> para o que veio depois. '+dlonga(CAMP)+' é o primeiro dia em que a propaganda eleitoral é permitida (Lei 9.504/97, art. 36), no dia seguinte ao prazo de registro das candidaturas — é a fronteira entre medir uma corrida hipotética e medir a corrida que existe. Nos gráficos de série ela aparece como régua tracejada, com a área anterior sombreada.</p>'+'<p>Nas pesquisas, a variação é sempre contra a pesquisa nacional anterior <em>do mesmo instituto</em>. Comparar institutos diferentes entre si mede diferença de metodologia — presencial, telefone ou internet mudam o resultado de forma sistemática — e não movimento do eleitorado.</p>'+
  '<h3>🚫 O que este site não é</h3>'+
  '<ul>'+
  '<li><b>As coordenadas e os vereditos não são dado oficial.</b> São classificação editorial deste projeto aplicada ao texto literal registrado. Outro leitor classificaria diferente em vários casos, e isso é esperado.</li>'+
  '<li><b>Plano registrado não é promessa de governo.</b> O TSE exige o registro do documento e não verifica conteúdo, viabilidade ou custo.</li>'+
  '<li><b>O histórico não é veredito sobre a pessoa.</b> Política que fracassou antes pode funcionar em outro desenho; política que funcionou fora pode não sobreviver ao contexto brasileiro.</li>'+
  '</ul>'+
  '<h3>🕳 O que ficou faltando</h3>'+
  '<ul>'+
  '<li><b>Certidões criminais.</b> Não estão nos dados abertos e o firewall do TSE bloqueia conexões de fora do Brasil. Ver a aba Ficha judicial.</li>'+
  '<li><b>Prestação de contas e doadores.</b> Pacote separado do TSE, não incluído nos arquivos desta pasta.</li>'+
  '<li><b>Situação final das candidaturas.</b> O campo de deferimento veio vazio em todos os registros deste extrato, o que é esperado num arquivo gerado antes do julgamento dos pedidos.</li>'+
  '<li><b>Quinze outros planos.</b> Foram extraídos e ficaram fora desta publicação, que cobre os dez com maior densidade programática nas duas disputas.</li>'+
  '</ul></section>';
}
/* ================= ROUTER ================= */
var draws={matriz:drawMatriz,cands:drawCands,temas:drawTemas,comp:drawComp,polem:drawPolem,
           odds:drawOdds,jud:drawJud,busca:drawBusca,metodo:drawMetodo};
function go(v){S.view=v;
  document.querySelectorAll('.tab').forEach(function(t){t.setAttribute('aria-selected',String(t.dataset.v===v));});
  document.querySelectorAll('.panel').forEach(function(p){p.hidden=(p.id!=='v-'+v);});
  draws[v]();}
function setEsf(e){
  S.esf=e;S.cand=null;S.tema=null;S.topico=null;
  S.selC=new Set(C.filter(function(c){return c.esfera===e;}).map(function(c){return c.sq;}));
  S.selS=new Set(SET.map(function(s){return s.id;}));
  document.querySelectorAll('[data-sw]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.sw===e));});
  document.getElementById('gate').hidden=true;
  document.getElementById('app').hidden=false;
  go(S.view);}
document.querySelectorAll('.tab').forEach(function(t){t.onclick=function(){
  var v=t.dataset.v;
  if(v==='cands')S.cand=null;
  if(v==='polem')S.topico=null;
  if(v==='temas')S.tema=null;
  go(v);scrollTo(0,0);};});
document.querySelectorAll('[data-sw]').forEach(function(b){b.onclick=function(){setEsf(b.dataset.sw);scrollTo(0,0);};});
document.querySelectorAll('[data-esf]').forEach(function(b){b.onclick=function(){setEsf(b.dataset.esf);scrollTo(0,0);};});
try{var st=localStorage.getItem('tema');if(st)root.setAttribute('data-theme',st);}catch(e){}
document.getElementById('tg').onclick=function(){
  var cur=root.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
  var nx=cur==='dark'?'light':'dark';root.setAttribute('data-theme',nx);
  try{localStorage.setItem('tema',nx);}catch(e){}
  paintStatic(); if(S.esf) go(S.view);};
function paintStatic(){
  /* #topspec saiu do HTML; sem a guarda, a exceção aqui abortava o resto —
     as barras de cor do portal ficavam vazias e o botão de tema parava de
     repintar a vista aberta. */
  var ts=document.getElementById('topspec');
  if(ts)ts.innerHTML=specHTML();
  ['br','df'].forEach(function(e){
    var bar=document.getElementById('bar-'+e);
    if(bar)bar.innerHTML=C.filter(function(c){return c.esfera===e;}).map(function(c){
      return '<i style="background:'+pc(c)+'"></i>';}).join('');
    var f=document.getElementById('faces-'+e);
    if(f)f.innerHTML=C.filter(function(c){return c.esfera===e;}).map(function(c){
      return '<span class="face"><b style="background:'+pc(c)+'"></b>'+esc(c.nome)+'</span>';}).join('');});
}
paintStatic();
})();
