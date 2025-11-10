import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController, LoadingController, ActionSheetController, Platform } from '@ionic/angular';
import { AppComponent } from "../app.component";
import { ActivatedRoute, Router } from "@angular/router";
import { Httprequest } from "../models/httprequest";
import { NativeAdapterService } from '../services/native-adapter.service';
import { ModalExchangeItemsPage } from '../modal-exchange-items/modal-exchange-items.page';
import { ModalGoldShipmentDetailPage } from '../modal-gold-shipment-detail/modal-gold-shipment-detail.page';
import { ModalController, NavController } from '@ionic/angular';
import { Big } from 'big.js';

@Component({
  selector: 'app-gold-shipment-clock-in',
  templateUrl: './exchange-note.page.html',
  styleUrls: ['./exchange-note.page.scss'],
  providers: [NativeAdapterService]
})
export class ExchangeNotePage implements OnInit {

  exchange_note_id = this.route.snapshot.paramMap.get("exchange_note_id");

  customerList: any[] = [];

  company_id: any;
  QC_rider_id: any;
  collected_count: any;
  created_date: any;
  customer_id: any;
  do_knockoffed_XAU_amount: any;
  exc_grn_statement_count: any;
  exchange_note_id_field: any; // To avoid naming conflict with the class property
  exchange_premium_package: any;
  gainloss: any;
  is_deleted: any;
  knockoffed_XAU_amount: any;
  markup_percentage: any;
  markup_xau: any;
  modified_date: any;
  pw_total_XAU: any;
  pw_total_weight: any;
  refining_fee: any;
  remark: any;
  remark_pic: any;
  rider_id: any;
  serial_no: any;
  status: any;
  total_XAU: any;
  total_weight: any;
  unit_refining_fee: any;
  user_id: any;
  gold_shipment_id: any;
  pw_item_list: any[] = [];
  customer_item_list: any[] = [];
  gold_shipment_list: any[] = [];
  gold_shipment_detail_list: any[] = [];
  gold_pure_list: any[] = [];
  item_type_list: any[] = [];
  isLoading: Record<string, boolean> = {};

  constructor(
    private modalController: ModalController,
    private http: HttpClient,
    public App: AppComponent,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private nativeAdapter: NativeAdapterService,
    private actionSheetController: ActionSheetController,
    private platform: Platform,
  ) {}

  ngOnInit() {
    this.initializePage();
  }

  private async initializePage() {
    this.getAllCustomer();
    this.getExchangeNoteList();
    this.getExchangeGoldPurityList();
    if (this.exchange_note_id) {
      await this.getExchangeNoteDetails();
    }
  }

