import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalTaskActionScheduledRoutingModule } from './modal-task-action-scheduled-routing.module';
import { ModalTaskActionScheduledPage } from './modal-task-action-scheduled.page';
import { SharedModule } from '../shared/shared.module';
import { NativeAdapterService } from '../services/native-adapter.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalTaskActionScheduledRoutingModule,
    SharedModule
  ],
  declarations: [ModalTaskActionScheduledPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalTaskActionScheduledPageModule {}
