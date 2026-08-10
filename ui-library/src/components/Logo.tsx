import styled from "styled-components";

type LogoProps = {
  title?: string;
  subtext?: string;
  image?: string;
  onClick?: () => void;
};

const LogoWrapper = styled.span`
  line-height: 1;
  color: #2485bd;
  font-family: "Merriweather", serif !important;
  font-size: 1.25rem;

  &:hover {
    text-decoration: none;
  }
`;

const LogoImage = styled.img`
  padding: 0;
  height: 40px;
`;

const LogoSubtext = styled.div`
  font-size: 0.75rem;
  color: #080808;
  padding-top: 0.2rem;
  padding-left: 0.1rem;
`;

export const Logo = ({ title = "Article Collections", subtext, image, onClick }: LogoProps) => {
  return (
    <LogoWrapper
      className="blog-header"
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {image ? <LogoImage src={image} alt={title} /> : <b>{title}</b>}
      {subtext && (
        <LogoSubtext data-testid="logo-subtext">
          <i>{subtext}</i>
        </LogoSubtext>
      )}
    </LogoWrapper>
  );
};
