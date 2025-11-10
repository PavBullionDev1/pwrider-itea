import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController, ActionSheetController, Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {AppComponent} from "../app.component";
import { ActivatedRoute, Router } from "@angular/router";
import {Httprequest} from "../models/httprequest";
import { addHours, format } from 'date-fns';
import { Big } from 'big.js';

@Component({
  selector: 'app-gold-shipment-clock-in',
  templateUrl: './assay-report-clock-in.page.html',
  styleUrls: ['./assay-report-clock-in.page.scss'],
})
export class AssayReportClockInPage implements OnInit {

  assay_report_purity_id = this.route.snapshot.paramMap.get("assay_report_purity_id");

  customer_id: number = 0;
  customerList: any = [];
  assayCompanyList: any = [];
  pwBarcodeList: any = [];

  detailList: any = [];

  status: any = '0';
  remark: string = '';

  calendarVisible: boolean = false;
  assay_report_date: string = '';
  assay_company_id:any = '';
  formattedDate: string = '';
  total_weight: number = 0;

  constructor(
    private http: HttpClient,
    public App: AppComponent,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private actionSheetController: ActionSheetController,
    private platform: Platform,
  ) {}

  async ngOnInit() {
    // await this.checkPermissions();
    const now = new Date();
    const utc8Date = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // Shift current time to UTC+8
    this.assay_report_date = utc8Date.toISOString().slice(0, 16); // Set as ISO string without seconds
    this.getAllCustomer();
    this.getAssayCompany();
    this.getPWBarcode();
    if(this.assay_report_purity_id){
      this.getAssayReportDetails();
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
  }

  async openCamera(sourceType: CameraSource) {
    try {
      // iOS 权限检查和延迟
      if (this.platform.is('ios')) {
        const permissionStatus = await Camera.checkPermissions();
        if (permissionStatus.camera !== 'granted') {
          const requestResult = await Camera.requestPermissions();
          if (requestResult.camera !== 'granted') {
            await this.showErrorAlert(new Error('权限被拒绝'), '请授予相机权限');
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
        saveToGallery: true
      };

      console.log('Opening camera with options:', options);
      const capturedPhoto = await Camera.getPhoto(options);
      console.log('Photo captured successfully, starting upload...');
      
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
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = "image/*";
        input.multiple = true;
        input.click();
        
        input.onchange = async () => {
          const file = input.files[0];
          if (!file) {
            return;
          }
          
          const base64Data = await this.readFileAsBase64(file);
          await this.api_upload_image(base64Data.split(',')[1]);
        };
      } catch (error) {
        console.error('Error creating file input:', error);
        await this.showErrorAlert(error, 'create file input');
      }
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
        const timeoutId = setTimeout(() => {
          console.log('Geolocation timeout, continuing without location');
          resolve(null);
        }, 5000);
        
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
            resolve(null);
          },
          { timeout: 5000, enableHighAccuracy: false }
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
        // Handle success
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
        // Handle success
      } else {
        await this.showErrorAlert(new Error(data['message'] || 'Upload failed'), 'upload multiple images');
      }
    } catch (error) {
      console.error('Connection Error', error);
      await this.showErrorAlert(error, 'upload multiple images');
    }
  }

  // Item specific camera functions
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
        const file = input.files[0];
        if (!file) {
          return;
        }
        
        const base64Data = await this.readFileAsBase64(file);
        await this.uploadImageForItem(item, base64Data.split(',')[1]);
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
        item.attachment = item.attachment || [];
        item.attachment = response['result'].img_path;
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

  getAssayReportDetails() {
    this.App.presentLoading();
    this.http
      .get(
        this.App.api_url + "/appGetAssayReportDetails/" + this.assay_report_purity_id + "/" + localStorage['token'])
      .subscribe(
        (data: any) => {

          this.detailList = data.result['data']['detailList'];
          console.log(this.detailList);
          this.remark = data.result['data']['remark'];
          const dateData = new Date(data.result['data']['assay_report_date']);
          const utc8Date = new Date(dateData.getTime() + (8 * 60 * 60 * 1000)); // Shift current time to UTC+8
          this.assay_report_date =  utc8Date.toISOString().slice(0, 16);
          this.assay_company_id = data.result['data']['assay_company_id'];
          this.status = data.result['data']['status'];
          this.detailList = data.result['data']['detailList'];

          console.log(data.result['data']);

          this.loadingController.dismiss();

        },
        (error) => {
          //this.loadingController.dismiss();

          console.log(error);
        }
      );
  }

