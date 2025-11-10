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
} from "@ionic/angular";
import { AppComponent } from "../app.component";
import { Httprequest } from "../models/httprequest";
import { NativeAdapterService } from '../services/native-adapter.service';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-make-po',
  templateUrl: './make-po.page.html',
  styleUrls: ['./make-po.page.scss'],
  providers: [NativeAdapterService],
})
export class MakePoPage implements OnInit {

	customer_id = this.route.snapshot.paramMap.get("customer_id");

	customerList = [];
	userNameList = [];
	user_id = 0;
	userdata:any;

	customerBItemTypeList =[];
	customerGoldPurityList =[];
	customerBTransactionLimitList =[];

	poList =[];

	est_cost=0;
	total_XAU='';
	total_XAU_display = '';
	total_gram=0;

	userPassword='';

	gold_price=0;
	gold_price_per_tael=0;
	gold_price_per_gram=0;

	item_type:any;

	//for submit po use
	web_id = 1; //company_id
	action_type = 1; //spot sell
	remark = 'From Rider App';
	payment_method ='Bank Transfer';

	gmsakToken = "";
	geolocation_lat : any;
	geolocation_lng : any;
	geolocation_photo : any;

	constructor(
		public alertController: AlertController,
		private router: Router,
		public HttpClient: HttpClient,
		public App: AppComponent,
		private route: ActivatedRoute,
		public loadingController: LoadingController,
		public menuCtrl: MenuController,
		public location: Location,
		private nativeAdapter: NativeAdapterService,
		private config: ConfigService
	) { }

	ngOnInit() {
		this.gmsakToken = localStorage['googleApiKey'] || '';
	}

	ionViewWillEnter() {
		this.getPODetails();
		this.getGoldPrice();
		this.getGeolocation();
	}

	getPODetails() {
		this.App.presentLoading();
		this.HttpClient
			.get(
				this.App.api_url + "/appGetCustomerUser/" + this.customer_id)
			.subscribe(
				(data: any) => {

					this.loadingController.dismiss();
					this.userNameList = data.result['userNameList'];
					this.user_id = this.userNameList[0]['user_id'];
					this.customerList = data.result['customerList'];
					this.customerBItemTypeList = data.result['customerBItemTypeList'];
					this.customerGoldPurityList = data.result['customerGoldPurityList'];
					this.customerBTransactionLimitList = data.result['customerBTransactionLimitList'];
					console.log("this.customerBTransactionLimitList", this.customerBTransactionLimitList);
					console.log("this.customerBItemTypeList", this.customerBItemTypeList);
					console.log("this.customerGoldPurityList", this.customerGoldPurityList);
					this.addItem();
				},
				(error) => {
					//this.loadingController.dismiss();

					console.log(error);
				}
			);

	}

