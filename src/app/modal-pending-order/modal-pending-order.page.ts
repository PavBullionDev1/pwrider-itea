import { Component, OnInit, ViewChild, Input, ElementRef } from "@angular/core";
import { ModalController, NavParams } from '@ionic/angular';
import { HttpClient, HttpRequest } from "@angular/common/http";
import {
	AlertController,
	AngularDelegate,
	IonSearchbar,
	LoadingController,
	MenuController,
	Platform,
} from "@ionic/angular";

@Component({
  selector: 'app-modal-pending-order',
  templateUrl: './modal-pending-order.page.html',
  styleUrls: ['./modal-pending-order.page.scss'],
  providers: [],
})
export class ModalPendingOrderPage implements OnInit {

  @Input("modalData") modalData;
  subcription:any;

  constructor(
		public menuCtrl: MenuController,
		public modalController: ModalController,
		public HttpClient: HttpClient,
    public alertController: AlertController,
		public httpClient: HttpClient,
		public loadingController: LoadingController,
    private navParams: NavParams,
		private platform: Platform,



  ) { }

  ngOnInit() {
    this.subcription = this.platform.backButton.subscribeWithPriority(10, () => {
      this.dismiss();
    });
  }

  ionViewWillLeave() {
    this.subcription.unsubscribe();
  }

  dismiss(id : any = 0) {
		this.modalController.dismiss(id);
	}
  
  callSubmitFunction() {
    const submitFunction = this.navParams.get('submitFunction');
    if (submitFunction) {
      // Check if the function was passed
      submitFunction(this.modalData); // Call the function with the modalData or other parameters as needed
    }
  
    this.modalController.dismiss(); // Close the modal after submitting
  }
}
