import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InboxPageRoutingModule } from './inbox-routing.module';
import { InboxPage } from './inbox.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InboxPageRoutingModule,
    SharedModule],
  declarations: [InboxPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class InboxPageModule {}
