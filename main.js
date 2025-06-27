// 导航功能
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // 如果是锚点链接，阻止跳转并显示提示
            if (href === '#' || href.startsWith('#')) {
                e.preventDefault();
                showToast('该功能正在开发中...');
                return;
            }
            
            // 获取当前页面路径
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            
            // 如果点击的是当前页面的链接，阻止跳转
            if (href === currentPage) {
                e.preventDefault();
                return;
            }
        });
    });
}

// 收藏功能
function initFavoriteButton() {
    const favoriteBtn = document.querySelector('.favorite-btn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', function() {
            // 检查用户是否登录
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            if (!isLoggedIn) {
                showToast('请先登录后再收藏');
                showLoginDialog();
                return;
            }

            this.classList.toggle('active');
            const isActive = this.classList.contains('active');
            
            // 获取当前页面信息
            const pageTitle = document.title;
            const pageUrl = window.location.pathname;
            
            // 存储到本地存储
            const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            if (isActive) {
                favorites.push({ title: pageTitle, url: pageUrl });
            } else {
                const index = favorites.findIndex(f => f.url === pageUrl);
                if (index > -1) {
                    favorites.splice(index, 1);
                }
            }
            localStorage.setItem('favorites', JSON.stringify(favorites));
            
            // 显示提示
            showToast(isActive ? '已添加到收藏' : '已取消收藏');
        });

        // 检查当前页面是否已收藏
        const pageUrl = window.location.pathname;
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        if (favorites.some(f => f.url === pageUrl)) {
            favoriteBtn.classList.add('active');
        }
    }
}

// 搜索功能
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase();
                const items = document.querySelectorAll('.searchable-item');
                
                items.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }, 300);
        });
    }
}

// 分页功能
function initPagination() {
    console.log('初始化分页功能...');
    const paginationBtns = document.querySelectorAll('.pagination-btn');
    if (paginationBtns.length) {
        // 为每个分页按钮添加点击事件
        paginationBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // 如果按钮被禁用或者已经是激活状态，则不做任何操作
                if (this.hasAttribute('disabled') || this.classList.contains('active') && this.dataset.page !== 'prev' && this.dataset.page !== 'next') {
                    return;
                }
                
                // 获取页码
                let page = this.dataset.page || this.textContent.trim();
                console.log('点击分页按钮，页码:', page);
                
                // 更新内容
                updatePageContent(page);
            });
        });
        
        // 初始化分页状态
        updatePaginationStatus();
        
        // 显示第一页内容
        if (window.location.pathname.includes('DetailsofAppleVarieties.html')) {
            updateAppleVarietiesPage(1);
            updatePageInfo(1);
        }
    }
}

// 更新分页按钮状态
function updatePaginationStatus() {
    const paginationContainer = document.querySelector('.pagination-container, .flex.items-center.gap-2');
    if (!paginationContainer) return;
    
    const paginationBtns = paginationContainer.querySelectorAll('.pagination-btn');
    if (!paginationBtns.length) return;
    
    // 获取当前激活的页码按钮
    const activePage = document.querySelector('.pagination-btn.active');
    if (!activePage) return;
    
    const currentPage = parseInt(activePage.textContent);
    
    // 找到上一页和下一页按钮
    const prevBtn = paginationContainer.querySelector('.pagination-btn:first-child');
    const nextBtn = paginationContainer.querySelector('.pagination-btn:last-child');
    
    // 获取总页数
    let totalPages = 0;
    paginationBtns.forEach(btn => {
        const pageNum = parseInt(btn.textContent);
        if (!isNaN(pageNum) && pageNum > totalPages) {
            totalPages = pageNum;
        }
    });
    
    // 设置上一页和下一页按钮的禁用状态
    if (prevBtn) {
        if (currentPage <= 1) {
            prevBtn.setAttribute('disabled', 'disabled');
            prevBtn.classList.add('text-gray-400');
        } else {
            prevBtn.removeAttribute('disabled');
            prevBtn.classList.remove('text-gray-400');
        }
    }
    
    if (nextBtn) {
        if (currentPage >= totalPages) {
            nextBtn.setAttribute('disabled', 'disabled');
            nextBtn.classList.add('text-gray-400');
        } else {
            nextBtn.removeAttribute('disabled');
            nextBtn.classList.remove('text-gray-400');
        }
    }
}

// 更新页面内容
function updatePageContent(page) {
    console.log(`正在加载第 ${page} 页内容...`);
    
    // 处理特殊页码(prev和next)
    if (page === 'prev') {
        const activePage = document.querySelector('.pagination-btn.active');
        if (activePage) {
            page = parseInt(activePage.dataset.page) - 1;
            if (page < 1) page = 1;
        } else {
            page = 1;
        }
    } else if (page === 'next') {
        const activePage = document.querySelector('.pagination-btn.active');
        if (activePage) {
            const totalAppleCards = document.querySelectorAll('.apple-card').length;
            const totalPages = Math.ceil(totalAppleCards / 12); // 苹果品种页每页12个
            
            page = parseInt(activePage.dataset.page) + 1;
            if (page > totalPages) page = totalPages;
        } else {
            page = 1;
        }
    } else {
        // 确保page是数字
        page = parseInt(page);
        if (isNaN(page)) page = 1;
    }
    
    console.log(`处理后的页码: ${page}`);
    
    // 检查当前页面类型
    if (window.location.pathname.includes('DetailsofAppleVarieties.html')) {
        updateAppleVarietiesPage(page);
    } else if (window.location.pathname.includes('ListofAppleRecipes.html')) {
        updateRecipesPage(page);
    } else {
        console.log('当前页面不支持分页功能');
    }
    
    // 更新分页状态
    updatePaginationStatus();
    
    // 更新显示的数据范围信息
    updatePageInfo(page);
}

