import { Link } from "react-router-dom";
import styled from "styled-components";

export const CategoryList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

// One row of the panel: the category's icon on a tile in its tint, then its name. The current
// category keeps a wash of its tint behind the whole row.
export const CategoryLink = styled(Link)<{ $hue: number }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0.75rem 0.4rem 0.4rem;
  border-radius: 0.6rem;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.15s ease;

  &:hover,
  &:focus-visible {
    background-color: hsl(${(props) => props.$hue} 45% 95%);
    color: inherit;
  }

  &[aria-current="page"] {
    background-color: hsl(${(props) => props.$hue} 45% 92%);
    color: hsl(${(props) => props.$hue} 40% 22%);
    font-weight: 700;
  }

  &:hover > span:first-child,
  &:focus-visible > span:first-child {
    transform: rotate(-6deg) scale(1.06);
  }

  @media (prefers-reduced-motion: reduce) {
    &,
    & > span:first-child {
      transition: none;
    }
    &:hover > span:first-child,
    &:focus-visible > span:first-child {
      transform: none;
    }
  }
`;

export const CategoryTile = styled.span<{ $hue: number }>`
  flex: 0 0 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.6rem;
  background: linear-gradient(
    135deg,
    hsl(${(props) => props.$hue} 45% 93%) 0%,
    hsl(${(props) => (props.$hue + 30) % 360} 40% 82%) 100%
  );
  color: hsl(${(props) => props.$hue} 35% 30%);
  transition: transform 0.15s ease;

  svg {
    width: 1.6rem;
    height: 1.6rem;
  }
`;

export const CategoryName = styled.span`
  flex: 1 1 auto;
  min-width: 0;
`;

export const Chevron = styled.svg`
  flex: 0 0 auto;
  width: 0.9rem;
  height: 0.9rem;
  opacity: 0.4;
`;
