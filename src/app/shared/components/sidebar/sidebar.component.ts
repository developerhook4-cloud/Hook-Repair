import { Component, Input, Output, EventEmitter, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconDefinition, faChevronDown, faChevronUp, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarStateService {
  isCollapsed$ = new BehaviorSubject<boolean>(false);
}

export interface SidebarItem {
  label: string;
  icon?: IconDefinition;
  isActive?: boolean;
  isExpanded?: boolean;
  route?: string; 
  subItems?: { label: string; isActive?: boolean; route?: string }[]; 
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './sidebar.html'
})
export class SidebarComponent {
  @Input() title: string = '';
  @Input() titleIcon!: IconDefinition;
  @Input() items: SidebarItem[] = [];

  @Output() collapsedChange = new EventEmitter<boolean>();

  isCollapsed = false;

  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  constructor(private router: Router, private sidebarState: SidebarStateService) {}

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.items.forEach(item => item.isExpanded = false);
    }
    this.collapsedChange.emit(this.isCollapsed);
    this.sidebarState.isCollapsed$.next(this.isCollapsed);
  }

  toggleDropdown(selectedItem: SidebarItem) {
    if (this.isCollapsed) {
      this.isCollapsed = false;
    }

    this.items.forEach(item => item.isActive = false);
    selectedItem.isActive = true;

    this.items.forEach(item => {
      if (item !== selectedItem) {
        item.isExpanded = false; 
      }
    });

    if (selectedItem.subItems) {
      selectedItem.isExpanded = !selectedItem.isExpanded;
    } else if (selectedItem.route) {
      this.router.navigate([selectedItem.route]);
    }
  }

  selectSubItem(event: Event, parentItem: SidebarItem, selectedSubItem: any) {
    event.stopPropagation();

    this.items.forEach(item => {
      if (item.subItems) {
        item.subItems.forEach(sub => sub.isActive = false);
      }
    });

    selectedSubItem.isActive = true;
    
    this.items.forEach(item => item.isActive = false);
    parentItem.isActive = true;

    if (selectedSubItem.route) {
      this.router.navigate([selectedSubItem.route]);
    }
  }
}