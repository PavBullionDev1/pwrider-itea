import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BullionPendingReweightDetailPage } from './bullion-pending-reweight-detail.page';

describe('BullionPendingReweightDetailPage', () => {
  let component: BullionPendingReweightDetailPage;
  let fixture: ComponentFixture<BullionPendingReweightDetailPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BullionPendingReweightDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BullionPendingReweightDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
