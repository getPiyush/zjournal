import React, { useRef } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

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
          <ul className="list-unstyled">
            {categories.map((category, index) => (
              <li key={`category_${index}_${category}`} className="mb-1">
                {/* Router links don't reload the page, so close the panel ourselves. Not with
                    data-bs-dismiss on the link: Bootstrap then cancels the click, and Link
                    won't navigate a cancelled click. */}
                <Link
                  to={hrefFor(category)}
                  onClick={() => closeButton.current?.click()}
                  aria-current={isCurrent(category) ? "page" : undefined}
                  className={isCurrent(category) ? "fw-bold" : undefined}
                >
                  {category === "All" ? "All articles" : category}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </React.Fragment>
  );
}
