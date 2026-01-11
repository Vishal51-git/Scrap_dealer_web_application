import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Dealer {
  id: string;
  userId: string; // Added userId
  dealerName: string;
  firmName: string;
  mobile?: string;
  gstNumber: string;
  vehicles: string[];
}

import { useAuthStore } from './auth';

export const useDealerStore = defineStore('dealers', () => {
    const allDealers = ref<Dealer[]>([]);
    
    // Initial Load
    const stored = localStorage.getItem('dealers');
    if (stored) {
        allDealers.value = JSON.parse(stored);
    }

    const authStore = useAuthStore();

    // Computed: Filtered by current user
    const dealers = computed(() => {
        if (!authStore.currentUser?.email) return [];
        return allDealers.value.filter(d => d.userId === authStore.currentUser?.email);
    });

    const syncToStorage = () => {
        localStorage.setItem('dealers', JSON.stringify(allDealers.value));
    };

    const addDealer = (dealer: Omit<Dealer, 'id' | 'userId'>) => {
        if (!authStore.currentUser?.email) return;

        const newDealer: Dealer = {
            ...dealer,
            id: Date.now().toString(),
            userId: authStore.currentUser.email
        };
        allDealers.value.push(newDealer);
        syncToStorage();
    };

    const updateDealer = (id: string, updatedDealer: Partial<Dealer>) => {
        const index = allDealers.value.findIndex(d => d.id === id);
        if (index !== -1) {
            allDealers.value[index] = { ...allDealers.value[index], ...updatedDealer } as Dealer;
             syncToStorage();
        }
    };

    const deleteDealer = (id: string) => {
        const index = allDealers.value.findIndex(d => d.id === id);
        if (index !== -1) {
            allDealers.value.splice(index, 1);
             syncToStorage();
        }
    };

    const getDealerById = (id: string) => {
        return allDealers.value.find(d => d.id === id);
    };

    return {
        dealers,
        addDealer,
        updateDealer,
        deleteDealer,
        getDealerById
    };
});
