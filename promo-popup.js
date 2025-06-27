/**
 * 秋季苹果节特惠浮动广告脚本
 * 这个脚本用于在网站多个页面中展示浮动广告
 */

document.addEventListener('DOMContentLoaded', function() {
    // 检查页面中是否已经存在广告HTML结构
    let promoPopup = document.getElementById('promoPopup');
    
    // 如果页面中没有广告结构，则创建一个
    if (!promoPopup) {
        const promoHTML = `
        <div class="promo-popup" id="promoPopup">
            <div class="promo-popup-close" id="closePromo">
                <i class="ri-close-line"></i>
            </div>
            <img src="https://readdy.ai/api/search-image?query=Autumn%20apple%20festival%20with%20variety%20of%20colorful%20apples%20and%20fall%20decorations&width=320&height=160" alt="秋季苹果节" class="promo-popup-image">
            <div class="promo-popup-content">
                <div class="promo-popup-title">
                    <i class="ri-award-line"></i>
                    <span>秋季苹果节特惠</span>
                </div>
                <p class="promo-popup-description">🍎 限时优惠：购买任意3种苹果品种，享受8折优惠！新鲜采摘，数量有限，先到先得！</p>
                <div class="promo-popup-coupon">
                    <span class="promo-popup-code">APPLE2023</span>
                    <span class="promo-popup-copy" id="copyPromoCode">
                        <i class="ri-file-copy-line"></i>
                        复制
                    </span>
                </div>
                <button class="promo-popup-action pulse-animation" id="goShoppingBtn">立即选购</button>
            </div>
        </div>
        `;
        
        // 添加广告HTML到页面
        const promoContainer = document.createElement('div');
        promoContainer.innerHTML = promoHTML;
        document.body.appendChild(promoContainer.firstElementChild);
        
        // 重新获取元素引用
        promoPopup = document.getElementById('promoPopup');
    }
    
    // 获取其他元素
    const closePromo = document.getElementById('closePromo');
    const copyPromoCode = document.getElementById('copyPromoCode');
    const goShoppingBtn = document.getElementById('goShoppingBtn');
    
    // 检查是否已经显示过广告
    const lastShown = localStorage.getItem('promoLastShown');
    const now = new Date().getTime();
    
    console.log('广告上次显示时间:', lastShown ? new Date(parseInt(lastShown)).toLocaleString() : '从未显示');
    
    // 如果从未显示过或者已经过了24小时
    if (!lastShown || (now - parseInt(lastShown)) > 24 * 60 * 60 * 1000) {
        // 5秒后显示广告
        setTimeout(() => {
            console.log('显示广告');
            promoPopup.classList.add('show');
        }, 5000);
    }
    
    // 关闭广告
    closePromo.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('关闭广告');
        promoPopup.classList.remove('show');
        // 记录关闭时间
        localStorage.setItem('promoLastShown', new Date().getTime());
    });
    
    // 复制优惠码
    copyPromoCode.addEventListener('click', () => {
        const couponCode = document.querySelector('.promo-popup-code').textContent;
        navigator.clipboard.writeText(couponCode)
            .then(() => {
                copyPromoCode.innerHTML = '<i class="ri-check-line"></i> 已复制';
                setTimeout(() => {
                    copyPromoCode.innerHTML = '<i class="ri-file-copy-line"></i> 复制';
                }, 2000);
            })
            .catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制优惠码: ' + couponCode);
            });
    });
    
    // 点击立即选购
    goShoppingBtn.addEventListener('click', () => {
        console.log('点击立即选购');
        promoPopup.classList.remove('show');
        
        // 尝试滚动到产品列表
        const appleCard = document.querySelector('.apple-card');
        if (appleCard) {
            window.scrollTo({
                top: appleCard.offsetTop - 100,
                behavior: 'smooth'
            });
        } else {
            // 如果当前页面没有产品，跳转到产品页
            window.location.href = 'DetailsofAppleVarieties.html';
        }
        
        // 记录关闭时间
        localStorage.setItem('promoLastShown', new Date().getTime());
    });
}); 