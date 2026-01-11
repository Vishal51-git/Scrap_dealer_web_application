<template>
  <router-view></router-view>
  <GlobalSnackbar />
</template>

<script setup lang="ts">
import { useSettingsStore } from './stores/settings';
import { useTheme } from 'vuetify';
import GlobalSnackbar from './components/GlobalSnackbar.vue';

const settings = useSettingsStore();
const theme = useTheme();

// Apply persisted theme and color
theme.global.name.value = settings.theme;
settings.setPrimaryColor(settings.primaryColor, theme);
</script>
