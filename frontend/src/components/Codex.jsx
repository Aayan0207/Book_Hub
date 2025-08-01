import Card from "./Card.jsx";
import getToken from "./getToken.jsx";
import Spinner from "./spinner.jsx";
import React, { useEffect, useState } from "react";
import "../assets/codex/codex.css";

function Codex({ setPage, setIsbn }) {
  const urlPrefix = "http://localhost:8000";
  const token = getToken();
  const [viewSpinner, setViewSpinner] = useState(false);

  const [data, setData] = useState({});
  const [payload, setPayload] = useState({});

  useEffect(() => {
    if (!payload || !payload.token || !payload.data) return;
    fetch(`${urlPrefix}/codex/book_results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": payload.token,
      },
      credentials: "include",
      body: JSON.stringify(payload.data),
    })
      .then((response) => response.json())
      .then((receivedData) => setData(receivedData))
      .catch((error) => console.log(error));
  }, [payload]);


  function submitForm(event) {
    event.preventDefault();
    setViewSpinner(true);
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
    setTimeout(() => {
      setViewSpinner(false);
    }, 2600);
  }
  return (
    <>
      <div id="search_book_form_div" align="center">
        <h2 id="codex_header">Scour the Internet for books</h2>
        <form
          action="/book_results"
          method="post"
          id="search_book_form"
          onSubmit={(event) => submitForm(event)}
        >
          <input type="hidden" name="csrfmiddlewaretoken" />
          <div>
            <select name="select" id="id_select" className="form-select">
              <option value="title">Title</option>
              <option value="author">Author</option>
              <option value="isbn">ISBN</option>
              <option value="publisher">Publisher</option>
              <option value="subject">Category</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              name="query"
              autoComplete="off"
              required=""
              id="id_query"
            />
          </div>
          <input
            type="submit"
            value="Search"
            id="book_search_button"
            className="btn btn-info"
          />
        </form>
      </div>
      {viewSpinner ? <Spinner /> : null}
      <div id="book_results">
        {!viewSpinner && data?.results?.totalItems > 0
          ? data.results.items.map((item) => {
              const isbn = item.volumeInfo.industryIdentifiers[0].identifier;
              const cardData = {
                user: { isuser: false, issuper: false },
                book: {
                  isbn: isbn,
                  parentClass: "search_book_result",
                  image: {
                    parentClass: "search_book_cover_image_div",
                    class: "search_book_cover_image",
                    source: item.volumeInfo.imageLinks
                      ? item.volumeInfo.imageLinks.thumbnail
                      : null,
                  },
                  options: {},
                  info: {
                    parentClass: "search_book_info",
                    title: {
                      class: "search_book_title",
                      value: item.volumeInfo.title,
                    },
                    author: {
                      class: "search_book_author",
                      value: item.volumeInfo.authors,
                    },
                    ratings: {
                      parentClass: "search_rating_div",
                      bar: {
                        parentClass: "search_ratings_bar_div",
                        class: "search_rating_bar",
                      },
                      stars: {
                        parentClass: "search_ratings_stars_div",
                        class: "search_ratings_star",
                      },
                      data: {
                        parentClass: "search_ratings_count_div",
                        class: "search_rating_info",
                      },
                    },
                    publishInfo: {
                      class: "search_book_publish_info",
                      value: `${item.volumeInfo.publishedDate} (${item.volumeInfo.publisher})`,
                    },
                    snippet: {
                      class: "search_book_snippet",
                      value: item.searchInfo
                        ? item.searchInfo.textSnippet
                        : "No Snippet Available.",
                    },
                  },
                },
              };
              return (
                <Card key={item.id} payload={cardData} setPage={setPage} setIsbn={setIsbn}/>
              );
            })
          : null}
      </div>
    </>
  );
}

export default Codex;
