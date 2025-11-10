import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController, ActionSheetController, Platform } from '@ionic/angular';
import {AppComponent} from "../app.component";
import { ActivatedRoute, Router } from "@angular/router";
import {Httprequest} from "../models/httprequest";
import { NativeAdapterService, CameraOptions } from '../services/native-adapter.service';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-gold-shipment-clock-in',
  templateUrl: './gold-shipment-clock-in.page.html',
  styleUrls: ['./gold-shipment-clock-in.page.scss'],
  providers: []
})
export class GoldShipmentClockInPage implements OnInit {

  gold_shipment_clock_in_id = this.route.snapshot.paramMap.get("gold_shipment_clock_in_id");

  lowPurityWeight: number;
  purity916Weight: number;
  highPurityWeight: number;
  goldBead: number;
  totalMix: number;
  bar: number;
  sample: number;
  sampleReturn: number;
  purity: number;
  outStock: number;
  balance: number;

  remarks: string = '';
  barcode: string = '';

  customer_id: number = 0;
  customerList: any = [];


  lowPurityPhoto: any  = [];
  purity916Photo: any  = [];
  highPurityPhoto: any  = [];
  goldBeadPhoto: any  = [];
  totalMixPhoto: any  = [];
  barPhoto: any  = [];
  samplePhoto: any  = [];
  sampleReturnPhoto: any  = [];
  purityPhoto: any  = [];
  outStockPhoto: any = [];
  balancePhoto: any = [];

