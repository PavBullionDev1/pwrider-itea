import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActionSheetController, AlertController, LoadingController, NavController, Platform } from '@ionic/angular';
import { AppComponent } from '../app.component';
import { Httprequest } from "../models/httprequest";
import { NativeAdapterService } from '../services/native-adapter.service';

@Component({
  selector: 'app-common-header',
  templateUrl: './common-header.component.html',
  styleUrls: ['./common-header.component.scss'],
  providers:[NativeAdapterService]
})
export class CommonHeaderComponent implements OnInit {
  
  @Input() headerTitle: string;
  @Input() pageSource: string;
  @Input() step: string;
  @Input() mode: string;
  @Input() ownerID: number;
  @Output() cusBackEvent = new EventEmitter<string>();
  @Output() cusBackEvent2 = new EventEmitter<string>();
  userdata = {
    name: localStorage['name']!=null?localStorage['name']:'',
    avatar: localStorage.avatar!=null?localStorage.avatar:'https://vouch.aipipis.com/assets/img/user-icon.svg',
    email_verified:localStorage['email_verified']!=null?localStorage['email_verified']:'',
    phone_verified:localStorage.phone_verified!=null?localStorage.phone_verified:'',
    join_date: localStorage.join_date!=null?localStorage.join_date:'',
    email:localStorage.email!=null?localStorage.email:'',
    phone:localStorage.phone!=null?localStorage.phone:'',
  };
  ownerdata = {};

  constructor(
    public App:AppComponent,
    public httpClient: HttpClient,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public actionSheetController: ActionSheetController,
    public platform:Platform,
    private nativeAdapter: NativeAdapterService,
    private navCtrl: NavController
    ) {



  }
  chatroomData = [];
  msgNumber = 0;
  type="1";
  interval= null;
  ngOnInit() {
    this.App.checkLoginToken();
    // this.getmsgNumber();

    this.interval = setInterval(()=>{
      // this.getmsgNumber();
      },6000);

    if(this.ownerID >0){
      this.getOwnerData(this.ownerID);
    }
  }



  getOwnerData(id){
    this.httpClient.post(this.App.api_url+"/appGetOwnerData",{
      'owner_id' : id
    },{observe: "body"})
      .subscribe((data)=>{
        if(data['status'] == "OK") {
          this.ownerdata = data['result']['ownerData'];
        }else {
          this.App.presentAlert_default(data['status'],data['result'],"assets/attention-icon.svg");
        }
      }, error => {
        this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
      });
  }

  changeAvatar(){
    
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: "my-custom-class",
      buttons: [
        {
          text: "Camera",
          role: "camera",
          icon: "camera",
          handler: () => {
            this.takePicture('camera');
          },
        },
        {
          text: "Select From Gallery",
          icon: "images-outline",
          handler: () => {
            this.takePicture('gallery');
          },
        },
        {
          text: "Cancel",
          // icon: 'close',
          role: "cancel",
          handler: () => {
            console.log("Cancel clicked");
          },
        },
      ],
    });
    await actionSheet.present();

    const { role } = await actionSheet.onDidDismiss();
    console.log("onDidDismiss resolved with role", role);
  }

  imageData = [];
  async takePicture(sourceType: 'camera' | 'gallery') {
    try {
      const imageData = await this.nativeAdapter.takePicture({
        quality: 100,
        source: sourceType === 'camera' ? this.nativeAdapter.PictureSourceType.CAMERA : this.nativeAdapter.PictureSourceType.PHOTOLIBRARY,
        resultType: this.nativeAdapter.DestinationType.DATA_URL
      });

      this.imageData = [imageData];
      let base64Image = "data:image/jpeg;base64," + imageData;
      this.updateProfilePic(base64Image);
    } catch (error) {
      console.error('Camera error:', error);
    }
  }

  navigateHome(){
    this.navCtrl.navigateRoot('home',{animationDirection:'forward'});
  }

  

updateProfilePic(base64Image){
  this.presentLoadingCus();

  this.httpClient.post(this.App.api_url+"/submitUserCustomData/"+localStorage['login_user_id']+'/'+localStorage['token'],{
    mode: "update-avatar",
    imgPath: base64Image,
  },{observe: "body"})
      .subscribe((data:Httprequest) => {

        if(data.status == "OK") {
            //OK
          this.getProfile();

          this.mode = "profile";
          this.loadingController.dismiss();
          this.App.presentAlert_default('',"Avatar updated","../../assets/verified-icon.svg");
          //this.statusBar.overlaysWebView(true);
          //this.statusBar.overlaysWebView(false);
        } else {
            //ERROR
          //this.App.presentAlert_default('',data['result'],"../../assets/attention2-icon.svg");
          //this.statusBar.overlaysWebView(false);
          //this.statusBar.overlaysWebView(true);
            this.App.presentAlert_default('','Error!. Please try again',"../../assets/attention2-icon.svg");

        }
      }, error => {
        this.loadingController.dismiss();
      //ERROR
        this.App.presentAlert_default('',"Connection Error","../../assets/attention2-icon.svg");
      });
}

  customizedBackEvent(value: string) {
    this.cusBackEvent.emit(value);
  }

  getChatroom(value: string) {
    this.type = value;
    this.cusBackEvent2.emit(value);
  }
    
    

  getmsgNumber(){

    // this.App.presentLoading();
    this.httpClient
    .get(
      this.App.api_url + "/getCustomMsgNumber/" +localStorage['login_user_id'] +"/" +localStorage['token'])
    .subscribe(
      (data: any) => {

      // this.loadingController.dismiss();
      this.msgNumber = data.result['msgNumber'];

      },
      (error) => {
        // this.loadingController.dismiss();

        console.log(error);
      }
    );
  }

  getProfile(){
    // this.App.presentLoading();

    this.httpClient.get(this.App.api_url+"/getUserCustomData/"+localStorage['login_user_id']+'/'+localStorage['token'],{observe: "body"})
        .subscribe((data:Httprequest) => {

          // this.loadingController.dismiss();
          // console.log(data);
          if(data.status == "OK") {
            //Temporary Use

            this.userdata.name = data.result.name;
            this.userdata.email = data.result.email;
            this.userdata.phone = data.result.phone;
            this.userdata.avatar = data.result.avatar;
            this.userdata.email_verified = data.result.email_verified;
            this.userdata.phone_verified = data.result.phone_verified;
            this.userdata.join_date = data.result.join_date;

            localStorage['name'] = data.result.name;
            localStorage.email = data.result.email;
            localStorage.phone = data.result.phone;
            localStorage.avatar = data.result.avatar;
            localStorage['email_verified'] = data.result.email_verified;
            localStorage.phone_verified = data.result.phone_verified;
            localStorage.join_date = data.result.join_date;

          } else {
            this.App.presentAlert_default('ERROR', typeof data['result'] === 'string' ? data['result'] : 'Update failed', "../../assets/attention2-icon.svg");
          }

        }, error => {
          // this.loadingController.dismiss();
          this.App.presentAlert_default('ERROR',"Connection Error","../../assets/attention2-icon.svg");
        });
  }

  public async presentLoadingCus() {
    const loading = await this.loadingController.create({
      duration: 4000,
    });
    // console.log("Loading show");
    await loading.present();

  }

  navigate(navigate){
    this.App.slidePage(navigate);
  }

}
