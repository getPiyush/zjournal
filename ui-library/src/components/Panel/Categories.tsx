import React from "react";

type CategoriesProps = {
  categories: string[];
};

export default function Categories({ categories }: CategoriesProps) {
  return (
    <React.Fragment>
      <div className="offcanvas-header">
        <h5>Categories</h5>
        <button
          type="button"
          className="btn-close text-reset"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div className="offcanvas-body">
        <ol>
          {categories?.length > 0 &&
            categories.map((category, index) => (
              <li key={`category_${index}_${category}`}>
                <a href={`/web/articles?categoryId=${category}`}>{category}</a>
              </li>
            ))}
        </ol>
      </div>
    </React.Fragment>
  );
}
