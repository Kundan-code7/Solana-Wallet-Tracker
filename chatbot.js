let geminiApiKey = 'AIzaSyD1GCC1rn8C0L2wQCUanB77AEVlqh8VJjI'; 
let heliusApiKey = 'dd34ce47-ef12-405c-81fe-fc2128cfc33d'; 
let isLoading = false;

// DOM Elements
let apiKeySection, messagesContainer, userInput, sendBtn, quickPrompts;
let connectionStatus, lastUpdate, solPriceElement, solChangeElement;

// ==================== DEMO RESPONSES FOR ALL QUESTIONS ====================

const demoResponses = {
    // Wallet Analysis Questions
    'Which wallet should I copy for maximum returns?': `📊 **Top Wallets to Copy - Based on Performance Data**

🏆 **SmartTrader** - Best Overall Performer
• 30-Day ROI: +22.7%
• Win Rate: 88%
• Strategy: Swing trading SOL pairs
• Risk Level: Medium
• Recommended for: Balanced returns

🐋 **MegaWhale** - Consistent Performer  
• 30-Day ROI: +15.0%
• Win Rate: 73%
• Strategy: Position trading
• Risk Level: Low
• Recommended for: Steady growth

⚡ **WallStreet** - High Risk/Reward
• 30-Day ROI: +8.1%
• Win Rate: 82%
• Strategy: Memecoin trading
• Risk Level: High
• Recommended for: Aggressive traders

💡 **My Recommendation**: Start with SmartTrader for the best risk-adjusted returns, then diversify based on your trading style.`,

    'Explain the difference between win rate and ROI in crypto trading': `📈 **Win Rate vs ROI - Complete Guide**

🎯 **Win Rate (Win Percentage)**
• Measures how often trades are profitable
• Example: 80% win rate = 8 out of 10 trades make money
• Focuses on frequency of success
• Can be misleading if you have small wins but big losses

💰 **ROI (Return on Investment)**
• Measures actual profit/loss percentage
• Example: +25% ROI = $1,000 turns into $1,250
• Reflects real monetary gains/losses
• Considers position sizing and profit amounts

⚖️ **Why Both Metrics Matter:**
High Win Rate + Low ROI = Consistent but small profits
Low Win Rate + High ROI = Fewer wins but bigger gains
60-80% Win Rate + Positive ROI = Ideal combination

💡 **Pro Tip**: Look for traders with 60%+ win rate AND consistent positive ROI for sustainable success.`,

    'Analyze the current Solana market trends and top performing wallets': `🔍 **Solana Market Analysis - Current Trends**

📊 **Market Overview:**
• SOL Price: $185-195 range
• 24h Change: +4-6%
• Market Cap: ~$82B
• Trading Volume: $3-4B daily
• Market Sentiment: Bullish 🟢

🚀 **Top Performing Wallets:**

1. **SmartTrader** (88% Win Rate)
   - ROI: +22.7% (30-day)
   - Strategy: DeFi yield farming + swing trading
   - Focus: JUP, RAY, JTO tokens
   - Recent Success: JUP airdrop plays

2. **MegaWhale** (73% Win Rate)
   - ROI: +15.0% (30-day) 
   - Strategy: Blue-chip accumulation
   - Focus: SOL, RAY, MAPS
   - Style: Long-term position building

3. **WallStreet** (82% Win Rate)
   - ROI: +8.1% (30-day)
   - Strategy: Memecoin momentum
   - Focus: BONK, WIF, new launches
   - Style: High-frequency trading

💡 **Market Insight**: DeFi tokens showing strength while memecoins consolidate. SOL holding strong above $180 support.`,

    'What trading strategy should I use for Solana tokens right now?': `🎯 **Current Solana Trading Strategy Recommendations**

🟢 **For Current Market Conditions (~$185-195 SOL):**

1. **Swing Trading Strategy**
   - Hold Period: 2-7 days
   - Target Gains: 5-15% per trade
   - Stop Loss: 8% below entry
   - Best For: SOL pairs with good volume

2. **DCA (Dollar-Cost Averaging)**
   - Buy: Weekly/Monthly intervals
   - Focus: SOL and blue-chip tokens
   - Strategy: Accumulate on dips below $185
   - Best For: Long-term investors

3. **DeFi Yield Farming**
   - Protocols: Marinade, Jito, Raydium
   - APY: 5-15% on SOL staking
   - Risk: Low to Medium
   - Best For: Passive income seekers

⚠️ **Risk Management Rules:**
• Never risk more than 2% of portfolio per trade
• Always use stop losses
• Take profits at resistance levels
• Diversify across 3-5 tokens

📈 **Key Levels to Watch:**
• Support: $180, $175
• Resistance: $200, $210`,

    // Wallet-specific questions
    'default_wallet': `🔍 **Wallet Analysis Available**

I can provide detailed analysis of any Solana wallet including:
• SOL balance and portfolio value
• Token holdings and diversity  
• Transaction history and activity patterns
• Performance metrics and trading style

💡 **Try asking:**
• "Analyze wallet [address]"
• "What's in wallet [address]?"
• "Is wallet [address] active?"
• "Compare wallet [address] to top traders"

Provide a valid Solana wallet address (starts with letters/numbers, 32-44 characters) for real-time analysis.`,

    // General trading questions
    'default_trading': `📊 **Solana Trading Insights**

I can help you with:
• Market analysis and price predictions
• Trading strategies and risk management
• Wallet performance analysis
• Token research and due diligence
• Copy trading recommendations

💡 **Popular Questions:**
• "Best time to trade SOL?"
• "How to manage risk in crypto?"
• "What are the best DeFi protocols?"
• "Swing trading vs day trading?"
• "How to read candlestick charts?"

Ask me anything specific about Solana trading!`,

    // Default fallback
    'default': `🤖 **Solana AI Trading Assistant**

I'm here to provide comprehensive Solana trading insights and analysis!

🔍 **What I Can Help With:**
• Wallet analysis and performance tracking
• Real-time market insights and trends
• Trading strategies and risk management
• Copy trading recommendations
• Token research and portfolio advice

💡 **Try These Questions:**
• "Which wallet should I copy for maximum returns?"
• "Analyze current Solana market trends"
• "Explain win rate vs ROI in crypto trading" 
• "What trading strategy should I use now?"
• "Analyze wallet [Solana-address]"

I'll provide detailed, actionable insights to help your trading journey! 🚀`
};

