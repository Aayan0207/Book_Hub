import React, {useState} from "react";
import "../assets/main/main.css";

function Landing({setPage, userData}) {

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <header>
          Primarily designed to pertain to the readers of The Book Hub Library
          with much more to offer to their community.
        </header>
        <h1>
          Welcome to Book Hub
          <img id="book_hub_img" src="/assets/main/BookHub_Icon.png" />
        </h1>
        {!userData?.isUser ? 
        <h2><a onClick={() => setPage("register")} id="landing_link">Login/Register</a> to gain access to all the features of Book Hub.</h2>
        :null}
        <div id="button_grid">
          <button className="btn btn-info" onClick={() => setPage("book_crate")}>
            <img src="/assets/book_crate/Book crate final.png" />
            <p className="app_header">Book Crate</p>
            <p className="app_content">

              A platform where Librarians can add/delete/update listings and
              community members can search among the available ones. Either
              purchase books immediately using the Library's credit system or
              add them to your cart to save them for later. You may also request
              to donate books to The Book Hub through the Book Crate. If
              accepted, one credit per book donated is gained. Invoices are
              generated and provided for each transaction made.

            </p>
          </button>

          <button className="btn btn-success" onClick={() => setPage("readers_grove")}>
            <img src="/assets/readers_grove/Readers Grove Final.png" />
            <p className="app_header">Reader's Grove</p>
            <p className="app_content">
              A networking area for the community, complete with showing ratings
              & reviews on various books from across the community as well as
              profiles that you have bookmarked (followed). You can also have
              your very own bookshelf! As and when you come across book results
              on the website, in addition to rating and/or reviewing them, you
              may also add them to your bookshelf under the tag "Read",
              "Currently Reading", or "Want to Read" which will be shown on your
              profile along with an about section to tell others about yourself.

            </p>
          </button>

          <button className="btn btn-warning" onClick={() => setPage("codex")}>
            <img id="codex_img" src="/assets/codex/Codex 3.png" />
            <p className="app_header">Codex</p>
            <p className="app_content">
              Powered with the help of Google Books API, scour the internet for
              millions of books and find the right ones for you. Offering a
              method to search using the title but also giving the ability to
              look up information using a book's ISBN, authors, publishers, and
              even its genre/category. Each result available has its own result
              page, containing detailed information that combines both the
              results from the Google Books API and the thoughts and opinions of
              the Book Hub community.

            </p>
          </button>
        </div>
      </div>
      <div align="center">
        <footer>
          The Book Hub Library is purely fictional in nature, created as a base
          idea for this project.
        </footer>
      </div>
    </>
  );
}
export default Landing;
