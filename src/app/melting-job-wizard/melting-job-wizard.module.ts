import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MeltingJobWizardPageRoutingModule } from './melting-job-wizard-routing.module';
import { MeltingJobWizardPage } from './melting-job-wizard.page';
// Import the Modal Module
import { ModalExchangeItemsPageModule } from '../modal-exchange-items/modal-exchange-items.module';
import { ModalGoldShipmentDetailPageModule } from '../modal-gold-shipment-detail/modal-gold-shipment-detail.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeltingJobWizardPageRoutingModule,
    ModalExchangeItemsPageModule,
    ModalGoldShipmentDetailPageModule,
    SharedModule
  ],
  declarations: [MeltingJobWizardPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MeltingJobWizardPageModule {}
