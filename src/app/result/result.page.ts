import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, MenuController } from '@ionic/angular';
import { AppComponent } from '../app.component';
import { Httprequest } from "../models/httprequest";

@Component({
  selector: 'app-result',
  templateUrl: './result.page.html',
  styleUrls: ['./result.page.scss'],

})
export class ResultPage implements OnInit {

  constructor(
    public alertController: AlertController,
    private router: Router,
    public HttpClient: HttpClient,
    public App: AppComponent,
    private route: ActivatedRoute,
    public loadingController: LoadingController,
    public menuCtrl: MenuController,
  
  ) { }

  mode = "home";
  stepMode = "noSelect";
  find = "";
  url= "";
  viewMode = "empty";
  userList: any[] = [];
  riderList: any[] = [];
  has_riderlist = 1;
  cn_no = this.route.snapshot.paramMap.get("cn_no");


  
  ionViewWillEnter() {
    this.getPickup();
  }

  ngOnInit() {


  }

  
  doRefresh(event: any): void {
    // console.log('Begin async operation');
    this.getPickup();

      event.target.complete();

  }

  


  getPickup() {
    // this.App.presentLoading();
    this.HttpClient
      .get(
        this.App.api_url +"/getSearchList/" + this.cn_no  +"/" +localStorage['token']
      )
      .subscribe(
        (data: any) => { 
        //   this.loadingController.dismiss();
          this.riderList = data.result["riderList"];
          console.log(this.riderList);

          this.has_riderlist = 1;
          if(this.riderList.length==0){
            this.has_riderlist = 0;
          }
        },
        (error) => {
        //   this.loadingController.dismiss();

          console.log(error);
        }
      );
  }



  details(item) {
    this.router.navigate(["pickup-detail",item]);
  }

}
