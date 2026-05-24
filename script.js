const IMAGES_AND_ANSWERS = [
  {
    image: "imagens/imagem1.png",
    hint: "A natureza parece estar morrendo.",
    secondHint: "Repare na condição da planta.",
    thirdHint: "A flor/planta está...?",
    answers: [
      "flor murcha",
      "flor morta",
      "flor seca",
      "planta murcha",
      "planta morta",
      "planta seca",
    ],
  },

  {
    image: "imagens/imagem2.png",
    hint: "Essa figura te lembra um brinquedo, não é?",
    secondHint: "Falta algo no rosto dessa figura.",
    thirdHint: "Boneco sem...",
    answers: [
      "sem olhos",
      "rosto sem olhos",
      "criança sem olhos",
      "boneco sem olhos",
    ],
  },

  {
    image: "imagens/imagem3.png",
    hint: "Um número... mas algo o riscou.",
    secondHint: "Nossa, essa é fácil! Não é possível que vocês... Né?",
    thirdHint: "GENTE É LITERALMENTE SÓ LER A PRIMEIRA DICA!",
    answers: ["número riscado", "3 riscado", "3 riscado", "numero 3"],
  },

  {
    image: "imagens/imagem4.png",
    hint: "A chama revela mais do que deveria.",
    secondHint:
      "O que está bem na sua frente iluminando é a resposta. E, o quê atrás dela também!",
    thirdHint: "Vela e...",
    answers: [
      "sombra atrás da vela",
      "vela na frente da sombra",
      "sombra e vela",
      "vela e sombra",
      "vela com sombra",
      "sombra com vela",
    ],
  },

  {
    image: "imagens/imagem5.png",
    hint: "Algo que gira. hipnotizante.",
    secondHint:
      "Te lembra algo relacionado a morte. Mas você não sabe o porquê.",
    thirdHint: "UZUMAKI.",
    answers: ["espiral", "redemoinho"],
  },
];

const TIME_PER_ANSWER = 120;
const MAX_ATTEMPTS = 3;

let currentIndex = 0;
let timeLeft = TIME_PER_ANSWER;
let attemptsLeft = MAX_ATTEMPTS;
let instability = 0;

let timerInterval;
let firstHintTimeout;
let secondHintTimeout;
let thirdHintTimeout;

const menu = document.getElementById("menu");
const gameContainer = document.getElementById("game-container");
const menuMessage = document.getElementById("menu-message");

const timerEl = document.getElementById("timer");
const attemptsEl = document.getElementById("attempts");
const memoryEl = document.getElementById("memory");

const gameImageEl = document.getElementById("game-image");
const answerInputEl = document.getElementById("answer-input");

const messageEl = document.getElementById("message");
const hintEl = document.getElementById("hint");

const soundEnter = document.getElementById("sound-enter");
const soundCorrect = document.getElementById("sound-correct");
const soundWrong = document.getElementById("sound-wrong");
const soundTyping = document.getElementById("sound-typing");

let menuAtivo = true;
let menuSelecionado = null;

document.addEventListener("keydown", (e) => {
  if (menuAtivo) {
    if (e.key === "1") {
      menuSelecionado = 1;

      menuMessage.textContent = "Iniciando o protocolo...";

      soundEnter.play();
    } else if (e.key === "2") {
      menuSelecionado = 2;

      menuMessage.textContent =
        "Observe a imagem e descreva o que vê.\n" +
        "- Use palavras simples e diretas. Exemplo: (Leões e mercados; Caroço no angu; Corpo seco.)\n" +
        "- Você terá 3 tentativas para acertar cada imagem. (Se ocorrer, a imagem seguinte aparecerá.)\n" +
        "- Se errar demais, a memória irar corromper. (Atento a memória instável.)\n" +
        "- A cada 10, 30 e 60 segundos, dicas serão exibidas.\n" +
        "- Pressione ENTER após escolher uma opção no menu.";

      soundEnter.play();
    } else if (e.key === "Enter" && menuSelecionado !== null) {
      menu.style.display = "none";

      gameContainer.style.display = "flex";

      iniciarJogo();

      soundEnter.play();

      menuAtivo = false;
    }
  }
});

function iniciarJogo() {
  currentIndex = 0;
  instability = 0;

  mostrarImagem();
}

