import React, { useState } from "react";
import { ComponentHover } from "./EditWrapper.styles";
import type { ComponentReorderHandler, DropPosition } from "../../utils/componentUtil";

export const DRAG_DATA_TYPE = "application/x-zjournal-component";

type EditWrapperProps = {
  id: string;
  children: any ;
  componentClicked: (event: React.MouseEvent<HTMLDivElement>) => void;
  onReorder?: ComponentReorderHandler;
};

export default function EditWrapper({
  id,
  children,
  componentClicked,
  onReorder
}: EditWrapperProps) {
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);
  const [dragging, setDragging] = useState(false);
  const draggable = Boolean(onReorder);

  const getDropPosition = (event: React.DragEvent<HTMLDivElement>): DropPosition => {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.clientY < rect.top + rect.height / 2 ? "before" : "after";
  };

  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData(DRAG_DATA_TYPE, id);
    // Some browsers only start a drag when text/plain is set
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.effectAllowed = "move";
    setDragging(true);
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes(DRAG_DATA_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDropPosition(getDropPosition(event));
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    const draggedId = event.dataTransfer.getData(DRAG_DATA_TYPE);
    setDropPosition(null);
    if (!draggedId) return;
    event.preventDefault();
    if (draggedId !== id) onReorder?.(draggedId, id, getDropPosition(event));
  };

  return (
    <ComponentHover
      role="button"
      id={id}
      onClick={componentClicked}
      draggable={draggable}
      $draggable={draggable}
      $dragging={dragging}
      $dropPosition={dropPosition}
      {...(draggable && {
        onDragStart,
        onDragOver,
        onDragLeave: () => setDropPosition(null),
        onDrop,
        onDragEnd: () => setDragging(false),
      })}
    >
      {children}
    </ComponentHover>
  );
}
