import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { MenuController, AlertController, LoadingController, ActionSheetController, Platform } from '@ionic/angular';
import { AppComponent } from '../app.component';
import { Httprequest } from '../models/httprequest';
import { Router } from '@angular/router';


@Component({
	selector: 'app-profile',
	templateUrl: './profile.page.html',
	styleUrls: ['./profile.page.scss'],

})
export class ProfilePage implements OnInit {
	isLogin = false;
	mode = "profile";
    showdeleteaccount = false;
	//profile
	profileFrm:any = {
		name: "",
		email: "",
		mobile: "",
		password: "",
		address: "",
		email_verified: "",
		created_date: "",
		rider_seniority : "",
	};

	company = [];

	constructor(
		public menuCtrl: MenuController,
		public httpClient: HttpClient,
		public alertController: AlertController,
		public loadingController: LoadingController,
		public App: AppComponent,
		private router: Router,

	) {
		this.menuCtrl.swipeGesture(false);
	}

	profile = new FormGroup({
		name: new FormControl(''),
		email: new FormControl(''),
		phone: new FormControl(''),
		password: new FormControl('')
	});

	toUpdateProfile() {

		this.App.presentLoading();

		this.httpClient.post(this.App.api_url + "/submitUserCustomData", {
			mode: "profile",
			name: this.profileFrm.name,
			email: this.profileFrm.email,
			phone: this.profileFrm.mobile,
			password: this.profileFrm.password,
			id: localStorage['login_user_id'],
			token: localStorage['token']
		}, { observe: "body" })
			.subscribe((data: any) => {
				this.loadingController.dismiss();
				if (data.status == "OK") {
					this.App.presentAlert_default('', "Profile Updated", "../../assets/gg-icon/done.svg");
					this.profileFrm['password'] = "";
				} else {
					this.App.presentAlert_default('ERROR', data['result']);
				}
			}, error => {
				this.loadingController.dismiss();
				this.App.presentAlert_default('ERROR', "Connection Error");
			});

	}

	//Verify Email
	eVForm = {
		code: "",
	};

	emailVerify = new FormGroup({
		emailCode: new FormControl('')
	});

	toVerifyEmail() {

		this.App.presentLoading();

		this.httpClient.post(this.App.api_url + "/submitUserCustomData/" + localStorage['login_user_id'] + '/' + localStorage['token'], {
			mode: "verify-email",
			email_code: this.eVForm.code
		}, { observe: "body" })
			.subscribe((data: any) => {
				this.loadingController.dismiss();
				if (data.status == "OK") {
					//OK
					this.mode = "profile";
					this.getProfile();
					this.App.presentAlert_default('', "Email verified", "../../assets/verified-icon.svg");
				} else {
					//ERROR
					//this.App.presentAlert_default('',data['result'],"../../assets/attention2-icon.svg");

					this.App.presentAlert_default('', 'Code entered is incorrect. Please try again', "../../assets/attention2-icon.svg");

				}
			}, error => {
				this.loadingController.dismiss();
				//ERROR
				this.App.presentAlert_default('', "Connection Error", "../../assets/attention2-icon.svg");
			});

	}

	//Verify Phone
	pVForm = {
		code: "",
	};

	phoneVerify = new FormGroup({
		phoneCode: new FormControl('')
	});
	toVerifyPhone() {
		this.App.presentLoading();

		this.httpClient.post(this.App.api_url + "/submitUserCustomData/" + localStorage['login_user_id'] + '/' + localStorage['token'], {
			mode: "verify-phone",
			phone_code: this.pVForm.code
		}, { observe: "body" })
			.subscribe((data: any) => {
				this.loadingController.dismiss();
				if (data.status == "OK") {
					//ok
					this.mode = "profile";
					this.getProfile();
					this.App.presentAlert_default('', "Phone number verified", "../../assets/verified-icon.svg");
				} else {
					//error
					this.App.presentAlert_default('', 'Code entered is incorrect. Please try again', "../../assets/attention2-icon.svg");
				}
			}, error => {
				this.loadingController.dismiss();
				//error
				this.App.presentAlert_default('', "Connection Error", "../../assets/attention2-icon.svg");
			});
	}



	ngOnInit() {
		this.getProfile();


	}

	getProfile() {
		this.App.presentLoading();

		this.httpClient.get(this.App.api_url + "/appGetUserData/" + localStorage['login_user_id'] + '/' + localStorage['token'], { observe: "body" })
			.subscribe((data: any) => {

				this.App.stopLoading();
				// this.loadingController.dismiss();
				console.log(data);
				if (data.status == "OK") {

					var user = data.result.user_data;
					var company = data.result.company_data;
					//Temporary Use
					console.log('user');
					console.log(user);

					this.profileFrm.name = user.name;
					this.profileFrm.email = user.email;
					this.profileFrm.mobile = user.mobile;
					this.profileFrm.password = '';
					this.profileFrm.address = user.address;
					// this.profileFrm.email_verified =user.email_verified;
					this.profileFrm.created_date = user.created_date;
					this.profileFrm.rider_seniority = user.rider_seniority;

					localStorage['name'] = user.name;
					localStorage.email = user.email;
					localStorage['mobile'] = user.mobile;
					localStorage.password = user.password;
					localStorage.address = user.address;
					// localStorage['email_verified'] =user.email_verified;
					localStorage.created_date = user.created_date;

					this.company = company;
                    
                    if(user.user_id=14){
                        this.showdeleteaccount = true;
                    }
                    
				} else {
					this.App.presentAlert_default('ERROR', data['result'], "../../assets/attention2-icon.svg");
				}

			}, error => {
				this.App.stopLoading();
				// this.loadingController.dismiss();
				this.App.presentAlert_default('ERROR', "Connection Error", "../../assets/attention2-icon.svg");
			});
	}

	viewRiderCommissionReport() {
		this.router.navigate(["commission-report"]);
	}

	//  changeAvatar(){
	//    console.log("change Avatar");
	//  }

	switchMode(mode) {
		this.mode = mode;
	}

	onSwipeLeft(event: any) {
		// 实现左滑功能，例如返回上一页
		console.log('Swipe left detected', event);
	}

	backToPrev(event?: any) {
		this.App.goBack('home');
	}

	toLogout() {
		this.isLogin = false;
		localStorage['isLogin'] = 0;

		Object.keys(localStorage).forEach((key) => {
			if (key != "remember_name" && key != "remember_password") {
				localStorage.removeItem(key);
			}
		});


		this.router.navigate(["login"]);
	}
    
    
    delAccount() {
        
        this.alertController.create({
			cssClass: "my-custom-class alearboxclass confirmActionalearboxclass",
            message:
				"<h2>Attentation!</h2><p>Your account will be deleted in 24 hours. After that, you won't be able to log in anymore. Thank you.</p>",
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
						this.App.presentLoading();
						this.loadingController.dismiss();
                        setTimeout(() => {
                            this.isLogin = false;
                            localStorage['isLogin'] = 0;

                            Object.keys(localStorage).forEach((key) => {
                                if (key != "remember_name" && key != "remember_password") {
                                    localStorage.removeItem(key);
                                }
                            });
                            
		                    this.router.navigate(["login"]);
                       },100);
					},
				},
			],
		}).then((alert) => alert.present());;
        
        
        
        

		


	}

}
