import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpRequest } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
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
import { ModalController, NavController } from '@ionic/angular';
import { ModalAddChangeRequestPage } from '../modal-add-change-request/modal-add-change-request.page';
import { Big } from 'big.js';

@Component({
	selector: 'app-bullion-add-change-request',
	templateUrl: './bullion-add-change-request.page.html',
	styleUrls: ['./bullion-add-change-request.page.scss'],
	providers: []
})
export class BullionAddChangeRequestPage implements OnInit {

	goods_received_note_detail_id = this.route.snapshot.paramMap.get("goods_received_note_detail_id");
	mode = this.route.snapshot.paramMap.get("mode");
	grnData = [];
	grnDetail = [];
	requestStatusList = [];
	customerBItemTypeList = [];
	customerGoldPurityList = [];

	//for image index
	is_admin = 0;
	total_weight = 0;
	total_XAU = 0;
	gainLoss_status= '';
	camera_mode = 0;

	formData = {
		// Before
		'grnd_id_from': '',
		'gold_name_from': '',
		'gold_type_from': '',
		'gold_pure_id_from': '',
		'gold_pure_percentage_from': '',
		'weight_from': '',
		'XAU_from': '',

		// After
		'ItemList': [],
		'gainLoss_XAU': 0.000,
		'rider_id': '',
		'status': 0,
		'title': {1:false,2:false,3:false},
		'is_gold': '',
	};

	// Image Slide
	slideOpts1 = {
		initialSlide: 0,
		speed: 400,
		slidesPerView: 1,
	};
	slideOpts2 = {
		initialSlide: 0,
		speed: 400,
		slidesPerView: 3,
	};
	takePhotofor: any;
	ShowImageUrl_tng: any;
	SelectedIndex: any = false;
	SelectedType: any = false;

