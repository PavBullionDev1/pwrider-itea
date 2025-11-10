import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModalTaskActionOtwPage } from './modal-task-action-otw.page';

const routes: Routes = [
  {
    path: '',
    component: ModalTaskActionOtwPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalTaskActionOtwRoutingModule {}
