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
import { NativeAdapterService } from '../services/native-adapter.service';
import { AppComponent } from "../app.component";
import { Httprequest } from "../models/httprequest";

@Component({
	selector: 'app-collection',
	templateUrl: './collection.page.html',
	styleUrls: ['./collection.page.scss'],
	providers: [NativeAdapterService],
})
export class CollectionPage implements OnInit {

	//actually is Purchase Order List
	collectionList: any;
	url = "";
	status_color_kvList:any = {};

	constructor(
		public alertController: AlertController,
		private router: Router,
		public HttpClient: HttpClient,
		public App: AppComponent,
		private route: ActivatedRoute,
		public loadingController: LoadingController,
		public menuCtrl: MenuController,
		public location: Location,
		private nativeAdapter: NativeAdapterService,
	) { }

	ngOnInit() {
	}

	ionViewWillEnter() {
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
				},
				(error) => {
					//   this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	doRefresh(event) {
		// console.log('Begin async operation');
		this.getCollectionList();

		event.target.complete();

	}


	sendWhatsapp(item) {
		this.url = "https://api.whatsapp.com/send/?phone=" + item.sender_telephone + "&text=Dear+Valued+Customer%2C+RIDER+will+be+delivered+your+shipment+within+30mins&app_absent=0";
		this.openWebPage(this.url);
	}

	openMap(item) {
		this.url = "http://maps.google.com/?q=" + item.customer_address1 + "," + item.customer_address2 + "," + item.customer_city + "," + item.customer_postcode;
		this.openWebPage(this.url);
	}

	async openWebPage(url: string) {
		try {
			await this.nativeAdapter.openInAppBrowser(url, '_system');
		} catch (error) {
			console.error('Error opening URL:', error);
		}
	}


}
