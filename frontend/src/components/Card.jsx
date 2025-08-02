import React, { useState, useEffect } from "react";
import Book from "./Book.jsx";
import "../assets/codex/codex.css";
import "../assets/book_crate/book_crate.css";

function Card({ payload, setPage, setIsbn }) {
  if (!payload || !payload.book.image.source) return;
  if (!payload.book.isbn.match(/^(?:\d{10}|\d{13})$/)) return;
  const urlPrefix = "http://localhost:8000";
  const isbn = payload.book.isbn;
  const [viewBook, setViewBook] = useState(false);
  const [ratingsData, setRatingsData] = useState({});

  useEffect(() => {
    if (viewBook) {
      setIsbn(isbn);
      setPage("book");
    }
  }, [viewBook]);

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
      <div className={payload.book.parentClass}>
        <div className={payload.book.image.parentClass}>
          <img
            className={payload.book.image.class}
            src={payload.book.image.source}
          ></img>
          {payload.user.isuser ? payload.book.options : null}
        </div>
        <div
          className={payload.book.info.parentClass}
          onClick={() => setViewBook(true)}
        >
          <p className={payload.book.info.title.class}>
            {payload.book.info.title.value}
          </p>
          <p className={payload.book.info.author.class}>
            by {payload.book.info.author.value}
          </p>
          <div className={payload.book.info.ratings.parentClass}>
            <div className={payload.book.info.ratings.bar.parentClass}>
              <div
                className={`${payload.book.info.ratings.bar.class} progress progress-bar bg-warning`}
                style={{
                  width: `${
                    ratingsData?.avg_rating ? ratingsData.avg_rating * 20 : 0
                  }%`,
                }}
              ></div>
            </div>
            <div className={payload.book.info.ratings.stars.parentClass}>
              {Array(5)
                .fill()
                .map((_, index) => {
                  return (
                    <div
                      key={index}
                      className={payload.book.info.ratings.stars.class}
                    ></div>
                  );
                })}
            </div>
            <div className={payload.book.info.ratings.data.parentClass}>
              <p className={payload.book.info.ratings.data.class}>
                {ratingsData?.avg_rating ? ratingsData.avg_rating : 0} (
                {ratingsData ? ratingsData.ratings_count : 0} Ratings)
              </p>
            </div>
          </div>
          <p className={payload.book.info.publishInfo?.class}>
            Published on: {payload.book.info.publishInfo?.value}
          </p>
          <p className={payload.book.info.snippet?.class}>
            {payload.book.info.snippet?.value
              ? payload.book.info.snippet.value
              : "No snippet available."}
          </p>
        </div>
      </div>
    </>
  );
}

export default Card;
