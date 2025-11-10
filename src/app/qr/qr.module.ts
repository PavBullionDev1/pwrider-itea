import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { QrPageRoutingModule } from './qr-routing.module';

import { QrPage } from './qr.page';
import { InboxComponent } from '../../app/inbox/inbox.component';
import { HttpClientModule } from '@angular/common/http';
import { SwipeModule } from '../swipe/swipe.module';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QrPageRoutingModule,
    HttpClientModule,
    SwipeModule,
    SharedModule
  ],
  declarations: [QrPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class QrPageModule {}
