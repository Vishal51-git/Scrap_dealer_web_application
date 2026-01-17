<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold text-primary mb-1">{{ t('dealers.title') }}</h1>
        <div class="text-subtitle-1 text-medium-emphasis">{{ t('dealers.subtitle') }}</div>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()" elevation="2" class="text-none font-weight-bold">
        {{ t('dealers.add_dealer') }}
      </v-btn>
    </div>

    <!-- Dealers Table -->
    <v-card class="elevation-1 border rounded-lg">
      <v-data-table
        :headers="headers"
        :items="dealerStore.dealers"
        :search="search"
        hover
      >
        <template v-slot:top>
          <v-toolbar flat color="transparent" class="px-4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              :label="t('dealers.search_placeholder')"
              variant="outlined"
              density="compact"
              hide-details
              single-line
              class="mr-4"
              :style="$vuetify.display.mobile ? 'width: 100%; max-width: none;' : 'max-width: 300px;'"
            ></v-text-field>
          </v-toolbar>
        </template>

        <template v-slot:item.dealerName="{ item }">
          {{ item.title ? `${item.title} ` : '' }}{{ item.dealerName }}
        </template>

        <template v-slot:item.vehicles="{ item }">
          <v-chip-group>
            <v-chip v-for="vehicle in item.vehicles" :key="vehicle" size="x-small" label class="mr-1">
              {{ vehicle }}
            </v-chip>
            <span v-if="!item.vehicles.length" class="text-caption text-medium-emphasis font-italic">{{ t('dealers.no_vehicles') }}</span>
          </v-chip-group>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="d-flex justify-end">
             <v-btn icon size="small" variant="text" color="primary" class="mr-1" @click="openDialog(item)">
                <v-icon>mdi-pencil</v-icon>
                <v-tooltip activator="parent" location="top">{{ t('dealers.edit') }}</v-tooltip>
             </v-btn>
             <v-btn icon size="small" variant="text" color="error" @click="confirmDelete(item)">
                <v-icon>mdi-delete</v-icon>
                <v-tooltip activator="parent" location="top">{{ t('dealers.delete') }}</v-tooltip>
             </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" :max-width="$vuetify.display.mobile ? '100%' : '600px'" persistent scrollable>
      <v-card class="rounded-lg">
        <v-card-title class="pa-4 d-flex align-center justify-space-between bg-primary text-white">
          <span class="text-h6">{{ form.id ? t('dealers.edit_dealer') : t('dealers.add_new_dealer') }}</span>
          <v-btn icon="mdi-close" variant="text" size="small" color="white" @click="closeDialog"></v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4 pt-6">
          <v-form ref="formRef" v-model="valid" @submit.prevent="saveDealer">
            <v-row>
              <v-col cols="12" sm="3">
                <v-select
                  v-model="form.title"
                  :items="titleOptions"
                  label="Title"
                  variant="outlined"
                  hide-details="auto"
                ></v-select>
              </v-col>
              <v-col cols="12" sm="9">
                <v-text-field
                  v-model="form.dealerName"
                  :label="t('dealers.dealer_name')"
                  variant="outlined"
                  :rules="[v => !!v || 'Dealer Name is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="12">
                <v-text-field
                  v-model="form.firmName"
                  :label="t('dealers.firm_name')"
                  variant="outlined"
                  :rules="[v => !!v || 'Firm Name is required']"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.mobile"
                  label="Mobile Number"
                  variant="outlined"
                  type="number" 
                  :rules="[v => !!v || 'Mobile is required', v => /^\d+$/.test(v) || 'Numeric only', v => v.length === 10 || 'Mobile must be 10 digits']"
                  required
                ></v-text-field>
              </v-col>
               <v-col cols="12" sm="6">
                <v-text-field
                  v-model="form.gstNumber"
                  :label="t('dealers.gst_number')"
                  variant="outlined"
                  @input="upperCaseGST"
                  :rules="[
                    v => !!v || 'GST Number is required', 
                    v => v.length <= 15 || 'Max 15 characters',
                    v => /^[0-9A-Z]+$/.test(v) || 'Capital letters and numbers only',
                     v => v.length === 15 || 'GST Number must be 15 chars'
                  ]"
                  required
                  counter="15"
                ></v-text-field>
              </v-col>
               <v-col cols="12" sm="12">
                <v-textarea
                  v-model="form.address"
                  :label="t('dealers.firm_address')"
                  variant="outlined"
                  rows="2"
                  auto-grow
                ></v-textarea>
              </v-col>
            </v-row>

            <div class="mb-2 d-flex align-center justify-space-between">
              <span class="text-subtitle-2 font-weight-bold">{{ t('dealers.vehicles_list') }}</span>
              <v-btn size="small" variant="text" color="primary" prepend-icon="mdi-plus" @click="addVehicleField">
                {{ t('dealers.add_vehicle') }}
              </v-btn>
            </div>

            <div v-if="form.vehicles.length > 0" class="border rounded px-3 py-2 mb-4 bg-surface-variant">
               <v-row v-for="(_, index) in form.vehicles" :key="index" dense class="align-center my-1">
                 <v-col cols="10">
                   <v-text-field
                     v-model="form.vehicles[index]"
                     :label="t('dealers.vehicle_number')"
                     variant="outlined"
                     density="compact"
                     hide-details="auto" 
                     @input="upperCaseVehicle(index, $event)"
                     :rules="[v => !v || v.length === 10 || 'Must be 10 chars']"
                     bg-color="surface"
                   ></v-text-field>
                 </v-col>
                 <v-col cols="2" class="text-center">
                   <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" @click="removeVehicleField(index)"></v-btn>
                 </v-col>
               </v-row>
            </div>
             <div v-else class="text-center py-4 border rounded border-dashed text-medium-emphasis mb-4">
                 {{ t('dealers.no_vehicles_msg') }}
             </div>

          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="outlined" color="medium-emphasis" class="mr-2" @click="closeDialog">{{ t('dealers.cancel') }}</v-btn>
          <v-btn color="primary" variant="flat" :disabled="!valid" @click="saveDealer">{{ t('dealers.save_dealer') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete/Confirm Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400px">
      <v-card class="rounded-lg text-center pa-4">
        <v-icon icon="mdi-alert-circle-outline" color="warning" size="64" class="mb-4 mx-auto"></v-icon>
        <div class="text-h6 font-weight-bold mb-2">{{ t('dealers.are_you_sure') }}</div>
        <div class="text-body-2 text-medium-emphasis mb-6">
          {{ t('dealers.delete_confirmation', { name: itemToDelete?.firmName }) }}
        </div>
        <div class="d-flex justify-center">
           <v-btn variant="outlined" color="medium-emphasis" class="mr-2 px-6" @click="deleteDialog = false">{{ t('dealers.cancel') }}</v-btn>
           <v-btn color="error" variant="flat" class="px-6" @click="deleteItemConfirm">{{ t('dealers.delete_btn') }}</v-btn>
        </div>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, computed } from 'vue';
import { useDealerStore, type Dealer } from '../stores/dealer';
import { useSnackbarStore } from '../stores/snackbar';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const dealerStore = useDealerStore();
const snackbar = useSnackbarStore();

const search = ref('');
const dialog = ref(false);
const deleteDialog = ref(false);
const valid = ref(false);
const formRef = ref<any>(null);

const headers = computed(() => [
  { title: t('dealers.dealer_name'), key: 'dealerName', align: 'start' },
  { title: t('dealers.firm_name'), key: 'firmName' },
  { title: t('dealers.firm_address'), key: 'address' },
  { title: t('dealers.gst_number'), key: 'gstNumber' },
  { title: t('dealers.vehicles'), key: 'vehicles', sortable: false },
  { title: t('dealers.actions'), key: 'actions', sortable: false, align: 'end' },
] as const);

const titleOptions = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'M/s'];

