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
// import { StatusBar as CapacitorStatusBar } from '@capacitor/status-bar';
import { ModalController, NavController } from '@ionic/angular';
import { ModalSignaturePage } from "../modal-signature/modal-signature.page";
import { ModalPendingReweightPage } from '../modal-pending-reweight/modal-pending-reweight.page';
import { ModalsharedService } from '../modalshared.service';
import { Big } from 'big.js';
import { ConfigService } from '../config.service';

@Component({
	selector: 'app-bullion-pending-reweight-detail',
	templateUrl: './bullion-pending-reweight-detail.page.html',
	styleUrls: ['./bullion-pending-reweight-detail.page.scss'],
})
export class BullionPendingReweightDetailPage implements OnInit {

	goods_received_note_id = this.route.snapshot.paramMap.get("goods_received_note_id");
	grnData: any = { total_XAU: 0, remark: '' };
  	po_id = 0;
  	itemList = [];
	all_po_id = [];
	grnDetailList = [];
	seniorRiderList = [];
	customerBItemTypeList = [];
	customerGoldPurityList = [];

	warehouseList = [];

  camera_mode = 0;

	customer_balance_XAU: 0;
	customerName: any;

	//for image index
	grnIndex = 0;

	selected_rider : any = 0;

	is_admin = 0;
	need_QC = true;
	internalRemarkShow = false;

	gmsakToken = "";

	formData = {

		//for display
		'total_gram': 0,
		'total_XAU': 0,

		//data to be submit
		'remark': '',
		'rounding_xau': 0,
		'detailList': [],

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
	haveItemImages: any = false;

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
		public location: Location,
		private navCtrl: NavController,
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
				this.calculate_summary();
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
      itemList: this.itemList,
      all_po_id: this.all_po_id,
      grnDetailList: this.grnDetailList,
      seniorRiderList: this.seniorRiderList,
      customerBItemTypeList: this.customerBItemTypeList,
      customerGoldPurityList: this.customerGoldPurityList,
      warehouseList: this.warehouseList,
      customer_balance_XAU: this.customer_balance_XAU,
      customerName: this.customerName,
      grnIndex: this.grnIndex,
      selected_rider: this.selected_rider,
      is_admin: this.is_admin,
      need_QC: this.need_QC,
      gmsakToken: this.gmsakToken,
      formData: this.formData,
      takePhotofor: this.takePhotofor,
      ShowImageUrl_tng: this.ShowImageUrl_tng,
      haveItemImages: this.haveItemImages,
    };

