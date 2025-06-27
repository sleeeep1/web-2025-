// debug.js - 页面诊断工具
console.log('调试工具已加载...');

// 在页面加载完成后运行诊断
document.addEventListener('DOMContentLoaded', function() {
    // 一般诊断
    console.group('页面诊断信息');
    console.log('当前页面:', window.location.pathname);
    console.log('页面准备就绪:', document.readyState);
    console.groupEnd();
    
    // 检查页面类型
    const isRecipePage = window.location.pathname.includes('ListofAppleRecipes.html');
    const isVarietiesPage = window.location.pathname.includes('ListofAppleVarieties.html');
    
    // 食谱页面诊断
    if (isRecipePage) {
        console.group('食谱页面诊断');
        
        // 检查关键元素
        const recipesContainer = document.getElementById('recipes');
        console.log('找到食谱容器(#recipes):', !!recipesContainer);
        
        const searchInput = document.getElementById('searchInput');
        console.log('找到搜索输入框(#searchInput):', !!searchInput);
        
        const filterTags = document.querySelectorAll('.filter-tag');
        console.log('找到标签按钮(.filter-tag):', filterTags.length);
        
        // 显示所有标签类型
        console.group('筛选标签类型');
        filterTags.forEach(tag => {
            console.log(`"${tag.textContent}": data-type="${tag.dataset.type}"`);
        });
        console.groupEnd();
        
        // 检查食谱卡片
        const recipeCards = document.querySelectorAll('.recipe-card');
        console.log('找到食谱卡片(.recipe-card):', recipeCards.length);
        
        // 显示所有食谱卡片的属性
        console.group('食谱卡片属性');
        recipeCards.forEach((card, index) => {
            console.log(`卡片 #${index+1}:`, {
                '类型': card.dataset.type || '未设置', 
                '难度': card.dataset.difficulty || '未设置',
                '烹饪时间': card.dataset.cooktime || '未设置',
                '评分': card.dataset.rating || '未设置',
                '标题': card.querySelector('h3')?.textContent || '未找到标题'
            });
        });
        console.groupEnd();
        
        // 检查高级筛选面板
        const advancedPanel = document.getElementById('advancedFilterPanel');
        console.log('找到高级筛选面板(#advancedFilterPanel):', !!advancedPanel);
        
        // 检查按钮
        const resetButton = document.getElementById('resetFilter');
        const applyButton = document.getElementById('applyFilter');
        console.log('找到重置按钮(#resetFilter):', !!resetButton);
        console.log('找到应用按钮(#applyFilter):', !!applyButton);
        
        // 检查"无结果"提示
        const noResults = document.getElementById('noResults');
        console.log('找到无结果提示(#noResults):', !!noResults);
        
        // 检查初始化状态
        console.log('initRecipeFilter函数存在:', typeof initRecipeFilter === 'function');
        
        console.groupEnd();
    }
    
    // 苹果品种页面诊断
    if (isVarietiesPage) {
        console.group('苹果品种页面诊断');
        
        // 检查关键元素
        const searchInput = document.getElementById('searchInput');
        console.log('找到搜索输入框(#searchInput):', !!searchInput);
        
        const filterTags = document.querySelectorAll('.filter-tag');
        console.log('找到标签按钮(filter-tag):', filterTags.length);
        
        // 检查苹果卡片
        const appleCards = document.querySelectorAll('.apple-card');
        console.log('找到苹果卡片(apple-card):', appleCards.length);
        
        // 检查高级筛选
        const advancedPanel = document.getElementById('advancedFilterPanel');
        console.log('找到高级筛选面板:', !!advancedPanel);
        
        // 检查初始化状态
        console.log('initAppleVarietiesFilter函数存在:', typeof initAppleVarietiesFilter === 'function');
        
        console.groupEnd();
    }
    
    // 测试一次筛选功能
    setTimeout(function() {
        try {
            if (isRecipePage && typeof filterRecipes === 'function') {
                console.log('尝试调用 filterRecipes 函数...');
                filterRecipes();
            } else if (isVarietiesPage && typeof filterAppleVarieties === 'function') {
                console.log('尝试调用 filterAppleVarieties 函数...');
                filterAppleVarieties();
            }
        } catch (error) {
            console.error('尝试筛选时出错:', error);
        }
    }, 1000);
});

