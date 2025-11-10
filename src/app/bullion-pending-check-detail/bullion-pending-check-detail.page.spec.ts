import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BullionPendingCheckDetailPage } from './bullion-pending-check-detail.page';

describe('BullionPendingCheckDetailPage', () => {
  let component: BullionPendingCheckDetailPage;
  let fixture: ComponentFixture<BullionPendingCheckDetailPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BullionPendingCheckDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BullionPendingCheckDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
