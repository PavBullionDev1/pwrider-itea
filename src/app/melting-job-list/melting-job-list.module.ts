import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MeltingJobListPageRoutingModule } from './melting-job-list-routing.module';
import { MeltingJobListPage } from './melting-job-list.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeltingJobListPageRoutingModule,
    SharedModule],
  declarations: [MeltingJobListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MeltingJobListPageModule {}
