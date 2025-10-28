import { Component, inject, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {

  @HostBinding('class.collapsed') isCollapsed = false;


  async ngOnInit() {

  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

}