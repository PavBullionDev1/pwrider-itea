import { HttpClient } from "@angular/common/http";
import { Component, OnInit, Input } from "@angular/core";
import { ModalController, AlertController } from "@ionic/angular";
import { Router } from '@angular/router';
import { ActionSheetController, Platform } from "@ionic/angular";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-modal-task-action-scheduled',
  templateUrl: './modal-task-action-scheduled.page.html',
  styleUrls: ['./modal-task-action-scheduled.page.scss']
})
export class ModalTaskActionScheduledPage implements OnInit {
  @Input() userList: any[];
  @Input() job_type: string = '4';
  @Input() job_date: string;
  @Input() is_start: any = 0;
  @Input() task_id: number = 0;
  @Input() api_url: string;
  @Input() title: string;
  @Input() logistic_type: any = '';
  @Input() remark_pic: any[] = [];
  chosenTaskList: any[] = [];
  selectedTasks: any[] = [];
  selectedTaskData: any = {}; // For single task object data
  taskItemAction: string = '';
  selectedTaskItemDate: string = new Date().toISOString().split('T')[0];
  isLoading: boolean = false;
  is_show: boolean = false;
  taskItemTransferTo: string = '';
  remark: string = '';
  photo: string | null = null;
  taskData: any = {
    address1: '',
    address2: '',
    postcode: '',
    city: '',
    state: ''
  };

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    slidesPerView: 3,
  };

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private platform: Platform,
    private alertController: AlertController
  ) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  loadTaskData() {
    if (this.task_id) {
      const tobeSubmit = {
        job_type: this.job_type,
        task_id: this.task_id,
        logistic_type: this.logistic_type,
      };

      this.http.post(this.api_url + "/getTaskData/" + localStorage['token'], tobeSubmit, { observe: "body" })
        .subscribe((data: any) => {
            // Handle both array and object responses
            if (Array.isArray(data.result['data'])) {
              this.selectedTasks = data.result['data'];
            } else {
              this.selectedTaskData = data.result['data'];
              this.selectedTasks = data.result['data'] ? [data.result['data']] : [];
            }
            this.taskData = data.result['task'];
            console.log('API response:', this.selectedTasks, this.selectedTaskData);
          },
          (error) => {
            console.log(error);
          });
    }
  }

  async openActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      buttons: [{
        text: 'Camera',
        icon: 'camera',
        handler: () => {
          this.takePhoto('camera');
        }
      }, {
        text: 'Upload From Gallery',
        icon: 'images',
        handler: () => {
          this.takePhoto('gallery');
        }
      }, {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  async takePhoto(sourceType: 'camera' | 'gallery') {
    try {
      // iOS 权限检查和延迟
      if (this.platform.is('ios')) {
        const permissionStatus = await Camera.checkPermissions();
        if (permissionStatus.camera !== 'granted') {
          const requestResult = await Camera.requestPermissions();
          if (requestResult.camera !== 'granted') {
            await this.presentErrorAlert('权限被拒绝', '需要相机权限才能拍照');
            return;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      this.isLoading = true;
      
      const cameraSource = sourceType === 'camera' ? CameraSource.Camera : CameraSource.Photos;
      const options = {
        quality: 80,
        resultType: CameraResultType.Base64,
        source: cameraSource,
        width: 640,
        allowEditing: false,
        correctOrientation: true,
        saveToGallery: true
      };

      console.log('Opening camera with options:', options);
      const capturedPhoto = await Camera.getPhoto(options);
      console.log('Photo captured successfully, starting upload...');
      
      if (capturedPhoto.base64String) {
        this.api_upload_image_tng(capturedPhoto.base64String);
      } else {
        this.isLoading = false;
        await this.presentErrorAlert('Error', 'Failed to capture photo');
      }
    } catch (err) {
      console.error('Camera issue:', err);
      this.isLoading = false;
      await this.presentErrorAlert('Error', 'Failed to capture photo: ' + (err.message || err));
    }
  }

  chosenTask(taskList: any) {
    this.chosenTaskList = [];
    //foreach taskList
    taskList.forEach((task) => {
      if(task.selected) {
        this.chosenTaskList.push(task);
      }
    });
    console.log('Choosen: ',this.chosenTaskList);
  }


  async api_upload_image_tng(imgInfo: string) {
    try {
      console.log('Starting image upload...');
      const position = await this.getCurrentPosition();
      const tobeSubmit = {
        'account_id': localStorage['login_user_id'],
        'token': localStorage['token'],
        'imgInfo': imgInfo,
        'need_watermark': 1,
        ...(position && { location: position })
      };
      this.one_image_upload_tng(tobeSubmit);
    } catch (error) {
      console.warn('Error getting location, uploading without location:', error);
      const tobeSubmit = {
        'account_id': localStorage['login_user_id'],
        'token': localStorage['token'],
        'imgInfo': imgInfo,
        'need_watermark': 1
      };
      this.one_image_upload_tng(tobeSubmit);
    }
  }

  one_image_upload_tng(tobeSubmit: any) {
    console.log('Uploading image to server...');
    this.http.post(this.api_url + "/uploadImage", tobeSubmit, { observe: "body" }).subscribe(
      (data) => {
        this.isLoading = false;
        console.log('Upload response:', data);
        if (data['status'] == "OK") {
          this.photo = data['result']['img_path'];
          console.log('Image uploaded successfully');
        } else {
          console.error('Upload failed:', data);
          this.presentErrorAlert('Error', 'Failed to upload image');
        }
      }, 
      (error) => {
        this.isLoading = false;
        console.error('Connection Error:', error);
        this.presentErrorAlert('Error', 'Connection error during upload');
      }
    );
  }

  deletePhoto() {
    this.photo = null;
  }

  submit() {
    if (this.task_id) {
      const payload = {
        action: this.taskItemAction,
        job_type: this.job_type,
        transferTo: this.taskItemTransferTo,
        date: this.selectedTaskItemDate,
        task_id: this.task_id,
        title: this.title,
        remark: this.remark,
        chosenTaskList: this.chosenTaskList,
        photo: this.photo // Include photo in payload
      };
      this.http.post(this.api_url + "/submitActionTask/" + localStorage['token'], payload, { observe: "body" })
        .subscribe((data: any) => {
            console.log('API response:', data);
            console.log('taskItemAction', this.taskItemAction);
            console.log('this.logistic_type',this.logistic_type);
            console.log('this.job_type',this.job_type);
            if(this.logistic_type == 'PickUp'){
              this.logistic_type = 0;
            }else if (this.logistic_type == 'Delivery'){
              this.logistic_type = 1;
            }
            this.dismiss();
            if (this.taskItemAction == '0' && this.job_type == '3') {
              this.router.navigate(['grn-by-task', this.task_id]);
            } else if (this.taskItemAction == '0' && this.job_type == '2') {
              this.router.navigate(['task-detail', this.task_id]);
            } else if (this.taskItemAction == '0' && this.job_type == '0' && this.logistic_type == 0) {
              this.router.navigate(['pickup-detail-task', this.task_id]);
            } else if (this.taskItemAction == '0' && this.job_type == '0' && this.logistic_type == 1) {
              this.router.navigate(['delivery-detail-task', this.task_id]);
            }
          },
          (error) => {
            this.dismiss();
            console.log(error);
          });
    } else if (this.task_id == 0) {
      const payload = {
        job_date: this.job_date,
        title: this.title,
        photo: this.photo // Include photo in payload
      };
      console.log(payload);
      this.http.post(this.api_url + "/submitCustomizeTask/" + localStorage['token'], payload, { observe: "body" })
        .subscribe((data: any) => {
            console.log('API response:', data);
            this.dismiss();
          },
          (error) => {
            this.dismiss();
            console.log(error);
          });
    }
  }

  private async presentErrorAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  private async getCurrentPosition(): Promise<{latitude: number, longitude: number} | null> {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        const timeoutId = setTimeout(() => {
          console.log('Geolocation timeout, continuing without location');
          resolve(null);
        }, 5000);
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            clearTimeout(timeoutId);
            console.log('Geolocation error, continuing without location:', error);
            resolve(null);
          },
          { timeout: 5000, enableHighAccuracy: false }
        );
      } else {
        resolve(null);
      }
    });
  }

  ngOnInit(): void {
    this.loadTaskData();
  }
}
