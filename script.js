// Данные для входа в админку
const ADMIN_USER = { username: 'demo', password: 'demo123' };

let currentAdmin = null;
let orders = JSON.parse(localStorage.getItem('cleaningOrders') || '[]');

// ========== НАВИГАЦИЯ ==========
function showPage(page) {
    const mainPage = document.getElementById('page-main');
    const servicesPage = document.getElementById('page-services');
    const aboutPage = document.getElementById('page-about');
    const contactsPage = document.getElementById('page-contacts');
    const adminPage = document.getElementById('page-admin');
    
    if (mainPage) mainPage.style.display = page === 'main' ? 'block' : 'none';
    if (servicesPage) servicesPage.style.display = page === 'services' ? 'block' : 'none';
    if (aboutPage) aboutPage.style.display = page === 'about' ? 'block' : 'none';
    if (contactsPage) contactsPage.style.display = page === 'contacts' ? 'block' : 'none';
    if (adminPage) adminPage.style.display = page === 'admin' ? 'block' : 'none';
    
    const links = document.querySelectorAll('.nav-link');
    links.forEach((link, i) => link.classList.remove('active'));
    if (page === 'main' && links[0]) links[0].classList.add('active');
    if (page === 'services' && links[1]) links[1].classList.add('active');
    if (page === 'about' && links[2]) links[2].classList.add('active');
    if (page === 'contacts' && links[3]) links[3].classList.add('active');
    if (page === 'admin' && links[4]) links[4].classList.add('active');
    
    if (page === 'admin' && currentAdmin) {
        loadAdminStats();
        renderLeadsList();
    }
}

// ========== АДМИН-ПАНЕЛЬ (ИСПРАВЛЕННАЯ) ==========
function loginToAdmin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === 'demo' && password === 'demo123') {
        currentAdmin = { username: 'demo' };
        const overlay = document.getElementById('adminAuthOverlay');
        const panel = document.getElementById('adminPanelContent');
        if (overlay) overlay.style.display = 'none';
        if (panel) panel.style.display = 'block';
        loadAdminStats();
        renderLeadsList();
    } else {
        alert('❌ Неверный логин или пароль!');
    }
}

function closeAdminLogin() {
    const overlay = document.getElementById('adminAuthOverlay');
    if (overlay) overlay.style.display = 'flex';
    showPage('main');
}

function logoutFromAdmin() {
    currentAdmin = null;
    const overlay = document.getElementById('adminAuthOverlay');
    const panel = document.getElementById('adminPanelContent');
    if (overlay) overlay.style.display = 'flex';
    if (panel) panel.style.display = 'none';
    showPage('main');
}

function closeAdminLogin() {
    const overlay = document.getElementById('adminAuthOverlay');
    const panel = document.getElementById('adminPanelContent');
    if (overlay) overlay.style.display = 'flex';
    if (panel) panel.style.display = 'none';
    showPage('main');
}

function logoutFromAdmin() {
    currentAdmin = null;
    const overlay = document.getElementById('adminAuthOverlay');
    const panel = document.getElementById('adminPanelContent');
    if (overlay) overlay.style.display = 'flex';
    if (panel) panel.style.display = 'none';
    showPage('main');
}

function loadAdminStats() {
    const statsContainer = document.getElementById('adminStats');
    if (!statsContainer) return;
    
    const total = orders.length;
    const newOrders = orders.filter(o => o.status === 'new').length;
    const processed = orders.filter(o => o.status === 'processed').length;
    
    statsContainer.innerHTML = `
        <div class="stat-card-admin"><div class="number">${total}</div><div>Всего заявок</div></div>
        <div class="stat-card-admin"><div class="number">${newOrders}</div><div>Новых</div></div>
        <div class="stat-card-admin"><div class="number">${processed}</div><div>Обработано</div></div>
        <div class="stat-card-admin"><div class="number">${total > 0 ? Math.round(processed / total * 100) : 0}%</div><div>Выполнено</div></div>
    `;
    
    // Обновляем цифры на главной
    const heroOrders = document.getElementById('heroOrders');
    if (heroOrders) heroOrders.innerText = total;
}

function renderLeadsList() {
    const container = document.getElementById('leadsList');
    if (!container) return;
    
    if (orders.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">📭 Нет заявок</div>';
        return;
    }
    
    container.innerHTML = orders.slice().reverse().map(order => `
        <div class="lead-item">
            <div><strong>${escapeHtml(order.name)}</strong><br><small>${escapeHtml(order.phone)}</small></div>
            <div><small>${escapeHtml(order.service || 'Не указана')}</small><br><small>${order.date}</small></div>
            <div>${order.message ? `<small>${escapeHtml(order.message.substring(0, 50))}</small>` : ''}</div>
            <div><span class="lead-status ${order.status === 'new' ? '' : 'processed'}">${order.status === 'new' ? '🆕 Новая' : '✅ Обработана'}</span></div>
            <div>${order.status === 'new' ? `<button class="btn-small" onclick="markProcessed(${order.id})">Обработать</button>` : ''}</div>
        </div>
    `).join('');
}

function markProcessed(id) {
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
        orders[index].status = 'processed';
        localStorage.setItem('cleaningOrders', JSON.stringify(orders));
        loadAdminStats();
        renderLeadsList();
    }
}

function saveSettings() {
    const name = document.getElementById('companyName')?.value;
    const desc = document.getElementById('companyDesc')?.value;
    if (name) localStorage.setItem('companyName', name);
    if (desc) localStorage.setItem('companyDesc', desc);
    alert('Настройки сохранены!');
}

