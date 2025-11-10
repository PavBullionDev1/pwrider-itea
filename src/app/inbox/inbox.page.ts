import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AlertController, IonicModule, LoadingController, IonRouterOutlet, MenuController, NavController } from '@ionic/angular';
import { AppComponent } from '../app.component';
import { Httprequest } from "../models/httprequest";
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.page.html',
  styleUrls: ['./inbox.page.scss'],
  providers: [IonRouterOutlet]
})
export class InboxPage implements OnInit {
  configData: any = {};
  inbox_type = this.route.snapshot.paramMap.get("inbox_type");
  inbox_list: any[] = [];
  level = '';
  can_approve_inbox_job = '';
  filterText = '';
  constructor(
    private router: Router,
    private route: ActivatedRoute,
		public alertController: AlertController,
		public HttpClient: HttpClient,
		public loadingController: LoadingController,
		public App: AppComponent,
		public menuCtrl: MenuController,
		public chatService: ChatService,
		private navCtrl: NavController,
  ) { }

  ngOnInit() {

	const currentDate = new Date();

	const year = currentDate.getFullYear();
	const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');

	const yearMonth = `${year}-${month}`;

    this.level = localStorage['level'];
	this.configData['inbox_type'] = this.inbox_type;
	this.configData['is_read'] = 0;
	this.configData['mark_as_read'] = 0;
	this.configData['current_tab'] = yearMonth;
	this.can_approve_inbox_job = localStorage['can_approve_inbox_job'];
  }

  ionViewWillEnter() {
	this.configData['is_read'] = 0;
    this.getInboxList();
  }

  getInboxList() {
		// this.App.presentLoading();
		this.HttpClient
			.get(
				this.App.api_url + "/appGetInbox/" + localStorage['token'] +'/'+localStorage['login_user_id']+'/'+this.configData['inbox_type']+'/'+this.configData['is_read']+'/'+this.configData['mark_as_read'] + '/app_enable'
			)
			.subscribe(
				(data: any) => {
					//   this.loadingController.dismiss();
         			this.inbox_list = data.result['data'];
					this.configData['mark_as_read'] = 0;

					var sortedKeys = Object.keys(this.inbox_list).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

					// Create a new object with sorted keys
					var sortedInboxList = sortedKeys.map(key => ({
						key: key,
						value: {
							inboxList: this.inbox_list[key].inboxList,
							is_read: this.inbox_list[key].is_read
						}
					}));
					
					// Update this.inbox_list with the sorted array
					this.inbox_list = sortedInboxList;
				},
				(error) => {
					//   this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	changeStatus(type) {
		if(type == 'unread'){
			this.configData['is_read'] = 0;
		}else{
			this.configData['is_read'] = 1;
		}

		this.getInboxList();
	}
	
	markAsRead(key) {
		this.configData['mark_as_read'] = key;

		this.getInboxList();
	}

	set_current_tab(tab){
		if(tab == this.configData['current_tab']){
			this.configData['current_tab'] = '';
		}else{
			this.configData['current_tab'] = tab;
		}
	}
		

	submit_now(item,action) {
		if(item.type == 0){
			item.type = 'bullion';
		}else{
			item.type = 'logistic';
		}
		this.alertController.create({
			header: 'Confirmation',
			message: 'Do you want to '+action+' this job?',
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
						"action": action,
						"token": localStorage['token'],
						"type": item.type,
						"is_task": item.is_task,
						"pendingData": item,
					}

					this.HttpClient.post(this.App.api_url + "/pending_orderSubmit", tobeSubmit, { observe: "body" }).subscribe((data: any) => {

						this.loadingController.dismiss();

						if (data.status == "OK") {

							this.alertController
								.create({	
									cssClass: "successfulMessage",
									header: "You successful "+action+" the request job.",
									buttons: [{ text: "OK" }],
								})
								.then((alert) => alert.present());

								this.getInboxList();

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

	qc_confirmation_submit(item,action) {
		this.alertController.create({
			header: 'Confirmation',
			message: 'Do you want to '+action+' about this qc checking for this grn?',
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
						"action": action,
						"token": localStorage['token'],
						"QCConfirmation": item,
					}

					this.HttpClient.post(this.App.api_url + "/appSubmitQCSeniorGRNChecking", tobeSubmit, { observe: "body" }).subscribe((data: any) => {

						this.loadingController.dismiss();

						if (data.status == "OK") {

							this.alertController
								.create({	
									cssClass: "successfulMessage",
									header: "You successful "+action+" the request job.",
									buttons: [{ text: "OK" }],
								})
								.then((alert) => alert.present());

								this.getInboxList();

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

		this.getInboxList();
	}

}
