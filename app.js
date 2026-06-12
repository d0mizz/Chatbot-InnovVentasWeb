/**
 * ═══════════════════════════════════════════════════════════
 *  InnovVentas — app.js
 *  Módulos: Productos · Carrito · Chatbot · Gráficos · UI
 *  Autor: InnovVentas Dev Team
 *  Versión: 1.0.0
 * ═══════════════════════════════════════════════════════════
 *
 *  ESTRUCTURA:
 *  1. DATA — Productos y configuración
 *  2. CART — Lógica del carrito (LocalStorage)
 *  3. CATALOG — Renderizado del catálogo
 *  4. CHATBOT — Respuestas simuladas (preparado para Azure)
 *  5. CHARTS — Métricas con Chart.js
 *  6. FORMS — Validación de formulario de contacto
 *  7. UI — Header, scroll, hamburger, countdown
 *  8. INIT — Inicialización de módulos
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   1. DATA — Catálogo de productos
   ─────────────────────────────────────────────────────────
   Estructura preparada para reemplazarse con una llamada
   a una API REST (e.g. fetch('/api/products'))
═══════════════════════════════════════════════════════════ */

/** @type {Product[]} */
const PRODUCTS = [
  {
    id: 1,
    name: 'Laptop Gamer Pro X',
    category: 'Laptops',
    emoji: '💻',
    price: 4599,
    oldPrice: 5299,
    description: 'RTX 4070 · 32 GB RAM · 1 TB NVMe · Intel Core i9 · Pantalla 165 Hz',
    badge: 'Oferta',
    badgeType: 'offer',
    rating: 4.9,
    stock: 8,
  },
  {
    id: 2,
    name: 'Smartphone Nova 15 Pro',
    category: 'Smartphones',
    emoji: '📱',
    price: 2299,
    oldPrice: null,
    description: 'Snapdragon 8 Gen 3 · 256 GB · Cámara 200 MP · 5G · Batería 5000 mAh',
    badge: 'Nuevo',
    badgeType: 'new',
    rating: 4.8,
    stock: 15,
  },
  {
    id: 3,
    name: 'Audífonos SoundMax Pro',
    category: 'Audio',
    emoji: '🎧',
    price: 549,
    oldPrice: 699,
    description: 'ANC premium · 40 h de batería · Hi-Res Audio · Bluetooth 5.3 · Plegable',
    badge: 'Oferta',
    badgeType: 'offer',
    rating: 4.7,
    stock: 22,
  },
  {
    id: 4,
    name: 'Monitor 4K ProDisplay',
    category: 'Monitores',
    emoji: '🖥️',
    price: 1899,
    oldPrice: null,
    description: 'IPS 27" · 4K UHD · 144 Hz · HDR600 · USB-C 90W · 1 ms respuesta',
    badge: null,
    badgeType: null,
    rating: 4.6,
    stock: 5,
  },
  {
    id: 5,
    name: 'Teclado Mecánico Forge',
    category: 'Periféricos',
    emoji: '⌨️',
    price: 389,
    oldPrice: 450,
    description: 'Switches Red · RGB per-key · TKL compacto · Aluminio · Anti-ghosting',
    badge: 'Oferta',
    badgeType: 'offer',
    rating: 4.5,
    stock: 18,
  },
  {
    id: 6,
    name: 'Mouse Gaming Apex X',
    category: 'Periféricos',
    emoji: '🖱️',
    price: 219,
    oldPrice: null,
    description: 'Sensor 36K DPI · 8 botones · RGB · 95 g ultraligero · Polling 8000 Hz',
    badge: 'Nuevo',
    badgeType: 'new',
    rating: 4.8,
    stock: 30,
  },
];

/* ═══════════════════════════════════════════════════════════
   2. CART — Módulo del carrito de compras
   ─────────────────────────────────────────────────────────
   Persiste en LocalStorage bajo la clave 'innovventas_cart'
═══════════════════════════════════════════════════════════ */

