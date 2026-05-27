const STORAGE_KEY = "fitmanager-state";

const formatCurrency = new Intl.NumberFormat("pt-PT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const formatLongDate = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "full",
});

const formatShortDate = new Intl.DateTimeFormat("pt-PT", {
  dateStyle: "medium",
});

const formatWeekdayShort = new Intl.DateTimeFormat("pt-PT", {
  weekday: "short",
});

const planPresentationLibrary = [
  {
    badge: "Forca",
    headline: "Ciclos com foco em carga, tecnica e progressao.",
    accent: "Bom para alunos orientados a performance e estrutura.",
    themeClass: "theme-strength",
    iconId: "icon-plans",
  },
  {
    badge: "Consistencia",
    headline: "Rotinas claras para adesao e resultados sustentaveis.",
    accent: "Ideal para quem precisa de simplicidade e ritmo.",
    themeClass: "theme-reset",
    iconId: "icon-plans",
  },
  {
    badge: "Mobilidade",
    headline: "Blocos leves para postura, controlo e longevidade.",
    accent: "Trabalho tecnico com leitura visual limpa.",
    themeClass: "theme-mobility",
    iconId: "icon-plans",
  },
  {
    badge: "Resistencia",
    headline: "Planeamento ritmado para intensidade e capacidade.",
    accent: "Boa leitura para sessoes mais dinamicas e metabolicas.",
    themeClass: "theme-endurance",
    iconId: "icon-plans",
  },
];

