import { Component, TemplateRef, ViewChild, inject } from '@angular/core';
import {MatTable, MatTableModule} from '@angular/material/table';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogModule,
} from '@angular/material/dialog';
import { ProviderService } from '../../services/provider.service';
import { DialogComponent } from '../dialog/dialog.component';
import { WebSocketsService } from '../../services/web-sockets.service';
import { MatDrawer } from '@angular/material/sidenav';
import { LocalstorageService } from '../../services/localstorage.service';
import { OrderDetailComponent } from '../order-detail/order-detail.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chef-order-view',
  standalone: true,
  imports: [MatTableModule, MatDialogModule, MatIconModule, CommonModule],
  templateUrl: './chef-order-view.component.html',
  styleUrl: './chef-order-view.component.scss'
})
export class ChefOrderViewComponent {
private _provider: ProviderService = inject(ProviderService);
private dialog: MatDialog = inject(MatDialog);
private _wsService: WebSocketsService = inject(WebSocketsService);
private _localStorage: LocalstorageService = inject(LocalstorageService);

order: any[] = [];
currentOrder: any = null;
pendingOrders: any[] = [];

async ngOnInit() {
  this.listenSocket();
  this.order = await this._provider.request('GET', 'order/viewOrders');
  this.updateOrderQueue();
}

updateOrderQueue() {
  const activeOrders = this.order.filter((eachOrder: any) => eachOrder.status == 0);
  
  if (activeOrders.length > 0) {
    this.currentOrder = activeOrders[0];
    this.pendingOrders = activeOrders.slice(1);
  } else {
    this.currentOrder = null;
    this.pendingOrders = [];
  }
}

selectOrder(order: any) {
  this.currentOrder = order;
  this.updateOrderQueue();
}

viewDetails(order: any) {
  this.dialog.open(OrderDetailComponent, {data: order});
}

markAsReady(order: any) {
  const dialogRef = this.dialog.open(DialogComponent, {data: order});
  
  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // Mover a la siguiente orden
      this.updateOrderQueue();
    }
  });
}

listenSocket() {  
  this._wsService.listen('comanda').subscribe((data) => {
    console.log(data.idorder);     

    this.order = this.order.filter((item) => item.idorder != data.idorder);
    this.order.unshift(data);
    this.updateOrderQueue();
  });
}

/**
 * Convierte el UUID de la orden a un número corto legible (01-99)
 * Usa los últimos caracteres del UUID para generar un número consistente
 */
getDisplayOrderNumber(orderId: string): string {
  if (!orderId) return '00';
  
  // Tomar los últimos 4 caracteres hexadecimales del UUID
  const lastChars = orderId.replace(/-/g, '').slice(-4);
  
  // Convertir a número y aplicar módulo 99 + 1 para obtener 01-99
  const num = parseInt(lastChars, 16) % 99 + 1;
  
  // Formatear con ceros a la izquierda (01, 02, ... 99)
  return num.toString().padStart(2, '0');
}

}

