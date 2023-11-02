
"use strict";

/////////////////////////////////////////////////////////////
// Data
/////////////////////////////////////////////////////////////
const accounts = [
  {
    username: "j",
    password: "123",
    owner: "Jimmy L",
    movements: [3500, 1000, -800, 1200, 3600, -1500, 500, 2500, -5000, 1800],
    interestRate: 1.5,
    currency: "SEK",
    locale: "sv-SE",
  },
  {
    username: "christian",
    password: "123",
    owner: "Christian. C",
    movements: [4500, 500, -750, 200, 3200, -1800, 500, 1200, -1750, 1800],
    interestRate: 1.5,
    currency: "SEK",
    locale: "sv-SE",
  },
];

/////////////////////////////////////////////////////////////
// Elements
/////////////////////////////////////////////////////////////

const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance-value");
const labelSumIn = document.querySelector(".summary-value-in");
const labelSumOut = document.querySelector(".summary-value-out");
const labelSumInterest = document.querySelector(".summary-value-interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login-btn");
const btnTransfer = document.querySelector(".form-btn-transfer");

const inputUsername = document.querySelector(".login-input-username");
const inputPassword = document.querySelector(".login-input-password");

/////////////////////////////////////////////////////////////////////
// Update UI
/////////////////////////////////////////////////////////////////////

function updateUI(currentAccount) {
  displayMovements(currentAccount);
  displaySummary(currentAccount);
  displayBalance(currentAccount);
}

////////////////////////////////////////////////////////////////////////
//formating currency
///////////////////////////////////////////////////////////////////////

function formatCurrency(value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
}

////////////////////////////////////////////////////////////////////////////////////////
// Days calculation
///////////////////////////////////////////////////////////////////////////////////

function formatMoveDate(date, locale) {
  const calculateDays = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (24 * 60 * 60 * 1000));

  const daysPassed = calculateDays(new Date(), date);
  if (daysPassed === 0) return "Idag";
  if (daysPassed === 1) return "Igår";
  if (daysPassed <= 7) return `${daysPassed} dagar sedan`;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/////////////////////////////////////////////////////////////////////
// Movements
/////////////////////////////////////////////////////////////////////
function displayMovements(account, sort = false) {
  containerMovements.innerHTML = "";
  const moves = sort
    ? account.movements.slice(0).sort((a, b) => a - b)
    : account.movements;

  moves.forEach((move, index) => {
    const type = move > 0 ? "insättning" : "uttag";

    const html = `
      <div class="movements-row">
        <div class="movements-type movements-type-${type}">${
      index + 1
    } ${type}</div>
        <div class="movements-value">${formatCurrency(
          move,
          account.locale,
          account.currency
        )}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
}

/////////////////////////////////////////////////////////////////////
// Summary
/////////////////////////////////////////////////////////////////////

function displaySummary(account) {
  const income = account.movements
    .filter((move) => move > 0)
    .reduce((acc, move) => acc + move, 0);

  const outgoing = account.movements
    .filter((move) => move < 0)
    .reduce((acc, move) => acc + move, 0);

  const interest = account.movements
    .filter((move) => move > 0)
    .map((deposit) => (deposit * account.interestRate) / 100)
    .filter((interest) => interest >= 1)
    .reduce((acc, interest) => acc + interest, 0);

  labelSumIn.textContent = formatCurrency(income, account.locale, account.currency);
  labelSumOut.textContent = formatCurrency(outgoing, account.locale, account.currency);
  labelSumInterest.textContent = formatCurrency(interest, account.locale, account.currency);
}

/////////////////////////////////////////////////////////////////////
// Balance
/////////////////////////////////////////////////////////////////////

function displayBalance(account) {
  account.balance = account.movements.reduce((acc, move) => acc + move, 0);
  labelBalance.textContent = formatCurrency(account.balance, account.locale, account.currency);
}

const btnDeposit = document.getElementById("btn-deposit");
const btnWithdrawal = document.getElementById("btn-withdrawal");
const balanceValue = document.querySelector(".balance-value");

let currentBalance = 1000; // Aktuellt saldo

btnDeposit.addEventListener("click", () => {
  const amount = Number(document.getElementById("deposit-amount").value);

  if (amount > 0) {
    currentBalance += amount; // Lägg till insättningsbeloppet till saldo
    balanceValue.textContent = currentBalance + " kr"; // Uppdatera saldo på sidan
  }

  document.getElementById("deposit-amount").value = ""; // Rensa insättningsfältet
});

btnWithdrawal.addEventListener("click", () => {
  const amount = Number(document.getElementById("withdrawal-amount").value);

  if (amount > 0 && currentBalance >= amount) {
    currentBalance -= amount; // Dra av uttagsbeloppet från saldo
    labelBalance.textContent = currentBalance + " kr"; // Uppdatera saldo på sidan
  } else if (amount > currentBalance) {
    alert("Saldot är som mina chanser att vinna i lotteriet - obefintligt!"); // Visa en popup vid övertrassering
  }

  document.getElementById("withdrawal-amount").value = ""; // Rensa uttagsfältet
});
/////////////////////////////////////////////////////////////////////
// Initial Display
/////////////////////////////////////////////////////////////////////

labelWelcome.textContent = "Logga in för att komma igång";

/////////////////////////////////////////////////////////////////////
// Update UI
/////////////////////////////////////////////////////////////////////

function updateUI(currentAccount) {
  displayMovements(currentAccount);
  displaySummary(currentAccount);
  displayBalance(currentAccount);

  startLogoutTimer();
}

// ...


/////////////////////////////////////////////////////////////////////
// Login
/////////////////////////////////////////////////////////////////////

let currentAccount;

btnLogin.addEventListener("click", (e) => {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    (account) =>
      account.username === inputUsername.value &&
      account.password === inputPassword.value
  );

  if (currentAccount) {
    // Display UI and welcome message
    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Välkommen tillbaka, ${
      currentAccount.owner.split(" ")[0]
    }`;

    // Clear input fields
    inputUsername.value = inputPassword.value = "";
    inputPassword.W();

    // Update UI
    updateUI(currentAccount);
  }
});

const btnLogout = document.getElementById("btn-logout");
btnLogout.addEventListener("click", logout);

function logout() {
  // Rensa data och återställ till startsidan
  currentAccount = null;
  // Återställ UI
  clearUI();
  // Visa loginskärmen
  showLoginScreen();
}

function clearUI() {
  // Rensa saldo och transaktionshistorik
  const balanceElement = document.querySelector(".balance-value");
  const movementsElement = document.querySelector(".movements");
  balanceElement.textContent = "";
  movementsElement.innerHTML = "";
}

function showLoginScreen() {
  const card = document.querySelector(".card");
  const app = document.querySelector(".app");

  card.style.display = "flex";
  app.style.display = "none";
}



////////////////////////////////////////////////////////////////////////
// Initial Display
///////////////////////////////////////////////////////////////////////

containerApp.style.opacity = 0;
labelWelcome.textContent = "Logga in för att komma igång";

////////////////////////////////////////////////////////////////////////
// Event Handlers
///////////////////////////////////////////////////////////////////////

btnTransfer.addEventListener("click", (e) => {
  e.preventDefault();
  const amount = Number(document.querySelector(".form-input-amount").value);
  const receiverAccount = accounts.find(
    (account) =>
      account.username === document.querySelector(".form-input-to").value
  );

  document.querySelector(".form-input-amount").value = document.querySelector(
    ".form-input-to"
  ).value = "";

});
/////////////////////////////////////////////////////////////////////
