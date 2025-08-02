import React, { use, useEffect, useState } from "react";
import "../assets/codex/codex.css";
import Spinner from "./spinner";

function Book({ isbn }) {
  if (!isbn.trim().match(/^(?:\d{10}|\d{13})$/)) return <p>Invalid ISBN.</p>;

  const urlPrefix = "http://localhost:8000";
  const [bookData, setBookData] = useState({});
  const [ratingsData, setRatingsData] = useState({});
  const [sortBy, setSortBy] = useState("highest rated");
  const [reviewsData, setReviewsData] = useState({});
  const [refreshReviews, setRefreshReviews] = useState(false);
  const [likesData, setLikesData] = useState({});
  const [saleData, setSaleData] = useState({});

  useEffect(() => {
    fetch(`${urlPrefix}/get_listing`, {
      method: "POST",
      body: JSON.stringify({
        isbn: isbn,
      }),
    })
      .then((response) => response.json())
      .then((data) => setSaleData(data.listing[0]))
      .catch((error) => console.log(error));
  }, [isbn]);

  useEffect(() => {
    if (!reviewsData?.reviews) return;
    reviewsData.reviews.forEach((item) => {
      fetch(`${urlPrefix}/get_review_likes`, {
        method: "POST",
        body: JSON.stringify({
          review_id: item.id,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setLikesData((prev) => {
            return {
              ...prev,
              [item.id]: { like_count: data?.like_count ? data.like_count : 0 },
            };
          });
        })
        .catch((error) => console.log(error));
    });
  }, [isbn, reviewsData]);

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

  useEffect(() => {
    setLikesData({});
    fetch(`${urlPrefix}/get_book_reviews`, {
      method: "POST",
      body: JSON.stringify({
        isbn: isbn,
        page: 1, //Update this when user system is set up
        user_id: null,
        flag: sortBy,
      }),
    })
      .then((response) => response.json())
      .then((data) => setReviewsData(data))
      .catch((error) => console.log(error));
  }, [isbn, sortBy, refreshReviews]);

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
              by {bookData.volumeInfo.authors.join(", ")}
            </p>
            <div className="result_rating_div">
              <div className="result_ratings_bar_div">
                <div
                  className="result_rating_bar progress progress-bar bg-warning"
                  style={{
                    width: `${
                      ratingsData?.avg_rating ? ratingsData.avg_rating * 20 : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className="result_ratings_stars_div">
                {Array(5)
                  .fill()
                  .map((_, index) => {
                    return (
                      <div key={index} className="result_ratings_star"></div>
                    );
                  })}
              </div>
              <div className="result_ratings_count_div">
                <p className="result_rating_info">
                  {ratingsData?.avg_rating ? ratingsData.avg_rating : 0} (
                  {ratingsData?.ratings_count ? ratingsData.ratings_count : 0}{" "}
                  Ratings)
                </p>
              </div>
            </div>
            <p className="result_book_snippet">
              {bookData?.searchInfo?.textSnippet}
            </p>
            {saleData?.stock > 0 ? 
            <div className="result_sale_info">
              <p className="result_price">Price: {saleData.price} Credits</p>
              <p className="result_stock">({saleData.stock > 1 ? `${saleData.stock} Copies` : `1 Copy`} Available at the Book Crate)</p>
            </div>
            : null}
            <p className="result_book_description">
              {bookData.volumeInfo?.description}
            </p>
            <p>Categories: {bookData.volumeInfo.categories}</p>
            <p>Edition Information</p>
            <ul>
              <li>
                Google Books Sourced Rating:
                <div className="google_book_ratings">
                  <div
                    className="google_ratings_stars_div progress progress-bar bg-warning"
                    style={{
                      width: `${
                        bookData.volumeInfo?.averageRating
                          ? bookData.volumeInfo.averageRating * 20
                          : 0
                      }%`,
                    }}
                  ></div>
                  <div className="ratings_stars">
                    {Array(5)
                      .fill()
                      .map((_, index) => {
                        return <div key={index} className="ratings_star"></div>;
                      })}
                  </div>
                  <p className="google_ratings_info">
                    {bookData.volumeInfo?.averageRating
                      ? bookData.volumeInfo.averageRating
                      : 0}{" "}
                    (
                    {bookData.volumeInfo?.ratingsCount
                      ? bookData.volumeInfo.ratingsCount
                      : 0}{" "}
                    Ratings)
                  </p>
                </div>
              </li>
              <li className="result_book_publish_info">
                Published on: {bookData.volumeInfo?.publishedDate} (
                {bookData.volumeInfo?.publisher})
              </li>
              <li>ISBN: {isbn}</li>
              <li>{bookData.volumeInfo?.pageCount} pages</li>
            </ul>
            <div className="reviews_div">
              <p className="reviews_div_header">Community Reviews</p>
              <div className="sort_by_div">
                <select
                  className="sort_by form-select"
                  id="review_selector"
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value);
                  }}
                >
                  <option className="sort_by_option" value="highest rated">
                    Highest Rated
                  </option>
                  <option className="sort_by_option" value="lowest rated">
                    Lowest Rated
                  </option>
                  <option className="sort_by_option" value="latest">
                    Latest
                  </option>
                  <option className="sort_by_option" value="oldest">
                    Oldest
                  </option>
                  <option className="sort_by_option" value="most liked">
                    Most Liked
                  </option>
                </select>
                <button
                  className="refresh_reviews_button btn btn-dark"
                  onClick={() => setRefreshReviews(!refreshReviews)}
                >
                  <i className="bi bi-arrow-repeat"></i>Refresh Reviews
                </button>
              </div>
              <div className="community_reviews_div">
                {reviewsData?.reviews.map((item) => {
                  return (
                    <div key={item.id} className="book_review">
                      <div className="review_username_header">
                        {item.user_id__username}
                      </div>
                      <div className="review_rating_div">
                        <div className="review_progress_bar_div">
                          <div
                            className="review_progress_bar progress-bar bg-warning progress"
                            style={{ width: `${item.rating * 20}%` }}
                          ></div>
                        </div>
                        <div className="review_rating_stars_div">
                          {Array(5)
                            .fill()
                            .map((_, index) => {
                              return (
                                <div
                                  key={index}
                                  className="review_rating_star"
                                ></div>
                              );
                            })}
                        </div>
                        <p className="review_text_div">{item.rating}</p>
                      </div>
                      <div className="review_content_div">
                        <p className="review_content">{item.content}</p>
                      </div>
                      <div className="review_like_button_div">
                        <div className="like_button"></div>
                        <p className="review_like_count_div">
                          {likesData[item.id].like_count}
                        </p>
                      </div>
                      <p className="review_timestamp_div">
                        {new Date(item.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Spinner />
      )}
    </>
  );
}
export default Book;
