<template>
  <div class="h-100 bg-background">
    <!-- Header -->
    <div class="d-flex align-center pa-4 pb-2">
      <v-btn icon="mdi-arrow-left" variant="text" @click="$router.back()"></v-btn>
      <h1 class="text-h6 font-weight-bold ml-2">{{ $t('reports.title') }}</h1>
      <v-spacer></v-spacer>
      <!-- Time Filter -->
      <v-menu location="bottom end">
          <template v-slot:activator="{ props }">
              <v-btn v-bind="props" variant="tonal" color="primary" prepend-icon="mdi-calendar" class="text-none">
                  {{ selectedTimeRange }}
                  <v-icon end>mdi-chevron-down</v-icon>
              </v-btn>
          </template>
          <v-list density="compact" nav>
              <v-list-item v-for="option in timeRangeOptions" :key="option.value" :value="option.value" @click="setTimeRange(option)">
                  <v-list-item-title>{{ option.title }}</v-list-item-title>
              </v-list-item>
          </v-list>
      </v-menu>
    </div>

    <div class="pa-4 pt-0" style="max-height: calc(100vh - 70px); overflow-y: auto;">
        <!-- Summary Cards -->
        <v-row dense class="mb-4">
            <v-col cols="6" sm="3">
                <v-card class="rounded-xl pa-3" elevation="0" border>
                     <div class="text-caption text-medium-emphasis mb-1">{{ $t('reports.total_revenue') }}</div>
                     <div class="text-h6 font-weight-bold text-primary">{{ settings.formatCurrency(stats.totalRevenue) }}</div>
                     <div class="text-caption" :class="stats.revenueGrowth >= 0 ? 'text-success' : 'text-error'">
                         <v-icon size="x-small">{{ stats.revenueGrowth >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
                         {{ Math.abs(stats.revenueGrowth) }}%
                     </div>
                </v-card>
            </v-col>
            <v-col cols="6" sm="3">
                 <v-card class="rounded-xl pa-3" elevation="0" border>
                     <div class="text-caption text-medium-emphasis mb-1">{{ $t('reports.total_weight') }}</div>
                     <div class="text-h6 font-weight-bold">{{ stats.totalWeight }} kg</div>
                     <div class="text-caption text-medium-emphasis">
                         Volume
                     </div>
                </v-card>
            </v-col>
             <v-col cols="6" sm="3">
                 <v-card class="rounded-xl pa-3" elevation="0" border>
                     <div class="text-caption text-medium-emphasis mb-1">{{ $t('reports.total_bills') }}</div>
                     <div class="text-h6 font-weight-bold">{{ stats.totalBills }}</div>
                     <div class="text-caption text-medium-emphasis">
                         Invoices
                     </div>
                </v-card>
            </v-col>
             <v-col cols="6" sm="3">
                 <v-card class="rounded-xl pa-3" elevation="0" border>
                     <div class="text-caption text-medium-emphasis mb-1">{{ $t('reports.avg_ticket') }}</div>
                     <div class="text-h6 font-weight-bold">{{ settings.formatCurrency(stats.avgTicket) }}</div>
                     <div class="text-caption text-medium-emphasis">
                         Per Bill
                     </div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Charts Row -->
        <v-row class="mb-4">
            <!-- Revenue Trend -->
            <v-col cols="12" md="8">
                <v-card class="rounded-xl pa-4 h-100" elevation="0" border>
                    <div class="d-flex justify-space-between align-center mb-4">
                        <h3 class="text-subtitle-1 font-weight-bold">{{ $t('reports.revenue_trend') }}</h3>
                    </div>
                    <div style="min-height: 300px;">
                        <apexchart type="area" height="300" :options="revenueChartOptions" :series="revenueSeries"></apexchart>
                    </div>
                </v-card>
            </v-col>
            <!-- Material Distribution -->
            <v-col cols="12" md="4">
                <v-card class="rounded-xl pa-4 h-100" elevation="0" border>
                     <div class="d-flex justify-space-between align-center mb-4">
                        <h3 class="text-subtitle-1 font-weight-bold">{{ $t('reports.material_split') }}</h3>
                    </div>
                     <div class="d-flex align-center justify-center" style="min-height: 300px;">
                        <apexchart type="donut" width="100%" :options="materialChartOptions" :series="materialSeries"></apexchart>
                    </div>
                </v-card>
            </v-col>
        </v-row>

         <!-- Top Customers -->
        <v-card class="rounded-xl mb-4" elevation="0" border>
            <div class="pa-4 border-b">
                 <h3 class="text-subtitle-1 font-weight-bold">{{ $t('reports.top_performers') }}</h3>
            </div>
            <v-list bg-color="transparent">
                <v-list-item v-for="(customer, i) in topCustomers" :key="i">
                    <template v-slot:prepend>
                        <v-avatar color="surface-variant" class="font-weight-bold text-subtitle-2">{{ i + 1 }}</v-avatar>
                    </template>
                    <v-list-item-title class="font-weight-bold">{{ customer.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ customer.vehicleNo }}</v-list-item-subtitle>
                    
                    <template v-slot:append>
                        <div class="text-right">
                            <div class="font-weight-bold">{{ settings.formatCurrency(customer.totalAmount) }}</div>
                            <div class="text-caption text-medium-emphasis">{{ customer.totalWeight }} kg</div>
                        </div>
                    </template>
                </v-list-item>
            </v-list>
        </v-card>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSettingsStore } from '../stores/settings';
import { useBillingStore } from '../stores/billing';
import VueApexCharts from 'vue3-apexcharts';

// Register ApexCharts component locally if not global
const apexchart = VueApexCharts;

const settings = useSettingsStore();
const billingStore = useBillingStore();

// Time Range State
const selectedTimeRange = ref('This Month');
const timeRangeOptions = [
    { title: 'This Week', value: 'This Week' },
    { title: 'This Month', value: 'This Month' },
    { title: 'Last Month', value: 'Last Month' },
    { title: 'This Year', value: 'This Year' },
    { title: 'All Time', value: 'All Time' }
];

const setTimeRange = (option: { title: string, value: string }) => {
    selectedTimeRange.value = option.title;
    // TODO: Implement actual filtering logic based on option.value
};

// Filtered Data Computation
const filteredHistory = computed(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    return billingStore.userHistory.filter(entry => {
        // Exclude Drafts
        if (entry.status === 'Draft') return false;

        const entryDate = new Date(entry.date);
        const entryYear = entryDate.getFullYear();
        const entryMonth = entryDate.getMonth();
        
        // This Week (Start of week can be considered Monday or Sunday, let's say Sunday)
        if (selectedTimeRange.value === 'This Week') {
            const first = currentDate - now.getDay(); 
            // set hours to 0 to compare dates accurately
            const startOfWeek = new Date(now.setDate(first));
            startOfWeek.setHours(0,0,0,0);
            
            // reset now for other calcs if needed, but actually constructing new dates is safer
            // Let's re-calculate cleanly
            const d = new Date();
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
             // Simple approach: last 7 days vs calendar week. 
             // Let's do calendar week starting Monday
            const k = new Date(new Date().setDate(diff));
            k.setHours(0,0,0,0);
            return entryDate >= k;
        }

        if (selectedTimeRange.value === 'This Month') {
            return entryMonth === currentMonth && entryYear === currentYear;
        }

        if (selectedTimeRange.value === 'Last Month') {
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return entryMonth === lastMonth && entryYear === lastMonthYear;
        }

        if (selectedTimeRange.value === 'This Year') {
            return entryYear === currentYear;
        }

        // All Time
        return true; 
    });
});

