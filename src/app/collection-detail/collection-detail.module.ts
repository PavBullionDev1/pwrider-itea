import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { CollectionDetailPageRoutingModule } from './collection-detail-routing.module';
import { CollectionDetailPage } from './collection-detail.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CollectionDetailPageRoutingModule,
    SharedModule],
  declarations: [CollectionDetailPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CollectionDetailPageModule {}
