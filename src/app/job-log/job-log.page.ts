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
  selector: 'app-job-log',
  templateUrl: './job-log.page.html',
  styleUrls: ['./job-log.page.scss'],
  providers: [],
})

export class JobLogPage implements OnInit {

  sales_order_List: any;
  filterText: string = '';

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
    this.getsales_order_List();
  }

  getsales_order_List() {
		// this.App.presentLoading();
		this.HttpClient
			.get(
				this.App.api_url + "/appGetjoblogList/" + localStorage['token']
			)
			.subscribe(
				(data: any) => {
					//   this.loadingController.dismiss();
					this.sales_order_List = data.result['sales_order_List'];
          //this.userList = data.result['userList'];
					console.log("DATA",this.sales_order_List);

				},
				(error) => {
					//   this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	doRefresh(event) {
		// console.log('Begin async operation');
		this.getsales_order_List();

		event.target.complete();

	}

}


