import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ProviderService } from '../../services/provider.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { DialogCompleteComponent } from '../dialog-complete/dialog-complete.component';
import { DialogCancelComponent } from '../dialog-cancel/dialog-cancel.component';
import { OrderDetailComponent } from '../order-detail/order-detail.component';
import { WebSocketsService } from '../../services/web-sockets.service';
import { LocalstorageService } from '../../services/localstorage.service';
import { CurrencyPipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-orders-view',
  standalone: true,
  // CORRECCIÓN 2: Agregar CurrencyPipe al array de imports
  imports: [MatTabsModule, MatDialogModule, MatTableModule, CurrencyPipe],
  templateUrl: './orders-view.component.html',
  styleUrl: './orders-view.component.scss'
})
export class OrdersViewComponent {

  private _provider: ProviderService = inject(ProviderService);
  private dialog: MatDialog = inject(MatDialog);
  private _wsService: WebSocketsService = inject(WebSocketsService);
  private _localStorage: LocalstorageService = inject(LocalstorageService);
  private _snackBar: MatSnackBar = inject(MatSnackBar);

  order: any[] = []; 
  currentUser: any = null;

  status = [
    { name: "Activas", value: 0 },
    { name: "En proceso", value: 1 },
    { name: "Ordenes Listas", value: 2 },
    { name: "Completadas", value: 3 },
    { name: "Canceladas", value: 4 }
  ];

  displayedColumns = ['client', 'total', 'comments', 'function'];

  async ngOnInit() {
    this.currentUser = this._localStorage.getItem('user');

    this.order = await this._provider.request('GET', 'order/viewOrders');
    
    // Filtro para CLIENTES: solo ven sus propias órdenes
    if (this.currentUser && this.currentUser.rol === 4) {
      this.order = this.order.filter((o: any) => o.client === this.currentUser.name);
    }

    this.listenSocket();
  }

  filterByStatus(status: number) {
    return this.order.filter((eachOrder: any) => eachOrder.status == status);
  }

  openOrderDetailDialog(element: any) {
    this.dialog.open(OrderDetailComponent, { 
      data: {
        idorder: element.idorder,
        client: element.client,
        total: element.total,
        comments: element.comments
      }
    });
  }

  openConfirmDialog(data: string) {
    this.dialog.open(DialogCompleteComponent, { data: data });
  }

  openCancelDialog(data: any) {
    this.dialog.open(DialogCancelComponent, { data: data });
  }

  async markAsReady(element: any) {
    if (this._wsService.socketStatus) {
      // Actualizar el estado a 2 (Lista)
      await this._provider.request('PUT', 'order/updateStatus', {
        "status": 2,
        "idorder": element.idorder,
        "users_idusers": this.currentUser.idusers
      });

      this._snackBar.open("Orden marcada como lista", "", { duration: 3000, verticalPosition: 'top' });

      // Emitir evento de WebSocket para actualizar en tiempo real
      let nStatus: object = {
        "idorder": element.idorder,
        "client": element.client,
        "total": element.total,
        "mes": element.mes,
        "comments": element.comments,
        "status": 2,
        "users_idusers": this.currentUser.idusers
      };

      this._wsService.request('comandas', nStatus);
    }
  }

  listenSocket() {
    this._wsService.listen('comanda').subscribe((data) => {
      console.log("Socket Data:", data);
      
      // Si soy cliente y la orden nueva NO es mía, la ignoro
      if (this.currentUser && this.currentUser.rol === 4) {
         if (data.client !== this.currentUser.name) return;
      }

      this.order = this.order.filter((item) => item.idorder != data.idorder);
      this.order.unshift(data);
    });
  }
}