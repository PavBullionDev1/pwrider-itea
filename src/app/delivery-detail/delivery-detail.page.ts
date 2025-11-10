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
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { ModalController, NavController } from "@ionic/angular";
import { ModalSignaturePage } from "../modal-signature/modal-signature.page";

@Component({
	selector: "app-delivery-detail",
	templateUrl: "./delivery-detail.page.html",
	styleUrls: ["./delivery-detail.page.scss"],
})
export class DeliveryDetailPage implements OnInit {
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

	job_id = this.route.snapshot.paramMap.get("job_id");
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
		await this.App.presentAlert_default(
			'Error',
			`Failed to ${context}: ${error.message || 'An error occurred.'}`,
			"../../assets/attention2-icon.svg"
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
			console.log('Photo captured successfully, starting upload...');
			this.App.presentLoading(100000);

			if (capturedPhoto.base64String) {
				await this.api_upload_image(capturedPhoto.base64String);
			} else {
				this.App.stopLoading(100);
				await this.showErrorAlert(new Error('No image data'), 'capture photo');
			}
		} catch (error) {
			console.error('Error capturing photo:', error);
			this.App.stopLoading(100);
			await this.showErrorAlert(error, 'capture photo');
		}
	}

	getPickUpDetails() {
		this.App.presentLoading();
		this.httpClient
			.get(
				this.App.api_url +
					"/appGetPickUpDetails/" +
					this.job_id +
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

	async getImages() {
		try {
			const options = {
				quality: 80,
				resultType: CameraResultType.Base64,
				source: CameraSource.Photos,
				width: 640,
				correctOrientation: true
			};

			const photos = await Camera.pickImages({
				...options,
				limit: 10
			});
			
			if (photos.photos.length > 0) {
				await this.App.presentLoading(100000);

				const imageResponse = [];
				for (const photo of photos.photos) {
					try {
						const photoData = await Camera.getPhoto({
							quality: 80,
							resultType: CameraResultType.Base64,
							source: CameraSource.Photos
						});
						
						if (photoData.base64String) {
							imageResponse.push(photoData.base64String);
						}
					} catch (photoError) {
						console.error('Error processing photo:', photoError);
					}
				}

				if (imageResponse.length > 0) {
					await this.api_upload_multiple_image(imageResponse);
				} else {
					await this.showErrorAlert(new Error('No images selected'), 'select photos');
				}
			}
		} catch (error) {
			console.error('Error selecting photos:', error);
			await this.showErrorAlert(error, 'select photos');
		} finally {
			await this.App.stopLoading(100);
		}
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

	api_upload_image(imgInfo) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				async (position) => {
					const myLocation = {
						latitude: position.coords.latitude,
						longitude: position.coords.longitude,
					};
					const tobeSubmit = {
						account_id: localStorage['login_user_id'],
						token: localStorage['token'],
						imgInfo: imgInfo,
						need_watermark: 1,
						location: myLocation,
					};
					await this.one_image_upload(tobeSubmit);
				},
				async (error: any) => {
					console.error(error);
					const tobeSubmit = {
						account_id: localStorage['login_user_id'],
						token: localStorage['token'],
						imgInfo: imgInfo,
						need_watermark: 1,
					};
					await this.one_image_upload(tobeSubmit);
				}
			);
		} else {
			const tobeSubmit = {
				account_id: localStorage['login_user_id'],
				token: localStorage['token'],
				imgInfo: imgInfo,
				need_watermark: 1,
			};
			this.one_image_upload(tobeSubmit);
		}
	}

	async one_image_upload(tobeSubmit) {
		try {
			console.log('Starting upload to API:', this.App.api_url + "/uploadImage");
			const data = await this.httpClient.post(this.App.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).toPromise();
			console.log('Upload response:', data);
			
			if (data['status'] === "OK") {
				this.App.stopLoading(100);
				if (this.is_multiple_image === 1) {
					this.MultipleImageUrl.push(data['result']['img_path']);
						} else {
					if (this.imageUrl !== "") {
								this.MultipleImageUrl.push(this.imageUrl);
						this.MultipleImageUrl.push(data['result']['img_path']);
								this.is_multiple_image = 1;
								this.imageUrl = "";
							} else {
						this.imageUrl = data['result']['img_path'];
							}
						}
				console.log('Upload successful, image saved to:', data['result']['img_path']);
					} else {
				this.App.stopLoading(100);
				console.error('Upload failed with status:', data['status']);
				await this.App.presentAlert_default("", "Error!. Please try again", "../../assets/attention2-icon.svg");
					}
		} catch (error) {
			await this.App.stopLoading(100);
			await this.App.presentAlert_default("", "Connection Error", "../../assets/attention2-icon.svg");
				}
	}

	async api_upload_multiple_image(imgInfo) {
		try {
			let tobeSubmit;
		if (navigator.geolocation) {
				const position = await this.getCurrentPosition();
				tobeSubmit = {
					account_id: localStorage['login_user_id'],
					token: localStorage['token'],
					imgInfo: imgInfo,
					need_watermark: 1,
					location: position
				};
			} else {
				tobeSubmit = {
						account_id: localStorage['login_user_id'],
						token: localStorage['token'],
						imgInfo: imgInfo,
						need_watermark: 1,
					};
			}
			await this.multiple_image_upload(tobeSubmit);
		} catch (error) {
			console.error('Error in api_upload_multiple_image:', error);
			const tobeSubmit = {
				account_id: localStorage['login_user_id'],
				token: localStorage['token'],
				imgInfo: imgInfo,
				need_watermark: 1,
			};
			await this.multiple_image_upload(tobeSubmit);
		}
	}

	private getCurrentPosition(): Promise<{latitude: number, longitude: number} | null> {
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
					(error: any) => {
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

	async multiple_image_upload(tobeSubmit) {
		try {
			const data = await this.httpClient.post(this.App.api_url + "/uploadMultipleImage", tobeSubmit, { observe: "body" }).toPromise();
			
			if (data['status'] === "OK") {
				await this.App.stopLoading(100);

				if (this.is_multiple_image === 1) {
					const newImageArr = JSON.parse(data['result']['img_path']);
					this.MultipleImageUrl.push(...newImageArr);
						} else {
					if (this.imageUrl !== "") {
								this.MultipleImageUrl.push(this.imageUrl);
								this.imageUrl = "";
						const newImageArr = JSON.parse(data['result']['img_path']);
						this.MultipleImageUrl.push(...newImageArr);
								this.is_multiple_image = 1;
							} else {
						this.MultipleImageUrl = JSON.parse(data['result']['img_path']);
								this.is_multiple_image = 1;
							}
						}
					} else {
				await this.App.stopLoading(100);
				await this.App.presentAlert_default("", "Error!. Please try again", "../../assets/attention2-icon.svg");
					}
		} catch (error) {
			await this.App.stopLoading(100);
			await this.App.presentAlert_default("", "Connection Error", "../../assets/attention2-icon.svg");
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
		// this.App.presentLoading(5000);

		let tobeSubmit = {
			created_user_id: localStorage['login_user_id'],
			token: localStorage['token'],
			image: this.imageUrl,
			is_multiple_image: this.is_multiple_image,
			multiple_image: this.MultipleImageUrl,
			delivery_status: this.delivery_status,
			job_id: this.job_id,
			recipient_ic: this.recipient_ic,
			recipient_relation: this.recipient_relation,
			reason_3rdparty: this.reason_3rdparty,
			delivery_remark: this.delivery_remark,
			signature_data: this.signature_data,
			require_recipient_detail: this.require_recipient_detail,
		};

		this.httpClient
			.post(this.App.api_url + "/riderPickupSubmit", tobeSubmit, {
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
