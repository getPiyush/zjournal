import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; }
`;

const popIn = keyframes`
  from { opacity: 0; transform: translateY(-12px) scale(0.98); }
`;

export const Backdrop = styled.div`
  animation: ${fadeIn} 150ms ease-out;
`;

// Bootstrap's .modal is display:none until its JS toggles it; this dialog is
// rendered only while open, so show it unconditionally.
export const Dialog = styled.div`
  display: block;
`;

export const DialogContent = styled.div`
  animation: ${popIn} 180ms ease-out;
  border: none;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);

  .modal-header,
  .modal-footer {
    border: none;
  }

  .modal-body {
    padding-top: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
