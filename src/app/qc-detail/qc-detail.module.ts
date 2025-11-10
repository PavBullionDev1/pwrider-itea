import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QcDetailPageRoutingModule } from './qc-detail-routing.module';

import { QcDetailPage } from './qc-detail.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QcDetailPageRoutingModule,
    SharedModule],
  declarations: [QcDetailPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class QcDetailPageModule {}