import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpRequest } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
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
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ConfigService } from '../config.service';
// import { StatusBar as CapacitorStatusBar } from '@capacitor/status-bar';

@Component({
	selector: 'app-bullion-change-request',
	templateUrl: './bullion-change-request.page.html',
	styleUrls: ['./bullion-change-request.page.scss'],
})
export class BullionChangeRequestPage implements OnInit {

	goods_received_note_detail_id = this.route.snapshot.paramMap.get("goods_received_note_detail_id");
	grnData = {}; // GRN
	grnDetailData = []; // single GRND
	warehouseList = [];
	
	grn_change_requests = [];
	requestStatusList = [];
	returned_grnd = [];
	record_grnd_id = 0;
	allowAdd = 0;
	is_admin = 0;
	selected_warehouse_id = 0;
	gmsakToken = "";

	// Image Slide
	slideOpts = {
		initialSlide: 0,
		speed: 400,
		slidesPerView: 1,
	};
	slideOpts2 = {
		initialSlide: 0,
		speed: 400,
		slidesPerView: 'auto',
		spaceBetween: 10,
	};

	constructor(
		public alertController: AlertController,
		private router: Router,
		public httpClient: HttpClient,
		public App: AppComponent,
		private route: ActivatedRoute,
		public loadingController: LoadingController,
		public menuCtrl: MenuController,
		public actionSheetController: ActionSheetController,
		public location: Location,
		private config: ConfigService
	) {
		this.get_change_request_list();
	}

	async ngOnInit() {
		// await this.checkPermissions();
		this.gmsakToken = localStorage['googleApiKey'] || '';
	}

	private async checkPermissions() {
		try {
			const permissionStatus = await Camera.checkPermissions();
			if (permissionStatus.camera !== 'granted') {
				await Camera.requestPermissions();
			}
		} catch (error) {
			console.error('Error checking camera permissions:', error);
			await this.presentErrorAlert('Error', 'Failed to get camera permissions');
		}
	}

	async presentErrorAlert(header: string, message: string | boolean) {
		const errorMessage = typeof message === 'boolean' ? 'An error occurred.' : message.toString();
		const alert = await this.alertController.create({
			header: header,
			message: errorMessage,
			buttons: ['OK']
		});
		await alert.present();
	}

	get_change_request_list() {
		this.App.presentLoading();
		this.httpClient
			.get(
				this.App.api_url + "/appGetChangeRequestData/" + this.goods_received_note_detail_id + "/" + localStorage['token'])
			.subscribe(
				(data: any) => {

					console.log(data.result)
					this.grnData = data.result["grn"];
					if(this.grnData['MultipleImageUrl_tng'] !== null){
						this.grnData['MultipleImageUrl_tng'] = JSON.parse(this.grnData['MultipleImageUrl_tng'])
					}else if(this.grnData['MultipleImageUrl_tng'] == null){
						this.grnData['MultipleImageUrl_tng'] = [];
					}

					this.grnDetailData = data.result["grn_detail"];
					this.selected_warehouse_id = this.grnDetailData['warehouse_id'];
					this.warehouseList = data.result["warehouseList"];
					this.record_grnd_id = data.result['record_grnd_id'];
					
					let requestStatusList = data.result['requestStatusList'];
					this.grn_change_requests = data.result['grn_change_requests'];
					console.log(this.grn_change_requests)

					this.grn_change_requests.forEach((item, index) => {
						this.grn_change_requests[index]['status_color'] = '#'+requestStatusList[item['status']]['color'];
						this.grn_change_requests[index]['status_title'] = requestStatusList[item['status']]['title'];
						if(item.gainLoss_XAU > 0){
							this.grn_change_requests[index]['XAU_status_color'] = 'green';
							this.grn_change_requests[index]['XAU_status_text'] = '▲';
						}else{
							this.grn_change_requests[index]['XAU_status_color'] = 'red';
							this.grn_change_requests[index]['XAU_status_text'] = '▼';
						}
						
						if(item['is_new'] == 0){
							if(item['image_list']){
								this.grn_change_requests[index]['image_list'] = JSON.parse(item['image_list']);
								console.log(this.grn_change_requests[index]['image_list'])
							}
							if(!item['remark']){
								this.grn_change_requests[index]['remark'] = '-';
							}
						}
					});
					this.warehouseList = data.result['warehouseList'];
					// this.returned_grnd = data.result['returned_grnd'];
					this.allowAdd = data.result['allowAdd'];
					this.is_admin = data.result['is_admin'];

				},
				(error) => {
					this.loadingController.dismiss();
					console.log(error);
				}
			);
	}

	update_now($id) {

		let tobeSubmit = {
			'grnd_change_request_id': $id,
			'token': localStorage['token'],
			'mode': '-99', // update
		}
		this.alertController.create({
			header: 'Select Change Status',
			message: 'Please be aware that once the status is confirmed, it cannot be changed.',
			buttons: [
				{
					text: 'Reject',
					handler: () => {
						tobeSubmit['status'] = 2;
						this.App.presentLoading();
						this.postData(tobeSubmit);
					}
				},
				{
					text: 'Confirm',
					handler: () => {
						tobeSubmit['status'] = 1;
						this.App.presentLoading();
						this.postData(tobeSubmit);
					}
				}
			]
		}).then(alert => {
			alert.present();
		});
	}

	postData(tobeSubmit){
		
		console.log(tobeSubmit)
		this.App.presentLoading();

		this.httpClient.post(this.App.api_url + "/appSubmitChangeRequestData", tobeSubmit, { observe: "body" }).subscribe((data: any) => {

			this.loadingController.dismiss();

			if (data.status == "OK") {

				this.alertController
					.create({
						cssClass: "successfulMessage",
						header: "You successful update the GRND change request.",
						buttons: [{ text: "OK" }],
					})
					.then((alert) => alert.present());

				this.router.navigate(["/bullion-change-request/",this.grnDetailData['goods_received_note_detail_id']]);

			} else {
				this.App.presentAlert_default(data['status'], data['result'], "assets/gg-icon/attention-icon.svg");
			}
		}, error => {
			this.loadingController.dismiss();
			this.App.presentAlert_default('ERROR', "Connection Error", "assets/gg-icon/attention-icon.svg");
		});
	}
}

