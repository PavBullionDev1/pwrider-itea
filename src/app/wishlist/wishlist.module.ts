import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WishlistPageRoutingModule } from './wishlist-routing.module';
import { WishlistPage } from './wishlist.page';
import { SwipeModule } from '../swipe/swipe.module';
import { SharedModule } from '../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WishlistPageRoutingModule,
    SwipeModule,
    SharedModule],
  declarations: [WishlistPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class WishlistPageModule {}
