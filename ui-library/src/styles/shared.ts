import styled, { css } from "styled-components";

/* Styled primitives shared across multiple ui-library components. */

export const disableTextSelectionCss = css`
  -ms-user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -khtml-user-select: none;
  user-select: none;
`;

export const EditorActionColStart = styled.div`
  display: flex;
  justify-content: flex-start;
`;

export const EditorActionColEnd = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const PaddingLR8 = styled.div`
  padding-left: 8px;
  padding-right: 8px;
`;

export const TopActionBox = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const CardImage = styled.img`
  max-height: 350px;
  object-fit: cover;
  object-position: center;
`;
