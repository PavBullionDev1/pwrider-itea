import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExchangeNoteListPage } from './exchange-note-list.page';

const routes: Routes = [
  {
    path: '',
    component: ExchangeNoteListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExchangeNoteListPageRoutingModule {}
