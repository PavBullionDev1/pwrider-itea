import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// 共享组件
import { MytabComponent } from '../mytab/mytab.component';
import { CommonHeaderComponent } from '../common-header/common-header.component';
import { InboxComponent } from '../inbox/inbox.component';

// 共享Pipe
import { SearchPipe } from '../customer-list/search.pipe';
import { FilterPipe } from '../job-log/filter.pipe';

@NgModule({
  declarations: [
    MytabComponent,
    CommonHeaderComponent,
    InboxComponent,
    SearchPipe,
    FilterPipe
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    MytabComponent,
    CommonHeaderComponent,
    InboxComponent,
    SearchPipe,
    FilterPipe,
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule
  ],
})
export class SharedModule { }