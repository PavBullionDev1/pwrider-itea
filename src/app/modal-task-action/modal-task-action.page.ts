import { Location } from "@angular/common";
import { HttpClient, HttpRequest } from "@angular/common/http";
import { Component, OnInit, ViewChild, Input, ElementRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
	AlertController,
	LoadingController,
	ActionSheetController,
	Platform,
} from "@ionic/angular";
import { AppComponent } from "../app.component";
import { Httprequest } from "../models/httprequest";
import { NativeAdapterService } from "../services/native-adapter.service";
import { ModalController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-modal-task-action',
  templateUrl: './modal-task-action.page.html',
  styleUrls: ['./modal-task-action.page.scss'],
  providers: [NativeAdapterService]
})
export class ModalTaskActionPage implements OnInit {
  @Input() selectedTasks: any[];
  @Input() userList: any[];
  @Input() api_url: string;
  taskItemAction: string = '';
  selectedTaskItemDate: string = new Date().toISOString().split('T')[0]; // Initialize with date only
  is_show: boolean = false;
  taskItemTransferTo: string = '';

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
    // private App: AppComponent,
  ) {

  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  performAction(action: string) {
    console.log(`${action} on tasks:`, this.selectedTasks);
    this.modalCtrl.dismiss();
  }
  updateTaskJobDate(event: any) {
    // this.selectedTaskItemDate = new Date(event.detail.value).toISOString().split('T')[0]; // Format date only
    console.log('Updated Task Job Date:', this.selectedTaskItemDate);
  }

  submit() {
    const payload = {
      action: this.taskItemAction,
      transferTo: this.taskItemTransferTo,
      date: this.selectedTaskItemDate,
      tasks: this.selectedTasks
    };
    this.http.post(this.api_url + "/submitAction/" + localStorage['token'] , payload, { observe: "body" })
      .subscribe((data: any) => {
          console.log('API response:', data);
        },
        (error) => {
          console.log(error);
        });
    this.dismiss();
  }

  ngOnInit(): void {
  }

}
