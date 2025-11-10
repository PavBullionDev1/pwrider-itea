import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WeightDetailPageRoutingModule } from './weight-detail-routing.module';
import { WeightDetailPage } from './weight-detail.page';
import { SharedModule } from '../shared/shared.module';
import { ModalWeightPageModule } from '../modal-weight/modal-weight.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WeightDetailPageRoutingModule,
    SharedModule,
    ModalWeightPageModule
  ],
  declarations: [WeightDetailPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WeightDetailPageModule {}
