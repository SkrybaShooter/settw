const assetsConfig = {
    sigma: { price: 35000, history: [] },
    npc: { price: 200, history: [] },
    cringe: { price: 150, history: [] }
  };
  
  const portfolio = {
    hajs: 10000,
    holdings: { sigma: 0, npc: 0, cringe: 0 },
    history: []
  };
  
  let lastPrices = {
    sigma: assetsConfig.sigma.price,
    npc: assetsConfig.npc.price,
    cringe: assetsConfig.cringe.price
  };

  function updatePortfolioView() {
    const portfolioValueEl = document.getElementById('portfolioValue');
    const cashEl = document.getElementById('cash');
    const profitEl = document.getElementById('profit');
    let holdingsValue = 0;
    for (let key in assetsConfig) {
      holdingsValue += portfolio.holdings[key] * lastPrices[key];
    }
    const fullSztos = portfolio.hajs + holdingsValue;
    const profit = fullSztos - 10000;
    cashEl.textContent = portfolio.hajs.toFixed(2);
    portfolioValueEl.textContent = fullSztos.toFixed(2);
    profitEl.textContent = profit.toFixed(2);
    updateOwnedDisplay();
  }
  
  function updateOwnedDisplay() {
    for (let key in portfolio.holdings) {
      const ownedEl = document.querySelector(`.owned[data-symbol="${key}"]`);
      if (ownedEl) {
        ownedEl.textContent = `Owned: ${portfolio.holdings[key]}`;
      }
    }
  }
  function updatePortfolioChart(chart, time) {
  let holdingsValue = 0;
  for (let key in assetsConfig) {
    holdingsValue += portfolio.holdings[key] * lastPrices[key];
  }
  const fullSztos = portfolio.hajs + holdingsValue;
  portfolio.history.push({ time, value: fullSztos });
  chart.data.labels.push(time);
  chart.data.datasets[0].data.push(fullSztos);
  chart.update();
}
function simulatePriceChange(currentPrice) {
    const changeFactor = 1 + ((Math.random() - 0.5) * 0.04);
    return currentPrice * changeFactor;
  }
  function updatePrices() {
    for (let key in assetsConfig) {
      const oldPrice = lastPrices[key];
      const newPrice = simulatePriceChange(oldPrice);
      lastPrices[key] = newPrice;
      assetsConfig[key].history.push(newPrice);
      updateAssetView(key, newPrice, oldPrice);
      updateAssetChart(assetCharts[key], newPrice);
    }
    updatePortfolioView();
    const now = new Date().toLocaleTimeString();
    updatePortfolioChart(portfolioChart, now);
  }
  function updateAssetView(symbol, newPrice, oldPrice) {
    const priceEl = document.querySelector(`.price[data-symbol="${symbol}"]`);
    priceEl.textContent = newPrice.toFixed(2);
    if (newPrice > oldPrice) {
      priceEl.style.color = 'lightgreen';
    } else if (newPrice < oldPrice) {
      priceEl.style.color = '#ff4c4c';
    } else {
      priceEl.style.color = '#e0e0e0';
    }
  }
  function handleBuy(symbol) {
    const qtyInput = document.querySelector(`input.qty[data-symbol="${symbol}"]`);
    const qty = parseInt(qtyInput.value);
    const price = lastPrices[symbol];
    const cost = price * qty;
    const commission = cost * 0.01;
    const totalCost = cost + commission;
    if (portfolio.hajs < totalCost) {
      showError(symbol, 'Insufficient funds');
      return;
    }
    portfolio.hajs -= totalCost;
    portfolio.holdings[symbol] += qty;
    updatePortfolioView();
  }
  function handleSell(symbol) {
    const qtyInput = document.querySelector(`input.qty[data-symbol="${symbol}"]`);
    const qty = parseInt(qtyInput.value);
    if (portfolio.holdings[symbol] < qty) {
      showError(symbol, 'Not enough shares');
      return;
    }
    const price = lastPrices[symbol];
    const revenue = price * qty;
    const commission = revenue * 0.01;
    const totalRevenue = revenue - commission;
    portfolio.hajs += totalRevenue;
    portfolio.holdings[symbol] -= qty;
    updatePortfolioView();
  }
  function handleSellAll(symbol) {
    const qty = portfolio.holdings[symbol];
    if (qty <= 0) {
      showError(symbol, 'No shares to sell');
      return;
    }
    const price = lastPrices[symbol];
    const revenue = price * qty;
    const commission = revenue * 0.01;
    const totalRevenue = revenue - commission;
    portfolio.hajs += totalRevenue;
    portfolio.holdings[symbol] = 0;
    updatePortfolioView();
  }
  function showError(symbol, message) {
    const errorEl = document.getElementById('error-' + symbol);
    errorEl.textContent = message;
    setTimeout(() => { errorEl.textContent = ''; }, 3000);
  }
  
  const assetCharts = {};
for (let key in assetsConfig) {
  const ctx = document.getElementById('chart-' + key).getContext('2d');
  assetCharts[key] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: key,
        data: [],
        borderColor: 'lightblue',
        backgroundColor: 'rgba(173, 216, 230, 0.3)',
        fill: true,
        tension: 0.2
      }]
    },
    options: {
      scales: {
        x: { display: false },
        y: { beginAtZero: false }
      },
      plugins: { legend: { display: false } }
    }
  });
}

const portfolioCtx = document.getElementById('portfolioChart').getContext('2d');
const portfolioChart = new Chart(portfolioCtx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Portfolio Value',
      data: [],
      borderColor: 'gold',
      backgroundColor: 'rgba(255,215,0,0.3)',
      fill: true,
      tension: 0.2
    }]
  },
  options: {
    scales: {
      x: { display: true },
      y: { beginAtZero: false }
    }
  }
});

function updateAssetChart(chart, newPrice) {
    const now = new Date().toLocaleTimeString();
    chart.data.labels.push(now);
    chart.data.datasets[0].data.push(newPrice);
    chart.update();
  }
  
  document.querySelectorAll('.buyBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const symbol = btn.getAttribute('data-symbol');
      handleBuy(symbol);
    });
  });
  
  document.querySelectorAll('.sellBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const symbol = btn.getAttribute('data-symbol');
      handleSell(symbol);
    });
  });
  
  document.querySelectorAll('.sellAllBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const symbol = btn.getAttribute('data-symbol');
      handleSellAll(symbol);
    });
  });
  
  document.getElementById('resetBtn').addEventListener('click', () => {
    portfolio.hajs = 10000;
    portfolio.holdings = { sigma: 0, npc: 0, cringe: 0 };
    portfolio.history = [];
    for (let key in assetsConfig) {
      assetsConfig[key].history = [];
      const chart = assetCharts[key];
      chart.data.labels = [];
      chart.data.datasets[0].data = [];
      chart.update();
    }
    portfolioChart.data.labels = [];
    portfolioChart.data.datasets[0].data = [];
    portfolioChart.update();
    updatePortfolioView();
  });
  updatePrices();
  setInterval(updatePrices, 1000);
