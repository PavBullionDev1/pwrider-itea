import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalAddChangeRequestPageRoutingModule } from './modal-add-change-request-routing.module';

import { ModalAddChangeRequestPage } from './modal-add-change-request.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalAddChangeRequestPageRoutingModule,
    SharedModule
  ],
  declarations: [ModalAddChangeRequestPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalAddChangeRequestPageModule {}
