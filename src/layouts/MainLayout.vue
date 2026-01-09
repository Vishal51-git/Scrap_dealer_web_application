<template>
  <v-app>
    <!-- Navigation Drawer (Mobile) -->
    <v-navigation-drawer
      v-model="drawer"
      temporary
      location="left"
      class="bg-surface"
    >
      <v-list class="pa-4">
        <v-list-item
          prepend-avatar="https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Prescription02&hairColor=Black&facialHairType=BeardLight&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light"
          :title="authStore.currentUser?.name || 'Guest User'"
          :subtitle="authStore.currentUser?.role || ''"
          link
          to="/profile"
        ></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" class="py-4" nav>
        <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard" to="/" exact color="primary"></v-list-item>
        <v-list-item prepend-icon="mdi-package-variant-closed" title="Inventory" to="/inventory" color="primary"></v-list-item>
        <v-list-item prepend-icon="mdi-account-group" title="Team Access" to="/team" color="primary"></v-list-item>
        <v-list-item prepend-icon="mdi-history" title="Billing History" to="/history" color="primary"></v-list-item>
        <v-list-item prepend-icon="mdi-cog" title="Settings" to="/settings" color="primary"></v-list-item>
      </v-list>
      
       <template v-slot:append>
        <div class="pa-4">
          <v-btn block variant="tonal" color="error" rounded="lg" to="/login">
            <v-icon start>mdi-logout</v-icon> Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Top Bar -->
    <v-app-bar flat class="bg-surface border-b" density="comfortable">
      <template v-slot:prepend>
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer" class="d-md-none"></v-app-bar-nav-icon>
        <div class="d-flex align-center ml-2">
           <v-icon color="primary" size="32" class="mr-2">mdi-recycle</v-icon>
           <div class="text-h6 font-weight-bold text-primary mr-8" style="line-height: 1.2;">Scrapify</div>
        </div>
      </template>

      <!-- Desktop Navigation Links -->
      <div class="d-none d-md-flex">
        <v-btn variant="text" to="/" exact class="text-none font-weight-bold mr-1">Dashboard</v-btn>
        <v-btn variant="text" to="/inventory" class="text-none font-weight-bold mr-1">Inventory</v-btn>
        <v-btn variant="text" to="/history" class="text-none font-weight-bold mr-1">History</v-btn>
        <v-btn variant="text" to="/team" class="text-none font-weight-bold">Team</v-btn>
      </div>

      <v-spacer></v-spacer>

      <!-- Actions -->
      <div class="d-flex align-center">
        <v-btn icon="mdi-magnify" variant="text" color="medium-emphasis"></v-btn>
        <v-btn icon="mdi-bell-outline" variant="text" color="medium-emphasis" class="mr-2">
          <v-badge dot color="error">
            <v-icon>mdi-bell-outline</v-icon>
          </v-badge>
        </v-btn>
        
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-avatar size="36" class="cursor-pointer mr-2" v-bind="props" image="https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Prescription02&hairColor=Black&facialHairType=BeardLight&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light"></v-avatar>
          </template>
          <v-list width="200" class="rounded-lg">
            <v-list-item prepend-icon="mdi-account" title="Profile" to="/profile" density="compact"></v-list-item>
            <v-list-item prepend-icon="mdi-cog" title="Settings" to="/settings" density="compact"></v-list-item>
            <v-divider class="my-2"></v-divider>
            <v-list-item prepend-icon="mdi-logout" title="Logout" to="/login" density="compact" color="error"></v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="bg-background">
      <v-container fluid class="pa-4 pa-md-6" style="max-width: 1200px;">
        <router-view></router-view>
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer app border class="bg-surface" elevation="0">
      <div class="d-flex w-100 align-center justify-space-between text-caption text-medium-emphasis">
        <div>
          &copy; {{ new Date().getFullYear() }} Scrapify. All rights reserved.
        </div>
        <div class="d-flex">
          <a href="#" class="text-decoration-none text-medium-emphasis mr-4">Terms of Service</a>
          <a href="#" class="text-decoration-none text-medium-emphasis">Privacy Policy</a>
        </div>
      </div>
    </v-footer>

    <!-- Global Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top right"
      variant="flat"
      elevation="4"
    >
      <div class="d-flex align-center">
        <v-icon start icon="mdi-information" class="mr-2" v-if="snackbar.color === 'info'"></v-icon>
        <v-icon start icon="mdi-check-circle" class="mr-2" v-if="snackbar.color === 'success'"></v-icon>
        <v-icon start icon="mdi-alert" class="mr-2" v-if="snackbar.color === 'warning'"></v-icon>
        <v-icon start icon="mdi-alert-circle" class="mr-2" v-if="snackbar.color === 'error'"></v-icon>
        {{ snackbar.message }}
      </div>

      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          icon="mdi-close"
          size="small"
          @click="snackbar.show = false"
        ></v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSnackbarStore } from '../stores/snackbar';
import { useAuthStore } from '../stores/auth';

const drawer = ref(false);
const snackbar = useSnackbarStore();
const authStore = useAuthStore();
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
