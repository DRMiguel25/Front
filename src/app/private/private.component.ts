import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LocalstorageService } from '../services/localstorage.service';

@Component({
  selector: 'app-private',
  standalone: true,
  imports: [
    CommonModule,      // <<--- importante para *ngIf
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

  user: string = '';
  rol: number = 0;

  ngOnInit() {
    const userData = this._localstorage.getItem('user');

    if (userData) {
      this.user = userData.name;
      this.rol = userData.rol;
      this.redirectByRole();
    } else {
      this._router.navigate(['/auth/sign-in']);
    }
  }

  private redirectByRole() {
    const currentRoute = this._router.url;

    if (currentRoute !== '/private') return;

    switch (this.rol) {
      case 0:
      case 1:
        this._router.navigate(['/private/menu']);
        break;
      case 2:
        this._router.navigate(['/private/chef-order-view']);
        break;
      case 3:
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
      default:
        return 'Usuario';
    }
  }

  logOut() {
    this._localstorage.clear();
    this._router.navigate(['/auth/sign-in']);
  }
}
