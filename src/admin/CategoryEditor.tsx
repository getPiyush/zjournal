import { useEffect, useState } from "react";
import { getArticlesBycategory } from "../datastore/actions/ArticleActions";
import { useArticle } from "../datastore/contexts/ArticleContext";
import { useJournal } from "../datastore/contexts/JournalContext";
import ArticlePreview from "./editor/ArticlePreview";

export default function CategoryEditor() {
  const { state: state} = useJournal();

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
        <div className="col-3">
          <div className="category-body">
            <div className="list-group">
              {state?.journal?.categories.length > 0 &&
                state.journal.categories.map((category) => (
                  <a
                    className={
                      category === selectedCategory
                        ? "list-group-item list-group-item-action active"
                        : "list-group-item list-group-item-action"
                    }
                    onClick={() => setSelectedcategory(category)}
                    href="#"
                  >
                    {category}
                  </a>
                ))}
            </div>
          </div>
        </div>
        <div className="col-6">
          <div className="container">
            <div className="row">
              <div className="col">
                <h4>{selectedCategory}</h4>
                <hr/>
              </div>
            </div>
            <div className="row">
              <div className="col">
                {articleData?.articles?.length > 0 ? (
                  articleData.articles.map((article) => (
                    <ArticlePreview data={article} />
                  ))
                ) : (
                  <div>
                    No article in this category
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
