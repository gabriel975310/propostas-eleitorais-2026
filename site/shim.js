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
 'paintStatic();global.__={go,S,setEsf,ficha,P,C,SET,draws,coordFor,runBusca};})();'));
const A=global.__;
/* no CI isto precisa derrubar a rodada, não só imprimir: cada problema soma aqui */
let falhas=0;
console.log('carregou:',A.P.length,'propostas |',A.C.length,'candidatos');
['br','df'].forEach(esf=>{A.setEsf(esf);
  console.log('\n== '+esf+' | candidatos',A.S.selC.size,'| temas',A.S.selS.size);
  Object.keys(A.draws).forEach(v=>{try{A.go(v);
    const el=store['v-'+v]; console.log('   ',v.padEnd(8),'OK',(el._h||'').length,'bytes');
  }catch(e){falhas++;console.log('   ',v.padEnd(8),'ERRO:',e.message);}});});
// comparação
A.setEsf('br');A.go('comp');
let h=store['cmpout']._h;
console.log('\nCOMPARAR br: linhas',(h.match(/cmpkey/g)||[]).length,'| células',(h.match(/cmpcell/g)||[]).length,'| itens',(h.match(/cmpitem/g)||[]).length);
A.S.soCom=true;A.go('comp');h=store['cmpout']._h;
console.log('só em comum: linhas',(h.match(/cmpkey/g)||[]).length,'| itens',(h.match(/cmpitem/g)||[]).length);
A.S.soCom=false;
// busca + sugestões
A.setEsf('br');A.S.q='creche';A.go('busca');
console.log('\nBUSCA "creche": resultados',(store['res']._h.match(/class="ficha"/g)||[]).length,'| sugestões',(store['sug']._h.match(/data-add/g)||[]).length);
A.S.q='creche voucher';A.runBusca();
console.log('BUSCA "creche voucher": resultados',(store['res']._h.match(/class="ficha"/g)||[]).length);
// judicial timeline
A.go('jud');const jh=store['v-jud']._h;
console.log('\nJUDICIAL br: cards',(jh.match(/judcard/g)||[]).length,'| eventos de linha do tempo',(jh.match(/class="tev"/g)||[]).length);
// odds: o cabeçalho fica em #v-odds e cada sub-aba desenha dentro de #oddsin
const sub=(esf,k)=>{A.setEsf(esf);A.S.osub=k;A.go('odds');
  return {topo:store['v-odds']._h,miolo:store['oddsin']._h};};
['br','df'].forEach(esf=>{
  const m=sub(esf,'modelo'),k=sub(esf,'mercado');
  console.log('CHANCES '+esf+' topo:',m.topo.length,'bytes | cartões de fonte',
    (m.topo.match(/class="updc/g)||[]).length);
  const vm=/class="mkdc|¢/.test(m.miolo),vk=/Probabilidade de vitória|class="pollcard|class="dcard/.test(k.miolo);
  if(vm||vk)falhas++;
  console.log('   modelo :',m.miolo.length,'bytes | deltas',(m.miolo.match(/class="dcard/g)||[]).length,
    '| pesquisas',(m.miolo.match(/pollcard/g)||[]).length,
    '| vazou mercado?',vm?'SIM':'nao');
  console.log('   mercado:',k.miolo.length,'bytes | contratos',(k.miolo.match(/class="mkdc/g)||[]).length,
    '| vazou modelo?',vk?'SIM':'nao');
});
// senado: só existe no DF
A.setEsf('df');A.go('senado');const sh=store['v-senado']._h;
if(/undefined/.test(sh)||!/class="pollcard/.test(sh))falhas++;
/* impeachment de ministros do STF: o resumo por grupo e ao menos um cartão com fonte */
const stfOk=/class="stfsum/.test(sh)&&/class="stfcard /.test(sh)&&/class="stfev/.test(sh);
if(!stfOk)falhas++;
console.log('SENADO df: bytes',sh.length,'| barras',(sh.match(/class="senrow/g)||[]).length,
  '| pesquisas',(sh.match(/class="pollcard/g)||[]).length,
  '| série',/id="sensvg"/.test(sh)?'sim':'nao',
  '| undefined?',/undefined/.test(sh)?'SIM':'nao');
console.log('   STF:',(sh.match(/class="stfcard /g)||[]).length,'cartões |',
  (sh.match(/class="stfev/g)||[]).length,'registros com fonte |',
  (sh.match(/class="stfb (promete|assinou|contra)"/g)||[]).length,'etiquetas | seção',stfOk?'ok':'FALTOU');
// fichas
A.setEsf('br');let bad=0;
A.P.forEach(p=>{try{const x=A.ficha(p,true);if(/undefined/.test(x)){bad++;if(bad<4)console.log('  undefined em',p.id);}}catch(e){bad++;console.log('  ERRO',p.id,e.message);}});
console.log('\nfichas com problema:',bad,'de',A.P.length);
if(bad)falhas++;
if(falhas){console.log('\nFALHOU: '+falhas+' verificação(ões) acima');process.exit(1);}
