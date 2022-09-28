import { useEffect, useRef } from "react"

const Dialog = ({ open = false, children })=> {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (open) {
      if (!dialogRef.current.open)
        dialogRef.current.showModal()
    }

    if (!open) {
      if (dialogRef.current.open)
        dialogRef.current.close()
    }
  }, [open])

  return (
    <dialog ref={dialogRef} id='dialog' style={{
      border: 'none',
      backgroundColor: 'unset'
    }}>
      {children}
    </dialog>
  )
}

export default Dialog