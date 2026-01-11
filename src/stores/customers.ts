import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
  avatar?: string;
}

export const useCustomerStore = defineStore('customers', () => {
  const customers = ref<Customer[]>([]);

  // Load Customers from Local Storage
  const loadCustomers = () => {
      const stored = localStorage.getItem('registered_users');
      if (stored) {
          customers.value = JSON.parse(stored);
      } else {
           customers.value = [];
      }
  };

  // Init
  loadCustomers();

  const searchQuery = ref('');

  const filteredCustomers = () => {
    if (!searchQuery.value) return customers.value;
    const lowerQuery = searchQuery.value.toLowerCase();
    return customers.value.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) || 
      (c.phone && c.phone.includes(searchQuery.value)) ||
      c.email.toLowerCase().includes(lowerQuery)
    );
  };

  const syncToStorage = () => {
      localStorage.setItem('registered_users', JSON.stringify(customers.value));
  };

  const deleteCustomer = (id: string) => {
    const index = customers.value.findIndex(c => c.id === id);
    if (index !== -1) {
      customers.value.splice(index, 1);
      syncToStorage();
    }
  };

  const updateCustomer = (id: string, updatedData: Partial<Customer>) => {
    const index = customers.value.findIndex(c => c.id === id);
    if (index !== -1) {
      customers.value[index] = { ...customers.value[index], ...updatedData, id } as Customer;
      syncToStorage();
    }
  };

  return {
    customers,
    searchQuery,
    filteredCustomers,
    deleteCustomer,
    updateCustomer,
    loadCustomers // Expose reload if needed
  };
});
