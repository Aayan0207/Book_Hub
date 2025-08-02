import React from "react";

function Paginator({ page, setPage, maxPage }) {
  if (!maxPage) return;
  function decrement() {
    if (page === 1) return;
    setPage(page - 1);
    window.scrollTo(0, 0);
  }
  function increment() {
    if (page === maxPage) return;
    setPage(page + 1);
    window.scrollTo(0, 0);
  }
  return (
    <div id="pagination_div">
      <nav>
        <ul className="pagination justify-content-center" id="pagination_list">
          <li
            className={`page-item page-link ${page === 1 ? "disabled" : null}`}
            onClick={() => decrement()}
          >
            Previous
          </li>
          {page > 1 ? (
            <li className="page-item page-link" onClick={() => decrement()}>
              {page - 1}
            </li>
          ) : null}
          <li className="page-item page-link active-link">{page}</li>
          {page < maxPage ? (
            <li className="page-item page-link" onClick={() => increment()}>
              {page + 1}
            </li>
          ) : null}
          <li
            className={`page-item page-link ${
              page === maxPage ? "disabled" : null
            }`}
            onClick={() => increment()}
          >
            Next
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Paginator;
