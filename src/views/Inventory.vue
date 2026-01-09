<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <v-btn icon="mdi-chevron-left" variant="text" @click="$router.back()"></v-btn>
      <h1 class="text-h6 font-weight-bold">{{ $t('item_rates.title') }}</h1>
      <v-btn icon="mdi-plus" variant="flat" color="primary" size="small" class="rounded-circle" @click="openAddModal"></v-btn>
    </div>

    <!-- Search -->
    <v-text-field
      v-model="store.searchQuery"
      prepend-inner-icon="mdi-magnify"
      :label="$t('item_rates.search_placeholder')"
      variant="outlined"
      density="comfortable"
      rounded="lg"
      hide-details
      class="mb-4 bg-surface"
    ></v-text-field>

    <!-- Tabs -->
    <div class="d-flex overflow-x-auto mb-4" style="gap: 8px; scrollbar-width: none;">
      <v-chip
        v-for="cat in categories"
        :key="cat.value"
        :color="store.categoryFilter === cat.value ? 'primary' : undefined"
        :variant="store.categoryFilter === cat.value ? 'flat' : 'outlined'"
        :class="store.categoryFilter === cat.value ? '' : 'bg-surface'"
        size="large"
        @click="store.categoryFilter = cat.value"
      >
        {{ cat.title }}
      </v-chip>
    </div>

    <!-- Titles -->
    <div class="d-flex justify-space-between text-caption text-medium-emphasis font-weight-bold mb-2 px-2">
      <span>{{ $t('item_rates.headers.name') }}</span>
      <div class="d-flex" style="gap: 40px;">
          <span>Stock</span>
          <span>{{ $t('item_rates.headers.price_unit') }}</span>
      </div>
    </div>

    <!-- Items List -->
    <template v-if="store.filteredItems.length > 0">
        <v-card v-for="item in store.filteredItems" :key="item.id" class="mb-3 rounded-xl" elevation="0" border @click="openEditModal(item)">
        <div class="d-flex align-center pa-3">
            <!-- Icon -->
            <v-avatar :color="item.color" class="mr-3" rounded="lg">
            <v-icon :color="item.iconColor">{{ item.icon }}</v-icon>
            </v-avatar>
            
            <!-- Details -->
            <div class="flex-grow-1">
            <div class="text-subtitle-1 font-weight-bold">{{ item.name }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.description }}</div>
            </div>

            <!-- Stock & Price -->
            <div class="text-right d-flex align-center">
             <div class="mr-6 d-none d-sm-block">
                <div class="text-body-2 font-weight-bold">{{ item.quantity }} {{ item.unit }}</div>
             </div>
            
            <div>
                 <div class="text-subtitle-1 font-weight-bold">{{ settings.formatCurrency(item.price) }}</div>
                <div class="text-caption text-medium-emphasis">per {{ item.unit }}</div>
            </div>
            
            </div>
            
            <v-btn icon="mdi-chevron-right" variant="text" density="compact" class="ml-1" color="grey"></v-btn>
        </div>
        </v-card>
    </template>
    <div v-else class="text-center py-8 text-medium-emphasis">
        No items found.
    </div>

    <!-- New Item FAB -->
    <v-btn position="fixed" location="bottom right" color="primary" prepend-icon="mdi-plus" size="large" elevation="4" class="mb-2 mr-4 rounded-pill text-none" style="z-index: 100; bottom: 80px;" @click="openAddModal">
      {{ $t('item_rates.new_item') }}
    </v-btn>

    <!-- Add/Edit Dialog - Now a Side Drawer -->
    <v-navigation-drawer
      v-model="showModal"
      location="right"
      temporary
      width="500"
      class="h-100"
      app
    >
      <div class="d-flex flex-column h-100 bg-surface"> 
        <v-toolbar color="transparent" class="px-2 border-b">
          <v-btn icon="mdi-close" variant="text" @click="closeModal"></v-btn>
          <div class="flex-grow-1 text-center">
            <span class="text-h6 font-weight-bold">{{ isEditing ? 'Edit Item' : 'Add New Item' }}</span>
          </div>
          <v-btn variant="text" color="primary" @click="saveItem" :disabled="!isValid">Save</v-btn>
        </v-toolbar>
        
        <div class="flex-grow-1 overflow-y-auto px-6 py-6 mb-8">
          <v-form v-model="isValid">
            
            <!-- Icon/Color Picker (Simplified) -->
             <div class="d-flex justify-center mb-6">
                 <v-avatar :color="editedItem.color || 'grey-lighten-4'" size="80" class="rounded-xl">
                      <v-icon :color="editedItem.iconColor || 'grey'" size="40">{{ editedItem.icon || 'mdi-package-variant' }}</v-icon>
                 </v-avatar>
             </div>

            <v-text-field
                v-model="editedItem.name"
                label="Item Name"
                variant="outlined"
                density="comfortable"
                class="mb-2"
                :rules="[v => !!v || 'Name is required']"
            ></v-text-field>
            
            <v-text-field
                v-model="editedItem.description"
                label="Description"
                variant="outlined"
                density="comfortable"
                class="mb-2"
            ></v-text-field>

             <v-select
                v-model="editedItem.category"
                :items="categoryOptions"
                label="Category"
                variant="outlined"
                density="comfortable"
                class="mb-2"
                item-title="title"
                item-value="value"
                :menu-props="{ zIndex: 20000 }"
             ></v-select>

            <div class="d-flex" style="gap: 12px;">
                 <v-text-field
                    v-model.number="editedItem.price"
                     label="Price"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2 flex-grow-1"
                    type="number"
                     prefix="$"
                    :rules="[v => v >= 0 || 'Price must be positive']"
                ></v-text-field>
                
                 <v-text-field
                    v-model="editedItem.unit"
                     label="Unit"
                    variant="outlined"
                    density="comfortable"
                    class="mb-2"
                    style="max-width: 100px;"
                ></v-text-field>
            </div>
            
             <v-text-field
                v-model.number="editedItem.quantity"
                 label="Current Stock"
                variant="outlined"
                density="comfortable"
                class="mb-4"
                type="number"
                :rules="[v => v >= 0 || 'Stock must be positive']"
            ></v-text-field>

             <!-- Quick Stock adjustments for Edit Mode -->
             <div v-if="isEditing" class="mb-6">
                 <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase mb-2">Quick Stock Adjustment</div>
                 <div class="d-flex justify-space-between px-2">
                     <v-btn variant="tonal" color="error" size="small" @click="editedItem.quantity = Math.max(0, (editedItem.quantity || 0) - 10)">-10</v-btn>
                     <v-btn variant="tonal" color="error" size="small" @click="editedItem.quantity = Math.max(0, (editedItem.quantity || 0) - 1)">-1</v-btn>
                     <v-btn variant="tonal" color="success" size="small" @click="editedItem.quantity = (editedItem.quantity || 0) + 1">+1</v-btn>
                     <v-btn variant="tonal" color="success" size="small" @click="editedItem.quantity = (editedItem.quantity || 0) + 10">+10</v-btn>
                 </div>
             </div>

            <v-btn v-if="isEditing" block variant="outlined" color="error" class="mb-4" rounded="lg" size="large" prepend-icon="mdi-delete" @click="confirmDelete = true">
              Delete Item
            </v-btn>

          </v-form>
        </div>
      </div>
    </v-navigation-drawer>
    
    <!-- Delete Confirmation -->
     <ConfirmDeleteDialog 
        v-model="confirmDelete" 
        title="Delete Item?" 
        message="Are you sure you want to delete "
        :itemName="editedItem.name"
        @confirm="deleteItem"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { useInventoryStore, type InventoryItem } from '../stores/inventory';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog.vue';

