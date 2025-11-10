import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { TermsPage } from '../terms/terms.page';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { MenuController, AlertController, LoadingController } from '@ionic/angular';
import { AppComponent } from '../app.component';
import { Httprequest } from '../models/httprequest';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  backGroundImage:any;
    
  selectall: boolean = true;
  isActiveToggleTextPassword: Boolean = true;
  isActiveToggleIconPassword: Boolean = true;
  public toggleTextPassword(): void{
      this.isActiveToggleTextPassword = (this.isActiveToggleTextPassword==true)?false:true;
      this.isActiveToggleIconPassword = (this.isActiveToggleIconPassword==true)?false:true;
  }
  public getType() {
      return this.isActiveToggleTextPassword ? 'password' : 'text';
  }
    public getIcon() {
      return this.isActiveToggleIconPassword ? 'eye-outline' : 'eye-off-outline';
  }
  emailtitle ="";
  mode = "Login";

  constructor(
    public modalController: ModalController,
    private router: Router,
    public menuCtrl: MenuController,
    public httpClient: HttpClient,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public App: AppComponent,
    private navCtrl: NavController
    ) {

      this.backGroundImage = "../../assets/bg.png";

  }

  //Login
  loginForm = {
    username:"",
    password:""
  };

  login = new FormGroup({
    username: new FormControl(''),
    password:new FormControl('')
  });

  toLogin(){

    this.App.presentLoading();

    this.httpClient.post(this.App.api_url+"/login", {
      email: this.loginForm.username,
      password: this.loginForm.password
    },{observe: "body"})
        .subscribe((data:any) => {
          this.App.stopLoading();

          // this.loadingController.dismiss();
          console.log(data);
          if(data.status == "OK") {
            //Temporary Use
            localStorage['isLogin'] = 1;
            localStorage['token'] = data.result.token;
            localStorage['name'] = data.result.name;
            localStorage['default_company_id'] = data.result.default_company_id;
            localStorage['login_user_id'] = data.result.id;
            localStorage['mobile'] = data.result.mobile;
            localStorage['app_access_logistic'] = data.result.app_access_logistic;
            localStorage['app_access_bullion'] = data.result.app_access_bullion;
            localStorage['level'] = data.result.level;
            localStorage['can_approve_inbox_job'] = data.result.can_approve_inbox_job;
            localStorage['googleApiKey'] = data.result.googleApiKey;
            localStorage['firebaseApiKey'] = data.result.firebaseApiKey;

            // localStorage['email_verified'] = data.result.email_verified;
            // localStorage.mailNote = data['result']['email_notify_enabled'];

            if(this.selectall == true){
              localStorage['remember_name'] = this.loginForm.username;
              localStorage['remember_password'] = this.loginForm.password;
            }else{
              localStorage['remember_name'] = "";
              localStorage['remember_password'] = "";
            }

            this.App.setUserData(
              data.result.name,
              data.result.token,
              data.result.default_company_id,
              data.result.login_user_id,
              data.result.mobile,
              data.result.email_verified,
            );
            this.App.setLoginStatus(true);

            // if(localStorage['app_access_logistic'] == 1 && localStorage['app_access_bullion'] == 1){
            //   this.navCtrl.navigateRoot('home',{animationDirection:'forward'});
            // }else if(localStorage['app_access_logistic'] == 1){
            //   this.navCtrl.navigateRoot('pickup',{animationDirection:'forward'});
            // }else if(localStorage['app_access_bullion'] == 1){
            //   this.navCtrl.navigateRoot('collection',{animationDirection:'forward'});
            // }

            if(localStorage['app_access_logistic'] == 1 || localStorage['app_access_bullion'] == 1){
              this.navCtrl.navigateRoot('home',{animationDirection:'forward'});
            }else{
              this.App.presentAlert_default("Error","You cannnot access this app, please inform admin.","assets/gg-icon/attention-icon.svg");
            }

           
            this.App.configurePushRegister();
          } else {
            this.App.presentAlert_default(data['status'],data['result'],"assets/gg-icon/attention-icon.svg");
            this.App.setLoginStatus(false);
          }

        }, error => {
          this.App.stopLoading();
          // this.loadingController.dismiss();
          this.App.presentAlert_default('ERROR',"Connection Error","assets/gg-icon/attention-icon.svg");
          this.App.setLoginStatus(false);
        });



  }

  //Forget Password
  forgetPwd = new FormGroup({
    email: new FormControl('')
  });

  fpForm = {
    email: ""
  }

  //Reset Password
  resetPwd = new FormGroup({
    otp: new FormControl(''),
    newpwd: new FormControl(''),
    confirmpwd: new FormControl('')
  });

  rpForm = {
    otp: "",
    newpwd:"",
    confirmpwd:""
  }

  toReset(){

    this.App.presentLoading();

    this.httpClient.post(this.App.api_url+"/passwordrecovery", {
      email: this.fpForm.email
    },{observe: "body"})
        .subscribe((data:Httprequest) => {
          this.loadingController.dismiss();
            //old code
            // if(data.status == "OK") {
            //   this.App.presentAlert_default('RESET SUCCESSFUL!',"We just sent an email with a reset link. Please check your email and follow the instructions.","../../assets/email-icon.svg");
            // } else {
            //   this.App.presentAlert_default('Email not found!',"The email account doesn't exists. Please enter a valid email or <b>Create new account</b>","assets/attention-icon.svg");
            // }
        
          if(data.status == "OK") {
            this.mode = "sucessforgetPassword";
            this.emailtitle =  this.fpForm.email;
            // this.fpForm = {
            //     email: ""
            // }  
              
          } else {
            this.App.presentAlert_default('ERROR', JSON.stringify(data['result']) || 'Unknown error');      }

        }, error => {
          this.loadingController.dismiss();
          this.App.presentAlert_default('ERROR',"Connection Error","assets/gg-icon/attention-icon.svg");
        });

  }

  //Register
  register = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    phone: new FormControl(''),
    password:new FormControl('')
  });

  regForm = {
    name:"",
    email:"",
    phone:"",
    password:""
  };

  toResetPassword(){

    this.App.presentLoading();

    this.httpClient.post(this.App.api_url+"/resetpasswordCus", {
      'email': this.fpForm.email,
      'mobile_otp': this.rpForm.otp,
      'password': this.rpForm.newpwd,
      'repassword': this.rpForm.confirmpwd,
    },{observe: "body"})
        .subscribe((data:Httprequest) => {
          this.loadingController.dismiss();
            //old code
            // if(data.status == "OK") {
            //   this.App.presentAlert_default('RESET SUCCESSFUL!',"We just sent an email with a reset link. Please check your email and follow the instructions.","../../assets/email-icon.svg");
            // } else {
            //   this.App.presentAlert_default('Email not found!',"The email account doesn't exists. Please enter a valid email or <b>Create new account</b>","assets/attention-icon.svg");
            // }
        
          if(data.status == "OK") {
            this.mode = "Login";
            this.emailtitle =  this.fpForm.email;
            this.fpForm = {
                email: ""
            };  
            this.App.presentAlert_default('',"Password Updated","../../assets/gg-icon/done.svg");
              
          } else {
            this.App.presentAlert_default('ERROR', JSON.stringify(data['result']) || 'Unknown error');        }

        }, error => {
          this.loadingController.dismiss();
          this.App.presentAlert_default('ERROR',"Connection Error","assets/gg-icon/attention-icon.svg");
        });

  }

  toRegister(){
    // console.log(this.register);
    //Temporary Use
    //localStorage['isLogin'] = 1;
    //this.router.navigate(['/home']);
    this.App.presentLoading();

    this.httpClient.post(this.App.api_url+"/register", {
      name: this.regForm.name,
      email: this.regForm.email,
      password: this.regForm.password
    },{observe: "body"})
        .subscribe((data:any) => {

          this.loadingController.dismiss();
          if(data.status == "OK") {
            //Temporary Use
            localStorage['isLogin'] = 1;
            localStorage['token'] = data.result.token;
            localStorage['name'] = data.result.name;
            localStorage['default_company_id'] = data.result.default_company_id;
            localStorage['login_user_id'] = data.result.id;
            localStorage['mobile'] = data.result.mobile;
            localStorage['email_verified'] = data.result.email_verified;
            
            // localStorage.mailNote = data['result']['email_notify_enabled'];

            this.App.setUserData(
              data.result.name,
              data.result.token,
              data.result.default_company_id,
              data.result.login_user_id,
              data.result.mobile,
              data.result.email_verified,
            );
            this.App.setLoginStatus(true);

            // localStorage.given_name = result.given_name;
            this.navCtrl.navigateRoot('home',{animationDirection:'forward'});
          } else {
            this.App.presentAlert_default('Email has been registered!',data['result'],"assets/attention-icon.svg");
          }

        }, error => {
          this.loadingController.dismiss();
          this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
        });

  }

  checkLoginToken(){

    if (localStorage['token'] != null) {
      //check token is valid or not
      this.App.presentLoading();
      this.httpClient.get(this.App.api_url+ "/checkLoginToken/"+localStorage['login_user_id']+"/"+localStorage['token'])
        .subscribe(data2 => {
          // console.log(data2);
          // this.loadingController.dismiss();
          if (data2['result']['is_login'] == true) {
            // this.navCtrl.navigateRoot('location',{animationDirection:'forward'});
          }
        }, error => {
          // this.loadingController.dismiss();
        });
    }
  }

  checkRememberMe(){

    if (localStorage['remember_name'] != null) {
      this.loginForm.username = localStorage['remember_name'];
      this.loginForm.password = localStorage['remember_password'];
    }
  }

  ngOnInit( ) {

    //check if localstorage.isLogin == 1, then go to home page
    if (localStorage['isLogin'] == 1) {
      this.navCtrl.navigateRoot('home',{animationDirection:'forward'});
    }
    
  }

  selectAll() {
    if(this.selectall == false){
      this.selectall = true;
    }else{
      this.selectall = false;
    }
  }

  ionViewWillEnter() {
    this.App.configurePushRegister();
    this.checkLoginToken();
    this.checkRememberMe();
  }

  switchMode(mode){
    this.mode = mode;
  }


  //Modal Part, to show terms and conditions
  async presentModal() {
    const modal = await this.modalController.create({
      component: TermsPage,
      cssClass: 'my-custom-class'
    });
    return await modal.present();
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true
    });
  }



}
