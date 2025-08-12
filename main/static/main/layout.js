document.addEventListener("DOMContentLoaded", () => {
  const codex_image = document.querySelector("#codex_image");
  const codex_link = document.querySelector("#codex_link");
  const book_crate_image = document.querySelector("#book_crate_image");
  const book_crate_link = document.querySelector("#book_crate_link");
  const readers_grove_link = document.querySelector("#readers_grove_link");
  const readers_grove_image = document.querySelector("#readers_grove_image");
  let book_crate_animation = null;
  let codex_animation = null;
  let readers_grove_animation = null;
  readers_grove_link.onmouseenter = () => {
    readers_grove_image.src = "/static/readers_grove/Readers Grove middle.gif";
    readers_grove_animation = setTimeout(() => {
      readers_grove_image.src = "/static/readers_grove/Readers Grove Post.png";
    }, 1350);
  };
  readers_grove_link.onmouseleave = () => {
    readers_grove_image.src = "/static/readers_grove/Readers Grove Initial.png";
    if (readers_grove_animation) {
      clearTimeout(readers_grove_animation);
      readers_grove_animation = null;
    }
  };
  readers_grove_link.onclick = (event) => {
    event.preventDefault();
    readers_grove_image.src = "/static/readers_grove/Readers Grove Final.png";
    setTimeout(() => {
      window.location.href = "/readers_grove";
    }, 500);
  };
  book_crate_link.onmouseenter = () => {
    book_crate_image.src = "/static/book_crate/Book crate middle.gif";
    book_crate_animation = setTimeout(() => {
      book_crate_image.src = "/static/book_crate/Book crate final.png";
    }, 1700);
  };
  book_crate_link.onmouseleave = () => {
    book_crate_image.src = "/static/book_crate/Book crate base.png";
    if (book_crate_animation) {
      clearTimeout(book_crate_animation);
      book_crate_animation = null;
    }
  };
  book_crate_link.onclick = (event) => {
    event.preventDefault();
    book_crate_image.src = "/static/book_crate/Book crate final.png";
    setTimeout(() => {
      window.location.href = "/book_crate";
    }, 500);
  };
  codex_link.onmouseenter = () => {
    codex_image.src = "/static/codex/Codex 1.gif";
    codex_animation = setTimeout(() => {
      codex_image.src = "/static/codex/Codex 2.gif";
    }, 2050);
  };
  codex_link.onclick = (event) => {
    event.preventDefault();
    codex_image.src = "/static/codex/Codex 3.png";
    setTimeout(() => {
      window.location.href = "/codex";
    }, 500);
  };
  codex_link.onmouseleave = () => {
    codex_image.src = "/static/codex/Codex base.png";
    if (codex_animation) {
      clearTimeout(codex_animation);
      codex_animation = null;
    }
  };
});