const Cart = (() => {
  /** @type {CartItem[]} Estado interno del carrito */
  let items = [];

  const STORAGE_KEY = 'innovventas_cart';

  /** Carga el carrito desde LocalStorage */
  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      items = saved ? JSON.parse(saved) : [];
    } catch {
      items = [];
    }
  }

  /** Persiste el carrito en LocalStorage */
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Cart: no se pudo guardar en LocalStorage', e);
    }
  }

  /** Agrega o incrementa un producto */
  function add(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existing = items.find(i => i.id === productId);
    if (existing) {
      existing.qty++;
    } else {
      items.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, qty: 1 });
    }
    save();
    render();
    animateBadge();
  }

  /** Elimina un producto del carrito */
  function remove(productId) {
    items = items.filter(i => i.id !== productId);
    save();
    render();
  }

  /** Vacía el carrito completo */
  function clear() {
    items = [];
    save();
    render();
  }

  /** Calcula el total */
  function getTotal() {
    return items.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  /** Obtiene la cantidad total de items */
  function getCount() {
    return items.reduce((sum, i) => sum + i.qty, 0);
  }

  /** Anima el badge del carrito */
  function animateBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    badge.classList.add('bump');
    setTimeout(() => badge.classList.remove('bump'), 300);
  }

  /** Renderiza el sidebar del carrito */
  function render() {
    const badge      = document.getElementById('cartBadge');
    const body       = document.getElementById('cartBody');
    const totalEl    = document.getElementById('cartTotal');
    const footerEl   = document.getElementById('cartFooter');

    if (!body) return;

    // Actualiza badge
    const count = getCount();
    if (badge) badge.textContent = count;

    // Total
    if (totalEl) totalEl.textContent = `S/ ${getTotal().toFixed(2)}`;

    // Muestra/oculta footer
    if (footerEl) footerEl.style.display = items.length ? 'flex' : 'none';

    // Renderiza items o estado vacío
    if (items.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <i class="fa-solid fa-cart-shopping"></i>
          <p>Tu carrito está vacío</p>
          <span>Agrega productos para comenzar</span>
        </div>`;
      return;
    }

    body.innerHTML = items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item__emoji">${item.emoji}</div>
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__price">S/ ${(item.price * item.qty).toFixed(2)}</div>
          <div class="cart-item__qty">
            Cantidad: <span>${item.qty}</span>
          </div>
        </div>
        <button class="cart-item__remove" onclick="Cart.remove(${item.id})" aria-label="Eliminar">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `).join('');
  }

  /** Abre el sidebar del carrito */
  function open() {
    document.getElementById('cartSidebar')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /** Cierra el sidebar del carrito */
  function close() {
    document.getElementById('cartSidebar')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('active');
    document.body.style.overflow = '';
  }

  return { load, add, remove, clear, open, close, render, getCount, getTotal };
})();

// Exportar Cart al scope global (necesario para los onclick en HTML)
window.Cart = Cart;

/* ═══════════════════════════════════════════════════════════
   3. CATALOG — Renderizado dinámico del catálogo
═══════════════════════════════════════════════════════════ */

const Catalog = (() => {
  let activeFilter = 'all';

  /** Genera las tarjetas de producto */
  function renderCard(product) {
    const oldPriceHtml = product.oldPrice
      ? `<span class="price__old">S/ ${product.oldPrice.toFixed(2)}</span>`
      : '';

    const badgeHtml = product.badge
      ? `<span class="product-card__badge product-card__badge--${product.badgeType}">${product.badge}</span>`
      : '';

    const stars = '★'.repeat(Math.floor(product.rating)) + (product.rating % 1 ? '½' : '');

    return `
      <article class="product-card" data-id="${product.id}" data-category="${product.category}">
        <div class="product-card__img">
          <span style="font-size:4.5rem">${product.emoji}</span>
          ${badgeHtml}
        </div>
        <div class="product-card__body">
          <div class="product-card__category">${product.category}</div>
          <h3 class="product-card__name">${product.name}</h3>
          <p class="product-card__desc">${product.description}</p>
          <div class="product-card__footer">
            <div class="product-card__price">
              ${oldPriceHtml}
              <span class="price__current">S/ ${product.price.toFixed(2)}</span>
            </div>
            <button
              class="btn-add-cart"
              onclick="Catalog.handleAddToCart(this, ${product.id})"
              aria-label="Agregar ${product.name} al carrito"
            >
              <i class="fa-solid fa-cart-plus"></i> Agregar
            </button>
          </div>
        </div>
      </article>`;
  }

  /** Renderiza el grid según el filtro activo */
  function render(filter = activeFilter) {
    activeFilter = filter;
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const filtered = filter === 'all'
      ? PRODUCTS
      : PRODUCTS.filter(p => p.category === filter);

    // Animación de salida rápida
    grid.style.opacity = '0';
    grid.style.transform = 'translateY(8px)';

    setTimeout(() => {
      grid.innerHTML = filtered.map(renderCard).join('');
      grid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      grid.style.opacity = '1';
      grid.style.transform = 'translateY(0)';
    }, 150);
  }

  /** Genera los botones de filtro dinámicamente */
  function buildFilters() {
    const container = document.getElementById('categoryFilters');
    if (!container) return;

    const categories = [...new Set(PRODUCTS.map(p => p.category))];

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.textContent = cat;
      btn.dataset.filter = cat;
      btn.addEventListener('click', () => {
        container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render(cat);
      });
      container.appendChild(btn);
    });

    // Listener para "Todos"
    container.querySelector('[data-filter="all"]')?.addEventListener('click', () => {
      container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      container.querySelector('[data-filter="all"]').classList.add('active');
      render('all');
    });
  }

  /**
   * Maneja el clic en "Agregar al carrito" con feedback visual
   * @param {HTMLButtonElement} btn
   * @param {number} productId
   */
  function handleAddToCart(btn, productId) {
    Cart.add(productId);
    btn.classList.add('added');
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Agregado';

    setTimeout(() => {
      btn.classList.remove('added');
      btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Agregar';
    }, 1800);
  }

  return { render, buildFilters, handleAddToCart };
})();

