// 营养成分对比图表功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('营养分析模块初始化中...');
    
    // 找到图表DOM元素
    const chartDom = document.getElementById('nutritionChart');
    if (!chartDom) {
        console.error('营养图表DOM元素未找到!');
        return;
    }

    let myChart;
    try {
        myChart = echarts.init(chartDom);
        console.log('图表初始化成功');
    } catch (error) {
        console.error('图表初始化失败:', error);
        return;
    }

    // 苹果营养数据
    const appleData = {
        '红富士': [85, 70, 75, 80, 65],
        '青苹果': [70, 85, 90, 65, 75],
        '蜜脆苹果': [90, 75, 80, 85, 70],
        '粉红女士': [75, 80, 85, 75, 90],
        '黄元帅': [80, 75, 85, 70, 80],
        '国光': [75, 85, 70, 80, 85],
        '花牛': [85, 80, 75, 85, 75],
        '秦冠': [70, 90, 80, 75, 85]
    };

    // 营养素名称和参考值
    const nutritionInfo = {
        '维生素C': { unit: 'mg', daily: 90 },
        '膳食纤维': { unit: 'g', daily: 25 },
        '抗氧化物': { unit: 'mg', daily: 100 },
        '钾': { unit: 'mg', daily: 2000 },
        '叶酸': { unit: 'μg', daily: 400 }
    };

    const nutritionNames = Object.keys(nutritionInfo);

    const colors = [
        '#FF3B30',
        '#4CD964',
        '#FFCC00',
        '#5AC8FA',
        '#007AFF'
    ];

    // 当前选中的苹果品种
    let currentApple = '红富士';

    // 更新图表
    function updateChart() {
        console.log('更新图表，当前品种:', currentApple);
        const option = {
            title: {
                text: '营养成分雷达图',
                left: 'center',
                textStyle: {
                    fontSize: 16,
                    fontWeight: 'normal'
                }
            },
            tooltip: {
                trigger: 'item'
            },
            radar: {
                radius: '60%',
                indicator: nutritionNames.map(name => ({
                    name: name,
                    max: 100
                }))
            },
            series: [{
                type: 'radar',
                data: [{
                    value: appleData[currentApple],
                    name: currentApple,
                    areaStyle: {
                        color: hexToRgba(colors[0], 0.4)
                    },
                    lineStyle: {
                        color: colors[0]
                    },
                    itemStyle: {
                        color: colors[0]
                    }
                }]
            }]
        };
        myChart.setOption(option);
    }

    // 更新表格
    function updateTable() {
        console.log('更新表格，当前品种:', currentApple);
        const table = document.getElementById('nutritionTable');
        if (!table) {
            console.error('营养表格DOM元素未找到!');
            return;
        }

        table.innerHTML = '';
        
        nutritionNames.forEach((name, index) => {
            const value = appleData[currentApple][index];
            const info = nutritionInfo[name];
            const dailyPercent = Math.round((value / 100) * info.daily);
            
            const row = document.createElement('tr');
            row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            
            row.innerHTML = `
                <td class="p-3 text-left text-gray-700">${name}</td>
                <td class="p-3 text-right text-gray-700">${dailyPercent} ${info.unit}</td>
                <td class="p-3 text-right text-gray-700">${value}%</td>
            `;
            
            table.appendChild(row);
        });
    }

    // 初始化下拉菜单
    function initAppleSelector() {
        console.log('初始化苹果选择器');
        const appleSelector = document.getElementById('appleSelector');
        const appleSelectorDropdown = document.getElementById('appleSelectorDropdown');
        const selectedAppleText = document.getElementById('selectedApple');
        
        if (!appleSelector || !appleSelectorDropdown || !selectedAppleText) {
            console.error('苹果选择器元素未找到:', {
                appleSelector: appleSelector ? '已找到' : '未找到',
                appleSelectorDropdown: appleSelectorDropdown ? '已找到' : '未找到',
                selectedAppleText: selectedAppleText ? '已找到' : '未找到'
            });
            return;
        }
        
        // 设置初始值
        selectedAppleText.textContent = currentApple;
        
        // 生成下拉菜单选项
        appleSelectorDropdown.innerHTML = '';
        Object.keys(appleData).forEach(apple => {
            const button = document.createElement('button');
            button.className = 'w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50';
            button.setAttribute('data-apple', apple);
            button.textContent = apple;
            appleSelectorDropdown.appendChild(button);
            
            button.addEventListener('click', function() {
                currentApple = apple;
                selectedAppleText.textContent = apple;
                appleSelectorDropdown.classList.add('hidden');
                updateChart();
                updateTable();
            });
        });
        
        // 切换下拉菜单
        appleSelector.addEventListener('click', function(e) {
            e.stopPropagation();
            appleSelectorDropdown.classList.toggle('hidden');
        });
        
        // 点击外部关闭下拉菜单
        document.addEventListener('click', function(e) {
            if (!appleSelector.contains(e.target) && !appleSelectorDropdown.contains(e.target)) {
                appleSelectorDropdown.classList.add('hidden');
            }
        });
    }

    // 辅助函数: 将HEX颜色转换为RGBA
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // 响应窗口大小变化
    window.addEventListener('resize', function() {
        if (myChart) {
            myChart.resize();
        }
    });

    // 初始化
    initAppleSelector();
    updateChart();
    updateTable();
}); 