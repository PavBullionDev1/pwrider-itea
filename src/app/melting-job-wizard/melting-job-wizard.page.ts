import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController, ActionSheetController, Platform } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AppComponent } from "../app.component";
import { ActivatedRoute, Router } from "@angular/router";
import { Httprequest } from "../models/httprequest";
import { ModalExchangeItemsPage } from '../modal-exchange-items/modal-exchange-items.page';
import { ModalGoldShipmentDetailPage } from '../modal-gold-shipment-detail/modal-gold-shipment-detail.page';
import { ModalController, NavController } from '@ionic/angular';
import { Big } from 'big.js';
// import { StatusBar as CapacitorStatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-gold-shipment-clock-in',
  templateUrl: './melting-job-wizard.page.html',
  styleUrls: ['./melting-job-wizard.page.scss'],
})
export class MeltingJobWizardPage implements OnInit {

  melting_job_order_id = this.route.snapshot.paramMap.get("melting_job_order_id");

  customerList: any[] = [];

  company_id: any;
  camera_mode = 0;
  customer_id: any;
  order_date: any;
  factory_code: any;
  serial_no: any;
  status: any;
  total_weight: any;
  total_XAU: any;
  avg_percentage: any;
  remark: any;
  gold_shipment_id: any;
  issued_by_img: any[] = [];
  checked_by_img: any[] = [];
  ShowImageUrl_issued_by: any;
  ShowImageUrl_checked_by: any;

  gold_shipment_list: any[] = [];
  customer_item_list: any[] = [];
  gold_shipment_detail_list:any[] = [];
  isLoading: Record<string, boolean> = {};
  metadata_json: any = {};

  image_type: any = 0;

  statusList: any[] = ['Pending to Melt', 'Melted','Completed(After collected sample)'];

  next_status: any = 0;
  GL: any;
  assay_sample_XAU: any;
  assay_sample_weight: any;
  bar_final_XAU: any;
  bar_final_weight: any;
  finalGL: any;
  finalRatio: any;
  final_purity: any;
  jewellery_estimated_XAU: any;
  jewellery_scale_weight: any;
  jewellery_weight_diff: any;
  loss: any;
  minor_loss: any;
  purity_loss: any;
  scrapbar_estimated_XAU: any;
  scrapbar_scale_weight: any;
  scrapbar_weight_diff: any;
  my_gold_shipment: any[] = [];
  assay_sample_final_data: any;
  assay_sample_XAU_data: any;

  scrapbar_scale_remark: any;
  scrapbar_scale_image: any[] = [];
  scrapbar_scale_is_loading = false;

  assay_sample_remark: any;
  assay_sample_image: any[] = [];
  assay_sample_is_loading = false;

  bar_final_remark: any;
  bar_final_image: any[] = [];
  bar_final_is_loading = false;

  final_purity_remark: any;
  final_purity_image: any[] = [];
  final_purity_is_loading = false;

