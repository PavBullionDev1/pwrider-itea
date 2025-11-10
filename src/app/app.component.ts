import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	AlertController,
	LoadingController,
	ActionSheetController,
	NavController,
	IonRouterOutlet,
	ToastController,
	IonAvatar,
} from "@ionic/angular";
import { Platform } from "@ionic/angular";
import {
	HttpClient,
	HttpHeaders,
	HttpErrorResponse,
	HttpRequest,
} from "@angular/common/http";
import { Httprequest } from "./models/httprequest";
import { Observable } from "rxjs";
import { ChatService } from "./services/chat.service";
import { EventEmitter, Output } from "@angular/core";
import { Location } from "@angular/common";
import { NativeAdapterService } from "./services/native-adapter.service";
import { ConfigService } from "./config.service";

@Component({
	selector: "app-root",
	templateUrl: "app.component.html",
	styleUrls: ["app.component.scss"],
	providers: [IonRouterOutlet, ChatService, NativeAdapterService],
})
export class AppComponent implements OnInit {
	@Output() notificationEvent = new EventEmitter<any>();

	isLogin = false;

	appConfig: any = {};
	api_url = "";
	api_url2 = "";

	userdata = {
		name: localStorage['name'] != null ? localStorage['name'] : "",
		token: localStorage['token'] != null ? localStorage['token'] : "",
		default_company_id:
			localStorage['default_company_id'] != null
				? localStorage['default_company_id']
				: "",
		login_user_id: localStorage['login_user_id'] != null ? localStorage['login_user_id'] : "",
		mobile: localStorage['mobile'] != null ? localStorage['mobile'] : "",
		email_verified:
			localStorage['email_verified'] != null ? localStorage['email_verified'] : "",
	};

	chatdetailsData = [];
	isloadMore = false;
	swipe = true;

	public appPages = [
		{
			title: "Homepage",
			url: "/home",
			icon: "home",
			iconimg: "../assets/home-icon.svg",
			iconimgactive: "../assets/home-active-icon.svg",
		},
		{
			title: "Profile",
			url: "/profile",
			icon: "person",
			iconimg: "../assets/user-icon.svg",
			iconimgactive: "../assets/user-active-icon.svg",
		},
		{
			title: "Settings",
			url: "/setting",
			icon: "cog",
			iconimg: "../assets/setting-icon.svg",
			iconimgactive: "../assets/setting-active-icon.svg",
		},
		{
			title: "Add Request",
			url: "/request-add",
			icon: "cog",
			iconimg: "../assets/setting-icon.svg",
			iconimgactive: "../assets/setting-active-icon.svg",
		},
	];

	pushEnabled = false;
	routePathParam?: Observable<string>;
	constructor(
		private router: Router,
		private route: ActivatedRoute,
		public httpClient: HttpClient,
		public alertController: AlertController,
		public loadingController: LoadingController,
		public actionSheetController: ActionSheetController,
		private platform: Platform,
		private chatService: ChatService,
		public navCtrl: NavController,
		public location: Location,
		private nativeAdapter: NativeAdapterService,
		//    private routerOutlet : IonRouterOutlet,
		public toastController: ToastController,
		public config: ConfigService
	) {

		this.appConfig = config.appConfig;
		this.api_url = this.appConfig['api_url'];
		this.api_url2 = this.appConfig['api_url2'];

		this.initializeApp();
		// this.chatService.notificationEvent.subscribe((data)=>{
		//   this.swipe = data;
		//   console.log(data);
		// });
	}

	ngOnInit() {

		this.nativeAdapter.overlaysWebView(false);

		// 启动定期检查 googleApiKey
		this.startApiKeyMonitoring();

		//this.routerOutlet.swipeGesture = true;

		// var url = window.location.href.split("/");
		// this.page = url[3];
	}

	// 每天检查一次 googleApiKey 是否存在
	private startApiKeyMonitoring() {
		// 立即执行一次检查
		this.checkApiKeyDaily();
		
		// 每5分钟检查一次是否需要进行今日检查
		setInterval(() => {
			this.checkApiKeyDaily();
		}, 300000); // 5分钟
	}

	// 每日检查 googleApiKey
	private checkApiKeyDaily() {
		// 只在已登录状态下检查
		if (!this.isLogin) {
			return;
		}

		// 获取今天的日期
		const today = new Date().toDateString();
		const lastCheckDate = localStorage.getItem('lastApiKeyCheckDate');

		// 如果今天已经检查过了，就不再检查
		if (lastCheckDate === today) {
			return;
		}

		// 检查 googleApiKey
		const googleApiKey = localStorage.getItem('googleApiKey') || localStorage['googleApiKey'];
		if (!googleApiKey || googleApiKey === '') {
			console.log('GoogleApiKey missing, performing logout...');
			this.performLogout();
		} else {
			// 记录今天已经检查过了
			localStorage.setItem('lastApiKeyCheckDate', today);
			console.log('Daily API key check passed');
		}
	}

	ionViewWillEnter() { }

	initializeApp() {
		this.checkLoginToken();
	}

	// getSwipe(swipe){
	//   this.swipe = swipe;
	//   console.log(swipe);
	// }

	public async configurePushRegister() {
		this.platform.ready().then(async () => {
			// console.log('the platform is ready');

			try {
				const deviceInfo = await this.nativeAdapter.getDeviceInfo();
				
				if (deviceInfo.platform === "android" || deviceInfo.platform === "ios") {
					// Initialize push notifications
					await this.nativeAdapter.initializePush();
					
					// Get push token
					const token = await this.nativeAdapter.getPushToken();
					
					if (token) {
						console.log('Device registered', token);
						localStorage['pushRegisterTkn'] = token;
						localStorage['pushRegisterType'] = deviceInfo.platform;

						//insert/update database
						if (localStorage['login_user_id'] != null && localStorage['login_user_id'] > 0) {
							this.updatePushNotificationUser(
								token,
								deviceInfo.platform,
								localStorage['login_user_id']
							);
						} else {
							//insert with userId 0
							this.updatePushNotificationUser(
								token,
								deviceInfo.platform,
								"0"
							);
						}
						this.pushEnabled = true;
					} else {
						this.pushEnabled = false;
					}
				}
			} catch (error) {
				console.error("Error with Push plugin", error);
				this.presentAlert_default("Error with Push plugin", String(error));
			}
		});
	}

	async updatePushNotificationUser(pushToken: any, pushType: any, login_user_id: any) {
		try {
			const deviceInfo = await this.nativeAdapter.getDeviceInfo();
			
			this.httpClient
				.post(
					this.api_url + "/appUpdatePushNotificationUser",
					{
						pushToken: pushToken,
						pushType: pushType,
						device_manufacturer: deviceInfo.manufacturer,
						device_id: deviceInfo.uuid,
						device_model: deviceInfo.model,
						device_platform: deviceInfo.platform,
						pushEnabled: this.pushEnabled,
						login_user_id: login_user_id,
					},
					{ observe: "body" }
				)
			.subscribe(
				(data: any) => {
					if (data["status"] == "OK") {
						localStorage['chatNote'] = data["result"]["data"]["chat_enabled"];
						localStorage['pushNote'] = data["result"]["data"]["push_enabled"];
						localStorage['vouchNote'] = data["result"]["data"]["voucher_enabled"];
					} else {
						this.presentAlert_default(
							data["status"],
							data["result"],
							"assets/attention-icon.svg"
						);
					}
				},
				(error: any) => {
					this.presentAlert_default(
						"ERROR",
						"Push Notification Error",
						"assets/attention-icon.svg"
					);
				}
			);
		} catch (error) {
			console.error('Device info error:', error);
			this.presentAlert_default(
				"ERROR",
				"Device information error",
				"assets/attention-icon.svg"
			);
		}
	}

	public checkLoginToken = () => {
		// 首先检查 googleApiKey 是否存在
		const googleApiKey = localStorage.getItem('googleApiKey') || localStorage['googleApiKey'];
		if (!googleApiKey || googleApiKey === '') {
			// 如果 googleApiKey 为空，执行登出操作
			this.performLogout();
			return;
		}

		if (localStorage['token'] != null) {
			// console.log("Token is exits, check login token");
			//check token is valid or not
			// this.presentLoading();
			this.httpClient
				.get(
					this.api_url +
					"/checkLoginToken/" +
					localStorage['login_user_id'] +
					"/" +
					localStorage['token']
				)
				.subscribe(
					(data2: any) => {
						// this.loadingController.dismiss();
						if (data2.result.is_login == true) {
							// console.log("Verified, can proceed");
							this.isLogin = true;
							// this.navCtrl.navigateRoot('location',{animationDirection:'forward'});
						} else {
							// console.log("Invalid token");
							this.performLogout();
						}
					},
					(error: any) => {
						// console.log("Invalid token");
						// this.loadingController.dismiss();
						this.performLogout();
					}
				);
		} else {
			// console.log("Invalid token");
			this.performLogout();
		}
	};

	toLogout() {
		this.performLogout();
	}

	// 统一的登出方法
	private performLogout() {
		this.isLogin = false;
		localStorage['isLogin'] = 0;

		// 清除敏感的API keys
		localStorage.removeItem('googleApiKey');
		localStorage.removeItem('firebaseApiKey');
		localStorage.removeItem('token');
		localStorage.removeItem('lastApiKeyCheckDate'); // 清除检查日期

		// 清除所有用户数据
		localStorage.clear();

		this.router.navigate(["login"]);
	}

	setLoginStatus(status: boolean) {
		this.isLogin = status;
	}

	setUserData(name: string, token: string, company_id: string, login_user_id: string, mobile: string, email_verified: boolean) {
		this.userdata = {
			name: name,
			token: token,
			default_company_id: company_id,
			login_user_id: login_user_id,
			mobile: mobile,
			email_verified: email_verified,
		};
	}

