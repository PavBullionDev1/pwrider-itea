import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute,Router } from '@angular/router';
import { AlertController, IonRouterOutlet, LoadingController, MenuController, ModalController, NavController } from '@ionic/angular';
import { AppComponent } from '../app.component';
import { Httprequest } from '../models/httprequest';
import SignaturePad from 'signature_pad';
import { ChatService } from '../services/chat.service';

@Component({
	selector: 'app-modal-signature',
	templateUrl: './modal-signature.page.html',
	styleUrls: ['./modal-signature.page.scss'],
	providers: [AppComponent, IonRouterOutlet],
})
export class ModalSignaturePage implements OnInit {

	@ViewChild('canvas', { static: true }) signaturePadElement;

	// 這個簽名是屬於哪一種agreement
	@Input() type: any;
	//for move in flow use
	@Input() salesorder_id: any;
	@Input() salesorder_detail_id: any;

	@Input() signature_data: any;


	signaturePad: any;
	canvasWidth: number;
	canvasHeight: number;

	constructor(
		public modalController: ModalController,
		private router: Router,
		public menuCtrl: MenuController,
		public httpClient: HttpClient,
		public alertController: AlertController,
		public loadingController: LoadingController,
		public App: AppComponent,
		private navCtrl: NavController,
		private route:ActivatedRoute,
		private elementRef: ElementRef
	) { }

	ngOnInit() {
	}

	ionViewWillEnter(){
		const canvas: any = this.elementRef.nativeElement.querySelector('canvas');
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight - 300;
		if (this.signaturePad) {
			this.signaturePad.clear(); // Clear the pad on init
		}
	}

	ionViewDidEnter(): void {
		this.signaturePad = new SignaturePad(this.signaturePadElement.nativeElement);
		this.signaturePad.clear();
		this.signaturePad.penColor = 'rgb(56,128,255)';
	}

	isCanvasBlank(): boolean {
		let result = false;
		if (this.signaturePad) {
			result = this.signaturePad.isEmpty() ? true : false;
		}
		return result;
	}

	clear() {
		this.signaturePad.clear();
	}

	dismiss(id : any = 0) {
		this.modalController.dismiss(id);
	}

	submit(){

		this.alertController.create({
			header:'Confirm Update',
			message: 'Are you sure to submit?',
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel',
					handler: () => {
						return false;
					}
				},
				{
					text: 'Yes',
					role: 'confirm',
					handler: () => {
						this.App.presentLoading();
						this.dismiss(this.signaturePad.toDataURL())
					}
				},
			]
		}).then(confirm => confirm.present());

	}
}
