import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSnackbarStore = defineStore('snackbar', () => {
    const show = ref(false);
    const message = ref('');
    const color = ref('success');
    const timeout = ref(3000);

    function showSnackbar(msg: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', duration = 3000) {
        message.value = msg;
        color.value = type;
        timeout.value = duration;
        show.value = true;
    }

    return {
        show,
        message,
        color,
        timeout,
        showSnackbar
    };
});
