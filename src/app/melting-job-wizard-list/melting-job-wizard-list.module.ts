import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MeltingJobWizardListPageRoutingModule } from './melting-job-wizard-list-routing.module';
import { MeltingJobWizardListPage } from './melting-job-wizard-list.page';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeltingJobWizardListPageRoutingModule,
    SharedModule],
  declarations: [MeltingJobWizardListPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MeltingJobWizardListPageModule {}
