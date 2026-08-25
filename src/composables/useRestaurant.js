import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRestaurantApi } from './useRestaurantApi.js'
import { setCheckoutRequest } from './useCheckout.js'

/**
 * Composable que maneja toda la lógica de la vista del Restaurante.
 * MVC: este archivo actúa como el Controlador/Modelo.
 *
 * @param {Function} emit - Función emit del componente para navegación
 * @param {import('vue').ComputedRef<boolean>} isLoggedIn - Estado reactivo de autenticación
 * @returns {object} Estado reactivo y métodos del Restaurante
 */
export function useRestaurant(emit, isLoggedIn) {
  const { fetchMenu } = useRestaurantApi()

  /* ----------------------------------------------------------
     CATEGORÍAS DE COMIDA
     ---------------------------------------------------------- */
  const categories = ref([
    { id: 'all', label: 'Todas', icon: 'grid' },
  ])

  /* ----------------------------------------------------------
     MENU DATA (Modelo) — cargado desde la API
     ---------------------------------------------------------- */
  const menuItems = ref([])
  const menuLoading = ref(false)
  const menuError = ref(null)

  /* ----------------------------------------------------------
     UTILITY — helpers de transformación de la API
     ---------------------------------------------------------- */
  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function getCategoryIcon(name) {
    const n = (name || '').toLowerCase()
    if (n.includes('desayun')) return 'sun'
    if (n.includes('almuerz')) return 'sunset'
    if (n.includes('cena')) return 'moon'
    if (n.includes('ensalad')) return 'leaf'
    if (n.includes('bebida')) return 'coffee'
    return 'grid'
  }

  function transformMenu(apiMenu) {
    const items = []
    for (const cat of apiMenu) {
      const catSlug = slugify(cat.nombre)
      for (const product of cat.productos_menu || []) {
        items.push({
          id: product.id,
          name: product.nombre,
          description: product.descripcion || 'Deliciosa preparación de nuestro restaurante.',
          price: formatPrice(Number(product.precio) || 0),
          category: catSlug,
          image: `https://picsum.photos/seed/${slugify(product.nombre)}/400/300`,
          badge: cat.nombre,
        })
      }
    }
    return items
  }

  async function loadMenu() {
    menuLoading.value = true
    menuError.value = null
    try {
      const apiMenu = await fetchMenu()
      categories.value = [
        { id: 'all', label: 'Todas', icon: 'grid' },
        ...apiMenu.map(cat => ({
          id: slugify(cat.nombre),
          label: cat.nombre,
          icon: getCategoryIcon(cat.nombre),
        })),
      ]
      menuItems.value = transformMenu(apiMenu)
    } catch (err) {
      menuError.value = 'No se pudo cargar el menú'
      console.error('Error loading menu:', err)
    } finally {
      menuLoading.value = false
    }
  }

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
  const searchQuery = ref('')
  const detailQty = ref(1)
  const currentSlide = ref(0)
  const isPaused = ref(false)
  let carouselTimer = null
  let touchStartX = 0

  /* ----------------------------------------------------------
     COMPUTED
     ---------------------------------------------------------- */
  const totalSlides = computed(() => carouselSlides.length)
  const filteredItems = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    let items = menuItems.value
    if (activeCategory.value !== 'all') {
      items = items.filter(item => item.category === activeCategory.value)
    }
    if (q) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.badge.toLowerCase().includes(q)
      )
    }
    return items
  })

  const hasActiveFilters = computed(() => searchQuery.value.trim().length > 0)

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
  function addToOrder(item, qty = 1) {
    if (!item) return
    const amount = Math.max(1, Math.floor(qty) || 1)
    const existing = order.value.find(o => o.id === item.id)
    if (existing) {
      existing.quantity += amount
    } else {
      order.value.push({ ...item, quantity: amount })
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
  const AUTO_INTERVAL = 5000

  function startCarousel() {
    stopCarousel()
    carouselTimer = setInterval(() => {
      if (!isPaused.value) {
        currentSlide.value = (currentSlide.value + 1) % carouselSlides.length
      }
    }, AUTO_INTERVAL)
  }

  function stopCarousel() {
    if (carouselTimer) {
      clearInterval(carouselTimer)
      carouselTimer = null
    }
  }

  function pauseCarousel() {
    isPaused.value = true
  }

  function resumeCarousel() {
    isPaused.value = false
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

  /* --- Touch / swipe support --- */
  function onTouchStart(e) {
    touchStartX = e.changedTouches?.[0]?.clientX ?? 0
  }

  function onTouchEnd(e) {
    const touchEndX = e.changedTouches?.[0]?.clientX ?? 0
    const delta = touchEndX - touchStartX
    const threshold = 50
    if (Math.abs(delta) < threshold) return
    if (delta < 0) {
      nextSlide()
    } else {
      prevSlide()
    }
  }

  /* ----------------------------------------------------------
     METHODS — Navigation
     ---------------------------------------------------------- */
  function setCategory(categoryId) {
    activeCategory.value = categoryId
  }

  function showItemDetail(item) {
    selectedItem.value = item
    detailQty.value = 1
  }

  function closeItemDetail() {
    selectedItem.value = null
  }

  function incrementDetailQty() {
    if (detailQty.value < 20) detailQty.value++
  }

  function decrementDetailQty() {
    if (detailQty.value > 1) detailQty.value--
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

  function goToMyReservations() {
    if (emit) {
      emit('navigate', 'restaurant-reservations')
    }
  }

  /**
   * Cierra el modal de detalle y el panel de orden con la tecla Escape.
   */
  function handleKeydown(e) {
    if (e.key === 'Escape') {
      if (selectedItem.value) {
        closeItemDetail()
      }
      if (showOrderPanel.value) {
        closeOrderPanel()
      }
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

    const itemsPayload = order.value.map((item) => ({
      id: item.id,
      name: item.name,
      price: parsePrice(item.price),
      quantity: item.quantity,
      image: item.image,
    }))

    setCheckoutRequest({
      tipo: 'RESTAURANTE',
      tipoPedido: 'PARA_LLEVAR',
      items: itemsPayload,
      origen: 'restaurant',
    })
    if (emit) {
      emit('navigate', 'checkout')
    }
  }

  function goBackToHome() {
    if (emit) {
      emit('navigate', 'index')
    }
  }

  /* ----------------------------------------------------------
     LIFECYCLE
     ---------------------------------------------------------- */
  onMounted(() => {
    requestAnimationFrame(() => {
      isVisible.value = true
    })
    startCarousel()
    loadMenu()
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    stopCarousel()
    window.removeEventListener('keydown', handleKeydown)
  })

  /* ----------------------------------------------------------
     RETURN
     ---------------------------------------------------------- */
  return {
    // Data
    categories,
    menuItems,
    menuLoading,
    menuError,
    carouselSlides,
    // State
    isVisible,
    activeCategory,
    selectedItem,
    showOrderPanel,
    order,
    currentSlide,
    isPaused,
    searchQuery,
    detailQty,
    // Computed
    filteredItems,
    hasActiveFilters,
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
    pauseCarousel,
    resumeCarousel,
    onTouchStart,
    onTouchEnd,
    // Methods - Navigation
    setCategory,
    showItemDetail,
    closeItemDetail,
    incrementDetailQty,
    decrementDetailQty,
    goToLogin,
    goToReservation,
    goToMyReservations,
    handleReserveClick,
    confirmOrder,
    goBackToHome,
    loadMenu,
    getCategoryIcon,
  }
}
