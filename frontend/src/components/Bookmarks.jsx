import React, { useState, useEffect } from "react";
import Card from "./Card";
import getToken from "./getToken";
function Bookmarks({ userData, setPage, setIsbn, setProfile }) {
  const urlPrefix = "http://localhost:8000";
  const token = getToken();
  const [refresh, setRefresh] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsData, setReviewsData] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [payload, setPayload] = useState({});
  const [same, setSame] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [found, setFound] = useState(null);

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

  useEffect(() => {
    if (!payload?.username) return;
    setSame(false);
    setInvalid(false);
    setFound(null);
    fetch(`${urlPrefix}/user_exists`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data) {
          setInvalid(true);
          return;
        } else if (data.userId === userData?.userId) {
          setSame(true);
          return;
        }
        setFound(data);
        fetch(`${urlPrefix}/user_bookmarked`, {
          method: "POST",
          body: JSON.stringify({
            user_id: userData?.userId,
            profile_id: found?.userId,
          }),
        })
          .then((response) => response.json())
          .then((res) => {
            setBookmarks((prev) => {
              return { ...prev, [found.userId]: res.bookmark };
            });
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => console.log(error));
  }, [payload]);

  function submitForm(event) {
    event.preventDefault();
    const form = event.target;
    const details = {
      username: form.querySelector("#id_username").value,
    };
    setPayload(details);
  }
  function handleBookmarkToggle() {
    if (!userData || !found?.id) return;

    fetch(`${urlPrefix}/update_bookmark`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userData.userId,
        profile_id: found.id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setBookmarks((prev) => {
          return { ...prev, [found.id]: data.bookmark };
        });
      })
      .catch((error) => console.log(error));
  }
  return (
    <>
      <div id="home_div">
        <button
          className="manage_bookmarks_button btn btn-dark"
          onClick={() => setShowForm(!showForm)}
        >
          <i className="bi bi-bookmarks"></i> Manage Bookmarks
        </button>
        {showForm ? (
          <form
            action="/user_exists"
            method="post"
            id="user_search_form"
            onReset={() => {
              setShowForm(false);
              setFound(null);
              setInvalid(false);
              setSame(false);
            }}
            onSubmit={(event) => submitForm(event)}
          >
            <div>
              <label htmlFor="id_username">Username:</label>
              <input
                type="text"
                name="username"
                maxLength="255"
                required={true}
                id="id_username"
              />
            </div>
            <input
              type="submit"
              className="btn btn-success"
              value="Search"
              id="submit_search_button"
            />
            <input
              type="reset"
              className="btn btn-danger"
              value="Done"
              id="cancel_search_button"
            />
            {found ? (
              <div id="user_found">
                <p id="found_username">{found.username}</p>
                {bookmarks[found.id] ? (
                  <button
                    className="bookmark_button btn btn-warning"
                    onClick={() => handleBookmarkToggle()}
                  >
                    <i className="bi bi-bookmark-dash"></i> Remove Bookmark
                  </button>
                ) : (
                  <button
                    className="bookmark_button btn btn-primary"
                    onClick={() => handleBookmarkToggle()}
                  >
                    <i className="bi bi-bookmark-plus"></i> Bookmark
                  </button>
                )}
              </div>
            ) : null}
            {invalid ? (
              <div
                className="alert alert-warning"
                role="alert"
                id="no_user_alert"
              >
                No user found with provided username.
              </div>
            ) : null}
            {same ? (
              <div
                className="alert alert-warning"
                role="alert"
                id="self_user_alert"
              >
                You cannot bookmark yourself.
              </div>
            ) : null}
          </form>
        ) : null}
        <hr />
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
              setProfile={setProfile}
            />
          );
        })}
      </div>
    </>
  );
}

export default Bookmarks;
