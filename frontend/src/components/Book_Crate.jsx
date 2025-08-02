import React, { useState, useEffect } from "react";
import "../assets/book_crate/book_crate.css";
import getToken from "./getToken.jsx";
import Spinner from "./spinner.jsx";
import Card from "./Card";

function Book_Crate({ setPage, setIsbn }) {
  const urlPrefix = "http://localhost:8000";
  const token = getToken();
  const [payload, setPayload] = useState({});
  const [listings, setListings] = useState({});
  const [listingsData, setListingsData] = useState({});

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
    if (!payload || !payload?.data?.query || !payload?.data?.select) return;
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
        page: 1, //Update this when pagination system set up
      },
      token: token,
    };
    setPayload(details);
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
        <h2 id="header">Browse the Crate and find your next read</h2>
      </div>
      <div id="search_book_form_div">
        <form
          action="/load_listings"
          method="post"
          id="search_book_form"
          onSubmit={(event) => submitForm(event)}
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
      <div id="listing_results">
        {listings?.listings ? (
          listings.listings.map((item) => {
            const isbn = item.book_isbn;
            if (
              !listingsData[isbn] ||
              !listingsData[isbn]?.items[0]?.volumeInfo
            )
              return;
            const bookData = listingsData[isbn];
            const cardData = {
              user: { isuser: false },
              book: {
                isbn: isbn,
                parentClass: "listing_load_book_result",
                image: {
                  parentClass: "listing_book_cover_image_div",
                  class: "listing_book_cover_image",
                  source: bookData.items[0].volumeInfo.imageLinks.thumbnail,
                },
                info: {
                  parentClass: "listing_book_info",
                  title: {
                    class: "listing_book_title",
                    value: bookData.items[0].volumeInfo.title,
                  },
                  author: {
                    class: "listing_book_author",
                    value: bookData.items[0].volumeInfo.authors,
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
              <Card key={item.id} payload={cardData} setPage={setPage} setIsbn={setIsbn} />
            );
          })
        ) : (
          <Spinner />
        )}
      </div>
    </>
  );
}

export default Book_Crate;
