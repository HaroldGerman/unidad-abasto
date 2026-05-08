// registro.component.ts - Actualizado
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  // Roles del frontend - ahora con valores que coinciden con el backend
  roles: { label: string; value: string }[] = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Dependencia', value: 'dependencia' },
    { label: 'Personal de Apoyo', value: 'personal_apoyo' },
    { label: 'Jefe de Oficina', value: 'jefe_oficina' },
    { label: 'Director Administrativo', value: 'director' },
    { label: 'Proveedor', value: 'proveedor' }
  ];

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

      this.http.post('http://localhost:8080/api/usuarios/registro', {
        username: usuario,
        password: contrasena,
        rol: rol  // Enviamos el valor directamente (ej: 'dependencia')
      }).subscribe({
        next: (res) => {
          alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error en registro:', err);
          alert('Error: ' + (err.error || 'No se pudo registrar el usuario.'));
        }
      });
    } else {
      this.registroForm.markAllAsTouched();
    }
  }
}