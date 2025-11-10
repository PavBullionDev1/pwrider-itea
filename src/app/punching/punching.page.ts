import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { MenuController, AlertController, LoadingController, ActionSheetController, Platform } from '@ionic/angular';
import { AppComponent } from '../app.component';
import { Httprequest } from '../models/httprequest';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ModalController, NavController } from '@ionic/angular';
import { ConfigService } from '../config.service';

@Component({
	selector: 'app-punching',
	templateUrl: './punching.page.html',
	styleUrls: ['./punching.page.scss'],
})
export class PunchingPage implements OnInit {

	constructor(
		public App: AppComponent,
		public httpClient: HttpClient,
		public alertController: AlertController,
		public loadingController: LoadingController,
		public menuCtrl: MenuController,
		private router: Router,
		private platform: Platform,
		private sanitizer: DomSanitizer,
		private navCtrl: NavController,
		private config: ConfigService,
	) {
		this.menuCtrl.swipeGesture(false);
	}

	formData = {
		'selfie' : '',
		'selfieBase64Image' : '',
		'geolocation_lat' : '',
		'geolocation_lng' : '',
		'geolocation_photo' : '',
	};

	gmsakToken = "";

	async ngOnInit() {
		// await this.checkPermissions();
		this.gmsakToken = localStorage['googleApiKey'] || '';
	}

	ionViewWillEnter(){
		this.getGeolocation();
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

	async openCamera() {
		try {
			const options = {
				quality: 80,
				resultType: CameraResultType.Base64,
				source: CameraSource.Camera,
				width: 640,
				allowEditing: false,
				correctOrientation: true,
				saveToGallery: true
			};

			const capturedPhoto = await Camera.getPhoto(options);
			console.log('Photo captured successfully, starting upload...');
			await this.App.presentLoading(100000);

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
			console.log('Starting upload to API:', this.App.api_url + "/uploadImage?need_watermark=1");
			const data = await this.httpClient.post(this.App.api_url + "/uploadImage?need_watermark=1", tobeSubmit, { observe: "body" }).toPromise();
			console.log('Upload response:', data);
			
			if (data['status'] === "OK") {
				this.App.stopLoading(100);
				this.formData.selfie = data['result']['img_path'];
				console.log('Upload successful, image saved to:', data['result']['img_path']);
			} else {
				this.App.stopLoading(100);
				console.error('Upload failed with status:', data['status']);
				await this.App.presentAlert_default('', 'Error!. Please try again', "assets/attention2-icon.svg");
			}
		} catch (error) {
			console.error('Error uploading image:', error);
			this.App.stopLoading(100);
			await this.App.presentAlert_default('', "Connection Error", "assets/attention2-icon.svg");
		}
	}

	getGeolocation(){
		this.App.presentLoading();
		// Use browser native geolocation API for compatibility with Capacitor 3.x and above.
		// Reason: @ionic-native/geolocation is deprecated and may cause version conflicts. navigator.geolocation is supported in all modern browsers and hybrid apps.
		// Example:
		// navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
		this.getCurrentPosition().then((resp) => {
			this.loadingController.dismiss();
			this.formData.geolocation_lat = resp.latitude.toString();
			this.formData.geolocation_lng = resp.longitude.toString();
			let deviceLatLng = this.formData.geolocation_lat + "," + this.formData.geolocation_lng;
			this.formData.geolocation_photo =
				"https://maps.googleapis.com/maps/api/staticmap?center=" + deviceLatLng +
				"&zoom=17" + "&size=250x250" +
				"&markers=color:blue%7Clabel:U%7C" + deviceLatLng+
				"&key=" + this.gmsakToken;
		}).catch((error) => {
			//this.App.presentAlert_default('ERROR', error, "assets/attention-icon.svg");
			this.App.presentAlert_default('ERROR', 'Make sure your GPS is open', "assets/attention-icon.svg");
			console.log('Error getting location', error);
		});
	}

	confirm_submit_now() {
		this.alertController.create({
			header: 'Confirmation',
			message: 'Do you want to clock in now?',
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
					this.submit_now();
				}
			}]
		}).then(alert => alert.present());
	}

	submit_now(){
		this.App.presentLoading();

		this.httpClient.post(this.App.api_url + "/punched_log/rider_make_punching/" + localStorage['login_user_id'] + '/' + localStorage['token'],this.formData, { observe: "body" }).subscribe((data: any) => {

			this.App.stopLoading();

			if (data.status == "OK") {
				this.App.presentAlert_default('OK', "Status Updated");
				this.navCtrl.navigateRoot('punch-card', { animationDirection: 'forward' });
			} else {
				this.App.presentAlert_default('ERROR', data['result'], "assets/attention2-icon.svg");
			}

		}, error => {
			this.App.stopLoading();
			this.App.presentAlert_default('ERROR', "Connection Error", "assets/attention2-icon.svg");
		});
	}

	onSwipeLeft(event: any) {
		// 实现左滑功能
		console.log('Swipe left detected', event);
	}
}
