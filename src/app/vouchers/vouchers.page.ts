import { Component, OnInit } from "@angular/core";
import { AlertController, LoadingController, MenuController } from "@ionic/angular";
import { Httprequest } from "../models/httprequest";
import { HttpClient } from "@angular/common/http";
import { AppComponent } from "../app.component";
import { ActivatedRoute, Router } from "@angular/router";
import { Location } from "@angular/common";
@Component({
  selector: "app-vouchers",
  templateUrl: "./vouchers.page.html",
  styleUrls: ["./vouchers.page.scss"],
})
export class VouchersPage implements OnInit {
  sortMode = "default";
  sorting = "dateAdd";
  view = "all";

  myVouchers = [];
  action = [];

  constructor(
    public httpClient: HttpClient,
    public App: AppComponent,
    public loadingController: LoadingController,
    private router: Router,
    private route: ActivatedRoute,
    public menuCtrl:MenuController,
    public location:Location,
    public alertController: AlertController
  ) {
    this.menuCtrl.swipeGesture(false);
  }

  ngOnInit() {
    this.getMyVoucher();
  }

  onSwipeLeft(event){
    this.location.back();
  }


  ionViewWillEnter() {
    this.getMyVoucher();
  }

  ionViewDidEnter(){
    this.getMyVoucher();
  }

  viewBy(view) {
    // console.log(view);
  }

  sortingBy(sorting) {
    this.sortMode = sorting;

    this.getMyVoucher();
  }

  getMyVoucher() {
    // this.App.presentLoading();
    this.action = [];
    this.httpClient
      .get(
        this.App.api_url +
          "/getMyVoucher/" +
          localStorage['login_user_id'] +
          "/" +
          localStorage['token'] +
          "?view=" +
          this.view +
          "&sorting=" +
          this.sorting
      )
      .subscribe(
        (data: any) => {
          // this.loadingController.dismiss();
          this.myVouchers = data.result["voucherData"];

          for (var i = 0; i <= this.myVouchers.length; i++) {
            this.action.push("voucher" + i);
          }
        },
        (error) => {
          // this.loadingController.dismiss();

          console.log(error);
        }
      );
  }

  setDisplay(voucher_id, index) {
    // this.App.presentLoading();
    switch (this.action["voucher" + index]) {
      case "redeem":
        this.App.slidePage("redeem/" + voucher_id);
        break;
      case "gift":
        this.App.slidePage("gift-voucher/" + voucher_id);

        break;

        case "delete":
          this.presentAlertConfirm(voucher_id, index);
          // const alert =  this.alertController.create({
          //   cssClass: 'my-custom-class alearboxclass confirmActionalearboxclass',
          //   header: '',
          //   message: '<img src="assets/attention-icon.svg"><h2></h2><p>Confirm</p>',

          //   backdropDismiss: false,
          //   buttons: [
          //     {
          //       text: 'Cancel',
          //       cssClass: 'colosebutton',
          //       role: 'cancel',
          //       // cssClass: 'secondary',
          //       handler: (blah) => {
          //         // console.log('Confirm Cancel: blah');
          //       }
          //     }, {
          //       text: "Confirm",
          //       cssClass: 'confirmbutton',
          //       handler: () => {
          //         this.httpClient
          //         .post(
          //           this.App.api_url + "/updateMyVoucher",
          //           {
          //             action: this.action["voucher" + index],
          //             user_id: localStorage['login_user_id'],
          //             token: localStorage['token'],
          //             voucher_id: voucher_id,
          //           },
          //           { observe: "body" }
          //         )
          //         .subscribe(
          //           (data: any) => {
          //             // this.loadingController.dismiss();
          //             if (data.status == "OK") {
          //               this.getMyVoucher();
          //             } else {
          //               this.App.presentAlert_default(
          //                 data["status"],
          //                 data["result"],
          //                 "assets/attention-icon.svg"
          //               );
          //             }
          //           },
          //           (error) => {
          //             // this.loadingController.dismiss();
          //             this.App.presentAlert_default(
          //               "ERROR",
          //               "Connection Error",
          //               "assets/attention-icon.svg"
          //             );
          //           }
          //         );

          //       }
          //     }
          //   ]
          // });


          break;

      default:

        this.httpClient
          .post(
            this.App.api_url + "/updateMyVoucher",
            {
              action: this.action["voucher" + index],
              user_id: localStorage['login_user_id'],
              token: localStorage['token'],
              voucher_id: voucher_id,
            },
            { observe: "body" }
          )
          .subscribe(
            (data: any) => {
              // this.loadingController.dismiss();
              if (data.status == "OK") {
                this.getMyVoucher();
              } else {
                this.App.presentAlert_default(
                  data["status"],
                  data["result"],
                  "assets/attention-icon.svg"
                );
              }
            },
            (error) => {
              // this.loadingController.dismiss();
              this.App.presentAlert_default(
                "ERROR",
                "Connection Error",
                "assets/attention-icon.svg"
              );
            }
          );
        break;
    }
  }

  async presentAlertConfirm(voucher_id, index){
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class alearboxclass confirmActionalearboxclass',
      header: '',
      message: 'Confirm the action?',

      backdropDismiss: false,
      buttons: [
        {
          text: 'Cancel',
          cssClass: 'colosebutton',
          role: 'cancel',
          // cssClass: 'secondary',
          handler: (blah) => {
            // console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Confirm',
          cssClass: 'confirmbutton',
          handler: () => {
            // console.log('Confirm Submit');

            //to send request
            this.httpClient
            .post(
              this.App.api_url + "/updateMyVoucher",
              {
                action: this.action["voucher" + index],
                user_id: localStorage['login_user_id'],
                token: localStorage['token'],
                voucher_id: voucher_id,
              },
              { observe: "body" }
            )
            .subscribe(
              (data: any) => {
                // this.loadingController.dismiss();
                if (data.status == "OK") {
                  this.getMyVoucher();
                } else {
                  this.App.presentAlert_default(
                    data["status"],
                    data["result"],
                    "assets/attention-icon.svg"
                  );
                }
              },
              (error) => {
                // this.loadingController.dismiss();
                this.App.presentAlert_default(
                  "ERROR",
                  "Connection Error",
                  "assets/attention-icon.svg"
                );
              }
            );

          }
        }
      ]
    });
    await alert.present();

    // 添加图标显示
    setTimeout(() => {
      const alertElement = document.querySelector('ion-alert.confirmActionalearboxclass');
      if (alertElement) {
        const messageElement = alertElement.querySelector('.alert-message');
        if (messageElement) {
          const iconDiv = document.createElement('div');
          iconDiv.style.textAlign = 'center';
          iconDiv.style.marginBottom = '15px';
          iconDiv.innerHTML = '<img src="./assets/attention-icon.svg" style="width: 60px; height: 60px;" />';
          messageElement.insertBefore(iconDiv, messageElement.firstChild);
        }
      }
    }, 100);
  }

  toVoucherDetail(item, type) {
    this.App.slidePage("/voucher-detail/" + item.voucher_id + "/" + type);

  }
  reset() {
    this.sortMode = "default";
    this.sorting = "dateAdd";
    this.view = "all";
    this.getMyVoucher();
  }

  backToPrev(){
    this.App.goBack('home');
  }
}
