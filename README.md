 # TERIS

 TERIS is a classic block-stacking puzzle game, reimagined with a dark, existential narrative. Players manipulate falling tetrominoes to clear lines, but the game's story suggests a deeper, inescapable cycle.

 ## Features

 *   **Classic Tetris Gameplay:** Move, rotate, hard drop, and hold tetrominoes to clear lines.
 *   **Next Piece Preview:** See the upcoming 5 pieces to plan your strategy.
 *   **Ghost Piece:** A translucent outline shows where your piece will land, aiding in precise placement.
 *   **Scoring System:** Track your score, lines cleared, and current level.
 *   **Lives System:** You have 3 lives; losing a piece to the top of the board costs a life. Game over when lives run out.
 *   **Pause Functionality:** Pause and resume the game at any time.
 *   **Dynamic Difficulty:** The drop speed increases as you clear more lines and level up.
 *   **Existential Narrative:** A unique story unfolds in the main menu and game over screens, adding a philosophical layer to the classic game.
 *   **Responsive Design:** The game adapts to different screen sizes.

 ## How to Play

 ### Controls:

 *   **Left Arrow / A:** Move piece left
 *   **Right Arrow / D:** Move piece right
 *   **Down Arrow / S:** Soft drop (move piece down faster, gain 1 point per cell)
 *   **Up Arrow / W:** Rotate piece
 *   **Spacebar:** Hard drop (instantly drop piece, gain 2 points per cell dropped)
 *   **SHIFT:** Hold piece (swap current piece with held piece, or hold current if none is held)
 *   **P:** Pause/Unpause game
 *   **R:** Restart game (from pause menu)

 ### Objective:

 Clear as many lines as possible by forming complete horizontal rows of blocks. The game ends when you run out of lives.

 ## Installation and Setup

 To run TERIS, simply:

 1.  **Clone the repository** or download the project files to your local machine.
 2.  Open the `index.html` file in your preferred web browser. This will take you to the main menu with the introductory story.
 3.  Click "START" to begin the game.

 Alternatively, you can directly open `game.html` to jump straight into the game.

 ## Technologies Used

 *   **HTML:** For the game structure and content.
 *   **CSS:** For styling and animations.
 *   **JavaScript:** For game logic and interactivity.

 ## Project Structure

 ```
 teris/
 ├── index.html          # Main menu with game introduction
 ├── game.html           # The main game interface
 ├── gameover.html       # Game over screen with concluding narrative
 ├── Style/
 │   ├── main-menu.css   # Styles specific to the main menu
 │   └── style.css       # General game styles
 └── js/
     ├── constants.js    # Game constants (grid size, colors, shapes)
     ├── dom.js          # DOM element references
     ├── game.js         # Core game logic (movement, scoring, line clearing)
     ├── main.js         # Entry point for game initialization and event listeners
     ├── state.js        # Manages game state (grid, active piece, score, etc.)
     └── view.js         # Handles rendering game elements to the DOM
 ```