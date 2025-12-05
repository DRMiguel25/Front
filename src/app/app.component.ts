import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignInComponent } from './public/auth/sign-in/sign-in.component';
import { PrivateComponent } from './private/private.component';
import { WebSocketsService } from './services/web-sockets.service';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { LocalstorageService } from './services/localstorage.service'; // Importamos LocalStorage

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SignInComponent, PrivateComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [provideCharts(withDefaultRegisterables())]
})
export class AppComponent implements OnInit {
  title = 'comanda-hamburguesas';
  
  private _ws: WebSocketsService = inject(WebSocketsService);
  private _localStorage: LocalstorageService = inject(LocalstorageService); // Inyectamos el servicio

  ngOnInit() {
    // 1. Iniciar conexión de WebSockets
    this._ws.checkStatus();
    
    // 2. Aplicar el tema de colores según el rol guardado
    this.updateTheme();
  }

  updateTheme() {
    const user = this._localStorage.getItem('user');
    const body = document.body;
    
    // Limpiamos cualquier clase previa para evitar conflictos
    body.classList.remove('role-admin', 'role-chef', 'role-cashier', 'role-client');

    if (user) {
      switch (user.rol) {
        case 0:
        case 1:
          body.classList.add('role-admin'); // Azul Índigo
          break;
        case 2:
          body.classList.add('role-chef');  // Rojo / Teal (según tokens)
          break;
        case 3:
          body.classList.add('role-cashier'); // Turquesa / Cyan
          break;
        case 4:
          body.classList.add('role-client'); // Naranja
          break;
        default:
          body.classList.add('role-client');
      }
    } else {
      // Si no hay usuario (está en login), usamos el tema cliente por defecto o uno neutro
      body.classList.add('role-client'); 
    }
  }
}