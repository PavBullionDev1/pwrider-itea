import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController, ActionSheetController, Platform, ModalController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {AppComponent} from "../app.component";
import { ActivatedRoute, Router } from "@angular/router";
import {Httprequest} from "../models/httprequest";
// import { StatusBar as CapacitorStatusBar } from '@capacitor/status-bar';
import { addHours, format } from 'date-fns';
import { Big } from 'big.js';
import { ModalPhotoViewerPage } from '../modal-photo-viewer/modal-photo-viewer.page';

@Component({
  selector: 'app-gold-shipment-clock-in',
  templateUrl: './gold-shipment.page.html',
  styleUrls: ['./gold-shipment.page.scss'],
})
export class GoldShipmentPage implements OnInit {

  gold_shipment_id = this.route.snapshot.paramMap.get("gold_shipment_id");



  customer_id: number = 0;
  customerList: any = [];

  detailList: any = [];

  status: any = '0';
  remark: string = '';

  type: any = '1';
  calendarVisible: boolean = false;
  doc_no: string = '';
  doc_date: string = '';
  formattedDate: string = '';
  total_weight: number = 0;


  isLoading = {
    lowPurityPhoto: false,
    purity916Photo: false,
    highPurityPhoto: false,
    goldBeadPhoto: false,
    totalMixPhoto: false,
    barPhoto: false,
    samplePhoto: false,
    sampleReturnPhoto: false,
    purityPhoto: false,
    outStockPhoto: false,
    balancePhoto: false,
  };

  constructor(
    private http: HttpClient,
    public App: AppComponent,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private actionSheetController: ActionSheetController,
    private platform: Platform,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    // await this.checkPermissions();
    const now = new Date();
    const utc8Date = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // Shift current time to UTC+8
    this.doc_date = utc8Date.toISOString().slice(0, 16); // Set as ISO string without seconds
    this.getAllCustomer();
    if(this.gold_shipment_id) {
      this.getGoldShipmentDetails();
    }else{
      this.getAllCategory();
    }
  }

  private async checkPermissions() {
    try {
      const permissionStatus = await Camera.checkPermissions();
      if (permissionStatus.camera !== 'granted') {
        await Camera.requestPermissions();
      }
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      await this.showErrorAlert(error, 'check camera permissions');
    }
  }

