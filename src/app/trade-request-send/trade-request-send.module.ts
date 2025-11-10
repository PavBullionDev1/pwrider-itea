import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TradeRequestSendPageRoutingModule } from './trade-request-send-routing.module';

import { TradeRequestSendPage } from './trade-request-send.page';
import { InboxComponent } from '../inbox/inbox.component';
import { SwipeModule } from '../swipe/swipe.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TradeRequestSendPageRoutingModule,
    SwipeModule,
    SharedModule
  ],
  declarations: [TradeRequestSendPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TradeRequestSendPageModule {}
