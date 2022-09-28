const DialogHeader = ({ title, onClose }) => {
  const closeButton = onClose ? (<button onClick={onClose}><span role="img" aria-label="close">❌</span></button>) : null
  return (
    <header>
      <h2>{title}</h2>
      {closeButton}
    </header>
  )
}

export default DialogHeader