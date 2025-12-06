import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { LocalstorageService } from '../services/localstorage.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ProviderService } from '../services/provider.service';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-private',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatIconModule,
    RouterOutlet,
    RouterLink,
    BaseChartDirective
  ],
  templateUrl: './private.component.html',
  styleUrls: ['./private.component.scss']
})
export class PrivateComponent {
  private _localstorage: LocalstorageService = inject(LocalstorageService);
  private _router: Router = inject(Router);
  private _breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private _provider: ProviderService = inject(ProviderService);

  @ViewChild('drawer') drawer!: MatDrawer;

  user: string = '';
  userId: string = '';
  rol: number = 0;
  isMobile: boolean = false;
  drawerMode: 'side' | 'over' = 'side';
  drawerOpened: boolean = true;

  // Propiedades para la gráfica del cliente
  hasChartData: boolean = false;
  clientChartData!: ChartData<'pie'>;
  sidebarChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 8,
          font: { size: 10 },
          color: 'rgba(255, 255, 255, 0.9)',
          boxWidth: 12
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed} pedidos`;
          }
        }
      }
    }
  };

  async ngOnInit() {
    const userData = this._localstorage.getItem('user');

    if (userData) {
      this.user = userData.name;
      this.userId = userData.idusers;
      this.rol = userData.rol;
      this.applyRoleTheme();
      this.redirectByRole();

      // Si es cliente, cargar gráfica de productos más pedidos
      if (this.rol === 4) {
        await this.loadClientChart();
      }
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

  private async loadClientChart() {
    try {
      const response: any = await this._provider.request('GET', 'graphics/clientTopProducts', { userId: this.userId });
      
      if (response && response.labels && response.labels.length > 0) {
        const chartColors = [
          'rgba(255, 159, 64, 0.9)',
          'rgba(255, 99, 132, 0.9)',
          'rgba(54, 162, 235, 0.9)',
          'rgba(255, 206, 86, 0.9)',
          'rgba(75, 192, 192, 0.9)'
        ];

        this.clientChartData = {
          labels: response.labels,
          datasets: [{
            data: response.data,
            backgroundColor: chartColors,
            borderColor: chartColors.map(c => c.replace('0.9', '1')),
            borderWidth: 2,
            hoverOffset: 8
          }]
        };
        this.hasChartData = true;
      }
    } catch (error) {
      console.error('Error cargando gráfica del cliente:', error);
    }
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