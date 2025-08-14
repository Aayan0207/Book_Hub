import React, { useEffect, useState } from "react";
import "../assets/codex/codex.css";
import Spinner from "./spinner";
import Card from "./Card";
import getToken from "./getToken";

function Book({
  isbn,
  userData = null,
  setPage,
  setProfile,
  setCheckoutItems,
}) {
  if (!isbn?.trim().match(/^(?:\d{10}|\d{13})$/)) return <p>Invalid ISBN.</p>;

  const urlPrefix = "http://localhost:8000";
  const token = getToken();
  const [bookData, setBookData] = useState({});
  const [ratingsData, setRatingsData] = useState({});
  const [sortBy, setSortBy] = useState("highest rated");
  const [reviewsData, setReviewsData] = useState([]);
  const [refreshReviews, setRefreshReviews] = useState(false);
  const [saleData, setSaleData] = useState({});
  const [batch, setBatch] = useState(1);
  const [more, setMore] = useState(false);
  const [bookmarks, setBookmarks] = useState({});
  const [userReviewed, setUserReviewed] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [inBookshelf, setInBookshelf] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [starBar, setStarBar] = useState(0);
  const [showBookshelfDropdown, setShowBookshelfDropdown] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [showListingForm, setShowListingForm] = useState(false);
  const [showCrate, setShowCrate] = useState(false);
  const [stock, setStock] = useState(0);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (!showCrate) return;
    setPage("book_crate");
  }, [showCrate]);

  useEffect(() => {
    if (!showPurchase) return;
    setCheckoutItems([saleData.id]);
    setPage("checkout");
  }, [showPurchase]);

  useEffect(() => {
    if (!token || !reviewsData || !userData) return;
    reviewsData.forEach((review) => {
      const reviewerId = review.user_id;
      if (reviewerId === userData?.userId) return;
      fetch(`${urlPrefix}/user_bookmarked`, {
        method: "POST",
        body: JSON.stringify({
          user_id: userData?.userId,
          profile_id: reviewerId,
        }),
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": token,
        },
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setBookmarks((prev) => {
            return { ...prev, [reviewerId]: data.bookmark };
          });
        })
        .catch((error) => console.log(error));
    });
  }, [reviewsData, token]);

  useEffect(() => {
    if (!token || !saleData || !userData?.userId) return;
    fetch(`${urlPrefix}/in_cart`, {
      method: "POST",
      body: JSON.stringify({
        id: userData.userId,
        isbn: isbn,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setInCart(data.status))
      .catch((error) => console.log(error));
  }, [isbn, saleData, token]);

  useEffect(() => {
    if (!token) return;

    if (saleData?.id) {
      fetch(`${urlPrefix}/get_listing`, {
        method: "POST",
        body: JSON.stringify({
          id: saleData.id,
        }),
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": token,
        },
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          const listing = data.listing[0];
          setSaleData(listing);
          setPrice(listing.price);
          setStock(listing.stock);
        })
        .catch((error) => console.log(error));
    }

    fetch(`${urlPrefix}/book_result`, {
      method: "POST",
      body: JSON.stringify({
        isbn: isbn,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setBookData(data.result.items?.[0]))
      .catch((error) => console.log(error));

    fetch(`${urlPrefix}/get_book_rating`, {
      method: "POST",
      body: JSON.stringify({
        isbn: isbn,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setRatingsData(data))
      .catch((error) => console.log(error));

    if (userData?.isUser) {
      fetch(`${urlPrefix}/in_bookshelf`, {
        method: "POST",
        body: JSON.stringify({
          isbn: isbn,
          user_id: userData.userId,
        }),
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": token,
        },
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => setInBookshelf(data.in_bookshelf))
        .catch((error) => console.log(error));

      fetch(`${urlPrefix}/get_user_rating`, {
        method: "POST",
        body: JSON.stringify({
          isbn: isbn,
          user_id: userData?.userId,
        }),
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": token,
        },
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          setStarBar(data.rating * 20);
          setUserRating(data.rating);
        })
        .catch((error) => console.log(error));
    }
  }, [isbn, token, saleData, userData]);

  useEffect(() => {
    if (!token || batch === 1) return;
    fetch(`${urlPrefix}/get_book_reviews`, {
      method: "POST",
      body: JSON.stringify({
        isbn: isbn,
        page: batch,
        user_id: userData?.userId,
        flag: sortBy,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setReviewsData((prev) => [...prev, ...data.reviews]);
        setMore(data.next);
      })
      .catch((error) => console.log(error));
  }, [batch, sortBy, refreshReviews, token]);

  useEffect(() => {
    if (!token) return;
    setBatch(1);
    setMore(false);
    fetch(`${urlPrefix}/get_book_reviews`, {
      method: "POST",
      body: JSON.stringify({
        isbn: isbn,
        page: 1,
        user_id: userData?.userId,
        flag: sortBy,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setReviewsData(data.reviews);
        setMore(data.next);
        if (userData?.isUser) {
          setUserReviewed(data.user_reviewed);
        }
      })
      .catch((error) => console.log(error));
  }, [isbn, sortBy, refreshReviews, token]);

  function updateCart() {
    fetch(`${urlPrefix}/update_cart`, {
      method: "POST",
      body: JSON.stringify({
        isbn: isbn,
        id: userData?.userId,
        listing_id: saleData.id,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setInCart(data.status);
      })
      .catch((error) => console.log(error));
  }

  function deleteListing() {
    fetch(`${urlPrefix}/update_listing`, {
      method: "POST",
      body: JSON.stringify({
        isbn: isbn,
        delete: true,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((_) => {
        setShowCrate(true);
      })
      .catch((error) => console.log(error));
  }

  function updateBookshelf(action = null) {
    fetch(`${urlPrefix}/update_bookshelf`, {
      method: "POST",
      body: JSON.stringify({
        isbn: isbn,
        user_id: userData?.userId,
        action: action,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setInBookshelf(data.in_bookshelf);
      })
      .catch((error) => console.log(error));
  }

  function updateListing(event) {
    event.preventDefault();
    const form = event.target;
    fetch(`${urlPrefix}/update_listing`, {
      method: "POST",
      body: JSON.stringify({
        isbn: isbn,
        price: form.querySelector("#id_price").value,
        stock: form.querySelector("#id_stock").value,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        const listing = data.listing;
        setStock(listing.stock);
        setPrice(listing.price);
        setShowListingForm(false);
      })
      .catch((error) => console.log(error));
  }

  function updateRating(rating) {
    fetch(`${urlPrefix}/update_rating`, {
      method: "POST",
      body: JSON.stringify({
        isbn: isbn,
        user_id: userData?.userId,
        rating: rating,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setUserRating(data.rating);
        setStarBar(data.rating * 20);
      })
      .catch((error) => console.log(error));
  }

  function addReview(event) {
    event.preventDefault();
    const form = event.target;
    fetch(`${urlPrefix}/manage_review`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      body: JSON.stringify({
        user_id: userData?.userId,
        isbn: isbn,
        content: form.querySelector("#id_content").value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        data.review.user_id__username = userData.user;
        setReviewsData((prev) => {
          const filtered = prev.filter(
            (item) => item.user_id !== userData.userId
          );
          return [data.review, ...filtered];
        });
        setUserReviewed(true);
        setShowForm(false);
      })
      .catch((error) => console.log(error));
  }

  return (
    <>
      {bookData?.volumeInfo ? (
        <>
          <div id="book_result">
            <div className="result_book_cover_image_div">
              <div className="result_book_cover_image_holder">
                <img
                  className="result_book_cover_image"
                  src={bookData.volumeInfo.imageLinks.thumbnail}
                />
              </div>
              {userData?.isUser && (
                <>
                  <div id="bookshelf_button_div" className="dropdown">
                    {inBookshelf ? (
                      <button
                        className="bookshelf_button btn btn-danger"
                        type="button"
                        onClick={() => {
                          updateBookshelf();
                          setShowBookshelfDropdown(false);
                        }}
                      >
                        Remove from Bookshelf
                      </button>
                    ) : (
                      <>
                        <button
                          className="bookshelf_button btn btn-success dropdown-toggle"
                          onClick={() =>
                            setShowBookshelfDropdown(!showBookshelfDropdown)
                          }
                          type="button"
                          aria-expanded={showBookshelfDropdown}
                        >
                          Add to Bookshelf
                        </button>
                        <ul
                          className={`dropdown-menu book_menu ${
                            showBookshelfDropdown ? "show" : ""
                          }`}
                        >
                          <li
                            className="dropdown-item"
                            onClick={() => updateBookshelf("read")}
                          >
                            Read
                          </li>
                          <li
                            className="dropdown-item"
                            onClick={() => updateBookshelf("currently reading")}
                          >
                            Currently Reading
                          </li>
                          <li
                            className="dropdown-item"
                            onClick={() => updateBookshelf("want to read")}
                          >
                            Want to Read
                          </li>
                        </ul>
                      </>
                    )}
                  </div>
                  <div className="user_rating_div">
                    <p className="user_rating_content">
                      {userRating && userRating > 0
                        ? `Your Rating: ${userRating}`
                        : "Rate this book:"}
                    </p>
                    <div className="user_rating_bar_div">
                      <div
                        className="user_rating_bar progress progress-bar bg-warning"
                        style={{ width: `${starBar}%` }}
                      ></div>
                    </div>
                    <div className="user_ratings_stars">
                      {Array(5)
                        .fill()
                        .map((_, index) => {
                          return (
                            <div
                              className="user_ratings_star"
                              onMouseOver={() => setStarBar((index + 1) * 20)}
                              onClick={() => updateRating(index + 1)}
                            ></div>
                          );
                        })}
                    </div>
                    <div className="result_clear_rating_div">
                      <button
                        className="result_clear_rating_button btn btn-link"
                        onClick={() => updateRating(0)}
                      >
                        Clear Rating
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="result_book_info">
              <p className="result_book_title">{bookData.volumeInfo.title}</p>
              <br />
              <p className="result_book_author">
                by {bookData.volumeInfo.authors.join(", ")}
              </p>
              <div className="result_rating_div">
                <div className="result_ratings_bar_div">
                  <div
                    className="result_rating_bar progress progress-bar bg-warning"
                    style={{
                      width: `${
                        ratingsData?.avg_rating
                          ? ratingsData.avg_rating * 20
                          : 0
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
              {saleData?.stock > 0 ? (
                <div className="result_sale_info">
                  <div>
                    <p className="result_price">Price: {price} Credits</p>
                    <p className="result_stock">
                      ({stock > 1 ? `${stock} Copies` : `1 Copy`} Available at
                      the Book Crate)
                    </p>
                  </div>
                  {userData?.isUser && userData?.isSuper && (
                    <>
                      <div>
                        <button
                          className="update_listing_button btn btn-info"
                          onClick={() => setShowListingForm(true)}
                        >
                          Update Listing
                        </button>
                        <button
                          className="delete_listing_button btn btn-danger"
                          onClick={() => deleteListing()}
                        >
                          Delete Listing
                        </button>
                      </div>
                      {showListingForm && (
                        <form
                          action="/update_listing"
                          method="POST"
                          className="listing_form"
                          onSubmit={(event) => updateListing(event)}
                          onReset={() => setShowListingForm(false)}
                        >
                          <hr />
                          <label htmlFor="id_price">Price (Credits):</label>
                          <input
                            type="number"
                            name="price"
                            min="1"
                            max="100000"
                            required={true}
                            id="id_price"
                            defaultValue={price}
                          />
                          <label htmlFor="id_stock">Stock:</label>
                          <input
                            type="number"
                            name="stock"
                            min="1"
                            max="10000"
                            required={true}
                            id="id_stock"
                            defaultValue={stock}
                          />
                          <input
                            type="hidden"
                            name="book_isbn"
                            readOnly={true}
                            maxLength="13"
                            id="id_book_isbn"
                            value={isbn}
                          />
                          <input
                            type="submit"
                            value="List"
                            className="btn btn-success"
                            id="create_listing_button"
                          />
                          <input
                            type="reset"
                            value="Cancel"
                            className="btn btn-danger"
                            id="cancel_create_listing_button"
                          />
                          <hr />
                        </form>
                      )}
                    </>
                  )}

                  {userData?.isUser && !userData?.isSuper && (
                    <div>
                      <button
                        className="purchase_button btn btn-success"
                        onClick={() => setShowPurchase(true)}
                      >
                        Purchase
                      </button>
                      {inCart ? (
                        <button
                          className="cart_button btn btn-info"
                          onClick={() => updateCart()}
                        >
                          <i className="bi bi-cart-dash"></i> Remove From Cart
                        </button>
                      ) : (
                        <button
                          className="cart_button btn btn-warning"
                          onClick={() => updateCart()}
                        >
                          <i className="bi bi-cart-plus"></i> Add to Cart
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : null}

              <p className="result_book_description">
                {bookData.volumeInfo?.description}
              </p>
              <p>Categories: {bookData.volumeInfo.categories}</p>
              <br />
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
                          return (
                            <div key={index} className="ratings_star"></div>
                          );
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
                {userData?.isUser && !userReviewed ? (
                  <div className="user_review_button_div">
                    <button
                      className="user_review_button btn btn-outline-light"
                      onClick={() => setShowForm(true)}
                    >
                      <i className="bi bi-pen"></i>
                      Write a Review
                    </button>
                  </div>
                ) : null}
                {showForm ? (
                  <form
                    action="/manage_review"
                    method="post"
                    id="user_review_form"
                    onSubmit={(event) => addReview(event)}
                    onReset={() => setShowForm(false)}
                  >
                    <textarea
                      name="content"
                      cols="40"
                      rows="10"
                      required=""
                      id="id_content"
                    ></textarea>
                    <input
                      type="submit"
                      className="btn btn-success"
                      value="Give Review"
                      id="submit_review_button"
                    />
                    <input
                      type="reset"
                      className="btn btn-danger"
                      value="Cancel"
                      id="cancel_review_button"
                    />
                  </form>
                ) : null}
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
                  {reviewsData ? (
                    reviewsData.map((item) => {
                      const CardDetails = {
                        book: {
                          isbn: isbn,
                          review: {
                            reviewer: item.user_id__username,
                            reviewerId: item.user_id,
                            rating: item.rating,
                            content: item.content,
                            timestamp: item.timestamp,
                            likes: item.likes_count,
                            id: item.id,
                          },
                        },
                      };
                      return (
                        <Card
                          options="book"
                          userData={userData}
                          setPage={setPage}
                          key={`${item.id}-${item.content}`}
                          payload={CardDetails}
                          setProfile={setProfile}
                          bookmarks={bookmarks}
                          setBookmarks={setBookmarks}
                          setUserReviewed={setUserReviewed}
                          userReviewed={userReviewed}
                        />
                      );
                    })
                  ) : (
                    <p>No Reviews Yet</p>
                  )}
                </div>
                {more ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <button
                      id="more_reviews_button"
                      className="btn btn-info"
                      onClick={() => {
                        setMore(false);
                        setBatch(batch + 1);
                      }}
                    >
                      Load More
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </>
      ) : (
        <Spinner />
      )}
    </>
  );
}
export default Book;
