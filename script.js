"use strict";

const prizes = [
  200_000, 400_000, 600_000, 1_000_000, 2_000_000,
  4_000_000, 8_000_000, 15_000_000, 30_000_000, 50_000_000,
];

const questions = [
  {
    text: "Hành tinh nào lớn nhất trong Hệ Mặt Trời?",
    answers: ["Sao Hỏa", "Sao Mộc", "Sao Kim", "Sao Thổ"],
    correct: 1,
  },
  {
    text: "Thủ đô của Nhật Bản là thành phố nào?",
    answers: ["Kyoto", "Osaka", "Tokyo", "Nagoya"],
    correct: 2,
  },
  {
    text: "Đại dương nào lớn nhất trên Trái Đất?",
    answers: ["Đại Tây Dương", "Ấn Độ Dương", "Bắc Băng Dương", "Thái Bình Dương"],
    correct: 3,
  },
  {
    text: "Tác giả của tác phẩm «Truyện Kiều» là ai?",
    answers: ["Nguyễn Du", "Nguyễn Trãi", "Hồ Xuân Hương", "Nam Cao"],
    correct: 0,
  },
  {
    text: "Nước nào được xem là quê hương của môn nghệ thuật ba-lê?",
    answers: ["Tây Ban Nha", "Pháp", "Đức", "Hy Lạp"],
    correct: 1,
  },
  {
    text: "Cơ quan nào trong cơ thể người sản xuất insulin?",
    answers: ["Gan", "Thận", "Tuyến tụy", "Phổi"],
    correct: 2,
  },
  {
    text: "Kim tự tháp Giza nổi tiếng nằm ở quốc gia nào?",
    answers: ["Mexico", "Ấn Độ", "Peru", "Ai Cập"],
    correct: 3,
  },
  {
    text: "Trong bảng tuần hoàn, ký hiệu hóa học «O» là nguyên tố nào?",
    answers: ["Oxy", "Vàng", "Osmi", "Oganesson"],
    correct: 0,
  },
  {
    text: "Loài động vật có vú nào đẻ trứng?",
    answers: ["Cá heo", "Thú mỏ vịt", "Dơi", "Gấu túi"],
    correct: 1,
  },
  {
    text: "Ai là người đầu tiên đặt chân lên Mặt Trăng?",
    answers: ["Yuri Gagarin", "Buzz Aldrin", "Neil Armstrong", "Michael Collins"],
    correct: 2,
  },
];

const replacementQuestions = [
  {
    text: "Việt Nam có bao nhiêu tỉnh, thành phố trực thuộc trung ương?",
    answers: ["34", "58", "63", "65"],
    correct: 0,
  },
  {
    text: "Chất khí nào chiếm tỉ lệ lớn nhất trong khí quyển Trái Đất?",
    answers: ["Oxy", "Nitơ", "Cacbon điôxít", "Hydro"],
    correct: 1,
  },
  {
    text: "Một năm nhuận theo lịch Gregory có bao nhiêu ngày?",
    answers: ["364", "365", "366", "367"],
    correct: 2,
  },
];

const screens = {
  start: document.querySelector("#start-screen"),
  game: document.querySelector("#game-screen"),
  result: document.querySelector("#result-screen"),
};

const elements = {
  startButton: document.querySelector("#start-button"),
  restartButton: document.querySelector("#restart-button"),
  questionCounter: document.querySelector("#question-counter"),
  progressFill: document.querySelector("#progress-fill"),
  questionText: document.querySelector("#question-text"),
  answersGrid: document.querySelector("#answers-grid"),
  feedback: document.querySelector("#feedback"),
  nextButton: document.querySelector("#next-button"),
  prizeLadder: document.querySelector("#prize-ladder"),
  earnedPrize: document.querySelector("#earned-prize"),
  resultIcon: document.querySelector("#result-icon"),
  resultEyebrow: document.querySelector("#result-eyebrow"),
  resultTitle: document.querySelector("#result-title"),
  resultDescription: document.querySelector("#result-description"),
  finalPrize: document.querySelector("#final-prize"),
  fiftyButton: document.querySelector("#fifty-button"),
  audienceButton: document.querySelector("#audience-button"),
  changeButton: document.querySelector("#change-button"),
  audienceDialog: document.querySelector("#audience-dialog"),
  pollResults: document.querySelector("#poll-results"),
  closeDialog: document.querySelector("#close-dialog"),
  gotItButton: document.querySelector("#got-it-button"),
};

