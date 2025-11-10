import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GoldShipmentClockInListPage } from './gold-shipment-clock-in-list.page';

describe('CollectionSupplierPage', () => {
  let component: GoldShipmentClockInListPage;
  let fixture: ComponentFixture<GoldShipmentClockInListPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GoldShipmentClockInListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GoldShipmentClockInListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
