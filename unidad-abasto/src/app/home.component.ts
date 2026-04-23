import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
    private http: HttpClient
  ) {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      contrasena: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const { usuario, contrasena } = this.loginForm.value;

      //Llamamos al backend de Spring Boot para validar las credenciales
      this.http.post('http://localhost:8080/api/usuarios/login',{
        username: usuario,
        password: contrasena
      }).subscribe({
          next: (response: any) => {
            localStorage.setItem('usuario', JSON.stringify(response));
            console.log('Login exitoso:', response);

            //HU02: Aquí podria guardar el rol en localStorage o en un servicio de autenticación para usarlo en otras partes de la app
            this.router.navigate(['/inicio']); //Redirigimos si es correcto
          },
        error: (err) => {
          console.error('Error en el login:', err);
          this.errorMessage = err.error || 'Credenciales incorrectas';
        }
      })
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}