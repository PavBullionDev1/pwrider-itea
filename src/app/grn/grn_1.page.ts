import { Location } from "@angular/common";
import { HttpClient, HttpRequest } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { IonCheckbox } from '@ionic/angular';
import {
	AlertController,
	AngularDelegate,
	IonSearchbar,
	LoadingController,
	MenuController,
	ActionSheetController,
	Platform,
	IonModal,
} from "@ionic/angular";
import { AppComponent } from "../app.component";
import { Httprequest } from "../models/httprequest";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// import { StatusBar as CapacitorStatusBar } from '@capacitor/status-bar';
import { ModalController, NavController } from '@ionic/angular';
import { ModalGrnPage } from '../modal-grn/modal-grn.page';
import { OverlayEventDetail } from '@ionic/core/components';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';
import { ModalsharedService } from "../modalshared.service";
import { ModalSignaturePage } from "../modal-signature/modal-signature.page";
import Big from 'big.js';
import { ConfigService } from '../config.service';

@Component({
	selector: 'app-grn',
	templateUrl: './grn.page.html',
	styleUrls: ['./grn.page.scss'],
	providers: [Geolocation]
})
export class GrnPage implements OnInit {

	@ViewChild('takeAndGoCheckbox') takeAndGoCheckbox: IonCheckbox;
	@ViewChild('normalGRNCheckbox') normalGRNCheckbox: IonCheckbox;

	thisRoundShouldCollectXAUAmount = 0;

	purchase_order_id = this.route.snapshot.paramMap.get("purchase_order_id");

	rider_id = localStorage.login_user_id;

  camera_mode = 0;

	selected_item_count = 0;

	//PO data
	collectionDetails = {
		item_type: 0,
	};

	// Image Slide
	slideOpts = {
		initialSlide: 0,
		speed: 400,
		slidesPerView: 3,
	};

	//CheckIf have Item images
	haveItemImages: any;

	//customer item and gold purity setting
	customerBItemTypeList = [];
	customerGoldPurityList = [];

	//previous_not_yet_completed (include the previous no completed and )
	previous_not_yet_completed = [];

	//if tick the poData, will call api and find the itemList under this po and save to this tmp itemList
	itemList: [];

	//grn (store the grn that need to submit)
	grnList = [];
	customerList = [];

	// summary = {};

	//for image index
	grnIndex = 0;

	//remark (will save into grn and customer note)
	remark: any;
	customer_remark: any;
	rounding_xau: any;

	warehouseList: [];
	all_po_id: any;
  first_open: number = 0;

	// payment
	all_po_data: any;
	total_pos_amount:any = 0;
	payCash: any = false;
	payment = {
		signature: '',
		amount: 0,
		remark: '',
		image: '',
	};

	customer_balance_XAU: 0;
	total_should_pay = 0;

	show_po_list: number = 0;
	total_selected_po: number = 0;

	customer_id = 0;

	is_tng: boolean = false;
	is_grn: boolean = false;
	is_admin = 0;

	gmsakToken = "";
	geolocation_lat: any;
	geolocation_lng: any;
	geolocation_photo: any;

	imageUrl_tng: '';
	MultipleImageUrl_tng: any;
	ShowImageUrl_tng: any;

