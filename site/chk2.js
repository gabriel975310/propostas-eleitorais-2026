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
 'paintStatic();global.__={go,S,setEsf,P,C,coordFor,byId,pc,drawMatriz};})();'));
const A=global.__;
// posições reais dos marcadores: reproduz coordFor + escala
['br','df'].forEach(esf=>{
  A.setEsf(esf);A.go('matriz');
  const svg=store['svg']._h;
  const CC=A.C.filter(c=>c.esfera===esf&&A.S.selC.has(c.sq));
  const m={l:96,r:58,t:52,b:84},W=860,H=700,pw=W-m.l-m.r,ph=H-m.t-m.b;
  let mx=0;CC.forEach(c=>{const q=A.coordFor(c);if(q)mx=Math.max(mx,Math.abs(q.e),Math.abs(q.s));});
  const DOM=Math.max(0.55,mx*1.30);
  const X=v=>m.l+(v+DOM)/(2*DOM)*pw,Y=v=>m.t+(DOM-v)/(2*DOM)*ph;
  const mks=CC.map(c=>{const q=A.coordFor(c);return{t:c.nome,x0:X(q.e)-16,x1:X(q.e)+16,y0:Y(q.s)-16,y1:Y(q.s)+16};});
  const labs=[...svg.matchAll(/<text class="dotlab" x="([-\d.]+)" y="([-\d.]+)" text-anchor="(\w+)"[^>]*>([^<]*)</g)]
    .map(m=>({x:+m[1],y:+m[2],a:m[3],t:m[4]}));
  const subs=[...svg.matchAll(/<text class="dotlab s2" x="([-\d.]+)" y="([-\d.]+)" text-anchor="(\w+)"[^>]*>([^<]*)</g)]
    .map(m=>({x:+m[1],y:+m[2],a:m[3],t:m[4]}));
  const boxes=labs.map((l,i)=>{const s=subs[i]||{t:''};
    const w=Math.max(l.t.length*7.9,s.t.length*5.8);
    const x0=l.a==='start'?l.x:(l.a==='end'?l.x-w:l.x-w/2);
    return {t:l.t,x0,x1:x0+w,y0:l.y-13,y1:l.y+15};});
  let hits=[];
  boxes.forEach(b=>mks.forEach(k=>{
    const w=Math.min(b.x1,k.x1)-Math.max(b.x0,k.x0),h=Math.min(b.y1,k.y1)-Math.max(b.y0,k.y0);
    if(w>0&&h>0)hits.push(b.t+' sobre marcador de '+k.t+' ('+Math.round(w*h)+'px²)');}));
  console.log('MATRIZ '+esf+': rótulo × marcador -> '+(hits.length?hits.join('; '):'nenhuma sobreposição'));
  // dentro do quadro de plotagem?
  const dentro=boxes.filter(b=>b.x0>=4&&b.x1<=856&&b.y0>=m.t-20&&b.y1<=H-6).length;
  console.log('   '+dentro+'/'+boxes.length+' rótulos dentro dos limites do SVG');
  // granularidade por proposta
  A.S.gran='prop';A.go('matriz');
  console.log('   modo "cada proposta": '+(store['svg']._h.match(/class="pdot"/g)||[]).length+' pontos');
  A.S.gran='cand';
});
// cores aplicadas
console.log('\nCORES: '+A.C.map(c=>c.nome.split(' ')[0]+' '+c.cor).join(' | '));
