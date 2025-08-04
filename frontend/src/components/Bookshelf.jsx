import React, { useState, useEffect } from "react";

function Bookshelf() {
  const [shelf, setShelf] = useState("all");
  const [books, setBooks] = useState([]);

  useEffect(() => {
    
  }, [shelf]);

  return (
    <>
      <div id="user_bookshelf">
        <h2>Bookshelf</h2>
        <select
          id="bookshelf_select"
          className="form-select"
          onChange={(event) => setShelf(event.target.value)}
        >
          <option value="all">All</option>
          <option value="read">Read</option>
          <option value="currently reading">Currently Reading</option>
          <option value="want to read">Want to Read</option>
        </select>
      </div>
    </>
  );
}

export default Bookshelf;
