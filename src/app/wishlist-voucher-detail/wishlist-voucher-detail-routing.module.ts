import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WishlistVoucherDetailPage } from './wishlist-voucher-detail.page';

const routes: Routes = [
  {
    path: '',
    component: WishlistVoucherDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WishlistVoucherDetailPageRoutingModule {}
