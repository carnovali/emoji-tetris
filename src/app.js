"use strict";
/* models */
////////////////////////////////////////////////////////////////////////
var GRID_VALID_VALUES;
(function (GRID_VALID_VALUES) {
    GRID_VALID_VALUES["BLACK"] = "\u2B1B";
    GRID_VALID_VALUES["WHITE"] = "\u2B1C";
    GRID_VALID_VALUES["BLUE"] = "\uD83D\uDFE6";
    GRID_VALID_VALUES["YELLOW"] = "\uD83D\uDFE8";
    GRID_VALID_VALUES["GREEN"] = "\uD83D\uDFE9";
    GRID_VALID_VALUES["RED"] = "\uD83D\uDFE5";
    GRID_VALID_VALUES["PURPLE"] = "\uD83D\uDFEA";
    GRID_VALID_VALUES["BROWN"] = "\uD83D\uDFEB";
    GRID_VALID_VALUES["ORANGE"] = "\uD83D\uDFE7";
})(GRID_VALID_VALUES || (GRID_VALID_VALUES = {}));
var MOVES;
(function (MOVES) {
    MOVES["UP"] = "up";
    MOVES["DOWN"] = "down";
    MOVES["LEFT"] = "left";
    MOVES["RIGHT"] = "right";
})(MOVES || (MOVES = {}));
/* constants */
////////////////////////////////////////////////////////////////////////
const shapesList = {
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
    addShape(options) {
        var _a;
        (_a = options.grid) === null || _a === void 0 ? void 0 : _a.addToShapesArray(options.shape);
    }
    moveShape(options) {
        var _a, _b;
        (_a = options.grid) === null || _a === void 0 ? void 0 : _a.moveShapeById((_b = options.shapeID) === null || _b === void 0 ? void 0 : _b.id, options.move);
    }
    rotateShape(options) {
        var _a, _b;
        (_a = options.grid) === null || _a === void 0 ? void 0 : _a.rotateShapeById((_b = options.shapeID) === null || _b === void 0 ? void 0 : _b.id);
    }
}
class CommandButton {
    constructor(buttonId, callback, options = {}) {
        this.buttonElem = document.getElementById(buttonId);
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
    constructor(grid, shape, id) {
        this.grid = grid;
        this._shape = shape;
        this._id = id;
    }
    get id() {
        return this._id;
    }
    get shape() {
        return this._shape;
    }
    set shape(newShape) {
        this._shape = newShape;
    }
    getMove(move) {
        let newShapePosition = Object.assign({}, this.shape.position);
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
    applyMove(move, isAutomatic) {
        const newPositionValue = this.getMove(move);
        if (this.grid.checkIfShapeCollides({
            value: this.shape.value,
            position: newPositionValue,
        }, isAutomatic)) {
            return;
        }
        this.shape.position = newPositionValue;
    }
    getRotate90() {
        const shapeValue = this.shape.value;
        const transposedShape = shapeValue.map((row, rowIndex) => row.map((_, colIndex) => shapeValue[colIndex][rowIndex]));
        return transposedShape.map((row) => row.reverse());
    }
    applyRotate90() {
        const newRotationValue = this.getRotate90();
        if (this.grid.checkIfShapeCollides({
            value: newRotationValue,
            position: this.shape.position,
        })) {
            return;
        }
        this.shape.value = newRotationValue;
    }
}
/* shapeUtils */
////////////////////////////////////////////////////////////////////////
const shapeUtils = {
    addOwnerToCell(unownedShapeValue, ownerID) {
        return unownedShapeValue.map((row) => row.map((cell) => (cell === null ? null : [cell, ownerID])));
    },
    addColorToShape(unownedShapeValue, color) {
        return unownedShapeValue.map((row) => row.map((cell) => (cell === null ? null : color)));
    },
    createShape(value, rowPos, colPos) {
        return {
            value: value,
            position: this.createShapeCoords(rowPos, colPos),
        };
    },
    createShapeCoords(rowPos, colPos) {
        return { rowPos: rowPos, colPos: colPos };
    },
};
/* grid */
////////////////////////////////////////////////////////////////////////
class Grid {
    constructor(gridRows, gridCols) {
        this._gridContainer = document.getElementById("gridContainer");
        this._gridShapesArray = [];
        this._isPlayingShapeTouchingGround = false;
        this._completedRowsThisTurn = 0;
        this.emptyCellColor = GRID_VALID_VALUES.BLACK;
        this.defaultGridArray = Array.from({ length: gridRows }, () => Array(gridCols).fill([this.emptyCellColor, null]));
        this.gridArray = this.defaultGridArray;
    }
    get gridContainer() {
        return this._gridContainer;
    }
    set gridContainer(newGridContainer) {
        this._gridContainer = newGridContainer;
    }
    get gridShapesArray() {
        return this._gridShapesArray;
    }
    set gridShapesArray(newgridShapesArray) {
        this._gridShapesArray = newgridShapesArray;
    }
    get isPlayingShapeTouchingGround() {
        return this._isPlayingShapeTouchingGround;
    }
    set isPlayingShapeTouchingGround(newIsPlayingShapeTouchingGround) {
        this._isPlayingShapeTouchingGround = newIsPlayingShapeTouchingGround;
    }
    get completedRowsThisTurn() {
        return this._completedRowsThisTurn;
    }
    set completedRowsThisTurn(newCompletedRowsThisTurn) {
        this._completedRowsThisTurn = newCompletedRowsThisTurn;
    }
    changeGrid(row, col, newValue) {
        this.gridArray[row][col] = newValue;
    }
    resetGrid() {
        this.gridArray = this.defaultGridArray.map((row) => [...row]);
    }
    findShapeArrayIndexById(shapeId) {
        const shapeIndex = this.gridShapesArray.findIndex(({ id }) => id === shapeId);
        return shapeIndex;
    }
    mergeShapeIntoGridArray(shape) {
        shape.value.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell === null)
                    return;
                const gridRow = shape.position.rowPos + rowIndex;
                const gridCol = shape.position.colPos + colIndex;
                this.changeGrid(gridRow, gridCol, cell);
            });
        });
    }
    mergeAllShapesArrayIntoGridArray() {
        this.resetGrid();
        for (let shapeObject of this.gridShapesArray) {
            this.mergeShapeIntoGridArray(shapeObject.shape);
        }
    }
    addToShapesArray(shapeParam) {
        const newShape = {
            value: shapeUtils.addOwnerToCell(shapeParam.value, this.gridShapesArray.length),
            position: {
                rowPos: shapeParam.position.rowPos,
                colPos: shapeParam.position.colPos,
            },
        };
        const newShapeObject = new ShapeObject(this, newShape, this.gridShapesArray.length);
        this.gridShapesArray.push(newShapeObject);
        this.mergeShapeIntoGridArray(newShapeObject.shape);
    }
    deleteShapeFromGrid(shape) {
        shape.value.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell === null)
                    return;
                const gridRow = shape.position.rowPos + rowIndex;
                const gridCol = shape.position.colPos + colIndex;
                this.changeGrid(gridRow, gridCol, [
                    this.emptyCellColor,
                    null,
                ]);
            });
        });
    }
    moveShapeById(shapeID, move, isAutomatic) {
        const shapeToChange = this.gridShapesArray[this.findShapeArrayIndexById(shapeID)];
        if (!shapeToChange)
            return;
        this.deleteShapeFromGrid(shapeToChange.shape);
        shapeToChange.applyMove(move, isAutomatic);
        this.mergeShapeIntoGridArray(shapeToChange.shape);
    }
    rotateShapeById(shapeID) {
        const shapeToChange = this.gridShapesArray[this.findShapeArrayIndexById(shapeID)];
        if (!shapeToChange)
            return;
        this.deleteShapeFromGrid(shapeToChange.shape);
        shapeToChange.applyRotate90();
        this.mergeShapeIntoGridArray(shapeToChange.shape);
    }
    manageCompletedRows() {
        this.gridArray.forEach((row, rowIndex) => {
            let skipRow = false;
            row.forEach((cell) => {
                if (cell[1] === null)
                    return (skipRow = true);
            });
            if (skipRow)
                return;
            this.deleteRow(rowIndex);
            this.downMultipleRows(rowIndex - 1);
            this.completedRowsThisTurn++;
        });
    }
    deleteRow(row) {
        this.gridArray[row].forEach((cell) => {
            cell = [this.emptyCellColor, null];
        });
    }
    downRow(row) {
        const whiteRow = Array.from({ length: 10 }, () => [this.emptyCellColor, null]);
        this.gridArray[row + 1] = this.gridArray[row];
        this.gridArray[row] = whiteRow;
    }
    downMultipleRows(rowsAmount) {
        for (let row = rowsAmount; row >= 0; row--) {
            this.downRow(row);
        }
    }
    checkIfShapeCollides(newShape, isAutomatic) {
        const newShapeValue = newShape.value;
        const newShapePosition = newShape.position;
        return newShapeValue.some((row, rowIndex) => {
            return row.some((cell, colIndex) => {
                var _a;
                if (cell === null)
                    return false;
                const newShapeGridPosition = (_a = this.gridArray[newShapePosition.rowPos + rowIndex]) === null || _a === void 0 ? void 0 : _a[newShapePosition.colPos + colIndex];
                if (!newShapeGridPosition ||
                    (newShapeGridPosition[1] !== null &&
                        newShapeGridPosition[1] !== cell[1])) {
                    if (isAutomatic)
                        this.shapeTouchedGround();
                    return true;
                }
            });
        });
    }
    shapeTouchedGround() {
        this.isPlayingShapeTouchingGround = true;
    }
    resetCompletedRows() {
        this.completedRowsThisTurn = 0;
    }
}
/* renderer */
////////////////////////////////////////////////////////////////////////
class Renderer {
    constructor(grid) {
        this.grid = grid;
        this.gridItemElements = [];
    }
    initializeGrid() {
        this.grid.gridArray.forEach((row) => row.forEach((cell) => {
            const gridItem = document.createElement("div");
            gridItem.classList.add("grid-item");
            gridItem.textContent = cell[0];
            this.grid.gridContainer.appendChild(gridItem);
            this.gridItemElements.push(gridItem);
        }));
    }
    updateGrid() {
        this.grid.gridArray.forEach((row, rowIndex) => row.forEach((cell, colIndex) => {
            const index = rowIndex * row.length + colIndex;
            const gridItem = this.gridItemElements[index];
            if (gridItem) {
                gridItem.textContent = cell[0];
            }
        }));
    }
}
/* game */
////////////////////////////////////////////////////////////////////////
class Game {
    constructor(grid, actions, renderer) {
        this.grid = grid;
        this.actions = actions;
        this.renderer = renderer;
        this.score = 0;
        this.isGameRunning = false;
        this.gameLoopId = null;
        this.isGameStarted = false;
        this.restartGame = () => {
            location.reload();
        };
        this.startGame = () => {
            if (!this.isGameStarted) {
                const newUnownedShapeValue = this.playableShapesValues[utils.getRandomNumber(this.playableShapesValues.length)];
                const newShape = shapeUtils.createShape(newUnownedShapeValue, 0, utils.getRandomNumber(this.grid.gridArray[0].length - newUnownedShapeValue.length));
                this.grid.addToShapesArray(newShape);
                this.isGameStarted = true;
            }
            this.toggleGameLoop();
        };
        this.gameLoop = () => {
            if (!this.isGameRunning) {
                return;
            }
            this.renderer.updateGrid();
            this.gameLoopId = requestAnimationFrame(this.gameLoop);
        };
        this.playingShapeID = {
            id: 0,
        };
        this.scoreElem = document.getElementById("score");
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
    automaticDownShape(delay) {
        this.gamePlayingInterval = setInterval(() => {
            this.grid.moveShapeById(this.playingShapeID.id, MOVES.DOWN, true);
            this.checkIfShapeTouchedGround();
        }, delay);
    }
    checkIfShapeTouchedGround() {
        if (!this.grid.isPlayingShapeTouchingGround)
            return;
        const newShape = shapeUtils.createShape(this.playableShapesValues[utils.getRandomNumber(this.playableShapesValues.length)], 0, utils.getRandomNumber(this.grid.gridArray[0].length - 2));
        if (this.checkGameOver())
            return this.gameOver();
        this.grid.manageCompletedRows();
        this.addScore();
        this.grid.isPlayingShapeTouchingGround = false;
        this.grid.addToShapesArray(newShape);
        this.playingShapeID.id++;
    }
    addScore() {
        this.score += this.grid.completedRowsThisTurn * 40;
        this.scoreElem.innerHTML = utils.transformScoreFormat(this.score);
        this.grid.resetCompletedRows();
    }
    checkGameOver() {
        for (let col of this.grid.gridArray[0]) {
            if (col === null || col[1] === null)
                continue;
            return true;
        }
        return false;
    }
    gameOver() {
        this.toggleGameLoop();
        console.log("GAME OVER");
    }
    pauseGameInterval() {
        clearInterval(this.gamePlayingInterval);
    }
    toggleGameLoop() {
        this.isGameRunning = !this.isGameRunning;
        if (this.isGameRunning) {
            this.startGameLoop();
        }
        else {
            this.stopGameLoop();
        }
    }
    startGameLoop() {
        if (!this.gameLoopId) {
            this.gameLoopId = requestAnimationFrame(this.gameLoop);
            this.automaticDownShape(700);
        }
    }
    stopGameLoop() {
        if (this.gameLoopId) {
            cancelAnimationFrame(this.gameLoopId);
            this.gameLoopId = null;
            this.pauseGameInterval();
        }
    }
    initializeGameLoop() {
        this.renderer.initializeGrid();
    }
}
/* utils */
////////////////////////////////////////////////////////////////////////
const utils = {
    getRandomNumber(amount) {
        return Math.floor(Math.random() * amount);
    },
    transformScoreFormat(score) {
        let scoreStr = score.toString();
        while (scoreStr.length < 5) {
            scoreStr = "0" + scoreStr;
        }
        return scoreStr;
    },
};
/* main */
////////////////////////////////////////////////////////////////////////
function main() {
    const grid = new Grid(20, 10);
    const actions = new Actions();
    const renderer = new Renderer(grid);
    const game = new Game(grid, actions, renderer);
    game.initializeGameLoop();
}
/* index */
////////////////////////////////////////////////////////////////////////
main();