// 更新苹果品种页面内容
function updateAppleVarietiesPage(page) {
    const appleCards = document.querySelectorAll('.apple-card');
    if (!appleCards.length) return;
    
    const itemsPerPage = 12; // 每页显示的数量
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;
    
    console.log(`显示苹果卡片，页码: ${page}, 显示范围: ${startIndex+1}-${Math.min(endIndex, appleCards.length)}`);
    
    // 隐藏所有卡片
    appleCards.forEach((card, index) => {
        if (index >= startIndex && index < endIndex) {
            card.style.display = '';
            // 添加淡入效果
            card.style.opacity = '0';
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease';
                card.style.opacity = '1';
            }, 10);
        } else {
            card.style.display = 'none';
            card.style.opacity = '0';
        }
    });
    
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // 更新分页按钮状态
    const pageButtons = document.querySelectorAll('.pagination-btn');
    pageButtons.forEach(btn => {
        if (btn.dataset.page === 'prev') {
            // 处理上一页按钮
            if (page <= 1) {
                btn.setAttribute('disabled', 'disabled');
                btn.classList.add('text-gray-400');
            } else {
                btn.removeAttribute('disabled');
                btn.classList.remove('text-gray-400');
            }
        } else if (btn.dataset.page === 'next') {
            // 处理下一页按钮
            const totalPages = Math.ceil(appleCards.length / itemsPerPage);
            if (page >= totalPages) {
                btn.setAttribute('disabled', 'disabled');
                btn.classList.add('text-gray-400');
            } else {
                btn.removeAttribute('disabled');
                btn.classList.remove('text-gray-400');
            }
        } else if (btn.dataset.page) {
            // 处理数字页码按钮
            if (parseInt(btn.dataset.page) === parseInt(page)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
}

// 更新食谱页面内容
function updateRecipesPage(page) {
    const recipeCards = document.querySelectorAll('.recipe-card');
    if (!recipeCards.length) return;
    
    const itemsPerPage = 9; // 每页显示的数量
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;
    
    // 隐藏所有卡片
    recipeCards.forEach((card, index) => {
        if (index >= startIndex && index < endIndex) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
    
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 更新页面信息显示
function updatePageInfo(page) {
    // 查找显示页面信息的元素（修正查询方式，:contains选择器不适用于原生JavaScript）
    const pageInfoElements = document.querySelectorAll('.text-gray-600');
    let pageInfoElement = null;
    
    // 遍历所有可能的元素找到包含"显示"文本的元素
    pageInfoElements.forEach(el => {
        if (el.textContent.includes('显示')) {
            pageInfoElement = el;
    }
    });
    
    if (!pageInfoElement) return;
    
    // 获取总条目数
    let totalItems = 0;
    if (window.location.pathname.includes('DetailsofAppleVarieties.html')) {
        totalItems = document.querySelectorAll('.apple-card').length;
    } else if (window.location.pathname.includes('ListofAppleRecipes.html')) {
        totalItems = document.querySelectorAll('.recipe-card').length;
    }
    
    // 计算当前页显示的条目范围
    const itemsPerPage = window.location.pathname.includes('DetailsofAppleVarieties.html') ? 12 : 9;
    const startItem = (page - 1) * itemsPerPage + 1;
    const endItem = Math.min(page * itemsPerPage, totalItems);
    
    // 更新页面信息文本
    pageInfoElement.textContent = `显示 ${startItem}-${endItem} 条，共 ${totalItems} 条`;
}

// 用户按钮功能
function initUserButton() {
    const userBtn = document.getElementById('userButton');
    const userDropdown = document.getElementById('userDropdown');
    let isDropdownOpen = false;
    let timeoutId = null;

    if (userBtn && userDropdown) {
        // 点击用户按钮时切换下拉框
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            isDropdownOpen = !isDropdownOpen;
            if (isDropdownOpen) {
                userDropdown.classList.remove('hidden');
            } else {
                userDropdown.classList.add('hidden');
            }
        });

        // 鼠标进入下拉框时清除关闭定时器
        userDropdown.addEventListener('mouseenter', () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        });

        // 鼠标离开下拉框时设置延迟关闭
        userDropdown.addEventListener('mouseleave', () => {
            timeoutId = setTimeout(() => {
                userDropdown.classList.add('hidden');
                isDropdownOpen = false;
            }, 200);
        });

        // 鼠标进入用户按钮时，如果下拉框是关闭的，则打开它
        userBtn.addEventListener('mouseenter', () => {
            if (!isDropdownOpen) {
                userDropdown.classList.remove('hidden');
                isDropdownOpen = true;
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        });

        // 鼠标离开用户按钮时，如果鼠标不在下拉框内，设置延迟关闭
        userBtn.addEventListener('mouseleave', (e) => {
            const toElement = e.relatedTarget;
            if (!userDropdown.contains(toElement)) {
                timeoutId = setTimeout(() => {
                    userDropdown.classList.add('hidden');
                    isDropdownOpen = false;
                }, 200);
            }
        });

        // 点击页面其他地方时关闭下拉框
        document.addEventListener('click', (e) => {
            if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
                isDropdownOpen = false;
            }
        });

        // 处理退出登录按钮点击事件
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                localStorage.removeItem('email');
                window.location.reload();
            });
        }
    }
}

// 显示登录对话框
function showLoginDialog() {
    const loginDialog = document.getElementById('loginDialog');
    if (loginDialog) {
        loginDialog.classList.remove('hidden');
    }
}

// 隐藏登录对话框
function hideLoginDialog() {
    const loginDialog = document.getElementById('loginDialog');
    if (loginDialog) {
        loginDialog.classList.add('hidden');
    }
}

// 初始化登录表单
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = this.querySelector('input[type="text"]').value;
            const password = this.querySelector('input[type="password"]').value;

            // 这里应该是真实的登录逻辑
            // 现在只是模拟登录成功
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            
            hideLoginDialog();
            showToast('登录成功');
            updateUserButton();
        });
    }
}

// 更新用户按钮状态
function updateUserButton() {
    const userBtn = document.getElementById('userButton');
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (userBtn) {
        if (isLoggedIn) {
            userBtn.innerHTML = '<i class="ri-user-fill"></i>';
        } else {
            userBtn.innerHTML = '<i class="ri-user-line"></i>';
        }
    }
}

// 显示用户菜单
function showUserMenu() {
    // 这里可以实现用户菜单的显示逻辑
    const username = localStorage.getItem('username');
    showToast(`欢迎回来，${username}`);
}

// 提示框功能
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