function createId(prefix) {
  if (window.crypto?.randomUUID) {
    return `${prefix}-${window.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function startOfDay(dateValue = new Date()) {
  const date = new Date(dateValue);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(dateValue, days) {
  const date = new Date(dateValue);
  date.setDate(date.getDate() + days);
  return date;
}

function daysBetween(from, to) {
  const diff = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(diff / 86400000);
}

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function getPlanPresentation(plano, index = 0) {
  const objective = normalizeText(plano?.objetivo);

  if (objective.includes("forca") || objective.includes("hipertrofia")) {
    return planPresentationLibrary[0];
  }

  if (objective.includes("gordura") || objective.includes("consistencia")) {
    return planPresentationLibrary[1];
  }

  if (objective.includes("mobilidade") || objective.includes("saude")) {
    return planPresentationLibrary[2];
  }

  if (objective.includes("condicionamento") || objective.includes("resistencia")) {
    return planPresentationLibrary[3];
  }

  return planPresentationLibrary[index % planPresentationLibrary.length];
}

function getInitials(name) {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function asDateInputValue(dateValue) {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function ensureFilled(value, label) {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new Error(`${label} e obrigatorio.`);
  }
  return text;
}

function ensurePositiveNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`${label} tem de ser maior que zero.`);
  }
  return number;
}

class EntidadeBase {
  #id;

  constructor(id) {
    this.#id = id ?? createId("entidade");
  }

  get id() {
    return this.#id;
  }

  toJSON() {
    return { id: this.id };
  }
}

class Pessoa extends EntidadeBase {
  #nome;
  #email;
  #telefone;

  constructor({ id, nome, email, telefone }) {
    super(id);
    this.nome = nome;
    this.email = email;
    this.telefone = telefone;
  }

  get nome() {
    return this.#nome;
  }

  set nome(value) {
    this.#nome = ensureFilled(value, "Nome");
  }

  get email() {
    return this.#email;
  }

  set email(value) {
    this.#email = ensureFilled(value, "Email");
  }

  get telefone() {
    return this.#telefone;
  }

  set telefone(value) {
    this.#telefone = ensureFilled(value, "Telefone");
  }

  get iniciais() {
    return getInitials(this.nome);
  }

  mostrarInfo() {
    return `${this.nome} - ${this.email}`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      nome: this.nome,
      email: this.email,
      telefone: this.telefone,
    };
  }
}

class Exercicio extends EntidadeBase {
  #nome;
  #series;
  #repeticoes;
  #descansoSegundos;
  #notas;

  constructor({ id, nome, series, repeticoes, descansoSegundos, notas }) {
    super(id);
    this.nome = nome;
    this.series = series;
    this.repeticoes = repeticoes;
    this.descansoSegundos = descansoSegundos;
    this.notas = notas ?? "";
  }

  get nome() {
    return this.#nome;
  }

  set nome(value) {
    this.#nome = ensureFilled(value, "Nome do exercicio");
  }

  get series() {
    return this.#series;
  }

  set series(value) {
    this.#series = ensurePositiveNumber(value, "Series");
  }

  get repeticoes() {
    return this.#repeticoes;
  }

  set repeticoes(value) {
    this.#repeticoes = ensureFilled(value, "Repeticoes");
  }

  get descansoSegundos() {
    return this.#descansoSegundos;
  }

  set descansoSegundos(value) {
    this.#descansoSegundos = Number(value) >= 0 ? Number(value) : 0;
  }

  get notas() {
    return this.#notas;
  }

  set notas(value) {
    this.#notas = String(value ?? "").trim();
  }

  get resumo() {
    return `${this.series}x${this.repeticoes} - ${this.descansoSegundos}s descanso`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      nome: this.nome,
      series: this.series,
      repeticoes: this.repeticoes,
      descansoSegundos: this.descansoSegundos,
      notas: this.notas,
    };
  }
}

class PlanoTreino extends EntidadeBase {
  #templateId;
  #nome;
  #objetivo;
  #duracaoSemanas;
  #nivel;
  #mensalidadeSugerida;
  #exercicios;

  constructor({
    id,
    templateId,
    nome,
    objetivo,
    duracaoSemanas,
    nivel,
    mensalidadeSugerida,
    exercicios = [],
  }) {
    super(id);
    this.#templateId = templateId ?? this.id;
    this.nome = nome;
    this.objetivo = objetivo;
    this.duracaoSemanas = duracaoSemanas;
    this.nivel = nivel;
    this.mensalidadeSugerida = mensalidadeSugerida;
    this.#exercicios = exercicios.map((item) => item instanceof Exercicio ? item : new Exercicio(item));
  }

  get templateId() {
    return this.#templateId;
  }

  get nome() {
    return this.#nome;
  }

  set nome(value) {
    this.#nome = ensureFilled(value, "Nome do plano");
  }

  get objetivo() {
    return this.#objetivo;
  }

  set objetivo(value) {
    this.#objetivo = ensureFilled(value, "Objetivo do plano");
  }

  get duracaoSemanas() {
    return this.#duracaoSemanas;
  }

  set duracaoSemanas(value) {
    this.#duracaoSemanas = ensurePositiveNumber(value, "Duracao do plano");
  }

  get nivel() {
    return this.#nivel;
  }

  set nivel(value) {
    this.#nivel = ensureFilled(value, "Nivel do plano");
  }

  get mensalidadeSugerida() {
    return this.#mensalidadeSugerida;
  }

  set mensalidadeSugerida(value) {
    this.#mensalidadeSugerida = ensurePositiveNumber(value, "Mensalidade sugerida");
  }

  get exercicios() {
    return [...this.#exercicios];
  }

  get totalExercicios() {
    return this.#exercicios.length;
  }

  adicionarExercicio(exercicio) {
    if (!(exercicio instanceof Exercicio)) {
      throw new Error("So e possivel adicionar objetos Exercicio a um plano.");
    }

    this.#exercicios.push(exercicio);
  }

  cloneParaCliente() {
    return new PlanoTreino({
      ...this.toJSON(),
      id: createId("plano-cliente"),
      templateId: this.templateId,
    });
  }

  toJSON() {
    return {
      ...super.toJSON(),
      templateId: this.templateId,
      nome: this.nome,
      objetivo: this.objetivo,
      duracaoSemanas: this.duracaoSemanas,
      nivel: this.nivel,
      mensalidadeSugerida: this.mensalidadeSugerida,
      exercicios: this.exercicios.map((item) => item.toJSON()),
    };
  }
}

class Cliente extends Pessoa {
  #objetivo;
  #mensalidade;
  #dataInscricao;
  #proximoVencimento;
  #instrutorId;
  #planoTreino;
  #notas;
  #ativo;

  constructor({
    id,
    nome,
    email,
    telefone,
    objetivo,
    mensalidade,
    dataInscricao,
    proximoVencimento,
    instrutorId,
    planoTreino,
    notas,
    ativo = true,
  }) {
    super({ id, nome, email, telefone });
    this.objetivo = objetivo;
    this.mensalidade = mensalidade;
    this.dataInscricao = dataInscricao;
    this.proximoVencimento = proximoVencimento;
    this.instrutorId = instrutorId;
    this.planoTreino = planoTreino ?? null;
    this.notas = notas ?? "";
    this.ativo = ativo;
  }

  get objetivo() {
    return this.#objetivo;
  }

  set objetivo(value) {
    this.#objetivo = ensureFilled(value, "Objetivo do cliente");
  }

  get mensalidade() {
    return this.#mensalidade;
  }

  set mensalidade(value) {
    this.#mensalidade = ensurePositiveNumber(value, "Mensalidade");
  }

  get dataInscricao() {
    return this.#dataInscricao;
  }

  set dataInscricao(value) {
    this.#dataInscricao = ensureFilled(value, "Data de inscricao");
  }

  get proximoVencimento() {
    return this.#proximoVencimento;
  }

  set proximoVencimento(value) {
    this.#proximoVencimento = ensureFilled(value, "Proximo vencimento");
  }

  get instrutorId() {
    return this.#instrutorId;
  }

  set instrutorId(value) {
    this.#instrutorId = ensureFilled(value, "Instrutor");
  }

  get planoTreino() {
    return this.#planoTreino;
  }

  set planoTreino(value) {
    if (value === null || value === "") {
      this.#planoTreino = null;
      return;
    }

    this.#planoTreino = value instanceof PlanoTreino ? value : new PlanoTreino(value);
  }

  get notas() {
    return this.#notas;
  }

  set notas(value) {
    this.#notas = String(value ?? "").trim();
  }

  get ativo() {
    return this.#ativo;
  }

  set ativo(value) {
    this.#ativo = Boolean(value);
  }

  get totalExerciciosPlano() {
    return this.planoTreino ? this.planoTreino.totalExercicios : 0;
  }

  associarPlano(planoTreino) {
    if (planoTreino === null) {
      this.#planoTreino = null;
      return;
    }

    if (!(planoTreino instanceof PlanoTreino)) {
      throw new Error("Associacao de plano invalida.");
    }

    this.#planoTreino = planoTreino.cloneParaCliente();
  }

  mostrarInfo() {
    return `Cliente ${this.nome} - objetivo ${this.objetivo} - plano ${this.planoTreino ? this.planoTreino.nome : "Sem plano"}`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      objetivo: this.objetivo,
      mensalidade: this.mensalidade,
      dataInscricao: this.dataInscricao,
      proximoVencimento: this.proximoVencimento,
      instrutorId: this.instrutorId,
      planoTreino: this.planoTreino ? this.planoTreino.toJSON() : null,
      notas: this.notas,
      ativo: this.ativo,
    };
  }
}

class Instrutor extends Pessoa {
  #especialidade;
  #certificacao;
  #turno;

  constructor({ id, nome, email, telefone, especialidade, certificacao, turno }) {
    super({ id, nome, email, telefone });
    this.especialidade = especialidade;
    this.certificacao = certificacao;
    this.turno = turno;
  }

  get especialidade() {
    return this.#especialidade;
  }

  set especialidade(value) {
    this.#especialidade = ensureFilled(value, "Especialidade");
  }

  get certificacao() {
    return this.#certificacao;
  }

  set certificacao(value) {
    this.#certificacao = ensureFilled(value, "Certificacao");
  }

  get turno() {
    return this.#turno;
  }

  set turno(value) {
    this.#turno = ensureFilled(value, "Turno");
  }

  mostrarInfo() {
    return `Instrutor ${this.nome} - ${this.especialidade} - turno ${this.turno}`;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      especialidade: this.especialidade,
      certificacao: this.certificacao,
      turno: this.turno,
    };
  }
}

class Pagamento extends EntidadeBase {
  #clienteId;
  #valor;
  #vencimento;
  #pagoEm;
  #metodo;

  constructor({ id, clienteId, valor, vencimento, pagoEm, metodo }) {
    super(id);
    this.clienteId = clienteId;
    this.valor = valor;
    this.vencimento = vencimento;
    this.pagoEm = pagoEm ?? null;
    this.metodo = metodo;
  }

  get clienteId() {
    return this.#clienteId;
  }

  set clienteId(value) {
    this.#clienteId = ensureFilled(value, "Cliente do pagamento");
  }

  get valor() {
    return this.#valor;
  }

  set valor(value) {
    this.#valor = ensurePositiveNumber(value, "Valor do pagamento");
  }

  get vencimento() {
    return this.#vencimento;
  }

  set vencimento(value) {
    this.#vencimento = ensureFilled(value, "Vencimento");
  }

  get pagoEm() {
    return this.#pagoEm;
  }

  set pagoEm(value) {
    this.#pagoEm = value ? ensureFilled(value, "Data de pagamento") : null;
  }

  get metodo() {
    return this.#metodo;
  }

  set metodo(value) {
    this.#metodo = ensureFilled(value, "Metodo");
  }

  get estaPago() {
    return Boolean(this.pagoEm);
  }

  get estado() {
    if (this.estaPago) {
      return "paid";
    }

    return new Date(this.vencimento) < startOfDay(new Date()) ? "overdue" : "pending";
  }

  toJSON() {
    return {
      ...super.toJSON(),
      clienteId: this.clienteId,
      valor: this.valor,
      vencimento: this.vencimento,
      pagoEm: this.pagoEm,
      metodo: this.metodo,
    };
  }
}

function createSeedState() {
  const today = startOfDay(new Date());

  const planosTreino = [
    new PlanoTreino({
      id: "plano-strength",
      nome: "Strength Forge",
      objetivo: "Forca e hipertrofia",
      duracaoSemanas: 8,
      nivel: "Intermedio",
      mensalidadeSugerida: 69,
      exercicios: [
        { nome: "Agachamento livre", series: 5, repeticoes: "5", descansoSegundos: 120, notas: "Foco em amplitude." },
        { nome: "Supino reto", series: 4, repeticoes: "6-8", descansoSegundos: 90, notas: "Controlar a descida." },
        { nome: "Levantamento terra romeno", series: 4, repeticoes: "8", descansoSegundos: 90, notas: "Manter lombar neutra." },
      ],
    }),
    new PlanoTreino({
      id: "plano-reset",
      nome: "Lean Reset",
      objetivo: "Perda de gordura e consistencia",
      duracaoSemanas: 6,
      nivel: "Iniciante",
      mensalidadeSugerida: 59,
      exercicios: [
        { nome: "Leg press", series: 3, repeticoes: "12", descansoSegundos: 60, notas: "Ritmo constante." },
        { nome: "Remada baixa", series: 3, repeticoes: "12", descansoSegundos: 60, notas: "Fechar escapulas." },
        { nome: "Bike intervalada", series: 6, repeticoes: "45s on / 30s off", descansoSegundos: 30, notas: "Respiracao controlada." },
      ],
    }),
    new PlanoTreino({
      id: "plano-mobility",
      nome: "Mobility Flow",
      objetivo: "Mobilidade, postura e saude articular",
      duracaoSemanas: 10,
      nivel: "Iniciante",
      mensalidadeSugerida: 49,
      exercicios: [
        { nome: "Cat Camel", series: 3, repeticoes: "10", descansoSegundos: 20, notas: "Movimento fluido." },
        { nome: "Goblet squat hold", series: 3, repeticoes: "30s", descansoSegundos: 30, notas: "Priorizar respiracao." },
        { nome: "Farmer carry", series: 4, repeticoes: "20m", descansoSegundos: 40, notas: "Tronco alto." },
      ],
    }),
    new PlanoTreino({
      id: "plano-engine",
      nome: "Engine Builder",
      objetivo: "Condicionamento e resistencia",
      duracaoSemanas: 7,
      nivel: "Avancado",
      mensalidadeSugerida: 64,
      exercicios: [
        { nome: "Air bike sprint", series: 8, repeticoes: "20s", descansoSegundos: 40, notas: "Potencia maxima." },
        { nome: "Kettlebell swing", series: 4, repeticoes: "15", descansoSegundos: 45, notas: "Anca explosiva." },
        { nome: "Burpee step down", series: 4, repeticoes: "10", descansoSegundos: 45, notas: "Qualidade sobre velocidade." },
      ],
    }),
  ];

  const instrutores = [
    new Instrutor({
      id: "instrutor-marta",
      nome: "Marta Faria",
      email: "marta@fitmanager.pt",
      telefone: "+351 910 111 001",
      especialidade: "Forca e composicao corporal",
      certificacao: "CSCS",
      turno: "07:00 - 15:00",
    }),
    new Instrutor({
      id: "instrutor-tiago",
      nome: "Tiago Sousa",
      email: "tiago@fitmanager.pt",
      telefone: "+351 910 111 002",
      especialidade: "Condicionamento metabolico",
      certificacao: "Cross Training Coach",
      turno: "09:00 - 17:00",
    }),
    new Instrutor({
      id: "instrutor-ines",
      nome: "Ines Duarte",
      email: "ines@fitmanager.pt",
      telefone: "+351 910 111 003",
      especialidade: "Mobilidade e longevidade",
      certificacao: "Mobility Specialist",
      turno: "12:00 - 20:00",
    }),
    new Instrutor({
      id: "instrutor-rodrigo",
      nome: "Rodrigo Nobre",
      email: "rodrigo@fitmanager.pt",
      telefone: "+351 910 111 004",
      especialidade: "Hipertrofia e performance",
      certificacao: "Strength Coach",
      turno: "15:00 - 22:00",
    }),
  ];

  const clientes = [
    new Cliente({
      id: "cliente-ana",
      nome: "Ana Ribeiro",
      email: "ana.ribeiro@email.pt",
      telefone: "+351 931 000 101",
      objetivo: "Hipertrofia",
      mensalidade: 69,
      dataInscricao: asDateInputValue(addDays(today, -150)),
      proximoVencimento: asDateInputValue(addDays(today, 5)),
      instrutorId: "instrutor-marta",
      planoTreino: planosTreino[0].cloneParaCliente().toJSON(),
      notas: "Cliente consistente e recetiva a progressao de carga.",
    }),
    new Cliente({
      id: "cliente-bruno",
      nome: "Bruno Costa",
      email: "bruno.costa@email.pt",
      telefone: "+351 931 000 102",
      objetivo: "Emagrecimento",
      mensalidade: 59,
      dataInscricao: asDateInputValue(addDays(today, -90)),
      proximoVencimento: asDateInputValue(addDays(today, -4)),
      instrutorId: "instrutor-tiago",
      planoTreino: planosTreino[1].cloneParaCliente().toJSON(),
      notas: "Precisa de rotina simples e contacto proativo quando falta.",
    }),
    new Cliente({
      id: "cliente-carla",
      nome: "Carla Mendes",
      email: "carla.mendes@email.pt",
      telefone: "+351 931 000 103",
      objetivo: "Mobilidade",
      mensalidade: 49,
      dataInscricao: asDateInputValue(addDays(today, -40)),
      proximoVencimento: asDateInputValue(addDays(today, 2)),
      instrutorId: "instrutor-ines",
      planoTreino: planosTreino[2].cloneParaCliente().toJSON(),
      notas: "Valoriza tecnica, postura e baixa friccao na experiencia.",
    }),
    new Cliente({
      id: "cliente-diogo",
      nome: "Diogo Afonso",
      email: "diogo.afonso@email.pt",
      telefone: "+351 931 000 104",
      objetivo: "Resistencia",
      mensalidade: 64,
      dataInscricao: asDateInputValue(addDays(today, -120)),
      proximoVencimento: asDateInputValue(addDays(today, -1)),
      instrutorId: "instrutor-tiago",
      planoTreino: planosTreino[3].cloneParaCliente().toJSON(),
      notas: "Tem boa adesao a sessoes curtas e intensas.",
    }),
    new Cliente({
      id: "cliente-filipa",
      nome: "Filipa Nunes",
      email: "filipa.nunes@email.pt",
      telefone: "+351 931 000 105",
      objetivo: "Recomposicao corporal",
      mensalidade: 69,
      dataInscricao: asDateInputValue(addDays(today, -210)),
      proximoVencimento: asDateInputValue(addDays(today, 11)),
      instrutorId: "instrutor-rodrigo",
      planoTreino: planosTreino[0].cloneParaCliente().toJSON(),
      notas: "Acompanha bem indicadores e gosta de estrutura.",
    }),
    new Cliente({
      id: "cliente-joao",
      nome: "Joao Freitas",
      email: "joao.freitas@email.pt",
      telefone: "+351 931 000 106",
      objetivo: "Saude geral",
      mensalidade: 49,
      dataInscricao: asDateInputValue(addDays(today, -55)),
      proximoVencimento: asDateInputValue(addDays(today, 8)),
      instrutorId: "instrutor-ines",
      planoTreino: null,
      notas: "Aguarda associacao de plano apos avaliacao inicial.",
    }),
  ];

  const pagamentos = [
    new Pagamento({
      id: "pagamento-1",
      clienteId: "cliente-ana",
      valor: 69,
      vencimento: asDateInputValue(addDays(today, -25)),
      pagoEm: asDateInputValue(addDays(today, -25)),
      metodo: "Cartao",
    }),
    new Pagamento({
      id: "pagamento-2",
      clienteId: "cliente-filipa",
      valor: 69,
      vencimento: asDateInputValue(addDays(today, -27)),
      pagoEm: asDateInputValue(addDays(today, -26)),
      metodo: "Multibanco",
    }),
    new Pagamento({
      id: "pagamento-3",
      clienteId: "cliente-carla",
      valor: 49,
      vencimento: asDateInputValue(addDays(today, -28)),
      pagoEm: asDateInputValue(addDays(today, -28)),
      metodo: "Debito direto",
    }),
    new Pagamento({
      id: "pagamento-4",
      clienteId: "cliente-bruno",
      valor: 59,
      vencimento: asDateInputValue(addDays(today, -4)),
      pagoEm: null,
      metodo: "MB Way",
    }),
    new Pagamento({
      id: "pagamento-5",
      clienteId: "cliente-diogo",
      valor: 64,
      vencimento: asDateInputValue(addDays(today, -1)),
      pagoEm: null,
      metodo: "Multibanco",
    }),
    new Pagamento({
      id: "pagamento-6",
      clienteId: "cliente-joao",
      valor: 49,
      vencimento: asDateInputValue(addDays(today, -10)),
      pagoEm: asDateInputValue(addDays(today, -9)),
      metodo: "Cartao",
    }),
  ];

  return {
    clientes,
    instrutores,
    planosTreino,
    pagamentos,
  };
}

class RepositorioFitManager {
  constructor(storageKey) {
    this.storageKey = storageKey;
    this.reset();
  }

  reset() {
    this.state = this.#load();
  }

  #load() {
    const raw = window.localStorage.getItem(this.storageKey);
    if (!raw) {
      const seed = createSeedState();
      this.#persist(seed);
      return seed;
    }

    try {
      const parsed = JSON.parse(raw);
      return {
        clientes: parsed.clientes.map((item) => new Cliente(item)),
        instrutores: parsed.instrutores.map((item) => new Instrutor(item)),
        planosTreino: parsed.planosTreino.map((item) => new PlanoTreino(item)),
        pagamentos: parsed.pagamentos.map((item) => new Pagamento(item)),
      };
    } catch (error) {
      console.error("Falha ao carregar o estado do FitManager. A repor demo.", error);
      const seed = createSeedState();
      this.#persist(seed);
      return seed;
    }
  }

  #persist(state = this.state) {
    const serialized = {
      clientes: state.clientes.map((item) => item.toJSON()),
      instrutores: state.instrutores.map((item) => item.toJSON()),
      planosTreino: state.planosTreino.map((item) => item.toJSON()),
      pagamentos: state.pagamentos.map((item) => item.toJSON()),
    };

    window.localStorage.setItem(this.storageKey, JSON.stringify(serialized));
  }

  save() {
    this.#persist();
  }

  list(collectionName) {
    return [...this.state[collectionName]];
  }

  add(collectionName, entity) {
    this.state[collectionName].push(entity);
    this.save();
    return entity;
  }

  find(collectionName, id) {
    return this.state[collectionName].find((item) => item.id === id) ?? null;
  }

  resetDemo() {
    this.state = createSeedState();
    this.save();
  }
}

class ServicoFitManager {
  constructor(repository) {
    this.repository = repository;
  }

  obterReferencias() {
    return {
      clientes: this.repository.list("clientes"),
      instrutores: this.repository.list("instrutores"),
      planosTreino: this.repository.list("planosTreino"),
    };
  }

  listarClientes({ pesquisa = "", filtroEstado = "all", instrutorId = "all" } = {}) {
    const instrutoresById = this.#indexById(this.repository.list("instrutores"));
    const termo = normalizeText(pesquisa);

    return this.repository
      .list("clientes")
      .filter((cliente) => !termo || normalizeText(cliente.nome).includes(termo))
      .map((cliente) => {
        const diasParaVencimento = daysBetween(new Date(), cliente.proximoVencimento);
        return {
          cliente,
          instrutor: instrutoresById[cliente.instrutorId] ?? null,
          diasParaVencimento,
          estadoCobranca: this.#estadoCobrancaPorDias(diasParaVencimento),
        };
      })
      .filter((entry) => {
        const matchesInstructor = instrutorId === "all" || entry.cliente.instrutorId === instrutorId;
        const matchesState = {
          all: true,
          overdue: entry.estadoCobranca.code === "overdue",
          alert: entry.estadoCobranca.code === "alert",
          current: entry.estadoCobranca.code === "current",
          "no-plan": !entry.cliente.planoTreino,
        }[filtroEstado] ?? true;

        return matchesInstructor && matchesState;
      })
      .sort((left, right) => left.cliente.nome.localeCompare(right.cliente.nome, "pt-PT"));
  }

  obterDetalheCliente(clienteId) {
    const cliente = this.repository.find("clientes", clienteId);
    if (!cliente) {
      return null;
    }

    const instrutor = this.repository.find("instrutores", cliente.instrutorId);
    const pagamentos = this.listarPagamentos()
      .filter((entry) => entry.cliente?.id === cliente.id)
      .slice(0, 4);
    const diasParaVencimento = daysBetween(new Date(), cliente.proximoVencimento);

    return {
      cliente,
      instrutor,
      pagamentos,
      diasParaVencimento,
      estadoCobranca: this.#estadoCobrancaPorDias(diasParaVencimento),
    };
  }

  listarInstrutores() {
    const clientes = this.repository.list("clientes");

    return this.repository.list("instrutores").map((instrutor) => {
      const clientesAssociados = clientes.filter((cliente) => cliente.instrutorId === instrutor.id);
      const planosAtivos = clientesAssociados.filter((cliente) => cliente.planoTreino).length;

      return {
        instrutor,
        clientesAssociados,
        planosAtivos,
      };
    });
  }

  listarPlanosTreino() {
    const clientes = this.repository.list("clientes");

    return this.repository
      .list("planosTreino")
      .map((plano) => {
        const clientesAssociados = clientes.filter((cliente) => cliente.planoTreino?.templateId === plano.id);
        return {
          plano,
          clientesAssociados,
        };
      })
      .sort((left, right) => right.clientesAssociados.length - left.clientesAssociados.length);
  }

  listarPagamentos() {
    const clientesById = this.#indexById(this.repository.list("clientes"));

    return this.repository
      .list("pagamentos")
      .map((pagamento) => ({
        pagamento,
        cliente: clientesById[pagamento.clienteId] ?? null,
      }))
      .sort((left, right) => {
        const leftDate = left.pagamento.pagoEm ?? left.pagamento.vencimento;
        const rightDate = right.pagamento.pagoEm ?? right.pagamento.vencimento;
        return new Date(rightDate) - new Date(leftDate);
      });
  }

  listarClientesEmAtraso() {
    return this.listarClientes()
      .filter((entry) => entry.estadoCobranca.code === "overdue")
      .sort((left, right) => left.diasParaVencimento - right.diasParaVencimento);
  }

  calcularTotalRecebido() {
    return this.listarPagamentos()
      .filter((entry) => entry.pagamento.estaPago)
      .reduce((sum, entry) => sum + entry.pagamento.valor, 0);
  }

  obterDashboard() {
    const clientes = this.listarClientes();
    const instrutores = this.listarInstrutores();
    const planos = this.listarPlanosTreino();
    const pagamentos = this.listarPagamentos();
    const clientesEmAtraso = this.listarClientesEmAtraso();
    const clientesComPlano = clientes.filter((entry) => entry.cliente.planoTreino).length;
    const totalRecebido = this.calcularTotalRecebido();
    const pagamentosRecentes = pagamentos.slice(0, 5);
    const ultimoPagamento = pagamentosRecentes[0] ?? null;
    const parseTimestamp = (value) => {
      const timestamp = Date.parse(value ?? "");
      return Number.isNaN(timestamp) ? 0 : timestamp;
    };
    const ultimoCliente = [...clientes]
      .sort((left, right) => parseTimestamp(right.cliente.dataInscricao) - parseTimestamp(left.cliente.dataInscricao))[0] ?? null;
    const ultimoPagamentoRecebido = [...pagamentos]
      .filter((entry) => entry.pagamento.estaPago)
      .sort((left, right) => parseTimestamp(right.pagamento.pagoEm) - parseTimestamp(left.pagamento.pagoEm))[0] ?? null;
    const planoEmFoco = [...planos]
      .sort((left, right) => right.clientesAssociados.length - left.clientesAssociados.length)[0] ?? null;

    return {
      heroCopy: `${clientes.length} clientes registados, ${instrutores.length} instrutores ativos e ${clientesEmAtraso.length} mensalidades a exigir seguimento imediato.`,
      heroTags: [
        `${formatCurrency.format(totalRecebido)} total recebido`,
        `${clientesComPlano}/${clientes.length} clientes com plano associado`,
        `${planos.length} templates de treino disponiveis`,
      ],
      stats: [
        {
          label: "Clientes",
          value: String(clientes.length),
          footnote: `${clientesComPlano} com plano de treino`,
        },
        {
          label: "Instrutores",
          value: String(instrutores.length),
          footnote: "Equipa tecnica registada",
        },
        {
          label: "Planos",
          value: String(planos.length),
          footnote: "Templates de treino disponiveis",
        },
        {
          label: "Pagamentos recentes",
          value: String(pagamentosRecentes.length),
          footnote: ultimoPagamento
            ? `${ultimoPagamento.cliente?.nome ?? "Cliente"} em ${formatShortDate.format(new Date(ultimoPagamento.pagamento.pagoEm ?? ultimoPagamento.pagamento.vencimento))}`
            : "Sem pagamentos recentes",
        },
        {
          label: "Clientes em atraso",
          value: String(clientesEmAtraso.length),
          footnote: clientesEmAtraso.length
            ? `${clientesEmAtraso[0].cliente.nome} e outros a acompanhar`
            : "Nenhuma mensalidade em atraso",
        },
      ],
      clientesEmAtraso: clientesEmAtraso.slice(0, 5),
      pagamentosRecentes,
      planosEmUso: planos.slice(0, 5),
      atividadeRecente: [
        ultimoCliente
          ? {
              label: "Novo cliente",
              title: `Novo cliente registado: ${ultimoCliente.cliente.nome}`,
              detail: `${formatShortDate.format(new Date(ultimoCliente.cliente.dataInscricao))} - ${ultimoCliente.instrutor?.nome ?? "Sem instrutor"}`,
              tone: "cyan",
            }
          : null,
        ultimoPagamentoRecebido
          ? {
              label: "Receita",
              title: `Pagamento recebido: ${formatCurrency.format(ultimoPagamentoRecebido.pagamento.valor)}`,
              detail: `${ultimoPagamentoRecebido.cliente?.nome ?? "Cliente"} - ${formatShortDate.format(new Date(ultimoPagamentoRecebido.pagamento.pagoEm))}`,
              tone: "green",
            }
          : null,
        planoEmFoco
          ? {
              label: "Planeamento",
              title: `Plano em foco: ${planoEmFoco.plano.nome}`,
              detail: `${planoEmFoco.clientesAssociados.length} clientes associados`,
              tone: "violet",
            }
          : null,
      ].filter(Boolean),
      totalRecebido,
    };
  }

  obterResumoFinanceiro() {
    const pagamentos = this.listarPagamentos();
    const clientesEmAtraso = this.listarClientesEmAtraso();
    const totalRecebido = this.calcularTotalRecebido();
    const valorEmAtraso = clientesEmAtraso.reduce((sum, entry) => sum + entry.cliente.mensalidade, 0);
    const pagamentosPendentes = pagamentos.filter((entry) => entry.pagamento.estado === "pending");

    return {
      stats: [
        {
          label: "Total recebido",
          value: formatCurrency.format(totalRecebido),
          footnote: "Calculado a partir de pagamentos pagos",
        },
        {
          label: "Valor em atraso",
          value: formatCurrency.format(valorEmAtraso),
          footnote: `${clientesEmAtraso.length} clientes com mensalidade vencida`,
        },
        {
          label: "Pendentes",
          value: formatCurrency.format(pagamentosPendentes.reduce((sum, entry) => sum + entry.pagamento.valor, 0)),
          footnote: `${pagamentosPendentes.length} registos ainda sem liquidacao`,
        },
        {
          label: "Pagamentos pagos",
          value: String(pagamentos.filter((entry) => entry.pagamento.estaPago).length),
          footnote: "Historico consolidado do ginasio",
        },
      ],
      pagamentos,
      clientesEmAtraso,
    };
  }

  adicionarCliente(formData) {
    const plano = formData.planoId ? this.repository.find("planosTreino", formData.planoId) : null;
    const cliente = new Cliente({
      id: createId("cliente"),
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      objetivo: formData.objetivo,
      mensalidade: formData.mensalidade,
      dataInscricao: formData.dataInscricao,
      proximoVencimento: formData.proximoVencimento,
      instrutorId: formData.instrutorId,
      planoTreino: plano ? plano.cloneParaCliente().toJSON() : null,
      notas: formData.notas ?? "",
      ativo: true,
    });

    this.repository.add("clientes", cliente);
    return cliente;
  }

  adicionarInstrutor(formData) {
    const instrutor = new Instrutor({
      id: createId("instrutor"),
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      especialidade: formData.especialidade,
      certificacao: formData.certificacao,
      turno: formData.turno,
    });

    this.repository.add("instrutores", instrutor);
    return instrutor;
  }

  criarPlanoTreino(formData, exercicios) {
    if (!exercicios.length) {
      throw new Error("Adiciona pelo menos um exercicio ao plano.");
    }

    const plano = new PlanoTreino({
      id: createId("plano"),
      nome: formData.nome,
      objetivo: formData.objetivo,
      duracaoSemanas: formData.duracaoSemanas,
      nivel: formData.nivel,
      mensalidadeSugerida: formData.mensalidadeSugerida,
      exercicios,
    });

    this.repository.add("planosTreino", plano);
    return plano;
  }

  adicionarExercicioAoPlano(planoId, formData) {
    const plano = this.repository.find("planosTreino", planoId);
    if (!plano) {
      throw new Error("Plano de treino nao encontrado.");
    }

    plano.adicionarExercicio(new Exercicio(formData));
    this.repository.save();
    return plano;
  }

  associarPlanoACliente(clienteId, planoId) {
    const cliente = this.repository.find("clientes", clienteId);
    if (!cliente) {
      throw new Error("Cliente nao encontrado.");
    }

    if (!planoId) {
      cliente.associarPlano(null);
      this.repository.save();
      return cliente;
    }

    const plano = this.repository.find("planosTreino", planoId);
    if (!plano) {
      throw new Error("Plano de treino nao encontrado.");
    }

    cliente.associarPlano(plano);
    this.repository.save();
    return cliente;
  }

  registarPagamento(formData) {
    const cliente = this.repository.find("clientes", formData.clienteId);
    if (!cliente) {
      throw new Error("Cliente nao encontrado para o pagamento.");
    }

    const pagamento = new Pagamento({
      id: createId("pagamento"),
      clienteId: formData.clienteId,
      valor: formData.valor,
      vencimento: formData.vencimento,
      pagoEm: formData.pagoEm || null,
      metodo: formData.metodo,
    });

    this.repository.add("pagamentos", pagamento);

    if (pagamento.estaPago) {
      this.#atualizarVencimentoCliente(cliente, formData.pagoEm);
      this.repository.save();
    }

    return pagamento;
  }

  liquidarPagamento(pagamentoId, pagoEm = asDateInputValue(new Date())) {
    const pagamento = this.repository.find("pagamentos", pagamentoId);
    if (!pagamento) {
      throw new Error("Pagamento nao encontrado.");
    }

    if (pagamento.estaPago) {
      return pagamento;
    }

    const cliente = this.repository.find("clientes", pagamento.clienteId);
    pagamento.pagoEm = pagoEm;
    if (cliente) {
      this.#atualizarVencimentoCliente(cliente, pagoEm);
    }
    this.repository.save();
    return pagamento;
  }

  reporDemo() {
    this.repository.resetDemo();
  }

  exportarEstado() {
    return {
      exportadoEm: new Date().toISOString(),
      clientes: this.repository.list("clientes").map((item) => item.toJSON()),
      instrutores: this.repository.list("instrutores").map((item) => item.toJSON()),
      planosTreino: this.repository.list("planosTreino").map((item) => item.toJSON()),
      pagamentos: this.repository.list("pagamentos").map((item) => item.toJSON()),
    };
  }

  #estadoCobrancaPorDias(diasParaVencimento) {
    if (diasParaVencimento < 0) {
      return { code: "overdue", tone: "danger", label: "Em atraso" };
    }

    if (diasParaVencimento <= 3) {
      return { code: "alert", tone: "alert", label: diasParaVencimento === 0 ? "Vence hoje" : "A vencer" };
    }

    return { code: "current", tone: "success", label: "Em dia" };
  }

  #indexById(collection) {
    return collection.reduce((index, item) => {
      index[item.id] = item;
      return index;
    }, {});
  }

  #atualizarVencimentoCliente(cliente, dataPagamento) {
    const referenceDate = new Date(
      Math.max(
        new Date(dataPagamento).getTime(),
        new Date(cliente.proximoVencimento).getTime(),
      ),
    );
    cliente.proximoVencimento = asDateInputValue(addDays(referenceDate, 30));
    cliente.ativo = true;
  }
}

class ToastCenter {
  constructor(container) {
    this.container = container;
  }

  show(title, message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(message)}</span>`;
    this.container.appendChild(toast);
    window.setTimeout(() => toast.remove(), 3200);
  }
}

