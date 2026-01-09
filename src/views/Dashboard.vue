<template>
  <div>
    <!-- Welcome Section -->
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold mb-1">
        {{ $t('dashboard.greeting') }}{{ authStore.currentUser?.name ? `, ${authStore.currentUser.name}` : '' }}
      </h1>
      <p class="text-body-2 text-medium-emphasis">{{ $t('dashboard.summary') }}</p>
    </div>
    
    <!-- Weather & Date Widget -->
    <v-expand-transition>
      <div v-if="settings.showWeather" class="mb-6">
        <v-card class="rounded-xl bg-primary text-white overflow-hidden" elevation="4">
          <div class="position-absolute" style="top: -20px; right: -20px; opacity: 0.1;">
            <v-icon size="150">mdi-weather-partly-cloudy</v-icon>
          </div>
          
          <v-card-text class="d-flex justify-space-between align-center py-6 px-6 position-relative">
            <div>
              <div class="text-h4 font-weight-bold mb-1">{{ currentTime }}</div>
              <div class="text-subtitle-1 opacity-80 mb-4">{{ currentDate }}</div>
              
              <div class="d-flex align-center">
                <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                <span class="text-caption font-weight-bold">{{ locationName || $t('dashboard.loading_location') }}</span>
              </div>
            </div>

            <div class="text-right">
              <div class="d-flex flex-column align-end">
                <v-icon size="48" class="mb-2">{{ weatherIcon }}</v-icon>
                <div class="text-h5 font-weight-bold mb-1">{{ weatherTemp }}°C</div>
                <div class="text-caption opacity-80">{{ weatherCondition || $t('dashboard.loading_weather') }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-expand-transition>

    <!-- Summary Cards -->
    <v-row dense class="mb-6">
      <v-col cols="6">
        <v-card class="rounded-xl pa-3" elevation="0">
          <div class="d-flex justify-space-between align-start mb-2">
            <v-avatar color="blue-lighten-5" rounded="lg" size="40">
              <v-icon color="primary" size="24">mdi-scale-balance</v-icon>
            </v-avatar>
            <v-chip size="x-small" color="success" variant="flat" class="font-weight-bold">+5%</v-chip>
          </div>
          <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold mb-1">{{ $t('dashboard.todays_purchase') }}</div>
          <div class="text-h5 font-weight-bold">{{ dashboardStats.todaysPurchase }} <span class="text-body-2 text-medium-emphasis">kg</span></div>
        </v-card>
      </v-col>

      <v-col cols="6">
        <v-card class="rounded-xl pa-3 bg-primary text-white" elevation="0">
          <div class="d-flex justify-space-between align-start mb-2">
            <v-avatar color="white" rounded="lg" size="40" variant="tonal">
              <v-icon color="white" size="24">mdi-cash-multiple</v-icon>
            </v-avatar>
            <v-chip size="x-small" color="white" variant="flat" class="text-primary font-weight-bold">+12%</v-chip>
          </div>
          <div class="text-caption text-uppercase font-weight-bold mb-1 opacity-80">{{ $t('dashboard.total_sales') }}</div>
          <div class="text-h5 font-weight-bold">{{ settings.formatCurrency(dashboardStats.totalSales) }}</div>
        </v-card>
      </v-col>

      <v-col cols="6">
        <v-card class="rounded-xl pa-3" elevation="0">
          <div class="d-flex justify-space-between align-start mb-2">
            <v-avatar color="green-lighten-5" rounded="lg" size="40">
              <v-icon color="success" size="24">mdi-chart-line-variant</v-icon>
            </v-avatar>
            <v-chip size="x-small" color="success" variant="flat" class="font-weight-bold">+8%</v-chip>
          </div>
          <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold mb-1">{{ $t('dashboard.net_profit') }}</div>
          <div class="text-h5 font-weight-bold">{{ settings.formatCurrency(dashboardStats.netProfit) }}</div>
        </v-card>
      </v-col>

      <v-col cols="6">
        <v-card class="rounded-xl pa-3" elevation="0">
          <div class="d-flex justify-space-between align-start mb-2">
            <v-avatar color="orange-lighten-5" rounded="lg" size="40">
              <v-icon color="warning" size="24">mdi-clock-outline</v-icon>
            </v-avatar>
            <v-chip size="x-small" color="error" variant="flat" class="font-weight-bold">-2%</v-chip>
          </div>
          <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold mb-1">{{ $t('dashboard.pending') }}</div>
          <div class="text-h5 font-weight-bold">{{ settings.formatCurrency(dashboardStats.pending) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Live Material Rates -->
    <div class="d-flex justify-space-between align-center mb-3">
      <h2 class="text-h6 font-weight-bold">{{ $t('dashboard.live_rates') }}</h2>
      <v-btn variant="text" color="primary" density="compact" class="text-none">{{ $t('dashboard.see_all') }}</v-btn>
    </div>
    
    <div class="d-flex overflow-x-auto pb-2" style="gap: 12px; scrollbar-width: none;">
      <v-card v-for="item in materialRates" :key="item.name" width="140" class="rounded-xl pa-3 flex-shrink-0" elevation="0" border>
        <div class="d-flex align-center mb-2">
          <v-icon :color="item.color" size="small" class="mr-2">mdi-circle</v-icon>
          <span class="text-body-2 font-weight-bold">{{ item.name }}</span>
        </div>
        <div class="text-h6 font-weight-bold mb-1">{{ item.price }}</div>
        <div class="text-caption text-medium-emphasis mb-2">{{ $t('dashboard.per_kg') }}</div>
        <v-chip size="x-small" :color="item.trend > 0 ? 'success' : 'error'" variant="flat" class="font-weight-bold">
          <v-icon start size="x-small">{{ item.trend > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
          {{ Math.abs(item.trend) }}%
        </v-chip>
      </v-card>
    </div>

    <!-- Recent Activity -->
    <div class="d-flex justify-space-between align-center mt-6 mb-3">
      <h2 class="text-h6 font-weight-bold">{{ $t('dashboard.recent_activity') }}</h2>
      <v-btn variant="text" color="primary" density="compact" class="text-none">{{ $t('dashboard.view_all') }}</v-btn>
    </div>

    <v-card class="rounded-xl" elevation="0" border>
      <v-list lines="two" class="bg-transparent pa-0">
        <template v-for="(activity, index) in recentActivity" :key="index">
          <v-list-item class="py-3">
            <template v-slot:prepend>
              <v-avatar color="orange-lighten-5" rounded="lg">
                <v-icon color="orange">mdi-logout</v-icon>
              </v-avatar>
            </template>
            
            <v-list-item-title class="font-weight-bold">{{ activity.name }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              {{ activity.type }} • {{ activity.weight }}kg
            </v-list-item-subtitle>

            <template v-slot:append>
              <div class="text-right">
                <div class="text-body-2 font-weight-bold" :class="activity.amount > 0 ? 'text-success' : 'text-error'">
                  {{ activity.amount > 0 ? '+' : '' }}{{ settings.formatCurrency(Math.abs(activity.amount)) }}
                </div>
                <div class="text-caption text-medium-emphasis">{{ activity.time }}</div>
              </div>
            </template>
          </v-list-item>
          <v-divider v-if="index < recentActivity.length - 1" inset></v-divider>
        </template>
      </v-list>
    </v-card>

    <!-- FAB -->
    <!-- FAB -->
    <v-btn position="fixed" location="bottom right" color="primary" icon="mdi-plus" size="large" elevation="4" class="mb-2 mr-4" style="z-index: 100; bottom: 80px !important;" to="/billing/new"></v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { useBillingStore } from '../stores/billing';
import { useInventoryStore } from '../stores/inventory';
import { useAuthStore } from '../stores/auth';
import { useI18n } from 'vue-i18n';

const settings = useSettingsStore();
const billingStore = useBillingStore();
const inventoryStore = useInventoryStore();
const authStore = useAuthStore();
const { t } = useI18n();

// Weather & Date State
const currentTime = ref('');
const currentDate = ref('');
const locationName = ref('');
const weatherTemp = ref('--');
const weatherCondition = ref('');
const weatherIcon = ref('mdi-weather-cloudy');

let timer: any = null;
let weatherTimer: any = null;

// Date & Time Logic
const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
  currentDate.value = now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
};

// Weather Logic (Open-Meteo)
const fetchWeather = async (lat: number, lon: number) => {
  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`);
    const data = await response.json();
    
    if (data.current) {
      weatherTemp.value = Math.round(data.current.temperature_2m).toString();
      const code = data.current.weather_code;
      
      if (code === 0) { weatherCondition.value = 'Clear Sky'; weatherIcon.value = 'mdi-weather-sunny'; }
      else if (code <= 3) { weatherCondition.value = 'Partly Cloudy'; weatherIcon.value = 'mdi-weather-partly-cloudy'; }
      else if (code <= 48) { weatherCondition.value = 'Foggy'; weatherIcon.value = 'mdi-weather-fog'; }
      else if (code <= 69) { weatherCondition.value = 'Rainy'; weatherIcon.value = 'mdi-weather-rainy'; }
      else if (code <= 77) { weatherCondition.value = 'Snowy'; weatherIcon.value = 'mdi-weather-snowy'; }
      else { weatherCondition.value = 'Thunderstorm'; weatherIcon.value = 'mdi-weather-lightning'; }
    }
    
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const geoData = await geoRes.json();
    locationName.value = geoData.address.city || geoData.address.town || geoData.address.village || 'Unknown Location';
    
  } catch (e) {
    console.error('Weather fetch failed', e);
    weatherCondition.value = 'Unavailable';
  }
};

const initWeather = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error", error);
          locationName.value = t('dashboard.location_denied');
        }
      );
    } else {
      locationName.value = 'Geolocation not supported';
    }
};

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);
  if (settings.showWeather) {
    initWeather();
    weatherTimer = setInterval(initWeather, 3600000);
  }
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  if (weatherTimer) clearInterval(weatherTimer);
});

// Dashboard Stats Computed Information
const dashboardStats = computed(() => {
    const today = new Date().toDateString();
    let todaysPurchaseWeight = 0;
    let totalSales = 0;
    let pendingAmount = 0;
    let netProfit = 0; // Simplified estimation

    billingStore.history.forEach(entry => {
        const entryDate = new Date(entry.date).toDateString();
        
        // Assuming all billing entries are Purchases from customers
        if (entryDate === today) {
            todaysPurchaseWeight += entry.totalWeight;
        }

        if (entry.status === 'Paid') {
            totalSales += entry.totalAmount; // Using this as 'Volume of Business'
        } else if (entry.status === 'Pending') {
            pendingAmount += entry.totalAmount;
        }
    });

    // Mock Profit Logic: 20% of Total Sales
    netProfit = totalSales * 0.20;

    return {
        todaysPurchase: todaysPurchaseWeight,
        totalSales,
        pending: pendingAmount,
        netProfit
    };
});

const materialRates = computed(() => {
    // Map Top 3 Items from Inventory or defaults
    const topItems = inventoryStore.items.slice(0, 3);
    if(topItems.length === 0) return [
      { name: t('dashboard.materials.iron'), price: settings.formatCurrency(0.45), trend: 2, color: 'grey-darken-1' },
      { name: t('dashboard.materials.copper'), price: settings.formatCurrency(3.20), trend: -1, color: 'orange-darken-3' },
      { name: t('dashboard.materials.plastic'), price: settings.formatCurrency(0.15), trend: 5, color: 'blue' },
    ];

    return topItems.map(item => ({
        name: item.name,
        price: settings.formatCurrency(item.price),
        trend: Math.floor(Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1), // Mock trend
        color: item.iconColor ? `text-${item.iconColor}` : 'grey' // Simple color mapping
    }));
});

const recentActivity = computed(() => {
    return billingStore.history.slice(0, 5).map(entry => {
        const mainItem = entry.items[0];
        const itemName = mainItem ? mainItem.name : 'Unknown';
        const itemCount = entry.items.length;
        
        return {
            name: entry.customerName || 'Unknown Customer',
            type: itemCount > 1 ? `${itemName} +${itemCount-1}` : itemName,
            weight: entry.totalWeight,
            amount: entry.totalAmount, // Assuming Outflow
            time: new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            id: entry.id
        };
    });
});
</script>

<style scoped>
/* Hide scrollbar for clean UI */
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}
</style>
