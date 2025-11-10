import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalGrnPageRoutingModule } from './modal-grn-routing.module';

import { ModalGrnPage } from './modal-grn.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalGrnPageRoutingModule,
    SharedModule],
  declarations: [ModalGrnPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalGrnPageModule {}