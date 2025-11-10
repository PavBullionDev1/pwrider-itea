import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModalTaskActionScheduledPage } from './modal-task-action-scheduled.page';

const routes: Routes = [
  {
    path: '',
    component: ModalTaskActionScheduledPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModalTaskActionScheduledRoutingModule {}
