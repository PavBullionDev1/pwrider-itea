import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CollectionOrderPageRoutingModule } from './collection-order-routing.module';

import { CollectionOrderPage } from './collection-order.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CollectionOrderPageRoutingModule,
    SharedModule],
  declarations: [CollectionOrderPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CollectionOrderPageModule {}