  private async showErrorAlert(error: any, context: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: `Failed to ${context}: ${error.message || 'An error occurred.'}`,
      buttons: ['OK'],
    });
    await alert.present();
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
      const options = {
      quality: 80,
        resultType: CameraResultType.Base64,
        source: sourceType,
        width: 640,
        allowEditing: false,
      correctOrientation: true,
        saveToGallery: true
      };

      const capturedPhoto = await Camera.getPhoto(options);

      if (capturedPhoto.base64String) {
        await this.api_upload_image(capturedPhoto.base64String);
      } else {
        await this.showErrorAlert(new Error('No image data'), 'capture photo');
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      await this.showErrorAlert(error, 'capture photo');
    }
  }

  onDateChange(selectedDate: string) {
    if (selectedDate) {
      // Adjust the selected date to UTC+8
      const adjustedDate = addHours(new Date(selectedDate), 8);

      // Format the adjusted date as needed
      this.formattedDate = format(adjustedDate, 'dd/MM/yyyy HH:mm');
    }
  }

  async getImages() {
    if (this.platform.is('hybrid')) {
      try {
        const options = {
          quality: 80,
          width: 640,
          limit: 10,
          resultType: CameraResultType.Base64
        };

        const result = await Camera.pickImages(options);
        
        const imageResponse = [];
        for (const photo of result.photos) {
          const base64Data = await this.readAsBase64(photo);
          imageResponse.push(base64Data.split(',')[1]);
        }
        
        await this.api_upload_multiple_image(imageResponse);
      } catch (error) {
        console.error('Error picking images:', error);
        await this.showErrorAlert(error, 'pick images');
      }
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = "image/*";
      input.multiple = true;
      input.click();
      
      input.onchange = async () => {
        try {
          const file = input.files[0];
          const base64Data = await this.readFileAsBase64(file);
          await this.api_upload_image(base64Data.split(',')[1]);
        } catch (error) {
          console.error('Error reading file:', error);
          await this.showErrorAlert(error, 'read file');
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

  async api_upload_image(imgInfo: string) {
    try {
      const position = await this.getCurrentPosition();
      const tobeSubmit = {
            'account_id': localStorage['login_user_id'],
            'token': localStorage['token'],
            'imgInfo': imgInfo,
            'need_watermark': 1,
        ...(position && { location: position })
      };
      await this.one_image_upload(tobeSubmit);
    } catch (error) {
      console.error('Error in api_upload_image:', error);
      // 继续上传,但不包含位置信息
      const tobeSubmit = {
        'account_id': localStorage['login_user_id'],
        'token': localStorage['token'],
        'imgInfo': imgInfo,
        'need_watermark': 1
          };
      await this.one_image_upload(tobeSubmit);
    }
  }

  private async getCurrentPosition(): Promise<{latitude: number, longitude: number} | null> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => reject(error)
        );
      } else {
        resolve(null);
      }
    });
  }

  async one_image_upload(tobeSubmit: any) {
    try {
      const data = await this.http.post(this.App.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).toPromise();
      if (data['status'] === "OK") {
        // 处理成功响应
        console.log('Image uploaded successfully');
      } else {
        await this.showErrorAlert(new Error(data['message'] || 'Upload failed'), 'upload image');
      }
    } catch (error) {
      console.error('Connection Error', error);
      await this.showErrorAlert(error, 'upload image');
    }
  }

  async api_upload_multiple_image(imgInfo: string[]) {
    try {
      const position = await this.getCurrentPosition();
      const tobeSubmit = {
        'account_id': localStorage['login_user_id'],
        'token': localStorage['token'],
        'imgInfo': imgInfo,
        'need_watermark': 1,
        ...(position && { location: position })
      };
      await this.multiple_image_upload(tobeSubmit);
    } catch (error) {
      console.error('Error in api_upload_multiple_image:', error);
      const tobeSubmit = {
        'account_id': localStorage['login_user_id'],
        'token': localStorage['token'],
        'imgInfo': imgInfo,
        'need_watermark': 1
      };
      await this.multiple_image_upload(tobeSubmit);
    }
  }

  async multiple_image_upload(tobeSubmit: any) {
    try {
      const data = await this.http.post(this.App.api_url + "/uploadMultipleImage", tobeSubmit, { observe: "body" }).toPromise();
      if (data['status'] === "OK") {
        console.log('Multiple images uploaded successfully');
      } else {
        await this.showErrorAlert(new Error(data['message'] || 'Upload failed'), 'upload multiple images');
      }
    } catch (error) {
      console.error('Connection Error', error);
      await this.showErrorAlert(error, 'upload multiple images');
    }
  }

  getAllCustomer() {
    this.http.get(this.App.api_url + "/getAllCustomer/" + localStorage['token'] )
      .subscribe((data: any) => {
          this.customerList = data.result.data;
          console.log(this.customerList);
        },
        (error) => {
          console.log(error);
        });
  }
  getAllCategory() {
    this.http.get(this.App.api_url + "/getGold_shipment_categoryList/" + localStorage['token'] )
      .subscribe((data: any) => {
          this.detailList = data.result.gold_shipment_categoryList;

          //order by gold_shipment_category_id asc
          this.detailList.sort(function(a, b) {
            return a.gold_shipment_category_id - b.gold_shipment_category_id;
          });

          console.log('this.detailList',this.detailList);
          this.calculateTotal();
        },
        (error) => {
          console.log(error);
      });
  }

  getGoldShipmentDetails() {
    this.App.presentLoading();
    this.http
      .get(
        this.App.api_url + "/appGetGoldShipmentDetails/" + this.gold_shipment_id + "/" + localStorage['token'])
      .subscribe(
        (data: any) => {

          this.detailList = data.result['data']['detailList'];
          console.log(this.detailList);
          this.remark = data.result['data']['remark'];
          const dateData = new Date(data.result['data']['doc_date']);
          const utc8Date = new Date(dateData.getTime() + (8 * 60 * 60 * 1000)); // Shift current time to UTC+8
          this.doc_date =  utc8Date.toISOString().slice(0, 16);
          this.doc_no = data.result['data']['doc_no'];
          this.type = data.result['data']['type'];
          this.status = data.result['data']['status'];

          console.log(data.result['data']);
          this.calculateTotal();

          this.loadingController.dismiss();

        },
        (error) => {
          //this.loadingController.dismiss();

          console.log(error);
        }
      );
  }

  apiUploadImage(imgInfo, photoType) {
    const tobeSubmit = {
      'account_id': localStorage['login_user_id'],
      'token': localStorage['token'],
      'imgInfo': imgInfo,
      'need_watermark': 1
    };
    this.http.post(this.App.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).subscribe((data) => {
      this.isLoading[photoType] = false;
      if (data['status'] == "OK") {
        this[photoType].push(data['result']['img_path']);

      } else {
        console.log('Error uploading image');
      }
    }, (error) => {
      this.isLoading[photoType] = false;
      console.log('Connection Error', error);
    });
  }

  delete_img(img_path) {
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
          // let index = this.modalData.MultipleImageUrl.indexOf(img_path);
          // if (index !== -1) {
          //   this.modalData.MultipleImageUrl.splice(index, 1);
          // }
          // for (let i = 0; i < this.modalDataList.length; i++) {
          //   this.haveItemImages = false;
          //   if(this.modalDataList[i].MultipleImageUrl.length > 0){
          //     this.haveItemImages = true;
          //     break;
          //   }
          // }
        }
      }]
    }).then(alert => alert.present());
  }

  deletePhoto(photoType: string) {
    this[photoType] = null;
  }

  async submitGoldShipment() {
    const loading = await this.loadingController.create({
      message: 'Submitting...',
    });
    await loading.present();

    const payload = {
      token: localStorage['token'],
      doc_no: this.doc_no,
      doc_date: this.doc_date,
      remark: this.remark,
      detailList: this.detailList,
      type: this.type,
      status: this.status,
      gold_shipment_id: this.gold_shipment_id ? this.gold_shipment_id : 0
    };

    console.log(payload);

    this.http.post(this.App.api_url + "/appSubmitGoldShipment", payload).subscribe(
      async (response) => {
        await loading.dismiss();
        if(this.type == 2 && response['result']['factory_code']){
          const alert = await this.alertController.create({
            header: 'Success',
            message: 'You have successfully created '+response['result']['factory_code'] + ' MJO!',
            buttons: ['OK'],
          });
          await alert.present();
        }else{
          const alert = await this.alertController.create({
            header: 'Success',
            message: 'Clock-in submitted successfully!',
            buttons: ['OK'],
          });
          await alert.present();
        }

        // Redirect or clear form if needed
        this.router.navigate(["gold-shipment-list"]);
      },
      async (error) => {
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'There was an error submitting your clock-in. Please try again later.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    );
  }

  calculateTotal(){
    //calculate total of detailList
    this.total_weight = 0;
    this.detailList.forEach(item => {
      if(item.is_calculate == 1){
        this.total_weight = Big(this.total_weight).plus(item.weight).round(2, 0).toNumber();
      }
    });
  }

  async openActionSheetForItem(item: any) {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            this.openCameraForItem(item, CameraSource.Camera);
          }
        },
        {
          text: 'Gallery',
          icon: 'images',
          handler: () => {
            this.getImageFromGalleryForItem(item);
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async openCameraForItem(item: any, sourceType: CameraSource) {
    try {
      const options = {
      quality: 80,
        resultType: CameraResultType.Base64,
        source: sourceType,
        width: 640,
        allowEditing: false,
      correctOrientation: true,
        saveToGallery: true
      };

      const capturedPhoto = await Camera.getPhoto(options);
        item.is_loading = true;

      if (capturedPhoto.base64String) {
        await this.uploadImageForItem(item, capturedPhoto.base64String);
      } else {
        item.is_loading = false;
        await this.showErrorAlert(new Error('No image data'), 'capture photo for item');
      }
    } catch (error) {
      item.is_loading = false;
      console.error('Error capturing photo:', error);
      await this.showErrorAlert(error, 'capture photo for item');
    }
  }

  async getImageFromGalleryForItem(item: any) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = "image/*";
    input.multiple = true;
    input.click();
    
    input.onchange = async () => {
      try {
      item.is_loading = true;
      if (input.files) {
        const file = input.files[0];
        const base64Data = await this.readFileAsBase64(file);
        await this.uploadImageForItem(item, base64Data.split(',')[1]);
      }
    } catch (error) {
      item.is_loading = false;
      console.error('Error reading file:', error);
      await this.showErrorAlert(error, 'read file for item');
    }
  };
  }

  async uploadImageForItem(item: any, base64Image: string) {
    try {
    const payload = {
      account_id: localStorage['login_user_id'],
      token: localStorage['token'],
      imgInfo: base64Image,
      need_watermark: 1
    };

      const response = await this.http.post(`${this.App.api_url}/uploadImage`, payload).toPromise();
      
      if (response['status'] === "OK") {
          item.image = item.image || [];
        item.image.push(response['result'].img_path);
        } else {
        await this.showErrorAlert(new Error(response['message'] || 'Upload failed'), 'upload image for item');
        }
    } catch (error) {
        console.error('HTTP error:', error);
      await this.showErrorAlert(error, 'upload image for item');
    } finally {
        item.is_loading = false;
      }
  }

  deleteImage(item: any, imgPath: string) {
    const index = item.image.indexOf(imgPath);
    if (index > -1) {
      item.image.splice(index, 1);
    }
  }

  toggleCalendar() {
    this.calendarVisible = !this.calendarVisible; // Toggle the visibility of the calendar
  }

  async openPhotoViewer(item: any) {
    // 如果item没有image属性或image为空数组，直接打开ActionSheet供用户选择拍照或从相册选择
    // If item has no image property or image array is empty, directly open ActionSheet for user to take or pick a photo
    if (!item.image || item.image.length === 0) {
      this.openActionSheetForItem(item);
      return;
    }

    // 否则打开模态框显示照片
    // Otherwise open modal to display photos
    const modal = await this.modalController.create({
      component: ModalPhotoViewerPage,
      componentProps: {
        photos: item.image,
        title: item.title + ' Photos',
        item: item,
        uploadCallback: this.uploadImageForItem.bind(this),
        deleteCallback: this.deleteImage.bind(this)
      },
      cssClass: 'photo-viewer-modal'
    });

    await modal.present();
    
    // 模态框关闭后刷新数据
    // Refresh data after modal is dismissed
    const { data } = await modal.onDidDismiss();
    // 可以在这里处理模态框返回的数据，如果需要的话
    // Can handle data returned from modal here if needed
  }

}
