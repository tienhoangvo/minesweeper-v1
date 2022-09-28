import { useEffect } from 'react'
import Dialog from '../Dialog'

const ResultDialog = ({ open, message, restart, newGame }) => {

  const handleRestartClick = () => {
    restart()
  }

  const handleNewGameClick = () => {
    newGame()
  }


  return (
    <Dialog open={open}>
      <article>
        <header>
          <h2>Result Announcement</h2>
        </header>
        <p>{message}</p>
        <footer>
          <menu
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              margin: 0,
              padding: 0,
            }}
          >
            <button onClick={handleRestartClick} className="primary">Restart</button>
            <button onClick={handleNewGameClick} className="secondary">New Game</button>
          </menu>
        </footer>
      </article>
    </Dialog>
  )
}

export default ResultDialog
