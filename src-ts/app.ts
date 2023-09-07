/* models */
////////////////////////////////////////////////////////////////////////

enum GRID_VALID_VALUES {
  BLACK = "⬛",
  WHITE = "⬜",
  BLUE = "🟦",
  YELLOW = "🟨",
  GREEN = "🟩",
  RED = "🟥",
  PURPLE = "🟪",
  BROWN = "🟫",
  ORANGE = "🟧",
}

enum MOVES {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}

type ownedCell = [GRID_VALID_VALUES, number | null];

type unownedShapeValue = (GRID_VALID_VALUES | null)[][];

type shapeValue = (ownedCell | null)[][];

type shapePosition = {
  rowPos: number;
  colPos: number;
};

type unownedShape = {
  value: unownedShapeValue;
  position: shapePosition;
};

type Shape = {
  value: shapeValue;
  position: shapePosition;
};

type GridArray = [GRID_VALID_VALUES, null | number][][];

interface Options {
  grid?: Grid;
  shape?: Shape;
  shapeID?: { id: number };
  move?: MOVES;
  delay?: number;
}

interface ShapesList {
  [key: string]: unownedShapeValue;
}

interface GameInputs {
  [key: string]: CommandButton;
}

/* constants */
////////////////////////////////////////////////////////////////////////

const shapesList: ShapesList = {
  shapeMap: [
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
  ],
  shapeTest: [
    [GRID_VALID_VALUES.BLACK, null, null, null, null],
    [GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK, null, null, null],
    [GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK, null, null],
    [GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK, null],
    [GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK],
  ],
  shapeL: [
    [GRID_VALID_VALUES.BLACK, null, null],
    [GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK],
    [null, null, null],
  ],
  shapeIL: [
    [null, null, GRID_VALID_VALUES.BLACK],
    [GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK],
    [null, null, null],
  ],
  shapeSq: [
    [GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK],
    [GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK],
  ],
  shapeZ: [
    [GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK, null],
    [null, GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK],
    [null, null, null],
  ],
  shapeIZ: [
    [null, GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK],
    [GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK, null],
    [null, null, null],
  ],
  shapeI: [
    [null, null, GRID_VALID_VALUES.BLACK, null],
    [null, null, GRID_VALID_VALUES.BLACK, null],
    [null, null, GRID_VALID_VALUES.BLACK, null],
    [null, null, GRID_VALID_VALUES.BLACK, null],
  ],
  shapeA: [
    [null, GRID_VALID_VALUES.BLACK, null],
    [GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK, GRID_VALID_VALUES.BLACK],
    [null, null, null],
  ],
};

/* inputs */
////////////////////////////////////////////////////////////////////////

class Actions {
  addShape(options: Options): void {
    options.grid?.addToShapesArray(options.shape as unownedShape);
  }

  moveShape(options: Options): void {
    options.grid?.moveShapeById(
      options.shapeID?.id as number,
      options.move as MOVES
    );
  }

  rotateShape(options: Options): void {
    options.grid?.rotateShapeById(options.shapeID?.id as number);
  }
}

class CommandButton {
  private buttonElem!: HTMLButtonElement;
  private callback: Function;
  private options: Options;

  constructor(
    buttonId: string,
    callback: Function,
    options: Options | {} = {}
  ) {
    this.buttonElem = document.getElementById(buttonId) as HTMLButtonElement;
    this.callback = callback;
    this.options = options;
    this.buttonElem.addEventListener("click", this.handleClick.bind(this));
  }

  handleClick() {
    this.callback(this.options);
  }
}

/* shape */
////////////////////////////////////////////////////////////////////////

class ShapeObject {
  private _shape: Shape;
  private _id: number;

  constructor(private grid: Grid, shape: Shape, id: number) {
    this._shape = shape;
    this._id = id;
  }

  public get id(): number {
    return this._id;
  }

  public get shape(): Shape {
    return this._shape;
  }

  public set shape(newShape: Shape) {
    this._shape = newShape;
  }

  getMove(move: MOVES): shapePosition {
    let newShapePosition: shapePosition = { ...this.shape.position };

    switch (move) {
      case MOVES.UP:
        newShapePosition.rowPos--;
        break;
      case MOVES.DOWN:
        newShapePosition.rowPos++;
        break;
      case MOVES.LEFT:
        newShapePosition.colPos--;
        break;
      case MOVES.RIGHT:
        newShapePosition.colPos++;
        break;
    }

    return newShapePosition;
  }

  applyMove(move: MOVES, isAutomatic?: boolean): void {
    const newPositionValue: shapePosition = this.getMove(move);
    if (
      this.grid.checkIfShapeCollides(
        {
          value: this.shape.value,
          position: newPositionValue,
        },
        isAutomatic
      )
    ) {
      return;
    }

    this.shape.position = newPositionValue;
  }

  getRotate90(): shapeValue {
    const shapeValue: shapeValue = this.shape.value;

    const transposedShape = shapeValue.map((row, rowIndex) =>
      row.map((_, colIndex) => shapeValue[colIndex][rowIndex])
    );

    return transposedShape.map((row) => row.reverse());
  }

  applyRotate90(): void {
    const newRotationValue: shapeValue = this.getRotate90();
    if (
      this.grid.checkIfShapeCollides({
        value: newRotationValue,
        position: this.shape.position,
      })
    ) {
      return;
    }

    this.shape.value = newRotationValue;
  }
}

/* shapeUtils */
////////////////////////////////////////////////////////////////////////

const shapeUtils = {
  addOwnerToCell(
    unownedShapeValue: unownedShapeValue,
    ownerID: number
  ): shapeValue {
    return unownedShapeValue.map((row) =>
      row.map((cell) => (cell === null ? null : [cell, ownerID]))
    );
  },

  addColorToShape(
    unownedShapeValue: unownedShapeValue,
    color: GRID_VALID_VALUES
  ) {
    return unownedShapeValue.map((row) =>
      row.map((cell) => (cell === null ? null : color))
    );
  },

  createShape(
    value: unownedShapeValue,
    rowPos: number,
    colPos: number
  ): unownedShape {
    return {
      value: value,
      position: this.createShapeCoords(rowPos, colPos),
    };
  },

  createShapeCoords(rowPos: number, colPos: number): shapePosition {
    return { rowPos: rowPos, colPos: colPos };
  },
};

/* grid */
////////////////////////////////////////////////////////////////////////

class Grid {
  gridArray: GridArray;

  private readonly defaultGridArray: GridArray;
  private _gridContainer = document.getElementById(
    "gridContainer"
  ) as HTMLElement;
  private _gridShapesArray: ShapeObject[] = [];

  private _isPlayingShapeTouchingGround: boolean = false;
  private _completedRowsThisTurn: number = 0;

  private emptyCellColor: GRID_VALID_VALUES = GRID_VALID_VALUES.BLACK;

  constructor(gridRows: number, gridCols: number) {
    this.defaultGridArray = Array.from({ length: gridRows }, () =>
      Array(gridCols).fill([this.emptyCellColor, null])
    );
    this.gridArray = this.defaultGridArray;
  }

  get gridContainer(): HTMLElement {
    return this._gridContainer;
  }

  set gridContainer(newGridContainer: HTMLElement) {
    this._gridContainer = newGridContainer;
  }

  get gridShapesArray(): ShapeObject[] {
    return this._gridShapesArray;
  }

  set gridShapesArray(newgridShapesArray: ShapeObject[]) {
    this._gridShapesArray = newgridShapesArray;
  }

  get isPlayingShapeTouchingGround(): boolean {
    return this._isPlayingShapeTouchingGround;
  }

  set isPlayingShapeTouchingGround(newIsPlayingShapeTouchingGround: boolean) {
    this._isPlayingShapeTouchingGround = newIsPlayingShapeTouchingGround;
  }

