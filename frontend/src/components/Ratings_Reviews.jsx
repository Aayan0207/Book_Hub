import React, { useState, useEffect } from "react";

function Ratings_Reviews({ userData, setPage, setIsbn }) {
  const urlPrefix = "http://localhost:8000";
  const [batch, setBatch] = useState(1);
  const [more, setMore] = useState(false);
  const [reviews, setReviews] = useState([]);
  
  useEffect(() => {
    fetch(`${urlPrefix}/get_user_reviews`, {
      method: "POST",
      body: JSON.stringify({
        id: userData?.userId,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setReviews(data.reviews);
        setMore(data.next);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <>
      <div className="reviews_div">
        <h2 class="reviews_header">Your Ratings &amp; Reviews</h2>
        {more ? <button className="btn btn-info">Load More</button> : null}
      </div>
    </>
  );
}

export default Ratings_Reviews;
