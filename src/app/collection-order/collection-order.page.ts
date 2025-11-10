import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, MenuController, IonReorderGroup, ItemReorderEventDetail, NavController } from '@ionic/angular';
import { AppComponent } from '../app.component';

import { Httprequest } from "../models/httprequest";

@Component({
	selector: 'app-collection-order',
	templateUrl: './collection-order.page.html',
	styleUrls: ['./collection-order.page.scss'],
	providers: []
})

export class CollectionOrderPage implements OnInit {
	@ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;
	constructor(
		public alertController: AlertController,
		private router: Router,
		public HttpClient: HttpClient,
		public App: AppComponent,
		private route: ActivatedRoute,
		public loadingController: LoadingController,
		public menuCtrl: MenuController,
		private navCtrl: NavController
	) { }

	mode = "home";
	stepMode = "noSelect";
	find = "";
	url = "";
	viewMode = "empty";
	userList = [];
	collectionList = [];
	has_collectionList = 1;
	detail = "";
	status_color_kvList:any = {};


	ngOnInit() {
		this.getCollectionList();

	}

	getCollectionList() {
		// this.App.presentLoading();
		this.HttpClient
			.get(
				this.App.api_url + "/appGetCollectionList/" + localStorage['token']
			)
			.subscribe(
				(data: any) => {
					//   this.loadingController.dismiss();
					this.collectionList = data.result['collectionList'];
					this.status_color_kvList = data.result['status_color_kvList'];
					console.log("DATA", this.collectionList);

				},
				(error) => {
					//   this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	doReorder(ev: CustomEvent<ItemReorderEventDetail>) {
		// Before complete is called with the items they will remain in the
		// order before the drag
		console.log('Before complete', this.collectionList);

		// Finish the reorder and position the item in the DOM based on
		// where the gesture ended. Update the items variable to the
		// new order of items
		this.collectionList = ev.detail.complete(this.collectionList);
		this.updateOrder();
		// After complete is called the items will be in the new order
		console.log('After complete', this.collectionList);
	}

	updateOrder() {
		let tobeSubmit = {
			'account_id': localStorage['login_user_id'],
			'token': localStorage['token'],
			'dataList': this.collectionList,
		};

		this.HttpClient.post(this.App.api_url + "/appUpdateCollectionOrder", tobeSubmit, { observe: "body" }).subscribe((data) => {
			if (data['status'] == "OK") {
				this.App.stopLoading(100);
				// this.navCtrl.navigateRoot('pickup',{animationDirection:'forward'});

			} else {
				this.App.stopLoading(100);
				// this.loadingController.dismiss();
				this.App.presentAlert_default('', 'Error!. Please try again', "assets/gg-icon/attention-icon.svg");
			}
		}, error => {
			this.App.stopLoading(100);
			// this.loadingController.dismiss();
			//ERROR
			this.App.presentAlert_default('', "Connection Error", "assets/gg-icon/attention-icon.svg");
		});
	}
}
