import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { GoldShipmentListPageRoutingModule } from './gold-shipment-list-routing.module';
import { GoldShipmentListPage } from './gold-shipment-list.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GoldShipmentListPageRoutingModule,
    SharedModule],
  declarations: [GoldShipmentListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GoldShipmentListPageModule {}
