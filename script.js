const display = document.getElementById('display');

function isOperator(char) {
  return ['+', '-', '*', '/'].includes(char);
}

function isDigit(char) {
  return /[0-9]/.test(char);
}

function append(char) {
  let value = display.value;

  if (value === 'Введите число') {
    value = '';
    display.value = '';
  }

  const lastChar = value.slice(-1);

  if (isDigit(char)) {
    display.value += char;
    return;
  }

  if (char === '.') {
    const parts = value.split(/[\+\-\*\/]/);
    const lastPart = parts[parts.length - 1];
    if (!lastPart.includes('.')) {
      display.value += char;
    }
    return;
  }

  if (char === '%') {
    if (value && isDigit(lastChar)) {
      display.value += char;
    }
    return;
  }

  if (isOperator(char)) {
    if (value === '' && char !== '-') return;
    if (isOperator(lastChar)) {
      display.value = value.slice(0, -1) + char;
    } else {
      display.value += char;
    }
    return;
  }
}

function clearDisplay() {
  display.value = '';
}

function backspace() {
  if (display.value === 'Введите число') {
    display.value = '';
    return;
  }

  display.value = display.value.slice(0, -1);
}

function calculate() {
  try {
    let expr = display.value.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
    const result = eval(expr);

    if (isNaN(result) || result === Infinity) {
      display.value = 'Введите число';
    } else {
      display.value = result;
    }
  } catch {
    display.value = 'Введите число';
  }
}

display.addEventListener('keydown', (e) => {
  const char = e.key;

  if (char === 'Enter') {
    e.preventDefault();
    calculate();
    return;
  }

  if (char === 'Backspace') {
    e.preventDefault();
    backspace();
    return;
  }

  if (char === 'Delete' || char.startsWith('Arrow')) {
    return;
  }

  if (isDigit(char) || isOperator(char) || char === '.' || char === '%') {
    e.preventDefault();
    append(char);
    return;
  }

  e.preventDefault();
});

function calculateNDS(rate) {
  const displayValue = parseFloat(display.value);
  const resultDiv = document.getElementById("ndsResult");
  resultDiv.innerText = '';

  if (isNaN(displayValue)) {
    resultDiv.innerText = 'Введите число';
    return;
  }

  const mode = document.querySelector('input[name="ndsMode"]:checked').value;
  let resultText = '';

  if (mode === 'with') {
    const withoutNDS = displayValue / (1 + rate / 100);
    const nds = displayValue - withoutNDS;

    resultText =
      `Сумма с НДС: ${displayValue.toFixed(2)}\n` +
      `НДС (${rate}%): ${nds.toFixed(2)}\n` +
      `Без НДС: ${withoutNDS.toFixed(2)}`;
  } else {
    const nds = displayValue * (rate / 100);
    const withNDS = displayValue + nds;

    resultText =
      `Сумма без НДС: ${displayValue.toFixed(2)}\n` +
      `НДС (${rate}%): ${nds.toFixed(2)}\n` +
      `Сумма с НДС: ${withNDS.toFixed(2)}`;
  }

  resultDiv.innerText = resultText;
}

const API_KEY = '3af59e8f3866da00f4e31079';
const fromCurrency = document.getElementById('fromCurrency');
const toCurrency = document.getElementById('toCurrency');

async function loadCurrencies() {
  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
    const data = await res.json();

    const currencies = Object.keys(data.conversion_rates);
    currencies.forEach(curr => {
      const option1 = new Option(curr, curr);
      const option2 = new Option(curr, curr);
      fromCurrency.appendChild(option1);
      toCurrency.appendChild(option2);
    });

    fromCurrency.value = 'USD';
    toCurrency.value = 'EUR';
  } catch {
    alert('Ошибка при загрузке валют');
  }
}

async function convertCurrency() {
  const amount = parseFloat(document.getElementById('amount').value);
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if (isNaN(amount)) {
    alert("Введите корректную сумму");
    return;
  }

  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${from}`);
    const data = await res.json();
    const rate = data.conversion_rates[to];
    const converted = amount * rate;

    document.getElementById('conversionResult').innerText =
      `${amount} ${from} = ${converted.toFixed(2)} ${to}`;
  } catch {
    alert("Ошибка при конвертации");
  }
}

window.addEventListener('DOMContentLoaded', () => {
  loadCurrencies();
  display.focus(); // Автофокус при загрузке
});