  get completedRowsThisTurn(): number {
    return this._completedRowsThisTurn;
  }

  set completedRowsThisTurn(newCompletedRowsThisTurn: number) {
    this._completedRowsThisTurn = newCompletedRowsThisTurn;
  }

  changeGrid(row: number, col: number, newValue: ownedCell): void {
    this.gridArray[row][col] = newValue;
  }

  resetGrid(): void {
    this.gridArray = this.defaultGridArray.map((row) => [...row]);
  }

  findShapeArrayIndexById(shapeId: number): number {
    const shapeIndex = this.gridShapesArray.findIndex(
      ({ id }) => id === shapeId
    );
    return shapeIndex;
  }

  mergeShapeIntoGridArray(shape: Shape): void {
    shape.value.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === null) return;

        const gridRow = shape.position.rowPos + rowIndex;
        const gridCol = shape.position.colPos + colIndex;

        this.changeGrid(gridRow, gridCol, cell as ownedCell);
      });
    });
  }

  mergeAllShapesArrayIntoGridArray(): void {
    this.resetGrid();
    for (let shapeObject of this.gridShapesArray) {
      this.mergeShapeIntoGridArray(shapeObject.shape);
    }
  }

  addToShapesArray(shapeParam: unownedShape): void {
    const newShape: Shape = {
      value: shapeUtils.addOwnerToCell(
        shapeParam.value,
        this.gridShapesArray.length
      ),
      position: {
        rowPos: shapeParam.position.rowPos,
        colPos: shapeParam.position.colPos,
      },
    };
    const newShapeObject: ShapeObject = new ShapeObject(
      this,
      newShape,
      this.gridShapesArray.length
    );

    this.gridShapesArray.push(newShapeObject);
    this.mergeShapeIntoGridArray(newShapeObject.shape);
  }

  deleteShapeFromGrid(shape: Shape): void {
    shape.value.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === null) return;

        const gridRow = shape.position.rowPos + rowIndex;
        const gridCol = shape.position.colPos + colIndex;

        this.changeGrid(gridRow, gridCol, [
          this.emptyCellColor,
          null,
        ] as ownedCell);
      });
    });
  }

  moveShapeById(shapeID: number, move: MOVES, isAutomatic?: boolean): void {
    const shapeToChange: ShapeObject =
      this.gridShapesArray[this.findShapeArrayIndexById(shapeID)];

    if (!shapeToChange) return;

    this.deleteShapeFromGrid(shapeToChange.shape);
    shapeToChange.applyMove(move, isAutomatic);
    this.mergeShapeIntoGridArray(shapeToChange.shape);
  }

  rotateShapeById(shapeID: number): void {
    const shapeToChange: ShapeObject =
      this.gridShapesArray[this.findShapeArrayIndexById(shapeID)];

    if (!shapeToChange) return;

    this.deleteShapeFromGrid(shapeToChange.shape);
    shapeToChange.applyRotate90();
    this.mergeShapeIntoGridArray(shapeToChange.shape);
  }

  manageCompletedRows(): void {
    this.gridArray.forEach((row, rowIndex) => {
      let skipRow: boolean = false;

      row.forEach((cell) => {
        if (cell[1] === null) return (skipRow = true);
      });

      if (skipRow) return;
      this.deleteRow(rowIndex);
      this.downMultipleRows(rowIndex - 1);
      this.completedRowsThisTurn++;
    });
  }

  deleteRow(row: number): void {
    this.gridArray[row].forEach((cell) => {
      cell = [this.emptyCellColor, null];
    });
  }

  downRow(row: number): void {
    const whiteRow: [GRID_VALID_VALUES, null][] = Array.from(
      { length: 10 },
      () => [this.emptyCellColor, null]
    );
    this.gridArray[row + 1] = this.gridArray[row];
    this.gridArray[row] = whiteRow;
  }

  downMultipleRows(rowsAmount: number): void {
    for (let row = rowsAmount; row >= 0; row--) {
      this.downRow(row);
    }
  }

  checkIfShapeCollides(newShape: Shape, isAutomatic?: boolean): boolean {
    const newShapeValue = newShape.value;
    const newShapePosition = newShape.position;

    return newShapeValue.some((row, rowIndex) => {
      return row.some((cell, colIndex) => {
        if (cell === null) return false;

        const newShapeGridPosition: ownedCell =
          this.gridArray[newShapePosition.rowPos + rowIndex]?.[
            newShapePosition.colPos + colIndex
          ];

        if (
          !newShapeGridPosition ||
          (newShapeGridPosition[1] !== null &&
            newShapeGridPosition[1] !== cell![1])
        ) {
          if (isAutomatic) this.shapeTouchedGround();
          return true;
        }
      });
    });
  }

  shapeTouchedGround(): void {
    this.isPlayingShapeTouchingGround = true;
  }

  resetCompletedRows(): void {
    this.completedRowsThisTurn = 0;
  }
}

