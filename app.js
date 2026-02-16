// Telegram Web App
let tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Ma'lumotlar
const categories = [
    { id: 'all', name: 'Barchasi' },
    { id: 'food', name: 'Oziq-ovqat' },
    { id: 'drinks', name: 'Ichimliklar' },
    { id: 'snacks', name: 'Gazaklar' },
    { id: 'household', name: 'Uy-ro\'zg\'or' }
];

const products = [
    { id: 1, name: 'Non', price: 3000, category: 'food', emoji: '🍞' },
    { id: 2, name: 'Sut', price: 8000, category: 'drinks', emoji: '🥛' },
    { id: 3, name: 'Tuxum (10 dona)', price: 15000, category: 'food', emoji: '🥚' },
    { id: 4, name: 'Chips', price: 5000, category: 'snacks', emoji: '🥔' },
    { id: 5, name: 'Sok', price: 6000, category: 'drinks', emoji: '🧃' },
    { id: 6, name: 'Shokolad', price: 12000, category: 'snacks', emoji: '🍫' },
    { id: 7, name: 'Guruch (1kg)', price: 18000, category: 'food', emoji: '🍚' },
    { id: 8, name: 'Suv (1.5L)', price: 3000, category: 'drinks', emoji: '💧' },
    { id: 9, name: 'Moy (1L)', price: 25000, category: 'food', emoji: '🛢️' },
    { id: 10, name: 'Sovun', price: 4000, category: 'household', emoji: '🧼' },
    { id: 11, name: 'Shampo', price: 15000, category: 'household', emoji: '🧴' },
    { id: 12, name: 'Qog\'oz sochiq', price: 8000, category: 'household', emoji: '🧻' }
];

let cart = {};
let currentCategory = 'all';
let selectedPaymentMethod = 'cash';

function renderCategories() {
    const categoriesContainer = document.getElementById('categories');
    if (!categoriesContainer) return;
    
    categoriesContainer.innerHTML = categories.map(cat => `
        <button class="category-btn ${cat.id === currentCategory ? 'active' : ''}" 
                onclick="filterByCategory('${cat.id}')">
            ${cat.name}
        </button>
    `).join('');
}

function filterByCategory(categoryId) {
    currentCategory = categoryId;
    renderCategories();
    renderProducts();
}

function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    const filteredProducts = currentCategory === 'all' 
        ? products 
        : products.filter(p => p.category === currentCategory);
    
    productsGrid.innerHTML = filteredProducts.map(product => {
        const quantity = cart[product.id] || 0;
        return `
            <div class="product-card">
                <div class="product-image">${product.emoji}</div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-price">${formatPrice(product.price)}</div>
                    ${quantity > 0 ? `
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="decreaseQuantity(${product.id})">−</button>
                            <span class="quantity-display">${quantity}</span>
                            <button class="quantity-btn" onclick="increaseQuantity(${product.id})">+</button>
                        </div>
                    ` : `
                        <button class="add-btn" onclick="addToCart(${product.id})">Qo'shish</button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

function formatPrice(price) {
    return `${price.toLocaleString('uz-UZ')} so'm`;
}

function addToCart(productId) {
    cart[productId] = 1;
    updateCart();
    renderProducts();
    hapticFeedback('light');
}

function increaseQuantity(productId) {
    cart[productId] = (cart[productId] || 0) + 1;
    updateCart();
    renderProducts();
    hapticFeedback('light');
}

function decreaseQuantity(productId) {
    if (cart[productId] > 1) {
        cart[productId]--;
    } else {
        delete cart[productId];
    }
    updateCart();
    renderProducts();
    hapticFeedback('light');
}

function updateCart() {
    const cartButton = document.getElementById('cartButton');
    const cartCount = document.getElementById('cartCount');
    
    if (!cartButton || !cartCount) return;
    
    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    cartCount.textContent = totalItems;
    
    if (totalItems > 0) {
        cartButton.disabled = false;
    } else {
        cartButton.disabled = true;
    }
}

function showCart() {
    const productsView = document.getElementById('productsView');
    const cartView = document.getElementById('cartView');
    const cartButton = document.getElementById('cartButton');
    
    if (productsView) productsView.style.display = 'none';
    if (cartView) {
        cartView.classList.add('active');
        cartView.style.display = 'block';
    }
    if (cartButton) cartButton.style.display = 'none';
    
    renderCartItems();
    hapticFeedback('medium');
}

function showProducts() {
    const productsView = document.getElementById('productsView');
    const cartView = document.getElementById('cartView');
    const cartButton = document.getElementById('cartButton');
    
    if (productsView) productsView.style.display = 'block';
    if (cartView) {
        cartView.classList.remove('active');
        cartView.style.display = 'none';
    }
    if (cartButton) cartButton.style.display = 'flex';
    
    hapticFeedback('medium');
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const checkoutSection = document.getElementById('checkoutSection');
    
    if (!cartItemsContainer || !checkoutSection) return;
    
    const cartEntries = Object.entries(cart);
    
    if (cartEntries.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <div>Savatcha bo'sh</div>
            </div>
        `;
        checkoutSection.classList.add('hidden');
        return;
    }
    
    cartItemsContainer.innerHTML = cartEntries.map(([productId, quantity]) => {
        const product = products.find(p => p.id == productId);
        if (!product) return '';
        
        const itemTotal = product.price * quantity;
        
        return `
            <div class="cart-item">
                <div class="cart-item-image">${product.emoji}</div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${product.name}</div>
                    <div class="cart-item-price">${formatPrice(product.price)} × ${quantity} = ${formatPrice(itemTotal)}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="decreaseQuantity(${product.id}); renderCartItems();">−</button>
                        <span class="quantity-display">${quantity}</span>
                        <button class="quantity-btn" onclick="increaseQuantity(${product.id}); renderCartItems();">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    checkoutSection.classList.remove('hidden');
    updateCheckoutSummary();
}

function updateCheckoutSummary() {
    const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
        const product = products.find(p => p.id == id);
        return product ? sum + (product.price * qty) : sum;
    }, 0);
    
    const deliveryFee = 0;
    const total = subtotal + deliveryFee;
    
    const subtotalEl = document.getElementById('subtotal');
    const deliveryFeeEl = document.getElementById('deliveryFee');
    const finalTotalEl = document.getElementById('finalTotal');
    
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (deliveryFeeEl) deliveryFeeEl.textContent = deliveryFee > 0 ? formatPrice(deliveryFee) : 'Bepul';
    if (finalTotalEl) finalTotalEl.textContent = formatPrice(total);
}

function showSuccess() {
    const productsView = document.getElementById('productsView');
    const cartView = document.getElementById('cartView');
    const successView = document.getElementById('successView');
    const cartButton = document.getElementById('cartButton');
    
    if (productsView) productsView.style.display = 'none';
    if (cartView) {
        cartView.classList.remove('active');
        cartView.style.display = 'none';
    }
    if (successView) successView.classList.add('active');
    if (cartButton) cartButton.style.display = 'none';
}

function resetApp() {
    cart = {};
    currentCategory = 'all';
    selectedPaymentMethod = 'cash';
    
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) checkoutForm.reset();
    
    const receiptPreview = document.getElementById('receiptPreview');
    if (receiptPreview) receiptPreview.classList.add('hidden');
    
    const receiptUpload = document.getElementById('receiptUpload');
    if (receiptUpload) receiptUpload.classList.add('hidden');
    
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(m => m.classList.remove('selected'));
    if (paymentMethods.length > 0) paymentMethods[0].classList.add('selected');
    
    updateCart();
    showProducts();
    renderProducts();
    hapticFeedback('medium');
}

