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
import { ModalController, NavController } from '@ionic/angular';
import { ConfigService } from "../config.service";
import { Big } from 'big.js';

@Component({
  selector: 'app-modal-add-change-request',
  templateUrl: './modal-add-change-request.page.html',
  styleUrls: ['./modal-add-change-request.page.scss'],
  providers: []
})
export class ModalAddChangeRequestPage implements OnInit {

	@Input("modalData") modalData;
	@Input("modalDataList") modalDataList;
	@Input("selectedIndex") selectedIndex;
	@Input("grnDetail") grnDetail;
	@Input("customerGoldPurityList") customerGoldPurityList;
	@Input("customerBItemTypeList") customerBItemTypeList;
	@ViewChild('gramInput', { static: false, read: ElementRef }) gramInput: ElementRef;

	isLoading = false;
	grnIndex = 0;
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
	) { }

	ngOnInit() {
		console.log('owo modalData',this.modalData);
		// console.log('owo grnDetail',this.grnDetail);
		// console.log('owo customerGoldPurityList',this.customerGoldPurityList);
		// console.log('owo customerBItemTypeList',this.customerBItemTypeList);
		this.isDefaultValueZero = this.modalData.gram === 0;
		this.subcription = this.platform.backButton.subscribeWithPriority(10, () => {
			this.dismiss();
		});
	}

	ionViewWillLeave() {
		this.subcription.unsubscribe();
	}
  	dismiss(id : any = 0) {
		this.modalController.dismiss(id);
	}

	async deleteItem(){
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
						for(let i = 0; i < this.modalDataList.length; i++){
							this.modalDataList.splice(this.selectedIndex, 1);
						}					
						this.dismiss();					
					},
				},
			],
		});
		await alert.present();
	}

	//update the selected grn (copy from website)
	recalculate(selected_item) {
		// set gold to Original Item information
		if((selected_item.is_gold == '0' || selected_item.is_gold == '2') && selected_item.gold_pure_percentage_to == 0){
			var selectedGold_pure_id = this.customerGoldPurityList.filter(gold => {
				return gold.gold_name == this.grnDetail['gold_name'];
			});

			var selectedItem_type_id = this.customerBItemTypeList.filter(gold_type => {
				return gold_type.title == this.grnDetail['item_type'];
			});
			selected_item.gold_pure_id_to = selectedGold_pure_id[0]['gold_pure_id'];
			selected_item.item_type_id_to = selectedItem_type_id[0]['item_type_id'].toString();
      selected_item.gold_pure_percentage_to = Big(this.grnDetail['gold_pure_percentage']).round(2, 0).toNumber();
		}

		//fixed the gram only 2 decimal
		if (selected_item.weight_to != 0 && selected_item.weight_to != '' && selected_item.weight_to != null) {
      selected_item.weight_to = Big(selected_item.weight_to).round(2, 0).toNumber();
		}

		//prefill the related fields
		var selectedPresetPurity = this.customerGoldPurityList.filter(function (item) {
			return item.gold_pure_id == selected_item.gold_pure_id_to;
		});

		if (selectedPresetPurity.length > 0) {

			this.modalData.is_editable = selectedPresetPurity[0].is_editable;

			selected_item.gold_name_to = selectedPresetPurity[0].gold_name;

			var final_percent = selectedPresetPurity[0].override_gold_pure_percent;
			if(selectedPresetPurity[0].is_editable == '1'){
				if(selected_item.gold_pure_percentage_to !=  selectedPresetPurity[0].override_gold_pure_percent) {
					final_percent = selected_item.gold_pure_percentage_to;
				}
			}

      selected_item.gold_pure_percentage_to = Big(final_percent).round(2, 0).toNumber();

			if(selected_item.weight_to >= 0){
        selected_item.XAU_to = Big(selected_item.weight_to).mul(Big(selected_item.gold_pure_percentage_to).div(100)).round(3, 0).toNumber();
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
}
