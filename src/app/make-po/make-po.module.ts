import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { MakePoPageRoutingModule } from './make-po-routing.module';
import { MakePoPage } from './make-po.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MakePoPageRoutingModule,
    SharedModule],
  declarations: [MakePoPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MakePoPageModule {}
