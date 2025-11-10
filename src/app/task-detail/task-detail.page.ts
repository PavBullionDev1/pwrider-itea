import { Location } from "@angular/common";
import { HttpClient, HttpRequest } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
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
import { NativeAdapterService } from '../services/native-adapter.service';
import { ModalController, NavController } from '@ionic/angular';
import { ModalTaskPage } from '../modal-task/modal-task.page';
import { ModalSignaturePage } from "../modal-signature/modal-signature.page";
import { Big } from 'big.js';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.page.html',
  styleUrls: ['./task-detail.page.scss'],
  providers: [NativeAdapterService],
})
export class TaskDetailPage implements OnInit {

	taskDetails: any = {'remarks':''};
	task_id = this.route.snapshot.paramMap.get("task_id");
	is_multiple_image: number = 0;
	imageUrl: string = '';
	MultipleImageUrl: string[] = [];
	customerData: any = { 
		address1: '', 
		address2: '', 
		postcode: '', 
		city: '', 
		state: '' 
	};
	previous_not_yet_completed: any[] = [];

	signature_data: any;
	
	// Missing properties for HTML template
	haveItemImages: boolean = false;
	formData: any = { detailList: [] };
	slideOpts: any = {
		initialSlide: 0,
		speed: 400
	};

	update_task_id: number = 0;
	update_task_id_list: any[] = [];

  constructor(
    public alertController: AlertController,
		private router: Router,
		public HttpClient: HttpClient,
		public App: AppComponent,
		private route: ActivatedRoute,
		public loadingController: LoadingController,
		public menuCtrl: MenuController,
		public actionSheetController: ActionSheetController,
		private platform: Platform,
		private nativeAdapter: NativeAdapterService,
		public location: Location,
		private navCtrl: NavController,
		public modalController: ModalController,
  ) { }