const state = {
  questionIndex: 0,
  earned: 0,
  currentQuestion: null,
  usedLifelines: new Set(),
  replacedQuestions: new Set(),
  answered: false,
};

const formatMoney = (amount) =>
  `${new Intl.NumberFormat("vi-VN").format(amount)} ₫`;

function showScreen(screenName) {
  Object.entries(screens).forEach(([name, screen]) => {
    screen.classList.toggle("is-active", name === screenName);
  });
}

function renderPrizeLadder() {
  elements.prizeLadder.replaceChildren();
  prizes.forEach((prize, index) => {
    const item = document.createElement("li");
    item.className = "prize-step";
    if (index === state.questionIndex) item.classList.add("is-current");
    if (index < state.questionIndex) item.classList.add("is-won");

    const amount = document.createElement("span");
    amount.textContent = formatMoney(prize);
    item.append(amount);
    elements.prizeLadder.append(item);
  });
  elements.earnedPrize.textContent = formatMoney(state.earned);
}

function renderQuestion() {
  const question = state.currentQuestion;
  elements.questionCounter.innerHTML =
    `CÂU ${String(state.questionIndex + 1).padStart(2, "0")} <span>/ 10</span>`;
  elements.progressFill.style.width = `${((state.questionIndex + 1) / prizes.length) * 100}%`;
  elements.questionText.textContent = question.text;
  elements.answersGrid.replaceChildren();
  elements.feedback.hidden = true;
  elements.feedback.className = "feedback";
  elements.nextButton.hidden = true;
  state.answered = false;

  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.type = "button";
    button.dataset.answerIndex = String(index);

    const letter = document.createElement("span");
    letter.className = "answer-letter";
    letter.textContent = `${String.fromCharCode(65 + index)}.`;
    const label = document.createElement("span");
    label.textContent = answer;
    button.append(letter, label);
    button.addEventListener("click", () => chooseAnswer(index));
    elements.answersGrid.append(button);
  });

  renderPrizeLadder();
  updateLifelineButtons();
}

function startGame() {
  state.questionIndex = 0;
  state.earned = 0;
  state.currentQuestion = questions[0];
  state.usedLifelines = new Set();
  state.replacedQuestions = new Set();
  showScreen("game");
  renderQuestion();
}

function chooseAnswer(answerIndex) {
  if (state.answered) return;
  state.answered = true;

  const isCorrect = answerIndex === state.currentQuestion.correct;
  const buttons = [...elements.answersGrid.querySelectorAll(".answer-button")];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === state.currentQuestion.correct) button.classList.add("is-correct");
    if (index === answerIndex && !isCorrect) button.classList.add("is-wrong");
  });

  elements.feedback.hidden = false;
  if (isCorrect) {
    state.earned = prizes[state.questionIndex];
    elements.feedback.classList.add("is-correct");
    elements.feedback.textContent =
      `Chính xác! Bạn đã nhận ${formatMoney(state.earned)}.`;
    renderPrizeLadder();

    if (state.questionIndex === prizes.length - 1) {
      elements.nextButton.textContent = "Xem kết quả →";
      elements.nextButton.addEventListener("click", finishGame, { once: true });
    } else {
      elements.nextButton.textContent = "Câu tiếp theo →";
      elements.nextButton.addEventListener("click", advanceQuestion, { once: true });
    }
  } else {
    elements.feedback.classList.add("is-wrong");
    elements.feedback.textContent =
      `Chưa chính xác. Đáp án đúng là ${String.fromCharCode(65 + state.currentQuestion.correct)}. ${state.currentQuestion.answers[state.currentQuestion.correct]}. Bạn ra về với ${formatMoney(state.earned)}.`;
    elements.nextButton.textContent = "Xem kết quả →";
    elements.nextButton.addEventListener("click", finishGame, { once: true });
  }
  elements.nextButton.hidden = false;
}

function advanceQuestion() {
  state.questionIndex += 1;
  state.currentQuestion = questions[state.questionIndex];
  renderQuestion();
}

