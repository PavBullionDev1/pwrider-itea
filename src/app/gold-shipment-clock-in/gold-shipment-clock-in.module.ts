import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { GoldShipmentClockInPageRoutingModule } from './gold-shipment-clock-in-routing.module';
import { GoldShipmentClockInPage } from './gold-shipment-clock-in.page';
// Import the Modal Module
import { ModalTaskActionOtwModule } from '../modal-task-action-otw/modal-task-action-otw.module';
import { ModalTaskActionScheduledPageModule } from '../modal-task-action-scheduled/modal-task-action-scheduled.module';
import { ModalTaskActionAddCollaboratorModule } from '../modal-task-action-add-collaborator/modal-task-action-add-collaborator.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GoldShipmentClockInPageRoutingModule,
    ModalTaskActionOtwModule,
    ModalTaskActionScheduledPageModule,
    ModalTaskActionAddCollaboratorModule],
  declarations: [GoldShipmentClockInPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GoldShipmentClockInModule {}
