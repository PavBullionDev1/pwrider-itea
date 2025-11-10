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

@Component({
  selector: 'app-commission-report',
  templateUrl: './commission-report.page.html',
  styleUrls: ['./commission-report.page.scss'],
  providers: [],
})
export class CommissionReportPage implements OnInit {

  userList = [];
  dataList = [];
  commission = 0;
  total_commission = 0;
  total_count = 0;
  start_date = this.last30_date();
  end_date = new Date().toISOString().slice(0, 10);


  constructor(
    public alertController: AlertController,
    private router: Router,
    public HttpClient: HttpClient,
    public App: AppComponent,
    private route: ActivatedRoute,
    public loadingController: LoadingController,
    public menuCtrl: MenuController,
    public location: Location,
  ) { }

  ngOnInit() {
    this.getCommissionReport();
  }

  getCommissionReport() {

    var filter = this.getParams();
    console.log(filter);
    // this.App.presentLoading();
    this.HttpClient
      .get(
        this.App.api_url +"/appGetCommissionReport/" + this.start_date + "/" + this.end_date + "/" +localStorage['token']
      )
      .subscribe(
        (data: any) => { 
        //   this.loadingController.dismiss();
          this.dataList = data.result["dataList"];
          
          console.log("dataList",this.dataList);

          let tmp = 0;
          let count = 0;

          for(let i=0;i<this.dataList.length;i++){
            tmp += parseFloat(this.dataList[i].commission);
            count ++;
          }

          this.total_commission = tmp;
          this.total_count = count;


        },
        (error) => {
        //   this.loadingController.dismiss();

          console.log(error);
        }
      );
  }

  resetFilter() {
    this.start_date = this.last30_date();
    this.end_date = new Date().toISOString().slice(0, 10);
    this.getCommissionReport();
  }

  getParams() {
    
    if (this.start_date.length > 20) {
      this.start_date = this.start_date.slice(0, 10);
    }
    if (this.end_date.length > 20) {
      this.end_date = this.end_date.slice(0, 10);
    }
    return {
      start_date: this.start_date,
      end_date: this.end_date,
    };
  }

  last30_date() {
    var date = new Date();
    date.setDate(date.getDate() - 30);
    return `${date.getFullYear()}-${
      date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1
    }-${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()}`;
  }

  // End date exceed start date
  setEndDate() {
    let end = new Date(this.end_date);
    let start = new Date(this.start_date);
    if (end < start) {
      this.start_date = end.toISOString().slice(0, 10);
    }
  }

}
