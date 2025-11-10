import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalsharedService {

  constructor() { }

  private messageSource = new BehaviorSubject<string>('');
  currentMessage = this.messageSource.asObservable();

  changeMessage(message: any) {
    this.messageSource.next(message);
  }


}
