<script setup>
import { ref, onMounted } from 'vue'
import { restoreSession, useAuth } from './composables/useAuth.js'
import IndexView from './components/IndexView.vue'
import LoginView from './components/LoginView.vue'
import RegisterView from './components/RegisterView.vue'
import HotelView from './components/HotelView.vue'
import RestaurantView from './components/RestaurantView.vue'
import DashboardView from './components/DashboardView.vue'
import EventsView from './components/EventsView.vue'
import TableReservationView from './components/TableReservationView.vue'

const currentView = ref('index')

const { isLoggedIn } = useAuth()

function navigate(view) {
  currentView.value = view
}

onMounted(() => {
  restoreSession()
})
</script>

<template>
  <Transition name="view-fade" mode="out-in">
    <IndexView v-if="currentView === 'index'" key="index" @navigate="navigate" />
    <LoginView v-else-if="currentView === 'login'" key="login" @navigate="navigate" />
    <RegisterView v-else-if="currentView === 'register'" key="register" @navigate="navigate" />
    <HotelView v-else-if="currentView === 'hotel'" key="hotel" @navigate="navigate" />
    <RestaurantView v-else-if="currentView === 'restaurant'" key="restaurant" @navigate="navigate" />
    <EventsView v-else-if="currentView === 'events'" key="events" @navigate="navigate" />
    <TableReservationView v-else-if="currentView === 'table-reservation'" key="table-reservation" @navigate="navigate" />
    <DashboardView v-else-if="currentView === 'dashboard'" key="dashboard" @navigate="navigate" />
  </Transition>
</template>

<style>
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.view-fade-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.view-fade-leave-to {
  opacity: 0;
  transform: scale(1.04);
}
</style>
