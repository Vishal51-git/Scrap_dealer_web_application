<template>
  <div class="h-100 position-relative">
    <div class="pa-4 bg-background h-100 d-flex flex-column container-max-width">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-4">
          <v-btn icon="mdi-chevron-left" variant="text" @click="$router.back()"></v-btn>
          <h1 class="text-h6 font-weight-bold">{{ $t('super_admin.title') }}</h1>
          <div style="width: 48px;"></div> <!-- Spacer for alignment -->
        </div>

        <!-- Stats Overview -->
        <div class="d-flex overflow-x-auto mb-6 ga-3 pb-2" style="scrollbar-width: none;">
            <v-card class="flex-shrink-0 px-4 py-3 rounded-xl border" elevation="0" min-width="140">
                <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold mb-1">Total Users</div>
                <div class="text-h5 font-weight-bold">{{ customerStore.customers.length }}</div>
            </v-card>
             <v-card class="flex-shrink-0 px-4 py-3 rounded-xl border" elevation="0" min-width="140">
                <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold mb-1">Active</div>
                <div class="text-h5 font-weight-bold text-success">{{ customerStore.customers.filter(c => c.status === 'active').length }}</div>
            </v-card>
             <v-card class="flex-shrink-0 px-4 py-3 rounded-xl border" elevation="0" min-width="140">
                <div class="text-caption text-medium-emphasis text-uppercase font-weight-bold mb-1">Pending</div>
                <div class="text-h5 font-weight-bold text-warning">{{ customerStore.customers.filter(c => c.status === 'pending').length }}</div>
            </v-card>
        </div>

        <!-- Search -->
        <v-text-field
          v-model="customerStore.searchQuery"
          prepend-inner-icon="mdi-magnify"
          :label="$t('super_admin.search_placeholder')"
          variant="filled"
          rounded="lg"
          hide-details
          class="mb-4 rounded-lg flex-grow-0"
          bg-color="surface-light"
        ></v-text-field>

        <!-- Customer List -->
        <div class="d-flex justify-space-between align-center mb-2">
          <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase">{{ $t('super_admin.registered_customers') }}</div>
        </div>

        <div class="flex-grow-1 overflow-y-auto">
            <v-card class="rounded-xl border mb-2" elevation="0" v-if="customerStore.filteredCustomers().length > 0">
                <template v-for="(customer, index) in customerStore.filteredCustomers()" :key="customer.id">
                    <v-list-item class="py-3">
                        <template v-slot:prepend>
                            <v-avatar size="50" class="mr-3 bg-surface-variant">
                                <v-img v-if="customer.avatar" :src="customer.avatar"></v-img>
                                <span v-else class="text-h6 font-weight-bold primary--text">{{ customer.name.charAt(0) }}</span>
                            </v-avatar>
                        </template>

                        <v-list-item-title class="font-weight-bold mb-1">{{ customer.name }}</v-list-item-title>
                        <v-list-item-subtitle class="d-flex flex-column gap-1 text-caption text-medium-emphasis">
                            <div class="d-flex align-center">
                                <v-icon size="x-small" class="mr-1">mdi-phone</v-icon>
                                {{ customer.phone }}
                            </div>
                            <div class="d-flex align-center">
                                <v-icon size="x-small" class="mr-1">mdi-email</v-icon>
                                {{ customer.email }}
                            </div>
                        </v-list-item-subtitle>

                        <template v-slot:append>
                            <div class="d-flex flex-column align-end">
                                <v-chip 
                                    size="x-small" 
                                    :color="getStatusColor(customer.status)" 
                                    label 
                                    variant="flat" 
                                    class="mb-2 text-uppercase font-weight-bold"
                                >
                                    {{ customer.status }}
                                </v-chip>
                                <v-menu>
                                    <template v-slot:activator="{ props }">
                                        <v-btn icon="mdi-dots-vertical" variant="text" density="compact" v-bind="props"></v-btn>
                                    </template>
                                    <v-list density="compact" nav class="rounded-lg">
                                        <v-list-item value="view" prepend-icon="mdi-eye-outline" title="View Details" @click="openDrawer(customer, false)"></v-list-item>
                                        <v-list-item value="edit" prepend-icon="mdi-pencil-outline" title="Edit" @click="openDrawer(customer, true)"></v-list-item>
                                        <v-divider class="my-1"></v-divider>
                                        <v-list-item value="delete" prepend-icon="mdi-delete-outline" color="error" title="Delete" @click="confirmDelete(customer)"></v-list-item>
                                    </v-list>
                                </v-menu>
                            </div>
                        </template>
                    </v-list-item>
                    <v-divider v-if="index < customerStore.filteredCustomers().length - 1" inset></v-divider>
                </template>
            </v-card>
            <div v-else class="text-center py-10 text-medium-emphasis">
                <v-icon size="64" color="surface-variant" class="mb-4">mdi-account-off-outline</v-icon>
                <div>No customers found matching your search.</div>
            </div>
        </div>

         <!-- Delete Confirmation Dialog -->
        <ConfirmDeleteDialog 
            v-model="showConfirmDelete" 
            title="Delete Customer?"
            message="Are you sure you want to remove "
            :itemName="customerToDelete?.name || 'this customer'"
            @confirm="handleDelete"
        />

        <!-- Edit/View Drawer -->
        <v-navigation-drawer
            v-model="showDrawer"
            location="right"
            temporary
            width="500"
            class="h-100"
            app
        >
            <div class="d-flex flex-column h-100 bg-surface">
                <v-toolbar color="transparent" class="px-2 border-b">
                    <v-btn icon="mdi-close" variant="text" @click="closeDrawer"></v-btn>
                    <v-spacer></v-spacer>
                    <div class="flex-grow-1 text-center">
                        <span class="text-h6 font-weight-bold">{{ isEditing ? 'Edit Customer' : 'Customer Details' }}</span>
                    </div>
                    <v-btn v-if="isEditing" variant="text" color="primary" @click="saveCustomer" :disabled="!isValid">Save</v-btn>
                    <v-btn v-else variant="text" color="primary" @click="isEditing = true">Edit</v-btn>
                </v-toolbar>

                <div class="flex-grow-1 overflow-y-auto px-6 py-6" v-if="selectedCustomer">
                    <div class="d-flex flex-column align-center mb-6">
                        <v-avatar size="100" class="mb-4 bg-surface-variant">
                             <v-img v-if="selectedCustomer.avatar" :src="selectedCustomer.avatar"></v-img>
                             <span v-else class="text-h4 font-weight-bold primary--text">{{ selectedCustomer.name.charAt(0) }}</span>
                        </v-avatar>
                         <v-chip size="small" :color="getStatusColor(selectedCustomer.status)" label variant="flat" class="text-uppercase font-weight-bold">
                            {{ selectedCustomer.status }}
                        </v-chip>
                    </div>

                    <v-form v-model="isValid" :disabled="!isEditing">
                        <v-text-field
                            v-model="selectedCustomer.name"
                            label="Full Name"
                            variant="outlined"
                            density="comfortable"
                            class="mb-2"
                            prepend-inner-icon="mdi-account"
                            :readonly="!isEditing"
                            :rules="[v => !!v || 'Name is required']"
                        ></v-text-field>

                        <v-text-field
                            v-model="selectedCustomer.phone"
                            label="Phone Number"
                            variant="outlined"
                            density="comfortable"
                            class="mb-2"
                            prepend-inner-icon="mdi-phone"
                            :readonly="!isEditing"
                             :rules="[v => !!v || 'Phone is required']"
                        ></v-text-field>

                        <v-text-field
                            v-model="selectedCustomer.email"
                            label="Email Address"
                            variant="outlined"
                            density="comfortable"
                            class="mb-4"
                            prepend-inner-icon="mdi-email"
                            :readonly="!isEditing"
                             :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'E-mail must be valid']"
                        ></v-text-field>
                        
                         <v-select
                            v-if="isEditing"
                            v-model="selectedCustomer.status"
                            :items="['active', 'inactive', 'pending']"
                            label="Status"
                            variant="outlined"
                            density="comfortable"
                            class="mb-4"
                            prepend-inner-icon="mdi-list-status"
                        ></v-select>

                         <div v-if="!isEditing">
                            <v-row class="mb-2">
                                <v-col cols="5" class="text-caption text-medium-emphasis font-weight-bold text-uppercase">Joined Date</v-col>
                                <v-col cols="7" class="text-body-2 font-weight-bold">{{ selectedCustomer.joinedDate }}</v-col>
                            </v-row>
                             <v-divider class="my-3"></v-divider>
                        </div>

                    </v-form>
                </div>
            </div>
        </v-navigation-drawer>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCustomerStore, type Customer } from '../stores/customers';
