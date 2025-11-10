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
import { ModalController, NavController } from '@ionic/angular';
import { Big } from 'big.js';

@Component({
  selector: 'app-modal-claim-cart',
  templateUrl: './modal-claim-cart.page.html',
  styleUrls: ['./modal-claim-cart.page.scss'],
  providers: []
})
export class ModalClaimCartPage implements OnInit {

	@Input("modalData") modalData;

	isLoading = false;
	confirm = false;
	job_date = '';
  apply_job_date: string = new Date().toISOString().split('T')[0]; // Initialize with date only
	deleted_task_ids:any = [];
	is_show = [];
  is_apply: boolean = false;

	constructor(
		public alertController: AlertController,
		public httpClient: HttpClient,
		public modalController: ModalController,
		public actionSheetController: ActionSheetController,
		public loadingController: LoadingController,
	) { }

	ngOnInit() {
		console.log('owo modalData',this.modalData);

		this.modalData.forEach((task, key) => {
			this.udpateTaskJobDate(task.task_id,0);
		})
	}

  	dismiss(data : any = { deleted_ids:this.deleted_task_ids, confirm:this.confirm, cartList:this.modalData}) {
		this.modalController.dismiss(data);
	}

	udpateTaskJobDate(task_id,mode) {
		var dateObj = new Date();
		if(mode !== 0){
			dateObj = new Date(this.job_date);
		}

		const year = dateObj.getFullYear();
		const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
		const day = String(dateObj.getDate()).padStart(2, '0');

		const formattedDate = `${year}-${month}-${day}`;

		this.modalData.forEach((task, key) => {
			if(task.task_id == task_id){
				this.modalData[key].job_date = formattedDate;
			}
		})
	}

	removeTask(task_id) {
		this.deleted_task_ids.push(task_id);

		this.modalData.forEach((task, key) => {
			if(task.task_id == task_id){
				this.modalData.splice(key, 1);
			}
		})
	}

  apply(){
    this.modalData.forEach((task, key) => {
      this.modalData[key].job_date = this.apply_job_date;
    });
  }
}
