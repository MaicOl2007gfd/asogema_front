<template>
  <div class="ai-assistant">
    <!-- Botón flotante -->
    <button 
      @click="toggleChat" 
      class="ai-toggle-btn"
      :class="{ 'active': isOpen }"
    >
      <svg v-if="!isOpen" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <path d="M8 10h.01"/>
        <path d="M12 10h.01"/>
        <path d="M16 10h.01"/>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>

    <!-- Panel de chat -->
    <transition name="slide-up">
      <div v-if="isOpen" class="ai-chat-panel">
        <!-- Header -->
        <div class="chat-header">
          <div class="header-content">
            <div class="ai-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M8 10h.01"/>
                <path d="M12 10h.01"/>
                <path d="M16 10h.01"/>
              </svg>
            </div>
            <div class="header-info">
              <span class="chat-title">ASOEGMA Asistente</span>
              <span class="chat-status">
                <span class="status-dot"></span>
                En línea
              </span>
            </div>
          </div>
          <div class="header-actions">
            <button class="header-btn" @click="clearMessages" title="Limpiar conversación">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
            <button @click="toggleChat" class="close-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Subtítulo -->
        <div class="chat-subheader">
          <span>Restaurante, Hotel y Eventos</span>
        </div>

        <!-- Área de mensajes -->
        <div class="chat-messages" ref="messagesContainer">
          <div v-if="messages.length === 0" class="empty-state">
            <div class="empty-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M8 10h.01"/>
                <path d="M12 10h.01"/>
                <path d="M16 10h.01"/>
              </svg>
            </div>
            <h3>ASOEGMA Asistente</h3>
            <p>Preguntame por ventas, reservas, mesas,</p>
            <p class="empty-sub">stock, habitaciones, salones y más.</p>
          </div>
          <div 
            v-for="(message, index) in messages" 
            :key="index"
            class="message"
            :class="message.role"
          >
            <div class="message-avatar" v-if="message.role === 'assistant'">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M8 10h.01"/>
                <path d="M12 10h.01"/>
                <path d="M16 10h.01"/>
              </svg>
            </div>
            <div class="message-content">
              <div class="message-bubble">
                <span class="message-text">{{ message.content }}</span>
                <span class="message-time">{{ message.time }}</span>
              </div>
            </div>
          </div>
          <div v-if="loading" class="message assistant">
            <div class="message-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M8 10h.01"/>
                <path d="M12 10h.01"/>
                <path d="M16 10h.01"/>
              </svg>
            </div>
            <div class="message-content">
              <div class="message-bubble typing-bubble">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sugerencias rápidas -->
        <div v-if="messages.length === 0" class="quick-suggestions">
          <button class="suggestion-btn" @click="quickQuestion('¿Cuántas reservas hay hoy?')">
            📊 Reservas
          </button>
          <button class="suggestion-btn" @click="quickQuestion('¿Cuál es la ocupación actual?')">
            🏨 Ocupación
          </button>
          <button class="suggestion-btn" @click="quickQuestion('Mostrar ventas del día')">
            💰 Ventas
          </button>
          <button class="suggestion-btn" @click="quickQuestion('Eventos próximos')">
            📅 Eventos
          </button>
        </div>

        <!-- Input de texto -->
        <div class="chat-input">
          <input 
            v-model="userInput" 
            @keyup.enter="sendMessage"
            type="text" 
            placeholder="Escribe tu mensaje..."
            class="input-field"
          />
          <button 
            @click="sendMessage" 
            :disabled="!userInput.trim()"
            class="send-btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const WEBHOOK = 'https://bot.clubasogema.com/webhook/n2UEdC71Um/chat'
const WEBHOOK_INFO = 'https://bot.clubasogema.com/webhook/n2UEdC71Um/chat/info'

// Estado del chat
const isOpen = ref(false)
const userInput = ref('')
const messages = ref([])
const loading = ref(false)
const messagesContainer = ref(null)

let sessionId = 'web-' + Date.now().toString(36)
if (!sessionStorage.getItem('asg_session')) {
  sessionStorage.setItem('asg_session', sessionId)
} else {
  sessionId = sessionStorage.getItem('asg_session')
}

let welcomeSent = false

// Alternar estado del chat
const toggleChat = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    if (!welcomeSent && messages.value.length === 0) {
      await sendMessage('', true)
    }
    scrollToBottom()
  }
}

// Pregunta rápida
const quickQuestion = (question) => {
  userInput.value = question
  sendMessage()
}

// Enviar mensaje
const sendMessage = async (text = null, isWelcome = false) => {
  const content = (text !== null ? text : userInput.value).trim()
  if (!content && !isWelcome) return
  if (loading.value) return

  if (!isWelcome) {
    const userMessage = {
      role: 'user',
      content,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    messages.value.push(userMessage)
    scrollToBottom()
  }

  userInput.value = ''
  loading.value = true
  scrollToBottom()

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 120000)

  try {
    const payload = { chatInput: isWelcome ? '__inicio__' : content, sessionId }
    const resp = await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    if (!resp.ok) {
      throw new Error('HTTP ' + resp.status)
    }
    const data = await resp.json()
    const out = data.output ?? data.response ?? data.message ?? data.text
    const aiMessage = {
      role: 'assistant',
      content: out || 'No pude procesar tu solicitud.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    messages.value.push(aiMessage)
  } catch (err) {
    messages.value.push({
      role: 'assistant',
      content: 'Lo siento, no pude conectar con el asistente. Inténtalo de nuevo en un momento.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  } finally {
    clearTimeout(timer)
    loading.value = false
    welcomeSent = true
    scrollToBottom()
  }
}

// Función para scroll automático
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Limpiar mensajes
const clearMessages = () => {
  if (messages.value.length > 0) {
    if (confirm('¿Quieres limpiar la conversación?')) {
      messages.value = []
    }
  }
}

// Exponer funciones al componente padre
defineExpose({
  toggleChat,
  sendMessage,
  clearMessages,
  isOpen
})
</script>

<style scoped>
@import '../AIAssistant.css';
</style>