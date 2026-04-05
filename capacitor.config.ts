import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.easyfollowup.app',
  appName: 'easyfollowup',
  webDir: 'out',
  server: {
    url: 'https://easyfollowup.pro',
    cleartext: false,
    androidScheme: 'https',
  },
};

export default config;
