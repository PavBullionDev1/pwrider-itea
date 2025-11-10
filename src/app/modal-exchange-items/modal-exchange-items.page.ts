import { Location } from "@angular/common";
import { HttpClient, HttpRequest } from "@angular/common/http";
import { Component, OnInit, ViewChild, Input, ElementRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AlertController,
  AngularDelegate,
  IonSearchbar,
  LoadingController,
  MenuController,
  ActionSheetController,
  Platform,
} from "@ionic/angular";
import { AppComponent } from "../app.component";
import { Httprequest } from "../models/httprequest";
import { Camera, CameraResultType, CameraSource, GalleryPhoto, Photo } from '@capacitor/camera';
// import { StatusBar as CapacitorStatusBar } from '@capacitor/status-bar';
import { ModalController, NavController } from '@ionic/angular';
import { ConfigService } from "../config.service";
import { ModalsharedService } from "../modalshared.service";
import { NativeAdapterService } from "../services/native-adapter.service";
import { Big } from 'big.js';

@Component({
  selector: 'app-modal-exchange-items',
  templateUrl: './modal-exchange-items.page.html',
  styleUrls: ['./modal-exchange-items.page.scss'],
})
export class ModalExchangeItemsPage implements OnInit {
  @Input() items: any[] = []; // Accept pw_item_list as input
  @Input() goldPureList: any[] = [];
  @Input() itemTypeList: any[] = [];
  defaultGoldPureList: any[] = [];
  selectionGoldPureList: any[] = [];
  prodcut_code: any;
  product_id: any;
  gold_pure_id: any;
  gold_name: any;
  code: any;
  percentage: any;
  item_type_id: any;
  weight: any;
  XAU: any;
  customer_percentage: any;
  customer_XAU: any;
  barcode: any;
  pw_barcode: any;
  remark: any;
  item_type_name: any;
  isLoading: boolean = false;
  image: any;
  
  slideOpts: any = {
    initialSlide: 0,
    speed: 400
  };
  haveItemImages: boolean = false;
  showImage: boolean = false;
  is_editable: any;
  showImageData: any;

  constructor(
    public alertController: AlertController,
    public httpClient: HttpClient,
    public loadingController: LoadingController,
    public actionSheetController: ActionSheetController,
    private platform: Platform,
    public modalController: ModalController,
    private config: ConfigService,
    private modalShared: ModalsharedService,
		private nativeAdapter: NativeAdapterService
	) { }

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
    //assign items data in to all data
    this.prodcut_code = this.items['prodcut_code'];
    this.product_id = this.items['product_id'];
    this.gold_pure_id = this.items['gold_pure_id'];
    this.code = this.items['code'];
    this.percentage = this.items['percentage'];
    this.item_type_id = this.items['item_type_id'];
    this.item_type_name = this.items['item_type_name'];
    this.weight = this.items['weight'];
    this.barcode = this.items['barcode'];
    this.pw_barcode = this.items['pw_barcode'];
    this.is_editable = this.items['is_editable'];
    this.remark = this.items['remark'];
    this.gold_name = this.items['gold_name'];
    this.customer_percentage = this.items['customer_percentage'];
    this.customer_XAU = this.items['customer_XAU'];
    this.image = this.items['image'] ? this.items['image'] : [];
    console.log('Modal Data:', this.items);

    //copy goldPureList
    this.defaultGoldPureList = this.goldPureList;
    this.selectionGoldPureList = this.goldPureList;

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

  // Save changes and dismiss the modal
  // Recalculate fields based on item type or purity changes
  recalculate() {
    this.item_type_name = this.itemTypeList.find(
      (x) => x.id === this.item_type_id
    ).title;

    //foreach goldPureList to filter item_type_id = this.item_type_id
    this.selectionGoldPureList = this.defaultGoldPureList.filter(
      (x) => x.type == this.item_type_id
    );

    console.log(this.selectionGoldPureList);

    console.log(this.item_type_name);
    if (this.weight && this.percentage) {
      this.XAU = Big(this.weight).mul(this.percentage / 100).round(3, 0).toNumber();
    }
    if(this.weight && this.customer_percentage){
      this.customer_XAU = Big(this.weight).mul(this.customer_percentage / 100).round(3, 0).toNumber();
    }
  }

