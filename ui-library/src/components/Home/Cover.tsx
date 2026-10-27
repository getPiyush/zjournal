import { ElementType, SyntheticEvent, useEffect, useState } from "react";

import { CoverImage, CoverPlaceholder } from "../../styles/shared";
import { CategoryIcon, categoryHue } from "./categoryIcons";

// The image to show, or "" once it fails to load (or loads as a blank 1px tracking image), so the
// caller can show a placeholder instead of an empty slot. Starts over when the image changes.
export const useCoverImage = (image: string) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [image]);
  return {
    src: failed ? "" : image,
    onError: () => setFailed(true),
    onLoad: (event: SyntheticEvent<HTMLImageElement>) => {
      if (event.currentTarget.naturalWidth <= 1) setFailed(true);
    },
  };
};

type CoverProps = {
  image: string;
  category?: string;
  className?: string;
  lazy?: boolean;
  // Defaults to empty: on cards the image just illustrates the title beside it.
  alt?: string;
  id?: string;
  // What draws the image itself; a fixed 16:9 crop unless the caller wants another shape.
  imageAs?: ElementType;
};

// An article's image, or, when it has none or it breaks, a tinted placeholder with the category's
// icon and name. The placeholder is hidden from screen readers, like a decorative image.
export const Cover = ({
  image,
  category = "",
  className,
  lazy = false,
  alt = "",
  id,
  imageAs: Image = CoverImage,
}: CoverProps) => {
  const { src, onError, onLoad } = useCoverImage(image.trim());
  return src ? (
    <Image
      id={id}
      className={className}
      alt={alt}
      loading={lazy ? "lazy" : undefined}
      src={src}
      onError={onError}
      onLoad={onLoad}
    />
  ) : (
    <CoverPlaceholder
      id={id}
      className={`cover-placeholder ${className || ""}`.trim()}
      $hue={categoryHue(category)}
      aria-hidden="true"
    >
      <CategoryIcon category={category} />
      {category && <span>{category}</span>}
    </CoverPlaceholder>
  );
};
