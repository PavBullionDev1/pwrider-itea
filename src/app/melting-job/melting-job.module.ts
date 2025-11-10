import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MeltingJobPageRoutingModule } from './melting-job-routing.module';
import { MeltingJobPage } from './melting-job.page';
// Import the Modal Module
import { ModalExchangeItemsPageModule } from '../modal-exchange-items/modal-exchange-items.module';
import { ModalGoldShipmentDetailPageModule } from '../modal-gold-shipment-detail/modal-gold-shipment-detail.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeltingJobPageRoutingModule,
    ModalExchangeItemsPageModule,
    ModalGoldShipmentDetailPageModule,
    SharedModule
  ],
  declarations: [MeltingJobPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MeltingJobPageModule {}
