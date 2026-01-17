<template>
  <v-app>
    <v-main class="bg-background">
      <div class="pa-4 pb-6" style="max-width: 800px; margin: 0 auto; width: 100%;">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <v-btn icon="mdi-chevron-left" variant="text" @click="$router.back()"></v-btn>
          <h1 class="text-h6 font-weight-bold">{{ $t('settings.title') }}</h1>
          <div style="width: 40px;"></div>
        </div>

        <!-- Profile Link -->
        <v-card class="d-flex align-center pa-4 mb-6 rounded-xl border bg-surface" elevation="0" link to="/profile">
           <v-avatar size="56" image="https://avataaars.io/?avatarStyle=Circle&topType=ShortHairTheCaesarSidePart&accessoriesType=Prescription02&hairColor=BrownDark&facialHairType=BeardMedium&clotheType=ShirtCrewNeck&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light" class="mr-4"></v-avatar>
           <div>
             <div class="text-h6 font-weight-bold" style="line-height: 1.2;">{{ authStore.currentUser?.name || 'Guest User' }}</div>
             <div class="text-caption text-medium-emphasis">{{ authStore.currentUser?.role || '' }}</div>
           </div>
           <v-spacer></v-spacer>
            <v-icon color="medium-emphasis">mdi-chevron-right</v-icon>
        </v-card>



        <!-- Business -->
        <div class="text-caption font-weight-bold text-medium-emphasis mb-2 ml-1">{{ $t('settings.business') }}</div>
        <v-card class="rounded-xl mb-6" elevation="0" border>
          <v-list class="py-0">
            <v-list-item link prepend-icon="mdi-format-list-checks" :title="$t('settings.manage_items')" append-icon="mdi-chevron-right" to="/inventory"></v-list-item>
            <v-divider></v-divider>
            <v-list-item link prepend-icon="mdi-account-group" :title="$t('settings.user_roles')" append-icon="mdi-chevron-right" to="/team"></v-list-item>
          </v-list>
        </v-card>

        <!-- Preferences -->
        <div class="text-caption font-weight-bold text-medium-emphasis mb-2 ml-1">{{ $t('settings.preferences') }}</div>
        <v-card class="rounded-xl mb-6" elevation="0" border>
          <v-list class="py-0">
            <!-- Theme -->
            <v-list-item prepend-icon="mdi-theme-light-dark">
              <v-list-item-title class="font-weight-bold">{{ $t('settings.dark_mode') }}</v-list-item-title>
              <template v-slot:append>
                <v-switch
                  :model-value="settings.theme === 'dark'"
                  color="primary"
                  hide-details
                  inset
                  density="compact"
                  @change="toggleDarkMode"
                ></v-switch>
              </template>
            </v-list-item>

            <!-- Theme Color -->
            <v-list-item prepend-icon="mdi-palette">
              <v-list-item-title class="font-weight-bold">{{ $t('settings.theme_color') }}</v-list-item-title>
              
               <!-- Color Swatches -->
               <div class="d-flex ml-14 mb-2 pa-2 overflow-x-auto" style="gap: 12px;">
                 <v-btn
                    v-for="color in themeColors"
                    :key="color"
                    :color="color"
                    icon
                    size="x-small"
                    variant="flat"
                    :style="settings.primaryColor === color ? 'border: 2px solid white; outline: 2px solid ' + color : ''"
                    @click="settings.setPrimaryColor(color, theme)"
                 >
                    <v-icon v-if="settings.primaryColor === color" color="white" size="small">mdi-check</v-icon>
                 </v-btn>
               </div>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item prepend-icon="mdi-weather-partly-cloudy" :title="$t('settings.show_weather')">
              <template v-slot:append>
                 <v-switch 
                   :model-value="settings.showWeather" 
                   @update:model-value="settings.toggleWeather"
                   color="primary" 
                   hide-details 
                   density="compact" 
                   inset
                 ></v-switch>
              </template>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item prepend-icon="mdi-bell" :title="$t('settings.notifications')">
              <template v-slot:append>
                 <v-switch v-model="notifications" color="primary" hide-details density="compact" inset></v-switch>
              </template>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item prepend-icon="mdi-translate" :title="$t('settings.language')">
               <template v-slot:append>
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <span v-bind="props" class="text-body-2 text-medium-emphasis cursor-pointer">
                        {{ locale.toUpperCase() }} <v-icon size="small">mdi-chevron-down</v-icon>
                      </span>
                    </template>
                    <v-list density="compact">
                      <v-list-item title="English" @click="{ locale = 'en'; settings.setLanguage('en'); }"></v-list-item>
                      <v-list-item title="हिन्दी (Hindi)" @click="{ locale = 'hi'; settings.setLanguage('hi'); }"></v-list-item>
                    </v-list>
                  </v-menu>
               </template>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item prepend-icon="mdi-scale" :title="$t('settings.weight_unit')">
              <template v-slot:append>
                 <span class="text-body-2 text-medium-emphasis">{{ $t('common.kilograms') }} <v-icon size="small">mdi-chevron-right</v-icon></span>
              </template>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item prepend-icon="mdi-currency-usd" :title="$t('settings.currency')">
              <template v-slot:append>
                 <v-menu>
                   <template v-slot:activator="{ props }">
                     <span v-bind="props" class="text-body-2 text-medium-emphasis cursor-pointer">
                       {{ settings.currency }} <v-icon size="small">mdi-chevron-down</v-icon>
                     </span>
                   </template>
                   <v-list density="compact">
                     <v-list-item title="INR (₹)" @click="settings.setCurrency('INR')"></v-list-item>
                     <v-list-item title="USD ($)" @click="settings.setCurrency('USD')"></v-list-item>
                     <v-list-item title="EUR (€)" @click="settings.setCurrency('EUR')"></v-list-item>
                   </v-list>
                 </v-menu>
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- Data & Storage -->
        <div class="text-caption font-weight-bold text-medium-emphasis mb-2 ml-1">{{ $t('settings.data_storage') }}</div>
        <v-card class="rounded-xl mb-6" elevation="0" border>
          <v-list class="py-0">
            <v-list-item link prepend-icon="mdi-download" :title="$t('settings.export_history')" base-color="primary"></v-list-item>
            <v-divider></v-divider>
            <v-list-item link prepend-icon="mdi-delete" :title="$t('settings.clear_cache')" base-color="error"></v-list-item>
          </v-list>
        </v-card>

        <!-- Logout -->
        <v-btn block color="surface" border class="text-error" size="large" rounded="lg" @click="handleLogout">
          <v-icon start>mdi-logout</v-icon>
          {{ $t('settings.logout') }}
        </v-btn>
        
        <div class="text-center text-caption text-medium-emphasis mt-4">
          ScrapMate v2.4.1 (Build 204)
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { useAuthStore } from '../stores/auth';
import { useTheme } from 'vuetify';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const settings = useSettingsStore();
const authStore = useAuthStore();
const theme = useTheme();
const { locale } = useI18n();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const notifications = ref(true);

const themeColors = [
  '#2563EB', // Blue
  '#059669', // Green
  '#7C3AED', // Purple
  '#EA580C', // Orange
  '#DC2626', // Red
  '#DB2777', // Pink
];

const toggleDarkMode = () => {
  settings.toggleTheme(theme);
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
