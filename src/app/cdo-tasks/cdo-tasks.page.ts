import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, AlertController, ActionSheetController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-cdo-tasks',
  templateUrl: './cdo-tasks.page.html',
  styleUrls: ['./cdo-tasks.page.scss'],
})
export class CdoTasksPage implements OnInit {

  cdoList: any[] = [];
  filteredCdoList: any[] = [];
  searchTerm: string = '';
  selectedSegment: string = 'all';
  isLoading: boolean = false;
  hasMore: boolean = true;
  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalPages: number = 1;
  totalItems: number = 0;
  riderId: string = localStorage.getItem('user_id') || '';
  token: string = localStorage.getItem('token') || '';
  
  // Statistics
  statistics: any = {
    total: 0,
    pending: 0,
    taken: 0,
    on_the_way: 0,
    picked_up: 0,
    cancelled: 0
  };

  constructor(
    private navCtrl: NavController,
    private http: HttpClient,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private actionSheetCtrl: ActionSheetController,
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
    
    const url = this.configService.appConfig.api_url + '/Customer_delivery_order_manage/getRiderCDOList';
    const params: any = {
      token: this.token,
      page: this.currentPage,
      limit: this.itemsPerPage
    };
    
    if (this.searchTerm) {
      params.search = this.searchTerm;
    }
    
    // Apply status filter based on selected segment
    if (this.selectedSegment !== 'all') {
      params.status_filter = this.getStatusFromSegment(this.selectedSegment);
    }
    
    try {
      const response: any = await this.http.post(url, params).toPromise();
      
      if (response.success) {
        const data = response.data;
        
        if (isLoadMore) {
          this.cdoList = [...this.cdoList, ...data.cdo_list];
        } else {
          this.cdoList = data.cdo_list;
          this.statistics = data.statistics;
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
  
  getStatusFromSegment(segment: string): number {
    switch (segment) {
      case 'pending': return 0;
      case 'taken': return 1;
      case 'onTheWay': return 2;
      case 'pickedUp': return 3;
      case 'cancelled': return 4;
      default: return 0;
    }
  }

  segmentChanged() {
    // Reload data with new status filter
    this.loadCdoList();
  }

  filterList() {
    // When search term changes, reload from server
    this.loadCdoList();
  }

  getStatusIcon(status: number): string {
    switch (status) {
      case 0: return 'time-outline';
      case 1: return 'hand-right-outline';
      case 2: return 'car-outline';
      case 3: return 'checkmark-circle-outline';
      case 4: return 'close-circle-outline';
      default: return 'help-outline';
    }
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Taken';
      case 2: return 'On The Way';
      case 3: return 'Picked Up';
      case 4: return 'Cancelled';
      default: return 'Unknown';
    }
  }
  
  getStatusColor(status: number): string {
    switch (status) {
      case 0: return 'warning';
      case 1: return 'primary';
      case 2: return 'secondary';
      case 3: return 'success';
      case 4: return 'danger';
      default: return 'medium';
    }
  }

  async viewTaskDetail(cdo: any) {
    // Navigate to task detail page
    // this.navCtrl.navigateForward(`/cdo-task-detail/${cdo.cdo_id}`);
    
    // For now, show an alert
    const alert = await this.alertCtrl.create({
      header: `CDO #${cdo.serial_no}`,
      message: `
        Customer: ${cdo.customer_name}
        Address: ${cdo.delivery_address}
        Total: ${cdo.total_xau} XAU
        Status: ${cdo.status_text}
      `,
      buttons: ['OK']
    });
    await alert.present();
  }

  async updateStatus(task: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Update Status',
      buttons: [
        {
          text: 'Start Delivery',
          icon: 'car',
          handler: () => {
            this.changeTaskStatus(task, 1);
          }
        },
        {
          text: 'Mark as Completed',
          icon: 'checkmark-circle',
          handler: () => {
            this.changeTaskStatus(task, 2);
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async changeTaskStatus(task: any, newStatus: number) {
    const loading = await this.loadingCtrl.create({
      message: 'Updating status...'
    });
    await loading.present();

    // Simulate API call
    setTimeout(async () => {
      task.status = newStatus;
      this.segmentChanged();
      await loading.dismiss();
      
      const alert = await this.alertCtrl.create({
        header: 'Success',
        message: 'Task status updated successfully!',
        buttons: ['OK']
      });
      await alert.present();
    }, 1500);
  }

  async callCustomer(task: any) {
    if (task.tel) {
      window.location.href = `tel:${task.tel}`;
    } else {
      const alert = await this.alertCtrl.create({
        header: 'No Phone Number',
        message: 'Phone number not available for this customer.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async viewLocation(task: any) {
    // Open in maps app
    const address = `${task.delivery_address1}, ${task.delivery_city}, ${task.delivery_state}`;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_system');
  }

  async scanQRCode() {
    // Implement QR code scanning
    const alert = await this.alertCtrl.create({
      header: 'QR Scanner',
      message: 'QR code scanning functionality will be implemented here.',
      buttons: ['OK']
    });
    await alert.present();
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