// 苹果品种筛选功能
function initAppleFilter() {
    console.log('初始化苹果品种筛选功能...');
    const appleFilterSection = document.querySelector('#varieties');
    if (!appleFilterSection) {
        console.warn('未找到苹果品种筛选区域，跳过初始化');
        return;
    }
    
    const searchInput = document.getElementById('searchInput');
    const filterTags = document.querySelectorAll('.filter-tag');
    const advancedFilterBtn = document.getElementById('advancedFilterBtn');
    const advancedFilterPanel = document.getElementById('advancedFilterPanel');
    const resetFilterBtn = document.getElementById('resetFilter');
    const applyFilterBtn = document.getElementById('applyFilter');
    const appleCards = document.querySelectorAll('.apple-card');
    
    if (!searchInput) {
        console.warn('未找到搜索输入框，跳过初始化筛选功能');
        return;
    }
    
    console.log(`找到 ${appleCards.length} 个苹果卡片待筛选`);
    
    let debounceTimer;
    
    // 搜索框输入事件
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            console.log('搜索输入: ' + this.value);
            filterApples();
        }, 300);
    });
    
    // 点击筛选标签
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            console.log('点击标签: ' + this.dataset.type);
            // 移除其他标签的active状态
            filterTags.forEach(t => {
                t.classList.remove('active');
                t.classList.remove('bg-primary', 'text-white');
                t.classList.add('bg-white', 'text-gray-700', 'border', 'border-gray-200');
            });
            
            // 设置当前标签为active
            this.classList.add('active');
            this.classList.remove('bg-white', 'text-gray-700', 'border', 'border-gray-200');
            this.classList.add('bg-primary', 'text-white');
            
            filterApples();
        });
    });
    
    // 点击高级筛选按钮
    if (advancedFilterBtn && advancedFilterPanel) {
        advancedFilterBtn.addEventListener('click', function() {
            console.log('切换高级筛选面板');
            advancedFilterPanel.classList.toggle('hidden');
        });
    
        // 点击页面其他区域关闭高级筛选面板
        document.addEventListener('click', function(event) {
            if (!advancedFilterPanel.contains(event.target) && 
                event.target !== advancedFilterBtn && 
                !advancedFilterBtn.contains(event.target)) {
                advancedFilterPanel.classList.add('hidden');
            }
        });
    }
    
    // 重置筛选
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', function() {
            console.log('重置筛选条件');
            // 重置搜索框
            searchInput.value = '';
            
            // 重置标签筛选
            filterTags.forEach(t => {
                if (t.dataset.type === 'all') {
                    t.classList.add('active');
                    t.classList.remove('bg-white', 'text-gray-700', 'border', 'border-gray-200');
                    t.classList.add('bg-primary', 'text-white');
                } else {
                    t.classList.remove('active');
                    t.classList.remove('bg-primary', 'text-white');
                    t.classList.add('bg-white', 'text-gray-700', 'border', 'border-gray-200');
                }
            });
            
            // 重置复选框
            const checkboxes = advancedFilterPanel.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = false);
            
            // 重置数字输入框
            const numberInputs = advancedFilterPanel.querySelectorAll('input[type="number"]');
            numberInputs.forEach(input => input.value = '');
            
            // 重新筛选
            filterApples();
        });
    }
    
    // 应用筛选
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', function() {
            console.log('应用筛选条件');
            filterApples();
            advancedFilterPanel.classList.add('hidden');
        });
    }
    
    // 筛选苹果卡片
    function filterApples() {
        console.log("执行筛选苹果函数");
        try {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const activeTag = document.querySelector('.filter-tag.active');
        const tagType = activeTag ? activeTag.dataset.type : 'all';
        
        // 获取高级筛选条件
            const selectedOrigins = Array.from(document.querySelectorAll('#advancedFilterPanel input[name="origin"]:checked')).map(cb => cb.value);
            const selectedSeasons = Array.from(document.querySelectorAll('#advancedFilterPanel input[name="season"]:checked')).map(cb => cb.value);
        
        // 获取价格范围
        const priceInputs = document.querySelectorAll('#advancedFilterPanel input[type="number"]');
        const minPrice = priceInputs[0] && priceInputs[0].value ? parseFloat(priceInputs[0].value) : 0;
        const maxPrice = priceInputs[1] && priceInputs[1].value ? parseFloat(priceInputs[1].value) : Infinity;
            
            console.log(`筛选条件: 搜索词="${searchTerm}", 标签=${tagType}, 原产地=[${selectedOrigins}], 季节=[${selectedSeasons}], 价格=${minPrice}-${maxPrice}`);
            
            let visibleCount = 0;
        
        appleCards.forEach(card => {
                // 安全地获取文本内容
                const cardTitle = card.querySelector('h3');
                const cardDesc = card.querySelector('p');
                const title = cardTitle ? cardTitle.textContent.toLowerCase() : '';
                const description = cardDesc ? cardDesc.textContent.toLowerCase() : '';
                const tagElements = card.querySelectorAll('.bg-red-50, .bg-green-50, .bg-blue-50, .bg-yellow-50, .bg-purple-50, .bg-pink-50, .bg-orange-50, .bg-indigo-50');
                const tags = Array.from(tagElements).map(tag => tag.textContent.toLowerCase());
            
            // 搜索条件匹配
            const matchesSearch = !searchTerm || 
                                  title.includes(searchTerm) || 
                                  description.includes(searchTerm) || 
                                  tags.some(tag => tag.includes(searchTerm));
            
            // 标签条件匹配 - 模糊匹配：只要标签包含筛选关键词就匹配
            let matchesTag = tagType === 'all';
                if (!matchesTag && tagType) {
                matchesTag = tags.some(tag => tag.includes(tagType.toLowerCase()));
            }
            
            // 高级筛选匹配
                const origin = card.dataset.origin || '';
                const season = card.dataset.season || '';
                const price = parseFloat(card.dataset.price || '0');
            
            const matchesOrigin = selectedOrigins.length === 0 || selectedOrigins.includes(origin);
            const matchesSeason = selectedSeasons.length === 0 || selectedSeasons.includes(season);
            const matchesPrice = (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice);
            
            // 所有条件都匹配才显示
            if (matchesSearch && matchesTag && matchesOrigin && matchesSeason && matchesPrice) {
                card.style.display = '';
                    visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
            
            console.log(`筛选结果: 显示 ${visibleCount} 个, 隐藏 ${appleCards.length - visibleCount} 个`);
            
            // 如果没有匹配结果，显示提示
            const noResultsEl = document.getElementById('noResults');
            if (noResultsEl) {
                if (visibleCount === 0) {
                    noResultsEl.classList.remove('hidden');
                } else {
                    noResultsEl.classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('筛选苹果品种时发生错误:', error);
        }
    }
    
    // 初始筛选一次以设置正确的显示状态
    setTimeout(filterApples, 100);
}

// 食谱列表筛选功能
function initRecipeFilter() {
    console.log('初始化食谱筛选功能...');
    const recipeFilterSection = document.querySelector('#recipes');
    if (!recipeFilterSection) {
        console.warn('未找到食谱筛选区域，跳过初始化');
        return;
    }
    
    const searchInput = document.getElementById('searchInput');
    const filterTags = document.querySelectorAll('.filter-tag');
    const advancedFilterBtn = document.getElementById('advancedFilterBtn');
    const advancedFilterPanel = document.getElementById('advancedFilterPanel');
    const resetFilterBtn = document.getElementById('resetFilter');
    const applyFilterBtn = document.getElementById('applyFilter');
    const recipeCards = document.querySelectorAll('.recipe-card');
    
    if (!searchInput) {
        console.warn('未找到食谱搜索输入框，跳过初始化筛选功能');
        return;
    }
    
    console.log(`找到 ${recipeCards.length} 个食谱卡片待筛选`);
    
    let debounceTimer;
    
    // 搜索框输入事件
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            console.log('搜索输入: ' + this.value);
            filterRecipes();
        }, 300);
    });
    
    // 点击筛选标签
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            console.log('点击标签: ' + this.dataset.type);
            // 移除其他标签的active状态
            filterTags.forEach(t => {
                t.classList.remove('active');
                t.classList.remove('bg-primary', 'text-white');
                t.classList.add('bg-white', 'text-gray-700', 'border', 'border-gray-200');
            });
            
            // 设置当前标签为active
            this.classList.add('active');
            this.classList.remove('bg-white', 'text-gray-700', 'border', 'border-gray-200');
            this.classList.add('bg-primary', 'text-white');
            
            filterRecipes();
        });
    });
    
    // 点击高级筛选按钮
    if (advancedFilterBtn && advancedFilterPanel) {
        advancedFilterBtn.addEventListener('click', function() {
            console.log('切换高级筛选面板');
            advancedFilterPanel.classList.toggle('hidden');
        });
        
        // 点击页面其他区域关闭高级筛选面板
        document.addEventListener('click', function(event) {
            if (!advancedFilterPanel.contains(event.target) && 
                event.target !== advancedFilterBtn && 
                !advancedFilterBtn.contains(event.target)) {
                advancedFilterPanel.classList.add('hidden');
            }
        });
    }
    
    // 重置筛选
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', function() {
            console.log('重置筛选条件');
            // 重置搜索框
            searchInput.value = '';
            
            // 重置标签筛选
            filterTags.forEach(t => {
                if (t.dataset.type === 'all') {
                    t.classList.add('active');
                    t.classList.remove('bg-white', 'text-gray-700', 'border', 'border-gray-200');
                    t.classList.add('bg-primary', 'text-white');
                } else {
                    t.classList.remove('active');
                    t.classList.remove('bg-primary', 'text-white');
                    t.classList.add('bg-white', 'text-gray-700', 'border', 'border-gray-200');
                }
            });
            
            // 重置复选框
            const checkboxes = advancedFilterPanel.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = false);
            
            // 重置单选框
            const radioButtons = advancedFilterPanel.querySelectorAll('input[type="radio"]');
            radioButtons.forEach(radio => {
                if (radio.value === 'all') {
                    radio.checked = true;
                } else {
                    radio.checked = false;
                }
            });
            
            // 重新筛选
            filterRecipes();
        });
    }
    
    // 应用筛选
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', function() {
            console.log('应用筛选条件');
            filterRecipes();
            advancedFilterPanel.classList.add('hidden');
        });
    }
    
    // 筛选食谱卡片
    function filterRecipes() {
        console.log("执行筛选食谱函数");
        try {
        const searchTerm = searchInput.value.trim().toLowerCase();
            const activeTag = document.querySelector('.filter-tag.active');
        const tagType = activeTag ? activeTag.dataset.type : 'all';
        
        // 获取高级筛选条件
            const selectedDifficulties = Array.from(document.querySelectorAll('#advancedFilterPanel input[name="difficulty"]:checked')).map(cb => cb.value);
            const selectedCookTimes = Array.from(document.querySelectorAll('#advancedFilterPanel input[name="cookTime"]:checked')).map(cb => cb.value);
            const selectedRating = document.querySelector('#advancedFilterPanel input[name="rating"]:checked')?.value || 'all';
            
            console.log(`筛选条件: 搜索词="${searchTerm}", 标签=${tagType}, 难度=[${selectedDifficulties}], 烹饪时间=[${selectedCookTimes}], 评分=${selectedRating}`);
            
            let visibleCount = 0;
        
        recipeCards.forEach(card => {
                // 安全地获取文本内容
                const cardTitle = card.querySelector('h3');
                const cardDesc = card.querySelector('p');
                const title = cardTitle ? cardTitle.textContent.toLowerCase() : '';
                const description = cardDesc ? cardDesc.textContent.toLowerCase() : '';
                const tagElements = card.querySelectorAll('.bg-red-50, .bg-green-50, .bg-blue-50, .bg-yellow-50, .bg-purple-50, .bg-pink-50, .bg-orange-50, .bg-indigo-50');
                const tags = Array.from(tagElements).map(tag => tag.textContent.toLowerCase());
                
                // 获取卡片类型
                const cardType = card.dataset.type || '';
                console.log(`卡片"${title}"的类型:`, cardType);
            
            // 搜索条件匹配
            const matchesSearch = !searchTerm || 
                                  title.includes(searchTerm) || 
                                  description.includes(searchTerm) || 
                                  tags.some(tag => tag.includes(searchTerm));
            
                // 标签条件匹配（改进的逻辑）
                let matchesTag = tagType === 'all';
                if (!matchesTag && tagType) {
                    // 直接比较data-type属性
                    if (cardType && cardType.toLowerCase() === tagType.toLowerCase()) {
                        matchesTag = true;
                    } 
                    // 如果标签不匹配，尝试查找卡片中的类似标签
                    else {
                        matchesTag = tags.some(tag => {
                            return tag.includes(tagType.toLowerCase());
                        });
                    }
                }
            
                // 调试信息
                if (!matchesTag && tagType !== 'all') {
                    console.log(`卡片"${title}"不匹配标签${tagType}, 卡片类型=${cardType}, 卡片标签=[${tags.join(', ')}]`);
                }
            
            // 高级筛选匹配
                const difficulty = card.dataset.difficulty || '';
                const cookTime = card.dataset.cooktime || '';
                const rating = parseFloat(card.dataset.rating || '0');
            
            const matchesDifficulty = selectedDifficulties.length === 0 || selectedDifficulties.includes(difficulty);
            const matchesCookTime = selectedCookTimes.length === 0 || selectedCookTimes.includes(cookTime);
            
            let matchesRating = true;
                if (selectedRating === '4.5分以上' || selectedRating === '4.5') {
                matchesRating = rating >= 4.5;
                } else if (selectedRating === '4.0分以上' || selectedRating === '4.0') {
                matchesRating = rating >= 4.0;
            }
            
            // 所有条件都匹配才显示
            if (matchesSearch && matchesTag && matchesDifficulty && matchesCookTime && matchesRating) {
                card.style.display = '';
                    visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
            
            console.log(`筛选结果: 显示 ${visibleCount} 个, 隐藏 ${recipeCards.length - visibleCount} 个`);
            
            // 如果没有匹配结果，显示提示
            const noResultsEl = document.getElementById('noResults');
            if (noResultsEl) {
                if (visibleCount === 0) {
                    noResultsEl.classList.remove('hidden');
                } else {
                    noResultsEl.classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('筛选食谱时发生错误:', error);
        }
    }
    
    // 初始筛选一次以设置正确的显示状态
    setTimeout(filterRecipes, 100);
}

// 初始化苹果品种页筛选功能
function initAppleVarietiesFilter() {
    const searchInput = document.getElementById('searchInput');
    const filterTags = document.querySelectorAll('.filter-tag');
    const advancedFilterBtn = document.getElementById('advancedFilterBtn');
    const advancedFilterPanel = document.getElementById('advancedFilterPanel');
    const appleCards = document.querySelectorAll('.apple-card');
    const resetFilterBtn = document.getElementById('resetFilter');
    const applyFilterBtn = document.getElementById('applyFilter');
    
    if (!searchInput) {
        console.warn('未找到搜索输入框(searchInput)，跳过初始化');
        return;
    }
    
    console.log('初始化苹果品种页筛选功能，找到', appleCards.length, '个苹果卡片');
    
    let debounceTimer;
    
    // 搜索框输入事件
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const searchTerm = this.value.trim().toLowerCase();
            console.log('搜索关键词:', searchTerm);
            filterAppleVarieties();
        }, 300);
    });
    
    // 点击筛选标签
    filterTags.forEach(tag => {
        tag.addEventListener('click', function() {
            console.log('点击标签:', this.dataset.type);
            // 移除其他标签的active状态
            filterTags.forEach(t => {
                t.classList.remove('active');
                t.classList.remove('bg-primary', 'text-white');
                t.classList.add('bg-white', 'text-gray-700', 'border', 'border-gray-200');
            });
            
            // 设置当前标签为active
            this.classList.add('active');
            this.classList.remove('bg-white', 'text-gray-700', 'border', 'border-gray-200');
            this.classList.add('bg-primary', 'text-white');
            
            filterAppleVarieties();
        });
    });
    
    // 点击高级筛选按钮
    if (advancedFilterBtn && advancedFilterPanel) {
        advancedFilterBtn.addEventListener('click', function() {
            console.log('切换高级筛选面板');
            advancedFilterPanel.classList.toggle('hidden');
        });
        
        // 点击页面其他区域关闭高级筛选面板
        document.addEventListener('click', function(event) {
            if (!advancedFilterPanel.contains(event.target) && 
                event.target !== advancedFilterBtn && 
                !advancedFilterBtn.contains(event.target)) {
                advancedFilterPanel.classList.add('hidden');
            }
        });
    }
    
    // 重置筛选
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', function() {
            console.log('重置筛选条件');
            // 重置搜索框
            searchInput.value = '';
            
            // 重置标签筛选
            filterTags.forEach(t => {
                if (t.dataset.type === 'all') {
                    t.classList.add('active');
                    t.classList.remove('bg-white', 'text-gray-700', 'border', 'border-gray-200');
                    t.classList.add('bg-primary', 'text-white');
                } else {
                    t.classList.remove('active');
                    t.classList.remove('bg-primary', 'text-white');
                    t.classList.add('bg-white', 'text-gray-700', 'border', 'border-gray-200');
                }
            });
            
            // 重置复选框
            const checkboxes = advancedFilterPanel.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => cb.checked = false);
            
            // 重置数字输入框
            const numberInputs = advancedFilterPanel.querySelectorAll('input[type="number"]');
            numberInputs.forEach(input => input.value = '');
            
            // 重新筛选
            filterAppleVarieties();
        });
    }
    
    // 应用筛选
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', function() {
            console.log('应用筛选条件');
            filterAppleVarieties();
            advancedFilterPanel.classList.add('hidden');
        });
    }
    
    // 筛选苹果品种
    function filterAppleVarieties() {
        console.log('执行苹果品种筛选...');
        try {
        const searchTerm = searchInput.value.trim().toLowerCase();
            const activeTag = document.querySelector('.filter-tag.active');
        const tagType = activeTag ? activeTag.dataset.type : 'all';
        
        // 获取高级筛选条件（如果有）
            const selectedOrigins = Array.from(document.querySelectorAll('#advancedFilterPanel input[name="origin"]:checked')).map(cb => cb.value);
        
        // 获取价格范围（如果有）
            const priceInputs = document.querySelectorAll('#advancedFilterPanel input[type="number"]');
        const minPrice = priceInputs[0] && priceInputs[0].value ? parseFloat(priceInputs[0].value) : 0;
        const maxPrice = priceInputs[1] && priceInputs[1].value ? parseFloat(priceInputs[1].value) : Infinity;
            
            console.log(`筛选条件: 搜索词="${searchTerm}", 标签=${tagType}, 原产地=[${selectedOrigins}], 价格=${minPrice}-${maxPrice}`);
            
            let visibleCount = 0;
        
        appleCards.forEach(card => {
                const cardTitle = card.querySelector('h3');
                const cardDesc = card.querySelector('p');
                
                if (!cardTitle || !cardDesc) {
                    console.warn('卡片缺少标题或描述元素', card);
                    return;
                }
                
                const title = cardTitle.textContent.toLowerCase();
                const description = cardDesc.textContent.toLowerCase();
                const tagElements = card.querySelectorAll('.bg-red-50, .bg-green-50, .bg-blue-50, .bg-yellow-50, .bg-purple-50, .bg-pink-50, .bg-orange-50, .bg-indigo-50');
                const tags = Array.from(tagElements).map(tag => tag.textContent.toLowerCase());
            
            // 搜索条件匹配
            const matchesSearch = !searchTerm || 
                                  title.includes(searchTerm) || 
                                  description.includes(searchTerm) || 
                                  tags.some(tag => tag.includes(searchTerm));
            
            // 标签条件匹配 - 模糊匹配：只要标签包含筛选关键词就匹配
            let matchesTag = tagType === 'all';
                if (!matchesTag && tagType) {
                matchesTag = tags.some(tag => tag.includes(tagType.toLowerCase()));
            }
            
            // 高级筛选匹配（如果有）
                const origin = card.dataset.origin || '';
            const price = card.dataset.price ? parseFloat(card.dataset.price) : 0;
            
            const matchesOrigin = selectedOrigins.length === 0 || selectedOrigins.includes(origin);
            const matchesPrice = (!minPrice || price >= minPrice) && (!maxPrice || price <= maxPrice);
            
            // 所有条件都匹配才显示
            if (matchesSearch && matchesTag && matchesOrigin && matchesPrice) {
                card.style.display = '';
                    visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
            
            console.log(`筛选结果: 显示 ${visibleCount} 个, 隐藏 ${appleCards.length - visibleCount} 个`);
            
            // 如果没有匹配结果，显示提示
            const noResultsEl = document.getElementById('noResults');
            if (noResultsEl) {
                if (visibleCount === 0) {
                    noResultsEl.classList.remove('hidden');
                } else {
                    noResultsEl.classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('筛选苹果品种时发生错误:', error);
        }
    }
    
    // 初始筛选一次以设置正确的显示状态
    setTimeout(filterAppleVarieties, 100);
}

// 初始化收藏页面功能
function initFavoritesPage() {
    // 判断是否在收藏页面
    if (!window.location.pathname.includes('Favorites.html')) return;
    
    // 处理类别切换按钮
    const categoryButtons = document.querySelectorAll('.category-btn');
    if (categoryButtons.length) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                // 移除所有按钮的激活状态
                categoryButtons.forEach(btn => {
                    btn.classList.remove('text-primary', 'border-primary');
                    btn.classList.add('text-gray-500', 'border-transparent');
                });
                
                // 添加当前按钮的激活状态
                this.classList.remove('text-gray-500', 'border-transparent');
                this.classList.add('text-primary', 'border-primary');
                
                // 根据按钮data-type属性过滤收藏项
                const type = this.dataset.type;
                filterFavoriteItems(type);
            });
        });
    }
    
    // 处理收藏卡片上的心形按钮
    const heartButtons = document.querySelectorAll('.bg-white .absolute button');
    if (heartButtons.length) {
        heartButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // 获取卡片信息
                const card = this.closest('.bg-white');
                const title = card.querySelector('h3').textContent;
                
                // 移除卡片并显示提示
                card.classList.add('scale-95', 'opacity-0');
                setTimeout(() => {
                    card.remove();
                    
                    // 更新显示的收藏数量
                    updateFavoriteCount();
                    
                    // 显示提示
                    showToast(`已从收藏中移除"${title}"`);
                }, 300);
                
                // 从本地存储中移除
                const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
                const index = favorites.findIndex(f => f.title.includes(title));
                if (index > -1) {
                    favorites.splice(index, 1);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                }
            });
        });
    }
    
    // 处理详情按钮
    const detailButtons = document.querySelectorAll('.bg-white .detail-btn');
    if (detailButtons.length) {
        detailButtons.forEach(button => {
            button.addEventListener('click', function() {
                const card = this.closest('.bg-white');
                const title = card.querySelector('h3').textContent;
                
                // 根据标题判断类型，并跳转到相应的详情页面
                if (title.includes('苹果')) {
                    window.location.href = `AppleDetail.html?name=${encodeURIComponent(title)}`;
                } else {
                    window.location.href = `RecipeDetail.html?name=${encodeURIComponent(title)}`;
                }
            });
        });
    }
}

