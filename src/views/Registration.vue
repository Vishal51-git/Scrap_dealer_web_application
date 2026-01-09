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

        <v-card class="w-100 pa-6 rounded-xl" style="max-width: 400px;" border elevation="0">
            <!-- Step 1: Details -->
            <div v-if="step === 1">
                <div class="text-subtitle-2 font-weight-bold mb-1 ml-1">Full Name</div>
                <v-text-field
                    v-model="name"
                    placeholder="John Doe"
                    variant="outlined"
                    density="comfortable"
                    bg-color="surface-light"
                    rounded="lg"
                    hide-details
                    class="mb-4"
                ></v-text-field>

                <div class="text-subtitle-2 font-weight-bold mb-1 ml-1">Mobile Number</div>
                <v-text-field
                    v-model="mobile"
                    type="tel"
                    placeholder="98765 43210"
                    variant="outlined"
                    density="comfortable"
                    bg-color="surface-light"
                    rounded="lg"
                    hide-details
                    class="mb-6"
                    prepend-inner-icon="mdi-cellphone"
                ></v-text-field>

                <div class="text-subtitle-2 font-weight-bold mb-2 ml-1">Select Role</div>
                <v-sheet class="bg-surface-light rounded-lg pa-1 mb-6 border">
                     <v-row dense>
                        <v-col cols="6">
                            <v-btn 
                                block 
                                rounded="lg"
                                :color="role === 'Normal User' ? 'white' : 'transparent'"
                                :elevation="role === 'Normal User' ? 1 : 0"
                                class="text-none font-weight-bold"
                                :class="role === 'Normal User' ? 'text-primary' : 'text-medium-emphasis'"
                                @click="role = 'Normal User'"
                            >
                                Normal User
                            </v-btn>
                        </v-col>
                        <v-col cols="6">
                            <v-btn 
                                block 
                                rounded="lg" 
                                :color="role === 'Super Admin' ? 'white' : 'transparent'"
                                :elevation="role === 'Super Admin' ? 1 : 0"
                                class="text-none font-weight-bold"
                                :class="role === 'Super Admin' ? 'text-primary' : 'text-medium-emphasis'"
                                @click="role = 'Super Admin'"
                            >
                                Super Admin
                            </v-btn>
                        </v-col>
                     </v-row>
                </v-sheet>

                <v-btn block color="primary" size="large" rounded="lg" @click="requestOtp" :loading="loading">
                    Get OTP <v-icon end>mdi-arrow-right</v-icon>
                </v-btn>
            </div>

            <!-- Step 2: OTP -->
            <div v-else>
                <div class="text-center mb-6">
                    <div class="text-subtitle-1 font-weight-bold">Verify Mobile Number</div>
                    <div class="text-caption text-medium-emphasis">OTP sent to +91 {{ mobile }}</div>
                </div>

                <v-otp-input
                    v-model="otp"
                    length="6"
                    variant="outlined"
                    class="mb-6"
                ></v-otp-input>

                <v-btn block color="primary" size="large" rounded="lg" @click="verifyAndRegister" :loading="loading">
                    Verify & Register
                </v-btn>
                
                <v-btn variant="text" block class="mt-2 text-none" color="medium-emphasis" @click="step = 1">
                    Change Mobile Number
                </v-btn>
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

const step = ref(1);
const name = ref('');
const mobile = ref('');
const role = ref<'Normal User' | 'Super Admin'>('Normal User');
const otp = ref('');
const loading = ref(false);

const authStore = useAuthStore();
const router = useRouter();
const snackbar = useSnackbarStore();

const requestOtp = async () => {
    if (!name.value || !mobile.value) {
        snackbar.showSnackbar('Please enter all details', 'warning');
        return;
    }
    
    loading.value = true;
    try {
        await authStore.sendOtp(mobile.value);
        step.value = 2;
        snackbar.showSnackbar('OTP Sent: 123456', 'info');
    } finally {
        loading.value = false;
    }
};

const verifyAndRegister = async () => {
    if (otp.value.length !== 6) return;
    
    loading.value = true;
    try {
        const isValid = await authStore.verifyOtp(mobile.value, otp.value);
        if (isValid) {
            authStore.register({
                name: name.value,
                mobile: mobile.value,
                role: role.value
            });
            snackbar.showSnackbar('Registration Successful!', 'success');
            router.push('/');
        } else {
            snackbar.showSnackbar('Invalid OTP', 'error');
        }
    } finally {
        loading.value = false;
    }
};
</script>
