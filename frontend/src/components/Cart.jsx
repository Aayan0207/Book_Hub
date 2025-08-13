import React, { useEffect, useState } from "react";
import getToken from "./getToken.jsx";
import Card from "./Card.jsx";
import Spinner from "./spinner.jsx";

function Cart({ setPage, setIsbn, userData, setCheckoutItems, checkoutItems }) {
  if (!userData || userData?.isSuper) return setPage("login");
  const token = getToken();
  const urlPrefix = "http://localhost:8000";
  const [cart, setCart] = useState([]);
  const [cartData, setCartData] = useState({});
  const [more, setMore] = useState(false);
  const [batch, setBatch] = useState(1);
  const [showSpinner, setShowSpinner] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    if (!showCheckout) return;
    setPage("checkout");
  }, [showCheckout]);

  useEffect(() => {
    if (!cart) return;
    cart.forEach((item) => {
      fetch(`${urlPrefix}/book_result`, {
        method: "POST",
        body: JSON.stringify({
          isbn: item.book_isbn,
        }),
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": token,
        },
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) =>
          setCartData((prev) => {
            return {
              ...prev,
              [item.book_isbn]: data.result.items?.[0].volumeInfo,
            };
          })
        )
        .catch((error) => console.log(error));
    });
  }, [cart]);

  useEffect(() => {
    if (!userData?.userId) return;
    setCheckoutItems([]);
    fetch(`${urlPrefix}/load_cart`, {
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
        setCart(data.books);
        setTimeout(() => {
          setShowSpinner(false);
          setMore(data.next);
        }, 2000);
      })
      .catch((error) => console.log(error));
  }, [userData]);

  useEffect(() => {
    if (batch === 1) return;
    fetch(`${urlPrefix}/load_cart`, {
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
        setCart((prev) => {
          return [...prev, ...data.books];
        });
        setTimeout(() => {
          setShowSpinner(false);
          setMore(data.next);
        }, 2000);
      })
      .catch((error) => console.log(error));
  }, [batch]);

  return (
    <>
      <h2 id="header">
        Cart
        {checkoutItems.length > 0 && (
          <button
            className="btn btn-success"
            id="checkout_button"
            onClick={() => setShowCheckout(true)}
          >
            Proceed to Checkout
          </button>
        )}
      </h2>
      <hr />
      <div id="user_cart">
        {cart ? (
          cart.map((item) => {
            const isbn = item.book_isbn;
            if (!cartData[isbn]) return;
            const bookData = cartData[isbn];
            const cardDetails = {
              book: {
                isbn: isbn,
                cart_id: item.id,
                sale_id: item.listing_id,
                parentClass: "listing_book_result",
                image: {
                  parentClass: "listing_book_cover_image_div",
                  class: "listing_book_cover_image",
                  source: bookData.imageLinks?.thumbnail,
                },
                info: {
                  parentClass: "listing_book_info",
                  title: {
                    class: "listing_book_title",
                    value: bookData.title,
                  },
                  author: {
                    class: "listing_book_author",
                    value: bookData.authors,
                  },
                  listing: {
                    price: {
                      class: "listing_book_price",
                      value: item.listing_id__price,
                    },
                    stock: {
                      class: "listing_book_stock",
                      value: item.listing_id__stock,
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
                key={item.book_isbn}
                payload={cardDetails}
                setPage={setPage}
                userData={userData}
                setIsbn={setIsbn}
                setCheckoutItems={setCheckoutItems}
                checkoutItems={checkoutItems}
                options="cart"
              />
            );
          })
        ) : (
          <p>No Items in the Cart yet.</p>
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
              setShowSpinner(true);
            }}
          >
            Load More
          </button>
        </div>
      ) : null}
    </>
  );
}

export default Cart;