// 过滤收藏项目
function filterFavoriteItems(type) {
    const allItems = document.querySelectorAll('.grid.grid-cols-1 > div');
    
    if (allItems.length) {
        allItems.forEach(item => {
            const title = item.querySelector('h3').textContent;
            const isApple = title.includes('苹果');
            
            if ((type === 'apple' && isApple) || (type === 'recipe' && !isApple)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

// 更新收藏数量
function updateFavoriteCount() {
    const visibleItems = document.querySelectorAll('.grid.grid-cols-1 > div[style=""]').length;
    const countElement = document.querySelector('.text-gray-600');
    
    if (countElement) {
        countElement.textContent = `共 ${visibleItems} 个收藏`;
    }
}

// 初始化订单历史页面功能
function initOrderHistoryPage() {
    // 判断是否在订单历史页面
    if (!window.location.pathname.includes('OrderHistory.html')) return;
    
    // 处理订单状态过滤按钮
    const statusButtons = document.querySelectorAll('.status-btn');
    if (statusButtons.length) {
        statusButtons.forEach(button => {
            button.addEventListener('click', function() {
                // 移除所有按钮的激活状态
                statusButtons.forEach(btn => {
                    btn.classList.remove('bg-primary', 'text-white');
                    btn.classList.add('bg-white', 'text-gray-700');
                });
                
                // 添加当前按钮的激活状态
                this.classList.remove('bg-white', 'text-gray-700');
                this.classList.add('bg-primary', 'text-white');
                
                // 获取订单状态
                const status = this.dataset.status;
                
                // 根据状态过滤订单
                filterOrdersByStatus(status);
            });
        });
    }
    
    // 处理查看详情按钮
    const detailButtons = document.querySelectorAll('.detail-btn');
    if (detailButtons.length) {
        detailButtons.forEach(button => {
            button.addEventListener('click', function() {
                const orderItem = this.closest('.bg-white');
                const orderId = orderItem.querySelector('.p-4.border-b span:first-child').textContent.split('：')[1];
                
                // 跳转到订单详情页面
                window.location.href = `OrderDetail.html?id=${encodeURIComponent(orderId)}`;
            });
        });
    }
    
    // 处理确认收货/再次购买按钮
    const actionButtons = document.querySelectorAll('.action-btn');
    if (actionButtons.length) {
        actionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const orderItem = this.closest('.bg-white');
                const orderId = orderItem.querySelector('.p-4.border-b span:first-child').textContent.split('：')[1];
                const buttonText = this.textContent.trim();
                
                if (buttonText === '确认收货') {
                    // 修改订单状态为已完成
                    const statusElement = orderItem.querySelector('.p-4.border-b span:last-child');
                    statusElement.textContent = '已完成';
                    statusElement.classList.remove('text-primary');
                    statusElement.classList.add('text-green-600');
                    
                    // 更改按钮为"再次购买"
                    this.textContent = '再次购买';
                    this.classList.remove('bg-primary', 'text-white');
                    this.classList.add('text-gray-700', 'border', 'border-gray-200');
                    
                    // 显示提示
                    showToast('已确认收货');
                } else if (buttonText === '再次购买') {
                    // 获取商品信息
                    const productName = orderItem.querySelector('h3').textContent;
                    const price = orderItem.querySelector('.text-lg.font-bold').textContent;
                    
                    // 添加到购物车
                    addToCart(productName, price);
                    
                    // 显示提示
                    showToast(`已将"${productName}"添加到购物车`);
                }
            });
        });
    }
}

// 根据状态过滤订单
function filterOrdersByStatus(status) {
    const allOrders = document.querySelectorAll('.space-y-6 > div');
    
    if (allOrders.length) {
        if (status === '全部订单') {
            // 显示所有订单
            allOrders.forEach(order => {
                order.style.display = '';
            });
            return;
        }
        
        allOrders.forEach(order => {
            const orderStatus = order.querySelector('.p-4.border-b span:last-child').textContent;
            
            if (orderStatus === status) {
                order.style.display = '';
            } else {
                order.style.display = 'none';
            }
        });
    }
}

// 添加商品到购物车函数
function addToCart(id, name, price, image) {
  try {
    console.log(`添加商品到购物车: ${name}, 价格: ${price}`);
    
    // 从localStorage获取当前购物车数据
    let cart = JSON.parse(localStorage.getItem('appleCart') || '[]');
    if (!Array.isArray(cart)) {
      console.warn('购物车数据不是数组，重置为空数组');
      cart = [];
    }
    
    // 检查商品是否已在购物车中
    const existingItemIndex = cart.findIndex(item => item.id === id);
    
    if (existingItemIndex !== -1) {
      // 如果商品已存在，增加数量
      cart[existingItemIndex].quantity = (parseInt(cart[existingItemIndex].quantity) || 1) + 1;
      console.log(`已增加商品 ${name} 的数量，当前数量: ${cart[existingItemIndex].quantity}`);
    } else {
      // 添加新商品
    cart.push({
        id: id,
        name: name,
        price: price,
        image: image,
        quantity: 1
    });
      console.log(`已添加新商品 ${name} 到购物车`);
    }
    
    // 保存到localStorage
    localStorage.setItem('appleCart', JSON.stringify(cart));
    
    // 更新顶部导航栏的购物车图标
    updateHeaderCartCount();
    
    // 显示添加成功通知
    showCartNotification(`${name} 已添加到购物车`);
    
    // 触发自定义事件，通知购物车已更新
    document.dispatchEvent(new CustomEvent('cartUpdated'));
    
    // 触发storage事件，通知其他页面/组件更新
    window.dispatchEvent(new Event('storage'));
    
    return true;
  } catch (error) {
    console.error('添加商品到购物车失败:', error);
    return false;
  }
}

// 更新头部购物车数量显示
function updateHeaderCartCount() {
  try {
    const cartCountElement = document.getElementById('headerCartCount');
    if (!cartCountElement) return;
    
    // 获取购物车数据
    const cart = JSON.parse(localStorage.getItem('appleCart') || '[]');
    
    // 计算商品总数（所有商品数量之和）
    const itemCount = cart.reduce((count, item) => count + (parseInt(item.quantity) || 1), 0);
    
    // 更新显示
    cartCountElement.textContent = itemCount.toString();
    console.log('更新头部购物车图标数量:', itemCount);
    
    // 如果购物车为空，隐藏计数器，否则显示
    if (itemCount === 0) {
      cartCountElement.classList.add('hidden');
    } else {
      cartCountElement.classList.remove('hidden');
    }
  } catch (error) {
    console.error('更新购物车计数失败:', error);
  }
}

// 显示购物车通知信息
function showCartNotification(message) {
  try {
    // 检查是否已存在通知元素
    let notification = document.getElementById('cartNotification');
    
    // 如果不存在，创建一个新的
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'cartNotification';
      notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transform translate-x-full transition-transform duration-300 flex items-center';
      notification.innerHTML = `
        <i class="ri-shopping-cart-line mr-2"></i>
        <span id="cartNotificationMessage"></span>
      `;
      document.body.appendChild(notification);
    }
    
    // 更新消息
    const messageElement = notification.querySelector('#cartNotificationMessage');
    if (messageElement) {
      messageElement.textContent = message;
    }
    
    // 显示通知
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 3秒后隐藏
    setTimeout(() => {
      notification.style.transform = 'translateX(calc(100% + 1rem))';
    }, 3000);
  } catch (error) {
    console.error('显示购物车通知失败:', error);
  }
}

