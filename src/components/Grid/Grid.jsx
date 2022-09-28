import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { getAdvancedMines, getBeginnerMines, getMines } from '../../helpers/apiFetcher'
import Dialog from '../Dialog'
import GridCell from '../GridCell'
import Loader from '../Loader'
import ResultDialog from '../ResultDialog'
import { formatDuration } from './utils'

const Grid = ({ level = 'beginner' }) => {
  const gridSize = useMemo(() => {
    if (level === 'advanced') {
      return 16
    }

    return 9
  }, [level])

  const numberOfMines = useMemo(() => {
    if (level === 'advanced') {
      return 40
    }

    return 10
  }, [level])

  const [cells, setCells] = useState(() => {
    let cells = new Map()
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const cellKey = `${x}-${y}`

        const cellValue = {
          x,
          y,
          open: false,
          content: ''
        }

        cells.set(cellKey, cellValue)
      }
    }

    return cells
  })
  const [status, setStatus] = useState('loading')
  const navigate = useNavigate()
  const durationRef = useRef({})
  let openedCells = new Set()
  const hasWon = useMemo(() => {
    const numberOfCellsOpen = [...cells.values()].reduce((prev, curr) => {
      console.log('🍔', curr)
      if (curr.open) {
        return prev = prev + 1
      }

      return prev
    }, 0)

    console.log('🍕 numberOfCellsOpen', numberOfCellsOpen)

    return numberOfCellsOpen + numberOfMines === cells.size
  }, [cells, numberOfMines])

  const dialogMessage = useMemo(() => {
    let result = { open: false, message: '' }
    if (status === 'won') {
      result = { open: true, message: `🎆 You won the game in ${durationRef.current.duration}` }
    }

    if (status === 'lost') {
      result = { open: true, message: `😭 You lost the game in ${durationRef.current.duration}` }
    }

    return result
  }, [status])

  const intializeGridCells = (gridSize) => {
    let cells = new Map()
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const cellKey = `${x}-${y}`

        const cellValue = {
          x,
          y,
          open: false,
          content: ''
        }

        cells.set(cellKey, cellValue)
      }
    }

    setCells(cells)
  }

  const restartGame = () => {
    durationRef.current = {}
    flushSync(() => {
      intializeGridCells(gridSize)
    })
    setStatus('loading')
  }

  const newGame = () => {
    flushSync(() => {
      setStatus('newGame')
    })
    navigate('/')
  }


  const handleCellOpen = (x, y) => {
    if (status !== 'playing') return

    const cellKey = `${x}-${y}`

    if (!cells.has(cellKey)) return

    const cell = cells.get(cellKey)

    if (cell.isOpen) return

    if (cell.content === '💣') {
      setStatus('lost')
      durationRef.current.duration = formatDuration((new Date() - durationRef.current.startedAt) / 1000)
      return
    }

    openedCells = new Set()
    const blanks = getAdjacents({ x, y })
    const newCells = structuredClone(cells)
    blanks.forEach((cellKey) => {
      newCells.set(cellKey, {
        ...newCells.get(cellKey),
        open: true,
      })
    })

    setCells(newCells)
    console.log(blanks)
  }



  const getAdjacents = ({ x, y }) => {
    const cellKey = `${x}-${y}`

    if (!cells.has(cellKey)) return []

    if (typeof cells.get(cellKey).content === 'number') return [cellKey]

    let result = []
    for (let i = x - 1; i <= x + 1; i++) {
      for (let j = y - 1; j <= y + 1; j++) {
        const key = `${i}-${j}`
        if (!openedCells.has(key) && (key !== cellKey)) {
          openedCells.add(key)
          result = [...result, ...getAdjacents({ x: i, y: j })]
        }
      }
    }

    return [cellKey, ...result]
  }

  const renderedCells = [...cells.entries()].map(([cellKey, celValue]) => (<GridCell key={cellKey} onOpen={handleCellOpen} {...celValue} />))

  useEffect(() => {
    if (status !== 'loading') return

    console.log({ status })

    getMines({ gridSize, numberOfMines }).then((res) => {
      const { data } = res
      if (!data) return

      const { data: mines } = data

      setCells(cells => {
        let newCells = structuredClone(cells)
        mines.forEach(({ x, y }) => {
          const cellKey = `${x}-${y}`
          if (!cells.has(cellKey)) return
          const cellValue = cells.get(cellKey)
          const newCellValue = {
            ...cellValue,
            content: '💣',
          }
          newCells.set(cellKey, newCellValue)
        })

        for (const [key, value] of cells) {
          const { x, y } = value
          if (newCells.get(key).content === '💣') continue
          let numberOfMinesAround = 0;
          for (let i = x - 1; i <= x + 1; i++) {
            for (let j = y - 1; j <= y + 1; j++) {
              const cellKey = `${i}-${j}`
              if (newCells.has(cellKey)) {
                if (newCells.get(cellKey).content === '💣') {
                  numberOfMinesAround++
                }
              }
            }
          }

          if (numberOfMinesAround > 0) {
            const newCellValue = newCells.get(key)
            newCells.set(key, {
              ...newCellValue,
              content: numberOfMinesAround
            })
          }
        }

        return newCells
      })

      setStatus('playing')
      durationRef.current.startedAt = new Date()
    })
  }, [status, gridSize, numberOfMines])

  useEffect(() => {
    if (status !== 'playing') return
    const won = hasWon
    if (won) {
      setStatus('won')
      durationRef.current.duration = formatDuration((new Date() - durationRef.current.startedAt) / 1000)
      return
    }
  }, [status, hasWon])

  useEffect(() => {
    if (status !== 'lost') return
    console.log({ status })

    setCells(cells => {
      const newCells = structuredClone(cells)
      for (const [cellKey, cellValue] of newCells) {
        if (cellValue.content === '💣') {
          newCells.set(cellKey, {
            ...cellValue,
            open: true
          })
        }
      }
      return newCells
    })
  }, [status])

  return (
    <div style={{
      width: gridSize * 50 + 4 + 'px',
      marginInline: "auto",
      position: 'relative',
      boxSizing: 'content-box'
    }}>
      <h2 style={{
        padding: '5px 20px',
        backgroundColor: '#000',
        color: '#fff',
        border: '2px solid #000',
        boxSizing: 'content-box'
      }}>
        {level === 'beginner' ? 'Beginner' : 'Advanced'}
      </h2>
      <div
        style={{
          position: 'relative',
          width: gridSize * 50 + 'px',
          height: gridSize * 50 + 'px',
          border: '2px solid #000',
          overflow: 'hidden',
          textTransform: 'uppercase',
          boxSizing: 'content-box'
        }}
      >
        {renderedCells}
      </div>

      <ResultDialog
        {...dialogMessage}
        restart={restartGame}
        newGame={newGame}
      />

      <Dialog open={status === 'loading'}>
        <Loader />
      </Dialog>
    </div>
  )
}

export default Grid
