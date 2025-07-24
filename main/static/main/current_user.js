const current_user = document.querySelector("#username").value;
var profile_user = document.querySelector("#profile").value;
var bookshelf_page = 1;
var bookshelf_next_page = true;
var reviews_page = 1;
var reviews_next_page = true;
var user_id=null;
var current_flag = null;
var profile_id=null;
document.addEventListener('DOMContentLoaded', () => {
    try{
    fetch('/get_user_id',{
        method:"POST",
        body:JSON.stringify({
            username:current_user
        })
    })
    .then(response => response.json())
    .then(data => {
        user_id=data["user_id"];
    });
}
catch{

}
    fetch('/get_user_id',{
        method:"POST",
        body:JSON.stringify({
            username:profile_user
        })
    })
    .then(response => response.json())
    .then(data => {
        profile_id=data["user_id"];
        load_account();
    });
    const bookshelf_div = document.querySelector("#user_bookshelf");
    bookshelf_div.style.display = "none";
    const bookshelf_button = document.querySelector("#bookshelf");
    bookshelf_button.onclick = () => {
        bookshelf_page = 1;
        bookshelf_next_page = true;
        current_flag = "all";
        load_bookshelf(current_flag, profile_user);
    };
    const bookshelf_selector = document.querySelector('#bookshelf_select');
    bookshelf_selector.onchange = (event) => {
        bookshelf_page = 1;
        bookshelf_next_page = true;
        current_flag = event.target.value.toLowerCase();
        load_bookshelf(current_flag, profile_user);
    };
    const reviews_button=document.querySelector("#reviews");
    reviews_button.onclick = () => load_reviews();
    const account_button=document.querySelector("#account");
    account_button.onclick = () => load_account();
    document.onscroll = () => {
        if (current_flag){
        let spinner = document.querySelector(".spinner-border.bookshelf-spinner");
        if (!spinner && window.innerHeight + window.scrollY >= document.documentElement.offsetHeight - 2 && bookshelf_next_page) {
            spinner = document.createElement("div");
            spinner.setAttribute("align", "center");
            spinner.classList.add("spinner-border", "text-success", "bookshelf-spinner");
            spinner.setAttribute("role", "status");
            spinner.innerHTML = '<span class="sr-only">Loading...</span>';
            if (document.querySelector("#bookshelf_all_div").style.display === "block") {
                document.querySelector("#bookshelf_all_div").append(spinner);
            } else if (document.querySelector("#bookshelf_read_div").style.display === "block") {
                document.querySelector("#bookshelf_read_div").append(spinner);
            } else if (document.querySelector("#bookshelf_want_to_read_div").style.display === "block") {
                document.querySelector("#bookshelf_want_to_read_div").append(spinner);
            } else if (document.querySelector("#bookshelf_currently_reading_div").style.display === "block") {
                document.querySelector("#bookshelf_currently_reading_div").append(spinner);
            }
            setTimeout(() => {
                spinner.remove();
                bookshelf_page += 1;
                load_bookshelf(current_flag, profile_user);
            }, 1000);
        }
    };
}
});

