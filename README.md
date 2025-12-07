# FRONTEND - Oh Sansi

Frontend del proyecto **Olimpiadas Oh\! SanSi 2025**, desarrollado con **React**, **TypeScript** y estilizado con **Tailwind CSS**. Utiliza la plantilla **TailAdmin** como base para el diseño del *dashboard* administrativo.

## 🛠️ Tecnología Principal

Este proyecto está construido con una pila de desarrollo moderna y eficiente:

  * **React:** Biblioteca principal para la construcción de la interfaz de usuario.
  * **TypeScript:** Para una tipificación robusta y código más escalable.
  * **Tailwind CSS:** Framework de CSS *utility-first* para un diseño rápido y responsivo.

## 🚀 Instalación y Configuración

### Pre requisitos

Asegúrate de tener instalado y configurado lo siguiente:

  * **Node.js** 18.x o posterior (se recomienda 20.x o posterior).

### Clonar el Repositorio

Clona el repositorio usando el siguiente comando:

```bash
git clone https://github.com/Erick-SOS/OH-SANSI-FRONT.git
cd OH-SANSI-FRONT
```

> **Nota para usuarios de Windows:** Si experimentas problemas al clonar o instalar, coloca el repositorio cerca de la raíz de tu unidad.

### Puesta en Marcha

1.  Instala las dependencias del proyecto:

    ```bash
    npm install
    # o
    yarn install
    ```

2.  Inicia el servidor de desarrollo:

    ```bash
    npm run dev
    # o
    yarn dev
    ```

    Esto abrirá la aplicación en modo desarrollo con recarga automática.

## ⚙️ Desarrollo y Estructura

El frontend está diseñado para ser un panel administrativo (*dashboard*) robusto y una plataforma de visualización de resultados.

## 🗃️ Git - Subir Cambios y Gestión

Para mantener el control de versiones, sigue estas pautas:

1.  Verifica los cambios en tu directorio de trabajo:

    ```bash
    git status
    ```

2.  Prepara todos los archivos modificados para el commit:

    ```bash
    git add .
    ```

3.  Guarda los cambios temporalmente (Stash):

    ```bash
    git stash
    ```

    (Para cambiar de rama sin comitear).

4.  Crea un commit con un mensaje descriptivo:

    ```bash
    git commit -m "feat: [Descripción corta del nuevo feature o cambio]"
    ```

    > **Convención:** Usar prefijos como `feat:`, `fix:`, `docs:`, etc.

5.  Sube tus cambios al repositorio remoto:

    ```bash
    git push origin nombre-de-la-rama
    ```

6.  Actualiza tu rama local con los cambios remotos:

    ```bash
    git pull
    ```

7.  Elimina `node_modules` del *staging* si hubo un error en el *deploy*:

    ```bash
    git rm -r --cached node_modules
    ```
