import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { PickupPageRoutingModule } from './pickup-routing.module';
import { PickupPage } from './pickup.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PickupPageRoutingModule,
    SharedModule],
  declarations: [PickupPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PickupPageModule {}