  onDateChange(selectedDate: string) {
    if (selectedDate) {
      // Adjust the selected date to UTC+8
      const adjustedDate = addHours(new Date(selectedDate), 8);

      // Format the adjusted date as needed
      this.formattedDate = format(adjustedDate, 'dd/MM/yyyy HH:mm');
    }
  }

  apiUploadImage(imgInfo, photoType) {
    const tobeSubmit = {
      'account_id': localStorage['login_user_id'],
      'token': localStorage['token'],
      'imgInfo': imgInfo,
      'need_watermark': 1
    };
    this.http.post(this.App.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).subscribe((data) => {
      // this.isLoading[photoType] = false;
      if (data['status'] == "OK") {
        this[photoType].push(data['result']['img_path']);

      } else {
        console.log('Error uploading image');
      }
    }, (error) => {
      // this.isLoading[photoType] = false;
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

  async submitAssayReportPurity() {
    const loading = await this.loadingController.create({
      message: 'Submitting...',
    });
    await loading.present();

    const payload = {
      token: localStorage['token'],
      assay_report_date: this.assay_report_date,
      assay_company_id: this.assay_company_id,
      assay_report_purity_id: this.assay_report_purity_id ? this.assay_report_purity_id : 0,
      remark: this.remark,
      detailList: this.detailList,
      status: this.status,
    };

    console.log(payload);

    this.http.post(this.App.api_url + "/appSubmitAssayReportPurity", payload).subscribe(
      async (response) => {
        if(response['status'] == "OK"){
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Success',
            message: 'Clock-in submitted successfully!',
            buttons: ['OK'],
          });
          await alert.present();

          console.log(response);
          // Redirect or clear form if needed
          // this.router.navigate(["home"]);
        }else{
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'There was an error submitting your clock-in. Please try again later.',
            buttons: ['OK'],
          });
          await alert.present();

          console.log(response);
        }
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

  getAssayCompany() {
    this.http.get(`${this.App.api_url}/getAssayCompany/${localStorage.getItem('token')}`)
      .subscribe(
        (data: any) => {
          this.assayCompanyList = data.result?.data || [];
          this.assayCompanyList.sort((a, b) => a.title.localeCompare(b.title));
        },
        (error) => {
          console.error('Error fetching customers:', error)
          this.showErrorAlert(error,'fetching customers');
        }
      );
  }

  getPWBarcode() {
    this.http.get(`${this.App.api_url}/getPWBarcode/${localStorage.getItem('token')}?assay_report_purity_id=${this.assay_report_purity_id}`)
      .subscribe(
        (data: any) => {
          this.pwBarcodeList = data.result?.PW_barcode_list || [];
          this.pwBarcodeList.sort((a, b) => a.title.localeCompare(b.title));

          console.log(this.pwBarcodeList);
        },
        (error) => {
          console.error('Error fetching customers:', error)
          this.showErrorAlert(error,'fetching customers');
        }
      );
  }

  caculateXAU(item) {
    if(item.weight > 0 && item.purity > 0){
      item.xau = Big(item.weight).mul(item.purity).div(100).round(3, 0).toNumber();
    }
  }

  //add item
  addItem() {
    this.detailList.push({
      'assay_report_purity_detail_id': 0,
      'pw_barcode_id': '',
      'remark': '',
      'attachment': '',
      'is_loading': false
    });
  }

  //remove item
  removeItem(index) {
    this.detailList.splice(index, 1);
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

  isFormValid(): boolean {
    if (!this.assay_company_id) return false;
    if (!this.assay_report_date) return false;
    if (this.status === undefined || this.status === null) return false;

    if(this.detailList.length == 0) return false;

    for (let item of this.detailList) {
      if (!item.pw_barcode_id) return false;
      if (!item.purity && item.purity !== 0) return false;
    }

    return true; // 所有必填项都填写，表单才有效
  }

  deleteImage(item: any) {
    item.attachment = '';
  }

  toggleCalendar() {
    this.calendarVisible = !this.calendarVisible; // Toggle the visibility of the calendar
  }

  private async showErrorAlert(error: any, context: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: `Failed to ${context}: ${error.message || 'An error occurred.'}`,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async getAllCustomer() {
    try {
      const data: any = await this.http.get(this.App.api_url + "/getAllCustomer/" + localStorage['token']).toPromise();
      this.customerList = data.result.data;
      console.log(this.customerList);
    } catch (error) {
      console.error('Error fetching customers:', error);
      await this.showErrorAlert(error, 'fetch customers');
    }
  }
}
