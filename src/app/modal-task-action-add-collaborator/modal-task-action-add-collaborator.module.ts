import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ModalTaskActionAddCollaboratorRoutingModule } from './modal-task-action-add-collaborator-routing.module';
import { ModalTaskActionAddCollaboratorPage } from './modal-task-action-add-collaborator.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalTaskActionAddCollaboratorRoutingModule,
    SharedModule
  ],
  declarations: [ModalTaskActionAddCollaboratorPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalTaskActionAddCollaboratorModule {}
