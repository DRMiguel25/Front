import { Component, inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ProviderService } from '../../services/provider.service';
import { Router } from '@angular/router';
import { WebSocketsService } from '../../services/web-sockets.service';
import { LocalstorageService } from '../../services/localstorage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, CurrencyPipe } from '@angular/common'; // Importamos CommonModule y CurrencyPipe

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [MatDialogModule, CommonModule, CurrencyPipe], // Agregamos los módulos necesarios
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit {
  // Lo hacemos público para que el HTML lo pueda usar
  public data = inject(MAT_DIALOG_DATA);
  
  private _provider: ProviderService = inject(ProviderService);
  public _router: Router = inject(Router);
  private _wsService: WebSocketsService = inject(WebSocketsService);
  private _localStorage: LocalstorageService = inject(LocalstorageService);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  
  // Inyectamos referencia al diálogo para poder cerrarlo manualmente si se requiere
  private dialogRef = inject(MatDialogRef<OrderDetailComponent>);

  orderDetails: any = [];

  async ngOnInit() {
    console.log("Datos recibidos en modal:", this.data); 

    // Solicitamos los productos de la orden al backend
    if (this.data && this.data.idorder) {
        try {
            this.orderDetails = await this._provider.request('GET', 'order/viewOrder', { idorder: this.data.idorder });
            console.log("Detalles traídos del servidor:", this.orderDetails);
        } catch (error) {
            console.error("Error cargando detalles:", error);
        }
    }
  }

  async updateStatus() {
    // 2 = Orden Lista
    await this._provider.request('PUT', 'order/updateStatus', { 
        "status": 2, 
        "idorder": this.data.idorder, 
        "users_idusers": this._localStorage.getItem('user').idusers 
    });

    this._snackBar.open("Orden marcada como LISTA ", "", { duration: 3000, verticalPosition: 'top' });

    // Enviar notificación por WebSocket para que los meseros vean que ya está lista
    let nStatus: object = {
      "idorder": this.data.idorder,
      "client": this.data.client,
      "total": this.data.total,
      "mes": this.orderDetails[0]?.mes || 0, // Evitar error si no hay mes
      "comments": this.data.comments,
      "status": 2,
      "users_idusers": this._localStorage.getItem('user').idusers
    };
    
    console.log("Enviando socket:", nStatus); 
    await this._wsService.request('comandas', nStatus);
    
    // Cerrar el modal
    this.dialogRef.close();
  }
}