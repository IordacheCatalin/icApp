import { Component, OnInit } from '@angular/core';
import { AlertService } from '../../services/alertMessage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css'],
})
export class AlertComponent implements OnInit {
  message: string = '';
  autoClose: boolean = true;
  customClass: string = '';
  callback: boolean = true;
  timeDisplay: number = 4000;

  private onCloseCallback?: () => void;

  constructor(private alertService: AlertService) { }

  ngOnInit(): void {
    this.alertService.alert$.subscribe(
      ({ message, autoClose, customClass, onCloseCallback, callback, timeDisplay }: { message: string; autoClose: boolean; customClass: string; onCloseCallback?: () => void, callback: boolean, timeDisplay: number }) => {

        this.message = message;
        this.autoClose = autoClose;
        this.customClass = customClass;
        this.callback = callback;
        this.timeDisplay = timeDisplay;
        this.onCloseCallback = onCloseCallback;
        if (this.autoClose && (this.callback === undefined || this.callback !== true)) {
          this.showAlert();
        }
        if (this.autoClose && this.callback === true) {
          this.showAlertWithCallBack();
        }
      }
    );
  }

  showAlert() {
    setTimeout(() => {
      this.clearAlert();
    }, 3000);
  }

  showAlertWithCallBack() {
    setTimeout(() => {
      this.clearAlert();
      if (this.onCloseCallback) {
        this.onCloseCallback();
      }
    }, this.timeDisplay);
  }

  clearAlert() {
    this.message = '';
  }

  onCloseButtonClick() {
    this.clearAlert();
    if (this.onCloseCallback) {
      this.onCloseCallback();
    }
  }
}
