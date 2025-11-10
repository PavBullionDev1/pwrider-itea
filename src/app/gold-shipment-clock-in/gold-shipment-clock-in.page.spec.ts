import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { GoldShipmentClockInPage } from './gold-shipment-clock-in.page';

describe('PersonalDashboardPage', () => {
  let component: GoldShipmentClockInPage;
  let fixture: ComponentFixture<GoldShipmentClockInPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GoldShipmentClockInPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(GoldShipmentClockInPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
