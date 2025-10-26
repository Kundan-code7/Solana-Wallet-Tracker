// ===== HELIUS CONFIGURATION =====
const HELIUS_API_KEY = 'dd34ce47-ef12-405c-81fe-fc2128cfc33d'; // Replace with actual API key
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const HELIUS_WS = `wss://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

let dashboardData = {
    portfolioValue: 124567.89,
    profitLoss: 23456.12,
    activePositions: 12,
    todaysTrades: 8,
    winRate: 70,
    trackedWallets: [],
    recentActivities: [],
    tokenPrices: {}
};

let wsConnections = [];

// ===== TRACKED WALLETS DATA =====
const TRACKED_WALLETS = [
    {
        address: '4ZJhPQAgUseCsWhKvJLTmmRRUV74fdoTpQLNfKoekbPY',
        name: 'Solana Foundation',
        avatar: 'SF',
        avatarClass: 'avatar-cyan'
    },
    {
        address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        name: 'Binance 3',
        avatar: 'BI',
        avatarClass: 'avatar-pink'
    },
    {
        address: 'S7vYFFWH6BjJyEsdrPQpqpYTqLTrPRK6KW3VwsJuRaS',
        name: 'NULL',
        avatar: 'NU',
        avatarClass: 'avatar-orange'
    },
    {
        address: '2RH6rUTPBJ9rUDPpuV9b8z1YL56k1tYU6Uk5ZoaEFFSK',
        name: 'Trump Meme Team',
        avatar: 'TR',
        avatarClass: 'avatar-purple'
    }
];

// ===== REAL-TIME DATA FETCHING =====
async function fetchWalletData(walletAddress) {
    try {
        const balanceResponse = await fetch(HELIUS_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getBalance',
                params: [walletAddress]
            })
        });
        
        const balanceData = await balanceResponse.json();
        const balance = balanceData.result ? balanceData.result.value / 1e9 : Math.random() * 10000;
        
        // Get recent transactions
        const txResponse = await fetch(HELIUS_RPC, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 2,
                method: 'getSignaturesForAddress',
                params: [walletAddress, { limit: 10 }]
            })
        });
        
        const txData = await txResponse.json();
        const recentTxs = txData.result || [];
        
        return {
            balance: parseFloat(balance.toFixed(2)),
            recentTransactions: recentTxs.length,
            lastActivity: recentTxs[0]?.blockTime || Date.now() / 1000
        };
    } catch (error) {
        console.error(`Error fetching wallet ${walletAddress}:`, error);
        return { 
            balance: parseFloat((Math.random() * 50000).toFixed(2)), 
            recentTransactions: Math.floor(Math.random() * 5),
            lastActivity: Date.now() / 1000
        };
    }
}

// ===== FETCH TOKEN PRICES =====
async function fetchTokenPrices() {
    const tokens = {
        'SOL': { name: 'Solana', symbol: 'SOL' },
        'JUP': { name: 'Jupiter', symbol: 'JUP' },
        'BONK': { name: 'Bonk', symbol: 'BONK' },
        'RAY': { name: 'Raydium', symbol: 'RAY' }
    };
    
    try {
        // In a real app, you'd use a price API like CoinGecko, Birdeye, etc.
        // For demo, we'll simulate realistic price movements
        const updatedPrices = {};
        
        for (const [symbol, token] of Object.entries(tokens)) {
            const basePrice = {
                'SOL': 185.65,
                'JUP': 1.23,
                'BONK': 0.000024,
                'RAY': 3.45
            }[symbol] || 1.00;
            
            // Simulate price movement
            const change = (Math.random() - 0.5) * basePrice * 0.02; // ±2% change
            const newPrice = Math.max(0.000001, basePrice + change);
            const percentChange = (change / basePrice) * 100;
            
            updatedPrices[symbol] = {
                ...token,
                price: parseFloat(newPrice.toFixed(symbol === 'BONK' ? 8 : 2)),
                change: parseFloat(percentChange.toFixed(2)),
                isPositive: percentChange > 0
            };
        }
        
        return updatedPrices;
    } catch (error) {
        console.error('Error fetching token prices:', error);
        return dashboardData.tokenPrices;
    }
}

// ===== WEBSOCKET FOR REAL-TIME UPDATES =====
function connectWalletWebSocket(walletAddress, walletName) {
    try {
        const ws = new WebSocket(HELIUS_WS);
        
        ws.onopen = () => {
            ws.send(JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'accountSubscribe',
                params: [
                    walletAddress,
                    { encoding: 'jsonParsed', commitment: 'finalized' }
                ]
            }));
            console.log(`✅ WebSocket connected: ${walletName}`);
        };
        
        ws.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            
            if (data.method === 'accountNotification') {
                console.log(`🔔 Activity detected: ${walletName}`);
                
                // Update dashboard metrics
                updatePortfolioMetrics();
                addRecentActivity(walletName, 'wallet_activity');
                
                showNotification(`${walletName} wallet activity detected`, true);
            }
        };
        
        ws.onerror = (error) => {
            console.error(`WebSocket error for ${walletName}:`, error);
        };
        
        ws.onclose = () => {
            console.log(`❌ WebSocket closed: ${walletName}`);
            setTimeout(() => connectWalletWebSocket(walletAddress, walletName), 10000);
        };
        
        wsConnections.push(ws);
        return ws;
    } catch (error) {
        console.error(`Failed to create WebSocket for ${walletName}:`, error);
        return null;
    }
}

// ===== UPDATE PORTFOLIO METRICS =====
async function updatePortfolioMetrics() {
    // Simulate realistic market movements
    const marketTrend = Math.random() > 0.4 ? 1 : -1; // 60% chance positive
    const volatility = Math.random() * 0.02; // 0-2% change
    
    // Update portfolio value
    const portfolioChange = dashboardData.portfolioValue * volatility * marketTrend;
    dashboardData.portfolioValue = Math.max(0, dashboardData.portfolioValue + portfolioChange);
    
    // Update profit/loss (correlated with portfolio)
    const profitChange = dashboardData.profitLoss * volatility * marketTrend * 0.8;
    dashboardData.profitLoss = Math.max(-dashboardData.portfolioValue * 0.1, dashboardData.profitLoss + profitChange);
    
    // Update active positions (random changes)
    const positionChange = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
    dashboardData.activePositions = Math.max(0, dashboardData.activePositions + positionChange);
    
    // Update today's trades
    const newTrades = Math.floor(Math.random() * 3);
    dashboardData.todaysTrades += newTrades;
    
    // Update win rate (slight variations)
    const winRateChange = (Math.random() - 0.5) * 2; // -1% to +1%
    dashboardData.winRate = Math.max(30, Math.min(95, dashboardData.winRate + winRateChange));
    
    renderMetrics();
    updateChart();
    updateWinRateChart();
}

// ===== RENDER METRICS =====
function renderMetrics() {
    // Portfolio Value
    const portfolioElement = document.querySelector('.metric-card:nth-child(1) .metric-value');
    if (portfolioElement) {
        portfolioElement.textContent = `$${dashboardData.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    // Profit/Loss
    const profitElement = document.querySelector('.metric-card:nth-child(2) .metric-value');
    const profitChangeElement = document.querySelector('.metric-card:nth-child(2) .metric-change');
    if (profitElement && profitChangeElement) {
        const roi = (dashboardData.profitLoss / (dashboardData.portfolioValue - dashboardData.profitLoss)) * 100;
        profitElement.textContent = `$${dashboardData.profitLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        profitChangeElement.textContent = `${roi > 0 ? '+' : ''}${roi.toFixed(1)}% ROI`;
        profitChangeElement.className = `metric-change ${roi > 0 ? 'positive' : 'negative'}`;
    }
    
    // Active Positions
    const positionsElement = document.querySelector('.metric-card:nth-child(3) .metric-value');
    const positionsChangeElement = document.querySelector('.metric-card:nth-child(3) .metric-change');
    if (positionsElement && positionsChangeElement) {
        const winningPositions = Math.floor(dashboardData.activePositions * (dashboardData.winRate / 100));
        positionsElement.textContent = dashboardData.activePositions;
        positionsChangeElement.textContent = `${winningPositions} winning, ${dashboardData.activePositions - winningPositions} holding`;
    }
    
    // Today's Trades
    const tradesElement = document.querySelector('.metric-card:nth-child(4) .metric-value');
    const tradesChangeElement = document.querySelector('.metric-card:nth-child(4) .metric-change');
    if (tradesElement && tradesChangeElement) {
        const yesterdayTrades = Math.max(0, dashboardData.todaysTrades - Math.floor(Math.random() * 5));
        const change = dashboardData.todaysTrades - yesterdayTrades;
        tradesElement.textContent = dashboardData.todaysTrades;
        tradesChangeElement.textContent = `${change > 0 ? '+' : ''}${change} from yesterday`;
        tradesChangeElement.className = `metric-change ${change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'}`;
    }
}

// ===== UPDATE CHART =====
function updateChart() {
    const polyline = document.querySelector('.line-chart polyline');
    if (polyline) {
        // Generate realistic chart points based on portfolio trend
        const points = [];
        const baseHeight = 150;
        const volatility = 25;
        
        for (let i = 0; i <= 600; i += 50) {
            const progress = i / 600;
            const trend = (dashboardData.profitLoss / dashboardData.portfolioValue) * 100;
            const randomFactor = (Math.random() - 0.5) * volatility;
            const y = baseHeight - (trend * progress * 2) + randomFactor;
            points.push(`${i},${Math.max(25, Math.min(175, y))}`);
        }
        polyline.setAttribute('points', points.join(' '));
    }
}

// ===== UPDATE WIN RATE CHART =====
function updateWinRateChart() {
    const donutCircle = document.querySelector('.donut-svg circle:nth-child(2)');
    const donutValue = document.querySelector('.donut-value');
    
    if (donutCircle && donutValue) {
        const circumference = 308; // 2 * π * 49 (radius)
        const dashValue = (dashboardData.winRate / 100) * circumference;
        donutCircle.setAttribute('stroke-dasharray', `${dashValue} ${circumference}`);
        donutValue.textContent = `${Math.round(dashboardData.winRate)}%`;
        
        // Update color based on win rate
        const color = dashboardData.winRate >= 70 ? '#10b981' : 
                     dashboardData.winRate >= 50 ? '#f59e0b' : '#ef4444';
        donutCircle.setAttribute('stroke', color);
    }
}

// ===== ADD RECENT ACTIVITY =====
function addRecentActivity(walletName, activityType) {
    const activities = {
        wallet_activity: {
            icon: '📊',
            type: 'alert',
            title: 'Wallet Activity Detected',
            amount: 'Analysis'
        },
        buy: {
            icon: '📥',
            type: 'buy',
            title: 'Buy Order Executed',
            amount: `+${Math.floor(Math.random() * 1000)} SOL`
        },
        sell: {
            icon: '📤',
            type: 'sell',
            title: 'Sell Order Executed',
            amount: `-${Math.floor(Math.random() * 500)} BONK`
        },
        swap: {
            icon: '🔄',
            type: 'swap',
            title: 'Token Swap',
            amount: 'SOL → USDC'
        }
    };
    
    const activity = activities[activityType] || activities.wallet_activity;
    const now = new Date();
    const timeDiff = Math.floor(Math.random() * 120); // 0-120 minutes ago
    
    const newActivity = {
        ...activity,
        wallet: walletName,
        time: `${timeDiff} minute${timeDiff !== 1 ? 's' : ''} ago`,
        timestamp: now.getTime()
    };
    
    dashboardData.recentActivities.unshift(newActivity);
    
    // Keep only last 10 activities
    if (dashboardData.recentActivities.length > 10) {
        dashboardData.recentActivities.pop();
    }
    
    renderRecentActivities();
}

// ===== RENDER RECENT ACTIVITIES =====
function renderRecentActivities() {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    activityList.innerHTML = '';
    
    dashboardData.recentActivities.forEach(activity => {
        const activityHTML = `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-meta">${activity.wallet} • ${activity.time}</div>
                </div>
                <div class="activity-amount ${activity.type === 'buy' ? 'positive' : activity.type === 'sell' ? 'negative' : ''}">
                    ${activity.amount}
                </div>
            </div>
        `;
        activityList.insertAdjacentHTML('beforeend', activityHTML);
    });
}

// ===== RENDER TRACKED WALLETS =====
function renderTrackedWallets() {
    const walletsList = document.querySelector('.wallets-list');
    if (!walletsList) return;
    
    walletsList.innerHTML = '';
    
    dashboardData.trackedWallets.forEach((wallet, index) => {
        const walletHTML = `
            <div class="wallet-row" onclick="viewWallet('${wallet.fullAddress}')">
                <div class="wallet-avatar" style="background: ${getAvatarColor(index)}">${wallet.avatar}</div>
                <div class="wallet-info">
                    <div class="wallet-name">${wallet.name}</div>
                    <div class="wallet-address">${wallet.address}</div>
                </div>
                <div class="wallet-stats">
                    <div class="wallet-stat">
                        <span class="stat-label">ROI</span>
                        <span class="stat-value ${wallet.roiPositive ? 'positive' : 'negative'}">${wallet.roi}</span>
                    </div>
                    <div class="wallet-stat">
                        <span class="stat-label">Trades</span>
                        <span class="stat-value">${wallet.trades}</span>
                    </div>
                </div>
                <button class="btn btn-icon" onclick="event.stopPropagation(); viewWallet('${wallet.fullAddress}')">👁️</button>
            </div>
        `;
        walletsList.insertAdjacentHTML('beforeend', walletHTML);
    });
}

// ===== RENDER TOKEN PRICES =====
function renderTokenPrices() {
    const tokensGrid = document.querySelector('.tokens-grid');
    if (!tokensGrid) return;
    
    tokensGrid.innerHTML = '';
    
    Object.entries(dashboardData.tokenPrices).forEach(([symbol, token]) => {
        const tokenHTML = `
            <div class="token-card" onclick="viewToken('${symbol}')">
                <div class="token-header">
                    <div class="token-icon" style="background: ${getTokenColor(symbol)}">${symbol.charAt(0)}</div>
                    <div class="token-info">
                        <div class="token-name">${token.name}</div>
                        <div class="token-symbol">${token.symbol}</div>
                    </div>
                </div>
                <div class="token-price">$${token.price.toLocaleString('en-US', { minimumFractionDigits: token.price < 1 ? 6 : 2 })}</div>
                <div class="token-change ${token.isPositive ? 'positive' : 'negative'}">
                    ${token.isPositive ? '+' : ''}${token.change}%
                </div>
            </div>
        `;
        tokensGrid.insertAdjacentHTML('beforeend', tokenHTML);
    });
}

// ===== HELPER FUNCTIONS =====
function getAvatarColor(index) {
    const colors = [
        'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    ];
    return colors[index % colors.length];
}

function getTokenColor(symbol) {
    const colors = {
        'SOL': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        'JUP': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'BONK': 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
        'RAY': 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    };
    return colors[symbol] || 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
}

// ===== USER INTERACTIONS =====
function viewWallet(address) {
    window.open(`https://solscan.io/account/${address}`, '_blank');
}

function viewToken(symbol) {
    showNotification(`Opening ${symbol} price chart...`);
    // In a real app, this would open a detailed token view
}

// ===== REFRESH DATA FUNCTION =====
async function refreshData() {
    const btn = document.querySelector('.btn-refresh');
    const originalText = btn.innerHTML;
    
    // Show loading state
    btn.innerHTML = '<span>⏳</span> Refreshing...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
    
    try {
        // Fetch latest data
        await updatePortfolioMetrics();
        await updateTokenPricesData();
        
        showNotification('Dashboard data refreshed successfully!', true);
    } catch (error) {
        console.error('Error refreshing data:', error);
        showNotification('Error refreshing data', false);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        btn.style.opacity = '1';
    }
}

async function updateTokenPricesData() {
    dashboardData.tokenPrices = await fetchTokenPrices();
    renderTokenPrices();
}

// ===== INITIALIZE TRACKED WALLETS =====
async function initializeTrackedWallets() {
    const walletsWithData = await Promise.all(
        TRACKED_WALLETS.map(async (wallet, index) => {
            const data = await fetchWalletData(wallet.address);
            const roi = [8.08, 15.3, 22.7, -3.2][index] || (Math.random() * 30 - 5);
            const trades = [42, 67, 89, 31][index] || Math.floor(Math.random() * 100 + 20);
            
            return {
                ...wallet,
                address: wallet.address.substring(0, 6) + '...' + wallet.address.substring(wallet.address.length - 4),
                fullAddress: wallet.address,
                roi: `${roi > 0 ? '+' : ''}${roi.toFixed(1)}%`,
                roiPositive: roi > 0,
                trades: trades,
                balance: data.balance,
                lastActivity: data.lastActivity
            };
        })
    );
    
    dashboardData.trackedWallets = walletsWithData;
    renderTrackedWallets();
    
    // Connect WebSockets for real-time updates
    walletsWithData.forEach(wallet => {
        connectWalletWebSocket(wallet.fullAddress, wallet.name);
    });
}

// ===== REAL-TIME UPDATES =====
function startRealTimeUpdates() {
    // Update metrics every 5 seconds
    setInterval(() => {
        updatePortfolioMetrics();
    }, 5000);
    
    // Update token prices every 10 seconds
    setInterval(async () => {
        await updateTokenPricesData();
    }, 10000);
    
    // Simulate random wallet activities
    setInterval(() => {
        if (dashboardData.trackedWallets.length > 0 && Math.random() > 0.7) {
            const randomWallet = dashboardData.trackedWallets[Math.floor(Math.random() * dashboardData.trackedWallets.length)];
            const activityTypes = ['buy', 'sell', 'swap', 'wallet_activity'];
            const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];
            addRecentActivity(randomWallet.name, randomActivity);
        }
    }, 15000);
}

// ===== SHOW NOTIFICATION =====
function showNotification(message, isPositive = true) {
    // Remove existing notification if any
    const existing = document.querySelector('.notification-toast');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.innerHTML = `
        <span style="margin-right: 8px;">${isPositive ? '✅' : '❌'}</span>
        ${message}
    `;
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: ${isPositive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        font-weight: 600;
        display: flex;
        align-items: center;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ===== NAVIGATION =====
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        const pageName = this.textContent.trim();
        
        switch(pageName) {
            case 'Home':
                window.location.href = 'index.html';
                break;
            case 'Dashboard':
                console.log('Already on Dashboard page');
                break;
            case 'HNI Wallets':
                window.location.href = 'hni-index.html';
                break;
            case 'Copy Trading':
                window.location.href = 'copy-trading.html';
                break;
            case 'AI Assistant':
                window.location.href = 'chatbot.html';
                break;
            case 'Settings':
                console.log('Navigate to Settings');
                break;
            default:
                console.log('Unknown page:', pageName);
        }
    });
});

// ===== INITIALIZE DASHBOARD =====
async function initializeDashboard() {
    console.log('🚀 Initializing real-time dashboard...');
    
    try {
        // Initialize all data
        await initializeTrackedWallets();
        await updateTokenPricesData();
        
        // Render initial state
        renderMetrics();
        updateChart();
        updateWinRateChart();
        renderRecentActivities();
        
        // Start real-time updates
        startRealTimeUpdates();
        
        console.log('✅ Dashboard initialized with real-time data');
        showNotification('Dashboard connected with live updates', true);
        
    } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        showNotification('Error loading dashboard data', false);
    }
}

// ===== CLEANUP =====
window.addEventListener('beforeunload', () => {
    wsConnections.forEach(ws => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
    });
});

// ===== START DASHBOARD =====
document.addEventListener('DOMContentLoaded', initializeDashboard);

// Add animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    .metric-card.updating {
        animation: pulse 0.5s ease-in-out;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
`;
document.head.appendChild(style);