import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonSearchbar, LoadingController, MenuController} from '@ionic/angular';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-trade',
  templateUrl: './trade.page.html',
  styleUrls: ['./trade.page.scss'],
})
export class TradePage implements OnInit {
  @ViewChild('autofocus',{static:false}) searchbar:IonSearchbar;

  mode = "home";
  stepMode = "noSelect";
  find = "";
  viewMode = "empty";
  filteredList = [];
  voucherList = [];
  vouchersSelected = [];
  availableVouchers = [];
  vouchersToTrade = [];
  selectedVoucherID = "";
  mostTradedVouchers = [];

  constructor(
    public alertController: AlertController,
    private router:Router,
    public HttpClient:HttpClient,
    public App:AppComponent,
    private route:ActivatedRoute,
    public loadingController:LoadingController,
    public menuCtrl:MenuController,
    public location:Location
  ) {
    this.menuCtrl.swipeGesture(false);
   }

  ionViewWillEnter(){
    // setTimeout(() => this.searchbar.setFocus(),0);
  }

  voucher_id = this.route.snapshot.paramMap.get('voucher_id');
  type = this.route.snapshot.paramMap.get('type');

  ngOnInit() {
    if(this.voucher_id != null && this.type != null){
      this.selectVouch(this.voucher_id, this.type);
    }else{
      this.getVoucher();
    }
  }

  onSwipeLeft(event){
    if(this.stepMode == 'noSelect'){
      this.location.back();
    }else{
      this.backToPrev();
    }
  }

  getVoucher(){
    this.App.presentLoading();
    this.HttpClient.get(this.App.api_url + "/getVoucher/trade").subscribe((data) => {
        if(data['status'] == "OK") {        
          this.mostTradedVouchers = data['result']['mostTraded'];          
        }else {
          this.App.presentAlert_default(data['status'],data['result'],"assets/attention-icon.svg");
        }
      },
      (error) => {
        this.loadingController.dismiss();
        this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
      }
    );
  }


  searchResult(item,type){
    var login_user_id = localStorage.getItem("login_user_id");

    return new Promise(resolve=>{
      this.HttpClient.post(this.App.api_url+"/appSearchMerchant",{
        'searchValue':item,
        'type': type,
        'login_user_id':login_user_id
      },{observe: "body"})
      .subscribe((data)=>{
        if(data['status'] == "OK") {
          resolve(data['result']);
        }else {
          resolve(data);
        }
      }, error => {
        this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
      });
    })
  }

  autoFindMerchant(){
    var findLength = this.find.length;

    if(findLength >0){
      let item = this.find;
      var list = this.searchResult(item,'filter');
      list.then((res) =>{
        if(res['status'] == 'ERROR'){
          this.App.presentAlert_default(res['status'],res['result'],"assets/attention-icon.svg");
        }else{
          this.filteredList = res['restaurantList'];
        }
      },(err)=>{
          console.log(err);
          // this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
      });
    }else{
      this.filteredList  = [];
      // this.voucherList = [];
      this.viewMode = "empty";
    }
  }

  chooseMerchant(item){
    if(item['restaurant_id'] >0){
      this.filteredList  = [];

      this.find = item['title'];
      this.searchMerchant(item['title']);
    }
  }

  searchMerchant(item){
    this.find = item;
    var findLength = item.length;

    if(findLength >0){
      var list = this.searchResult(item,'searchTrade');
      list.then((res) =>{
        if(res['status'] == 'ERROR'){
          this.App.presentAlert_default(res['status'],res['result'],"assets/attention-icon.svg");
        }else{
          if(res['voucherList'].length >0){
            this.voucherList = res['voucherList'];
            // this.find =  res['restaurantList'][0]['title'];
            this.viewMode = 'show';
          }else{
            if(res['restaurantList'].length >0){
              //0 voucher found but give suggestion merchant
              // this.availableMerchantList = res['restaurantList'];
              this.viewMode = 'show';
            }else{
              //0 voucher & 0 merchant
              // this.availableMerchantList = [];
              this.viewMode = 'notFound';
            }
            this.voucherList = [];
          }
        }
      },(err)=>{
          console.log(err);
          // this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
      });
    }else{
      this.voucherList = [];
    }
  }

  getAvailableVouchers(userID){
    var login_user_id = localStorage.getItem("login_user_id");
    this.App.presentLoading();
    this.HttpClient.post(this.App.api_url+"/appGetAvailableVouchers",{
      'login_user_id':login_user_id,
      'owner_id' : userID
    },{observe: "body"})
      .subscribe((data)=>{
        this.loadingController.dismiss();
        if(data['status'] == "OK") {
          this.availableVouchers = data['result']['voucherList'];
        }else {
          this.App.presentAlert_default(data['status'],data['result'],"assets/attention-icon.svg");
        }
      }, error => {
        this.loadingController.dismiss();
        this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
      });
  }

  nextStep(item){
    this.stepMode = item;
    if(item == 'vouchChosen'){
      this.mode = "select";
      this.getAvailableVouchers(this.vouchersSelected[0]['user_id']);
    }else if(item == 'vouchRequest'){
      this.mode = "chosen";
    }
  }

