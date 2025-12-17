===============================================
README.TXT — Agente Automatizado para Solicitud y Gestión de Salas de Reuniones.
Práctica I – Universidad Andrés Bello
Flujos de automatización n8n del proyecto Sistema de Reservas de Salas Institucionales 
Sistema de Reservas - Flujos n8n
===============================================

Manuales de Instalación y Despliegue

---------------------
MANUAL DE INSTALACIÓN
---------------------
1. Conexión al servidor
1.1 Desde laboratorios
● Utilizar PuTTY, Terminus o cualquier cliente SSH.
● Datos de conexión:
o Dirección IP: 10.40.5.8
o Puerto: 22
o Usuario: alumno
o Password: Unab.2025

1.2 Desde casa
1. Descargar e instalar FortiClient VPN.
2. Configurar conexión:
o Gateway remoto: 200.27.73.13
o Usuario: Usuario intranet
o Password: Password intranet
3. Conectarse al servidor vía SSH: ssh alumno@10.40.5.8

1.3 Verificación de acceso
Una vez conectado ejecutar:
whoami
pwd

2. Instalación de Docker
Esta configuración se realiza una sola vez en el servidor y se mantiene.
1. Verificar si Docker está instalado:
docker --version
2. En caso de no existir Docker, se debe instalar antes de continuar.

3. Configuración de Docker Compose
3.1 Archivo /n8n/docker-compose.yml
services:
n8n:
image: n8nio/n8n:latest
restart: always
ports:
- "5678:5678"
env_file:
- .env
volumes:
- ./data:/home/node/.n8n
depends_on:
- postgres
postgres:
image: postgres:15
restart: always
env_file:
- .env
environment:
- POSTGRES_USER=${DB_POSTGRESDB_USER}
- POSTGRES_PASSWORD=${DB_POSTGRESDB_PASSWORD}
- POSTGRES_DB=${DB_POSTGRESDB_DATABASE}
volumes:
- ./data/postgres:/var/lib/postgresql/data
networks:
default:
name: n8n_net
4. Archivo de variables de entorno
4.1 Archivo /n8n/.env
# --- Base de datos ---
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=N8nDb_2025!
# --- n8n core ---
N8N_HOST=0.0.0.0
N8N_PORT=5678
N8N_PROTOCOL=https
N8N_PATH=/n8n/
WEBHOOK_URL=https://{{dominio}}.com/n8n/
N8N_ENCRYPTION_KEY=KeyN8n_2025
N8N_CORS_ALLOW_ORIGIN=*
# --- Opcionales ---
# N8N_DIAGNOSTICS_ENABLED=false
# N8N_METRICS=true

El valor de WEBHOOK_URL debe ser un dominio válido, ya que Google OAuth2 no
funciona con IP.

--------------------
MANUAL DE DESPLIEGUE
--------------------

1. Ubicación del despliegue
El despliegue del sistema se realiza desde la carpeta donde se encuentra configurado n8n:
/n8n/
2. Inicio del sistema
2.1 Inicio de Docker
Para iniciar el sistema en segundo plano, ejecutar el siguiente comando:
sudo docker compose up -d
Este comando levanta los servicios necesarios para el funcionamiento de n8n.
2.2 Exposición del servicio con ngrok
Una vez iniciado Docker, se debe ejecutar ngrok para conectar el dominio con el puerto
HTTPS donde se encuentra n8n:
ngrok http 443
Este comando permite que n8n sea accesible mediante un dominio válido.
3. Enlaces del sistema
Una vez desplegado el sistema, se encuentran disponibles los siguientes enlaces:
● Frontend del sistema:
● http://10.40.5.8
Este enlace redirige a index.html.
● Plataforma n8n:
● https://10.40.5.8/n8n/home/workflows
4. Verificación de credenciales en n8n
Se debe comprobar que n8n tenga configuradas correctamente las siguientes credenciales:
● Microsoft OAuth2 API
● Google OAuth2 API
● Google Sheets OAuth2 API
● Gmail OAuth2 API
● Google Calendar OAuth2 API
Todas las credenciales deben encontrarse activas y sin errores.
5. Ajustes finales en el flujo principal
Una vez abierto el flujo principal, se deben ajustar ciertos parámetros antes de su
ejecución.
5.1 Nodos marcados con nota roja
Dentro del flujo principal existen nodos marcados con una nota roja, los cuales indican que
requieren revisión manual.
5.2 Revisión de nodos Script
En los nodos de tipo Script se debe revisar que:
● El client_id sea el correcto (credencial Microsoft).
● El redirectUri tenga el mismo dominio que se utiliza en el despliegue (dominio
entregado por ngrok).
El valor de redirectUri debe ajustarse según el uso del flujo:
● /webhook/ para dejar el flujo activo.
● /webhook-test/ para realizar pruebas.
5.3 Revisión de nodos HTTP
En los nodos HTTP encargados de solicitar el token, se debe verificar que:
● El client_id corresponda a la credencial Microsoft.
● El client_secret corresponda a la credencial Microsoft.
6. Cierre del despliegue
Una vez realizados estos pasos, el sistema queda correctamente desplegado y listo para su
uso.

----------------------
----------------------
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

4. Credenciales Utilizadas 
4.1 Google OAuth2

Utilizado para:

 -Crear eventos
 -Eliminar eventos
 -Leer disponibilidad
 -Registrar filas en Google Sheets
 -Enviar emails

4.2 Microsoft Azure OAuth2

 -Usado para validar correos institucionales.

Parámetros configurados:

 -client_id
 -redirect_uri usando ngrok
 -scope: User.Read

Azure fue utilizado específicamente en HU-05 (validación de correo institucional).

4.3 Almacenamiento de credenciales

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

5. Flujos Implementados (Sprint 1 y Sprint 2)
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

6. Pruebas del Sistema
6.1 Pruebas con Postman

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

6.2 Validaciones realizadas
 - Creación de eventos Calendar
 - Eliminación de eventos
 - Escritura y lectura en Google Sheets
 - Envío correos por Gmail Node
 - Manejo de errores <Stop and Error>
 - Validación Azure con dominio institucional

7. Control de Versión del Proyecto (GitHub)

Ramas utilizadas:

main → versión estable
Contiene: Todas las historias Usuario del sprint 1 y 2
- sprint2 → HU 03, 04, 06 corregida, 08, 09
- Flujo Principal: Contiene el Flujo integrado (Todas las historias de usuario del incremento 1 y 2 ya integradas)
  - Se sube cada cambio que tiene el flujo a esta rama para actualizarse en uno solo archivo.

Notas:

HU-06 fue trasladada desde Sprint 1, completada en Sprint 2 y será ajustada y refactorizada en Sprint 3.

8. Equipo del Proyecto

- Scrum Master: Vicente Núñez
- Product Owner: Kevin Soto

Developers:

- Francisco Espinoza
- Nicolás Torres
- Walter Chávez

Testers: PO / SM

9. Estado Actual

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
