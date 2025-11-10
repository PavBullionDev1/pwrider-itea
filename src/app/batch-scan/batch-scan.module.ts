import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BatchScanRoutingModule } from './batch-scan-routing.module';
import { BatchScanPage } from './batch-scan.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BatchScanRoutingModule,
    SharedModule],
  declarations: [BatchScanPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class BatchScanPageModule {}
