
import { Injectable } from '@angular/core';
import {of} from "rxjs";
import {Observable} from "rxjs";
import {EventEmitter, Output} from "@angular/core";
import { IonRouterOutlet } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})

export class ChatService {
  @Output() notificationEvent = new EventEmitter<any>();
  private routerOutlet!: IonRouterOutlet;

  constructor() {}

  init(routerOutlet: IonRouterOutlet): void {
    this.routerOutlet = routerOutlet;
  }

  get swipebackEnabled(): boolean {
    if (this.routerOutlet) {
      return this.routerOutlet.swipeGesture;
    } else {
      throw new Error('Call init() first!');
    }
  }

  set swipebackEnabled(value: boolean) {
    if (this.routerOutlet) {
      this.routerOutlet.swipeGesture = value;
    } else {
      throw new Error('Call init() first!');
    }
  }
}
