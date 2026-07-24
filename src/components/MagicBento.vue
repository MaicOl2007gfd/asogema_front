<script setup>
import { gsap } from 'gsap'
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

const MOBILE_BREAKPOINT = 768

const cardData = [
  { id: 'piscinas', title: 'Piscinas', description: 'Piscinas para adultos y niños', label: 'Recreación', image: 'https://picsum.photos/id/236/600/400' },
  { id: 'canchas', title: 'Canchas Deportivas', description: 'Canchas para fútbol, baloncesto y más', label: 'Deporte', image: 'https://picsum.photos/id/43/600/400' },
  { id: 'salones', title: 'Salones de Eventos', description: 'Salones para eventos y reuniones sociales', label: 'Eventos', image: 'https://picsum.photos/id/128/600/400' },
  { id: 'restaurante', title: 'Restaurante', description: 'Deliciosa gastronomía para todos los gustos', label: 'Gastronomía', image: 'https://picsum.photos/id/292/600/400' },
  { id: 'hospedaje', title: 'Hospedaje', description: 'Cómodas cabañas y habitaciones familiares', label: 'Alojamiento', image: 'https://picsum.photos/id/1044/600/400' },
  { id: 'parques', title: 'Parques Infantiles', description: 'Espacios seguros para la diversión de los niños', label: 'Familia', image: 'https://picsum.photos/id/48/600/400' },
  { id: 'zonas-verdes', title: 'Zonas Verdes', description: 'Amplias áreas naturales para el descanso', label: 'Naturaleza', image: 'https://picsum.photos/id/152/600/400' },
  { id: 'actividades', title: 'Actividades Culturales', description: 'Eventos recreativos y culturales para todos', label: 'Cultura', image: 'https://picsum.photos/id/42/600/400' }
]

const props = defineProps({
  textAutoHide: { type: Boolean, default: true },
  enableStars: { type: Boolean, default: true },
  enableSpotlight: { type: Boolean, default: true },
  enableBorderGlow: { type: Boolean, default: true },
  disableAnimations: { type: Boolean, default: false },
  spotlightRadius: { type: Number, default: 300 },
  particleCount: { type: Number, default: 12 },
  enableTilt: { type: Boolean, default: true },
  glowColor: { type: String, default: '243, 232, 211' },
  clickEffect: { type: Boolean, default: true },
  enableMagnetism: { type: Boolean, default: true }
})

const gridRef = ref(null)
const isMobile = ref(false)
const cardCleanups = []
let spotlightCleanup = null

const checkMobile = () => { isMobile.value = window.innerWidth <= MOBILE_BREAKPOINT }
onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile) })
onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  cardCleanups.forEach(fn => fn())
  if (spotlightCleanup) spotlightCleanup()
})

const shouldDisable = computed(() => props.disableAnimations || isMobile.value)

function createParticle(x, y) {
  const el = document.createElement('div')
  el.style.cssText = `position:absolute;width:4px;height:4px;border-radius:50%;background:rgba(${props.glowColor},1);box-shadow:0 0 6px rgba(${props.glowColor},0.6);pointer-events:none;z-index:100;left:${x}px;top:${y}px;`
  return el
}

