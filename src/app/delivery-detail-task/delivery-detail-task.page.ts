import { Location } from "@angular/common";
import { HttpClient, HttpRequest } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
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
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// import { StatusBar as CapacitorStatusBar } from '@capacitor/status-bar';
import { ModalController, NavController } from "@ionic/angular";
import { ModalSignaturePage } from "../modal-signature/modal-signature.page";

@Component({
	selector: "app-delivery-detail",
	templateUrl: "./delivery-detail-task.page.html",
	styleUrls: ["./delivery-detail-task.page.scss"],
})
export class DeliveryDetailTaskPage implements OnInit {
	signature_data: any;

	constructor(
		public alertController: AlertController,
		private router: Router,
		public httpClient: HttpClient,
		public App: AppComponent,
		private route: ActivatedRoute,
		public loadingController: LoadingController,
		public menuCtrl: MenuController,
		public actionSheetController: ActionSheetController,
		private platform: Platform,
		public location: Location,
		private navCtrl: NavController,
		public modalController: ModalController
	) {}

	task_id = this.route.snapshot.paramMap.get("task_id");
  job_id = 0;
	mode = "home";
	stepMode = "noSelect";
	find = "";
	viewMode = "empty";
	userList: any[] = [];
	statusList: any[] = [];
	riderList: any = {};
	delivery_status = 0;
	is_multiple_image = 0;
	imageUrl = "";
	MultipleImageUrl: string[] = [];
	relationSettingsList: any[] = [];
	passreasonSettingsList: any[] = [];
	recipient_ic = "";
	recipient_relation = "";
	reason_3rdparty = "";
	delivery_remark = "";
	require_recipient_detail = 0;

