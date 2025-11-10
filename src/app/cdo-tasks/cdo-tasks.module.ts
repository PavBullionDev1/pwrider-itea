import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CdoTasksPageRoutingModule } from './cdo-tasks-routing.module';

import { CdoTasksPage } from './cdo-tasks.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CdoTasksPageRoutingModule,
    SharedModule],
  declarations: [CdoTasksPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CdoTasksPageModule {}