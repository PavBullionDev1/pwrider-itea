import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CollectionSupplierPageRoutingModule } from './collection-supplier-routing.module';
import { CollectionSupplierPage } from './collection-supplier.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CollectionSupplierPageRoutingModule,
    SharedModule],
  declarations: [CollectionSupplierPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CollectionSupplierPageModule {}
