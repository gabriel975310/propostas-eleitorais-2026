import json
def mg(sq,H):
    f=f'data/propostas/{sq}.json'; d=json.load(open(f)); n=0
    for p in d['propostas']:
        if p['id'] in H:
            x=H[p['id']]
            p['historico']={"br":x[0],"br_res":x[1],"mundo":x[2],"mundo_res":x[3],"conf":x[4]}
            p['vt'],p['vd']=x[5],x[6]; n+=1
    json.dump(d,open(f,'w'),ensure_ascii=False,indent=1)
    falta=[p['id'] for p in d['propostas'] if 'vt' not in p]
    print(f'{sq}: +{n} ({len(d["propostas"])-len(falta)}/{len(d["propostas"])})')
    if falta and len(falta)<12: print(' faltam:',falta)
