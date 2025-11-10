import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalTaskPageRoutingModule } from './modal-task-routing.module';

import { ModalTaskPage } from './modal-task.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalTaskPageRoutingModule,
    SharedModule
  ],
  declarations: [ModalTaskPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalTaskPageModule {}