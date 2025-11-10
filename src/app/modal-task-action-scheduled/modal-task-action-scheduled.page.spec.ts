import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

// @ts-ignore
import { ModalTaskActionScheduledPage } from './modal-task-action-scheduled.page';

describe('ModalTaskActionScheduledPage', () => {
  let component: ModalTaskActionScheduledPage;
  let fixture: ComponentFixture<ModalTaskActionScheduledPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTaskActionScheduledPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalTaskActionScheduledPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
