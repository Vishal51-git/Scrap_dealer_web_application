<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <v-btn icon="mdi-chevron-left" variant="text" @click="$router.back()"></v-btn>
      <h1 class="text-h6 font-weight-bold">{{ $t('billing_history.title') }}</h1>
      <div class="d-flex">
        <v-btn icon="mdi-share-variant-outline" variant="text"></v-btn>
        <v-btn icon="mdi-tune" variant="text"></v-btn>
      </div>
    </div>

    <!-- Search -->
    <v-text-field
      v-model="billingStore.searchQuery"
      prepend-inner-icon="mdi-magnify"
      :label="$t('billing.search_placeholder')"
      variant="outlined"
      class="mb-6 rounded-lg bg-surface"
      hide-details
    ></v-text-field>

    <v-row>
      <v-col cols="12" sm="6">
        <v-card class="rounded-xl pa-3" elevation="0" border>
          <v-avatar color="blue-lighten-5" rounded="lg" size="36" class="mb-2">
            <v-icon color="primary" size="20">mdi-cash</v-icon>
          </v-avatar>
          <div class="text-caption text-medium-emphasis">{{ $t('billing_history.paid_today') }}</div>
          <div class="text-subtitle-1 font-weight-bold">{{ settings.formatCurrency(stats.paidToday) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6">
        <v-card class="rounded-xl pa-3" elevation="0">
          <v-avatar color="orange-lighten-5" rounded="lg" size="36" class="mb-2">
            <v-icon color="warning" size="20">mdi-clock-outline</v-icon>
          </v-avatar>
          <div class="text-caption text-medium-emphasis">{{ $t('billing_history.pending_invoices') }}</div>
          <div class="text-subtitle-1 font-weight-bold">{{ stats.pending }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Reports Button -->
    <v-btn block color="primary" class="text-none my-4 rounded-lg" size="large" prepend-icon="mdi-file-document-outline">
      {{ $t('billing_history.reports_analytics') }}
      <template v-slot:append>
        <v-icon>mdi-chevron-down</v-icon>
      </template>
    </v-btn>

    <!-- Filters -->
    <div class="d-flex overflow-x-auto mb-4" style="gap: 8px; scrollbar-width: none;">
      <v-chip 
        :color="filterType === 'All' ? 'primary' : undefined" 
        :variant="filterType === 'All' ? 'flat' : 'outlined'" 
        @click="setFilter('All')"
      >{{ $t('billing_history.filters.all') }}</v-chip>
      
      <v-chip 
        :color="filterType === 'Paid' ? 'primary' : undefined" 
        :variant="filterType === 'Paid' ? 'flat' : 'outlined'" 
        class="bg-surface"
        @click="setFilter('Paid')"
      >Paid</v-chip>
      
      <v-chip 
        :color="filterType === 'Pending' ? 'primary' : undefined" 
        :variant="filterType === 'Pending' ? 'flat' : 'outlined'" 
        class="bg-surface"
        @click="setFilter('Pending')"
      >Pending</v-chip>
    </div>

    <!-- Grouped List -->
    <div v-for="(group, date) in groupedHistory" :key="date" class="mb-4">
      <div class="text-overline text-medium-emphasis mb-2 pl-1">{{ date }}</div>
      
      <v-card v-for="(item, i) in group" :key="i" class="mb-3 rounded-xl" elevation="0" border>
        <div class="d-flex align-center pa-3">
          <!-- Icon -->
          <v-avatar :color="item.color" class="mr-3" rounded="lg">
            <span class="text-subtitle-2 font-weight-bold">{{ item.initials }}</span>
          </v-avatar>
          
          <!-- Details -->
          <div class="flex-grow-1">
            <div class="d-flex justify-space-between align-center">
              <span class="text-subtitle-1 font-weight-bold">{{ item.title }}</span>
              <span class="text-subtitle-1 font-weight-bold" :class="item.amount > 0 ? 'text-success' : ''">
                {{ item.amount > 0 ? '+' : '' }}{{ settings.formatCurrency(item.amount) }}
              </span>
            </div>
            
            <div class="d-flex justify-space-between align-end">
              <div class="text-caption text-medium-emphasis">
                {{ item.subtitle }} <br>
                {{ item.details }}
              </div>
              <v-chip size="x-small" :color="item.status === 'Paid' ? 'success' : 'warning'" variant="flat">
                {{ item.status }}
              </v-chip>
            </div>
          </div>

          <!-- Actions -->
          <div class="d-flex flex-column ml-2 border-s pl-2">
            <v-btn icon="mdi-eye" size="x-small" variant="text" color="primary" @click="viewBill(item.id)"></v-btn>
            <v-btn icon="mdi-pencil" size="x-small" variant="text" color="grey" @click="editBill(item.id)"></v-btn>
            <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click="deleteBill(item.id)"></v-btn>
          </div>
        </div>
      </v-card>
    </div>

    <!-- Details Dialog -->
    <v-dialog v-model="showDetailsDialog" max-width="500">
      <v-card v-if="selectedBill" class="rounded-xl">
        <v-toolbar color="surface" density="compact">
            <v-toolbar-title class="text-subtitle-1 font-weight-bold">Bill Details</v-toolbar-title>
            <v-btn icon="mdi-close" variant="text" @click="showDetailsDialog = false"></v-btn>
        </v-toolbar>
        
        <v-card-text class="pa-4" ref="billContent">
            <div class="d-flex justify-space-between mb-4">
                <div>
                    <div class="text-caption text-medium-emphasis">Customer</div>
                    <div class="font-weight-bold">{{ selectedBill.customerName }}</div>
                </div>
                 <div class="text-right">
                    <div class="text-caption text-medium-emphasis">Date</div>
                    <div class="font-weight-bold">{{ new Date(selectedBill.date).toLocaleDateString() }}</div>
                </div>
            </div>
             <div class="d-flex justify-space-between mb-4">
                <div>
                    <div class="text-caption text-medium-emphasis">Vehicle No</div>
                    <div class="font-weight-bold text-uppercase">{{ selectedBill.vehicleNo }}</div>
                </div>
                 <div class="text-right">
                    <div class="text-caption text-medium-emphasis">Status</div>
                     <v-chip size="x-small" :color="selectedBill.status === 'Paid' ? 'success' : 'warning'" variant="flat">
                        {{ selectedBill.status || 'Paid' }}
                    </v-chip>
                </div>
            </div>

            <v-divider class="mb-3"></v-divider>
            <div class="text-caption font-weight-bold mb-2 text-uppercase">Items</div>
            
            <div v-for="item in selectedBill.items" :key="item.inventoryItemId" class="mb-3 border rounded-lg pa-2">
                <div class="d-flex justify-space-between font-weight-bold mb-1">
                    <span>{{ item.name }}</span>
                    <span>{{ settings.formatCurrency(item.total) }}</span>
                </div>
                <div class="d-flex justify-space-between text-caption text-medium-emphasis">
                    <span>{{ item.netWeight }} kg x {{ settings.formatCurrency(item.price) }}</span>
                    <span>Gross: {{ item.grossWeight }} | Tare: {{ item.tareWeight }}</span>
                </div>
            </div>

            <v-divider class="mb-3"></v-divider>
            
            <div class="d-flex justify-space-between align-center">
                <span class="text-subtitle-1 font-weight-bold">Total Amount</span>
                <span class="text-h6 font-weight-bold text-primary">{{ settings.formatCurrency(selectedBill.totalAmount) }}</span>
            </div>
             <div class="d-flex justify-space-between align-center">
                <span class="text-caption text-medium-emphasis">Total Weight</span>
                <span class="text-body-2 font-weight-bold">{{ selectedBill.totalWeight }} kg</span>
            </div>

        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
            <v-btn variant="outlined" color="primary" class="flex-grow-1" prepend-icon="mdi-printer" @click="printBill">Print</v-btn>
            <v-btn variant="flat" color="primary" class="flex-grow-1" prepend-icon="mdi-file-pdf-box" @click="downloadPDF">Export PDF</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Pagination -->
    <AppPagination
        v-model="currentPage"
        :total-items="filteredEntries.length"
        :items-per-page="itemsPerPage"
    />

    <ConfirmDeleteDialog 
        v-model="confirmDeleteDialog"
        title="Delete Bill?"
        message="Are you sure you want to delete this bill"
        @confirm="confirmDeletion"
    />

    <!-- FAB -->
    <v-btn position="fixed" location="bottom right" color="primary" icon="mdi-plus" size="large" elevation="4" class="mb-2 mr-4" style="z-index: 100; bottom: 80px;" to="/billing/new"></v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { useBillingStore } from '../stores/billing';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useSnackbarStore } from '../stores/snackbar';

const settings = useSettingsStore();
const billingStore = useBillingStore();
const snackbar = useSnackbarStore();



const searchQuery = ref('');
const filterType = ref('All');

const stats = computed(() => {
    const today = new Date().toDateString();
    let paidToday = 0;
    let pending = 0;
    
    billingStore.history.forEach(entry => {
        const entryDate = new Date(entry.date).toDateString();
        if (entryDate === today && entry.status === 'Paid') {
            paidToday += entry.totalAmount;
        }
        if (entry.status === 'Pending') {
            pending++;
        }
    });

    return { paidToday, pending };
});

const setFilter = (type: string) => {
    filterType.value = type;
};



const editBill = (id: string) => {
    // Navigate to New Billing with ID query param
    import('../router').then(({ default: router }) => {
        router.push({ path: '/billing/new', query: { id } });
    });
};

import AppPagination from '../components/AppPagination.vue';
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog.vue';

const showDetailsDialog = ref(false);
const selectedBill = ref<any>(null);
const billContent = ref<HTMLElement | null>(null);

const confirmDeleteDialog = ref(false);
const itemToDelete = ref<string | null>(null);

const currentPage = ref(1);
const itemsPerPage = 10;

const viewBill = (id: string) => {
    const entry = billingStore.getEntryById(id);
    if (entry) {
        selectedBill.value = entry;
        showDetailsDialog.value = true;
    }
};

const deleteBill = (id: string) => {
    itemToDelete.value = id;
    confirmDeleteDialog.value = true;
};

const confirmDeletion = () => {
    if (itemToDelete.value) {
        billingStore.deleteEntry(itemToDelete.value);
        confirmDeleteDialog.value = false;
        itemToDelete.value = null;
    }
};

const printBill = () => {
    if (!billContent.value) return;
    
    const printWindow = window.open('', '', 'height=600,width=800');
    if(printWindow) {
        printWindow.document.write('<html><head><title>Print Bill</title>');
        printWindow.document.write('<style>body{font-family: sans-serif; padding: 20px; background-color: white; color: black;} .mb-4{margin-bottom:16px} .d-flex{display:flex} .justify-space-between{justify-content:space-between} .text-right{text-align:right} .font-weight-bold{font-weight:bold} .text-uppercase{text-transform:uppercase} .mb-3{margin-bottom:12px} .mb-1{margin-bottom:4px} .text-caption{font-size:0.8rem; color: #666} .text-h6{font-size:1.25rem; font-weight:bold} .border{border: 1px solid #eee}</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(billContent.value.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }
};

const downloadPDF = async () => {
    if (!billContent.value) return;
    
    try {
        const canvas = await html2canvas(billContent.value, { 
            scale: 2,
            backgroundColor: '#ffffff' // Force white background for PDF
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Bill_${selectedBill.value.vehicleNo}_${new Date().getTime()}.pdf`);
    } catch (error) {
        console.error('Error generating PDF', error);
        snackbar.showSnackbar('Failed to download PDF', 'error');
    }
};

// 1. Filtered List
const filteredEntries = computed(() => {
    let entries = billingStore.history;

    // Search
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase();
        entries = entries.filter(e => 
            e.customerName.toLowerCase().includes(q) || 
            e.vehicleNo.toLowerCase().includes(q) ||
            e.items.some(i => i.name.toLowerCase().includes(q))
        );
    }

    // Filter Chips
    if (filterType.value !== 'All') {
        if (filterType.value === 'Pending') {
            entries = entries.filter(e => e.status === 'Pending');
        } else if (filterType.value === 'Paid') {
            entries = entries.filter(e => e.status === 'Paid');
        }
    }
    
    return entries;
});

// 2. Paginated List
const paginatedEntries = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredEntries.value.slice(start, end);
});

// 3. Grouped List (for View)
const groupedHistory = computed(() => {
    const grouped: Record<string, any[]> = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    paginatedEntries.value.forEach(entry => {
        const entryDate = new Date(entry.date).toDateString();
        let key = entryDate;
        if (entryDate === today) key = 'TODAY';
        else if (entryDate === yesterday) key = 'YESTERDAY';
        
        if (!grouped[key]) grouped[key] = [];
        
        // Map to View Model
        const mainItem = entry.items[0];
        const itemName = mainItem ? mainItem.name : 'Unknown Item';
        const itemCount = entry.items.length;
        const title = itemCount > 1 ? `${itemName} +${itemCount - 1}` : itemName;
        
        grouped[key]!.push({
            id: entry.id,
            title: title,
            initials: itemName.substring(0, 2).toUpperCase(),
            color: 'blue-lighten-4 text-blue-darken-2',
            amount: entry.totalAmount,
            subtitle: entry.customerName,
            details: entry.vehicleNo,
            status: entry.status || 'Paid'
        });
    });
    
    return grouped;
});
</script>
