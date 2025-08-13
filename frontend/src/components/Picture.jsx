import React, { useState, useEffect } from "react";
import getToken from "./getToken";

function Picture({ isbn, setIsbn, setPage, cls }) {
  if (!isbn.match(/(?:\d{10}|\d{13})/)) return;

  const token = getToken();
  const urlPrefix = "http://localhost:8000";
  const [viewBook, setViewBook] = useState(null);
  const [link, setLink] = useState(null);

  useEffect(() => {
    if (!viewBook) return;
    setIsbn(isbn);
    setPage("book");
  }, [viewBook]);

  useEffect(() => {
    if (!isbn) return;
    fetch(`${urlPrefix}/book_result`, {
      method: "POST",
      body: JSON.stringify({
        isbn: isbn,
      }),
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": token,
      },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) =>
        setLink(data.result?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail)
      )
      .catch((error) => console.log(error));
  }, [isbn]);

  return (
    <>
      <img className={cls} src={link} onClick={() => setViewBook(true)} />
    </>
  );
}

export default Picture;