  recalculateJewel() {
    this.weight = Big(this.weight).round(2, 0).toNumber();
    const selectedPurity = this.goldPureList.find(
      (x) => x.gold_pure_id === this.gold_pure_id
    );
    if (selectedPurity) {
      this.is_editable = selectedPurity.is_editable;
      this.gold_name = selectedPurity.gold_name;
      this.percentage = selectedPurity.gold_pure_percent;
      this.customer_percentage = selectedPurity.gold_pure_percent;
      this.recalculate();
    }
  }

  // Submit the updated data
  submit() {
    //assign all data into this.items
    this.items['weight'] = this.weight;
    this.items['percentage'] = this.percentage;
    this.items['gold_pure_id'] = this.gold_pure_id;
    this.items['item_type_id'] = this.item_type_id;
    this.items['XAU'] = this.XAU;
    this.items['barcode'] = this.barcode;
    this.items['pw_barcode'] = this.pw_barcode;
    this.items['is_editable'] = this.is_editable;
    this.items['customer_percentage'] = this.customer_percentage;
    this.items['customer_XAU'] = this.customer_XAU;
    this.items['gold_name'] = this.gold_name;
    this.items['remark'] = this.remark;
    this.items['item_type_name'] = this.item_type_name;
    this.items['image'] = this.image ? this.image : [];
    console.log(this.items);
    this.modalController.dismiss({data: this.items,deleted: false});
  }

  // Delete the item
  deleteItem(item) {
    this.modalController.dismiss({data: this.items, deleted: true, item });
  }

  // Dismiss without changes
  dismiss() {
    this.modalController.dismiss();
  }

  async openActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Camera',
        role: 'camera',
        icon: 'camera',
        handler: () => {
          this.openCamera(CameraSource.Camera);
        }
      }, {
        text: 'Upload From Gallery',
        role: 'gallery',
        icon: 'images-outline',
        handler: () => {
          this.getImages();
        }
      }, {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
    const { role } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
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
        let imageResponse: any[] = [];
        if (capturedPhotos.photos.length > 0) {
          this.isLoading = true;
          for (const photo of capturedPhotos.photos) {
            const base64Data = await this.readAsBase64(photo);
            imageResponse.push(base64Data.split(',')[1]);
          }
          await await this.api_upload_multiple_image(imageResponse);
        }
      } catch (err) {
        console.error('Error picking images:', err);
        this.isLoading = false;
        await this.presentErrorAlert('Error', 'Failed to pick images: ' + (err.message || "Unknown error"));
      }
    } else {
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
      console.log('Starting upload to API:', this.config.appConfig.api_url + "/uploadImage");
      const response = await this.httpClient.post(this.config.appConfig.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).toPromise();
      console.log('Upload response:', response);
      
      if (response['status'] === "OK") {
        this.isLoading = false;
        this.image.push(response['result']['img_path']);
        console.log('Upload successful, image added to:', response['result']['img_path']);
        this.haveItemImages = true;
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
      console.log('Starting multiple upload to API:', this.config.appConfig.api_url + "/uploadMultipleImage");
      const response = await this.httpClient.post(this.config.appConfig.api_url + "/uploadMultipleImage", tobeSubmit, { observe: "body" }).toPromise();
      console.log('Multiple upload response:', response);

      if (response['status'] === "OK") {
        this.isLoading = false;
        try {
          const imgPaths = JSON.parse(response['result']['img_path']);
          imgPaths.forEach((path: string) => {
            this.image.push(path);
          });
          this.haveItemImages = true;
          console.log('Multiple images uploaded successfully');
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

  delete_img(img_path: string) {
    console.log(img_path);

    this.alertController.create({
      header: 'Confirmation',
      message: 'Do you want to remove this photo?',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          console.log('Confirm Cancel');
        }
      }, {
        text: 'Ok',
        handler: (alertData) => {
          console.log('Confirm Ok Multiple');
          let index = this.image.indexOf(img_path);
          if (index !== -1) {
            this.image.splice(index, 1);
          }
          for (let i = 0; i < this.image.length; i++) {
            this.haveItemImages = false;
            if(this.image.length > 0){
              this.haveItemImages = true;
              break;
            }
          }
        }
      }]
    }).then(alert => alert.present());
  }

  show_img(img_path: string) {
    if(this.showImage && this.showImageData == img_path){
      this.showImage = false;
      this.showImageData = "";
    }else{
      this.showImage = true;
      this.showImageData = img_path;
    }
  }
}
