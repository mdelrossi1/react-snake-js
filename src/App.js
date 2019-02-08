import React, { PureComponent } from 'react';
import './App.css';

const boardSize = 25;
const startingPosition = {
  x: 0,
  y: 0
}
const createBoard = () => {
  let board = [];

  for (var i = 0; i < boardSize; i++) {
    let row = [];

    for (var j = 0; j < boardSize; j++) {
      row.push([{
        snakeCount: 0,
        hasApple: false
      }]);
    }

    board.push(row)
  }

  return board;
}

class Block extends PureComponent {
  render() {
    let {
      hasSnake,
      hasApple
    } = this.props,
    baseClassName = 'block',
    className = baseClassName;

    className = hasSnake ? `${className} ${baseClassName}--has-snake` : className;
    className = hasApple ? `${className} ${baseClassName}--has-apple` : className;

    return (
      <div className={className}></div>
    )
  }
}

class BoardRow extends PureComponent {
  render() {
    return (
      <div className='row'>
        {this.props.children}
      </div>
    )
  }
}

class App extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      board: createBoard(),
      gameOver: false,
      snakeLength: 1,
      snakePosition: Object.assign({}, startingPosition),
      direction: {
        x: 1,
        y: 0
      }
    };
  }

  setSnakeStartingPosition = () => {
    let {
      snakePosition
    } = this.state;

    this.setSnakePosition(snakePosition.x, snakePosition.y)
  }

  reduceSnakeCounts = () => {
    this.changeSnakeCounts(-1);
  }

  increaseSnakeCounts = () => {
    this.changeSnakeCounts(1);
  }

  changeSnakeCounts = count => {
    this.setState(prevState => {
      let board = [...prevState.board];

      board = board.map(row=>row.map(cell=>cell[0].snakeCount > 0 ? [{snakeCount: cell[0].snakeCount + count, hasApple: cell[0].hasApple}] : cell))

      return {
        board
      }
    })
  }

  endGame = () => {
    clearInterval(this.moveInterval);
    this.setState({gameOver: true});
  }

  setSnakePosition = (x, y) => {
    let {
      board,
      snakeLength
    } = this.state;

    if (typeof board[x] === 'undefined') {
      this.endGame();
      return;
    }

    if (typeof board[x][y] === 'undefined') {
      this.endGame();
      return;
    }

    if (board[x][y][0].snakeCount > 0) {
      this.endGame();
      return;
    }

    if (board[x][y][0].hasApple) {
      this.increaseSnakeCounts();
      this.setState(prevState => {
        let nextBoard = [...prevState.board],
            snakeLength = prevState.snakeLength;

        nextBoard[x][y][0].hasApple = false;
        snakeLength++

        return {
          board: nextBoard,
          snakeLength
        }
      })

      this.placeApple()
    }

    this.setState(prevState => {
      let board = [...prevState.board],
          snakePosition = Object.assign({}, prevState.snakePosition),
          snakeLength = prevState.snakeLength,
          gameOver = false;

      board[x][y][0].snakeCount = snakeLength;
      snakePosition = {
        x,
        y
      }

      return {
        board,
        gameOver,
        snakePosition
      }
    });
  }

  moveSnake = () => {
    let {
      direction,
      snakePosition
    } = this.state;

    this.reduceSnakeCounts();
    this.setSnakePosition(snakePosition.x + direction.x, snakePosition.y + direction.y)
  }

  placeApple = () => {
    let x = Math.round(Math.random() * (boardSize - 1)),
        y = Math.round(Math.random() * (boardSize - 1));

    this.setState(prevState => {
      let board = [...prevState.board];

      board[x][y][0].hasApple = true

      return {
        board
      }
    })
  }

  startGame = () => {
    this.moveInterval = setInterval(() => {
      this.moveSnake();
    }, 100)
  }

  setDirection = (x, y) => {
    let {
          direction
        } = this.state,
        shouldChangeDirection = (x + direction.x !== 0) && (y + direction.y !== 0);

    if (!shouldChangeDirection) {
      return;
    }

    this.setState({
      direction: {
        x,
        y
      }
    })
  }

  keyUpHandler = e => {
    switch (e.key) {
      case 'ArrowUp':
        this.setDirection(-1, 0)
        break;

      case 'ArrowRight':
        this.setDirection(0, 1)
        break;

      case 'ArrowDown':
        this.setDirection(1, 0)
        break;

      case 'ArrowLeft':
        this.setDirection(0, -1)
        break;

      default:
        break;
    }
  }

  componentDidMount = () => {
    this.setSnakeStartingPosition();
    this.placeApple();
    this.startGame();
    window.onkeyup = this.keyUpHandler
  }

  renderBoardRowContents = (val, i) => {
    let hasSnake = val[0].snakeCount > 0,
        hasApple = val[0].hasApple;

    return <Block hasSnake={hasSnake} hasApple={hasApple} key={i} />
  }

  renderBoardRow = (row, i) => <BoardRow key={i}>{row.map(this.renderBoardRowContents)}</BoardRow>

  render() {
    let {
      board
    } = this.state;

    return (
      <div className='App'>
        <div className='board'>
          {board.map(this.renderBoardRow)}
        </div>
      </div>
    );
  }
}

export default App;
