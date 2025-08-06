import React, { useState, useEffect } from "react";
import Card from "./Card";

function Bookmarks({ userData, setPage, setIsbn }) {
  const urlPrefix = "http://localhost:8000";
  const [refresh, setRefresh] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsData, setReviewsData] = useState({});
  const [bookmarks, setBookmarks] = useState({});

  useEffect(() => {
    fetch(`${urlPrefix}/load_bookmark_reviews`, {
      method: "POST",
      body: JSON.stringify({
        id: userData?.userId,
      }),
    })
      .then((response) => response.json())
      .then((data) => setReviews(data?.reviews))
      .catch((error) => console.log(error));
  }, [refresh]);

  useEffect(() => {
    if (!reviews) return;
    setReviewsData({});
    setBookmarks({});
    reviews.forEach((review) => {
      const reviewerId = review.user_id;
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
      console.log(bookmarks);
      fetch(`${urlPrefix}/user_bookmarked`, {
        method: "POST",
        body: JSON.stringify({
          user_id: userData?.userId,
          profile_id: reviewerId,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setBookmarks((prev) => {
            return { ...prev, [reviewerId]: data.bookmark };
          });
        })
        .catch((error) => console.log(error));
    });
  }, [reviews]);

  return (
    <>
      <div id="home_div">
        <button className="manage_bookmarks_button btn btn-dark">
          <i className="bi bi-bookmarks"></i> Manage Bookmarks
        </button>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            className="refresh_feed_button btn btn-light"
            onClick={() => setRefresh(!refresh)}
          >
            <i className="bi bi-arrow-repeat"></i> Refresh Feed
          </button>
        </div>
        {reviews.map((item) => {
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
              setIsbn={setIsbn}
              setPage={setPage}
              userData={userData}
              bookmarks={bookmarks}
              setBookmarks={setBookmarks}
            />
          );
        })}
      </div>
    </>
  );
}

export default Bookmarks;
