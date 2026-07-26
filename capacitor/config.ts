import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.globalradio.app',
  appName: '全球电台',
  webDir: 'dist',
  server: { androidScheme: 'https' },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#1a365d',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a365d'
    },
    Updater: { autoUpdate: false }
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: false,
    minSdkVersion: 22,
    targetSdkVersion: 34
  }
}

export default config
