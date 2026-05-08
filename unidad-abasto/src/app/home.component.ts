import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { usuario, contrasena } = this.loginForm.value;

      this.authService.login(usuario, contrasena).subscribe({
        next: (response: any) => {
          console.log('Login exitoso:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Error en el login:', err);
          if (err.status === 0) {
            this.errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose en http://localhost:8080';
          } else if (err.status === 401) {
            this.errorMessage = 'Usuario o contraseña incorrectos';
          } else {
            this.errorMessage = err.error || 'Credenciales incorrectas';
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}