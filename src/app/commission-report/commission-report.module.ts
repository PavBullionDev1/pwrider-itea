import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CommissionReportPageRoutingModule } from './commission-report-routing.module';

import { CommissionReportPage } from './commission-report.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CommissionReportPageRoutingModule,
    SharedModule],
  declarations: [CommissionReportPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CommissionReportPageModule {}
