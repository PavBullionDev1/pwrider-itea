import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModalSignaturePageRoutingModule } from './modal-signature-routing.module';

import { ModalSignaturePage } from './modal-signature.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModalSignaturePageRoutingModule,
    SharedModule],
  declarations: [ModalSignaturePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModalSignaturePageModule {}