  private async showErrorAlert(error: any, context: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: `Failed to ${context}: ${error.message || 'An error occurred.'}`,
      buttons: ['OK'],
    });
    await alert.present();
  }

  async getExchangeNoteDetails() {
    const loading = await this.loadingController.create({
      message: 'Loading shipment details...',
    });
    await loading.present();

    this.http.get(`${this.App.api_url}/appGetExchangeNoteDetails/${this.exchange_note_id}/${localStorage.getItem('token')}`)
      .subscribe(
        (data: any) => {
          const result = data.result?.data;
          if (result) {
            // Assign data to component properties
            this.company_id = result['company_id'];
            this.QC_rider_id = result['QC_rider_id'];
            this.collected_count = result['collected_count'];
            this.created_date = result['created_date'];
            this.customer_id = result['customer_id'];
            this.do_knockoffed_XAU_amount = result['do_knockoffed_XAU_amount'];
            this.exc_grn_statement_count = result['exc_grn_statement_count'];
            this.exchange_note_id_field = result['exchange_note_id'];
            this.exchange_premium_package = result['exchange_premium_package'];
            this.gainloss = result['gainloss'];
            this.is_deleted = result['is_deleted'];
            this.knockoffed_XAU_amount = result['knockoffed_XAU_amount'];
            this.markup_percentage = result['markup_percentage'];
            this.markup_xau = result['markup_xau'];
            this.modified_date = result['modified_date'];
            this.pw_total_XAU = result['pw_total_XAU'];
            this.pw_total_weight = result['pw_total_weight'];
            this.refining_fee = result['refining_fee'];
            this.remark = result['remark'];
            this.remark_pic = result['remark_pic'];
            this.rider_id = result['rider_id'];
            this.serial_no = result['serial_no'];
            this.status = result['status'];
            this.total_XAU = result['total_XAU'];
            this.total_weight = result['total_weight'];
            this.unit_refining_fee = result['unit_refining_fee'];
            this.user_id = result['user_id'];
            this.pw_item_list = result['pw_item_list'];
            this.customer_item_list = result['customer_item_list'];
            if(this.customer_item_list.length == 0){
              console.log(this.customer_item_list);
              this.addRowToCustomerItemList();
            }
            this.gold_shipment_id = result['gold_shipment_id'];

            console.log('Shipment details loaded successfully', result);
          }
          loading.dismiss();
        },
        (error) => {
          console.error('Error fetching shipment details:', error);
          this.showErrorAlert(error,'fetching shipment details');
          loading.dismiss();
        }
      );
  }

  getAllCustomer() {
    this.http.get(`${this.App.api_url}/getAllCustomer/${localStorage.getItem('token')}`)
      .subscribe(
        (data: any) => {
          this.customerList = data.result?.data || [];
          //arrange customerList by customer_name acs
          this.customerList.sort((a, b) => a.name.localeCompare(b.name));
        },
        (error) => {
          console.error('Error fetching customers:', error)
          this.showErrorAlert(error,'fetching customers');
        }
      );
  }

  async submitExchangeNote() {
    const loading = await this.loadingController.create({
      message: 'Submitting exchange note...',
    });

    const payload = {
      token: localStorage.getItem('token'),
      dataList: {
        company_id: this.company_id,
        QC_rider_id: this.QC_rider_id,
        collected_count: this.collected_count,
        created_date: this.created_date,
        customer_id: this.customer_id,
        do_knockoffed_XAU_amount: this.do_knockoffed_XAU_amount,
        exc_grn_statement_count: this.exc_grn_statement_count,
        exchange_note_id: this.exchange_note_id_field,
        exchange_premium_package: this.exchange_premium_package,
        gainloss: this.gainloss,
        is_deleted: this.is_deleted,
        knockoffed_XAU_amount: this.knockoffed_XAU_amount,
        markup_percentage: this.markup_percentage,
        markup_xau: this.markup_xau,
        modified_date: this.modified_date,
        pw_total_XAU: this.pw_total_XAU,
        pw_total_weight: this.pw_total_weight,
        refining_fee: this.refining_fee,
        remark: this.remark,
        remark_pic: this.remark_pic,
        rider_id: this.rider_id,
        serial_no: this.serial_no,
        status: this.status,
        total_XAU: this.total_XAU,
        total_weight: this.total_weight,
        unit_refining_fee: this.unit_refining_fee,
        user_id: this.user_id,
        gold_shipment_id: this.gold_shipment_id || 0
      },
      have_difference: false,
      pw_item_list: this.pw_item_list,
      customer_item_list: this.customer_item_list,
      gold_shipment_id: this.gold_shipment_id || 0,
      gold_shipment_detail_list: this.gold_shipment_detail_list,
      exchange_note_id: this.exchange_note_id || 0,
    };

    var confirmed = true;
    //check this.gold_shipment_detail_list is it have difference > 5 or < -5
    this.gold_shipment_detail_list.forEach(item => {
      if (item.difference > 0.1 || item.difference < -0.1){
        confirmed = false;
      }
    });

    //if confirmed is false then ask user to confirm
    if (!confirmed) {
      const alert = await this.alertController.create({
        header: 'Confirm Submission',
        message: 'You have a difference greater than 0.1 or less than -0.1. Are you sure you want to submit the exchange note?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Submit',
            handler: () => {
              loading.present();
              payload.have_difference = true;
              this.http.post(`${this.App.api_url}/appSubmitExchangeNote`, payload)
                .subscribe(
                  async (response) => {
                    console.log('Shipment submitted successfully:', response);
                    await loading.dismiss();
                    console.log(response['status']);
                    if(response['status'] == 'ERROR'){
                      console.error('Error submitting shipment:', response['result']);
                      this.showErrorAlert( response['result'],'submitting shipment');
                      await loading.dismiss();
                    }else{
                      const alert = await this.alertController.create({
                        header: 'Success',
                        message: 'Exchange note submitted successfully.',
                        buttons: [
                          {
                            text: 'OK',
                            handler: () => {
                              this.router.navigate(['/exchange-note-list']);
                            }
                          }
                        ]
                      });
                      await alert.present();
                    }
                  },
                  async (error) => {
                    console.error('Error submitting shipment:', error);
                    this.showErrorAlert(error,'submitting shipment');
                    await loading.dismiss();
                  }
                );
            }
          }
        ]
      });
      await alert.present();
      return;
    }else{
      await loading.present();
      this.http.post(`${this.App.api_url}/appSubmitExchangeNote`, payload)
        .subscribe(
          async (response) => {
            console.log('Shipment submitted successfully:', response);
            await loading.dismiss();
            if(response['status'] == 'ERROR'){
              console.error('Error submitting shipment:', response['result']);
              this.showErrorAlert( response['result'],'submitting shipment');
              await loading.dismiss();
            }else{
              const alert = await this.alertController.create({
                header: 'Success',
                message: 'Exchange note submitted successfully.',
                buttons: [
                  {
                    text: 'OK',
                    handler: () => {
                      this.router.navigate(['/exchange-note-list']);
                    }
                  }
                ]
              });
              await alert.present();
            }

          },
          async (error) => {
            console.error('Error submitting shipment:', error);
            this.showErrorAlert(error,'submitting shipment');
            await loading.dismiss();
          }
        );
    }


  }

   getGoldShipmentDetails(gold_shipment_id) {
     this.App.presentLoading();

     this.http
      .get(
        this.App.api_url + "/appGetGoldShipmentDetails/" + gold_shipment_id + "/" + localStorage['token'])
      .subscribe(
        (data: any) => {

          this.gold_shipment_detail_list = data.result['data']['detailList'];
          this.recalculateGoldShipmentDetail();

          console.log(data.result['data']);

          this.loadingController.dismiss();

        },
        (error) => {
          //this.loadingController.dismiss();

          console.log(error);
          this.loadingController.dismiss();

        }
      );
  }

  getExchangeNoteList() {
    this.App.presentLoading();
    this.http
      .get(
        this.App.api_url + "/appGetGoldShipmentList/" + localStorage['token'] + '?status="0"&type=1'
      )
      .subscribe(
        (data: any) => {
          this.loadingController.dismiss();
          this.gold_shipment_list = data.result['dataList'];
          console.log("this.gold_shipment_list",this.gold_shipment_list);

        },
        (error) => {
          this.loadingController.dismiss();
          console.log(error);
        }
      );
  }

  //get exchange gold pure list and item type list
  getExchangeGoldPurityList() {
    this.http.get(this.App.api_url + "/appGetExchangeGoldPurityList/" + localStorage['token'])
      .subscribe((data: any) => {
          this.gold_pure_list = data.result.gold_pure_list;
          //arrange gold_pure_list by gold_pure_percent decs
          this.gold_pure_list.sort((a, b) => b.gold_pure_percent - a.gold_pure_percent);
          for (var i = 0; i < this.gold_pure_list.length; i++) {
            if(this.gold_pure_list[i].type == 0){
              this.gold_pure_list[i].type = 1;
            }else if (this.gold_pure_list[i].type == 1){
              this.gold_pure_list[i].type = 2;
            }else if(this.gold_pure_list[i].type == 2){
              this.gold_pure_list[i].type = 3;
            }
          }
          this.item_type_list = data.result.item_type_list;
          console.log(data.result);
        },
        (error) => {
          console.log(error);
        });
  }

  // Open the modal with item details
  async openEditModal(item: any,type: any) {
    const modal = await this.modalController.create({
      component: ModalExchangeItemsPage,
      componentProps: {
        items: item,
        goldPureList: this.gold_pure_list,
        itemTypeList: this.item_type_list
      },
    });

    modal.onDidDismiss().then((result) => {
      if (result.data.data && result.data.deleted == false) {
        if(type == 0){
          const index = this.pw_item_list.findIndex(i => i === item);
          if (index >= 0) {
            this.pw_item_list[index] = result.data.data; // Update the item with edited details
          }
        }else{
          const index = this.customer_item_list.findIndex(i => i === item);
          if (index >= 0) {
            this.customer_item_list[index] = result.data.data; // Update the item with edited details
          }

          this.total_weight = 0;
          this.total_XAU = 0;

          //foreach calculate total weight and total xau
          this.customer_item_list.forEach((item: any) => {
            this.total_weight = Big(this.total_weight).plus(item.weight).round(2, 0).toNumber();
            this.total_XAU = Big(this.total_XAU).plus(item.XAU).round(3, 0).toNumber();
          });
        }
      }else if(result.data.deleted == true){
        const index = this.customer_item_list.findIndex(i => i === item);
        //remove item
        if (index >= 0) {
          this.customer_item_list.splice(index, 1);
        }
      }
    });

    return await modal.present();
  }


  async openEditGSModal(item: any) {
    const modal = await this.modalController.create({
      component: ModalGoldShipmentDetailPage,
      componentProps: {
        items: item,
        goldPureList: this.gold_pure_list,
        itemTypeList: this.item_type_list
      },
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        const index = this.gold_shipment_detail_list.findIndex(i => i === item);
        if (index >= 0) {
          this.gold_shipment_detail_list[index] = result.data; // Update the item with edited details
        }

        // this.total_weight = 0;
        // this.total_XAU = 0;
        //
        // //foreach calculate total weight and total xau
        // this.gold_shipment_detail_list.forEach((item: any) => {
        //   this.total_weight = Big(this.total_weight).plus(item.weight).round(2, 0).toNumber();
        //   this.total_XAU = Big(this.total_XAU).plus(item.XAU).round(3, 0).toNumber();
        // });

      }
    });

    return await modal.present();
  }


  recalculateGoldShipmentDetail() {
    this.gold_shipment_detail_list.forEach(item => {
      if (item.weight){
        item.after_weight = item.after_weight ? item.after_weight : 0;
        item.out_weight = item.out_weight ? item.out_weight : 0;
        item.difference = Big(item.weight).minus(item.out_weight).minus(item.after_weight).round(2, 0).toNumber();
      }else{
        item.difference = 0;
        item.after_weight = 0;
        item.out_weight = 0;
        item.weight = 0;
      }
    });
  }

  // Method to add a new row to PW Item List
  addRowToPWItemList() {
    this.pw_item_list.push({ gold_name: '', item_type_name: '', weight: 0, percentage: 0, XAU: 0, image: []  });
  }

  // Method to add a new row to Customer Item List
  addRowToCustomerItemList() {
    this.customer_item_list.push({ gold_name: '', item_type_name: '', weight: 0, percentage: 0, XAU: 0, image: [] });
  }

  onInputChange(item: any, field: string): void {
    if (item[field] == 0 || item[field] == null || item[field] == '0.00') {
      item[field] = ''; // Set the field to empty
    }
    console.log(item[field]);
    // Initialize clickedFields array if not already present
    if (!item.clickedFields) {
      item.clickedFields = [];
    }
    // Add field to clickedFields if not already there
    if (!item.clickedFields.includes(field)) {
      item.clickedFields.push(field);
    }
  }
}
