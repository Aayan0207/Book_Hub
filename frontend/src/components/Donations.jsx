import React, { useState, useEffect } from "react";
import "../assets/book_crate/book_crate.css";
import Card from "./Card";
import Spinner from "./spinner";
import getToken from "./getToken.jsx";

function Donations({ userData, setPage, setIsbn }) {
  if (!userData || userData?.isSuper) return setPage("login");
  const urlPrefix = "http://localhost:8000";
  const token = getToken();
  const [more, setMore] = useState(true);
  const [batch, setBatch] = useState(1);
  const [requests, setRequests] = useState([]);
  const [requestsData, setRequestsData] = useState({});
  const [showSpinner, setShowSpinner] = useState(true);
  const [showGetForm, setShowGetForm] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [newDonation, setNewDonation] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${urlPrefix}/load_donations`, {
      method: "POST",
      body: JSON.stringify({
        id: userData?.userId,
        page: 1,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setMore(data.next);
        setRequests(data.donations);
        setTimeout(() => setShowSpinner(false), 2000);
      })
      .catch((error) => console.log(error));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (batch === 1) return;
    fetch(`${urlPrefix}/load_donations`, {
      method: "POST",
      body: JSON.stringify({
        page: batch,
        id: userData?.userId,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setRequests((prev) => {
          return [...prev, ...data.donations];
        });
        setTimeout(() => {
          setMore(data.next);
          setShowSpinner(false);
        }, 2000);
      })
      .catch((error) => console.log(error));
  }, [batch, token]);

  useEffect(() => {
    if (!token) return;
    if (!requests || requests.length === 0) return;
    requests.forEach((request) => {
      const isbn = request.book_isbn;
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
        .then((data) =>
          setRequestsData((prev) => {
            return { ...prev, [isbn]: data?.result?.items?.[0]?.volumeInfo };
          })
        )
        .catch((error) => console.log(error));
    });
  }, [requests, token]);

  function fetchBook(event) {
    event.preventDefault();
    const form = event.target;
    setInvalid(false);
    setNewDonation({});
    setShowAddForm(false);
    fetch(`${urlPrefix}/book_result`, {
      method: "POST",
      body: JSON.stringify({
        isbn: form.querySelector("#id_book_isbn").value,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.result?.totalItems === 0) {
          setInvalid(true);
          return;
        }
        setNewDonation(data.result.items?.[0].volumeInfo);
        setShowAddForm(true);
      })
      .catch((error) => console.log(error));
  }

  function addDonation(event) {
    event.preventDefault();
    const form = event.target;
    fetch(`${urlPrefix}/update_donation`, {
      method: "POST",
      body: JSON.stringify({
        quantity: form.querySelector("#id_quantity").value,
        id: userData?.userId,
        isbn: form.querySelector("#id_book_isbn").value,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setRequests((prev) => {
          return [data.donation, ...prev];
        });
        setShowAddForm(false);
      })
      .catch((error) => console.log(error));
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h2 id="header">Book Donation Requests</h2>
      </div>
      <h3 id="user_header">
        Welcome, {userData?.user}
        <button
          className="add_donation_button btn btn-success"
          onClick={() => setShowGetForm(!showGetForm)}
        >
          <i className="bi bi-bookmark-plus"></i> Add Book Donation Request
        </button>
      </h3>
      <hr />
      {showGetForm ? (
        <>
          <form
            action="/book_result"
            method="post"
            id="donate_search_form"
            onReset={() => setShowGetForm(false)}
            onSubmit={(event) => fetchBook(event)}
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
                id="search_donate_button"
              />
              <input
                type="reset"
                value="Cancel"
                className="btn btn-danger"
                id="cancel_donate_button"
              />
            </div>
          </form>
          <hr />
        </>
      ) : null}
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
      {showAddForm && newDonation ? (
        <>
          <div id="donate_result">
            <div className="donate_result_book_cover_image_div">
              <img
                className="donate_result_book_cover_image"
                src={newDonation.imageLinks?.thumbnail}
              />
            </div>
            <div className="donate_book_info_div">
              <p className="donate_book_title">{newDonation.title}</p>
              <p className="donate_book_author">
                by {newDonation.authors.join(", ")}
              </p>
              <form
                action="/update_donation"
                method="POST"
                id="donate_form"
                onReset={() => setShowAddForm(false)}
                onSubmit={(event) => addDonation(event)}
              >
                <div>
                  <label htmlFor="id_quantity">Quantity:</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    max="100"
                    required={true}
                    id="id_quantity"
                  />
                </div>
                <input
                  type="hidden"
                  name="book_isbn"
                  maxLength="13"
                  value={newDonation.industryIdentifiers?.[0]?.identifier}
                  id="id_book_isbn"
                />
                <div>
                  <input
                    type="submit"
                    value="Donate"
                    className="btn btn-success"
                    id="create_donate_button"
                  />
                  <input
                    type="reset"
                    value="Cancel"
                    className="btn btn-danger"
                    id="cancel_create_donate_button"
                  />
                </div>
              </form>
            </div>
          </div>
          <hr />
        </>
      ) : null}
      <div id="user_donations">
        {requests.length > 0
          ? requests.map((item) => {
              const isbn = item.book_isbn;
              if (!requestsData[isbn] || !requestsData[isbn]) return;
              const bookData = requestsData[isbn];
              const cardDetails = {
                book: {
                  isbn: isbn,
                  donate_id: item.id,
                  parentClass: "donate_book_result",
                  image: {
                    parentClass: "donate_cover_image_div",
                    class: "donate_cover_image",
                    source: bookData?.imageLinks?.thumbnail,
                  },
                  info: {
                    parentClass: "donate_book_info_div",
                    title: {
                      class: "donate_book_title",
                      value: bookData?.title,
                    },
                    author: {
                      class: "donate_book_author",
                      value: bookData?.authors,
                    },
                    donation: {
                      quantity: {
                        class: "donate_book_quantity",
                        value: item.quantity,
                      },
                      timestamp: {
                        value: item.timestamp,
                      },
                    },
                  },
                },
              };
              return (
                <Card
                  key={item.id}
                  payload={cardDetails}
                  userData={userData}
                  setIsbn={setIsbn}
                  setPage={setPage}
                  options={"donation"}
                />
              );
            })
          : !showSpinner && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <h2>No Book Donation Requests Yet.</h2>
              </div>
            )}
      </div>
      {showSpinner ? <Spinner /> : null}
      {more ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <button
            className="btn btn-info"
            onClick={() => {
              setBatch(batch + 1);
              setMore(false);
            }}
          >
            Load More
          </button>
        </div>
      ) : null}
    </>
  );
}

export default Donations;