// 用户下拉菜单
function initUserDropdown() {
    const userButton = document.getElementById('userButton');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userButton && userDropdown) {
        userButton.addEventListener('click', function() {
            userDropdown.classList.toggle('hidden');
        });
        
        // 点击其他地方关闭下拉菜单
        document.addEventListener('click', function(e) {
            if (!userButton.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });
    }
}

// 登录和注册对话框
function initAuthDialogs() {
    // 登录对话框
    const loginDialog = document.getElementById('loginDialog');
    const registerDialog = document.getElementById('registerDialog');
    const closeLoginDialog = document.getElementById('closeLoginDialog');
    const closeRegisterDialog = document.getElementById('closeRegisterDialog');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    
    if (loginDialog && closeLoginDialog) {
        closeLoginDialog.addEventListener('click', function() {
            loginDialog.classList.add('hidden');
        });
    }
    
    if (registerDialog && closeRegisterDialog) {
        closeRegisterDialog.addEventListener('click', function() {
            registerDialog.classList.add('hidden');
        });
    }
    
    if (showRegister && loginDialog && registerDialog) {
        showRegister.addEventListener('click', function() {
            loginDialog.classList.add('hidden');
            registerDialog.classList.remove('hidden');
        });
    }
    
    if (showLogin && loginDialog && registerDialog) {
        showLogin.addEventListener('click', function() {
            registerDialog.classList.add('hidden');
            loginDialog.classList.remove('hidden');
        });
    }
}

