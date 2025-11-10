import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalTaskDetailPageRoutingModule } from './modal-task-detail-routing.module';

import { ModalTaskDetailPage } from './modal-task-detail.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalTaskDetailPageRoutingModule,
    SharedModule
  ],
  declarations: [ModalTaskDetailPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalTaskDetailPageModule {}
