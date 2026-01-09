<template>
  <div class="h-100 position-relative">
    <!-- Permissions Modal (Edit/Create) - Now a Side Drawer -->
    <v-navigation-drawer
      v-model="showModal"
      location="right"
      temporary
      width="500"
      class="h-100 mb-8"
      style="z-index: 9999;"
      app
    >
      <div class="d-flex flex-column h-100 bg-surface">
        <v-toolbar color="transparent" class="px-2 border-b">
           <v-btn icon="mdi-close" variant="text" @click="closeModal"></v-btn>
          <v-spacer></v-spacer>
          <div class="flex-grow-1 text-center">
            <span class="text-h6 font-weight-bold">{{ isEditing ? 'Edit Member' : 'Add New Member' }}</span>
          </div>
           <v-btn variant="text" color="primary" @click="saveMember" :disabled="!isValid">Save</v-btn>
        </v-toolbar>
        
        <div class="flex-grow-1 overflow-y-auto px-6 py-6 mb-8">
          <v-form v-model="isValid">
           <div class="d-flex flex-column align-center mb-6">
             <!-- Avatar Selection (Mock) -->
               <v-avatar size="80" class="mb-4" color="grey-lighten-3">
                   <v-img v-if="editedItem.avatar" :src="editedItem.avatar"></v-img>
                   <v-icon v-else size="40" color="grey">mdi-account</v-icon>
               </v-avatar>
               <v-btn variant="text" size="small" color="primary">Change Photo</v-btn>
           </div>

            <v-text-field
                v-model="editedItem.name"
                label="Full Name"
                variant="outlined"
                density="comfortable"
                class="mb-2"
                :rules="[v => !!v || 'Name is required']"
            ></v-text-field>
            
            <v-text-field
                v-model="editedItem.email"
                label="Email Address"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                 :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'E-mail must be valid']"
            ></v-text-field>

          <!-- Role Toggle -->
          <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase mb-2">{{ $t('team.permissions.role_assignment') }}</div>
          <v-btn-toggle v-model="editedItem.role" color="primary" mandatory shaped class="w-100 mb-6 border" density="comfortable">
            <v-btn value="admin" class="flex-grow-1 text-none">{{ $t('team.permissions.roles.admin') }}</v-btn>
            <v-btn value="staff" class="flex-grow-1 text-none">{{ $t('team.permissions.roles.staff') }}</v-btn>
            <v-btn value="viewer" class="flex-grow-1 text-none">{{ $t('team.permissions.roles.viewer') }}</v-btn>
          </v-btn-toggle>

          <!-- Permissions List -->
          <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase mb-2">{{ $t('team.permissions.specific_permissions') }}</div>
          
          <div class="d-flex justify-space-between align-center py-2">
            <div>
              <div class="text-subtitle-1 font-weight-bold">{{ $t('team.permissions.create_invoices') }}</div>
              <div class="text-caption text-medium-emphasis">{{ $t('team.permissions.create_invoices_desc') }}</div>
            </div>
            <v-switch v-model="editedItem.permissions.createInvoices" color="success" hide-details inset density="compact"></v-switch>
          </div>
          <v-divider class="mb-2 border-opacity-50"></v-divider>

          <div class="d-flex justify-space-between align-center py-2">
            <div>
              <div class="text-subtitle-1 font-weight-bold">{{ $t('team.permissions.delete_records') }}</div>
              <div class="text-caption text-medium-emphasis">{{ $t('team.permissions.delete_records_desc') }}</div>
            </div>
             <v-switch v-model="editedItem.permissions.deleteRecords" color="success" hide-details inset density="compact"></v-switch>
          </div>
          <v-divider class="mb-2 border-opacity-50"></v-divider>

           <div class="d-flex justify-space-between align-center py-2 mb-6">
            <div>
              <div class="text-subtitle-1 font-weight-bold">{{ $t('team.permissions.export_reports') }}</div>
              <div class="text-caption text-medium-emphasis">{{ $t('team.permissions.export_reports_desc') }}</div>
            </div>
             <v-switch v-model="editedItem.permissions.exportReports" color="success" hide-details inset density="compact"></v-switch>
          </div>

          <v-btn v-if="isEditing" block variant="outlined" color="error" class="mb-4" rounded="lg" size="large" prepend-icon="mdi-account-remove" @click="confirmDelete = true">
            {{ $t('team.permissions.revoke_access') }}
          </v-btn>

          </v-form>
        </div>
      </div>
    </v-navigation-drawer>

    <div class="pa-4" style="max-width: 800px; margin: 0 auto;">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-4">
          <v-btn icon="mdi-chevron-left" variant="text" @click="$router.back()"></v-btn>
          <h1 class="text-h6 font-weight-bold">{{ $t('team.title') }}</h1>
          <v-btn icon="mdi-account-plus" variant="text" color="primary" @click="openAddModal"></v-btn>
        </div>

        <!-- Search -->
        <v-text-field
          v-model="store.searchQuery"
          prepend-inner-icon="mdi-magnify"
          :label="$t('team.search_placeholder')"
          variant="filled"
          rounded="lg"
          hide-details
          class="mb-6 rounded-lg"
          bg-color="surface-light"
        ></v-text-field>

        <!-- Filters -->
        <div class="d-flex overflow-x-auto mb-4" style="gap: 8px; scrollbar-width: none;">
          <v-chip 
            :color="store.currentFilter === 'all' ? 'secondary' : undefined" 
            :variant="store.currentFilter === 'all' ? 'flat' : 'text'" 
            :class="store.currentFilter === 'all' ? 'text-white bg-grey-darken-3 font-weight-bold' : 'text-medium-emphasis'"
            @click="store.currentFilter = 'all'"
          >
            {{ $t('team.filters.all') }}
          </v-chip>
          <v-chip 
            :color="store.currentFilter === 'admin' ? 'secondary' : undefined" 
            :variant="store.currentFilter === 'admin' ? 'flat' : 'text'"
            :class="store.currentFilter === 'admin' ? 'text-white bg-grey-darken-3 font-weight-bold' : 'text-medium-emphasis'"
            @click="store.currentFilter = 'admin'"
          >
            {{ $t('team.filters.admins') }}
          </v-chip>
           <v-chip 
            :color="store.currentFilter === 'staff' ? 'secondary' : undefined" 
            :variant="store.currentFilter === 'staff' ? 'flat' : 'text'"
            :class="store.currentFilter === 'staff' ? 'text-white bg-grey-darken-3 font-weight-bold' : 'text-medium-emphasis'"
             @click="store.currentFilter = 'staff'"
          >
            {{ $t('team.filters.data_entry') }}
          </v-chip>
           <v-chip 
            :color="store.currentFilter === 'viewer' ? 'secondary' : undefined" 
            :variant="store.currentFilter === 'viewer' ? 'flat' : 'text'"
            :class="store.currentFilter === 'viewer' ? 'text-white bg-grey-darken-3 font-weight-bold' : 'text-medium-emphasis'"
             @click="store.currentFilter = 'viewer'"
          >
            {{ $t('team.filters.viewers') }}
          </v-chip>
        </div>

        <!-- Team List -->
         <div class="d-flex justify-space-between align-center mb-3">
          <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase">{{ $t('team.sections.staff_members') }}</div>
          <div class="text-caption text-medium-emphasis font-weight-bold">{{ $t('team.sections.active', { count: store.filteredMembers.length }) }}</div>
        </div>

        <v-card class="rounded-xl mb-4" elevation="0" border v-if="store.filteredMembers.length > 0">
           <template v-for="(member, index) in store.filteredMembers" :key="member.id">
            <v-list-item class="py-3" @click="openEditModal(member)">
              <template v-slot:prepend>
                <div class="position-relative mr-4">
                  <v-avatar size="48" :image="member.avatar"></v-avatar>
                  <v-avatar :color="getRoleColor(member.role)" size="12" class="position-absolute" style="bottom: 0; right: 0; border: 2px solid white;"></v-avatar>
                </div>
              </template>
              <v-list-item-title class="font-weight-bold">{{ member.name }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">{{ member.email }}</v-list-item-subtitle>
              <template v-slot:append>
                <v-chip size="x-small" :color="getRoleColor(member.role)" label variant="flat" class="mr-2">{{ member.role.toUpperCase() }}</v-chip>
                <v-icon size="small" color="grey">mdi-chevron-right</v-icon>
              </template>
            </v-list-item>
             <v-divider v-if="index < store.filteredMembers.length - 1" inset></v-divider>
           </template>
        </v-card>
        
        <div v-else class="text-center py-8 text-medium-emphasis">
            No team members found matching your criteria.
        </div>

        <!-- Delete Confirmation Dialog -->
        <ConfirmDeleteDialog 
            v-model="confirmDelete" 
            title="Revoke Access?"
            message="Are you sure you want to remove "
            :itemName="editedItem.name"
            @confirm="deleteMember"
        />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useTeamStore, type TeamMember } from '../stores/team';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog.vue';

