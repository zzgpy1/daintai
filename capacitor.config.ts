import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.globalradio.app',
  appName: '全球电台',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#1a365d',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#1a365d'
    },
    Keyboard: {
      resize: 'body'
    }
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: false,
    appendUserAgent: 'GlobalRadio/2.0',
    minSdkVersion: 22,
    targetSdkVersion: 34
  },
  ios: {
    minVersion: '14.0',
    scheme: 'GlobalRadio'
  }
}

export default config