	MultipleImageUrl_DO: any = [];
	ShowImageUrl_do: any;
	takePhotofor: any = 0;
	is_multiple_image_tng = 0;
	estimated_XAU = 0.000;
	update_po_item = false;
  customer_name: any = '';

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
		private geolocation: Geolocation,
		private modalShared: ModalsharedService,
		private config: ConfigService
	) {

	}

	async ngOnInit() {
		// await this.checkPermissions();
		this.gmsakToken = localStorage['googleApiKey'] || '';
		this.modalShared.currentMessage.subscribe({"next":(message:any)=>{
			if(message.mode == "delete") {
				this.grnList.splice(message.data, 1);
			}
		}});
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

	ionViewWillEnter() {
		this.itemList = [];
		this.getCollectionDetails();
		this.getGeolocation();
    this.loadDraft();
	}

  // Save Draft Function
  saveDraft() {
    const savedDraft = localStorage.getItem('orderJob');
    const draftData = JSON.parse(savedDraft);
    const saveDraftData = {
      grnList: this.grnList,
      remark: this.remark,
      customer_remark: this.customer_remark,
      rounding_xau: this.rounding_xau,
      purchase_order_id: this.purchase_order_id,
      is_grn: this.is_grn,
      is_tng: this.is_tng,
      imageUrl_tng: this.imageUrl_tng,
      MultipleImageUrl_tng: this.MultipleImageUrl_tng,
      is_multiple_image_tng: this.is_multiple_image_tng,
      MultipleImageUrl_DO: this.MultipleImageUrl_DO,
      geolocation_lat: this.geolocation_lat,
      geolocation_lng: this.geolocation_lng,
      geolocation_photo: this.geolocation_photo,
      estimated_XAU: this.estimated_XAU,
      update_po_item: this.update_po_item,
      warehouseList: this.warehouseList,
      payCash: this.payCash,
      payment: this.payment,
      thisRoundShouldCollectXAUAmount :this.thisRoundShouldCollectXAUAmount
    };
    localStorage.setItem('orderJob', JSON.stringify(saveDraftData));
    console.log('Save Draft: ', localStorage.getItem('orderJob'));
  }

  // Load Draft Function
  loadDraft() {
    const savedDraft = localStorage.getItem('orderJob');
    if (savedDraft) {
      const draftData = JSON.parse(savedDraft);
      if(draftData.purchase_order_id != this.purchase_order_id) return;
      this.grnList = draftData.grnList || [];
      this.remark = draftData.remark || '';
      this.customer_remark = draftData.customer_remark || '';
      this.rounding_xau = draftData.rounding_xau || '';
      this.purchase_order_id = draftData.purchase_order_id || '';
      this.is_grn = draftData.is_grn || false;
      this.is_tng = draftData.is_tng || false;
      this.imageUrl_tng = draftData.imageUrl_tng || '';
      this.MultipleImageUrl_tng = draftData.MultipleImageUrl_tng || [];
      this.is_multiple_image_tng = draftData.is_multiple_image_tng || false;
      this.MultipleImageUrl_DO = draftData.MultipleImageUrl_DO || [];
      this.geolocation_lat = draftData.geolocation_lat || '';
      this.geolocation_lng = draftData.geolocation_lng || '';
      this.geolocation_photo = draftData.geolocation_photo || '';
      this.estimated_XAU = draftData.estimated_XAU || 0;
      this.update_po_item = draftData.update_po_item || false;
      this.payCash = draftData.payCash || false;
      this.warehouseList = draftData.warehouseList || [];
      this.thisRoundShouldCollectXAUAmount = draftData.thisRoundShouldCollectXAUAmount || 0;
      this.payment = draftData.payment || { signature: '', amount: 0, remark: '', image: '' };
      console.log('Load Draft',savedDraft);
    }else{
      this.first_open = 1;
    }
  }


  getCollectionDetails() {
		this.App.presentLoading();
		this.httpClient
			.get(
				this.App.api_url + "/appGetSupplierDetail/" + this.purchase_order_id + "/" + localStorage.token)
			.subscribe(
				(data: Httprequest) => {

					this.customerList = data.result['customerList'];
					this.is_admin = data.result['is_admin'];

          console.log('this.purchase_order_id: ', this.purchase_order_id);

					this.customer_id = this.customerList['customer_id'];
          this.customer_name = this.customerList['name'];
          const draftData = JSON.parse(localStorage.getItem(`orderJob`));

          if(draftData){
            if(draftData.purchase_order_id != this.purchase_order_id){
              this.thisRoundShouldCollectXAUAmount = this.customerList['total_XAU'];

              this.itemList = data.result['itemList'];
              //console.log(this.itemList);
              this.all_po_id = [];
              this.all_po_id = data.result['all_po_id'];
              this.append_item_to_list(this.itemList);

              this.all_po_data = data.result['purchase_order_data'];
              for (let i = 0; i < this.all_po_data.length; i++) {
                this.total_pos_amount += (parseFloat(this.all_po_data[i].total_amount));
              }
              this.total_pos_amount.toFixed(2);
              this.payment.amount = this.total_pos_amount.toFixed(2);
            }
          }else{
            this.thisRoundShouldCollectXAUAmount = this.customerList['total_XAU'];

            this.itemList = data.result['itemList'];
            //console.log(this.itemList);
            this.all_po_id = [];
            this.all_po_id = data.result['all_po_id'];
            this.append_item_to_list(this.itemList);

            this.all_po_data = data.result['purchase_order_data'];
            for (let i = 0; i < this.all_po_data.length; i++) {
              this.total_pos_amount += (parseFloat(this.all_po_data[i].total_amount));
            }
            this.total_pos_amount.toFixed(2);
            this.payment.amount = this.total_pos_amount.toFixed(2);
          }

          this.customerBItemTypeList = data.result["customerBItemTypeList"];
          this.customerGoldPurityList = data.result["customerGoldPurityList"];
          this.warehouseList = data.result["warehouseList"];
          this.customer_balance_XAU = data.result["XAU_balance"];
          console.log("this.itemList", this.itemList);
          //console.log("this.customer_id", this.customer_id);

          this.loadingController.dismiss();

				},
				(error) => {
					//this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	getGeolocation() {
		this.App.presentLoading();
		this.geolocation.getCurrentPosition().then((resp) => {

			this.geolocation_lat = resp.coords.latitude.toString();
			this.geolocation_lng = resp.coords.longitude.toString();

			let deviceLatLng = this.geolocation_lat + "," + this.geolocation_lng;

			this.geolocation_photo =
				"https://maps.googleapis.com/maps/api/staticmap?center=" + deviceLatLng +
				"&zoom=17" + "&size=250x250" +
				"&markers=color:blue%7Clabel:U%7C" + deviceLatLng +
				"&key=" + this.gmsakToken;

		}).catch((error) => {
			//this.App.presentAlert_default('ERROR', error, "assets/attention-icon.svg");
			// this.App.presentAlert_default('ERROR', 'Make sure your GPS is open', "assets/attention-icon.svg");
			console.log('Error getting location', error);
		});
	}

	// handleCheckboxChange(checkbox: number) {
	//   if (checkbox === 1) {
	// 	this.is_tng = true;
	// 	this.is_grn = false;
	//   }
	//   if (checkbox === 2) {
	// 	this.is_tng = false;
	// 	this.is_grn = true;
	//   }
	// }

	handleCheckboxChange(checkboxType: 'is_tng' | 'is_grn') {
    if(this.first_open == 1){
      if (checkboxType === 'is_tng' && this.is_tng) {
        // Uncheck the Normal GRN checkbox if Take and Go checkbox is checked
        this.is_grn = false;
        this.normalGRNCheckbox.checked = false;
      } else if (checkboxType === 'is_grn' && this.is_grn) {
        // Uncheck the Take and Go checkbox if Normal GRN checkbox is checked
        this.is_tng = false;
        this.takeAndGoCheckbox.checked = false;
      }
      // reset both images
      this.MultipleImageUrl_tng = [];
      this.haveItemImages = false;
      for (let i = 0; i < this.grnList.length; i++) {
        this.grnList[i].MultipleImageUrl = [];
      }
      this.saveDraft();
    }
    this.first_open = 1;
	}

	append_item_to_list(itemList) {

		this.grnList = [];

		for (let i = 0; i < itemList.length; i++) {

			let tmp_item = itemList[i];

			if (tmp_item['weight_gap'] != 0 && tmp_item['XAU_gap'] != 0) {
				//set initial item list if customer have fill in
				let tmp = {
					item_type: tmp_item['item_type_id'],
					item_code: tmp_item['gold_pure_id'],
					//gram: parseFloat(tmp_item['weight_gap']),
					gram: parseFloat(tmp_item['gram']),

					gold_name: tmp_item['gold_name'],
					gold_pure_id: tmp_item['gold_pure_id'],
					gold_pure_percent: tmp_item['gold_pure_percent'],
					//XAU_amount: tmp_item['XAU_gap'],
					XAU_amount: tmp_item['XAU_amount'],
					barcode: tmp_item['barcode'],
					pw_barcode: tmp_item['pw_barcode'],

					purchase_order_id: tmp_item['purchase_order_id'],
					related_po_id: tmp_item['related_po_id'] !== tmp_item['purchase_order_id'] ? tmp_item['related_po_id'] : null,

					is_multiple_image: 0,
					imageUrl: "",
					MultipleImageUrl: [],

					warehouse_id: "1"

				}
				this.grnList.push(tmp);
				//console.log('this.grnList', this.grnList);
			}

		}
	}

	//sethe the initial grn list
	setGrnList() {
		if (this.itemList.length > 0) {
			console.log('function execute : setGrnList', 'this.itemList', this.itemList);
			for (let i = 0; i < this.itemList.length; i++) {

				let tmp_item = this.itemList[i];

				//set initial item list if customer have fill in
				let tmp = {
					item_type: String(this.customerBItemTypeList[0].item_type_id),
					item_code: tmp_item['item_code'],
					gram: parseFloat(tmp_item['gram']),

					gold_name: tmp_item['gold_name'],
					gold_pure_percent: tmp_item['gold_pure_percent'],
					XAU_amount: tmp_item['XAU_amount'],

					purchase_order_id: this.purchase_order_id,
					related_po_id: tmp_item['related_po_id'],

					is_multiple_image: 0,
					imageUrl: "",
					MultipleImageUrl: [],

					warehouse_id: "1"

				}
				this.grnList.push(tmp);


			}
		}

	}

	// //add the item
	addItem() {

		let tmp = {
			item_type: String(this.customerBItemTypeList[0].item_type_id),
			item_code: "",
			gram: 0,

			gold_name: "",
			gold_pure_percent: "",
			XAU_amount: 0,

			purchase_order_id: 0,
			related_po_id: null,

			is_multiple_image: 0,
			imageUrl: "",
			MultipleImageUrl: [],

			warehouse_id: "1"
		};

		this.grnList.push(tmp);
    this.saveDraft();
	}

	//remove specified cart
	async removeList(id) {

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

						this.grnList.splice(id, 1);
            this.saveDraft();  // Save draft after removing the item
					},
				},
			],
		});
		await alert.present();

	}

	async view_detail(item) {

		console.log("view_detail is open");

		item.item_type = String(item.item_type);

		const modal = await this.modalController.create({
			component: ModalGrnPage,
			componentProps: {
				is_grn: this.is_grn,
        all_po_id: this.all_po_id,
        itemList: this.itemList,
				modalDataList: this.grnList,
				modalData: item,
				customerGoldPurityList: this.customerGoldPurityList,
				warehouseList: this.warehouseList,
				customerBItemTypeList: this.customerBItemTypeList,
			},
			backdropDismiss: false,
		});
		await modal.present();

		modal.onDidDismiss().then((data => {
			this.priceUpdate();
      this.saveDraft();
		}));

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

	//recalculate the total XAU
	priceUpdate() {

		//grn
		let tmp_total_gram = 0;
		let tmp_XAU_amount = 0;
		let total_should_pay = 0;

		//previous not yet completed
		//let tmp_previous_XAU_amount = 0;

		//set the grn list total summary


		for (let i = 0; i < this.grnList.length; i++) {
			tmp_total_gram += this.grnList[i].gram;
			tmp_XAU_amount += (parseFloat(this.grnList[i].XAU_amount));
			//console.log(this.grnList[i].XAU_amount);
		}

		let total_imported_XAU = 0;

		//define rounding xau
		// let rounding_xau = 0;
		// if (this.rounding_xau) {
		// 	rounding_xau = parseFloat(this.rounding_xau);
		// }
		// console.log(this.rounding_xau)

		//final xau = total + rounding
		// tmp_XAU_amount += rounding_xau;

    tmp_XAU_amount = Big(tmp_XAU_amount).minus(total_imported_XAU).round(3, Big.roundDown).toNumber();

    tmp_total_gram = Big(tmp_total_gram).round(3, Big.roundDown).toNumber();
		//this.rounding_xau = this.no_round_up((tmp_XAU_amount), 3) - this.no_round_up((this.thisRoundShouldCollectXAUAmount), 3);
		//this.rounding_xau = this.no_round_up((this.rounding_xau), 3);

		this.sortList();
		return {
			'total_gram': tmp_total_gram,
			'total_XAU_amount': tmp_XAU_amount,
			//'total_previous_XAU_amount': this.no_round_up((tmp_previous_XAU_amount), 3),
		}

	}

	sortList() {
		this.grnList = [...this.grnList];
		this.grnList.sort((a, b) => {
		  return b.gold_pure_percent - a.gold_pure_percent;
		});
	}

	async presentErrorAlert(header: string, message: string | boolean) {
		const errorMessage = typeof message === 'boolean' ? 'An error occurred.' : message.toString();

		const errorAlert = await this.alertController.create({
			header: header,
			message: errorMessage,
			buttons: ['OK'],
		});

		await errorAlert.present();
	}

	//submit GRN
	normal_submit_grn() {
		this.submitted = true;

		for (let i = 0; i < this.grnList.length; i++) {
			delete this.grnList[i].showImage;
		}

		let tobeSubmit = {
			'company_id': localStorage.default_company_id,
			'token': localStorage.token,
			"grnList": this.grnList,
			"remark": this.remark,
			"customer_remark": this.customer_remark,
			'rounding_xau': this.rounding_xau,
			'purchase_order_id': this.purchase_order_id,
			'all_po_id': this.all_po_id,
			'is_grn': this.is_grn,
			'is_tng': this.is_tng,
			'imageUrl_tng': this.imageUrl_tng,
			'MultipleImageUrl_tng': this.MultipleImageUrl_tng,
			'is_multiple_image_tng': this.is_multiple_image_tng,
			'MultipleImageUrl_DO': this.MultipleImageUrl_DO,
			'geolocation_lat': this.geolocation_lat,
			'geolocation_lng': this.geolocation_lng,
			'geolocation_photo': this.geolocation_photo,
			'estimated_XAU': this.estimated_XAU,
			'update_po_item': this.update_po_item,
			'payCash': this.payCash,
		}
		if(this.payCash == true){
			tobeSubmit['payment_data'] = this.payment;
		}

		if (this.is_tng) {
			if(this.grnList.length > 0){
				// Ask user if item weight is checked
				this.alertController.create({
					header: 'Weight Checked?',
					message: 'Have you verified the item weights?',
					buttons: [
						{
							text: 'No',
							handler: () => {
								tobeSubmit['is_verified_item_weight'] = 0;
								this.App.presentLoading();
								this.postData(tobeSubmit); // Proceed to Pending Weight
							}
						},
						{
							text: 'Yes',
							handler: () => {
								tobeSubmit['is_verified_item_weight'] = 1;
								this.App.presentLoading();
								this.postData(tobeSubmit); // Proceed to Pending Test
							}
						}
					]
				}).then(alert => {
					alert.present();
					this.submitted = false;
				});
			}else{
				tobeSubmit['total_XAU'] = this.thisRoundShouldCollectXAUAmount;
				tobeSubmit['is_verified_item_weight'] = 0;
				this.App.presentLoading();
				this.postData(tobeSubmit); // Proceed to Pending Test
			}

		} else if(this.is_grn) {
			if(this.grnList.length < 1){
				this.App.presentAlert_default('Empty Item', 'Add at least one item!', "assets/gg-icon/attention-icon.svg");
				this.submitted = false;
			}else{
				this.postData(tobeSubmit); // Proceed to Pending Reweight
			}
		}
	}

	postData(tobeSubmit) {
		console.log("tobeSubmit", tobeSubmit);
		this.App.presentLoading();

		this.httpClient.post(this.App.api_url + "/appSubmitGRN", tobeSubmit, { observe: "body" }).subscribe((data: any) => {

			// this.loadingController.dismiss();

			if (data.status == "OK") {
				this.submitted = false;
				this.alertController
					.create({
						cssClass: "successfulMessage",
						header: "You successful create the Goods Received note.",
						buttons: [{ text: "OK" }],
					})
					.then((alert) => alert.present());

				//remove Orderjob draft
				localStorage.removeItem('orderJob');
				this.router.navigate(["/collection-supplier/",]);

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


	//upload photos if is grn
	async openActionSheet(index) {
		this.grnIndex = index;
		const actionSheet = await this.actionSheetController.create({
			cssClass: 'my-custom-class',
			buttons: [{
        text: 'Camera（Single Image）',
        role: 'camera',
        icon: 'camera',
        handler: () => {
          this.camera_mode = 0;
					this.openCamera(CameraSource.Camera);
        }
      }, {
				text: 'Camera(Multiple Image)',
        role: 'camera',
        icon: 'camera',
        handler: () => {
          this.camera_mode = 1;
					this.openCamera(CameraSource.Camera);
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
					// 权限刚授予，等待一下
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
				saveToGallery: false,
			};

			const capturedPhoto = await Camera.getPhoto(options);
				this.App.presentLoading(100000);

			if (capturedPhoto.base64String) {
				await this.api_upload_image(capturedPhoto.base64String);
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
				
				await this.api_upload_multiple_image(imageResponse);
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
					const file = input.files[0];
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

	async api_upload_image(imgInfo: string) {
		try {
			const position = await this.getCurrentPosition();
			const tobeSubmit = {
				'account_id': localStorage.login_user_id,
				'token': localStorage.token,
				'imgInfo': imgInfo,
				'need_watermark': 1,
				...(position && { location: position })
			  };
			await this.one_image_upload(tobeSubmit);
		} catch (error) {
			console.error('Error in api_upload_image:', error);
			const tobeSubmit = {
			'account_id': localStorage.login_user_id,
			'token': localStorage.token,
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

	async one_image_upload(tobeSubmit: any) {
		try {
			const data = await this.httpClient.post(this.App.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).toPromise();
			if (data['status'] === "OK") {
				this.App.stopLoading(100);
				this.grnList[this.grnIndex].is_multiple_image = 1;
				this.grnList[this.grnIndex].MultipleImageUrl.push(data['result']['img_path']);
				if(this.camera_mode == 1) {
					await this.openCamera(CameraSource.Camera);
        }
				this.haveItemImages = true;
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
				'account_id': localStorage.login_user_id,
				'token': localStorage.token,
				'imgInfo': imgInfo,
				'need_watermark': 1,
				...(position && { location: position })
			  };
			await this.multiple_image_upload(tobeSubmit);
		} catch (error) {
			console.error('Error in api_upload_multiple_image:', error);
			const tobeSubmit = {
			'account_id': localStorage.login_user_id,
			'token': localStorage.token,
			'imgInfo': imgInfo,
				'need_watermark': 1
		  };
			await this.multiple_image_upload(tobeSubmit);
		}
	  }

	async multiple_image_upload(tobeSubmit: any) {
		try {
			const data = await this.httpClient.post(this.App.api_url + "/uploadMultipleImage", tobeSubmit, { observe: "body" }).toPromise();
			if (data['status'] === "OK") {
				this.App.stopLoading(100);
				this.grnList[this.grnIndex].is_multiple_image = 1;
				this.grnList[this.grnIndex].MultipleImageUrl = this.grnList[this.grnIndex].MultipleImageUrl.concat(JSON.parse(data['result']['img_path']));
				this.haveItemImages = true;
				this.saveDraft();
			} else {
				throw new Error(data['message'] || 'Upload failed');
			}
		} catch (error) {
			console.error('Error uploading multiple images:', error);
			await this.presentErrorAlert('Error', 'Failed to upload images');
						}
					}

	//upload photos if is tng
	async openActionSheet_tng(type) {
		this.takePhotofor = type;
		const actionSheet = await this.actionSheetController.create({
			cssClass: 'my-custom-class',
			buttons: [{
        text: 'Camera(Single Image)',
        role: 'camera',
        icon: 'camera',
        handler: () => {
          this.camera_mode = 0;
					this.openCamera_tng(CameraSource.Camera);
        }
			}, {
        text: 'Camera(Multiple Image)',
        role: 'camera',
        icon: 'camera',
        handler: () => {
          this.camera_mode = 1;
					this.openCamera_tng(CameraSource.Camera);
        }
      }, {
				text: 'Upload From Gallery',
				role: 'gallery',
				icon: 'images-outline',
				handler: () => {
					this.getImages_tng();
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

	async openCamera_tng(sourceType: CameraSource) {
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
					// 权限刚授予，等待一下
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
				saveToGallery: false,
			};

			const capturedPhoto = await Camera.getPhoto(options);
				this.App.presentLoading(100000);

			if (capturedPhoto.base64String) {
				await this.api_upload_image_tng(capturedPhoto.base64String);
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

	async getImages_tng() {
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
				
				await this.api_upload_multiple_image_tng(imageResponse);
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
					const file = input.files[0];
					const base64Data = await this.readFileAsBase64(file);
					await this.api_upload_image_tng(base64Data.split(',')[1]);
				} catch (error) {
					console.error('Error reading file:', error);
					await this.presentErrorAlert('Error', 'Failed to read file');
				} finally {
					this.App.stopLoading(100);
				}
			};
		}
	}

	async api_upload_image_tng(imgInfo: string) {
		try {
			const position = await this.getCurrentPosition();
			const tobeSubmit = {
				'account_id': localStorage.login_user_id,
				'token': localStorage.token,
				'imgInfo': imgInfo,
				'need_watermark': 1,
				'estimated_xau': this.estimated_XAU,
				...(position && { location: position })
			  };
			await this.one_image_upload_tng(tobeSubmit);
		} catch (error) {
			console.error('Error in api_upload_image_tng:', error);
			const tobeSubmit = {
			'account_id': localStorage.login_user_id,
			'token': localStorage.token,
			'imgInfo': imgInfo,
			'need_watermark': 1,
			'estimated_xau': this.estimated_XAU
		  };
			await this.one_image_upload_tng(tobeSubmit);
		}
	  }

	async one_image_upload_tng(tobeSubmit: any) {
		try {
			const data = await this.httpClient.post(this.App.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).toPromise();
			if (data['status'] === "OK") {
				this.App.stopLoading(100);
				this.is_multiple_image_tng = 1;

				if (this.takePhotofor === 0) {
					this.MultipleImageUrl_tng.push(data['result']['img_path']);
				} else if (this.takePhotofor === 1) {
					this.MultipleImageUrl_DO.push(data['result']['img_path']);
				} else if (this.takePhotofor === 2) {
					this.payment.image = data['result']['img_path'];
				}

				if (this.camera_mode === 1) {
					await this.openCamera_tng(CameraSource.Camera);
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

	async api_upload_multiple_image_tng(imgInfo: string[]) {
		try {
			const position = await this.getCurrentPosition();
			const tobeSubmit = {
				'account_id': localStorage.login_user_id,
				'token': localStorage.token,
				'imgInfo': imgInfo,
				'need_watermark': 1,
				'estimated_xau': this.estimated_XAU,
				...(position && { location: position })
			  };
			await this.multiple_image_upload_tng(tobeSubmit);
		} catch (error) {
			console.error('Error in api_upload_multiple_image_tng:', error);
			const tobeSubmit = {
			'account_id': localStorage.login_user_id,
			'token': localStorage.token,
			'imgInfo': imgInfo,
			'need_watermark': 1,
			'estimated_xau': this.estimated_XAU
		  };
			await this.multiple_image_upload_tng(tobeSubmit);
		}
	  }

	async multiple_image_upload_tng(tobeSubmit: any) {
		try {
			const data = await this.httpClient.post(this.App.api_url + "/uploadMultipleImage", tobeSubmit, { observe: "body" }).toPromise();
			if (data['status'] === "OK") {
				this.App.stopLoading(100);
				this.is_multiple_image_tng = 1;
				
				if (this.takePhotofor === 0) {
					this.MultipleImageUrl_tng = this.MultipleImageUrl_tng.concat(JSON.parse(data['result']['img_path']));
				} else if (this.takePhotofor === 1) {
					this.MultipleImageUrl_DO = this.MultipleImageUrl_DO.concat(JSON.parse(data['result']['img_path']));
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
			this.payment.signature = data.data;
			this.saveDraft();
		}));
		this.saveDraft();
	}

	getWarehouseColor(id) {
		let color = '';
		this.warehouseList.forEach(warehouse => {
			if (warehouse['warehouse_id'] == id) {
				color = warehouse['color'];
			}
		});
		return color;
	}
}
