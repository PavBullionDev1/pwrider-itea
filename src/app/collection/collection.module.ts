import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CollectionPageRoutingModule } from './collection-routing.module';
import { CollectionPage } from './collection.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CollectionPageRoutingModule,
    SharedModule],
  declarations: [CollectionPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CollectionPageModule {}
