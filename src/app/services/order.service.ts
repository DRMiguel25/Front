import { Injectable, inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LocalstorageService } from './localstorage.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // Dependencias necesarias
  private _form_builder: FormBuilder = inject(FormBuilder);
  private _localstorage: LocalstorageService = inject(LocalstorageService);

  // Creacion del formulario principal
  formOrder: FormGroup = this._form_builder.group({
    idorder: new FormControl(null),
    date: new FormControl(null),
    total: new FormControl(null, [Validators.required]),
    status: new FormControl(null),
    origin: new FormControl(null),
    comments: new FormControl(null),
    client: new FormControl(null, [Validators.required]),
    // CORRECCIÓN: Agregamos '?.' para evitar crash si el usuario aún no carga
    users_idusers: new FormControl(this._localstorage.getItem('user')?.idusers, [Validators.required]),
    order_details: new FormArray([], [Validators.required]),
    start_order: new FormControl(null),
    finish_order: new FormControl(null)
  });

  // Funcion para agregar productos (Detalles)
  orderDetails(products_idproducts: string, price: number, name: string, name_category: string){
    // Calculamos si este producto ya existe para aumentar el contador visual (aunque es mejor manejar cantidad en el input)
    const currentProducts = this.formOrder.controls['order_details'].value;
    const amount = currentProducts.filter((product: any) => product.products_idproducts == products_idproducts).length;

    return this._form_builder.group({
      idorderdetail: new FormControl(null),
      name: new FormControl(name, [Validators.required]),
      amount: new FormControl(amount + 1, [Validators.required]),
      unit_price: new FormControl(price, [Validators.required]),
      order_type: new FormControl(null, [Validators.required]),
      comments: new FormControl(null),
      order_idorder: new FormControl(null),
      products_idproducts: new FormControl(products_idproducts, [Validators.required]),
      // NOTA: Mantenemos 'not_ingredient' aquí porque el Backend ya lo espera así
      not_ingredient: new FormArray([]),
      name_category: new FormControl(name_category, [Validators.required])
    });
  }

  // Funcion para agregar ingredientes extra
  notIngredients(id_ingredient: string, type: 0 | 1, name: string, price: number){
      return this._form_builder.group({
      ingredients_idingredients: new FormControl(id_ingredient, [Validators.required]),
      order_details_idorderdetail: new FormControl(null),
      name: new FormControl(name, [Validators.required]),
      price: new FormControl(price, [Validators.required]),
      type: new FormControl(type, [Validators.required])
    });
  }
}