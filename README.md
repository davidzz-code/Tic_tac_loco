# Tic Tac Loco

Tic Tac Loco es una versión moderna del clásico juego de "*Tic Tac Toe*" o "*Tres en raya*" en español. Se trata de una versión mucho más complicada y estratégica, que ofrece una experiencia de juego más desafiante.

Este proyecto está construido usando React, Vite y Tailwind CSS. Cuenta con modos de un jugador y multijugador, con un oponente de IA impulsado por ChatGPT a través de la API de OpenAI.

![Vista previa del juego](/client/public/assets/game_mockup.webp)

![Vista previa del menú principal](/client/public/assets/menu_mockup.webp)

## Tabla de Contenidos

- [Características](#características)
- [Instalación](#instalación)
- [Uso](#uso)
- [Reglas del Juego](#reglas-del-juego)
- [Contribuciones](#contribuciones)

## Características

- Modo de un jugador contra IA
- Modo multijugador local
- Tablero de juego interactivo con efectos visuales
- Guía de cómo jugar
- Diseño responsive

## Instalación

1. Clona el repositorio:
    ```sh
    git clone https://github.com/tu-usuario/tic-tac-loco.git
    cd tic-tac-loco/client
    ```

2. Instala las dependencias:
    ```sh
    npm install
    ```

3. Inicia el servidor de desarrollo:
    ```sh
    npm run dev
    ```

## Uso

1. Abre tu navegador y navega a `http://localhost:5173`.
2. Selecciona el modo de juego (Un Jugador o Multijugador).
3. Sigue las instrucciones en pantalla para jugar.

## Reglas del Juego

- El objetivo es conseguir tres en raya en el tablero principal.
- Cada tablero pequeño funciona como un juego regular de Tic Tac Toe.
- Ganar un tablero pequeño bloquea esa posición en el tablero principal con tu símbolo.
- Tu movimiento determina dónde jugará tu oponente a continuación.
- Si te envían a un tablero bloqueado, puedes elegir cualquier posición libre en el tablero principal.

## Contribuciones

Las contribuciones son bienvenidas! Abre un issue o envía un pull request para cualquier mejora o corrección de errores.
