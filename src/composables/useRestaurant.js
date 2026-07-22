import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * Composable que maneja toda la lógica de la vista del Restaurante.
 * MVC: este archivo actúa como el Controlador/Modelo.
 *
 * @param {Function} emit - Función emit del componente para navegación
 * @param {import('vue').ComputedRef<boolean>} isLoggedIn - Estado reactivo de autenticación
 * @returns {object} Estado reactivo y métodos del Restaurante
 */
export function useRestaurant(emit, isLoggedIn) {
  /* ----------------------------------------------------------
     CATEGORÍAS DE COMIDA
     ---------------------------------------------------------- */
  const categories = [
    { id: 'all', label: 'Todas', icon: 'grid' },
    { id: 'desayunos', label: 'Desayunos', icon: 'sun' },
    { id: 'almuerzos', label: 'Almuerzos', icon: 'sunset' },
    { id: 'cenas', label: 'Cenas', icon: 'moon' },
    { id: 'ensaladas', label: 'Ensaladas', icon: 'leaf' },
    { id: 'bebidas', label: 'Bebidas', icon: 'coffee' },
  ]

  /* ----------------------------------------------------------
     MENU DATA (Modelo)
     ---------------------------------------------------------- */
  const menuItems = [
    // --- DESAYUNOS ---
    {
      id: 1,
      name: 'Desayuno Continental Asogema',
      description: 'Selección de panes artesanales, frutas frescas de temporada, huevos benedictinos con salsa holandesa casera y café gourmet de altura.',
      price: '$18.000',
      category: 'desayunos',
      image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop',
      badge: 'Chef Choice',
    },
    {
      id: 2,
      name: 'Arepa Supreme Asogema',
      description: 'Arepa de chócolo rellena de queso costeño, aguacate, huevo perico y carne desmechada, acompañada de mantequilla de hierbas.',
      price: '$15.000',
      category: 'desayunos',
      image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=300&fit=crop',
      badge: 'Especialidad',
    },
    {
      id: 3,
      name: 'French Toast Caramelizado',
      description: 'Pan brioche artesanal bañado en crema de vainilla, caramelizado a la perfección, servido con frutos rojos y jarabe de arce natural.',
      price: '$16.500',
      category: 'desayunos',
      image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop',
      badge: 'Popular',
    },
    {
      id: 4,
      name: 'Smoothie Bowl Tropical',
      description: 'Base de banano y mango con toppings de granola artesanal, coco tostado, semillas de chía y miel de abeja orgánica.',
      price: '$14.000',
      category: 'desayunos',
      image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop',
      badge: 'Saludable',
    },

    // --- ALMUERZOS ---
    {
      id: 5,
      name: 'Filete Mignon al Vino Tinto',
      description: 'Corte angus premium sellado a la perfección, bañado en demi-glace de vino tinto, puré de papas trufado y espárragos salteados.',
      price: '$42.000',
      category: 'almuerzos',
      image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop',
      badge: 'Plato Estrella',
    },
    {
      id: 6,
      name: 'Risotto de Hongos Porcini',
      description: 'Arroz arborio cremoso cocido a fuego lento con hongos porcini, parmesano reggiano y un toque de trufa negra.',
      price: '$34.000',
      category: 'almuerzos',
      image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400&h=300&fit=crop',
      badge: 'Vegetariano',
    },
    {
      id: 7,
      name: 'Salmón Glaseado con Miel',
      description: 'Salmón noruego glaseado con miel y mostaza dijon, servido sobre cama de quinoa primavera y verduras asadas.',
      price: '$38.000',
      category: 'almuerzos',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      badge: 'Saludable',
    },
    {
      id: 8,
      name: 'Lomo de Cerdo BBQ Artesanal',
      description: 'Lomo de cerdo marinado 24h, glaseado con BBQ ahumada casera, acompañado de coleslaw y papas rostizadas con romero.',
      price: '$32.000',
      category: 'almuerzos',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
      badge: 'BBQ',
    },

    // --- CENAS ---
    {
      id: 9,
      name: 'Cena Degustación 7 Tiempos',
      description: 'Experiencia culinaria completa con 7 platillos de autor seleccionados por nuestro chef ejecutivo, maridaje incluido.',
      price: '$85.000',
      category: 'cenas',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
      badge: 'Experiencia VIP',
    },
    {
      id: 10,
      name: 'Langosta Thermidor',
      description: 'Langosta entera gratinada con salsa thermidor, gratin de papas al gratén y vegetales de temporada salteados.',
      price: '$68.000',
      category: 'cenas',
      image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=400&h=300&fit=crop',
      badge: 'Premium',
    },
    {
      id: 11,
      name: 'Pasta Alfredo con Camarones',
      description: 'Fettuccine artesanal en cremosa salsa alfredo con camarones saltados, ajo, perejil y queso parmesano envejecido.',
      price: '$36.000',
      category: 'cenas',
      image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop',
      badge: 'Clásico',
    },
    {
      id: 12,
      name: 'Cordero al Merlot',
      description: 'Pierna de cordero braseada 6 horas en merlot, servida con gnocchi de espinaca y reducción de vino tinto.',
      price: '$45.000',
      category: 'cenas',
      image: 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=400&h=300&fit=crop',
      badge: 'Chef Choice',
    },

    // --- ENSALADAS ---
    {
      id: 13,
      name: 'Ensalada César Gourmet',
      description: 'Lechuga romana fresca, croutons de pan artesanal, parmesano en lascas y aderezo césar clásico con anchoas y limón.',
      price: '$18.000',
      category: 'ensaladas',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
      badge: 'Clásica',
    },
    {
      id: 14,
      name: 'Ensalada de Quinoa y Aguacate',
      description: 'Quinoa tricolor, aguacate fresco, mango, pepino, menta y vinagreta de maracuyá con un toque de jengibre.',
      price: '$20.000',
      category: 'ensaladas',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      badge: 'Vegana',
    },
    {
      id: 15,
      name: 'Ensalada Mediterránea',
      description: 'Mezcla de lechugas, tomates cherry, aceitunas kalamata, queso feta, cebolla morada y aderezo de limón y orégano.',
      price: '$19.000',
      category: 'ensaladas',
      image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
      badge: 'Light',
    },
    {
      id: 16,
      name: 'Ensalada de Pollo Teriyaki',
      description: 'Tiras de pollo glaseado en teriyaki casero, mezcla de greens, almendras tostadas, arándanos y vinagreta oriental.',
      price: '$22.000',
      category: 'ensaladas',
      image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&h=300&fit=crop',
      badge: 'Popular',
    },

    // --- BEBIDAS ---
    {
      id: 17,
      name: 'Margarita Asogema',
      description: 'Tequila reposado, licor de naranja, jugo de limón fresco, sal de mar y un toque de hibisco.',
      price: '$15.000',
      category: 'bebidas',
      image: 'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9?w=400&h=300&fit=crop',
      badge: 'Cóctel Estrella',
    },
    {
      id: 18,
      name: 'Vino de la Casa',
      description: 'Selección exclusiva de vinos chilenos y argentinos. Pregunta a nuestro sommelier por el maridaje perfecto.',
      price: '$22.000',
      category: 'bebidas',
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&h=300&fit=crop',
      badge: 'Premium',
    },
    {
      id: 19,
      name: 'Limonada Natural',
      description: 'Limonada fresca hecha con limones orgánicos, hierbabuena y un toque de miel de abeja.',
      price: '$8.000',
      category: 'bebidas',
      image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop',
      badge: 'Refrescante',
    },
    {
      id: 20,
      name: 'Café Especial Asogema',
      description: 'Café de altura colombiano preparado en método Chemex, con notas a caramelo y chocolate oscuro.',
      price: '$7.000',
      category: 'bebidas',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
      badge: 'Gourmet',
    },
    {
      id: 21,
      name: 'Smoothie de Mango y Maracuyá',
      description: 'Smoothie cremoso de mango fresco y maracuyá, endulzado naturalmente y servido bien frío.',
      price: '$10.000',
      category: 'bebidas',
      image: 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400&h=300&fit=crop',
      badge: 'Natural',
    },
  ]

  /* ----------------------------------------------------------
     CAROUSEL DATA
     ---------------------------------------------------------- */
  const carouselSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=600&fit=crop',
      title: 'Alta Cocina',
      subtitle: 'Platillos de autor con ingredientes premium',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1200&h=600&fit=crop',
      title: 'Cortes Premium',
      subtitle: 'Los mejores cortes angus seleccionados por nuestro chef',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=1200&h=600&fit=crop',
      title: 'Maridaje Perfecto',
      subtitle: 'Vinos y licores seleccionados para cada platillo',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=1200&h=600&fit=crop',
      title: 'Frescura del Mar',
      subtitle: 'Pescados y mariscos traídos diariamente',
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=1200&h=600&fit=crop',
      title: 'Desayunos Exclusivos',
      subtitle: 'Comienza tu día con una experiencia gastronómica única',
    },
  ]

  /* ----------------------------------------------------------
     STATE
     ---------------------------------------------------------- */
  const isVisible = ref(false)
  const activeCategory = ref('all')
  const selectedItem = ref(null)
  const showOrderPanel = ref(false)
  const order = ref([])
  const currentSlide = ref(0)
  let carouselTimer = null

  /* ----------------------------------------------------------
     COMPUTED
     ---------------------------------------------------------- */
  const totalSlides = computed(() => carouselSlides.length)
  const filteredItems = computed(() => {
    if (activeCategory.value === 'all') {
      return menuItems
    }
    return menuItems.filter(item => item.category === activeCategory.value)
  })

  const orderCount = computed(() => {
    return order.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const orderTotal = computed(() => {
    return order.value.reduce((sum, item) => sum + (parsePrice(item.price) * item.quantity), 0)
  })

  /* ----------------------------------------------------------
     UTILITY — parse price string like '$18.000' to number
     ---------------------------------------------------------- */
  function parsePrice(priceStr) {
    return parseInt(priceStr.replace(/[$.]/g, ''), 10)
  }

  /* ----------------------------------------------------------
     METHODS — Order / Cart
     ---------------------------------------------------------- */
  function addToOrder(item) {
    const existing = order.value.find(o => o.id === item.id)
    if (existing) {
      existing.quantity++
    } else {
      order.value.push({ ...item, quantity: 1 })
    }
  }

  function removeFromOrder(itemId) {
    order.value = order.value.filter(o => o.id !== itemId)
    if (order.value.length === 0) {
      showOrderPanel.value = false
    }
  }

  function updateQuantity(itemId, qty) {
    if (qty <= 0) {
      removeFromOrder(itemId)
      return
    }
    const item = order.value.find(o => o.id === itemId)
    if (item) {
      item.quantity = qty
    }
  }

  function clearOrder() {
    order.value = []
    showOrderPanel.value = false
  }

  function toggleOrderPanel() {
    showOrderPanel.value = !showOrderPanel.value
  }

  function closeOrderPanel() {
    showOrderPanel.value = false
  }

  function formatPrice(num) {
    return '$' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  /* ----------------------------------------------------------
     METHODS — Carousel
     ---------------------------------------------------------- */
  function startCarousel() {
    stopCarousel()
    carouselTimer = setInterval(() => {
      currentSlide.value = (currentSlide.value + 1) % carouselSlides.length
    }, 5000)
  }

  function stopCarousel() {
    if (carouselTimer) {
      clearInterval(carouselTimer)
      carouselTimer = null
    }
  }

  function goToSlide(index) {
    currentSlide.value = index
    startCarousel()
  }

  function nextSlide() {
    currentSlide.value = (currentSlide.value + 1) % carouselSlides.length
    startCarousel()
  }

  function prevSlide() {
    currentSlide.value = (currentSlide.value - 1 + carouselSlides.length) % carouselSlides.length
    startCarousel()
  }

  /* ----------------------------------------------------------
     METHODS — Navigation
     ---------------------------------------------------------- */
  function setCategory(categoryId) {
    activeCategory.value = categoryId
  }

  function showItemDetail(item) {
    selectedItem.value = item
  }

  function closeItemDetail() {
    selectedItem.value = null
  }

  function goToLogin() {
    if (emit) {
      emit('navigate', 'login')
    }
  }

  function goToReservation() {
    if (emit) {
      emit('navigate', 'table-reservation')
    }
  }

  /**
   * Si el usuario ya inició sesión, va directo a reserva de mesa.
   * Si no, lo lleva al login.
   */
  function handleReserveClick() {
    if (isLoggedIn && isLoggedIn.value) {
      goToReservation()
    } else {
      goToLogin()
    }
  }

  function confirmOrder() {
    if (order.value.length === 0) return

    const itemsSummary = order.value
      .map(item => `  \u2022 ${item.name} x${item.quantity} \u2014 ${formatPrice(parsePrice(item.price) * item.quantity)}`)
      .join('\n')

    alert(
      '\u2705 Orden Confirmada\n\n' +
      'Restaurante Asogema\n' +
      '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n' +
      itemsSummary + '\n' +
      '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n' +
      `Total: ${formatPrice(orderTotal.value)}\n\n` +
      '\u00a1Gracias por tu orden! Tu pedido est\u00e1 siendo preparado.'
    )

    clearOrder()
    goBackToHome()
  }

  function goBackToHome() {
    if (emit) {
      emit('navigate', 'index')
    }
  }

  /* ----------------------------------------------------------
     ICON MAP for categories
     ---------------------------------------------------------- */
  function getCategoryIcon(type) {
    const iconMap = {
      grid: 'grid',
      sun: 'sun',
      sunset: 'sunset',
      moon: 'moon',
      leaf: 'leaf',
      coffee: 'coffee',
    }
    return iconMap[type] || 'grid'
  }

  /* ----------------------------------------------------------
     LIFECYCLE
     ---------------------------------------------------------- */
  onMounted(() => {
    requestAnimationFrame(() => {
      isVisible.value = true
    })
    startCarousel()
  })

  onUnmounted(() => {
    stopCarousel()
  })

  /* ----------------------------------------------------------
     RETURN
     ---------------------------------------------------------- */
  return {
    // Data
    categories,
    menuItems,
    carouselSlides,
    // State
    isVisible,
    activeCategory,
    selectedItem,
    showOrderPanel,
    order,
    currentSlide,
    // Computed
    filteredItems,
    orderCount,
    orderTotal,
    totalSlides,
    // Methods - Order
    addToOrder,
    removeFromOrder,
    updateQuantity,
    clearOrder,
    toggleOrderPanel,
    closeOrderPanel,
    formatPrice,
    // Methods - Carousel
    goToSlide,
    nextSlide,
    prevSlide,
    // Methods - Navigation
    setCategory,
    showItemDetail,
    closeItemDetail,
    goToLogin,
    goToReservation,
    handleReserveClick,
    confirmOrder,
    goBackToHome,
    getCategoryIcon,
  }
}
