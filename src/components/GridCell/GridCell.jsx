import { useMemo } from 'react'

const GridCell = ({
  x = 0,
  y = 0,
  open = false,
  content = '',
  onOpen,
  cellSize = 50,
}) => {

  const handleCellClick = () => {
    if (!open) onOpen(x, y)
  }


  const renderedCellContent = useMemo(() => {
    if (!open) return ''
  
    if (content === '💣')
      return (
        <span role="img" aria-label="mine">
          {content}
        </span>
      )
    
    return content
  }, [open, content])

  return (
    <div
      style={{
        height: cellSize,
        width: cellSize,
        border: '1px solid #000',
        position: 'absolute',
        top: y * cellSize,
        left: x * cellSize,
        backgroundColor: open ? 'lightblue' : '#fff',
        cursor: "pointer",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={handleCellClick}
    >
      {renderedCellContent}
    </div>
  )
}

export default GridCell
