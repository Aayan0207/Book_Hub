import React, { useState, useEffect } from "react";
import Card from "./Card";
function Ratings_Reviews({ userData, setPage, setIsbn, setProfile }) {
  const urlPrefix = "http://localhost:8000";
  const [batch, setBatch] = useState(1);
  const [more, setMore] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsData, setReviewsData] = useState({});

  useEffect(() => {
    fetch(`${urlPrefix}/get_user_reviews`, {
      method: "POST",
      body: JSON.stringify({
        id: userData?.userId,
        page: 1,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setReviews(data.reviews);
        setMore(data.next);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    if (batch === 1) return;
    fetch(`${urlPrefix}/get_user_reviews`, {
      method: "POST",
      body: JSON.stringify({
        id: userData?.userId,
        page: batch,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setReviews((prev) => {
          return [...prev, ...data.reviews];
        });
        setMore(data.next);
      })
      .catch((error) => console.log(error));
  }, [batch]);

  useEffect(() => {
    if (!reviews) return;
    reviews.forEach((review) => {
      fetch(`${urlPrefix}/book_result`, {
        method: "POST",
        body: JSON.stringify({
          isbn: review.book_isbn,
        }),
      })
        .then((response) => response.json())
        .then((data) =>
          setReviewsData((prev) => {
            return { ...prev, [review.book_isbn]: data.result };
          })
        )
        .catch((error) => console.log(error));
    });
  }, [reviews]);
  return (
    <>
      <div className="reviews_div">
        <h2 className="reviews_header">Your Ratings &amp; Reviews</h2>
        {reviews
          ? reviews.map((item) => {
              if (!reviewsData[item.book_isbn]) return;
              const bookData = reviewsData[item.book_isbn].items[0];

              const cardDetails = {
                user: userData,
                book: {
                  isbn: item.book_isbn,
                  review: {
                    id: item.id,
                    reviewerId: item.user_id,
                    reviewer: item.user_id__username,
                    content: item.content,
                    rating: item.rating,
                    timestamp: item.timestamp,
                    likes: item.likes_count,
                  },
                  parentClass: "user_review_div",
                  image: {
                    parentClass: "book_cover_image_div",
                    source: bookData?.volumeInfo?.imageLinks?.thumbnail,
                  },
                  info: {
                    parentClass: "book_info_div",
                    title: {
                      class: "search_book_title",
                      value: bookData?.volumeInfo?.title,
                    },
                    author: {
                      class: "search_book_author",
                      value: bookData?.volumeInfo?.authors,
                    },
                    ratings: {
                      parentClass: "search_rating_div",
                      bar: {
                        parentClass: "search_ratings_bar_div",
                        class: "search_rating_bar",
                      },
                      stars: {
                        parentClass: "search_ratings_stars_div",
                        class: "search_ratings_star",
                      },
                      data: {
                        parentClass: "search_ratings_count_div",
                        class: "search_rating_info",
                      },
                    },
                  },
                },
              };

              return (
                <Card
                  key={item.id}
                  payload={cardDetails}
                  setPage={setPage}
                  setIsbn={setIsbn}
                  userData={userData}
                  setProfile={setProfile}
                />
              );
            })
          : null}
        {more ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <button
              className="btn btn-info"
              onClick={() => {
                setBatch((prev) => prev + 1);
                setMore(false);
              }}
            >
              Load More
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default Ratings_Reviews;
