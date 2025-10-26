// Configuration
const HELIUS_API_KEY = 'dd34ce47-ef12-405c-81fe-fc2128cfc33d'; // Replace with your actual API key
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Global state
let activeCopies = [];
let availableTraders = [];
let realTimeConnections = new Map();
let currentSettings = {
    maxPerTrade: 500,
    stopLoss: 10,
    takeProfit: 25,
    slippage: 1
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Copy Trading page initialized');
    
    initializeCardEffects();
    initializeRealTimeData();
    loadInitialData();
    startRealTimeUpdates();
    
    showNotification('Copy Trading dashboard loaded with real-time data', 'success');
});

// Navigation active state and page navigation
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
                window.location.href = 'dashboard.html';
                break;
            case 'HNI Wallets':
                window.location.href = 'hni-index.html';
                break;
            case 'Copy Trading':
                console.log('Already on Copy Trading page');
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

// Initialize real-time data connections
async function initializeRealTimeData() {
    updateConnectionStatus('connecting');
    
    try {
        // Test Helius connection
        const testConnection = await fetch(HELIUS_RPC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getHealth',
            })
        });
        
        if (testConnection.ok) {
            updateConnectionStatus('connected');
            showNotification('Connected to Helius API', 'success');
        } else {
            throw new Error('Connection failed');
        }
    } catch (error) {
        console.error('Helius connection failed:', error);
        updateConnectionStatus('disconnected');
        showNotification('Failed to connect to Helius API', 'error');
    }
}

// Load initial data
async function loadInitialData() {
    try {
        // Load active copies from localStorage or initialize with defaults
        const savedCopies = localStorage.getItem('activeCopyTrades');
        activeCopies = savedCopies ? JSON.parse(savedCopies) : getDefaultActiveCopies();
        
        // Load available traders
        availableTraders = await fetchTopTraders();
        
        // Render all data
        renderActiveCopies();
        renderAvailableTraders();
        updateStatsOverview();
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        showNotification('Error loading trader data', 'error');
    }
}

// Get default active copies structure
function getDefaultActiveCopies() {
    return [
        {
            id: 'megawhale',
            name: 'MegaWhale',
            address: '7a9Bc1...k3Lm',
            avatar: 'M',
            status: 'active',
            totalInvested: 5200,
            currentPL: 780,
            roi: 15.0,
            copiedTrades: 23,
            settings: {
                maxPerTrade: 500,
                stopLoss: 10,
                takeProfit: 25
            },
            lastUpdate: Date.now()
        },
        {
            id: 'smarttrader',
            name: 'SmartTrader',
            address: '4c2De5...p9Qr',
            avatar: 'S',
            status: 'active',
            totalInvested: 3800,
            currentPL: 863,
            roi: 22.7,
            copiedTrades: 31,
            settings: {
                maxPerTrade: 300,
                stopLoss: 8,
                takeProfit: 20
            },
            lastUpdate: Date.now()
        }
    ];
}

// Fetch top traders from Helius API
async function fetchTopTraders() {
    try {
        // This would typically fetch real trader data from Helius
        // For now, we'll use mock data that simulates real trading activity
        
        const mockTraders = [
            {
                id: 'defiking',
                name: 'DeFiKing',
                address: '9f8Gh6...t1Uv',
                avatar: 'D',
                category: 'high-roi',
                tags: ['High Volume', 'Swing Trader'],
                metrics: {
                    roi30d: 45.3,
                    winRate: 68,
                    avgTrade: 2400,
                    followers: 234
                },
                premium: true
            },
            {
                id: 'cryptoninja',
                name: 'CryptoNinja',
                address: '5e3Jk8...w2Xy',
                avatar: 'C',
                category: 'consistent',
                tags: ['Scalper', 'Day Trader'],
                metrics: {
                    roi30d: 28.5,
                    winRate: 75,
                    avgTrade: 1200,
                    followers: 189
                },
                premium: false
            },
            {
                id: 'profitmaster',
                name: 'ProfitMaster',
                address: '2b1Fg9...m5Kp',
                avatar: 'P',
                category: 'low-risk',
                tags: ['Conservative', 'HODLer'],
                metrics: {
                    roi30d: 18.2,
                    winRate: 82,
                    avgTrade: 3100,
                    followers: 156
                },
                premium: false
            },
            {
                id: 'tokenhunter',
                name: 'TokenHunter',
                address: '8h7Nm4...r6Tw',
                avatar: 'T',
                category: 'high-roi',
                tags: ['Momentum', 'Aggressive'],
                metrics: {
                    roi30d: 52.8,
                    winRate: 62,
                    avgTrade: 1800,
                    followers: 278
                },
                premium: false
            }
        ];

        // Simulate real-time updates to metrics
        return mockTraders.map(trader => ({
            ...trader,
            metrics: {
                ...trader.metrics,
                roi30d: trader.metrics.roi30d + (Math.random() - 0.5) * 5,
                winRate: Math.min(95, Math.max(50, trader.metrics.winRate + (Math.random() - 0.5) * 3)),
                followers: trader.metrics.followers + Math.floor(Math.random() * 10)
            }
        }));
        
    } catch (error) {
        console.error('Error fetching traders:', error);
        return [];
    }
}

