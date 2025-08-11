import React, { useEffect, useState } from "react";
import getToken from "./getToken.jsx";
import Card from "./Card.jsx";
function Cart({ setPage, setIsbn, userData }) {
  const token = getToken();
  const urlPrefix = "http://localhost:8000";
  const [cart, setCart] = useState([]);
  const [cartData, setCartData] = useState({});
  const [more, setMore] = useState(false);
  const [batch, setBatch] = useState(1);

  useEffect(() => {
    if (!cart) return;
    cart.forEach((item) => {
      fetch(`${urlPrefix}/book_result`, {
        method: "POST",
        body: JSON.stringify({
          isbn: item.book_isbn,
        }),
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
    fetch(`${urlPrefix}/load_cart`, {
      method: "POST",
      body: JSON.stringify({
        id: userData?.userId,
        page: 1,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setCart(data.books);
        setMore(data.next);
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
    })
      .then((response) => response.json())
      .then((data) => {
        setCart((prev) => {
          return [...prev, ...data.books];
        });
        setMore(data.next);
      })
      .catch((error) => console.log(error));
  }, [batch]);

  return (
    <>
      <h2 id="header">
        Cart
        <button className="btn btn-success" id="checkout_button">
          Proceed to Checkout
        </button>
      </h2>
      <hr />
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
              options="cart"
            />
          );
        })
      ) : (
        <p>No Items in the Cart yet.</p>
      )}
      {more ? (
        <button
          className="btn btn-info"
          onClick={() => {
            setBatch(batch + 1);
            setMore(false);
          }}
        >
          Load More
        </button>
      ) : null}
    </>
  );
}

export default Cart;
