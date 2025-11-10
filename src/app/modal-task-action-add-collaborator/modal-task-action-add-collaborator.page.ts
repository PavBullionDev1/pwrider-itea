import { HttpClient } from "@angular/common/http";
import { Component, OnInit, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";

@Component({
  selector: 'app-modal-task-action-scheduled',
  templateUrl: './modal-task-action-add-collaborator.page.html',
  styleUrls: ['./modal-task-action-add-collaborator.page.scss']
})
export class ModalTaskActionAddCollaboratorPage implements OnInit {
  @Input() userList: any[];
  @Input() main_rider: any;
  @Input() date: string;
  @Input() api_url: string;
  taskItemTransferTo: string;
  anyUserSelected: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient,
  ) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  submit() {
    const payload = {
      transfer_to: this.taskItemTransferTo,
      user_list: this.userList,
      date: this.date,
    };

    console.log(this.taskItemTransferTo);
    this.http.post(this.api_url + "/taskAddCollaborator/" + localStorage['token'] , payload, { observe: "body" })
      .subscribe((data: any) => {
          console.log('API response:', data);
        },
        (error) => {
          console.log(error);
        });
    this.dismiss();
  }

  // Method to deselect a user
  deselectUser(user) {
    user.selected = false;
    this.updateAnyUserSelected();
  }

  // Method to handle the user selection from the dropdown
  onUserSelect(userId) {
    const selectedUser = this.userList.find(user => user.user_id === userId);
    if (selectedUser) {
      selectedUser.selected = true;
      this.updateAnyUserSelected();
    }
  }

  // Method to update anyUserSelected property
  updateAnyUserSelected() {
    this.anyUserSelected = this.userList.some(user => user.selected);
  }

  ngOnInit(): void {
    this.updateAnyUserSelected();
  }
}
