import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Httprequest } from "../models/httprequest";
import { HttpClient } from "@angular/common/http";
import { AppComponent } from "../app.component";
import {
	ActionSheetController,
	AlertController,
	LoadingController,
	MenuController,
	NavController,
	Platform,
	ModalController,
} from "@ionic/angular";
import { NativeAdapterService } from '../services/native-adapter.service';
import { ModalSignaturePage } from "../modal-signature/modal-signature.page";

@Component({
	selector: "app-batch-scan",
	templateUrl: "./batch-scan.page.html",
	styleUrls: ["./batch-scan.page.scss"],
	providers: [NativeAdapterService],
})
export class BatchScanPage implements OnInit {
	signature_data: any;

	constructor(
		public httpClient: HttpClient,
		private nativeAdapter: NativeAdapterService,
		private router: Router,
		public App: AppComponent,
		public loadingController: LoadingController,
		public actionSheetController: ActionSheetController,
		private platform: Platform,
		private navCtrl: NavController,
		public alertController: AlertController,
		public modalController: ModalController
	) {}

	riderList: any[] = [];
	statusList: any[] = [];
	relationSettingsList: any[] = [];
	passreasonSettingsList: any[] = [];
	delivery_status = 0;
	MultipleImageUrl: any[] = [];
	is_multiple_image = 0;
	imageUrl = "";
	recipient_ic = "";
	recipient_relation = "";
	reason_3rdparty = "";
	delivery_remark = "";
	require_recipient_detail = 0;

	ngOnInit() {
		console.log(this.riderList);
		this.getRiderSetting();
	}

	async scanBarcode() {
		this.App.presentLoading();
		try {
			const barcodeData = await this.nativeAdapter.scanBarcode();
			console.log(barcodeData["text"]);
				this.httpClient
					.get(
						this.App.api_url +
							"/getRiderJobDetails2/" +
							localStorage['login_user_id'] +
							"/" +
							localStorage['token'] +
							"/" +
							barcodeData["text"],
						{ observe: "body" }
					)
					.subscribe(
						(data: any) => {
							if (data.status == "OK") {
								this.loadingController.dismiss();
								console.log(data.result);

								const jobDetails = data.result["jobDetails"];

								//check if parcel already added
								if (
									this.riderList.some(
										(list) =>
											list.sales_order_id ===
											jobDetails.sales_order_id
									)
								) {
									this.App.presentAlert_default(
										"ERROR",
										`Parcel already scanned.`,
										"../../assets/attention2-icon.svg"
									);
								} else {
									this.riderList.push(jobDetails);
								}

								if (
									this.statusList.length <= 0 &&
									this.relationSettingsList.length <= 0 &&
									this.passreasonSettingsList.length <= 0
								) {
									this.statusList = data.result["statusList"];
									this.relationSettingsList =
										data.result["relationSettingsList"];
									this.passreasonSettingsList =
										data.result["passreasonSettingsList"];
								}

								console.log(this.riderList);
							} else {
								this.App.presentAlert_default(
									"ERROR",
									data["result"],
									"../../assets/attention2-icon.svg"
								);
							}
						},
						(error) => {
							this.App.presentAlert_default(
								"ERROR",
								"Connection Error",
								"../../assets/attention2-icon.svg"
							);
						}
					);
		} catch (err) {
			this.loadingController.dismiss();
			console.log("Error", err);
		}
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
				(error) => {
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
						this.openCamera('camera');
					},
				},
				{
					text: "Select From Gallery",
					role: "gallery",
					icon: "images-outline",
					handler: () => {
						this.openCamera('gallery');
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
					// icon: 'close',
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
			componentProps: {
				// 'salesorder_id': this.salesorder_id,
				// 'type':'onboarding',
			},
			backdropDismiss: false,
			// initialBreakpoint(1是直接開完, 0.5是開一半); breakpoints是可以給user手動調高度的參數
			// https://ionicframework.com/docs/api/modal#breakpoints
			// initialBreakpoint: 0.5,
			// breakpoints: [0.5, 0.8, 1],
		});
		await modal.present();

