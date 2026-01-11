import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface BillingEntryItem {
  inventoryItemId: string;
  name: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  price: number;
  total: number;
}

export interface BillingEntry {
  id: string;
  userId: string; // Added userId
  vehicleNo: string;
  items: BillingEntryItem[];
  totalAmount: number;
  totalWeight: number;
  customerName: string;
  date: string;
  status: 'Paid' | 'Pending';
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
    const history = computed(() => {
        if (!authStore.currentUser?.email) return [];
        
        let result = allHistory.value.filter(h => h.userId === authStore.currentUser?.email);

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
        history, // Expose only filtered
        searchQuery,
        addEntry,
        deleteEntry,
        getEntryById,
        updateEntry
    };
});
