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

// Overrides the web-app's global `img { padding }` so card images sit flush with the card text.
export const CardImage = styled.img`
  padding: 0;
  width: 100%;
  margin: 0.75rem 0;
  border-radius: 0.25rem;
  max-height: 350px;
  object-fit: cover;
  object-position: center;
`;

// Edge-to-edge article image with a fixed shape, so cards in a row line up.
export const CoverImage = styled.img`
  padding: 0;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  object-position: center;
`;

// Cuts text off after `$lines` lines with an ellipsis.
export const ClampedText = styled.div<{ $lines: number }>`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${(props) => props.$lines};
  overflow: hidden;
`;
