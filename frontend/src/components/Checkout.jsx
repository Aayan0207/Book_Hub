import React, { useState, useEffect } from "react";
import Card from "./Card";
import Spinner from "./spinner";
import getToken from "./getToken";
function Checkout({ userData, setIsbn, setPage, checkoutItems, setUserData }) {
  if (!userData || userData?.isSuper) return setPage("login");
  const urlPrefix = "http://localhost:8000";
  const token = getToken();
  const [checkoutItemsData, setCheckoutItemsData] = useState({});
  const [total, setTotal] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [checkoutItemsListingData, setCheckoutItemsListingData] = useState({});
  const [purchaseData, setPurchaseData] = useState({});
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (!showCart) return;
    setPage("cart");
  }, [showCart]);

  useEffect(() => {
    if (!checkoutItems) return;

    setPurchaseData(Object.fromEntries(checkoutItems.map((item) => [item, 1])));

    checkoutItems.forEach((item) => {
      fetch(`${urlPrefix}/get_listing`, {
        method: "POST",
        body: JSON.stringify({
          id: item,
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
          setCheckoutItemsListingData((prev) => {
            return { ...prev, [item]: listing };
          });
          fetch(`${urlPrefix}/book_result`, {
            method: "POST",
            body: JSON.stringify({
              isbn: listing.book_isbn,
            }),
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": token,
            },
            credentials: "include",
          })
            .then((response) => response.json())
            .then((data) =>
              setCheckoutItemsData((prev) => {
                return {
                  ...prev,
                  [item]: data.result.items?.[0]?.volumeInfo,
                };
              })
            )
            .catch((error) => console.log(error));
        })
        .catch((error) => console.log(error));
    });
  }, [checkoutItems]);

  useEffect(() => {
    if (!purchaseData || Object.keys(checkoutItemsListingData).length === 0)
      return;
    setTotal(() => {
      let tmp = 0;
      for (const key in purchaseData) {
        tmp +=
          purchaseData[key] * parseInt(checkoutItemsListingData[key]?.price);
      }
      return tmp;
    });
  }, [purchaseData, checkoutItemsListingData]);

  async function purchaseItems() {
    if (userData.credits < total) {
      setInvalid(true);
      return;
    }

    const purchasePromises = Object.entries(purchaseData).map(
      ([item, quantity]) => {
        return fetch(`${urlPrefix}/purchase_listing`, {
          method: "POST",
          body: JSON.stringify({
            listing_id: item,
            quantity: quantity,
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
            if (!data.transaction) {
              setInvalid(true);
              throw new Error("Transaction failed");
            }
            setUserData((prev) => {
              return { ...prev, credits: data.credits };
            });
          });
      }
    );

    await Promise.all(purchasePromises);
    setShowCart(true);
  }

  return (
    <>
      <div className="checkout">
        <h2 id="header">Checkout</h2>
        <h2 class="user_credits">Your Credits: {userData.credits}</h2>
        <h2 class="grand_total">Grand Total: {total} Credits</h2>
        <hr />
        <div
          style={{
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            type="submit"
            className="btn btn-success"
            value="Purchase"
            id="purchase_button"
            disabled={userData.credits <= total}
            onClick={() => purchaseItems()}
          />
          <input
            type="reset"
            className="btn btn-danger"
            value="Cancel"
            id="cancel_purchase_button"
            onClick={() => setShowCart(true)}
          />
        </div>
        {invalid ? (
          <div
            className="alert alert-danger"
            role="alert"
            id="failed_transaction"
          >
            Transaction Failed. Insufficient Funds.
            <span
              onClick={() => setInvalid(false)}
              className="close_alert_button"
            >
              <i className="bi bi-x-square"></i>
            </span>
          </div>
        ) : null}
        <h3>Purchasing the following items:</h3>
        {checkoutItems
          ? checkoutItems.map((item) => {
              const BookData = checkoutItemsData[item];
              const ListingData = checkoutItemsListingData[item];

              if (!BookData || !ListingData) {
                return <Spinner />;
              }
              const cardDetails = {
                book: {
                  isbn: ListingData.book_isbn,
                  sale_id: ListingData.id,
                  parentClass: "checkout_item",
                  image: {
                    parentClass: "cover_image_div",
                    class: "cover_image",
                    source: BookData.imageLinks.thumbnail,
                  },
                  info: {
                    parentClass: "listing_book_info",
                    title: {
                      class: "listing_book_title",
                      value: BookData.title,
                    },
                    author: {
                      class: "listing_book_author",
                      value: BookData.authors,
                    },
                    listing: {
                      price: {
                        class: "listing_book_price",
                        value: ListingData.price,
                      },
                      stock: {
                        class: "listing_book_stock",
                        value: ListingData.stock,
                      },
                    },
                  },
                },
              };
              return (
                <Card
                  key={item}
                  payload={cardDetails}
                  setPage={setPage}
                  userData={userData}
                  setIsbn={setIsbn}
                  setPurchaseData={setPurchaseData}
                  options="checkout"
                />
              );
            })
          : null}
      </div>
    </>
  );
}

export default Checkout;
