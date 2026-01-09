<template>
  <div class="d-flex flex-column flex-sm-row align-center justify-space-between pt-4">
    <div class="text-caption text-medium-emphasis mb-2 mb-sm-0">
      Showing {{ startItem }} to {{ endItem }} of {{ totalItems }} entries
    </div>
    
    <v-pagination
      v-model="internalPage"
      :length="totalPages"
      :total-visible="5"
      density="comfortable"
      rounded="circle"
      color="primary"
      class="ml-sm-auto"
      :disabled="loading"
    ></v-pagination>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['update:modelValue']);

const internalPage = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val)
});

const totalPages = computed(() => {
    if (props.itemsPerPage <= 0) return 0;
    return Math.ceil(props.totalItems / props.itemsPerPage);
});

const startItem = computed(() => {
    if (props.totalItems === 0) return 0;
    return (internalPage.value - 1) * props.itemsPerPage + 1;
});

const endItem = computed(() => {
    const end = internalPage.value * props.itemsPerPage;
    return end > props.totalItems ? props.totalItems : end;
});
</script>
