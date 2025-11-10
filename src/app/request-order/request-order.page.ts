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

@Component({
  selector: 'app-request-order',
  templateUrl: './request-order.page.html',
  styleUrls: ['./request-order.page.scss'],
  providers: [],
})
export class RequestOrderPage implements OnInit {

  url = "";
	type = this.route.snapshot.paramMap.get("type");
	configData:any = [];
	inlineCount:0;
	my_user_id = "";

	requestOrderList: [];

  constructor(
    public alertController: AlertController,
		private router: Router,
		public HttpClient: HttpClient,
		public App: AppComponent,
		private route: ActivatedRoute,
		public loadingController: LoadingController,
		public menuCtrl: MenuController,
		public location: Location,

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
		this.getRequestOrderList();
	}

  doRefresh(event) {
		// console.log('Begin async operation');
		this.getRequestOrderList();

		event.target.complete();

	}

  getRequestOrderList() {
		this.App.presentLoading();
		this.HttpClient
			.get(
				this.App.api_url + "/appGetRequestOrderList/"+ this.type + '/' + localStorage['token']
			)
			.subscribe(
				(data: any) => {
					this.loadingController.dismiss();
					this.inlineCount = data.result['inlineCount'];
					this.requestOrderList = data.result['requestOrderList'];
					console.log("this.requestOrderList",this.requestOrderList);

				},
				(error) => {
					this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	submit_now(item,action){
		if(item.job_type == ''){
			this.App.presentAlert_default('ERROR', 'Please Select a Job Type', "assets/gg-icon/attention-icon.svg");
		}else{
			this.alertController.create({
				header: 'Confirmation',
				message: 'Do you want to accept this job?',
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
							'token': localStorage['token'],
							'pendingData': item,
							'action': action,
							'type':this.type,
						}
	
						this.httpClient.post(this.App.api_url + "/pending_orderSubmit", tobeSubmit, { observe: "body" }).subscribe((data: any) => {
	
							this.loadingController.dismiss();
	
							if (data.status == "OK") {
	
								this.alertController
									.create({	
										cssClass: "successfulMessage",
										header: "You successful submit the request job.",
										buttons: [{ text: "OK" }],
									})
									.then((alert) => alert.present());
	
									this.getRequestOrderList();
	
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

	set_current_tab(tab,type){
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