import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, MenuController } from '@ionic/angular';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-wishlist-voucher-detail',
  templateUrl: './wishlist-voucher-detail.page.html',
  styleUrls: ['./wishlist-voucher-detail.page.scss'],
})
export class WishlistVoucherDetailPage implements OnInit {

  wishlistvoucherDetail = {};
  tradableVoucherList = [];
  tradeAvailable = 'close';
  actionMode = 'remove';
  wishlistStatus = "";
  findValue = "";
  showNotFound: boolean = false

  constructor(
    private route:ActivatedRoute,
    public App:AppComponent,
    public httpClient:HttpClient,
    private router:Router,
    public loadingController:LoadingController,
    public menuCtrl:MenuController,
    public location:Location
  ) {
    this.menuCtrl.swipeGesture(false);
  }

  restaurant_id = this.route.snapshot.paramMap.get('restaurant_id');
  type = this.route.snapshot.paramMap.get('type');

  ngOnInit() {
    let restaurantID = parseInt(this.restaurant_id);
    if(restaurantID>0){
      this.getRestaurantDetail(this.restaurant_id);
    }

    var typeLength = this.type.length;
    if(typeLength >0){
      this.checkBtnMode(this.type);
    }
  }

  onSwipeLeft(event){
    this.location.back();
  }


  searchMerchant(type){
    this.findValue = "";
    this.router.navigate(['/search/'+type]);
  }

  getRestaurantDetail(id){
    var login_user_id = localStorage.getItem("login_user_id");

    this.App.presentLoading();
    this.httpClient.post(this.App.api_url+"/appGetRestaurantDetail",{
      'restaurant_id':id,
      'login_user_id':login_user_id
    },{observe: "body"})
      .subscribe((data)=>{
        this.loadingController.dismiss();
        if(data['status'] == "OK") {
          this.wishlistvoucherDetail = data['result']['restaurantDetail'];
          this.tradableVoucherList = data['result']['tradableVoucherList'];
          if(data['result']['tradableVoucherList'].length >0){
            this.tradeAvailable = 'open';
          }
          this.wishlistStatus = data['result']['wishlistStatus'];
          if(this.wishlistStatus == 'new'){
            this.actionMode = 'add';
          }else if(this.wishlistStatus == 'exist'){
            this.actionMode = 'remove';
          }
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

  checkBtnMode(type){
    if(type == 'exist'){
      this.actionMode = 'remove';
    }else if(type == 'new'){
      this.actionMode = 'add';
    }else{
      // console.log(this.wishlistStatus);
      // console.log(type);
    }
  }

  updateUserWishlist(type){

    var login_user_id = localStorage.getItem("login_user_id");
    var token = localStorage.getItem("token");
    var restaurantID = this.wishlistvoucherDetail['restaurant_id']

    this.App.presentLoading();
    this.httpClient.post(this.App.api_url+"/appUpdateUserWishlist",{
      'restaurant_id':restaurantID,
      'type' : type,
      'login_user_id':login_user_id,
      'token': token,
    },{observe: "body"})
      .subscribe((data)=>{
        this.loadingController.dismiss();
        if(data['status'] == "OK") {
          if(data['result']['status'] == 'remove_success'){
            this.router.navigate(['/wishlist/wish_list']);
          }else if(data['result']['status'] == 'add_success'){
            this.router.navigate(['/wishlist/addWishlist/'+restaurantID]);
          }
        }else {
          this.App.presentAlert_default(data['status'],data['result'],"assets/attention-icon.svg");
        }
      }, error => {
        this.loadingController.dismiss();
        this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
      });

  }

  backToWishlist(type){
    this.updateUserWishlist(type);
  }


  backToPrev(){
    this.App.goBack('home');
  }

}
