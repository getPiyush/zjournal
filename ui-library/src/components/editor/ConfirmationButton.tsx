import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Backdrop, Dialog, DialogContent } from "./ConfirmationButton.styles";

type ConfirmationButtonProps = {
  buttonText: string;
  confirmationMessage: string;
  confirmationClick: () => void;
  iconComp: JSX.Element;
  disabled: boolean;
  /** Dialog heading. Defaults to "Please confirm". */
  title?: string;
  /** Label of the confirming button. Defaults to `buttonText`, or "Confirm" when that is empty. */
  confirmText?: string;
  /** Label of the cancelling button. Defaults to "Cancel". */
  cancelText?: string;
};

export default function ConfirmationButton({
  buttonText,
  confirmationMessage,
  confirmationClick,
  iconComp,
  disabled,
  title = "Please confirm",
  confirmText,
  cancelText = "Cancel",
}: ConfirmationButtonProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const close = () => setOpen(false);

  const onConfirm = () => {
    setOpen(false);
    confirmationClick();
  };

  // Lock page scroll and focus the safe (cancel) action while open; hand
  // focus back to the trigger once the dialog closes.
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [open]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
    } else if (event.key === "Tab") {
      // Keep focus inside the dialog by cycling between its two buttons.
      event.preventDefault();
      const next =
        document.activeElement === cancelRef.current ? confirmRef.current : cancelRef.current;
      next?.focus();
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        className="btn btn-danger btn-sm"
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        {iconComp}
        {buttonText !== "" && `  ${buttonText}`}
      </button>
      {open &&
        createPortal(
          <>
            <Backdrop className="modal-backdrop show" />
            <Dialog
              className="modal show"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby={`${id}-title`}
              aria-describedby={`${id}-message`}
              onKeyDown={onKeyDown}
              onMouseDown={(event) => event.target === event.currentTarget && close()}
            >
              <div className="modal-dialog modal-dialog-centered modal-sm">
                <DialogContent className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id={`${id}-title`}>
                      {title}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Close"
                      tabIndex={-1}
                      onClick={close}
                    />
                  </div>
                  <div className="modal-body" id={`${id}-message`}>
                    {confirmationMessage}
                  </div>
                  <div className="modal-footer">
                    <button
                      ref={cancelRef}
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={close}
                    >
                      {cancelText}
                    </button>
                    <button
                      ref={confirmRef}
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={onConfirm}
                    >
                      {confirmText ?? (buttonText || "Confirm")}
                    </button>
                  </div>
                </DialogContent>
              </div>
            </Dialog>
          </>,
          document.body
        )}
    </>
  );
}
