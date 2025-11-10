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
import { ModalQcPage } from "../modal-qc/modal-qc.page";
import { ConfigService } from '../config.service';

@Component({
	selector: 'app-bullion-pending-tbc-detail',
	templateUrl: './bullion-pending-tbc-detail.page.html',
	styleUrls: ['./bullion-pending-tbc-detail.page.scss'],
})
export class BullionPendingTBCDetailPage implements OnInit {

	goods_received_note_id = this.route.snapshot.paramMap.get("goods_received_note_id");
	grnData: any = {
    'is_approved': 0,
    'total_XAU': 0,
    'type': ''
  };
	grnDetailList = [];
	seniorRiderList = [];
	customerBItemTypeList = [];
	customerGoldPurityList = [];
	previous_not_yet_completed = [];
	warehouseList = [];

	customer_balance_XAU: 0;
	customerName: any;

	//for image index
	grnIndex = 0;

	is_admin = 0;
  userData = {
    'department': 1,
    'department_level': 0
  };

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
	haveItemImages: any;
  camera_mode = 0;

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
		private config: ConfigService
	) { }

	async ngOnInit() {
    // await this.checkPermissions();
		this.gmsakToken = localStorage['googleApiKey'] || '';
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
          if (!this.grnData['MultipleImageUrl_tng']) {
            this.grnData['MultipleImageUrl_tng'] = [];
          }
          this.grnData['is_multiple_image_tng'] = 1;
          this.grnData['MultipleImageUrl_tng'].push(data['result']['img_path']);
        }
        if(this.camera_mode == 1){
          await this.openCamera(CameraSource.Camera, true);
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
        const uploadedImages = JSON.parse(data['result']['img_path']);
        
        if(this.takePhotofor == 0){ //if take photo for grn
          this.formData.detailList[this.grnIndex].is_multiple_image = 1;
          if (!this.formData.detailList[this.grnIndex].MultipleImageUrl) {
            this.formData.detailList[this.grnIndex].MultipleImageUrl = [];
          }
          this.formData.detailList[this.grnIndex].MultipleImageUrl = this.formData.detailList[this.grnIndex].MultipleImageUrl.concat(uploadedImages);
          this.haveItemImages = true;
        }else{ //if take photo for TNG
          if (!this.grnData['MultipleImageUrl_tng']) {
            this.grnData['MultipleImageUrl_tng'] = [];
          }
          this.grnData['is_multiple_image_tng'] = 1;
          this.grnData['MultipleImageUrl_tng'] = this.grnData['MultipleImageUrl_tng'].concat(uploadedImages);
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

	ionViewWillEnter() {
		this.get_grn_data();
		this.getGeolocation();
	}

	get_grn_data() {
		this.App.presentLoading();
		this.httpClient
			.get(
				this.App.api_url + "/appGetPendingTBCGrnData/" + this.goods_received_note_id + "/" + localStorage['token'])
			.subscribe(
				(data: any) => {

					this.grnData = data.result["grnData"];
					if(this.grnData['MultipleImageUrl_tng'] !== null){
						this.grnData['MultipleImageUrl_tng'] = JSON.parse(this.grnData['MultipleImageUrl_tng'])
					}else if(this.grnData['MultipleImageUrl_tng'] == null){
						this.grnData['MultipleImageUrl_tng'] = [];
					}
					this.grnDetailList = data.result["grnDetailList"];
					this.warehouseList = data.result["warehouseList"];
					this.seniorRiderList = data.result["seniorRiderList"];
					this.customerBItemTypeList = data.result["customerBItemTypeList"];
					this.customerGoldPurityList = data.result["customerGoldPurityList"];
					this.previous_not_yet_completed = data.result['previous_not_yet_completed'];
					this.customer_balance_XAU = data.result["XAU_balance"];
					this.customerName = data.result['customerName'];
					this.is_admin = data.result['is_admin'];
          this.userData = data.result['userData'];

					//set rounding xau
					if (this.grnData['rounding_xau']) {
						this.formData.rounding_xau = parseFloat(this.grnData['rounding_xau']);
					}

					//set old grn detail list data into current detail list
					this.set_default_list();
				},
				(error) => {
					this.loadingController.dismiss();
					console.log(error);
				}
			);
	}

	getGeolocation() {
		this.App.presentLoading();
		this.getCurrentPosition().then((resp) => {

			this.formData.geolocation_lat = resp.latitude.toString();
			this.formData.geolocation_lng = resp.longitude.toString();

			let deviceLatLng = this.formData.geolocation_lat + "," + this.formData.geolocation_lng;

			this.formData.geolocation_photo =
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

	set_default_list() {

		if (this.grnDetailList) {
			var itemList = [];
			var item_num = 0;

			for (const [key, v] of Object.entries(this.grnDetailList)) {
				item_num += 1;

				let item_code = v.item_code;
				if(v.item_code == undefined){
					item_code = v.customer_gold_pure_id;
				}
				var itemData = {
					goods_received_note_detail_id : v.goods_received_note_detail_id,
					item_no : item_num,
					item_type : v.item_type_id,
					item_code : item_code,
					gram : parseFloat(v.weight),
					gold_name : v.gold_name,
					gold_pure_percent : parseFloat(v.gold_pure_percentage),
					XAU_amount : parseFloat(v.XAU),
					purchase_order_id : v.purchase_order_id,
					related_po_id : v.related_po_id,
					is_multiple_image : 1,
					imageUrl : null,
					MultipleImageUrl : [],
					warehouse_id : v.warehouse_id,
				};
				itemList.push(itemData);
			}
			this.formData.detailList = itemList;
			console.log(this.formData.detailList);
			var checkhavemultiple = this.formData.detailList.filter((item) => item.MultipleImageUrl.length > 0);
			if(checkhavemultiple.length > 0){
				this.haveItemImages = true;
			}

			this.calculate_summary();
		}
	}

  async view_detail(item) {

    console.log(item);

  }

	calculate_summary() {

		var total_gram = 0;
		var total_XAU = 0;
		var rounding_xau = 0;

		this.formData.detailList.forEach(function (v, k) {
			total_gram += v.gram;
			total_XAU += v.XAU_amount;
		});

		//calculate rounding_xau
		if (this.formData.rounding_xau) {
			rounding_xau = this.formData.rounding_xau;
		}

		this.formData['total_gram'] = total_gram;
		this.formData['total_XAU'] = total_XAU + rounding_xau;

		return {
			'total_gram': this.formData['total_gram'],
			'total_XAU': this.formData['total_XAU'],
		}
	}

	view_GRN() {

		this.App.presentLoading();
		if(this.grnData['type'] == 'tng' && this.grnData['is_verified_item_weight'] == 0){
			this.router.navigate(["/weight-detail/",this.grnData['goods_received_note_id']]);
		}else if(this.grnData['type'] == 'tng' && this.grnData['is_verified_item_weight'] == 1){
			this.router.navigate(["/test-detail/",this.grnData['goods_received_note_id']]);
		}else if(this.grnData['type'] == 'collection'){
			this.router.navigate(["/bullion-pending-reweight-detail/",this.grnData['goods_received_note_id']]);
		}else if(this.grnData['type'] == 'reweight'){
			this.router.navigate(["/bullion-pending-check-detail/",this.grnData['goods_received_note_id']]);
		}
	}

  async approveOrRejectTBC(status) {
    // Ask for confirmation
    const alert = await this.alertController.create({
      header: 'Confirm Action',
      message: `Are you sure you want to ${status === 1 ? 'approve' : 'reject'} this item?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Action cancelled');
          }
        }, {
          text: 'Confirm',
          handler: () => {
            let tobeSubmit: any = {
              'goods_received_note_id': this.grnData['goods_received_note_id'],
              'token': localStorage['token'],
              'status': status,
            }
            this.httpClient.post(this.App.api_url + "/approveOrRejectTBC" , tobeSubmit, { observe: "body" })
              .subscribe((data: any) => {
                  this.router.navigate(["/bullion-pending-tbc"]);
                },
                (error) => {
                  console.log(error);
                });
          }
        }
      ]
    });

    await alert.present();
  }

  async submitRejectedTBC() {
    // Ask for confirmation
    const alert = await this.alertController.create({
      header: 'Confirm Action',
      message: `Are you sure you want to confirm this GRN items?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Action cancelled');
          }
        }, {
          text: 'Confirm',
          handler: () => {
            let tobeSubmit: any = {
              'goods_received_note_id': this.grnData['goods_received_note_id'],
              'token': localStorage['token'],
              'grnDetailList': this.grnDetailList
            }
            console.log(tobeSubmit);
            this.httpClient.post(this.App.api_url + "/appSubmitRejectedTBC" , tobeSubmit, { observe: "body" })
              .subscribe((data: any) => {
                  // this.router.navigate(["/bullion-pending-tbc"]);
                },
                (error) => {
                  console.log(error);
                });
          }
        }
      ]
    });

    await alert.present();
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

