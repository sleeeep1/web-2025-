// 拖拽添加到收藏功能
document.addEventListener('DOMContentLoaded', function() {
  console.log('初始化拖拽收藏功能...');
  
  // 声明全局变量
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  let isDragging = false;
  let lastMouseY = 0;
  let scrollInterval = null;
  
  // 更新收藏按钮状态
  function updateFavoriteButtons() {
    try {
      const favBtns = document.querySelectorAll('.favorite-btn');
      const favoriteTitles = favorites.map(item => item.title);
      
      favBtns.forEach(btn => {
        const card = btn.closest('.apple-card') || btn.closest('.recipe-card');
        if (!card) return;
        
        const title = card.querySelector('h3')?.textContent;
        if (!title) return;
        
        if (favoriteTitles.includes(title)) {
          btn.classList.add('active');
          btn.querySelector('i').classList.remove('ri-heart-line');
          btn.querySelector('i').classList.add('ri-heart-fill');
        } else {
          btn.classList.remove('active');
          btn.querySelector('i').classList.remove('ri-heart-fill');
          btn.querySelector('i').classList.add('ri-heart-line');
        }
      });
    } catch (error) {
      console.error('更新收藏按钮状态失败:', error);
    }
  }
  
  // 收藏区域高亮显示
  function highlightFavoriteArea(show) {
    const favoriteList = document.getElementById('favoriteList');
    if (favoriteList) {
      if (show) {
        favoriteList.classList.add('drag-over');
      } else {
        favoriteList.classList.remove('drag-over');
      }
    }
  }
  
  // 显示提示信息
  function showToast(message) {
    // 移除现有提示
    const existingToast = document.getElementById('toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    // 创建新提示
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-secondary text-white px-4 py-2 rounded shadow-lg z-50 flex items-center gap-2';
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, 10px)';
    toast.style.transition = 'all 0.3s ease';
    toast.innerHTML = `
      <i class="ri-${message.includes('购物车') ? 'shopping-cart-2' : 'heart-3'}-line"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    // 显示提示
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translate(-50%, 0)';
    }, 10);
    
    // 2秒后移除提示
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, 10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
  
  // 创建收藏项元素
  function createFavoriteItem(cardData) {
    const favoriteItem = document.createElement('div');
    favoriteItem.className = 'favorite-item';
    
    // 根据类型添加不同的图标类
    const iconClass = cardData.type === 'recipe' ? 'ri-restaurant-line' : 'ri-apple-fill';
    const typeLabel = cardData.type === 'recipe' ? '食谱' : '品种';
    
    // 增强的收藏项显示
    favoriteItem.innerHTML = `
      <div class="flex bg-white border border-gray-200 rounded-lg overflow-hidden transition-all hover:shadow-md mb-3">
        <div class="w-24 h-24 flex-shrink-0 overflow-hidden relative">
          ${cardData.image ? 
            `<img src="${cardData.image}" alt="${cardData.title}" class="w-full h-full object-cover">` : 
            `<div class="w-full h-full bg-gray-200 flex items-center justify-center">
              <i class="ri-image-line text-gray-400 text-3xl"></i>
            </div>`
          }
          <div class="absolute bottom-1 left-1 bg-primary/80 text-white text-xs px-1.5 py-0.5 rounded">
            <i class="${iconClass} mr-1"></i>${typeLabel}
          </div>
        </div>
        <div class="flex-1 p-3 flex flex-col">
          <div class="flex items-center justify-between mb-1">
            <h4 class="font-medium text-gray-800">${cardData.title}</h4>
            <div class="flex items-center gap-1 text-yellow-500">
              <i class="ri-star-fill"></i>
              <span class="text-gray-700 text-sm">${cardData.rating || '4.5'}</span>
            </div>
          </div>
          ${cardData.description ? 
            `<p class="text-xs text-gray-500 mb-2 line-clamp-2">${cardData.description.substring(0, 80)}${cardData.description.length > 80 ? '...' : ''}</p>` : 
            '<p class="text-xs text-gray-500 mb-2">精选项目</p>'
          }
          <div class="mt-auto flex justify-between items-center">
            ${cardData.tags && cardData.tags.length ? 
              `<div class="flex flex-wrap gap-1">
                ${cardData.tags.slice(0, 2).map(tag => 
                  `<span class="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">${tag}</span>`
                ).join('')}
                ${cardData.tags.length > 2 ? 
                  `<span class="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs">+${cardData.tags.length - 2}</span>` : ''
                }
              </div>` : 
              '<div></div>'
            }
            <a href="${cardData.type === 'recipe' ? 'RecipeDetail.html' : 'DetailsofOneApple.html'}" class="text-primary text-xs hover:underline mr-2">
              查看详情
            </a>
            <button class="remove-favorite w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100" data-title="${cardData.title}">
              <i class="ri-close-line"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    
    // 添加删除功能
    favoriteItem.querySelector('.remove-favorite').addEventListener('click', (e) => {
      const title = e.currentTarget.getAttribute('data-title');
      
      // 从收藏中移除
      const indexToRemove = favorites.findIndex(item => item.title === title);
      if (indexToRemove !== -1) {
        favorites.splice(indexToRemove, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        
        // 更新收藏按钮状态
        updateFavoriteButtons();
        
        // 显示删除成功的提示
        showToast(`已从收藏中移除"${title}"`);
        
        // 添加删除动画
        favoriteItem.style.opacity = '0';
        favoriteItem.style.transform = 'translateX(20px)';
        favoriteItem.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
          // 重新渲染收藏列表
          updateFavoritesDisplay();
        }, 300);
      }
      
      e.stopPropagation(); // 阻止事件冒泡
    });
    
    return favoriteItem;
  }
  
  // 更新收藏列表显示
  function updateFavoritesDisplay() {
    console.log('执行updateFavoritesDisplay函数，当前收藏数:', favorites.length);
    const favoriteList = document.getElementById('favoriteList');
    if (!favoriteList) {
      console.error('找不到favoriteList元素');
      return;
    }
    
    // 确保从最新的localStorage读取数据
    try {
      const latestFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (latestFavorites.length !== favorites.length) {
        console.log('从localStorage更新了收藏数据，原数量:', favorites.length, '新数量:', latestFavorites.length);
        favorites = latestFavorites;
      }
    } catch (e) {
      console.error('读取localStorage失败:', e);
    }
    
    const favoritePlaceholder = favoriteList.querySelector('.favorite-placeholder');
    if (!favoritePlaceholder) {
      console.error('找不到占位符元素');
    }
    
    // 清空当前显示的收藏项（占位符除外）
    const currentItems = favoriteList.querySelectorAll('.favorite-item');
    console.log('当前显示的收藏项数量:', currentItems.length);
    currentItems.forEach(item => item.remove());
    
    // 移除可能存在的"查看全部"链接
    const moreLinks = favoriteList.querySelectorAll('.mt-4.text-center');
    moreLinks.forEach(link => link.remove());
    
    console.log('清理后的DOM状态:', favoriteList.innerHTML);
    
    // 如果没有收藏项，显示占位符
    if (favorites.length === 0) {
      if (favoritePlaceholder) {
        favoritePlaceholder.style.display = 'flex';
        console.log('显示占位符');
      }
      return;
    }
    
    // 隐藏占位符
    if (favoritePlaceholder) {
      favoritePlaceholder.style.display = 'none';
      console.log('隐藏占位符');
    }
    
    // 显示所有收藏项
    const allFavorites = [...favorites].sort((a, b) => b.timestamp - a.timestamp);
    
    console.log('排序后的收藏项:', allFavorites.map(f => f.title).join(', '));
    
    allFavorites.forEach(cardData => {
      console.log('创建收藏项:', cardData.title);
      const favoriteItem = createFavoriteItem(cardData);
      favoriteList.appendChild(favoriteItem);
      console.log('已添加收藏项到DOM');
    });
    
    // 添加查看全部链接
    if (favorites.length > 0) {
      const moreItem = document.createElement('div');
      moreItem.className = 'mt-4 text-center';
      moreItem.innerHTML = `
        <a href="Favorites.html" class="text-primary hover:underline">
          在收藏页面管理全部 ${favorites.length} 个收藏项
        </a>
      `;
      favoriteList.appendChild(moreItem);
      console.log('已添加"查看全部"链接');
    }
    
    // 同步到收藏页面
    try {
      // 确保数据格式一致性
      const favoriteData = {
        items: favorites,
        lastUpdated: new Date().toISOString()
      };
      
      // 存储完整的收藏数据
      localStorage.setItem('favoritePageData', JSON.stringify(favoriteData));
      console.log('已同步数据到favoritePageData');
    } catch (error) {
      console.error('同步收藏数据失败:', error);
    }
  }
  
  // 初始化收藏按钮和拖拽功能
  function initDragDrop() {
    console.log('正在初始化收藏功能...');
    
    // 确保从localStorage加载最新的收藏数据
    try {
      favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      console.log('从localStorage加载了收藏数据，数量:', favorites.length);
    } catch (error) {
      console.error('加载收藏数据失败:', error);
      favorites = [];
    }
    
    // 初始化收藏按钮
    const appleCards = document.querySelectorAll('.apple-card');
    const recipeCards = document.querySelectorAll('.recipe-card');
    const favButtons = document.querySelectorAll('.favorite-btn');
    
    console.log('找到苹果卡片:', appleCards.length);
    console.log('找到食谱卡片:', recipeCards.length);
    console.log('找到收藏按钮:', favButtons.length);
    
    // 收藏按钮点击事件
    favButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const card = btn.closest('.apple-card') || btn.closest('.recipe-card');
        if (!card) {
          console.error('找不到卡片元素');
          return;
        }
        
        const title = card.querySelector('h3')?.textContent;
        const description = card.querySelector('p')?.textContent;
        const image = card.querySelector('img')?.src;
        const tagsElements = card.querySelectorAll('[class*="bg-"][class*="-50"]');
        const tags = Array.from(tagsElements).map(el => el.textContent.trim());
        const rating = card.querySelector('.text-yellow-500')?.nextElementSibling?.textContent || '4.5';
        
        if (!title) {
          console.error('卡片缺少标题');
          return;
        }
        
        // 判断卡片类型
        const cardType = card.classList.contains('apple-card') ? 'apple' : 'recipe';
        
        // 检查是否已收藏
        const existingIndex = favorites.findIndex(item => item.title === title);
        
        if (existingIndex === -1) {
          // 添加收藏
          const cardData = {
            title,
            description,
            image,
            tags,
            rating,
            type: cardType,
            timestamp: Date.now()
          };
          
          favorites.push(cardData);
          localStorage.setItem('favorites', JSON.stringify(favorites));
          
          btn.classList.add('active');
          btn.querySelector('i').classList.remove('ri-heart-line');
          btn.querySelector('i').classList.add('ri-heart-fill');
          
          showToast(`已添加"${title}"到收藏`);
          updateFavoritesDisplay();
        } else {
          // 取消收藏
          favorites.splice(existingIndex, 1);
          localStorage.setItem('favorites', JSON.stringify(favorites));
          
          btn.classList.remove('active');
          btn.querySelector('i').classList.remove('ri-heart-fill');
          btn.querySelector('i').classList.add('ri-heart-line');
          
          showToast(`已从收藏中移除"${title}"`);
          updateFavoritesDisplay();
        }
        
        // 同步收藏数据到收藏页面
        const favoriteData = {
          items: favorites,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('favoritePageData', JSON.stringify(favoriteData));
      });
      
      // 收藏按钮拖拽事件
      btn.addEventListener('dragstart', (e) => {
        // 设置拖拽标志
        isDragging = true;
        // 记录初始鼠标位置
        lastMouseY = e.clientY;
        // 突出显示收藏区域
        highlightFavoriteArea(true);
        
        const card = btn.closest('.apple-card') || btn.closest('.recipe-card');
        if (!card) {
          console.error('找不到卡片元素');
          return;
        }
        
        const title = card.querySelector('h3')?.textContent;
        const description = card.querySelector('p')?.textContent;
        const image = card.querySelector('img')?.src;
        const tagsElements = card.querySelectorAll('[class*="bg-"][class*="-50"]');
        const tags = Array.from(tagsElements).map(el => el.textContent.trim());
        const rating = card.querySelector('.text-yellow-500')?.nextElementSibling?.textContent || '4.5';
        
        // 判断卡片类型
        const cardType = card.classList.contains('apple-card') ? 'apple' : 'recipe';
        
        const cardData = {
          title,
          description,
          image,
          tags,
          rating,
          type: cardType,
          timestamp: Date.now()
        };
        
        console.log('开始拖拽收藏按钮, 数据:', cardData);
        
        // 使用多种格式传输数据
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('application/json', JSON.stringify(cardData));
        e.dataTransfer.setData('text/plain', JSON.stringify(cardData));
        
        // 添加视觉反馈
        btn.classList.add('dragging');
        card.style.opacity = '0.8';
        
        // 创建拖拽提示
        const dragTip = document.createElement('div');
        dragTip.id = 'dragTip';
        dragTip.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/75 text-white px-4 py-2 rounded-full text-sm z-50 pointer-events-none flex items-center gap-2';
        dragTip.innerHTML = `<i class="ri-drag-move-line"></i>拖至"我的收藏"区域`;
        document.body.appendChild(dragTip);
        
        // 滚动页面到收藏区域位置附近
        const favoriteList = document.getElementById('favoriteList');
        if (favoriteList) {
          const favoriteRect = favoriteList.getBoundingClientRect();
          if (favoriteRect.top < 0 || favoriteRect.bottom > window.innerHeight) {
            // 如果收藏区域不在视口内，滚动到适当位置
            const scrollTo = favoriteList.offsetTop - 150;
            window.scrollTo({
              top: scrollTo,
              behavior: 'smooth'
            });
          }
        }
      });
      
      // 收藏按钮拖拽结束事件
      btn.addEventListener('dragend', () => {
        // 取消拖拽标志
        isDragging = false;
        
        // 清除自动滚动
        if (scrollInterval) {
          clearInterval(scrollInterval);
          scrollInterval = null;
        }
        // 取消突出显示
        highlightFavoriteArea(false);
        const card = btn.closest('.apple-card') || btn.closest('.recipe-card');
        btn.classList.remove('dragging');
        if (card) card.style.opacity = '1';
        
        // 移除拖拽提示
        const dragTip = document.getElementById('dragTip');
        if (dragTip) dragTip.remove();
      });
    });
  
    // 使整个苹果卡片和食谱卡片可拖动（不仅是收藏按钮）
    [...appleCards, ...recipeCards].forEach(card => {
      card.setAttribute('draggable', 'true');
      
      card.addEventListener('dragstart', (e) => {
        // 防止与收藏按钮的拖拽事件冲突
        if (e.target.closest('.favorite-btn')) return;
        
        // 设置拖拽标志
        isDragging = true;
        // 记录初始鼠标位置
        lastMouseY = e.clientY;
        // 突出显示收藏区域
        highlightFavoriteArea(true);
        
        const cardType = card.classList.contains('apple-card') ? 'apple' : 'recipe';
        const title = card.querySelector('h3')?.textContent;
        const tagsElements = card.querySelectorAll('[class*="bg-"][class*="-50"]');
        const tags = Array.from(tagsElements).map(el => el.textContent.trim());
        const rating = card.querySelector('.text-yellow-500')?.nextElementSibling?.textContent || '4.5';
        const description = card.querySelector('p')?.textContent || '';
        const image = card.querySelector('img')?.src || '';
        
        if (!title) {
          console.error('卡片缺少标题');
          return;
        }
        
        const cardData = {
          title,
          image,
          description,
          tags,
          rating,
          type: cardType,
          timestamp: Date.now()
        };
        
        console.log('开始拖拽卡片, 数据:', cardData);
        
        // 使用明确的数据格式设置
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('application/json', JSON.stringify(cardData));
        e.dataTransfer.setData('text/plain', JSON.stringify(cardData));
        
        // 添加视觉反馈
        card.classList.add('dragging-card');
        card.style.opacity = '0.6';
        
        // 显示拖拽提示
        const dragTip = document.createElement('div');
        dragTip.id = 'dragTip';
        dragTip.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/75 text-white px-4 py-2 rounded-full text-sm z-50 pointer-events-none flex items-center gap-2';
        dragTip.innerHTML = `<i class="ri-drag-move-line"></i>拖至"我的收藏"区域`;
        document.body.appendChild(dragTip);
        
        // 自定义拖拽图像
        try {
          const dragImage = new Image();
          dragImage.src = card.querySelector('img')?.src || '';
          if (dragImage.src) {
            dragImage.style.width = '50px';
            dragImage.style.height = '50px';
            dragImage.style.borderRadius = '8px';
            dragImage.style.objectFit = 'cover';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 25, 25);
            
            // 500ms后移除拖拽图像
            setTimeout(() => {
              document.body.removeChild(dragImage);
            }, 500);
          }
        } catch (error) {
          console.error('设置拖拽图像失败:', error);
        }
      });
      
      card.addEventListener('dragend', () => {
        // 取消拖拽标志
        isDragging = false;
        // 清除滚动间隔
        if (scrollInterval) {
          clearInterval(scrollInterval);
          scrollInterval = null;
        }
        // 取消突出显示
        highlightFavoriteArea(false);
        card.classList.remove('dragging-card');
        card.style.opacity = '1';
        
        // 移除拖拽提示
        const dragTip = document.getElementById('dragTip');
        if (dragTip) dragTip.remove();
      });
    });
  
    // 设置收藏列表的拖放事件
    const favoriteList = document.getElementById('favoriteList');
    if (favoriteList) {
      // 添加调试输出，监控拖拽事件
      console.log('注册收藏列表拖放事件');
      
      favoriteList.addEventListener('dragenter', (e) => {
        e.preventDefault();
        console.log('拖拽进入收藏区域');
      });
      
      favoriteList.addEventListener('dragover', (e) => {
        e.preventDefault();
        // 打印一次即可，避免控制台日志过多
        // console.log('拖拽在收藏区域上方');
        
        favoriteList.classList.add('drag-over');
        
        // 可以根据拖动位置添加更多的视觉反馈
        const rect = favoriteList.getBoundingClientRect();
        const mouseY = e.clientY - rect.top;
        const percentage = mouseY / rect.height;
        
        // 根据鼠标位置改变背景颜色渐变
        favoriteList.style.background = `linear-gradient(to bottom, rgba(255, 59, 48, 0.05) ${percentage * 100}%, #f9fafb ${percentage * 100}%)`;
      });
      
      favoriteList.addEventListener('dragleave', () => {
        favoriteList.classList.remove('drag-over');
        // 恢复原始背景
        favoriteList.style.background = '#f9fafb';
      });
      
      favoriteList.addEventListener('drop', (e) => {
        e.preventDefault();
        console.log('收到drop事件'); // 添加日志
        
        // 确保拖拽结束后取消标志
        isDragging = false;
        // 清除滚动间隔
        if (scrollInterval) {
          clearInterval(scrollInterval);
          scrollInterval = null;
        }
        // 取消突出显示
        highlightFavoriteArea(false);
        favoriteList.classList.remove('drag-over');
        // 恢复原始背景
        favoriteList.style.background = '#f9fafb';
        
        // 获取拖拽的数据（尝试多种格式）
        const dataTransfer = e.dataTransfer;
        let dataText = dataTransfer.getData('application/json');
        
        if (!dataText) {
          dataText = dataTransfer.getData('text/plain');
          console.log('使用text/plain格式获取数据');
        } else {
          console.log('使用application/json格式获取数据');
        }
        
        console.log('拖拽数据:', dataText); // 添加日志
        
        if (!dataText) {
          console.error('没有获取到拖拽数据');
          showToast('拖拽失败：无法获取项目数据');
          return;
        }
        
        try {
          const cardData = JSON.parse(dataText);
          console.log('解析后的卡片数据:', cardData, '类型:', typeof cardData); // 添加日志
          
          if (!cardData || !cardData.title) {
            console.error('卡片数据不完整');
            showToast('拖拽失败：数据不完整');
            return;
          }
          
          // 检查是否已经收藏了该项目
          const existingIndex = favorites.findIndex(item => item.title === cardData.title);
          console.log('是否已存在:', existingIndex !== -1); // 添加日志
          
          if (existingIndex === -1) {
            // 如果未收藏，则添加
            favorites.push(cardData);
            console.log('已添加到收藏数组, 当前收藏数:', favorites.length); // 添加日志
            
            localStorage.setItem('favorites', JSON.stringify(favorites));
            console.log('已保存到localStorage'); // 添加日志
            
            // 强制直接更新DOM显示
            const favoriteItem = createFavoriteItem(cardData);
            const favoritePlaceholder = favoriteList.querySelector('.favorite-placeholder');
            if (favoritePlaceholder) {
              favoritePlaceholder.style.display = 'none';
            }
            favoriteList.appendChild(favoriteItem);
            console.log('已直接添加项目到DOM');
            
            // 更新收藏按钮状态
            updateFavoriteButtons();
            
            // 添加炫酷的添加成功动画效果
            const successAnimation = document.createElement('div');
            successAnimation.className = 'fixed z-50 pointer-events-none';
            successAnimation.style.left = `${e.clientX}px`;
            successAnimation.style.top = `${e.clientY}px`;
            successAnimation.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            successAnimation.style.opacity = '1';
            successAnimation.innerHTML = `<div class="text-primary text-3xl"><i class="ri-heart-fill"></i></div>`;
            document.body.appendChild(successAnimation);
            
            // 执行动画
            setTimeout(() => {
              const favoriteTarget = document.querySelector('header a[href="Favorites.html"]');
              if (favoriteTarget) {
                const targetRect = favoriteTarget.getBoundingClientRect();
                successAnimation.style.left = `${targetRect.left + targetRect.width/2}px`;
                successAnimation.style.top = `${targetRect.top + targetRect.height/2}px`;
                successAnimation.style.transform = 'scale(0.5)';
                
                setTimeout(() => {
                  successAnimation.style.opacity = '0';
                  setTimeout(() => {
                    successAnimation.remove();
                  }, 300);
                }, 500);
              } else {
                successAnimation.style.opacity = '0';
                successAnimation.style.transform = 'scale(1.5)';
                setTimeout(() => {
                  successAnimation.remove();
                }, 300);
              }
            }, 50);
            
            // 显示添加收藏的提示
            showToast(`已添加 ${cardData.title} 到收藏`);
            
            // 同步收藏数据到收藏页面，使用完整的数据格式
            const favoriteData = {
              items: favorites,
              lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('favoritePageData', JSON.stringify(favoriteData));
            console.log('已同步到favoritePageData'); // 添加日志
            
            // 延迟500ms后再全面刷新显示，确保DOM已经完全更新
            setTimeout(() => {
              updateFavoritesDisplay();
            }, 500);
          } else {
            // 如果已收藏，显示提示
            showToast(`${cardData.title} 已在收藏中`);
          }
        } catch (error) {
          console.error('解析拖拽数据失败:', error, '原始数据:', dataText);
          showToast('拖拽失败：数据格式错误');
        }
      });
    }
  }
  
  // 确保DOM完全加载后再初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM加载完成，初始化收藏功能');
      initDragDrop();
      
      // 更新收藏按钮状态
      updateFavoriteButtons();
      
      // 初始加载收藏项
      setTimeout(() => {
        console.log('DOM加载延迟后更新收藏显示');
        updateFavoritesDisplay();
      }, 100);
    });
  } else {
    console.log('DOM已加载，立即初始化收藏功能');
    initDragDrop();
    
    // 更新收藏按钮状态
    updateFavoriteButtons();
    
    // 初始加载收藏项
    updateFavoritesDisplay();
  }
  
  // 处理窗口滚动时的拖拽提示
  window.addEventListener('scroll', function() {
    if (isDragging) {
      // 移动拖拽提示
      const dragTip = document.getElementById('dragTip');
      if (dragTip) {
        dragTip.style.top = '50%';
      }
    }
  });
  
  // 添加当用户开始拖拽时自动显示收藏区域的功能
  document.addEventListener('dragover', function(e) {
    if (isDragging) {
      e.preventDefault(); // 允许放置
      
      // 确保收藏区域在视口内
      const favoriteList = document.getElementById('favoriteList');
      if (favoriteList) {
        const favoriteRect = favoriteList.getBoundingClientRect();
        
        // 如果收藏区域不在视口或只有一小部分在视口内
        if (favoriteRect.bottom < 100 || favoriteRect.top > window.innerHeight - 100) {
          // 滚动到收藏区域
          const scrollToY = window.scrollY + favoriteRect.top - window.innerHeight / 2 + favoriteRect.height / 2;
          window.scrollTo({
            top: scrollToY,
            behavior: 'smooth'
          });
        }
        
        // 如果拖拽距离收藏区域较近，增加高亮效果
        const distance = Math.min(
          Math.abs(e.clientY - favoriteRect.top),
          Math.abs(e.clientY - favoriteRect.bottom)
        );
        
        if (distance < 100) {
          favoriteList.classList.add('drag-over');
        } else {
          favoriteList.classList.remove('drag-over');
        }
      }
    }
  });
}); 