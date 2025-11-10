import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ExchangeNoteListPageRoutingModule } from './exchange-note-list-routing.module';
import { ExchangeNoteListPage } from './exchange-note-list.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExchangeNoteListPageRoutingModule,
    SharedModule],
  declarations: [ExchangeNoteListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ExchangeNoteListPageModule {}
