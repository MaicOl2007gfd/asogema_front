<script setup>
import { onBeforeUnmount, ref } from 'vue'

const emit = defineEmits(['sparkClick'])

const props = defineProps({
  sparkColor: { type: String, default: '#F3E8D3' },
  sparkSize: { type: Number, default: 10 },
  sparkRadius: { type: Number, default: 15 },
  sparkCount: { type: Number, default: 8 },
  duration: { type: Number, default: 400 }
})

const wrapperRef = ref(null)
let sparks = []
let timeouts = []

function createSpark(x, y) {
  for (let i = 0; i < props.sparkCount; i++) {
    const spark = document.createElement('span')
    const angle = (i / props.sparkCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5
    const radius = props.sparkRadius * (0.6 + Math.random() * 0.4)
    const dx = Math.cos(angle) * radius
    const dy = Math.sin(angle) * radius
    const size = props.sparkSize * (0.6 + Math.random() * 0.4)

    // Mix between circle and diamond shapes
    const isDiamond = i % 2 === 0
    spark.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      ${isDiamond ? 'border-radius: 2px; transform: translate(-50%, -50%) rotate(45deg);' : 'border-radius: 50%; transform: translate(-50%, -50%);'}
      background: ${props.sparkColor};
      box-shadow: 0 0 ${size * 0.5}px ${props.sparkColor};
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
      z-index: 999;
      opacity: 1;
    `

    wrapperRef.value.appendChild(spark)
    sparks.push(spark)

    // Animate with requestAnimationFrame
    let start = null
    const duration = props.duration

    function animate(timestamp) {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)

      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentX = dx * easeOut
      const currentY = dy * easeOut
      const opacity = 1 - easeOut
      const scale = 1 - easeOut * 0.6

      const rot = isDiamond ? `rotate(${45 + easeOut * 180}deg)` : ''
      spark.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) scale(${scale}) ${rot}`
      spark.style.opacity = opacity

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        spark.remove()
      }
    }

    requestAnimationFrame(animate)
  }
}

function handleClick(e) {
  // Stop the inner button click from navigating immediately
  e.preventDefault()
  e.stopPropagation()

  const rect = wrapperRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  createSpark(x, y)

  // Emit after sparks start, giving them time to render before navigation
  setTimeout(() => emit('sparkClick', e), 200)
}

onBeforeUnmount(() => {
  sparks.forEach(s => s.remove())
  sparks = []
  timeouts.forEach(clearTimeout)
  timeouts = []
})
</script>

<template>
  <div ref="wrapperRef" class="click-spark-wrapper" @click="handleClick">
    <slot />
  </div>
</template>

<style scoped>
.click-spark-wrapper {
  position: relative;
  display: inline-flex;
}
</style>