function setupCard(el) {
  if (shouldDisable.value || !el) return
  let particles = [], timeouts = [], isHovered = false, memoized = [], initialized = false, magnetTween = null

  const initP = () => {
    if (initialized) return
    const r = el.getBoundingClientRect()
    memoized = Array.from({ length: props.particleCount }, () => createParticle(Math.random() * r.width, Math.random() * r.height))
    initialized = true
  }

  const clearP = () => {
    timeouts.forEach(clearTimeout); timeouts = []
    if (magnetTween) { magnetTween.kill(); magnetTween = null }
    particles.forEach(p => {
      gsap.to(p, { scale: 0, opacity: 0, duration: 0.3, ease: 'back.in(1.7)', onComplete: () => p.parentNode?.removeChild(p) })
    })
    particles = []
  }

  const animP = () => {
    if (!el || !isHovered) return
    if (!initialized) initP()
    memoized.forEach((p, i) => {
      const tid = setTimeout(() => {
        if (!isHovered || !el) return
        const c = p.cloneNode(true); el.appendChild(c); particles.push(c)
        gsap.fromTo(c, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' })
        gsap.to(c, { x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100, rotation: Math.random() * 360, duration: 2 + Math.random() * 2, ease: 'none', repeat: -1, yoyo: true })
        gsap.to(c, { opacity: 0.3, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: true })
      }, i * 100)
      timeouts.push(tid)
    })
  }

  const onEnter = () => { isHovered = true; animP(); gsap.to(el, { y: -2, duration: 0.3, ease: 'power2.out' }) }
  const onLeave = () => { isHovered = false; clearP(); gsap.to(el, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.3, ease: 'power2.out' }) }
  const onMove = (e) => {
    if (!props.enableTilt && !props.enableMagnetism) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left, y = e.clientY - r.top, cx = r.width / 2, cy = r.height / 2
    if (props.enableTilt) gsap.to(el, { rotateX: ((y - cy) / cy) * -10, rotateY: ((x - cx) / cx) * 10, duration: 0.1, ease: 'power2.out', transformPerspective: 1000 })
    if (props.enableMagnetism) {
      if (magnetTween) magnetTween.kill()
      magnetTween = gsap.to(el, { x: (x - cx) * 0.05, y: (y - cy) * 0.05, duration: 0.3, ease: 'power2.out' })
    }
  }
  const onClick = (e) => {
    if (!props.clickEffect) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left, y = e.clientY - r.top
    const max = Math.max(Math.hypot(x, y), Math.hypot(x - r.width, y), Math.hypot(x, y - r.height), Math.hypot(x - r.width, y - r.height))
    const ripple = document.createElement('div')
    ripple.style.cssText = `position:absolute;width:${max*2}px;height:${max*2}px;border-radius:50%;background:radial-gradient(circle,rgba(${props.glowColor},0.4)0%,rgba(${props.glowColor},0.2)30%,transparent 70%);left:${x-max}px;top:${y-max}px;pointer-events:none;z-index:1000;`
    el.appendChild(ripple)
    gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.8, ease: 'power2.out', onComplete: () => ripple.remove() })
  }

  el.addEventListener('mouseenter', onEnter)
  el.addEventListener('mouseleave', onLeave)
  el.addEventListener('mousemove', onMove)
  el.addEventListener('click', onClick)

  cardCleanups.push(() => {
    isHovered = false
    el.removeEventListener('mouseenter', onEnter)
    el.removeEventListener('mouseleave', onLeave)
    el.removeEventListener('mousemove', onMove)
    el.removeEventListener('click', onClick)
    clearP()
  })
}

// Spotlight
onMounted(() => {
  nextTick(() => {
    if (shouldDisable.value || !props.enableSpotlight || !gridRef.value) return

    const section = gridRef.value.closest('section')
    const spotlight = document.createElement('div')
    spotlight.style.cssText = `position:fixed;width:800px;height:800px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(${props.glowColor},0.15)0%,rgba(${props.glowColor},0.08)15%,rgba(${props.glowColor},0.04)25%,rgba(${props.glowColor},0.02)40%,rgba(${props.glowColor},0.01)65%,transparent 70%);z-index:200;opacity:0;transform:translate(-50%,-50%);mix-blend-mode:screen;`
    document.body.appendChild(spotlight)

    let raf = null
    const onMove = (e) => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = section?.getBoundingClientRect()
        const inside = rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
        const cards = gridRef.value?.querySelectorAll('.magic-card')
        if (!inside) {
          gsap.to(spotlight, { opacity: 0, duration: 0.3 })
          cards?.forEach(c => c.style.setProperty('--glow-intensity', '0'))
          return
        }
        gsap.to(spotlight, { left: e.clientX, top: e.clientY, opacity: 0.8, duration: 0.2 })
        cards?.forEach(card => {
          const cr = card.getBoundingClientRect()
          const cx = cr.left + cr.width / 2, cy = cr.top + cr.height / 2
          const dist = Math.max(0, Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(cr.width, cr.height) / 2)
          const prox = props.spotlightRadius * 0.5, fade = props.spotlightRadius * 0.75
          let intensity = 0
          if (dist <= prox) intensity = 1
          else if (dist <= fade) intensity = (fade - dist) / (fade - prox)
          card.style.setProperty('--glow-x', `${((e.clientX - cr.left) / cr.width) * 100}%`)
          card.style.setProperty('--glow-y', `${((e.clientY - cr.top) / cr.height) * 100}%`)
          card.style.setProperty('--glow-intensity', intensity.toString())
          card.style.setProperty('--glow-radius', `${props.spotlightRadius}px`)
        })
      })
    }
    document.addEventListener('mousemove', onMove)
    spotlightCleanup = () => {
      document.removeEventListener('mousemove', onMove)
      spotlight.parentNode?.removeChild(spotlight)
      if (raf) cancelAnimationFrame(raf)
    }
  })
})
</script>

