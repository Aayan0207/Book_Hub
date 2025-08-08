import React, { useState, useEffect } from "react";
import "../assets/readers_grove/readers_grove.css";
import Profile from "./Profile.jsx";
import Bookshelf from "./Bookshelf.jsx";
import Ratings_Reviews from "./Ratings_Reviews.jsx";

function User({ setPage, userData, setIsbn, profileData }) {
  const [view, setView] = useState("profile");

  function renderView() {
    switch (view) {
      case "profile":
        return (
          <Profile userData={profileData} setPage={setPage} setIsbn={setIsbn} profileView={true}/>
        );
      case "bookshelf":
        return (
          <Bookshelf
            userData={profileData}
            setPage={setPage}
            setIsbn={setIsbn}
          />
        );
      case "ratings_reviews":
        return (
          <Ratings_Reviews
            userData={userData}
            setPage={setPage}
            setIsbn={setIsbn}
          />
        );
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
              {profileData?.user}
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
        <>{renderView()}</>
      </div>
    </>
  );
}

export default User;
