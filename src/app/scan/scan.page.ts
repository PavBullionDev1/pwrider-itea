import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
// import { StatusBar as CapacitorStatusBar } from '@capacitor/status-bar';
import { ActionSheetController, LoadingController, NavController, Platform } from '@ionic/angular';
import { AppComponent } from '../app.component';
// import { Httprequest } from "../models/httprequest";

interface ScanResult {
  hasContent: boolean;
  content: string;
}

interface ApiResponse {
  status: string;
  result: {
    sales_order_id: string;
    [key: string]: any;
  };
}

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit {

  constructor(
    public App:AppComponent,
    private navCtrl: NavController,
    public httpClient: HttpClient,
    private router: Router,
    public loadingController: LoadingController,
    public actionSheetController: ActionSheetController,
    private platform: Platform,
  ) { }

  cn_no: string = "";

  async ngOnInit() {
    // await this.checkPermissions();
  }

  private async checkPermissions() {
    try {
      // 检查相机权限
      const permissionStatus = await Camera.checkPermissions();
      if (permissionStatus.camera !== 'granted') {
        await Camera.requestPermissions();
      }
      
      // 检查条码扫描器权限
      await BarcodeScanner.checkPermission({ force: true });
    } catch (error) {
      console.error('Error checking permissions:', error);
      await this.showErrorAlert(error, 'check permissions');
    }
  }

  private async showErrorAlert(error: any, context: string) {
    const alert = await this.App.presentAlert_default(
      'Error',
      `Failed to ${context}: ${error.message || 'An error occurred.'}`,
      "assets/attention2-icon.svg"
    );
  }

  search(){
    let tobeSubmit = {
			'user_id': localStorage['login_user_id'],
			'token': localStorage['token'],
			'cn_no': this.cn_no,
		};

    this.httpClient.post(this.App.api_url + '/appSearchSalesorder', tobeSubmit).subscribe(
      (data: any) => {
        if (data.status == "OK") {
          this.loadingController.dismiss();

          if(data['result']['dataCount']==1){
            this.navCtrl.navigateForward('result-detail/'+data['result']['sales_order_id']);
          }else{
            this.navCtrl.navigateForward('result/'+this.cn_no);
          }

        } else {
          this.loadingController.dismiss();
          this.App.presentAlert_default(
            data["status"],
            data["result"],
            "assets/attention-icon.svg"
          );
        }
      },
      (error) => {
        this.loadingController.dismiss();
        this.App.presentAlert_default(
          "ERROR",
          "Connection Error",
          "assets/attention-icon.svg"
        );
      }
    );
  }

  async scanBarcode() {
    try {
      // 开始扫描前准备
      await BarcodeScanner.prepare();
      
      // 隐藏网页背景
      document.querySelector('body')?.classList.add('scanner-active');
      
      // 开始扫描
      const result = await BarcodeScanner.startScan();
      
      // 扫描完成后恢复网页背景
      document.querySelector('body')?.classList.remove('scanner-active');
      
      if (result.hasContent) {
        console.log('Scan result:', result.content);
        
        // 调用API处理扫描结果
        await this.App.presentLoading(100000);
        
        try {
          const data = await this.httpClient.get<ApiResponse>(
            `${this.App.api_url}/getRiderJobDetails/${localStorage['login_user_id']}/${localStorage['token']}/${result.content}`,
            {observe: "body"}
          ).toPromise();
          
          await this.App.stopLoading(100);
          
          if(data?.status === "OK") {
            this.router.navigate(['result-detail/' + data.result.sales_order_id]);
          } else {
            await this.App.presentAlert_default('ERROR', JSON.stringify(data?.result) || 'Unknown error', "assets/attention2-icon.svg");
          }
        } catch (error) {
          await this.App.stopLoading(100);
          console.error('API Error:', error);
          await this.App.presentAlert_default('ERROR', "Connection Error", "assets/attention2-icon.svg");
        }
      }
    } catch (error) {
      document.querySelector('body')?.classList.remove('scanner-active');
      console.error('Scan Error:', error);
      await this.showErrorAlert(error, 'scan barcode');
    } finally {
      // 停止扫描
      await BarcodeScanner.stopScan();
    }
  }

  async openActionSheet(type) {
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
				text: 'Select From Gallery',
				role: 'gallery',
				icon: 'images-outline',
				handler: () => {
					this.openCamera(CameraSource.Photos);
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
      await this.App.presentLoading(100000);

      // StatusBar调用已移除
      // CapacitorStatusBar.setOverlaysWebView({ overlay: true });
      // CapacitorStatusBar.setOverlaysWebView({ overlay: false });

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

  async api_upload_image(imgInfo) {
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

  async one_image_upload(tobeSubmit) {
    try {
      const data = await this.httpClient.post(this.App.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).toPromise();
      
      if (data['status'] === "OK") {
        await this.App.stopLoading(100);
        this.router.navigate(['result-detail/' + data['result']['sales_order_id']]);
      } else {
        await this.App.stopLoading(100);
        await this.App.presentAlert_default('', 'Error!. Please try again', "assets/attention2-icon.svg");
      }
    } catch (error) {
      await this.App.stopLoading(100);
      await this.App.presentAlert_default('', "Connection Error", "assets/attention2-icon.svg");
    }
  }
}
