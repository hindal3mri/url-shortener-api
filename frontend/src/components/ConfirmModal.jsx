import { useEffect, useId, useRef } from 'react'

function ConfirmModal({
  isOpen,
  title,
  message,
  itemName,
  cancelLabel,
  confirmLabel,
  deletingLabel,
  isDeleting = false,
  onCancel,
  onConfirm,
}) {
  const titleId = useId()
  const descriptionId = useId()
  const dialogRef = useRef(null)
  const cancelRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cancelRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (!isDeleting) {
          onCancel()
        }
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const focusableElements = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      )

      if (!focusableElements?.length) {
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen, isDeleting, onCancel])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="confirm-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) {
          onCancel()
        }
      }}
    >
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        ref={dialogRef}
        dir="auto"
      >
        <div className="confirm-modal-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M12 8v5m0 4h.01M10.3 3.8 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
          </svg>
        </div>
        <h2 id={titleId}>{title}</h2>
        <p id={descriptionId}>
          {message}
          {itemName && (
            <>
              <br />
              <strong dir="ltr">{itemName}</strong>
            </>
          )}
        </p>
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-cancel"
            onClick={onCancel}
            ref={cancelRef}
            disabled={isDeleting}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="confirm-modal-delete"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? deletingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
