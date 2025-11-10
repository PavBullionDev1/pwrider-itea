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
  ActionSheetController,
  Platform,
} from "@ionic/angular";
import { AppComponent } from "../app.component";
import { Httprequest } from "../models/httprequest";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// import { StatusBar as CapacitorStatusBar } from '@capacitor/status-bar';
import { ModalController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-collection-detail',
  templateUrl: './collection-detail.page.html',
  styleUrls: ['./collection-detail.page.scss'],
})
export class CollectionDetailPage implements OnInit {

  purchase_order_id = this.route.snapshot.paramMap.get("purchase_order_id");

  statusList: any[] = [];
  collectionDetails: any = {
    serial_no: '',
    order_status: 0,
    purchase_order_id: '',
    price_per_gram_final: 0,
    XAU_amount: 0,
    payment_method: '',
    total_amount: 0,
    itemList: [],
    remark: '',
    remark_pic: []
  };

  is_multiple_image = 0;
  imageUrl = '';
  MultipleImageUrl: string[] = [];

  constructor(
    public alertController: AlertController,
    private router: Router,
    public httpClient: HttpClient,
    public App: AppComponent,
    private route: ActivatedRoute,
    public loadingController: LoadingController,
    public menuCtrl: MenuController,
    public actionSheetController: ActionSheetController,
    private platform: Platform,
    public location: Location,
    private navCtrl: NavController
  ) { }

  async ngOnInit() {
    // await this.checkPermissions();
  }

  private async checkPermissions() {
    try {
      const permissionStatus = await Camera.checkPermissions();
      if (permissionStatus.camera !== 'granted') {
        await Camera.requestPermissions();
      }
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      await this.showErrorAlert('Error', 'Failed to get camera permissions');
    }
  }

  ionViewWillEnter() {
    this.getCollectionDetails();
  }

  getCollectionDetails() {
    this.App.presentLoading();
    this.httpClient
      .get(
        this.App.api_url + "/appGetCollectionDetails/" + this.purchase_order_id + "/" + localStorage['token'])
      .subscribe(
        (data: any) => {
          this.loadingController.dismiss();
          this.collectionDetails = data.result["collectionDetails"];
          console.log("DATA", this.collectionDetails);
        },
        (error: any) => {
          this.loadingController.dismiss();
          console.log(error);
        }
      );
  }

  private async showErrorAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async readAsBase64(photo: any) {
    const response = await fetch(photo.webPath);
    const blob = await response.blob();
    return await this.convertBlobToBase64(blob);
  }

  private readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error: any) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    });
  }
}
