import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalCustomerListPageRoutingModule } from './modal-customer-list-routing.module';

import { ModalCustomerListPage } from './modal-customer-list.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalCustomerListPageRoutingModule,
    SharedModule
  ],
  declarations: [ModalCustomerListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalCustomerListPageModule {}
