import React, { useState, useEffect } from "react";
import "../assets/book_crate/book_crate.css";
import Card from "./Card";
import Spinner from "./spinner";
import getToken from "./getToken";

function Admin_Donations({ userData, setPage, setIsbn }) {
  if (!userData || !userData?.isSuper) return setPage("login");
  const urlPrefix = "http://localhost:8000";
  const token = getToken();
  const [more, setMore] = useState(true);
  const [batch, setBatch] = useState(1);
  const [requests, setRequests] = useState([]);
  const [requestsData, setRequestsData] = useState({});
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${urlPrefix}/load_admin_donations`, {
      method: "POST",
      body: JSON.stringify({
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
    if (!token || batch === 1) return;
    fetch(`${urlPrefix}/load_admin_donations`, {
      method: "POST",
      body: JSON.stringify({
        page: batch,
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
          setShowSpinner(false);
          setMore(data.next);
        }, 2000);
      })
      .catch((error) => console.log(error));
  }, [batch, token]);

  useEffect(() => {
    if (!token || !requests || requests.length === 0) return;
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
      <h3 id="superuser_header">Welcome, Librarian {userData?.user}</h3>
      <hr />
      <div id="donations_div">
        {requests.length > 0 ? (
          requests.map((item) => {
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
                    from: {
                      class: "donate_book_username",
                      value: item.user_id__username,
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
                options={"admin_donation"}
              />
            );
          })
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <h2>No Book Donations Yet.</h2>
          </div>
        )}
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
                setShowSpinner(true);
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

export default Admin_Donations;
