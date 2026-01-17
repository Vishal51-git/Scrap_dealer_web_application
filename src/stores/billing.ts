import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface BillingEntryItem {
  inventoryItemId: string | null; // Changed to nullable as ad-hoc items allowed? Actually let's keep string but handle nulls in UI
  name: string;
  hsn?: string;
  grossWeight?: number;
  tareWeight?: number;
  netWeight?: number;
  qty: number;
  price: number; // Rate
  discount?: number;
  taxableValue?: number;
  cgstRate?: number;
  cgstAmount?: number;
  sgstRate?: number;
  sgstAmount?: number;
  igstRate?: number;
  igstAmount?: number;
  total: number;
}

export interface BillingEntry {
  id: string;
  userId: string;
  vehicleNo: string;
  items: BillingEntryItem[];
  totalAmount: number;
  totalWeight: number;
  customerName: string;
  date: string;
  status: 'Paid' | 'Pending' | 'Draft';
  
  // Extended Invoice Fields (Optional)
  consignee?: {
      name: string;
      address: string;
      gst?: string;
      state?: string;
  };
  invoiceDetails?: {
      invoiceNo?: string;
      reverseCharge?: boolean;
      transportMode?: string;
      dateOfSupply?: string;
      placeOfSupply?: string;
  };
  taxDetails?: {
      cgst: number;
      sgst: number;
      igst: number;
  };
  bankDetails?: {
      bankName: string;
      accountNo: string;
      ifsc: string;
      branch: string;
  };
}

import { useAuthStore } from './auth';

export const useBillingStore = defineStore('billing', () => {
    const allHistory = ref<BillingEntry[]>([]);

    // Initial Load
    const stored = localStorage.getItem('billing_history');
    if (stored) {
        allHistory.value = JSON.parse(stored);
    }
  
    const authStore = useAuthStore();
    const searchQuery = ref('');

    // Computed: Filtered by userId
    const userHistory = computed(() => {
        if (!authStore.currentUser?.email) return [];
        return allHistory.value.filter(h => h.userId === authStore.currentUser?.email);
    });

    const history = computed(() => {
        let result = userHistory.value;

        if (searchQuery.value) {
             const q = searchQuery.value.toLowerCase();
             result = result.filter(h => 
                 h.customerName.toLowerCase().includes(q) ||
                 h.vehicleNo.toLowerCase().includes(q) ||
                 h.status.toLowerCase().includes(q)
             );
        }
        return result;
    });

    const syncToStorage = () => {
        localStorage.setItem('billing_history', JSON.stringify(allHistory.value));
    };

    const addEntry = (entry: Omit<BillingEntry, 'id' | 'date' | 'userId'>) => {
        if (!authStore.currentUser?.email) return;

        const newEntry: BillingEntry = {
            ...entry,
            id: Date.now().toString(),
            userId: authStore.currentUser.email,
            date: new Date().toISOString()
        };
        allHistory.value.unshift(newEntry);
        syncToStorage();
    };

    const deleteEntry = (id: string) => {
        const index = allHistory.value.findIndex(e => e.id === id);
        if (index !== -1) {
            allHistory.value.splice(index, 1);
            syncToStorage();
        }
    };

    const updateEntry = (id: string, updates: Partial<BillingEntry>) => {
        const index = allHistory.value.findIndex(e => e.id === id);
        if (index !== -1) {
             allHistory.value[index] = { ...allHistory.value[index], ...updates } as BillingEntry;
             syncToStorage();
        }
    };

    const getEntryById = (id: string) => {
        return allHistory.value.find(e => e.id === id);
    };

    return {
        history, 
        userHistory, // Added
        searchQuery,
        addEntry,
        deleteEntry,
        getEntryById,
        updateEntry
    };
});
