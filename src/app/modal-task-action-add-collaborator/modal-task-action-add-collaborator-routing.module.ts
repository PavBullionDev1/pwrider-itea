import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModalTaskActionAddCollaboratorPage } from './modal-task-action-add-collaborator.page';

const routes: Routes = [
  {
    path: '',
    component: ModalTaskActionAddCollaboratorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalTaskActionAddCollaboratorRoutingModule {}
