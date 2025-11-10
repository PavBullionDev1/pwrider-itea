import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalTaskActionOtwRoutingModule } from './modal-task-action-otw-routing.module';
import { ModalTaskActionOtwPage } from './modal-task-action-otw.page';
import { SharedModule } from '../shared/shared.module';
import { NativeAdapterService } from '../services/native-adapter.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalTaskActionOtwRoutingModule,
    SharedModule
  ],
  declarations: [ModalTaskActionOtwPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalTaskActionOtwModule {}
