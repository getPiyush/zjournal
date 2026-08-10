import styled from "styled-components";

import { disableTextSelectionCss } from "../../styles/shared";

export const ArticleViewer = styled.div<{ $disableTextSelect?: boolean }>`
  min-height: 85vh;
  overflow-wrap: break-word;
  ${({ $disableTextSelect }) => $disableTextSelect && disableTextSelectionCss}
`;

export const SubHeader = styled.div`
  color: #1f76a8;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  margin: 16px 0px 16px 0px;
`;
