import { Component, inject, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {

  @HostBinding('class.collapsed') isCollapsed = false;
   activeSubKey: string | null = null;


  async ngOnInit() {

  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

    setActiveSub(key: string) {     
    this.activeSubKey = key;
  }
}