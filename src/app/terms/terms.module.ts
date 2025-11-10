import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TermsPageRoutingModule } from './terms-routing.module';
import { TermsPage } from './terms.page';
import { SharedModule } from '../shared/shared.module';
import { ModalHeaderComponent } from '../modal-header/modal-header.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TermsPageRoutingModule,
    SharedModule
  ],
  declarations: [TermsPage,ModalHeaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TermsPageModule {}
