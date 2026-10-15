import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faGear,
  faCircleUser,
  faUser,
  faRightLeft,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { AuthService } from '../../../features/auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  imports: [RouterLink, FontAwesomeModule],
})
export class NavbarComponent {
  faGear = faGear;
  faCircleUser = faCircleUser;
  faUser = faUser;
  faRightLeft = faRightLeft;
  faRightFromBracket = faRightFromBracket;

  tabLeft = 0;
  tabTop = 0;
  tabWidth = 0;
  tabHeight = 0;
  tabOpacity = 0;

  public authService = inject(AuthService);
  private router = inject(Router);

  public session = this.authService.currentUser;

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  activeElement: HTMLElement | null = null;

  setActive(event: MouseEvent) {
    this.activeElement = event.currentTarget as HTMLElement;
    this.updateTabPosition(this.activeElement);
  }

  moveTab(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    this.updateTabPosition(target);
  }

  hideTab() {
    if (this.activeElement) {
      this.updateTabPosition(this.activeElement);
    } else {
      this.tabOpacity = 0; 
    }
  }

  private updateTabPosition(target: HTMLElement) {
    const nav = target.closest('nav');
    if (nav) {
      const navRect = nav.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      this.tabLeft = targetRect.left - navRect.left;
      this.tabTop = targetRect.top - navRect.top;
      this.tabWidth = targetRect.width;
      this.tabHeight = targetRect.height;
      this.tabOpacity = 1;
    }
  }
}