// Stats Computation
const stats = computed(() => {
    const entries = filteredHistory.value;
    const totalRevenue = entries.reduce((sum, e) => sum + e.totalAmount, 0);
    const totalWeight = entries.reduce((sum, e) => sum + e.totalWeight, 0);
    const totalBills = entries.length;
    const avgTicket = totalBills > 0 ? totalRevenue / totalBills : 0;
    
    // Mock growth data
    const revenueGrowth = 12.5; 

    return { totalRevenue, totalWeight, totalBills, avgTicket, revenueGrowth };
});

// Charts Data
const revenueSeries = computed(() => {
    // Transform history to chronological data
    // Group by date
    const grouped = new Map<string, number>();
    filteredHistory.value.forEach(e => {
        const d = new Date(e.date).toLocaleDateString();
        grouped.set(d, (grouped.get(d) || 0) + e.totalAmount);
    });
    
    const data = Array.from(grouped.entries()).map(([x, y]) => ({ x, y }));
    return [{ name: 'Revenue', data }];
});

const revenueChartOptions = computed(() => ({
    chart: { 
        type: 'area' as const, 
        toolbar: { show: false }, 
        fontFamily: 'inherit',
        background: 'transparent',
        foreColor: settings.theme === 'dark' ? '#f3f4f6' : '#374151'
    },
    theme: { mode: (settings.theme === 'dark' ? 'dark' : 'light') as 'dark' | 'light' },
    stroke: { curve: 'smooth' as const, width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2, stops: [0, 90, 100] } },
    dataLabels: { enabled: false },
    xaxis: { type: 'category' as const, labels: { style: { colors: settings.theme === 'dark' ? '#9ca3af' : '#6b7280' } } }, 
    yaxis: { 
        labels: { 
            style: { colors: settings.theme === 'dark' ? '#9ca3af' : '#6b7280' },
            formatter: (value: number) => {
                if (value >= 10000000) return (value / 10000000).toFixed(2) + ' Cr';
                if (value >= 100000) return (value / 100000).toFixed(2) + ' Lac';
                if (value >= 1000) return (value / 1000).toFixed(1) + ' K';
                return value.toFixed(0);
            }
        } 
    },
    grid: { borderColor: settings.theme === 'dark' ? '#374151' : '#e5e7eb' },
    colors: [settings.primaryColor || '#1976D2'], 
    tooltip: { theme: settings.theme === 'dark' ? 'dark' : 'light' }
}));

