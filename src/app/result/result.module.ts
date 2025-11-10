import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ResultPageRoutingModule } from './result-routing.module';

import { ResultPage } from './result.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ResultPageRoutingModule,
    SharedModule],
  declarations: [ResultPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ResultPageModule {}
