import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WeightPageRoutingModule } from './weight-routing.module';
import { WeightPage } from './weight.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WeightPageRoutingModule,
    SharedModule],
  declarations: [WeightPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WeightPageModule {}
