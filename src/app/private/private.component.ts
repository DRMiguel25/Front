import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LocalstorageService } from '../services/localstorage.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-private',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatIconModule,
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './private.component.html',
  styleUrls: ['./private.component.scss']
})
export class PrivateComponent {
  private _localstorage: LocalstorageService = inject(LocalstorageService);
  private _router: Router = inject(Router);
  private _breakpointObserver: BreakpointObserver = inject(BreakpointObserver);

  @ViewChild('drawer') drawer!: MatDrawer;

  user: string = '';
  rol: number = 0;
  isMobile: boolean = false;
  drawerMode: 'side' | 'over' = 'side';
  drawerOpened: boolean = true;

  ngOnInit() {
    const userData = this._localstorage.getItem('user');

    if (userData) {
      this.user = userData.name;
      this.rol = userData.rol;
      this.applyRoleTheme();
      this.redirectByRole();
    } else {
      this._router.navigate(['/auth/sign-in']);
    }

    // Observe breakpoints for responsive behavior
    this._breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).subscribe(result => {
      this.isMobile = result.matches;
      this.drawerMode = this.isMobile ? 'over' : 'side';
      this.drawerOpened = !this.isMobile;
    });
  }

  toggleDrawer() {
    this.drawer.toggle();
  }

  private applyRoleTheme() {
    // Remove any existing role classes
    document.body.classList.remove('role-client', 'role-admin', 'role-chef', 'role-cashier');
    
    // Add role-specific class
    const roleClass = this.getRoleClass();
    document.body.classList.add(roleClass);
  }

  private getRoleClass(): string {
    switch (this.rol) {
      case 0:
      case 1:
        return 'role-admin';
      case 2:
        return 'role-chef';
      case 3:
        return 'role-cashier';
      case 4:
        return 'role-client';
      default:
        return 'role-client';
    }
  }

  private redirectByRole() {
    // Si estamos en la raíz /private, redirigimos según rol
    const currentRoute = this._router.url;
    if (currentRoute !== '/private') return;

    switch (this.rol) {
      case 0:
      case 1: // Admin
        this._router.navigate(['/private/dash-admin']);
        break;
      case 2: // Chef
        this._router.navigate(['/private/chef-order-view']);
        break;
      case 3: // Mesero
        this._router.navigate(['/private/menu']);
        break;
      case 4: // Cliente
        this._router.navigate(['/private/menu']);
        break;
      default:
        this._router.navigate(['/private/menu']);
    }
  }

  getRoleName(): string {
    switch (this.rol) {
      case 0:
      case 1:
        return 'Administrador';
      case 2:
        return 'Chef';
      case 3:
        return 'Mesero';
      case 4:
        return 'Cliente';
      default:
        return 'Usuario';
    }
  }

  logOut() {
    this._localstorage.clear();
    this._router.navigate(['/auth/sign-in']);
  }
}