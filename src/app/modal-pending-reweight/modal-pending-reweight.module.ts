import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalPendingReweightPageRoutingModule } from './modal-pending-reweight-routing.module';

import { ModalPendingReweightPage } from './modal-pending-reweight.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalPendingReweightPageRoutingModule,
    SharedModule
  ],
  declarations: [ModalPendingReweightPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalPendingReweightPageModule {}