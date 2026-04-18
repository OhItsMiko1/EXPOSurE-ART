
// Environment configuration
export const config = {
  apiUrl: process.env.VITE_API_URL || '/api',
  stripePublicKey: process.env.VITE_STRIPE_PUBLIC_KEY || '',
  firebaseConfig: {
    apiKey: process.env.VITE_FIREBASE_API_KEY || '',
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.VITE_FIREBASE_APP_ID || ''
  },
  isProduction: process.env.NODE_ENV === 'production',
  sentryDsn: process.env.VITE_SENTRY_DSN || '',
  analyticsEnabled: process.env.VITE_ANALYTICS_ENABLED === 'true'
};

// Validate required configuration
export function validateConfig() {
  if (config.isProduction) {
    const required = [
      'stripePublicKey',
      'firebaseConfig.apiKey',
      'firebaseConfig.authDomain'
    ];
    
    required.forEach(key => {
      const value = key.split('.').reduce((obj, k) => obj[k], config as any);
      if (!value) {
        console.error(`Missing required configuration: ${key}`);
      }
    });
  }
}