	public async presentLoading(timer = 2000) {
		const loading = await this.loadingController.create({
			duration: timer,
		});
		// console.log("Loading show");
		await loading.present();
	}

	public async stopLoading(countdownTime = 100) {
		setTimeout(() => {
			// console.log("Loading hide");
			this.loadingController.dismiss();
		}, countdownTime);
	}

	public async dismissLoading() {
		// Alias for stopLoading with immediate dismiss
		this.loadingController.dismiss();
	}

	public async presentAlert_default(title: string, content: string, iconimg = "") {
		// 创建自定义Alert组件，绕过Ionic的HTML转义限制
		const alert = await this.alertController.create({
			cssClass: "my-custom-class alearboxclass",
			header: title,
			message: content,
			buttons: [
				{
					text: "Close",
					cssClass: "confirmbutton",
					handler: () => { },
				},
			],
		});

		await alert.present();

		// 在Alert显示后，手动插入图标
		if (iconimg) {
			setTimeout(() => {
				const alertElement = document.querySelector('ion-alert.my-custom-class');
				if (alertElement) {
					const messageElement = alertElement.querySelector('.alert-message');
					if (messageElement) {
						let imagePath = iconimg;
						if (imagePath.startsWith("assets/")) {
							imagePath = "./" + imagePath;
						}

						const iconDiv = document.createElement('div');
						iconDiv.style.textAlign = 'center';
						iconDiv.style.marginBottom = '15px';
						iconDiv.innerHTML = `<img src="${imagePath}" style="width: 60px; height: 60px;" />`;

						messageElement.insertBefore(iconDiv, messageElement.firstChild);
					}
				}
			}, 100);
		}
	}

	public async presentToast_default(title: string, content: string) {
		const toast = await this.toastController.create({
			cssClass: "my-custom-class alearboxclass",
			color: "dark",
			duration: 2000,
			header: title,
			position: "top",
			message: content,
		});

		await toast.present();
	}

	public async confirmAction_default(
		title: string,
		content: string,
		iconimg = "",
		tobeSubmit: any,
		url: string
	) {
		const alert = await this.alertController.create({
			cssClass: "my-custom-class alearboxclass confirmActionalearboxclass",
			header: "",
			subHeader: "",
			message:
				'<img src="' +
				iconimg +
				'"><h2>' +
				title +
				"</h2><p>" +
				content +
				"</p>",
			buttons: [
				{
					text: "Cancel",
					cssClass: "colosebutton",

					handler: () => { },
				},
				{
					text: "Confirm",
					cssClass: "confirmbutton",
					handler: () => {
						this.presentLoading();
						this.httpClient.post(this.api_url + url, tobeSubmit).subscribe(
							(data: any) => {
								if (data.status == "OK") {
									this.loadingController.dismiss();
									location.reload();
								} else {
									this.loadingController.dismiss();
									this.presentAlert_default(
										data["status"],
										data["result"],
										"assets/attention-icon.svg"
									);
								}
							},
							(error: any) => {
								this.loadingController.dismiss();
								this.presentAlert_default(
									"ERROR",
									"Connection Error",
									"assets/attention-icon.svg"
								);
							}
						);
					},
				},
			],
		});

		await alert.present();
	}

	public async slidePage(navigate: string) {
		//let options : NativeTransitionOptions = {
		// direction:'left',
		//duration: 300,
		//slowdownfactor: -1,
		//iosdelay: 50,
		// androiddelay: 50,
		//fixedPixelsBottom:0,
		//  fixedPixelsTop:0

		//}
		//  this.nativePageTransitions.slide(options);
		this.navCtrl.navigateForward(navigate);
	}

	public async goBack(navigate?: string) {
		//   let options : NativeTransitionOptions = {
		//     direction: 'right',
		//     duration: 400,
		//     slowdownfactor:-1,
		//     iosdelay:50,
		//     androiddelay: 150
		//   }
		//  this.nativePageTransitions.slide(options);
		this.navCtrl.back();
		//  this.location.back();
	}

	setFirstLetterToUppercase(string: string): string {
		var slug = string.split(".");
		var final = "";

		for (var i = 0; i < slug.length; i++) {
			if (i == 0) {
				var temp = slug[i].trim();
				temp = temp.charAt(0).toUpperCase() + temp.slice(1);

				slug[i] = temp;

				final += slug[i];
			} else if (i > 0) {
				var temp = slug[i].trim();
				temp = temp.charAt(0).toUpperCase() + temp.slice(1);

				slug[i] = temp;
				final += ". " + slug[i];
			}
		}
		return final;
	}

	async scanner() {
		try {
			const result = await this.nativeAdapter.scanBarcode();
			if (!result.cancelled && result.text) {
				this.router.navigate(['voucher-detail/' + atob(result.text)]);
			}
		} catch (err) {
			console.log('Scanner Error', err);
		}
	}

}
