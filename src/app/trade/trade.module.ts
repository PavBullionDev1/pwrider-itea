import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TradePageRoutingModule } from './trade-routing.module';

import { TradePage } from './trade.page';
import { InboxComponent } from '../../app/inbox/inbox.component';
import { SwipeModule } from '../swipe/swipe.module';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TradePageRoutingModule,
    SwipeModule,
    SharedModule
  ],
  declarations: [TradePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TradePageModule {}
