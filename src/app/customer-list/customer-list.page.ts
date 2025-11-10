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
import { ModalController, NavController } from '@ionic/angular';
import { ModalCustomerListPage } from '../modal-customer-list/modal-customer-list.page';


@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.page.html',
  styleUrls: ['./customer-list.page.scss'],
	  providers: [],
})
export class CustomerListPage implements OnInit {

	url = "";
	type = this.route.snapshot.paramMap.get("type");
	configData:any = [];
	inlineCount:0;
	my_user_id = "";

	// Added missing properties for template binding
	searchText: string = "";
	customer_id: string = "";

	goldPurityList: any[] = [];
	customerList: any[] = [];
	bItemTypeList: any[] = [];
	customerData: { 
		customer_id?: string,
		customerGoldPurityList: any[], 
		customerGoldPurityBlockList: any[], 
		customerSellGoldPurityList: any[], 
		customerExchangeGoldPurityList: any[], 
		customerBItemTypeList: any[],
		// customerBuyGoldBarPurity: 0,
		buy_gold_bar_premium_fee: 0,
	} = {
		customerGoldPurityList: [],
		customerGoldPurityBlockList: [],
		customerSellGoldPurityList: [],
		customerExchangeGoldPurityList: [],
		customerBItemTypeList: [],
		// customerBuyGoldBarPurity: 0,
		buy_gold_bar_premium_fee: 0,
	};

  constructor(
    public alertController: AlertController,
		private router: Router,
		public HttpClient: HttpClient,
		public App: AppComponent,
		private route: ActivatedRoute,
		public loadingController: LoadingController,
		public menuCtrl: MenuController,
		public location: Location,
		private navCtrl: NavController,

		public httpClient: HttpClient,
		public modalController: ModalController,
  ) { }

  ngOnInit() {
		this.my_user_id = localStorage['login_user_id'];

  }

  ionViewWillEnter() {
		this.getCustomerList();
	}

  doRefresh(event) {
		// console.log('Begin async operation');
		this.getCustomerList();

		event.target.complete();

	}

  getCustomerList() {
		this.App.presentLoading();
		this.HttpClient
			.get(
				this.App.api_url + "/appGetCustomerList"
			)
			.subscribe(
				(data: any) => {
					this.loadingController.dismiss();
					this.inlineCount = data.result['inlineCount'];
					this.customerList = data.result['customerList'];
					this.goldPurityList = data.result['goldPurityList'];
					this.bItemTypeList = data.result['bItemTypeList'];
				},
				(error) => {
					this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	submit_now(item?: any){
		this.alertController.create({
			header: 'Confirmation',
			message: 'Do you want to request to change the customer settings?',
			buttons: [{
				text: 'Cancel',
				role: 'cancel',
				cssClass: 'secondary',
				handler: () => {
					console.log('Confirm Request');
				}
			}, {
				text: 'Ok',
				handler: (alertData) => {

					this.App.presentLoading();

					let tobeSubmit = {
						'company_id': localStorage['default_company_id'],
						'token': localStorage['token'],
						'customerData': this.customerData,
					}

					this.httpClient.post(this.App.api_url + "/appRiderCustomerChangeRequest", tobeSubmit, { observe: "body" }).subscribe((data: any) => {

						this.loadingController.dismiss();

						if (data.status == "OK") {

							this.alertController
								.create({	
									cssClass: "successfulMessage",
									header: "You successful submit the request.",
									buttons: [{ text: "OK" }],
								})
								.then((alert) => alert.present());

								this.navCtrl.navigateRoot('home', { animationDirection: 'forward' });

						} else {
							this.App.presentAlert_default(data['status'], data['result'], "assets/gg-icon/attention-icon.svg");
						}
					}, error => {
						this.loadingController.dismiss();
						this.App.presentAlert_default('ERROR', "Connection Error", "assets/gg-icon/attention-icon.svg");
					});

				}
			}]
		}).then(alert => alert.present());
	}

	getCustomerDetail(customer_id){
		if(customer_id){
			this.App.presentLoading();
			let tobeSubmit = {
				'company_id': localStorage['default_company_id'],
				'token': localStorage['token'],
				'customer_id': customer_id,
			}
	
			this.httpClient.post(this.App.api_url + "/appRiderGetCustomerDetail", tobeSubmit, { observe: "body" }).subscribe((data: any) => {
	
				this.loadingController.dismiss();
	
				if (data.status == "OK") {

						this.customerData = data.result['customerData'];
	
				} else {
					this.App.presentAlert_default(data['status'], data['result'], "assets/gg-icon/attention-icon.svg");
				}
			}, error => {
				this.loadingController.dismiss();
				this.App.presentAlert_default('ERROR', "Connection Error", "assets/gg-icon/attention-icon.svg");
			});
		}
	}

	addGoldPurity() {
		this.customerData.customerGoldPurityList.push({
			id: Math.random(),
			gold_pure_id: 0,
			gold_name: "",
			gold_pure_percent: 0,
			override_gold_pure_percent: 0
		});
	}

	addGoldPurityBlock() {
		this.customerData.customerGoldPurityBlockList.push({
			id: Math.random(),
			gold_pure_id: 0,
			gold_name: "",
			gold_pure_percent: 0,
			override_gold_pure_percent: 0
		});
	}

	addSellGoldPurity() {
		this.customerData.customerSellGoldPurityList.push({
			id: Math.random(),
			gold_pure_id: 0,
			gold_name: "",
			gold_pure_percent: 0,
			override_gold_pure_percent: 0
		});
	}

	addExchangeGoldPurity() {
		this.customerData.customerExchangeGoldPurityList.push({
			id: Math.random(),
			gold_pure_id: 0,
			gold_name: "",
			gold_pure_percent: 0,
			override_gold_pure_percent: 0
		});
	}

	addItemType() {
		this.customerData.customerBItemTypeList.push({
			id: Math.random(),
			item_type_id: '',
			title: "",
			premium: '',
			price_per_gram: 0,
			sell_premium: '',
			sell_price_per_gram: 0,
		});
	}

	async view_detail(item,list,index,type) {

		const modal = await this.modalController.create({
			component: ModalCustomerListPage,
			componentProps: {
				modalData: item,
				itemList: list,
				index: index,
				goldPurityList: this.goldPurityList,
				bItemTypeList: this.bItemTypeList,
				type: type,
				// warehouseList: this.warehouseList,
			},
			backdropDismiss: false,
		});
		await modal.present();
	}
}
