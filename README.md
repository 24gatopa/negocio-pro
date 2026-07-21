# Negocio Pro — Guía paso a paso (sin saber programar)

## ¿Qué necesitas instalar en tu computadora?

1. **Node.js** (versión 18 o más nueva): descárgalo de https://nodejs.org (elige la versión "LTS") e instálalo como cualquier programa (Siguiente, Siguiente, Instalar).
2. Un editor de texto para ver los archivos, recomendado **VS Code**: https://code.visualstudio.com (opcional, pero ayuda).
3. En tu celular, instala la app **"Expo Go"** desde Play Store o App Store (gratis). La usarás para ver tu app mientras la desarrollas.

## Paso 1: Descomprime el proyecto

Descomprime el archivo `negocio-pro.zip` que te di en una carpeta, por ejemplo en tu Escritorio.

## Paso 2: Abre una terminal dentro de la carpeta

- Windows: entra a la carpeta `negocio-pro`, haz clic derecho dentro de ella y elige "Abrir en Terminal" (o "Abrir ventana de PowerShell aquí").
- Mac: abre la app "Terminal", escribe `cd ` (con un espacio) y luego arrastra la carpeta `negocio-pro` a la ventana, presiona Enter.

## Paso 3: Instala las dependencias

Copia y pega este comando en la terminal, presiona Enter, y espera (puede tardar 2-5 minutos):

```
npm install
```

## Paso 4: Configura Firebase (la base de datos y el login)

1. Ve a https://console.firebase.google.com
2. Haz clic en "Crear un proyecto", ponle un nombre (ej. "negocio-pro") y termina el asistente.
3. Dentro del proyecto, haz clic en el ícono **</>** (Web) para "Agregar app".
4. Ponle un apodo (ej. "negocio-pro-web") y haz clic en "Registrar app".
5. Firebase te mostrará un bloque de código con datos como `apiKey`, `authDomain`, etc. Copia esos valores.
6. Abre el archivo `firebaseConfig.js` (está en la raíz del proyecto) y reemplaza los textos `'TU_API_KEY'`, `'TU_PROYECTO'`, etc. por tus valores reales.
7. En el menú izquierdo de Firebase, entra a **Authentication** → pestaña "Sign-in method" → habilita **"Correo electrónico/contraseña"**.
8. En el menú izquierdo, entra a **Firestore Database** → "Crear base de datos" → elige **"Modo de prueba"** (para empezar rápido) → Siguiente → Habilitar.

## Paso 5: Ejecuta la app

En la terminal, dentro de la carpeta del proyecto, escribe:

```
npx expo start
```

Va a aparecer un código QR:

- **En tu celular**: abre la app Expo Go y escanea ese código QR. La app se abrirá en tu teléfono.
- **En la web (tu navegador)**: en la terminal donde salió el QR, presiona la tecla `w`. Se abrirá automáticamente en Chrome/Edge.

## Paso 6: Prueba la app

1. En la pantalla de registro, crea una cuenta con un correo y contraseña.
2. Ve a "Inventario" → "+ Agregar Producto" y crea 2 o 3 productos.
3. Ve a "Registro de ventas", selecciona cantidades de esos productos y "Guardar Venta".
4. Revisa "Historial de Ventas" y "Mis Ganancias" para ver los datos actualizados.

## Si sale un error

Copia el mensaje de error completo que aparece en la terminal (o en la pantalla del celular) y pégamelo aquí en el chat — te ayudo a solucionarlo enseguida.

Errores comunes:
- **"Firebase: Error (auth/invalid-api-key)"** → No cambiaste los datos en `firebaseConfig.js`, o los copiaste mal.
- **"Missing or insufficient permissions"** → En Firestore, revisa que elegiste "Modo de prueba" al crear la base de datos.
- La terminal se queda pegada instalando → cierra la terminal, ábrela de nuevo y corre `npm install` otra vez.

## Estructura del proyecto

```
negocio-pro/
├── App.js                     -> Punto de entrada, maneja login/logout
├── firebaseConfig.js          -> Aquí pegas tus claves de Firebase
├── app.json                   -> Configuración de Expo
├── package.json                -> Lista de librerías necesarias
└── src/
    ├── components/
    │   └── BottomNav.js        -> Barra inferior de navegación
    └── screens/
        ├── LoginScreen.js
        ├── RegisterScreen.js
        ├── WelcomeScreen.js
        ├── InventoryScreen.js
        ├── AddProductScreen.js
        ├── SalesScreen.js
        ├── SalesHistoryScreen.js
        └── EarningsScreen.js
```

## Sobre "Clientes que deben" (en Mis Ganancias)

Por ahora esa lista se llena automáticamente si una venta se guarda con el campo `deuda: true`. En esta primera versión todas las ventas se guardan como pagadas (efectivo). Si quieres, en el siguiente paso puedo agregarte un botón "Fiado / Debe" en la pantalla de Registro de ventas para marcar ventas pendientes de pago — solo dímelo.
