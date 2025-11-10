import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { GrnPageRoutingModule } from './grn-routing.module';
import { GrnPage } from './grn.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GrnPageRoutingModule,
    SharedModule],
  declarations: [GrnPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GrnPageModule {}
