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
  selector: 'app-collection-supplier',
  templateUrl: './exchange-note-list.page.html',
  styleUrls: ['./exchange-note-list.page.scss'],
	providers: [NativeAdapterService],
})
export class ExchangeNoteListPage implements OnInit {

	//actually is Purchase Order List
	dataList: any;
	url = "";
	status_color_kvList:any = {};
  selectedCustomer; any;
  customerList:any = [];
  searchCustomerText:any = '';
	isLoading = false;

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
    this.getAllCustomer();
	}

	ionViewWillEnter() {
		this.getSupplierList();

	}

  getAllCustomer() {
    this.HttpClient.get(this.App.api_url + "/getAllCustomer/" + localStorage['token'] )
      .subscribe((data: any) => {
          this.customerList = data.result.data;
          console.log(this.customerList);
        },
        (error) => {
          console.log(error);
        });
  }


	getSupplierList() {
		this.isLoading = true;
		// this.App.presentLoading();
		this.HttpClient
			.get(
				this.App.api_url + "/appGetExchangeNoteList/" + localStorage['token']
			)
			.subscribe(
				(data: any) => {
					this.isLoading = false;
					//   this.loadingController.dismiss();
					this.dataList = data.result['dataList'];
					console.log("this.dataList",this.dataList);

				},
				(error) => {
					this.isLoading = false;
					//   this.loadingController.dismiss();
					console.log(error);
				}
			);
	}

	doRefresh(event) {
		// console.log('Begin async operation');
		this.getSupplierList();

		event.target.complete();

	}


	sendWhatsapp(item) {
		this.url = "https://api.whatsapp.com/send/?phone=" + item.dial_code + item.mobile + "&text=Dear+Valued+Customer%2C+RIDER+will+be+arrive+your+place+within+30mins&app_absent=0";
		this.openWebPage(this.url);
	}

	openMap(item) {
		this.url = "http://maps.google.com/?q=" + item.address1 + "," + item.address2 + "," + item.city + "," + item.postcode;
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
