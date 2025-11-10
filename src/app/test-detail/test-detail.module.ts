import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TestDetailPageRoutingModule } from './test-detail-routing.module';
import { TestDetailPage } from './test-detail.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TestDetailPageRoutingModule,
    SharedModule],
  declarations: [TestDetailPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TestDetailPageModule {}
