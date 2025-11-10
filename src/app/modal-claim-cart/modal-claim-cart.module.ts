import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalClaimCartPageRoutingModule } from './modal-claim-cart-routing.module';

import { ModalClaimCartPage } from './modal-claim-cart.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalClaimCartPageRoutingModule,
    SharedModule
  ],
  declarations: [ModalClaimCartPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalClaimCartPageModule {}
