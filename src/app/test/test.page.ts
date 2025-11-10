import { Location } from "@angular/common";
import { HttpClient, HttpRequest } from "@angular/common/http";
import { Component, OnInit, ViewChild } from '@angular/core';
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
  selector: 'app-test',
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
	providers: [],
})
export class TestPage implements OnInit {

	//actually is Purchase Order List
	resultList: any[] = [];
	url: string = "";
	isLoading: boolean = false;
  selectedCustomer: any = '';
  customerList: any[] = [];
  searchCustomerText: string = '';
  filteredList: any[] = []; // Filtered list based on filter selection
  currentFilter: string = 'all'; // Default filter

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
    this.getAllCustomer();
	}

	ionViewWillEnter() {
		this.get_result_list();

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

  setFilter(filter: string) {
    this.currentFilter = filter;

    if (filter === 'PO') {
      this.filteredList = this.resultList.filter(item => item.po_type == 0);
    } else if (filter === 'Exc') {
      this.filteredList = this.resultList.filter(item => item.po_type == 1);
    } else if (filter === 'Melt') {
      this.filteredList = this.resultList.filter(item => item.po_type == 2);
    } else {
      this.filteredList = [...this.resultList];
    }
  }

  resetFilters() {
    this.currentFilter = 'all';
    this.searchCustomerText = '';
    this.selectedCustomer = '';
    this.get_result_list();
  }

	get_result_list() {
		this.isLoading = true;
		// this.App.presentLoading();
		this.HttpClient
			.get(
				this.App.api_url + "/appGetPendingTestList/" + localStorage['token'] +"?customer_id=" + this.selectedCustomer
			)
			.subscribe(
				(data: any) => {
					//   this.loadingController.dismiss();
					this.isLoading = false;
					this.resultList = data.result['resultList'];
          this.filteredList = [...this.resultList];
					//console.log("DATA",this.collectionList);

				},
				(error) => {
					this.isLoading = false;
					//   this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	doRefresh(event: any) {
		// console.log('Begin async operation');
		this.get_result_list();

		event.target.complete();

	}
}
