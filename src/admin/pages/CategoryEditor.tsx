import { useEffect, useState } from "react";
import { getArticlesBycategory } from "../../datastore/actions/ArticleActions";
import { useArticle } from "../../datastore/contexts/ArticleContext";
import { useJournal } from "../../datastore/contexts/JournalContext";
import ArticlePreview from "../components/editor/ArticlePreview";
import { PageTitle } from "../components/PageTitle";

export default function CategoryEditor() {
  const { state: state } = useJournal();

  const { dispatch, state: articleData } = useArticle();

  const getArticlesBycategoryID = (categoryId) => {
    getArticlesBycategory(dispatch, categoryId);
  };

  const [selectedCategory, setSelectedcategory] = useState("Production");

  useEffect(() => {
    getArticlesBycategoryID(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <PageTitle title="Categories" />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className="category-body d-flex d-flex justify-content-between">
            <div className="dropdown">
              <button
                className="btn btn-light btn-lg dropdown-toggle text-wrap"
                type="button"
                id="categoryButton"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <b>{selectedCategory}</b>
              </button>

              <ul className="dropdown-menu" aria-labelledby="categoryButton">
                {state?.journal?.categories.length > 0 &&
                  state.journal.categories.map((category, index) => (
                    <li>
                      <a
                        className={
                          category === selectedCategory
                            ? "dropdown-item active"
                            : "dropdown-item"
                        }
                        onClick={() => setSelectedcategory(category)}
                        href="#"
                        key={`key_${index}_${category.replace(
                          /[^A-Z0-9]/gi,
                          "_"
                        )}`}
                      >
                        {category}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="align-self-center"><b>{articleData?.articles?.length} Articles</b></div>
            { /*
            <div className="d-flex">
              <input
                className="form-control"
                type="search"
                placeholder="Search"
                aria-label="Search"
              />
              <button className="btn btn-outline-success" type="button">
                Search
              </button>
            </div>
                        */ }
          </div>
          <hr />
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-2 g-4">
        {articleData?.articles?.length > 0 ? (
          articleData.articles.map((article) => (
            <div className="col">
              {" "}
              <ArticlePreview data={article} />
            </div>
          ))
        ) : (
          <div className="col">
            <div>No article in this category</div>
          </div>
        )}
      </div>
    </div>
  );
}
