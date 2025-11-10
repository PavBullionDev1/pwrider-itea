import { Component, OnInit } from '@angular/core';

import { TermsPage } from '../terms/terms.page';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { MenuController, AlertController, LoadingController } from '@ionic/angular';
import { AppComponent } from '../app.component';
import { Httprequest } from '../models/httprequest';
import { Location } from '@angular/common';

@Component({
  selector: 'app-qr',
  templateUrl: './qr.page.html',
  styleUrls: ['./qr.page.scss'],
})
export class QrPage implements OnInit {

  constructor(

    private router: Router,

    public httpClient: HttpClient,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public App: AppComponent,
    public menuCtrl:MenuController,
    public location:Location
  ) {
    this.menuCtrl.swipeGesture(false);
  }

  qrlink = "";
  showNotFound: boolean = false
  ngOnInit() {
    this.App.presentLoading();
    var lastname = localStorage.getItem("login_user_id");


    this.httpClient.get(this.App.api_url + "/qrCode/"+localStorage['login_user_id']+"/"+localStorage['token'])
    .subscribe((data:Httprequest)  => {
      this.loadingController.dismiss();
      this.showNotFound = true;
      this.qrlink = data.result.qrCode;


    }, error => {
      this.loadingController.dismiss();
      this.showNotFound = false;
      console.log(error);
    });




  }

  onSwipeLeft(event){
    this.location.back();
  }


  backToPrev(){
    this.App.goBack('home');
  }

}
