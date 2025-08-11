import React, { useState, useEffect } from "react";
import "../assets/book_crate/book_crate.css";
import getToken from "./getToken.jsx";
import Spinner from "./spinner.jsx";
import Card from "./Card";
import Paginator from "./Pagination.jsx";

function Book_Crate({ setPage, setIsbn, userData = null }) {
  const urlPrefix = "http://localhost:8000";
  const token = getToken();
  const [payload, setPayload] = useState({
    data: {
      query: "",
      select: "",
      page: 1,
    },
    token: token,
  });
  const [listings, setListings] = useState({});
  const [listingsData, setListingsData] = useState({});
  const [refreshListings, setRefreshListings] = useState(false);
  const [slide, setSlide] = useState(1);
  const [newListing, setNewListing] = useState({});
  const [invalid, setInvalid] = useState(false);
  const [showGetForm, setShowGetForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAdminDonations, setShowAdminDonations] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showDonations, setShowDonations] = useState(false);
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    if (!showDonations) return;
    setPage("donations");
  }, [showDonations]);

  useEffect(() => {
    if (!showCart) return;
    setPage("cart");
  }, [showCart]);

  useEffect(() => {
    if (!showAdminDonations) return;
    setPage("admin_donations");
  }, [showAdminDonations]);

  useEffect(() => {
    setPayload({ ...payload, data: { ...payload.data, page: slide } });
  }, [slide]);

  useEffect(() => {
    fetch(`${urlPrefix}/load_listings`, {
      method: "POST",
      body: JSON.stringify({ page: 1, query: "", select: "" }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setListings(data);
        setTimeout(() => setShowSpinner(false), 3000);
      })
      .catch((error) => console.log(error));
  }, [refreshListings]);

  useEffect(() => {
    if (!listings.listings) return;
    listings.listings.forEach((listing) => {
      fetch(`${urlPrefix}/book_result`, {
        method: "POST",
        body: JSON.stringify({
          isbn: listing.book_isbn,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setListingsData((prev) => {
            return { ...prev, [listing.book_isbn]: data.result };
          });
        })
        .catch((error) => console.log(error));
    });
  }, [listings]);

  useEffect(() => {
    if (!payload) return;
    setListingsData({});
    fetch(`${urlPrefix}/load_listings`, {
      method: "POST",
      body: JSON.stringify(payload.data),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": payload.token,
      },
    })
      .then((response) => response.json())
      .then((data) => setListings(data))
      .catch((error) => console.log(error));
  }, [payload]);

  function submitForm(event) {
    event.preventDefault();
    const form = event.target;
    const details = {
      data: {
        query: form.querySelector("#id_query").value,
        select: form.querySelector("#id_select").value,
        page: 1,
      },
      token: token,
    };
    setPayload(details);
    setSlide(1);
  }

  function findListing(event) {
    if (!userData?.isSuper) return;
    setInvalid(false);
    setShowAddForm(false);
    event.preventDefault();
    const form = event.target;
    fetch(`${urlPrefix}/book_result`, {
      method: "POST",
      body: JSON.stringify({
        isbn: form.querySelector("#id_book_isbn").value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result.totalItems != 1) {
          setInvalid(true);
          return;
        }
        setNewListing(data.result.items?.[0].volumeInfo);
        setShowAddForm(true);
      })
      .catch((error) => console.log(error));
  }

  function addListing(event) {
    if (!userData?.isSuper) return;
    event.preventDefault();
    const form = event.target;
    fetch(`${urlPrefix}/update_listing`, {
      method: "POST",
      body: JSON.stringify({
        isbn: form.querySelector("#id_book_isbn").value,
        price: form.querySelector("#id_price").value,
        stock: form.querySelector("#id_stock").value,
        title: newListing?.title,
        author: newListing?.authors.join(", "),
        publisher: newListing?.publisher,
        librarian_id: userData?.userId,
      }),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setIsbn(data.listing[0].book_isbn);
        setPage("book");
      })
      .catch((error) => console.log(error));
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h2 id="header">Browse the Crate and find your next read!</h2>
      </div>
      {userData?.isUser ? (
        userData?.isSuper ? (
          <>
            <h3 id="superuser_header">
              <p>Welcome, Librarian {userData?.user}</p>
              <div>
                <button
                  id="create_listing"
                  className="btn btn-success"
                  onClick={() => setShowGetForm(true)}
                >
                  <i className="bi bi-plus-square"></i>Add Listing
                </button>
                <button
                  id="manage_donations"
                  className="btn btn-warning"
                  onClick={() => setShowAdminDonations(true)}
                >
                  <i className="bi bi-book"></i> Manage Book Donations
                </button>
              </div>
            </h3>
            <hr />
          </>
        ) : (
          <>
            <h3 id="user_header">
              <p>Welcome, {userData?.user}</p>
              <button
                id="donate_books"
                className="btn btn-success"
                onClick={() => setShowDonations(true)}
              >
                <i className="bi bi-archive"></i> Donate Books
              </button>
              <button
                id="cart_icon"
                className="btn btn-dark"
                onClick={() => setShowCart(true)}
              >
                <i className="bi bi-cart4"></i>
                Cart
              </button>
            </h3>
            <hr />
          </>
        )
      ) : null}
      {userData?.isSuper &&
        (showGetForm ? (
          <>
            <form
              action="/search_listing"
              method="POST"
              id="search_listing_form"
              onReset={() => setShowGetForm(false)}
              onSubmit={(event) => findListing(event)}
            >
              <div>
                <label htmlFor="id_book_isbn">ISBN:</label>
                <input
                  type="text"
                  name="book_isbn"
                  autoComplete="off"
                  maxLength="13"
                  required={true}
                  id="id_book_isbn"
                />
              </div>
              <div>
                <input
                  type="submit"
                  value="Fetch Book"
                  className="btn btn-success"
                  id="search_listing_button"
                />
                <input
                  type="reset"
                  value="Cancel"
                  className="btn btn-danger"
                  id="cancel_listing_button"
                />
              </div>
            </form>
            <hr />
          </>
        ) : null)}
      {invalid ? (
        <div
          className="alert alert-warning alert-dismissible fade show"
          role="alert"
          id="no_search_result_alert"
        >
          No results found. Are you sure that the ISBN is correct?
          <span
            onClick={() => setInvalid(false)}
            className="close_alert_button"
          >
            <i className="bi bi-x-square"></i>
          </span>
        </div>
      ) : null}
      {showAddForm && newListing ? (
        <>
          <div id="search_result">
            <div id="search_cover_image_div">
              <img
                id="search_cover_image"
                src={newListing.imageLinks.thumbnail}
              />
            </div>
            <div id="search_book_info">
              <p id="search_book_title">{newListing.title}</p>
              <p id="search_book_author">by {newListing.authors.join(", ")}</p>
              <form
                action="/update_listing"
                method="POST"
                id="listing_form"
                onReset={() => setShowAddForm(false)}
                onSubmit={(event) => addListing(event)}
              >
                <label htmlFor="id_price">Price (Credits):</label>
                <input
                  type="number"
                  name="price"
                  min="1"
                  max="100000"
                  required={true}
                  id="id_price"
                />
                <label htmlFor="id_stock">Stock:</label>
                <input
                  type="number"
                  name="stock"
                  min="1"
                  max="10000"
                  required={true}
                  id="id_stock"
                />
                <label htmlFor="id_book_isbn">ISBN:</label>
                <input
                  type="text"
                  name="book_isbn"
                  readOnly={true}
                  maxLength="13"
                  minLength="10"
                  value={newListing.industryIdentifiers[0].identifier}
                  id="id_book_isbn"
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
            </div>
          </div>
          <hr />
        </>
      ) : null}
      <div id="search_book_form_div">
        <form
          action="/load_listings"
          method="post"
          id="search_book_form"
          onSubmit={(event) => submitForm(event)}
          onReset={() => setRefreshListings(!refreshListings)}
        >
          <div>
            <select name="select" id="id_select" className="form-select">
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="isbn">ISBN</option>
              <option value="publisher">Publisher</option>
            </select>
          </div>
          <div>
            <input type="text" name="query" autoComplete="off" id="id_query" />
          </div>
          <br />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
            }}
          >
            <input
              type="submit"
              value="Search"
              className="btn btn-primary"
              id="book_search_button"
            />
            <input
              type="reset"
              value="Reset"
              className="btn btn-secondary"
              id="book_reset_button"
            />
          </div>
        </form>
      </div>
      {showSpinner ? <Spinner /> : null}
      <div id="listing_results">
        {listings?.listings
          ? listings.listings.map((item) => {
              const isbn = item.book_isbn;
              if (
                !listingsData[isbn] ||
                !listingsData[isbn]?.items?.[0]?.volumeInfo
              )
                return;
              const bookData = listingsData[isbn];
              const cardData = {
                book: {
                  isbn: isbn,
                  sale_id: item.id,
                  parentClass: "listing_load_book_result",
                  image: {
                    parentClass: "listing_book_cover_image_div",
                    class: "listing_book_cover_image",
                    source: bookData.items?.[0].volumeInfo.imageLinks.thumbnail,
                  },
                  info: {
                    parentClass: "listing_book_info",
                    title: {
                      class: "listing_book_title",
                      value: bookData.items?.[0].volumeInfo.title,
                    },
                    author: {
                      class: "listing_book_author",
                      value: bookData.items?.[0].volumeInfo.authors,
                    },
                    listing: {
                      stock: {
                        class: "listing_book_stock",
                        value: item.stock,
                      },
                      price: {
                        class: "listing_book_price",
                        value: item.price,
                      },
                      timestamp: {
                        value: item.timestamp,
                      },
                    },
                    ratings: {
                      parentClass: "listing_book_rating_div",
                      bar: {
                        parentClass: "listing_book_ratings_bar_div",
                        class: "listing_book_rating_bar",
                      },
                      stars: {
                        parentClass: "listing_book_ratings_stars_div",
                        class: "listing_book_ratings_star",
                      },
                      data: {
                        parentClass: "listing_book_ratings_count_div",
                        class: "listing_book_rating_info",
                      },
                    },
                  },
                },
              };
              return (
                <Card
                  key={item.id}
                  payload={cardData}
                  setPage={setPage}
                  setIsbn={setIsbn}
                  userData={userData}
                  options="crate"
                />
              );
            })
          : null}
      </div>
      <Paginator page={slide} setPage={setSlide} maxPage={listings?.maximum} />
    </>
  );
}

export default Book_Crate;