  showLowPurityPhoto: string = '';
  showPurity916Photo: string = '';
  showHighPurityPhoto: string = '';
  showGoldBeadPhoto: string = '';
  showTotalMixPhoto: string = '';
  showBarPhoto: string = '';
  showSamplePhoto: string = '';
  showSampleReturnPhoto: string = '';
  showPurityPhoto: string = '';
  showOutStockPhoto: string = '';
  showBalancePhoto: string = '';

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
    private nativeAdapter: NativeAdapterService,
    private actionSheetController: ActionSheetController,
    private platform: Platform,
  ) {}

  private async presentErrorAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
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

  ngOnInit() {
    this.getAllCustomer();
    if(this.gold_shipment_clock_in_id) {
      this.getClockInDetails();
    }
  }

  async openActionSheet(photoType: string) {
    const actionSheet = await this.actionSheetController.create({
      buttons: [{
        text: 'Camera',
        icon: 'camera',
        handler: () => {
          this.takePhoto('camera', photoType);
        }
      }, {
        text: 'Upload From Gallery',
        icon: 'images',
        handler: () => {
          this.getImages_tng(photoType);
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

  async takePhoto(sourceType: string, photoType: string) {
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

      const cameraOptions = {
        quality: 80,
        resultType: CameraResultType.Base64,
        source: sourceType === 'camera' ? CameraSource.Camera : CameraSource.Photos,
        width: 640,
        allowEditing: false,
        correctOrientation: true,
        saveToGallery: true
      };

      console.log('Opening camera with options:', cameraOptions);
      const capturedPhoto = await Camera.getPhoto(cameraOptions);
      console.log('Photo captured successfully, starting upload...');
      
      this.isLoading[photoType] = true;
      
      if (capturedPhoto.base64String) {
        await this.apiUploadImage(capturedPhoto.base64String, photoType);
      } else {
        this.isLoading[photoType] = false;
        await this.presentErrorAlert('Error', 'Failed to capture photo');
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      this.isLoading[photoType] = false;
      await this.presentErrorAlert('Error', 'Failed to capture photo: ' + (error.message || error));
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

  getImages_tng(photoType: string) {
    if ( this.platform.is('hybrid') ) {

      const options = {
        quality: 80,
        width: 640,
        limit: 10,
        resultType: CameraResultType.Base64
      };

      this.platform.ready().then(async () => {
        console.log("platform ready");
        this.isLoading[photoType] = true;

        try {
          const capturedPhotos = await Camera.pickImages(options);
          
          let imageResponse = [];
          
          if (capturedPhotos.photos.length > 0) {
            for (const photo of capturedPhotos.photos) {
              // Extract base64 data from data URL
              const base64Data = (photo as any).base64String || photo.webPath;
              imageResponse.push(base64Data);
            }
            this.multiple_image_upload_tng(imageResponse, photoType);
          }
        } catch (err) {
          console.log(err);
          this.isLoading[photoType] = false;
        }

      });

    } else {

      //console.log("not mobileweb");
      let input = document.createElement('input');
      input.type = 'file';
      input.accept = "image/*";
      input.multiple = true;
      input.click();
      input.onchange = () => {
        this.isLoading[photoType] = true;
        //this.App.presentLoading(100000);
        // Status bar overlay handled by Capacitor automatically
        let file = input.files[0];
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          //mutliple images upload
          //console.log(reader.result.toString());
          let imgInfo = reader.result.toString().split(',')[1];
          this.apiUploadImage(imgInfo, photoType);
        };
        reader.onerror = (error) => {
          console.log('Error: ', error);
        };
      };

    }
  }


  multiple_image_upload_tng(imgInfo,photoType) {
    let tobeSubmit = {
      'account_id': localStorage['login_user_id'],
      'token': localStorage['token'],
      'imgInfo': imgInfo,
      'need_watermark': 1,
    };
    this.http.post(this.App.api_url + "/uploadMultipleImage", tobeSubmit, { observe: "body" }).subscribe((data) => {
      if (data['status'] == "OK") {
        this.App.stopLoading(100);
        this[photoType] = this[photoType].concat(JSON.parse(data['result']['img_path']));
        this.isLoading[photoType] = false;
      } else {
        this.App.stopLoading(100);
        this.App.presentAlert_default('', 'Error2!. Please try again', "../../assets/attention2-icon.svg");
        this.isLoading[photoType] = false;
      }
    }, error => {
      this.App.stopLoading(100);
      this.App.presentAlert_default('', "Connection Error 2", "../../assets/attention2-icon.svg");
      this.isLoading[photoType] = false;
    });
  }

  delete_img_tng(img_path, type) {
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
          let index = this[type].indexOf(img_path);
          if (index !== -1) {
            this[type].splice(index, 1);
          }
          if (this[type] == img_path) {
            this[type] = '';
          }

        }
      }]
    }).then(alert => alert.present());
  }

  // getImages(photoType: string) {
  //   const input = document.createElement('input');
  //   input.type = 'file';
  //   input.accept = "image/*";
  //   input.click();
  //   input.onchange = () => {
  //     const file = input.files[0];
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onload = () => {
  //       this.isLoading[photoType] = true;
  //       const imgInfo = reader.result.toString().split(',')[1];
  //       this.apiUploadImage(imgInfo, photoType);
  //     };
  //     reader.onerror = (error) => {
  //       console.log('Error: ', error);
  //     };
  //   };
  // }

  getClockInDetails() {
    this.App.presentLoading();
    this.http
      .get(
        this.App.api_url + "/appGetClockInDetails/" + this.gold_shipment_clock_in_id + "/" + localStorage['token'])
      .subscribe(
        (data: any) => {

          console.log(data.result['data']);

          this.lowPurityWeight= data.result['data']['low_purity'];
          this.purity916Weight = data.result['data']['gold'];
          this.highPurityWeight = data.result['data']['high_purity'];
          this.goldBead = data.result['data']['gold_bead'];
          this.totalMix = data.result['data']['total_mix'];
          this.bar = data.result['data']['bar'];
          this.sample = data.result['data']['sample'];
          this.sampleReturn = data.result['data']['sample_return'];
          this.purity = data.result['data']['purity'];
          this.outStock = data.result['data']['out_stock'];
          this.balance = data.result['data']['balance'];
          this.remarks = data.result['data']['remark'];
          this.barcode = data.result['data']['barcode'];
          this.customer_id= data.result['data']['customer_id'];

          this.lowPurityPhoto = data.result['data']['low_purity_image'] ? data.result['data']['low_purity_image'] : [];
          this.purity916Photo = data.result['data']['gold_image'] ? data.result['data']['gold_image'] : [];
          this.highPurityPhoto = data.result['data']['high_purity_image'] ? data.result['data']['high_purity_image'] : [];
          this.goldBeadPhoto = data.result['data']['gold_bead_image'] ? data.result['data']['gold_bead_image'] : [];
          this.totalMixPhoto = data.result['data']['total_mix_image'] ? data.result['data']['total_mix_image'] : [];
          this.barPhoto = data.result['data']['bar_image'] ? data.result['data']['bar_image'] : [];
          this.samplePhoto = data.result['data']['sample_image'] ? data.result['data']['sample_image'] : [];
          this.sampleReturnPhoto = data.result['data']['sample_return_image'] ? data.result['data']['sample_return_image'] : [];
          this.purityPhoto = data.result['data']['purity_image'] ? data.result['data']['purity_image'] : [];
          this.outStockPhoto = data.result['data']['out_stock_image'] ? data.result['data']['out_stock_image'] : [];
          this.balancePhoto = data.result['data']['balance_image'] ? data.result['data']['balance_image'] : [];

          this.loadingController.dismiss();

        },
        (error) => {
          //this.loadingController.dismiss();

          console.log(error);
        }
      );
  }

  async apiUploadImage(imgInfo, photoType) {
    try {
      console.log('Starting image upload for photoType:', photoType);
      const position = await this.getCurrentPosition();
      const tobeSubmit = {
        'account_id': localStorage['login_user_id'],
        'token': localStorage['token'],
        'imgInfo': imgInfo,
        'need_watermark': 1,
        ...(position && { location: position })
      };
      
      const data = await this.http.post(this.App.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).toPromise();
      
      if (data['status'] == "OK") {
        this[photoType].push(data['result']['img_path']);
        console.log('Image uploaded successfully for:', photoType);
      } else {
        console.error('Upload failed:', data);
        await this.presentErrorAlert('Error', 'Failed to upload image');
      }
    } catch (error) {
      console.error('Connection Error:', error);
      await this.presentErrorAlert('Error', 'Connection error during upload');
    } finally {
      this.isLoading[photoType] = false;
    }
  }

  deletePhoto(photoType: string) {
    this[photoType] = null;
  }

  async submitClockIn() {
    const loading = await this.loadingController.create({
      message: 'Submitting...',
    });
    await loading.present();

    const payload = {
      token: localStorage['token'],
      lowPurityWeight: this.lowPurityWeight,
      purity916Weight: this.purity916Weight,
      highPurityWeight: this.highPurityWeight,
      remarks: this.remarks,
      lowPurityPhoto: this.lowPurityPhoto,
      purity916Photo: this.purity916Photo,
      barcode: this.barcode,
      highPurityPhoto: this.highPurityPhoto,
      goldBead: this.goldBead,
      goldBeadPhoto: this.goldBeadPhoto,
      totalMix: this.totalMix,
      totalMixPhoto: this.totalMixPhoto,
      bar: this.bar,
      barPhoto: this.barPhoto,
      sample: this.sample,
      samplePhoto: this.samplePhoto,
      sampleReturn: this.sampleReturn,
      sampleReturnPhoto: this.sampleReturnPhoto,
      purity: this.purity,
      purityPhoto: this.purityPhoto,
      outStock: this.outStock,
      outStockPhoto: this.outStockPhoto,
      balance: this.balance,
      balancePhoto: this.balancePhoto,
      gold_shipment_clock_in_id: this.gold_shipment_clock_in_id ? this.gold_shipment_clock_in_id : 0
    };

    this.http.post(this.App.api_url + "/appSubmitClockIn", payload).subscribe(
      async (response) => {
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Success',
          message: 'Clock-in submitted successfully!',
          buttons: ['OK'],
        });
        await alert.present();
        // Redirect or clear form if needed
        this.router.navigate(["home"]);
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
}