// 收藏功能
function initFavorites() {
    const favButtons = document.querySelectorAll('.favorite-btn');
    
    favButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
            // 这里可以添加实际的收藏逻辑
        });
    });
}

// 处理顶部导航栏的搜索框
function initHeaderSearch() {
    console.log('初始化顶部导航栏搜索功能...');
    
    const headerSearchInput = document.querySelector('header input[placeholder*="搜索苹果品种、食谱"]');
    
    if (headerSearchInput) {
        console.log('找到顶部搜索框元素');
        
        // 创建搜索结果容器
        const searchResultsContainer = document.createElement('div');
        searchResultsContainer.className = 'absolute mt-2 w-full bg-white rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto hidden transition-all duration-200';
        searchResultsContainer.style.top = '100%';
        searchResultsContainer.style.left = '0';
        headerSearchInput.parentNode.style.position = 'relative';
        headerSearchInput.parentNode.appendChild(searchResultsContainer);
        
        // 监听输入事件
        let debounceTimer;
        headerSearchInput.addEventListener('input', function() {
            clearTimeout(debounceTimer);
            
            const searchTerm = this.value.trim();
            
            if (searchTerm.length < 2) {
                searchResultsContainer.classList.add('hidden');
                return;
            }
            
            debounceTimer = setTimeout(() => {
                console.log('搜索关键词:', searchTerm);
                performSearch(searchTerm, searchResultsContainer);
            }, 300);
        });
        
        // 监听焦点事件
        headerSearchInput.addEventListener('focus', function() {
            const searchTerm = this.value.trim();
            if (searchTerm.length >= 2) {
                searchResultsContainer.classList.remove('hidden');
            }
        });
        
        // 点击其他区域关闭搜索结果
        document.addEventListener('click', function(e) {
            if (!headerSearchInput.contains(e.target) && 
                !searchResultsContainer.contains(e.target)) {
                searchResultsContainer.classList.add('hidden');
            }
        });
        
        // 按下ESC键关闭搜索结果
        headerSearchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchResultsContainer.classList.add('hidden');
            }
            
            // 按下回车键，如果有第一个结果，则跳转
            if (e.key === 'Enter') {
                const firstResult = searchResultsContainer.querySelector('.search-result-item');
                if (firstResult) {
                    window.location.href = firstResult.getAttribute('href');
                }
            }
        });
    } else {
        console.warn('未找到顶部搜索框元素');
    }
}

