import { HttpClient } from "@angular/common/http";
import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource, GalleryPhoto, Photo } from '@capacitor/camera';
import { ActionSheetController, Platform, AlertController } from "@ionic/angular";

@Component({
  selector: 'app-modal-task-action-otw',
  templateUrl: './modal-task-action-otw.page.html',
  styleUrls: ['./modal-task-action-otw.page.scss'],
})
export class ModalTaskActionOtwPage implements OnInit {
  @Input() task_id: number = 0;
  @Input() api_url: string;
  @Input() logistic_type: any = '';
  selectedTasks: any[] = [];
  taskItemAction: string = '';
  selectedTaskItemDate: string = new Date().toISOString().split('T')[0];
  isLoading: boolean = false;
  is_show: boolean = false;
  sendWhatsapp: boolean = true;
  minutes: number = 0;

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    slidesPerView: 3,
  };

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private platform: Platform,
  ) {}

  private async getCurrentPosition(): Promise<{latitude: number, longitude: number} | null> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        const timeoutId = setTimeout(() => {
          console.log('Geolocation timeout, continuing without location');
          resolve(null);
        }, 5000); // 5秒超时
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            clearTimeout(timeoutId);
            console.log('Geolocation error, continuing without location:', error);
            resolve(null); // 改为resolve(null)而不是reject
          },
          { timeout: 5000, enableHighAccuracy: false }
        );
      } else {
        resolve(null);
      }
    });
  }

  async presentErrorAlert(title: string, message: string) {
    const alert = await this.alertController.create({
      header: title,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async ngOnInit() {
    // Request camera permissions
    // await this.checkPermissions();
  }

  private async checkPermissions() {
    try {
      // Check and request camera permissions
      const permissionStatus = await Camera.checkPermissions();
      if (permissionStatus.camera !== 'granted') {
        await Camera.requestPermissions();
      }
    } catch (error) {
      console.error('Error checking camera permissions:', error);
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  submit() {
    if (this.task_id) {
      const payload = {
        task_id: this.task_id,
        minutes: this.minutes,
        sendWhatsapp: this.sendWhatsapp
      };
      this.http.post(this.api_url + "/submitActionOtw/" + localStorage['token'], payload, { observe: "body" })
        .subscribe((data: any) => {
            console.log('API response:', data);
            this.dismiss();
          },
          (error) => {
            this.dismiss();
            console.log(error);
          });
    }
  }

  async openCamera(sourceType: CameraSource) {
    try {
      // iOS 权限检查和延迟
      if (this.platform.is('ios')) {
        const permissionStatus = await Camera.checkPermissions();
        if (permissionStatus.camera !== 'granted') {
          const requestResult = await Camera.requestPermissions();
          if (requestResult.camera !== 'granted') {
            await this.presentErrorAlert('权限被拒绝', '需要相机权限才能拍照');
            return;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const options = {
        quality: 80,
        resultType: CameraResultType.Base64,
        source: sourceType,
        width: 640,
        allowEditing: false,
        correctOrientation: true,
        saveToGallery: false,
      };

      const capturedPhoto = await Camera.getPhoto(options);
      console.log('Photo captured successfully, starting upload...');
      this.isLoading = true;

      if (capturedPhoto.base64String) {
        await this.api_upload_image(capturedPhoto.base64String);
      } else {
        this.isLoading = false;
        await this.presentErrorAlert('Error', 'Failed to capture photo');
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      this.isLoading = false;
      await this.presentErrorAlert('Error', 'Failed to capture photo: ' + error.message);
    }
  }

  async getImages() {
    if (this.platform.is('hybrid')) {
      try {
        let options = {
          quality: 80,
          width: 640,
          limit: 10,
          resultType: CameraResultType.Base64
        };

        const capturedPhotos = await Camera.pickImages(options);
        let imageResponse = [];
        
        if (capturedPhotos.photos.length > 0) {
          this.isLoading = true;
          for (const photo of capturedPhotos.photos) {
            const base64Data = await this.readAsBase64(photo);
            imageResponse.push(base64Data.split(',')[1]);
          }
          await this.api_upload_multiple_image(imageResponse);
        }
      } catch (err) {
        console.error('Error picking images:', err);
        this.isLoading = false;
        await this.presentErrorAlert("Error", 'Failed to pick images: ' + (err.message || "Unknown error"));
      }
    } else {
      try {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = "image/*";
        input.multiple = true;
        input.click();
        
        input.onchange = async () => {
          this.isLoading = true;
          const files = input.files;
          if (!files || files.length === 0) {
            this.isLoading = false;
            return;
          }

          try {
            let imageResponse = [];
            // 遍历所有选中的文件
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const base64String = await this.readFileAsBase64(file);
              imageResponse.push(base64String.split(',')[1]);
            }
            // 使用多图上传API
            await this.api_upload_multiple_image(imageResponse);
          } catch (error) {
            console.error('Error:', error);
            this.isLoading = false;
            this.presentErrorAlert('Error', 'Failed to read image files');
          }
        };
      } catch (err) {
        console.error('Error with file input:', err);
        this.presentErrorAlert("Error", "Failed to open file selector");
      }
    }
  }

  private async readAsBase64(photo: GalleryPhoto) {
    const response = await fetch(photo.webPath);
    const blob = await response.blob();
    const base64String = await this.convertBlobToBase64(blob) as string;
    return base64String;
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.readAsDataURL(blob);
  });

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file as base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async showAlert(title: string, msg: string) {
    const alert = await this.alertController.create({
      header: title,
      message: msg,
      buttons: ['OK']
    });
    await alert.present();
  }

  async api_upload_image(imgInfo: string) {
    try {
      const location = await this.getCurrentPosition();
      const tobeSubmit = {
        'account_id': localStorage['login_user_id'],
        'token': localStorage['token'],
        'imgInfo': imgInfo,
        'need_watermark': 1,
        ...(location && { location })
      };
      await this.one_image_upload(tobeSubmit);
    } catch (error) {
      console.error('Error in api_upload_image:', error);
      this.isLoading = false;
      await this.presentErrorAlert('Error', 'Failed to upload image: ' + error.message);
    }
  }

  private async one_image_upload(tobeSubmit: any) {
    try {
      console.log('Starting upload to API:', this.api_url + "/uploadImage");
      const response = await this.http.post(this.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).toPromise();
      console.log('Upload response:', response);
      
      if (response['status'] === "OK") {
        this.isLoading = false;
        console.log('Upload successful, image added to:', response['result']['img_path']);
        // Handle successful upload
      } else {
        this.isLoading = false;
        throw new Error(response['message'] || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      this.isLoading = false;
      await this.presentErrorAlert('Error', 'Failed to upload image: ' + error.message);
    }
  }

  async api_upload_multiple_image(imgInfo: string[]) {
    try {
      const location = await this.getCurrentPosition();
      const tobeSubmit = {
        'account_id': localStorage['login_user_id'],
        'token': localStorage['token'],
        'imgInfo': imgInfo,
        'need_watermark': 1,
        ...(location && { location })
      };
      await this.multiple_image_upload(tobeSubmit);
    } catch (error) {
      console.error('Error in api_upload_multiple_image:', error);
      this.isLoading = false;
      await this.presentErrorAlert('Error', 'Failed to upload images: ' + error.message);
    }
  }

  private async multiple_image_upload(tobeSubmit: any) {
    try {
      console.log('Starting multiple upload to API:', this.api_url + "/uploadMultipleImage");
      const response = await this.http.post(this.api_url + "/uploadMultipleImage", tobeSubmit, { observe: "body" }).toPromise();
      console.log('Multiple upload response:', response);
      
      if (response['status'] === "OK") {
        this.isLoading = false;
        try {
          const imgPaths = JSON.parse(response['result']['img_path']);
          console.log('Multiple images uploaded successfully:', imgPaths);
        } catch (error) {
          console.error('Error parsing image paths:', error);
          throw new Error("Failed to process uploaded images");
        }
      } else {
        this.isLoading = false;
        throw new Error(response['message'] || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      this.isLoading = false;
      await this.presentErrorAlert('Error', 'Failed to upload images: ' + error.message);
    }
  }
}
