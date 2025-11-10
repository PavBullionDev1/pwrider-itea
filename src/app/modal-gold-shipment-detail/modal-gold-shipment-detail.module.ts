import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalGoldShipmentDetailPage } from './modal-gold-shipment-detail.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [ModalGoldShipmentDetailPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalGoldShipmentDetailPageModule {}
