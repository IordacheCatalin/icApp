import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../services/alertMessage.service';


type Step = 1 | 2 | 3;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class Home implements OnInit {
  alertService = inject(AlertService);


  ngOnInit(): void {
    // this.alertService.showAlert('Plata nu a fost finalizată', 'custom-alert-error', true);
  }

}
