import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { MenuController, AlertController, LoadingController, ActionSheetController, Platform } from '@ionic/angular';
import { AppComponent } from '../app.component';
import { Httprequest } from '../models/httprequest';
import { Router } from '@angular/router';

@Component({
	selector: 'app-company-holiday',
	templateUrl: './company-holiday.page.html',
	styleUrls: ['./company-holiday.page.scss'],
})
export class CompanyHolidayPage implements OnInit {

	constructor(
		public menuCtrl: MenuController,
		public httpClient: HttpClient,
		public alertController: AlertController,
		public loadingController: LoadingController,
		public App: AppComponent,
		private router: Router,

	) { 
		this.menuCtrl.swipeGesture(false);
	}

	holidayList:any = [];

	ngOnInit() {
	}

	ionViewWillEnter(){
		this.load_company_holiday_list();
	}

	load_company_holiday_list(){
		this.App.presentLoading();

		let target_year = new Date().getFullYear();

		this.httpClient.get(this.App.api_url + "/app/holiday/get_holiday_list/" + localStorage['login_user_id'] + '/' + localStorage['token']+'/'+target_year, { observe: "body" })
			.subscribe((data: any) => {

				this.App.stopLoading();
				// this.loadingController.dismiss();
				console.log(data);
				if (data.status == "OK") {

					this.holidayList = data.result.resultList;
					console.log('owo holidayList', this.holidayList);
				} else {
					this.App.presentAlert_default('ERROR', data['result'], "../../assets/attention2-icon.svg");
				}

			}, error => {
				this.App.stopLoading();
				// this.loadingController.dismiss();
				this.App.presentAlert_default('ERROR', "Connection Error", "../../assets/attention2-icon.svg");
			});
	}
}
