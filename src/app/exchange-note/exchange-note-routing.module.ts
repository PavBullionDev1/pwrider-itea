import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExchangeNotePage } from './exchange-note.page';

const routes: Routes = [
  {
    path: '',
    component: ExchangeNotePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExchangeNotePageRoutingModule {}
