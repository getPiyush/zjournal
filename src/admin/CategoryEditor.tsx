import { useState } from "react";
import { useJournal } from "../datastore/contexts/JournalContext";

export default function CategoryEditor() {
    const { state: state } = useJournal();
    const [selectedCategory, setSelectedcategory] = useState(state?.journal?.categories[0]);
    return (
        <div className="container">
        <div className="row">
          <div className="col">
          <div className="category-body">
        <ul>
          {state?.journal?.categories.length > 0 &&
            state.journal.categories.map((category) => (
              <li>
                <a onClick={()=>setSelectedcategory(category)} href="#">{category}</a>
              </li>
            ))}
        </ul>
      </div>
          </div>
          <div className="col">
            {selectedCategory}
          </div>
        </div>
      </div>
    );
  }
  