// Render active copies
function renderActiveCopies() {
    const grid = document.getElementById('activeCopiesGrid');
    
    if (activeCopies.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>No Active Copy Trades</h3>
                <p>Start copying traders to see your active trades here</p>
                <button class="btn btn-primary" onclick="openStartCopyModal()">
                    Start Copy Trading
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = activeCopies.map(copy => `
        <div class="copy-card ${copy.status}" data-trader-id="${copy.id}">
            <div class="copy-status-badge ${copy.status}">
                <span>${copy.status === 'active' ? '🟢' : '⏸️'}</span>
                ${copy.status === 'active' ? 'Active' : 'Paused'}
            </div>
            <div class="copy-header">
                <div class="trader-avatar">${copy.avatar}</div>
                <div class="trader-info">
                    <div class="trader-name">${copy.name}</div>
                    <div class="trader-address">${copy.address}</div>
                </div>
                <div class="copy-menu">
                    <button class="btn-icon" onclick="toggleCopyMenu(event, '${copy.id}')">⋮</button>
                </div>
            </div>
            
            <div class="copy-stats">
                <div class="stat-item">
                    <div class="stat-label">Total Invested</div>
                    <div class="stat-value">$${copy.totalInvested.toLocaleString()}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Current P/L</div>
                    <div class="stat-value ${copy.currentPL >= 0 ? 'profit' : 'loss'}">
                        ${copy.currentPL >= 0 ? '+' : ''}$${Math.abs(copy.currentPL).toLocaleString()}
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">ROI</div>
                    <div class="stat-value ${copy.roi >= 0 ? 'profit' : 'loss'}">
                        ${copy.roi >= 0 ? '+' : ''}${copy.roi.toFixed(1)}%
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Copied Trades</div>
                    <div class="stat-value">${copy.copiedTrades}</div>
                </div>
            </div>

            <div class="copy-settings-summary">
                <div class="setting-tag">Max per Trade: $${copy.settings.maxPerTrade}</div>
                <div class="setting-tag">Stop Loss: ${copy.settings.stopLoss}%</div>
                <div class="setting-tag">Take Profit: ${copy.settings.takeProfit}%</div>
            </div>

            <div class="copy-actions">
                <button class="btn btn-outline" onclick="editCopySettings('${copy.id}')">
                    <span>⚙️</span>
                    Edit Settings
                </button>
                ${copy.status === 'active' ? 
                    `<button class="btn btn-pause" onclick="pauseCopy('${copy.id}')">
                        <span>⏸️</span>
                        Pause
                    </button>` :
                    `<button class="btn btn-resume" onclick="resumeCopy('${copy.id}')">
                        <span>▶️</span>
                        Resume
                    </button>`
                }
            </div>
        </div>
    `).join('');
}

// Render available traders
function renderAvailableTraders() {
    const grid = document.getElementById('tradersGrid');
    
    grid.innerHTML = availableTraders.map(trader => `
        <div class="trader-card" data-category="${trader.category}" data-trader-id="${trader.id}">
            ${trader.premium ? '<div class="trader-badge premium">⭐ Premium</div>' : ''}
            <div class="trader-profile">
                <div class="trader-avatar large">${trader.avatar}</div>
                <div class="trader-details">
                    <div class="trader-name">${trader.name}</div>
                    <div class="trader-address">${trader.address}</div>
                    <div class="trader-tags">
                        ${trader.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>

            <div class="trader-metrics">
                <div class="metric">
                    <div class="metric-label">30D ROI</div>
                    <div class="metric-value success">+${trader.metrics.roi30d.toFixed(1)}%</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Win Rate</div>
                    <div class="metric-value">${trader.metrics.winRate.toFixed(0)}%</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Avg Trade</div>
                    <div class="metric-value">$${(trader.metrics.avgTrade / 1000).toFixed(1)}K</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Followers</div>
                    <div class="metric-value">${trader.metrics.followers}</div>
                </div>
            </div>

            <div class="trader-chart">
                <svg viewBox="0 0 300 60" class="mini-chart">
                    <polyline points="${generateChartPoints(trader.metrics.roi30d)}" 
                              fill="none" stroke="#10b981" stroke-width="2"/>
                </svg>
            </div>

            <button class="btn btn-copy" onclick="startCopyTrading('${trader.id}')">
                <span>📋</span>
                Start Copying
            </button>
        </div>
    `).join('');
    
    animateCharts();
}

// Generate chart points based on ROI
function generateChartPoints(roi) {
    const points = [];
    const volatility = roi > 40 ? 15 : roi > 20 ? 10 : 5;
    
    for (let i = 0; i <= 10; i++) {
        const x = i * 30;
        const baseY = 60 - (roi / 2);
        const variation = Math.sin(i * 0.5) * volatility;
        const y = baseY + variation;
        points.push(`${x},${y}`);
    }
    
    return points.join(' ');
}

// Update stats overview
function updateStatsOverview() {
    const totalInvested = activeCopies.reduce((sum, copy) => sum + copy.totalInvested, 0);
    const totalProfit = activeCopies.reduce((sum, copy) => sum + copy.currentPL, 0);
    const totalTrades = activeCopies.reduce((sum, copy) => sum + copy.copiedTrades, 0);
    const activeCount = activeCopies.filter(copy => copy.status === 'active').length;
    const pausedCount = activeCopies.filter(copy => copy.status === 'paused').length;
    
    const overallROI = totalInvested > 0 ? (totalProfit / totalInvested * 100) : 0;
    const successRate = totalTrades > 0 ? Math.min(95, 70 + (Math.random() * 15)) : 0; // Simulated success rate
    
    document.getElementById('statsCards').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
                <div class="stat-label">Total Invested</div>
                <div class="stat-number">$${totalInvested.toLocaleString()}</div>
                <div class="stat-change positive">+${Math.floor(totalInvested * 0.15).toLocaleString()} this month</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
                <div class="stat-label">Total Profit</div>
                <div class="stat-number">$${Math.abs(totalProfit).toLocaleString()}</div>
                <div class="stat-change ${totalProfit >= 0 ? 'positive' : 'negative'}">
                    ${totalProfit >= 0 ? '+' : ''}${overallROI.toFixed(1)}% overall ROI
                </div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-content">
                <div class="stat-label">Success Rate</div>
                <div class="stat-number">${successRate.toFixed(0)}%</div>
                <div class="stat-change positive">${Math.floor(totalTrades * successRate / 100)}/${totalTrades} winning trades</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
                <div class="stat-label">Traders Copied</div>
                <div class="stat-number">${activeCopies.length}</div>
                <div class="stat-change neutral">${activeCount} active, ${pausedCount} paused</div>
            </div>
        </div>
    `;
}

// Real-time updates
function startRealTimeUpdates() {
    // Update trader metrics every 30 seconds
    setInterval(async () => {
        if (availableTraders.length > 0) {
            availableTraders = await fetchTopTraders();
            renderAvailableTraders();
        }
    }, 30000);
    
    // Update active copies every 15 seconds
    setInterval(() => {
        updateActiveCopiesRealTime();
    }, 15000);
    
    // Update connection status every minute
    setInterval(() => {
        updateLastUpdateTime();
    }, 60000);
}

// Update active copies with real-time data
function updateActiveCopiesRealTime() {
    activeCopies.forEach(copy => {
        if (copy.status === 'active') {
            // Simulate real trading activity
            const plChange = (Math.random() - 0.4) * 50; // -20 to +30 range
            const tradeIncrement = Math.random() > 0.7 ? 1 : 0;
            
            copy.currentPL += plChange;
            copy.copiedTrades += tradeIncrement;
            copy.totalInvested += tradeIncrement > 0 ? copy.settings.maxPerTrade : 0;
            copy.roi = (copy.currentPL / copy.totalInvested) * 100;
            copy.lastUpdate = Date.now();
        }
    });
    
    // Save to localStorage
    localStorage.setItem('activeCopyTrades', JSON.stringify(activeCopies));
    
    // Update UI
    renderActiveCopies();
    updateStatsOverview();
    
    showNotification('Portfolio updated with latest data', 'info');
}

// Filter functionality
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const filter = this.getAttribute('data-filter');
        filterTraders(filter);
    });
});

function filterTraders(filter) {
    const traderCards = document.querySelectorAll('.trader-card');
    
    traderCards.forEach(card => {
        if (filter === 'all') {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease-in';
        } else {
            const category = card.getAttribute('data-category');
            if (category === filter) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease-in';
            } else {
                card.style.display = 'none';
            }
        }
    });
    
    showNotification(`Showing ${filter === 'all' ? 'all' : filter} traders`);
}

// Start copying a specific trader
function startCopyTrading(traderId) {
    const trader = availableTraders.find(t => t.id === traderId);
    
    if (!trader) {
        showNotification('Trader not found', 'error');
        return;
    }
    
    // Check if already copying
    if (activeCopies.find(copy => copy.id === traderId)) {
        showNotification(`Already copying ${trader.name}`, 'warning');
        return;
    }
    
    const newCopy = {
        id: traderId,
        name: trader.name,
        address: trader.address,
        avatar: trader.avatar,
        status: 'active',
        totalInvested: Math.floor(Math.random() * 2000) + 1000,
        currentPL: Math.floor(Math.random() * 500) + 50,
        roi: Math.random() * 20 + 5,
        copiedTrades: Math.floor(Math.random() * 20) + 5,
        settings: { ...currentSettings },
        lastUpdate: Date.now()
    };
    
    activeCopies.push(newCopy);
    localStorage.setItem('activeCopyTrades', JSON.stringify(activeCopies));
    
    renderActiveCopies();
    updateStatsOverview();
    
    showNotification(`✅ Started copying ${trader.name}!`, 'success');
}

// Edit copy settings
function editCopySettings(traderId) {
    const copy = activeCopies.find(c => c.id === traderId);
    if (!copy) return;
    
    // Populate modal with current settings
    document.getElementById('maxPerTrade').value = copy.settings.maxPerTrade;
    document.getElementById('stopLoss').value = copy.settings.stopLoss;
    document.getElementById('takeProfit').value = copy.settings.takeProfit;
    document.getElementById('slippage').value = copy.settings.slippage || 1;
    
    // Store current trader ID
    document.getElementById('settingsModal').setAttribute('data-editing-trader', traderId);
    
    openSettingsModal();
}

// Open settings modal
function openSettingsModal() {
    document.getElementById('settingsModal').classList.add('show');
}

// Close settings modal
function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('show');
}

// Save settings
function saveSettings() {
    const traderId = document.getElementById('settingsModal').getAttribute('data-editing-trader');
    const copy = activeCopies.find(c => c.id === traderId);
    
    if (copy) {
        copy.settings = {
            maxPerTrade: parseInt(document.getElementById('maxPerTrade').value),
            stopLoss: parseInt(document.getElementById('stopLoss').value),
            takeProfit: parseInt(document.getElementById('takeProfit').value),
            slippage: parseFloat(document.getElementById('slippage').value)
        };
        
        localStorage.setItem('activeCopyTrades', JSON.stringify(activeCopies));
        renderActiveCopies();
        showNotification('Settings saved successfully', 'success');
    }
    
    closeSettingsModal();
}

// Pause copy trading
function pauseCopy(traderId) {
    const copy = activeCopies.find(c => c.id === traderId);
    if (copy) {
        copy.status = 'paused';
        localStorage.setItem('activeCopyTrades', JSON.stringify(activeCopies));
        renderActiveCopies();
        showNotification(`⏸️ Paused copy trading for ${copy.name}`, 'warning');
    }
}

// Resume copy trading
function resumeCopy(traderId) {
    const copy = activeCopies.find(c => c.id === traderId);
    if (copy) {
        copy.status = 'active';
        localStorage.setItem('activeCopyTrades', JSON.stringify(activeCopies));
        renderActiveCopies();
        showNotification(`▶️ Resumed copy trading for ${copy.name}`, 'success');
    }
}

// Pause all copies
function pauseAllCopies() {
    let count = 0;
    
    activeCopies.forEach(copy => {
        if (copy.status === 'active') {
            copy.status = 'paused';
            count++;
        }
    });
    
    if (count > 0) {
        localStorage.setItem('activeCopyTrades', JSON.stringify(activeCopies));
        renderActiveCopies();
        showNotification(`⏸️ Paused ${count} active copy trade${count > 1 ? 's' : ''}`, 'warning');
    } else {
        showNotification('No active copy trades to pause', 'info');
    }
}

// Refresh all data
function refreshAllData() {
    showNotification('Refreshing all data...', 'info');
    
    // Add loading state
    document.body.classList.add('loading');
    
    setTimeout(async () => {
        await loadInitialData();
        document.body.classList.remove('loading');
        showNotification('Data refreshed successfully', 'success');
    }, 1000);
}

// Update connection status
function updateConnectionStatus(status) {
    const statusDot = document.getElementById('connectionStatus');
    const statusText = document.getElementById('lastUpdate');
    
    statusDot.className = 'status-dot ' + status;
    
    switch(status) {
        case 'connected':
            statusText.textContent = 'Live';
            break;
        case 'connecting':
            statusText.textContent = 'Connecting...';
            break;
        case 'disconnected':
            statusText.textContent = 'Offline';
            break;
    }
}

// Update last update time
function updateLastUpdateTime() {
    const now = new Date();
    document.getElementById('lastUpdate').textContent = 
        'Last update: ' + now.toLocaleTimeString();
}

// Toggle copy menu
function toggleCopyMenu(event, traderId) {
    event.stopPropagation();
    showNotification('Copy trade options menu');
    // Here you would show a dropdown menu with more options
}

// Show notification toast
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification-toast');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.textContent = message;
    
    let bgColor;
    switch(type) {
        case 'success':
            bgColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            break;
        case 'warning':
            bgColor = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
            break;
        case 'error':
            bgColor = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            break;
        default:
            bgColor = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    }
    
    notification.style.cssText = 
        'position: fixed;' +
        'bottom: 2rem;' +
        'right: 2rem;' +
        'background: ' + bgColor + ';' +
        'color: white;' +
        'padding: 1rem 1.5rem;' +
        'border-radius: 12px;' +
        'box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);' +
        'z-index: 1000;' +
        'animation: slideInRight 0.3s ease-out;' +
        'font-weight: 600;' +
        'max-width: 400px;';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Animate charts
function animateCharts() {
    const charts = document.querySelectorAll('.mini-chart polyline');
    charts.forEach((chart, index) => {
        setTimeout(() => {
            const length = chart.getTotalLength();
            chart.style.strokeDasharray = length;
            chart.style.strokeDashoffset = length;
            chart.style.animation = 'drawChart 1.5s ease-out forwards';
        }, index * 200);
    });
}

// Initialize card effects
function initializeCardEffects() {
    document.querySelectorAll('.copy-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('paused')) {
                this.style.borderColor = 'rgba(59, 130, 246, 0.5)';
            }
        });
        card.addEventListener('mouseleave', function() {
            this.style.borderColor = '';
        });
    });
    
    document.querySelectorAll('.trader-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.borderColor = 'rgba(59, 130, 246, 0.5)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.borderColor = '';
        });
    });
    
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.borderColor = 'rgba(59, 130, 246, 0.5)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.borderColor = '';
        });
    });
}

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
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    
    @keyframes drawChart {
        to {
            stroke-dashoffset: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
    
    .empty-state {
        text-align: center;
        padding: 3rem 2rem;
        grid-column: 1 / -1;
    }
    
    .empty-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.7;
    }
    
    .empty-state h3 {
        margin-bottom: 0.5rem;
        color: #ffffff;
    }
    
    .empty-state p {
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 2rem;
    }
`;
document.head.appendChild(style);

// Start Copy Trading Modal function
function openStartCopyModal() {
    showNotification('Opening copy trading setup modal...');
    // Here you would open a modal with copy trading settings
    console.log('Open copy trading configuration modal');
}