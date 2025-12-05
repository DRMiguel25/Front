import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router'; // Se agrego RouterLink
import { ProviderService } from '../../../services/provider.service';
import { LocalstorageService } from '../../../services/localstorage.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, HttpClientModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  private _form_builder: FormBuilder = inject(FormBuilder);
  private _http: HttpClient = inject(HttpClient);
  private _router: Router = inject(Router);
  private _provider: ProviderService = inject(ProviderService);
  private _localstorage: LocalstorageService = inject(LocalstorageService);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  req: any;

  form_signin: FormGroup = this._form_builder.group({
    name: [null, Validators.required],
    password: [null, Validators.required]
  })

  async signin() {

    if (this.form_signin.valid) {
  
      this.req = await this._provider.request('POST', 'auth/signin', this.form_signin.value);
      console.log(this.req);
      
      this._localstorage.setItem('user', this.req);
  
      const rol = this._localstorage.getItem('user').rol;
      
      switch (rol) {
        case 0:
          this._router.navigate(['private/menu']);
          break;
        case 1:
          this._router.navigate(['private/dash-admin']);
          break;
        case 2:
          this._router.navigate(['private/chef-order-view']);
          break;
        case 3:
          this._router.navigate(['private/menu']);
          break;
        case 4: // NUEVO: Caso para Cliente
          this._router.navigate(['private/menu']);
          break;
      }
    }
  }

}