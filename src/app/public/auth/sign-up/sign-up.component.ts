import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProviderService } from '../../../services/provider.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterLink
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent {
  private _formBuilder = inject(FormBuilder);
  private _provider = inject(ProviderService);
  private _router = inject(Router);
  private _snackBar = inject(MatSnackBar);

  // Formulario de registro
  formSignUp: FormGroup = this._formBuilder.group({
    name: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]] // Valida 10 dígitos
  });

  async register() {
    if (this.formSignUp.invalid) {
      this.formSignUp.markAllAsTouched();
      return;
    }

    const data = this.formSignUp.value;
    
    // Agregamos el ROL 4 (Cliente) automáticamente
    const payload = {
      name: data.name,
      password: data.password,
      phone: data.phone,
      rol: 4 
    };

    try {
      const response = await this._provider.request('POST', 'auth/signup', payload);
      
      if (response) {
        this._snackBar.open('¡Registro exitoso! Ahora inicia sesión.', 'Cerrar', {
          duration: 4000,
          verticalPosition: 'top'
        });
        // Redirigir al login para que entre
        this._router.navigate(['/auth/sign-in']);
      }
    } catch (error) {
      console.error(error);
      this._snackBar.open('Error al registrarse. Intenta con otro nombre.', 'Cerrar', { duration: 3000 });
    }
  }
}