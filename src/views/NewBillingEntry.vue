<template>
  <v-app>
    <v-main class="bg-background">
      <v-container class="pa-4 pb-16" style="padding-bottom: 160px !important; max-width: 800px;">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-4">
          <v-btn icon="mdi-close" variant="text" size="small" class="bg-surface-light rounded-circle" @click="$router.back()"></v-btn>
          <h1 class="text-h6 font-weight-bold">{{ editingId ? 'Edit Billing Entry' : $t('new_billing.title') }}</h1>
          <v-btn variant="text" color="primary" class="font-weight-bold text-none" @click="clearForm">{{ $t('new_billing.clear') }}</v-btn>
        </div>

        <!-- Dealer Selection -->
        <div class="d-flex align-center text-primary font-weight-bold mb-3">
          <v-icon class="mr-2">mdi-account-tie</v-icon> {{ $t('new_billing.dealer_details') || 'Dealer Details' }}
        </div>
        <v-card class="rounded-xl pa-4 mb-6 border" elevation="0">
             <v-autocomplete
                v-model="selectedDealer"
                :items="dealerOptions"
                label="Select Dealer (Optional)"
                variant="outlined"
                density="comfortable"
                hide-details
                bg-color="surface-light"
                class="font-weight-bold mb-3"
                clearable
                @update:model-value="onDealerSelect"
            ></v-autocomplete>
        </v-card>

        <!-- Vehicle Details -->
        <div class="d-flex align-center text-primary font-weight-bold mb-3">
          <v-icon class="mr-2">mdi-truck-delivery</v-icon> {{ $t('new_billing.vehicle_details') }}
        </div>
        
        <v-card class="rounded-xl pa-4 mb-6 border" elevation="0">
          <div class="text-caption font-weight-bold text-medium-emphasis mb-2 text-uppercase">{{ $t('new_billing.vehicle_number') }}</div>
          <v-combobox
            v-model="vehicleNo"
            :items="vehicleOptions"
            @update:model-value="val => vehicleNo = (val || '').toUpperCase()"
            variant="filled"
            bg-color="surface-light"
            rounded="lg"
            hide-details
            placeholder="KA01AB1234"
            class="font-weight-bold font-monospace"
            :return-object="false"
          >
            <template v-slot:prepend-inner>
              <v-chip size="x-small" label class="mr-2 font-weight-bold text-medium-emphasis">IND</v-chip>
            </template>
            <template v-slot:append-inner>
              <v-icon color="success">mdi-check-circle</v-icon>
            </template>
          </v-combobox>
        </v-card>

        <!-- Multi-Item Switch & Payment Switch -->
        <div class="d-flex justify-space-between mb-2">
            <v-switch
                v-model="isPaid"
                color="success"
                hide-details
                density="compact"
                inset
                class="font-weight-bold"
                @update:model-value="handlePaymentSwitch"
            >
              <template v-slot:label>
                <span class="text-high-emphasis font-weight-bold">{{ isPaid ? 'Marked as Paid' : 'Mark as Paid' }}</span>
              </template>
            </v-switch>

             <v-switch
                v-model="isMultiItemMode"
                color="primary"
                label="Allow Multiple Items"
                hide-details
                density="compact"
                inset
                class="font-weight-bold"
            ></v-switch>
        </div>

        <!-- Payment Confirmation Dialog -->
        <v-dialog v-model="showPaymentConfirm" max-width="400" persistent>
            <v-card class="rounded-xl pa-4">
                <v-card-title class="text-h6 font-weight-bold">Confirm Payment</v-card-title>
                <v-card-text class="text-medium-emphasis">
                    Are you sure you have received the payment for this bill? It will be marked as <strong>PAID</strong>.
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="grey-darken-1" variant="text" @click="cancelPayment">Cancel</v-btn>
                    <v-btn color="success" variant="flat" @click="confirmPayment">Yes, Received</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Items List Header -->
        <div class="d-flex justify-space-between align-center mb-3">
          <div class="d-flex align-center text-primary font-weight-bold">
            <v-icon class="mr-2">mdi-scale</v-icon> {{ $t('new_billing.items_list') }}
          </div>
          <v-chip size="x-small" color="primary" variant="tonal" class="font-weight-bold">{{ $t('new_billing.items_added', { count: totalItems }) }}</v-chip>
        </div>

        <!-- Dynamic Items List -->
        <template v-for="(item, index) in billingItems" :key="item.id">
            <v-card class="rounded-xl pa-3 mb-4 border" elevation="0">
            <div class="text-caption font-weight-bold text-medium-emphasis mb-1 text-uppercase">{{ $t('new_billing.item_type') }}</div>
            <v-select
                v-model="item.inventoryItemId"
                :items="inventoryOptions"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-3 font-weight-bold"
                :label="$t('new_billing.select_item_placeholder')"
                bg-color="surface"
                append-inner-icon="mdi-chevron-down"
            ></v-select>

            <v-row dense class="mb-2">
                <v-col cols="12" sm="6">
                <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase mb-1">{{ $t('new_billing.gross_kg') }}</div>
                <v-text-field
                    v-model.number="item.grossWeight"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    placeholder="0"
                    bg-color="surface"
                    class="font-weight-bold"
                ></v-text-field>
                </v-col>
                <v-col cols="12" sm="6">
                <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase mb-1">{{ $t('new_billing.tare_kg') }}</div>
                <v-text-field
                    v-model.number="item.tareWeight"
                    type="number"
                    variant="outlined"
                    density="compact"
                    hide-details
                    placeholder="0"
                    bg-color="surface"
                    class="font-weight-bold"
                ></v-text-field>
                </v-col>
            </v-row>
            
            <div class="bg-surface-light rounded-lg pa-3 d-flex justify-space-between align-center">
                <div class="d-flex align-center">
                <v-icon color="primary" class="mr-2">mdi-weight-kilogram</v-icon>
                <div>
                    <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase" style="line-height:1;">{{ $t('new_billing.net_weight') }}</div>
                    <div class="text-h6 font-weight-bold text-primary" style="line-height:1.2;">{{ getNetWeight(item) }} <span class="text-body-2">kg</span></div>
                </div>
                </div>
                <!-- Delete disabled if not multi-mode OR only 1 item -->
                <v-btn icon="mdi-delete-outline" variant="text" density="default" color="medium-emphasis" @click="removeItem(index)" :disabled="!isMultiItemMode || billingItems.length === 1"></v-btn>
            </div>
            </v-card>
        </template>

        <!-- Add New Item -->
        <v-btn v-if="isMultiItemMode" block variant="tonal" color="primary" class="mb-8 rounded-lg" size="large" prepend-icon="mdi-plus" @click="addItem">
          {{ $t('new_billing.add_new_item') }}
        </v-btn>

        <!-- Footer Action -->
        <div class="position-fixed bg-surface border-t pa-4 mb-10 w-100" style="bottom: 0; left: 0; z-index: 200;">
           <div class="mx-auto" style="max-width: 800px;">
              <div class="d-flex justify-space-between align-end mb-3">
                <div>
                  <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase">{{ $t('new_billing.total_net_weight') }}</div>
                  <div class="text-h5 font-weight-bold text-high-emphasis" style="line-height:1;">{{ totalNetWeight }} <span class="text-body-1 font-weight-bold text-medium-emphasis">kg</span></div>
                </div>
                <div class="text-right">
                  <div class="text-caption font-weight-bold text-medium-emphasis text-uppercase">{{ $t('new_billing.total_items') }}</div>
                   <div class="text-h5 font-weight-bold text-high-emphasis" style="line-height:1;">{{ totalItems }}</div>
                </div>
              </div>
              
              <v-btn block color="primary" size="large" rounded="lg" prepend-icon="mdi-receipt-text" @click="generateBill">
                {{ editingId ? 'Update Generated Bill' : $t('new_billing.generate_bill') }}
              </v-btn>
           </div>
        </div>

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useInventoryStore } from '../stores/inventory';
import { useRouter, useRoute } from 'vue-router';
import { useBillingStore } from '../stores/billing';
import { useSnackbarStore } from '../stores/snackbar';
import { useDealerStore } from '../stores/dealer';

