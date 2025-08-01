import React, { useEffect, useState } from "react";
import "../assets/codex/codex.css";
import Spinner from "./spinner";

function Book({ isbn }) {
  if (!isbn.trim().match(/^(?:\d{10}|\d{13})$/)) return <p>Invalid ISBN</p>;

  const urlPrefix = "http://localhost:8000";
  const [bookData, setBookData] = useState({});
  const [ratingsData, setRatingsData] = useState({});

  useEffect(() => {
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

  useEffect(() => {
    fetch(`${urlPrefix}/get_book_rating`, {
      method: "POST",
      body: JSON.stringify({
        isbn: isbn,
      }),
    })
      .then((response) => response.json())
      .then((data) => setRatingsData(data))
      .catch((error) => console.log(error));
  }, [isbn]);
  return (
    <>
      {bookData?.volumeInfo ? (
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
            <p className="result_book_author">
              by {bookData.volumeInfo.authors}
            </p>
          </div>
        </div>
      ) : (
        <Spinner />
      )}
    </>
  );
}
export default Book;
