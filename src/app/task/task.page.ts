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

@Component({
  selector: 'app-task',
  templateUrl: './task.page.html',
  styleUrls: ['./task.page.scss'],
  providers: [],
})
export class TaskPage implements OnInit {

  TaskList: any[] = [];
  userList: any[] = [];

  constructor(		
    public alertController: AlertController,
		private router: Router,
		public HttpClient: HttpClient,
		public App: AppComponent,
		private route: ActivatedRoute,
		public loadingController: LoadingController,
		public menuCtrl: MenuController,
		public location: Location,
    ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
		this.getTaskList();

	}

  getTaskList() {
    // this.App.presentLoading();
		var gType='L';
		this.HttpClient
			.get(
				this.App.api_url + "/appGetTaskList/" + gType  + "/" + localStorage['token']
			)
			.subscribe(
				(data: any) => {
					//   this.loadingController.dismiss();
          console.log(data.result);
					this.TaskList = data.result['TaskList'];
          //this.userList = data.result['userList'];
					//console.log("DATA",this.TaskList);

				},
				(error) => {
					//   this.loadingController.dismiss();

					console.log(error);
				}
			);
	}

	doRefresh(event: any) {
		 console.log('Begin async operation');
		this.getTaskList();

		event.target.complete();

	}

}
