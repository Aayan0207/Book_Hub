import React, { useState, useEffect } from "react";
import "../assets/codex/codex.css";
import "../assets/book_crate/book_crate.css";
import "../assets/readers_grove/readers_grove.css";

function Card({ payload, setPage, setIsbn }) {
  if (!payload || !payload.book.image.source) return;
  if (!payload.book.isbn.match(/^(?:\d{10}|\d{13})$/)) return;
  const urlPrefix = "http://localhost:8000";
  const isbn = payload.book.isbn;
  const [viewBook, setViewBook] = useState(false);
  const [ratingsData, setRatingsData] = useState({});
  const [saleData, setSaleData] = useState({});

  useEffect(() => {
    if (viewBook) {
      setIsbn(isbn);
      setPage("book");
    }
  }, [viewBook]);

  useEffect(() => {
    if (!payload.book.sale_id) return;
    fetch(`${urlPrefix}/get_listing`, {
      method: "POST",
      body: JSON.stringify({
        id: payload.book.sale_id,
      }),
    })
      .then((response) => response.json())
      .then((data) => setSaleData(data.listing[0]))
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

  if (payload.book.sale_id && saleData.stock === 0) return;
  return (
    <>
      <div className={payload.book.parentClass}>
        <div className={payload.book.image.parentClass}>
          <img
            className={payload.book.image.class}
            src={payload.book.image.source}
          ></img>
          {payload.user?.isUser ? payload.book?.options : null}
        </div>
        <div
          className={payload.book.info.parentClass}
          onClick={() => setViewBook(true)}
        >
          <p className={payload.book.info.title.class}>
            {payload.book.info.title.value}
          </p>
          <p className={payload.book.info.author.class}>
            by {payload.book.info.author.value?.join(", ")}
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
          {payload.book.info.publishInfo ? (
            <p className={payload.book.info.publishInfo?.class}>
              Published on: {payload.book.info.publishInfo?.value}
            </p>
          ) : null}
          {payload.book.info.snippet ? (
            <p className={payload.book.info.snippet?.class}>
              {payload.book.info.snippet?.value}
            </p>
          ) : null}
          {payload.book.sale_id ? (
            <>
              <p className="listing_book_price">
                Price: {saleData.price} Credits
              </p>
              <p className="listing_book_stock">
                {saleData.stock > 1 ? `${saleData.stock} copies` : "1 copy"}{" "}
                Available
              </p>
            </>
          ) : null}
        </div>
        {payload.book.review ? (
          <div className="book_review">
            <div className="review_username_header">
              {payload.book.review.reviewer}
            </div>
            {/*Bookmark Button and Functionality*/}
            <div className="review_rating_div">
              <div className="review_progress_bar_div">
                <div
                  className="review_progress_bar progress-bar bg-warning"
                  style={{ width: `${payload.book.review.rating * 20}` }}
                ></div>
              </div>
              <div className="review_rating_stars_div">
                <div className="review_rating_star"></div>
                <div className="review_rating_star"></div>
                <div className="review_rating_star"></div>
                <div className="review_rating_star"></div>
                <div className="review_rating_star"></div>
              </div>
              <div className="review_text_div">
                {payload.book.review.rating}
              </div>
            </div>
            <div class="review_content_div">
              <div class="review_content">{payload.book.review.content}</div>
            </div>
            <div className="review_like_button_div">
                  <div className="like_button"></div> {/* Update for user liked and all */}
                  <div className="review_like_count_div">{payload.book.review.likes}</div>
                </div>
            <div className="review_timestamp_div">
              {new Date(payload.book.review.timestamp).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  year: "numeric",
                  day: "numeric",
                }
              )}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default Card;
