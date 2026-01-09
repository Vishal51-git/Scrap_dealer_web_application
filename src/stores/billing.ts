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
  date: string; // ISO string
  vehicleNo: string;
  items: BillingEntryItem[];
  totalAmount: number;
  totalWeight: number;
  status: 'Paid' | 'Pending';
  customerName: string; 
}

export const useBillingStore = defineStore('billing', () => {
  const history = ref<BillingEntry[]>([]);

  // Load from storage
  const loadFromStorage = () => {
    const stored = localStorage.getItem('scrap-dealer-billing');
    if (stored) {
      history.value = JSON.parse(stored);
    } else {
        // Mock Data
        history.value = [
            {
                id: '1',
                date: new Date().toISOString(),
                vehicleNo: 'KA-05-EA-2200',
                items: [{ inventoryItemId: '1', name: 'Iron Scrap', grossWeight: 1250, tareWeight: 450, netWeight: 800, price: 0.5, total: 400 }],
                totalAmount: 1250.00, // Mocked total
                totalWeight: 800,
                status: 'Paid',
                customerName: 'John Doe'
            }
        ];
    }
  };

  const saveToStorage = () => {
    localStorage.setItem('scrap-dealer-billing', JSON.stringify(history.value));
  };

  const addEntry = (entry: Omit<BillingEntry, 'id' | 'date' | 'status'> & { status?: 'Paid' | 'Pending' }) => {
    const newEntry: BillingEntry = {
      status: 'Pending', // Default
      ...entry,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    history.value.unshift(newEntry); // Add to top
    saveToStorage();
  };

  // Getters
  const getGroupedHistory = computed(() => {
    const grouped: Record<string, BillingEntry[]> = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    history.value.forEach(entry => {
        const entryDate = new Date(entry.date).toDateString();
        let key = entryDate;
        if (entryDate === today) key = 'TODAY';
        else if (entryDate === yesterday) key = 'YESTERDAY';
        
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(entry);
    });
    return grouped;
  });

  const getEntryById = (id: string) => {
    return history.value.find(e => e.id === id);
  };

  const deleteEntry = (id: string) => {
    history.value = history.value.filter(e => e.id !== id);
    saveToStorage();
  };

  const updateEntry = (id: string, updatedEntry: Partial<BillingEntry>) => {
      const index = history.value.findIndex(e => e.id === id);
      if (index !== -1) {
          history.value[index] = { ...history.value[index], ...updatedEntry };
          saveToStorage();
      }
  };

  loadFromStorage();

  return {
    history,
    addEntry,
    getGroupedHistory,
    getEntryById,
    deleteEntry,
    updateEntry
  };
});
