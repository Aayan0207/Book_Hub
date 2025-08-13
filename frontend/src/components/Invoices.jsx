import React, { useEffect, useState } from "react";
import getToken from "./getToken.jsx";
import Card from "./Card";
import Spinner from "./spinner.jsx";
function Invoices({ userData, setPage, setIsbn }) {
  const token = getToken();
  const urlPrefix = "http://localhost:8000";
  const [more, setMore] = useState(false);
  const [batch, setBatch] = useState(1);
  const [invoices, setInvoices] = useState([]);
  const [invoicesData, setInvoicesData] = useState({});
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${urlPrefix}/get_user_invoices`, {
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
        setInvoices(data.invoices);
      })
      .catch((error) => console.log(error));
  }, [userData, token]);

  useEffect(() => {
    if (!token) return;
    if (batch === 1) return;
    setShowSpinner(true);
    fetch(`${urlPrefix}/get_user_invoices`, {
      method: "POST",
      body: JSON.stringify({
        id: userData?.userId,
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
        setMore(data.next);
        setInvoices((prev) => {
          return [...prev, ...data.invoices];
        });
      })
      .catch((error) => console.log(error));
    setTimeout(() => {
      setShowSpinner(false);
    }, 3000);
  }, [batch, token]);

  useEffect(() => {
    if (!token) return;
    if (!invoices) return;
    invoices.forEach((invoice) => {
      const isbn = invoice.book_isbn;
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
        .then((data) => {
          setInvoicesData((prev) => {
            return {
              ...prev,
              [invoice.id]: data.result?.items?.[0]?.volumeInfo,
            };
          });
        })
        .catch((error) => console.log(error));
    });
  }, [invoices, token]);

  return (
    <>
      <div id="invoices_div">
        <h2 className="invoices_header">Invoices</h2>
        {invoices
          ? invoices.map((item) => {
              const id = item.id;
              if (!invoicesData[id]) return;
              const bookData = invoicesData[id];
              const alertType = () => {
                const type = item.transaction_type;
                const amount = item.transaction_amount;
                if (type === "purchase") {
                  return "primary";
                } else if (type === "sale" && amount > 0) {
                  return "success";
                } else if (type === "sale" && amount === 0) {
                  return "danger";
                }
                return "secondary";
              };

              const transactionInfo = () => {
                const type = item.transaction_type;
                const amount = item.transaction_amount;
                if (type === "purchase") {
                  return `-${amount} (Purchase)`;
                } else if (type === "sale" && amount > 0) {
                  return `+${amount} (Donation)`;
                } else if (type === "sale" && amount === 0) {
                  return "0 (Donation)";
                }
                return "";
              };
              const cardDetails = {
                book: {
                  isbn: item.book_isbn,
                  invoice_id: id,
                  parentClass: `book_div alert alert-${alertType()}`,
                  image: {
                    parentClass: "book_cover_image_div",
                    class: "cover_image",
                    source: bookData.imageLinks.thumbnail,
                  },
                  info: {
                    parentClass: "book_info_div",
                    title: {
                      class: "book_title",
                      value: bookData.title,
                    },
                    author: {
                      class: "book_author",
                      value: bookData.authors,
                    },
                    invoice: {
                      quantity: {
                        value: item.quantity,
                      },
                      transactionInfo: {
                        value: transactionInfo(),
                        type: item.transaction_type,
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
                  setIsbn={setIsbn}
                  setPage={setPage}
                  userData={userData}
                  options={"invoice"}
                />
              );
            })
          : null}
        {showSpinner ? <Spinner /> : null}
        {more && !showSpinner ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <button
              id="more_invoices_button"
              className="btn btn-info"
              onClick={() => {
                setMore(false);
                setBatch(batch + 1);
              }}
            >
              Load More Invoices
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default Invoices;
