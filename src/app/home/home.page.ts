import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, IonRouterOutlet, MenuController, NavController } from '@ionic/angular';
import { Swiper } from 'swiper';
import { AppComponent } from '../app.component';
import { Httprequest } from "../models/httprequest";
import { ChatService } from '../services/chat.service';
import { ConfigService } from '../config.service';


@Component({
	selector: 'app-home',
	templateUrl: './home.page.html',
	styleUrls: ['./home.page.scss'],
	providers: [IonRouterOutlet]
})
export class HomePage implements OnInit {
	@ViewChild('slidehome', { static: false }) slidehome: any;
	@ViewChild('slideWithNav3', { static: false }) slideWithNav3: any;
	@ViewChild(IonRouterOutlet, { static: false }) routerOutlet: IonRouterOutlet;
	@Output() swipeEvent = new EventEmitter<any>();

	app_access_logistic = localStorage['app_access_logistic'];
	app_access_bullion = localStorage['app_access_bullion'];

	is_admin = localStorage['level'];

	configData:any = {
		'Pwws_tab': false,
		'Task_tab': false,
    'Bull_tab': false,
    'Office_tab': true,
		'Logi_tab': false,
		'current_tab' : 'task',

		'total_reminder_logistic' : 'loading...',
		'total_reminder_bullion' : 0,
		'total_reminder_task' : 0,
	};

	my_user_id = "";

	supplierList:any = [];
  exchangeSupplierList:any = [];
	collectionList: [];
	riderList = [];
	riderList_pickup = [];
	logistic_customized_job_count = 0;
	logistic_request_job_count = 0;

	rider_pending_task_count = 0;
	rider_redeem_task_count = 0;
  scheduled_count = 0;
	bullion_inbox_unread_count = 0;
	logistic_inbox_unread_count = 0;
	bullion_pending_order_count = 0;
	bullion_pending_weight_count = 0;
	bullion_pending_test_count = 0;
	bullion_pending_reweight_count = 0;
	bullion_pending_check_count = 0;
	bullion_pending_tbc_count = 0;
	bullion_request_job_count = 0;
	cdo_redeem_count = 0;
	cdo_tasks_count = 0;

	slideOpts = {
		slidesPerView: 1,
		initialSlide: 0,
		speed: 400,
		modifierClass: 'customepagination',
		autoplay: true,
		pagination: {
			el: ".swiper-pagination",
			clickable: true
		}
	};
	isBeginningSlide = true;
	isEndSlide = false;


	//     public ionViewWillLeave(){
	//  this.slidehome.stopAutoplay();
	// }

	//     public ionViewWillEnter(){
	//  this.slidehome.startAutoplay();
	// }

	test: string;
	sliderHome: any;
	sliderThree: any;

	slideOptsThree = {
		grabCursor: true,
		slidesPerView: 2.5,
		spaceBetween: 16,
		loop: true,
	};

	findValue = "";

	mostTradedVouchers = [];
	voucherData = [];
	advertisementData = [];

	versionCode = "";

	constructor(
		private router: Router,
		public HttpClient: HttpClient,
		public loadingController: LoadingController,
		public App: AppComponent,
		public menuCtrl: MenuController,
		public chatService: ChatService,
		private navCtrl: NavController,
		private configService: ConfigService
	) {

		this.versionCode = configService.appConfig.version;

		//Item object for Fashion
		this.sliderThree =
		{
			isBeginningSlide: true,
			isEndSlide: false,
			slidesItems: []
		};

		this.sliderHome =
		{
			isBeginningSlide: true,
			isEndSlide: false,
			slidesItems: []
		};

		this.menuCtrl.swipeGesture(false);

	}

	ngOnInit() {
		this.my_user_id = localStorage['login_user_id'];
		// this.routerOutlet.swipeGesture = false;

		// console.log(this.voucherData);
		// this.getVoucher();
		this.sliderThree.slidesItems = this.voucherData;
		this.findValue = "";

		this.App.configurePushRegister();
	}

