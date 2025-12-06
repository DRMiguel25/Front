import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'pos-theme';
  
  // Signal para el tema actual
  theme = signal<Theme>(this.getInitialTheme());
  
  // Computed para saber si es modo oscuro
  get isDark(): boolean {
    return this.theme() === 'dark';
  }

  constructor() {
    // Aplicar tema inicial
    this.applyTheme(this.theme());
    
    // Efecto para guardar y aplicar cambios de tema
    effect(() => {
      const currentTheme = this.theme();
      this.applyTheme(currentTheme);
      localStorage.setItem(this.THEME_KEY, currentTheme);
    });
  }

  private getInitialTheme(): Theme {
    // Primero revisar localStorage
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Si no hay tema guardado, usar preferencia del sistema
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    return 'light';
  }

  private applyTheme(theme: Theme): void {
    const htmlElement = document.documentElement;
    
    // Aplicar tema de DaisyUI
    htmlElement.setAttribute('data-theme', theme);
    
    // Agregar/quitar clase para estilos personalizados
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }

  toggleTheme(): void {
    this.theme.update(current => current === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }
}
