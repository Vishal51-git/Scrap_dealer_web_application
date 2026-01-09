<template>
  <router-view></router-view>
</template>

<script setup lang="ts">
import { useSettingsStore } from './stores/settings';
import { useTheme } from 'vuetify';

const settings = useSettingsStore();
const theme = useTheme();

// Apply persisted theme and color
theme.global.name.value = settings.theme;
settings.setPrimaryColor(settings.primaryColor, theme);
</script>
