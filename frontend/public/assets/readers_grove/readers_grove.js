const current_user = document.querySelector("#username").value;
var bookshelf_page = 1;
var bookshelf_next_page = true;
var reviews_page = 1;
var reviews_next_page = true;
var user_id=null;
var current_flag = null;
var invoices_page = 1;
var invoices_next_page = true;
var user_status=null;
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector("#bookshelf_select").classList.add("form-select");
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
        fetch("/user_status",{
    method:"POST",
    body:JSON.stringify({
        id:user_id
    })
})
.then(response => response.json())
.then(data => {
    user_status=data["status"];
    load_account();
});
    });
}
catch{

}
const user_search_form=document.querySelector("#user_search_form");
user_search_form.onreset = () => {
    user_search_form.querySelector("#no_user_alert").style.display="none";
    user_search_form.style.display="none";
}
user_search_form.onsubmit = (event) => {
    event.preventDefault();
    search_bookmark(event.target);
}
    const bookshelf_div = document.querySelector("#user_bookshelf");
    bookshelf_div.style.display = "none";
    const bookshelf_button = document.querySelector("#bookshelf");
    bookshelf_button.onclick = () => {
        bookshelf_page = 1;
        bookshelf_next_page = true;
        current_flag = "all";
        load_bookshelf(current_flag, current_user);
    };
    const bookshelf_selector = document.querySelector('#bookshelf_select');
    bookshelf_selector.onchange = (event) => {
        bookshelf_page = 1;
        bookshelf_next_page = true;
        current_flag = event.target.value.toLowerCase();
        load_bookshelf(current_flag, current_user);
    };
    const reviews_button=document.querySelector("#reviews");
    try{
    const invoice_button=document.querySelector("#invoices");
    invoice_button.onclick = () => {
        invoices_page=1;
        load_invoices();
    };
    }
    catch{}
    reviews_button.onclick = () => load_reviews();
    const home_button=document.querySelector("#home");
    home_button.onclick = () =>{
        load_home();
    }
    const bookmarks_button=document.querySelector("#bookmarks");
    bookmarks_button.onclick = () => {
        load_bookmarks();
    }
    try{
    const account_button=document.querySelector("#account");
    account_button.onclick = () =>{
        load_account();
    }
    const user_credits_form=document.querySelector("#user_credits_form");
    const add_credits_button=document.querySelector("#add_credits_button");
    add_credits_button.onclick = () => {
        user_credits_form.style.display="block";
    }
    user_credits_form.onreset = () => {
        user_credits_form.style.display="none";
    }
    user_credits_form.onsubmit = (event) => {
        event.preventDefault();
        add_credits(event.target);
    }
}
catch{}
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
                load_bookshelf(current_flag, current_user);
            }, 1000);
        }
    };
}
});

function add_credits(form){
    fetch('/add_credits', {
        method:"POST",
        headers:{
            "content-type":"application/json",
            "X-CSRFToken":form.querySelector("[name=csrfmiddlewaretoken]").value
        },
        body:JSON.stringify({
            id:user_id,
            amount:form.querySelector("#id_credit_amount").value
        })
    })
    .then(response => response.json())
    .then(data => {
        document.querySelector("#credits_p").textContent=`Your Credits: ${data["credits"]}`;
        user_credits_form.reset();
    });
}

function manage_quote(form){
    fetch("/update_quote", {
        method:"POST",
        headers:{
            "content-type":"application/json",
            "X-CSRFToken":form.querySelector("[name=csrfmiddlewaretoken]").value
        },
        body:JSON.stringify({
            id:user_id,
            content:form.querySelector("#id_quote").value
        })
    })
    .then(response => response.json())
    .then(data => {
        form.reset();
        load_quote(form.parentElement);
    });
}

