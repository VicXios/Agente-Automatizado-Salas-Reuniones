// Archivo de configuración central
const CONFIG = {
  BASE_URL: "https://katharyn-presedentary-tinselly.ngrok-free.dev",
  TOKEN: "66c3637fa60948c10ab8619805e67d8c7b96c61af52507a28b8f6b01d6a991e2",

    // Control de entorno: "test" o "prod"
  ENV: "prod",

  // Función que devuelve el path correcto según entorno
  getWebhookPath(endpoint) {
    const prefix = this.ENV === "test" ? "webhook-test" : "webhook";
    return `${this.BASE_URL}/n8n/${prefix}${endpoint}`;
  }
};

// Exportar para que otros scripts lo usen
export default CONFIG;
