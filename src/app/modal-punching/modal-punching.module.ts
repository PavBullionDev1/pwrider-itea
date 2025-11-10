import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalPunchingPageRoutingModule } from './modal-punching-routing.module';

import { ModalPunchingPage } from './modal-punching.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalPunchingPageRoutingModule,
    SharedModule
  ],
  declarations: [ModalPunchingPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalPunchingPageModule {}
