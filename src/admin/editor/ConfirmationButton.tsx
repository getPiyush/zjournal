import { getUid } from "../../utils/componentUtil";

type ConfirmationButtonProps = {
  buttonText: string;
  confirmationMessage: string;
  confirmationClick: () => void;
  iconComp: JSX.Element;
  disabled:boolean;
};

export default function ConfirmationButton({
  buttonText,
  confirmationMessage,
  confirmationClick,
  iconComp,
  disabled
}: ConfirmationButtonProps) {
  const buttonId = getUid();
  return (
    <div id={`prompt${buttonId}`}>
      <button
        className="btn btn-danger btn-sm"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target={`#btn${buttonId}`}
        aria-expanded="false"
        aria-controls={`btn${buttonId}`}
        disabled={disabled}
      >
        {iconComp}&nbsp;&nbsp;{buttonText}
      </button>
      <div
        className="collapse"
        style={{ position: "absolute" }}
        id={`btn${buttonId}`}
      >
        <div className="card card-body">
          <div className="editor-action-col-end"></div>
          <div>
            <b>{confirmationMessage}</b>
          </div>
          <br />
          <button
            className="btn btn-primary btn-sm"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#btn${buttonId}`}
            aria-expanded="false"
            aria-controls={`btn${buttonId}`}
          >
            No
          </button>

          <hr />
          <button
            onClick={confirmationClick}
            type="button"
            className="btn btn-primary btn-sm btn-danger"
            data-bs-toggle="collapse"
            data-bs-target={`#btn${buttonId}`}
            aria-expanded="false"
            aria-controls={`btn${buttonId}`}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
