import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
  // Initialize from localStorage or default
  const savedCurrency = localStorage.getItem('currency') || 'INR';
  const currency = ref(savedCurrency);

  const currencyLocale = computed(() => {
    switch (currency.value) {
      case 'INR': return 'en-IN';
      case 'USD': return 'en-US';
      case 'EUR': return 'de-DE';
      default: return 'en-US';
    }
  });

  function setCurrency(newCurrency: string) {
    currency.value = newCurrency;
    localStorage.setItem('currency', newCurrency);
  }

  // Theme Management
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const theme = ref(savedTheme);

  function toggleTheme(globalTheme: any) {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    globalTheme.global.name.value = theme.value;
    localStorage.setItem('theme', theme.value);
  }

  // Language Management
  const savedLanguage = localStorage.getItem('language') || 'en';
  const language = ref(savedLanguage);

  function setLanguage(newLanguage: string) {
    language.value = newLanguage;
    localStorage.setItem('language', newLanguage);
  }

  // Color Management
  const savedColor = localStorage.getItem('primaryColor') || '#2563EB'; // Default Blue
  const primaryColor = ref(savedColor);

  function setPrimaryColor(color: string, globalTheme: any) {
    primaryColor.value = color;
    localStorage.setItem('primaryColor', color);
    
    // Update Vuetify Theme
    globalTheme.themes.value.light.colors.primary = color;
    globalTheme.themes.value.dark.colors.primary = color;
  }

  // Weather Widget
  const savedShowWeather = localStorage.getItem('showWeather') !== 'false'; // Default to true
  const showWeather = ref(savedShowWeather);

  function toggleWeather() {
    showWeather.value = !showWeather.value;
    localStorage.setItem('showWeather', String(showWeather.value));
  }

  // Company Profile
  const companyProfile = ref({
    name: 'BHOLA GUPTA & SONS',
    address: 'Sector-6, Nanak Nagar, Jammu.',
    gst: '01BDWPG7660J1Z7',
    mobile: '9419656911',
    bankName: 'J&K Bank Gangyal, Jammu',
    accountNo: '0116010100001524',
    ifsc: 'JAKA0GANGYAL',
    branch: 'Gangyal',
    terms: [
      'Goods once sold can not be returned.',
      'Warranty is the responsibility of Company for services.',
      'E. & O.E.'
    ]
  });

  function updateCompanyProfile(profile: any) {
    companyProfile.value = { ...companyProfile.value, ...profile };
    // In a real app, we'd persist this to backend or localStorage
    localStorage.setItem('companyProfile', JSON.stringify(companyProfile.value));
  }
  
  // Try to load from storage
  const savedProfile = localStorage.getItem('companyProfile');
  if(savedProfile) {
    try {
        companyProfile.value = { ...companyProfile.value, ...JSON.parse(savedProfile) };
    } catch(e) { console.error("Failed to parse saved profile", e); }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat(currencyLocale.value, {
      style: 'currency',
      currency: currency.value,
      minimumFractionDigits: 2,
    }).format(value);
  }

  return {
    currency,
    theme,
    language,
    primaryColor,
    showWeather,
    setCurrency,
    formatCurrency,
    toggleTheme,
    setLanguage,
    setPrimaryColor,
    toggleWeather,
    companyProfile,
    updateCompanyProfile
  };
});