  selectVouch(item,type){

    this.find = "";
    this.mode = type;
    var login_user_id = localStorage.getItem("login_user_id");
    this.App.presentLoading();
    this.HttpClient.post(this.App.api_url+"/appGetVoucherOwnerData",{
      'voucher_id':item,
      'type':'trade',
      'login_user_id':login_user_id
    },{observe: "body"})
      .subscribe((data)=>{
        this.loadingController.dismiss();
        if(data['status'] == "OK") {
          this.vouchersSelected.push(data['result']['voucherDetail']);
          if(data['result']['voucherList'].length >0){
            this.voucherList = data['result']['voucherList'];
          }
        }else {
          this.App.presentAlert_default(data['status'],data['result'],"assets/attention-icon.svg");
        }
      }, error => {
        this.loadingController.dismiss();
        this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
      });
  }

  toVoucherDetail(item,type) {
    this.App.slidePage('voucher-detail/' + item.voucher_id + '/'+ type);

  }

  returnToSearch(){
    this.find = "";
    this.voucherList = [];
    this.vouchersSelected = [];
    this.mode = "home";
    this.stepMode = "noSelect";
  }

  tradedVoucher(item){

    var login_user_id = localStorage.getItem("login_user_id");

    this.App.presentLoading();
    this.HttpClient.post(this.App.api_url+"/appCheckDuplicateTrade",{
      'login_user_id':login_user_id,
      'recipient_id':this.vouchersSelected[0]['user_id'],
      'from_voucher_id':item['voucher_id'],
      'to_voucher_id':this.vouchersSelected[0]['voucher_id'],
    },{observe: "body"})
      .subscribe((data)=>{
        this.loadingController.dismiss();
        if(data['status'] == "OK") {
          if(data['result']['tradeStatus'] == 'proceed'){
            this.vouchersToTrade.push(item);
            this.nextStep('vouchRequest');
          }else if(data['result']['tradeStatus'] == 'abort'){
            this.App.presentAlert_default('Duplicate Request','Please choose another voucher to trade.',"assets/attention-icon.svg");
          }

        }else {
          this.App.presentAlert_default(data['status'],data['result'],"assets/attention-icon.svg");
        }
      }, error => {
        this.loadingController.dismiss();
        this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
      });
  }

  backToPrev(){
    switch (this.mode) {
      case "home":
        console.log("asd");
        this.App.goBack("home");
        break;

      case "select":
        this.stepMode = "noSelect";
        this.mode = "home";
        break;

      case "chosen":
        this.stepMode = "vouchChosen";
        this.mode = "select";
        break;
    }
    // if(this.mode == 'select'){
    //   this.stepMode = 'noSelect';
    //   this.mode = 'trade';
    // }else if(this.mode == 'chosen'){
    //   this.stepMode = 'vouchChosen';
    //   this.vouchersToTrade = [];
    //   this.mode = 'select';
    // }
  }

  async submitTrade(){
    var status = this.vouchersToTrade[0].status;

    if(status == 'matchFound'){
      var msg = 'Confirm sending this trade request?';
      var btnText = "Submit";
    }else{
      var msg = "Your selected voucher doesn't match owner's wishlist.";
      var btnText = "Submit anyway";
    }

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class alearboxclass confirmActionalearboxclass',
      header: '',
      message: msg,

      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          cssClass: 'colosebutton',
          role: 'cancel',
          // cssClass: 'secondary',
          handler: (blah) => {
            // console.log('Confirm Cancel: blah');
          }
        }, {
          text: btnText,
          cssClass: 'confirmbutton',
          handler: () => {
            // console.log('Confirm Submit');

            //to send request
            this.confirmRequest();

          }
        }
      ]
    });
    await alert.present();

    // 添加图标显示
    setTimeout(() => {
      const alertElement = document.querySelector('ion-alert.confirmActionalearboxclass');
      if (alertElement) {
        const messageElement = alertElement.querySelector('.alert-message');
        if (messageElement) {
          const iconDiv = document.createElement('div');
          iconDiv.style.textAlign = 'center';
          iconDiv.style.marginBottom = '15px';
          iconDiv.innerHTML = '<img src="./assets/attention-icon.svg" style="width: 60px; height: 60px;" />';
          messageElement.insertBefore(iconDiv, messageElement.firstChild);
        }
      }
    }, 100);
  }

  confirmRequest(){

    var login_user_id = localStorage.getItem("login_user_id");
    var login_user_name = localStorage.getItem("name");
    var token = localStorage.getItem("token");

    this.App.presentLoading();
    this.HttpClient.post(this.App.api_url+"/appConfirmTradeRequest",{
      'type':'request',
      'login_user_id':login_user_id,
      'login_user_name':login_user_name,
      'recipient_id':this.vouchersSelected[0]['user_id'],
      'from_voucher_id':this.vouchersToTrade[0]['voucher_id'],
      'to_voucher_id':this.vouchersSelected[0]['voucher_id'],
      'token': token
    },{observe: "body"})
      .subscribe((data)=>{
        this.loadingController.dismiss();
        if(data['status'] == "OK") {

            this.mode = "home";
            this.stepMode = "noSelect";
            this.find = "";
            this.selectedVoucherID = "";
            this.viewMode = "empty";

            this.voucherList = [];
            this.vouchersSelected = [];
            this.vouchersToTrade = [];
            this.filteredList = [];
            this.availableVouchers = [];

            this.router.navigate(['/trade-request-send']);
        }else {
          this.App.presentAlert_default(data['status'],data['result'],"assets/attention-icon.svg");
        }
      }, error => {
        this.loadingController.dismiss();
        this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
      });


  }

}
