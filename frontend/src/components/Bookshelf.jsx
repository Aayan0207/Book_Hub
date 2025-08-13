import React, { useState, useEffect } from "react";
import Picture from "./Picture";
import getToken from "./getToken";
function Bookshelf({ userData, setPage, setIsbn }) {
  const urlPrefix = "http://localhost:8000";
  const token = getToken();
  const [shelf, setShelf] = useState("all");
  const [books, setBooks] = useState([]);
  const [batch, setBatch] = useState(1);
  const [loadMore, setLoadMore] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!token) return;
    if (!loadMore || batch === 1) return;
    fetch(`${urlPrefix}/get_bookshelf`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userData?.userId,
        shelf: shelf,
        page: batch,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setBooks((prev) => {
          return [...prev, ...data.bookshelf];
        });
        setLoadMore(data.next);
        setShowMore(data.next);
      })
      .catch((error) => console.log(error));
  }, [batch, token]);

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
    if (!token) return;
    setBatch(1);
    fetch(`${urlPrefix}/get_bookshelf`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userData?.userId,
        shelf: shelf,
        page: 1,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setBooks(data.bookshelf);
        setLoadMore(data.next);
        setShowMore(data.next);
      })
      .catch((error) => console.log(error));
  }, [shelf, token]);

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          {loadMore && showMore ? (
            <button
              className="btn btn-info"
              onClick={() => {
                setBatch(batch + 1);
                setShowMore(false);
              }}
            >
              Load More
            </button>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default Bookshelf;