// Form State
const form = reactive<{
  id: string | null;
  title: string; // Added
  dealerName: string;
  firmName: string;
  mobile: string;
  gstNumber: string;
  address: string; 
  vehicles: string[];
}>({
  id: null,
  title: 'Mr.', // Default
  dealerName: '',
  firmName: '',
  mobile: '',
  gstNumber: '',
  address: '', 
  vehicles: [],
});

const itemToDelete = ref<Dealer | null>(null);

const openDialog = (item?: Dealer) => {
  if (item) {
    form.id = item.id;
    form.title = item.title || 'Mr.';
    form.dealerName = item.dealerName;
    form.firmName = item.firmName;
    form.mobile = item.mobile || '';
    form.gstNumber = item.gstNumber;
    form.address = item.address || ''; 
    form.vehicles = [...item.vehicles];
  } else {
    resetForm();
  }
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
  nextTick(() => {
     resetForm();
  });
};

const resetForm = () => {
  form.id = null;
  form.title = 'Mr.'; // Reset to default
  form.dealerName = '';
  form.firmName = '';
  form.mobile = '';
  form.gstNumber = '';
  form.address = ''; 
  form.vehicles = [];
  if(formRef.value) formRef.value.resetValidation();
};

const addVehicleField = () => {
  form.vehicles.push('');
};

const removeVehicleField = (index: number) => {
  form.vehicles.splice(index, 1);
};

// Validation helpers
const upperCaseGST = (val: Event) => {
   const input = val.target as HTMLInputElement;
   form.gstNumber = input.value.toUpperCase();
};


const upperCaseVehicle = (index: number, val: Event) => {
   const input = val.target as HTMLInputElement;
   form.vehicles[index] = input.value.toUpperCase();
};

const saveDealer = async () => {
  const { valid: isValid } = await formRef.value?.validate();
  if (!isValid) return;

  // Filter out empty vehicle strings
  const cleanedVehicles = form.vehicles.map(v => v.trim()).filter(v => v !== '');

  const dealerData = {
      title: form.title,
      dealerName: form.dealerName,
      firmName: form.firmName,
      mobile: form.mobile,
      gstNumber: form.gstNumber,
      address: form.address,
      vehicles: cleanedVehicles
  };

  if (form.id) {
    dealerStore.updateDealer(form.id, dealerData);
    snackbar.showSnackbar(t('dealers.dealer_updated'), 'success');
  } else {
    dealerStore.addDealer(dealerData);
    snackbar.showSnackbar(t('dealers.dealer_added'), 'success');
  }
  closeDialog();
};

const confirmDelete = (item: Dealer) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
};

const deleteItemConfirm = () => {
  if (itemToDelete.value) {
    dealerStore.deleteDealer(itemToDelete.value.id);
    snackbar.showSnackbar(t('dealers.dealer_deleted'), 'info');
  }
  deleteDialog.value = false;
  itemToDelete.value = null;
};
</script>
<style scoped>
.bg-surface-variant {
    background-color: var(--v-surface-variant-background) !important;
}
</style>