function load_account(){
    update_view("account");
    const account_div=document.querySelector("#user_info");
    const quote_div=account_div.querySelector("#quote_div");
    fetch("/get_quote",{
        method:"POST",
        body:JSON.stringify({
            id:profile_id
        })
    })
    .then(response => response.json())
    .then(data => {
        const quote=data["quote"];
        if (!quote){
            quote_div.querySelector("#quote").textContent="";
            return;
        }
        document.querySelector("#quote").textContent=quote;
    });
    fetch("/user_activity_info",{
        method:"POST",
        body:JSON.stringify({
            id:profile_id
        })
    })
    .then(response => response.json())
    .then(data =>{
        const activity=data["activity"];
        const activity_div=account_div.querySelector("#user_activity_info");
        activity_div.querySelector("#user_bookshelf_count").textContent=activity["bookshelf_all_count"];
        activity_div.querySelector("#user_bookshelf_read_count").textContent=activity["bookshelf_read_count"];
        activity_div.querySelector("#user_bookshelf_currently_reading_count").textContent=activity["bookshelf_currently_reading_count"];
        activity_div.querySelector("#user_bookshelf_want_to_read_count").textContent=activity["bookshelf_want_to_read_count"];
        activity_div.querySelector("#user_ratings_count").textContent=activity["ratings_count"];
        activity_div.querySelector("#user_reviews_count").textContent=activity["reviews_count"];
        activity_div.querySelector("#user_bookmarks_count").textContent=activity["bookmarks_count"];
    });
    const currently_reading_div=account_div.querySelector("#user_currently_reading");
    const want_to_read_div=account_div.querySelector("#user_want_to_read");
    fetch("/get_bookshelf",{
        method:"POST",
        body:JSON.stringify({
            user_id:profile_id,
            page:1,
            shelf:"currently reading"
        })
    })
    .then(response => response.json())
    .then(data => {
        const shelf=data["bookshelf"].slice(0,3);
        if (shelf.length === 0){
            return;
        }
        let counter=0;
        Array.from(currently_reading_div.querySelector(".user_image_items").children).forEach(child => {
            const current=shelf[counter];
            try{
            fetch("/book_result",{
                method:"POST",
                body:JSON.stringify({
                    isbn:current["book_isbn"]
                })
            })
            .then(response => response.json())
            .then(data => {
                try{
                    child.src=data["result"]["items"][0]["volumeInfo"]["imageLinks"]["thumbnail"];
                    child.onclick = () => window.location.href=`/codex/${current["book_isbn"]}`;
                }
                catch{
                }
            });
            }
            catch{

            }
            counter+=1;
        });
    });
    fetch("/get_bookshelf",{
        method:"POST",
        body:JSON.stringify({
            user_id:profile_id,
            page:1,
            shelf:"want to read"
        })
    })
    .then(response => response.json())
    .then(data => {
        const shelf=data["bookshelf"].slice(0,3);
        if (shelf.length === 0){
            return;
        }
        let counter=0;
        Array.from(want_to_read_div.querySelector(".user_image_items").children).forEach(child => {
            const current=shelf[counter];
            try{
            fetch("/book_result",{
                method:"POST",
                body:JSON.stringify({
                    isbn:current["book_isbn"]
                })
            })
            .then(response => response.json())
            .then(data => {
                try{
                    child.src=data["result"]["items"][0]["volumeInfo"]["imageLinks"]["thumbnail"];
                    child.onclick = () => window.location.href=`/codex/${current["book_isbn"]}`;
                }
                catch{
                }
            });
            }
            catch{

            }
            counter+=1;
        });
    });
     history.pushState({view: "account"},"");
}




