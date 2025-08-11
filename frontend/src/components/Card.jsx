import React, { useState, useEffect } from "react";
import "../assets/codex/codex.css";
import "../assets/book_crate/book_crate.css";
import "../assets/readers_grove/readers_grove.css";
import getToken from "./getToken";

function Card({
  payload,
  setPage,
  setIsbn,
  setProfile = null,
  userData = {},
  bookmarks = {},
  setBookmarks = {},
  options = null,
}) {
  if (!payload || !payload.book.image.source) return;
  if (!payload.book.isbn.match(/^(?:\d{10}|\d{13})$/)) return;
  const token = getToken();
  const urlPrefix = "http://localhost:8000";
  const isbn = payload.book.isbn;
  const reviewer = payload.book?.review?.reviewer;
  const [viewBook, setViewBook] = useState(false);
  const [viewProfile, setViewProfile] = useState(false);
  const [ratingsData, setRatingsData] = useState({});
  const [saleData, setSaleData] = useState({});
  const [userLiked, setUserLiked] = useState(false);
  const [likes, setLikes] = useState(payload.book?.review?.likes);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCard, setShowCard] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState(payload.book?.review?.content);
  const [inBookshelf, setInBookshelf] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [starBar, setStarBar] = useState(0);
  const [showListingForm, setShowListingForm] = useState(false);
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    if (!userData?.userId || options != "crate" || userData?.isSuper) return;
    fetch(`${urlPrefix}/in_cart`, {
      method: "POST",
      body: JSON.stringify({
        id: userData?.userId,
        isbn: isbn,
      }),
    })
      .then((response) => response.json())
      .then((data) => setInCart(data.status))
      .catch((error) => console.log(error));
  }, [isbn, options, userData?.userId]);

  useEffect(() => {
    if (!userData?.userId || options != "shelf") return;
    fetch(`${urlPrefix}/get_user_rating`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userData?.userId,
        isbn: isbn,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setStarBar(data.rating * 20);
        setUserRating(data.rating);
      })
      .catch((error) => console.log(error));
  }, [isbn, options, userData?.userId]);

  useEffect(() => {
    if (!viewProfile || reviewer === userData?.user) return;
    fetch(`${urlPrefix}/user_exists`, {
      method: "POST",
      body: JSON.stringify({
        username: reviewer,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setProfile(data);
        setPage("user");
      })
      .catch((error) => console.log(error));
  }, [viewProfile]);

  useEffect(() => {
    if (!userData?.isUser || options != "shelf") return;
    fetch(`${urlPrefix}/in_bookshelf`, {
      method: "POST",
      body: JSON.stringify({
        isbn: isbn,
        user_id: userData?.userId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setInBookshelf(data.in_bookshelf);
      })
      .catch((error) => console.log(error));
  }, [isbn, options, userData?.isUser]);

  useEffect(() => {
    if (!userData || !payload.book.review) return;
    fetch(`${urlPrefix}/user_liked`, {
      method: "POST",
      body: JSON.stringify({
        review_id: payload.book.review.id,
        user_id: userData.userId,
      }),
    })
      .then((response) => response.json())
      .then((data) => setUserLiked(data.liked))
      .catch((error) => console.log(error));
  }, [isbn, userData]);

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
    if (!payload.book.review && !payload.book.sale_id) return;
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

  function handleBookmarkToggle() {
    if (!userData || !payload.book.review) return;
    const reviewerId = payload.book.review.reviewerId;

    fetch(`${urlPrefix}/update_bookmark`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userData.userId,
        profile_id: reviewerId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setBookmarks((prev) => ({
          ...prev,
          [reviewerId]: data.bookmark,
        }));
      })
      .catch((error) => console.log(error));
  }

  function handleLikeToggle() {
    if (!userData || !payload.book.review) return;
    const wasLiked = userLiked;
    fetch(`${urlPrefix}/update_like`, {
      method: "POST",
      body: JSON.stringify({
        review_id: payload.book.review.id,
        user_id: userData.userId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setUserLiked(data.liked);
        if (wasLiked && !data.liked) {
          setLikes((prev) => prev - 1);
        } else if (!wasLiked && data.liked) {
          setLikes((prev) => prev + 1);
        }
      })
      .catch((error) => console.log(error));
  }

  function updateReview(event) {
    event.preventDefault();
    const form = event.target;
    fetch(`${urlPrefix}/manage_review`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userData?.userId,
        isbn: payload.book.isbn,
        delete: false,
        content: form.querySelector("#id_content").value,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setContent(data.review);
        setShowForm(false);
      })
      .catch((error) => console.log(error));
  }

  function deleteReview() {
    fetch(`${urlPrefix}/manage_review`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userData?.userId,
        isbn: payload.book.isbn,
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
        setShowCard(false);
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
    })
      .then((response) => response.json())
      .then((data) => {
        setInBookshelf(data.in_bookshelf);
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
    })
      .then((response) => response.json())
      .then((data) => {
        setUserRating(data.rating);
        setStarBar(data.rating * 20);
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
        setShowCard(false);
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
        const listing = data.listing[0];
        setSaleData((prev) => {
          return { ...prev, stock: listing.stock, price: listing.price };
        });
        setShowListingForm(false);
      })
      .catch((error) => console.log(error));
  }

  function acceptDonation() {
    fetch(`${urlPrefix}/manage_admin_donation`, {
      method: "POST",
      body: JSON.stringify({
        id: payload.book.donate_id,
        status: true,
      }),
    })
      .then((response) => response.json())
      .then((_) => {
        setShowCard(false);
      })
      .catch((error) => console.log(error));
  }

  function rejectDonation() {
    fetch(`${urlPrefix}/manage_admin_donation`, {
      method: "POST",
      body: JSON.stringify({
        id: payload.book.donate_id,
        status: false,
      }),
    })
      .then((response) => response.json())
      .then((_) => {
        setShowCard(false);
      })
      .catch((error) => console.log(error));
  }

  function updateCart() {
    fetch(`${urlPrefix}/update_cart`, {
      method: "POST",
      body: JSON.stringify({
        isbn: isbn,
        id: userData?.userId,
        listing_id: payload.book.sale_id,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setInCart(data.status);
      })
      .catch((error) => console.log(error));
  }

  if (payload.book.sale_id && saleData.stock === 0) return;
  if (!showCard) return;

  return (
    <>
      <div className={payload.book.parentClass}>
        <div className={payload.book.image.parentClass}>
          <img
            className={payload.book.image.class}
            src={payload.book.image.source}
          ></img>
          {options === "admin_donation" && userData.isSuper && (
            <>
              <button
                className="accept_donation_button btn btn-success"
                onClick={() => acceptDonation()}
              >
                <i className="bi bi-journal-check"></i> Accept
              </button>
              <button
                className="reject_donation_button btn btn-danger"
                onClick={() => rejectDonation()}
              >
                <i className="bi bi-journal-x"></i> Reject
              </button>
            </>
          )}
          {options === "crate" &&
            (userData?.isUser && userData?.isSuper ? (
              <>
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
              </>
            ) : userData?.isUser ? (
              inCart ? (
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
              )
            ) : null)}
          {options === "shelf" && (
            <>
              <div id="bookshelf_button_div" className="dropdown">
                {inBookshelf && userData?.isUser ? (
                  <button
                    className="search_bookshelf_button btn btn-danger"
                    data-bs-toggle=""
                    type="button"
                    onClick={() => updateBookshelf()}
                  >
                    Remove from Bookshelf
                  </button>
                ) : userData?.isUser ? (
                  <>
                    <button
                      className="search_bookshelf_button btn btn-success dropdown-toggle"
                      data-bs-toggle="dropdown"
                      type="button"
                    >
                      Add to Bookshelf
                    </button>
                    <ul className="dropdown-menu">
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
                ) : null}
              </div>
              <div className="search_user_rating_div">
                <p className="search_user_rating_content">
                  {userRating && userRating > 0
                    ? `Your Rating: ${userRating}`
                    : "Rate this book:"}
                </p>
                <div className="search_user_rating_bar_div">
                  <div
                    className="search_user_rating_bar progress progress-bar bg-warning"
                    style={{ width: `${starBar}%` }}
                  ></div>
                </div>
                <div className="search_user_ratings_stars">
                  {Array(5)
                    .fill()
                    .map((_, index) => {
                      return (
                        <div
                          className="search_user_ratings_star"
                          onMouseOver={() => setStarBar((index + 1) * 20)}
                          onClick={() => updateRating(index + 1)}
                        ></div>
                      );
                    })}
                </div>
                <div className="search_clear_rating_div">
                  <button
                    className="search_clear_rating_button btn btn-link"
                    onClick={() => updateRating(0)}
                  >
                    Clear Rating
                  </button>
                </div>
              </div>
            </>
          )}
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
          {(payload.book.review || payload.book.sale_id) && (
            <div className={payload.book.info?.ratings?.parentClass}>
              <div className={payload.book.info?.ratings?.bar.parentClass}>
                <div
                  className={`${payload.book.info?.ratings?.bar.class} progress progress-bar bg-warning`}
                  style={{
                    width: `${
                      ratingsData?.avg_rating ? ratingsData.avg_rating * 20 : 0
                    }%`,
                  }}
                ></div>
              </div>
              <div className={payload.book.info?.ratings?.stars.parentClass}>
                {Array(5)
                  .fill()
                  .map((_, index) => {
                    return (
                      <div
                        key={index}
                        className={payload.book.info?.ratings?.stars.class}
                      ></div>
                    );
                  })}
              </div>
              <div className={payload.book.info?.ratings?.data.parentClass}>
                <p className={payload.book.info?.ratings?.data.class}>
                  {ratingsData?.avg_rating ? ratingsData.avg_rating : 0} (
                  {ratingsData ? ratingsData.ratings_count : 0} Ratings)
                </p>
              </div>
            </div>
          )}
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
          {payload.book.invoice_id ? (
            <>
              <hr />
              <p className="invoice_id_p">
                Invoice ID: {payload.book.invoice_id}
              </p>
              <div className="transaction_info">
                <p>Quantity: {payload.book.info.invoice.quantity.value}</p>
                Transaction Info:
                <p
                  className="transaction_amount_p"
                  style={{
                    color:
                      payload.book.info.invoice.transactionInfo.type ===
                      "purchase"
                        ? "red"
                        : "green",
                  }}
                >
                  {payload.book.info.invoice.transactionInfo.value}
                </p>
                <p>
                  Timestamp:{" "}
                  {new Date(
                    payload.book.info.invoice.timestamp.value
                  ).toLocaleString(
                    "en-US",
                    (options = {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })
                  )}
                </p>
              </div>
            </>
          ) : null}
          {payload.book.donate_id ? (
            <>
              <p className={payload.book.info.donation.quantity.class}>
                Quantity: {payload.book.info.donation.quantity.value}
              </p>
              <p className={payload.book.info.donation.from.class}>
                Request By: {payload.book.info.donation.from.value}
              </p>
              <p>
                Timestamp:{" "}
                {new Date(
                  payload.book.info.donation.timestamp.value
                ).toLocaleString(
                  "en-US",
                  (options = {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })
                )}
              </p>
            </>
          ) : null}
        </div>
        {options === "crate" &&
          (showListingForm ? (
            <form
              action="/update_listing"
              method="POST"
              id="listing_form"
              onSubmit={(event) => updateListing(event)}
              onReset={() => setShowForm(false)}
            >
              <label htmlFor="id_price">Price (Credits):</label>
              <input
                type="number"
                name="price"
                min="1"
                max="100000"
                required={true}
                id="id_price"
                defaultValue={saleData?.price}
              />
              <label htmlFor="id_stock">Stock:</label>
              <input
                type="number"
                name="stock"
                min="1"
                max="10000"
                required={true}
                id="id_stock"
                defaultValue={saleData?.stock}
              />
              <label htmlFor="id_book_isbn">ISBN:</label>
              <input
                type="text"
                name="book_isbn"
                readOnly={true}
                maxLength="13"
                id="id_book_isbn"
                value={payload.book.isbn}
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
            </form>
          ) : null)}
        {payload.book.review ? (
          <div className="book_review">
            <div className="review_username_header">
              <p onClick={() => setViewProfile(true)}>
                {payload.book.review.reviewer}
              </p>
              {payload.book.review.reviewerId === userData?.userId ? (
                <div
                  className="review_options_container"
                  style={{ position: "relative", display: "inline-block" }}
                >
                  <i
                    className="user_review_options bi bi-three-dots-vertical"
                    onClick={() => setShowDropdown(!showDropdown)}
                  />
                  {showDropdown && !showForm && (
                    <ul className="user_review_options_dropdown dropdown-menu show">
                      <li
                        className="dropdown-item"
                        onClick={() => setShowForm(true)}
                      >
                        Edit
                      </li>
                      <li
                        className="dropdown-item"
                        onClick={() => deleteReview()}
                      >
                        Delete
                      </li>
                    </ul>
                  )}
                </div>
              ) : null}
              {payload.book.review.reviewerId != userData?.userId ? (
                bookmarks[payload.book.review.reviewerId] ? (
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
                )
              ) : null}
            </div>
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
            <div className="review_content_div">
              <div className="review_content">
                {payload.book?.review?.content && !showForm ? (
                  content
                ) : !showForm ? (
                  <p className="no_review_content">Not reviewed yet</p>
                ) : null}
                {showForm ? (
                  <form
                    action="/manage_review"
                    method="post"
                    id="user_review_form"
                    onSubmit={(event) => updateReview(event)}
                    onReset={() => setShowForm(false)}
                  >
                    <textarea
                      name="content"
                      cols="40"
                      rows="10"
                      required={true}
                      id="id_content"
                      defaultValue={content}
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
              </div>
            </div>
            {payload.book?.review?.content ? (
              <>
                <div className="review_like_button_div">
                  <div
                    className={userLiked ? "liked_button" : "like_button"}
                    style={userData?.isUser ? { cursor: "pointer" } : null}
                    onClick={() => handleLikeToggle()}
                  ></div>{" "}
                  <div className="review_like_count_div">{likes}</div>
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
              </>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );
}

export default Card;