<template>
  <div ref="gridRef" class="magic-bento-grid">
    <div class="magic-grid-inner">
      <div
        v-for="card in cardData"
        :key="card.id"
        :ref="(el) => { if (el) nextTick(() => setupCard(el)) }"
        class="magic-card"
        :class="{ 'magic-card-border-glow': enableBorderGlow }"
        :style="{
          backgroundColor: '#0b1f0d',
          borderColor: 'rgba(243, 232, 211, 0.12)',
          '--glow-x': '50%',
          '--glow-y': '50%',
          '--glow-intensity': '0',
          '--glow-radius': '200px'
        }"
      >
        <!-- Background image -->
        <div class="magic-card-bg" aria-hidden="true">
          <img :src="card.image" alt="" loading="lazy" />
          <div class="magic-card-bg-overlay"></div>
        </div>

        <div class="magic-card-header">
          <span class="magic-card-label">{{ card.label }}</span>
        </div>
        <div class="magic-card-content">
          <h3 class="magic-card-title">{{ card.title }}</h3>
          <p v-if="!textAutoHide || true" class="magic-card-desc">{{ card.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.magic-bento-grid {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
}

.magic-grid-inner {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 4px;
}

@media (min-width: 640px) {
  .magic-grid-inner {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .magic-grid-inner {
    grid-template-columns: repeat(4, 1fr);
  }

  .magic-grid-inner .magic-card:nth-child(3) {
    grid-column: span 2;
    grid-row: span 2;
  }

  .magic-grid-inner .magic-card:nth-child(4) {
    grid-column: 1 / span 2;
    grid-row: 2 / span 2;
  }

  .magic-grid-inner .magic-card:nth-child(6) {
    grid-column: 4;
    grid-row: 3;
  }
}

.magic-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  aspect-ratio: 4 / 3;
  min-height: 180px;
  width: 100%;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
  font-weight: 300;
}

.magic-card-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  overflow: hidden;
}

.magic-card-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.magic-card:hover .magic-card-bg img {
  transform: scale(1.08);
}

.magic-card-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(11, 31, 13, 0.55) 0%,
    rgba(11, 31, 13, 0.7) 50%,
    rgba(11, 31, 13, 0.85) 100%
  );
}

.magic-card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.magic-card-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #fff;
  z-index: 2;
}

.magic-card-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(243, 232, 211, 0.85);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.magic-card-content {
  position: relative;
  display: flex;
  flex-direction: column;
  color: #fff;
  z-index: 2;
}

.magic-card-title {
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #F3E8D3;
  line-height: 1.3;
}

.magic-card-desc {
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.75;
  margin: 0;
  color: rgba(243, 232, 211, 0.7);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.magic-card-border-glow::after {
  content: '';
  position: absolute;
  inset: 0;
  padding: 5px;
  background: radial-gradient(
    var(--glow-radius, 200px) circle at var(--glow-x, 50%) var(--glow-y, 50%),
    rgba(243, 232, 211, calc(var(--glow-intensity, 0) * 0.5)) 0%,
    rgba(243, 232, 211, calc(var(--glow-intensity, 0) * 0.25)) 30%,
    transparent 60%
  );
  border-radius: inherit;
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: subtract;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.magic-card-border-glow:hover::after {
  opacity: 1;
}

.magic-card-border-glow:hover {
  box-shadow:
    0 4px 20px rgba(243, 232, 211, 0.1),
    0 0 30px rgba(243, 232, 211, 0.05);
}
</style>
