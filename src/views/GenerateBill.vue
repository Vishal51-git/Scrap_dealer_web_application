<template>
  <v-app>
    <v-main class="bg-background">
      <v-container class="pa-4 pb-16" style="max-width: 1000px;">
        <!-- Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <div class="d-flex align-center">
            <v-btn icon="mdi-arrow-left" variant="text" @click="$router.back()" class="mr-2"></v-btn>
            <h1 class="text-h5 font-weight-bold">Generate Tax Invoice</h1>
          </div>
          <v-btn color="primary" @click="generatePDF" prepend-icon="mdi-download" :loading="generating">
            Download PDF
          </v-btn>
        </div>

        <v-row>
          <!-- Form Section -->
          <v-col cols="12" md="8">
            <v-card class="rounded-xl pa-4 mb-4 border" elevation="0">
              <div class="text-subtitle-1 font-weight-bold mb-4 text-primary">Invoice Details</div>
              <v-row dense>
                <v-col cols="6">
                  <v-text-field v-model="invoiceData.invoiceNo" label="Invoice No" density="compact" variant="outlined"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="invoiceData.date" label="Date" type="date" density="compact" variant="outlined"></v-text-field>
                </v-col>

                <v-col cols="6">
                   <v-text-field v-model="invoiceData.transportMode" label="Transportation Mode" density="compact" variant="outlined"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="invoiceData.placeOfSupply" label="Place of Supply" density="compact" variant="outlined"></v-text-field>
                </v-col>
                 <v-col cols="6">
                   <v-checkbox v-model="invoiceData.reverseCharge" label="Reverse Charge" density="compact" hide-details></v-checkbox>
                </v-col>
              </v-row>
            </v-card>

            <v-card class="rounded-xl pa-4 mb-4 border" elevation="0">
              <div class="text-subtitle-1 font-weight-bold mb-4 text-primary">Billed To (Receiver)</div>
              <v-autocomplete
                v-model="selectedCustomer"
                :items="customerOptions"
                label="Select Saved Customer"
                density="compact"
                variant="outlined"
                return-object
                clearable
                @update:model-value="onCustomerSelect"
              ></v-autocomplete>
              
              <v-row dense>
                <v-col cols="12">
                   <v-text-field v-model="invoiceData.billedTo.name" label="Name / Firm Name" density="compact" variant="outlined"></v-text-field>
                </v-col>
                <v-col cols="12">
                   <v-textarea v-model="invoiceData.billedTo.address" label="Address" density="compact" variant="outlined" rows="2" auto-grow></v-textarea>
                </v-col>
                <v-col cols="6">
                   <v-text-field v-model="invoiceData.billedTo.gst" label="GSTIN/UIN" density="compact" variant="outlined" :rules="gstRules"></v-text-field>
                </v-col>
                 <v-col cols="6">
                   <v-autocomplete v-model="invoiceData.billedTo.state" :items="stateOptions" item-title="title" item-value="title" label="State" density="compact" variant="outlined" @update:model-value="onBilledToStateChange"></v-autocomplete>
                </v-col>
                <v-col cols="12">
                  <v-combobox
                    v-model="invoiceData.vehicleNo"
                    :items="availableVehicles"
                    label="Vehicle No"
                    density="compact"
                    variant="outlined"
                    :rules="vehicleRules"
                    @input="(e: any) => invoiceData.vehicleNo = e.target.value.toUpperCase()"
                    hide-details="auto"
                  ></v-combobox>
                </v-col>
              </v-row>
            </v-card>

             <v-card class="rounded-xl pa-4 mb-4 border" elevation="0">
               <div class="d-flex justify-space-between align-center mb-4">
                  <div class="text-subtitle-1 font-weight-bold text-primary">Shipped To (Consignee)</div>
                   <v-btn size="small" variant="text" @click="copyBilledToConsignee">Same as Receiver</v-btn>
               </div>
              <v-row dense>
                <v-col cols="12">
                   <v-text-field v-model="invoiceData.shippedTo.name" label="Name / Firm Name" density="compact" variant="outlined"></v-text-field>
                </v-col>
                <v-col cols="12">
                   <v-textarea v-model="invoiceData.shippedTo.address" label="Address" density="compact" variant="outlined" rows="2" auto-grow></v-textarea>
                </v-col>
                <v-col cols="6">
                   <v-text-field v-model="invoiceData.shippedTo.gst" label="GSTIN/UIN" density="compact" variant="outlined" :rules="gstRules"></v-text-field>
                </v-col>
                 <v-col cols="6">
                   <v-autocomplete v-model="invoiceData.shippedTo.state" :items="stateOptions" item-title="title" item-value="title" label="State" density="compact" variant="outlined" @update:model-value="onShippedToStateChange"></v-autocomplete>
                </v-col>
              </v-row>
            </v-card>

            <v-card class="rounded-xl pa-4 mb-4 border" elevation="0">
               <div class="d-flex justify-space-between align-center mb-4">
                  <div class="text-subtitle-1 font-weight-bold text-primary">Item Details</div>
               </div>

               <div v-for="(item, index) in invoiceData.items" :key="index" class="mb-4 pa-3 bg-surface-light rounded-lg">
                  <v-row dense>
                      <!-- Row 1: Main Item Details -->
                      <v-col cols="12" md="4">
                          <v-autocomplete
                             v-model="item.inventoryId"
                             :items="inventoryOptions"
                             label="Item"
                             density="compact"
                             variant="outlined"
                             hide-details
                             return-object
                             @update:model-value="(val: any) => onItemSelect(val, index)"
                          ></v-autocomplete>
                      </v-col>
                      <v-col cols="6" md="2">
                          <v-text-field 
                              v-model="item.hsn" 
                              label="HSN" 
                              density="compact" 
                              variant="outlined" 
                              :rules="hsnRules" 
                              hide-details="auto"
                              @input="(e: any) => item.hsn = e.target.value.replace(/\D/g, '')"
                              maxlength="4"
                          ></v-text-field>
                      </v-col>
                      <v-col cols="6" md="2">
                          <v-text-field v-model.number="item.qty" label="Qty" type="number" density="compact" variant="outlined" hide-details></v-text-field>
                      </v-col>
                      <v-col cols="12" md="4">
                          <v-text-field v-model.number="item.rate" label="Rate" type="number" density="compact" variant="outlined" hide-details></v-text-field>
                      </v-col>
                  </v-row>
                  
                  <v-row dense class="mt-2">
                      <!-- Row 2: Taxes and Totals -->
                      <v-col cols="6" md="2">
                          <v-text-field v-model.number="item.discount" label="Disc." type="number" density="compact" variant="outlined" hide-details></v-text-field>
                      </v-col>
                      <v-col cols="4" md="2">
                           <v-text-field v-model.number="item.cgstRate" label="CGST%" type="number" density="compact" variant="outlined" hide-details></v-text-field>
                      </v-col>
                      <v-col cols="4" md="2">
                           <v-text-field v-model.number="item.sgstRate" label="SGST%" type="number" density="compact" variant="outlined" hide-details></v-text-field>
                      </v-col>
                      <v-col cols="4" md="2">
                           <v-text-field v-model.number="item.igstRate" label="IGST%" type="number" density="compact" variant="outlined" hide-details></v-text-field>
                      </v-col>
                       <v-col cols="12" md="4" class="d-flex align-center justify-end">
                          <div class="text-caption font-weight-bold text-medium-emphasis mr-2">Total Bill (Including GST):</div>
                          <div class="text-h6 font-weight-bold">{{ formatCurrency(calculatedItems[index]?.total || 0) }}</div>
                      </v-col>
                  </v-row>
               </div>
            </v-card>
            
            <!-- Tax Details Card Removed as it's per item now -->

          </v-col>

          <!-- Preview & Totals (sticky) -->
          <v-col cols="12" md="4">
             <v-card class="rounded-xl pa-4 border position-sticky" style="top: 20px;" elevation="0">
                <div class="text-subtitle-1 font-weight-bold mb-4">Summary</div>
                <div class="d-flex justify-space-between mb-2">
                    <span class="text-medium-emphasis">Total Items</span>
                    <span class="font-weight-bold">{{ invoiceData.items.length }}</span>
                </div>
                 <div class="d-flex justify-space-between mb-2">
                    <span class="text-medium-emphasis">Total Qty</span>
                    <span class="font-weight-bold">{{ totalQty }} Kg</span>
                </div>
                 <div class="d-flex justify-space-between mb-2">
                    <span class="text-medium-emphasis">Sub Total</span>
                    <span class="font-weight-bold">{{ formatCurrency(summary.subTotal) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-2" v-if="summary.discount > 0">
                    <span class="text-medium-emphasis">Discount</span>
                    <span class="font-weight-bold">- {{ formatCurrency(summary.discount) }}</span>
                </div>
                 <div class="d-flex justify-space-between mb-2">
                    <span class="text-medium-emphasis">Taxable Value</span>
                    <span class="font-weight-bold">{{ formatCurrency(summary.taxableValue) }}</span>
                </div>
                <v-divider class="my-3"></v-divider>
                <div class="d-flex justify-space-between mb-1" v-if="summary.cgst > 0">
                    <span class="text-medium-emphasis">{{ taxLabels.cgst }}</span>
                    <span class="font-weight-bold">{{ formatCurrency(summary.cgst) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-1" v-if="summary.sgst > 0">
                    <span class="text-medium-emphasis">{{ taxLabels.sgst }}</span>
                    <span class="font-weight-bold">{{ formatCurrency(summary.sgst) }}</span>
                </div>
                <div class="d-flex justify-space-between mb-1" v-if="summary.igst > 0">
                    <span class="text-medium-emphasis">{{ taxLabels.igst }}</span>
                    <span class="font-weight-bold">{{ formatCurrency(summary.igst) }}</span>
                </div>
                <!-- Total GST Display -->
                <div class="d-flex justify-space-between mb-1 mt-2">
                    <span class="text-subtitle-2 font-weight-bold">{{ taxLabels.total }}</span>
                    <span class="text-subtitle-2 font-weight-bold">{{ formatCurrency(summary.cgst + summary.sgst + summary.igst) }}</span>
                </div>
                <v-divider class="my-3"></v-divider>
                 <div class="d-flex justify-space-between mb-4">
                    <span class="text-h6 font-weight-bold">Grand Total</span>
                    <span class="text-h6 font-weight-bold text-primary">{{ formatCurrency(summary.grandTotal) }}</span>
                </div>
                
                <v-btn block color="primary" class="mb-3" @click="() => generatePDF()" :loading="generating">Generate PDF</v-btn>

                <v-btn block variant="tonal" @click="saveDraft">Save Draft</v-btn>
             </v-card>
          </v-col>
        </v-row>
      </v-container>

      <!-- Hidden Invoice Template for PDF Generation -->
      <div class="pdf-container" v-show="false">
        <div id="invoice-template" class="invoice-box">
             <!-- Header -->
             <div class="header-section">
                 <div class="company-logo">
                     <div class="om-symbol">ॐ</div>
                 </div>
                 <div class="company-title">
                     <h1>{{ settingsStore.companyProfile.name }}</h1>
                     <p>{{ settingsStore.companyProfile.address }}</p>
                     <p style="font-weight: bold;">GSTIN : {{ settingsStore.companyProfile.gst }}</p>
                 </div>
                 <div class="invoice-meta">
                      <div class="checkbox-group">
                          <div class="checkbox-item"><span class="box"></span> Original For Recipient</div>
                          <div class="checkbox-item"><span class="box"></span> Duplicate For Office</div>
                      </div>
                      <div class="mobile">Mob. : {{ settingsStore.companyProfile.mobile }}</div>
                 </div>
             </div>
             
             <!-- Invoice Info -->
             <div class="info-grid">
                 <div class="left-info">
                     <div class="row"><strong>Reverse Charge:</strong> {{ invoiceData.reverseCharge ? 'Yes' : 'No' }}</div>
                     <div class="row"><strong>Invoice No.</strong> <span class="highlight text-red">{{ invoiceData.invoiceNo || '____' }}</span></div>
                     <div class="row"><strong>Invoice Date:</strong> {{ invoiceData.date }}</div>
                     <div class="row state-row">
                         <span><strong>State:</strong> J&K</span>
                         <span class="ml-4"><strong>State Code:</strong> 01</span>
                     </div>
                 </div>
                 <div class="right-info">
                     <div class="row"><strong>Transportation Mode:</strong> {{ invoiceData.transportMode }}</div>
                     <div class="row"><strong>Veh. No:</strong> {{ invoiceData.vehicleNo }}</div>
                     <div class="row"><strong>Date & Time Supply:</strong> {{ invoiceData.dateOfSupply || invoiceData.date }}</div>
                     <div class="row"><strong>Place of Supply:</strong> {{ invoiceData.placeOfSupply }}</div>
                 </div>
             </div>

             <!-- Party Details Table -->
             <table class="party-table">
                 <tr>
                     <td width="50%">
                         <div class="party-header">
                            <span>Details of Receiver</span>
                            <span class="billing-label">Billed to</span>
                         </div>
                         <div class="party-content">
                             <div><strong>Name :</strong> {{ invoiceData.billedTo.name }}</div>
                             <div><strong>Address :</strong> {{ invoiceData.billedTo.address }}</div>
                              <div><strong>GST/UIN :</strong> {{ invoiceData.billedTo.gst }}</div>
                              <div class="gst-row">
                                  <span><strong>State :</strong> {{ invoiceData.billedTo.state }}</span>
                                  <span class="state-code-box"><strong>State Code :</strong> {{ invoiceData.billedTo.stateCode }}</span>
                              </div>
                         </div>
                     </td>
                     <td width="50%">
                          <div class="party-header">
                            <span>Details of Consignee</span>
                            <span class="billing-label">Shipped to:</span>
                          </div>
                          <div class="party-content">
                              <div><strong>Name :</strong> {{ invoiceData.shippedTo.name }}</div>
                              <div><strong>Address :</strong> {{ invoiceData.shippedTo.address }}</div>
                              <div><strong>GST/UIN :</strong> {{ invoiceData.shippedTo.gst }}</div>
                              <div class="gst-row">
                                  <span><strong>State :</strong> {{ invoiceData.shippedTo.state }}</span>
                                  <span class="state-code-box"><strong>State Code :</strong> {{ invoiceData.shippedTo.stateCode }}</span>
                              </div>
                          </div>
                     </td>
                 </tr>
             </table>

             <!-- Item Table -->
             <table class="item-table">
                 <thead>
                     <tr>
                         <th width="3%">Sr.<br>No.</th>
                         <th width="20%">Name of Product Service</th>
                         <th width="8%">HSN<br>Code</th>
                         <th width="5%">UOM</th>
                         <th width="5%">Qty.</th>
                         <th width="7%">Rate</th>
                         <th width="8%">Amount</th>
                         <th width="7%">Less:<br>Discount</th>
                         <th width="8%">Taxable<br>Value</th>
                         <th width="9%" colspan="2">CGST</th>
                         <th width="9%" colspan="2">SGST</th>
                         <th width="11%">TOTAL</th>
                     </tr>
                     <tr>
                         <!-- Sub-columns for Tax -->
                         <th colspan="9"></th>
                         <th>Rate</th>
                         <th>Amt</th>
                         <th>Rate</th>
                         <th>Amt</th>
                         <th></th>
                     </tr>
                 </thead>
                 <tbody>
                     <tr v-for="(item, index) in invoiceData.items" :key="index">
                         <td>{{ index + 1 }}</td>
                         <td>{{ item.name }}</td>
                         <td>{{ item.hsn }}</td>
                         <td>Kgs</td>
                         <td>{{ item.qty }}</td>
                         <td>{{ item.rate }}</td>
                         <td>{{ calculatedItems[index]?.amount }}</td>
                         <td>{{ item.discount }}</td>
                         <td>{{ calculatedItems[index]?.taxableValue }}</td>
                         <td>{{ item.cgstRate }}%</td>
                         <td>{{ calculatedItems[index]?.cgstAmt }}</td>
                         <td>{{ item.sgstRate }}%</td>
                         <td>{{ calculatedItems[index]?.sgstAmt }}</td>
                         <td><strong>{{ Math.round(calculatedItems[index]?.total || 0) }}</strong></td>
                     </tr>
                     <!-- Fills empty rows to maintain height -->
                     <tr v-for="n in Math.max(0, 10 - invoiceData.items.length)" :key="'empty'+n">
                         <td>&nbsp;</td>
                         <td></td>
                         <td></td>
                         <td></td>
                         <td></td>
                         <td></td>
                         <td></td>
                         <td></td>
                         <td></td>
                         <td></td>
                         <td></td>
                         <td></td>
                         <td></td>
                         <td></td>
                     </tr>
                 </tbody>
                 <tfoot>
                     <tr>
                        <td colspan="6" class="text-right"><strong>GRAND TOTAL</strong></td>
                        <td><strong>{{ summary.subTotal }}</strong></td>
                        <td><strong>{{ summary.discount }}</strong></td>
                        <td><strong>{{ summary.taxableValue }}</strong></td>
                        <td colspan="2"><strong>{{ summary.cgst }}</strong></td>
                        <td colspan="2"><strong>{{ summary.sgst }}</strong></td>
                        <td><strong>{{ Math.round(summary.grandTotal) }}</strong></td>
                     </tr>
                 </tfoot>
             </table>

             <!-- Footer -->
             <div class="footer-section">
                 <div class="amount-words">
                     <strong>Total Invoice Amount in Words :</strong> {{ amountInWords }}
                 </div>
                 <div class="footer-grid">
                     <div class="bank-details">
                         <div class="bank-header"><strong>Bank Details :</strong></div>
                         <div><strong>Bank Name :</strong> {{ settingsStore.companyProfile.bankName }}</div>
                         <div><strong>Bank Account Number :</strong> {{ settingsStore.companyProfile.accountNo }}</div>
                         <div><strong>IFSC Code :</strong> {{ settingsStore.companyProfile.ifsc }}</div>
                         
                         <div class="terms mt-2">
                             <strong>: Terms and Conditions</strong>
                             <ol>
                                 <li v-for="(term, i) in settingsStore.companyProfile.terms" :key="i">{{ term }}</li>
                             </ol>
                         </div>
                     </div>
                     <div class="signature-section">
                          <div class="for-company">For {{ settingsStore.companyProfile.name }}</div>
                          <div class="sig-space"></div>
                          <div class="sig-label">Authorised Signatory</div>
                     </div>
                 </div>
             </div>
        </div>
      </div>

    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useInventoryStore } from '../stores/inventory';
import { useDealerStore } from '../stores/dealer';
import { useSettingsStore } from '../stores/settings';
import { useBillingStore } from '../stores/billing';
import { useRoute } from 'vue-router';
import { useSnackbarStore } from '../stores/snackbar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { INDIAN_STATES } from '../data/indian_states';

const inventoryStore = useInventoryStore();
const dealerStore = useDealerStore();
const settingsStore = useSettingsStore();

const route = useRoute();
const snackbar = useSnackbarStore();

const editingId = ref<string | null>(null);

const generating = ref(false);

// Validations
const vehicleRules = [
    (v: string) => !!v || 'Vehicle No is required',
    (v: string) => v.length === 10 || 'Must be 10 characters',
    (v: string) => /^[A-Z0-9]+$/.test(v) || 'Must be capital letters and numbers',
    (v: string) => /^[A-Z]/.test(v) || 'Must start with capital letters' 
];

const gstRules = [
  (v: string) => !v || v.length === 15 || 'GST must be 15 characters',
  (v: string) => !v || /^[A-Z0-9]+$/.test(v) || 'GST must be capital letters and numbers'
];

const hsnRules = [
    (v: string) => !v || /^\d{4}$/.test(v) || 'HSN must be 4 digits'
];

const invoiceData = ref({
    invoiceNo: '670', // Should ideally come from backend or auto-increment logic
    date: new Date().toISOString().split('T')[0],
    vehicleNo: '',
    transportMode: '',
    dateOfSupply: '',
    placeOfSupply: '',
    reverseCharge: false,
    billedTo: { name: '', address: '', gst: '', state: 'Jammu & Kashmir', stateCode: '01' },
    shippedTo: { name: '', address: '', gst: '', state: 'Jammu & Kashmir', stateCode: '01' },
    items: [
        { 
            inventoryId: null, 
            name: '', 
            hsn: '', 
            qty: 0, 
            rate: 0, 
            discount: 0, 
            cgstRate: 9, 
            sgstRate: 9, 
            igstRate: 0 
        }
    ]
});

const selectedCustomer = ref(null);

const customerOptions = computed(() => {
    return dealerStore.dealers.map(d => ({
        title: d.dealerName + (d.firmName ? ` (${d.firmName})` : ''),
        value: d,
        props: { subtitle: d.gstNumber }
    }));
});

const stateOptions = INDIAN_STATES;

const onBilledToStateChange = (val: string) => {
    const stateObj = INDIAN_STATES.find(s => s.title === val);
    if(stateObj) {
        invoiceData.value.billedTo.stateCode = stateObj.code;
    }
};

const onShippedToStateChange = (val: string) => {
    const stateObj = INDIAN_STATES.find(s => s.title === val);
    if(stateObj) {
        invoiceData.value.shippedTo.stateCode = stateObj.code;
    }
};

const availableVehicles = ref<string[]>([]);

// Invoice Persistence Logic
const loadInvoiceNo = () => {
    const savedNo = localStorage.getItem('lastInvoiceNo');
    if (savedNo) {
        // We want the NEXT number, but typically we store the LAST used.
        // If the user expects persistence of the current form state, that's different.
        // Assuming user wants the "next available" number to persist across reloads if not generated yet?
        // Actually, request is: "once Invoice number incremented save it... so on reload... incremented number should not vanish"
        // This implies we save the CURRENT ready-to-use number.
        invoiceData.value.invoiceNo = savedNo;
    }
};

// Call on load
onMounted(() => {
    const id = route.query.id as string;
    if (id) {
        const entry = billingStore.getEntryById(id);
        if (entry) {
            editingId.value = id;
            invoiceData.value.invoiceNo = entry.invoiceDetails?.invoiceNo || entry.id; // Fallback
            invoiceData.value.date = entry.invoiceDetails?.dateOfSupply || new Date(entry.date).toISOString().split('T')[0];
            invoiceData.value.vehicleNo = entry.vehicleNo;
            invoiceData.value.transportMode = entry.invoiceDetails?.transportMode || '';
            invoiceData.value.placeOfSupply = entry.invoiceDetails?.placeOfSupply || '';
            invoiceData.value.reverseCharge = entry.invoiceDetails?.reverseCharge || false;
            
            // Restore Items
            invoiceData.value.items = entry.items.map(i => {
                const invItem = inventoryStore.items.find(inv => inv.id === i.inventoryItemId);
                return {
                    inventoryId: invItem ? { title: invItem.name, value: invItem.id, item: invItem } : null as any,
                    name: i.name,
                    hsn: i.hsn || '',
                    qty: i.qty || 0,
                    rate: i.price || 0,
                    discount: i.discount || 0,
                    cgstRate: i.cgstRate || 0,
                    sgstRate: i.sgstRate || 0,
                    igstRate: i.igstRate || 0
                };
            });
            
            // Restore Parties
            // Try to find customer to set select (Visual only)
            const customer = dealerStore.dealers.find(d => 
                (d.gstNumber && d.gstNumber === entry.invoiceDetails?.placeOfSupply) || // GST not stored in root?
                d.firmName === entry.customerName || 
                d.dealerName === entry.customerName
            );
            if (customer) {
               selectedCustomer.value = { 
                   title: customer.dealerName + (customer.firmName ? ` (${customer.firmName})` : ''),
                   value: customer,
                   props: { subtitle: customer.gstNumber }
               } as any;
               // No need to trigger select as we manually populate:
               availableVehicles.value = customer.vehicles || [];
            }
            
            // Manually populate fields (in case customer not found or details changed)
            if (entry.customerName) {
                // If we have detailed invoiceDetails (Drafts usually do)
                // If not (e.g. Paid bill), we reconstruct best effort
                // Actually Drafts have invoiceData structure mapped to extended fields.
            }
            
            // Use BilledTo/ShippedTo if available directly or simulate
            // Since BillingEntry doesn't store BilledTo cleanly at root, we look at consigned/extra fields
            // Wait, we need to map Back the 'Draft' logic we wrote in saveDraft:
            /*
             consignee: { ...invoiceData.value.shippedTo },
             customerName: invoiceData.value.billedTo.name (ROOT)
            */
            // BilledTo details might be lost if we only stored customerName??
            // BillingEntry interface check:
            /*
              customerName: string;
              consignee?: { name, address, gst, state ... };
              invoiceDetails?: { ... };
            */
            // We MISS 'billedTo' detail storage in BillingEntry!
            // Wait, BillingEntry has 'userId' and 'customerName'.
            // In saveDraft we mapped:
            // customerName: invoiceData.value.billedTo.name
            // But where is address, gst, etc of BilledTo?
            // F*ck.
            // Check BillingEntry interface extension:
            // It has 'consignee' (Shipped To).
            // It DOES NOT seem to have 'billedTo' detailed object.
            // Unless we squirrelled it away?
            // "bankDetails" is present.
            // Oh no. If we can't restore BilledTo Address/GST, we can't fully edit.
            // Wait, let's look at `saveDraft` in Step 58.
            /*
             items: ...
             customerName: invoiceData.value.billedTo.name
             consignee: { ...invoiceData.value.shippedTo }
             invoiceDetails: ...
            */
            // We ONLY stored `invoiceData.billedTo.name` in `customerName`.
            // We LOST address and GST of BilledTo!
            // This is a flaw in `saveDraft` logic I saw earlier.
            // BUT, if `customerName` matches a SAVED DEALER, we can restore it!
            // That's why I looked up `customer` above.
            
            if (customer) {
                invoiceData.value.billedTo.name = customer.firmName || customer.dealerName;
                invoiceData.value.billedTo.address = customer.address || ''; // Dealer has address?
                invoiceData.value.billedTo.gst = customer.gstNumber || '';
                // State? Dealer has state?
                // Dealer interface: { id, dealerName, firmName, mobile, gstNumber, vehicles }
                // It MISSES Address and State!
                // So we might lose Address/State of BilledTo if it wasn't saved in Entry.
                
                // CRITICAL: We should update BillingEntry interface to store 'billedTo' details explicitly if we want full fidelity.
                // But I can't change Interface easily across files?
                // Actually I CAN. I should add `billedTo?: ...` to BillingEntry in store.
                // Or I can abuse `consignee`? No.
                
                // Let's assume for now we might lose it, OR I add the field to Store now.
                // I SHOULD ADD THE FIELD.
            } else {
                // Just use name
                 invoiceData.value.billedTo.name = entry.customerName;
            }
            
            // Consignee is saved
            if (entry.consignee) {
                invoiceData.value.shippedTo = { 
                    name: entry.consignee.name,
                    address: entry.consignee.address,
                    gst: entry.consignee.gst || '',
                    state: entry.consignee.state || 'Jammu & Kashmir',
                    stateCode: '01' // infer?
                };
            }
            
            // Check for extended fields support (Backwards compat)
            if ((entry as any).billedTo) {
                 invoiceData.value.billedTo = (entry as any).billedTo;
            }
        }
    } else {
        loadInvoiceNo();
    }
});

const inventoryOptions = computed(() => inventoryStore.items.map(i => ({ title: i.name, value: i.id, item: i })));

const onCustomerSelect = (customer: any) => {
    if(customer && customer.value) {
        const c = customer.value;
        invoiceData.value.billedTo.name = c.firmName || c.dealerName;
        invoiceData.value.billedTo.address = c.address || ''; // Added address population
        invoiceData.value.billedTo.gst = c.gstNumber || '';
        
        // Populate Vehicles
        if (c.vehicles && Array.isArray(c.vehicles)) {
            availableVehicles.value = c.vehicles;
            // Optional: Auto-select if only one
            if (c.vehicles.length > 0) {
                 invoiceData.value.vehicleNo = c.vehicles[0];
            }
        } else {
            availableVehicles.value = [];
        }
    } else {
        availableVehicles.value = [];
    }
}

const copyBilledToConsignee = () => {
    invoiceData.value.shippedTo = { ...invoiceData.value.billedTo };
};



const onItemSelect = (selection: any, index: number) => {
   const item = invoiceData.value.items[index];
   if (selection && selection.item && item) {
       item.name = selection.item.name;
       item.rate = selection.item.price;
       if (selection.item.hsn) item.hsn = selection.item.hsn;
       
       if (selection.item.gstRate) {
           const halfRate = selection.item.gstRate / 2;
           item.cgstRate = halfRate;
           item.sgstRate = halfRate;
           item.igstRate = 0;
       }
   }
};

// --- Calculations ---

interface CalculatedItem {
    amount: number;       // Qty * Rate
    taxableValue: number; // Amount - Discount
    cgstAmt: number;
    sgstAmt: number;
    igstAmt: number;
    total: number;
}

const getCalculatedItem = (item: any): CalculatedItem => {
    const qty = item.qty || 0;
    const rate = item.rate || 0;
    const discount = item.discount || 0;
    
    const amount = qty * rate;
    const taxableValue = Math.max(0, amount - discount);
    
    // Taxes are on Taxable Value
    const cgstAmt = taxableValue * (item.cgstRate || 0) / 100;
    const sgstAmt = taxableValue * (item.sgstRate || 0) / 100;
    const igstAmt = taxableValue * (item.igstRate || 0) / 100;
    
    const total = taxableValue + cgstAmt + sgstAmt + igstAmt;
    
    return { amount, taxableValue, cgstAmt, sgstAmt, igstAmt, total };
};

const calculatedItems = computed(() => {
    return invoiceData.value.items.map(item => ({
        ...item,
        ...getCalculatedItem(item)
    }));
});

const totalQty = computed(() => invoiceData.value.items.reduce((sum, i) => sum + (i.qty || 0), 0));

const summary = computed(() => {
    return calculatedItems.value.reduce((acc, item) => {
        acc.subTotal += item.amount;
        acc.discount += (item.discount || 0);
        acc.taxableValue += item.taxableValue;
        acc.cgst += item.cgstAmt;
        acc.sgst += item.sgstAmt;
        acc.igst += item.igstAmt;
        acc.grandTotal += item.total;
        
        // Track unique rates for display
        if(item.cgstAmt > 0) acc.rates.cgst.add(item.cgstRate);
        if(item.sgstAmt > 0) acc.rates.sgst.add(item.sgstRate);
        if(item.igstAmt > 0) acc.rates.igst.add(item.igstRate);
        
        return acc;
    }, { 
        subTotal: 0, 
        discount: 0, 
        taxableValue: 0, 
        cgst: 0, 
        sgst: 0, 
        igst: 0, 
        grandTotal: 0,
        rates: { cgst: new Set<number>(), sgst: new Set<number>(), igst: new Set<number>() }
    });
});

const taxLabels = computed(() => {
    const s = summary.value;
    const format = (set: Set<number>) => set.size === 1 ? ` @ ${[...set][0]}%` : '';
    
    // Helper to safely get the first element of a set
    const getFirst = (set: Set<number>) => [...set][0] || 0;

    const totalRate = (s.rates.cgst.size === 1 && s.rates.sgst.size === 1) 
        ? ` @ ${getFirst(s.rates.cgst) + getFirst(s.rates.sgst)}%` 
        : (s.rates.igst.size === 1 ? ` @ ${getFirst(s.rates.igst)}%` : '');

    return {
        cgst: `CGST${format(s.rates.cgst)}`,
        sgst: `SGST${format(s.rates.sgst)}`,
        igst: `IGST${format(s.rates.igst)}`,
        total: `Total GST${totalRate}`
    };
});

const numToWords = (n: number): string => {
    const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
    const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

    if (n.toString().length > 9) return 'overflow';
    
    // Helper to convert 0-99 to words
    const convertProcess = (num: number): string => {
        if (num === 0) return '';
        if (num < 20) return a[num] || '';
        const tens = Math.floor(num / 10);
        const units = num % 10;
        return (b[tens] || '') + (units ? ' ' + (a[units] || '') : '');
    };

    const nStr = ('000000000' + n).substr(-9);
    const nNum = nStr.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!nNum) return ''; 
    
    let str = '';
    
    const crore = parseInt(nNum[1]!);
    if (crore > 0) str += convertProcess(crore) + 'Crore ';
    
    const lakh = parseInt(nNum[2]!);
    if (lakh > 0) str += convertProcess(lakh) + 'Lakh ';
    
    const thousand = parseInt(nNum[3]!);
    if (thousand > 0) str += convertProcess(thousand) + 'Thousand ';
    
    const hundred = parseInt(nNum[4]!);
    if (hundred > 0) str += convertProcess(hundred) + 'Hundred ';
    
    const end = parseInt(nNum[5]!);
    if (end > 0) {
        if (str !== '') str += 'and ';
        str += convertProcess(end);
    }
    
    return str;
};

const amountInWords = computed(() => {
    return "Rupees " + numToWords(Math.round(summary.value.grandTotal)) + " Only"; 
});

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
};

const billingStore = useBillingStore();

const saveDraft = () => {
    // Map invoiceData to BillingEntry structure
    const entry: any = {
        vehicleNo: invoiceData.value.vehicleNo,
        items: calculatedItems.value.map(item => ({
            inventoryItemId: (item.inventoryId as any)?.id || null, // Keep null if ad-hoc
            name: item.name,
            hsn: item.hsn,
            qty: item.qty,
            price: item.rate,
            discount: item.discount,
            taxableValue: item.taxableValue,
            cgstRate: item.cgstRate,
            cgstAmount: item.cgstAmt,
            sgstRate: item.sgstRate,
            sgstAmount: item.sgstAmt,
            igstRate: item.igstRate,
            igstAmount: item.igstAmt,
            total: item.total
        })),
        totalAmount: summary.value.grandTotal,
        totalWeight: totalQty.value, // Approximate as qty
        customerName: invoiceData.value.billedTo.name || 'Draft Customer',
        status: 'Draft',
        
        // Extended Details
        consignee: { ...invoiceData.value.shippedTo },
        // Save BilledTo explicitly to fix data loss issue
        billedTo: { ...invoiceData.value.billedTo },
        
        invoiceDetails: {
            invoiceNo: invoiceData.value.invoiceNo,
            reverseCharge: invoiceData.value.reverseCharge,
            transportMode: invoiceData.value.transportMode,
            dateOfSupply: invoiceData.value.dateOfSupply,
            placeOfSupply: invoiceData.value.placeOfSupply
        },
        taxDetails: {
            cgst: summary.value.cgst,
            sgst: summary.value.sgst,
            igst: summary.value.igst
        },
        bankDetails: { ...settingsStore.companyProfile }
    };

    if (editingId.value) {
        billingStore.updateEntry(editingId.value, entry);
        snackbar.showSnackbar('Draft Updated Successfully!', 'success');
    } else {
        billingStore.addEntry(entry);
        snackbar.showSnackbar('Draft Saved Successfully!', 'success');
        // Optional: Route to history or reset form?
        // router.push('/history');
    }
};

const generatePDF = async (filenameSuffix = '') => {
    generating.value = true;
    const element = document.getElementById('invoice-template');
    if(!element) {
        generating.value = false;
        return;
    }
    
    // Ensure container is visible for html2canvas
    const container = document.querySelector('.pdf-container') as HTMLElement;
    if(container) container.style.display = 'block'; 
    
    try {
        const canvas = await html2canvas(element, {
            scale: 2, 
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        const fileName = filenameSuffix 
            ? `Invoice_${invoiceData.value.invoiceNo}_${filenameSuffix}.pdf`
            : `Invoice_${invoiceData.value.invoiceNo}.pdf`;
            
        pdf.save(fileName);
        
        // Reset and Increment Logic
        setTimeout(() => {
            const currentNo = parseInt(invoiceData.value.invoiceNo);
            const nextNo = !isNaN(currentNo) ? (currentNo + 1).toString() : '1';
            
            // Persist the NEW number so it's ready for next time or reload
            localStorage.setItem('lastInvoiceNo', nextNo);
            
            invoiceData.value = {
                invoiceNo: nextNo,
                date: new Date().toISOString().split('T')[0],
                vehicleNo: '',
                transportMode: '',
                dateOfSupply: '',
                placeOfSupply: '',
                reverseCharge: false,
                billedTo: { name: '', address: '', gst: '', state: 'Jammu & Kashmir', stateCode: '01' },
                shippedTo: { name: '', address: '', gst: '', state: 'Jammu & Kashmir', stateCode: '01' },
                items: [
                   { 
                        inventoryId: null, 
                        name: '', 
                        hsn: '', 
                        qty: 0, 
                        rate: 0, 
                        discount: 0, 
                        cgstRate: 9, 
                        sgstRate: 9, 
                        igstRate: 0 
                   }
                ]
            };
            selectedCustomer.value = null;
        }, 1000);
        
    } catch (e) {
        console.error("PDF Gen Error", e);
    } finally {
        if(container) container.style.display = 'none';
        generating.value = false;
    }
};

</script>

<style scoped>
/* Form Styles */
.v-text-field :deep(input) {
    font-weight: 600;
}

/* Print Template Styles matching the Screenshot */
.invoice-box {
    width: 210mm;
    min-height: 297mm;
    padding: 10mm;
    margin: 0 auto;
    background: white;
    font-family: 'Times New Roman', serif; /* Looks closer to the print font */
    color: black;
    border: 1px solid #ddd;
    box-sizing: border-box;
}

.header-section {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
    border-bottom: 2px solid black;
    padding-bottom: 5px;
}

.company-logo {
    width: 15%;
}
.om-symbol {
    font-size: 40px;
    font-weight: bold;
}

.company-title {
    width: 60%;
    text-align: center;
}
.company-title h1 {
    font-size: 24px;
    font-weight: 900;
    margin: 0;
    text-transform: uppercase;
}
.company-title p {
    margin: 2px 0;
    font-size: 14px;
}

.invoice-meta {
    width: 25%;
    font-size: 12px;
    text-align: right;
}

.info-grid {
    display: flex;
    border: 1px solid black;
    border-top: none; /* Removing double border if used */
}
.left-info, .right-info {
    width: 50%;
    padding: 5px;
}
.left-info { border-right: 1px solid black; }

.row { margin-bottom: 2px; font-size: 14px; }
.highlight { color: red; font-weight: bold; }

.party-table, .item-table {
    width: 100%;
    border-collapse: collapse;
    border: 1px solid black;
    border-top: none;
}
.party-table td {
    border: 1px solid black;
    vertical-align: top;
    padding: 0;
}
.party-header {
    border-bottom: 1px solid black;
    padding: 2px 5px;
    background: #f0f0f0;
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    font-size: 12px;
}
.party-content {
    padding: 5px;
    font-size: 14px;
    min-height: 80px;
}

.item-table th, .item-table td {
    border-right: 1px solid black;
    border-bottom: none;
    border-top: none;
    border-left: 1px solid black;
    padding: 5px;
    text-align: center;
    font-size: 12px;
}
.item-table th {
    border-bottom: 1px solid black;
    border-top: 1px solid black;
}
.item-table tbody tr:last-child td {
    border-bottom: 1px solid black;
}
.item-table th { background: #f0f0f0; }

.footer-section {
    border: 1px solid black;
    border-top: none;
    font-size: 12px;
}
.amount-words {
    padding: 5px;
    border-bottom: 1px solid black;
}
.footer-grid {
    display: flex;
}
.bank-details {
    width: 50%;
    padding: 5px;
    border-right: 1px solid black;
}
.signature-section {
    width: 50%;
    padding: 5px;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}
.for-company {
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 40px;
}
.gst-row {
    display: flex;
    justify-content: space-between;
}
.terms ol {
    padding-left: 15px;
    margin: 5px 0 0 0;
}
</style>
