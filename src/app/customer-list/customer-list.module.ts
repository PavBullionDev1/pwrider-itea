import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CustomerListPageRoutingModule } from './customer-list-routing.module';
import { CustomerListPage } from './customer-list.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomerListPageRoutingModule,
    SharedModule],
  declarations: [CustomerListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CustomerListPageModule {}