const router = useRouter();
const route = useRoute();
const inventoryStore = useInventoryStore();
const billingStore = useBillingStore();
const snackbar = useSnackbarStore();
const dealerStore = useDealerStore();

const vehicleNo = ref('KA01AB1234');
const editingId = ref<string | null>(null);
const selectedDealer = ref<string | null>(null);

const dealerOptions = computed(() => {
    return dealerStore.dealers.map(d => ({
        title: d.dealerName + (d.firmName ? ` (${d.firmName})` : ''),
        value: d.id,
        vehicles: d.vehicles,
        name: d.dealerName 
    }));
});

const vehicleOptions = computed(() => {
    if (selectedDealer.value) {
        const dealer = dealerStore.getDealerById(selectedDealer.value);
        return dealer ? dealer.vehicles : [];
    }
    return [];
});

const onDealerSelect = () => {
   // Clear vehicle if dealer changes, or maybe keep it? Let's clear for now to avoid confusion
   // unless the current vehicle is in the new dealer's list.
   if (selectedDealer.value) {
       const dealer = dealerStore.getDealerById(selectedDealer.value);
       if (dealer && dealer.vehicles.length > 0) {
            // Check if current vehicle is in the list
           if (!dealer.vehicles.includes(vehicleNo.value)) {
               vehicleNo.value = dealer.vehicles[0] || ''; // Default to first
           }
       } else {
           vehicleNo.value = '';
       }
   }
};

interface BillingItem {
  id: number;
  inventoryItemId: string | null;
  grossWeight: number | null;
  tareWeight: number | null;
}

