import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BullionPendingReweightPage } from './bullion-pending-reweight.page';

describe('BullionPendingReweightPage', () => {
  let component: BullionPendingReweightPage;
  let fixture: ComponentFixture<BullionPendingReweightPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BullionPendingReweightPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BullionPendingReweightPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
