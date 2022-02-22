type EditWrapperProps = {
  id: string;
  children: Element;
  componentClicked: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export default function EditWrapper({
  id,
  children,
  componentClicked,
}: EditWrapperProps) {
  return (
    <div
      className="hover-overlay"
      data-bs-toggle="modal"
      data-bs-target="#staticBackdrop"
      role="button"
      id={id}
      onClick={componentClicked}
    >
      {children}
    </div>
  );
}
