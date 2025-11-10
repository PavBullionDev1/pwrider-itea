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
import { ModalController, NavController } from '@ionic/angular';
import { ModalTaskDetailPage } from '../modal-task-detail/modal-task-detail.page';
import { ModalClaimCartPage } from '../modal-claim-cart/modal-claim-cart.page';

@Component({
  selector: 'app-task',
  templateUrl: './redeem-task.page.html',
  styleUrls: ['./redeem-task.page.scss'],
  providers: [],
})
export class RedeemTaskPage implements OnInit {

	TaskSum: any;
	TaskList: any;
	userList: any;
	total_cart: 0;
	pre_load_cart: any = 0;
  customerList: any = [];
  filteredCustomers: any = [];
  selectedCustomer: any;
  searchCustomerText: any;

	statusList = {
		0: 'Pending',
		1: 'Done',
		2: 'Ignore',
		3: 'Taken',
		4: 'On The Way',
		5: 'Booked'
	};

  constructor(
    public alertController: AlertController,
		public HttpClient: HttpClient,
		public App: AppComponent,
		public loadingController: LoadingController,
		public menuCtrl: MenuController,
		public modalController: ModalController,
		public location: Location,
    ) { }

	ngOnInit() {
    this.getAllCustomer();
	}

  	ionViewWillEnter() {
		//this.getTaskList();
		this.getCartList();
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

  	getTaskList() {
		const filter = {
			group_type:0
		};
		let tobeSubmit:any = {
			'token': localStorage['token'],
      		'customer_id': this.selectedCustomer,
			'filter': filter,
			'mode': "List", // insert
		}

		this.HttpClient.post(this.App.api_url + "/getTaskListbyStateGroup/" + localStorage['token'] , tobeSubmit, { observe: "body" })
			.subscribe((data: any) => {
				//this.TaskSum = this.transformData(data.result['GroupSum']);
				this.TaskList = this.transformData(data.result['data']);
				//console.log("DATA",this.TaskSum);
				console.log("DATA",this.TaskList);
			},
			(error) => {
				console.log(error);
			});
	}

	transformData(data: any): any[] {
		return Object.keys(data).map(key => {
			return {
				state: key,
				customer_list: Object.values(this.filterData(data[key])),
				customer_count: data[key].countCustomer,
				task_count: data[key].taskTotalCount,
			};
		});
	}

	filterData(data: any): any {
		const result = [];
		Object.keys(data).forEach((key, index) => {
		  if (data[key] && typeof data[key] === 'object' && Array.isArray(data[key].data)) {
			result.push({
			  customer_name: key,
			  ...data[key]
			});
		  }
		});

		return result.reduce((acc, item, index) => {
		  acc[index] = item;
		  return acc;
		}, {});
	}

	doRefresh(event) {
		this.getTaskList();
		this.pre_load_cart = 0;
		this.getCartList();
		event.target.complete();
	}

	async getOrderList(task) {

		let tobeSubmit:any = {
			'task_id': task.task_id,
			'job_type': task.job_type,
		}

		var orderList = {};
		this.HttpClient.post(this.App.api_url + "/getTaskData/" + localStorage['token'] , tobeSubmit, { observe: "body" })
			.subscribe((data: any) => {
				orderList = data.result['data'];
				console.log("Order List",orderList);
				this.view_detail(orderList, task);
			},
			(error) => {
				console.log(error);
			});
	}

	async view_detail(item:any, task?:any) {

		const modal = await this.modalController.create({
			component: ModalTaskDetailPage,
			componentProps: {
				task: task,
				orderList: item,
			},
			backdropDismiss: false,
		});
		await modal.present();

		modal.onDidDismiss().then((return_data => {
			console.log(return_data.data)
			if(return_data.data.needBook == true){
				this.bookTask(return_data.data.task, 5);
			}
		}));
	}

	bookTask(item, status) {

		let tobeSubmit:any = {
			'task_id': status == 0? item:item.task_id,
			'user_id': localStorage['login_user_id'],
			'status': parseInt(status),
		}

		this.HttpClient.post(this.App.api_url + "/bookTask/" + localStorage['token'] , tobeSubmit, { observe: "body" })
			.subscribe((data: any) => {
				var cart_data = data.result['data'];
				console.log("CartData",cart_data);

				this.getTaskList();
				this.pre_load_cart = 0;
				this.getCartList();
			},
			(error) => {
				console.log(error);
			});
	}

	async getCartList() {

		let tobeSubmit:any = {
			'token': localStorage['token'],
			'user_id': localStorage['login_user_id'],
		}

		this.HttpClient.post(this.App.api_url + "/getClaimCart/" + localStorage['token'] , tobeSubmit, { observe: "body" })
			.subscribe((data: any) => {
				console.log("CartList",data.result['data']);
				this.total_cart = data.result['data'].length;
				if(this.pre_load_cart !== 0){
					this.view_cart(data.result['data']);
				}else{
					this.pre_load_cart = 1;
				}
			},
			(error) => {
				console.log(error);
			});
	}

	async view_cart(item) {

		const modal = await this.modalController.create({
			component: ModalClaimCartPage,
			componentProps: {
				modalData: item,
			},
			backdropDismiss: false,
		});
		await modal.present();

		modal.onDidDismiss().then((cart_data => {
			if(cart_data.data.deleted_ids.length > 0){
				cart_data.data.deleted_ids.forEach((task_id) => {
					this.bookTask(task_id, 0); //remove task
					console.log(task_id,"removed sucessfully!")
				})
			}
			if(cart_data.data.confirm == true){
				this.confirmCart(cart_data.data.cartList);
			}
		}));
	}

	async confirmCart(claimCart) {

		const currentDate = new Date();

		const year = currentDate.getFullYear();
		const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed, so add 1
		const day = String(currentDate.getDate()).padStart(2, '0');

		const formattedDate = `${year}-${month}-${day}`;

		claimCart.forEach((cart_task, key) => {
			if(cart_task.job_date == '0000-00-00'){
				claimCart[key].job_date = formattedDate;
			}
		})
		let tobeSubmit:any = {
			'claim_cart': claimCart,
			'user_id': localStorage['login_user_id'],
		}

		this.HttpClient.post(this.App.api_url + "/confirmClaimTask/" + localStorage['token'] , tobeSubmit, { observe: "body" })
			.subscribe((data: any) => {
				this.getTaskList();
				this.pre_load_cart = 0;
				this.getCartList();
			},
			(error) => {
				console.log(error);
			});
	}
}
