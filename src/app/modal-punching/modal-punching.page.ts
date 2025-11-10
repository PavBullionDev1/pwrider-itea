import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-punching',
  templateUrl: './modal-punching.page.html',
  styleUrls: ['./modal-punching.page.scss'],
})
export class ModalPunchingPage implements OnInit {

  @Input("modalData") modalData;

  constructor(
    private modalController:ModalController
  ) { }

  ngOnInit() {
    console.log('owo modalData',this.modalData);
  }

  dismiss(id : any = 0) {
		this.modalController.dismiss(id);
	}
}
