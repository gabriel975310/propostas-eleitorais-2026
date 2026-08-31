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
import os
import shutil
import subprocess
import sys

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


def main():
    preview = '--preview' in sys.argv
    monta()
    print('dado capturado em:', quando())
    if '--so-montar' in sys.argv:
        print('--so-montar: nada foi enviado.')
        return 0

    if not shutil.which('netlify'):
        raise SystemExit('netlify CLI não encontrado. Instale com: npm install -g netlify-cli')

    cmd = ['netlify', 'deploy', '--dir', DIST]
    if not preview:
        cmd.append('--prod')
    print('$ ' + ' '.join(cmd))
    return subprocess.call(cmd, cwd=RAIZ)


if __name__ == '__main__':
    sys.exit(main())