class AplicacaoFitManager {
  constructor(service) {
    this.service = service;
    this.state = {
      activeSection: "dashboard",
      pesquisaClientes: "",
      filtroEstadoCliente: "all",
      filtroInstrutorCliente: "all",
      selectedClientId: null,
      rascunhoExercicios: [],
    };
    this.elements = this.#collectElements();
    this.toastCenter = new ToastCenter(this.elements.toastContainer);
  }

  init() {
    this.#bindEvents();
    this.#populateReferenceFields();
    this.#setFormDefaults();
    this.#renderDraftExercises();
    const clientes = this.service.listarClientes();
    this.state.selectedClientId = clientes[0]?.cliente.id ?? null;
    this.render();
  }

  render() {
    this.#renderNavigation();
    this.#renderDashboard();
    this.#renderClients();
    this.#renderPlans();
    this.#renderFinance();
    this.#renderInstructors();
  }

  #collectElements() {
    return {
      navLinks: [...document.querySelectorAll("[data-section-target]")],
      sections: [...document.querySelectorAll(".section-panel")],
      dialogClosers: [...document.querySelectorAll("[data-close-dialog]")],
      btnNovoCliente: document.getElementById("btnNovoCliente"),
      btnNovoInstrutor: document.getElementById("btnNovoInstrutor"),
      btnNovoPlano: document.getElementById("btnNovoPlano"),
      btnAdicionarExercicio: document.getElementById("btnAdicionarExercicio"),
      btnRegistarPagamento: document.getElementById("btnRegistarPagamento"),
      btnExportarDados: document.getElementById("btnExportarDados"),
      topbarEyebrow: document.getElementById("topbar-eyebrow"),
      topbarTitle: document.getElementById("topbar-title"),
      sidebarDate: document.getElementById("sidebar-date"),
      miniTotalReceived: document.getElementById("mini-total-received"),
      miniOverdueCount: document.getElementById("mini-overdue-count"),
      heroCopy: document.getElementById("hero-copy"),
      heroTags: document.getElementById("hero-tags"),
      statsGrid: document.getElementById("stats-grid"),
      dashboardOverdueList: document.getElementById("dashboard-overdue-list"),
      dashboardPaymentsList: document.getElementById("dashboard-payments-list"),
      dashboardActivityList: document.getElementById("dashboard-activity-list"),
      dashboardRevenueChart: document.getElementById("dashboard-revenue-chart"),
      clientSearchInput: document.getElementById("client-search-input"),
      clientStatusFilter: document.getElementById("client-status-filter"),
      clientInstructorFilter: document.getElementById("client-instructor-filter"),
      clientsCount: document.getElementById("clients-count"),
      clientsTableBody: document.getElementById("clients-table-body"),
      clientDetailPanel: document.getElementById("client-detail-panel"),
      plansMetricStrip: document.getElementById("plans-metric-strip"),
      plansGrid: document.getElementById("plans-grid"),
      financeStatsGrid: document.getElementById("finance-stats-grid"),
      paymentsTableBody: document.getElementById("payments-table-body"),
      financeOverdueList: document.getElementById("finance-overdue-list"),
      instructorsGrid: document.getElementById("instructors-grid"),
      clientDialog: document.getElementById("client-dialog"),
      clientForm: document.getElementById("client-form"),
      clientInstructorSelect: document.getElementById("client-instructor-select"),
      clientPlanSelect: document.getElementById("client-plan-select"),
      clientMonthlyFeeInput: document.getElementById("client-monthly-fee-input"),
      instructorDialog: document.getElementById("instructor-dialog"),
      instructorForm: document.getElementById("instructor-form"),
      planDialog: document.getElementById("plan-dialog"),
      planForm: document.getElementById("plan-form"),
      draftExerciseName: document.getElementById("draft-exercise-name"),
      draftExerciseSeries: document.getElementById("draft-exercise-series"),
      draftExerciseRepetitions: document.getElementById("draft-exercise-repetitions"),
      draftExerciseRest: document.getElementById("draft-exercise-rest"),
      draftExerciseNotes: document.getElementById("draft-exercise-notes"),
      addDraftExerciseButton: document.getElementById("add-draft-exercise-button"),
      draftExercisesCount: document.getElementById("draft-exercises-count"),
      draftExercisesList: document.getElementById("draft-exercises-list"),
      exerciseDialog: document.getElementById("exercise-dialog"),
      exerciseForm: document.getElementById("exercise-form"),
      exercisePlanLabel: document.getElementById("exercise-plan-label"),
      exercisePlanIdInput: document.getElementById("exercise-plan-id-input"),
      exercisePlanSelect: document.getElementById("exercise-plan-select"),
      paymentDialog: document.getElementById("payment-dialog"),
      paymentForm: document.getElementById("payment-form"),
      paymentClientSelect: document.getElementById("payment-client-select"),
      paymentAmountInput: document.getElementById("payment-amount-input"),
      paymentDueDateInput: document.getElementById("payment-due-date-input"),
      resetDemoButton: document.getElementById("reset-demo-button"),
      toastContainer: document.getElementById("toast-container"),
    };
  }

  #bindEvents() {
    this.elements.navLinks.forEach((button) => {
      button.addEventListener("click", () => {
        this.state.activeSection = button.dataset.sectionTarget;
        this.#renderNavigation();
      });
    });

    this.elements.btnNovoCliente?.addEventListener("click", () => {
      this.elements.clientForm.reset();
      this.#setFormDefaults();
      this.elements.clientDialog?.showModal();
    });

    this.elements.btnNovoInstrutor?.addEventListener("click", () => {
      this.elements.instructorForm.reset();
      this.elements.instructorDialog?.showModal();
    });

    this.elements.btnNovoPlano?.addEventListener("click", () => {
      this.state.rascunhoExercicios = [];
      this.elements.planForm.reset();
      this.#setFormDefaults();
      this.#renderDraftExercises();
      this.elements.planDialog?.showModal();
    });

    this.elements.btnAdicionarExercicio?.addEventListener("click", () => {
      this.elements.exerciseForm.reset();
      this.#prepareExerciseDialog();
      this.elements.exerciseDialog?.showModal();
    });

    this.elements.btnRegistarPagamento?.addEventListener("click", () => {
      this.elements.paymentForm.reset();
      this.#setFormDefaults();
      this.#preparePaymentDialog(this.state.selectedClientId || this.elements.paymentClientSelect.value, { clearPaidDate: true });
      this.elements.paymentDialog?.showModal();
    });

    this.elements.btnExportarDados?.addEventListener("click", () => {
      this.#exportData();
    });

    this.elements.dialogClosers.forEach((button) => {
      button.addEventListener("click", () => {
        document.getElementById(button.dataset.closeDialog)?.close();
      });
    });

    this.elements.clientSearchInput.addEventListener("input", (event) => {
      this.state.pesquisaClientes = event.target.value;
      this.#renderClients();
    });

    this.elements.clientStatusFilter.addEventListener("change", (event) => {
      this.state.filtroEstadoCliente = event.target.value;
      this.#renderClients();
    });

    this.elements.clientInstructorFilter.addEventListener("change", (event) => {
      this.state.filtroInstrutorCliente = event.target.value;
      this.#renderClients();
    });

    this.elements.clientsTableBody.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const row = target.closest("[data-client-id]");
      if (!row) {
        return;
      }

      const clientId = row.dataset.clientId;
      if (!clientId) {
        return;
      }

      this.state.selectedClientId = clientId;
      this.#renderClients();
    });

    this.elements.clientDetailPanel.addEventListener("submit", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLFormElement) || target.dataset.action !== "assign-plan") {
        return;
      }

      event.preventDefault();
      const formData = new FormData(target);
      this.service.associarPlanoACliente(formData.get("clienteId"), formData.get("planoId"));
      this.toastCenter.show("Plano associado", "O plano de treino do cliente foi atualizado.");
      this.render();
    });

    this.elements.clientForm.addEventListener("submit", (event) => {
      event.preventDefault();

      try {
        const formData = new FormData(this.elements.clientForm);
        const cliente = this.service.adicionarCliente({
          nome: formData.get("nome"),
          email: formData.get("email"),
          telefone: formData.get("telefone"),
          objetivo: formData.get("objetivo"),
          mensalidade: formData.get("mensalidade"),
          dataInscricao: formData.get("dataInscricao"),
          proximoVencimento: formData.get("proximoVencimento"),
          instrutorId: formData.get("instrutorId"),
          planoId: formData.get("planoId"),
          notas: formData.get("notas"),
        });
        this.state.selectedClientId = cliente.id;
        this.elements.clientForm.reset();
        this.#populateReferenceFields();
        this.#setFormDefaults();
        this.elements.clientDialog.close();
        this.toastCenter.show("Cliente registado", "O novo cliente entrou na base do FitManager.");
        this.render();
      } catch (error) {
        this.toastCenter.show("Nao foi possivel guardar", error.message);
      }
    });

    this.elements.instructorForm.addEventListener("submit", (event) => {
      event.preventDefault();

      try {
        const formData = new FormData(this.elements.instructorForm);
        this.service.adicionarInstrutor({
          nome: formData.get("nome"),
          email: formData.get("email"),
          telefone: formData.get("telefone"),
          especialidade: formData.get("especialidade"),
          certificacao: formData.get("certificacao"),
          turno: formData.get("turno"),
        });
        this.elements.instructorForm.reset();
        this.#populateReferenceFields();
        this.elements.instructorDialog.close();
        this.toastCenter.show("Instrutor registado", "A equipa tecnica foi atualizada.");
        this.render();
      } catch (error) {
        this.toastCenter.show("Nao foi possivel guardar", error.message);
      }
    });

    this.elements.addDraftExerciseButton.addEventListener("click", () => {
      try {
        const exercicio = new Exercicio({
          nome: this.elements.draftExerciseName.value,
          series: this.elements.draftExerciseSeries.value,
          repeticoes: this.elements.draftExerciseRepetitions.value,
          descansoSegundos: this.elements.draftExerciseRest.value,
          notas: this.elements.draftExerciseNotes.value,
        });
        this.state.rascunhoExercicios.push(exercicio.toJSON());
        this.#clearDraftExerciseFields();
        this.#renderDraftExercises();
      } catch (error) {
        this.toastCenter.show("Exercicio invalido", error.message);
      }
    });

    this.elements.draftExercisesList.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || target.dataset.action !== "remove-draft-exercise") {
        return;
      }

      const index = Number(target.dataset.index);
      this.state.rascunhoExercicios.splice(index, 1);
      this.#renderDraftExercises();
    });

    this.elements.planForm.addEventListener("submit", (event) => {
      event.preventDefault();

      try {
        const formData = new FormData(this.elements.planForm);
        this.service.criarPlanoTreino({
          nome: formData.get("nome"),
          objetivo: formData.get("objetivo"),
          duracaoSemanas: formData.get("duracaoSemanas"),
          nivel: formData.get("nivel"),
          mensalidadeSugerida: formData.get("mensalidadeSugerida"),
        }, this.state.rascunhoExercicios);
        this.state.rascunhoExercicios = [];
        this.elements.planForm.reset();
        this.#populateReferenceFields();
        this.#setFormDefaults();
        this.#renderDraftExercises();
        this.elements.planDialog.close();
        this.toastCenter.show("Plano criado", "O novo template de treino ficou disponivel.");
        this.render();
      } catch (error) {
        this.toastCenter.show("Nao foi possivel guardar", error.message);
      }
    });

    this.elements.plansGrid.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement) || target.dataset.action !== "open-exercise-dialog") {
        return;
      }

      const planId = target.dataset.planId;
      this.#prepareExerciseDialog(planId);
      this.elements.exerciseDialog.showModal();
    });

    this.elements.exercisePlanSelect.addEventListener("change", () => {
      this.#syncExercisePlanSelection(this.elements.exercisePlanSelect.value);
    });

    this.elements.exerciseForm.addEventListener("submit", (event) => {
      event.preventDefault();

      try {
        const formData = new FormData(this.elements.exerciseForm);
        const planId = this.elements.exercisePlanIdInput.value || formData.get("planoIdSelect");
        this.service.adicionarExercicioAoPlano(planId, {
          nome: formData.get("nome"),
          series: formData.get("series"),
          repeticoes: formData.get("repeticoes"),
          descansoSegundos: formData.get("descansoSegundos"),
          notas: formData.get("notas"),
        });
        this.elements.exerciseForm.reset();
        this.#populateReferenceFields();
        this.#prepareExerciseDialog(planId);
        this.elements.exerciseDialog.close();
        this.toastCenter.show("Exercicio adicionado", "O plano de treino foi atualizado.");
        this.render();
      } catch (error) {
        this.toastCenter.show("Nao foi possivel guardar", error.message);
      }
    });

    this.elements.paymentClientSelect.addEventListener("change", () => {
      this.#syncPaymentFields();
    });

    this.elements.dashboardOverdueList.addEventListener("click", (event) => {
      this.#handleQuickActions(event);
    });

    this.elements.financeOverdueList.addEventListener("click", (event) => {
      this.#handleQuickActions(event);
    });

    this.elements.paymentsTableBody.addEventListener("click", (event) => {
      this.#handleQuickActions(event);
    });

    this.elements.clientPlanSelect.addEventListener("change", () => {
      const plano = this.service.obterReferencias().planosTreino.find((item) => item.id === this.elements.clientPlanSelect.value);
      if (plano && !this.elements.clientMonthlyFeeInput.value) {
        this.elements.clientMonthlyFeeInput.value = String(plano.mensalidadeSugerida);
      }
    });

    this.elements.paymentForm.addEventListener("submit", (event) => {
      event.preventDefault();

      try {
        const formData = new FormData(this.elements.paymentForm);
        this.service.registarPagamento({
          clienteId: formData.get("clienteId"),
          valor: formData.get("valor"),
          vencimento: formData.get("vencimento"),
          pagoEm: formData.get("pagoEm"),
          metodo: formData.get("metodo"),
        });
        this.elements.paymentForm.reset();
        this.#populateReferenceFields();
        this.#setFormDefaults();
        this.elements.paymentDialog.close();
        this.toastCenter.show("Pagamento registado", "O financeiro e a mensalidade do cliente foram recalculados.");
        this.render();
      } catch (error) {
        this.toastCenter.show("Nao foi possivel guardar", error.message);
      }
    });

    this.elements.resetDemoButton.addEventListener("click", () => {
      this.service.reporDemo();
      this.state.rascunhoExercicios = [];
      this.#populateReferenceFields();
      this.#setFormDefaults();
      this.#renderDraftExercises();
      const clientes = this.service.listarClientes();
      this.state.selectedClientId = clientes[0]?.cliente.id ?? null;
      this.toastCenter.show("Demo reposta", "O FitManager voltou ao estado inicial.");
      this.render();
    });
  }

  #renderNavigation() {
    this.elements.navLinks.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.sectionTarget === this.state.activeSection);
    });
    this.#renderTopbar();
    this.#toggleVisibleSection();
  }

  #renderTopbar() {
    const sectionMeta = {
      dashboard: {
        eyebrow: "Plataforma profissional de gestao",
        title: "Dashboard",
      },
      clients: {
        eyebrow: "Relacao com clientes",
        title: "Clientes",
      },
      plans: {
        eyebrow: "POO aplicada ao treino",
        title: "Planos de treino",
      },
      instructors: {
        eyebrow: "Equipa tecnica",
        title: "Instrutores",
      },
      finance: {
        eyebrow: "Controlo financeiro",
        title: "Financeiro",
      },
    };
    const currentMeta = sectionMeta[this.state.activeSection] ?? sectionMeta.dashboard;
    this.elements.topbarEyebrow.textContent = currentMeta.eyebrow;
    this.elements.topbarTitle.textContent = currentMeta.title;
  }

  #toggleVisibleSection() {
    this.elements.sections.forEach((section) => {
      section.classList.toggle("is-visible", section.id === `${this.state.activeSection}-section`);
    });
  }

  #renderDashboard() {
    const dashboard = this.service.obterDashboard();
    const allPayments = this.service.listarPagamentos();
    const today = startOfDay(new Date());
    const revenueSeries = Array.from({ length: 7 }, (_, index) => {
      const day = addDays(today, index - 6);
      const value = allPayments
        .filter((entry) => {
          const movementDate = startOfDay(entry.pagamento.pagoEm ?? entry.pagamento.vencimento);
          return movementDate.getTime() === day.getTime();
        })
        .reduce((sum, entry) => sum + entry.pagamento.valor, 0);

      return {
        label: formatWeekdayShort.format(day).replace(".", ""),
        value,
      };
    });
    const revenueMax = Math.max(...revenueSeries.map((point) => point.value), 1);
    const mockupStats = [
      {
        label: "Clientes ativos",
        value: dashboard.stats[0]?.value ?? "0",
        footnote: dashboard.stats[0]?.footnote ?? "Sem clientes registados",
        tone: "cyan",
      },
      {
        label: "Instrutores ativos",
        value: dashboard.stats[1]?.value ?? "0",
        footnote: dashboard.stats[1]?.footnote ?? "Sem instrutores registados",
        tone: "violet",
      },
      {
        label: "Receita total",
        value: formatCurrency.format(dashboard.totalRecebido),
        footnote: `${dashboard.pagamentosRecentes.length} movimentos recentes`,
        tone: "green",
      },
      {
        label: "Alertas ativos",
        value: String(dashboard.clientesEmAtraso.length),
        footnote: dashboard.clientesEmAtraso.length
          ? `${dashboard.clientesEmAtraso[0].cliente.nome} a exigir seguimento`
          : "Nenhuma mensalidade em atraso",
        tone: "teal",
      },
    ];

    this.elements.sidebarDate.textContent = formatLongDate.format(new Date());
    this.elements.miniTotalReceived.textContent = formatCurrency.format(dashboard.totalRecebido);
    this.elements.miniOverdueCount.textContent = String(dashboard.clientesEmAtraso.length);
    this.elements.heroCopy.textContent = dashboard.heroCopy;
    this.elements.heroTags.innerHTML = dashboard.heroTags
      .map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`)
      .join("");

    this.elements.statsGrid.innerHTML = mockupStats
      .map((stat) => `
        <article class="mock-stat-card tone-${escapeHtml(stat.tone)}">
          <span class="mock-stat-label">${escapeHtml(stat.label)}</span>
          <strong class="mock-stat-value">${escapeHtml(stat.value)}</strong>
          <span class="mock-stat-footnote">${escapeHtml(stat.footnote)}</span>
          <span class="mock-stat-wave" aria-hidden="true"></span>
        </article>
      `)
      .join("");

    this.elements.dashboardOverdueList.innerHTML = dashboard.clientesEmAtraso.length
      ? dashboard.clientesEmAtraso.map((entry) => `
          <article class="mock-alert-card">
            <div class="mock-alert-top">
              <span class="mock-row-icon warning" aria-hidden="true">!</span>
              <div class="mock-row-copy">
                <strong>${escapeHtml(entry.cliente.nome)}</strong>
                <span>${formatCurrency.format(entry.cliente.mensalidade)} - vencimento ${formatShortDate.format(new Date(entry.cliente.proximoVencimento))}</span>
              </div>
              <span class="mock-inline-pill ${escapeHtml(entry.estadoCobranca.tone)}">${escapeHtml(entry.estadoCobranca.label)}</span>
            </div>
            <div class="stack-actions mock-row-actions">
              <button class="small-action" data-action="prefill-payment" data-client-id="${escapeHtml(entry.cliente.id)}" type="button">Registar pagamento</button>
              <button class="small-action subtle-action" data-action="open-client" data-client-id="${escapeHtml(entry.cliente.id)}" type="button">Abrir cliente</button>
            </div>
          </article>
        `).join("")
      : `<div class="mock-empty">Sem clientes com mensalidade em atraso.</div>`;

    this.elements.dashboardPaymentsList.innerHTML = dashboard.pagamentosRecentes.length
      ? dashboard.pagamentosRecentes.map((entry) => `
          <article class="mock-payment-row">
            <div class="mock-row-copy">
              <strong>${escapeHtml(entry.cliente?.nome ?? "Cliente removido")}</strong>
              <span>${escapeHtml(entry.pagamento.metodo)} - ${entry.pagamento.estaPago ? "pago em" : "vence em"} ${formatShortDate.format(new Date(entry.pagamento.pagoEm ?? entry.pagamento.vencimento))}</span>
            </div>
            <div class="mock-payment-meta">
              <strong>${formatCurrency.format(entry.pagamento.valor)}</strong>
              <span class="mock-inline-pill ${this.#paymentTone(entry.pagamento.estado)}">${escapeHtml(this.#paymentLabel(entry.pagamento.estado))}</span>
            </div>
          </article>
        `).join("")
      : `<div class="mock-empty">Ainda nao existem pagamentos registados no sistema.</div>`;

    this.elements.dashboardActivityList.innerHTML = dashboard.atividadeRecente.length
      ? dashboard.atividadeRecente.map((entry) => `
          <article class="mock-plan-card">
            <div class="mock-row-copy">
              <strong>${escapeHtml(entry.title)}</strong>
              <span>${escapeHtml(entry.detail)}</span>
            </div>
            <span class="mock-inline-pill ${escapeHtml(entry.tone)}">${escapeHtml(entry.label)}</span>
          </article>
        `).join("")
      : `<div class="mock-empty">Ainda nao existem eventos recentes para mostrar.</div>`;

    this.elements.dashboardRevenueChart.innerHTML = `
      <div class="revenue-chart-head">
        <strong>${formatCurrency.format(revenueSeries.reduce((sum, point) => sum + point.value, 0))}</strong>
        <span>Fluxo financeiro agregado por dia</span>
      </div>
      <div class="revenue-chart-bars">
        ${revenueSeries.map((point) => `
          <article class="revenue-chart-column">
            <span class="revenue-chart-value">${formatCurrency.format(point.value)}</span>
            <div class="revenue-chart-track">
              <span class="revenue-chart-fill" style="height:${point.value ? Math.max(14, Math.round((point.value / revenueMax) * 100)) : 0}%"></span>
            </div>
            <span class="revenue-chart-label">${escapeHtml(point.label)}</span>
          </article>
        `).join("")}
      </div>
    `;
  }

  #renderClients() {
    const clients = this.service.listarClientes({
      pesquisa: this.state.pesquisaClientes,
      filtroEstado: this.state.filtroEstadoCliente,
      instrutorId: this.state.filtroInstrutorCliente,
    });
    this.elements.clientsCount.textContent = `${clients.length} clientes`;

    if (!clients.some((entry) => entry.cliente.id === this.state.selectedClientId)) {
      this.state.selectedClientId = clients[0]?.cliente.id ?? null;
    }

    this.elements.clientsTableBody.innerHTML = clients.length
      ? clients.map((entry) => `
          <tr data-client-id="${escapeHtml(entry.cliente.id)}" aria-selected="${entry.cliente.id === this.state.selectedClientId}">
            <td>
              <div class="table-member">
                <div class="avatar">${escapeHtml(entry.cliente.iniciais)}</div>
                <div>
                  <div class="member-name">${escapeHtml(entry.cliente.nome)}</div>
                  <div class="member-meta">${escapeHtml(entry.cliente.objetivo)}</div>
                </div>
              </div>
            </td>
            <td>${escapeHtml(entry.cliente.planoTreino?.nome ?? "Sem plano")}</td>
            <td>${escapeHtml(entry.instrutor?.nome ?? "Sem instrutor")}</td>
            <td>${formatCurrency.format(entry.cliente.mensalidade)}</td>
            <td>
              <div>${formatShortDate.format(new Date(entry.cliente.proximoVencimento))}</div>
              <div class="table-muted">${escapeHtml(entry.estadoCobranca.label)}</div>
            </td>
          </tr>
        `).join("")
      : `<tr><td colspan="5"><div class="is-empty">Nenhum cliente encontrado para esta pesquisa.</div></td></tr>`;

    const detail = this.state.selectedClientId ? this.service.obterDetalheCliente(this.state.selectedClientId) : null;
    if (!detail) {
      this.elements.clientDetailPanel.innerHTML = `
        <div class="empty-state">
          <p class="eyebrow">Detalhe</p>
          <h3>Seleciona um cliente</h3>
          <p>O detalhe mostra o plano composto por exercicios, historico financeiro e o comportamento polimorfico do dominio.</p>
        </div>
      `;
      return;
    }

    const planOptions = this.service.obterReferencias().planosTreino
      .map((plano) => `
        <option value="${escapeHtml(plano.id)}" ${detail.cliente.planoTreino?.templateId === plano.id ? "selected" : ""}>
          ${escapeHtml(plano.nome)}
        </option>
      `)
      .join("");

    this.elements.clientDetailPanel.innerHTML = `
      <div class="detail-card">
        <div class="detail-hero">
          <div class="avatar large">${escapeHtml(detail.cliente.iniciais)}</div>
          <div>
            <p class="eyebrow">Cliente selecionado</p>
            <h3>${escapeHtml(detail.cliente.nome)}</h3>
            <p class="detail-copy">${escapeHtml(detail.cliente.mostrarInfo())}</p>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-metric">
            <span>Instrutor</span>
            <strong>${escapeHtml(detail.instrutor?.nome ?? "Sem instrutor")}</strong>
          </div>
          <div class="detail-metric">
            <span>Mensalidade</span>
            <strong>${formatCurrency.format(detail.cliente.mensalidade)}</strong>
          </div>
          <div class="detail-metric">
            <span>Vencimento</span>
            <strong>${formatShortDate.format(new Date(detail.cliente.proximoVencimento))}</strong>
          </div>
          <div class="detail-metric">
            <span>Exercicios no plano</span>
            <strong>${detail.cliente.totalExerciciosPlano}</strong>
          </div>
        </div>

        <article class="stack-item info-snippet">
          <div class="stack-top">
            <strong>Estado da mensalidade</strong>
            <span class="chip ${detail.estadoCobranca.tone}">${escapeHtml(detail.estadoCobranca.label)}</span>
          </div>
          <p>${escapeHtml(detail.instrutor?.mostrarInfo() ?? "Sem instrutor associado.")}</p>
        </article>

        <article class="stack-item">
          <div class="stack-top">
            <strong>Plano atual</strong>
            <span class="chip">${escapeHtml(detail.cliente.planoTreino?.nome ?? "Sem plano")}</span>
          </div>
          <div class="exercise-list">
            ${
              detail.cliente.planoTreino
                ? detail.cliente.planoTreino.exercicios.map((exercicio) => `
                    <div class="exercise-item">
                      <strong>${escapeHtml(exercicio.nome)}</strong>
                      <span>${escapeHtml(exercicio.resumo)}</span>
                    </div>
                  `).join("")
                : `<div class="is-empty">Este cliente ainda nao tem um plano associado.</div>`
            }
          </div>
        </article>

        <form class="detail-form" data-action="assign-plan">
          <input name="clienteId" type="hidden" value="${escapeHtml(detail.cliente.id)}">
          <label class="field">
            <span>Associar plano a cliente</span>
            <select name="planoId">
              <option value="">Sem plano</option>
              ${planOptions}
            </select>
          </label>
          <button class="primary-button" type="submit">Guardar associacao</button>
        </form>

        <article class="stack-item">
          <div class="stack-top">
            <strong>Pagamentos recentes</strong>
            <span class="chip">${detail.pagamentos.length}</span>
          </div>
          <div class="highlight-list">
            ${
              detail.pagamentos.length
                ? detail.pagamentos.map((entry) => `
                    <div class="highlight-item">
                      <span>${formatShortDate.format(new Date(entry.pagamento.vencimento))}</span>
                      <strong>${formatCurrency.format(entry.pagamento.valor)}</strong>
                      <span class="chip ${this.#paymentTone(entry.pagamento.estado)}">${escapeHtml(this.#paymentLabel(entry.pagamento.estado))}</span>
                    </div>
                  `).join("")
                : `<div class="is-empty">Ainda nao ha pagamentos registados para este cliente.</div>`
            }
          </div>
        </article>
      </div>
    `;
  }

  #renderPlans() {
    const plans = this.service.listarPlanosTreino();
    const totalExercises = plans.reduce((sum, entry) => sum + entry.plano.totalExercicios, 0);
    this.elements.plansMetricStrip.innerHTML = `
      <span class="chip">${plans.length} planos</span>
      <span class="chip">${totalExercises} exercicios catalogados</span>
      <span class="chip">${plans.reduce((sum, entry) => sum + entry.clientesAssociados.length, 0)} associacoes ativas</span>
    `;
    this.elements.plansGrid.innerHTML = plans.length
      ? plans.map((entry, index) => {
          const presentation = getPlanPresentation(entry.plano, index);
          return `
            <article class="class-card plan-card">
              <div class="plan-visual ${escapeHtml(presentation.themeClass)}">
                <div class="module-visual-top">
                  <span class="module-badge">${escapeHtml(presentation.badge)}</span>
                  <span class="module-orb">
                    <svg class="module-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
                      <use href="#${escapeHtml(presentation.iconId)}"></use>
                    </svg>
                  </span>
                </div>
                <div class="module-copy">
                  <strong>${escapeHtml(presentation.headline)}</strong>
                  <span>${escapeHtml(presentation.accent)}</span>
                </div>
                <div class="module-stat-row">
                  <span class="module-mini-stat">
                    <strong>${entry.plano.duracaoSemanas}</strong>
                    <small>semanas</small>
                  </span>
                  <span class="module-mini-stat">
                    <strong>${entry.plano.totalExercicios}</strong>
                    <small>exercicios</small>
                  </span>
                  <span class="module-mini-stat">
                    <strong>${entry.clientesAssociados.length}</strong>
                    <small>clientes</small>
                  </span>
                </div>
              </div>
              <div class="class-top">
                <div>
                  <p class="eyebrow">${escapeHtml(entry.plano.nivel)}</p>
                  <div class="class-title">${escapeHtml(entry.plano.nome)}</div>
                </div>
                <span class="chip">${entry.plano.totalExercicios} exercicios</span>
              </div>
              <p class="class-copy">${escapeHtml(entry.plano.objetivo)}</p>
              <div class="class-meta-grid">
                <div class="metric-block">
                  <span>Duracao</span>
                  <strong>${entry.plano.duracaoSemanas} semanas</strong>
                </div>
                <div class="metric-block">
                  <span>Mensalidade sugerida</span>
                  <strong>${formatCurrency.format(entry.plano.mensalidadeSugerida)}</strong>
                </div>
                <div class="metric-block">
                  <span>Clientes associados</span>
                  <strong>${entry.clientesAssociados.length}</strong>
                </div>
                <div class="metric-block">
                  <span>Nivel</span>
                  <strong>${escapeHtml(entry.plano.nivel)}</strong>
                </div>
              </div>
              <div class="exercise-list">
                ${entry.plano.exercicios.map((exercicio) => `
                  <div class="exercise-item">
                    <strong>${escapeHtml(exercicio.nome)}</strong>
                    <span>${escapeHtml(exercicio.resumo)}</span>
                  </div>
                `).join("")}
              </div>
              <div class="section-actions">
                <button class="secondary-button" data-action="open-exercise-dialog" data-plan-id="${escapeHtml(entry.plano.id)}" type="button">
                  Adicionar exercicio
                </button>
              </div>
            </article>
          `;
        }).join("")
      : `<div class="is-empty">Ainda nao existem planos criados.</div>`;
  }

  #renderFinance() {
    const finance = this.service.obterResumoFinanceiro();
    this.elements.financeStatsGrid.innerHTML = finance.stats
      .map((stat) => `
        <article class="stat-card">
          <span class="stat-label">${escapeHtml(stat.label)}</span>
          <strong class="stat-value">${escapeHtml(stat.value)}</strong>
          <span class="stat-footnote">${escapeHtml(stat.footnote)}</span>
        </article>
      `)
      .join("");
    this.elements.paymentsTableBody.innerHTML = finance.pagamentos.length
      ? finance.pagamentos.map((entry) => `
          <tr>
            <td>${escapeHtml(entry.cliente?.nome ?? "Cliente removido")}</td>
            <td>${escapeHtml(entry.pagamento.metodo)}</td>
            <td>${formatCurrency.format(entry.pagamento.valor)}</td>
            <td>${formatShortDate.format(new Date(entry.pagamento.vencimento))}</td>
            <td>${entry.pagamento.pagoEm ? formatShortDate.format(new Date(entry.pagamento.pagoEm)) : "Por liquidar"}</td>
            <td><span class="chip ${this.#paymentTone(entry.pagamento.estado)}">${escapeHtml(this.#paymentLabel(entry.pagamento.estado))}</span></td>
            <td class="table-actions-cell">
              <div class="table-actions">
                ${
                  entry.pagamento.estado === "paid"
                    ? `<button class="small-action subtle-action" data-action="open-client" data-client-id="${escapeHtml(entry.cliente?.id ?? "")}" type="button">Cliente</button>`
                    : `<button class="small-action" data-action="settle-payment" data-payment-id="${escapeHtml(entry.pagamento.id)}" type="button">Liquidar hoje</button>
                       <button class="small-action subtle-action" data-action="prefill-payment" data-client-id="${escapeHtml(entry.cliente?.id ?? "")}" type="button">Abrir formulario</button>`
                }
              </div>
            </td>
          </tr>
        `).join("")
      : `<tr><td colspan="7"><div class="is-empty">Ainda nao existem pagamentos registados.</div></td></tr>`;
    this.elements.financeOverdueList.innerHTML = finance.clientesEmAtraso.length
      ? finance.clientesEmAtraso.map((entry) => `
          <article class="stack-item">
            <div class="stack-top">
              <strong>${escapeHtml(entry.cliente.nome)}</strong>
              <span class="chip danger">${Math.abs(entry.diasParaVencimento)} dias</span>
            </div>
            <p>${formatCurrency.format(entry.cliente.mensalidade)} - instrutor ${escapeHtml(entry.instrutor?.nome ?? "Sem instrutor")}</p>
            <div class="stack-actions">
              <button class="small-action" data-action="settle-overdue-client" data-client-id="${escapeHtml(entry.cliente.id)}" type="button">Liquidar agora</button>
              <button class="small-action subtle-action" data-action="prefill-payment" data-client-id="${escapeHtml(entry.cliente.id)}" type="button">Formulario</button>
            </div>
          </article>
        `).join("")
      : `<div class="is-empty">Todas as mensalidades estao em dia.</div>`;
  }

  #renderInstructors() {
    const instructors = this.service.listarInstrutores();
    this.elements.instructorsGrid.innerHTML = instructors.length
      ? instructors.map((entry) => `
          <article class="trainer-card">
            <div class="trainer-head">
              <div class="avatar large">${escapeHtml(entry.instrutor.iniciais)}</div>
              <div>
                <h3 class="trainer-name">${escapeHtml(entry.instrutor.nome)}</h3>
                <p class="trainer-copy">${escapeHtml(entry.instrutor.mostrarInfo())}</p>
              </div>
            </div>
            <div class="trainer-metrics">
              <div class="metric-block">
                <span>Especialidade</span>
                <strong>${escapeHtml(entry.instrutor.especialidade)}</strong>
              </div>
              <div class="metric-block">
                <span>Certificacao</span>
                <strong>${escapeHtml(entry.instrutor.certificacao)}</strong>
              </div>
              <div class="metric-block">
                <span>Clientes</span>
                <strong>${entry.clientesAssociados.length}</strong>
              </div>
              <div class="metric-block">
                <span>Planos ativos</span>
                <strong>${entry.planosAtivos}</strong>
              </div>
            </div>
            <p class="trainer-copy">
              Carteira: ${entry.clientesAssociados.length ? escapeHtml(entry.clientesAssociados.map((cliente) => cliente.nome).slice(0, 4).join(", ")) : "Sem clientes associados"}.
            </p>
          </article>
        `).join("")
      : `<div class="is-empty">Ainda nao existem instrutores registados.</div>`;
  }

  #renderDraftExercises() {
    this.elements.draftExercisesCount.textContent = `${this.state.rascunhoExercicios.length} exercicios`;
    this.elements.draftExercisesList.innerHTML = this.state.rascunhoExercicios.length
      ? this.state.rascunhoExercicios.map((item, index) => `
          <article class="stack-item">
            <div class="stack-top">
              <strong>${escapeHtml(item.nome)}</strong>
              <button class="small-action" data-action="remove-draft-exercise" data-index="${index}" type="button">Remover</button>
            </div>
            <p>${escapeHtml(`${item.series}x${item.repeticoes} - ${item.descansoSegundos}s descanso`)}</p>
          </article>
        `).join("")
      : `<div class="is-empty">Adiciona exercicios para compor o plano.</div>`;
  }

  #populateReferenceFields() {
    const { clientes, instrutores, planosTreino } = this.service.obterReferencias();

    this.elements.clientInstructorSelect.innerHTML = instrutores
      .map((instrutor) => `<option value="${escapeHtml(instrutor.id)}">${escapeHtml(instrutor.nome)} - ${escapeHtml(instrutor.especialidade)}</option>`)
      .join("");

    this.elements.clientInstructorFilter.innerHTML = `
      <option value="all">Todos</option>
      ${instrutores.map((instrutor) => `<option value="${escapeHtml(instrutor.id)}">${escapeHtml(instrutor.nome)}</option>`).join("")}
    `;

    this.elements.clientInstructorFilter.value = instrutores.some((instrutor) => instrutor.id === this.state.filtroInstrutorCliente)
      ? this.state.filtroInstrutorCliente
      : "all";

    this.elements.clientPlanSelect.innerHTML = `
      <option value="">Sem plano inicial</option>
      ${planosTreino.map((plano) => `<option value="${escapeHtml(plano.id)}">${escapeHtml(plano.nome)} - ${formatCurrency.format(plano.mensalidadeSugerida)}</option>`).join("")}
    `;

    this.elements.exercisePlanSelect.innerHTML = planosTreino
      .map((plano) => `<option value="${escapeHtml(plano.id)}">${escapeHtml(plano.nome)}</option>`)
      .join("");

    this.elements.paymentClientSelect.innerHTML = clientes
      .map((cliente) => `<option value="${escapeHtml(cliente.id)}">${escapeHtml(cliente.nome)}</option>`)
      .join("");

    this.#syncPaymentFields();
    this.#prepareExerciseDialog(this.elements.exercisePlanSelect.value || planosTreino[0]?.id || "");
  }

  #setFormDefaults() {
    this.elements.clientForm.elements.namedItem("dataInscricao").value = asDateInputValue(new Date());
    this.elements.clientForm.elements.namedItem("proximoVencimento").value = asDateInputValue(addDays(new Date(), 30));
    this.elements.planForm.elements.namedItem("duracaoSemanas").value = "8";
    this.elements.planForm.elements.namedItem("mensalidadeSugerida").value = "59";
    this.elements.draftExerciseSeries.value = "3";
    this.elements.draftExerciseRest.value = "60";
    this.elements.paymentDueDateInput.value = asDateInputValue(new Date());
    this.#syncPaymentFields();
  }

  #prepareExerciseDialog(planId = "") {
    const planos = this.service.obterReferencias().planosTreino;
    const fallbackPlanId = planId || planos[0]?.id || "";
    this.elements.exercisePlanSelect.value = fallbackPlanId;
    this.#syncExercisePlanSelection(fallbackPlanId);
  }

  #syncExercisePlanSelection(planId) {
    const plano = this.service.obterReferencias().planosTreino.find((item) => item.id === planId);
    this.elements.exercisePlanIdInput.value = planId || "";
    this.elements.exercisePlanLabel.textContent = plano
      ? `Plano selecionado: ${plano.nome} - ${plano.totalExercicios} exercicios.`
      : "Escolhe um plano de treino.";
  }

  #syncPaymentFields() {
    const clienteId = this.elements.paymentClientSelect.value;
    const cliente = this.service.obterReferencias().clientes.find((item) => item.id === clienteId);
    if (!cliente) {
      return;
    }

    this.elements.paymentAmountInput.value = String(cliente.mensalidade);
    this.elements.paymentDueDateInput.value = cliente.proximoVencimento;
  }

  #preparePaymentDialog(clientId, { clearPaidDate = false, setPaidToday = false } = {}) {
    if (clientId) {
      this.elements.paymentClientSelect.value = clientId;
    }
    this.#syncPaymentFields();
    const paidField = this.elements.paymentForm.elements.namedItem("pagoEm");
    if (setPaidToday) {
      paidField.value = asDateInputValue(new Date());
      return;
    }
    if (clearPaidDate) {
      paidField.value = "";
    }
  }

  #clearDraftExerciseFields() {
    this.elements.draftExerciseName.value = "";
    this.elements.draftExerciseSeries.value = "3";
    this.elements.draftExerciseRepetitions.value = "";
    this.elements.draftExerciseRest.value = "60";
    this.elements.draftExerciseNotes.value = "";
  }

  #paymentTone(status) {
    const tones = {
      paid: "success",
      pending: "alert",
      overdue: "danger",
    };
    return tones[status] ?? "";
  }

  #paymentLabel(status) {
    const labels = {
      paid: "Pago",
      pending: "Pendente",
      overdue: "Atrasado",
    };
    return labels[status] ?? status;
  }

  #exportData() {
    const payload = this.service.exportarEstado();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `fitmanager-export-${asDateInputValue(new Date())}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    this.toastCenter.show("Exportacao pronta", "Foi gerado um ficheiro JSON com os dados atuais.");
  }

  #handleQuickActions(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const actionButton = target.closest("[data-action]");
    if (!(actionButton instanceof HTMLElement)) {
      return;
    }

    const action = actionButton.dataset.action;
    if (action === "open-client") {
      const clientId = actionButton.dataset.clientId;
      if (clientId) {
        this.state.selectedClientId = clientId;
        this.state.activeSection = "clients";
        this.render();
      }
      return;
    }

    if (action === "prefill-payment") {
      const clientId = actionButton.dataset.clientId;
      if (clientId) {
        this.#preparePaymentDialog(clientId, { setPaidToday: true });
        this.elements.paymentDialog.showModal();
      }
      return;
    }

    if (action === "settle-payment") {
      const paymentId = actionButton.dataset.paymentId;
      if (paymentId) {
        this.service.liquidarPagamento(paymentId);
        this.toastCenter.show("Pagamento liquidado", "O pagamento foi marcado como pago hoje.");
        this.render();
      }
      return;
    }

    if (action === "settle-overdue-client") {
      const clientId = actionButton.dataset.clientId;
      if (!clientId) {
        return;
      }

      const finance = this.service.obterResumoFinanceiro();
      const paymentEntry =
        finance.pagamentos.find((entry) => entry.cliente?.id === clientId && entry.pagamento.estado === "overdue")
        ?? finance.pagamentos.find((entry) => entry.cliente?.id === clientId && entry.pagamento.estado !== "paid");

      if (!paymentEntry) {
        this.#preparePaymentDialog(clientId, { setPaidToday: true });
        this.elements.paymentDialog.showModal();
        return;
      }

      this.service.liquidarPagamento(paymentEntry.pagamento.id);
      this.toastCenter.show("Mensalidade regularizada", "O cliente ficou com o pagamento em dia.");
      this.render();
    }
  }
}

function bootstrapFitManager() {
  const repository = new RepositorioFitManager(STORAGE_KEY);
  const service = new ServicoFitManager(repository);
  const app = new AplicacaoFitManager(service);
  app.init();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapFitManager, { once: true });
} else {
  bootstrapFitManager();
}
