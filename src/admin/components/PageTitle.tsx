type PageTitleProps = {
  title: string;
};

export const PageTitle = ({ title }: PageTitleProps) => {
  return (
    <div className="admin-module-title">
      <h4>{title}</h4> <hr />
    </div>
  );
};
