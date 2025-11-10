import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { ProfilePage } from './profile.page';
import { HttpClientModule } from '@angular/common/http';
import { SwipeModule } from '../swipe/swipe.module';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    SwipeModule,
    SharedModule],
  declarations: [
    ProfilePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfilePageModule {}
