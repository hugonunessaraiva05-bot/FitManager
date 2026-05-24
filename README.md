# FitManager

Sistema de gestao de ginasio com foco em POO, UX moderna e operacao diaria.

Relatorio tecnico: [RELATORIO.md](./RELATORIO.md)

## Como usar

1. Abrir `index.html` no browser.
2. Navegar entre `Dashboard`, `Clientes`, `Planos de treino`, `Financeiro` e `Instrutores`.
3. Usar os botoes no topo para registar clientes, instrutores, planos, exercicios e pagamentos.
4. Os dados ficam guardados no `localStorage` do browser.

## O que esta incluido

- Heranca com `Pessoa`, `Cliente` e `Instrutor`.
- Composicao com `PlanoTreino` e varios `Exercicio`, e cliente com plano associado.
- Encapsulamento com atributos privados e polimorfismo em `mostrarInfo()`.
- Interface responsiva com dashboard operacional, painel de clientes, planos e financeiro.
- Reset de demo para voltar rapidamente ao estado inicial.
