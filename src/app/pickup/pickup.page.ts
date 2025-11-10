import { Location } from "@angular/common";
import { HttpClient, HttpRequest } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AlertController,
  AngularDelegate,
  IonSearchbar,
  LoadingController,
  MenuController,
} from "@ionic/angular";
import { AppComponent } from "../app.component";
import { Httprequest } from "../models/httprequest";
import { NativeAdapterService } from '../services/native-adapter.service';

@Component({
  selector: "app-pickup",
  templateUrl: "./pickup.page.html",
  styleUrls: ["./pickup.page.scss"],
  providers: [NativeAdapterService],
})
export class PickupPage implements OnInit {
  @ViewChild("autofocus", { static: false }) searchbar: IonSearchbar;

  mode = "home";
  stepMode = "noSelect";
  find = "";
  url= "";
  viewMode = "empty";
  userList = [];
  riderList = [];
  has_riderlist = 1;

  constructor(
    public alertController: AlertController,
    private router: Router,
    public HttpClient: HttpClient,
    public App: AppComponent,
    private route: ActivatedRoute,
    public loadingController: LoadingController,
    public menuCtrl: MenuController,
    public location: Location,
    private nativeAdapter: NativeAdapterService,
  ) {
    this.menuCtrl.swipeGesture(false);
  }

  ionViewWillEnter() {
    this.riderList = [];
    setTimeout(() => this.getPickup(), 0);
  }

  ngOnInit() {
  }

  


  getPickup() {
    this.App.presentLoading(4000);
    this.HttpClient
      .get(
        this.App.api_url +"/getJob_logCustomList/0" + "/" +localStorage['token']
      )
      .subscribe(
        (data: any) => { 

          this.riderList = [];

          let tmp_riderList = data.result["riderList"];
          if(tmp_riderList != 0){
            for(let i =0; i < tmp_riderList.length ; i++){
              if(tmp_riderList[i].delivery_status != 1){
                this.riderList.push(tmp_riderList[i]);
              }
            }
          }else{
            this.riderList = data.result["riderList"];
          }
          console.log("this.riderList",this.riderList);

          this.has_riderlist = 1;
          if(this.riderList.length==0){
            this.has_riderlist = 0;
          }
          this.loadingController.dismiss();

        },
        (error) => {
        //   this.loadingController.dismiss();

          console.log(error);
        }
      );
  }

  sendWhatsapp(item){
    this.url = "https://api.whatsapp.com/send/?phone="+item.sender_telephone+"&text=Dear+Valued+Customer%2C+RIDER+will+be+picking+up+your+shipment+within+30mins&app_absent=0";
    this.openWebPage(this.url);
  }

  doRefresh(event) {
    console.log('Begin async operation');
    this.getPickup();

      event.target.complete();

  }

  openMap(item){
    this.url="http://maps.google.com/?q="+item.customer_address1 + ","+  item.customer_address2 + "," + item.customer_city + "," + item.customer_postcode;
    this.openWebPage(this.url);
  }

  async openWebPage(url: string) {
    try {
      await this.nativeAdapter.openInAppBrowser(url, '_system');
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  }

  details(item) {
    this.router.navigate(["pickup-detail",item]);
  }

}
