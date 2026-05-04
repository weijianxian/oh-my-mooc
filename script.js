// ==UserScript==
// @name         oh-my-mooc
// @namespace    https://github.com/weijianxian/oh-my-mooc
// @version      1.1.2
// @description  网易MOOC界面美化工具，去除广告和多余元素，自定义开启/关闭各种美化功能
// @author       柠檬味氨水
// @match        *://www.icourse163.org/*
// @icon         https://www.icourse163.org/favicon.ico
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @license      MIT
// @homepage     https://github.com/weijianxian/oh-my-mooc
// @supportURL   https://github.com/weijianxian/oh-my-mooc/issues
// ==/UserScript==

(function () {
    'use strict';

    /**
     * MOOC美化插件配置和功能管理
     */
    const MOOCBeautifier = {
        // 配置项,可以根据需要添加更多评语
        REVIEW_ASSIGNMENT_COMMENTS: [
            '内容充实，条理清晰',
            '论述完整，逻辑清楚',
            '思路清晰，表达准确',
            '结构合理，内容详实',
            '观点明确，论据充分',
            '完成度很高，值得学习',
            '分析到位，总结很好'
        ],

        // 模块分类
        categories: {
            'homepage': { name: '首页', icon: '🏠', url: '/' },
            "my-course": { name: '我的课程', icon: '🎓', url: '/home.htm' },
            "review": { name: '互评', icon: '✏', url: '^https?://www\\.icourse163\\.org/.*/learn/hw', urlType: 'regex' },
            'global': { name: '全局', icon: '🎨' }
        },

        // 所有可用的美化功能配置
        features: {
            'HOME_PAGE_hideBottomAds': {
                name: '删除底部无用广告',
                description: '删除首页底部推荐、排行榜、会员推广等多余内容',
                enabled: true,
                selector: '#app > div > div > div:nth-child(n+2)',
                type: 'css-hide',
                category: 'homepage'
            },
            'MY_COURSE_hideVIPboxAds': {
                name: '移除右侧vip广告',
                description: '删除掉右侧vip广告（期末考试会员，认证会员）',
                enabled: true,
                selector: '#j-vipBox',
                type: 'css-delete',
                category: 'my-course'
            },
            'MY_COURSE_hideCourseAds': {
                name: '移除右侧课程广告',
                description: '删除掉右侧课程广告',
                enabled: true,
                selector: '.u-s-imgRec',
                type: 'css-delete',
                category: 'my-course'
            },
            'GLOBAL_hideNavAds': {
                name: '移除顶栏广告',
                description: '删除导航栏中的推广项目（考研全科规划、小mooc图标、期末考试、搜索栏考研推荐）',
                enabled: true,
                selector: '#web-nav-container .S4DH7 > ._3i8s0:nth-child(5), #web-nav-container .S4DH7 > ._3i8s0:nth-child(6), #web-nav-container .S4DH7 > ._3i8s0:has(img[title="期末考试"]), #web-nav-container ._18ylC:has(._3FFAt)',
                type: 'css-delete',
                category: 'global'
            },
            'GLOBAL_hideRightBanner': {
                name: '隐藏右侧浮动栏',
                description: '删除右侧浮动活动栏',
                enabled: true,
                selector: '#j-activityRightBanner, #j-side-operation, #j-reactInjectAiMoocEntry',
                type: 'css-hide',
                category: 'global'
            },
            'GLOBAL_PAGE_hideTopBanner': {
                name: '隐藏顶部黄条',
                description: '删除首页顶部活动banner',
                enabled: true,
                selector: '#j-activityBanner',
                type: 'css-delete',
                category: 'global'
            },
            'REVIEW_autoFullScore': {
                name: '满分提交并下一份',
                description: '在提交按钮右侧添加按钮，一键满分、提交并自动跳转下一份作业',
                enabled: true,
                type: 'js',
                category: 'review',
                action: function () {
                    function parseFloatEx(str) {
                        var res = '';
                        for (var i = 0; i < str.length; i++) {
                            var chr = str.charAt(i);
                            if ((chr >= '0' && chr <= '9') || chr === '.') {
                                res += chr;
                            }
                        }
                        return parseFloat(res);
                    }

                    function doAutoScore() {
                        var evaluators = document.querySelectorAll('.u-evaluateItem.evaluateMode');
                        evaluators.forEach(function (evaluator) {
                            var scorePanels = evaluator.querySelectorAll('div.detail>div.s');
                            scorePanels.forEach(function (panel) {
                                var maxScore = -1;
                                var maxIndex = -1;
                                for (var j = 0; j < panel.children.length; j++) {
                                    var radios = panel.children[j].querySelectorAll('input[type="radio"]');
                                    radios.forEach(function (radio) {
                                        var score = parseFloatEx(radio.value);
                                        if (maxScore < score) {
                                            maxScore = score;
                                            maxIndex = j;
                                        }
                                    });
                                }
                                if (maxIndex !== -1) {
                                    panel.children[maxIndex].querySelectorAll('input[type="radio"]').forEach(function (radio) {
                                        radio.checked = true;
                                        radio.dispatchEvent(new Event('change', { bubbles: true }));
                                    });
                                }
                            });

                            evaluator.querySelectorAll('textarea.j-textarea.inputtxt').forEach(function (ta) {
                                if (!ta.value) {
                                    ta.value = MOOCBeautifier.REVIEW_ASSIGNMENT_COMMENTS[Math.floor(Math.random() * MOOCBeautifier.REVIEW_ASSIGNMENT_COMMENTS.length)];
                                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                                }
                            });
                        });
                    }

                    function addFullScoreBtn() {
                        var submitBtn = document.querySelector('.j-submitbtn');
                        if (!submitBtn || submitBtn.dataset.btnAdded) return;
                        submitBtn.dataset.btnAdded = 'true';

                        var btn = document.createElement('a');
                        btn.className = 'u-btn u-btn-default f-fl';
                        btn.textContent = '满分提交并转下一份';
                        btn.style.cssText = 'background:#667eea;color:#fff;border-color:#667eea;margin-left:6px;cursor:pointer;';
                        btn.addEventListener('click', function () {
                            doAutoScore();
                            setTimeout(function () {
                                submitBtn.click();
                                var attempts = 0;
                                var timer = setInterval(function () {
                                    var nextBtn = document.querySelector('.j-gotonext');
                                    if (nextBtn && nextBtn.offsetParent !== null) {
                                        clearInterval(timer);
                                        nextBtn.click();
                                    } else if (++attempts > 20) {
                                        clearInterval(timer);
                                    }
                                }, 500);
                            }, 100);
                        });
                        submitBtn.parentNode.insertBefore(btn, submitBtn.nextSibling);
                    }

                    var observer = new MutationObserver(addFullScoreBtn);
                    observer.observe(document.body, { childList: true, subtree: true });
                    addFullScoreBtn();
                }
            },
            'REVIEW_moveSubmitBtn': {
                name: '提交按钮置顶',
                description: '将底部的提交按钮移到作业内容上方，免去翻到底部的麻烦',
                enabled: true,
                type: 'js',
                category: 'judge',
                action: function () {
                    function moveBtn() {
                        var btnWrap = document.querySelector('.bottombtnwrap.j-btnwrap');
                        var list = document.querySelector('.u-homework-evaAction .j-list');
                        if (btnWrap && list && !btnWrap.dataset.moved) {
                            list.parentNode.insertBefore(btnWrap, list);
                            btnWrap.dataset.moved = 'true';
                        }
                    }

                    var observer = new MutationObserver(moveBtn);
                    observer.observe(document.body, { childList: true, subtree: true });
                    moveBtn();
                }
            }
        },
        // 配置存储键名
        storageKey: 'MOOC_Beautifier_Settings',



        /**
         * 初始化设置
         */
        initSettings: function () {
            let settings = this.getSettings();
            const defaultSettings = {};

            // 为每个功能初始化设置
            Object.keys(this.features).forEach(key => {
                if (!(key in settings)) {
                    defaultSettings[key] = this.features[key].enabled;
                }
            });

            if (Object.keys(defaultSettings).length > 0) {
                settings = Object.assign(settings, defaultSettings);
                this.saveSettings(settings);
            }

            return settings;
        },

        /**
         * 获取所有设置
         */
        getSettings: function () {
            const saved = GM_getValue(this.storageKey, '{}');
            try {
                return JSON.parse(saved);
            } catch (e) {
                return {};
            }
        },

        /**
         * 保存所有设置
         */
        saveSettings: function (settings) {
            GM_setValue(this.storageKey, JSON.stringify(settings));
        },

        /**
         * 获取单个功能的启用状态
         */
        isFeatureEnabled: function (featureKey) {
            const settings = this.getSettings();
            return settings[featureKey] !== false;
        },

        /**
         * 设置单个功能的启用状态
         */
        setFeatureEnabled: function (featureKey, enabled) {
            const settings = this.getSettings();
            settings[featureKey] = enabled;
            this.saveSettings(settings);
        },

        /**
         * 执行所有启用的功能
         */
        applyFeatures: function () {
            const settings = this.getSettings();
            const pathname = window.location.pathname;

            Object.keys(this.features).forEach(key => {
                if (settings[key]) {
                    const feature = this.features[key];
                    const cat = this.categories[feature.category];
                    if (cat && cat.url) {
                        let matched;
                        if (cat.urlType === 'regex') {
                            matched = new RegExp(cat.url).test(window.location.href);
                        } else {
                            matched = cat.url === '/'
                                ? pathname === '/'
                                : pathname.startsWith(cat.url);
                        }
                        if (!matched) return;
                    }
                    if (feature.type === 'css-hide') {
                        this.applyCSSHideFeature(key, feature);
                    } else if (feature.type === 'css-delete') {
                        this.applyCSSDeleteFeature(key, feature);
                    } else if (feature.type === 'js') {
                        if (typeof feature.action === 'function') {
                            feature.action.call(this);
                        }
                    }
                }
            });
        },

        /**
         * 应用CSS隐藏类型的美化功能
         */
        applyCSSHideFeature: function (key, feature) {
            if (feature.selector) {
                GM_addStyle(`${feature.selector} { display: none !important; }`);
            }
        },

        /**
         * 应用CSS删除类型的美化功能
         */
        applyCSSDeleteFeature: function (key, feature) {
            if (!feature.selector) return;
            const tryRemove = () => {
                const els = document.querySelectorAll(feature.selector);
                els.forEach(el => el.remove());
                return els.length > 0;
            };
            if (tryRemove()) return;
            const observer = new MutationObserver(() => {
                if (tryRemove()) observer.disconnect();
            });
            observer.observe(document.body, { childList: true, subtree: true });
        },

        /**
         * 按分类整理功能
         */
        getFeaturesByCategory: function () {
            const grouped = {};
            Object.keys(this.categories).forEach(cat => {
                grouped[cat] = [];
            });
            Object.keys(this.features).forEach(key => {
                const cat = this.features[key].category || 'global';
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push(key);
            });
            return grouped;
        },

        /**
         * 创建并显示设置面板
         */
        createSettingsPanel: function () {
            const panel = document.createElement('div');
            panel.id = 'mooc-beautifier-panel';

            const grouped = this.getFeaturesByCategory();
            const catKeys = Object.keys(this.categories).filter(cat => grouped[cat] && grouped[cat].length > 0);
            const firstCat = catKeys[0] || '';

            panel.innerHTML = `
                <div class="mooc-beautifier-header">
                    <h3>oh-my-mooc</h3>
                    <button id="mooc-beautifier-close" class="close-btn">&times;</button>
                </div>
                <div class="mooc-beautifier-body">
                    <div class="mooc-beautifier-sidebar">
                        ${catKeys.map(cat => `
                            <div class="sidebar-item ${cat === firstCat ? 'active' : ''}" data-category="${cat}">
                                <span class="sidebar-icon">${this.categories[cat].icon}</span>
                                <span class="sidebar-name">${this.categories[cat].name}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="mooc-beautifier-content">
                        ${catKeys.map(cat => `
                            <div class="category-panel ${cat === firstCat ? 'show' : ''}" data-category="${cat}">
                                ${grouped[cat].map(key => `
                                    <div class="feature-item">
                                        <label class="feature-label">
                                            <input type="checkbox" class="feature-toggle" data-feature="${key}"
                                                ${this.isFeatureEnabled(key) ? 'checked' : ''}>
                                            <span class="feature-name">${this.features[key].name}</span>
                                        </label>
                                        <p class="feature-desc">${this.features[key].description}</p>
                                    </div>
                                `).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="mooc-beautifier-tip">更改设置后需刷新页面生效</div>
            `;

            return panel;
        },

        /**
         * 初始化UI和事件
         */
        initUI: function () {
            // 设置面板样式
            GM_addStyle(`
                #mooc-beautifier-panel {
                    position: fixed;
                    right: 20px;
                    top: 80px;
                    z-index: 10000;
                    width: 480px;
                    height: 360px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.18);
                    overflow: hidden;
                    display: none;
                    flex-direction: column;
                    animation: slideIn 0.3s ease;
                }

                #mooc-beautifier-panel.show {
                    display: flex;
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .mooc-beautifier-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 12px 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .mooc-beautifier-header h3 {
                    margin: 0;
                    font-size: 15px;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 22px;
                    cursor: pointer;
                    padding: 0;
                    width: 28px;
                    height: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s;
                }

                .close-btn:hover {
                    transform: scale(1.2);
                }

                .mooc-beautifier-body {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }

                .mooc-beautifier-sidebar {
                    width: 130px;
                    min-width: 130px;
                    background: #f7f8fa;
                    border-right: 1px solid #e8e8e8;
                    overflow-y: auto;
                }

                .sidebar-item {
                    padding: 12px 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: #666;
                    transition: all 0.2s;
                    border-left: 3px solid transparent;
                }

                .sidebar-item:hover {
                    background: #eef0f5;
                    color: #333;
                }

                .sidebar-item.active {
                    background: white;
                    color: #667eea;
                    border-left-color: #667eea;
                    font-weight: 600;
                }

                .sidebar-icon {
                    font-size: 16px;
                }

                .mooc-beautifier-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px 15px;
                }

                .category-panel {
                    display: none;
                }

                .category-panel.show {
                    display: block;
                }

                .feature-item {
                    margin-bottom: 8px;
                    padding: 8px 10px;
                    border-radius: 4px;
                    transition: background 0.15s;
                }

                .feature-item:hover {
                    background: #f5f5f5;
                }

                .feature-label {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    user-select: none;
                }

                .feature-toggle {
                    width: 16px;
                    height: 16px;
                    margin-right: 8px;
                    cursor: pointer;
                }

                .feature-name {
                    font-weight: 500;
                    color: #333;
                    font-size: 13px;
                }

                .feature-desc {
                    margin: 4px 0 0 24px;
                    font-size: 11px;
                    color: #999;
                }

                .mooc-beautifier-tip {
                    padding: 8px 15px;
                    font-size: 11px;
                    color: #999;
                    text-align: center;
                    border-top: 1px solid #eee;
                }
            `);

            // 创建设置面板
            const panel = this.createSettingsPanel();
            document.body.appendChild(panel);

            // 通过油猴菜单命令打开设置面板
            GM_registerMenuCommand('美化设置', () => {
                panel.classList.toggle('show');
            });

            // 关闭按钮事件
            document.getElementById('mooc-beautifier-close').addEventListener('click', () => {
                panel.classList.remove('show');
            });

            // 左侧分类切换
            panel.querySelectorAll('.sidebar-item').forEach(item => {
                item.addEventListener('click', () => {
                    const cat = item.dataset.category;
                    panel.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    panel.querySelectorAll('.category-panel').forEach(p => p.classList.remove('show'));
                    panel.querySelector(`.category-panel[data-category="${cat}"]`).classList.add('show');
                });
            });

            // 功能开关事件
            panel.querySelectorAll('.feature-toggle').forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    const featureKey = e.target.dataset.feature;
                    const enabled = e.target.checked;
                    this.setFeatureEnabled(featureKey, enabled);

                    if (!enabled) {
                        console.log(`已禁用功能: ${this.features[featureKey].name}`);
                    } else {
                        console.log(`已启用功能: ${this.features[featureKey].name}`);
                    }
                });
            });
        },

        /**
         * 初始化插件
         */
        init: function () {
            this.initSettings();
            this.applyFeatures();
            this.initUI();
            console.log('MOOC美化插件已加载');
        }
    };

    // 等待DOM完全加载后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            MOOCBeautifier.init();
        });
    } else {
        MOOCBeautifier.init();
    }
})();
