import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

// @ts-ignore
import { ModalTaskActionOtwPage } from './modal-task-action-otw.page';

describe('ModalTaskActionScheduledPage', () => {
  let component: ModalTaskActionOtwPage;
  let fixture: ComponentFixture<ModalTaskActionOtwPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTaskActionOtwPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalTaskActionOtwPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
