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
} from "@ionic/angular";
import { AppComponent } from "../app.component";
import { Httprequest } from "../models/httprequest";
import { ModalController, NavController } from '@ionic/angular';
import { ModalTaskActionPage } from '../modal-task-action/modal-task-action.page';
import { ModalTaskActionScheduledPage } from '../modal-task-action-scheduled/modal-task-action-scheduled.page';
import { ModalTaskActionOtwPage } from '../modal-task-action-otw/modal-task-action-otw.page';
import { ModalClaimCartPage } from '../modal-claim-cart/modal-claim-cart.page';
import {
  ModalTaskActionAddCollaboratorPage
} from "../modal-task-action-add-collaborator/modal-task-action-add-collaborator.page";

@Component({
  selector: 'app-task',
  templateUrl: './personal-dashboard.page.html',
  styleUrls: ['./personal-dashboard.page.scss'],
  providers: [],
})
export class PersonalDashboardPage implements OnInit {

  TaskList: any;
  scheduledTaskList: any;
  completedTaskList: any;
  pending_count: 0;
  scheduled_count: 0;
  collaborator: any[] = [];
  collaborator_ids: any[] = [];
  remark_pic: any = [];
  main_rider: any;
  is_show: boolean = false;
  filterDate: string = new Date().toISOString().split('T')[0]; // Initialize with date only
  todayDate: string = new Date().toISOString().split('T')[0]; // Initialize with date only
  related_items: any[] = [];
  job_type: any = '4';
  selected_task_id: any;
  is_start: any = 0;
  userList: any[] = [];
  pre_load_cart: any = 0;
  selectedTasks: any[] = [];
  title: any;
  logistic_type: any;

  statusList = {
    0: 'Pending',
    1: 'Done',
    2: 'Ignore',
    3: 'Taken',
    4: 'On The Way',
    5: 'Booked'
  };

  constructor(
    public alertController: AlertController,
    public HttpClient: HttpClient,
    public App: AppComponent,
    public loadingController: LoadingController,
    public menuCtrl: MenuController,
    public modalController: ModalController,
    public location: Location,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.getTaskListData();
    this.getScheduledTaskListData();
    this.getUserList();
    this.selectedTasks = [];
  }

  getTaskListData() {
    const filter = {
      date: new Date().toString(),
    };
    const tobeSubmit: any = {
      filter: filter,
      start_date: this.filterDate,
      end_date: this.filterDate,
      is_all: 1
    };

    this.HttpClient.post(this.App.api_url + "/getTaskListDataPendingSchedule/" + localStorage['token'], tobeSubmit, { observe: "body" })
      .subscribe((data: any) => {
          this.TaskList = this.transformData(data.result['data']);
          this.pending_count = data.result['pending_count'];
        },
        (error) => {
          console.log(error);
        });
  }

  getScheduledTaskListData() {
    const filter = {
      date: new Date().toString(),
    };
    const tobeSubmit: any = {
      filter: filter,
      start_date: this.filterDate,
      end_date: this.filterDate,
      is_all: 1
    };

    this.HttpClient.post(this.App.api_url + "/getTaskListDataScheduled/" + localStorage['token'], tobeSubmit, { observe: "body" })
      .subscribe((data: any) => {
          this.scheduledTaskList = data.result['data'];
          this.is_start = data.result['is_start'];
          if(this.scheduledTaskList.length > 0 && this.is_start == 1){
            if(data.result['data'][0]['status'] == 0 && this.filterDate == this.todayDate){
              this.selected_task_id = data.result['data'][0]['task_id'];

              this.openTaskOTWModal();
              console.log(this.selected_task_id);
            }
          }
          this.completedTaskList = data.result['task_schedule_complete_list'];
          this.scheduled_count = data.result['pending_count'];
          this.collaborator = data.result['collaborator'] ? data.result['collaborator'] : [];
          this.collaborator_ids = data.result['collaborator_ids'] ? data.result['collaborator_ids'] : [];
          this.main_rider = data.result['main_rider'] ? data.result['main_rider'] : '';
        },
        (error) => {
          console.log(error);
        });
  }

  getUserList() {
    const tobeSubmit: any = {};

    this.HttpClient.post(this.App.api_url + "/getRiderList/" + localStorage['token'], tobeSubmit, { observe: "body" })
      .subscribe((data: any) => {
          this.userList = Object.values(data.result['data']);
        },
        (error) => {
          console.log(error);
        });
  }

  chunkArray(myArray: any[], chunk_size: number) {
    const results = [];
    while (myArray.length) {
      results.push(myArray.splice(0, chunk_size));
    }
    return results;
  }

  transformData(data: any): any[] {
    return Object.keys(data).map(key => ({
      customer_data: data[key].customer_data,
      task_list: Object.values(data[key].task_list),
      task_list_count: data[key].task_list_count,
    }));
  }

  doRefresh(event) {
    this.getTaskListData();
    this.getScheduledTaskListData();
    this.pre_load_cart = 0;
    event.target.complete();
  }

  updateSelectedTasks(task: any, customer: any) {
    if (task.selected) {
      task.customer_name = customer;
      this.selectedTasks.push(task);
    } else {
      const index = this.selectedTasks.indexOf(task);
      if (index > -1) {
        this.selectedTasks.splice(index, 1);
      }
    }
    console.log('Selected tasks:', this.selectedTasks);
  }

