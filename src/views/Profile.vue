<template>
  <v-app>
    <v-main class="bg-background">
      <div class="pa-4 pb-6" style="max-width: 600px; margin: 0 auto;">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <v-btn icon="mdi-chevron-left" variant="text" @click="$router.back()"></v-btn>
          <h1 class="text-h6 font-weight-bold">{{ $t('profile.title') }}</h1>
          <v-btn variant="text" color="primary" class="font-weight-bold" @click="saveProfile" :loading="saving">
            {{ $t('profile.save') }}
          </v-btn>
        </div>

        <!-- Avatar Section -->
        <div class="d-flex flex-column align-center mb-8">
          <div class="position-relative mb-4">
            <v-avatar size="120" image="https://avataaars.io/?avatarStyle=Circle&topType=ShortHairTheCaesarSidePart&accessoriesType=Prescription02&hairColor=BrownDark&facialHairType=BeardMedium&clotheType=ShirtCrewNeck&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light"></v-avatar>
            <v-btn icon="mdi-camera" size="small" color="primary" class="position-absolute" style="bottom: 0; right: 0; border: 3px solid white;"></v-btn>
          </div>
          <div class="d-flex align-center gap-2">
            <v-chip color="success" size="small" variant="flat" class="font-weight-bold">
              <v-icon start size="x-small">mdi-check-circle</v-icon>
              {{ $t('profile.account_active') }}
            </v-chip>
          </div>
          <div class="text-caption text-medium-emphasis mt-2">
            {{ $t('profile.member_since') }}: Jan 2024
          </div>
        </div>

        <!-- Edit Form -->
        <v-card class="rounded-xl pa-4 mb-6 border" elevation="0">
          <div class="text-caption font-weight-bold text-medium-emphasis mb-4 text-uppercase">{{ $t('profile.basic_info') }}</div>
          
          <div class="text-caption font-weight-bold text-medium-emphasis mb-1">{{ $t('profile.full_name') }}</div>
          <v-text-field
            v-model="form.name"
            variant="outlined"
            density="compact"
            bg-color="surface"
            prepend-inner-icon="mdi-account"
            class="mb-3 font-weight-bold"
            hide-details="auto"
          ></v-text-field>

          <div v-if="authStore.currentUser?.role === 'Super Admin'" class="text-caption font-weight-bold text-medium-emphasis mb-1">{{ $t('profile.role') }}</div>
          <v-text-field
            v-if="authStore.currentUser?.role === 'Super Admin'"
            :model-value="authStore.currentUser?.role || 'Normal User'"
            variant="outlined"
            density="compact"
            bg-color="surface-light"
            prepend-inner-icon="mdi-badge-account"
            readonly
            class="mb-3"
            hide-details
          ></v-text-field>
        </v-card>

        <v-card class="rounded-xl pa-4 mb-6 border" elevation="0">
           <div class="text-caption font-weight-bold text-medium-emphasis mb-4 text-uppercase">{{ $t('profile.contact_info') }}</div>

          <div class="text-caption font-weight-bold text-medium-emphasis mb-1">{{ $t('profile.mobile_number') }}</div>
          <v-text-field
            v-model="form.mobile"
            variant="outlined"
            density="compact"
            bg-color="surface"
            prepend-inner-icon="mdi-phone"
            class="mb-3 font-weight-bold"
            hide-details="auto"
          ></v-text-field>

          <div class="text-caption font-weight-bold text-medium-emphasis mb-1">{{ $t('profile.email') }}</div>
          <v-text-field
            v-model="form.email"
            variant="outlined"
            density="compact"
            bg-color="surface"
            prepend-inner-icon="mdi-email"
            class="mb-3"
            hide-details="auto"
            placeholder="john.doe@example.com"
          ></v-text-field>
        </v-card>

        <!-- Security -->
        <v-btn block variant="outlined" color="primary" class="rounded-lg mb-6" prepend-icon="mdi-lock-reset">
          {{ $t('profile.change_password') }}
        </v-btn>

        <div class="text-center text-caption text-error cursor-pointer">
          {{ $t('profile.delete_account') }}
        </div>

      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const saving = ref(false);

const form = reactive({
  name: authStore.currentUser?.name || 'Guest User',
  mobile: authStore.currentUser?.mobile || '',
  email: ''
});

const saveProfile = () => {
  saving.value = true;
  // Simulate API delay
  setTimeout(() => {
    authStore.updateProfile({
        name: form.name,
        mobile: form.mobile,
        email: form.email
    });
    saving.value = false;
  }, 1000);
};
</script>
