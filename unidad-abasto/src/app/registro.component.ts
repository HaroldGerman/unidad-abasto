import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule,  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {
  registroForm: FormGroup;
  roles: string[] = ['Administrador', 'Usuario'];

  constructor(private fb: FormBuilder) {
    this.registroForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(4)]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.registroForm.valid) {
      console.log('Datos de registro:', this.registroForm.value);
      // Aquí puedes agregar la lógica para llamar a tu servicio HTTP
    } else {
      // Marca todos los campos como tocados para mostrar errores si el usuario intenta enviar vacío
      this.registroForm.markAllAsTouched();
    }
  }
}