import { useSnackbarStore } from '../stores/snackbar';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog.vue';

const customerStore = useCustomerStore();
const snackbar = useSnackbarStore();
const showConfirmDelete = ref(false);
const customerToDelete = ref<Customer | null>(null);

const showDrawer = ref(false);
const isEditing = ref(false);
const isValid = ref(false);
const selectedCustomer = ref<Customer | null>(null);

const getStatusColor = (status: string) => {
    switch(status) {
        case 'active': return 'success';
        case 'pending': return 'warning';
        case 'inactive': return 'error';
        default: return 'grey';
    }
};

const openDrawer = (customer: Customer, editMode: boolean = false) => {
    // Create a copy to avoid direct mutation until save
    selectedCustomer.value = JSON.parse(JSON.stringify(customer));
    isEditing.value = editMode;
    showDrawer.value = true;
};

const closeDrawer = () => {
    showDrawer.value = false;
    selectedCustomer.value = null;
};

const saveCustomer = () => {
    if (selectedCustomer.value && isValid.value) {
        customerStore.updateCustomer(selectedCustomer.value.id, selectedCustomer.value);
        snackbar.showSnackbar('Customer Updated Successfully', 'success');
        closeDrawer();
    }
};

const confirmDelete = (customer: Customer) => {
    customerToDelete.value = customer;
    showConfirmDelete.value = true;
};

const handleDelete = () => {
    if (customerToDelete.value) {
        customerStore.deleteCustomer(customerToDelete.value.id);
        snackbar.showSnackbar('Customer Deleted Successfully', 'info');
        showConfirmDelete.value = false;
        customerToDelete.value = null;
    }
};
</script>

<style scoped>
.container-max-width {
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
}
</style>
