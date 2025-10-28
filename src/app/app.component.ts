import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AlertComponent} from './Components/Alert/alert.component'
import { NavbarComponent } from './Components/Navbar/navbar.component';
import { SidebarComponent } from './Components/SideBar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AlertComponent, NavbarComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'icApp';
}