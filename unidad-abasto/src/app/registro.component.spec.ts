import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegistroComponent } from './registro.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';

describe('RegistroComponent - Pruebas Unitarias HU01', () => {
  let component: RegistroComponent;
  let fixture: ComponentFixture<RegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RegistroComponent, 
        ReactiveFormsModule, 
        HttpClientTestingModule,
        RouterModule.forRoot([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe marcar el formulario como INVÁLIDO si el campo usuario tiene menos de 4 caracteres', () => {
    // 1. ARRANGE: Buscamos el control real 'usuario' en español
    const usuarioInput = component.registroForm.controls['usuario'];
    
    // 2. ACT: Asignamos el valor corto de prueba
    usuarioInput.setValue('abc');
    fixture.detectChanges();

    // 3. ASSERT: Comprobamos el estado de invalidez esperado
    expect(usuarioInput.invalid).toBe(true);
    expect(usuarioInput.errors?.['minlength']).toBeTruthy();
    expect(component.registroForm.invalid).toBe(true);
  });
});