// Exportar al scope global
window.Catalog = Catalog;

/* ═══════════════════════════════════════════════════════════
   4. CHATBOT — Asistente IA simulado
   ─────────────────────────────────────────────────────────
   INTEGRACIÓN AZURE BOT SERVICE:
   Para conectar con Azure Bot Framework, reemplazar la
   función getBotResponse() por una llamada al endpoint
   de Direct Line API:

   const DC_SECRET = 'TU_DIRECTLINE_SECRET';
   const DC_ENDPOINT = 'https://directline.botframework.com/v3/directline';

   async function sendToAzure(message) {
     // 1. Iniciar conversación (una sola vez)
     const convRes = await fetch(`${DC_ENDPOINT}/conversations`, {
       method: 'POST',
       headers: { Authorization: `Bearer ${DC_SECRET}` }
     });
     const { conversationId, token } = await convRes.json();

     // 2. Enviar mensaje
     await fetch(`${DC_ENDPOINT}/conversations/${conversationId}/activities`, {
       method: 'POST',
       headers: { Authorization: `Bearer ${DC_SECRET}`, 'Content-Type': 'application/json' },
       body: JSON.stringify({ type: 'message', from: { id: 'user' }, text: message })
     });

     // 3. Recibir respuesta (polling o WebSocket)
     const activitiesRes = await fetch(
       `${DC_ENDPOINT}/conversations/${conversationId}/activities`,
       { headers: { Authorization: `Bearer ${DC_SECRET}` } }
     );
     const { activities } = await activitiesRes.json();
     return activities.filter(a => a.from.id !== 'user').map(a => a.text).join(' ');
   }
═══════════════════════════════════════════════════════════ */