/* renderer */
////////////////////////////////////////////////////////////////////////

class Renderer {
  gridItemElements: HTMLDivElement[];

  constructor(private grid: Grid) {
    this.gridItemElements = [];
  }

  initializeGrid() {
    this.grid.gridArray.forEach((row) =>
      row.forEach((cell) => {
        const gridItem = document.createElement("div");

        gridItem.classList.add("grid-item");
        gridItem.textContent = cell[0];
        this.grid.gridContainer.appendChild(gridItem);
        this.gridItemElements.push(gridItem);
      })
    );
  }

  updateGrid() {
    this.grid.gridArray.forEach((row, rowIndex) =>
      row.forEach((cell, colIndex) => {
        const index = rowIndex * row.length + colIndex;
        const gridItem = this.gridItemElements[index];

        if (gridItem) {
          gridItem.textContent = cell[0];
        }
      })
    );
  }
}

/* game */
////////////////////////////////////////////////////////////////////////

class Game {
  private inputs: GameInputs;
  private playingShapeID: { id: number };
  private playableShapesValues: unownedShapeValue[];

  private scoreElem: HTMLParagraphElement;
  private score: number = 0;

  private gamePlayingInterval!: number;
  private isGameRunning: boolean = false;
  private gameLoopId: number | null = null;

  private isGameStarted: boolean = false;

  constructor(
    private grid: Grid,
    private actions: Actions,
    private renderer: Renderer
  ) {
    this.playingShapeID = {
      id: 0,
    };

    this.scoreElem = document.getElementById("score") as HTMLParagraphElement;

    this.playableShapesValues = [
      shapeUtils.addColorToShape(shapesList.shapeL, GRID_VALID_VALUES.BLUE),
      shapeUtils.addColorToShape(shapesList.shapeSq, GRID_VALID_VALUES.YELLOW),
      shapeUtils.addColorToShape(shapesList.shapeZ, GRID_VALID_VALUES.RED),
      shapeUtils.addColorToShape(shapesList.shapeI, GRID_VALID_VALUES.PURPLE),
      shapeUtils.addColorToShape(shapesList.shapeA, GRID_VALID_VALUES.GREEN),
      shapeUtils.addColorToShape(shapesList.shapeIL, GRID_VALID_VALUES.ORANGE),
      shapeUtils.addColorToShape(shapesList.shapeIZ, GRID_VALID_VALUES.BROWN),
    ];

    this.inputs = {
      playButton: new CommandButton("play", this.startGame),

      restartButton: new CommandButton("restart", this.restartGame),

      downShapeButton: new CommandButton("down", this.actions.moveShape, {
        grid: this.grid,
        shapeID: this.playingShapeID,
        move: MOVES.DOWN,
      }),

      leftShapeButton: new CommandButton("left", this.actions.moveShape, {
        grid: this.grid,
        shapeID: this.playingShapeID,
        move: MOVES.LEFT,
      }),

      rightShapeButton: new CommandButton("right", this.actions.moveShape, {
        grid: this.grid,
        shapeID: this.playingShapeID,
        move: MOVES.RIGHT,
      }),

      rotateShapeButton: new CommandButton("rotate", this.actions.rotateShape, {
        grid: this.grid,
        shapeID: this.playingShapeID,
      }),
    };
  }