const materialSeries = computed(() => {
    const materialCounts: Record<string, number> = {};
    filteredHistory.value.forEach(e => {
        e.items.forEach(i => {
           const weight = i.netWeight || 0; 
           materialCounts[i.name] = (materialCounts[i.name] || 0) + weight;
        });
    });
    return Object.values(materialCounts);
});

const materialChartOptions = computed(() => {
    const materialNames: string[] = [];
    filteredHistory.value.forEach(e => {
        e.items.forEach(i => {
           if (!materialNames.includes(i.name)) materialNames.push(i.name);
        });
    });

    return {
        chart: { 
            type: 'donut' as const, 
            fontFamily: 'inherit',
            background: 'transparent',
            foreColor: settings.theme === 'dark' ? '#f3f4f6' : '#374151'
        },
        theme: { mode: (settings.theme === 'dark' ? 'dark' : 'light') as 'dark' | 'light' },
        labels: materialNames, 
        dataLabels: { enabled: false },
        plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Total', color: settings.theme === 'dark' ? '#f3f4f6' : '#374151' } } } } },
        legend: { position: 'bottom' as const, labels: { colors: settings.theme === 'dark' ? '#f3f4f6' : '#374151' } },
        stroke: { show: false }, 
        colors: ['#FF4560', '#00E396', '#008FFB', '#FEB019', '#775DD0']
    };
});


// Top Customers
const topCustomers = computed(() => {
    // Group by customer/vehicle
    const customers: Record<string, any> = {};
    filteredHistory.value.forEach(e => {
        const key = e.vehicleNo; // Using vehicle as unique ID for simplicity, or could use customer name
        if (!customers[key]) {
            customers[key] = {
                name: e.customerName,
                vehicleNo: e.vehicleNo,
                totalAmount: 0,
                totalWeight: 0
            };
        }
        customers[key].totalAmount += e.totalAmount;
        customers[key].totalWeight += e.totalWeight;
    });
    
    return Object.values(customers)
        .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
        .slice(0, 5);
});

</script>

<style scoped>
/* chart adjustments */
</style>
