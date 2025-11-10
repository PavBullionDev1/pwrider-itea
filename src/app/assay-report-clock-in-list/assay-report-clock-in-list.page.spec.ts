import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { AssayReportClockInListPage } from './assay-report-clock-in-list.page';

describe('CollectionSupplierPage', () => {
  let component: AssayReportClockInListPage;
  let fixture: ComponentFixture<AssayReportClockInListPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AssayReportClockInListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(AssayReportClockInListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
