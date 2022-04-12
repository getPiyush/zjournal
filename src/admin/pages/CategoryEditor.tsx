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

  const getCategoryDropdown = (currentCategory, categories) => (
    <div className="dropdown">
      <button
        className="btn btn-light btn-lg dropdown-toggle text-wrap"
        type="button"
        id="categoryButton"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <b>{currentCategory}</b>
      </button>

      <ul className="dropdown-menu" aria-labelledby="categoryButton">
        {categories.length > 0 &&
          state.journal.categories.map((category, index) => (
            <li>
              <a
                className={
                  category === currentCategory
                    ? "dropdown-item active"
                    : "dropdown-item"
                }
                onClick={() => setSelectedcategory(category)}
                href="#"
                key={`key_${index}_${category.replace(/[^A-Z0-9]/gi, "_")}`}
              >
                {category}
              </a>
            </li>
          ))}
      </ul>
    </div>
  );

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <PageTitle title="Categories" />
        </div>
      </div>
      <div className="row">
        <div className="col-md-4">
          {getCategoryDropdown(selectedCategory, articleData?.articles)}
        </div>
        <div className="col-md-4 offset-md-4 d-flex justify-content-end">
         {/** 
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
           */}           
           <div className="align-self-center"><b>{articleData?.articles?.length} Articles</b></div> 
       
        </div>
      </div>
      <div className="row">
        <div className="col">
          <hr />
        </div>
      </div>
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {articleData?.articles?.length > 0 ? (
          articleData.articles.map((article) => (
            <div className="col admin-preview">
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
