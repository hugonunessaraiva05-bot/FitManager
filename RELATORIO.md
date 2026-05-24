# Relatório Técnico - FitManager

## 1. Introdução e Contexto

O projeto `FitManager` consiste numa aplicação web de gestão de ginásio desenvolvida com o objetivo de apoiar as tarefas operacionais mais frequentes de um espaço de treino. A aplicação permite centralizar informação relativa a clientes, instrutores, planos de treino e pagamentos, oferecendo uma interface simples e organizada para consulta e registo de dados.

Do ponto de vista académico, o projeto foi também pensado como um exercício prático de aplicação de conceitos de Programação Orientada a Objetos, separação de responsabilidades e persistência de dados no navegador. A solução foi implementada com tecnologias web base, sem dependência de frameworks externas, o que facilita a compreensão da arquitetura e da lógica desenvolvida.

## 2. Levantamento de Requisitos

### 2.1 Requisitos Funcionais

Os principais requisitos funcionais identificados para o sistema são os seguintes:

- Registar clientes com dados pessoais, objetivo de treino, mensalidade e instrutor associado.
- Registar instrutores com dados de contacto, especialidade, certificação e turno.
- Criar planos de treino com nome, objetivo, nível, duração e mensalidade sugerida.
- Adicionar exercícios aos planos de treino.
- Associar planos de treino a clientes.
- Registar pagamentos, incluindo valor, data de vencimento, data de pagamento e método.
- Consultar um dashboard com indicadores operacionais e financeiros.
- Pesquisar clientes pelo nome.
- Consultar clientes com mensalidade em atraso.
- Calcular o total recebido pelo ginásio.
- Editar e apagar dados, como evolução natural do sistema.
- Exportar os dados do sistema para ficheiro JSON.
- Repor os dados de demonstração da aplicação.

### 2.2 Requisitos Não Funcionais

Para além das funcionalidades, foram considerados os seguintes requisitos não funcionais:

- Interface simples, intuitiva e de fácil utilização.
- Organização clara do código por camadas de responsabilidade.
- Persistência de dados com `localStorage`.
- Validação de dados introduzidos nos formulários.
- Facilidade de manutenção e evolução futura.
- Compatibilidade com navegador web moderno.
- Boa legibilidade do código e da estrutura dos ficheiros.
- Atualização dinâmica da interface sem necessidade de recarregar a página.

## 3. Modelação

### 3.1 Casos de Uso

Os casos de uso principais da aplicação podem ser descritos da seguinte forma:

- **Criar cliente**  
  O administrador introduz os dados do novo cliente, seleciona um instrutor e, opcionalmente, um plano inicial. O sistema valida os dados, guarda o registo e atualiza o dashboard.

- **Criar instrutor**  
  O administrador regista um novo instrutor com os respetivos dados profissionais. O sistema adiciona o instrutor à base de dados local e disponibiliza-o para associação a clientes.

- **Criar plano de treino**  
  O administrador cria um plano com informação geral e acrescenta exercícios ao mesmo. O plano fica disponível para associação futura a clientes.

- **Associar exercício a plano**  
  O administrador escolhe um plano existente e adiciona um novo exercício, definindo séries, repetições, descanso e notas.

- **Registar pagamento**  
  O administrador seleciona um cliente, define o valor e a data, e regista o pagamento como liquidado ou pendente. O sistema atualiza os indicadores financeiros.

- **Exportar dados**  
  O administrador aciona a exportação e o sistema gera um ficheiro JSON com o estado atual da aplicação.

### 3.2 User Stories

- Como administrador, quero registar clientes para gerir os membros do ginásio.
- Como administrador, quero registar instrutores para organizar a equipa técnica.
- Como administrador, quero criar planos de treino para associar aos clientes.
- Como administrador, quero adicionar exercícios aos planos para estruturar melhor o acompanhamento do treino.
- Como administrador, quero registar pagamentos para controlar mensalidades.
- Como administrador, quero consultar o dashboard para acompanhar o estado do ginásio.
- Como administrador, quero exportar os dados para manter uma cópia externa da informação.

## 4. Arquitetura

### 4.1 Estrutura do Projeto

O projeto encontra-se organizado nos seguintes ficheiros principais:

- `index.html`  
  Contém a estrutura da interface, incluindo navegação, dashboard, tabelas, painéis e formulários em janelas modais.

- `styles.css`  
  Define o aspeto visual da aplicação, incluindo layout, cartões, tabelas, botões, responsividade e identidade visual.

- `app.js`  
  Contém toda a lógica da aplicação: classes do domínio, persistência em `localStorage`, serviços de negócio, renderização da interface e tratamento de eventos.

- `README.md`  
  Apresenta uma visão geral resumida do projeto, da sua utilização e dos conceitos aplicados.

- `RELATORIO.md`  
  Documento técnico com descrição detalhada da solução, requisitos, modelação, arquitetura e reflexão final.

Em termos lógicos, a aplicação está estruturada em três níveis principais:

