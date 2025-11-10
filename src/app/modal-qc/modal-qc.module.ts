import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalQcPageRoutingModule } from './modal-qc-routing.module';

import { ModalQcPage } from './modal-qc.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalQcPageRoutingModule,
    SharedModule
  ],
  declarations: [ModalQcPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalQcPageModule {}