	getGoldPrice(){
		this.App.presentLoading();
		this.HttpClient
			.get(
				this.App.api_url + "/appGetGoldPrice")
			.subscribe(
				(data: any) => {

					this.loadingController.dismiss();
					this.gold_price = data.result['gold_price'];

					this.gold_price_per_tael = this.gold_price['gold_per_tael_buy'];
					this.gold_price_per_gram = this.gold_price['gold_per_gram_buy'];
					this.priceUpdate();
				},
				(error) => {
					//this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	async getGeolocation(){
		this.App.presentLoading();
		try {
			const resp = await this.nativeAdapter.getCurrentPosition({});

			this.loadingController.dismiss();

			this.geolocation_lat = resp.coords.latitude.toString();
			this.geolocation_lng = resp.coords.longitude.toString();

			let deviceLatLng = this.geolocation_lat + "," + this.geolocation_lng;

			this.geolocation_photo =
					"https://maps.googleapis.com/maps/api/staticmap?center=" + deviceLatLng +
					"&zoom=17" + "&size=250x250" +
					"&markers=color:blue%7Clabel:U%7C" + deviceLatLng+
					"&key=" + this.gmsakToken;

		} catch (error) {
			this.loadingController.dismiss();
			//this.App.presentAlert_default('ERROR', error, "assets/attention-icon.svg");
			// this.App.presentAlert_default('ERROR', 'Make sure your GPS is open', "assets/attention-icon.svg");
			console.log('Error getting location', error);
		}
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

							this.poList.splice(id, 1);

						},
					},
				],
			});
			await alert.present();

	}

	addItem() {

		let tmp = {
			item_code: "",
			gram: '',

			gold_name: "",
			gold_pure_percent: "",
			XAU_amount: 0,
		};

		this.item_type=String(this.customerBItemTypeList[0].item_type_id),
		this.poList.push(tmp);
		console.log("this.poList", this.poList);
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

			selectedItem.is_editable = selectedPresetPurity[0].is_editable;
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
			selectedItem.XAU_amount_display = selectedItem.XAU_amount.toLocaleString("en-US", {
				minimumFractionDigits: 3,
				maximumFractionDigits: 3
			});
		}

		//calculate the total xau
		this.priceUpdate();

	}

	recalculate_jewel(selectedItem) {

			//fixed the gram only 2 decimal
			if (selectedItem.gram != 0 && selectedItem.gram != '' && selectedItem.gram != null) {
				let gram = selectedItem.gram.toString();
				if (gram.includes(".") && gram.split(".")[1].length > 2) {
					selectedItem.gram = parseFloat(selectedItem.gram.toFixed(2));
				}
			}

			//prefill the related fields
			var selectedPresetPurity = this.customerGoldPurityList.filter(function (item) {
				return item.id == selectedItem.item_code;
			});

			if (selectedPresetPurity.length > 0) {
				selectedItem.is_editable = selectedPresetPurity[0].is_editable;

				selectedItem.gold_name = selectedPresetPurity[0].gold_name;

				selectedItem.gold_pure_percent = selectedPresetPurity[0].override_gold_pure_percent;

				selectedItem.XAU_amount = selectedItem.gram * (selectedItem.gold_pure_percent/100);

        selectedItem.XAU_amount = selectedItem.XAU_amount * 1000;
        selectedItem.XAU_amount = Math.floor(selectedItem.XAU_amount);
        selectedItem.XAU_amount = selectedItem.XAU_amount / 1000;
				//selectedItem.XAU_amount =  (Math.floor(selectedItem.XAU_amount * 1000) / 1000);

				selectedItem.XAU_amount = parseFloat(selectedItem.XAU_amount);
				selectedItem.XAU_amount_display = selectedItem.XAU_amount.toLocaleString("en-US", {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3
                });
			}

		//calculate the total xau
		this.priceUpdate();

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

	submit_po(){
		this.App.presentLoading();

		let tobeSubmit = {
			"token": localStorage['token'],
			"web_id": this.web_id,
			"user_id": this.user_id,
			"customer_id": this.customer_id,
			"mode": "Add",
			"action_type": this.action_type,
			"item_type": this.item_type,
			"XAU_amount": this.total_XAU,
			"password": this.userPassword,
			"remark": this.remark,
			"remark_pic": '',
			"itemList": this.poList,
			"customerBTransactionLimitList": this.customerBTransactionLimitList,
			"pickup_address1": this.customerList['address1'],
			"pickup_address2": this.customerList['address2'],
			"pickup_postcode": this.customerList['postcode'],
			"pickup_city": this.customerList['city'],
			"pickup_state": this.customerList['state'],
			"is_send_whatsapp_to_me": 1,
			'payment_method': this.payment_method,
			'geolocation_lat' : this.geolocation_lat,
			'geolocation_lng' : this.geolocation_lng,
			'geolocation_photo' : this.geolocation_photo,
		}

		console.log("tobeSubmit", tobeSubmit);

		this.HttpClient.post(this.App.api_url + "/appSubmitPO", tobeSubmit, { observe: "body" }).subscribe((data: any) => {

			this.loadingController.dismiss();

			if (data.status == "OK") {

				this.alertController
					.create({
						cssClass: "successfulMessage",
						header: "Successfully made order!",
						buttons: [{ text: "OK" }],
					})
					.then((alert) => alert.present());

					this.poList = [];
					this.userPassword = "";


				this.router.navigate(["/collection-supplier/",]);

			} else {
				this.App.presentAlert_default(data['status'], data['result'], "assets/gg-icon/attention-icon.svg");
			}
		}, error => {
			this.loadingController.dismiss();
			this.App.presentAlert_default('ERROR', "Connection Error", "assets/gg-icon/attention-icon.svg");
		});
	}

	priceUpdate = function() {

		//fixed the XAU only 3 decimal
		if (this.total_XAU != 0 && this.total_XAU != '' && this.total_XAU != null) {
			let XAU_amount = this.total_XAU.toString();
			if (XAU_amount.includes(".") && XAU_amount.split(".")[1].length > 3) {
				this.total_XAU = parseFloat(this.total_XAU.toFixed(3));
			}
		}

		if (this.poList.length != 0) {
			this.total_XAU = 0;
			this.est_cost = 0;
			this.total_gram = 0;

			for (var i = 0; i < this.poList.length; i++) {
				this.total_XAU += this.poList[i].XAU_amount;

				//total gram
				this.total_gram += this.poList[i].gram;
			}

			this.total_XAU = parseFloat(this.total_XAU.toFixed(3));
      this.total_XAU = this.total_XAU * 1000;
      this.total_XAU = Math.floor(this.total_XAU);
      this.total_XAU = this.total_XAU / 1000;
			//this.total_XAU =  (Math.floor(this.total_XAU * 1000) / 1000);

		    // Remove commas before parsing
            var total_XAU_withoutComma = this.total_XAU.toString().replace(/,/g, '');

            // Round total_XAU to 3 decimal places
            this.total_XAU = parseFloat(total_XAU_withoutComma).toFixed(3);

			//let the display number become 100,000.000
			this.total_XAU_display = this.total_XAU.toLocaleString("en-US", {
				minimumFractionDigits: 3,
				maximumFractionDigits: 3
			});
		}
		console.log('total_XAU_display',this.total_XAU_display);
		console.log('total_gram',this.total_gram);

		if (this.total_XAU != '') {
			var gold_price = parseFloat(this.gold_price_per_tael) + parseFloat(this.premium_fee);
			//cannot round up
      gold_price = gold_price / 37.80;
      gold_price = gold_price * 100;
      gold_price = Math.round(gold_price);
      gold_price = gold_price / 100;


			this.est_cost = parseFloat(this.total_XAU) * parseFloat(gold_price.toString());

			// Remove comma before parsing
			var est_costWithoutComma = this.est_cost.toString().replace(',', '');

			// Round est_cost to 2 decimal places
            this.est_cost = parseFloat(est_costWithoutComma).toFixed(2);

			setTimeout(() => {
				this.est_cost = this.est_cost.toLocaleString("en-US", {
				  minimumFractionDigits: 2,
				  maximumFractionDigits: 2
				});
			  }, 500);

		}

	}

	check_premium = function() {

		this.premium_fee = 0;

		if (this.customerBItemTypeList) {

			for (let i = 0; i < this.customerBItemTypeList.length; i++) {
				if (this.item_type == this.customerBItemTypeList[i].item_type_id) {
					this.premium_fee = this.customerBItemTypeList[i].premium;
				}
			}
		} else {
			this.premium_fee = 0;
		}
		this.priceUpdate();

	}

	getUserData(){

		console.log(this.userNameList);

		for(let i=0; i < this.userNameList.length; i++){
			if(this.userNameList[i].user_id == this.user_id) {
				//console.log(this.userNameList[i]);
				this.userdata = this.userNameList[i];
			}
		}

	}

	sendOTP(){
		this.HttpClient.post(this.App.api_url2 + "/sendOTP", {
			"dial_code": this.userdata.dial_code,
			"mobile": this.userdata.mobile,
		}, { observe: "body" }).subscribe((data: any) => {

			this.loadingController.dismiss();

			if (data.status == "OK") {

				this.alertController
					.create({
						cssClass: "successfulMessage",
						header: "OTP Sent!",
						buttons: [{ text: "OK" }],
					})
					.then((alert) => alert.present());

			} else {
				this.App.presentAlert_default(data['status'], data['result'], "assets/gg-icon/attention-icon.svg");
			}
		}, error => {
			this.loadingController.dismiss();
			this.App.presentAlert_default('ERROR', "Connection Error", "assets/gg-icon/attention-icon.svg");
		});
	}

}
