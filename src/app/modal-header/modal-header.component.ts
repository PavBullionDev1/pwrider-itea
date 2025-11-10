import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal-header',
  templateUrl: './modal-header.component.html',
  styleUrls: ['./modal-header.component.scss'],
})
export class ModalHeaderComponent implements OnInit {

  @Input() pageSource: string;
  @Input() mode: string;
  @Output() cusBackEvent = new EventEmitter<string>();

  constructor(
  ) { }

  ngOnInit() {}

  customizedBackEvent(value?: string) {
    this.cusBackEvent.emit(value || '');
  }

}