function mostrarImagem() {
  const atual = IMAGES_AND_ANSWERS[currentIndex];

  gameImageEl.src = atual.image;

  messageEl.textContent = "";
  hintEl.textContent = "";

  answerInputEl.value = "";
  answerInputEl.disabled = false;

  answerInputEl.focus();

  timeLeft = TIME_PER_ANSWER;
  attemptsLeft = MAX_ATTEMPTS;

  atualizarStatus();

  clearInterval(timerInterval);
  clearTimeout(firstHintTimeout);
  clearTimeout(secondHintTimeout);
  clearTimeout(thirdHintTimeout);
  timerInterval = setInterval(() => {
    timeLeft--;

    atualizarStatus();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);

      processarErro();
    }
  }, 1000);

  // Primeira dica após 10s
  firstHintTimeout = setTimeout(() => {
    hintEl.textContent = `Dica: ${atual.hint}`;
  }, 10000);

  // Segunda dica após 30s
  secondHintTimeout = setTimeout(() => {
    if (hintEl.textContent && atual.secondHint) {
      hintEl.textContent += `\n${atual.secondHint}`;
    }
  }, 30000);

  // Terceira dica após 60s
  thirdHintTimeout = setTimeout(() => {
    if (hintEl.textContent && atual.thirdHint) {
      hintEl.textContent += `\n${atual.thirdHint}`;
    }
  }, 60000);
}

function atualizarStatus() {
  timerEl.textContent = `Tempo restante: ${timeLeft}s`;

  attemptsEl.textContent = `Tentativas: ${attemptsLeft}`;

  memoryEl.textContent = `Memória Instável: ${instability}%`;
}
function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
answerInputEl.addEventListener("keydown", (e) => {
  if (/^[a-zA-Z0-9çáéíóúãõâêîôû ]$/.test(e.key)) {
    soundTyping.currentTime = 0;

    soundTyping.play().catch(() => {});
  }

  if (e.key === "Enter") {
    verificarResposta();
  }
});

function verificarResposta() {
  const resposta = normalizarTexto(answerInputEl.value);

  const respostasAceitas =
    IMAGES_AND_ANSWERS[currentIndex].answers.map(normalizarTexto);

  if (respostasAceitas.includes(resposta)) {
    clearInterval(timerInterval);
    clearTimeout(firstHintTimeout);
    clearTimeout(secondHintTimeout);
    clearTimeout(thirdHintTimeout);

    messageEl.textContent = "Resposta correta!";

    soundCorrect.play();

    setTimeout(proximaImagem, 1200);
  } else {
    const palavrasChave = respostasAceitas[0].split(" ");

    const palavrasResposta = resposta.split(" ");

    const palavrasCorretas = palavrasChave.filter((p) =>
      palavrasResposta.includes(p),
    );

    if (
      palavrasCorretas.length > 0 &&
      palavrasCorretas.length < palavrasChave.length
    ) {
      messageEl.textContent = `Parcialmente correto. A palavra "${palavrasCorretas[0]}" está certa, mas falta o restante.`;

      soundWrong.play();
    } else {
      messageEl.textContent = "INCORRETO! Tente novamente...";

      soundWrong.play();
    }

    attemptsLeft--;

    atualizarStatus();

    if (attemptsLeft <= 0) {
      clearInterval(timerInterval);
      clearTimeout(hintTimeout);

      processarErro();
    } else {
      answerInputEl.value = "";
    }
  }
}

function processarErro() {
  instability += 33;

  atualizarStatus();

  soundWrong.play();

  instability += 34;
  if (instability > 100) instability = 100;

  if (instability === 33) {
    messageEl.textContent = "Memória falhas foram detectadas!";
  } else if (instability === 66) {
    messageEl.textContent = "Lapsos graves de memória detectados!";
  } else if (instability >= 100) {
    encerrarJogo(false);
    return;
  }

  setTimeout(() => {
    proximaImagem();
  }, 2000);
}

function proximaImagem() {
  currentIndex++;

  if (currentIndex >= IMAGES_AND_ANSWERS.length) {
    encerrarJogo(true);
  } else {
    mostrarImagem();
  }
}

function encerrarJogo(vitoria) {
  answerInputEl.disabled = true;

  clearInterval(timerInterval);
  clearTimeout(hintTimeout);

  messageEl.textContent = vitoria
    ? "Você concluiu todas as imagens com sucesso!"
    : "Memória comprometida. O protocolo falhou.";

  hintEl.textContent = "";
}
