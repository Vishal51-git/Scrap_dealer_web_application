import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface User {
  name: string;
  mobile: string;
  email?: string;
  role: 'Super Admin' | 'Normal User';
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null);
  const isAuthenticated = ref(false);

  // Mock OTP sending
  const sendOtp = async (mobile: string): Promise<boolean> => {
    console.log(`Sending OTP to ${mobile}...`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true; 
  };

  // Mock OTP verification (always 123456)
  const verifyOtp = async (mobile: string, otp: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (otp === '123456') {
      isAuthenticated.value = true;
      return true;
    }
    return false;
  };

  const register = (user: User) => {
    currentUser.value = user;
    isAuthenticated.value = true;
    // Persist if needed
    localStorage.setItem('scrap_user', JSON.stringify(user));
  };

  const login = (user: User) => {
      currentUser.value = user;
      isAuthenticated.value = true;
      localStorage.setItem('scrap_user', JSON.stringify(user));
  }

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
      }
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
    sendOtp,
    verifyOtp,
    register,
    login,
    logout,
    updateProfile
  };
});