const billingItems = ref<BillingItem[]>([
  { id: Date.now(), inventoryItemId: null, grossWeight: null, tareWeight: null }
]);

const isMultiItemMode = ref(false);

const inventoryOptions = computed(() => {
    return inventoryStore.items.map(item => ({
        title: item.name,
        value: item.id,
        price: item.price // Keep reference if needed later
    }));
});

const isPaid = ref(false);
const showPaymentConfirm = ref(false);

const handlePaymentSwitch = () => {
    // val is the new value. If it's becoming true (Paid), verify.
    // However, v-switch v-model updates the value directly.
    // So if isPaid is true, it means user just switched it ON.
    if (isPaid.value) {
        // Revert temporarily until confirmed? Or keeps it true but confirm?
        // Better UX: Keep it false, open dialog. If confirmed, set true.
        // But v-model updates it. So we set it back to false, open dialog.
        isPaid.value = false;
        showPaymentConfirm.value = true;
    } else {
        // Switching off is fine
        isPaid.value = false;
    }
};

const confirmPayment = () => {
    isPaid.value = true;
    showPaymentConfirm.value = false;
};

const cancelPayment = () => {
    isPaid.value = false;
    showPaymentConfirm.value = false;
};

onMounted(() => {
    const id = route.query.id as string;
    if (id) {
        const entry = billingStore.getEntryById(id);
        if (entry) {
            editingId.value = id;
            vehicleNo.value = entry.vehicleNo;
            isPaid.value = entry.status === 'Paid';
            billingItems.value = entry.items.map(item => ({
                id: Math.random(), // generate temporary UI id
                inventoryItemId: item.inventoryItemId,
                grossWeight: item.grossWeight ?? null,
                tareWeight: item.tareWeight ?? null
            }));
            if (billingItems.value.length > 1) {
                isMultiItemMode.value = true;
            }
        }
    }
});

const addItem = () => {
    billingItems.value.push({
        id: Date.now(),
        inventoryItemId: null,
        grossWeight: null,
        tareWeight: null
    });
};

const removeItem = (index: number) => {
    if (billingItems.value.length > 1) {
        billingItems.value.splice(index, 1);
    } 
};

const getNetWeight = (item: BillingItem) => {
    if (item.grossWeight && item.tareWeight) {
        return Math.max(0, item.grossWeight - item.tareWeight);
    }
    return 0;
};

const totalNetWeight = computed(() => {
    return billingItems.value.reduce((sum, item) => sum + getNetWeight(item), 0);
});

const totalItems = computed(() => billingItems.value.length);

const clearForm = () => {
    billingItems.value = [{ id: Date.now(), inventoryItemId: null, grossWeight: null, tareWeight: null }];
    vehicleNo.value = '';
    editingId.value = null;
    selectedDealer.value = null;
    isPaid.value = false;
    router.replace({ query: {} }); // remove query param
};

const generateBill = () => {
    // Validate
    if (!vehicleNo.value) {
        snackbar.showSnackbar('Vehicle Number is required', 'warning');
        return;
    }
    if (billingItems.value.some(i => !i.inventoryItemId || !i.grossWeight || !i.tareWeight)) {
        snackbar.showSnackbar('Please fill in all item details', 'warning');
        return;
    }
    
    const itemsPayload = billingItems.value.map(i => {
        const itemDetails = inventoryStore.items.find(inv => inv.id === i.inventoryItemId);
        const netWeight = getNetWeight(i);
        const price = itemDetails?.price || 0;
        return {
            inventoryItemId: i.inventoryItemId!,
            name: itemDetails?.name || 'Unknown Item',
            grossWeight: i.grossWeight!,
            tareWeight: i.tareWeight!,
            netWeight: netWeight,
            qty: netWeight,
            price: price,
            total: netWeight * price
        };
    });

    const totalAmount = itemsPayload.reduce((sum, item) => sum + item.total, 0);
    const status = isPaid.value ? 'Paid' : 'Pending';

    if (editingId.value) {
        billingStore.updateEntry(editingId.value, {
            vehicleNo: vehicleNo.value,
            items: itemsPayload,
            totalAmount: totalAmount,
            totalWeight: totalNetWeight.value,
            status: status
        });
        snackbar.showSnackbar('Bill Updated Successfully!', 'success');
    } else {
        billingStore.addEntry({
            vehicleNo: vehicleNo.value,
            items: itemsPayload,
            totalAmount: totalAmount,
            totalWeight: totalNetWeight.value,
            customerName: selectedDealer.value ? 
                (dealerStore.getDealerById(selectedDealer.value)?.dealerName || 'Guest Customer') : 
                'Guest Customer',
            status: status
        });
        snackbar.showSnackbar('Bill Generated Successfully!', 'success');
    }
    
    router.push('/history'); 
};
</script>

<style scoped>
.font-monospace {
  font-family: monospace;
}
:deep(.v-navigation-drawer__scrim){
  background: none !important;
}
</style>
