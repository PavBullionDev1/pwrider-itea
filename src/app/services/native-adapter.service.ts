import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { PushNotifications } from '@capacitor/push-notifications';

export interface CameraOptions {
  quality?: number;
  allowEditing?: boolean;
  resultType: CameraResultType;
  source: CameraSource;
  width?: number;
  height?: number;
}

export interface ScanResult {
  text: string;
  format: string;
  cancelled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NativeAdapterService {

  constructor() { }

  /**
   * Camera functionality - replaces @ionic-native/camera
   */
  async takePicture(options?: Partial<CameraOptions>): Promise<string> {
    const image = await Camera.getPhoto({
      quality: options?.quality || 80,
      allowEditing: options?.allowEditing || false,
      resultType: options?.resultType || CameraResultType.DataUrl,
      source: options?.source || CameraSource.Camera,
      width: options?.width || 640,
      height: options?.height
    });
    
    return image.dataUrl || image.webPath || '';
  }

  async selectFromGallery(options?: Partial<CameraOptions>): Promise<string> {
    return this.takePicture({
      ...options,
      source: CameraSource.Photos
    });
  }

  /**
   * Status Bar functionality - replaces @ionic-native/status-bar
   */
  async setStatusBarStyle(style: 'light' | 'dark' | 'default' = 'dark'): Promise<void> {
    let statusBarStyle = Style.Dark;
    if (style === 'light') {
      statusBarStyle = Style.Light;
    } else if (style === 'default') {
      statusBarStyle = Style.Default;
    }
    
    await StatusBar.setStyle({
      style: statusBarStyle
    });
  }

  async hideStatusBar(): Promise<void> {
    await StatusBar.hide();
  }

  async showStatusBar(): Promise<void> {
    await StatusBar.show();
  }

  async setStatusBarBackgroundColor(color: string): Promise<void> {
    await StatusBar.setBackgroundColor({ color });
  }

  /**
   * Device functionality - replaces @ionic-native/device
   */
  async getDeviceInfo(): Promise<any> {
    const info = await Device.getInfo();
    const id = await Device.getId();
    
    return {
      ...info,
      uuid: id.identifier,
      model: info.model,
      platform: info.platform,
      version: info.osVersion,
      manufacturer: info.manufacturer,
      isVirtual: info.isVirtual,
      webViewVersion: info.webViewVersion
    };
  }

  /**
   * Barcode Scanner functionality - replaces @ionic-native/barcode-scanner
   */
  async scanBarcode(): Promise<ScanResult> {
    try {
      // Start scanning
      await BarcodeScanner.checkPermission({ force: true });
      BarcodeScanner.hideBackground();
      
      const result = await BarcodeScanner.startScan();
      
      // Stop scanning
      BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
      
      return {
        text: result?.content || '',
        format: result?.format || '',
        cancelled: !result?.hasContent
      };
    } catch (error) {
      console.error('Barcode scan error:', error);
      BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
      return {
        text: '',
        format: '',
        cancelled: true
      };
    }
  }

  /**
   * In-App Browser functionality - using browser API or external links
   */
  async openInAppBrowser(url: string, target: string = '_system'): Promise<void> {
    if (target === '_system') {
      // Open in system browser
      window.open(url, '_system');
    } else {
      // For in-app browser, use window.open as fallback
      window.open(url, target);
    }
  }

  /**
   * Geolocation functionality - using native Web API
   */
  async getCurrentPosition(options?: PositionOptions): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
          ...options
        }
      );
    });
  }

  /**
   * Legacy compatibility methods for easier migration
   */
  
  // Camera compatibility
  get PictureSourceType() {
    return {
      CAMERA: CameraSource.Camera,
      PHOTOLIBRARY: CameraSource.Photos
    };
  }

  get DestinationType() {
    return {
      DATA_URL: CameraResultType.DataUrl,
      FILE_URI: CameraResultType.Uri
    };
  }

  // Legacy camera method
  async getPicture(options: any): Promise<string> {
    const sourceType = options.sourceType || this.PictureSourceType.CAMERA;
    const resultType = options.destinationType || this.DestinationType.DATA_URL;
    
    return this.takePicture({
      quality: options.quality,
      allowEditing: options.allowEdit,
      resultType: resultType,
      source: sourceType,
      width: options.targetWidth,
      height: options.targetHeight
    });
  }

  // StatusBar compatibility
  overlaysWebView(overlay: boolean): Promise<void> {
    // This method doesn't have direct equivalent in Capacitor
    // StatusBar behavior is handled differently
    return Promise.resolve();
  }

  /**
   * Push Notifications functionality - replaces @ionic-native/push
   */
  async initializePush(): Promise<void> {
    try {
      // Request permission for push notifications
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
      }
    } catch (error) {
      console.error('Push notification initialization error:', error);
    }
  }

  async getPushToken(): Promise<string | null> {
    try {
      const result = await PushNotifications.requestPermissions();
      if (result.receive === 'granted') {
        await PushNotifications.register();
        return new Promise((resolve) => {
          PushNotifications.addListener('registration', (token) => {
            resolve(token.value);
          });
        });
      }
      return null;
    } catch (error) {
      console.error('Get push token error:', error);
      return null;
    }
  }

  /**
   * Image Picker functionality - using camera as alternative
   */
  async selectMultipleImages(options?: { maximumImagesCount?: number }): Promise<string[]> {
    try {
      // Capacitor camera doesn't support multiple selection directly
      // For now, use single image selection
      const image = await this.selectFromGallery();
      return image ? [image] : [];
    } catch (error) {
      console.error('Multiple image selection error:', error);
      return [];
    }
  }

  /**
   * iOS兼容的相册选择方法 - 修复权限时序问题
   */
  async pickImagesWithIOSFix(options: any = {}): Promise<any> {
    try {
      // iOS权限检查和延迟处理
      const permissionStatus = await Camera.checkPermissions();
      
      if (permissionStatus.photos !== 'granted') {
        console.log('Requesting photo library permissions...');
        const requestResult = await Camera.requestPermissions();
        
        if (requestResult.photos !== 'granted') {
          throw new Error('Photo library permission denied');
        }
        
        // iOS需要延迟以确保权限完全激活
        console.log('Waiting for iOS permissions to activate...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 设置默认选项
      const finalOptions = {
        quality: 80,
        width: 640,
        limit: 10,
        resultType: CameraResultType.Base64,
        ...options
      };

      console.log('Starting Camera.pickImages with options:', finalOptions);
      const capturedPhotos = await Camera.pickImages(finalOptions);
      
      return capturedPhotos;
    } catch (error) {
      console.error('pickImagesWithIOSFix error:', error);
      throw error;
    }
  }

  /**
   * Alias for selectMultipleImages - used by some components
   */
  async selectImages(options?: { maximumImagesCount?: number }): Promise<string[]> {
    return this.selectMultipleImages(options);
  }

  /**
   * Image Picker functionality - replaces @ionic-native/image-picker
   */
  get imagePicker() {
    return {
      getPictures: async (options?: any) => {
        try {
          const maxImages = options?.maximumImagesCount || 1;
          const results: string[] = [];
          
          // Since Capacitor doesn't support true multiple selection,
          // we simulate it by allowing users to select images one by one
          for (let i = 0; i < maxImages; i++) {
            try {
              const image = await this.selectFromGallery();
              if (image) {
                results.push(image);
              } else {
                break; // User cancelled
              }
            } catch (error) {
              console.error('Image picker error:', error);
              break;
            }
          }
          
          return results;
        } catch (error) {
          console.error('Image picker getPictures error:', error);
          return [];
        }
      }
    };
  }
}