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

// Stands in for a missing or broken cover image: same shape, tinted per category, with the
// category's icon and name, so a card without a picture still lines up with the ones beside it.
export const CoverPlaceholder = styled.div<{ $hue: number }>`
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(
    135deg,
    hsl(${(props) => props.$hue} 45% 93%) 0%,
    hsl(${(props) => (props.$hue + 30) % 360} 40% 82%) 100%
  );
  color: hsl(${(props) => props.$hue} 35% 30%);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-align: center;
  text-transform: uppercase;

  svg {
    width: clamp(2.5rem, 22%, 5.5rem);
    height: auto;
    opacity: 0.85;
  }
`;

// Cuts text off after `$lines` lines with an ellipsis.
export const ClampedText = styled.div<{ $lines: number }>`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${(props) => props.$lines};
  overflow: hidden;
`;
