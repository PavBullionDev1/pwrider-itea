import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ExchangeNotePageRoutingModule } from './exchange-note-routing.module';
import { ExchangeNotePage } from './exchange-note.page';
// Import the Modal Module
import { ModalExchangeItemsPageModule } from '../modal-exchange-items/modal-exchange-items.module';
import { ModalGoldShipmentDetailPageModule } from '../modal-gold-shipment-detail/modal-gold-shipment-detail.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExchangeNotePageRoutingModule,
    ModalExchangeItemsPageModule,
    ModalGoldShipmentDetailPageModule,
    SharedModule
  ],
  declarations: [ExchangeNotePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ExchangeNotePageModule {}
