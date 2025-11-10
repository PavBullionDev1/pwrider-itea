import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { JobLogPageRoutingModule } from './job-log-routing.module';
import { JobLogPage } from './job-log.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JobLogPageRoutingModule,
    SharedModule],
  declarations: [JobLogPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class JobLogPageModule {}
