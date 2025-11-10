import { Location } from "@angular/common";
import { HttpClient, HttpRequest } from "@angular/common/http";
import { Component, OnInit, ViewChild, Input, ElementRef } from "@angular/core";
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
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// import { StatusBar as CapacitorStatusBar } from '@capacitor/status-bar';
import { ModalController, NavController } from '@ionic/angular';
import { ConfigService } from "../config.service";
import { ModalsharedService } from "../modalshared.service";
import { Big } from 'big.js';

@Component({
  selector: 'app-modal-test',
  templateUrl: './modal-test.page.html',
  styleUrls: ['./modal-test.page.scss'],
})
export class ModalTestPage implements OnInit {

	@ViewChild('searchbar') searchbar: IonSearchbar;
	@Input('modalData') modalData: any;
	@Input('modalDataList') modalDataList: any;
	@Input('customerGoldPurityList') customerGoldPurityList: any;
	@Input('customerGoldPurityListBackup') customerGoldPurityListBackup: any;
	@Input('customerGoldPurityListBackupAll') customerGoldPurityListBackupAll: any;
	@Input('customerGoldPurityListAll') customerGoldPurityListAll: any;
	@Input('customerGoldPurityListAllBackup') customerGoldPurityListAllBackup: any;
	@Input('customerGoldPurityListAllAll') customerGoldPurityListAllAll: any;
	@Input('customerGoldPurityListAllAllBackup') customerGoldPurityListAllAllBackup: any;
	@Input('customerGoldPurityListAllAllBackupAll') customerGoldPurityListAllAllBackupAll: any;
	@Input('po_id') po_id: any;
	@Input('itemList') itemList: any;
	@Input('warehouseList') warehouseList: any;
	@Input('customerBItemTypeList') customerBItemTypeList: any;
	@ViewChild('gramInput', { static: false, read: ElementRef }) gramInput: ElementRef;

	isLoading: boolean = false;
	camera_mode: number = 0; // 0: single image, 1: multiple image
	grnIndex: number = 0;
	subcription: any;
	is_multiple_image: number = 0;
	imageUrl: string = '';
	MultipleImageUrl: string[] = [];
	isDefaultValueZero: boolean = false;
	haveItemImages: boolean = false;

	constructor(
		public alertController: AlertController,
		public httpClient: HttpClient,
		private platform: Platform,
		public modalController: ModalController,
		public actionSheetController: ActionSheetController,
		public loadingController: LoadingController,
		private config: ConfigService,
		private modalShared: ModalsharedService
	) { }

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

	async presentErrorAlert(title: string, message: string) {
		const alert = await this.alertController.create({
			cssClass: "successfulMessage",
			header: title,
			message: message,
			buttons: [
				{
					text: "OK",
					cssClass: "colosebutton",
					handler: () => { },
				},
			],
		});
		await alert.present();
	}