function hapticFeedback(type) {
    if (tg.HapticFeedback) {
        if (type === 'light') tg.HapticFeedback.impactOccurred('light');
        else if (type === 'medium') tg.HapticFeedback.impactOccurred('medium');
        else if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
    }
}

// DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // Payment method selection
    const paymentMethods = document.querySelectorAll('.payment-method');
    const receiptUpload = document.getElementById('receiptUpload');
    
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            paymentMethods.forEach(m => m.classList.remove('selected'));
            this.classList.add('selected');
            selectedPaymentMethod = this.dataset.method;
            
            if (receiptUpload) {
                if (selectedPaymentMethod === 'card') {
                    receiptUpload.classList.remove('hidden');
                } else {
                    receiptUpload.classList.add('hidden');
                }
            }
            
            hapticFeedback('light');
        });
    });
    
    // Receipt upload
    const receiptInput = document.getElementById('receiptInput');
    const receiptPreview = document.getElementById('receiptPreview');
    
    if (receiptInput && receiptPreview) {
        receiptInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    receiptPreview.src = e.target.result;
                    receiptPreview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
                hapticFeedback('medium');
            }
        });
    }
    
    // Phone input formatting
    const phoneInput = document.getElementById('phoneInput');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('998')) {
                value = value.substring(3);
            }
            
            if (value.length > 0) {
                let formatted = '+998 ';
                if (value.length > 0) formatted += value.substring(0, 2);
                if (value.length > 2) formatted += ' ' + value.substring(2, 5);
                if (value.length > 5) formatted += ' ' + value.substring(5, 7);
                if (value.length > 7) formatted += ' ' + value.substring(7, 9);
                
                e.target.value = formatted;
            }
        });
    }
    
    // Form submission
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const phone = document.getElementById('phoneInput').value;
            const address = document.getElementById('addressInput').value;
            const notes = document.getElementById('notesInput').value;
            
            if (!phone || !address) {
                tg.showAlert('Iltimos, barcha majburiy maydonlarni to\'ldiring');
                return;
            }
            
            if (selectedPaymentMethod === 'card') {
                const receipt = document.getElementById('receiptInput').files[0];
                if (!receipt) {
                    tg.showAlert('Iltimos, to\'lov chekini yuklang');
                    return;
                }
            }
            
            const orderData = {
                items: Object.entries(cart).map(([id, qty]) => {
                    const product = products.find(p => p.id == id);
                    return product ? {
                        name: product.name,
                        price: product.price,
                        quantity: qty,
                        total: product.price * qty
                    } : null;
                }).filter(item => item !== null),
                customer: {
                    phone: phone,
                    address: address,
                    notes: notes,
                    telegram_id: tg.initDataUnsafe?.user?.id || 'unknown',
                    username: tg.initDataUnsafe?.user?.username || 'unknown',
                    first_name: tg.initDataUnsafe?.user?.first_name || 'unknown'
                },
                payment: {
                    method: selectedPaymentMethod,
                    hasReceipt: selectedPaymentMethod === 'card'
                },
                total: Object.entries(cart).reduce((sum, [id, qty]) => {
                    const product = products.find(p => p.id == id);
                    return product ? sum + (product.price * qty) : sum;
                }, 0),
                timestamp: new Date().toISOString()
            };
            
            try {
                tg.sendData(JSON.stringify(orderData));
                showSuccess();
                hapticFeedback('success');
            } catch (error) {
                console.error('Xatolik:', error);
                tg.showAlert('Xatolik yuz berdi. Qayta urinib ko\'ring.');
            }
        });
    }
    
    // Initial render
    renderCategories();
    renderProducts();
    updateCart();
});
