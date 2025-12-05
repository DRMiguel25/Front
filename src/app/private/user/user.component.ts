import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProviderService } from '../../services/provider.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router'; // Se agregó RouterLink aquí
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebSocketsService } from '../../services/web-sockets.service';
import { LocalstorageService } from '../../services/localstorage.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterLink // <--- Se agregó esto para que funcione el botón Cancelar
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {

  private _formbuilder: FormBuilder = inject(FormBuilder);
  private _provider: ProviderService = inject(ProviderService);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  private _wsService: WebSocketsService = inject(WebSocketsService);
  private _router: Router = inject(Router);
  private _activedRouter: ActivatedRoute = inject(ActivatedRoute);
  private _localStorage: LocalstorageService = inject(LocalstorageService);

  id: string = '';
  isProfileEdit: boolean = false; 

  roles = [
    { name: 'Administrador', value: 1 }, // Asegúrate que estos valores coincidan con tu BD
    { name: 'Cajero', value: 2 },        // Si chef es 2, cajero quizás sea otro
    { name: 'Cocinero', value: 2 },      // Revisa tus IDs de roles exactos
    { name: 'Cliente', value: 4 },
  ];

  formulario = this._formbuilder.group({
    idusers: [null],
    name: [null, [Validators.required]],
    password: [null], 
    phone: [null],
    rol: [null], 
  });

  async ngOnInit() {
    if (this._router.url.includes('profile')) {
      this.isProfileEdit = true;
      const currentUser = this._localStorage.getItem('user');
      
      if (currentUser) {
        this.id = currentUser.idusers;
        this.loadUserData(this.id);
        this.formulario.get('rol')?.disable(); 
      }
    }
    else if (this._router.url.includes('edit')) {
      this._activedRouter.params.subscribe(async (params: Params) => {
        this.id = params['id'];
        this.loadUserData(this.id);
        this.formulario.get('password')?.addValidators(Validators.required);
        this.formulario.get('rol')?.addValidators(Validators.required);
      });
    }
    else {
        this.formulario.get('password')?.addValidators(Validators.required);
        this.formulario.get('rol')?.addValidators(Validators.required);
    }
    
    this.formulario.updateValueAndValidity();
  }

  async loadUserData(userId: string) {
      try {
        var userRes: any = await this._provider.request('GET', 'user/viewUser', {idusers: userId});
        
        var user = Array.isArray(userRes) ? userRes[0] : (userRes.msg ? userRes.msg[0] : userRes);

        if (user) {
            this.formulario.patchValue({
                idusers: user.idusers,
                name: user.name,
                phone: user.phone,
                rol: user.rol
            });
        }
      } catch (error) {
          console.error(error);
      }
  }

  async save() {
    if (this.formulario.invalid) {
        this.formulario.markAllAsTouched();
        return;
    }

    if (this.isProfileEdit) {
        const payload = {
            idusers: this.id,
            name: this.formulario.value.name,
            phone: this.formulario.value.phone,
            password: this.formulario.value.password 
        };

        var data = await this._provider.request('POST', 'user/updateProfile', payload);
        
        if (data) {
            this._snackBar.open('Perfil actualizado correctamente', 'Cerrar', {duration: 3000});
            const currentUser = this._localStorage.getItem('user');
            currentUser.name = payload.name;
            this._localStorage.setItem('user', currentUser);
        }
    }
    else if (this._router.url.includes('edit')) {
      if (this._wsService.socketStatus) {
        var data = await this._provider.request('PUT', 'user/updateUser', this.formulario.value);
        if (data) {
          await this._wsService.request('usuarios', data);
          this._snackBar.open('Usuario Actualizado', '', {duration: 3000, verticalPosition: 'top'});
          this._router.navigate(['private/user-view']);
        }
      }
    } 
    else {
      if (this._wsService.socketStatus) {
        var data = await this._provider.request('POST', 'auth/signup', this.formulario.value);
        if (data) {
          await this._wsService.request('usuarios', data);
          this._snackBar.open('Usuario Creado', '', {duration: 3000, verticalPosition: 'top'});
          this._router.navigate(['private/user-view']);
        }
      }
    }
  }

  async deleteUser() {
    if (this._wsService.socketStatus) {
      var data = await this._provider.request('DELETE', 'user/deleteUser', {idusers: this.id});
      if (data) {
        await this._wsService.request('usuarios', data);
        this._snackBar.open('Usuario Eliminado', '', {duration: 3000, verticalPosition: 'top'});
        this._router.navigate(['private/user-view']);
      }
    }
  }
}