function update_view(flag){
    const bookshelf_div = document.querySelector("#user_bookshelf");
    const bookshelf_all_div = document.querySelector("#bookshelf_all_div");
    const bookshelf_read_div = document.querySelector("#bookshelf_read_div");
    const bookshelf_want_to_read_div = document.querySelector("#bookshelf_want_to_read_div");
    const bookshelf_currently_reading_div = document.querySelector("#bookshelf_currently_reading_div");
    const reviews_div=document.querySelector("#reviews_div");
    const account_div=document.querySelector("#user_info");
    if (flag==="reviews"){
        reviews_div.style.display="block";
        bookshelf_div.style.display = "none";
        bookshelf_all_div.style.display = "none";
        bookshelf_read_div.style.display = "none";
        bookshelf_want_to_read_div.style.display = "none";
        bookshelf_currently_reading_div.style.display = "none";
        account_div.style.display="none";
    }
    else if (flag==="bookshelf"){
        reviews_div.style.display="none";
        bookshelf_div.style.display = "block";
        account_div.style.display="none";
    }
    else if (flag==="account"){
        account_div.style.display="block";
        reviews_div.style.display="none";
        bookshelf_div.style.display = "none";
        bookshelf_all_div.style.display = "none";
        bookshelf_read_div.style.display = "none";
        bookshelf_want_to_read_div.style.display = "none";
        bookshelf_currently_reading_div.style.display = "none";
    }
}
function load_reviews(){
    current_flag=null;
    const reviews_div=document.querySelector("#reviews_div");
    reviews_div.innerHTML="";
    const reviews_header=document.createElement("p");
    reviews_header.className="reviews_header";
    reviews_header.textContent=`${profile_user}'s Ratings & Reviews`;
    reviews_div.append(reviews_header);
    update_view("reviews");
    fetch('/get_user_reviews',{
        method:"POST",
        body:JSON.stringify({
            username:profile_user,
            page:reviews_page
        })
    })
    .then(response => response.json())
    .then(data => {
        const reviews=data["reviews"];
            reviews.forEach(review => {
                const isbn=review["book_isbn"];
                const book_review=document.createElement("div");
                book_review.dataset.id=review["id"];
                fetch("/book_result", {
                    method:"POST",
                    body: JSON.stringify({
                        isbn:isbn
                    })
                })
                .then(response => response.json())
                .then(data => {
                    const book=data["result"]["items"][0]["volumeInfo"];
                    const book_div=document.createElement("div");
                    book_div.className="book_div";
                    const book_info_div=document.createElement("div");
                    book_info_div.className="book_info_div";
                    const book_header=document.createElement("p");
                    book_header.className="book_header";
                    book_header.textContent=book["title"];
                    const author_line=document.createElement("div");
                    author_line.textContent=`by ${book["authors"]}`;
                    const book_result_button=document.createElement("button");
                    book_result_button.className="book_result_button";
                    book_result_button.classList.add("btn", "btn-info");
                    book_result_button.innerHTML="Go to Book Page";
                    book_info_div.append(book_header, author_line, book_result_button);
                    book_div.append(book_info_div);
                    book_review.prepend(book_div);
                    book_result_button.onclick = () => {
                        window.location.href=`/codex/${isbn}`;
                    }
                    const book_cover_image_div=document.createElement("div");
                    book_cover_image_div.className="book_cover_image_div";
                    let attempt = 0;
                    const maxRetries = 3;

                    function fetch_review_book_cover() {
                        fetch('/book_result', {
                            method: "POST",
                            body: JSON.stringify({
                                isbn: isbn
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            let image_link = null;
                            try {
                                image_link = data["result"]["items"][0]["volumeInfo"]["imageLinks"]["thumbnail"];
                            } catch {}
                            if (!image_link && attempt < maxRetries) {
                                attempt++;
                                setTimeout(fetch_review_book_cover, 300);
                                return;
                            }
                            const book_cover_image = new Image();
                            book_cover_image.src = image_link;
                            book_cover_image_div.append(book_cover_image);
                        });
                    }
                    fetch_review_book_cover();
                    book_div.prepend(book_cover_image_div);

    });
    const username_header=document.createElement("div");
    username_header.className="review_username_header";
    const username_header_textcontent=document.createElement("span");
    username_header_textcontent.textContent=review["user_id__username"];
    username_header_textcontent.style.cursor="pointer";
    username_header_textcontent.onclick = () => {
        window.location.href=`/user/${review["user_id__username"]}`;
    };
    username_header.append(username_header_textcontent);
                const review_content_div=document.createElement("div");
                const review_content=document.createElement("div");
                const review_timestamp_div=document.createElement("div");
                review_timestamp_div.className="review_timestamp_div";
                const review_like_button_div=document.createElement("div");
                review_like_button_div.className="review_like_button_div";
                const review_like_button=document.createElement("div");
                book_review.className="user_review_div";
                review_content_div.className="user_review_content_div";
                if (!review["content"]){
                    review_content.textContent="Not Reviewed Yet";
                    review_content.className="no_review_content";
                }
                else{
                    review_content.className="user_review_content";
                review_content.textContent=review["content"];
                let timestamp=new Date(review["timestamp"]);
                timestamp=timestamp.toLocaleDateString("en-US",options={month:"short",year:"numeric",day:"numeric"});
                review_timestamp_div.textContent=`${timestamp}`;
                review_like_button.onclick= (event) => manage_like(book_review.dataset.id, event.target);
                const review_like_count_div=document.createElement("div");
                review_like_count_div.className="review_like_count_div";
                fetch("/get_review_likes", {
                    method:"POST",
                    body:JSON.stringify({
                        review_id:book_review.dataset.id,
                    })
                })
                .then(response => response.json())
                .then(data => {
                    review_like_count_div.textContent=data["like_count"];
                });
                review_like_button_div.append(review_like_button,review_like_count_div);
                const review_options=document.createElement("i");
                review_options.className="user_review_options";
                review_options.classList.add("bi","bi-three-dots-vertical");
                const review_options_dropdown=document.createElement("ul");
                review_options_dropdown.className="user_review_options_dropdown";
                review_options_dropdown.classList.add("dropdown-menu");
                for(let i=0; i<2; i++){
                    const review_option=document.createElement("li");
                    review_option.classList.add("dropdown-item");
                    if (i==0){
                        review_option.textContent="Edit";
                        review_option.onclick= (event) => {
                            manage_review(isbn, review_option, "edit");
                        };
                    }
                    else if (i==1){
                        review_option.textContent="Delete";
                        review_option.onclick= (event) => {
                            manage_review(isbn, review_option, "delete");
                        };
                    }
                    review_options_dropdown.append(review_option);
                }
                review_options.append(review_options_dropdown);
                if (current_user===profile_user){
                username_header.append(review_options);
                }
                review_options.onclick = () => {
                    if (review_options_dropdown.style.display==="block"){
                        review_options_dropdown.style.display="none";
                    }
                    else{
                        review_options_dropdown.style.display="block";
                    }
                };
                if (current_user){
                fetch('/user_liked',{
                    method:"POST",
                    body:JSON.stringify({
                        user_id:user_id,
                        review_id:review["id"],
                    })
                })
                .then(response => response.json())
                .then(data => {
                    const liked=data["liked"];
                    if (liked){
                        review_like_button.className="liked_button";
                    }
                    else{
                        review_like_button.className="like_button";
                    }
                    });
                }
                    review_like_button.style.cursor="pointer";
            }
                review_content_div.append(review_content);
                book_review.append(username_header);
                reviews_div.append(book_review);
                const review_rating_div=document.createElement("div");
                review_rating_div.className="review_rating_div";
                const review_rating_stars=document.createElement("div");
                review_rating_stars.className="review_rating_stars_div";
                for (let i=0;i<5;i++){
                    const star=document.createElement("div");
                    star.className="review_rating_star";
                    review_rating_stars.append(star);
                }
                const review_progress_bar_div=document.createElement("div");
                review_progress_bar_div.className="review_progress_bar_div";
                const review_progress_bar=document.createElement("div");
                review_progress_bar.className="review_progress_bar";
                review_progress_bar.classList.add("progress-bar", "bg-warning");
                review_progress_bar.style.width=`${review["rating"]*20}%`;
                review_progress_bar_div.append(review_progress_bar);
                const review_text_div=document.createElement("div");
                review_text_div.className="review_text_div";
                review_text_div.textContent=review["rating"];
                if (review["rating"] === 0){
                    review_text_div.textContent="Not rated yet";
                }
                review_rating_div.append(review_progress_bar_div, review_rating_stars, review_text_div);
                book_review.append(review_rating_div,review_content_div);
                try{
                    if (current_user){
                        book_review.append(review_like_button_div);
                    }
                    book_review.append(review_timestamp_div);
                }
                catch{}
            });
        });
}
function manage_like(review, button){
    if (current_user){
    fetch('/update_like', {
        method:"POST",
        body:JSON.stringify({
            user_id:user_id,
            review_id:review
        })
    })
    .then(response => response.json())
    .then(data => {
        liked=data["liked"];
        like_count=data["like_count"];
        if (liked){
            button.classList.add("liked_button");
            button.classList.remove("like_button");
        }
        else{
            button.classList.add("like_button");
            button.classList.remove("liked_button");
        }
        fetch("/get_review_likes", {
            method:"POST",
            body:JSON.stringify({
                review_id:review,
            })
        })
        .then(response => response.json())
        .then(data => {
            button.parentElement.querySelector(".review_like_count_div").textContent=data["like_count"];
        });
    });
}
}
function manage_review(isbn, button, action="edit"){
    const user_review_form=document.querySelector("#user_review_form");
    if(action=="edit"){
        user_review_form.style.display="block";
        const user_review=document.querySelector(".user_review_div");
        const user_review_content=user_review.querySelector(".user_review_content");
        const user_review_content_div=user_review.querySelector(".user_review_content_div");
        user_review_form.querySelector("#id_content").value=user_review_content.textContent;
        user_review_content.style.display="none";
        user_review_content_div.append(user_review_form);
        user_review_form.onreset = () => user_review_content.style.display="block";
        user_review_form.onsubmit = (event) => {
        event.preventDefault();
        fetch('/manage_review', {
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "X-CSRFToken": document.getElementsByName("csrfmiddlewaretoken")[0].value,
        },
        body:JSON.stringify({
            isbn:isbn,
            user_id:user_id,
            content:user_review_form.querySelector("#id_content").value
        })
    })
    .then(response => response.json())
    .then(data => {
        const user_review=data["review"];
        user_review_content.textContent=user_review;
        user_review_content.style.display="block";
        user_review_form.style.display="none";
        });
    }
    }
    else if (action=="delete"){
        button.parentElement.style.display="none";
        fetch('/delete_review',{
            method:"POST",
            body:JSON.stringify({
                user_id:user_id,
                isbn:isbn
            })
        })
        .then(response => response.json())
        .then(data => {
            const user_review_div=document.querySelector(".user_review_div");
            user_review_div.remove();
            const write_review_button=document.querySelector(".user_review_button_div");
            write_review_button.style.display="block";
        });
    }
}

function load_bookshelf(flag = "all", username = profile_user) {
    const user_info_div = document.querySelector("#user_info");
    user_info_div.style.display = 'none';
    const reviews_div=document.querySelector("#reviews_div");
    reviews_div.style.display="none";
    const bookshelf_div = document.querySelector("#user_bookshelf");
    bookshelf_div.style.display = "block";
    fetch('/get_user_id', {
        method: "POST",
        body: JSON.stringify({
            username: username
        })
    })
        .then(response => response.json())
        .then(data => {
            const user_id = data["user_id"];
            const user_bookshelf_div = document.querySelector("#user_bookshelf");
            user_bookshelf_div.style.display = "block";
            const bookshelf_all_div = document.querySelector("#bookshelf_all_div");
            const bookshelf_read_div = document.querySelector("#bookshelf_read_div");
            const bookshelf_want_to_read_div = document.querySelector("#bookshelf_want_to_read_div");
            const bookshelf_currently_reading_div = document.querySelector("#bookshelf_currently_reading_div");
            if (bookshelf_page === 1) {
                bookshelf_all_div.innerHTML = "";
                bookshelf_read_div.innerHTML = "";
                bookshelf_want_to_read_div.innerHTML = "";
                bookshelf_currently_reading_div.innerHTML = "";
            }
            if (flag === "all") {
                bookshelf_all_div.style.display = "block";
                bookshelf_read_div.style.display = "none";
                bookshelf_want_to_read_div.style.display = "none";
                bookshelf_currently_reading_div.style.display = "none";
            }
            else if (flag === "read") {
                bookshelf_all_div.style.display = "none";
                bookshelf_read_div.style.display = "block";
                bookshelf_want_to_read_div.style.display = "none";
                bookshelf_currently_reading_div.style.display = "none";
            }
            else if (flag === "want to read") {
                bookshelf_all_div.style.display = "none";
                bookshelf_read_div.style.display = "none";
                bookshelf_want_to_read_div.style.display = "block";
                bookshelf_currently_reading_div.style.display = "none";
            }
            else if (flag === "currently reading") {
                bookshelf_all_div.style.display = "none";
                bookshelf_read_div.style.display = "none";
                bookshelf_want_to_read_div.style.display = "none";
                bookshelf_currently_reading_div.style.display = "block";
            }
            if (bookshelf_next_page) {
                fetch('/get_bookshelf', {
                    method: "POST",
                    body: JSON.stringify({
                        user_id: user_id,
                        shelf: flag,
                        page: bookshelf_page
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        bookshelf_next_page = data["next"];
                        const load_more_books_button = document.createElement("button");
                        load_more_books_button.className = "load_more_books_button";
                        load_more_books_button.style.display = "none";
                        load_more_books_button.onclick = () => {
                            bookshelf_page += 1;
                            load_bookshelf(flag, profile_user);
                        }
                        const bookshelf = data["bookshelf"];
                        let counter = 0;
                        var bookshelf_row = null;
                        const per_row = 10;
                        const delay_step = 300;
                        bookshelf.forEach(book => {
                            const row_index = Math.floor(counter / per_row);
                            if (counter % per_row === 0) {
                                bookshelf_row = document.createElement("div");
                                bookshelf_row.className = "bookshelf_row";
                                if (flag === "all") {
                                    bookshelf_all_div.append(bookshelf_row);
                                } else if (flag === "read") {
                                    bookshelf_read_div.append(bookshelf_row);
                                } else if (flag === "want to read") {
                                    bookshelf_want_to_read_div.append(bookshelf_row);
                                } else if (flag === "currently reading") {
                                    bookshelf_currently_reading_div.append(bookshelf_row);
                                }
                            }
                            const current_row = bookshelf_row;
                            setTimeout(() => {
                                let attempt = 0;
                                const maxRetries = 3;

                                function fetch_book_cover() {
                                    fetch('/book_result', {
                                        method: "POST",
                                        body: JSON.stringify({
                                            isbn: book["book_isbn"]
                                        })
                                    })
                                        .then(response => response.json())
                                        .then(data => {
                                            let image_link = null;
                                            try {
                                                image_link = data["result"]["items"][0]["volumeInfo"]["imageLinks"]["thumbnail"];
                                            } catch {

                                            }
                                            if (!image_link && attempt < maxRetries) {
                                                attempt++;
                                                setTimeout(fetch_book_cover, 300);
                                                return;
                                            }
                                            const cover_image = new Image();
                                            cover_image.src = image_link;
                                            cover_image.className = "bookshelf_book_cover_image";
                                            cover_image.onclick = () => {
                                                window.location.href = `/codex/${book["book_isbn"]}`;
                                            }
                                            current_row.append(cover_image);
                                        });
                                }
                                fetch_book_cover();
                            }, delay_step * row_index * 2);
                            counter++;
                        });
                    });
            }
        });
}
