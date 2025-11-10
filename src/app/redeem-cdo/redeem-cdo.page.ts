import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-redeem-cdo',
  templateUrl: './redeem-cdo.page.html',
  styleUrls: ['./redeem-cdo.page.scss'],
})
export class RedeemCdoPage implements OnInit {

  cdoList: any[] = [];
  filteredCdoList: any[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  hasMore: boolean = true;
  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalPages: number = 1;
  totalItems: number = 0;
  riderId: string = localStorage.getItem('user_id') || '';
  token: string = localStorage.getItem('token') || '';
  
  // State group filter
  stateGroups: any[] = [];
  selectedStateGroupId: string = '';

  constructor(
    private navCtrl: NavController,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private configService: ConfigService
  ) { }

  ngOnInit() {
    this.loadCdoList();
  }

  async loadCdoList(isLoadMore = false) {
    if (!isLoadMore) {
      this.isLoading = true;
      this.currentPage = 1;
    }
    
    const url = this.configService.appConfig.api_url + '/Customer_delivery_order_manage/getRiderRedeemableCDOList';
    const params: any = {
      token: this.token,
      page: this.currentPage,
      limit: this.itemsPerPage
    };
    
    if (this.searchTerm) {
      params.search = this.searchTerm;
    }
    
    if (this.selectedStateGroupId) {
      params.state_group_id = this.selectedStateGroupId;
    }
    
    try {
      const response: any = await this.http.post(url, params).toPromise();
      
      if (response.success) {
        const data = response.data;
        
        if (isLoadMore) {
          this.cdoList = [...this.cdoList, ...data.cdo_list];
        } else {
          this.cdoList = data.cdo_list;
          this.stateGroups = data.state_groups || [];
        }
        
        // Update pagination info
        this.totalPages = data.pagination.total_pages;
        this.totalItems = data.pagination.total_items;
        this.hasMore = this.currentPage < this.totalPages;
        
        this.filteredCdoList = [...this.cdoList];
      } else {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: response.message || 'Failed to load CDO list',
          buttons: ['OK']
        });
        await alert.present();
      }
    } catch (error) {
      console.error('Error loading CDO list:', error);
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Failed to connect to server',
        buttons: ['OK']
      });
      await alert.present();
    } finally {
      this.isLoading = false;
    }
  }

  filterList() {
    // When search term changes, reload from server
    this.loadCdoList();
  }
  
  onStateGroupChange() {
    // When state group filter changes, reload from server
    this.loadCdoList();
  }

  async selectCdo(cdo: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Redemption',
      message: `Do you want to redeem CDO #${cdo.serial_no}?<br><br>Customer: ${cdo.customer_name}<br>Address: ${cdo.delivery_address}<br>Total: ${cdo.total_xau} XAU`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Redeem',
          handler: () => {
            this.redeemCdo(cdo);
          }
        }
      ]
    });

    await alert.present();
  }

  async redeemCdo(cdo: any) {
    const loading = await this.loadingCtrl.create({
      message: 'Redeeming CDO...'
    });
    await loading.present();

    const url = this.configService.appConfig.api_url + '/Customer_delivery_order_manage/redeemCDO';
    const params = {
      token: this.token,
      cdo_id: cdo.cdo_id
    };

    try {
      const response: any = await this.http.post(url, params).toPromise();
      await loading.dismiss();
      
      if (response.success) {
        const alert = await this.alertCtrl.create({
          header: 'Success',
          message: response.message || `CDO #${cdo.serial_no} has been redeemed successfully!`,
          buttons: [{
            text: 'OK',
            handler: () => {
              // Remove from list and refresh
              this.cdoList = this.cdoList.filter(item => item.cdo_id !== cdo.cdo_id);
              // Optionally refresh the list to get updated data
              this.loadCdoList();
            }
          }]
        });
        
        await alert.present();
      } else {
        const alert = await this.alertCtrl.create({
          header: 'Error',
          message: response.message || 'Failed to redeem CDO',
          buttons: ['OK']
        });
        await alert.present();
      }
    } catch (error) {
      await loading.dismiss();
      console.error('Error redeeming CDO:', error);
      
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: 'Failed to connect to server. Please try again.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async doRefresh(event: any) {
    await this.loadCdoList();
    event.target.complete();
  }

  async loadMore(event: any) {
    if (this.hasMore) {
      this.currentPage++;
      await this.loadCdoList(true);
    }
    event.target.complete();
  }
}