		modal.onDidDismiss().then((data) => {
			this.signature_data = data.data;
			console.log("this.signature_data", this.signature_data);
		});
	}

	async openCamera(sourceType: string) {
		console.log("openCamera");
		console.log(sourceType);

		let options = {
			quality: 80,
			allowEdit: false,
			correctOrientation: true,
			targetWidth: 640,
			sourceType: sourceType === 'camera' ? 'camera' : 'gallery'
		};

		try {
			console.log("taking picture");
			const imagePath = await this.nativeAdapter.takePicture(options);
			console.log("getPicture");
			this.App.presentLoading(100000);

			await this.nativeAdapter.setStatusBarStyle('default');

			// let imgInfo = 'data:image/jpeg;base64,' + imagePath;
			let imgInfo = imagePath;
			console.log("imgInfo");
			console.log(imgInfo);

			this.api_upload_image(imgInfo);
		} catch (err) {
			console.log(err);
		}
	}

	async getImages() {
		let options = {
			maximumImagesCount: 10,
			width: 640,
			quality: 80
		};

		try {
			console.log("selecting images");

			let imageResponse = [];

			const results = await this.nativeAdapter.selectImages(options);
			this.App.presentLoading(100000);

			await this.nativeAdapter.setStatusBarStyle('default');

			for (var i = 0; i < results.length; i++) {
				imageResponse.push(results[i]);
			}
			this.api_upload_multiple_image(imageResponse);
		} catch (err) {
			console.log(err);
		}
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

	api_upload_image(imgInfo) {

		if (navigator.geolocation) {
		  navigator.geolocation.getCurrentPosition(
			 (position) => {
			  const myLocation = {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude
			  };
			  let tobeSubmit = {
				'account_id': localStorage['login_user_id'],
				'token': localStorage['token'],
				'imgInfo': imgInfo,
				'need_watermark': 1,
				'location': myLocation
			  };
			  this.one_image_upload(tobeSubmit);
			},
			(error) => {
			  console.error(error);
			}
		  );
		}else{
		  let tobeSubmit = {
			'account_id': localStorage['login_user_id'],
			'token': localStorage['token'],
			'imgInfo': imgInfo,
			'need_watermark': 1,
		  };
		  this.one_image_upload(tobeSubmit);
		}
		//this.showLoading();
	  }

	one_image_upload(tobeSubmit) {
		this.httpClient
			.post(this.App.api_url + "/uploadImage", tobeSubmit, {
				observe: "body",
			})
			.subscribe(
				(data) => {
					if (data["status"] == "OK") {
						this.App.stopLoading(100);
						// this.imageUrl = data["result"]["img_path"];
						// this.is_multiple_image = 0;
						if(this.is_multiple_image == 1){
							this.MultipleImageUrl.push(data["result"]["img_path"]);
						}else{
							if(this.imageUrl != ''){
								this.MultipleImageUrl.push(this.imageUrl);
								this.MultipleImageUrl.push(data["result"]["img_path"]);
								this.is_multiple_image = 1;
								this.imageUrl = '';
							}else{
								this.imageUrl = data["result"]["img_path"];
								this.is_multiple_image = 0;
							}
						}
					} else {
						this.App.stopLoading(100);
						this.App.presentAlert_default(
							"",
							"Error!. Please try again",
							"../../assets/attention2-icon.svg"
						);
					}
				},
				(error) => {
					this.App.stopLoading(100);
					this.App.presentAlert_default(
						"",
						"Connection Error",
						"../../assets/attention2-icon.svg"
					);
				}
			);
	}

	api_upload_multiple_image(imgInfo) {

		if (navigator.geolocation) {
		  navigator.geolocation.getCurrentPosition(
			 (position) => {
			  const myLocation = {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude
			  };
			  let tobeSubmit = {
				'account_id': localStorage['login_user_id'],
				'token': localStorage['token'],
				'imgInfo': imgInfo,
				'need_watermark': 1,
				'location': myLocation
			  };
			  this.multiple_image_upload(tobeSubmit);
			},
			(error) => {
			  console.error(error);
			}
		  );
		}else{
		  let tobeSubmit = {
			'account_id': localStorage['login_user_id'],
			'token': localStorage['token'],
			'imgInfo': imgInfo,
			'need_watermark': 1,
		  };
		  this.multiple_image_upload(tobeSubmit);
		}

	  }

	  multiple_image_upload(tobeSubmit) {

		this.httpClient
			.post(this.App.api_url + "/uploadMultipleImage", tobeSubmit, {
				observe: "body",
			})
			.subscribe(
				(data) => {
					if (data["status"] == "OK") {
						this.App.stopLoading(100);
						/*
						this.MultipleImageUrl = JSON.parse(
							data["result"]["img_path"]
						);
						this.is_multiple_image = 1;
						*/
						if(this.is_multiple_image == 1){
							let newImageArr = JSON.parse( data["result"]["img_path"]);

							newImageArr.forEach((imgPath) => {
								this.MultipleImageUrl.push(imgPath);
							})
						}else{
							if(this.imageUrl != ''){
								this.MultipleImageUrl.push(this.imageUrl);
								this.imageUrl = '';

								let newImageArr = JSON.parse( data["result"]["img_path"]);

								newImageArr.forEach((imgPath) => {
									this.MultipleImageUrl.push(imgPath);
								})
								this.is_multiple_image = 1;
							}else{
								this.MultipleImageUrl = JSON.parse(
									data["result"]["img_path"]
								);
								this.is_multiple_image = 1;
							}
						}
					} else {
						this.App.stopLoading(100);
						this.App.presentAlert_default(
							"",
							"Error2!. Please try again",
							"../../assets/attention2-icon.svg"
						);
					}
				},
				(error) => {
					this.App.stopLoading(100);
					this.App.presentAlert_default(
						"",
						"Connection Error 2",
						"../../assets/attention2-icon.svg"
					);
				}
			);
	}

	removeParcel(index: number) {
		if (index !== -1 && index < this.riderList.length) {
			this.riderList.splice(index, 1);
		}
	}

	confirm() {
		this.App.presentLoading(5000);

		console.log(this.delivery_status);
		let tobeSubmit = {
			created_user_id: localStorage['login_user_id'],
			token: localStorage['token'],
			image: this.imageUrl,
			is_multiple_image: this.is_multiple_image,
			multiple_image: this.MultipleImageUrl,
			delivery_status: this.delivery_status,
			job_ids: [],
			recipient_ic: this.recipient_ic,
			recipient_relation: this.recipient_relation,
			reason_3rdparty: this.reason_3rdparty,
			delivery_remark: this.delivery_remark,
			signature_data: this.signature_data,
			require_recipient_detail: this.require_recipient_detail
		};

		this.riderList.forEach((list) => {
			tobeSubmit["job_ids"].push(list.sales_order_id);
		});

		this.httpClient
			.post(this.App.api_url + "/riderPickupSubmit3", tobeSubmit, {
				observe: "body",
			})
			.subscribe(
				(data) => {
					if (data["status"] == "OK") {
						this.App.stopLoading(100);
						this.App.presentAlert_default("OK", "Status Updated");
						this.navCtrl.navigateRoot("pickup", {
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
				(error) => {
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
