import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MeltingJobWizardListPage } from './melting-job-wizard-list.page';

describe('CollectionSupplierPage', () => {
  let component: MeltingJobWizardListPage;
  let fixture: ComponentFixture<MeltingJobWizardListPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MeltingJobWizardListPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MeltingJobWizardListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
