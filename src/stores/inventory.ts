import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: 'metal' | 'paper' | 'plastic' | 'electronic' | 'other';
  quantity: number;
  icon: string;
  color: string;
  iconColor: string;
}

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const items = ref<InventoryItem[]>([]);
  const searchQuery = ref('');
  const categoryFilter = ref('all'); // 'all', 'metal', 'paper', 'plastic', 'electronic', 'other'

  // Load from localStorage on init
  const loadFromStorage = () => {
    const stored = localStorage.getItem('scrap-dealer-inventory');
    if (stored) {
      items.value = JSON.parse(stored);
    } else {
      // Initial mock data
      items.value = [
        { 
          id: '1',
          name: 'Iron Scrap', 
          description: 'Heavy metal waste', 
          price: 0.50, 
          unit: 'kg',
          category: 'metal',
          quantity: 1250,
          icon: 'mdi-hammer',
          color: 'blue-lighten-5',
          iconColor: 'primary'
        },
        { 
          id: '2',
          name: 'Copper Wire', 
          description: 'Insulated wire', 
          price: 4.20, 
          unit: 'kg',
          category: 'metal',
          quantity: 340,
          icon: 'mdi-snake',
          color: 'orange-lighten-5',
          iconColor: 'warning'
        },
        { 
          id: '3',
          name: 'Old Newspaper', 
          description: 'Newspapers, books', 
          price: 0.15, 
          unit: 'kg',
          category: 'paper',
          quantity: 5000,
          icon: 'mdi-newspaper',
          color: 'blue-grey-lighten-5',
          iconColor: 'blue-grey'
        },
        { 
          id: '4',
          name: 'E-Waste', 
          description: 'PCBs, Motherboards', 
          price: 8.50, 
          unit: 'kg',
          category: 'electronic',
          quantity: 50,
          icon: 'mdi-chip',
          color: 'purple-lighten-5',
          iconColor: 'purple'
        },
         { 
          id: '5',
          name: 'Plastic Bottles', 
          description: 'PET bottles', 
          price: 0.20, 
          unit: 'kg',
          category: 'plastic',
          quantity: 800,
          icon: 'mdi-bottle-soda',
          color: 'cyan-lighten-5',
          iconColor: 'cyan'
        }
      ];
      saveToStorage();
    }
  };

  const saveToStorage = () => {
    localStorage.setItem('scrap-dealer-inventory', JSON.stringify(items.value));
  };

  // Getters
  const filteredItems = computed(() => {
    return items.value.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.value.toLowerCase());
      const matchesFilter = categoryFilter.value === 'all' || item.category === categoryFilter.value;
      
      return matchesSearch && matchesFilter;
    });
  });

  // Actions
  const addItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString(),
    };
    items.value.push(newItem);
    saveToStorage();
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    const index = items.value.findIndex(item => item.id === id);
    if (index !== -1) {
      // Cast the result to InventoryItem to satisfy strict type checks
      // knowing we are merging into an existing valid item
      const updatedItem = { ...items.value[index], ...updates } as InventoryItem;
      items.value[index] = updatedItem;
      saveToStorage();
    }
  };

  const deleteItem = (id: string) => {
    items.value = items.value.filter(item => item.id !== id);
    saveToStorage();
  };
  
  const updateStock = (id: string, change: number) => {
      const index = items.value.findIndex(i => i.id === id);
      if (index !== -1 && items.value[index]) {
          items.value[index].quantity += change;
          saveToStorage();
      }
  };

  // Initialize
  loadFromStorage();

  return {
    items,
    searchQuery,
    categoryFilter,
    filteredItems,
    addItem,
    updateItem,
    deleteItem,
    updateStock
  };
});
