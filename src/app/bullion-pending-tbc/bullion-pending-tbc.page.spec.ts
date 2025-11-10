import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BullionPendingTBCPage } from './bullion-pending-tbc.page';

describe('BullionPendingTBCPage', () => {
  let component: BullionPendingTBCPage;
  let fixture: ComponentFixture<BullionPendingTBCPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BullionPendingTBCPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BullionPendingTBCPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
