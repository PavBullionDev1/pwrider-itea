import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { BullionPendingCheckPage } from './bullion-pending-check.page';

describe('BullionPendingCheckPage', () => {
  let component: BullionPendingCheckPage;
  let fixture: ComponentFixture<BullionPendingCheckPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BullionPendingCheckPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(BullionPendingCheckPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
