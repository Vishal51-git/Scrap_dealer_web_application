import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface TeamMember {
  id: string;
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
  // State
  const members = ref<TeamMember[]>([]);
  const searchQuery = ref('');
  const currentFilter = ref('all'); // 'all', 'admin', 'staff', 'viewer'

  // Load from localStorage on init
  const loadFromStorage = () => {
    const stored = localStorage.getItem('scrap-dealer-team');
    if (stored) {
      members.value = JSON.parse(stored);
    } else {
      // Initial mock data
      members.value = [
        {
          id: '1',
          name: 'Tom Cook',
          email: 'tom.cook@scrap-co.com',
          role: 'admin',
          avatar: 'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairDreads01&accessoriesType=Blank&hairColor=Brown&facialHairType=BeardMajestic&clotheType=Hoodie&eyeType=Happy&eyebrowType=Default&mouthType=Smile&skinColor=Light',
          permissions: { createInvoices: true, deleteRecords: true, exportReports: true },
          isActive: true
        },
        {
          id: '2',
          name: 'Michael Foster',
          email: 'michael.f@scrap-co.com',
          role: 'staff',
          avatar: 'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Blank&hairColor=Black&facialHairType=Blank&clotheType=CollarSweater&eyeType=Squint&eyebrowType=Default&mouthType=Default&skinColor=Tanned',
          permissions: { createInvoices: true, deleteRecords: false, exportReports: true },
          isActive: true
        },
        {
            id: '3',
            name: 'Dries Vincent',
            email: 'dries.vincent@scrap-co.com',
            role: 'staff',
            avatar: 'https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortCurly&accessoriesType=Wayfarers&hairColor=Brown&facialHairType=BeardLight&clotheType=BlazerShirt&eyeType=Happy&eyebrowType=Default&mouthType=Default&skinColor=Yellow',
            permissions: { createInvoices: true, deleteRecords: false, exportReports: false },
            isActive: true
        },
        {
            id: '4',
            name: 'Lindsay Walton',
            email: 'lindsay.walton@scrap-co.com',
            role: 'viewer',
            avatar: 'https://avataaars.io/?avatarStyle=Circle&topType=LongHairStraight&accessoriesType=Blank&hairColor=Blonde&facialHairType=Blank&clotheType=ShirtScoopNeck&eyeType=Happy&eyebrowType=Default&mouthType=Default&skinColor=Pale',
            permissions: { createInvoices: false, deleteRecords: false, exportReports: true },
            isActive: true
        }
      ];
      saveToStorage();
    }
  };

  const saveToStorage = () => {
    localStorage.setItem('scrap-dealer-team', JSON.stringify(members.value));
  };

  // Getters
  const filteredMembers = computed(() => {
    return members.value.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                            member.email.toLowerCase().includes(searchQuery.value.toLowerCase());
      const matchesFilter = currentFilter.value === 'all' || member.role === currentFilter.value;
      
      return matchesSearch && matchesFilter;
    });
  });

  const getAdmins = computed(() => members.value.filter(m => m.role === 'admin'));
  const getStaff = computed(() => members.value.filter(m => m.role === 'staff'));
  const getViewers = computed(() => members.value.filter(m => m.role === 'viewer'));
  
  // Actions
  const addMember = (member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...member,
      id: Date.now().toString(), // Simple ID generation
    };
    members.value.push(newMember);
    saveToStorage();
  };

  const updateMember = (id: string, updates: Partial<TeamMember>) => {
    const index = members.value.findIndex(m => m.id === id);
    if (index !== -1) {
      // Ensure we don't accidentally overwrite the ID or other required fields with undefined if that were possible
      const updatedMember = { ...members.value[index], ...updates };
      
      // Explicitly ensure strict types are met if needed, but the spread usually works.
      // The issue is likely that Partial<T> allows explicit 'undefined', which isn't valid for the destination.
      // We can use Object.assign or just cast for now as we know our logic is safe.
       members.value[index] = updatedMember as TeamMember;
      saveToStorage();
    }
  };

  const removeMember = (id: string) => {
    members.value = members.value.filter(m => m.id !== id);
    saveToStorage();
  };

  // Initialize
  loadFromStorage();

  return {
    members,
    searchQuery,
    currentFilter,
    filteredMembers,
    getAdmins,
    getStaff,
    getViewers,
    addMember,
    updateMember,
    removeMember
  };
});
