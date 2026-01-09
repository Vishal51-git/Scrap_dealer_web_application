// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Vuetify
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#2563EB", // Blue
          secondary: "#F3F4F6", // Light Gray/Blue background
          background: "#F0F4F8", // App background
          surface: "#FFFFFF",
          error: "#EF4444",
          success: "#10B981",
          warning: "#F59E0B",
        },
      },
      dark: {
        colors: {
          primary: "#3B82F6", // Lighter Blue for dark mode
          secondary: "#1F2937", // Dark Gray
          background: "#111827", // Very Dark Blue/Gray
          surface: "#1F2937", // Dark Surface
          error: "#F87171",
          success: "#34D399",
          warning: "#FBBF24",
        },
      },
    },
  },
});
