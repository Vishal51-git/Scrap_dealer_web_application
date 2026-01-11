import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from './auth';

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'viewer';
  avatar: string;
  permissions: {
    createInvoices: boolean;
    deleteRecords: boolean;
    exportReports: boolean;
  };
  isActive: boolean;
}

export const useTeamStore = defineStore('team', () => {
  const allMembers = ref<TeamMember[]>([]);
  const authStore = useAuthStore();
  const searchQuery = ref('');
  const currentFilter = ref('all');

  // Load from localStorage on init
  const loadFromStorage = () => {
    const stored = localStorage.getItem('team_members');
    if (stored) {
      allMembers.value = JSON.parse(stored);
    }
  };

  // Computed: Filtered by userId
  const filteredMembers = computed(() => {
    if (!authStore.currentUser?.email) return [];
    
    let members = allMembers.value.filter(m => m.userId === authStore.currentUser?.email);

    if (currentFilter.value !== 'all') {
      members = members.filter(m => m.role === currentFilter.value);
    }
    
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      members = members.filter(m => 
        m.name.toLowerCase().includes(q) || 
        m.email.toLowerCase().includes(q)
      );
    }
    
    return members;
  });

  // Helpers for view
  const getAdmins = computed(() => filteredMembers.value.filter(m => m.role === 'admin'));
  const getStaff = computed(() => filteredMembers.value.filter(m => m.role === 'staff'));
  const getViewers = computed(() => filteredMembers.value.filter(m => m.role === 'viewer'));

  const syncToStorage = () => {
    localStorage.setItem('team_members', JSON.stringify(allMembers.value));
  };

  const addMember = (member: Omit<TeamMember, 'id' | 'userId'>) => {
    if (!authStore.currentUser?.email) return;

    const newMember: TeamMember = {
      ...member,
      id: Date.now().toString(),
      userId: authStore.currentUser.email
    };
    allMembers.value.push(newMember);
    syncToStorage();
  };

  const updateMember = (id: string, updates: Partial<TeamMember>) => {
    const index = allMembers.value.findIndex(m => m.id === id);
    if (index !== -1) {
      allMembers.value[index] = { ...allMembers.value[index], ...updates } as TeamMember;
      syncToStorage();
    }
  };

  const removeMember = (id: string) => {
    const index = allMembers.value.findIndex(m => m.id === id);
    if (index !== -1) {
      allMembers.value.splice(index, 1);
      syncToStorage();
    }
  };

  // Initialize
  loadFromStorage();

  return {
    filteredMembers, // Main list
    searchQuery,
    currentFilter,
    getAdmins,
    getStaff,
    getViewers,
    addMember,
    updateMember,
    removeMember
  };
});
