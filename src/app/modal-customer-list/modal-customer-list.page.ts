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
import { ModalController, NavController } from '@ionic/angular';
import { ConfigService } from "../config.service";
import { ModalsharedService } from "../modalshared.service";
import { Big } from 'big.js';

@Component({
  selector: 'app-modal-customer-list',
  templateUrl: './modal-customer-list.page.html',
  styleUrls: ['./modal-customer-list.page.scss'],
})
export class ModalCustomerListPage implements OnInit {

  @Input("modalData") modalData;
  @Input("itemList") itemList;
  @Input("index") index;
  @Input("goldPurityList") goldPurityList;
  @Input("bItemTypeList") bItemTypeList;
  @Input("type") type;

	isLoading = false;
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

	ngOnInit() {
		this.subcription = this.platform.backButton.subscribeWithPriority(10, () => {
			this.dismiss();
		});

		console.log(this.bItemTypeList)
		console.log(this.modalData)

		this.index = this.index;
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

	selectedGoldPurity(item,index){
		var foundedGP = this.goldPurityList.filter(function(i) {
			return i.gold_pure_id == item.gold_pure_id;
		});

		//check in customerGoldPurityList
		var foundedSGP = this.itemList.filter(function(i) {
			return i.gold_pure_id == item.gold_pure_id && i.gold_name != "";
		});

		if(foundedSGP && foundedSGP.length > 0){
			//unset it from customerGoldPurityList
			this.itemList.splice(this.index, 1);
			alert('This gold purity is already added!');
			this.dismiss();
		}else{
			item.gold_name = foundedGP[0].gold_name;
			item.gold_pure_percent = foundedGP[0].gold_pure_percent;
			item.override_gold_pure_percent = foundedGP[0].gold_pure_percent;
		}
	}

	selectedItemType(item,type){
		console.log(item)
		if(type == 0){
			var foundedItemType = this.bItemTypeList.filter(function(i) {
				return i.id == item.item_type_id;
			});
	
			//check in customerGoldPurityList
			var foundedSItemType = this.itemList.filter(function(i) {
				return i.item_type_id == item.item_type_id && i.title != "";
			});
	
			if(foundedSItemType && foundedSItemType.length > 0){
	
				this.itemList.splice(this.index, 1);
				alert('This Item Type is already added!');
				this.dismiss();
			}else{
				item.title = foundedItemType[0].title;
			}
		}else{
			var foundedItemType = this.bItemTypeList.filter(function(i) {
				return i.id == item.item_type_id;
			});
			
			item.title = foundedItemType[0].title;
		}
		
	}

	calculate_price_per_gram(item,type){
		if(type == 'buy'){
			if(item.premium){
				var firstChar = item.premium.charAt(0);
				var premium = item.premium;
				if(firstChar == '+'){
					//get chars after +
					premium = premium.substring(1);
				}
				if(premium != 0){
					item.price_per_gram = Big(premium).div(37.8).round(2, 0).toNumber();
				}else{
					item.price_per_gram = 0;
				}
			}
		}else{
			if(item.sell_premium){
				var firstChar_sell = item.sell_premium.charAt(0);
				var sell_premium = item.sell_premium;
				if(firstChar_sell == '+'){
					//get chars after +
					sell_premium = sell_premium.substring(1);
				}
				if(sell_premium != 0){
					item.sell_price_per_gram = Big(sell_premium).div(37.8).round(2, 0).toNumber();
				}else{
					item.sell_price_per_gram = 0;
				}
			}
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
}
