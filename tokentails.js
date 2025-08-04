(function() {
    'use strict';
    
    // 使用localStorage来持久化执行状态
    const EXECUTION_KEY = 'chaos_execution_status';
    const EXECUTION_TIMEOUT = 5 * 60 * 1000; // 5分钟超时
    
    function isExecuting() {
        const executionData = localStorage.getItem(EXECUTION_KEY);
        if (!executionData) return false;
        
        try {
            const data = JSON.parse(executionData);
            const now = Date.now();
            
            // 如果超过5分钟，清除状态
            if (now - data.timestamp > EXECUTION_TIMEOUT) {
                localStorage.removeItem(EXECUTION_KEY);
                return false;
            }
            
            return data.executing;
        } catch (e) {
            localStorage.removeItem(EXECUTION_KEY);
            return false;
        }
    }
    
    function setExecuting(status) {
        const data = {
            executing: status,
            timestamp: Date.now()
        };
        localStorage.setItem(EXECUTION_KEY, JSON.stringify(data));
    }
    
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string' && url.includes('https://api.tokentails.com/user/cats')) {
            const config = args[1] || {};
            const headers = config.headers || {};
            let accessToken = headers['accesstoken'];
            
            if (accessToken && !isExecuting()) {
                setExecuting(true);
                console.log(accessToken);
                console.log('🚀 获取到 Accesstoken 开始提交游戏结果...');
                
                setTimeout(() => {
                    fetch('https://api.tokentails.com/user/catbassadors/live', {
                        method: 'POST',
                        headers: {
                            'accept': 'application/json',
                            'accesstoken': accessToken,
                            'content-type': 'application/json',
                            'content-length': '56',
                            'origin': 'https://tokentails.com',
                            'referer': 'https://tokentails.com/'
                        },
                          body: JSON.stringify({
                             "points": Math.floor(Math.random() * 2) + 8,
                             "time": 0,
                             "type": "CATNIP_CHAOS",
                             "level": "56"
                         })
                    })
                    .then(response => {
                        console.log('=== 响应信息 ===');
                        console.log('状态码:', response.status);
                        console.log('响应头:', response.headers);
                        return response.json();
                    })
                    .then(data => {
                        console.log('=== 响应数据 ===');
                        console.log(JSON.stringify(data, null, 2));
                        console.log('================');
                        // 任务完成后清除执行状态
                        setExecuting(false);
                    })
                    .catch(error => {
                        console.error('=== 请求错误 ===');
                        console.error(error);
                        console.error('================');
                        // 发生错误时也清除执行状态
                        setExecuting(false);
                    });
                    console.log('✅ 游戏任务已完成，请刷新页面 MINT NFT');
                }, 5000);
            } else if (isExecuting()) {
                console.log('⚠️ 任务正在执行中，跳过重复请求');
            }
        }
        return originalFetch.apply(this, args);
    };
    console.log('🚀 脚本已启动');
    console.log('📡 请点击 GIFTS 按钮获取 Accesstoken...');
    
})();
