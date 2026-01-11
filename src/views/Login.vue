<template>
  <v-app>
    <v-main class="bg-background">
      <v-container class="fill-height flex-column justify-center align-center">
        <!-- Logo/Icon -->
        <v-card color="primary-lighten-4" class="d-flex align-center justify-center mb-6" height="100" width="100" elevation="0" rounded="xl">
          <v-icon color="primary" size="48">mdi-recycle</v-icon>
        </v-card>

        <h1 class="text-h4 font-weight-bold text-primary mb-2">Welcome Back</h1>
        <p class="text-body-1 text-medium-emphasis text-center mb-8 px-4" style="max-width: 320px;">
          {{ $t('login.subtitle') }}
        </p>

        <!-- Login Form -->
        <div class="w-100 px-4" style="max-width: 360px;">
          <v-form v-model="form" @submit.prevent="handleLogin">
          <div class="text-subtitle-2 font-weight-bold mb-2 ml-1">Email Address</div>
          <v-text-field
            v-model="email"
            :rules="emailRules"
            placeholder="name@example.com"
            variant="outlined"
            bg-color="surface"
            rounded="lg"
            class="mb-4"
          >
            <template v-slot:append-inner>
              <v-icon color="medium-emphasis">mdi-email</v-icon>
            </template>
          </v-text-field>

          <div class="text-subtitle-2 font-weight-bold mb-2 ml-1">Password</div>
           <v-text-field
            v-model="password"
            :rules="passwordRules"
            placeholder="Type your password"
            variant="outlined"
            bg-color="surface"
            rounded="lg"
            type="password"
            class="mb-6"
          >
            <template v-slot:append-inner>
              <v-icon color="medium-emphasis">mdi-lock</v-icon>
            </template>
          </v-text-field>

          <v-btn
            block
            color="primary"
            size="large"
            rounded="lg"
            class="text-none mb-6"
            type="submit"
            :loading="loading"
            :disabled="!form"
          >
            Login <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
          </v-form>
          
           <div class="text-center">
             <span class="text-caption text-medium-emphasis">Don't have an account? </span>
             <v-btn variant="text" density="compact" class="px-1 text-none font-weight-bold" color="primary" to="/register">Create Account</v-btn>
           </div>
        </div>

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
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import { useSnackbarStore } from '../stores/snackbar';

const authStore = useAuthStore();
const router = useRouter();
const snackbar = useSnackbarStore();

const email = ref('');
const password = ref('');
const loading = ref(false);


const form = ref(false);
const emailRules = [
    (v: string) => !!v || 'Email is required',
    (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email address'
];
const passwordRules = [
    (v: string) => !!v || 'Password is required'
];

const handleLogin = async () => {
    if (!form.value) return; 

    loading.value = true;

    try {
        const success = await authStore.login(email.value, password.value);
        if (success) {
            snackbar.showSnackbar('Login Successful', 'success');
            router.push('/');
        } else {
            snackbar.showSnackbar('Invalid credentials. For Super Admin use superadmin@gmail.com / admin123', 'error');
        }
    } finally {
        loading.value = false;
    }
};
</script>
