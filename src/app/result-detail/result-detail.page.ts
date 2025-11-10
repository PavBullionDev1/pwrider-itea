import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	ActionSheetController,
	AlertController,
	LoadingController,
	MenuController,
	NavController,
	Platform,
	ModalController
} from "@ionic/angular";
import { AppComponent } from "../app.component";
import { Httprequest } from "../models/httprequest";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalSignaturePage } from "../modal-signature/modal-signature.page";

@Component({
	selector: "app-result-detail",
	templateUrl: "./result-detail.page.html",
	styleUrls: ["./result-detail.page.scss"],
})
export class ResultDetailPage implements OnInit {
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
		private navCtrl: NavController,
		public modalController: ModalController
	) {}

	sales_order_id = this.route.snapshot.paramMap.get("sales_order_id");
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
	camera_mode = 0;

	async ngOnInit() {
		// await this.checkPermissions();
		this.getSalesorderDetails();
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
			await this.presentErrorAlert('Error', 'Failed to get camera permissions');
		}
	}

	async presentErrorAlert(header: string, message: string | boolean) {
		const errorMessage = typeof message === 'boolean' ? 'An error occurred.' : message.toString();
		const alert = await this.alertController.create({
			header: header,
			message: errorMessage,
			buttons: ['OK']
		});
		await alert.present();
	}

	getSalesorderDetails() {
		this.App.presentLoading();
		this.httpClient
			.get(
				this.App.api_url +
					"/appSalesorderDetails/" +
					this.sales_order_id +
					"/" +
					localStorage['token']
			)
			.subscribe(
				(data: any) => {
					this.loadingController.dismiss();
					this.riderList = data.result["jobDetails"];
					this.statusList = data.result["statusList"];
					this.relationSettingsList =
						data.result["relationSettingsList"];
					this.passreasonSettingsList =
						data.result["passreasonSettingsList"];
				},
				(error: any) => {
					this.loadingController.dismiss();
					console.error(error);
				}
			);
	}

	getRiderSetting() {
		this.App.presentLoading();
		this.httpClient
			.get(
				this.App.api_url +
					"/getRiderSetting/" +
					localStorage['token']
			)
			.subscribe(
				(data: any) => {
					this.loadingController.dismiss();
					this.require_recipient_detail = data.result["require_recipient_detail"];
				},
				(error: any) => {
					this.loadingController.dismiss();
					console.error(error);
				}
			);
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
		});
	}

	async openActionSheet(type) {
		const actionSheet = await this.actionSheetController.create({
			cssClass: "my-custom-class",
			buttons: [
				{
					text: "Camera（Single Image）",
					role: "camera",
					icon: "camera",
					handler: () => {
						this.camera_mode = 0;
						this.openCamera(CameraSource.Camera);
					},
				},
				{
					text: "Camera(Multiple Image)",
					role: "camera",
					icon: "camera",
					handler: () => {
						this.camera_mode = 1;
						this.openCamera(CameraSource.Camera);
					},
				},
				{
					text: "Upload From Gallery",
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
				saveToGallery: true
			};

			const capturedPhoto = await Camera.getPhoto(options);
			console.log('Photo captured successfully, starting upload...');
			this.App.presentLoading(100000);

			if (capturedPhoto.base64String) {
				await this.api_upload_image(capturedPhoto.base64String);
			} else {
				this.App.stopLoading(100);
				await this.presentErrorAlert('Error', 'Failed to capture photo');
			}
		} catch (error) {
			console.error('Error capturing photo:', error);
			this.App.stopLoading(100);
			await this.presentErrorAlert('Error', 'Failed to capture photo: ' + error.message);
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
				console.log('Images picked successfully, starting upload...');
				this.App.presentLoading(100000);

				const imageResponse: any[] = [];
				for (const photo of result.photos) {
					const base64Data = await this.readAsBase64(photo);
					imageResponse.push(base64Data.split(',')[1]);
				}
				
				await this.api_upload_multiple_image(imageResponse);
			} catch (error) {
				console.error('Error picking images:', error);
				this.App.stopLoading(100);
				await this.presentErrorAlert('Error', 'Failed to pick images');
			}
		} else {
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = "image/*";
			input.multiple = true;
			input.click();
			
			input.onchange = async () => {
				try {
					this.App.presentLoading(10000);

					const file = input.files[0];
					if (!file) {
						this.App.stopLoading(100);
						return;
					}
					const base64Data = await this.readFileAsBase64(file);
					await this.api_upload_image(base64Data.split(',')[1]);
				} catch (error) {
					console.error('Error reading file:', error);
					this.App.stopLoading(100);
					await this.presentErrorAlert('Error', 'Failed to read file');
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

	async one_image_upload(tobeSubmit: any) {
		try {
			console.log('Starting image upload...');
			const data = await this.httpClient.post(this.App.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).toPromise();
			console.log('Upload response received:', data);
			this.App.stopLoading(100);

			if (data['status'] === "OK") {
				console.log('Upload successful, updating image URLs...');
				if(this.is_multiple_image === 1) {
					this.MultipleImageUrl.push(data['result']['img_path']);
				} else {
					if(this.imageUrl !== '') {
						this.MultipleImageUrl.push(this.imageUrl);
						this.MultipleImageUrl.push(data['result']['img_path']);
						this.is_multiple_image = 1;
						this.imageUrl = '';
					} else {
						this.imageUrl = data['result']['img_path'];
						this.is_multiple_image = 0;
					}
				}
				if(this.camera_mode === 1) {
					await this.openCamera(CameraSource.Camera);
				}
			} else {
				throw new Error(data['message'] || 'Upload failed');
			}
		} catch (error) {
			console.error('Error uploading image:', error);
			this.App.stopLoading(100);
			await this.presentErrorAlert('Error', 'Failed to upload image');
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
			console.log('Starting multiple image upload...');
			const data = await this.httpClient.post(this.App.api_url + "/uploadMultipleImage", tobeSubmit, { observe: "body" }).toPromise();
			console.log('Multiple upload response received:', data);
			this.App.stopLoading(100);

			if (data['status'] === "OK") {
				console.log('Multiple upload successful, updating image URLs...');
				if(this.is_multiple_image === 1) {
					const newImageArr = JSON.parse(data['result']['img_path']);
					this.MultipleImageUrl = this.MultipleImageUrl.concat(newImageArr);
				} else {
					if(this.imageUrl !== '') {
						this.MultipleImageUrl.push(this.imageUrl);
						this.imageUrl = '';
						const newImageArr = JSON.parse(data['result']['img_path']);
						this.MultipleImageUrl = this.MultipleImageUrl.concat(newImageArr);
						this.is_multiple_image = 1;
					} else {
						this.MultipleImageUrl = JSON.parse(data['result']['img_path']);
						this.is_multiple_image = 1;
					}
				}
			} else {
				throw new Error(data['message'] || 'Upload failed');
			}
		} catch (error) {
			console.error('Error uploading multiple images:', error);
			this.App.stopLoading(100);
			await this.presentErrorAlert('Error', 'Failed to upload images');
		}
	}

	async delete_img(is_multiple: number, img_path: string) {
		const alert = await this.alertController.create({
			header: 'Confirmation',
			message: 'Do you want to remove this photo?',
				buttons: [
					{
					text: 'Cancel',
					role: 'cancel',
					cssClass: 'secondary'
					},
					{
					text: 'Ok',
					handler: () => {
						if (is_multiple === 0) {
							this.imageUrl = '';
						} else if (is_multiple === 1) {
							const index = this.MultipleImageUrl.indexOf(img_path);
								if (index !== -1) {
									this.MultipleImageUrl.splice(index, 1);
								}
							}
					}
				}
			]
		});
		await alert.present();
	}

	async pickup() {
		this.App.presentLoading(5000);

		const tobeSubmit = {
			created_user_id: localStorage['login_user_id'],
			token: localStorage['token'],
			image: this.imageUrl,
			is_multiple_image: this.is_multiple_image,
			multiple_image: this.MultipleImageUrl,
			delivery_status: this.delivery_status,
			job_id: this.sales_order_id,
			recipient_ic: this.recipient_ic,
			recipient_relation: this.recipient_relation,
			reason_3rdparty: this.reason_3rdparty,
			delivery_remark: this.delivery_remark,
			signature_data: this.signature_data,
			require_recipient_detail: this.require_recipient_detail,
		};

		try {
			const data = await this.httpClient.post(this.App.api_url + "/riderPickupSubmit2", tobeSubmit, { observe: "body" }).toPromise();
						this.App.stopLoading(100);

			if (data['status'] === "OK") {
				await this.App.presentAlert_default("OK", "Status Updated");
				this.navCtrl.navigateRoot("pickup", { animationDirection: "forward" });
					} else {
				throw new Error(data['result'] || 'Submission failed');
					}
		} catch (error) {
			console.error('Error submitting pickup:', error);
			await this.App.presentAlert_default("", error.message || "Connection Error", "../../assets/attention2-icon.svg");
				}
	}
}
