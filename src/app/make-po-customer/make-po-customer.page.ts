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
  selector: 'app-make-po-customer',
  templateUrl: './make-po-customer.page.html',
  styleUrls: ['./make-po-customer.page.scss'],
  providers: [],
})
export class MakePoCustomerPage implements OnInit {

  customerList=[];
  customer_id = 0;
  searchText = '';

  constructor(
    public alertController: AlertController,
		private router: Router,
		public HttpClient: HttpClient,
		public App: AppComponent,
		private route: ActivatedRoute,
		public loadingController: LoadingController,
		public menuCtrl: MenuController,
		public location: Location,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
		this.getCustomerList();
	}

  getCustomerList() {
		this.App.presentLoading();
		this.HttpClient
			.get(
				this.App.api_url + "/appGetCustomerList")
			.subscribe(
				(data: any) => {

					this.loadingController.dismiss();
					this.customerList = data.result['customerList'];
					console.log("this.customerList", this.customerList);
				},
				(error) => {
					//this.loadingController.dismiss();

					console.log(error);
				}
			);
			
	}

  isValidCustomer(): boolean {
    if (this.customer_id && !isNaN(this.customer_id)) {
      return true;
    } else {
      return false;
    }
  }

}
