import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

// @ts-ignore
import { ModalAddChangeRequestPage } from './modal-add-change-request.page';

describe('ModalAddChangeRequestPage', () => {
  let component: ModalAddChangeRequestPage;
  let fixture: ComponentFixture<ModalAddChangeRequestPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalAddChangeRequestPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalAddChangeRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