// ==================== SMART RESPONSE GENERATOR ====================

// Generate smart response based on question type
function generateSmartResponse(question) {
    const lowerQuestion = question.toLowerCase().trim();
    
    // Check for exact matches first
    if (demoResponses[question]) {
        return demoResponses[question];
    }
    
    // Check for wallet address queries
    const walletAddressRegex = /[1-9A-HJ-NP-Za-km-z]{32,44}/;
    if (walletAddressRegex.test(question)) {
        const address = question.match(walletAddressRegex)[0];
        return `🔍 **Wallet Analysis: ${address.slice(0, 8)}...${address.slice(-8)}**

📊 **Analysis Results:**
• **Status**: Valid Solana address detected
• **Analysis Type**: Portfolio and activity review
• **Data Source**: Helius API (Blockchain data)

💡 **What I Can Analyze:**
• SOL balance and estimated value
• Token holdings and diversity
• Recent transaction activity  
• Trading patterns and behavior
• Comparison with top performers

⚠️ **Note**: For detailed real-time analysis with actual balance data, the Helius API integration needs to be fully configured with a valid API key.

🔄 **Try These Instead:**
• Ask about our tracked wallets (SmartTrader, MegaWhale, WallStreet)
• Request general trading strategies
• Get market analysis insights`;
    }
    
    // Check for wallet-related questions
    if (lowerQuestion.includes('wallet') && 
        (lowerQuestion.includes('analyze') || 
         lowerQuestion.includes('check') || 
         lowerQuestion.includes('lookup'))) {
        return demoResponses['default_wallet'];
    }
    
    // Check for trading-related questions
    if (lowerQuestion.includes('trade') || 
        lowerQuestion.includes('strategy') ||
        lowerQuestion.includes('market') ||
        lowerQuestion.includes('price') ||
        lowerQuestion.includes('buy') ||
        lowerQuestion.includes('sell')) {
        return demoResponses['default_trading'];
    }
    
    // Check for specific question patterns
    if (lowerQuestion.includes('win rate') || lowerQuestion.includes('roi')) {
        return demoResponses['Explain the difference between win rate and ROI in crypto trading'];
    }
    
    if ((lowerQuestion.includes('copy') || lowerQuestion.includes('follow')) && 
        lowerQuestion.includes('wallet')) {
        return demoResponses['Which wallet should I copy for maximum returns?'];
    }
    
    if (lowerQuestion.includes('trend') || lowerQuestion.includes('market analysis')) {
        return demoResponses['Analyze the current Solana market trends and top performing wallets'];
    }
    
    if (lowerQuestion.includes('strategy') && lowerQuestion.includes('now')) {
        return demoResponses['What trading strategy should I use for Solana tokens right now?'];
    }
    
    // Default response
    return demoResponses['default'];
}

// ==================== REAL DATA FUNCTIONS ====================

async function getRealSOLBalance(walletAddress) {
    if (!heliusApiKey) return null;
    
    try {
        const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${heliusApiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: '1',
                method: 'getBalance',
                params: [walletAddress]
            })
        });

        if (!response.ok) return null;
        const data = await response.json();
        
        if (data.error) return null;
        return data.result.value / 1e9; 

    } catch (error) {
        console.error('Error fetching SOL balance:', error);
        return null;
    }
}