function switchAdminTab(tabName) {
    const statsTab = document.getElementById('adminTabStats');
    const settingsTab = document.getElementById('adminTabSettings');
    const tabs = document.querySelectorAll('.admin-tab');
    
    if (tabName === 'stats') {
        if (statsTab) statsTab.style.display = 'block';
        if (settingsTab) settingsTab.style.display = 'none';
        if (tabs[0]) tabs[0].classList.add('active');
        if (tabs[1]) tabs[1].classList.remove('active');
        loadAdminStats();
        renderLeadsList();
    } else if (tabName === 'settings') {
        if (statsTab) statsTab.style.display = 'none';
        if (settingsTab) settingsTab.style.display = 'block';
        if (tabs[0]) tabs[0].classList.remove('active');
        if (tabs[1]) tabs[1].classList.add('active');
    }
}

// ========== КАЛЬКУЛЯТОР ==========
function calculatePrice() {
    const roomType = document.getElementById('roomType')?.value;
    const area = parseInt(document.getElementById('area')?.value || 50);
    const cleaningType = document.getElementById('cleaningType')?.value;
    const windows = document.getElementById('windows')?.checked;
    const carpet = document.getElementById('carpet')?.checked;
    
    const prices = { 
        apartment: { standard: 120, general: 250, after: 350 }, 
        house: { standard: 150, general: 300, after: 450 }, 
        office: { standard: 90, general: 200, after: 300 } 
    };
    
    let price = 0;
    if (roomType && cleaningType && prices[roomType] && prices[roomType][cleaningType]) {
        price = prices[roomType][cleaningType] * area;
        if (windows) price += 500;
        if (carpet) price += 150 * area;
        if (price < 1500) price = 1500;
    }
    
    const totalPriceSpan = document.getElementById('totalPrice');
    if (totalPriceSpan) totalPriceSpan.innerHTML = price.toLocaleString() + ' ₽';
    return price;
}

// Инициализация калькулятора
function initCalculator() {
    const areaSlider = document.getElementById('area');
    if (areaSlider) {
        areaSlider.addEventListener('input', function() {
            const areaValue = document.getElementById('areaValue');
            if (areaValue) areaValue.innerText = this.value;
            calculatePrice();
        });
    }
    
    const inputs = ['roomType', 'cleaningType', 'windows', 'carpet'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', calculatePrice);
    });
    
    calculatePrice();
}

// ========== ФОРМА ЗАЯВКИ (РАБОТАЕТ ДЛЯ ГОСТЕЙ) ==========
function openOrderForm() {
    const orderForm = document.querySelector('.order-form');
    if (orderForm) orderForm.scrollIntoView({ behavior: 'smooth' });
}

function sendOrderFromCalculator() {
    const price = document.getElementById('totalPrice')?.innerText || '0 ₽';
    const area = document.getElementById('area')?.value || '50';
    const message = `Калькулятор: площадь ${area}м², стоимость ${price}`;
    openOrderFormWithMessage(message);
}

function openOrderFormWithMessage(message) {
    const orderForm = document.querySelector('.order-form');
    const textarea = document.querySelector('.order-form textarea');
    if (orderForm) orderForm.scrollIntoView({ behavior: 'smooth' });
    if (textarea) textarea.value = message;
}

// Обработка отправки формы (гость может отправлять)
function initOrderForm() {
    const mainForm = document.getElementById('mainOrderForm');
    if (!mainForm) return;
    
    mainForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('orderName')?.value.trim();
        const phone = document.getElementById('orderPhone')?.value.trim();
        const service = document.getElementById('orderService')?.value;
        const message = document.getElementById('orderMessage')?.value;
        
        if (!name || !phone) {
            alert('Пожалуйста, заполните имя и телефон!');
            return;
        }
        
        // Создаём новую заявку
        const newOrder = {
            id: Date.now(),
            name: name,
            phone: phone,
            service: service || 'Не указана',
            message: message || '',
            date: new Date().toLocaleString(),
            status: 'new'
        };
        
        orders.push(newOrder);
        localStorage.setItem('cleaningOrders', JSON.stringify(orders));
        
        alert('✅ Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
        
        // Очищаем форму
        mainForm.reset();
        
        // Обновляем админ-панель если открыта
        if (currentAdmin) {
            loadAdminStats();
            renderLeadsList();
        }
    });
}

// ========== ДЕМО-ДАННЫЕ ==========
function initDemoOrders() {
    if (orders.length === 0) {
        orders = [
            { id: 1, name: 'Александр', phone: '+7 (999) 123-45-67', service: 'Уборка квартиры', message: 'Нужна генеральная уборка 2-комнатной квартиры', date: new Date(Date.now() - 86400000).toLocaleString(), status: 'new' },
            { id: 2, name: 'Елена', phone: '+7 (999) 234-56-78', service: 'Уборка офиса', message: 'Офис 150м², срочно', date: new Date(Date.now() - 172800000).toLocaleString(), status: 'new' },
            { id: 3, name: 'Дмитрий', phone: '+7 (999) 345-67-89', service: 'Химчистка', message: 'Диван и ковер', date: new Date(Date.now() - 259200000).toLocaleString(), status: 'processed' }
        ];
        localStorage.setItem('cleaningOrders', JSON.stringify(orders));
    }
}

// ========== HELPER ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== ЗАПУСК ==========
document.addEventListener('DOMContentLoaded', function() {
    initDemoOrders();
    initCalculator();
    initOrderForm();
    loadAdminStats();
    
    // Показываем главную страницу по умолчанию
    showPage('main');
});