  ngOnInit() {
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

	private async presentErrorAlert(header: string, message: string) {
		const alert = await this.alertController.create({
			header: header,
			message: message,
			buttons: ['OK']
		});
		await alert.present();
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

  ionViewWillEnter() {
		this.getTaskDetail();

	}
	
  getTaskDetail() {
		//this.App.presentLoading();
		this.HttpClient
			.get(
				this.App.api_url + "/appGetTaskDetails/" + this.task_id + "/" + localStorage['token']
			)
			.subscribe(
				(data: any) => {
					var total_gram = 0;
					var total_XAU = 0;
					var total_billing_gram = 0;

					this.customerData = data.result['customerData'];
					this.taskDetails = data.result['taskDetails'];
					this.taskDetails.job_type_name = this.taskDetails.job_type == 1 ? 'Bullion' : (this.taskDetails.job_type == 0 ? 'Logistic' : 'Delivery Order');
					if(this.taskDetails.job_type == 1){
						this.taskDetails.job_type_detail_name = this.taskDetails.job_type_detail == 1 ?'Payment':'Normal';
					}
					if(this.taskDetails.job_type == 2){
						if(this.taskDetails.goldPurityList.length > 0){
							this.taskDetails.goldPurityList.forEach(gold => {
								if(this.taskDetails.ItemList.length > 0){
									this.taskDetails.ItemList.forEach(item => {
										if(gold.id == item.gold_pure_id){
											//change the productList percentage
											item.percentage = gold.gold_pure_percent;
										}
									});
								}
							});
						}

						if(this.taskDetails.ItemList.length > 0){
							this.taskDetails.ItemList.forEach(item => {
								if(item.weight > 0){
									total_gram = Big(total_gram).plus(item.weight).round(2, 0).toNumber();
									total_XAU = Big(total_XAU).plus(item.XAU).round(3, 0).toNumber();
									total_billing_gram = Big(total_billing_gram).plus(item.billing_wgt).round(3, 0).toNumber();
								}
								item.image = (item.image)?item.image:"",
								item.is_multiple_image = (item.is_multiple_image)?item.is_multiple_image:0,
								item.multiple_image = (item.multiple_image)?item.multiple_image:[];
								if(item.multiple_image){
									item.MultipleImageUrl = item.multiple_image ? item.multiple_image : [];
								}else{
									item.MultipleImageUrl = [];
								}
								this.taskDetails['total_weight'] = total_gram;
								this.taskDetails['total_billing_gram'] = total_billing_gram;
								this.taskDetails['total_XAU'] = Big(total_XAU).round(3, 0).toNumber();
							});	
						}
						
					}
					this.previous_not_yet_completed = data.result['previous_not_yet_completed'];
					console.log("DATA",this.taskDetails);
					console.log("DATA22",this.previous_not_yet_completed);
				},
				(error: any) => {
					console.log(error);
				}
			);
	}

	doRefresh(event: any) {
		// console.log('Begin async operation');
		this.getTaskDetail();

		event.target.complete();

	}

	async view_detail(item: any, index: number) {

		//console.log(item);

		console.log(this.taskDetails.ItemList)

		const modal = await this.modalController.create({
			component: ModalTaskPage,
			componentProps: {
				modalData: item,
				itemList: this.taskDetails.ItemList,
				index: index,
				type: this.taskDetails,
				customerGoldPurityList: this.taskDetails.goldPurityList,
				// warehouseList: this.warehouseList,
			},
			backdropDismiss: false,
		});
		await modal.present();

		modal.onDidDismiss().then((data => {
			this.recalculate(item);
		}));

	}

	async openActionSheet(type?: string) {
		const actionSheet = await this.actionSheetController.create({
			cssClass: 'my-custom-class',
			buttons: [{
				text: 'Camera（Single Image）',
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
				text: 'Upload Multiple Images',
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
				await this.presentErrorAlert('Error', 'Failed to capture photo');
			}
		} catch (error) {
			console.error('openCamera: 拍照失败', error);
			this.App.stopLoading(100);
			await this.presentErrorAlert('Error', 'Failed to capture photo: ' + error.message);
		}
	}

	addItem() {


		let tmp = {
			weight: 0,

			do_bso_relation_id: "",
			gold_pure_name: "",
			gold_percentage: 0,
			gold_pure_id: "",
			product_code: "",
			product_id: "",
			remark: "",
			MultipleImageUrl: [],
			XAU: 0,
			billing_wgt: 0,
			is_editable: "0",
			is_deleted: 0,
		};

		this.taskDetails.ItemList.push(tmp);
	}

	recalculate(item: any) {

		// // Check if the item appears more than once in the BSOItemList
		// const itemCount = this.taskDetails.BSOItemList.filter(bsoItem => bsoItem.gold_pure_id === item.gold_pure_id).length;
		
		// // If the item appears more than once, prompt the user and return early
		// if (itemCount > 1) {
		// 	alert('This gold has already been added.');
		// 	item.gold_pure_id = 0;
		// 	return;
		// }

		//prefill the related fields
		var selectedPresetPurity = this.taskDetails.goldPurityList.filter(function (gold) {
			return item.gold_pure_id == gold.gold_pure_id;
		});

		if (selectedPresetPurity.length > 0) {
			item.gold_name = selectedPresetPurity[0].gold_name;
			if(item.is_editable == '0'){
				if(item.gold_percentage <= 0){
					item.gold_percentage = Big(selectedPresetPurity[0].override_gold_pure_percent).round(2, 0).toNumber();
					if(item.gold_percentage > 100){
						item.gold_percentage = 100;
					}else if(item.gold_percentage < 0){
						item.gold_percentage = 0;
					}else{
						if(item.gold_percentage){
						item.gold_percentage = Big(item.gold_percentage).round(2, 0).toNumber();
						}
					}
				}else{
					item.gold_percentage = Big(item.gold_percentage).round(2, 0).toNumber();
				}
				
			}
			item.is_editable = selectedPresetPurity[0].is_editable;

			//calculate XAU
			if(item.billing_wgt > 0 && item.gold_percentage > 0){
				item.XAU = Big(item.billing_wgt).mul(Big(item.gold_percentage).div(100)).round(3, 0).toNumber();
			}
			item.weight = Big(item.weight).round(2, 0).toNumber();
			item.billing_wgt = Big(item.billing_wgt).round(2, 0).toNumber();

			var total_gram = 0;
			var total_billing_gram = 0;
			var total_XAU = 0;

			if(this.taskDetails.ItemList.length > 0){
				this.taskDetails.ItemList.forEach(item => {
					if(item.weight > 0){
						total_gram = Big(total_gram).plus(item.weight).round(2, 0).toNumber();
						total_XAU = Big(total_XAU).plus(item.XAU).round(3, 0).toNumber();
						total_billing_gram = Big(total_billing_gram).plus(item.billing_wgt).round(3, 0).toNumber();
					}
					this.taskDetails['total_weight'] = total_gram;
					this.taskDetails['total_billing_gram'] = total_billing_gram;
					this.taskDetails['total_XAU'] = Big(total_XAU).round(3, 0).toNumber();
				});
			}
		}
	}

	async deleteItem(selectedItem: any) {

		const alert = await this.alertController.create({
			cssClass: "successfulMessage",
			header: `Are you sure to remove this from list ?`,
			subHeader: "You may lost the record(s)",
			buttons: [
				{
					text: "Cancel",
					cssClass: "colosebutton",
					handler: () => { },
				},
				{
					text: "Confirm",
					cssClass: "confirmbutton",
					handler: () => {
						let theDeletedIndex = 0;
						for(let i = 0; i < this.taskDetails.ItemList.length; i++){
							if(this.taskDetails.ItemList[i].gold_pure_id == selectedItem.gold_pure_id){
								this.taskDetails.ItemList.splice(i, 1);
								theDeletedIndex = i;
							}
						}
					},
				},
			],
		});
		await alert.present();
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
					if (!input.files || input.files.length === 0) return;
					
					this.App.presentLoading(100000);
					
					const file = input.files[0];
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
			console.log('one_image_upload: 开始上传图片');
			const data = await this.HttpClient.post(this.App.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).toPromise();
			
			if (data['status'] === "OK") {
				console.log('one_image_upload: 上传成功');
				this.App.stopLoading(100);
				this.imageUrl = data['result']['img_path'];
				this.is_multiple_image = 0;
			} else {
				this.App.stopLoading(100);
				throw new Error(data['message'] || 'Upload failed');
			}
		} catch (error) {
			console.error('one_image_upload: 上传失败', error);
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
			console.log('multiple_image_upload: 开始上传多张图片');
			const data = await this.HttpClient.post(this.App.api_url + "/uploadMultipleImage", tobeSubmit, { observe: "body" }).toPromise();
			
			if (data['status'] === "OK") {
				console.log('multiple_image_upload: 上传成功');
				this.App.stopLoading(100);
				this.MultipleImageUrl = JSON.parse(data['result']['img_path']);
				this.is_multiple_image = 1;
			} else {
				this.App.stopLoading(100);
				throw new Error(data['message'] || 'Upload failed');
			}
		} catch (error) {
			console.error('multiple_image_upload: 上传失败', error);
			this.App.stopLoading(100);
			await this.presentErrorAlert('Error', 'Failed to upload images');
		}
	}

	//testing get multiple image
	get_multiple_image_testing() {

		let tobeSubmit = {
			'account_id': localStorage['login_user_id'],
			'token': localStorage['token'],
			'imgInfo': "DEMO",
		};


		this.HttpClient.post(this.App.api_url + "/uploadMultipleImage_testing", tobeSubmit, { observe: "body" }).subscribe((data: any) => {
			if (data['status'] == "OK") {
				this.App.stopLoading(100);
				this.MultipleImageUrl = JSON.parse(data['result']['img_path']);
				this.is_multiple_image = 1;

			} else {
				this.App.stopLoading(100);
				this.App.presentAlert_default('', 'Error2!. Please try again', "../../assets/attention2-icon.svg");
			}
		}, error => {
			this.App.stopLoading(100);
			this.App.presentAlert_default('', "Connection Error 2", "../../assets/attention2-icon.svg");
		});
	}

	//testing get one image
	get_one_image_testing() {

		let tobeSubmit = {
			'account_id': localStorage['login_user_id'],
			'token': localStorage['token'],
			'imgInfo': "DEMO",
		};


		this.HttpClient.post(this.App.api_url + "/uploadMultipleImage_testing", tobeSubmit, { observe: "body" }).subscribe((data: any) => {
			if (data['status'] == "OK") {
				this.App.stopLoading(100);
				let haha = JSON.parse(data['result']['img_path']);
				this.is_multiple_image = 0;
				this.imageUrl = haha[0];

			} else {
				this.App.stopLoading(100);
				this.App.presentAlert_default('', 'Error2!. Please try again', "../../assets/attention2-icon.svg");
			}
		}, error => {
			this.App.stopLoading(100);
			this.App.presentAlert_default('', "Connection Error 2", "../../assets/attention2-icon.svg");
		});
	}

	changedXAU(item: any) {

		if(item.XAU_amount > item.total_XAU - item.knockoff_xau){
			this.App.presentAlert_default('', "The XAU Amount have exceed the maximum knock off XAU", "../../assets/attention2-icon.svg");

			item.XAU_amount = item.total_XAU - item.knockoff_xau;
		}
	}

	delete_img(is_multiple: number, img_path: string, index?: number) {
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

	submit() {
		this.App.presentLoading(500);

		let tobeSubmit = {
			'token': localStorage['token'],
			'image': this.imageUrl,
			'is_multiple_image': this.is_multiple_image,
			'multiple_image': this.MultipleImageUrl,
			'task_id': this.task_id,
			'remarks': this.taskDetails.remarks,
			'update_task_id_list': this.update_task_id_list,
			'job_type': this.taskDetails.job_type,
			'job_type_detail': this.taskDetails.job_type_detail,
			'customer_id': this.taskDetails.customer_id,
		};
		if(this.taskDetails.job_type == 1 && this.taskDetails.job_type_detail == 1){
			tobeSubmit['payment_amount'] = this.taskDetails.payment_amount;
			tobeSubmit['all_po_id'] = this.taskDetails.all_po_id;
			tobeSubmit['signature'] = this.signature_data;
		}

		// Service adjustment
		if(this.taskDetails.job_type == 0 && this.taskDetails.job_type_detail == 2){
			tobeSubmit['signature'] = this.signature_data;
			tobeSubmit['service_adjustment_id'] = this.taskDetails.service_adjustment_dtl.service_adjustment_id;
		}

		if(this.taskDetails.job_type == 2){
			tobeSubmit['ItemList'] = this.taskDetails.ItemList;
			tobeSubmit['signature'] = this.signature_data;
		}

		console.log(tobeSubmit);

		this.HttpClient.post(this.App.api_url + "/riderTaskSubmit", tobeSubmit, { observe: "body" }).subscribe((data: any) => {
			console.log(data);
			if (data['status'] == "OK") {
				this.App.stopLoading(100);
				this.App.presentAlert_default('OK', "Status Updated");
				this.navCtrl.navigateRoot('task', { animationDirection: 'forward' });

			} else {
				this.App.stopLoading(100);
				this.App.presentAlert_default('', data['result'], "../../assets/attention2-icon.svg");
			}
		}, error => {
			this.App.stopLoading(100);
			this.App.presentAlert_default('', "Connection Error", "../../assets/attention2-icon.svg");
		});

	}

	select_all(type: boolean) {

		for (let i = 0; i < this.previous_not_yet_completed.length; i++) {

			//if (this['previous_not_yet_completed'][i]['rider_id'] == this.rider_id) {
				if (type) {
					this['previous_not_yet_completed'][i]['is_checked'] = 1;
				} else {
					this['previous_not_yet_completed'][i]['is_checked'] = 0;
				}
			//}
		}
	}

	tick_target_task(item: any) {

		// this.update_task_id = [];

		if(item.is_checked){

			this.HttpClient
			.get(
				this.App.api_url + "/appGetUpdate_previous_task_list/" + item.task_id + "/" + localStorage['token'])
			.subscribe(
				(data: any) => {

					this.loadingController.dismiss();

					this.update_task_id = data.result["update_task_id"];
					this.append_item_to_list(this.update_task_id);
				},
				(error: any) => {
					this.loadingController.dismiss();

					console.log(error);
				}
			);

		}

	}

	//append task id that need to batch update to update_task_id_list
	append_item_to_list(update_task_id: any) {

		var tmp_item: string;
		tmp_item = update_task_id;

		this.update_task_id_list.push(update_task_id);
	}

	async openModalSign() {

		const modal = await this.modalController.create({
			component: ModalSignaturePage,
			componentProps: {
				// 'salesorder_id': this.salesorder_id,
				// 'type':'onboarding',
			},
			backdropDismiss: false,
		});
		await modal.present();

		modal.onDidDismiss().then((data => {
			this.signature_data = data.data;
			// console.log("Signature data", this.signature_data);
		}));

	}
}
