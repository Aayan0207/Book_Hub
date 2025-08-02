import React from "react";

function Paginator({ page, setPage, maxPage }) {
  function decrement() {
    if (page === 1) return;
    setPage(page - 1);
  }
  function increment() {
    if (page === maxPage) return;
    setPage(page + 1);
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
