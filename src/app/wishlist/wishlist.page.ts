import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar, LoadingController, MenuController } from '@ionic/angular';
import { WishlistVoucherDetailPage } from '../wishlist-voucher-detail/wishlist-voucher-detail.page';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AppComponent } from '../app.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.page.html',
  styleUrls: ['./wishlist.page.scss'],
})
export class WishlistPage implements OnInit {
  @ViewChild('autofocus',{static:false}) searchbar:IonSearchbar

  mode = "noSearch";
  searchValue = "";
  viewMode = "empty";
  filteredList = [];
  wishlistMerchants = [];
  availableToAddWishVouchers = [];
  match = 'invalid';
  voucherTotal = "";
  newMerchantTitle = "";

  constructor(
    public httpClient:HttpClient,
    public App:AppComponent,
    private router:Router,
    private route:ActivatedRoute,
    public loadingController:LoadingController,
    public menuCtrl:MenuController,
    public location:Location
    ) {
      this.menuCtrl.swipeGesture(false);
    }

  ionViewWillEnter(){
    setTimeout(() => this.searchbar.setFocus(),0);
  }

  sourceType = this.route.snapshot.paramMap.get('sourceType');
  restaurant_id = this.route.snapshot.paramMap.get('restaurant_id');

  ngOnInit() {
    if(this.sourceType == 'wish_list'){
      this.wishlistMerchants  = [];
    }else if(this.sourceType == 'addWishlist'){
      this.wishlistMerchants  = [];
      this.findNewMerchantVoucher(this.restaurant_id);
    }

    if(this.wishlistMerchants.length == 0){
      this.getUserWishlist();
    }
  }

  getUserWishlist(){

    var login_user_id = localStorage.getItem("login_user_id");

    this.App.presentLoading();
    this.httpClient.post(this.App.api_url+"/appGetUserWishlist",{
      'login_user_id':login_user_id
    },{observe: "body"})
      .subscribe((data)=>{
        this.loadingController.dismiss();
        if(data['status'] == "OK") {
          this.wishlistMerchants = data['result']['wishList'];
        }else {
          this.App.presentAlert_default(data['status'],data['result'],"assets/attention-icon.svg");
        }
      }, error => {
        this.loadingController.dismiss();
        this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
      });
  }

  searchWishList(){
    this.mode = "search";
    this.ionViewWillEnter();
  }

  searchResult(item,type){
    var login_user_id = localStorage.getItem("login_user_id");

    return new Promise(resolve=>{
      this.httpClient.post(this.App.api_url+"/appSearchMerchant_wishlist",{
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

    var findLength = this.searchValue.length;

    if(findLength >0){
      let item = this.searchValue;
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
      this.availableToAddWishVouchers = [];
      this.viewMode = "empty";
    }

  }

  chooseMerchant(item){
    if(item['restaurant_id'] >0){
      this.filteredList  = [];

      this.searchValue = item['title'];
      this.searchMerchant(item['title']);
    }
  }

  searchMerchant(item){

    var findLength = item.length;

    if(findLength >0){
      var list = this.searchResult(item,'search');
      list.then((res) =>{
        if(res['status'] == 'ERROR'){
          this.App.presentAlert_default(res['status'],res['result'],"assets/attention-icon.svg");
        }else{
          if(res['restaurantList'].length >0){
            this.availableToAddWishVouchers = res['restaurantList'];
            this.viewMode = 'show';
          }else{
            //0 merchant
            this.availableToAddWishVouchers = [];
            this.viewMode = 'notFound';
          }
        }
      },(err)=>{
          console.log(err);
          // this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
      });
    }
  }

  findNewMerchantVoucher(id){
    var login_user_id = localStorage.getItem("login_user_id");

    this.App.presentLoading();
    this.httpClient.post(this.App.api_url+"/appFindNewMerchantVoucher",{
      'restaurant_id':id,
      'login_user_id':login_user_id
    },{observe: "body"})
      .subscribe((data)=>{
        this.loadingController.dismiss();
        if(data['status'] == "OK") {
          this.voucherTotal = data['result']['voucherTotal'];
          if(data['result']['voucherTotal'] > 0){
            this.match = 'valid';
            this.newMerchantTitle = data['result']['newMerchantTitle'];
          }
        }else {
          this.App.presentAlert_default(data['status'],data['result'],"assets/attention-icon.svg");
        }
      }, error => {
        this.loadingController.dismiss();
        this.App.presentAlert_default('ERROR',"Connection Error","assets/attention-icon.svg");
      });
  }

  backToWishlist(){
    if(this.mode == "noSearch"){
      this.App.goBack('home');
    }else{
      this.mode = "noSearch";
      this.filteredList  = [];
      this.availableToAddWishVouchers = [];
      this.viewMode = "empty";
      this.searchValue = "";
    }


  }

  toWishlistVoucherDetail(item,type){
    this.App.slidePage('wishlist-voucher-detail/'+ item.restaurant_id + '/'+ type);


  }

  closeMatch(){
    this.match = 'invalid';
  }

  onSwipeLeft(event){
    if(this.mode == 'search'){
     this.backToWishlist();
    }else{
      this.location.back();
    }
  }

}
