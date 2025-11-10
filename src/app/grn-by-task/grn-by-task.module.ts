import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { GrnByTaskRoutingModule } from './grn-by-task-routing.module';

import { GrnByTaskPage } from './grn-by-task.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GrnByTaskRoutingModule,
    SharedModule],
  declarations: [GrnByTaskPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GrnByTaskModule {}
