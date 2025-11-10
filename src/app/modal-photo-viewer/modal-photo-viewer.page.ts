import { Component, OnInit, Input } from '@angular/core';
import { ModalController, Platform, AlertController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-modal-photo-viewer',
  templateUrl: './modal-photo-viewer.page.html',
  styleUrls: ['./modal-photo-viewer.page.scss'],
})
export class ModalPhotoViewerPage implements OnInit {
  @Input() photos: string[] = [];
  @Input() title: string = 'Photo Gallery';
  @Input() item: any;
  @Input() uploadCallback: (item: any, base64Image: string) => Promise<void>;
  @Input() deleteCallback: (item: any, imgPath: string) => Promise<void>;

  isLoading: boolean = false;

  constructor(
    private modalController: ModalController,
    private platform: Platform,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    if (!this.photos) {
      this.photos = [];
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async deletePhoto(photo: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this photo?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: async () => {
            this.isLoading = true;
            try {
              if (this.deleteCallback) {
                await this.deleteCallback(this.item, photo);
                // Remove photo from local array
                this.photos = this.photos.filter(p => p !== photo);
              }
            } catch (error) {
              console.error('Error deleting photo:', error);
              this.showErrorAlert(error);
            } finally {
              this.isLoading = false;
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async openCamera() {
    try {
      const options = {
        quality: 80,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        width: 640,
        allowEditing: false,
        correctOrientation: true,
        saveToGallery: true
      };

      const capturedPhoto = await Camera.getPhoto(options);

      if (capturedPhoto.base64String) {
        this.isLoading = true;
        try {
          if (this.uploadCallback) {
            await this.uploadCallback(this.item, capturedPhoto.base64String);
            // Add new photo to local array
            this.refreshPhotosList();
          }
        } catch (error) {
          console.error('Error uploading photo:', error);
          this.showErrorAlert(error);
        } finally {
          this.isLoading = false;
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      this.showErrorAlert(error);
    }
  }

  async openGallery() {
    if (this.platform.is('hybrid')) {
      try {
        const options = {
          quality: 80,
          width: 640,
          limit: 1,
          resultType: CameraResultType.Base64
        };

        const result = await Camera.pickImages(options);
        
        if (result.photos.length > 0) {
          const photo = result.photos[0];
          const base64Data = await this.readAsBase64(photo);
          const base64String = base64Data.split(',')[1];
          
          this.isLoading = true;
          try {
            if (this.uploadCallback) {
              await this.uploadCallback(this.item, base64String);
              this.refreshPhotosList();
            }
          } catch (error) {
            console.error('Error uploading photo:', error);
            this.showErrorAlert(error);
          } finally {
            this.isLoading = false;
          }
        }
      } catch (error) {
        console.error('Error picking photos from gallery:', error);
        this.showErrorAlert(error);
      }
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = "image/*";
      input.click();
      
      input.onchange = async () => {
        if (input.files && input.files.length > 0) {
          try {
            const file = input.files[0];
            const base64Data = await this.readFileAsBase64(file);
            const base64String = base64Data.split(',')[1];
            
            this.isLoading = true;
            try {
              if (this.uploadCallback) {
                await this.uploadCallback(this.item, base64String);
                this.refreshPhotosList();
              }
            } catch (error) {
              console.error('Error uploading photo:', error);
              this.showErrorAlert(error);
            } finally {
              this.isLoading = false;
            }
          } catch (error) {
            console.error('Error reading file:', error);
            this.showErrorAlert(error);
          }
        }
      };
    }
  }

  private async readAsBase64(photo: any) {
    const response = await fetch(photo.webPath);
    const blob = await response.blob();
    return await this.convertBlobToBase64(blob);
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  }

  private async showErrorAlert(error: any) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: `Operation failed: ${error.message || 'An unknown error occurred'}`,
      buttons: ['OK']
    });
    await alert.present();
  }

  // Refresh photos list
  private refreshPhotosList() {
    if (this.item && this.item.image) {
      this.photos = [...this.item.image];
    }
  }
} 