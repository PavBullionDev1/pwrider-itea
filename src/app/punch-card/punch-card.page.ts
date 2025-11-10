import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { MenuController, AlertController, LoadingController, ActionSheetController, Platform, ModalController } from '@ionic/angular';
import { AppComponent } from '../app.component';
import { Httprequest } from '../models/httprequest';
import { Router } from '@angular/router';
import { ModalPunchingPage } from '../modal-punching/modal-punching.page';

@Component({
	selector: 'app-punch-card',
	templateUrl: './punch-card.page.html',
	styleUrls: ['./punch-card.page.scss'],
})
export class PunchCardPage implements OnInit {

	constructor(
		public App: AppComponent,
		public httpClient: HttpClient,
		public alertController: AlertController,
		public loadingController: LoadingController,
		public menuCtrl: MenuController,
		private router: Router,
		private modalController: ModalController
	) {
		this.menuCtrl.swipeGesture(false);
	}

	year_option = [
		'2022', '2023', '2034', '2025', '2026', '2027', '2028', '2029', '2030'
	];
	month_option = [
		'01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'
	];

	searchConfig = {
		'year': new Date().getFullYear().toString(),
		'month': ((new Date().getMonth() + 1).toString()).padStart(2, '0'),
	};

	resultList = [];

	today = "";

	ngOnInit() {
	}

	ionViewWillEnter() {
		this.get_punched_log();
	}

	get_punched_log() {
		this.App.presentLoading();

		this.httpClient.get(this.App.api_url + "/punched_log/get_punched_log_by_date/" + localStorage['login_user_id'] + '/' + localStorage['token'] + '/' + this.searchConfig.year + '/' + this.searchConfig.month, { observe: "body" }).subscribe((data: any) => {

			this.App.stopLoading();

			console.log('get_punched_log', data);
			if (data.status == "OK") {
				this.resultList = data.result.resultList;
				this.today = data.result.today;
			} else {
				this.App.presentAlert_default('ERROR', data['result'], "../../assets/attention2-icon.svg");
			}

		}, error => {
			this.App.stopLoading();
			// this.loadingController.dismiss();
			this.App.presentAlert_default('ERROR', "Connection Error", "../../assets/attention2-icon.svg");
		});
	}

	backToPrev() {
		this.App.goBack('home');
	}

	onSwipeLeft(event: any) {
		// 实现左滑功能
		console.log('Swipe left detected', event);
	}

	async view_detail(item: any) {

		const modal = await this.modalController.create({
			component: ModalPunchingPage,
			componentProps: {
				modalData : item
			},
			backdropDismiss:false,
		});
		await modal.present();

		modal.onDidDismiss().then((data => {			
		}));

	}
}
