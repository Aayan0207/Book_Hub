import React, { useState, useEffect } from "react";
import "../assets/book_crate/book_crate.css";
import Card from "./Card";
import Spinner from "./spinner";

function Donations({ userData, setPage, setIsbn }) {
  const urlPrefix = "http://localhost:8000";
  const [more, setMore] = useState(true);
  const [batch, setBatch] = useState(1);
  const [requests, setRequests] = useState([]);
  const [requestsData, setRequestsData] = useState({});
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    fetch(`${urlPrefix}/load_donations`, {
      method: "POST",
      body: JSON.stringify({
        id: userData?.userId,
        page: 1,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setMore(data.next);
        setRequests(data.donations);
        setTimeout(() => setShowSpinner(false), 2000);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    if (batch === 1) return;
    fetch(`${urlPrefix}/load_donations`, {
      method: "POST",
      body: JSON.stringify({
        page: batch,
        id: userData?.userId,
      }),
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
  }, [batch]);

  useEffect(() => {
    if (!requests || requests.length === 0) return;
    requests.forEach((request) => {
      const isbn = request.book_isbn;
      fetch(`${urlPrefix}/book_result`, {
        method: "POST",
        body: JSON.stringify({
          isbn: isbn,
        }),
      })
        .then((response) => response.json())
        .then((data) =>
          setRequestsData((prev) => {
            return { ...prev, [isbn]: data?.result?.items?.[0]?.volumeInfo };
          })
        )
        .catch((error) => console.log(error));
    });
  }, [requests]);

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
        <button className="add_donation_button btn btn-success">
          <i className="bi bi-bookmark-plus"></i> Add Book Donation Request
        </button>
      </h3>
      <hr />
      <div id="user_donations">
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
        ) : (
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
