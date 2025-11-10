import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QcPageRoutingModule } from './qc-routing.module';

import { QcPage } from './qc.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QcPageRoutingModule,
    SharedModule],
  declarations: [QcPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class QcPageModule {}
