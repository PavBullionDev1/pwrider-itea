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
import { ModalSignaturePage } from "../modal-signature/modal-signature.page";
import { ModalWeightPage } from '../modal-weight/modal-weight.page';
import { ModalsharedService } from '../modalshared.service';
import { ConfigService } from '../config.service';

@Component({
	selector: 'app-weight-detail',
	templateUrl: './weight-detail.page.html',
	styleUrls: ['./weight-detail.page.scss'],
	providers: []
})
export class WeightDetailPage implements OnInit {

	goods_received_note_id = this.route.snapshot.paramMap.get("goods_received_note_id");
	grnData: any = {};
  po_id: number = 0;
	PO_itemList: any[] = [];
	customerBItemTypeList: any[] = [];
	customerGoldPurityList: any[] = [];
	warehouseList: any[] = [];
	all_po_id: any[] = [];
	customer_balance_XAU: number = 0;
	customerName: any;
	update_po_item: boolean = false;
  camera_mode: number = 0;
	internalRemarkShow: boolean = false;
	MultipleImageUrl_DO: any[] = [];
	ShowImageUrl_do: any = '';

	//for image index
	grnIndex = 0;

	is_admin: number = 0;

	gmsakToken: string = "";

	formData = {

		//for display
		'total_gram': 0,
		'total_XAU': 0,

		//data to be submit
		'remark': '',
		'rounding_xau': 0,
		'detailList': [] as any[],

		'geolocation_lat': '',
		'geolocation_lng': '',
		'geolocation_photo': '',
	};

	// Image Slide
	slideOpts = {
		initialSlide: 0,
		speed: 400,
		slidesPerView: 3,
	};
	takePhotofor: any;
	ShowImageUrl_tng: any;
	haveItemImages: any;