const Chatbot = (() => {
  let isOpen = false;

  /**
   * Respuestas simuladas del bot.
   * Reemplazar con getBotResponse usando Azure Direct Line.
   *
   * @param {string} message - Mensaje del usuario en minúsculas
   * @returns {string} Respuesta del bot
   */
  // ── Configuración Azure Direct Line ──────────────────────
  const DC_SECRET   = 'D3u7khS9lySOgIDnyInKhyteu3jnbMG1g0VbIgWA2zEeBv5Yoh6oJQQJ99CFAC3pKaRAArohAAABAZBS3kLY.FZHmcAjpEDT3I3mG727mrUmTrQJRYDfOsl87eK3d2fEuxvpfDChOJQQJ99CFAC3pKaRAArohAAABAZBS3jkf';
  const DC_ENDPOINT = 'https://directline.botframework.com/v3/directline';

  let azureConversationId = null;

  /** Inicia la conversación con Azure (se llama una sola vez) */
  async function startAzureConversation() {
    const res  = await fetch(`${DC_ENDPOINT}/conversations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${DC_SECRET}` }
    });
    const data = await res.json();
    azureConversationId = data.conversationId;
  }

  /** Envía mensaje a Azure y devuelve la respuesta del bot */
  async function getBotResponse(userMessage) {
    if (!azureConversationId) await startAzureConversation();

    await fetch(`${DC_ENDPOINT}/conversations/${azureConversationId}/activities`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DC_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'message',
        from: { id: 'user1' },
        text: userMessage
      })
    });

    await new Promise(r => setTimeout(r, 1000));

    const res  = await fetch(
      `${DC_ENDPOINT}/conversations/${azureConversationId}/activities`,
      { headers: { Authorization: `Bearer ${DC_SECRET}` } }
    );
    const data = await res.json();

    const botMessages = data.activities.filter(a => a.from.id !== 'user1');
    return botMessages.at(-1)?.text || 'No pude obtener respuesta.';
  }

  /** Respuestas simuladas por palabras clave (fallback local) */
  function getLocalResponse() {
    // Tu clave del canal Direct Line (Azure Portal → tu bot → Canales → Direct Line)
    const DC_SECRET = 'D3u7khS9lySOgIDnyInKhyteu3jnbMG1g0VbIgWA2zEeBv5Yoh6oJQQJ99CFAC3pKaRAArohAAABAZBS3kLY.FZHmcAjpEDT3I3mG727mrUmTrQJRYDfOsl87eK3d2fEuxvpfDChOJQQJ99CFAC3pKaRAArohAAABAZBS3jkf';
    const DC_ENDPOINT = 'https://directline.botframework.com/v3/directline';
      
    let azureConversationId = null;
    let azureToken = null;
      
    // Inicia la conversación con Azure (se llama una sola vez)
    async function startAzureConversation() {
      const res = await fetch(`${DC_ENDPOINT}/conversations`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${DC_SECRET}` }
      });
      const data = await res.json();
      azureConversationId = data.conversationId;
      azureToken = data.token;
    }
    
    // Envía mensaje y recibe respuesta de Azure
    async function getBotResponse(userMessage) {
      if (!azureConversationId) await startAzureConversation();
    
      // Enviar mensaje del usuario
      await fetch(`${DC_ENDPOINT}/conversations/${azureConversationId}/activities`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${DC_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'message',
          from: { id: 'user1' },
          text: userMessage
        })
      });
    
      // Esperar respuesta del bot
      await new Promise(r => setTimeout(r, 1000));
    
      const res = await fetch(
        `${DC_ENDPOINT}/conversations/${azureConversationId}/activities`,
        { headers: { Authorization: `Bearer ${DC_SECRET}` } }
      );
      const data = await res.json();
    
      // Filtra solo los mensajes del bot
      const botMessages = data.activities.filter(a => a.from.id !== 'user1');
      return botMessages.at(-1)?.text || 'No pude obtener respuesta.';
    }
    ;

    // Respuestas por palabras clave
    const responses = [
      {
        keywords: ['laptop', 'laptops', 'portátil', 'notebook', 'computadora'],
        reply: '🖥️ ¡Tenemos laptops para todos los usos! Laptops gamer desde S/ 3,800, profesionales desde S/ 2,500 y de estudio desde S/ 1,800. ¿Te interesa alguna en especial?',
      },
      {
        keywords: ['smartphone', 'celular', 'teléfono', 'móvil', 'iphone', 'android'],
        reply: '📱 Contamos con smartphones de gama alta como el Nova 15 Pro (S/ 2,299) y modelos de gama media desde S/ 899. ¿Cuál es tu presupuesto?',
      },
      {
        keywords: ['audífonos', 'auriculares', 'audio', 'headset', 'headphones'],
        reply: '🎧 Tenemos audífonos con cancelación de ruido activa, modelos gaming y audiófilos. Nuestro top ventas, el SoundMax Pro, está a S/ 549 con 40 h de batería.',
      },
      {
        keywords: ['monitor', 'pantalla', 'display', '4k', 'curvo'],
        reply: '🖥️ Nuestros monitores van desde 24" Full HD hasta 32" 4K. El ProDisplay 4K 27" está disponible a S/ 1,899 con panel IPS y 144 Hz.',
      },
      {
        keywords: ['teclado', 'mecánico', 'keyboard'],
        reply: '⌨️ Tenemos teclados mecánicos con switches Cherry MX, Gateron y Kailh. El Forge está en oferta a S/ 389 con RGB completo.',
      },
      {
        keywords: ['mouse', 'ratón', 'gaming mouse'],
        reply: '🖱️ El Apex X Gaming Mouse es nuestro top ventas: 36K DPI, 8000 Hz de polling y solo 95 g a S/ 219.',
      },
      {
        keywords: ['pago', 'pagos', 'método', 'métodos', 'visa', 'mastercard', 'yape', 'plin', 'tarjeta'],
        reply: '💳 Aceptamos tarjetas Visa y Mastercard (crédito/débito), Yape, Plin, transferencia bancaria y PagoEfectivo. ¡Hasta 36 cuotas sin intereses con tarjetas seleccionadas!',
      },
      {
        keywords: ['envío', 'envios', 'delivery', 'despacho', 'entrega', 'llega'],
        reply: '🚚 Realizamos envíos a todo el Perú. En Lima Metropolitana entregamos en 24-48 h. Para provincias de 3 a 5 días hábiles. El envío es GRATIS en compras mayores a S/ 200.',
      },
      {
        keywords: ['garantía', 'garantias', 'devolución', 'cambio', 'devolver'],
        reply: '🛡️ Todos nuestros productos tienen garantía de fábrica (12-24 meses). Además, ofrecemos 15 días de devolución sin preguntas si el producto tiene defectos.',
      },
      {
        keywords: ['oferta', 'ofertas', 'descuento', 'promo', 'promoción', 'barato'],
        reply: '🔥 ¡Tenemos grandes ofertas activas! Laptops hasta 13% de descuento, audífonos al 21% de descuento y teclados en oferta especial. Revisa la sección "Ofertas" para ver todas.',
      },
      {
        keywords: ['precio', 'precios', 'cuánto', 'cuesta', 'costar', 'costo', 'vale'],
        reply: '💰 Nuestros precios van desde S/ 219 para periféricos hasta S/ 4,599 para laptops gamer tope de gama. ¿Qué tipo de producto buscas y cuál es tu presupuesto?',
      },
      {
        keywords: ['ayuda', 'ayudar', 'asesor', 'asesoría', 'recomendar', 'recomendación', 'consejo'],
        reply: '🤖 ¡Con gusto te asesoro! Para recomendarte el producto ideal, cuéntame: ¿Para qué usarías el equipo (trabajo, gaming, estudio)? ¿Cuál es tu presupuesto aproximado?',
      },
      {
        keywords: ['hola', 'hi', 'buenas', 'buenos días', 'buenas tardes', 'buenas noches', 'saludos'],
        reply: '👋 ¡Hola! Soy el asistente IA de InnovVentas. Estoy aquí para ayudarte a encontrar el producto tecnológico perfecto. ¿En qué puedo ayudarte hoy?',
      },
      {
        keywords: ['gracias', 'thank', 'perfecto', 'genial', 'excelente'],
        reply: '😊 ¡De nada! Fue un placer ayudarte. Si tienes más consultas, aquí estaré. ¡Buen provecho con tu compra!',
      },
      {
        keywords: ['contacto', 'hablar', 'persona', 'humano', 'asesor humano'],
        reply: '📞 Puedes contactar a nuestro equipo al +51 (01) 234-5678, por correo a ventas@innovventas.pe o ir a la sección de Contacto. Atención Lun-Sáb de 9 AM a 7 PM.',
      },
    ];

    // Busca coincidencia de palabras clave
    for (const item of responses) {
      if (item.keywords.some(kw => msg.includes(kw))) {
        return item.reply;
      }
    }

    // Respuesta por defecto
    return '🤔 No estoy seguro de cómo ayudarte con eso. Puedes preguntarme sobre: laptops, smartphones, audífonos, monitores, periféricos, métodos de pago, envíos o garantías. ¿Qué te interesa?';
  }

  /** Formatea la hora actual */
  function getTime() {
    return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  /** Crea y agrega un mensaje al área de chat */
  function appendMessage(text, type) {
    const messagesEl = document.getElementById('chatbotMessages');
    if (!messagesEl) return;

    const msg = document.createElement('div');
    msg.className = `chat-msg chat-msg--${type}`;
    msg.innerHTML = `
      <div class="chat-msg__bubble">${text}</div>
      <div class="chat-msg__time">${getTime()}</div>
    `;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /** Muestra el indicador de escritura y luego la respuesta */
  function showTypingThenReply(userMessage) {
    const messagesEl = document.getElementById('chatbotMessages');
    if (!messagesEl) return;

    // Indicador de typing
    const typing = document.createElement('div');
    typing.className = 'chat-typing';
    typing.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Intenta Azure; si falla usa respuestas locales
    getBotResponse(userMessage)
      .then(response => {
        typing.remove();
        appendMessage(response, 'bot');
      })
      .catch(() => {
        typing.remove();
        const response = getLocalResponse(userMessage);
          function getLocalResponse(msg) {
          
    msg = msg.toLowerCase();
          
    if (
      msg.includes('producto') ||
      msg.includes('productos') ||
      msg.includes('catálogo') ||
      msg.includes('catalogo') ||
      msg.includes('disponible') ||
      msg.includes('tienen')
    ) {
    
      const lista = PRODUCTS.map(p =>
        `• ${p.name} - S/ ${p.price}`
      ).join('<br>');
    
      return `
      🛒 Estos son nuestros productos disponibles:<br><br>
      ${lista}<br><br>
      ¿Quieres información de alguno en específico?
      `;
    }
  
  
    if(msg.includes('laptop')){
      const p = PRODUCTS.find(x => x.category === 'Laptops');
    
      return `
      💻 Tenemos:
      <br>
      ${p.name}
      <br>
      Precio: S/ ${p.price}
      <br>
      ${p.description}
      `;
    }
  
  
    if(msg.includes('audífono') || msg.includes('audio')){
      const p = PRODUCTS.find(x => x.category === 'Audio');
    
      return `
      🎧 ${p.name}
      <br>
      Precio: S/ ${p.price}
      <br>
      ${p.description}
      `;
    }
  
  
    if(msg.includes('monitor')){
      const p = PRODUCTS.find(x => x.category === 'Monitores');
    
      return `
      🖥️ ${p.name}
      <br>
      Precio: S/ ${p.price}
      <br>
      ${p.description}
      `;
    }
  
  
    if(msg.includes('pago')){
      return `
      💳 Aceptamos:
      <br>
      Visa, Mastercard, Yape, Plin y transferencia bancaria.
      `;
    }
  
  
    return `
    🤖 Puedo ayudarte con:
    <br>
    • Productos disponibles
    <br>
    • Precios
    <br>
    • Pagos
    <br>
    • Soporte técnico
    `;
  }
          appendMessage(response, 'bot');
        });
  }

  /** Procesa el envío de un mensaje */
  function send() {
    const input = document.getElementById('chatbotInput');
    if (!input) return;

    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    appendMessage(text, 'user');
    showTypingThenReply(text);
  }

  /** Abre/cierra la ventana del chatbot */
  function toggle() {
    isOpen = !isOpen;
    const win    = document.getElementById('chatbotWindow');
    const badge  = document.getElementById('chatbotBadge');
    const icon   = document.getElementById('chatbotIcon');

    if (isOpen) {
      win?.classList.add('open');
      badge?.classList.add('hidden');
      icon && (icon.className = 'fa-solid fa-xmark');
    } else {
      win?.classList.remove('open');
      icon && (icon.className = 'fa-solid fa-robot');
    }
  }

  /** Cierra el chatbot */
  function close() {
    isOpen = true;
    toggle();
  }

  /** Mensaje de bienvenida inicial */
  function init() {
    setTimeout(() => {
      appendMessage(
        '👋 ¡Hola! Soy el asistente IA de InnovVentas. Estoy aquí para ayudarte a encontrar el producto tecnológico ideal. ¿En qué puedo ayudarte?',
        'bot'
      );
    }, 800);

    // Botón de toggle
    document.getElementById('chatbotToggle')?.addEventListener('click', toggle);
    document.getElementById('chatbotClose')?.addEventListener('click', close);

    // Botón de enviar
    document.getElementById('chatbotSend')?.addEventListener('click', send);

    // Enter para enviar
    document.getElementById('chatbotInput')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') send();
    });

    // Chips de sugerencias
    document.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const input = document.getElementById('chatbotInput');
        if (input) {
          input.value = chip.textContent;
          send();
        }
      });
    });

    // Botones externos para abrir el chat
    document.getElementById('btnOpenChatHeader')?.addEventListener('click', () => {
      if (!isOpen) toggle();
    });
    document.getElementById('btnOpenChatHero')?.addEventListener('click', () => {
      if (!isOpen) toggle();
    });
  }

  return { init, toggle, close };
})();

/* ═══════════════════════════════════════════════════════════
   5. CHARTS — Métricas del impacto IA con Chart.js
═══════════════════════════════════════════════════════════ */

const Charts = (() => {
  // Configuración de colores compartidos
  const palette = {
    primary:  'rgba(0, 102, 255, 1)',
    primaryBg:'rgba(0, 102, 255, 0.15)',
    accent:   'rgba(0, 212, 255, 1)',
    accentBg: 'rgba(0, 212, 255, 0.12)',
    success:  'rgba(0, 230, 118, 1)',
    successBg:'rgba(0, 230, 118, 0.12)',
    muted:    'rgba(136, 146, 176, 0.5)',
    text:     '#8892B0',
    white:    '#E8EAF0',
  };

  // Defaults de Chart.js globales
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: palette.text,
          font: { family: 'Inter', size: 11 },
          boxWidth: 12,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: '#111827',
        borderColor: 'rgba(0, 102, 255, 0.3)',
        borderWidth: 1,
        titleColor: '#E8EAF0',
        bodyColor: '#8892B0',
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: palette.text, font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: palette.text, font: { size: 11 } },
      },
    },
  };

  /** Chart 1: Reducción de carritos abandonados (Bar) */
  function renderAbandon() {
    const ctx = document.getElementById('chartAbandon');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Sin IA (%)',
            data: [72, 68, 70, 74, 71, 73],
            backgroundColor: palette.muted,
            borderRadius: 4,
          },
          {
            label: 'Con IA (%)',
            data: [58, 52, 47, 43, 39, 34],
            backgroundColor: palette.primary,
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        ...defaultOptions,
        plugins: {
          ...defaultOptions.plugins,
          legend: { ...defaultOptions.plugins.legend, position: 'top' },
        },
        scales: {
          ...defaultOptions.scales,
          y: {
            ...defaultOptions.scales.y,
            min: 0,
            max: 100,
            ticks: {
              ...defaultOptions.scales.y.ticks,
              callback: v => v + '%',
            },
          },
        },
      },
    });
  }

  /** Chart 2: Satisfacción del cliente (Line) */
  function renderSatisfaction() {
    const ctx = document.getElementById('chartSatisfaction');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Satisfacción (%)',
            data: [74, 78, 82, 85, 90, 96],
            borderColor: palette.accent,
            backgroundColor: palette.accentBg,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: palette.accent,
            pointRadius: 4,
          },
        ],
      },
      options: {
        ...defaultOptions,
        scales: {
          ...defaultOptions.scales,
          y: {
            ...defaultOptions.scales.y,
            min: 60,
            max: 100,
            ticks: {
              ...defaultOptions.scales.y.ticks,
              callback: v => v + '%',
            },
          },
        },
      },
    });
  }

  /** Chart 3: Tiempo de respuesta (Doughnut) */
  function renderResponse() {
    const ctx = document.getElementById('chartResponse');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Asistente IA', 'Agente Humano'],
        datasets: [
          {
            data: [1.8, 186],
            backgroundColor: [palette.primary, palette.muted],
            borderColor: ['#0A0E1A'],
            borderWidth: 3,
            hoverOffset: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            ...defaultOptions.plugins.legend,
            position: 'bottom',
          },
          tooltip: {
            ...defaultOptions.plugins.tooltip,
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed} segundos`,
            },
          },
        },
      },
    });
  }

  function init() {
    renderAbandon();
    renderSatisfaction();
    renderResponse();
  }

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   6. FORMS — Validación del formulario de contacto
═══════════════════════════════════════════════════════════ */

