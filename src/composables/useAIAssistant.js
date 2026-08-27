// composables/useAIAssistant.js
import { ref, nextTick } from 'vue'

export function useAIAssistant() {
  // Estado
  const isOpen = ref(false)
  const userInput = ref('')
  const messages = ref([])
  const messagesContainer = ref(null)

  // Alternar estado del chat
  const toggleChat = () => {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      scrollToBottom()
    }
  }

  // Enviar mensaje
  const sendMessage = () => {
    if (!userInput.value.trim()) return

    // Agregar mensaje del usuario
    const userMessage = {
      role: 'user',
      content: userInput.value,
      time: new Date().toLocaleTimeString()
    }
    messages.value.push(userMessage)
    
    const userQuestion = userInput.value
    userInput.value = ''

    // Scroll al último mensaje
    scrollToBottom()

    // Simular respuesta de la IA (aquí iría la lógica real)
    setTimeout(() => {
      const aiResponse = {
        role: 'assistant',
        content: generateAIResponse(userQuestion),
        time: new Date().toLocaleTimeString()
      }
      messages.value.push(aiResponse)
      scrollToBottom()
    }, 500)
  }

  // Función para scroll automático
  const scrollToBottom = async () => {
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }

  // Generador de respuestas simuladas (reemplazar con API real)
  const generateAIResponse = (question) => {
    const responses = [
      `He recibido tu pregunta: "${question}". Como asistente policial, estoy procesando tu solicitud. ¿Necesitas ayuda con algún aspecto específico del sistema?`,
      `Interesante pregunta sobre "${question}". Puedo ayudarte a encontrar información sobre usuarios, reportes o configuraciones del sistema.`,
      `Sobre "${question}", te recomiendo revisar la sección de administración. ¿Quieres que profundice en algún tema en particular?`,
      `¡Excelente consulta! "${question}" es un tema importante. El sistema está diseñado para manejar esto de manera eficiente. ¿Te gustaría más detalles?`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Limpiar mensajes
  const clearMessages = () => {
    messages.value = []
  }

  // Enviar mensaje desde fuera
  const sendExternalMessage = (text) => {
    userInput.value = text
    sendMessage()
  }

  return {
    // Estado
    isOpen,
    userInput,
    messages,
    messagesContainer,
    
    // Métodos
    toggleChat,
    sendMessage,
    clearMessages,
    sendExternalMessage,
    scrollToBottom
  }
}