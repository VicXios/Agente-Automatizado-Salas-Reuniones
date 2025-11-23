===============================================
README.TXT — Agente Automatizado para Solicitud y Gestión de Salas de Reuniones.
Práctica I – Universidad Andrés Bello
Flujos de automatización n8n del proyecto Sistema de Reservas de Salas Institucionales 
Sistema de Reservas - Flujos n8n
===============================================
1. Descripción General

Este proyecto implementa un Agente Automatizado para la Solicitud y Gestión de Salas de Reuniones, desarrollado utilizando n8n, Docker Desktop, ngrok, Google Workspace (Gmail, Calendar, Sheets) y Microsoft Azure OAuth2 para validaciones institucionales.

El sistema gestiona de forma automática el ciclo completo de una reserva:

-Recepción de solicitudes mediante Webhooks
-Validación de disponibilidad
-Registro de reservas en Google Sheets
-Sincronización con Google Calendar
-Envío de notificaciones automáticas

Cancelaciones con recuperación de información por ID

-Gestión de salas (agregar o eliminar)
-Raegistro de participantes
-Validación de correos institucionales mediante Microsoft Azure

Este README resume todo lo desarrollado hasta ahora en Sprint 1 y Sprint 2.

2. Tecnologías Utilizadas

-n8n (automatización)
-Docker Desktop 4.47.0
-ngrok 3.24.0-msix (exposición de Webhooks)
-Google Sheets (almacenamiento de reservas)
-Google Calendar (bloqueo y sincronización de salas)
-Gmail API (notificaciones)
-Microsoft Azure OAuth2 (verificación institucional)
-Google Forms (formularios de entrada)
-Postman (pruebas manuales)

3. Cuenta de Google del Proyecto

La cuenta utilizada para todos los servicios del proyecto es:

-Correo del proyecto:
-proyectoespacioscorporativos@gmail.com

La contraseña NO se incluye por motivos de seguridad.

Contenidos en esta cuenta:

- Formularios Google: Solicitud de Sala 
- Consulta de Disponibilidad
- Gestión de Salas (Administrador)
- Registro de Participantes

Hoja de Cálculo donde se registran:

- Reservas
- Reservas canceladas
- Lista de salas
- Solicitudes de administración de salas
- Google Calendar para sincronización

4. Instalación del Sistema
4.1 Verificar Docker

Ejecutar:
 -docker version
Debe mostrar:
 -Client: 28.4.0
 -Server: Docker Engine 28.4.0
 -OS/Arch: windows/amd64

4.2 Crear archivo docker-compose.yml
 -version: "3.1"
 -services:

n8n:
 -image: n8nio/n8n
ports:
- "5678:5678"
volumes:
- ~/.n8n:/home/node/.n8n
environment:
- N8N_BASIC_AUTH_ACTIVE=false
- GENERIC_TIMEZONE=America/Santiago

4.3 Levantar n8n

- docker compose up -d

- Abrir en: http://localhost:5678

5. Exponer Webhooks con ngrok (versión 3.24.0-msix)

n8n trabaja con Webhooks. Para permitir que Google Forms, Azure OAuth y otras integraciones accedan al servidor en tu computador, se utilizó ngrok.

Ejecutar:

-ngrok http 5678

Esto genera un dominio HTTPS:

 -https://compliable-stefan-unpaving.ngrok-free.dev (Depende de cada host, que inicie en su propio ordenador pero al configurarlo varias personas pueden poner en ejecución el flujo al mismo tiempo)

Todos los Webhooks del proyecto fueron actualizados a este dominio durante las pruebas.

6. Credenciales Utilizadas 
6.1 Google OAuth2

Utilizado para:

 -Crear eventos
 -Eliminar eventos
 -Leer disponibilidad
 -Registrar filas en Google Sheets
 -Enviar emails

6.2 Microsoft Azure OAuth2

 -Usado para validar correos institucionales.

Parámetros configurados:

 -client_id
 -redirect_uri usando ngrok
 -scope: User.Read

Azure fue utilizado específicamente en HU-05 (validación de correo institucional).

6.3 Almacenamiento de credenciales

- Todas fueron configuradas directamente en n8n bajo:
- Settings → Credentials

