import { Location } from "@angular/common";
import { HttpClient, HttpRequest } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ModalController, NavController } from '@ionic/angular';
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
import { RiderJobDetails } from "../models/common-interfaces";
import { Camera, CameraResultType, CameraSource, GalleryPhoto, Photo } from '@capacitor/camera';
import { NativeAdapterService } from '../services/native-adapter.service';

@Component({
	selector: "app-pickup-detail",
	templateUrl: "./pickup-detail.page.html",
	styleUrls: ["./pickup-detail.page.scss"],
	providers: [NativeAdapterService]
})
export class PickupDetailPage implements OnInit {
	@ViewChild("autofocus", { static: false }) searchbar: IonSearchbar;

	job_id = this.route.snapshot.paramMap.get("job_id");
	mode = "home";
	stepMode = "noSelect";
	find = "";
	viewMode = "empty";
	userList: any[] = [];
	statusList: any[] = [];
	riderList: RiderJobDetails = {};
	delivery_status = 0;
	is_multiple_image = 0;
	imageUrl = '';
	MultipleImageUrl: string[] = [];

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
		private nativeAdapter: NativeAdapterService,
	) {
		this.menuCtrl.swipeGesture(false);

		// this.route.params.subscribe(params => {
		//   this.riderList = params;
		//   console.log(this.riderList);
		// })

	}

	//   ionViewWillEnter() {
	//     setTimeout(() => this.searchbar.setFocus(), 0);
	//   }

	async ngOnInit() {
		this.getPickUpDetails();
		//this.get_multiple_image_testing();
		//this.get_one_image_testing();
		
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

	getPickUpDetails() {
		this.App.presentLoading();
		this.httpClient
			.get(
				this.App.api_url + "/appGetPickUpDetails/" + this.job_id + "/" + localStorage['token'])
			.subscribe(
				(data: any) => {
					this.loadingController.dismiss();
					this.riderList = data.result["jobDetails"];
					this.statusList = data.result['statusList'];
				},
				(error) => {
					this.loadingController.dismiss();

					console.log(error);
				}
			);
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
				text: 'Upload multiple image',
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
			console.log("openCamera starting with source:", sourceType);

			let options = {
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
				console.error('No base64String in captured photo');
			}
		} catch (error) {
			console.error('Error capturing photo:', error);
			this.App.stopLoading(100);
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
				this.App.presentLoading(100000);

				let imageResponse = [];
				
				if (capturedPhotos.photos.length > 0) {
					for (const photo of capturedPhotos.photos) {
						const base64Data = await this.readAsBase64(photo);
						imageResponse.push(base64Data.split(',')[1]);
					}
					await this.api_upload_multiple_image(imageResponse);
				} else {
					this.App.stopLoading(100);
				}
			} catch (error) {
				console.error('Error picking images:', error);
				this.App.stopLoading(100);
			}
		} else {
			let input = document.createElement('input');
			input.type = 'file';
			input.accept = "image/*";
			input.multiple = true;
			input.click();
			input.onchange = async () => {
				try {
					this.App.presentLoading(100000);
					let file = input.files[0];
					let reader = new FileReader();
					reader.readAsDataURL(file);
					reader.onload = async () => {
						let imgInfo = reader.result.toString().split(',')[1];
						await this.api_upload_image(imgInfo);
					};
					reader.onerror = (error) => {
						console.error('Error reading file:', error);
						this.App.stopLoading(100);
					};
				} catch (error) {
					console.error('Error processing file:', error);
					this.App.stopLoading(100);
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

	async one_image_upload(tobeSubmit: any) {
		try {
			console.log('Starting upload to API:', this.App.api_url + "/uploadImage");
			const data = await this.httpClient.post(this.App.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).toPromise();
			console.log('Upload response:', data);
			
			if (data['status'] === "OK") {
				this.App.stopLoading(100);
				this.imageUrl = data['result']['img_path'];
				this.is_multiple_image = 0;
				console.log('Upload successful, image saved to:', data['result']['img_path']);
			} else {
				this.App.stopLoading(100);
				console.error('Upload failed with status:', data['status']);
				this.App.presentAlert_default('', 'Error!. Please try again', "assets/attention2-icon.svg");
			}
		} catch (error) {
			console.error('Error uploading image:', error);
			this.App.stopLoading(100);
			this.App.presentAlert_default('', "Connection Error", "assets/attention2-icon.svg");
		}
	}

	async api_upload_multiple_image(imgInfo) {
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
			console.log('Starting multiple image upload to API:', this.App.api_url + "/uploadMultipleImage");
			const data = await this.httpClient.post(this.App.api_url + "/uploadMultipleImage", tobeSubmit, { observe: "body" }).toPromise();
			console.log('Multiple upload response:', data);
			
			if (data['status'] === "OK") {
				this.App.stopLoading(100);
				this.MultipleImageUrl = JSON.parse(data['result']['img_path']);
				this.is_multiple_image = 1;
				console.log('Multiple upload successful, images saved:', this.MultipleImageUrl);
			} else {
				this.App.stopLoading(100);
				console.error('Multiple upload failed with status:', data['status']);
				this.App.presentAlert_default('', 'Error2!. Please try again', "assets/attention2-icon.svg");
			}
		} catch (error) {
			console.error('Error uploading multiple images:', error);
			this.App.stopLoading(100);
			this.App.presentAlert_default('', "Connection Error 2", "assets/attention2-icon.svg");
		}
	}

	//testing get multiple image
	get_multiple_image_testing() {

		let tobeSubmit = {
			'account_id': localStorage['login_user_id'],
			'token': localStorage['token'],
			'imgInfo': "DEMO",
		};


		this.httpClient.post(this.App.api_url + "/uploadMultipleImage_testing", tobeSubmit, { observe: "body" }).subscribe((data) => {
			if (data['status'] == "OK") {
				this.App.stopLoading(100);
				this.MultipleImageUrl = JSON.parse(data['result']['img_path']);
				this.is_multiple_image = 1;

			} else {
				this.App.stopLoading(100);
				this.App.presentAlert_default('', 'Error2!. Please try again', "assets/attention2-icon.svg");
			}
		}, error => {
			this.App.stopLoading(100);
			this.App.presentAlert_default('', "Connection Error 2", "assets/attention2-icon.svg");
		});
	}

	//testing get one image
	get_one_image_testing() {

		let tobeSubmit = {
			'account_id': localStorage['login_user_id'],
			'token': localStorage['token'],
			'imgInfo': "DEMO",
		};


		this.httpClient.post(this.App.api_url + "/uploadMultipleImage_testing", tobeSubmit, { observe: "body" }).subscribe((data) => {
			if (data['status'] == "OK") {
				this.App.stopLoading(100);
				let haha = JSON.parse(data['result']['img_path']);
				this.is_multiple_image = 0;
				this.imageUrl = haha[0];

			} else {
				this.App.stopLoading(100);
				this.App.presentAlert_default('', 'Error2!. Please try again', "assets/attention2-icon.svg");
			}
		}, error => {
			this.App.stopLoading(100);
			this.App.presentAlert_default('', "Connection Error 2", "assets/attention2-icon.svg");
		});
	}

	delete_img(is_multiple, img_path) {
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

					if (is_multiple == 0) {
						console.log('Confirm Ok');
						this.imageUrl = '';
					} else if (is_multiple == 1) {
						console.log('Confirm Ok Multiple');
						let index = this.MultipleImageUrl.indexOf(img_path);
						if (index !== -1) {
							this.MultipleImageUrl.splice(index, 1);
						}

					}

				}
			}]
		}).then(alert => alert.present());
	}

	pickup() {
		this.App.presentLoading(5000);

		console.log(this.delivery_status);
		let tobeSubmit = {
			'created_user_id': localStorage['login_user_id'],
			'token': localStorage['token'],
			'image': this.imageUrl,
			'is_multiple_image': this.is_multiple_image,
			'multiple_image': this.MultipleImageUrl,
			'delivery_status': this.delivery_status,
			'job_id': this.job_id,
		};

		this.httpClient.post(this.App.api_url + "/riderPickupSubmit", tobeSubmit, { observe: "body" }).subscribe((data) => {
			console.log(data);
			if (data['status'] == "OK") {
				this.App.stopLoading(100);
				this.App.presentAlert_default('OK', "Status Updated");
				this.navCtrl.navigateRoot('pickup', { animationDirection: 'forward' });

			} else {
				this.App.stopLoading(100);
				this.App.presentAlert_default('', data['result'], "assets/attention2-icon.svg");
			}
		}, error => {
			this.App.stopLoading(100);
			this.App.presentAlert_default('', "Connection Error", "assets/attention2-icon.svg");
		});

	}

}