  automaticDownShape(delay: number): void {
    this.gamePlayingInterval = setInterval(() => {
      this.grid.moveShapeById(this.playingShapeID.id, MOVES.DOWN, true);
      this.checkIfShapeTouchedGround();
    }, delay);
  }

  checkIfShapeTouchedGround(): void {
    if (!this.grid.isPlayingShapeTouchingGround) return;

    const newShape: unownedShape = shapeUtils.createShape(
      this.playableShapesValues[
        utils.getRandomNumber(this.playableShapesValues.length)
      ],
      0,
      utils.getRandomNumber(this.grid.gridArray[0].length - 2)
    );

    if (this.checkGameOver()) return this.gameOver();

    this.grid.manageCompletedRows();
    this.addScore();
    this.grid.isPlayingShapeTouchingGround = false;
    this.grid.addToShapesArray(newShape);
    this.playingShapeID.id++;
  }

  addScore(): void {
    this.score += this.grid.completedRowsThisTurn * 40;
    this.scoreElem.innerHTML = utils.transformScoreFormat(this.score);
    this.grid.resetCompletedRows();
  }

  checkGameOver(): boolean {
    for (let col of this.grid.gridArray[0]) {
      if (col === null || col[1] === null) continue;
      return true;
    }
    return false;
  }

  gameOver(): void {
    this.toggleGameLoop();
    console.log("GAME OVER");
  }

  private pauseGameInterval() {
    clearInterval(this.gamePlayingInterval);
  }

  private restartGame = () => {
    location.reload();
  };

  private startGame = () => {
    if (!this.isGameStarted) {
      const newUnownedShapeValue: unownedShapeValue =
        this.playableShapesValues[
          utils.getRandomNumber(this.playableShapesValues.length)
        ];
      const newShape: unownedShape = shapeUtils.createShape(
        newUnownedShapeValue,
        0,
        utils.getRandomNumber(
          this.grid.gridArray[0].length - newUnownedShapeValue.length
        )
      );

      this.grid.addToShapesArray(newShape);
      this.isGameStarted = true;
    }
    this.toggleGameLoop();
  };

  private toggleGameLoop(): void {
    this.isGameRunning = !this.isGameRunning;
    if (this.isGameRunning) {
      this.startGameLoop();
    } else {
      this.stopGameLoop();
    }
  }

  private startGameLoop(): void {
    if (!this.gameLoopId) {
      this.gameLoopId = requestAnimationFrame(this.gameLoop);
      this.automaticDownShape(700);
    }
  }

  private stopGameLoop(): void {
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
      this.pauseGameInterval();
    }
  }

  private gameLoop = () => {
    if (!this.isGameRunning) {
      return;
    }

    this.renderer.updateGrid();
    this.gameLoopId = requestAnimationFrame(this.gameLoop);
  };

  initializeGameLoop(): void {
    this.renderer.initializeGrid();
  }
}

/* utils */
////////////////////////////////////////////////////////////////////////

const utils = {
  getRandomNumber(amount: number) {
    return Math.floor(Math.random() * amount);
  },

  transformScoreFormat(score: number): string {
    let scoreStr: string = score.toString();
    while (scoreStr.length < 5) {
      scoreStr = "0" + scoreStr;
    }
    return scoreStr;
  },
};

/* main */
////////////////////////////////////////////////////////////////////////

function main(): void {
  const grid: Grid = new Grid(20, 10);
  const actions: Actions = new Actions();
  const renderer: Renderer = new Renderer(grid);
  const game: Game = new Game(grid, actions, renderer);

  game.initializeGameLoop();
}

/* index */
////////////////////////////////////////////////////////////////////////

main();
