type LogoProps = {
  title?: string;
  subtext?: string;
  image?: string;
  onClick?: () => void;
};

export const Logo = ({ title = "Article Collections", subtext, image, onClick }: LogoProps) => {
  return (
    <span
      className="blog-header blog-header-logo"
      onClick={onClick}
      role={onClick ? "button" : undefined}
    >
      {image ? <img className="logo-image" src={image} alt={title} /> : <b>{title}</b>}
      {subtext && <div className="logo-subtext"><i>{subtext}</i></div>}
    </span>
  );
};
