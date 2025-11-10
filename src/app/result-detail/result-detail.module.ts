import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResultDetailPageRoutingModule } from './result-detail-routing.module';

import { ResultDetailPage } from './result-detail.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResultDetailPageRoutingModule,
    SharedModule],
  declarations: [ResultDetailPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ResultDetailPageModule {}
