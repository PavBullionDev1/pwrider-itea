import { HttpClient } from '@angular/common/http';
import { Component, OnInit,ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, MenuController,IonReorderGroup,ItemReorderEventDetail, NavController } from '@ionic/angular';
import { AppComponent } from '../app.component';

import { Httprequest } from "../models/httprequest";

@Component({
  selector: 'app-pickup-order',
  templateUrl: './pickup-order.page.html',
  styleUrls: ['./pickup-order.page.scss'],
  providers:[]
})
export class PickupOrderPage implements OnInit {
  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;
  constructor(
    public alertController: AlertController,
    private router: Router,
    public HttpClient: HttpClient,
    public App: AppComponent,
    private route: ActivatedRoute,
    public loadingController: LoadingController,
    public menuCtrl: MenuController,
    private navCtrl: NavController
  ) { }

  mode = "home";
  stepMode = "noSelect";
  find = "";
  url= "";
  viewMode = "empty";
  userList = [];
  riderList = [];
  has_riderlist = 1;
  detail="";
  ngOnInit() {
    this.getPickup();
   
  }

  getPickup() {
    // this.App.presentLoading();
    this.HttpClient
      .get(
        this.App.api_url +"/getJob_logCustomList/0" + "/" +localStorage['token']
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

  doReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    // Before complete is called with the items they will remain in the
    // order before the drag
    console.log('Before complete', this.riderList);

    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. Update the items variable to the
    // new order of items
    this.riderList = ev.detail.complete(this.riderList);
    this.updateOrder();
    // After complete is called the items will be in the new order
    console.log('After complete', this.riderList);
  }
  
  updateOrder(){
    let tobeSubmit = {
			'account_id': localStorage['login_user_id'],
			'token': localStorage['token'],
			'dataList': this.riderList,
		};

		this.HttpClient.post(this.App.api_url+"/updateJobOrder",tobeSubmit,{observe: "body"}).subscribe((data) => {
			if(data['status'] == "OK") {
        this.App.stopLoading(100);
        // this.navCtrl.navigateRoot('pickup',{animationDirection:'forward'});

			} else {
        this.App.stopLoading(100);
        // this.loadingController.dismiss();
        this.App.presentAlert_default('','Error!. Please try again',"assets/gg-icon/attention-icon.svg");
			}
		}, error => {
        this.App.stopLoading(100);
        // this.loadingController.dismiss();
		//ERROR
			this.App.presentAlert_default('',"Connection Error","assets/gg-icon/attention-icon.svg");
		});
  }
}
