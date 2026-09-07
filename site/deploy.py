#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Monta dist/ e publica no GitHub Pages.

    python3 site/deploy.py              # monta dist/ e dispara a publicação
    python3 site/deploy.py --so-montar  # só prepara dist/, não dispara nada

Quem publica de fato é o .github/workflows/atualizar.yml. O Pages deste
repositório está configurado para receber só do GitHub Actions, então não
existe "enviar o dist/ daqui": o que este script faz é montar a pasta para
conferência local e pedir uma rodada do workflow.

A rodada rebaixa as fontes de novo antes de publicar, então o que vai ao ar é
o dado que o Actions capturar, não o que estiver na sua cópia local. Para ver
o resultado local sem publicar nada, use --so-montar e abra dist/index.html.

Nenhuma credencial mora aqui: o disparo usa o `gh` já autenticado.
"""
import os
import re
import shutil
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(RAIZ, 'dist')
FONTE = os.path.join(RAIZ, 'site', 'espectro-2026.html')
WORKFLOW = 'atualizar.yml'


def monta():
    """dist/ é descartável: sempre reconstruído a partir do HTML atual."""
    if not os.path.exists(FONTE):
        raise SystemExit('não achei %s — rode antes: python3 site/build.py' % FONTE)
    # Recriado do zero: o que sobra de uma montagem antiga sobe junto para o
    # Pages, que serve a pasta como está.
    shutil.rmtree(DIST, ignore_errors=True)
    os.makedirs(DIST)
    shutil.copyfile(FONTE, os.path.join(DIST, 'index.html'))
    # Só o index.html: publicação por artefato do Pages não passa por Jekyll, e
    # cabeçalho o Pages não deixa configurar — a política de referrer virou
    # <meta> no body.html.
    mb = os.path.getsize(FONTE) / 1e6
    print('dist/index.html pronto (%.2f MB)' % mb)
    return mb


def quando():
    """A data que a página vai mostrar, para conferir depois de publicar."""
    h = open(FONTE, encoding='utf-8').read(2_000_000)
    m = re.search(r'"capturado":"([^"]+)"', h)
    return m.group(1) if m else '(sem carimbo)'


def dispara():
    """Pede uma rodada do workflow, que rebaixa, reconstrói e publica."""
    if not shutil.which('gh'):
        raise SystemExit(
            'sem o `gh` para disparar a publicação.\n'
            'Rode o workflow "Atualizar dados e publicar" pela aba Actions, '
            'ou espere o próximo horário (de 2 em 2 horas).')
    print('$ gh workflow run ' + WORKFLOW)
    r = subprocess.run(['gh', 'workflow', 'run', WORKFLOW], cwd=RAIZ,
                       capture_output=True, text=True)
    if r.returncode:
        saida = (r.stderr or r.stdout).strip()
        raise SystemExit(
            'o disparo falhou: %s\n\n'
            'Se for falta de permissão, o token do ambiente não tem o escopo '
            '`actions:write` — rode pela aba Actions do repositório.' % saida)
    print('rodada pedida. Acompanhe com:  gh run watch')
    return 0


def main():
    monta()
    print('dado capturado em:', quando())
    if '--so-montar' in sys.argv:
        print('--so-montar: nada foi publicado.')
        return 0
    return dispara()


if __name__ == '__main__':
    sys.exit(main())
