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
  selector: 'app-modal-task-detail',
  templateUrl: './modal-task-detail.page.html',
  styleUrls: ['./modal-task-detail.page.scss'],
  providers: [NativeAdapterService]
})
export class ModalTaskDetailPage implements OnInit {

	@Input("orderList") orderList;
	@Input("task") task;

	isLoading = false;
	needBook = false;

	constructor(
		public alertController: AlertController,
		public HttpClient: HttpClient,
		private platform: Platform,
		public modalController: ModalController,
		public actionSheetController: ActionSheetController,
		public loadingController: LoadingController,
		public nativeAdapter: NativeAdapterService,
	) { }

	ngOnInit() {
		console.log('owo orderList',this.orderList);
		console.log('owo task',this.task);
	}

  	dismiss(data : any = { needBook:this.needBook, task:this.task}) {
		this.modalController.dismiss(data);
	}

}