	async ngOnInit() {
		console.log('owo modalData',this.modalData);
		console.log('owo customerGoldPurityList',this.customerGoldPurityList);
		this.isDefaultValueZero = this.modalData.gram === 0;
		this.subcription = this.platform.backButton.subscribeWithPriority(10, () => {
			this.dismiss();
		});
		let index = this.modalDataList.findIndex(x => x.item_no == this.modalData.item_no);
		this.grnIndex = index;
		console.log(this.modalDataList);

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

	ionViewWillLeave() {
		this.subcription.unsubscribe();
	}
  	dismiss(id : any = 0) {
		this.modalController.dismiss(id);
	}

	async deleteItem(selectedItem){

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
						for(let i = 0; i < this.modalDataList.length; i++){
							if(this.modalDataList[i].item_no == selectedItem.item_no){
								theDeletedIndex = i;
								break;
							}
						}

						this.modalShared.changeMessage({"mode":"delete","data":theDeletedIndex});
						this.dismiss();
					},
				},
			],
		});
		await alert.present();
	}

	async openActionSheet() {
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

	//update the selected grn (copy from website)
	recalculate(selectedItem){

		if (this.isDefaultValueZero && selectedItem.gram !== 0) {
			this.isDefaultValueZero = false;
		}

		if (this.isDefaultValueZero) {
		this.gramInput.nativeElement.value = '';
		}

		//fixed the gram only 2 decimal
		 if(selectedItem.gram < 0){
                selectedItem.gram = 0;
            }

            //fixed the gram only 2 decimal
            if (selectedItem.gram != 0 && selectedItem.gram != '' && selectedItem.gram != null) {
                selectedItem.gram = Big(selectedItem.gram).round(2, 0).toNumber();
            }

		//prefill the related fields
		var selectedPresetPurity = this.customerGoldPurityList.filter(function(item){
			return item.gold_pure_id == selectedItem.item_code;
		});

		if(selectedPresetPurity.length > 0) {

			this.modalData.is_editable = selectedPresetPurity[0].is_editable;
			var final_percent = selectedPresetPurity[0].override_gold_pure_percent;
			if(selectedItem.gold_pure_percent !=  selectedPresetPurity[0].override_gold_pure_percent) {
			final_percent = selectedItem.gold_pure_percent;
			}

			selectedItem.gold_name = selectedPresetPurity[0].gold_name;
			selectedItem.gold_pure_id = selectedPresetPurity[0].gold_pure_id;
			selectedItem.gold_pure_percent = final_percent;
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

		// //calculate the total xau
		// this.priceUpdate();

	}

	recalculate_jewel(selectedItem) {

		//fixed the gram only 2 decimal
    if(selectedItem.gram < 0){
      selectedItem.gram = 0;
    }

    //fixed the gram only 2 decimal
    if (selectedItem.gram != 0 && selectedItem.gram != '' && selectedItem.gram != null) {
      selectedItem.gram = Big(selectedItem.gram).round(2, 0).toNumber();
    }

		//prefill the related fields
		var selectedPresetPurity = this.customerGoldPurityList.filter(function (item) {
			return item.gold_pure_id == selectedItem.item_code;
		});

		if (selectedPresetPurity.length > 0) {
			this.modalData.is_editable = selectedPresetPurity[0].is_editable;

			selectedItem.gold_name = selectedPresetPurity[0].gold_name;
			selectedItem.gold_pure_id = selectedPresetPurity[0].gold_pure_id;

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
    console.log('Item List:', this.itemList);
    // Find in itemList where item_code == selectedItem.item_code
    let foundItem = null;

    // Iterate over the itemList object
    for (const key in this.itemList) {
      if (this.itemList[key].item_code === selectedItem.item_code) {
        foundItem = this.itemList[key];
        break; // Exit the loop once the item is found
      }
    }

    if (foundItem) {
      console.log('Item found:', foundItem);
      selectedItem.purchase_order_id = foundItem.purchase_order_id;
    } else {
      console.log('Item not found. Defaulting to first PO ID.');
      selectedItem.purchase_order_id = this.po_id;
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

	async openCamera(sourceType: CameraSource) {
		try {
			console.log("openCamera");
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
				saveToGallery: false,
			};

			const capturedPhoto = await Camera.getPhoto(options);
			console.log('Photo captured successfully, starting upload...');
			this.isLoading = true;

			if (capturedPhoto.base64String) {
				await this.api_upload_image(capturedPhoto.base64String);
			} else {
				this.isLoading = false;
				await this.presentErrorAlert('Error', 'Failed to capture photo');
			}
		} catch (error) {
			console.error('Error capturing photo:', error);
			this.isLoading = false;
			await this.presentErrorAlert('Error', 'Failed to capture photo: ' + error.message);
		}
	}

	private readFileAsBase64(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === 'string') {
					resolve(reader.result);
				} else {
					reject(new Error('Failed to read file as base64'));
				}
			};
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	}

	private static async convertBlobToBase64(blob: Blob): Promise<string> {
		return new Promise((resolve, reject) => {
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
	}

	async getImages() {
		if ( this.platform.is('hybrid') ) {
			let options = {
				quality: 80,
				width: 640,
				limit: 10,
				resultType: CameraResultType.Base64
			};
			try {
				const capturedPhotos = await Camera.pickImages(options);
				let imageResponse = [];
				if (capturedPhotos.photos.length > 0) {
					this.isLoading = true;
					for (const photo of capturedPhotos.photos) {
						const response = await fetch(photo.webPath);
						const blob = await response.blob();
						const base64String = await ModalTestPage.convertBlobToBase64(blob) as string;
						imageResponse.push(base64String.split(',')[1]);
					}
					await this.api_upload_multiple_image(imageResponse);
				}
			} catch (err) {
				console.error('Error picking images:', err);
				this.isLoading = false;
				await this.presentErrorAlert('Error', 'Failed to pick images: ' + (err.message || "Unknown error"));
			}
		} else {
			let input = document.createElement('input');
			input.type = 'file';
			input.accept = "image/*";
			input.multiple = true;
			input.click();
			input.onchange = async () => {
				this.isLoading = true;
				const files = input.files;
				if (!files || files.length === 0) {
					this.isLoading = false;
					return;
				}

				try {
					let imageResponse = [];
					// 遍历所有选中的文件
					for (let i = 0; i < files.length; i++) {
						const file = files[i];
						const base64String = await this.readFileAsBase64(file);
						imageResponse.push(base64String.split(',')[1]);
					}
					// 使用多图上传API
					await this.api_upload_multiple_image(imageResponse);
				} catch (error) {
					console.error('Error:', error);
					this.isLoading = false;
					this.presentErrorAlert('Error', 'Failed to read image files');
				}
			};
		}
	}

	async showAlert(title, msg) {
		const alert = await this.alertController.create({
			cssClass: "successfulMessage",
			header: title,
			message: msg,
			buttons: [
				{
					text: "OK",
					cssClass: "colosebutton",
					handler: () => { },
				},
			],
		});
		await alert.present();
	}

	async api_upload_image(imgInfo) {
	try {
	const location = await this.getCurrentPosition();
			const tobeSubmit = {
	'account_id': localStorage['login_user_id'],
	'token': localStorage['token'],
	'imgInfo': imgInfo,
	'need_watermark': 1,
	...(location && { location })
	};
	await this.one_image_upload(tobeSubmit);
	} catch (error) {
	console.error('Error in api_upload_image:', error);
	this.isLoading = false;
	await this.presentErrorAlert('Error', 'Failed to upload image: ' + error.message);
	}
	}

  async one_image_upload(tobeSubmit: any) {
  try {
  console.log('Starting upload to API:', this.config.appConfig.api_url + "/uploadImage");
  const data = await this.httpClient.post(this.config.appConfig.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).toPromise();
  console.log('Upload response:', data);
  
  if (data['status'] === "OK") {
  this.isLoading = false;
  // Multiple Image
  this.modalDataList[this.grnIndex].is_multiple_image = 1;
  var imageData = {
  'image': data['result']['img_path'],
  'remark': ''
  };
  this.modalDataList[this.grnIndex].MultipleImageUrl.push(imageData);
				console.log('Upload successful, image added to:', data['result']['img_path']);
  this.haveItemImages = true;

  if(this.camera_mode == 1) {
  await this.openCamera(CameraSource.Camera);
  }
  } else {
  this.isLoading = false;
  throw new Error(data['message'] || 'Upload failed');
  }
  } catch (error) {
  console.error('Error uploading image:', error);
  this.isLoading = false;
  await this.presentErrorAlert('Error', 'Failed to upload image: ' + error.message);
  }
  }

	async api_upload_multiple_image(imgInfo) {
		try {
			const location = await this.getCurrentPosition();
			const tobeSubmit = {
				'account_id': localStorage['login_user_id'],
				'token': localStorage['token'],
				'imgInfo': imgInfo,
				'need_watermark': 1,
				...(location && { location })
			};
			await this.multiple_image_upload(tobeSubmit);
		} catch (error) {
			console.error('Error in api_upload_multiple_image:', error);
			this.isLoading = false;
			await this.presentErrorAlert('Error', 'Failed to upload images: ' + error.message);
		}
	}

  async multiple_image_upload(tobeSubmit: any) {
		try {
			console.log('Starting multiple upload to API:', this.config.appConfig.api_url + "/uploadMultipleImage");
			const data = await this.httpClient.post(this.config.appConfig.api_url + "/uploadMultipleImage", tobeSubmit, { observe: "body" }).toPromise();
			console.log('Multiple upload response:', data);
			
			if (data['status'] === "OK") {
				this.isLoading = false;
				this.modalDataList[this.grnIndex].is_multiple_image = 1;
				console.log(data['result']['img_path'], typeof data['result']['img_path']);

				try {
					let imgPaths = JSON.parse(data['result']['img_path']);
					imgPaths.forEach((path) => {
						const imageData = {
							'image': path,
							'remark': ''
						};
						this.modalDataList[this.grnIndex].MultipleImageUrl.push(imageData);
					});
					this.haveItemImages = true;
					console.log('Multiple images uploaded successfully');
				} catch (error) {
					console.error('Error parsing image paths:', error);
					throw new Error("Failed to process uploaded images");
				}
			} else {
				this.isLoading = false;
				throw new Error(data['message'] || 'Failed to upload images');
			}
		} catch (error) {
			console.error('Error uploading multiple images:', error);
			this.isLoading = false;
			await this.presentErrorAlert('Error', 'Failed to upload images: ' + error.message);
		}
	}

	delete_img(img_path) {
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
					console.log('Confirm Ok Multiple');
					let index = this.modalData.MultipleImageUrl.indexOf(img_path);
					if (index !== -1) {
						this.modalData.MultipleImageUrl.splice(index, 1);
					}
					for (let i = 0; i < this.modalDataList.length; i++) {
						this.haveItemImages = false;
						if(this.modalDataList[i].MultipleImageUrl.length > 0){
							this.haveItemImages = true;
							break;
						}
					}
				}
			}]
		}).then(alert => alert.present());
	}

}
