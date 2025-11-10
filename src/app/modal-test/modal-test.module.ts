import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalTestPageRoutingModule } from './modal-test-routing.module';

import { ModalTestPage } from './modal-test.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalTestPageRoutingModule,
    SharedModule
  ],
  declarations: [ModalTestPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalTestPageModule {}
