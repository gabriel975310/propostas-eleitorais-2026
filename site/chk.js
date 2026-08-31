const fs=require('fs');
const raw=fs.readFileSync('espectro-2026.html','utf8');
function El(t){const e={tagName:t,dataset:{},style:{},attrs:{},_h:'',hidden:false,_kids:[],
 set innerHTML(v){this._h=v},get innerHTML(){return this._h},
 get textContent(){return this._t||''},set textContent(v){this._t=v},
 setAttribute(k,v){this.attrs[k]=v},getAttribute(k){return this.attrs[k]??null},
 addEventListener(){},querySelectorAll(){return[]},querySelector(){return null},
 classList:{add(){},remove(){}},getBoundingClientRect(){return{width:800,height:400,left:0,top:0}},
 scrollIntoView(){},click(){},focus(){},appendChild(x){this._kids.push(x)},
 set onclick(f){this._f=f},get onclick(){return this._f}};return e;}
const store={};
global.document={documentElement:{_t:null,getAttribute(){return this._t},setAttribute(k,v){this._t=v}},
 getElementById(id){if(id==='dados'){const e=El('s');
   e.textContent=raw.match(/<script id="dados" type="application\/json">([\s\S]*?)<\/script>/)[1].replace(/<\\\//g,'</');return e;}
   return store[id]||(store[id]=El('div'));},
 querySelectorAll(){return[]},querySelector(){return null},addEventListener(){},createElement:El};
global.window=global;global.localStorage={getItem(){return null},setItem(){}};
global.matchMedia=()=>({matches:false});global.scrollTo=()=>{};global.innerWidth=1200;
eval(fs.readFileSync('app.js','utf8').replace('paintStatic();\n})();',
 'paintStatic();global.__={go,S,setEsf,P,C,curto,mktChart,pollHist,vtBars,D,byId,pc};})();'));
const A=global.__;

function labBoxes(svg){
  const out=[];const re=/<text class="dotlab"(?: s2)? x="([-\d.]+)" y="([-\d.]+)" text-anchor="(\w+)" fill="[^"]*">([^<]*)<\/text>/g;
  let m;while((m=re.exec(svg))){out.push({x:+m[1],y:+m[2],a:m[3],t:m[4]});}
  return out;
}
['br','df'].forEach(esf=>{
  A.setEsf(esf);A.go('matriz');
  const svg=store['svg']._h;
  const labs=[...svg.matchAll(/<text class="dotlab" x="([-\d.]+)" y="([-\d.]+)" text-anchor="(\w+)"[^>]*>([^<]*)</g)]
    .map(m=>({x:+m[1],y:+m[2],a:m[3],t:m[4]}));
  const subs=[...svg.matchAll(/<text class="dotlab s2" x="([-\d.]+)" y="([-\d.]+)" text-anchor="(\w+)"[^>]*>([^<]*)</g)]
    .map(m=>({x:+m[1],y:+m[2],a:m[3],t:m[4]}));
  // caixas por candidato
  const boxes=labs.map((l,i)=>{const s=subs[i]||{t:''};
    const w=Math.max(l.t.length*7.9,s.t.length*5.8);
    const x0=l.a==='start'?l.x:(l.a==='end'?l.x-w:l.x-w/2);
    return {t:l.t,x0,x1:x0+w,y0:l.y-13,y1:l.y+15};});
  // marcadores
  const mks=[...svg.matchAll(/class="pdot" fill="[^"]*" stroke="var\(--surface\)"/g)].length;
  const cx=[...svg.matchAll(/<line x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)"/g)].length;
  let clash=0,pairs=[];
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
    const a=boxes[i],b=boxes[j];
    const w=Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0),h=Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0);
    if(w>0&&h>0){clash++;pairs.push(a.t+'×'+b.t+' ('+Math.round(w*h)+'px²)');}}
  // fora dos limites
  // marcadores: extrai centro de cada forma desenhada
  const cs=[...svg.matchAll(/(?:<circle cx="([-\d.]+)" cy="([-\d.]+)" r="13"|<(?:rect|path|polygon)[^>]*?)class="pdot"/g)];
  const cen=[...svg.matchAll(/data-sq="(\d+)"/g)];
  const fora=boxes.filter(b=>b.x0<0||b.x1>860||b.y0<0||b.y1>700).map(b=>b.t);
  console.log('\n== MATRIZ '+esf+': '+labs.length+' rótulos, '+mks+' marcadores');
  console.log('   sobreposição rótulo×rótulo: '+clash+(clash?' -> '+pairs.join(', '):''));
  // sobreposição rótulo × marcador (marcadores em raio 13 + folga)
  const MK=[...svg.matchAll(/M([-\d.]+) ([-\d.]+)|<circle cx="([-\d.]+)" cy="([-\d.]+)" r="13"/g)];
  console.log('   rótulos fora do quadro: '+(fora.length?fora.join(', '):'nenhum'));
  console.log('   quadrantes: '+[...svg.matchAll(/class="quad"[^>]*>([^<]*)</g)].map(m=>m[1]).join(' | '));
  console.log('   nomes curtos: '+labs.map(l=>l.t).join(', '));
  // eixo y: coluna dos números x coluna do label
  const ticksY=[...svg.matchAll(/<text class="tick" x="(\d+)" y="[\d.]+" text-anchor="end">/g)].map(m=>+m[1]);
  const ylab=[...svg.matchAll(/<text class="axlab" x="(\d+)"[^>]*transform="rotate\(-90/g)].map(m=>+m[1]);
  console.log('   eixo Y: números em x='+[...new Set(ticksY)]+' | rótulo em x='+[...new Set(ylab)]+
    ' -> folga '+(Math.min(...ticksY)-Math.max(...ylab))+'px entre colunas');
});
// barras de veredito
A.setEsf('br');
const vb=A.vtBars(A.C.filter(c=>c.esfera==='br'));
console.log('\n== BARRAS DE VEREDITO: '+(vb.match(/rrow stk/g)||[]).length+' candidatos, '+
  (vb.match(/class="sg"/g)||[]).length+' segmentos, '+(vb.match(/<u /g)||[]).length+' rótulos %');
const somas=[...vb.matchAll(/<span class="nm"[^>]*>([^<]+)<\/span><span class="rbar stk">([\s\S]*?)<\/span>/g)]
 .map(m=>{const w=[...m[2].matchAll(/width:([\d.]+)%/g)].reduce((a,x)=>a+ +x[1],0);return m[1]+' '+w.toFixed(1)+'%';});
console.log('   soma dos segmentos: '+somas.join(' | '));
// mercado
const mc=A.mktChart();
console.log('\n== MERCADO: '+(mc.match(/<path/g)||[]).length+' linhas, '+(mc.match(/mkdc/g)||[]).length/1+' cartões de variação, '+
  (mc.match(/pregões/)?'eixo de datas ok':'SEM datas'));
// histórico de pesquisa
const q=A.D.pesquisas.t1;
const comHist=q.filter(r=>r.hist.length>=2).length;
let pts=0,vazio=0;
q.forEach((r,i)=>{const h=A.pollHist(r,'a'+i);
  pts+=(h.match(/class="pp"/g)||[]).length;
  if(!/<svg/.test(h)&&r.hist.length>=2)vazio++;});
console.log('== PESQUISAS: '+comHist+'/'+q.length+' institutos com série, '+pts+' pontos plotados, '+vazio+' gráficos vazios indevidos');
