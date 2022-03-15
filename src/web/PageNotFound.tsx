import { Link } from "react-router-dom";
import { updatePage } from "../datastore/actions/JournalActions";
import { useJournal } from "../datastore/contexts/JournalContext";

export const PageNotFound = () => {
  const { dispatch } = useJournal();

  const linkClicked = (event: React.MouseEvent<HTMLButtonElement>) => {
    const target: any = event.target;
    const buttonFlag = target.getAttribute("button-flag");
    updatePage(buttonFlag, dispatch);
  };

  return (
    <div className="px-4 py-5 my-5 text-center">
      <h1 className="display-5 fw-bold">404 / Content not Found!</h1>
      <div className="col-lg-6 mx-auto">
        <p className="lead mb-4">
          It seems like you have hit a wrong article/page or the article is
          suspended permanently/temporarily.
          <br />
          If you are searching for something please change the search text and try again.
          <br/>
          However you can goto another page or try one of below options.
        </p>
        <div className="d-grid gap-2 d-sm-flex justify-content-sm-center">
          <Link
            type="button"
            className="btn btn-primary btn-lg px-4"
            aria-current="page"
            to="/web/home"
          >
            Go Home
          </Link>
          <button
            role="button"
            className="btn btn-outline-secondary btn-lg px-4"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasRight"
            aria-controls="offcanvasRight"
            onClick={linkClicked}
            button-flag="categories"
          >
            Browse Categories
          </button>
        </div>
      </div>
    </div>
  );
};