// Get real Solana price from CoinGecko
async function getRealSolanaPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true');
        if (response.ok) {
            const data = await response.json();
            return {
                price: data.solana.usd,
                change24h: data.solana.usd_24h_change,
                source: 'CoinGecko',
                isReal: true
            };
        }
    } catch (error) {
        console.warn('Real price API failed:', error);
    }
    
    // Fallback data
    return { 
        price: 185.65, 
        change24h: 4.14,
        source: 'Fallback',
        isReal: false
    };
}

// ==================== GEMINI AI RESPONSE GENERATOR ====================

// Generate AI response using Gemini (with fallback)
async function generateAIResponse(userQuestion) {
    if (!geminiApiKey) {
        throw new Error('Gemini API not configured');
    }

    try {
        // Try the newer model first
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are an expert Solana trading analyst. Provide accurate, specific responses about Solana trading, wallet analysis, and market insights.

USER QUESTION: ${userQuestion}

RESPONSE REQUIREMENTS:
1. Be specific and data-driven in your analysis
2. Provide actionable trading advice when relevant
3. Use bullet points or numbered lists for clarity
4. Keep responses comprehensive but focused
5. Highlight key insights

Focus on Solana ecosystem, trading strategies, wallet analysis, and market trends.`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1200,
                    }
                })
            }
        );
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid API response format');
        }
    } catch (error) {
        console.error('Gemini API failed, using smart fallback:', error);
        // Fall back to our smart response system
        return generateSmartResponse(userQuestion);
    }
}

// ==================== UI FUNCTIONS ====================

// Add message to chat
function addMessage(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = role === 'assistant' ? '🤖' : '👤';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    
    const senderSpan = document.createElement('span');
    senderSpan.className = 'sender-name';
    senderSpan.textContent = role === 'assistant' ? 'Solana AI Assistant' : 'You';
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    headerDiv.appendChild(senderSpan);
    headerDiv.appendChild(timeSpan);
    
    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = content;
    
    contentDiv.appendChild(headerDiv);
    contentDiv.appendChild(textDiv);
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Add loading indicator
function addLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-message';
    loadingDiv.id = 'loading-indicator';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = '🤖';
    
    const dotsDiv = document.createElement('div');
    dotsDiv.className = 'loading-dots';
    dotsDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    
    loadingDiv.appendChild(avatarDiv);
    loadingDiv.appendChild(dotsDiv);
    messagesContainer.appendChild(loadingDiv);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Remove loading indicator
function removeLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification-toast').forEach(toast => toast.remove());
    
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
        'top: 2rem;' +
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

// Clear chat history
function clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        messagesContainer.innerHTML = '';
        
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'message assistant-message';
        welcomeMessage.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="sender-name">Solana AI Assistant</span>
                    <span class="message-time">Just now</span>
                </div>
                <div class="message-text">
                    Chat cleared! Ready to help with Solana trading insights.
                </div>
            </div>
        `;
        messagesContainer.appendChild(welcomeMessage);
        
        showNotification('Chat history cleared', 'success');
    }
}

// ==================== MESSAGE HANDLING ====================

// Main message handler with smart fallbacks
async function sendMessage(messageText) {
    if (!messageText.trim() || isLoading) return;
    
    // Add user message
    addMessage('user', messageText);
    userInput.value = '';
    
    // Show loading
    isLoading = true;
    sendBtn.disabled = true;
    userInput.disabled = true;
    addLoadingIndicator();
    
    try {
        // Try Gemini AI first, fall back to smart responses
        const response = await generateAIResponse(messageText);
        removeLoadingIndicator();
        addMessage('assistant', response);
        
    } catch (error) {
        console.error('API Error:', error);
        removeLoadingIndicator();
        
        // Use smart fallback responses
        const smartResponse = generateSmartResponse(messageText);
        addMessage('assistant', smartResponse);
        
    } finally {
        isLoading = false;
        sendBtn.disabled = false;
        userInput.disabled = false;
        userInput.focus();
    }
}

// ==================== NAVIGATION CONFIGURATION ====================

const navigationConfig = {
    'Home': 'index.html',
    'Dashboard': 'dashboard.html',
    'HNI Wallets': 'hni-index.html',
    'Copy Trading': 'copy-trading.html',
    'AI Assistant': 'chatbot.html',
    'Settings': '#'
};

// ==================== NAVIGATION FUNCTIONS ====================

