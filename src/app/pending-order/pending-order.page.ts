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
import { ModalPendingOrderPage } from '../modal-pending-order/modal-pending-order.page';
import { ModalController, NavController } from '@ionic/angular';


@Component({
  selector: 'app-pending-order',
  templateUrl: './pending-order.page.html',
  styleUrls: ['./pending-order.page.scss'],
	  providers: [],
})
export class PendingOrderPage implements OnInit {

	url = "";
	type = this.route.snapshot.paramMap.get("type");
	configData:any = [];
	inlineCount:0;
	my_user_id = "";

	pendingJobList: [];

 	app_access_logistic = localStorage['app_access_logistic'];
	app_access_bullion = localStorage['app_access_bullion'];

  constructor(
    public alertController: AlertController,
		private router: Router,
		public HttpClient: HttpClient,
		public App: AppComponent,
		private route: ActivatedRoute,
		public loadingController: LoadingController,
		public menuCtrl: MenuController,
		public location: Location,
		public modalController: ModalController,

		public httpClient: HttpClient,
  ) { }

  ngOnInit() {
		this.my_user_id = localStorage['login_user_id'];

		if(this.type == 'collection'){
			this.type = 'bullion';
		}else{
			this.type = 'logistic';
		}

  }

  ionViewWillEnter() {
		this.get_access();
		this.getPendingOrderList();
	}

  get_access() {
		this.app_access_logistic = localStorage['app_access_logistic'];
		this.app_access_bullion = localStorage['app_access_bullion'];
	}

  doRefresh(event) {
		// console.log('Begin async operation');
		this.getPendingOrderList();

		event.target.complete();

	}
	async logistic_request(item,type) {

		if(type == 'Delivery'){
			item.job_type = '1';
		}else{
			item.job_type = '0';
		}
		item.type = this.type;	
		item.delivery_date = this.getCurrentDateTime();
    	item.pickup_date = this.getCurrentDateTime();
		item.min_date = this.getCurrentDateTime();

		const modal = await this.modalController.create({
			component: ModalPendingOrderPage,
			componentProps: {
				modalData : item,
				submitFunction: this.submit_now.bind(this)
			},
			backdropDismiss:false,
		});
		await modal.present();

		modal.onDidDismiss().then((data => {	
		}));

	}

	getCurrentDateTime(): string {
		const currentDate = new Date();
		const year = currentDate.getFullYear();
		const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
		const day = ('0' + currentDate.getDate()).slice(-2);
		const hours = ('0' + currentDate.getHours()).slice(-2);
		const minutes = ('0' + currentDate.getMinutes()).slice(-2);
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	}

  getPendingOrderList() {
		this.App.presentLoading();
		this.HttpClient
			.get(
				this.App.api_url + "/appGetPendingJobList/"+ this.type + '/' + localStorage['token']
			)
			.subscribe(
				(data: any) => {
					this.loadingController.dismiss();
					this.inlineCount = data.result['inlineCount'];
					this.pendingJobList = data.result['customerList'];
					console.log("this.pendingJobList",this.pendingJobList);

				},
				(error) => {
					this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	submit_now(item){
		item.type = this.type;

		if(item.job_type == ''){
			this.App.presentAlert_default('ERROR', 'Please Select a Job Type', "assets/gg-icon/attention-icon.svg");
		}else{
			this.alertController.create({
				header: 'Confirmation',
				message: 'Do you want to request for this job?',
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
							'pending_job_data': item,
						}
	
						this.httpClient.post(this.App.api_url + "/appRiderSubmitJobRquest", tobeSubmit, { observe: "body" }).subscribe((data: any) => {
	
							this.loadingController.dismiss();
	
							if (data.status == "OK") {
	
								this.alertController
									.create({	
										cssClass: "successfulMessage",
										header: "You successful submit the request job.",
										buttons: [{ text: "OK" }],
									})
									.then((alert) => alert.present());
	
									this.getPendingOrderList();
	
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
	}

	getItemData(item) {
		if (item.pendingOrderData && item.pendingOrderData.status == '0') {
		  return {
			styles: {
			  'margin-top': '10px',
			  'color': 'white',
			  'background-color': 'green',
			  'border': '1px solid green',
			  'border-radius': '5px',
			  'padding': '5px',
			  'font-size': '12px',
			  'font-weight': 'bold'
			},
			text: 'Request Sent'
		  };
		}else {
		  return {}; // Default styles and text when none of the conditions match
		}
	  }

	  set_current_tab(tab,type){
		console.log(type)
		if(type == 'child'){
			if(tab == this.configData.current_tab_child){
				this.configData.current_tab_child = '';
			}else{
				this.configData.current_tab_child = tab;
			}
		}else{
			if(tab == this.configData.current_tab){
				this.configData.current_tab = '';
			}else{
				this.configData.current_tab = tab;
			}
		}
		
	}
}