function finishGame() {
  const completed = state.questionIndex === prizes.length - 1 && state.earned === prizes[prizes.length - 1];
  elements.resultIcon.textContent = completed ? "🏆" : "✦";
  elements.resultEyebrow.textContent = completed ? "NHÀ VÔ ĐỊCH TRI THỨC" : "TRÒ CHƠI KẾT THÚC";
  elements.resultTitle.textContent = completed ? "Xuất sắc! Bạn đã chinh phục tất cả!" : "Hẹn gặp bạn ở lần thử sức tiếp theo!";
  elements.resultDescription.textContent = completed
    ? "Bạn đã trả lời đúng cả 10 câu hỏi. Một màn thể hiện thật đáng nể!"
    : `Bạn đã đi đến câu hỏi số ${state.questionIndex + 1}. Cảm ơn bạn đã tham gia thử thách!`;
  elements.finalPrize.textContent = formatMoney(state.earned);
  showScreen("result");
}

function updateLifelineButtons() {
  elements.fiftyButton.disabled = state.usedLifelines.has("fifty") || state.answered;
  elements.audienceButton.disabled = state.usedLifelines.has("audience") || state.answered;
  elements.changeButton.disabled =
    state.usedLifelines.has("change") || state.answered ||
    replacementQuestions.every((_, index) => state.replacedQuestions.has(index));
}

function useFiftyFifty() {
  if (elements.fiftyButton.disabled) return;
  state.usedLifelines.add("fifty");
  const wrongAnswers = [0, 1, 2, 3]
    .filter((index) => index !== state.currentQuestion.correct);
  wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2).forEach((index) => {
    const button = elements.answersGrid.querySelector(`[data-answer-index="${index}"]`);
    button.classList.add("is-hidden");
    button.disabled = true;
    button.setAttribute("aria-hidden", "true");
  });
  updateLifelineButtons();
}

function makeAudienceVotes(correctIndex) {
  const correctVotes = 42 + Math.floor(Math.random() * 34);
  const remaining = 100 - correctVotes;
  const wrongIndexes = [0, 1, 2, 3].filter((index) => index !== correctIndex);
  const first = Math.floor(Math.random() * (remaining + 1));
  const second = Math.floor(Math.random() * (remaining - first + 1));
  const votes = Array(4).fill(0);
  votes[correctIndex] = correctVotes;
  votes[wrongIndexes[0]] = first;
  votes[wrongIndexes[1]] = second;
  votes[wrongIndexes[2]] = remaining - first - second;
  return votes;
}

function useAudience() {
  if (elements.audienceButton.disabled) return;
  state.usedLifelines.add("audience");
  elements.pollResults.replaceChildren();
  const votes = makeAudienceVotes(state.currentQuestion.correct);
  votes.forEach((percentage, index) => {
    const row = document.createElement("div");
    row.className = "poll-row";
    const letter = document.createElement("span");
    letter.className = "poll-letter";
    letter.textContent = String.fromCharCode(65 + index);
    const track = document.createElement("div");
    track.className = "poll-track";
    const bar = document.createElement("div");
    bar.className = "poll-bar";
    bar.style.width = `${percentage}%`;
    track.append(bar);
    const amount = document.createElement("span");
    amount.className = "poll-percentage";
    amount.textContent = `${percentage}%`;
    row.append(letter, track, amount);
    elements.pollResults.append(row);
  });
  updateLifelineButtons();
  elements.audienceDialog.showModal();
}

function useChangeQuestion() {
  if (elements.changeButton.disabled) return;
  const replacementIndex = replacementQuestions.findIndex(
    (_, index) => !state.replacedQuestions.has(index),
  );
  if (replacementIndex === -1) return;
  state.usedLifelines.add("change");
  state.replacedQuestions.add(replacementIndex);
  state.currentQuestion = replacementQuestions[replacementIndex];
  renderQuestion();
}

elements.startButton.addEventListener("click", startGame);
elements.restartButton.addEventListener("click", startGame);
elements.fiftyButton.addEventListener("click", useFiftyFifty);
elements.audienceButton.addEventListener("click", useAudience);
elements.changeButton.addEventListener("click", useChangeQuestion);
elements.closeDialog.addEventListener("click", () => elements.audienceDialog.close());
elements.gotItButton.addEventListener("click", () => elements.audienceDialog.close());

renderPrizeLadder();
