import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface User {
  name: string;
  email: string; // Changed from optional to required for login
  mobile?: string; // Optional now
  role: 'super_admin' | 'customer'; // Updated roles
  password?: string; // Mock password field
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null);
  const isAuthenticated = ref(false);

  // Mock Login with Email/Password
  const login = async (email: string, password: string): Promise<boolean> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (email === 'superadmin@gmail.com' && password === 'admin123') {
          currentUser.value = {
              name: 'Super Admin',
              email: 'superadmin@gmail.com',
              role: 'super_admin'
          };
          isAuthenticated.value = true;
          localStorage.setItem('scrap_user', JSON.stringify(currentUser.value));
          return true;
      }
      
      // Check for stored customer
      const storedCustomers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      const foundUser = storedCustomers.find((u: any) => u.email === email && u.password === password);

      if (foundUser) {
           currentUser.value = {
              name: foundUser.name,
              email: foundUser.email,
              mobile: foundUser.mobile,
              role: 'customer'
          };
          isAuthenticated.value = true;
          localStorage.setItem('scrap_user', JSON.stringify(currentUser.value));
          return true;
      }

      return false;
  };

  const register = async (user: User & { password: string }): Promise<boolean> => {
       // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = {
          ...user,
          id: Date.now().toString(), // Generate ID
          role: 'customer' as const,
          status: 'active', // Default status
          joinedDate: new Date().toISOString().split('T')[0] // Current date YYYY-MM-DD
      };

      // Mock saving to "database" (localStorage) with corrected key
      const storedCustomers = JSON.parse(localStorage.getItem('registered_users') || '[]');
      storedCustomers.push(newUser);
      localStorage.setItem('registered_users', JSON.stringify(storedCustomers));

      // Auto login
      currentUser.value = newUser;
      isAuthenticated.value = true;
      localStorage.setItem('scrap_user', JSON.stringify(newUser));
      
      return true;
  };

  const logout = () => {
    currentUser.value = null;
    isAuthenticated.value = false;
    localStorage.removeItem('scrap_user');
  };

  // Update Profile
  const updateProfile = (updates: Partial<User>) => {
      if (currentUser.value) {
          currentUser.value = { ...currentUser.value, ...updates };
          localStorage.setItem('scrap_user', JSON.stringify(currentUser.value));
          
          // Also update in registered_users if it's a customer
          if (currentUser.value.role === 'customer') {
               const storedCustomers = JSON.parse(localStorage.getItem('registered_users') || '[]');
               const index = storedCustomers.findIndex((u: any) => u.email === currentUser.value?.email);
               if (index !== -1) {
                   storedCustomers[index] = { ...storedCustomers[index], ...updates };
                   localStorage.setItem('registered_users', JSON.stringify(storedCustomers));
               }
          }
      }
  };
  
  // Change Password
  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
       // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!currentUser.value) return false;
      
      // Since we don't store the password in currentUser in memory for security in a real app (but we do here for mock),
      // we need to verify against the stored record or the current mock logic.
      // For mock simplicity:
      
      // 1. Verify Old Password (Mock: In real app this is backend logic)
      let isValid = false;
      if (currentUser.value.role === 'super_admin') {
          isValid = (oldPassword === 'admin123'); // Hardcoded for superadmin
      } else {
          // For customers, check stored record
           const storedCustomers = JSON.parse(localStorage.getItem('registered_users') || '[]');
           const foundUser = storedCustomers.find((u: any) => u.email === currentUser.value?.email);
           if (foundUser && foundUser.password === oldPassword) {
               isValid = true;
           }
           // Fallback for just-registered user who might be in scrap_user but not fully synced or if we just rely on scrap_user
           if (!isValid) {
               // Check current session storage if we stored password there (we defined password? in User)
               const sessionUser = JSON.parse(localStorage.getItem('scrap_user') || '{}');
               if (sessionUser.password === oldPassword) isValid = true;
           }
      }
      
      if (!isValid) return false;
      
      // 2. Update Password
      if (currentUser.value.role === 'super_admin') {
          // Super admin password is hardcoded validation, we can't really change it in this mock without breaking the hardcoded check
          // But for simulation let's say we update it in local state if we were persisting it
          return true; 
      } else {
           const storedCustomers = JSON.parse(localStorage.getItem('registered_users') || '[]');
           const index = storedCustomers.findIndex((u: any) => u.email === currentUser.value?.email);
           if (index !== -1) {
               storedCustomers[index].password = newPassword;
               localStorage.setItem('registered_users', JSON.stringify(storedCustomers));
           }
           
           // Update session user too to keep consistency if we were storing it
            const sessionUser = JSON.parse(localStorage.getItem('scrap_user') || '{}');
            sessionUser.password = newPassword;
            localStorage.setItem('scrap_user', JSON.stringify(sessionUser));
      }
      
      return true;
  };

  // Initialize from storage
  const init = () => {
      const stored = localStorage.getItem('scrap_user');
      if (stored) {
          currentUser.value = JSON.parse(stored);
          isAuthenticated.value = true;
      }
  };

  init();

  return {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword
  };
});
