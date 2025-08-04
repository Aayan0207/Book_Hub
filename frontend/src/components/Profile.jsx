import React, { useState, useEffect, act } from "react";
import Picture from "./Picture";
function Profile({ userData, setPage, setIsbn }) {
  const urlPrefix = "http://localhost:8000";
  const [quote, setQuote] = useState(null);
  const [activityInfo, setActivityInfo] = useState({});
  const [currently, setCurrently] = useState([]);
  const [want, setWant] = useState([]);

  useEffect(() => {
    if (!userData?.isUser) return;
    fetch(`${urlPrefix}/get_bookshelf`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userData.userId,
        page: 1,
        shelf: "want to read",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setWant(data.bookshelf.slice(0, 3));
      });
  }, [userData]);

  useEffect(() => {
    if (!userData?.isUser) return;
    fetch(`${urlPrefix}/get_bookshelf`, {
      method: "POST",
      body: JSON.stringify({
        user_id: userData.userId,
        page: 1,
        shelf: "currently reading",
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setCurrently(data.bookshelf.slice(0, 3));
      });
  }, [userData]);

  useEffect(() => {
    if (!userData?.isUser) return;
    fetch(`${urlPrefix}/user_activity_info`, {
      method: "POST",
      body: JSON.stringify({
        id: userData?.userId,
      }),
    })
      .then((response) => response.json())
      .then((data) => setActivityInfo(data.activity))
      .catch((error) => console.log(error));
  }, [userData]);

  useEffect(() => {
    if (!userData?.isUser) return;
    fetch(`${urlPrefix}/get_quote`, {
      method: "POST",
      body: JSON.stringify({
        id: userData?.userId,
      }),
    })
      .then((response) => response.json())
      .then((data) => setQuote(data?.quote))
      .catch((error) => console.log(error));
  }, [userData]);

  return (
    <>
      <div id="user_info">
        <h2>{userData?.user}</h2>
        <div id="credits_div">
          <hr />
          {
            userData?.isSuper ? (
              <p id="credits_p">Admin. No Credits required.</p>
            ) : null /*Change for regular user*/
          }
          <hr />
        </div>
        <div id="quote_div">
          <p id="quote">{quote}</p>
          {/*Add form to update quote*/}
          <button className="update_quote btn btn-info">Update About</button>
          <button className="delete_quote btn btn-danger">Delete About</button>
        </div>
        <hr />
        <div id="user_activity_info">
          <div id="user_bookshelf_info_parent">
            <div id="user_bookshelf_info" align="center">
              Bookshelf
              <p id="user_bookshelf_count">
                {activityInfo?.bookshelf_all_count
                  ? activityInfo.bookshelf_all_count
                  : 0}
              </p>
            </div>
            <div className="user_sub_bookshelf_info" align="center">
              Read
              <p id="user_bookshelf_read_count">
                {activityInfo?.bookshelf_read_count
                  ? activityInfo.bookshelf_read_count
                  : 0}
              </p>
            </div>
            <div className="user_sub_bookshelf_info" align="center">
              Currently Reading
              <p id="user_bookshelf_currently_reading_count">
                {activityInfo?.bookshelf_currently_reading_count
                  ? activityInfo.bookshelf_currently_reading_count
                  : 0}
              </p>
            </div>
            <div className="user_sub_bookshelf_info" align="center">
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
