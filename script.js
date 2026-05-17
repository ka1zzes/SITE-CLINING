// Данные для входа в админку
const ADMIN_USER = { username: 'demo', password: 'demo123' };

let currentAdmin = null;
let orders = JSON.parse(localStorage.getItem('cleaningOrders') || '[]');

// ========== НАВИГАЦИЯ ==========
function showPage(page) {
    document.getElementById('page-main').style.display = page === 'main' ? 'block' : 'none';
    document.getElementById('page-services').style.display = page === 'services' ? 'block' : 'none';
    document.getElementById('page-about').style.display = page === 'about' ? 'block' : 'none';
    document.getElementById('page-contacts').style.display = page === 'contacts' ? 'block' : 'none';
    document.getElementById('page-admin').style.display = page === 'admin' ? 'block' : 'none';
    
    const links = document.querySelectorAll('.nav-link');
    links.forEach((link, i) => link.classList.remove('active'));
    if (page === 'main') links[0]?.classList.add('active');
    if (page === 'services') links[1]?.classList.add('active');
    if (page === 'about') links[2]?.classList.add('active');
    if (page === 'contacts') links[3]?.classList.add('active');
    if (page === 'admin') links[4]?.classList.add('active');
    
    if (page === 'admin' && currentAdmin) {
        loadAdminStats();
        renderLeadsList();
    }
}

// ========== АДМИН-ПАНЕЛЬ ==========
function loginToAdmin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
        currentAdmin = { username };
        document.getElementById('adminAuthOverlay').style.display = 'none';
        document.getElementById('adminPanelContent').style.display = 'block';
        loadAdminStats();
        renderLeadsList();
    } else {
        alert('Неверный логин или пароль!');
    }
}

function closeAdminLogin() {
    document.getElementById('adminAuthOverlay').style.display = 'flex';
    document.getElementById('adminPanelContent').style.display = 'none';
    showPage('main');
}

function logoutFromAdmin() {
    currentAdmin = null;
    document.getElementById('adminAuthOverlay').style.display = 'flex';
    document.getElementById('adminPanelContent').style.display = 'none';
    showPage('main');
}

function loadAdminStats() {
    const total = orders.length;
    const newOrders = orders.filter(o => o.status === 'new').length;
    const processed = orders.filter(o => o.status === 'processed').length;
    
    document.getElementById('adminStats').innerHTML = `
        <div class="stat-card-admin"><div class="number">${total}</div><div>Всего заявок</div></div>
        <div class="stat-card-admin"><div class="number">${newOrders}</div><div>Новых</div></div>
        <div class="stat-card-admin"><div class="number">${processed}</div><div>Обработано</div></div>
        <div class="stat-card-admin"><div class="number">${Math.round(total * 0.85)}%</div><div>Конверсия</div></div>
    `;
    
    document.getElementById('heroOrders').innerText = total;
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
            <div><strong>${escapeHtml(order.name)}</strong><br><small>${order.phone}</small></div>
            <div><small>${order.service || 'Не указана'}</small><br><small>${order.date}</small></div>
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
    const name = document.getElementById('companyName').value;
    const desc = document.getElementById('companyDesc').value;
    if (name) localStorage.setItem('companyName', name);
    if (desc) localStorage.setItem('companyDesc', desc);
    alert('Настройки сохранены!');
}

// ========== КАЛЬКУЛЯТОР ==========
function calculatePrice() {
    const roomType = document.getElementById('roomType').value;
    const area = parseInt(document.getElementById('area').value);
    const cleaningType = document.getElementById('cleaningType').value;
    const windows = document.getElementById('windows').checked;
    const carpet = document.getElementById('carpet').checked;
    
    const prices = { apartment: { standard: 120, general: 250, after: 350 }, house: { standard: 150, general: 300, after: 450 }, office: { standard: 90, general: 200, after: 300 } };
    
    let price = prices[roomType][cleaningType] * area;
    if (windows) price += 500;
    if (carpet) price += 150 * area;
    if (price < 1500) price = 1500;
    
    document.getElementById('totalPrice').innerHTML = price.toLocaleString() + ' ₽';
}

const areaSlider = document.getElementById('area');
if (areaSlider) {
    areaSlider.addEventListener('input', function() {
        document.getElementById('areaValue').innerText = this.value;
        calculatePrice();
    });
}

['roomType', 'cleaningType', 'windows', 'carpet'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', calculatePrice);
});

if (document.getElementById('totalPrice')) calculatePrice();

// ========== ФОРМА ЗАЯВКИ ==========
function openOrderForm() {
    document.querySelector('.order-form').scrollIntoView({ behavior: 'smooth' });
}

function sendOrderFromCalculator() {
    const price = document.getElementById('totalPrice').innerText;
    const area = document.getElementById('area').value;
    const message = `Калькулятор: площадь ${area}м², стоимость ${price}`;
    openOrderFormWithMessage(message);
}

function openOrderFormWithMessage(message) {
    document.querySelector('.order-form').scrollIntoView({ behavior: 'smooth' });
    const textarea = document.querySelector('.order-form textarea');
    if (textarea) textarea.value = message;
}

const mainForm = document.getElementById('mainOrderForm');
if (mainForm) {
    mainForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('orderName').value;
        const phone = document.getElementById('orderPhone').value;
        const service = document.getElementById('orderService').value;
        const message = document.getElementById('orderMessage').value;
        
        if (!name || !phone) {
            alert('Заполните имя и телефон!');
            return;
        }
        
        orders.push({
            id: Date.now(),
            name: name,
            phone: phone,
            service: service,
            message: message,
            date: new Date().toLocaleString(),
            status: 'new'
        });
        
        localStorage.setItem('cleaningOrders', JSON.stringify(orders));
        alert('✅ Заявка отправлена! Мы свяжемся с вами.');
        mainForm.reset();
        
        if (currentAdmin) {
            loadAdminStats();
            renderLeadsList();
        }
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
function initDemoOrders() {
    if (orders.length === 0) {
        orders = [
            { id: 1, name: 'Александр', phone: '+7 (999) 123-45-67', service: 'Уборка квартиры', message: 'Нужна генеральная уборка 2-комнатной квартиры', date: '15.05.2024, 14:30', status: 'new' },
            { id: 2, name: 'Елена', phone: '+7 (999) 234-56-78', service: 'Уборка офиса', message: 'Офис 150м², срочно', date: '14.05.2024, 10:15', status: 'new' },
            { id: 3, name: 'Дмитрий', phone: '+7 (999) 345-67-89', service: 'Химчистка', message: 'Диван и ковер', date: '13.05.2024, 16:45', status: 'processed' }
        ];
        localStorage.setItem('cleaningOrders', JSON.stringify(orders));
    }
}

initDemoOrders();
loadAdminStats();
