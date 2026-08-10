import styled from "styled-components";

const Centered = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
`;

const Blob = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #0366d6;
`;

export default function LoadingPage() {
  return (
    <div className="container" data-testid="loading-page">
      <div className="row text-center">
        <Centered>
          <Blob />
          <Blob />
        </Centered>
      </div>
    </div>
  );
}
