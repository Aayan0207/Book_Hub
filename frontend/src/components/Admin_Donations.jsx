import React, { useState, useEffect } from "react";
import "../assets/book_crate/book_crate.css";
import Card from "./Card";
function Admin_Donations({ userData, setPage, setIsbn }) {
  const urlPrefix = "http://localhost:8000";
  const [more, setMore] = useState(true);
  const [batch, setBatch] = useState(1);
  const [requests, setRequests] = useState([]);
  const [requestsData, setRequestsData] = useState({});

  useEffect(() => {
    fetch(`${urlPrefix}/load_admin_donations`, {
      method: "POST",
      body: JSON.stringify({
        page: 1,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setMore(data.next);
        setRequests(data.donations);
      })
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    if (batch === 1) return;
    fetch(`${urlPrefix}/load_admin_donations`, {
      method: "POST",
      body: JSON.stringify({
        page: batch,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setMore(data.next);
        setRequests((prev) => {
          return [...prev, ...data.donations];
        });
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
            return { ...prev, [isbn]: data?.result?.items?.[0] };
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
      <h3 id="superuser_header">Welcome, Librarian {userData?.user}</h3>
      <hr />
      <div id="donations_div">
        {requests.length > 0 ? (
          requests.map((item) => {
            const isbn = item.book_isbn;
            if (!requestsData[isbn] || !requestsData[isbn]?.volumeInfo) return;
            const bookData = requestsData[isbn];
            const cardDetails = {
              book: {
                isbn: isbn,
                donate_id: item.id,
                parentClass: "donate_book_result",
                image: {
                  parentClass: "donate_cover_image_div",
                  class: "donate_cover_image",
                  source: bookData.volumeInfo?.imageLinks?.thumbnail,
                },
                info: {
                  parentClass: "donate_book_info_div",
                  title: {
                    class: "donate_book_title",
                    value: bookData.volumeInfo?.title,
                  },
                  author: {
                    class: "donate_book_author",
                    value: bookData.volumeInfo?.authors,
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
      </div>
    </>
  );
}

export default Admin_Donations;
