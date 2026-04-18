##  Caso de Estudio: Sistema de Gestión de Abastecimiento (UNI)

###  Problemática Actual
Actualmente, la **Unidad de Abastecimiento** de la Universidad Nacional de Ingeniería gestiona los recursos circulantes de manera **completamente manual**. El uso exclusivo de documentos en papel como la orden de compra, la PECOSA y el kardex genera ineficiencias en el control de inventarios y lentitud en el flujo de productos hacia las dependencias universitarias.

**Puntos críticos identificados:**
* **Gestión de Compras:** El proceso de solicitud a proveedores, recepción de proformas y aprobación por la dirección administrativa es propenso a demoras debido al flujo físico de documentos.
* **Control de Inventario:** El registro de entradas y salidas se realiza en un **Kardex manual**, dificultando la verificación inmediata de existencias y la actualización de datos.
* **Atención a Dependencias:** Las solicitudes enfrentan cuellos de botella al validar disponibilidad en almacén y generar manualmente la documentación de salida (PECOSA).

###  Solución Propuesta
El objetivo es desarrollar un software que **automatice integralmente** los procesos de la unidad. El sistema permitirá:

* **Automatización de Flujos:** Digitalizar la gestión de requerimientos, proformas y órdenes de compra para agilizar la comunicación con proveedores.
* **Control de Almacén Inteligente:** Actualización automática del **Kardex digital**, permitiendo la creación inmediata de registros para nuevos productos ingresados.
* **Optimización de Despacho:** Agilizar la generación, firma y archivo de la **PECOSA**, asegurando que los productos lleguen a las dependencias en tiempo oportuno.
* **Validación de Recepción:** Módulo para verificar que los productos entregados por proveedores o recibidos por dependencias estén en buen estado y sean válidos según lo solicitado.

###  Beneficios Esperados
* **Agilidad:** Reducción drástica del tiempo de tránsito de los productos necesarios en cada dependencia.
* **Precisión:** Control permanente, automático y confiable del inventario físico en el almacén.
* **Transparencia:** Trazabilidad de cada producto, desde el requerimiento de compra hasta la conformidad de recepción final.

##  Planificación y Fases del Proyecto

Para el desarrollo de este sistema, se ha estructurado el trabajo en fases basadas en el ciclo de vida de desarrollo de software, asegurando la calidad en cada entrega:

###  Fases de Desarrollo

* **Análisis de Requerimientos:** Identificación de las necesidades críticas de la Unidad de Abastecimiento.
* **Diseño del Sistema:** Modelado de la arquitectura, bases de datos y diseño de interfaces de usuario (UI/UX).
* **Implementación (Backend/Frontend):** Desarrollo de los módulos de Gestión de Solicitudes, Órdenes de Compra e Inventario.
* **Pruebas y QA:** Verificación de flujos de trabajo (validación de PECOSA, estados de pedidos pendientes).
* **Despliegue y Mantenimiento:** Puesta en marcha en el entorno de la Unidad de Abastecimiento.

###  Cronograma de Ejecución

| Actividad | Entregable |
| :--- | :--- |
| **Definición del Problema** | Documento de alcance y objetivos |
| **Modelado de Procesos** | Diagramas de flujo (Orden de Compra, PECOSA, Kardex) |
| **Desarrollo de Módulos** | Código fuente del sistema de gestión |
| **Control de Calidad** | Reporte de pruebas y validación de usuario |

###  Tecnologías Utilizadas

* **Frontend:** Angular (para una interfaz dinámica y reactiva).
* **Backend:** Java con Spring Boot (siguiendo los requerimientos de robustez del sistema).
* **Base de Datos:** PostgreSQL para la gestión persistente del Kardex y documentos oficiales.
* **Herramientas:** Git para el control de versiones y metodologías ágiles para el seguimiento.