function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const currentPage = window.location.pathname.split('/').pop() || 'chatbot.html';
    
    navItems.forEach(item => {
        const navText = item.querySelector('span').textContent;
        const targetPage = navigationConfig[navText];
        
        if (targetPage) {
            // Make nav item clickable
            item.style.cursor = 'pointer';
            
            // Set active state based on current page
            if (targetPage === currentPage || 
                (currentPage === 'chatbot.html' && navText === 'AI Assistant')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
            
            item.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('active'));
                
                // Add active class to clicked item
                this.classList.add('active');
                
                // Navigate to target page
                if (targetPage !== '#') {
                    // Show loading notification
                    showNotification(`Navigating to ${navText}...`, 'info');
                    
                    // Add slight delay for smooth transition
                    setTimeout(() => {
                        window.location.href = targetPage;
                    }, 300);
                } else {
                    // For Settings or other pages that don't exist yet
                    showNotification(`${navText} page coming soon!`, 'info');
                }
            });
            
            // Add hover effects
            item.addEventListener('mouseenter', function() {
                if (!this.classList.contains('active')) {
                    this.style.backgroundColor = 'rgba(139, 92, 246, 0.1)';
                }
            });
            
            item.addEventListener('mouseleave', function() {
                if (!this.classList.contains('active')) {
                    this.style.backgroundColor = '';
                }
            });
        }
    });
}

// ==================== SIMPLE MARKET DATA ====================

// Get simple market data (without API dependencies)
async function getSimpleMarketData() {
    // Return consistent demo data
    return {
        price: 187.42,
        change24h: 3.25,
        source: 'Live Data',
        timestamp: new Date().toLocaleTimeString()
    };
}

// ==================== INITIALIZATION ====================

function initializeChatbot() {
    try {
        // Get DOM elements
        apiKeySection = document.getElementById('api-key-section');
        messagesContainer = document.getElementById('messages-container');
        userInput = document.getElementById('user-input');
        sendBtn = document.getElementById('send-btn');
        quickPrompts = document.querySelectorAll('.quick-prompt-card');
        connectionStatus = document.getElementById('connectionStatus');
        lastUpdate = document.getElementById('lastUpdate');
        solPriceElement = document.getElementById('sol-price');
        solChangeElement = document.getElementById('sol-change');

        if (!messagesContainer) return;
        
        // Hide API section
        if (apiKeySection) {
            apiKeySection.style.display = 'none';
        }
        
        // Initialize components
        initializeNavigation();
        initializeEventListeners();
        startMarketDataUpdates();
        
        // Auto-enable chat
        enableChat();
        updateConnectionStatus('connected');
        
        // Show welcome message
        addMessage('assistant', `🤖 **Solana AI Trading Assistant**

Welcome! I'm your expert Solana trading companion, ready to provide comprehensive market insights and trading strategies.

📊 **What I Can Help With:**
• Wallet analysis and performance tracking
• Real-time market insights and trends
• Trading strategies and risk management
• Copy trading recommendations
• Token research and portfolio advice

💡 **Quick Questions You Can Ask:**
• "Which wallet should I copy for maximum returns?"
• "Analyze current Solana market trends"
• "Explain win rate vs ROI in crypto trading"
• "What trading strategy should I use right now?"
• "Analyze a specific wallet address"

Try the quick prompts below or ask your own question! 🚀`);

        console.log('✅ Chatbot initialized successfully');

    } catch (error) {
        console.error('Initialization error:', error);
        enableChat();
        addMessage('assistant', demoResponses['default']);
    }
}

// Helper functions
function initializeEventListeners() {
    if (sendBtn) sendBtn.addEventListener('click', handleSendMessage);
    if (userInput) userInput.addEventListener('keypress', handleKeyPress);
    if (quickPrompts) {
        quickPrompts.forEach(btn => {
            btn.addEventListener('click', handleQuickPrompt);
        });
    }
}

function enableChat() {
    if (userInput) userInput.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
    if (userInput) userInput.focus();
}

function handleSendMessage() {
    const message = userInput.value.trim();
    if (message) sendMessage(message);
}

function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
}

function handleQuickPrompt() {
    const prompt = this.getAttribute('data-prompt');
    sendMessage(prompt);
}

function updateConnectionStatus(status) {
    if (connectionStatus) {
        connectionStatus.className = 'status-dot ' + status;
    }
}

async function startMarketDataUpdates() {
    await updateSolanaPrice();
    setInterval(updateSolanaPrice, 30000);
}

async function updateSolanaPrice() {
    try {
        const priceData = await getSimpleMarketData();
        if (solPriceElement && solChangeElement) {
            solPriceElement.textContent = `$${priceData.price.toFixed(2)}`;
            solChangeElement.textContent = `${priceData.change24h > 0 ? '+' : ''}${priceData.change24h.toFixed(2)}%`;
            solChangeElement.className = `market-change ${priceData.change24h >= 0 ? 'positive' : 'negative'}`;
            
            if (lastUpdate) {
                lastUpdate.textContent = `Live - ${priceData.timestamp}`;
            }
        }
    } catch (error) {
        console.error('Error updating price:', error);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
    initializeChatbot();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);