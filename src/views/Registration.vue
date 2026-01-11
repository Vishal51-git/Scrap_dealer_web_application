<template>
  <v-app>
    <v-main class="bg-background">
      <v-container class="fill-height flex-column justify-center align-center">
        <!-- Logo -->
        <div class="d-flex flex-column align-center mb-6">
            <v-card color="primary-lighten-4" class="d-flex align-center justify-center mb-4" height="80" width="80" elevation="0" rounded="xl">
                <v-icon color="primary" size="40">mdi-account-plus</v-icon>
            </v-card>
            <h1 class="text-h4 font-weight-bold text-primary">Create Account</h1>
            <p class="text-body-1 text-medium-emphasis">Join the team</p>
        </div>

        <v-card class="w-100 pa-6 rounded-xl mx-4" style="max-width: 400px;" border elevation="0">
            <!-- Registration Form -->
            <div>
              <v-form v-model="form" @submit.prevent="handleRegister">
                <div class="text-subtitle-2 font-weight-bold mb-1 ml-1">Full Name</div>
                <v-text-field
                    v-model="name"
                    :rules="nameRules"
                    placeholder="John Doe"
                    variant="outlined"
                    density="comfortable"
                    bg-color="surface-light"
                    rounded="lg"
                    class="mb-3"
                    prepend-inner-icon="mdi-account"
                ></v-text-field>

                <div class="text-subtitle-2 font-weight-bold mb-1 ml-1">Email Address</div>
                <v-text-field
                    v-model="email"
                    :rules="emailRules"
                    type="email"
                    placeholder="john@example.com"
                    variant="outlined"
                    density="comfortable"
                    bg-color="surface-light"
                    rounded="lg"
                    class="mb-3"
                    prepend-inner-icon="mdi-email"
                ></v-text-field>

                <div class="text-subtitle-2 font-weight-bold mb-1 ml-1">Mobile Number (Optional)</div>
                <v-text-field
                    v-model="mobile"
                    :rules="mobileRules"
                    type="tel"
                    placeholder="98765 43210"
                    variant="outlined"
                    density="comfortable"
                    bg-color="surface-light"
                    rounded="lg"
                    class="mb-3"
                    prepend-inner-icon="mdi-cellphone"
                ></v-text-field>

                <div class="text-subtitle-2 font-weight-bold mb-1 ml-1">Password</div>
                <v-text-field
                    v-model="password"
                    :rules="passwordRules"
                    type="password"
                    placeholder="Create a password"
                    variant="outlined"
                    density="comfortable"
                    bg-color="surface-light"
                    rounded="lg"
                    class="mb-6"
                    prepend-inner-icon="mdi-lock"
                ></v-text-field>

                <v-btn block color="primary" size="large" rounded="lg" type="submit" :loading="loading" :disabled="!form">
                    Create Account
                </v-btn>
              </v-form>
            </div>
        </v-card>
        
        <div class="mt-6 text-center">
            <span class="text-caption text-medium-emphasis">Already have an account?</span>
            <v-btn variant="text" density="compact" class="px-1 text-none font-weight-bold" color="primary" to="/login">Login</v-btn>
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

const name = ref('');
const email = ref('');
const mobile = ref('');
const password = ref('');
const loading = ref(false);

const authStore = useAuthStore();
const router = useRouter();
const snackbar = useSnackbarStore();


const form = ref(false);
const nameRules = [(v: string) => !!v || 'Name is required'];
const emailRules = [
    (v: string) => !!v || 'Email is required',
    (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email address'
];
const mobileRules = [
    (v: string) => !v || /^\d{10}$/.test(v) || 'Mobile must be 10 digits'
];
const passwordRules = [(v: string) => !!v || 'Password is required'];

const handleRegister = async () => {
    if (!form.value) return;
    
    loading.value = true;
    try {
        await authStore.register({
            name: name.value,
            email: email.value,
            mobile: mobile.value,
            role: 'customer',
            password: password.value
        });
        snackbar.showSnackbar('Registration Successful!', 'success');
        router.push('/');
    } finally {
        loading.value = false;
    }
};
</script>
