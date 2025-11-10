import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { PickupDetailPageRoutingModule } from './pickup-detail-routing.module';
import { PickupDetailPage } from './pickup-detail.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickupDetailPageRoutingModule,
    SharedModule],
  declarations: [PickupDetailPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PickupDetailPageModule {}