const store = useTeamStore();
const showModal = ref(false);
const confirmDelete = ref(false);
const isValid = ref(false);
const isEditing = ref(false);

// Form State Interface - excludes ID for new items, but keeps permissions required
interface FormState extends Omit<TeamMember, 'id'> {
    id?: string;
}

const defaultItem: FormState = {
    name: '',
    email: '',
    role: 'staff',
    avatar: 'https://avataaars.io/?avatarStyle=Circle&topType=NoHair&accessoriesType=Blank&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light',
    permissions: {
        createInvoices: true,
        deleteRecords: false,
        exportReports: true
    },
    isActive: true
};

const editedItem = reactive<FormState>({ ...defaultItem });

const openAddModal = () => {
    Object.assign(editedItem, JSON.parse(JSON.stringify(defaultItem))); // Deep copy reset
    isEditing.value = false;
    showModal.value = true;
};

const openEditModal = (member: TeamMember) => {
    Object.assign(editedItem, JSON.parse(JSON.stringify(member)));
    isEditing.value = true;
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const saveMember = () => {
    if (isEditing.value && editedItem.id) {
        store.updateMember(editedItem.id, editedItem);
    } else {
        const { id, ...newItem } = editedItem;
        store.addMember(newItem);
    }
    closeModal();
};

const deleteMember = () => {
    if (editedItem.id) {
        store.removeMember(editedItem.id);
        confirmDelete.value = false;
        closeModal();
    }
};

const getRoleColor = (role: string) => {
    switch (role) {
        case 'admin': return 'success';
        case 'staff': return 'primary';
        case 'viewer': return 'grey';
        default: return 'grey';
    }
};
</script>
<style scoped>
.v-navigation-drawer__scrim{
  background: none !important;
}
</style>

