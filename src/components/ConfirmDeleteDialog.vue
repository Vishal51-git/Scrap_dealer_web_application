<template>
  <v-dialog v-model="internalModel" max-width="400">
    <v-card class="rounded-xl pa-4">
      <v-card-title class="text-h6 font-weight-bold">{{ title }}</v-card-title>
      <v-card-text class="text-medium-emphasis">
        {{ message }} <strong v-if="itemName">{{ itemName }}</strong>? This action cannot be undone.
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey-darken-1" variant="text" @click="cancel">Cancel</v-btn>
        <v-btn color="error" variant="flat" @click="confirm">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Delete Item?'
  },
  message: {
    type: String,
    default: 'Are you sure you want to delete '
  },
  itemName: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['update:modelValue', 'confirm', 'cancel']);

const internalModel = computed({
  get: () => props.modelValue,
  set: (val) => emits('update:modelValue', val)
});

const cancel = () => {
    internalModel.value = false;
    emits('cancel');
};

const confirm = () => {
    emits('confirm');
};
</script>
