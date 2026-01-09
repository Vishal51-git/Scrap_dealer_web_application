<template>
  <v-container class="fill-height flex-column justify-center align-center bg-background">
    
    <!-- Back Button -->
    <div class="d-flex w-100 mb-8" style="position: absolute; top: 16px; left: 16px;">
      <v-btn icon="mdi-chevron-left" variant="text" color="primary" @click="$router.back()"></v-btn>
    </div>

    <!-- Icon -->
    <div class="position-relative mb-8">
      <v-avatar color="blue-lighten-5" size="120">
        <v-icon color="primary" size="64">mdi-lock-reset</v-icon>
      </v-avatar>
      <v-avatar color="success" size="32" class="position-absolute" style="bottom: 0; right: 0; border: 2px solid white;">
        <v-icon color="white" size="18">mdi-check</v-icon>
      </v-avatar>
    </div>

    <!-- Text -->
    <h1 class="text-h5 font-weight-bold mb-2">{{ $t('forgot_password.title') }}</h1>
    <p class="text-body-2 text-medium-emphasis text-center mb-8 px-4" style="max-width: 320px;">
      {{ $t('forgot_password.description') }}
    </p>

    <!-- Input -->
    <div class="w-100 mb-6" style="max-width: 360px;">
      <div class="text-subtitle-2 font-weight-bold mb-2 ml-1">{{ $t('forgot_password.mobile_number') }}</div>
      <v-text-field
        v-model="phone"
        variant="outlined"
        rounded="lg"
        bg-color="white"
        hide-details
        placeholder="98765 43210"
      >
        <template v-slot:prepend-inner>
          <span class="text-body-1 text-medium-emphasis mr-2">+1</span>
          <v-divider vertical class="my-1"></v-divider>
        </template>
        <template v-slot:append-inner>
          <v-icon color="grey-lighten-1">mdi-backspace</v-icon>
        </template>
      </v-text-field>
    </div>

    <!-- Button -->
    <v-btn
      block
      color="primary"
      size="large"
      rounded="lg"
      class="text-none mb-12"
      style="max-width: 360px;"
    >
      {{ $t('forgot_password.send_otp') }}
      <v-icon end>mdi-arrow-right</v-icon>
    </v-btn>

    <!-- Footer -->
    <div class="text-body-2 text-medium-emphasis mb-2">
      {{ $t('forgot_password.remember_password') }} <span class="text-primary font-weight-bold cursor-pointer">{{ $t('forgot_password.login') }}</span>
    </div>
    
    <div class="d-flex align-center text-caption text-medium-emphasis">
      <v-icon size="small" class="mr-1">mdi-help-circle</v-icon>
      {{ $t('forgot_password.contact_support') }}
    </div>

  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const phone = ref('');
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
