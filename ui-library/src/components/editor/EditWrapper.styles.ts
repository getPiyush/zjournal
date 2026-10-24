import styled, { css } from "styled-components";

type ComponentHoverProps = {
  $draggable?: boolean;
  $dragging?: boolean;
  $dropPosition?: "before" | "after" | null;
};

export const ComponentHover = styled.div<ComponentHoverProps>`
  position: relative;

  &:hover {
    border: 1px solid #edb24d;
    padding: 8px;
    background: #d4e4e4;
  }

  ${({ $draggable }) =>
    $draggable &&
    css`
      cursor: grab;
      &:active {
        cursor: grabbing;
      }
    `}

  ${({ $dragging }) =>
    $dragging &&
    css`
      opacity: 0.4;
    `}

  ${({ $dropPosition }) =>
    $dropPosition &&
    css`
      &::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        ${$dropPosition === "before" ? "top: -2px;" : "bottom: -2px;"}
        height: 4px;
        background: #0d6efd;
        border-radius: 2px;
        pointer-events: none;
      }
    `}
`;