  async openTaskAction() {
    const modal = await this.modalController.create({
      component: ModalTaskActionPage,
      componentProps: {
        selectedTasks: this.selectedTasks,
        userList: this.userList,
        api_url: this.App.api_url,
        app: this.App,
      }
    });

    modal.onDidDismiss().then(() => {
      this.getTaskListData();
      this.getScheduledTaskListData();
      this.selectedTasks = [];
    });

    await modal.present();
  }

  filterTasks() {
    this.getTaskListData();
    this.getScheduledTaskListData();
  }

  doReorder(ev: any) {
    this.scheduledTaskList = ev.detail.complete(this.scheduledTaskList);
    this.updateTaskPriorities();
    // this.saveUpdatedPriorities();
  }

  updateTaskPriorities() {
    this.scheduledTaskList.forEach((task, index) => {
      task.priority = index + 1;
    });
  }

  saveUpdatedPriorities() {
    const payload = {
      tasks: this.scheduledTaskList
    };
    this.HttpClient.post(this.App.api_url + "/updateTaskPriorities/" + localStorage['token'], payload).subscribe(
      async (response) => {
        const alert = await this.alertController.create({
          header: 'Success',
          message: 'Confirm Schedule Tasks successfully!',
          buttons: ['OK'],
        });
        await alert.present();
        console.log('Priorities updated successfully:', response);
      },
      (error) => {
        console.error('Error updating priorities:', error);
      }
    );
  }

  async taskAction(task){
    console.log(task.task_type);
    var job_type = '4';
    if(task.task_type == 'PO'){
      job_type = '3';
    }else if(task.task_type == 'DO'){
      job_type = '2';
    }else if(task.task_type == 'CO'){
      job_type = '4';
    }else if(task.task_type == 'LO'){
      job_type = '0';
    }
    this.job_type = job_type;
    this.selected_task_id = task.task_id;
    this.title = task.task_name ? task.task_name : 'CO';
    this.logistic_type = task.logistic_type ? task.logistic_type : '';
    this.remark_pic = task.remark_pic;
    console.log(task);
    if(task.status != 2){
      this.openTaskActionModal();
    }
  }

  async createCustomizeTask(title){
    this.job_type = '4';
    this.selected_task_id = 0;
    this.title = title;
    this.openTaskActionModal();
  }
  async openTaskActionModal(){
    const modal = await this.modalController.create({
      component: ModalTaskActionScheduledPage,
      componentProps: {
        logistic_type: this.logistic_type,
        userList: this.userList,
        job_type: this.job_type,
        job_date: this.filterDate,
        is_start: this.is_start,
        task_id: this.selected_task_id,
        remark_pic: this.remark_pic,
        title: this.title,
        api_url: this.App.api_url,
        app: this.App,
      }
    });
    console.log(this.job_type);
    modal.onDidDismiss().then(() => {
      this.getTaskListData();
      this.getScheduledTaskListData();
      this.selectedTasks = [];
    });

    await modal.present();
  }


  async openTaskOTWModal(){
    const modal = await this.modalController.create({
      component: ModalTaskActionOtwPage,
      componentProps: {
        task_id: this.selected_task_id,
        api_url: this.App.api_url,
        app: this.App,
      }
    });
    modal.onDidDismiss().then(() => {
      // this.getTaskListData();
      // this.getScheduledTaskListData();
      this.selectedTasks = [];
      this.selected_task_id = 0;
    });

    await modal.present();
  }

  customizeTask(title){
    const payload = {
      title: title
    };
    this.HttpClient.post(this.App.api_url + "/submitCustomizeTask/" + localStorage['token'], payload).subscribe(
      (response) => {
        console.log('Priorities updated successfully:', response);
      },
      (error) => {
        console.error('Error updating priorities:', error);
      }
    );
  }

  async openTaskActionAddCollaboratorModal(){
    // Ensure collaborator_ids is a string before splitting
    const collaboratorIdsString: string = String(this.collaborator_ids);
    const collaboratorIdsArray: number[] = collaboratorIdsString.split(',').map(id => parseInt(id.trim(), 10));

    for (let i = 0; i < this.userList.length; i++) {
      this.userList[i].selected = false; // Reset selected to false for all users initially
      console.log(collaboratorIdsArray);
      // Check if this user's id is in the array of collaborator_ids
      for (let j = 0; j < collaboratorIdsArray.length; j++) {
        if (this.userList[i].user_id == collaboratorIdsArray[j]) {
          this.userList[i].selected = true; // Mark as selected if user_id is found in collaborator_ids
          break;
        }
      }
    }
    console.log(this.userList);
    const modal = await this.modalController.create({
      component: ModalTaskActionAddCollaboratorPage,
      componentProps: {
        userList: this.userList,
        date: this.filterDate,
        main_rider: this.main_rider,
        api_url: this.App.api_url,
        app: this.App,
      }
    });

    modal.onDidDismiss().then(() => {
      this.getTaskListData();
      this.getScheduledTaskListData();
      this.selectedTasks = [];
    });

    await modal.present();
  }

}
