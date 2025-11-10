import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { WishlistVoucherDetailPage } from './wishlist-voucher-detail.page';

describe('WishlistVoucherDetailPage', () => {
  let component: WishlistVoucherDetailPage;
  let fixture: ComponentFixture<WishlistVoucherDetailPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WishlistVoucherDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(WishlistVoucherDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
