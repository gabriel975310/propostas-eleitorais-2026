#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Monta dist/ e publica no Netlify.

    python3 site/deploy.py              # publica em produção
    python3 site/deploy.py --preview    # publica num link de rascunho
    python3 site/deploy.py --so-montar  # só prepara dist/, não envia

O ciclo completo de atualização é:

    python3 site/refresh.py && python3 site/deploy.py

O login fica com o CLI do Netlify (`netlify login`, uma vez por máquina) ou na
variável NETLIFY_AUTH_TOKEN. Este script não guarda credencial nenhuma.
"""
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
import zipfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(RAIZ, 'dist')
FONTE = os.path.join(RAIZ, 'site', 'espectro-2026.html')

CABECALHOS = """/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/index.html
  Cache-Control: public, max-age=0, must-revalidate

/
  Cache-Control: public, max-age=0, must-revalidate
"""


def monta():
    """dist/ é descartável: sempre reconstruído a partir do HTML atual."""
    if not os.path.exists(FONTE):
        raise SystemExit('não achei %s — rode antes: python3 site/build.py' % FONTE)
    os.makedirs(DIST, exist_ok=True)
    shutil.copyfile(FONTE, os.path.join(DIST, 'index.html'))
    with open(os.path.join(DIST, '_headers'), 'w', encoding='utf-8') as f:
        f.write(CABECALHOS)
    mb = os.path.getsize(FONTE) / 1e6
    print('dist/index.html pronto (%.2f MB)' % mb)
    return mb


def quando():
    """A data que a página vai mostrar, para conferir depois de publicar."""
    import json, re
    h = open(FONTE, encoding='utf-8').read(2_000_000)
    m = re.search(r'"capturado":"([^"]+)"', h)
    return m.group(1) if m else '(sem carimbo)'


API = 'https://api.netlify.com/api/v1'


def publica_api(preview=False):
    """Deploy pela API, mandando o dist/ como zip.

    É o caminho do CI: o netlify-cli pesa 350 MB e instalá-lo a cada rodada
    consumiria boa parte da cota de minutos de um repositório privado. Aqui
    são dois pedidos HTTP e nenhuma dependência fora da biblioteca padrão.
    """
    token = os.environ['NETLIFY_AUTH_TOKEN']
    site = os.environ['NETLIFY_SITE_ID']

    pacote = os.path.join(RAIZ, '.deploy.zip')
    with zipfile.ZipFile(pacote, 'w', zipfile.ZIP_DEFLATED) as z:
        for raiz, _, arquivos in os.walk(DIST):
            for a in arquivos:
                cheio = os.path.join(raiz, a)
                z.write(cheio, os.path.relpath(cheio, DIST))
    tam = os.path.getsize(pacote)

    url = '%s/sites/%s/deploys' % (API, site)
    if preview:
        url += '?draft=true'
    req = urllib.request.Request(
        url, data=open(pacote, 'rb').read(), method='POST',
        headers={'Content-Type': 'application/zip', 'Authorization': 'Bearer ' + token})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            dep = json.load(r)
    except urllib.error.HTTPError as e:
        raise SystemExit('Netlify recusou o deploy (HTTP %s): %s' % (e.code, e.read()[:400].decode('utf-8', 'replace')))
    finally:
        os.remove(pacote)

    print('zip enviado (%.0f KB), deploy %s' % (tam / 1024, dep['id']))

    # o zip sobe em segundos, mas o Netlify ainda processa: espera ficar pronto
    espera = '%s/deploys/%s' % (API, dep['id'])
    cab = {'Authorization': 'Bearer ' + token}
    for _ in range(60):
        with urllib.request.urlopen(urllib.request.Request(espera, headers=cab), timeout=60) as r:
            d = json.load(r)
        if d['state'] == 'ready':
            print('publicado: %s' % (d.get('ssl_url') or d.get('url') or d.get('deploy_ssl_url')))
            return 0
        if d['state'] == 'error':
            raise SystemExit('deploy falhou: %s' % d.get('error_message'))
        time.sleep(3)
    raise SystemExit('deploy não ficou pronto a tempo (último estado: %s)' % d['state'])


def publica_cli(preview=False):
    """Deploy pelo CLI. Caminho local: usa o login já feito com `netlify login`."""
    cmd = ['netlify', 'deploy', '--dir', DIST]
    if not preview:
        cmd.append('--prod')
    print('$ ' + ' '.join(cmd))
    return subprocess.call(cmd, cwd=RAIZ)


def main():
    preview = '--preview' in sys.argv
    monta()
    print('dado capturado em:', quando())
    if '--so-montar' in sys.argv:
        print('--so-montar: nada foi enviado.')
        return 0

    # com token no ambiente (CI) vai pela API; senão, pelo CLI já autenticado
    if os.environ.get('NETLIFY_AUTH_TOKEN') and os.environ.get('NETLIFY_SITE_ID'):
        return publica_api(preview)
    if shutil.which('netlify'):
        return publica_cli(preview)
    raise SystemExit(
        'sem jeito de publicar: rode `netlify login`, ou defina '
        'NETLIFY_AUTH_TOKEN e NETLIFY_SITE_ID no ambiente.')


if __name__ == '__main__':
    sys.exit(main())