  constructor(
    private modalController: ModalController,
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
    this.initializePage();
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

  private async initializePage() {
    this.getAllCustomer();
    this.getGoldShipmentList();
    if (this.melting_job_order_id) {
      await this.getMeltingJobDetails();
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

  async getMeltingJobDetails() {
    const loading = await this.loadingController.create({
      message: 'Loading melting job details...',
    });
    await loading.present();

    this.http.get(`${this.App.api_url}/appGetMeltingJobDetails/${this.melting_job_order_id}/${localStorage.getItem('token')}`)
      .subscribe(
        (data: any) => {
          const result = data.result?.data;
          if (result) {
            // Assign data to component properties
            this.company_id = result.company_id;
            this.customer_id = result.customer_id;
            this.order_date = result.order_date;
            this.factory_code = result.factory_code;
            this.serial_no = result.serial_no;
            this.status = result.status;
            if(this.status != 2){
              this.next_status = Big(result.status).plus(1).toNumber();
            }else{
              this.next_status = result.status;
            }
            this.total_weight = result.total_weight;
            this.total_XAU = result.total_XAU;
            this.avg_percentage = result.avg_percentage;
            this.remark = result.remark;
            this.gold_shipment_id = result.gold_shipment_id;
            this.issued_by_img = result.issued_by_img ? JSON.parse(result.issued_by_img) : [];
            this.checked_by_img = result.checked_by_img ? JSON.parse(result.checked_by_img) : [];
            this.ShowImageUrl_issued_by = result.ShowImageUrl_issued_by;
            this.ShowImageUrl_checked_by = result.ShowImageUrl_checked_by;

            if(result.metadata_json){
              this.GL = result.metadata_json.GL;
              this.assay_sample_XAU = result.metadata_json.assay_sample_XAU;
              this.assay_sample_weight = result.metadata_json.assay_sample_weight;
              if(this.next_status == 2){
                this.assay_sample_final_data = result.metadata_json.assay_sample_weight;
                this.assay_sample_XAU_data = result.metadata_json.assay_sample_XAU;
              }
              this.bar_final_XAU = result.metadata_json.bar_final_XAU;
              this.bar_final_weight = result.metadata_json.bar_final_weight;
              this.finalGL = result.metadata_json.finalGL;
              this.finalRatio = result.metadata_json.finalRatio;
              this.final_purity = result.metadata_json.final_purity;
              this.jewellery_estimated_XAU = result.metadata_json.jewellery_estimated_XAU;
              this.jewellery_scale_weight = result.metadata_json.jewellery_scale_weight;
              this.jewellery_weight_diff = result.metadata_json.jewellery_weight_diff;
              this.loss = result.metadata_json.loss;
              this.minor_loss = result.metadata_json.minor_loss;
              this.purity_loss = result.metadata_json.purity_loss;
              this.scrapbar_estimated_XAU = result.metadata_json.scrapbar_estimated_XAU;
              this.scrapbar_scale_weight = result.metadata_json.scrapbar_scale_weight;
              this.scrapbar_weight_diff = result.metadata_json.scrapbar_weight_diff;

              this.scrapbar_scale_remark = result.metadata_json.scrapbar_scale_remark;
              this.scrapbar_scale_image = result.metadata_json.scrapbar_scale_image || [];
              this.scrapbar_scale_is_loading = false;

              this.assay_sample_remark = result.metadata_json.assay_sample_remark;
              this.assay_sample_image = result.metadata_json.assay_sample_image || [];
              this.assay_sample_is_loading = false;

              this.bar_final_remark = result.metadata_json.bar_final_remark;
              this.bar_final_image = result.metadata_json.bar_final_image || [];
              this.bar_final_is_loading = false;

              this.final_purity_remark = result.metadata_json.final_purity_remark;
              this.final_purity_image = result.metadata_json.final_purity_image || [];
              this.final_purity_is_loading = false;
            }else{
              this.GL = 0;
              this.assay_sample_XAU = 0;
              this.assay_sample_weight = 0;
              if(this.next_status == 2){
                this.assay_sample_final_data = result.metadata_json.assay_sample_weight;
                this.assay_sample_XAU_data = result.metadata_json.assay_sample_XAU;
              }
              this.bar_final_XAU = 0;
              this.bar_final_weight = 0;
              this.finalGL = 0;
              this.finalRatio = 0;
              this.final_purity = 0;
              this.jewellery_estimated_XAU = 0;
              this.jewellery_scale_weight = 0;
              this.jewellery_weight_diff = 0;
              this.loss = 0;
              this.minor_loss = 0;
              this.purity_loss = 0;
              this.scrapbar_estimated_XAU = 0;
              this.scrapbar_scale_weight = 0;
              this.scrapbar_weight_diff = 0;

              this.scrapbar_scale_remark = result.metadata_json.scrapbar_scale_remark;
              this.scrapbar_scale_image = result.metadata_json.scrapbar_scale_image || [];
              this.scrapbar_scale_is_loading = false;

              this.assay_sample_remark = result.metadata_json.assay_sample_remark;
              this.assay_sample_image = result.metadata_json.assay_sample_image || [];
              this.assay_sample_is_loading = false;

              this.bar_final_remark = result.metadata_json.bar_final_remark;
              this.bar_final_image = result.metadata_json.bar_final_image || [];
              this.bar_final_is_loading = false;

              this.final_purity_remark = result.metadata_json.final_purity_remark;
              this.final_purity_image = result.metadata_json.final_purity_image || [];
              this.final_purity_is_loading = false;
            }

            if(result.gold_shipment_data){
              this.gold_shipment_list.push(result.gold_shipment_data);
            }

            console.log('Melting Job details loaded successfully', result);
          }
          loading.dismiss();
        },
        (error) => {
          console.error('Error fetching shipment details:', error);
          this.showErrorAlert(error,'fetching shipment details');
          loading.dismiss();
        }
      );
  }

  getAllCustomer() {
    this.http.get(`${this.App.api_url}/getAllCustomer/${localStorage.getItem('token')}`)
      .subscribe(
        (data: any) => {
          this.customerList = data.result?.data || [];
        },
        (error) => {
          console.error('Error fetching customers:', error)
          this.showErrorAlert(error,'fetching customers');
        }
      );
  }

  async submitMeltingJob() {
    const loading = await this.loadingController.create({
      message: 'Submitting melting job...',
    });
    this.metadata_json = {
      GL: this.GL,
      assay_sample_XAU: this.assay_sample_XAU,
      assay_sample_weight: this.assay_sample_weight,
      bar_final_XAU: this.bar_final_XAU,
      bar_final_weight: this.bar_final_weight,
      finalGL: this.finalGL,
      finalRatio: this.finalRatio,
      final_purity: this.final_purity,
      jewellery_estimated_XAU: this.jewellery_estimated_XAU,
      jewellery_scale_weight: this.jewellery_scale_weight,
      jewellery_weight_diff: this.jewellery_weight_diff,
      loss: this.loss,
      minor_loss: this.minor_loss,
      purity_loss: this.purity_loss,
      scrapbar_estimated_XAU: this.scrapbar_estimated_XAU,
      scrapbar_scale_weight: this.scrapbar_scale_weight,
      scrapbar_weight_diff: this.scrapbar_weight_diff,
      scrapbar_scale_remark: this.scrapbar_scale_remark,
      scrapbar_scale_image: this.scrapbar_scale_image || [],
      assay_sample_remark: this.assay_sample_remark,
      assay_sample_image: this.assay_sample_image || [],
      bar_final_remark: this.bar_final_remark,
      bar_final_image: this.bar_final_image || [],
      final_purity_remark: this.final_purity_remark,
      final_purity_image: this.final_purity_image || [],
    };
    const payload = {
      token: localStorage.getItem('token'),
      dataList: {
        company_id: this.company_id,
        customer_id: this.customer_id,
        order_date: this.order_date,
        factory_code: this.factory_code,
        serial_no: this.serial_no,
        status: this.status,
        total_weight: this.total_weight,
        total_XAU: this.total_XAU,
        avg_percentage: this.avg_percentage,
        remark: this.remark,
        gold_shipment_id: this.gold_shipment_id,
        issued_by_img: this.issued_by_img,
        checked_by_img: this.checked_by_img,
        next_status: this.next_status,
        assay_sample_final: this.assay_sample_final_data,
        assay_sample_XAU: this.assay_sample_XAU_data,

        metadata_json: this.metadata_json,
      },
      melting_job_order_id: this.melting_job_order_id || 0,
    };

    await loading.present();
    this.http.post(`${this.App.api_url}/appSubmitMeltingJobWizard`, payload)
      .subscribe(
        async (response) => {
          console.log('Melting job wizard submitted successfully:', response);
          await loading.dismiss();
          if(response['status'] == 'ERROR'){
            console.error('Error submitting melting job wizard:', response['result']);
            this.showErrorAlert( response['result'],'submitting melting job wizard');
            await loading.dismiss();
          }else{
            const alert = await this.alertController.create({
              header: 'Success',
              message: 'Melting job submitted successfully.',
              buttons: [
                {
                  text: 'OK',
                  handler: () => {
                    this.router.navigate(['/melting-job-list']);
                  }
                }
              ]
            });
            await alert.present();
          }

        },
        async (error) => {
          console.error('Error submitting shipment:', error);
          this.showErrorAlert(error,'submitting shipment');
          await loading.dismiss();
        }
      );


  }

  calculateAssaySampleXAU() {
    if(this.assay_sample_final_data && this.final_purity){
      this.assay_sample_XAU_data = Big(this.assay_sample_final_data).mul(this.final_purity).div(100).round(3, 0).toNumber();
    }
  }

  recalculate() {
    const validateNumber = (value) => {
      return isNaN(value) || value === null || value === undefined || value < 0 ? 0 : value;
    };

    // Ensure all relevant properties are valid numbers
    this.jewellery_scale_weight = validateNumber(this.jewellery_scale_weight);
    this.avg_percentage = validateNumber(this.avg_percentage);
    this.scrapbar_scale_weight = validateNumber(this.scrapbar_scale_weight);
    this.final_purity = validateNumber(this.final_purity);
    this.assay_sample_weight = validateNumber(this.assay_sample_weight);
    this.bar_final_weight = validateNumber(this.bar_final_weight);

    const calculateXAU = (weight, percentage) => {
      return Big(weight).mul(percentage).div(100).round(3, 0).toNumber();
    };

    this.jewellery_estimated_XAU = calculateXAU(this.jewellery_scale_weight, this.avg_percentage);
    this.scrapbar_estimated_XAU = calculateXAU(this.scrapbar_scale_weight, this.final_purity);
    this.assay_sample_XAU = calculateXAU(this.assay_sample_weight, this.final_purity);
    this.bar_final_XAU = calculateXAU(this.bar_final_weight, this.final_purity);

    this.loss = Big(this.scrapbar_scale_weight)
      .minus(this.jewellery_scale_weight)
      .round(2, 0)
      .toNumber();

    this.GL = Big(this.bar_final_XAU)
        .minus(this.jewellery_estimated_XAU)
        .round(3, 0)
        .toNumber();

    this.finalGL = Big(this.assay_sample_XAU)
        .plus(this.GL)
        .round(3, 0)
        .toNumber();

    this.minor_loss  = Big(this.scrapbar_scale_weight)
      .minus(this.bar_final_weight)
      .minus(this.assay_sample_weight)
      .round(2, 0)
      .toNumber();
  }





  getGoldShipmentDetails(gold_shipment_id) {
     this.App.presentLoading();

     this.http
      .get(
        this.App.api_url + "/appGetGoldShipmentDetails/" + gold_shipment_id + "/" + localStorage['token'])
      .subscribe(
        (data: any) => {

          console.log(data.result['data']);

          this.loadingController.dismiss();

        },
        (error) => {
          //this.loadingController.dismiss();

          console.log(error);
          this.loadingController.dismiss();

        }
      );
  }

  getGoldShipmentList() {
    this.App.presentLoading();
    this.http
      .get(
        this.App.api_url + "/appGetGoldShipmentList/" + localStorage['token'] + '?status="0"&type=2'
      )
      .subscribe(
        (data: any) => {
          this.loadingController.dismiss();
          this.gold_shipment_list = data.result['dataList'];
          console.log("this.gold_shipment_list",this.gold_shipment_list);

        },
        (error) => {
          this.loadingController.dismiss();
          console.log(error);
        }
      );
  }

  async openActionSheet_tng(mode) {
    this.image_type = mode;

    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Camera(Single Image)',
        role: 'camera',
        icon: 'camera',
        handler: () => {
          this.camera_mode = 0;
          this.openCamera_tng(CameraSource.Camera);
        }
      },{
        text: 'Camera(Multiple Image)',
        role: 'camera',
        icon: 'camera',
        handler: () => {
          this.camera_mode = 1;
          this.openCamera_tng(CameraSource.Camera);
        }
      }, {
        text: 'Upload From Gallery',
        role: 'gallery',
        icon: 'images-outline',
        handler: () => {
          this.getImages_tng();
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

  async openCamera_tng(sourceType: CameraSource) {
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
      await this.App.presentLoading(100000);

      if (capturedPhoto.base64String) {
        await this.api_upload_image_tng(capturedPhoto.base64String);
      } else {
        await this.App.stopLoading(100);
        await this.showErrorAlert(new Error('No image data'), 'capture photo');
      }
    } catch (error) {
      await this.App.stopLoading(100);
      console.error('Error capturing photo:', error);
      await this.showErrorAlert(error, 'capture photo');
    }
  }

  async getImages_tng() {
    if (this.platform.is('hybrid')) {
      try {
        const options = {
          quality: 80,
          width: 640,
          limit: 10,
          resultType: CameraResultType.Base64
        };

        const result = await Camera.pickImages(options);
        await this.App.presentLoading(100000);

        const imageResponse: any[] = [];
        for (const photo of result.photos) {
          const base64Data = await this.readAsBase64(photo);
          imageResponse.push(base64Data.split(',')[1]);
        }

        await this.api_upload_multiple_image_tng(imageResponse);
      } catch (error) {
        await this.App.stopLoading(100);
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
          try {
            await this.App.presentLoading(10000);
            const file = input.files[0];
            if (!file) {
              await this.App.stopLoading(100);
              return;
            }
            
            const base64Data = await this.readFileAsBase64(file);
            await this.api_upload_image_tng(base64Data.split(',')[1]);
          } catch (error) {
            await this.App.stopLoading(100);
            console.error('Error reading file:', error);
            await this.showErrorAlert(error, 'read file');
          }
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

  async api_upload_image_tng(imgInfo: string) {
    try {
      const position = await this.getCurrentPosition();
      const tobeSubmit = {
        'account_id': localStorage['login_user_id'],
        'token': localStorage['token'],
        'imgInfo': imgInfo,
        'need_watermark': 1,
        ...(position && { location: position })
      };
      await this.one_image_upload_tng(tobeSubmit);
    } catch (error) {
      console.error('Error in api_upload_image:', error);
      const tobeSubmit = {
        'account_id': localStorage['login_user_id'],
        'token': localStorage['token'],
        'imgInfo': imgInfo,
        'need_watermark': 1
      };
      await this.one_image_upload_tng(tobeSubmit);
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

  async one_image_upload_tng(tobeSubmit: any) {
    try {
      const data = await this.http.post(this.App.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).toPromise();
      if (data['status'] === "OK") {
        await this.App.stopLoading(100);

        if(this.image_type === 0) {
          this.issued_by_img.push(data['result']['img_path']);
        } else {
          this.checked_by_img.push(data['result']['img_path']);
        }

        if(this.camera_mode === 1) {
          await this.openCamera_tng(CameraSource.Camera);
        }
      } else {
        await this.App.stopLoading(100);
        await this.App.presentAlert_default('', 'Error!. Please try again', "../../assets/attention2-icon.svg");
      }
    } catch (error) {
      await this.App.stopLoading(100);
      await this.App.presentAlert_default('', "Connection Error", "../../assets/attention2-icon.svg");
    }
  }

  async api_upload_multiple_image_tng(imgInfo: string[]) {
    try {
      const position = await this.getCurrentPosition();
      const tobeSubmit = {
        'account_id': localStorage['login_user_id'],
        'token': localStorage['token'],
        'imgInfo': imgInfo,
        'need_watermark': 1,
        ...(position && { location: position })
      };
      await this.multiple_image_upload_tng(tobeSubmit);
    } catch (error) {
      console.error('Error in api_upload_multiple_image:', error);
      const tobeSubmit = {
        'account_id': localStorage['login_user_id'],
        'token': localStorage['token'],
        'imgInfo': imgInfo,
        'need_watermark': 1
      };
      await this.multiple_image_upload_tng(tobeSubmit);
    }
  }

  async multiple_image_upload_tng(tobeSubmit: any) {
    try {
      const data = await this.http.post(this.App.api_url + "/uploadMultipleImage", tobeSubmit, { observe: "body" }).toPromise();
      if (data['status'] === "OK") {
        await this.App.stopLoading(100);
        if(this.image_type === 0) {
          this.issued_by_img.push(data['result']['img_path']);
        } else {
          this.checked_by_img.push(data['result']['img_path']);
        }
      } else {
        await this.App.stopLoading(100);
        await this.App.presentAlert_default('', 'Error2!. Please try again', "../../assets/attention2-icon.svg");
      }
    } catch (error) {
      await this.App.stopLoading(100);
      await this.App.presentAlert_default('', "Connection Error 2", "../../assets/attention2-icon.svg");
    }
  }

  async openActionSheetForItem(item: any, is_loading: boolean) {
    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: [
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            this.openCameraForItem(item, CameraSource.Camera, is_loading);
          }
        },
        {
          text: 'Gallery',
          icon: 'images',
          handler: () => {
            this.getImageFromGalleryForItem(item, is_loading);
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

  async openCameraForItem(item: any, sourceType: CameraSource, is_loading: boolean) {
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

      console.log('Opening camera for item with options:', options);
      const capturedPhoto = await Camera.getPhoto(options);
      console.log('Photo captured successfully for item, starting upload...');
      is_loading = true;

      if (capturedPhoto.base64String) {
        await this.uploadImageForItem(item, capturedPhoto.base64String, is_loading);
      } else {
        is_loading = false;
        await this.showErrorAlert(new Error('No image data'), 'capture photo for item');
      }
    } catch (error) {
      is_loading = false;
      console.error('Error capturing photo:', error);
      await this.showErrorAlert(error, 'capture photo for item');
    }
  }

  async getImageFromGalleryForItem(item: any, is_loading: boolean) {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = "image/*";
      input.multiple = true;
      input.click();

      input.onchange = async () => {
        try {
          is_loading = true;
          const file = input.files[0];
          if (!file) {
            is_loading = false;
            return;
          }
          
          const base64Data = await this.readFileAsBase64(file);
          await this.uploadImageForItem(item, base64Data.split(',')[1], is_loading);
        } catch (error) {
          is_loading = false;
          console.error('Error reading file:', error);
          await this.showErrorAlert(error, 'read file for item');
        }
      };
    } catch (error) {
      console.error('Error creating file input:', error);
      await this.showErrorAlert(error, 'create file input');
    }
  }

  async uploadImageForItem(item: any, base64Image: string, is_loading: boolean) {
    try {
      const payload = {
        account_id: localStorage['login_user_id'],
        token: localStorage['token'],
        imgInfo: base64Image,
        need_watermark: 1
      };

      const response = await this.http.post(`${this.App.api_url}/uploadImage`, payload).toPromise();
      
      if (response['status'] === "OK") {
        item = item || [];
        item.push(response['result'].img_path);
      } else {
        console.error('Error uploading image:', response['message']);
        await this.showErrorAlert(new Error(response['message'] || 'Upload failed'), 'upload image for item');
      }
    } catch (error) {
      console.error('HTTP error:', error);
      await this.showErrorAlert(error, 'upload image for item');
    } finally {
      is_loading = false;
    }
  }

  deleteImage(item: any, imgPath: string) {
    const index = item.indexOf(imgPath);
    if (index > -1) {
      item.splice(index, 1);
    }
  }

  selectAll(event: any) {
    if (event && event.target) {
      event.target.select();
    }
  }

}