    localStorage.setItem(`bullionReweightDraft_${this.goods_received_note_id}`, JSON.stringify(draft));
    console.log('Save Draft');
  }

  loadDraft() {
    const draft = JSON.parse(localStorage.getItem(`bullionReweightDraft_${this.goods_received_note_id}`));
    if (draft) {
      this.goods_received_note_id = draft.goods_received_note_id || this.goods_received_note_id;
      this.grnData = draft.grnData || {};
      this.po_id = draft.po_id || 0;
      this.itemList = draft.itemList || [];
      this.all_po_id = draft.all_po_id || [];
      this.grnDetailList = draft.grnDetailList || [];
      this.seniorRiderList = draft.seniorRiderList || [];
      this.customerBItemTypeList = draft.customerBItemTypeList || [];
      this.customerGoldPurityList = draft.customerGoldPurityList || [];
      this.warehouseList = draft.warehouseList || [];
      this.customer_balance_XAU = draft.customer_balance_XAU || 0;
      this.customerName = draft.customerName || '';
      this.grnIndex = draft.grnIndex || 0;
      this.selected_rider = draft.selected_rider || 0;
      this.is_admin = draft.is_admin || 0;
      this.need_QC = draft.need_QC || true;
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

      console.log('Draft Loaded');
    }
  }



  get_grn_data() {
		this.App.presentLoading();
		this.httpClient
			.get(
				this.App.api_url + "/appGetPendingReweightGrnData/" + this.goods_received_note_id + "/" + localStorage['token'])
			.subscribe(
				(data: any) => {
          this.warehouseList = data.result["warehouseList"];
          this.seniorRiderList = data.result["seniorRiderList"];
          this.customerBItemTypeList = data.result["customerBItemTypeList"];
          this.customerGoldPurityList = data.result["customerGoldPurityList"];

          this.customer_balance_XAU = data.result["XAU_balance"];
          this.customerName = data.result['customerName'];
          this.is_admin = data.result['is_admin'];
          const savedDraft = localStorage.getItem(`bullionReweightDraft_${this.goods_received_note_id}`);
          if(!savedDraft){
            this.grnData = data.result["grnData"];
            if(this.grnData['MultipleImageUrl_tng'] !== null){
              this.grnData['MultipleImageUrl_tng'] = JSON.parse(this.grnData['MultipleImageUrl_tng'])
            }else if(this.grnData['MultipleImageUrl_tng'] == null){
              this.grnData['MultipleImageUrl_tng'] = [];
            }
            this.po_id = this.grnData['purchase_order_id'];
            this.grnDetailList = data.result["grnDetailList"];
            this.all_po_id = data.result['all_po_id'];

            //set old grn detail list data into current detail list
            this.set_default_list();
          }

				},
				(error) => {
					this.loadingController.dismiss();
					console.log(error);
				}
			);
	}

	getGeolocation() {
		this.App.presentLoading();
		// Use browser native geolocation API for compatibility with Capacitor 3.x and above.
		// Reason: @ionic-native/geolocation is deprecated and may cause version conflicts. navigator.geolocation is supported in all modern browsers and hybrid apps.
		if (navigator.geolocation) {
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
				(error) => {
					// this.App.presentAlert_default('ERROR', error, "assets/attention-icon.svg");
					// this.App.presentAlert_default('ERROR', 'Make sure your GPS is open', "assets/attention-icon.svg");
					console.log('Error getting location', error);
				}
			);
		}
	}

	set_default_list() {

		if (this.grnDetailList) {
			var itemList = [];
			var item_num = 0;

			this.grnDetailList.forEach(function (v, k) {
				item_num += 1;

				var itemData = {
					item_no : item_num,
					item_type : v.item_type_id,
					item_code : v.gold_pure_id,
          gram : parseFloat(v.weight),
          previous_gram : parseFloat(v.previous_weight),
					gold_name : v.gold_name,
					gold_pure_id: v.gold_pure_id,
					gold_pure_percent : parseFloat(v.gold_pure_percentage),
					XAU_amount : parseFloat(v.XAU),
					purchase_order_id : v.purchase_order_id,
					barcode : v.barcode,
					pw_barcode : v.pw_barcode,
					related_po_id : v.related_po_id,
					is_multiple_image : v.is_multiple_image,
					imageUrl : v.image,
					MultipleImageUrl : (v.multiple_image)?JSON.parse(v.multiple_image):[],
					warehouse_id : v.warehouse_id,
				};
				itemList.push(itemData);
			});
      this.itemList = itemList;
			this.formData.detailList = itemList;
			this.checkTBCWarehouse();
			var checkhavemultiple = this.formData.detailList.filter((item) => item.MultipleImageUrl.length > 0);
			if(checkhavemultiple.length > 0){
				this.haveItemImages = true;
			}

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
			gold_pure_percent: "",
			gold_pure_id: "",
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

	//update the selected grn (copy from website)
	recalculate(selectedItem) {
    if(selectedItem.gram < 0){
      selectedItem.gram = 0;
    }

    //fixed the gram only 2 decimal
    if (selectedItem.gram != 0 && selectedItem.gram != '' && selectedItem.gram != null) {
      selectedItem.gram = Big(selectedItem.gram).round(2, 0).toNumber();
    }

		//prefill the related fields
		var selectedPresetPurity = this.customerGoldPurityList.filter(function (item) {
			return item.id == selectedItem.item_code;
		});

		if (selectedPresetPurity.length > 0) {
			selectedItem.gold_name = selectedPresetPurity[0].gold_name;

			selectedItem.gold_pure_percent = selectedPresetPurity[0].override_gold_pure_percent;
      if(selectedItem.gold_pure_percent < 0){
        selectedItem.gold_pure_percent = 0;
      }else{
        if(selectedItem.gold_pure_percent){
          selectedItem.gold_pure_percent = Big(selectedItem.gold_pure_percent).round(2, 0).toNumber();
        }
      }
       if(selectedItem.gram != '' && selectedItem.gram != null){
        selectedItem.XAU_amount = Big(selectedItem.gram).mul(Big(selectedItem.gold_pure_percent).div(100)).round(3, 0).toNumber();
      }
    }

		this.calculate_summary();
    this.saveDraft();
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

	calculate_summary() {

		var total_gram = 0;
		var total_XAU = 0;
		var rounding_xau = 0;

    this.formData.detailList.forEach(function (v, k) {
      if(v.gram > 0){
        total_gram = Big(total_gram).plus(v.gram).round(2, 0).toNumber();
        total_XAU = Big(total_XAU).plus(v.XAU_amount).round(3, 0).toNumber();
      }
    });

    //if type of this.formData.rounding_xau is string, then convert to float
    //if type of this.formData.rounding_xau is string, then convert to float
    if (typeof this.formData.rounding_xau == "string") {
      this.formData.rounding_xau = Big(this.formData.rounding_xau).toNumber();
    }

    rounding_xau = this.formData.rounding_xau;

    this.formData['total_gram'] = total_gram;
    this.formData['total_XAU'] = Big(total_XAU).plus(rounding_xau).round(3, 0).toNumber();

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

	async removeDetail(index) {

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

	async view_detail(item) {

		//console.log(item);

		const modal = await this.modalController.create({
			component: ModalPendingReweightPage,
			componentProps: {
				modalData: item,
        po_id: this.po_id,
        itemList: this.itemList,
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
			this.checkTBCWarehouse();
      this.saveDraft();
		}));

	}

	async openActionSheet(is_GRN,index) {
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

      // StatusBar调用已移除
      // CapacitorStatusBar.setOverlaysWebView({ overlay: true });
      // CapacitorStatusBar.setOverlaysWebView({ overlay: false });

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

        // StatusBar调用已移除
        // CapacitorStatusBar.setOverlaysWebView({ overlay: true });
        // CapacitorStatusBar.setOverlaysWebView({ overlay: false });

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
          this.App.presentLoading(10000);
          // StatusBar调用已移除
          // CapacitorStatusBar.setOverlaysWebView({ overlay: true });
          // CapacitorStatusBar.setOverlaysWebView({ overlay: false });

          const files = Array.from(input.files);
          if (!files || files.length === 0) {
            this.App.stopLoading(100);
            return;
          }
          
          const imageResponse = await Promise.all(
            files.map(file => this.readFileAsBase64(file))
          );
          
          const base64Images = imageResponse.map(data => data.split(',')[1]);
          await this.api_upload_multiple_image(base64Images);
        } catch (error) {
          console.error('Error reading files:', error);
          this.App.stopLoading(100);
          await this.presentErrorAlert('Error', 'Failed to read files');
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
        if(this.takePhotofor == 0){ //if take photo for grn
          this.formData.detailList[this.grnIndex].is_multiple_image = 1;
          this.formData.detailList[this.grnIndex].MultipleImageUrl.push(data['result']['img_path']);
          this.haveItemImages = true;
        }else{ //if take photo for TNG
          this.grnData['is_multiple_image_tng'] = 1;
          this.grnData['MultipleImageUrl_tng'].push(data['result']['img_path']);
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
        if(this.takePhotofor == 0){ //if take photo for grn
          this.formData.detailList[this.grnIndex].is_multiple_image = 1;
          this.formData.detailList[this.grnIndex].MultipleImageUrl = this.formData.detailList[this.grnIndex].MultipleImageUrl.concat(JSON.parse(data['result']['img_path']));
          this.haveItemImages = true;
        }else{ //if take photo for TNG
          this.grnData['is_multiple_image_tng'] = 1;
          this.grnData['MultipleImageUrl_tng'] = this.grnData['MultipleImageUrl_tng'].concat(JSON.parse(data['result']['img_path']));
        }
        this.saveDraft();
      } else {
        throw new Error(data['message'] || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading multiple images:', error);
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


		this.httpClient.post(this.App.api_url + "/uploadMultipleImage_testing", tobeSubmit, { observe: "body" }).subscribe((data) => {
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

	delete_img(is_GRN, img_path, target_index) {
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
					}else{
						let index = this.grnData['MultipleImageUrl_tng'].indexOf(img_path);
						if (index !== -1) {
							this.grnData['MultipleImageUrl_tng'].splice(index, 1);
						}
						if (this.ShowImageUrl_tng == img_path) {
							this.ShowImageUrl_tng = '';
						}
					}
          this.saveDraft();
				}
			}]
		}).then(alert => alert.present());
	}

	submit_now() {

		this.submitted = true;

		this.formData.detailList = this.formData.detailList.map(({ item_no, ...rest }) => rest);

		let tobeSubmit = {
			'MultipleImageUrl_tng': this.grnData['MultipleImageUrl_tng'],
			'company_id': localStorage['default_company_id'],
			'token': localStorage['token'],
			"detailList": this.formData.detailList,
			"remark": this.grnData['remark'],
			'rounding_xau': this.formData.rounding_xau,
			"goods_received_note_id": this.goods_received_note_id,
			'geolocation_lat': this.formData.geolocation_lat,
			'geolocation_lng': this.formData.geolocation_lng,
			'geolocation_photo': this.formData.geolocation_photo,
			'need_QC': this.need_QC,
			'selected_rider': this.selected_rider,
			'all_po_id': this.all_po_id,
		}
		console.log("tobeSubmit", tobeSubmit);

		if(this.need_QC == false && this.selected_rider == 0){
			this.App.presentAlert_default('Select Rider', "Please select a driver for QC", "assets/gg-icon/attention-icon.svg");
			this.submitted = false;
		}else{
			this.App.presentLoading();

			this.httpClient.post(this.App.api_url + "/appSubmitPendingReweightGrnData", tobeSubmit, { observe: "body" }).subscribe((data: any) => {

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

					//remoeve draft
					localStorage.removeItem(`bullionReweightDraft_${this.goods_received_note_id}`);

					this.router.navigate(["/bullion-pending-reweight/",]);

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

	getWarehouseColor(id) {
		let color = '';
		this.warehouseList.forEach(warehouse => {
			if (warehouse['warehouse_id'] == id) {
				color = warehouse['color'];
			}
		});
		return color;
	}

	checkTBCWarehouse(){
		let has_TBC = false;
		for (const item of this.formData.detailList) {
			if (item['warehouse_id'] == '3') {
				this.need_QC = true;
				has_TBC = true;
				break;
			}
		}
		if(has_TBC == false && this.need_QC == false){
			this.need_QC = true;
		}else if(has_TBC == false && this.need_QC == true){
			this.need_QC = false;
		}
    this.saveDraft();
	}
}
