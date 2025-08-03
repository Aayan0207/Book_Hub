import React, { useState, useEffect } from "react";
import "../assets/readers_grove/readers_grove.css";
import Profile from "./Profile.jsx";
function Readers_Grove({ setPage, userData }) {
  useEffect(() => {
    if (!userData?.isUser) setPage("login");
  }, [userData]);

  const [view, setView] = useState("profile");

  function renderView() {
    switch (view) {
      case "profile":
        return <Profile userData={userData}/>;
    }
  }

  return (
    <>
      <div id="user_div">
        <div id="user_options_div">
          <ul id="user_options" className="nav flex-column">
            <li
              className="nav-item nav-link"
              id="account"
              onClick={() => setView("profile")}
            >
              {userData?.user}
            </li>
            <hr />
            <li
              className="nav-item nav-link"
              id="home"
              onClick={() => setView("feed")}
            >
              Home
            </li>
            <li
              className="nav-item nav-link"
              id="bookmarks"
              onClick={() => setView("bookmarks")}
            >
              Bookmarks
            </li>
            <hr />
            <li
              className="nav-item nav-link"
              id="bookshelf"
              onClick={() => setView("bookshelf")}
            >
              Bookshelf
            </li>
            <li
              className="nav-item nav-link"
              id="reviews"
              onClick={() => setView("ratings_reviews")}
            >
              Ratings &amp; Reviews
            </li>
          </ul>
        </div>
        <div>{renderView()}</div>
      </div>
    </>
  );
}

export default Readers_Grove;
