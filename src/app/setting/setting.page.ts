import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, MenuController } from '@ionic/angular';
import { AppComponent } from '../app.component';
interface Httprequest {
  status: string;
  result: any;
}
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {

  chatNote = true;
  pushNote = true;
  vouchNote = true;
  mailNote = true;

  mode = "profile";

  //profile
  profileFrm = {
    name:"",
    email:"",
    phone:"",
    password:"",
    avatar:"https://vouch.aipipis.com/assets/img/user-icon.svg",
    email_verified:"",
    phone_verified:"",
    join_date:""
  };

  constructor(
    public menuCtrl: MenuController,
    public httpClient: HttpClient,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public App: AppComponent,
    private router: Router,
    public location:Location
  ) {
    this.menuCtrl.swipeGesture(false);
  }

  profile = new FormGroup({
    name: new FormControl(''),
    email:new FormControl(''),
    phone:new FormControl(''),
    password:new FormControl('')
  });

  ngOnInit() {
    this.getProfile();

    if(localStorage['chatNote'] != null){
      if(localStorage['chatNote'] == '0' || localStorage['chatNote'] == 'false'){
        this.chatNote = false;
      }
    }

    if(localStorage['pushNote'] != null){
      if(localStorage['pushNote'] == '0' || localStorage['pushNote'] == 'false'){
        this.pushNote = false;
      }
    }

    if(localStorage['vouchNote'] != null){
      if(localStorage['vouchNote'] == '0' || localStorage['vouchNote'] == 'false'){
        this.vouchNote = false;
      }
    }

    if(localStorage['mailNote'] != null){
      if(localStorage['mailNote'] == '0' || localStorage['mailNote'] == 'false'){
        this.mailNote = false;
      }
    }
  }

  onSwipeLeft(event: any): void {
    this.location.back();
  }


  getProfile(): void {
    this.App.presentLoading();

    this.httpClient.get(this.App.api_url+"/getUserCustomData/"+localStorage['login_user_id']+'/'+localStorage['token'],{observe: "body"})
        .subscribe((data:Httprequest) => {

          this.loadingController.dismiss();
          // console.log(data);
          if(data.status == "OK") {
            //Temporary Use

            this.profileFrm.name = data.result.name;
            this.profileFrm.email = data.result.email;
            this.profileFrm.phone = data.result.phone;
            this.profileFrm.avatar = data.result.avatar;
            this.profileFrm.email_verified = data.result.email_verified;
            this.profileFrm.phone_verified = data.result.phone_verified;
            this.profileFrm.join_date = data.result.join_date;

            localStorage['name'] = data.result.name;
            localStorage['email'] = data.result.email;
            localStorage['phone'] = data.result.phone;
            localStorage['avatar'] = data.result.avatar;
            localStorage['email_verified'] = data.result.email_verified;
            localStorage['phone_verified'] = data.result.phone_verified;
            localStorage['join_date'] = data.result.join_date;
            localStorage['mailNote'] = data['result']['email_notify_enabled'];
            localStorage['vouchNote'] = data['result']['pushDetail']['voucher_enabled'];
            localStorage['pushNote'] = data['result']['pushDetail']['push_enabled'];
            localStorage['chatNote'] = data['result']['pushDetail']['chat_enabled'];

            //in case never login for a long period and having more than 1 device for this app and setting changed from time to time
            if(localStorage['chatNote'] != null){
              if(localStorage['chatNote'] == '0' || localStorage['chatNote'] == 'false'){
                this.chatNote = false;
              }
            }

            if(localStorage['pushNote'] != null){
              if(localStorage['pushNote'] == '0' || localStorage['pushNote'] == 'false'){
                this.pushNote = false;
              }
            }

            if(localStorage['vouchNote'] != null){
              if(localStorage['vouchNote'] == '0' || localStorage['vouchNote'] == 'false'){
                this.vouchNote = false;
              }
            }

            if(localStorage['mailNote'] != null){
              if(localStorage['mailNote'] == '0' || localStorage['mailNote'] == 'false'){
                this.mailNote = false;
              }
            }

          } else {
            this.App.presentAlert_default('ERROR',data['result'],"assets/attention2-icon.svg");
          }

        }, error => {
          this.loadingController.dismiss();
          this.App.presentAlert_default('ERROR',"Connection Error","assets/attention2-icon.svg");
        });
  }

  resetNote(item: string, event: any): void {

    var login_user_id = localStorage.getItem("login_user_id");
    var token = localStorage.getItem("token");

    this.App.presentLoading();
    this.httpClient.post(this.App.api_url+"/appResetNotificationSetting",{
      'login_user_id':login_user_id,
      'token':token,
      'enabled':event.detail.checked,
      'type' : item,
      // 'device_manufacturer':this.device.manufacturer,
      // 'device_id':this.device.uuid,
      // 'device_model':this.device.model
    },{observe: "body"})
      .subscribe((data)=>{
        this.loadingController.dismiss();
        if(data['status'] == "OK") {

          if(item == 'chat'){
            this.chatNote = data['result']['data']['chat_enabled'];
            if(data['result']['data']['chat_enabled'] == false){
              localStorage['chatNote'] = '0';
            }else{
              localStorage['chatNote'] = '1';
            }

          }else if(item == 'push'){
            this.pushNote = data['result']['data']['push_enabled'];
            if(data['result']['data']['push_enabled'] == false){
              localStorage['pushNote'] = '0';
            }else{
              localStorage['pushNote'] = '1';
            }

          }else if(item == 'vouch'){
            this.vouchNote = data['result']['data']['voucher_enabled'];
            if(data['result']['data']['voucher_enabled'] == false){
              localStorage['vouchNote'] = '0';
            }else{
              localStorage['vouchNote'] = '1';
            }

          }
        }else {
          this.App.presentAlert_default(data['status'],data['result'],"assets/attention-icon.svg");
        }
      }, error => {
        this.loadingController.dismiss();
        this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
      });
  }

  resetEmailNote(event: any): void {

    var login_user_id = localStorage.getItem("login_user_id");
    var token = localStorage.getItem("token");

    this.App.presentLoading();
    this.httpClient.post(this.App.api_url+"/appResetEmailNotificationSetting",{
      'login_user_id':login_user_id,
      'token':token,
      'enabled':event.detail.checked
    },{observe: "body"})
      .subscribe((data)=>{
        this.loadingController.dismiss();
        if(data['status'] == "OK") {

          this.mailNote = data['result']['email_notify_enabled'];
          if(data['result']['email_notify_enabled'] == false){
            localStorage['mailNote'] = '0';
          }else{
            localStorage['mailNote'] = '1';
          }

        }else {
          this.App.presentAlert_default(data['status'],data['result'],"assets/attention-icon.svg");
        }
      }, error => {
        this.loadingController.dismiss();
        this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
      });
  }

  backToPrev(event?: any): void {
    this.App.goBack('home');
  }

}
