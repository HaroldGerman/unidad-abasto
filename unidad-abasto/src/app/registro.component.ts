import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule,  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  registroForm: FormGroup;
  roles: string[] = ['Administrador', 'Dependencia', 'Personal de Apoyo', 'Jefe de Oficina', 'Director Administrativo'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
    ) {
    this.registroForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(4)]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['', Validators.required]
    });
  }

  onSubmit() {
  if (this.registroForm.valid) {
    const { usuario, contrasena, rol } = this.registroForm.value;

    // 1. Llamamos al servidor
    this.http.post('http://localhost:8080/api/usuarios/registro', {
      username: usuario,
      password: contrasena,
      rol: rol
      }).subscribe({
        // EL 'next' SOLO ocurre cuando el servidor responde "OK"
        next: (res) => {
          alert('¡Registro exitoso! Ahora puedes iniciar sesión.'); // La alerta ahora es real
          this.router.navigate(['/inicio']); 
        },
        // EL 'error' ocurre si el servidor falla (ej: usuario duplicado)
        error: (err) => {
          alert('Hubo un error: ' + (err.error || 'No se pudo conectar con el servidor'));
        }
      });
      
    } else {
      this.registroForm.markAllAsTouched();
    }
  }
}