const Forms = (() => {
  /**
   * Valida un campo y muestra/oculta el mensaje de error
   * @returns {boolean}
   */
  function validateField(inputId, errorId, validator, errorMsg) {
    const input  = document.getElementById(inputId);
    const errEl  = document.getElementById(errorId);
    if (!input || !errEl) return true;

    const valid = validator(input.value.trim());
    input.classList.toggle('error', !valid);
    errEl.textContent = valid ? '' : errorMsg;
    return valid;
  }

  /** Inicializa el formulario de contacto */
  function initContact() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    // Validación en tiempo real
    const fields = [
      { id: 'contactName',    err: 'errName',    fn: v => v.length >= 2,                 msg: 'El nombre debe tener al menos 2 caracteres.' },
      { id: 'contactEmail',   err: 'errEmail',   fn: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Ingresa un correo electrónico válido.' },
      { id: 'contactSubject', err: 'errSubject',  fn: v => v.length >= 4,                msg: 'El asunto debe tener al menos 4 caracteres.' },
      { id: 'contactMsg',     err: 'errMsg',     fn: v => v.length >= 10,               msg: 'El mensaje debe tener al menos 10 caracteres.' },
    ];

    fields.forEach(({ id, err, fn, msg }) => {
      document.getElementById(id)?.addEventListener('blur', () => {
        validateField(id, err, fn, msg);
      });
    });

    // Submit
    form.addEventListener('submit', e => {
      e.preventDefault();

      const allValid = fields.every(({ id, err, fn, msg }) =>
        validateField(id, err, fn, msg)
      );

      if (!allValid) return;

      // TODO: Conectar con endpoint de API (e.g. POST /api/contact)
      Swal.fire({
        icon: 'success',
        title: '¡Mensaje enviado!',
        text: 'Nos pondremos en contacto contigo a la brevedad.',
        background: '#111827',
        color: '#E8EAF0',
        iconColor: '#00E676',
        confirmButtonColor: '#0066FF',
        confirmButtonText: 'Perfecto',
      });

      form.reset();
      fields.forEach(({ id, err }) => {
        document.getElementById(id)?.classList.remove('error');
        const errEl = document.getElementById(err);
        if (errEl) errEl.textContent = '';
      });
    });
  }

  return { initContact };
})();