| Historia               | Endpoint                                 |
| ---------------------- | ---------------------------------------- |
| HU-01 / HU-08          | /webhook-test/reserva-sala               |
| HU-02                  | /webhook-test/reserva                    |
| HU-03                  | /3cd1f5f7-3e2a-4d70-8d8b-a4c4ae8e4354    |
| HU-04                  | /d1e185d0-acfe-4dc5-aa8f-b48bc37bb5cd    |
| HU-05 Callback OAuth   | /webhook-test/oauth2-credential/callback |
| HU-06 Cancelación      | /98bd68b7-6d8d-490a-918a-6b51fd9d5af5    |
| HU-09 Gestión de salas | /webhook-test/Salas                      |

8. Flujos Implementados (Sprint 1 y Sprint 2)
HU-01 – Reserva de sala:
- Recibe datos desde formulario
- Verifica disponibilidad comparando Sheets
- Registra reserva
- Envía correo de confirmación
- Crea evento Google Calendar

HU-02 – Ver disponibilidad:
- Lee salas desde Sheets
- Filtra según fecha, capacidad y horarios
- Envía correo con tabla HTML

HU-03 – Alertas de modificación:

- Notifica a solicitante
- Notifica a encargado
- Mensajes personalizados en HTML

HU-04 – Notificación al encargado:
- Correo automático al encargado por reservas confirmadas

HU-05 – Verificación institucional:
- Filtra correo por dominio @uandresbello.edu
- Genera link OAuth2 Azure
- Recibe callback
- Envía correo de verificación al usuario

HU-06 – Cancelación de reserva:

- Recibe ID desde link
- Busca la fila correspondiente
- Elimina fila en Sheets
- Elimina evento Calendar
- Guarda registro en hoja de cancelaciones
- Envía correo confirmando cancelación

HU-08 – Registro de participantes:
- Valida correos individuales
- Agrega participantes al evento Calendar
- Registra datos en Sheets

HU-09 – Gestión de salas:

Permite al encargado:
 - Agregar nuevas salas
 - Eliminar salas existentes
 - Valida existencia
 - Envía correo de confirmación
 - Realiza búsquedas en Sheets
 - Usa Azure OAuth2 para acciones administrativas

9. Pruebas del Sistema
9.1 Pruebas con Postman

- Simulaciones POST enviando JSON a Webhooks:
- POST https://xxxxxx.ngrok-free.app/webhook-test/reserva-sala (Metodo para probar los flujos de manera manual dandole un post prueba, asignar link del webhook de cada historia para utlizarlo)


Ejemplo JSON:
{
"sala": "1-A",
"fecha": "2025-11-20",
"horaInicio": "10:00",
"horaFin": "11:00",
"correo": "usuario@uandresbello.edu
",
"titulo": "Reunión",
"descripcion": "Avance Sprint"
}

9.2 Validaciones realizadas
 - Creación de eventos Calendar
 - Eliminación de eventos
 - Escritura y lectura en Google Sheets
 - Envío correos por Gmail Node
 - Manejo de errores <Stop and Error>
 - Validación Azure con dominio institucional

10. Control de Versión del Proyecto (GitHub)

Ramas utilizadas:

main → versión estable
Contiene: Todas las historias Usuario del sprint 1 y 2
- sprint2 → HU 03, 04, 06 corregida, 08, 09
- Flujo Principal: Contiene el Flujo integrado (Todas las historias de usuario del incremento 1 y 2 ya integradas)
  - Se sube cada cambio que tiene el flujo a esta rama para actualizarse en uno solo archivo.

Notas:

HU-06 fue trasladada desde Sprint 1, completada en Sprint 2 y será ajustada y refactorizada en Sprint 3.

11. Equipo del Proyecto

- Scrum Master: Vicente Núñez
- Product Owner: Kevin Soto

Developers:

- Francisco Espinoza
- Nicolás Torres
- Walter Chávez

Testers: PO / SM

12. Estado Actual

- Sprint 1 COMPLETO
- Sprint 2 COMPLETO
- Flujos JSON exportados y probados
- Integración con NGROK operativa
- Integración con Azure funcional
- Flujos principales integrados en Flujo Main Sprint 2

Preparación próxima:

- Refactor Sprint 3
- Documentación final

Integración completa y Despliegue

12. Estado Actual

-Sprint 1 COMPLETO
-Sprint 2 COMPLETO
-Flujos JSON exportados y probados
-Integración con NGROK operativa
-Integración con Azure funcional
-Flujos principales integrados en Flujo Main Sprint 2
Preparación próxima:
-Sprint 3
-Historia de usuario que necesitan modificación e integración de sprint anteriores al sprint 3
-Documentación Final
-Integración Total

13. Licencia

Proyecto académico – Universidad Andrés Bello
Uso interno educativo.

===============================================

FIN DEL ARCHIVO README.TXT

===============================================
