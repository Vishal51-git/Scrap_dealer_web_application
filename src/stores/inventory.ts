import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';

export interface InventoryItem {
  id: string;
  userId: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: 'metal' | 'paper' | 'plastic' | 'electronic' | 'other';
  quantity: number;
  icon: string;
  color: string;
  iconColor: string;
  hsn?: string;
  gstRate?: number;
  lastUpdated?: string;
}

export const useInventoryStore = defineStore('inventory', () => {
    const allItems = ref<InventoryItem[]>([]);
    const authStore = useAuthStore();
    const searchQuery = ref('');
    const selectedCategory = ref('all');

    // Load from localStorage on init
    const loadFromStorage = () => {
        const stored = localStorage.getItem('inventory_items');
        if (stored) {
            allItems.value = JSON.parse(stored);
        }
    };

    // Computed: Filtered by userId
    const items = computed(() => {
        if (!authStore.currentUser?.email) return [];
        
        let result = allItems.value.filter(i => i.userId === authStore.currentUser?.email);

        if (selectedCategory.value !== 'all') {
            result = result.filter(i => i.category === selectedCategory.value);
        }

        if (searchQuery.value) {
            const q = searchQuery.value.toLowerCase();
            result = result.filter(i => i.name.toLowerCase().includes(q));
        }

        return result;
    });

    // Alias for compatibility if views use filteredItems
    const filteredItems = items;

    const syncToStorage = () => {
        localStorage.setItem('inventory_items', JSON.stringify(allItems.value));
    };

    const addItem = (item: Omit<InventoryItem, 'id' | 'userId'>) => {
        if (!authStore.currentUser?.email) return;

        const newItem: InventoryItem = {
            ...item,
            id: Date.now().toString(),
            userId: authStore.currentUser.email,
            lastUpdated: new Date().toISOString()
        };
        allItems.value.push(newItem);
        syncToStorage();
    };

    const updateItem = (id: string, updates: Partial<InventoryItem>) => {
        const index = allItems.value.findIndex(i => i.id === id);
        if (index !== -1) {
            allItems.value[index] = { 
                ...allItems.value[index], 
                ...updates,
                lastUpdated: new Date().toISOString()
            } as InventoryItem;
            syncToStorage();
        }
    };

    const deleteItem = (id: string) => {
        const index = allItems.value.findIndex(i => i.id === id);
        if (index !== -1) {
            allItems.value.splice(index, 1);
            syncToStorage();
        }
    };

    const updateStock = (id: string, change: number) => {
        const index = allItems.value.findIndex(i => i.id === id);
        if (index !== -1 && allItems.value[index]) {
            allItems.value[index].quantity += change;
            syncToStorage();
        }
    };

    // Initialize
    loadFromStorage();

    return {
        items,
        filteredItems, // Expose for compatibility
        searchQuery,
        selectedCategory,
        addItem,
        updateItem,
        deleteItem,
        updateStock,
        // Expose Refs for view binding if needed, though they are returned directly
    };
});
