import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SettingPageRoutingModule } from './setting-routing.module';
import { SettingPage } from './setting.page';
import { SwipeModule } from '../swipe/swipe.module';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SettingPageRoutingModule,
    SwipeModule,
    SharedModule],
  declarations: [
    SettingPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SettingPageModule {}