	async ngOnInit() {
    // await this.checkPermissions();
		this.getPickUpDetails();
		this.getRiderSetting();
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

	getPickUpDetails() {
		this.App.presentLoading();
		this.httpClient
			.get(
				this.App.api_url +
					"/appGetPickUpDetailsByTask/" +
					this.task_id +
					"/" +
					localStorage['token']
			)
			.subscribe(
				(data: any) => {
					this.loadingController.dismiss();
          this.job_id = data.result["job_id"];
					this.riderList = data.result["jobDetails"];
					this.statusList = data.result["statusList"];
					this.relationSettingsList =
						data.result["relationSettingsList"];
					this.passreasonSettingsList =
						data.result["passreasonSettingsList"];
				},
				(error: any) => {
					this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	getRiderSetting() {
		this.App.presentLoading();
		this.httpClient
			.get(this.App.api_url + "/getRiderSetting/" + localStorage['token'])
			.subscribe(
				(data: any) => {
					this.loadingController.dismiss();
					this.require_recipient_detail =
						data.result["require_recipient_detail"];
				},
				(error: any) => {
					this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	async openActionSheet(type) {
		const actionSheet = await this.actionSheetController.create({
			cssClass: "my-custom-class",
			buttons: [
				{
					text: "Camera",
					role: "camera",
					icon: "camera",
					handler: () => {
						this.openCamera(CameraSource.Camera);
					},
				},
				{
					text: "Select From Gallery",
					role: "gallery",
					icon: "images-outline",
					handler: () => {
						this.openCamera(CameraSource.Photos);
					},
				},
				{
					text: "Upload multiple image",
					role: "gallery",
					icon: "images-outline",
					handler: () => {
						this.getImages();
					},
				},
				{
					text: "Cancel",
					role: "cancel",
					handler: () => {
						console.log("Cancel clicked");
					},
				},
			],
		});
		await actionSheet.present();
		const { role } = await actionSheet.onDidDismiss();
		console.log("onDidDismiss resolved with role", role);
	}

	async openModalSign() {
		const modal = await this.modalController.create({
			component: ModalSignaturePage,
			componentProps: {},
			backdropDismiss: false,
		});
		await modal.present();

		modal.onDidDismiss().then((data: any) => {
			this.signature_data = data.data;
			console.log("this.signature_data", this.signature_data);
		});
	}

	async openCamera(sourceType: CameraSource) {
    try {
      console.log('openCamera: 开始拍照，sourceType:', sourceType);
      
      // iOS权限检查和延迟
      if (this.platform.is('ios')) {
        await this.checkPermissions();
        await new Promise(resolve => setTimeout(resolve, 1000));
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

      const capturedPhoto = await Camera.getPhoto(options);
      console.log('openCamera: 拍照成功，开始loading');
      this.App.presentLoading(100000);
      
      if (capturedPhoto.base64String) {
        await this.api_upload_image(capturedPhoto.base64String);
      } else {
        this.App.stopLoading(100);
        await this.showErrorAlert(new Error('No image data'), 'capture photo');
      }
    } catch (error) {
      console.error('openCamera: 拍照失败', error);
      this.App.stopLoading(100);
      await this.showErrorAlert(error, 'capture photo');
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

        const result = await Camera.pickImages(options);
        await this.App.presentLoading(100000);
        
        const imageResponse = [];
        for (const photo of result.photos) {
          const base64Data = await this.readAsBase64(photo);
          imageResponse.push(base64Data.split(',')[1]);
        }
        
        await this.api_upload_multiple_image(imageResponse);
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
            
            const files = input.files;
            if (!files || files.length === 0) {
              await this.App.stopLoading(100);
              return;
            }
            
            const imagesData = [];
            for (let i = 0; i < files.length; i++) {
              const base64Data = await this.readFileAsBase64(files[i]);
              imagesData.push(base64Data.split(',')[1]);
            }
            await this.api_upload_multiple_image(imagesData);
          } catch (error) {
            await this.App.stopLoading(100);
            console.error('Error reading files:', error);
            await this.showErrorAlert(error, 'read files');
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
      reader.onerror = (error: any) => reject(error);
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
    return new Promise((resolve) => {
      console.log('getCurrentPosition: 开始获取位置');
      const timeoutId = setTimeout(() => {
        console.log('getCurrentPosition: 5秒超时，返回null');
        resolve(null);
      }, 5000);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId);
            console.log('getCurrentPosition: 获取位置成功', position.coords);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            clearTimeout(timeoutId);
            console.log('getCurrentPosition: 获取位置失败', error);
            resolve(null);
          },
          {
            timeout: 5000,
            enableHighAccuracy: true
          }
        );
      } else {
        clearTimeout(timeoutId);
        console.log('getCurrentPosition: 浏览器不支持地理位置');
        resolve(null);
      }
    });
  }

	async one_image_upload(tobeSubmit) {
    try {
      console.log('one_image_upload: 开始上传图片');
      const data = await this.httpClient.post(this.App.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).toPromise();
      
      if (data['status'] === "OK") {
        console.log('one_image_upload: 上传成功');
        this.App.stopLoading(100);
        if (this.is_multiple_image == 1) {
          this.MultipleImageUrl.push(data['result']['img_path']);
        } else {
          if (this.imageUrl != "") {
            this.MultipleImageUrl.push(this.imageUrl);
            this.MultipleImageUrl.push(data['result']['img_path']);
            this.is_multiple_image = 1;
            this.imageUrl = "";
          } else {
            this.imageUrl = data['result']['img_path'];
          }
        }
      } else {
        this.App.stopLoading(100);
        throw new Error(data['message'] || 'Upload failed');
      }
    } catch (error) {
      console.error('one_image_upload: 上传失败', error);
      this.App.stopLoading(100);
      await this.App.presentAlert_default('', "Connection Error", "../../assets/attention2-icon.svg");
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

	async multiple_image_upload(tobeSubmit) {
    try {
      console.log('multiple_image_upload: 开始上传多张图片');
      const data = await this.httpClient.post(this.App.api_url + "/uploadMultipleImage", tobeSubmit, { observe: "body" }).toPromise();
      
      if (data['status'] === "OK") {
        console.log('multiple_image_upload: 上传成功');
        this.App.stopLoading(100);
        if (this.is_multiple_image == 1) {
          let newImageArr = JSON.parse(data['result']['img_path']);
          newImageArr.forEach((imgPath) => {
            this.MultipleImageUrl.push(imgPath);
          });
        } else {
          if (this.imageUrl != "") {
            this.MultipleImageUrl.push(this.imageUrl);
            this.imageUrl = "";
            let newImageArr = JSON.parse(data['result']['img_path']);
            newImageArr.forEach((imgPath) => {
              this.MultipleImageUrl.push(imgPath);
            });
            this.is_multiple_image = 1;
          } else {
            this.MultipleImageUrl = JSON.parse(data['result']['img_path']);
            this.is_multiple_image = 1;
          }
        }
      } else {
        this.App.stopLoading(100);
        throw new Error(data['message'] || 'Upload failed');
      }
    } catch (error) {
      console.error('multiple_image_upload: 上传失败', error);
      this.App.stopLoading(100);
      await this.App.presentAlert_default('', "Connection Error 2", "../../assets/attention2-icon.svg");
    }
  }

	get_multiple_image_testing() {
		let tobeSubmit = {
			account_id: localStorage['login_user_id'],
			token: localStorage['token'],
			imgInfo: "DEMO",
		};

		this.httpClient
			.post(
				this.App.api_url + "/uploadMultipleImage_testing",
				tobeSubmit,
				{ observe: "body" }
			)
			.subscribe(
				(data: any) => {
					if (data["status"] == "OK") {
						this.App.stopLoading(100);
						this.MultipleImageUrl = JSON.parse(
							data["result"]["img_path"]
						);
						this.is_multiple_image = 1;
					} else {
						this.App.stopLoading(100);
						this.App.presentAlert_default(
							"",
							"Error2!. Please try again",
							"../../assets/attention2-icon.svg"
						);
					}
				},
				(error: any) => {
					this.App.stopLoading(100);
					this.App.presentAlert_default(
						"",
						"Connection Error 2",
						"../../assets/attention2-icon.svg"
					);
				}
			);
	}

	get_one_image_testing() {
		let tobeSubmit = {
			account_id: localStorage['login_user_id'],
			token: localStorage['token'],
			imgInfo: "DEMO",
		};

		this.httpClient
			.post(
				this.App.api_url + "/uploadMultipleImage_testing",
				tobeSubmit,
				{ observe: "body" }
			)
			.subscribe(
				(data: any) => {
					if (data["status"] == "OK") {
						this.App.stopLoading(100);
						let haha = JSON.parse(data["result"]["img_path"]);
						this.is_multiple_image = 0;
						this.imageUrl = haha[0];
					} else {
						this.App.stopLoading(100);
						this.App.presentAlert_default(
							"",
							"Error2!. Please try again",
							"../../assets/attention2-icon.svg"
						);
					}
				},
				(error: any) => {
					this.App.stopLoading(100);
					this.App.presentAlert_default(
						"",
						"Connection Error 2",
						"../../assets/attention2-icon.svg"
					);
				}
			);
	}

	delete_img(is_multiple, img_path) {
		console.log(img_path);

		this.alertController
			.create({
				header: "Confirmation",
				message: "Do you want to remove this photo?",
				buttons: [
					{
						text: "Cancel",
						role: "cancel",
						cssClass: "secondary",
						handler: () => {
							console.log("Confirm Cancel");
						},
					},
					{
						text: "Ok",
						handler: (alertData) => {
							if (is_multiple == 0) {
								console.log("Confirm Ok");
								this.imageUrl = "";
							} else if (is_multiple == 1) {
								console.log("Confirm Ok Multiple");
								let index =
									this.MultipleImageUrl.indexOf(img_path);
								if (index !== -1) {
									this.MultipleImageUrl.splice(index, 1);
								}
							}
						},
					},
				],
			})
			.then((alert) => alert.present());
	}

	pickup() {
		let tobeSubmit = {
			created_user_id: localStorage['login_user_id'],
			token: localStorage['token'],
			image: this.imageUrl,
			is_multiple_image: this.is_multiple_image,
			multiple_image: this.MultipleImageUrl,
			delivery_status: this.delivery_status,
			job_id: this.job_id,
      task_id: this.task_id,
			recipient_ic: this.recipient_ic,
			recipient_relation: this.recipient_relation,
			reason_3rdparty: this.reason_3rdparty,
			delivery_remark: this.delivery_remark,
			signature_data: this.signature_data,
			require_recipient_detail: this.require_recipient_detail,
		};

		this.httpClient
			.post(this.App.api_url + "/riderPickupSubmitByTask", tobeSubmit, {
				observe: "body",
			})
			.subscribe(
				(data: any) => {
					if (data["status"] == "OK") {
						this.App.stopLoading(100);
						this.App.presentAlert_default("OK", "Status Updated");
						this.navCtrl.navigateRoot("delivery", {
							animationDirection: "forward",
						});
					} else {
						this.App.stopLoading(100);
						this.App.presentAlert_default(
							"",
							data["result"],
							"../../assets/attention2-icon.svg"
						);
					}
				},
				(error: any) => {
					this.App.stopLoading(100);
					this.App.presentAlert_default(
						"",
						"Connection Error",
						"../../assets/attention2-icon.svg"
					);
				}
			);
	}
}
