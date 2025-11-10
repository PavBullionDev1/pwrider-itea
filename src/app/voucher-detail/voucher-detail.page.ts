import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, MenuController } from '@ionic/angular';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-voucher-detail',
  templateUrl: './voucher-detail.page.html',
  styleUrls: ['./voucher-detail.page.scss'],
  providers: [ AppComponent ]
})
export class VoucherDetailPage implements OnInit {

  voucherDetail = {};
  buttonMode = "initiate";
  ownerData = {};
  wishList = [];
  wishList_str = "";
  myWishList = [];
  showNotFound: boolean = false

  constructor(
    private router: Router,
    public httpClient:HttpClient,
    public App:AppComponent,
    private route:ActivatedRoute,
    public loadingController:LoadingController,
    public menuCtrl:MenuController,
    public location:Location
  ) {
    this.menuCtrl.swipeGesture(false);
  }

  voucher_id = this.route.snapshot.paramMap.get('voucher_id');
  type = this.route.snapshot.paramMap.get('type');

  ngOnInit() {
    let voucherID = parseInt(this.voucher_id);
    if(voucherID >0){
      this.getVoucherOwnerData(this.voucher_id);
    }

    var typeLength = this.type.length;
    if(typeLength >0){
      this.checkBtnMode(this.type);
    }
  }

  onSwipeLeft(event){
    this.location.back();
  }


  ionViewWillEnter() {
      this.getVoucherOwnerData(this.voucher_id);
  }

  checkBtnMode(type){
    this.buttonMode = type;
  }

  getVoucherOwnerData(id){
    var login_user_id = localStorage.getItem("login_user_id");

    this.App.presentLoading();
    this.httpClient.post(this.App.api_url+"/appGetVoucherOwnerData",{
      'voucher_id':id,
      'login_user_id':login_user_id
    },{observe: "body"})
      .subscribe((data)=>{
        this.loadingController.dismiss();
        if(data['status'] == "OK") {

          this.ownerData = data['result']['ownerData'];
          this.wishList = data['result']['wishList'];
          this.wishList_str = data['result']['wishList_str'];
          this.voucherDetail = data['result']['voucherDetail'];
          this.myWishList = data['result']['myWishList'];
          this.showNotFound = true;
        }else {
          this.showNotFound = true;
          this.App.presentAlert_default(data['status'],data['result'],"assets/attention-icon.svg");
        }
      }, error => {
        this.loadingController.dismiss();
        this.showNotFound = true;
        this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
      });
  }

  ownerList(){
    this.App.slidePage('ownerlist/'+this.ownerData['user_id']+'/tradelist');

  }

  backToResponsePage(event){
    if(event == 'trade'){
      this.App.slidePage('trade/' + this.voucher_id + '/'+ event);

    }else if(event == 'redeem'){
      this.updateTradeVoucher('redeem');
    }

  }

  goToResturantDetail(item){
    var type = 'new';
    if(this.myWishList.length > 0){
      for(let i = 0; i < this.myWishList.length; i++){
        if(this.myWishList[i].restaurant_id == item.restaurant_id){
          var type = "exist";
        }
      }
    }
    this.router.navigate(['/wishlist-voucher-detail/' + item.restaurant_id + '/'+ type]);
  }

  updateTradeVoucher(type){
    var login_user_id = localStorage.getItem("login_user_id");
    var token = localStorage.getItem("token");

    this.App.presentLoading();
    this.httpClient.post(this.App.api_url+"/updateMyVoucher",{
      'voucher_id':this.voucher_id,
      'user_id':login_user_id,
      'token': token,
      'action':type
    },{observe: "body"})
      .subscribe((data)=>{
        this.loadingController.dismiss();
        if(data['status'] == "OK") {
          if(type == 'redeem'){
            this.router.navigate(['/home']);
          }else{
            this.router.navigate(['/vouchers']);
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
    this.App.goBack('home');
  }

  navigate(navigate){
    this.App.slidePage(navigate);
  }
}
