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
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// import { StatusBar as CapacitorStatusBar } from '@capacitor/status-bar';
import { ModalController, NavController } from '@ionic/angular';
import { ModalSignaturePage } from "../modal-signature/modal-signature.page";
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-qc-detail',
  templateUrl: './qc-detail.page.html',
  styleUrls: ['./qc-detail.page.scss'],
})

export class QcDetailPage implements OnInit {

  goods_received_note_id = this.route.snapshot.paramMap.get("goods_received_note_id");

  //PO data
  collectionDetails: any = {
    itemList : [],
    item_type : 0,
    poData : "",
    total_XAU: 0,
    total_XAU_collect: 0,
    remark: ''
  };

  //customer item and gold purity setting
  customerBItemTypeList = [];
  customerGoldPurityList = [];

  //grn
  grnList = [];

  summary: any = { total_gram: 0 };

  //for image index
  grnIndex = 0;

  geolocation_lat: any;
  geolocation_lng: any;
  geolocation_photo: any;
  gmsakToken = "";
  //for sign
  signature_data : any;


  slideOpts = {
    slidesPerView: 1,
    initialSlide: 0,
    speed: 400,
    modifierClass:'customepagination',
    autoplay: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true
    }
  };

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
    private navCtrl: NavController,
    public modalController: ModalController,
    private config: ConfigService,
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

  ionViewWillEnter(){
		this.getCollectionDetails();
    // this.get_multiple_image_testing();
	  // this.get_one_image_testing();
	}

  getCollectionDetails() {
    this.App.presentLoading();
    this.httpClient
      .get(
        this.App.api_url + "/appPrepareQC/" + this.goods_received_note_id + "/" + localStorage['token'])
      .subscribe(
        (data: any) => {

          this.loadingController.dismiss();
          this.collectionDetails = data.result["QCDetails"];
          this.customerBItemTypeList = data.result["customerBItemTypeList"];
          this.customerGoldPurityList = data.result["customerGoldPurityList"];

          console.log(this.customerGoldPurityList)
          console.log("collectionDetails",this.collectionDetails);
          //set initial grn list
          this.setGrnList();

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
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.geolocation_lat = position.coords.latitude.toString();
        this.geolocation_lng = position.coords.longitude.toString();
        let deviceLatLng = this.geolocation_lat + "," + this.geolocation_lng;
        this.geolocation_photo =
          "https://maps.googleapis.com/maps/api/staticmap?center=" + deviceLatLng +
          "&zoom=17" + "&size=250x250" +
          "&markers=color:blue%7Clabel:U%7C" + deviceLatLng +
          "&key=" + this.gmsakToken;
      },
      (error) => {
        // this.App.presentAlert_default('ERROR', error, "assets/attention-icon.svg");
        // this.App.presentAlert_default('ERROR', 'Make sure your GPS is open', "assets/attention-icon.svg");
        // console.log('Error getting location', error);
      }
    );
  }

  //sethe the initial grn list
  setGrnList(){

    this.grnList = [];

    if(this.collectionDetails.itemList.length > 0){

      for(let i = 0; i < this.collectionDetails.itemList.length; i ++){

        let tmp_item = this.collectionDetails.itemList[i];
        let item_code = tmp_item.gold_pure_id;
        if(tmp_item.customer_gold_pure_id != 0){
          item_code = tmp_item.customer_gold_pure_id;
        }

        //set initial item list if customer have fill in
        let tmp = {
          item_type : tmp_item.item_type_id,
          item_code : item_code,
          gram      : parseFloat(tmp_item.weight),

          gold_name         : tmp_item.gold_name,
          gold_pure_percent : tmp_item.gold_pure_percentage,
          XAU_amount        : tmp_item.XAU,

          goods_received_note_id : this.goods_received_note_id,

          //rider create grn insert
          item_is_multiple_image : tmp_item.is_multiple_image,
          item_image : tmp_item.image,
          item_multiple_image : tmp_item.multiple_image,
          barcode : tmp_item.barcode,
          pw_barcode : tmp_item.pw_barcode,

          //QC in database
          is_multiple_image : 0,
          imageUrl : "",
          MultipleImageUrl : "",
          is_checked: 1,

          goods_received_note_detail_id : tmp_item.goods_received_note_detail_id,
          purchase_order_id : tmp_item.purchase_order_id,
          is_deleted: tmp_item.is_deleted,

        }
        this.grnList.push(tmp);
      }

      console.log("GRNLIST",this.grnList);
    }

    this.priceUpdate();
  }

  //add the item
  addItem(){

    let tmp = {
      item_type : "",
      item_code : "",
      gram : 0,

      gold_name : "",
      gold_pure_percent : "",
      XAU_amount : 0,

      purchase_order_id: 0,
      goods_received_note_detail_id:0,
      goods_received_note_id : this.goods_received_note_id,

      is_multiple_image : 0,
      imageUrl : "",
      MultipleImageUrl : "",

      is_deleted: 0,
      is_checked: 1,
    };

    tmp['purchase_order_id'] = this.collectionDetails.itemList[0].purchase_order_id;

    this.grnList.push(tmp);
  }

  //update the selected grn (copy from website)
  recalculate(selectedItem){

    //fixed the gram only 2 decimal
    if(selectedItem.gram != 0 && selectedItem.gram != '' && selectedItem.gram != null){
        let gram = selectedItem.gram.toString();
        if(gram.includes(".") && gram.split(".")[1].length > 2){
            selectedItem.gram = parseFloat(selectedItem.gram.toFixed(2));
        }
    }

    //prefill the related fields
    var selectedPresetPurity = this.customerGoldPurityList.filter(function(item){
        return item.id == selectedItem.item_code;
    });

    if(selectedPresetPurity.length > 0) {

        var final_percent = selectedPresetPurity[0].override_gold_pure_percent;
        if(selectedItem.gold_pure_percent !=  selectedPresetPurity[0].override_gold_pure_percent) {
          final_percent = selectedItem.gold_pure_percent;
        }

        selectedItem.gold_name = selectedPresetPurity[0].gold_name;
        selectedItem.gold_pure_percent = final_percent;
        selectedItem.XAU_amount = selectedItem.gram * (selectedItem.gold_pure_percent/100);

        selectedItem.XAU_amount = selectedItem.XAU_amount * 1000;
        selectedItem.XAU_amount = Math.floor(selectedItem.XAU_amount);
        selectedItem.XAU_amount = selectedItem.XAU_amount / 1000;
        //selectedItem.XAU_amount =  (Math.floor(selectedItem.XAU_amount * 1000) / 1000);

        selectedItem.XAU_amount = parseFloat(selectedItem.XAU_amount);

    }

    //calculate the total xau
    this.priceUpdate();

}

  //recalculate the total XAU
  priceUpdate(){

    //grn
    let tmp_total_gram = 0;
    let tmp_XAU_amount = 0;

    //set the grn list total summary
    for(let i =0; i< this.grnList.length;i++){

      if(this.grnList[i].is_checked == 1){
        tmp_total_gram += this.grnList[i].gram;
        tmp_XAU_amount += parseFloat(this.grnList[i].XAU_amount);
      }
    }

    tmp_total_gram = tmp_total_gram * 1000;
    tmp_total_gram = Math.floor(tmp_total_gram);
    tmp_total_gram = tmp_total_gram / 1000;

    tmp_XAU_amount = tmp_XAU_amount * 1000;
    tmp_XAU_amount = Math.floor(tmp_XAU_amount);
    tmp_XAU_amount = tmp_XAU_amount / 1000;


    let tmp = {
      'total_gram' : tmp_total_gram,
      'total_XAU_amount' : tmp_XAU_amount,
    }

    this.summary = tmp;

  }


  no_round_up(num,rounded){

    if(rounded == 2){
        var withDecimals = num.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];
    }

    if(rounded == 3){
        var withDecimals = num.toString().match(/^-?\d+(?:\.\d{0,3})?/)[0];
    }


    return withDecimals;
  }

  //submit the GRN
  submit_grn(){
    this.App.presentLoading();

    let tobeSubmit = {
      'company_id' : localStorage['default_company_id'],
      'token'      : localStorage['token'],
      "grnList"    : this.grnList,
      "geolocation_lat": this.geolocation_lat,
      "geolocation_lng": this.geolocation_lng,
    }

    this.httpClient.post(this.App.api_url+"/appSubmitQC",tobeSubmit,{observe: "body"}).subscribe((data:any) => {

      this.loadingController.dismiss();

      if(data.status == "OK") {

        this.alertController
          .create({
            cssClass: "successfulMessage",
            header: "You successful do the Qc check.",
            buttons: [{ text: "OK" }],
          })
          .then((alert) => alert.present());

          this.router.navigate(["/collection/",]);

      } else {
        this.App.presentAlert_default(data['status'],data['result'],"assets/gg-icon/attention-icon.svg");
      }
    }, error => {
      this.loadingController.dismiss();
      this.App.presentAlert_default('ERROR',"Connection Error","assets/gg-icon/attention-icon.svg");
    });
  }

  //remove specified cart
  async removeList(id){

    const alert = await this.alertController.create({
      cssClass: "successfulMessage",
      header: `Are you sure to remove this from list ?`,
      subHeader: "You may lost the record(s)",
      buttons: [
        {
          text: "Cancel",
          cssClass: "colosebutton",
          handler: () => {},
        },
        {
          text: "Confirm",
          cssClass: "confirmbutton",
          handler: () => {

            //this.grnList.splice(id, 1);
            this.grnList[id].is_deleted = "1";
            this.grnList[id].is_checked = "0";

            this.priceUpdate();

          },
        },
      ],
    });
    await alert.present();

  }


  async openActionSheet(index) {
    this.grnIndex = index;

    const actionSheet = await this.actionSheetController.create({
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Camera（Single Image）',
        role: 'camera',
        icon: 'camera',
        handler: () => {
          this.openCamera(CameraSource.Camera, false);
        }
      }, {
        text: 'Camera(Multiple Image)',
        role: 'camera',
        icon: 'camera',
        handler: () => {
          this.openCamera(CameraSource.Camera, true);
        }
      }, {
        text: 'Upload From Gallery',
        role: 'gallery',
        icon: 'images-outline',
        handler: () => {
          this.getImages();
        }
      },{
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

      // CapacitorStatusBar.setOverlaysWebView({ overlay: true });
      // CapacitorStatusBar.setOverlaysWebView({ overlay: false });

      if (capturedPhoto.base64String) {
        await this.api_upload_image(capturedPhoto.base64String, isMultiple);
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
          // CapacitorStatusBar.setOverlaysWebView({ overlay: true });
          // CapacitorStatusBar.setOverlaysWebView({ overlay: false });

          const file = input.files[0];
          if (!file) {
            this.App.stopLoading(100);
            return;
          }
          const base64Data = await this.readFileAsBase64(file);
          await this.api_upload_image(base64Data.split(',')[1], false);
        } catch (error) {
          console.error('Error reading file:', error);
          this.App.stopLoading(100);
          await this.presentErrorAlert('Error', 'Failed to read file');
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

  async api_upload_image(imgInfo: string, isMultiple: boolean = false) {
    try {
      const position = await this.getCurrentPosition();
      const tobeSubmit = {
        'account_id': localStorage['login_user_id'],
        'token': localStorage['token'],
        'imgInfo': imgInfo,
        'need_watermark': 1,
        ...(position && { location: position })
      };

      if (isMultiple) {
        await this.multiple_image_upload({ ...tobeSubmit, imgInfo: [imgInfo] });
      } else {
        await this.one_image_upload(tobeSubmit);
      }
    } catch (error) {
      console.error('Error in api_upload_image:', error);
      const tobeSubmit = {
        'account_id': localStorage['login_user_id'],
        'token': localStorage['token'],
        'imgInfo': imgInfo,
        'need_watermark': 1
      };
      if (isMultiple) {
        await this.multiple_image_upload({ ...tobeSubmit, imgInfo: [imgInfo] });
      } else {
        await this.one_image_upload(tobeSubmit);
      }
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
        this.grnList[this.grnIndex].is_multiple_image = 0;
        this.grnList[this.grnIndex].imageUrl = data['result']['img_path'];
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
        this.grnList[this.grnIndex].is_multiple_image = 1;
        this.grnList[this.grnIndex].MultipleImageUrl = JSON.parse(data['result']['img_path']);
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
	get_multiple_image_testing(){

		let tobeSubmit = {
			'account_id': localStorage['login_user_id'],
			'token': localStorage['token'],
			'imgInfo': "DEMO",
		};


		this.httpClient.post(this.App.api_url+"/uploadMultipleImage_testing",tobeSubmit,{observe: "body"}).subscribe((data) => {
			if(data['status'] == "OK") {
        this.App.stopLoading(100);

        this.grnList[this.grnIndex].is_multiple_image = 1;
        this.grnList[this.grnIndex].MultipleImageUrl = JSON.parse(data['result']['img_path']);

			} else {
				this.App.stopLoading(100);
				this.App.presentAlert_default('','Error2!. Please try again',"../../assets/attention2-icon.svg");
			}
		}, error => {
				this.App.stopLoading(100);
				this.App.presentAlert_default('',"Connection Error 2","../../assets/attention2-icon.svg");
		});
	}

	//testing get one image
	get_one_image_testing(){

		let tobeSubmit = {
			'account_id': localStorage['login_user_id'],
			'token': localStorage['token'],
			'imgInfo': "DEMO",
		};


		this.httpClient.post(this.App.api_url+"/uploadMultipleImage_testing",tobeSubmit,{observe: "body"}).subscribe((data) => {
			if(data['status'] == "OK") {
        this.App.stopLoading(100);

        console.log("DATA",data);

        let haha = JSON.parse(data['result']['img_path']);

				this.grnList[this.grnIndex].is_multiple_image = 0;
        this.grnList[this.grnIndex].imageUrl = haha[0];

			} else {
				this.App.stopLoading(100);
				this.App.presentAlert_default('','Error2!. Please try again',"../../assets/attention2-icon.svg");
			}
		}, error => {
				this.App.stopLoading(100);
				this.App.presentAlert_default('',"Connection Error 2","../../assets/attention2-icon.svg");
		});
	}

	delete_img(is_multiple,img_path,target_index){
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
			  	},{
					text: 'Ok',
					handler: (alertData) => {

						if(is_multiple == 0){
							console.log('Confirm Ok');
							this.grnList[target_index].imageUrl = '';
						}else if(is_multiple == 1){
							console.log('Confirm Ok Multiple');
							let index = this.grnList[target_index].MultipleImageUrl.indexOf(img_path);
							if(index !== -1){
								this.grnList[target_index].MultipleImageUrl.splice(index,1);
							}

						}

					}
				}]
		}).then(alert=> alert.present());
	}


  async openModalSign() {

		const modal = await this.modalController.create({
			component: ModalSignaturePage,
			componentProps: {
				// 'salesorder_id': this.salesorder_id,
				// 'type':'onboarding',
			},
			backdropDismiss:false,
			// initialBreakpoint(1是直接開完, 0.5是開一半); breakpoints是可以給user手動調高度的參數
			// https://ionicframework.com/docs/api/modal#breakpoints
			// initialBreakpoint: 0.5,
			// breakpoints: [0.5, 0.8, 1],
		});
		await modal.present();

		modal.onDidDismiss().then((data => {
			this.signature_data = data.data;
			console.log("this.signature_data",this.signature_data);
		}));

	}

}
