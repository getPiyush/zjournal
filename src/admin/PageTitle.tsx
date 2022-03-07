type PageTitleProps = {
  title: string;
};

export const PageTitle = ({ title }: PageTitleProps) => {
  return <h4 className="admin-module-title">{title}</h4>
};
