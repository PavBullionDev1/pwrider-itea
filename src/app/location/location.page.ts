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
  selector: "app-location",
  templateUrl: "./location.page.html",
  styleUrls: ["./location.page.scss"],
})
export class LocationPage implements OnInit {
  @ViewChild("autofocus", { static: false }) searchbar: IonSearchbar;

  mode = "home";
  stepMode = "noSelect";
  find = "";
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
    public location: Location
  ) {
    this.menuCtrl.swipeGesture(false);
  }

  ionViewWillEnter() {
    setTimeout(() => this.getLocation(), 0);
  }

  ngOnInit() {

    this.getLocation();
  }

  getLocation() {
    // this.App.presentLoading();
    this.HttpClient
      .get(
        this.App.api_url +
          "/getOwnRiderList/" +
          localStorage['token'] + "?category=pendingPickup&user_id=" + localStorage['login_user_id']
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
    this.router.navigate(["service",item]);
  }

}
