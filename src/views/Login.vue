<template>
  <v-app>
    <v-main class="bg-background">
      <v-container class="fill-height flex-column justify-center align-center">
        <!-- Logo/Icon -->
        <v-card color="primary-lighten-4" class="d-flex align-center justify-center mb-6" height="100" width="100" elevation="0" rounded="xl">
          <v-icon color="primary" size="48">mdi-recycle</v-icon>
        </v-card>

        <h1 class="text-h4 font-weight-bold text-primary mb-2">{{ $t('login.title') }}</h1>
        <p class="text-body-1 text-medium-emphasis text-center mb-8 px-4" style="max-width: 320px;">
          {{ $t('login.subtitle') }}
        </p>

        <!-- Step 1: Mobile Number -->
        <div v-if="step === 1" class="w-100" style="max-width: 360px;">
          <div class="text-subtitle-2 font-weight-bold mb-2 ml-1">{{ $t('login.mobile_number') }}</div>
          <v-text-field
            v-model="mobile"
            placeholder="e.g. 98765 43210"
            variant="outlined"
            bg-color="surface"
            rounded="lg"
            hide-details
            class="mb-6"
          >
            <template v-slot:append-inner>
              <v-icon color="medium-emphasis">mdi-cellphone</v-icon>
            </template>
          </v-text-field>

          <v-btn
            block
            color="primary"
            size="large"
            rounded="lg"
            class="text-none mb-6"
            @click="step = 2"
          >
            {{ $t('login.request_otp') }} <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>

          <div class="d-flex align-center w-100 my-4">
            <v-divider></v-divider>
            <span class="text-caption text-medium-emphasis mx-4">{{ $t('login.verification') }}</span>
            <v-divider></v-divider>
          </div>
        </div>

        <!-- Step 2: OTP Verification -->
        <v-card v-if="step === 2" class="w-100 pa-4 rounded-xl" style="max-width: 360px;" border elevation="0">
          <div class="d-flex justify-space-between align-center mb-4">
            <span class="text-subtitle-2 font-weight-bold">{{ $t('login.enter_otp') }}</span>
            <span class="text-caption text-primary">{{ $t('login.sent_to') }} ******{{ mobile.slice(-3) }}</span>
          </div>

          <div class="d-flex justify-center mb-4 bg-surface-light rounded-lg pa-4 border align-center" style="letter-spacing: 8px; font-weight: bold; font-size: 1.2rem;">
            - - - - - -
            <v-icon size="small" color="grey" class="ml-2">mdi-lock</v-icon>
          </div>

          <div class="d-flex justify-space-between align-center">
            <span class="text-caption text-medium-emphasis">{{ $t('login.resend_in') }} 00:24</span>
            <v-btn color="primary" class="text-none px-6" rounded="lg" to="/">{{ $t('login.verify') }}</v-btn>
          </div>
        </v-card>

        <!-- Footer -->
        <div class="d-flex align-center text-caption text-medium-emphasis mt-12 bg-transparent">
          <span class="mx-2">{{ $t('login.need_help') }}</span> • <span class="mx-2">{{ $t('login.terms') }}</span>
        </div>

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const step = ref(1);
const mobile = ref('');
</script>