	ionViewWillEnter() {
		this.configData.total_reminder_bullion = 0;
		this.configData.total_reminder_logistic = 'loading...';
		this.get_access();
		this.getCollectionList();
		this.getOrderJobList();
		this.getTaskList();
		this.getRedeemTaskList();
    	this.getScheduledTaskListData();
		this.getDelivery();
		this.getPickup();
	}

	get_access() {
		this.app_access_logistic = localStorage['app_access_logistic'];
		this.app_access_bullion = localStorage['app_access_bullion'];
	}

	ionViewDidEnter() {
		// this.routerOutlet.swipeGesture = false;
		//this.slidehome.startAutoplay();
	}
	ionViewDidLeave() {
		//this.slidehome.stopAutoplay();
	}

	getOrderJobList() {
		// this.App.presentLoading();
		this.HttpClient
			.get(
				this.App.api_url + "/appGetTotalOrderJob/" + localStorage['token']
			)
			.subscribe(
				(data: any) => {
					this.supplierList = data.result['bullion_order_job_count'];
          			this.exchangeSupplierList = data.result['exc_order_job_count'];
					this.configData.total_reminder_bullion += this.supplierList;
				},
				(error) => {
					//   this.loadingController.dismiss();

					console.log(error);
				}
			);
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

					this.bullion_pending_order_count = data.result['bullion_pending_order_count'];
					this.bullion_pending_weight_count = data.result['bullion_pending_weight_count'];
					this.bullion_pending_test_count = data.result['bullion_pending_test_count'];
					this.bullion_pending_reweight_count = data.result['bullion_pending_reweight_count'];
					this.bullion_pending_check_count = data.result['bullion_pending_check_count'];
					this.bullion_pending_tbc_count = data.result['bullion_pending_tbc_count'];
					this.bullion_request_job_count = data.result['bullion_request_job_count'];

					this.configData.total_reminder_bullion += this.bullion_pending_order_count +
															  this.bullion_pending_weight_count +
															  this.bullion_pending_test_count +
															  this.bullion_pending_reweight_count +
															  this.bullion_pending_check_count +
															  this.bullion_pending_tbc_count +
                                							  this.bullion_request_job_count;

					// this.summarise_total_reminder();
				},
				(error) => {
					//   this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	getTaskList() {
		// this.App.presentLoading();
    var gType='C';
		this.HttpClient
			.get(
				this.App.api_url + "/appGetTaskList/" + gType  + "/" + localStorage['token']
			)
			.subscribe(
				(data: any) => {
					//   this.loadingController.dismiss();
					this.rider_pending_task_count = data.result['rider_pending_task_count'];
					this.bullion_inbox_unread_count = data.result['bullion_inbox_unread_count'];
					this.logistic_inbox_unread_count = data.result['logistic_inbox_unread_count'];
					//console.log("DATA",this.rider_pending_task_count);
				},
				(error) => {
					//   this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	getRedeemTaskList() {
		const filter = {
			group_type:0
		};
		let tobeSubmit:any = {
			'token': localStorage['token'],
			'filter': filter,
			'mode': "List", // insert
		}

		var TaskList = [];
		this.HttpClient.post(this.App.api_url + "/getTaskListbyStateGroup/" + localStorage['token'] , tobeSubmit, { observe: "body" })
			.subscribe((data: any) => {
				TaskList = data.result['data'];
				this.rider_redeem_task_count = Object.values(TaskList)
					.filter(item => item && item.taskTotalCount && item.state) // 只计算有效的州属数据
					.reduce((sum, item) => sum + (parseInt(item.taskTotalCount) || 0), 0);
			},
			(error) => {
				console.log(error);
			});
	}

  getScheduledTaskListData() {
    const filter = {
      date: new Date().toString(),
    };

    const tobeSubmit: any = {
      filter: filter,
      start_date: new Date().toISOString().split('T')[0],
      is_all: 1
    };

    this.HttpClient.post(this.App.api_url + "/getTaskListDataScheduled/" + localStorage['token'], tobeSubmit, { observe: "body" })
      .subscribe((data: any) => {
          this.scheduled_count = data.result['pending_count'];
        },
        (error) => {
          console.log(error);
        });
  }

	getDelivery() {
		// this.App.presentLoading(4000);
		this.HttpClient
			.get(
				this.App.api_url + "/getJob_logCustomList/1/" + localStorage['token']
			)
			.subscribe(
				(data: any) => {
					//   this.loadingController.dismiss();
					this.riderList = [];

					let tmp_riderList = data.result["riderList"];
					if (tmp_riderList != 0) {
						for (let i = 0; i < tmp_riderList.length; i++) {
							if (tmp_riderList[i].delivery_status != 1) {
								this.riderList.push(tmp_riderList[i]);
							}
						}
					} else {
						this.riderList = data.result["riderList"];
					}
					if(typeof this.configData.total_reminder_logistic == 'string'){
						this.configData.total_reminder_logistic = 0;
					}
					this.configData.total_reminder_logistic += this.riderList.length;
					// this.summarise_total_reminder();
				},
				(error) => {
					//   this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	getPickup() {
		// this.App.presentLoading();
		this.HttpClient
			.get(
				this.App.api_url + "/getJob_logCustomList/0" + "/" + localStorage['token']
			)
			.subscribe(
				(data: any) => {
					//   this.loadingController.dismiss();

					this.riderList_pickup = [];
					this.logistic_customized_job_count = data.result["logistic_customized_job_count"];
					this.logistic_request_job_count = data.result["logistic_request_job_count"];
					let tmp_riderList = data.result["riderList"];
					if (tmp_riderList != 0) {
						for (let i = 0; i < tmp_riderList.length; i++) {
							if (tmp_riderList[i].delivery_status != 1) {
								this.riderList_pickup.push(tmp_riderList[i]);
							}
						}
					} else {
						this.riderList_pickup = data.result["riderList"];
					}

					if(typeof this.configData.total_reminder_logistic == 'string'){
						this.configData.total_reminder_logistic = 0;
					}

					this.configData.total_reminder_logistic += this.riderList_pickup.length + this.logistic_customized_job_count + this.logistic_request_job_count;
					// this.summarise_total_reminder();
				},
				(error) => {
					//   this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	//   ionViewWillLeave(){

	//     this.routerOutlet.swipeGesture = true;
	//   }

	//Move to Next slide
	slideNext(object, slideView) {
		slideView.slideNext(500).then(() => {
			this.checkIfNavDisabled(object, slideView);
		});
	}

	//Move to previous slide
	slidePrev(object, slideView) {
		slideView.slidePrev(500).then(() => {
			this.checkIfNavDisabled(object, slideView);
		});;
	}

	//Method called when slide is changed by drag or navigation
	SlideDidChange(object, slideView) {
		this.checkIfNavDisabled(object, slideView);
	}

	//Call methods to check if slide is first or last to enable disbale navigation
	checkIfNavDisabled(object, slideView) {
		this.checkisBeginning(object, slideView);
		this.checkisEnd(object, slideView);
	}

	checkisBeginning(object, slideView) {
		slideView.isBeginning().then((istrue) => {
			object.isBeginningSlide = istrue;
		});
	}
	checkisEnd(object, slideView) {
		slideView.isEnd().then((istrue) => {
			object.isEndSlide = istrue;
		});
	}

	searchMerchant() {
		this.findValue = "";
		// this.router.navigate(['/search']);
		this.App.slidePage('search');
	}

	navigate(navigate) {
		this.App.slidePage(navigate);
	}

	reset() {
		this.findValue = "";
	}

	set_current_tab(tab){
		this.configData.current_tab = tab;
	}

	// summarise_total_reminder(){
	// 	this.configData.total_reminder_logistic = this.riderList_pickup.length + this.riderList.length + this.logistic_customized_job_count;
	// 	this.configData.total_reminder_bullion = this.supplierList.length + this.bullion_pending_reweight_count + this.bullion_pending_check_count + this.bullion_pending_test_count + this.bullion_pending_order_count;
	// }

	doRefresh(event) {
		// console.log('Begin async operation');
		this.ionViewWillEnter();

		event.target.complete();

	}
}
