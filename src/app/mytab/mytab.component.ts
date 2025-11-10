import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AppComponent } from '../app.component';
import { NativeAdapterService } from '../services/native-adapter.service';
import { ActivatedRoute, Router } from "@angular/router";
import { Httprequest } from "../models/httprequest";
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'mytab',
  templateUrl: './mytab.component.html',
  styleUrls: ['./mytab.component.scss'],
  providers:[NativeAdapterService]
})
export class MytabComponent implements OnInit {

  app_access_logistic = localStorage['app_access_logistic'];
  app_access_bullion = localStorage['app_access_bullion'];

  constructor(
    public App:AppComponent,
    private navCtrl: NavController,
    public httpClient: HttpClient,
    private nativeAdapter: NativeAdapterService,
    private router: Router,
  ) { }
  current_url = this.router.url;
  ngOnInit() {
    console.log();
  }

  ionViewWillEnter(){
		this.get_access();
    // this.get_multiple_image_testing();
	  // this.get_one_image_testing();
	}

  get_access(){
    this.app_access_logistic = localStorage['app_access_logistic'];
    this.app_access_bullion = localStorage['app_access_bullion'];
  }

  navigate(navigate){
    // this.App.slidePage(navigate);
    this.navCtrl.navigateRoot(navigate);
  }

  scanner(){
    this.nativeAdapter.scanBarcode().then(barcodeData => {
      console.log(barcodeData['text']);
      this.httpClient.get(this.App.api_url+"/getRiderJobDetails/"+localStorage['login_user_id']+'/'+localStorage['token']+'/'+barcodeData['text'],{observe: "body"})
      .subscribe((data:Httprequest) => {

        // this.loadingController.dismiss();
        // console.log(data);
        if(data.status == "OK") {

          // if(data['result']['delivery_action']==0){
          //   this.router.navigate(['pickup-detail/'+data['result']['job_log_id']]);
          // }else{
          //   this.router.navigate(['delivery-detail/'+data['result']['job_log_id']]);
          // }
          this.router.navigate(['result-detail/'+data['result']['sales_order_id']]);

        } else {
          this.App.presentAlert_default('ERROR', JSON.stringify(data['result']) || 'Unknown error',"../../assets/attention2-icon.svg");
        }

      }, error => {
        // this.loadingController.dismiss();
        // this.App.presentAlert_default('ERROR',"Connection Error","../../assets/attention2-icon.svg");
      });
  //  
     }).catch(err => {
         console.log('Error', err);
     });

     
  }
}
