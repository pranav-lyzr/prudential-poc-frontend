// API Configuration
export const API_CONFIG = {
  // Email refresh interval in milliseconds
  EMAIL_REFRESH_INTERVAL: 15000, // 15 seconds
  
  // API timeout in milliseconds
  API_TIMEOUT: 30000, // 30 seconds
  
  // Health check interval in milliseconds
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  
  // Maximum retry attempts for failed requests
  MAX_RETRY_ATTEMPTS: 3,
  
  // Retry delay in milliseconds
  RETRY_DELAY: 2000, // 2 seconds
};

// Environment-based configuration
export const getApiConfig = () => {
  // For now, use a simple approach - you can adjust this manually
  // In production, this would be false; in development, this would be true
  const isDevelopment = true; // Set to false for production
  
  return {
    ...API_CONFIG,
    // Use longer intervals in development to avoid overwhelming the API
    EMAIL_REFRESH_INTERVAL: isDevelopment ? 20000 : API_CONFIG.EMAIL_REFRESH_INTERVAL,
    API_TIMEOUT: isDevelopment ? 45000 : API_CONFIG.API_TIMEOUT,
  };
};
