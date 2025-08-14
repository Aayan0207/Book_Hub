import React, { useState, useEffect } from "react";
import Picture from "./Picture";
import getToken from "./getToken";

function Profile({
  userData,
  setPage,
  setIsbn,
  setUserData,
  profileView = false,
}) {
  const urlPrefix = "http://localhost:8000";
  const token = getToken();
  const [quote, setQuote] = useState(userData.quote);
  const [activityInfo, setActivityInfo] = useState({});
  const [currently, setCurrently] = useState([]);
  const [want, setWant] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [credits, setCredits] = useState(userData.credits);
  const [showCreditsForm, setShowCreditsForm] = useState(false);

  useEffect(() => {
    if (!token || !userData?.isUser) return;

    fetch(`${urlPrefix}/get_bookshelf`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userData.userId,
        page: 1,
        shelf: "want to read",
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setWant(data.bookshelf.slice(0, 3));
      });

    fetch(`${urlPrefix}/get_bookshelf`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userData.userId,
        page: 1,
        shelf: "currently reading",
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setCurrently(data.bookshelf.slice(0, 3));
      });

    fetch(`${urlPrefix}/user_activity_info`, {
      method: "POST",
      body: JSON.stringify({
        id: userData?.userId,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => setActivityInfo(data.activity))
      .catch((error) => console.log(error));
  }, [userData, token]);

  function updateQuote(event) {
    event.preventDefault();
    const form = event.target;
    fetch(`${urlPrefix}/update_quote`, {
      method: "POST",
      body: JSON.stringify({
        id: userData?.userId,
        content: form.querySelector("#id_quote").value,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setQuote(data.content);
        setUserData((prev) => {
          return { ...prev, quote: data.content };
        });
        setShowForm(false);
      })
      .catch((error) => console.log(error));
  }

  function deleteQuote() {
    fetch(`${urlPrefix}/update_quote`, {
      method: "POST",
      body: JSON.stringify({
        id: userData?.userId,
        content: "",
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((_) => {
        setQuote(null);
        setUserData((prev) => {
          return { ...prev, quote: "" };
        });
      })
      .catch((error) => console.log(error));
  }

  function addCredits(event) {
    event.preventDefault();
    const form = event.target;
    fetch(`${urlPrefix}/add_credits`, {
      method: "POST",
      body: JSON.stringify({
        id: userData?.userId,
        amount: form.querySelector("#id_credit_amount").value,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setCredits(data.credits);
        setShowCreditsForm(false);
        setUserData((prev) => {
          return { ...prev, credits: data.credits };
        });
      })
      .catch((error) => console.log(error));
  }

  return (
    <>
      <div id="user_info">
        <h2>{userData?.user}</h2>
        {!profileView && (
          <div id="credits_div">
            <hr />
            {userData?.isSuper ? (
              <p id="credits_p">Admin. No Credits required.</p>
            ) : (
              <>
                <p id="credits_p">Your Credits: {credits}</p>
                <button
                  id="add_credits_button"
                  className="btn btn-success"
                  onClick={() => setShowCreditsForm(true)}
                >
                  Add Credits
                </button>
                {showCreditsForm ? (
                  <form
                    action="/add_credits"
                    method="post"
                    id="user_credits_form"
                    onReset={() => setShowCreditsForm(false)}
                    onSubmit={(event) => addCredits(event)}
                  >
                    <hr />
                    <div>
                      <label htmlFor="id_credit_amount">Add Credits:</label>
                      <input
                        type="number"
                        name="credit_amount"
                        min="1"
                        max="10000"
                        required={true}
                        id="id_credit_amount"
                      />
                    </div>
                    <div>
                      <input
                        type="submit"
                        className="btn btn-success"
                        value="Add"
                        id="submit_credits_button"
                      />
                      <input
                        type="reset"
                        className="btn btn-danger"
                        value="Cancel"
                        id="cancel_credits_button"
                      />
                    </div>
                  </form>
                ) : null}
              </>
            )}
            {!profileView ? <hr /> : null}
          </div>
        )}
        <div id="quote_div">
          {!showForm ? <p id="quote">{quote}</p> : null}
          {showForm ? (
            <form
              action="/update_quote"
              method="post"
              id="update_quote_form"
              onSubmit={(event) => updateQuote(event)}
              onReset={() => setShowForm(false)}
            >
              <textarea name="quote" maxLength="2000" id="id_quote" required>
                {quote}
              </textarea>
              <input
                type="submit"
                className="btn btn-success"
                value="Add"
                id="submit_quote_button"
              />
              <input
                type="reset"
                className="btn btn-danger"
                value="Cancel"
                id="cancel_quote_button"
              />
            </form>
          ) : null}
          {!profileView &&
            (quote && !showForm ? (
              <>
                <button
                  className="update_quote btn btn-info"
                  onClick={() => setShowForm(true)}
                >
                  Update About
                </button>
                <button
                  className="delete_quote btn btn-danger"
                  onClick={() => deleteQuote()}
                >
                  Delete About
                </button>
              </>
            ) : !showForm ? (
              <button
                className="add_quote_button btn btn-success"
                onClick={() => setShowForm(true)}
              >
                Add About
              </button>
            ) : null)}
        </div>
        <hr />
        <div id="user_activity_info">
          <div id="user_bookshelf_info_parent">
            <div id="user_bookshelf_info">
              Bookshelf
              <p id="user_bookshelf_count">
                {activityInfo?.bookshelf_all_count
                  ? activityInfo.bookshelf_all_count
                  : 0}
              </p>
            </div>
            <div className="user_sub_bookshelf_info">
              Read
              <p id="user_bookshelf_read_count">
                {activityInfo?.bookshelf_read_count
                  ? activityInfo.bookshelf_read_count
                  : 0}
              </p>
            </div>
            <div className="user_sub_bookshelf_info">
              Currently Reading
              <p id="user_bookshelf_currently_reading_count">
                {activityInfo?.bookshelf_currently_reading_count
                  ? activityInfo.bookshelf_currently_reading_count
                  : 0}
              </p>
            </div>
            <div className="user_sub_bookshelf_info">
              Want to Read
              <p id="user_bookshelf_want_to_read_count">
                {activityInfo?.bookshelf_want_to_read_count
                  ? activityInfo.bookshelf_want_to_read_count
                  : 0}
              </p>
            </div>
          </div>
          <div id="user_ratings_info_div">
            <div id="user_ratings">
              Ratings
              <p id="user_ratings_count">
                {activityInfo?.ratings_count ? activityInfo.ratings_count : 0}
              </p>
            </div>
            <div id="user_bookmarks">
              Bookmarks
              <p id="user_bookmarks_count">
                {activityInfo?.bookmarks_count
                  ? activityInfo.bookmarks_count
                  : 0}
              </p>
            </div>
            <div id="user_reviews">
              Reviews
              <p id="user_reviews_count">
                {activityInfo?.reviews_count ? activityInfo.reviews_count : 0}
              </p>
            </div>
          </div>
        </div>
        <div id="user_reading_div">
          {/*Add dynamism and everything*/}
          <div id="user_currently_reading">
            <h3>Currently Reading</h3>
            <div className="user_image_items">
              {currently.map((item) => {
                return (
                  <Picture
                    key={item.book_isbn}
                    isbn={item.book_isbn}
                    cls={"user_currently_reading_image"}
                    setIsbn={setIsbn}
                    setPage={setPage}
                  />
                );
              })}
            </div>
          </div>
          <div id="user_want_to_read">
            <h3>Wants to Read</h3>
            <div className="user_image_items">
              {want.map((item) => {
                return (
                  <Picture
                    key={item.book_isbn}
                    isbn={item.book_isbn}
                    cls={"user_want_to_read_image"}
                    setIsbn={setIsbn}
                    setPage={setPage}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
