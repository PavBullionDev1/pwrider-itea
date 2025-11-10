import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AssayReportClockInPageRoutingModule } from './assay-report-clock-in-routing.module';
import { AssayReportClockInPage } from './assay-report-clock-in.page';
// Import the Modal Module
import { ModalTaskActionOtwModule } from '../modal-task-action-otw/modal-task-action-otw.module';
import { ModalTaskActionScheduledPageModule } from '../modal-task-action-scheduled/modal-task-action-scheduled.module';
import { ModalTaskActionAddCollaboratorModule } from '../modal-task-action-add-collaborator/modal-task-action-add-collaborator.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssayReportClockInPageRoutingModule,
    ModalTaskActionOtwModule,
    ModalTaskActionScheduledPageModule,
    ModalTaskActionAddCollaboratorModule,
    SharedModule
  ],
  declarations: [AssayReportClockInPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AssayReportClockInPageModule {}
