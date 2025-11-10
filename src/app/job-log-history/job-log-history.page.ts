import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpRequest } from "@angular/common/http";
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
	selector: 'app-job-log-history',
	templateUrl: './job-log-history.page.html',
	styleUrls: ['./job-log-history.page.scss'],
	providers: [],
})
export class JobLogHistoryPage implements OnInit {

	job_log_list = [];
	sales_order_id = this.route.snapshot.paramMap.get("sales_order_id");
	filterText = '';
	
	doRefresh(event?: any) {
		this.get_result_list();
		if (event) {
			event.target.complete();
		}
	}

	constructor(
		public alertController: AlertController,
		private router: Router,
		public HttpClient: HttpClient,
		public App: AppComponent,
		private route: ActivatedRoute,
		public loadingController: LoadingController,
		public menuCtrl: MenuController,
	) { }

	ngOnInit() {
		this.get_result_list();
	}

	get_result_list() {
		
		var tobeSubmit = {
			'user_id' : localStorage['login_user_id'],
			'token' : localStorage['token'],
			'sales_order_id' : this.sales_order_id
		};

		this.HttpClient.post(this.App.api_url+"/rider_get_latest_job_log_history",tobeSubmit,{observe: "body"}).subscribe((data) => {

			if(data['status'] == "OK") {
			
				this.job_log_list = data['result']['job_log_list'];
				console.log('owo get_result_list',this.job_log_list);

			}else{
				console.log(data);
			}
		}, error => {
			console.log(error);
		});
	}
}
