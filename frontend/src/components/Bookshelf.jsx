import React, { useState, useEffect } from "react";
import Picture from "./Picture";
function Bookshelf({ userData, setPage, setIsbn }) {
  const urlPrefix = "http://localhost:8000";
  const [shelf, setShelf] = useState("all");
  const [books, setBooks] = useState([]);
  const [batch, setBatch] = useState(1);

  function chunkedArray(books) {
    let chunks = [];
    let chunk = [];
    for (let i = 1; i < books.length + 1; i++) {
      chunk.push(books[i - 1]);
      if (i % 10 == 0) {
        chunks.push(chunk);
        chunk = [];
      }
    }
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    return chunks;
  }

  useEffect(() => {
    setBatch(1);
    fetch(`${urlPrefix}/get_bookshelf`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userData?.userId,
        shelf: shelf,
        page: 1,
      }),
    })
      .then((response) => response.json())
      .then((data) => setBooks(data.bookshelf))
      .catch((error) => console.log(error));
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
        <div id="bookshelf_all_div">
          {console.log(chunkedArray(books))}
          {chunkedArray(books).map((chunk, index) => {
            return (
              <div className="bookshelf_row" key={index}>
                {chunk.map((item) => {
                  return (
                    <Picture
                      key={item.book_isbn}
                      cls={"bookshelf_book_cover_image"}
                      isbn={item.book_isbn}
                      setPage={setPage}
                      setIsbn={setIsbn}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Bookshelf;
