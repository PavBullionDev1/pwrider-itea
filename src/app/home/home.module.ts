import { NgModule , CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule  } from '@ionic/angular';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';
import { SharedModule } from '../shared/shared.module';
import { SwipeModule } from '../swipe/swipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HomePageRoutingModule,
    IonicModule,
    SharedModule
  ],
  declarations: [HomePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePageModule {}
