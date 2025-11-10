import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { GoldShipmentPageRoutingModule } from './gold-shipment-routing.module';
import { GoldShipmentPage } from './gold-shipment.page';
// Import the Modal Module
import { ModalTaskActionOtwModule } from '../modal-task-action-otw/modal-task-action-otw.module';
import { ModalTaskActionScheduledPageModule } from '../modal-task-action-scheduled/modal-task-action-scheduled.module';
import { ModalTaskActionAddCollaboratorModule } from '../modal-task-action-add-collaborator/modal-task-action-add-collaborator.module';
import { ModalPhotoViewerPageModule } from '../modal-photo-viewer/modal-photo-viewer.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GoldShipmentPageRoutingModule,
    ModalTaskActionOtwModule,
    ModalTaskActionScheduledPageModule,
    ModalTaskActionAddCollaboratorModule,
    ModalPhotoViewerPageModule,
    SharedModule],
  declarations: [GoldShipmentPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GoldShipmentModule {}
