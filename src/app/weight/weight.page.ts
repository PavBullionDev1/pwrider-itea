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
  selector: 'app-weight',
  templateUrl: './weight.page.html',
  styleUrls: ['./weight.page.scss'],
	providers: [],
})
export class WeightPage implements OnInit {

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

	get_result_list() {
		this.isLoading = true;
		this.HttpClient
			.get(
				this.App.api_url + "/appGetPendingWeightList/" + localStorage['token'] + "?customer_id=" + this.selectedCustomer
			)
			.subscribe(
				(data: any) => {
					this.resultList = data.result['resultList'];
          this.filteredList = [...this.resultList];
					this.isLoading = false;
					//console.log("DATA",this.collectionList);
				},
				(error) => {
					this.isLoading = false;
					console.log(error);
				}
			);
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

	doRefresh(event: any) {
		this.get_result_list();
		event.target.complete();
	}
}
