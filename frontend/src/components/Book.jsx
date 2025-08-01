import React, { useEffect, useState } from "react";
import "../assets/codex/codex.css";

function Book({ isbn }) {
  const urlPrefix = "http://localhost:8000";
  const [bookData, setBookData] = useState({});

  useEffect(() => {
    if (!isbn.match(/^(?:\d{10}|\d{13})$/)) return;
    fetch(`${urlPrefix}/book_result`, {
      method: "POST",
      body: JSON.stringify({
        isbn: isbn,
      }),
    })
      .then((response) => response.json())
      .then((data) => setBookData(data.result.items[0]))
      .catch((error) => console.log(error));
  }, [isbn]);

  return (
    <>
      <div id="book_result">
        <div className="result_book_cover_image_div">
          <div className="result_book_cover_image_holder">
            <img
              className="result_book_cover_image"
              src={bookData.volumeInfo.imageLinks.thumbnail}
            />
          </div>
        </div>
        <div className="result_book_info">
          <p className="result_book_title">{bookData.volumeInfo.title}</p>
          <p className="result_book_author">by {bookData.volumeInfo.authors}</p>
        </div>
      </div>
    </>
  );
}
export default Book;
