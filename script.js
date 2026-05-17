// Проверка авторизации для главной страницы
function checkAuthAndRedirect() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Если это главная страница или админка и нет авторизации - перенаправляем на логин
    if ((currentPage === 'index.html' || currentPage === '' || currentPage === '/') && isLoggedIn !== 'true') {
        window.location.href = 'login.html';
    }
}

// Обновление интерфейса пользователя (показываем вход/выход)
function updateUserInterface() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userNameSpan = document.getElementById('userName');
    const authLink = document.getElementById('authLink');
    
    if (userNameSpan && authLink) {
        if (isLoggedIn === 'true') {
            userNameSpan.innerHTML = '👤 admin';
            authLink.innerHTML = '🚪 Выйти';
            authLink.href = '#';
            authLink.onclick = function(e) {
                e.preventDefault();
                logout();
            };
        } else {
            userNameSpan.innerHTML = '👤 гость';
            authLink.innerHTML = '🔐 Войти';
            authLink.href = 'login.html';
            authLink.onclick = null;
        }
    }
}

// Функция выхода
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// Калькулятор стоимости
function calculatePrice() {
    const roomType = document.getElementById('roomType').value;
    const area = parseInt(document.getElementById('area').value);
    const cleaningType = document.getElementById('cleaningType').value;
    const windows = document.getElementById('windows').checked;
    const carpet = document.getElementById('carpet').checked;
    const fridge = document.getElementById('fridge').checked;
    
    const basePrices = {
        apartment: { standard: 120, general: 250, afterrenovation: 350, office: 100 },
        house: { standard: 150, general: 300, afterrenovation: 450, office: 130 },
        office: { standard: 90, general: 200, afterrenovation: 300, office: 80 },
        commercial: { standard: 130, general: 280, afterrenovation: 400, office: 110 }
    };
    
    let price = basePrices[roomType][cleaningType] * area;
    
    if (windows) price += 500;
    if (carpet) price += 150 * area;
    if (fridge) price += 300;
    
    if (price < 1500) price = 1500;
    
    document.getElementById('totalPrice').innerHTML = price.toLocaleString() + ' ₽';
    return price;
}

const areaSlider = document.getElementById('area');
if (areaSlider) {
    areaSlider.addEventListener('input', function() {
        document.getElementById('areaValue').innerText = this.value;
        calculatePrice();
    });
}

const inputs = ['roomType', 'cleaningType', 'windows', 'carpet', 'fridge'];
inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', calculatePrice);
});

if (document.getElementById('totalPrice')) {
    calculatePrice();
}

function sendOrderFromCalculator() {
    const price = document.getElementById('totalPrice').innerText;
    const area = document.getElementById('area').value;
    const roomType = document.getElementById('roomType').options[document.getElementById('roomType').selectedIndex].text;
    const cleaningType = document.getElementById('cleaningType').options[document.getElementById('cleaningType').selectedIndex].text;
    
    const message = `Здравствуйте! Хочу заказать уборку.\nТип помещения: ${roomType}\nПлощадь: ${area} м²\nТип уборки: ${cleaningType}\nРасчетная стоимость: ${price}\nПерезвоните мне для уточнения деталей.`;
    
    openOrderFormWithMessage(message);
}

function openOrderForm() {
    document.querySelector('.order-form').scrollIntoView({behavior: 'smooth'});
}

function openOrderFormWithMessage(message) {
    document.querySelector('.order-form').scrollIntoView({behavior: 'smooth'});
    const textarea = document.querySelector('.order-form textarea');
    if (textarea) textarea.value = message;
}

const mainForm = document.getElementById('mainOrderForm');
if (mainForm) {
    mainForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const message = document.querySelector('.order-form textarea').value;
        
        if (!name || !phone) {
            alert('Пожалуйста, заполните имя и телефон');
            return;
        }
        
        const leads = JSON.parse(localStorage.getItem('cleaningLeads') || '[]');
        leads.push({
            id: Date.now(),
            name: name,
            phone: phone,
            message: message,
            date: new Date().toLocaleString(),
            status: 'new'
        });
        localStorage.setItem('cleaningLeads', JSON.stringify(leads));
        
        alert('✅ Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
        
        mainForm.reset();
    });
}

// Запускаем проверку и обновление интерфейса при загрузке страницы
checkAuthAndRedirect();
updateUserInterface();