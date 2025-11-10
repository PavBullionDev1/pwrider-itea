import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { JobLogHistoryPage } from './job-log-history.page';

const routes: Routes = [
  {
    path: '',
    component: JobLogHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobLogHistoryPageRoutingModule {}
