import { Location } from "@angular/common";
import { HttpClient, HttpRequest } from "@angular/common/http";
import { Component, OnInit, ViewChild, Input, ElementRef} from "@angular/core";
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
import { Camera, CameraResultType, CameraSource, GalleryPhoto, Photo } from '@capacitor/camera';
// import { StatusBar as CapacitorStatusBar } from '@capacitor/status-bar';
import { ModalController, NavController } from '@ionic/angular';
import { ConfigService } from "../config.service";
import { ModalsharedService } from "../modalshared.service";
import { Big } from 'big.js';

@Component({
  selector: 'app-modal-task',
  templateUrl: './modal-task.page.html',
  styleUrls: ['./modal-task.page.scss'],
})
export class ModalTaskPage implements OnInit {

  @Input("modalData") modalData;
  @Input("itemList") itemList;
  @Input("index") index;
//   @Input("warehouseList") warehouseList;
  @Input("customerGoldPurityList") customerGoldPurityList;
  @ViewChild('gramInput', { static: false, read: ElementRef }) gramInput: ElementRef;

	isLoading = false;
	taskIndex = 0;
	subcription:any;
	is_multiple_image = 0;
	imageUrl = '';
	MultipleImageUrl = [];
	isDefaultValueZero = true;
	haveItemImages = false;

	constructor(
		public alertController: AlertController,
		public httpClient: HttpClient,
		private platform: Platform,
		public modalController: ModalController,
		public actionSheetController: ActionSheetController,
		public loadingController: LoadingController,
		public location: Location,
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

	async ngOnInit() {
		//console.log('owo modalData',this.modalData);
		//console.log('owo customerGoldPurityList',this.customerGoldPurityList);
		this.isDefaultValueZero = this.modalData.gram === 0;

		this.subcription = this.platform.backButton.subscribeWithPriority(10, () => {
			this.dismiss();
		});

		console.log(this.itemList)

		this.taskIndex = this.index;

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
						let theDeletedIndex = this.index;
						for(let i = 0; i < this.itemList.length; i++){
							if(i == theDeletedIndex){
								this.itemList.splice(i, 1);
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

	//update the selected grn (copy from website)
	recalculate(item) {

		// // Check if the item appears more than once in the BSOitemList
		// const itemCount = this.BSOitemList.filter(bsoItem => bsoItem.gold_pure_id === item.gold_pure_id).length;

		// // If the item appears more than once, prompt the user and return early
		// if (itemCount > 1) {
		// 	alert('This gold has already been added.');
		// 	item.gold_pure_id = 0;
		// 	return;
		// }

		//prefill the related fields
		var selectedPresetPurity = this.customerGoldPurityList.filter(function (gold) {
			return item.gold_pure_id == gold.gold_pure_id;
		});

		if (selectedPresetPurity.length > 0) {
			item.gold_name = selectedPresetPurity[0].gold_name;
			item.gold_pure_name = selectedPresetPurity[0].gold_name;
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

			console.log(item);
			//calculate XAU
			if(item.billing_wgt > 0 && item.gold_percentage > 0){
				item.XAU = Big(item.billing_wgt).mul(Big(item.gold_percentage).div(100)).round(3, 0).toNumber();
			}
			item.weight = Big(item.weight).round(2, 0).toNumber();
			item.billing_wgt = Big(item.billing_wgt).round(2, 0).toNumber();
		}
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
		console.log("openCamera");

		let options = {
			quality: 80,
			resultType: CameraResultType.Base64,
			source: sourceType,
			width: 640,
			allowEditing: false,
			correctOrientation: true,
			saveToGallery: true
		};
		try {
			const capturedPhoto = await Camera.getPhoto(options);
			// CapacitorStatusBar.setOverlaysWebView({ overlay: true });
			// CapacitorStatusBar.setOverlaysWebView({ overlay: false });
			if (capturedPhoto.base64String) {
				this.isLoading = true;
				await this.api_upload_image(capturedPhoto.base64String);
			} else {
				await this.showAlert("Error", "Failed to capture photo");
			}
		} catch (err) {
			console.error('Error capturing photo:', err);
			await this.showAlert("Error", 'Failed to capture photo: ' + err.message);
		}
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
				// CapacitorStatusBar.setOverlaysWebView({ overlay: true });
				// CapacitorStatusBar.setOverlaysWebView({ overlay: false });
				let imageResponse = [];
				if (capturedPhotos.photos.length > 0) {
					this.haveItemImages = true;
					this.isLoading = true;
					for (const photo of capturedPhotos.photos) {
						const response = await fetch(photo.webPath);
						const blob = await response.blob();
						const base64String = await ModalTaskPage.convertBlobToBase64(blob) as string;
						imageResponse.push(base64String.split(',')[1]);
					}
					await this.api_upload_multiple_image(imageResponse);
				}
			} catch (err) {
				console.error('Error picking images:', err);
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
					imageResponse.push(base64String.split(",")[1]);
				}
				// 使用多图上传API
				await this.api_upload_multiple_image(imageResponse);
			} catch (error) {
				console.error("Error:", error);
				this.isLoading = false;
				this.showAlert("Error", "Failed to read image files");
			}
		};
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

	api_upload_image(imgInfo) {
		return new Promise((resolve, reject) => {
			this.isLoading = true;

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
						this.one_image_upload(tobeSubmit).then(resolve).catch(reject);
        },
        (error) => {
						console.warn('Geolocation error:', error);
						let tobeSubmit = {
							'account_id': localStorage['login_user_id'],
							'token': localStorage['token'],
							'imgInfo': imgInfo,
							'need_watermark': 1
						};
						this.one_image_upload(tobeSubmit).then(resolve).catch(reject);
					},
					{
						timeout: 5000,
						enableHighAccuracy: false
        }
      );
			} else {
      let tobeSubmit = {
        'account_id': localStorage['login_user_id'],
        'token': localStorage['token'],
        'imgInfo': imgInfo,
					'need_watermark': 1
      };
				this.one_image_upload(tobeSubmit).then(resolve).catch(reject);
    }
		});
	}

  one_image_upload(tobeSubmit) {
		return new Promise((resolve, reject) => {
			this.httpClient.post(this.config.appConfig.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).subscribe(
				(data: any) => {
					this.isLoading = false;
      if (data['status'] == "OK") {
        // Multiple Image
        this.itemList[this.taskIndex].is_multiple_image = 1;
        this.itemList[this.taskIndex].MultipleImageUrl.push(data['result']['img_path']);
        console.log(this.modalData.MultipleImageUrl);
        this.haveItemImages = true;
						resolve(data);
      } else {
						this.showAlert("Error", data['result'] || "Failed to upload image. Please try again.");
						reject(new Error(data['result'] || 'Failed to upload image'));
					}
				},
				error => {
        this.isLoading = false;
					this.showAlert("Error", "Connection error. Please check your internet connection and try again.");
					reject(error);
				}
			);
		});
	}

	api_upload_multiple_image(imgInfo) {
		return new Promise((resolve, reject) => {
			this.isLoading = true;

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
						this.multiple_image_upload(tobeSubmit).then(resolve).catch(reject);
        },
        (error) => {
						console.warn('Geolocation error:', error);
						let tobeSubmit = {
							'account_id': localStorage['login_user_id'],
							'token': localStorage['token'],
							'imgInfo': imgInfo,
							'need_watermark': 1
						};
						this.multiple_image_upload(tobeSubmit).then(resolve).catch(reject);
					},
					{
						timeout: 5000,
						enableHighAccuracy: false
        }
      );
			} else {
      let tobeSubmit = {
        'account_id': localStorage['login_user_id'],
        'token': localStorage['token'],
        'imgInfo': imgInfo,
					'need_watermark': 1
      };
				this.multiple_image_upload(tobeSubmit).then(resolve).catch(reject);
    }
		});
	}

  multiple_image_upload(tobeSubmit) {
		return new Promise((resolve, reject) => {
			this.httpClient.post(this.config.appConfig.api_url + "/uploadMultipleImage", tobeSubmit, { observe: "body" }).subscribe(
				(data: any) => {
					this.isLoading = false;
      if (data['status'] == "OK") {
        this.itemList[this.taskIndex].is_multiple_image = 1;
        this.itemList[this.taskIndex].MultipleImageUrl = this.itemList[this.taskIndex].MultipleImageUrl.concat(JSON.parse(data['result']['img_path']));
        this.haveItemImages = true;
						resolve(data);
      } else {
						this.showAlert("Error", "Failed to upload images. Please try again.");
						reject(new Error(data['result'] || 'Failed to upload images'));
					}
				},
				error => {
        this.isLoading = false;
					this.showAlert("Error", "Connection error. Please check your internet connection and try again.");
					reject(error);
      }
			);
    });
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
					for (let i = 0; i < this.itemList.length; i++) {
						this.haveItemImages = false;
						if(this.itemList[i].MultipleImageUrl.length > 0){
							this.haveItemImages = true;
							break;
						}
					}
				}
			}]
		}).then(alert => alert.present());
	}

}
