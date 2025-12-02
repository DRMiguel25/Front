import { Component, inject } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { CurrencyPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import {
  AbstractControl,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ProviderService } from '../../services/provider.service';
import { Router, RouterLink } from '@angular/router';
import { WebSocketsService } from '../../services/web-sockets.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocalstorageService } from '../../services/localstorage.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-order-view',
  standalone: true,
  imports: [
    CurrencyPipe,
    MatFormFieldModule,
    MatRadioModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    RouterLink,
    MatIconModule
  ],
  templateUrl: './order-view.component.html',
  styleUrl: './order-view.component.scss',
})
export class OrderViewComponent {

  private _provider: ProviderService = inject(ProviderService);
  private _router: Router = inject(Router);
  public _order: OrderService = inject(OrderService);
  private _wsService: WebSocketsService = inject(WebSocketsService);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  private _localStorage: LocalstorageService = inject(LocalstorageService);

  async ngOnInit() {
  }

  filterExtras(item: any, type: 0 | 1) {
    return item.not_ingredient.filter(
      (ingredient: any) => ingredient.type == type
    );
  }

  totalProducts() {
    return this.eachProduct()
      .value.map((product: any) => {
        const amount = product.amount ? product.amount : 1;
        return product.unit_price * amount;
      })
      .reduce((previous: number, current: number) => previous + current, 0);
  }

  totalExtras() {
    return this.eachProduct()
      .value.map((product: any) => {
        const amount = product.amount ? product.amount : 1;
        
        const extrasSum = product.not_ingredient
          .map((ingredient: any) => ingredient.price)
          .reduce((previous: number, current: number) => previous + current, 0);
          
        return extrasSum * amount;
      })
      .reduce((previous: number, current: number) => previous + current, 0);
  }

  totalOrder() {
    const total = this.totalProducts() + this.totalExtras();
    this._order.formOrder.controls['total'].patchValue(total);
    return total;
  }

  radioForm() {
    return this._order.formOrder.controls['order_details'] as FormGroup;
  }

  eachProduct() {
    return this._order.formOrder.controls['order_details'] as FormArray;
  }

  selected(event: MatRadioChange) {
    this.eachProduct().controls.forEach((product: AbstractControl) => {
      const productAux: FormGroup = product as FormGroup;
      productAux.controls['order_type'].patchValue(event.value);
    });
  }

  async placeOrder() {
    // 1. Calcular el total antes de enviar
    this.totalOrder();

    // 2. GENERAR ID ÚNICO
    const newId = self.crypto.randomUUID();
    this._order.formOrder.controls['idorder'].patchValue(newId);

    // 3. Obtener y validar el usuario
    const user = this._localStorage.getItem('user');
    if (user && user.idusers) {
      this._order.formOrder.controls['users_idusers'].patchValue(user.idusers);
    } else {
      this._snackBar.open("Error: No se pudo identificar al usuario.", "", { duration: 3000, verticalPosition: 'top' });
      return; 
    }

    // 4. FORMATO DE FECHA PARA MYSQL (Solución al error_save)
    // Convertimos la fecha a string 'YYYY-MM-DD HH:MM:SS'
    const now = new Date();
    const mysqlDate = now.getFullYear() + '-' +
        ('0' + (now.getMonth() + 1)).slice(-2) + '-' +
        ('0' + now.getDate()).slice(-2) + ' ' +
        ('0' + now.getHours()).slice(-2) + ':' +
        ('0' + now.getMinutes()).slice(-2) + ':' +
        ('0' + now.getSeconds()).slice(-2);
    
    this._order.formOrder.controls['date'].patchValue(mysqlDate);

    // 5. Rellenar datos obligatorios por defecto
    this._order.formOrder.controls['status'].patchValue(0); // 0 = Pendiente
    
    // Si no se seleccionó origen, poner 'Mostrador'
    if (!this._order.formOrder.controls['origin'].value) {
        this._order.formOrder.controls['origin'].patchValue('Mostrador');
    }

    console.log("Enviando orden:", this._order.formOrder.value);

    if (this._order.formOrder.valid && this._wsService.socketStatus) {
      try {
        var data = await this._provider.request('POST', 'order/createOrder', this._order.formOrder.value);

        if (data) {
          await this._wsService.request('comandas', data);
          
          this._snackBar.open("Orden realizada con éxito", "", { duration: 3000, verticalPosition: 'top' });
          
          // Redirección basada en el rol
          const rol = user.rol;
          if(rol === 1) {
               // Si es Admin, ir a ver la tabla de órdenes
               this._router.navigate(['private/orders-view']); 
          } else {
               // Si es Mesero/Cajero, volver al menú
               this._router.navigate(['private/menu']);
          }

          this._order.formOrder.reset();
          while (this.orderDetailsArray().length !== 0) {
            this.orderDetailsArray().removeAt(0);
          }
        } else {
          this._snackBar.open("Error: El servidor no devolvió datos.", "", { duration: 3000, verticalPosition: 'top' });
        }
      } catch (error) {
        console.error("Error al crear la orden:", error);
        this._snackBar.open("Error al procesar la orden.", "", { duration: 3000, verticalPosition: 'top' });
      }
    } else {
      this._snackBar.open("Formulario inválido o sin conexión.", "", { duration: 3000, verticalPosition: 'top' });
      document.querySelectorAll('.ng-invalid, .mat-mdc-radio-group.unselect').forEach((element: Element) => element.classList.add('invalid'));
      this._order.formOrder.markAllAsTouched();
    }
  }

  orderDetailsArray() {
    return this._order.formOrder.controls['order_details'] as FormArray;
  }

  deleteProduct(index: number) {
    this.eachProduct().removeAt(index);
  }
}