/* ═══════════════════════════════════════════════════════════
   7. UI — Componentes de interfaz general
═══════════════════════════════════════════════════════════ */

const UI = (() => {
  /** Header: efecto de scroll */
  function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    const observer = new IntersectionObserver(
      ([entry]) => header.classList.toggle('scrolled', !entry.isIntersecting),
      { rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--header-h')} 0px 0px 0px` }
    );

    // Observa el hero
    const hero = document.querySelector('.hero');
    if (hero) observer.observe(hero);

    // Active link en scroll
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(sec => {
        const top = sec.getBoundingClientRect().top;
        if (top <= 80) current = sec.id;
      });
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
      });
    }, { passive: true });
  }

  /** Hamburger para menú móvil */
  function initHamburger() {
    const btn = document.getElementById('hamburger');
    const nav = document.getElementById('mainNav');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      const open = btn.classList.toggle('open');
      nav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Cierra al hacer clic en un link
    nav.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        btn.classList.remove('open');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /** Cuenta regresiva de ofertas */
  function initCountdown() {
    // Fecha objetivo: 7 días desde ahora
    const target = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    function update() {
      const diff = target - Date.now();
      if (diff <= 0) {
        document.getElementById('cdDays').textContent  = '00';
        document.getElementById('cdHours').textContent = '00';
        document.getElementById('cdMins').textContent  = '00';
        document.getElementById('cdSecs').textContent  = '00';
        return;
      }

      const d  = Math.floor(diff / 86400000);
      const h  = Math.floor((diff % 86400000) / 3600000);
      const m  = Math.floor((diff % 3600000)  / 60000);
      const s  = Math.floor((diff % 60000)    / 1000);

      const pad = n => String(n).padStart(2, '0');

      document.getElementById('cdDays').textContent  = pad(d);
      document.getElementById('cdHours').textContent = pad(h);
      document.getElementById('cdMins').textContent  = pad(m);
      document.getElementById('cdSecs').textContent  = pad(s);
    }

    update();
    setInterval(update, 1000);
  }

  /** Carrito: botones de abrir/cerrar */
  function initCartButtons() {
    document.getElementById('cartBtn')?.addEventListener('click', Cart.open);
    document.getElementById('cartClose')?.addEventListener('click', Cart.close);
    document.getElementById('cartOverlay')?.addEventListener('click', Cart.close);

    document.getElementById('clearCartBtn')?.addEventListener('click', () => {
      Swal.fire({
        title: '¿Vaciar carrito?',
        text: 'Se eliminarán todos los productos del carrito.',
        icon: 'warning',
        background: '#111827',
        color: '#E8EAF0',
        iconColor: '#FF6B35',
        confirmButtonColor: '#FF3860',
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        cancelButtonColor: '#1A2236',
      }).then(result => {
        if (result.isConfirmed) Cart.clear();
      });
    });

    document.getElementById('checkoutBtn')?.addEventListener('click', () => {
      // TODO: Conectar con pasarela de pago (e.g. Culqi, PayU, Stripe)
      Swal.fire({
        icon: 'info',
        title: 'Procesando pago',
        text: 'La integración con pasarela de pago estará disponible próximamente.',
        background: '#111827',
        color: '#E8EAF0',
        iconColor: '#0066FF',
        confirmButtonColor: '#0066FF',
        confirmButtonText: 'Entendido',
      });
    });
  }

  /** Animación de entrada al hacer scroll (IntersectionObserver) */
  function initScrollReveal() {
    const els = document.querySelectorAll('.benefit-card, .chart-card, .contact-info-item');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.5s ease both';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach(el => observer.observe(el));
  }

  function init() {
    initHeader();
    initHamburger();
    initCountdown();
    initCartButtons();
    initScrollReveal();
  }

  return { init };
})();

/* ═══════════════════════════════════════════════════════════
   8. INIT — Punto de entrada principal
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Inicializa módulos en orden
  Cart.load();
  Cart.render();

  Catalog.buildFilters();
  Catalog.render('all');

  Chatbot.init();
  Charts.init();
  Forms.initContact();
  UI.init();

  console.log('%c🚀 InnovVentas v1.0.0 — Sistema inicializado', 'color:#00D4FF;font-weight:bold;font-size:13px');
  console.log('%cPreparado para integración con Azure Bot Service', 'color:#8892B0;font-size:11px');
});