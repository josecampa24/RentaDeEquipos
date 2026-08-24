# RentaEventos - Sistema de Gestión de Rentas

RentaEventos es un sistema web moderno diseñado para administrar y automatizar el flujo de trabajo de un negocio de renta de equipos para eventos (bocinas, luces, sillas, mesas, etc.). 

La plataforma permite tener un control total sobre el inventario, los clientes, la creación de rentas y el procesamiento de las devoluciones; todo sincronizado en tiempo real a través de una base de datos en la nube.

---

## 🛠 Tecnologías Utilizadas

* **Frontend:** Vue 3, Vite, Tailwind CSS
* **Estado y Enrutamiento:** Pinia, Vue Router
* **Backend y Base de Datos:** Supabase (PostgreSQL)

---

## 📦 Estructura de Módulos

El sistema está compuesto por los siguientes módulos principales, accesibles a través del menú lateral:

### 1. Dashboard (Panel Principal)
Proporciona una vista rápida de la salud del negocio. Calcula y muestra en tiempo real:
* **Rentas Activas:** Total de rentas en curso (status `CONFIRMADA`).
* **Ingresos del Mes:** Suma automática del valor de las rentas que iniciaron en el mes y año actual.
* **Devoluciones Pendientes:** Identifica aquellas rentas cuya fecha de finalización ya expiró pero aún no se ha registrado la devolución.
* **Equipos en Mantenimiento:** Alertas de equipos que requieren revisión.

### 2. Equipos (Inventario)
Módulo encargado del catálogo físico.
* Permite crear, editar y visualizar equipos.
* Atributos de cada equipo: SKU (Código), Nombre, Categoría, Precio de Renta Diario y Cantidad (Stock total disponible).

### 3. Clientes
Agenda y directorio.
* Registro de nuevos clientes (Nombre, Teléfono, Email, Dirección).
* Vinculación directa con el módulo de rentas.

### 4. Rentas y Devoluciones
El núcleo operativo de la plataforma. Combina inteligentemente el flujo de salida y entrada de mercancía.
* **Nueva Renta:** Formulario dinámico para vincular un Cliente, definir fechas de inicio y fin, y agregar uno o múltiples equipos. Al guardarse, el sistema **descuenta automáticamente** la cantidad rentada del inventario de Equipos. Además calcula de forma automática el precio total según los días seleccionados.
* **Rentas Activas:** Lista de pedidos que están físicamente en manos del cliente. Muestra claramente la cantidad de equipos prestados, con alertas visuales si la devolución está atrasada.
* **Procesar Devolución:** Permite recibir los equipos, especificando si regresaron en BUENA condición, DAÑADOS o PERDIDOS. Al procesar, el sistema **devuelve automáticamente el stock** al inventario y pasa la renta al historial.
* **Historial:** Bitácora inmutable de todas las rentas y devoluciones completadas para futuras aclaraciones y reportes.

---

## ⚙️ Estructura de la Base de Datos (Supabase)

El sistema utiliza bases de datos relacionales aseguradas con UUIDs y cascadas:

1. `equipments`: Almacena el inventario maestro (columnas: *sku, name, category, quantity, dailyPrice, status*).
2. `clients`: Almacena el padrón de clientes.
3. `rentals`: Registra el evento general de renta (columnas: *client_id, start_date, end_date, total_price, status*).
4. `rental_items`: Tabla detalle que conecta la Renta con los Equipos específicos y sus cantidades (*rental_id, equipment_id, quantity, price*).
5. `returns`: Registro del momento exacto de entrega y sus condiciones (*rental_id, return_date, condition, comments*).

Todas las tablas cuentan con políticas RLS (Row-Level Security) habilitadas para garantizar la privacidad y control de acceso de los datos.

---

## 🚀 Cómo iniciar el proyecto

1. Navega a la carpeta principal del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Configura el archivo `.env` en la raíz de `/frontend` con tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_llave_publica_anonima
   ```
4. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
5. Abre la aplicación en tu navegador (usualmente en `http://localhost:5173`).