const settings = useSettingsStore();
const store = useInventoryStore();

const showModal = ref(false);
const confirmDelete = ref(false);
const isEditing = ref(false);
const isValid = ref(false);

interface FormState extends Omit<InventoryItem, 'id'> {
    id?: string;
}

const defaultItem: FormState = {
    name: '',
    description: '',
    price: 0,
    unit: 'kg',
    category: 'other',
    quantity: 0,
    icon: 'mdi-package-variant',
    color: 'grey-lighten-5',
    iconColor: 'grey'
};

const editedItem = reactive<FormState>({ ...defaultItem });

const categories = [
    { title: 'All Items', value: 'all' },
    { title: 'Metals', value: 'metal' },
    { title: 'Papers', value: 'paper' },
    { title: 'Plastics', value: 'plastic' },
    { title: 'Electronics', value: 'electronic' },
    { title: 'Other', value: 'other' }
];

const categoryOptions = categories.filter(c => c.value !== 'all');

const openAddModal = () => {
    Object.assign(editedItem, JSON.parse(JSON.stringify(defaultItem)));
    isEditing.value = false;
    showModal.value = true;
};

const openEditModal = (item: InventoryItem) => {
    Object.assign(editedItem, JSON.parse(JSON.stringify(item)));
    isEditing.value = true;
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const saveItem = () => {
    // Basic logic to assign icon/color based on category if not set (simplified)
    if (!editedItem.icon || editedItem.icon === 'mdi-package-variant') {
        switch(editedItem.category) {
            case 'metal': editedItem.icon = 'mdi-hammer'; editedItem.color = 'blue-lighten-5'; editedItem.iconColor = 'primary'; break;
            case 'paper': editedItem.icon = 'mdi-newspaper'; editedItem.color = 'blue-grey-lighten-5'; editedItem.iconColor = 'blue-grey'; break;
            case 'plastic': editedItem.icon = 'mdi-bottle-soda'; editedItem.color = 'cyan-lighten-5'; editedItem.iconColor = 'cyan'; break;
            case 'electronic': editedItem.icon = 'mdi-chip'; editedItem.color = 'purple-lighten-5'; editedItem.iconColor = 'purple'; break;
        }
    }

    if (isEditing.value && editedItem.id) {
        store.updateItem(editedItem.id, editedItem);
    } else {
        const { id, ...newItem } = editedItem;
        store.addItem(newItem);
    }
    closeModal();
};

const deleteItem = () => {
    if (editedItem.id) {
        store.deleteItem(editedItem.id);
        confirmDelete.value = false;
        closeModal();
    }
};

</script>