	submitted = false;
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
		public modalController: ModalController,
		private modalShared: ModalsharedService,
		private config: ConfigService
	) { }

	async ngOnInit() {
		// await this.checkPermissions();
		this.get_grn_data();
		this.gmsakToken = localStorage['googleApiKey'] || '';
		this.modalShared.currentMessage.subscribe({"next":(message:any)=>{
			if(message.mode == "delete") {
				this.formData.detailList.splice(message.data, 1);
			}
		}});
		this.loadDraft();
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

	ionViewWillEnter() {
		this.getGeolocation();
	}

  saveDraft() {
    const draft = {
      goods_received_note_id: this.goods_received_note_id,
      grnData: this.grnData,
      po_id: this.po_id,
      PO_itemList: this.PO_itemList,
      customerBItemTypeList: this.customerBItemTypeList,
      customerGoldPurityList: this.customerGoldPurityList,
      warehouseList: this.warehouseList,
      all_po_id: this.all_po_id,
      customer_balance_XAU: this.customer_balance_XAU,
      customerName: this.customerName,
      update_po_item: this.update_po_item,
      grnIndex: this.grnIndex,
      is_admin: this.is_admin,
      gmsakToken: this.gmsakToken,
      formData: this.formData,
      takePhotofor: this.takePhotofor,
      ShowImageUrl_tng: this.ShowImageUrl_tng,
      haveItemImages: this.haveItemImages,
      MultipleImageUrl_DO: this.MultipleImageUrl_DO,
      ShowImageUrl_do: this.ShowImageUrl_do,
    };

    localStorage.setItem(`weightDetailDraft_${this.goods_received_note_id}`, JSON.stringify(draft));
    console.log('Save Draft', localStorage.getItem(`weightDetailDraft_${this.goods_received_note_id}`));
  }

  loadDraft() {
    const draftString = localStorage.getItem(`weightDetailDraft_${this.goods_received_note_id}`);
    const draft = draftString ? JSON.parse(draftString) : null;
    if (draft) {
      this.goods_received_note_id = draft.goods_received_note_id || this.goods_received_note_id;
      this.grnData = draft.grnData || {};
      this.po_id = draft.po_id || 0;
      this.PO_itemList = draft.PO_itemList || [];
      this.customerBItemTypeList = draft.customerBItemTypeList || [];
      this.customerGoldPurityList = draft.customerGoldPurityList || [];
      this.warehouseList = draft.warehouseList || [];
      this.all_po_id = draft.all_po_id || [];
      this.customer_balance_XAU = draft.customer_balance_XAU || 0;
      this.customerName = draft.customerName || '';
      this.update_po_item = draft.update_po_item || false;
      this.grnIndex = draft.grnIndex || 0;
      this.is_admin = draft.is_admin || 0;
      this.gmsakToken = draft.gmsakToken || '';
      this.formData = draft.formData || {
        'total_gram': 0,
        'total_XAU': 0,
        'remark': '',
        'rounding_xau': 0,
        'detailList': [],
        'geolocation_lat': '',
        'geolocation_lng': '',
        'geolocation_photo': '',
      };
      this.takePhotofor = draft.takePhotofor || 0;
      this.ShowImageUrl_tng = draft.ShowImageUrl_tng || '';
      this.haveItemImages = draft.haveItemImages || false;
      this.MultipleImageUrl_DO = draft.MultipleImageUrl_DO || [];
      this.ShowImageUrl_do = draft.ShowImageUrl_do || '';

      console.log('load Draft');
    }
  }



  get_grn_data() {
		this.App.presentLoading();
		this.httpClient
			.get(
				this.App.api_url + "/appGetPendingWeightGrnData/" + this.goods_received_note_id + "/" + localStorage['token'])
			.subscribe(
				(data: any) => {
          this.warehouseList = data.result["warehouseList"];
          this.customerBItemTypeList = data.result["customerBItemTypeList"];
          this.customerGoldPurityList = data.result["customerGoldPurityList"];
          this.customer_balance_XAU = data.result["XAU_balance"];
          this.customerName = data.result['customerName'];
          this.is_admin = data.result['is_admin'];
          console.log(this.customerBItemTypeList)
          //set old grn detail list data into current detail list
          const savedDraft = localStorage.getItem(`weightDetailDraft_${this.goods_received_note_id}`);
          if(!savedDraft){
            this.grnData = data.result["grnData"];
            if(this.grnData['MultipleImageUrl_tng'] !== null && this.grnData['MultipleImageUrl_tng']){
              console.log(this.grnData['MultipleImageUrl_tng'])
              this.grnData['MultipleImageUrl_tng'] = JSON.parse(this.grnData['MultipleImageUrl_tng']);
            }else if(this.grnData['MultipleImageUrl_tng'] == null){
              this.grnData['MultipleImageUrl_tng'] = [];
            }
            if(this.grnData['MultipleImageUrl_DO'] !== null && this.grnData['MultipleImageUrl_DO']){
              this.MultipleImageUrl_DO = JSON.parse(this.grnData['MultipleImageUrl_DO'])
            }

            this.po_id = this.grnData['purchase_order_id'];
            console.log(this.po_id);

            this.PO_itemList = data.result["PO_itemList"];
            this.set_default_list();
            this.all_po_id = data.result['all_po_id'];


          }


				},
				(error: any) => {
					this.loadingController.dismiss();
					console.log(error);
				}
			);
	}

	getGeolocation() {
		this.App.presentLoading();
		// Use browser native geolocation API for compatibility with Capacitor 3.x and above.
		// Reason: @ionic-native/geolocation is deprecated and may cause version conflicts. navigator.geolocation is supported in all modern browsers and hybrid apps.
		navigator.geolocation.getCurrentPosition(
			(resp) => {
				this.formData.geolocation_lat = resp.coords.latitude.toString();
				this.formData.geolocation_lng = resp.coords.longitude.toString();
				let deviceLatLng = this.formData.geolocation_lat + "," + this.formData.geolocation_lng;
				this.formData.geolocation_photo =
					"https://maps.googleapis.com/maps/api/staticmap?center=" + deviceLatLng +
					"&zoom=17" + "&size=250x250" +
					"&markers=color:blue%7Clabel:U%7C" + deviceLatLng +
					"&key=" + this.gmsakToken;
			},
			(error: any) => {
				// this.App.presentAlert_default('ERROR', error, "assets/attention-icon.svg");
				// this.App.presentAlert_default('ERROR', 'Make sure your GPS is open', "assets/attention-icon.svg");
				console.log('Error getting location', error);
			}
		);
	}

	set_default_list() {

		if (this.PO_itemList) {
			var itemList: any[] = [];
			var item_num = 0;

			for (const [key, v] of Object.entries(this.PO_itemList)) {
				item_num += 1;

				var itemData = {
					item_no : item_num,
					item_type : v.item_type_id,
					item_code : v.item_code,
          gram : parseFloat(v.gram),
          previous_gram : parseFloat(v.previous_gram),
					gold_name : v.gold_name,
					gold_pure_id : v.gold_pure_id,
					gold_pure_percent : parseFloat(v.gold_pure_percent),
					XAU_amount : parseFloat(v.XAU_amount),
					purchase_order_id : v.purchase_order_id,
					related_po_id : v.related_po_id,
					barcode : v.barcode,
					pw_barcode : v.pw_barcode,
					is_multiple_image : 1,
					imageUrl : null,
					MultipleImageUrl : [], // empty image
					warehouse_id : v.warehouse_id, // main
				};
				itemList.push(itemData);
			}
			this.formData.detailList = itemList;
			var checkhavemultiple = this.formData.detailList.filter((item: any) => item.MultipleImageUrl.length > 0);
			if(checkhavemultiple.length > 0){
				this.haveItemImages = true;
			}
			console.log(this.formData.detailList)

			this.calculate_summary();
		}
	}

	addItem() {
		let item_num = 0;
		if(this.formData.detailList.length > 0){
			this.formData.detailList.forEach(item => {
				if(item.item_no > item_num){
					item_num = item.item_no;
				}
			});
		}
		item_num = item_num + 1;

		let tmp = {
			item_no: item_num,
			item_type: String(this.customerBItemTypeList[0].item_type_id),
			item_code: "",
			gram: 0,

			gold_name: "",
			gold_pure_id: "",
			gold_pure_percent: "",
			XAU_amount: 0,

			purchase_order_id: 0,
			related_po_id: null,

			is_multiple_image: 0,
			imageUrl: "",
			MultipleImageUrl: [],
			warehouse_id: "1",
			is_new: 0
		};

		this.formData.detailList.push(tmp);
    this.saveDraft();
	}


	no_round_up(num: number, rounded: number): string {
		let withDecimals: string;
		if (rounded == 2) {
			const match = num.toString().match(/^-?\d+(?:\.\d{0,2})?/);
			withDecimals = match ? match[0] : '0';
		} else if (rounded == 3) {
			const match = num.toString().match(/^-?\d+(?:\.\d{0,3})?/);
			withDecimals = match ? match[0] : '0';
		} else {
			withDecimals = num.toString();
		}

		return withDecimals;
	}

	calculate_summary() {

		var total_gram = 0;
		var total_XAU = 0;
		var rounding_xau = 0;

		this.formData.detailList.forEach(function (v, k) {
			total_gram += v.gram;
			total_XAU += v.XAU_amount;
		});

		//if type of this.formData.rounding_xau is string, then convert to float
		if (typeof this.formData.rounding_xau == "string") {
			this.formData.rounding_xau = parseFloat(this.formData.rounding_xau);
		}

		rounding_xau = this.formData.rounding_xau;

		this.formData['total_gram'] = total_gram;
		this.formData['total_XAU'] = total_XAU + rounding_xau;

		this.sortList();
		return {
			'total_gram': this.formData['total_gram'],
			'total_XAU': this.formData['total_XAU'],
		}
	}

	sortList() {
		this.formData.detailList = [...this.formData.detailList];
		this.formData.detailList.sort((a, b) => {
		  return b.gold_pure_percent - a.gold_pure_percent;
		});
	}

	async removeDetail(index: number) {

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
						this.formData.detailList.splice(index, 1);
						this.calculate_summary();
            this.saveDraft();
					},
				},
			],
		});
		await alert.present();
	}

	async view_detail(item: any) {

		item.item_code = item.gold_pure_id;

		const modal = await this.modalController.create({
			component: ModalWeightPage,
			componentProps: {
				modalData: item,
        po_id: this.po_id,
        itemList: this.PO_itemList,
				modalDataList: this.formData.detailList,
				customerGoldPurityList: this.customerGoldPurityList,
				customerBItemTypeList: this.customerBItemTypeList,
				warehouseList: this.warehouseList,
			},
			backdropDismiss: false,
		});
		await modal.present();

		modal.onDidDismiss().then((data => {
			this.calculate_summary();
      this.saveDraft();
		}));

	}

	async openActionSheet(is_GRN: number, index: number) {

		if(is_GRN == 0){
			this.grnIndex = index;
		}
		this.takePhotofor = is_GRN;

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
      },{
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
		const { role } = await actionSheet.onDidDismiss();
		console.log('onDidDismiss resolved with role', role);
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
			await this.presentErrorAlert('Error', 'Failed to capture photo: ' + (error as any).message);
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
				
				if (imageResponse.length > 0) {
					await this.api_upload_multiple_image(imageResponse);
				} else {
					this.App.stopLoading(100);
				}
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
					await this.presentErrorAlert('Error', 'Failed to read file');
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
			const data = await this.httpClient.post(this.App.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).toPromise();
			this.App.stopLoading(100);

			if (data['status'] === "OK") {
				// Multiple Image
				if(this.takePhotofor == 0){ //if take photo for grn
					this.formData.detailList[this.grnIndex].is_multiple_image = 1;
					this.formData.detailList[this.grnIndex].MultipleImageUrl.push(data['result']['img_path']);
					this.haveItemImages = true;
				}else if(this.takePhotofor == 1){ //if take photo for TNG
					if (!this.grnData['MultipleImageUrl_tng']) {
						this.grnData['MultipleImageUrl_tng'] = [];
					}
					this.grnData['is_multiple_image_tng'] = 1;
					this.grnData['MultipleImageUrl_tng'].push(data['result']['img_path']);
				}else if(this.takePhotofor == 2){ //if take photo for DO
					if (!this.MultipleImageUrl_DO) {
						this.MultipleImageUrl_DO = [];
					}
					this.MultipleImageUrl_DO.push(data['result']['img_path']);
				}
				if(this.camera_mode == 1){
					await this.openCamera(CameraSource.Camera, true);
				}
				this.saveDraft();
			} else {
				throw new Error(data['message'] || 'Upload failed');
			}
		} catch (error) {
			console.error('Error uploading image:', error);
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
			const data = await this.httpClient.post(this.App.api_url + "/uploadMultipleImage", tobeSubmit, { observe: "body" }).toPromise();
			this.App.stopLoading(100);

			if (data['status'] === "OK") {
				const uploadedImages = JSON.parse(data['result']['img_path']);
				
				if(this.takePhotofor == 0){ //if take photo for grn
					this.formData.detailList[this.grnIndex].is_multiple_image = 1;
					if (!this.formData.detailList[this.grnIndex].MultipleImageUrl) {
						this.formData.detailList[this.grnIndex].MultipleImageUrl = [];
					}
					this.formData.detailList[this.grnIndex].MultipleImageUrl = this.formData.detailList[this.grnIndex].MultipleImageUrl.concat(uploadedImages);
					this.haveItemImages = true;
				}else if(this.takePhotofor == 1){ //if take photo for TNG
					if (!this.grnData['MultipleImageUrl_tng']) {
						this.grnData['MultipleImageUrl_tng'] = [];
					}
					this.grnData['is_multiple_image_tng'] = 1;
					this.grnData['MultipleImageUrl_tng'] = this.grnData['MultipleImageUrl_tng'].concat(uploadedImages);
				}else if(this.takePhotofor == 2){ //if take photo for DO
					if (!this.MultipleImageUrl_DO) {
						this.MultipleImageUrl_DO = [];
					}
					this.MultipleImageUrl_DO = this.MultipleImageUrl_DO.concat(uploadedImages);
				}
				this.saveDraft();
			} else {
				throw new Error(data['message'] || 'Upload failed');
			}
		} catch (error) {
			console.error('Error uploading multiple images:', error);
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


		this.httpClient.post(this.App.api_url + "/uploadMultipleImage_testing", tobeSubmit, { observe: "body" }).subscribe((data: any) => {
			if (data['status'] == "OK") {
				this.App.stopLoading(100);

				this.formData.detailList[this.grnIndex].is_multiple_image = 1;
				this.formData.detailList[this.grnIndex].MultipleImageUrl = JSON.parse(data['result']['img_path']);

			} else {
				this.App.stopLoading(100);
				this.App.presentAlert_default('', 'Error2!. Please try again', "../../assets/attention2-icon.svg");
			}
      this.saveDraft();

		}, error => {
			this.App.stopLoading(100);
			this.App.presentAlert_default('', "Connection Error 2", "../../assets/attention2-icon.svg");
		});
	}

	delete_img(is_GRN: number, img_path: string, target_index: number) {

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
				handler: (alertData: any) => {
					if(is_GRN == 0){
						let index = this.formData.detailList[target_index].MultipleImageUrl.indexOf(img_path);
						if (index !== -1) {
							this.formData.detailList[target_index].MultipleImageUrl.splice(index, 1);
						}
						if (this.formData.detailList[target_index].showImage == img_path) {
							this.formData.detailList[target_index].showImage = '';
						}
						for (let i = 0; i < this.formData.detailList.length; i++) {
							this.haveItemImages = false;
							if(this.formData.detailList[i].MultipleImageUrl.length > 0){
								this.haveItemImages = true;
								break;
							}
						}
					}if(is_GRN == 1){
						let index = this.grnData['MultipleImageUrl_tng'].indexOf(img_path);
						if (index !== -1) {
							this.grnData['MultipleImageUrl_tng'].splice(index, 1);
						}
						if (this.ShowImageUrl_tng == img_path) {
							this.ShowImageUrl_tng = '';
						}
					}if(is_GRN == 2){
						let index = this.MultipleImageUrl_DO.indexOf(img_path);
						if (index !== -1) {
							this.MultipleImageUrl_DO.splice(index, 1);
						}
						if (this.ShowImageUrl_tng == img_path) {
							this.ShowImageUrl_tng = '';
						}
					}
				}
			}]
		}).then(alert => alert.present());
	}

	submit_now() {

		this.submitted = true;

		if(this.formData.detailList.length < 1){
			this.App.presentAlert_default('Empty Item', 'At least have an iem before submit', "assets/gg-icon/attention-icon.svg");
			this.submitted = false;
		}else{
			this.App.presentLoading();
			this.formData.detailList = this.formData.detailList.map(({ item_no, ...rest }) => rest);

			let tobeSubmit = {
				'MultipleImageUrl_tng': this.grnData['MultipleImageUrl_tng'],
				'MultipleImageUrl_DO': this.MultipleImageUrl_DO,
				'company_id': localStorage['default_company_id'],
				'token': localStorage['token'],
				"detailList": this.formData.detailList,
				"remark": this.grnData['remark'],
				'rounding_xau': this.formData.rounding_xau,
				"goods_received_note_id": this.goods_received_note_id,
				'geolocation_lat': this.formData.geolocation_lat,
				'geolocation_lng': this.formData.geolocation_lng,
				'geolocation_photo': this.formData.geolocation_photo,
				'update_po_item': this.update_po_item,
				'all_po_id': this.all_po_id
			}

			console.log("tobeSubmit", tobeSubmit);

			this.httpClient.post(this.App.api_url + "/appSubmitPendingWeightGrnData", tobeSubmit, { observe: "body" }).subscribe((data: any) => {

				this.loadingController.dismiss();

				if (data.status == "OK") {

					this.alertController
						.create({
							cssClass: "successfulMessage",
							header: "You successful create the Goods Received note.",
							buttons: [{ text: "OK" }],
						})
						.then((alert) => alert.present());

					this.submitted = false;
					//remove draft
					localStorage.removeItem(`weightDetailDraft_${this.goods_received_note_id}`);

					this.router.navigate(["/weight/",]);

				} else {
					this.App.presentAlert_default(data['status'], data['result'], "assets/gg-icon/attention-icon.svg");
					this.submitted = false;
				}
			}, error => {
				this.loadingController.dismiss();
				this.App.presentAlert_default('ERROR', "Connection Error", "assets/gg-icon/attention-icon.svg");
				this.submitted = false;
			});
		}
	}

	getWarehouseColor(id: string): string {
		let color = '';
		this.warehouseList.forEach(warehouse => {
			if (warehouse['warehouse_id'] == id) {
				color = warehouse['color'];
			}
		});
		return color;
	}
}