	DisplaySelectIMG: any = [];
	ShowImageUrl_select: any = [];
	selectedIMG_type: any = [];
	GRND_Images: any = [];

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
		public modalController: ModalController,
	) { }

	async ngOnInit() {
		// await this.checkPermissions();
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

	ionViewWillEnter(){
		this.get_grn_data();
	}

	get_grn_data() {
		this.App.presentLoading();
		this.httpClient
			.get(
				this.App.api_url + "/appGetAddChangeRequestData/" + this.goods_received_note_detail_id + "/" + localStorage['token'] + "/" + this.mode)
			.subscribe(
				(data: any) => {

					this.grnData = data.result["grnData"];
					this.grnDetail = data.result["grn_detail"];
					this.GRND_Images = JSON.parse(this.grnDetail['multiple_image']);

					// Before
					this.formData.grnd_id_from = this.grnDetail['goods_received_note_detail_id'];
					this.formData.gold_name_from = this.grnDetail['gold_name'];
					this.formData.gold_type_from = this.grnDetail['item_type_id'];
					this.formData.gold_pure_id_from = this.grnDetail['gold_pure_id'];
					this.formData.gold_pure_percentage_from = this.grnDetail['gold_pure_percentage'];
					this.formData.weight_from = this.grnDetail['weight'];
					this.formData.XAU_from = this.grnDetail['XAU'];
					this.formData.rider_id = this.grnData['user_id'];

					this.customerBItemTypeList = data.result["customerBItemTypeList"];
					this.customerGoldPurityList = data.result["customerGoldPurityList"];

					if(this.mode !== '0'){
						var requestList = data.result["requestList"];
						for (var i = 0; i < requestList.length; i++) {

							if(requestList[i]['parent_id'] == 0){
								var titleArray = requestList[i]['title'].split(',');
								var titles = {1:false,2:false,3:false};

								// Assign keys to the items in the array
								titleArray.forEach((item, index) => {
									if(item == 1){
										titles[1] = true;
									}else if(item == 2){
										titles[2] = true;
									}else if(item == 3){
										titles[3] = true;
									}
								});
								this.formData.title = titles;
								this.formData.gainLoss_XAU = requestList[i]['gainLoss_XAU'];
							}

							requestList[i]['image_list'] = JSON.parse(requestList[i]['image_list']);
							var selectedItem_type_id = this.customerBItemTypeList.filter(gold_type => {
								return gold_type.title == this.grnDetail['item_type'];
							});

							let tmp_item = {
								'grnd_change_request_id': requestList[i]['grnd_change_request_id'],
								'is_gold': requestList[i]['is_gold'],
								'is_editable': 0,
								'gold_name_to': requestList[i]['gold_name_to'],
								'gold_pure_id_to': requestList[i]['gold_pure_id_to'],
								'item_type_id_to': selectedItem_type_id[0]['item_type_id'].toString(),
								'gold_pure_percentage_to': requestList[i]['gold_pure_percentage_to'],
								'weight_to': parseFloat(requestList[i]['weight_to']),
								'XAU_to': requestList[i]['XAU_to'],
								'image_list' : requestList[i]['image_list'],
								'remark': requestList[i]['remark'],
							};
							this.DisplaySelectIMG.push(false);
							this.formData.ItemList.push(tmp_item);
						};
						this.calculateTotal_GainLoss();
					}else{
						// Add a default data
						this.addItem();
					}

					this.requestStatusList = data.result["requestStatusList"];

					this.is_admin = data.result['is_admin'];

				},
				(error) => {
					this.loadingController.dismiss();
					console.log(error);
				}
			);
	}

	addItem() {
		let tmp = {
			'is_gold': '',
			'gold_name_to': '',
			'gold_pure_id_to': '',
			'item_type_id_to': '',
			'gold_pure_percentage_to': 0,
			'weight_to': 0,
			'XAU_to': 0,
			'image_list' : [{'type':0, 'img':''},
							{'type':1, 'img':''},
							{'type':2, 'img':''}],
			'remark': '',
		};
		this.DisplaySelectIMG.push(false);
		this.formData.ItemList.push(tmp);
		this.modify_request(tmp, this.formData.ItemList.length - 1);
	}

	async modify_request(item, index) {

		const modal = await this.modalController.create({
			component: ModalAddChangeRequestPage,
			componentProps: {
				modalData: item,
				modalDataList: this.formData.ItemList,
				selectedIndex: index,
				grnDetail: this.grnDetail,
				customerGoldPurityList: this.customerGoldPurityList,
				customerBItemTypeList: this.customerBItemTypeList,
			},
			backdropDismiss: false,
		});
		await modal.present();

		modal.onDidDismiss().then((data => {
			this.calculateTotal_GainLoss();
		}));

	}

	calculateTotal_GainLoss() {
		this.formData.gainLoss_XAU = this.grnDetail['XAU'];
		let total_change_XAU: number = 0;
		let total_weight = 0;
		this.formData.ItemList.forEach(function (value, key) {
			if(value.is_gold == 1 || value.is_gold == 2){ // is gold
				total_change_XAU = parseFloat((total_change_XAU + parseFloat(value.XAU_to)).toFixed(3));
			}
			total_weight = parseFloat((total_weight + parseFloat(value.weight_to)).toFixed(2));
		});

		this.formData.gainLoss_XAU = parseFloat((total_change_XAU - parseFloat(this.grnDetail['XAU'])).toFixed(3));

		this.formData.gainLoss_XAU = this.no_round_up((this.formData.gainLoss_XAU), 3);

		if (typeof this.grnDetail['weight'] === 'number') {
			var detail_weight = parseFloat(this.grnDetail['weight'].toFixed(2))
		}else{
			var detail_weight = this.grnDetail['weight'];
		}
		this.total_weight = total_weight - detail_weight;

		if(this.formData.gainLoss_XAU > 0){
			this.gainLoss_status = '▲';
		}else if(this.formData.gainLoss_XAU < 0){
			this.gainLoss_status = '▼';
		}else{
			this.gainLoss_status = '■';
		}
	}

	no_round_up(num, rounded) {

		if (rounded == 2) {
			var withDecimals = num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
		}
		if (rounded == 3) {
			var withDecimals = num.toString().match(/^-?\d+(?:\.\d{0,3})?/)[0];
		}
		return withDecimals;
	}

	async openActionSheet(type:any, index:any) {
		this.SelectedIndex = index;
		this.SelectedType = type;

		const actionSheet = await this.actionSheetController.create({
			cssClass: 'my-custom-class',
			buttons: [{
				text: 'Camera（Single Image）',
				role: 'camera',
				icon: 'camera',
				handler: () => {
					this.camera_mode = 0;
					this.openCamera(CameraSource.Camera, false);
				}
			}, {
				text: 'Camera(Multiple Image)',
				role: 'camera',
				icon: 'camera',
				handler: () => {
					this.camera_mode = 1;
					this.openCamera(CameraSource.Camera, true);
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

	async openCamera(sourceType: CameraSource, isMultiple: boolean) {
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
			this.App.presentLoading(100000);

			if (capturedPhoto.base64String) {
				await this.api_upload_images(capturedPhoto.base64String, 0);
			} else {
				await this.presentErrorAlert('Error', 'Failed to capture photo');
			}
		} catch (error) {
			console.error('Error capturing photo:', error);
			await this.presentErrorAlert('Error', 'Failed to capture photo: ' + error.message);
		} finally {
			this.App.stopLoading(100);
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
				this.App.presentLoading(100000);

				const imageResponse = [];
				for (const photo of result.photos) {
					const base64Data = await this.readAsBase64(photo);
					imageResponse.push(base64Data.split(',')[1]);
				}
				await this.api_upload_images(imageResponse, 1);
			} catch (error) {
				console.error('Error picking images:', error);
				await this.presentErrorAlert('Error', 'Failed to pick images');
			} finally {
				this.App.stopLoading(100);
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
					const files = Array.from(input.files);
					if (!files || files.length === 0) {
						await this.App.stopLoading(100);
						return;
					}
					
					const imageResponse = await Promise.all(
						files.map(file => this.readFileAsBase64(file))
					);
					
					const base64Images = imageResponse.map(data => data.split(',')[1]);
					await this.api_upload_images(base64Images, 1);
				} catch (error) {
					console.error('Error reading files:', error);
					await this.presentErrorAlert('Error', 'Failed to read files');
				} finally {
					this.App.stopLoading(100);
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

	async api_upload_images(imgInfo: string | string[], action: number) {
		try {
			const position = await this.getCurrentPosition();
			const tobeSubmit = {
				'account_id': localStorage['login_user_id'],
				'token': localStorage['token'],
				'imgInfo': imgInfo,
				'need_watermark': 1,
				...(position && { location: position })
			};
			await this.upload_images(tobeSubmit, action);
		} catch (error) {
			console.error('Error in api_upload_images:', error);
			const tobeSubmit = {
				'account_id': localStorage['login_user_id'],
				'token': localStorage['token'],
				'imgInfo': imgInfo,
				'need_watermark': 1
			};
			await this.upload_images(tobeSubmit, action);
		}
	}

	async upload_images(tobeSubmit: any, action: number) {
		try {
			const data = await this.httpClient.post(this.App.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).toPromise();
			this.App.stopLoading(100);

			if (data['status'] === "OK") {
				this.formData.ItemList[this.SelectedIndex].image_list[this.SelectedType].img = data['result']['img_path'];

				if(action === 0 && this.camera_mode === 1){
					await this.openCamera(CameraSource.Camera, true);
				}
			} else {
				throw new Error(data['message'] || 'Upload failed');
			}
		} catch (error) {
			console.error('Error uploading images:', error);
			await this.presentErrorAlert('Error', 'Failed to upload images');
		}
	}

	delete_img(type, index) {

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
					this.formData.ItemList[index].image_list[type].img = '';
				}
			}]
		}).then(alert => alert.present());
	}

	submit_now() {
		let tobeSubmit:any = {
			'change_request': this.formData,
			'token': localStorage['token'],
			'mode': this.mode, // insert
		}

		if((this.formData.title[1] == false && this.formData.title[2] == false && this.formData.title[3] == false) || (this.total_weight < -0.01 || this.total_weight > 0.03) ){
			this.App.presentAlert_default('Empty Input', "Please insert all required info!", "assets/gg-icon/attention-icon.svg");
		}else{
			this.App.presentLoading();

			this.httpClient.post(this.App.api_url + "/appSubmitChangeRequestData", tobeSubmit, { observe: "body" }).subscribe((data: any) => {

				this.loadingController.dismiss();

				if (data.status == "OK") {

					this.alertController
						.create({
							cssClass: "successfulMessage",
							header: "You successful create the Goods Received note.",
							buttons: [{ text: "OK" }],
						})
						.then((alert) => alert.present());

					this.router.navigate(["/bullion-change-request/",this.grnDetail['goods_received_note_detail_id']]);

				} else {
					this.App.presentAlert_default(data['status'], data['result'], "assets/gg-icon/attention-icon.svg");
				}
			}, error => {
				this.loadingController.dismiss();
				this.App.presentAlert_default('ERROR', "Connection Error", "assets/gg-icon/attention-icon.svg");
			});
		}
	}
}