function load_quote(div){
    Array.from(div.children).forEach(child => {
        if (child.tagName.toLowerCase()!=="form" && child.tagName.toLowerCase()!=="p"){
            child.remove();
        }
    });
    fetch("/get_quote",{
        method:"POST",
        body:JSON.stringify({
            id:user_id
        })
    })
    .then(response => response.json())
    .then(data => {
        const quote=data["quote"];
        const quote_form=div.querySelector("#update_quote_form");
         quote_form.onreset = () => {
             quote_form.style.display="none";
            }
             quote_form.onsubmit = (event) => {
                event.preventDefault();
                manage_quote(event.target);
             }
        if (!quote){
            div.querySelector("#quote").textContent="";
            const add_quote=document.createElement("button");
            add_quote.className="add_quote_button";
            add_quote.classList.add("btn", "btn-success");
            add_quote.innerHTML="Add About";
            add_quote.onclick = () => {
                quote_form.style.display="block";
            }
            div.append(add_quote);
            return;
        }
        div.querySelector("#quote").textContent=quote;
        const update_quote=document.createElement("button");
        update_quote.className="update_quote";
        update_quote.classList.add("btn","btn-info");
        update_quote.innerHTML="Update About";
        const delete_quote=document.createElement("button");
        delete_quote.className="delete_quote";
        delete_quote.classList.add("btn","btn-danger");
        delete_quote.innerHTML="Delete About";
        delete_quote.onclick = () => {
            fetch("/delete_quote",{
                method:"POST",
                body:JSON.stringify({
                    id:user_id
                })
            })
            .then(response => response.json())
            .then(data => {
                quote_form.reset();
                load_quote(div);
            });
        }
        update_quote.onclick = () => {
            quote_form.querySelector("#id_quote").textContent=quote;
            quote_form.style.display="block";
        }
        div.append(update_quote,delete_quote);
    })
}
function load_account(){
    update_view("account");
    const account_div=document.querySelector("#user_info");
    if(user_status === false){
    fetch("/get_user_credits", {
        method:"POST",
        body:JSON.stringify({
            id:user_id
        })
    })
    .then(response => response.json())
    .then(data => {
        const credits=data["credits"];
        account_div.querySelector("#credits_p").textContent=`Your Credits: ${credits}`;
    });
}
    const quote_div=account_div.querySelector("#quote_div");
    load_quote(quote_div);
    fetch("/user_activity_info",{
        method:"POST",
        body:JSON.stringify({
            id:user_id
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
            user_id:user_id,
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
            user_id:user_id,
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

function load_home(){
    update_view("home");
    const home_div=document.querySelector("#home_div");
    const refresh_feed=document.createElement("button");
    refresh_feed.className="refresh_feed_button";
    refresh_feed.classList.add("btn", "btn-light");
    refresh_feed.innerHTML=`<i class="bi bi-arrow-repeat"></i> Refresh Feed`;
    home_div.innerHTML="";
    home_div.append(refresh_feed);
    refresh_feed.onclick = () => load_home();
    fetch("/random_reviews", {
        method:"POST"
    })
    .then(response => response.json())
    .then(data => {
        const reviews=data["reviews"];
        reviews.forEach(review => {
                const isbn=review["book_isbn"];
                const book_review=document.createElement("div");
                book_review.dataset.id=review["id"];
                book_review.dataset.user_id=review["user_id"];
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
    const bookmark=document.createElement("button");
    bookmark.className="bookmark_button";
    bookmark.classList.add("btn");
        fetch("/user_bookmarked",{
            method:"POST",
            body:JSON.stringify({
                user_id:user_id,
                profile_id:review["user_id"]
            })
        })
        .then(response => response.json())
        .then(data => {
            const status=data["bookmark"];
            if (!status){
                bookmark.classList.add("btn-primary");
                bookmark.innerHTML=`<i class="bi bi-bookmark-plus"></i> Bookmark`;
            }
            else{
                bookmark.classList.add("btn-warning");
                bookmark.innerHTML=`<i class="bi bi-bookmark-dash"></i> Remove Bookmark`;
            }
            try{
                username_header.querySelector(".bookmark_button").remove();
            }
            catch{

            }
            if(review["user_id"] !== user_id){
                username_header.append(bookmark);
            }
            bookmark.onclick = (event) => {
                fetch('/update_bookmark',{
                    method:"POST",
                    body:JSON.stringify({
                        user_id:user_id,
                        profile_id:review["user_id"]
                    })
                })
                .then(response => response.json())
                .then(data => {
                    const status=data["bookmark"];
                if (!status){
                    bookmark.classList.add("btn-primary");
                    bookmark.classList.remove("btn-warning");
                    bookmark.innerHTML=`<i class="bi bi-bookmark-plus"></i> Bookmark`;
                    Array.from(home_div.children).forEach(post => {
                        if (post.tagName.toLowerCase()==="div" && post.dataset.user_id === event.target.parentElement.parentElement.dataset.user_id){
                            const bookmark_button=post.querySelector(".bookmark_button")
                            bookmark_button.classList.add("btn-primary");
                            bookmark_button.classList.remove("btn-warning");
                            bookmark_button.innerHTML=`<i class="bi bi-bookmark-plus"></i> Bookmark`;
                        }
                    });
                }
                else{
                    bookmark.classList.add("btn-warning");
                    bookmark.classList.remove("btn-primary");
                    bookmark.innerHTML=`<i class="bi bi-bookmark-dash"></i> Remove Bookmark`;
                    Array.from(home_div.children).forEach(post => {
                        if (post.tagName.toLowerCase()==="div" && post.dataset.user_id === event.target.parentElement.parentElement.dataset.user_id){
                            const bookmark_button=post.querySelector(".bookmark_button")
                            bookmark_button.classList.add("btn-warning");
                            bookmark_button.classList.remove("btn-primary");
                            bookmark_button.innerHTML=`<i class="bi bi-bookmark-dash"></i> Remove Bookmark`;
                        }
                    });
                }
                });
            }
        });
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
                if (current_user){
                    review_like_button.style.cursor="pointer";
                }
                review_content_div.append(review_content);
                book_review.append(username_header);
                bookmarks_div.append(book_review);
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
                    book_review.append(review_like_button_div, review_timestamp_div);
                }
                catch{}
                home_div.append(book_review);
                });
            });
        history.pushState({view:"home"},"");
}
function search_bookmark(form){
    const username=form.querySelector("#id_username").value;
    if (username === current_user){
        const self_search=form.querySelector("#self_user_alert");
        self_search.style.display="block";
        setTimeout(() => {self_search.style.display="none";}, 1800)
        return;
    }
    fetch("/user_exists", {
        method:"POST",
        headers:{
            'Content-Type':"application/json",
            "X-CSRFToken":form.querySelector("[name=csrfmiddlewaretoken]").value
        },
        body:JSON.stringify({
            username:username
        })
    })
    .then(response => response.json())
    .then(data => {
        const user=data["user"][0];
        const no_user_alert=form.querySelector("#no_user_alert");
        const user_found=form.querySelector("#user_found");
        no_user_alert.style.display="none";
        user_found.style.display="none";
        if (!user){
            no_user_alert.style.display="block";
            return;
        }
        user_found.style.display="block";
        user_found.querySelector("#found_username").innerHTML=`${user["username"]}`;
        const bookmark=document.createElement("button");
        bookmark.className="bookmark_button";
        bookmark.classList.add("btn");
        fetch("/user_bookmarked",{
            method:"POST",
            body:JSON.stringify({
                user_id:user_id,
                profile_id:user["id"]
            })
        })
        .then(response => response.json())
        .then(data => {
            const status=data["bookmark"];
            if (!status){
                bookmark.classList.add("btn-primary");
                bookmark.innerHTML=`<i class="bi bi-bookmark-plus"></i> Bookmark`;
            }
            else{
                bookmark.classList.add("btn-warning");
                bookmark.innerHTML=`<i class="bi bi-bookmark-dash"></i> Remove Bookmark`;
            }
            try{
                user_found.querySelector(".bookmark_button").remove();
            }
            catch{

            }
            user_found.append(bookmark);
            bookmark.onclick = () => {
                fetch('/update_bookmark',{
                    method:"POST",
                    body:JSON.stringify({
                        user_id:user_id,
                        profile_id:user["id"]
                    })
                })
                .then(response => response.json())
                .then(data => {
                    const status=data["bookmark"];
                if (!status){
                    bookmark.classList.add("btn-primary");
                    bookmark.classList.remove("btn-warning");
                    bookmark.innerHTML=`<i class="bi bi-bookmark-plus"></i> Bookmark`;
                }
                else{
                    bookmark.classList.add("btn-warning");
                    bookmark.classList.remove("btn-primary");
                    bookmark.innerHTML=`<i class="bi bi-bookmark-dash"></i> Remove Bookmark`;
                }
                });
            }
        });
    });
}

function load_bookmarks(){
    update_view("bookmarks");
    const bookmarks_div=document.querySelector("#bookmarks_div");
    const refresh_bookmarks_button=document.createElement("button");
    refresh_bookmarks_button.id="refresh_bookmarks_button";
    refresh_bookmarks_button.classList.add("btn", "btn-light");
    refresh_bookmarks_button.innerHTML=`<i class="bi bi-arrow-repeat"></i> Refresh Bookmarks`;
    refresh_bookmarks_button.onclick = () => load_bookmarks();
    const manage_bookmarks=document.createElement("button");
    manage_bookmarks.className="manage_bookmarks_button";
    manage_bookmarks.classList.add("btn", "btn-dark");
    manage_bookmarks.innerHTML=`<i class="bi bi-bookmarks"></i> Manage Bookmarks`;
    const user_search_form=document.querySelector("#user_search_form");
    manage_bookmarks.onclick = () => {
        user_search_form.style.display="block";
    }
    Array.from(bookmarks_div.children).forEach(child => {
        if (child.tagName.toLowerCase()!=="form"){
            child.remove();
        }
    });
    bookmarks_div.append(refresh_bookmarks_button,manage_bookmarks);
        fetch('/load_bookmarks',{
            method:"POST",
            body:JSON.stringify({
                id:user_id,
            })
        })
        .then(response => response.json())
        .then(data => {
            const bookmarks=data["bookmarks"];
            bookmarks.forEach(bookmark => {
                fetch('/get_user_reviews', {
                    method:"POST",
                    body:JSON.stringify({
                        username:bookmark["bookmark_id__username"],
                        page:1
                    })
                })
                .then(response => response.json())
                .then(data => {
                    const reviews=data["reviews"];
                    let isbn=null;
                    for (let i=0; i<3; i++){
                        try{
                        review=reviews[i];
                        isbn=review["book_isbn"];
                        }
                        catch{
                            continue
                        }
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
                if (current_user){
                    review_like_button.style.cursor="pointer";
                }
                review_content_div.append(review_content);
                book_review.append(username_header);
                bookmarks_div.append(book_review);
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
                    book_review.append(review_like_button_div, review_timestamp_div);
                }
                catch{}
                    }
                });
            });
        });
                history.pushState({view:"bookmarks"},"");
}

function load_invoices(){
    update_view("invoices");
    const invoices_div=document.querySelector("#invoices_div");
    const more_invoices_button=document.createElement("button");
    more_invoices_button.id="more_invoices_button";
    more_invoices_button.classList.add("btn", "btn-secondary");
    more_invoices_button.innerHTML="Load More Invoices";
    if (invoices_page!==1){
        invoices_div.querySelector("#more_invoices_button").remove();
    }
    else{
        invoices_next_page=true;
        invoices_div.innerHTML="";
        const invoices_header=document.createElement("h2");
        invoices_header.className="invoices_header";
        invoices_header.textContent="Invoices";
        invoices_div.append(invoices_header);
    }
    if (invoices_next_page){
    fetch("/get_user_invoices", {
        method:"POST",
        body:JSON.stringify({
            id:user_id,
            page:invoices_page
        })
    })
    .then(response => response.json())
    .then(data => {
        invoices_next_page=data["next"];
        const invoices=data["invoices"];
        invoices.forEach(invoice => {
            const invoice_div=document.createElement("div");
            invoice_div.className="book_div";
            invoice_div.classList.add("alert");
            const cover_image_div=document.createElement("div");
            cover_image_div.className="book_cover_image_div";
            const cover_image=new Image();
            cover_image.className="cover_image";
            cover_image_div.append(cover_image);
            const book_info_div=document.createElement("div");
            book_info_div.className="book_info_div";
            fetch('/book_result', {
                method:"POST",
                body:JSON.stringify({
                    isbn:invoice["book_isbn"],
                })
            })
            .then(response => response.json())
            .then(data => {
                const book=data["result"]["items"][0]["volumeInfo"];
                cover_image.src=book["imageLinks"]["thumbnail"];
                const title=document.createElement("p");
                title.className="book_title";
                title.textContent=`${book["title"]}`;
                const author=document.createElement("p");
                author.className="book_author";
                author.textContent=`by ${book["authors"]}`;
                book_info_div.append(title,author);
                invoice_div.dataset.id=invoice["id"];
            invoice_div.dataset.listing_id=invoice["listing_id"];
            const invoice_info_div=document.createElement("div");
            invoice_info_div.className="invoice_info_div";
            invoice_info_div.innerHTML="<hr>";
            const invoice_id_p=document.createElement("p");
            invoice_id_p.className="invoice_id_p";
            invoice_id_p.textContent=`Invoice ID: ${invoice["id"]}`;
            const transaction_info=document.createElement("p");
            transaction_info.className="transaction_info";
            if (invoice["transaction_type"]==="purchase"){
                invoice_div.classList.add("alert-primary");
                transaction_info.innerHTML=
                `Quantity: ${invoice["quantity"]}<br>
                Transaction Info: <p class="transaction_amount_p" style="color:red;display:inline-block">-${invoice["transaction_amount"]}</p> (${invoice["transaction_type"].charAt(0).toUpperCase()+invoice["transaction_type"].slice(1)})
                <br>
                Timestamp: ${new Date(invoice["timestamp"]).toLocaleString("en-US",options={year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric"})}
                `;
            }
            else if (invoice["transaction_type"]==="sale" && invoice["transaction_amount"]===0){
                invoice_div.classList.add("alert-danger");
                transaction_info.innerHTML=
                `Quantity: ${invoice["quantity"]}<br>
                Transaction Info: <p class="transaction_amount_p" style="color:red;display:inline-block">${invoice["transaction_amount"]}</p> (Donation)
                <br>
                Timestamp: ${new Date(invoice["timestamp"]).toLocaleString("en-US",options={year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric"})}
                `;
            }
            else if (invoice["transaction_type"]==="sale"){
                invoice_div.classList.add("alert-success");
                transaction_info.innerHTML=
                `Quantity: ${invoice["quantity"]}<br>
                Transaction Info: <p class="transaction_amount_p" style="color:green;display:inline-block">+${invoice["transaction_amount"]}</p> (Donation)
                <br>
                Timestamp: ${new Date(invoice["timestamp"]).toLocaleString("en-US",options={year:"numeric", month:"short", day:"numeric", hour:"numeric", minute:"numeric"})}
                `;
            }
            invoice_info_div.append(invoice_id_p,transaction_info);
            book_info_div.append(invoice_info_div);
            });
            invoice_div.append(cover_image_div, book_info_div);
            invoices_div.append(invoice_div);
        });
        if (invoices_next_page){
        invoices_div.append(more_invoices_button);
        }
        more_invoices_button.onclick= () => {
            invoices_page+=1;
            load_invoices();
        }
    });
    }
}
function update_view(flag){
    const bookshelf_div = document.querySelector("#user_bookshelf");
    const bookshelf_all_div = document.querySelector("#bookshelf_all_div");
    const bookshelf_read_div = document.querySelector("#bookshelf_read_div");
    const bookshelf_want_to_read_div = document.querySelector("#bookshelf_want_to_read_div");
    const bookshelf_currently_reading_div = document.querySelector("#bookshelf_currently_reading_div");
    const reviews_div=document.querySelector("#reviews_div");
    const invoices_div=document.querySelector("#invoices_div");
    const bookmarks_div=document.querySelector("#bookmarks_div");
    const home_div=document.querySelector("#home_div");
    const account_div=document.querySelector("#user_info");
    if (flag==="reviews"){
        reviews_div.style.display="block";
        invoices_div.style.display="none";
        bookshelf_div.style.display = "none";
        bookshelf_all_div.style.display = "none";
        bookshelf_read_div.style.display = "none";
        bookshelf_want_to_read_div.style.display = "none";
        bookshelf_currently_reading_div.style.display = "none";
        bookmarks_div.style.display="none";
        home_div.style.display="none";
        account_div.style.display="none";
    }
    else if (flag==="bookshelf"){
        reviews_div.style.display="none";
        bookshelf_div.style.display = "block";
        invoices_div.style.display="none";
        bookmarks_div.style.display="none";
        home_div.style.display="none";
        account_div.style.display="none";
        bookshelf_all_div.style.display = "none";
        bookshelf_read_div.style.display = "none";
        bookshelf_want_to_read_div.style.display = "none";
        bookshelf_currently_reading_div.style.display = "none";
    }
    else if (flag==="invoices"){
        invoices_div.style.display="block";
        reviews_div.style.display="none";
        bookshelf_div.style.display = "none";
        bookshelf_all_div.style.display = "none";
        bookshelf_read_div.style.display = "none";
        bookshelf_want_to_read_div.style.display = "none";
        bookshelf_currently_reading_div.style.display = "none";
        bookmarks_div.style.display="none";
        home_div.style.display="none";
        account_div.style.display="none";
    }
    else if (flag==="bookmarks"){
        bookmarks_div.style.display="block";
        invoices_div.style.display="none";
        reviews_div.style.display="none";
        bookshelf_div.style.display = "none";
        bookshelf_all_div.style.display = "none";
        bookshelf_read_div.style.display = "none";
        bookshelf_want_to_read_div.style.display = "none";
        bookshelf_currently_reading_div.style.display = "none";
        home_div.style.display="none";
        account_div.style.display="none";
    }
    else if (flag==="home"){
        home_div.style.display="block";
        bookmarks_div.style.display="none";
        invoices_div.style.display="none";
        reviews_div.style.display="none";
        bookshelf_div.style.display = "none";
        bookshelf_all_div.style.display = "none";
        bookshelf_read_div.style.display = "none";
        bookshelf_want_to_read_div.style.display = "none";
        bookshelf_currently_reading_div.style.display = "none";
        account_div.style.display="none";
    }
    else if (flag==="account"){
        account_div.style.display="block";
        home_div.style.display="none";
        bookmarks_div.style.display="none";
        invoices_div.style.display="none";
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
    const reviews_header=document.createElement("h2");
    reviews_header.className="reviews_header";
    reviews_header.textContent="Your Ratings & Reviews";
    reviews_div.append(reviews_header);
    update_view("reviews");
    fetch('/get_user_reviews',{
        method:"POST",
        body:JSON.stringify({
            username:current_user,
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
                username_header.append(review_options);
                review_options.onclick = () => {
                    if (review_options_dropdown.style.display==="block"){
                        review_options_dropdown.style.display="none";
                    }
                    else{
                        review_options_dropdown.style.display="block";
                    }
                };
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
                if (current_user){
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
                    book_review.append(review_like_button_div, review_timestamp_div);
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
        user_review_form.onreset = () => {
            user_review_form.style.display="none";
            user_review_content.style.display="block";
        };
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

function load_bookshelf(flag = "all", username = current_user) {
    update_view("bookshelf");
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
            const bookshelf_select=document.querySelector("#bookshelf_select");
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
                bookshelf_select.selectedIndex=0;
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
                            load_bookshelf(flag, current_user);
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
