import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { PersonalDashboardPageRoutingModule } from './personal-dashboard-routing.module';
import { PersonalDashboardPage } from './personal-dashboard.page';
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
    PersonalDashboardPageRoutingModule,
    ModalTaskActionOtwModule,
    ModalTaskActionScheduledPageModule,
    ModalTaskActionAddCollaboratorModule,
    SharedModule],
  declarations: [PersonalDashboardPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PersonalDashboardModule {}
