import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DeliveryDetailTaskPage } from './delivery-detail-task.page';

describe('DeliveryDetailTaskPage', () => {
  let component: DeliveryDetailTaskPage;
  let fixture: ComponentFixture<DeliveryDetailTaskPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryDetailTaskPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryDetailTaskPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
