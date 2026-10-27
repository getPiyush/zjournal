import React, { useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import { allArticlesIcon, CategoryIcon, categoryHue } from "../Home/categoryIcons";
import { CategoryLink, CategoryList, CategoryName, CategoryTile, Chevron } from "./Categories.styles";

// "All articles" takes the site's accent blue rather than a hue made from its name.
const allHue = 202;

type CategoriesProps = {
  categories: string[];
  basePath?: string;
};

export default function Categories({ categories, basePath = "/web" }: CategoriesProps) {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const onArticles = pathname === `${basePath}/articles`;
  const currentCategory = params.get("categoryId") || "All";
  const closeButton = useRef<HTMLButtonElement>(null);

  const isCurrent = (category: string) => onArticles && currentCategory === category;
  const hueFor = (category: string) => (category === "All" ? allHue : categoryHue(category));
  const hrefFor = (category: string) =>
    category === "All"
      ? `${basePath}/articles`
      : `${basePath}/articles?categoryId=${encodeURIComponent(category)}`;

  return (
    <React.Fragment>
      <div className="offcanvas-header">
        <h5>Categories</h5>
        <button
          ref={closeButton}
          type="button"
          className="btn-close text-reset"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div className="offcanvas-body">
        {categories?.length > 0 && (
          <CategoryList>
            {categories.map((category, index) => (
              <li key={`category_${index}_${category}`}>
                {/* Router links don't reload the page, so close the panel ourselves. Not with
                    data-bs-dismiss on the link: Bootstrap then cancels the click, and Link
                    won't navigate a cancelled click. */}
                <CategoryLink
                  to={hrefFor(category)}
                  onClick={() => closeButton.current?.click()}
                  aria-current={isCurrent(category) ? "page" : undefined}
                  $hue={hueFor(category)}
                >
                  <CategoryTile $hue={hueFor(category)} aria-hidden="true">
                    <CategoryIcon category={category}>
                      {category === "All" ? allArticlesIcon : undefined}
                    </CategoryIcon>
                  </CategoryTile>
                  <CategoryName>{category === "All" ? "All articles" : category}</CategoryName>
                  <Chevron
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M6 3l5 5-5 5" />
                  </Chevron>
                </CategoryLink>
              </li>
            ))}
          </CategoryList>
        )}
      </div>
    </React.Fragment>
  );
}
