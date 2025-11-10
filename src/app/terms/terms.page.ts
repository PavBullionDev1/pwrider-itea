import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.page.html',
  styleUrls: ['./terms.page.scss'],
})
export class TermsPage implements OnInit {

  constructor(public modalController: ModalController) { }

  ngOnInit() {
  }

  dismissModal(event?: any){
    console.log("dismissModaal!!");
    this.modalController.dismiss({
      'dismissed': true
    });
  }

}
