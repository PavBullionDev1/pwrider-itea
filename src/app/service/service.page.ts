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
  selector: "app-service",
  templateUrl: "./service.page.html",
  styleUrls: ["./service.page.scss"],
})
export class ServicePage implements OnInit {
  @ViewChild("autofocus", { static: false }) searchbar: IonSearchbar;

  mode = "home";
  stepMode = "noSelect";
  find = "";
  viewMode = "empty";
  userList = [];
  locationList = [];
  serviceList = [];
  has_service = 1;

  constructor(
    public alertController: AlertController,
    private router: Router,
    public HttpClient: HttpClient,
    public App: AppComponent,
    private route: ActivatedRoute,
    public loadingController: LoadingController,
    public menuCtrl: MenuController,
    public location: Location
  ) {
    this.menuCtrl.swipeGesture(false);
  }

//   ionViewWillEnter() {
//     setTimeout(() => this.searchbar.setFocus(), 0);
//   }

  location_id = this.route.snapshot.paramMap.get("location_id");

  ngOnInit() {

    this.getService();
  }

  getService() {
    // this.App.presentLoading();
    this.HttpClient
      .get(
        this.App.api_url +
          "/appGetServiceList/" +
          this.location_id + "/" +
          localStorage['token']
      )
      .subscribe(
        (data: any) => {
        //   this.loadingController.dismiss();
          this.locationList = data.result["locationList"];
          this.serviceList = data.result["serviceList"];
          this.has_service = 1;
          // console.log(this.has_service);
          if(this.serviceList.length==0){
            this.has_service = 0;
            // console.log(this.has_service);
          }

        },
        (error) => {
        //   this.loadingController.dismiss();

          console.log(error);
        }
      );
  }

}