- **Modelo de domínio**: classes como `Cliente`, `Instrutor`, `PlanoTreino`, `Exercicio` e `Pagamento`.
- **Camada de gestão de dados e regras**: representada por classes como `RepositorioFitManager` e `ServicoFitManager`.
- **Camada de interface**: gerida por `AplicacaoFitManager`, responsável pela interação com o HTML e pela atualização do dashboard.

### 4.2 Diagrama de Classes

```text
Pessoa
|- id
|- nome
|- email
|- telefone
|- mostrarInfo()
|
|-- Cliente
|   |- objetivo
|   |- mensalidade
|   |- dataInscricao
|   |- proximoVencimento
|   |- instrutorId
|   |- planoTreino : PlanoTreino
|   |- notas
|   |- ativo
|   |- associarPlano()
|   |- mostrarInfo()
|
|-- Instrutor
    |- especialidade
    |- certificacao
    |- turno
    |- mostrarInfo()

PlanoTreino
|- id
|- templateId
|- nome
|- objetivo
|- duracaoSemanas
|- nivel
|- mensalidadeSugerida
|- exercicios : Exercicio[]
|- adicionarExercicio()
|- cloneParaCliente()

Exercicio
|- id
|- nome
|- series
|- repeticoes
|- descansoSegundos
|- notas

Pagamento
|- id
|- clienteId
|- valor
|- vencimento
|- pagoEm
|- metodo
|- estado

Ginasio
|- clientes : Cliente[]
|- instrutores : Instrutor[]
|- planosTreino : PlanoTreino[]
|- pagamentos : Pagamento[]
|- totalRecebido
|- clientesEmAtraso
```

As relações entre as classes podem ser resumidas do seguinte modo:

- `Cliente` e `Instrutor` herdam de `Pessoa`.
- `Cliente` pode ter um `PlanoTreino` associado.
- `PlanoTreino` pode ter vários `Exercicio`.
- `Pagamento` está associado a `Cliente` através do identificador do cliente.
- `Ginasio` representa, ao nível conceptual, a entidade que gere as listas de clientes, instrutores, planos e pagamentos.

Embora a classe `Ginasio` não exista explicitamente com esse nome no código final, essa responsabilidade é desempenhada pela combinação entre o repositório e o serviço da aplicação.

## 5. Conceitos de Programação Orientada a Objetos

No projeto foram aplicados vários conceitos de Programação Orientada a Objetos:

- **Classes**  
  Foram criadas classes para representar as entidades do domínio, como `Pessoa`, `Cliente`, `Instrutor`, `PlanoTreino`, `Exercicio` e `Pagamento`.

- **Objetos**  
  Cada cliente, instrutor, plano ou pagamento existente na aplicação corresponde a um objeto concreto criado a partir das respetivas classes.

- **Encapsulamento**  
  Os atributos privados, definidos com `#`, protegem o estado interno dos objetos e obrigam ao uso de métodos de acesso controlados.

- **Herança**  
  `Cliente` e `Instrutor` reutilizam comportamento comum da classe `Pessoa`, evitando repetição de código.

- **Composição**  
  Um `PlanoTreino` contém vários `Exercicio`, e um `Cliente` pode conter um `PlanoTreino` associado. Esta relação mostra a construção de objetos mais complexos a partir de objetos mais simples.

- **Métodos**  
  Cada classe possui métodos próprios, como `mostrarInfo()`, `associarPlano()`, `adicionarExercicio()` e `toJSON()`, que encapsulam o comportamento esperado.

- **Listas/arrays**  
  O sistema utiliza arrays para armazenar coleções de clientes, instrutores, planos e pagamentos, tanto na memória como na persistência em `localStorage`.

## 6. Conclusão e Reflexão Técnica

O desenvolvimento do `FitManager` permitiu consolidar conhecimentos de modelação orientada a objetos, manipulação do DOM, persistência local e organização de código em JavaScript. Ao longo do projeto foi possível perceber a importância de separar claramente o modelo de dados, as regras de negócio e a interface, de forma a tornar a aplicação mais compreensível e mais fácil de manter.

Uma das principais dificuldades esteve relacionada com a gestão consistente do estado da aplicação, sobretudo na sincronização entre os dados guardados, os formulários e o dashboard. Outra dificuldade relevante foi estruturar o código de forma a manter a simplicidade da interface sem perder clareza na lógica interna.

Do ponto de vista técnico, o projeto demonstrou que mesmo uma aplicação sem base de dados externa pode beneficiar de uma arquitetura cuidada e de boas práticas de POO. Também mostrou a utilidade do `localStorage` como solução simples para persistência em projetos académicos e protótipos funcionais.

## 7. Melhorias Futuras

Como evolução futura do projeto, destacam-se as seguintes possibilidades:

- Implementação de login de administrador.
- Integração com uma base de dados real.
- Criação de uma versão mobile mais otimizada.
- Geração de relatórios em PDF.
- Inclusão de um calendário de treinos e marcações.
- Sistema de notificações para pagamentos e renovações.
- Funcionalidades completas de edição e remoção em todas as entidades.
- Gestão de permissões por tipo de utilizador.
