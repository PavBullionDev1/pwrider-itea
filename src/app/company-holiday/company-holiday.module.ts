import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CompanyHolidayPageRoutingModule } from './company-holiday-routing.module';
import { CompanyHolidayPage } from './company-holiday.page';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CompanyHolidayPageRoutingModule,
    SharedModule],
  declarations: [CompanyHolidayPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CompanyHolidayPageModule {}
