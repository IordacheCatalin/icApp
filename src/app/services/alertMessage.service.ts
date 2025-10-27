import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface AlertPayload {
  message: string;
  autoClose: boolean;
  customClass: string;
  onCloseCallback?: () => void; 
  callback: boolean;
  timeDisplay: number;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  private alertSubject = new Subject<AlertPayload>();
  alert$ = this.alertSubject.asObservable();

  showAlert(message: string, customClass: string = '', autoClose: boolean = true, timeDisplay: number = 3000) {
    this.alertSubject.next({ message, autoClose, customClass, callback: false, timeDisplay });
  }

  showAlertCloseByButton(message: string, customClass: string = '', onCloseCallback?: () => void) {
    this.alertSubject.next({ message, autoClose: false, customClass, onCloseCallback, callback: false, timeDisplay: 4000 });
  }

  showAlertAutoCloseWithCallback(message: string, customClass: string = '', onCloseCallback?: () => void, timeDisplay: number = 6000) {
    this.alertSubject.next({ message, autoClose: true, customClass, onCloseCallback, callback: true, timeDisplay });
  }
}