// 搜索功能实现
function performSearch(query, resultsContainer) {
    console.log('执行搜索:', query);
    
    // 显示加载状态
    resultsContainer.innerHTML = `
        <div class="p-4 text-center">
            <div class="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
            <span class="ml-2">正在搜索...</span>
        </div>
    `;
    resultsContainer.classList.remove('hidden');
    
    // 模拟搜索延迟
    setTimeout(() => {
        // 搜索数据
        const searchResults = searchWebsiteContent(query);
        
        if (searchResults.length === 0) {
            resultsContainer.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <i class="ri-search-line mr-2"></i>
                    未找到与"${query}"相关的内容
                </div>
            `;
            return;
        }
        
        // 显示搜索结果
        resultsContainer.innerHTML = `
            <div class="py-2 px-4 border-b border-gray-100">
                <p class="text-sm text-gray-500">找到 ${searchResults.length} 个结果</p>
            </div>
            <div class="py-2">
                ${searchResults.map(result => `
                    <a href="${result.url}" class="search-result-item block px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div class="flex items-start">
                            ${result.image ? `
                                <div class="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0 mr-3">
                                    <img src="${result.image}" alt="${result.title}" class="w-full h-full object-cover">
                                </div>
                            ` : `
                                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mr-3">
                                    <i class="${result.icon || 'ri-file-list-line'}"></i>
                                </div>
                            `}
                            <div class="flex-1 min-w-0">
                                <h4 class="font-medium text-gray-900 truncate">${highlightText(result.title, query)}</h4>
                                <p class="text-sm text-gray-500 mt-1 line-clamp-2">${highlightText(result.description, query)}</p>
                                ${result.category ? `<span class="inline-block mt-2 px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">${result.category}</span>` : ''}
                            </div>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
    }, 300);
}

// 高亮搜索关键词
function highlightText(text, query) {
    if (!text) return '';
    
    // 转义正则表达式特殊字符
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // 创建正则表达式，不区分大小写
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    // 替换匹配的文本为带高亮的HTML
    return text.replace(regex, '<span class="bg-yellow-100">$1</span>');
}

// 搜索网站内容
function searchWebsiteContent(query) {
    // 这里使用模拟数据，实际应用中可以从服务器获取数据或在前端维护一个搜索索引
    const siteContent = [
        {
            title: '红富士苹果',
            description: '红富士苹果甜脆多汁，果肉细腻，香气浓郁，是最受欢迎的苹果品种之一。',
            url: 'DetailsofOneApple.html?name=红富士',
            image: 'https://readdy.ai/api/search-image?query=A%20close-up%2C%20detailed%20image%20of%20a%20Red%20Delicious%20apple&width=100&height=100',
            category: '苹果品种'
        },
        {
            title: '青苹果',
            description: '青苹果酸甜可口，果肉坚实，口感清脆，是烘焙和沙拉的理想选择。',
            url: 'DetailsofOneApple.html?name=青苹果',
            image: 'https://readdy.ai/api/search-image?query=A%20close-up%2C%20detailed%20image%20of%20a%20Granny%20Smith%20apple&width=100&height=100',
            category: '苹果品种'
        },
        {
            title: '蜜脆苹果',
            description: '蜜脆苹果汁水丰富，甜度适中，口感极佳，是近年来备受欢迎的高端品种。',
            url: 'DetailsofOneApple.html?name=蜜脆苹果',
            image: 'https://readdy.ai/api/search-image?query=A%20close-up%2C%20detailed%20image%20of%20a%20Honeycrisp%20apple&width=100&height=100',
            category: '苹果品种'
        },
        {
            title: '经典苹果派',
            description: '香酥的派皮搭配肉桂苹果馅，是最经典的美式甜点，温暖而充满家的味道。',
            url: 'RecipeDetail.html',
            image: 'https://readdy.ai/api/search-image?query=A%20beautifully%20styled%20image%20of%20a%20classic%20apple%20pie&width=100&height=100',
            category: '美食食谱'
        },
        {
            title: '鲜苹果沙拉',
            description: '清爽的苹果沙拉搭配坚果和蔓越莓，营养丰富，是健康轻食的绝佳选择。',
            url: 'ListofAppleRecipes.html#沙拉',
            image: 'https://readdy.ai/api/search-image?query=A%20visually%20appealing%20image%20of%20a%20fresh%20apple%20salad&width=100&height=100',
            category: '美食食谱'
        },
        {
            title: '苹果文化与象征',
            description: '在许多文化中，苹果代表知识和智慧，如牛顿的苹果启发了万有引力定律。',
            url: 'AppleCulture.html',
            icon: 'ri-book-line',
            category: '文化历史'
        },
        {
            title: '苹果的营养价值',
            description: '苹果富含膳食纤维、抗氧化物质和维生素C，对心脏健康和消化系统有益。',
            url: 'index.html#nutrition',
            icon: 'ri-heart-pulse-line',
            category: '营养健康'
        },
        {
            title: '贪吃苹果小游戏',
            description: '休闲娱乐时刻，来一场经典的贪吃蛇游戏，收集美味的苹果，挑战高分！',
            url: 'SnakeGame.html',
            icon: 'ri-gamepad-line',
            category: '休闲游戏'
        }
    ];
    
    // 过滤出匹配的结果
    return siteContent.filter(item => {
        const lowerQuery = query.toLowerCase();
        return (
            item.title.toLowerCase().includes(lowerQuery) || 
            item.description.toLowerCase().includes(lowerQuery) ||
            (item.category && item.category.toLowerCase().includes(lowerQuery))
        );
    });
}

/**
 * 季节主题控制器
 * 实现根据不同季节（春、夏、秋、冬）切换网站主题样式
 */
function initSeasonalTheme() {
    console.log('初始化季节主题功能');
    
    // 定义季节及其相关样式
    const seasons = {
        spring: {
            name: '春季',
            icon: 'ri-seedling-line',
            primaryColor: '#4CD964', // 春天绿色
            secondaryColor: '#FFCC00', // 春日阳光色
            backgroundStyle: 'linear-gradient(to bottom, #e0f7fa, #ffffff)',
            appleState: '花期',
            description: '春季苹果树开花阶段，树枝上点缀着粉白色的花朵',
            headerImage: 'https://img.freepik.com/free-vector/spring-landscape-scene_23-2148860692.jpg',
        },
        summer: {
            name: '夏季',
            icon: 'ri-sun-line',
            primaryColor: '#FF9500', // 夏日橙色
            secondaryColor: '#34C759', // 夏季翠绿色
            backgroundStyle: 'linear-gradient(to bottom, #f0f9ff, #ffffff)',
            appleState: '生长期',
            description: '夏季苹果正在树上生长，果实小而青绿',
            headerImage: 'https://img.freepik.com/free-vector/gradient-summer-background-videocalls_23-2149225727.jpg',
        },
        autumn: {
            name: '秋季',
            icon: 'ri-leaf-line',
            primaryColor: '#FF3B30', // 秋季红色
            secondaryColor: '#FF9500', // 秋日橙色
            backgroundStyle: 'linear-gradient(to bottom, #fff8e1, #ffffff)',
            appleState: '成熟期',
            description: '秋季苹果成熟饱满，挂满枝头，色泽红润',
            headerImage: 'https://img.freepik.com/free-vector/flat-autumn-background_23-2149587231.jpg',
        },
        winter: {
            name: '冬季',
            icon: 'ri-snowy-line',
            primaryColor: '#007AFF', // 冬季蓝色
            secondaryColor: '#5AC8FA', // 冬日浅蓝色
            backgroundStyle: 'linear-gradient(to bottom, #f5f7fa, #ffffff)',
            appleState: '休眠期',
            description: '冬季苹果树进入休眠，储存能量准备来年',
            headerImage: 'https://img.freepik.com/free-vector/winter-landscape-concept_23-2148748108.jpg',
        }
    };
    
    // 获取当前或用户选择的季节
    function getCurrentSeason() {
        // 尝试从localStorage获取用户设置的季节
        const userSeason = localStorage.getItem('userSeasonPreference');
        if (userSeason && seasons[userSeason]) {
            return userSeason;
        }
        
        // 如果用户没有选择，则根据当前月份自动设置季节
        const month = new Date().getMonth(); // 0-11
        
        if (month >= 2 && month <= 4) return 'spring';      // 3-5月为春季
        else if (month >= 5 && month <= 7) return 'summer'; // 6-8月为夏季
        else if (month >= 8 && month <= 10) return 'autumn'; // 9-11月为秋季
        else return 'winter';                               // 12-2月为冬季
    }
    
    // 应用季节主题
    function applySeasonTheme(season) {
        const seasonData = seasons[season];
        if (!seasonData) return;
        
        console.log(`应用季节主题: ${season}`);
        
        // 更新CSS变量
        document.documentElement.style.setProperty('--primary-color', seasonData.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', seasonData.secondaryColor);
        document.documentElement.style.setProperty('--background-style', seasonData.backgroundStyle);
        
        // 更新页面主体背景
        document.body.style.background = seasonData.backgroundStyle;
        
        // 更新顶部横幅图片（如果存在）
        const headerBanner = document.querySelector('.header-banner');
        if (headerBanner) {
            headerBanner.style.backgroundImage = `url(${seasonData.headerImage})`;
            
            // 更新横幅描述文字
            const seasonBannerDesc = document.getElementById('seasonBannerDesc');
            if (seasonBannerDesc) {
                seasonBannerDesc.textContent = seasonData.description;
            }
        }
        
        // 更新季节按钮状态（不管headerBanner是否存在）
        const seasonBtns = document.querySelectorAll('.season-btn');
        seasonBtns.forEach(btn => {
            if (btn.dataset.season === season) {
                btn.classList.add('bg-primary', 'text-white', 'border-primary');
                btn.classList.remove('bg-white', 'text-gray-700', 'border-gray-300');
            } else {
                btn.classList.remove('bg-primary', 'text-white', 'border-primary');
                btn.classList.add('bg-white', 'text-gray-700', 'border-gray-300');
            }
        });

        // 更新季节状态显示
        const seasonStatus = document.getElementById('seasonStatus');
        if (seasonStatus) {
            seasonStatus.innerHTML = `
                <i class="${seasonData.icon}"></i>
                <span>${seasonData.name}：${seasonData.appleState}</span>
                <small>${seasonData.description}</small>
            `;
        }
        
        // 更新导航栏季节选择器按钮
        const seasonToggle = document.getElementById('seasonToggle');
        if (seasonToggle) {
            seasonToggle.innerHTML = `
                <i class="${seasonData.icon} text-lg mr-1" style="color:${seasonData.primaryColor}"></i>
                <span class="hidden sm:inline">${seasonData.name}</span>
            `;
        }
        
        // 保存用户选择
        localStorage.setItem('userSeasonPreference', season);
        
        // 显示主题切换提示
        showToast(`已切换到${seasonData.name}主题`);
        
        console.log('季节主题应用完成');
        
        // 派发自定义事件，通知其他组件季节已改变
        const event = new CustomEvent('seasonChanged', {
            detail: { 
                season: season,
                data: seasonData 
            }
        });
        document.dispatchEvent(event);
    }
    
    // 将函数导出到全局作用域，以便其他脚本可以调用
    window.applySeasonTheme = applySeasonTheme;
    window.getCurrentSeason = getCurrentSeason;
    
    // 创建季节选择器
    function createSeasonSelector() {
        // 检查是否已存在季节选择器
        if (document.getElementById('seasonSelector')) return;
        
        // 创建季节选择器容器
        const seasonSelector = document.createElement('div');
        seasonSelector.id = 'seasonSelector';
        seasonSelector.className = 'season-selector mr-2 relative';
        
        // 创建当前季节显示按钮
        const currentSeason = getCurrentSeason();
        const currentSeasonData = seasons[currentSeason];
        
        seasonSelector.innerHTML = `
            <button id="seasonToggle" class="flex items-center p-2 text-gray-700 bg-white hover:bg-gray-100 rounded-full transition duration-200">
                <i class="${currentSeasonData.icon} text-lg mr-1" style="color:${currentSeasonData.primaryColor}"></i>
                <span class="hidden sm:inline">${currentSeasonData.name}</span>
            </button>
            <div id="seasonDropdown" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-50 hidden">
                <div class="py-2">
                    ${Object.entries(seasons).map(([key, data]) => `
                        <button data-season="${key}" class="season-option w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <i class="${data.icon} mr-2" style="color:${data.primaryColor}"></i>
                            <span>${data.name}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        // 将季节选择器添加到导航栏
        const navbar = document.querySelector('nav ul');
        if (navbar) {
            const li = document.createElement('li');
            li.className = 'ml-auto flex items-center';
            li.appendChild(seasonSelector);
            
            // 添加季节状态显示
            const seasonStatus = document.createElement('div');
            seasonStatus.id = 'seasonStatus';
            seasonStatus.className = 'hidden md:flex items-center text-xs text-gray-600 ml-2';
            li.appendChild(seasonStatus);
            
            // 检查是否已有其他auto-margin元素
            const autoMarginItem = navbar.querySelector('.ml-auto');
            if (autoMarginItem) {
                navbar.insertBefore(li, autoMarginItem);
            } else {
                navbar.appendChild(li);
            }
        }
        
        // 添加事件监听
        const seasonToggle = document.getElementById('seasonToggle');
        const seasonDropdown = document.getElementById('seasonDropdown');
        
        if (seasonToggle && seasonDropdown) {
            // 点击按钮显示/隐藏下拉菜单
            seasonToggle.addEventListener('click', function(e) {
                e.stopPropagation();
                seasonDropdown.classList.toggle('hidden');
            });
            
            // 点击季节选项切换主题
            const seasonOptions = document.querySelectorAll('.season-option');
            seasonOptions.forEach(option => {
                option.addEventListener('click', function() {
                    const season = this.dataset.season;
                    applySeasonTheme(season);
                    seasonDropdown.classList.add('hidden');
        });
    });

            // 点击其他地方关闭下拉菜单
            document.addEventListener('click', function() {
                seasonDropdown.classList.add('hidden');
            });
        }
    }
    
    // 初始化横幅季节按钮
    function initSeasonBannerButtons() {
        console.log('初始化季节横幅按钮');
        const seasonBtns = document.querySelectorAll('.season-btn');
        if (seasonBtns.length) {
            console.log(`找到 ${seasonBtns.length} 个季节按钮`);
            // 初始时设置当前季节按钮样式
            const currentSeason = getCurrentSeason();
            seasonBtns.forEach(btn => {
                if (btn.dataset.season === currentSeason) {
                    btn.classList.add('bg-primary', 'text-white', 'border-primary');
                    btn.classList.remove('bg-white', 'border-gray-300');
                }
                
                // 添加点击事件
                btn.addEventListener('click', function() {
                    const season = this.dataset.season;
                    console.log('点击了季节按钮：', season);
                    applySeasonTheme(season);
                });
            });
        } else {
            console.warn('未找到季节按钮');
        }
    }
    
    // 添加CSS样式
    function addSeasonStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            :root {
                --primary-color: ${seasons[getCurrentSeason()].primaryColor};
                --secondary-color: ${seasons[getCurrentSeason()].secondaryColor};
                --background-style: ${seasons[getCurrentSeason()].backgroundStyle};
            }
            
            /* 季节选择器样式 */
            .season-selector {
                transition: all 0.3s ease;
            }
            
            #seasonToggle {
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            #seasonToggle:hover {
                box-shadow: 0 2px 4px rgba(0,0,0,0.15);
            }
            
            #seasonDropdown {
                transform-origin: top right;
                transition: opacity 0.2s, transform 0.2s;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08);
            }
            
            #seasonDropdown.hidden {
                opacity: 0;
                transform: scale(0.95);
                pointer-events: none;
            }
            
            .season-option {
                transition: background-color 0.2s;
            }
            
            #seasonStatus {
                font-size: 0.75rem;
                max-width: 180px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            
            #seasonStatus small {
                display: none;
            }
            
            @media (min-width: 1024px) {
                #seasonStatus {
                    max-width: 250px;
                }
                
                #seasonStatus small {
                    display: block;
                    opacity: 0.7;
                }
            }
            
            /* 季节性背景过渡效果 */
            body {
                transition: background 1s ease;
            }
            
            /* 季节横幅样式 */
            .header-banner {
                position: relative;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .header-banner::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 50%);
                z-index: 1;
            }
            
            .header-banner > div {
                position: relative;
                z-index: 2;
            }
            
            /* 季节按钮样式 */
            .season-btn {
                transition: all 0.3s ease;
            }
            
            .season-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            
            /* 重新定义主题色 */
            .bg-primary {
                background-color: var(--primary-color) !important;
            }
            
            .text-primary {
                color: var(--primary-color) !important;
            }
            
            .border-primary {
                border-color: var(--primary-color) !important;
            }
            
            .bg-secondary {
                background-color: var(--secondary-color) !important;
            }
            
            .text-secondary {
                color: var(--secondary-color) !important;
            }
            
            .border-secondary {
                border-color: var(--secondary-color) !important;
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    // 初始化
    addSeasonStyles();
    createSeasonSelector();
    initSeasonBannerButtons();
    applySeasonTheme(getCurrentSeason());
}

// 初始化所有功能
function initAll() {
    // 初始化网站导航
    initNavigation();
    
    // 初始化用户按钮
    initUserButton();
    
    // 初始化各页面特定功能
    initFavoritesPage();
    initOrderHistoryPage();
    
    // 初始化分页功能
    initPagination();
    
    // 检测当前页面并初始化相应的筛选功能
    if (window.location.pathname.includes('DetailsofAppleVarieties.html')) {
        console.log('检测到苹果品种页面，初始化筛选功能');
        initAppleVarietiesFilter();
        
        // 确保一开始就只显示第一页的卡片
        setTimeout(() => {
            updateAppleVarietiesPage(1);
            updatePageInfo(1);
        }, 100);
    } else if (window.location.pathname.includes('ListofAppleRecipes.html')) {
        console.log('检测到食谱列表页面，初始化筛选功能');
        initRecipeFilter();
    } else {
        // 在其他页面尝试初始化通用筛选功能
        initAppleFilter();
    }

    // 初始化购物车
    updateHeaderCartCount();
    
    // 初始化收藏状态
    initFavorites();
    
    // 初始化搜索功能
    initHeaderSearch();
    
    // 初始化收藏数据变化监听，确保所有页面能实时更新收藏状态
    initFavoritesSync();
    
    // 初始化季节主题
    initSeasonalTheme();
}

// 初始化收藏数据同步
function initFavoritesSync() {
  // 监听storage事件，当其他页面更新localStorage时触发
  window.addEventListener('storage', function(e) {
    if (e.key === 'favorites' || e.key === 'favoritePageData') {
      console.log('检测到收藏数据变化', e.key);
      
      // 更新收藏按钮状态
      if (typeof updateFavoriteButtons === 'function') {
        try {
          const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
          updateFavoriteButtons();
          // 如果在首页且有收藏区域，更新收藏显示
          if (window.location.pathname.includes('index.html') && typeof updateFavoritesDisplay === 'function') {
            updateFavoritesDisplay();
          }
        } catch (error) {
          console.error('更新收藏状态失败:', error);
        }
      }
    }
  });
}

// 当DOM加载完成后初始化所有功能
document.addEventListener('DOMContentLoaded', function() {
    initAll();
}); 