// 添加季节切换调试功能

// 打印当前季节信息
function debugSeasonalTheme() {
    console.group('季节主题调试信息');
    
    // 获取当前季节
    const userSeason = localStorage.getItem('userSeasonPreference');
    const month = new Date().getMonth();
    let systemSeason;
    
    if (month >= 2 && month <= 4) systemSeason = 'spring';
    else if (month >= 5 && month <= 7) systemSeason = 'summer';
    else if (month >= 8 && month <= 10) systemSeason = 'autumn';
    else systemSeason = 'winter';
    
    console.log('自动检测季节:', systemSeason);
    console.log('用户选择季节:', userSeason || '未设置');
    console.log('最终使用季节:', userSeason || systemSeason);
    
    // 检查DOM元素
    console.log('季节选择器存在:', !!document.getElementById('seasonSelector'));
    console.log('季节状态显示存在:', !!document.getElementById('seasonStatus'));
    console.log('季节横幅存在:', !!document.querySelector('.header-banner'));
    console.log('季节横幅描述存在:', !!document.getElementById('seasonBannerDesc'));
    
    // 检查CSS变量
    const styles = getComputedStyle(document.documentElement);
    console.log('--primary-color:', styles.getPropertyValue('--primary-color'));
    console.log('--secondary-color:', styles.getPropertyValue('--secondary-color'));
    console.log('--background-style:', styles.getPropertyValue('--background-style'));
    
    // 手动切换季节的辅助函数
    console.log('可以使用以下命令手动切换季节:');
    console.log('切换为春季: switchSeason("spring")');
    console.log('切换为夏季: switchSeason("summer")');
    console.log('切换为秋季: switchSeason("autumn")');
    console.log('切换为冬季: switchSeason("winter")');
    
    console.groupEnd();
}

// 手动切换季节的辅助函数
function switchSeason(season) {
    if (!['spring', 'summer', 'autumn', 'winter'].includes(season)) {
        console.error('无效的季节值。有效值: spring, summer, autumn, winter');
        return;
    }
    
    try {
        // 检查applySeasonTheme函数是否可用
        if (typeof applySeasonTheme === 'function') {
            applySeasonTheme(season);
            console.log(`已切换到${season}季节主题`);
        } else {
            // 如果函数不可用，直接尝试通过localStorage触发更新
            localStorage.setItem('userSeasonPreference', season);
            console.log(`已将季节设置保存为 ${season}，请刷新页面查看效果`);
        }
    } catch (error) {
        console.error('切换季节时出错:', error);
    }
}

// 检查季节横幅按钮
function checkSeasonButtons() {
    const buttons = document.querySelectorAll('.season-btn');
    console.group('季节按钮检查');
    console.log(`找到 ${buttons.length} 个季节按钮`);
    
    buttons.forEach(btn => {
        const season = btn.dataset.season;
        console.log(`按钮 ${season}: `, {
            '已绑定点击事件': btn.onclick !== null || Array.from(getEventListeners(btn) || {}).some(e => e.type === 'click'),
            '当前样式类': Array.from(btn.classList),
            '数据属性': btn.dataset
        });
    });
    
    console.groupEnd();
}

// 全局暴露调试函数
window.debugSeasonalTheme = debugSeasonalTheme;
window.switchSeason = switchSeason;
window.checkSeasonButtons = checkSeasonButtons;

// 页面加载时自动运行调试信息
document.addEventListener('DOMContentLoaded', function() {
    console.log('调试工具已加载，可以使用以下命令:');
    console.log('- debugSeasonalTheme(): 显示季节主题调试信息');
    console.log('- switchSeason(season): 切换季节主题 (spring, summer, autumn, winter)');
    console.log('- checkSeasonButtons(): 检查季节按钮状态');
}); 