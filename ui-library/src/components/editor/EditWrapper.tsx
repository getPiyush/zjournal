import { ComponentHover } from "./EditWrapper.styles";

type EditWrapperProps = {
  id: string;
  children: any ;
  componentClicked: (event: React.MouseEvent<HTMLDivElement>) => void;
};

export default function EditWrapper({
  id,
  children,
  componentClicked
}: EditWrapperProps) {
  return (
    <ComponentHover
      role="button"
      id={id}
      onClick={componentClicked}
    >
      {children}
    </ComponentHover>
  );
}
