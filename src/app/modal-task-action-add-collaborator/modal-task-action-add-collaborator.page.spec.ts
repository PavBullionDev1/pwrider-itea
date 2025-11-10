import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

// @ts-ignore
import { ModalTaskActionAddCollaboratorPage } from './modal-task-action-add-collaborator.page';

describe('ModalTaskActionAddCollaboratorPage', () => {
  let component: ModalTaskActionAddCollaboratorPage;
  let fixture: ComponentFixture<ModalTaskActionAddCollaboratorPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalTaskActionAddCollaboratorPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalTaskActionAddCollaboratorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
