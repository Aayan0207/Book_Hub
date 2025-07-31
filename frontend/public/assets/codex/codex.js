var current_user=null;
var user_id=null;
var reviews_next_page=null;
var page=1;
var review_page=1;
var maximum_pages=10;
const page_results_count=10;
document.addEventListener("DOMContentLoaded",() => {
    document.querySelector("#id_select").classList.add("form-select");
    window.onpopstate = (event) => {
    update_view(event.state);
    };
    try{
    current_user=document.querySelector("#username").value;
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
    const sale_match= window.location.pathname.match(/^\/codex\/(\d+)\/(\d+)$/);
    const isbn_match= window.location.pathname.match(/^\/codex\/(\d+)$/);
    if (isbn_match){
        let book_page=isbn_match[1];
        document.querySelector("#spinner").style.display="block";
        setTimeout(() => {
            document.querySelector("#spinner").style.display="none";
        }, 1000);
        setTimeout(()=> {
            book_result(book_page);
        }, 230);
    }
    else if (sale_match){
        let book_page=sale_match[1];
        let sell_id=sale_match[2];
        document.querySelector("#spinner").style.display="block";
        setTimeout(() => {
            document.querySelector("#spinner").style.display="none";
        }, 1000);
        setTimeout(()=> {
            book_result(book_page, null, sell_id);
        }, 230);
        const purchase_form=document.querySelector(".purchase_form");
        purchase_form.onsubmit = (event) => {
                event.preventDefault();
                fetch('/purchase_listing',{
                    method:"POST",
                    headers: {
                        'Content-Type': 'application/json',
                        "X-CSRFToken": document.getElementsByName("csrfmiddlewaretoken")[1].value,
                    },
                    body:JSON.stringify({
                        listing_id:purchase_form.dataset.listing_id,
                        user_id:user_id,
                        quantity:purchase_form.querySelector("#id_quantity").value,
                    })
                })
                .then(response => response.json())
                .then(data => {
                    const transaction=data["transaction"];
                    if (!transaction){
                        const failed_transaction=document.querySelector("#failed_transaction");
                        failed_transaction.style.display="block";
                    }
                    else{
                        window.location.href=`/codex/${listing["book_isbn"]}/${purchase_form.dataset.listing_id}`;
                    }
                });
            };
    }
    else{
        document.querySelector("#search_book_form_div").style.display="block";
    }
    const search_book_form=document.querySelector("#search_book_form");
    const pagination_div=document.querySelector("#pagination_div");
    search_book_form.onsubmit = (event) => {
        event.preventDefault();
        page=1;
        const query=search_book_form.querySelector("#id_query").value;
        const type=search_book_form.querySelector("#id_select").value;
        pagination_div.style.display='none';
        manage_pagination(query, type);
    };
    pagination_div.style.display='none';
    const user_review_form=document.querySelector("#user_review_form");
    const cancel_review_button=user_review_form.querySelector("#cancel_review_button");
    cancel_review_button.onclick = () => {
        user_review_form.style.display="none";
    };
    try{
    const listing_form=document.querySelector("#listing_form");
    listing_form.onreset = () => {
    listing_form.style.display="none";
   }
}
catch{}
});

function manage_pagination(query,type){
    const pagination_div=document.querySelector("#pagination_div");
    pagination_div.style.display='none';
    if (type.toLowerCase()!=="isbn"){
    const pagination_list=document.querySelector("#pagination_list");
    pagination_list.innerHTML="";
    const previous=document.createElement("li");
    const next=document.createElement("li");
    const preceding=document.createElement("li");
    const current=document.createElement("li");
    const succeeding=document.createElement("li");
    previous.classList.add("page-item","page-link");
    next.classList.add("page-item","page-link");
    preceding.classList.add("page-item","page-link");
    current.classList.add("page-item","page-link","active-link");
    succeeding.classList.add("page-item","page-link");
    previous.textContent="Previous";
    next.textContent="Next";
    preceding.textContent=(page-1).toString();
    current.textContent=page.toString();
    succeeding.textContent=(page+1).toString();
    pagination_list.append(previous, preceding, current, succeeding, next);
    if (page<=1){
        page=1;
        pagination_list.removeChild(preceding);
        previous.classList.add('disabled');
        previous.style.pointerEvents='none';
        previous.style.opacity=0.6;
        previous.style.color="grey";
    }
    else{
        previous.classList.remove('disabled');
        previous.style.pointerEvents='auto';
        previous.style.opacity=1;
        previous.style.color="#0d6efd";
    }
    if (page>=maximum_pages){
        page=maximum_pages;
        next.classList.add('disabled');
        next.style.pointerEvents='none';
        next.style.opacity=0.6;
        next.style.color="grey";
        pagination_list.removeChild(succeeding);
    }
    else{
        next.classList.remove('disabled');
        next.style.pointerEvents='auto';
        next.style.opacity=1;
        next.style.color="#0d6efd";
    }
    preceding.onclick =()=>{
        page=parseInt(preceding.textContent);
        manage_pagination(query, type);
    };
    succeeding.onclick = ()=>{
        page=parseInt(succeeding.textContent);
        manage_pagination(query, type);
    };
    previous.onclick = ()=> {
        page--;
        manage_pagination(query, type);
    };
    next.onclick = ()=>{
        page++;
        manage_pagination(query, type);
    };
}
    search_books(query,type);
}

function manage_bookshelf(bookshelf_button,user_id,isbn,action=null, search_target=null){
    if (action){
    fetch('/update_bookshelf',{
        method:"POST",
        body:JSON.stringify({
            user_id:user_id,
            isbn:isbn,
            action:action
        })
    })
    .then(response => response.json())
    .then(data => {
        if(data["in_bookshelf"]){
            bookshelf_button.textContent="Remove from Bookshelf";
            bookshelf_button.classList.add("btn-danger");
            bookshelf_button.classList.remove("btn-success","dropdown-toggle");
            bookshelf_button.setAttribute("data-bs-toggle", "");
            bookshelf_button.onclick = (event) => manage_bookshelf(event.target,user_id,isbn,'remove');
            if (search_target){
                const bookshelf_button=search_target.parentElement.querySelector(".search_bookshelf_button");
                bookshelf_button.textContent="Remove from Bookshelf";
                bookshelf_button.classList.add("btn-danger");
                bookshelf_button.classList.remove("btn-success","dropdown-toggle");
                bookshelf_button.setAttribute("data-bs-toggle", "");
                bookshelf_button.onclick = (event) => manage_bookshelf(event.target,user_id,isbn,'remove');
            }
        }
        else{
            bookshelf_button.textContent="Add to Bookshelf";
            bookshelf_button.classList.add("btn-success","dropdown-toggle");
            bookshelf_button.classList.remove("btn-danger");
            bookshelf_button.setAttribute("data-bs-toggle", "dropdown");
            bookshelf_button.onclick = (event) => manage_bookshelf(event.target,user_id,isbn);
            if (search_target){
                const bookshelf_button=search_target.parentElement.querySelector(".search_bookshelf_button");
                bookshelf_button.textContent="Add to Bookshelf";
                bookshelf_button.classList.add("btn-success","dropdown-toggle");
                bookshelf_button.classList.remove("btn-danger");
                bookshelf_button.setAttribute("data-bs-toggle", "dropdown");
                bookshelf_button.onclick = (event) => manage_bookshelf(event.target,user_id,isbn);
            }
        }
    });
    }
}
function refresh_rating(isbn, flag, target=null, search_target=null){
    fetch('/get_book_rating', {
            method:"POST",
            body:JSON.stringify({
                isbn:isbn
            })
        })
    .then(response => response.json())
    .then(data => {
        const avg_rating=data["avg_rating"];
        const ratings_count=data["ratings_count"];
        if (flag=="book"){
            const progress_bar=document.querySelector(".result_ratings_bar_div").querySelector(".result_rating_bar");
            progress_bar.style.width=`${avg_rating*20}%`;
            const ratings=document.querySelector(".result_ratings_count_div").querySelector(".result_rating_info");
            ratings.textContent=`${avg_rating} (${ratings_count} Ratings)`;
        }
        else if (flag=="search"){
            const progress_bar=target.parentElement.parentElement.parentElement.parentElement.querySelector(".search_ratings_bar_div").querySelector(".search_rating_bar");
            progress_bar.style.width=`${avg_rating*20}%`;
            const ratings=target.parentElement.parentElement.parentElement.parentElement.querySelector(".search_ratings_count_div").querySelector(".search_rating_info");
            ratings.textContent=`${avg_rating} (${ratings_count} Ratings)`;
        }
        if (search_target){
            const progress_bar=search_target.querySelector(".search_ratings_bar_div").querySelector(".search_rating_bar");
            progress_bar.style.width=`${avg_rating*20}%`;
            const ratings=search_target.querySelector(".search_ratings_count_div").querySelector(".search_rating_info");
            ratings.textContent=`${avg_rating} (${ratings_count} Ratings)`;
        }
    });
}
function manage_rating(rating, isbn, target, flag, search_target=null){
        fetch('/update_rating',{
            method:"POST",
            body:JSON.stringify({
                user_id:user_id,
                isbn:isbn,
                rating:rating
            })
        })
        .then(response => response.json())
        .then(data => {
            if (rating){
                if (flag=="book"){
                    const user_rating_content=target.parentElement.parentElement.querySelector(".user_rating_content");
                    user_rating_content.textContent=`Your Rating: ${target.dataset.id}`;
                    const clear_rating_button=target.parentElement.parentElement.querySelector(".result_clear_rating_div").querySelector(".result_clear_rating_button");
                    clear_rating_button.style.display="block";
                }
                else if (flag=="search"){
                    const user_rating_content=target.parentElement.parentElement.querySelector(".search_user_rating_content");
                    user_rating_content.textContent=`Your Rating: ${target.dataset.id}`;
                    const clear_rating_button=target.parentElement.parentElement.querySelector(".search_clear_rating_div").querySelector(".search_clear_rating_button");
                    clear_rating_button.style.display="block";
                }
                if (search_target){
                    const user_rating_content=search_target.parentElement.querySelector(".search_user_rating_content");
                    user_rating_content.textContent=`Your Rating: ${target.dataset.id}`;
                    const clear_rating_button=search_target.parentElement.querySelector(".search_clear_rating_div").querySelector(".search_clear_rating_button");
                    clear_rating_button.style.display="block";
                    const progress_bar=search_target.parentElement.querySelector(".search_user_rating_bar_div").querySelector(".search_user_rating_bar");
                    progress_bar.style.width=`${rating*20}%`;
                }
            }
            else if (!rating){
                if (flag=="book"){
                    const user_rating_content=target.parentElement.parentElement.querySelector(".user_rating_content");
                    user_rating_content.textContent=`Rate this Book:`;
                    const progress_bar=target.parentElement.parentElement.querySelector(".user_rating_bar_div").querySelector(".user_rating_bar");
                    progress_bar.style.width="0%";
                    target.style.display="none";
                }
                else if (flag=="search"){
                    const user_rating_content=target.parentElement.parentElement.querySelector(".search_user_rating_content");
                    user_rating_content.textContent=`Rate this Book:`;
                    const progress_bar=target.parentElement.parentElement.querySelector(".search_user_rating_bar_div").querySelector(".search_user_rating_bar");
                    progress_bar.style.width="0%";
                    target.style.display="none";
                }
                if (search_target){
                    const user_rating_content=search_target.parentElement.querySelector(".search_user_rating_content");
                    user_rating_content.textContent=`Rate this Book:`;
                    const progress_bar=search_target.parentElement.querySelector(".search_user_rating_bar_div").querySelector(".search_user_rating_bar");
                    progress_bar.style.width="0%";
                    target.style.display="none";
                }
            }
            refresh_rating(isbn, flag, target, search_target=search_target);
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

function book_result(isbn, target=null, sale=false){
    review_page=1;
    const book_result_div=document.querySelector("#book_result");
    Array.from(book_result_div.children).forEach(child => {
        if (child.tagName.toLowerCase()!=="form"){
            child.remove();
        }
    });
    fetch('/book_result',{
        method:"POST",
        body:JSON.stringify({
            isbn:isbn
        })
    })
    .then(response => response.json())
    .then(data => {
        result=data["result"]["items"][0]["volumeInfo"];
        const snippet=document.createElement("p");
        snippet.className="result_book_snippet";
        snippet.textContent=new DOMParser().parseFromString(data["result"]["items"][0]["searchInfo"]["textSnippet"],"text/html").body.textContent;
        const pagination_div=document.querySelector("#pagination_div");
        const book_results=document.querySelector("#book_results");
        const search_book_form_div=document.querySelector("#search_book_form_div");
        pagination_div.style.display="none";
        book_results.style.display="none";
        book_result_div.style.display="block";
        search_book_form_div.style.display="none";
        let image_link=false;
        try{
            image_link=result["imageLinks"]["thumbnail"];
        }
        catch{
        }
        if (image_link){
            const cover_image=new Image();
            cover_image.src=image_link;
            cover_image.className="result_book_cover_image";
            const cover_image_div=document.createElement("div");
            cover_image_div.className="result_book_cover_image_div";
            const cover_image_holder=document.createElement('div');
            cover_image_holder.className="result_book_cover_image_holder";
            cover_image_holder.append(cover_image);
            cover_image_div.append(cover_image_holder);
            if (current_user){
                const bookshelf_button=document.createElement("button");
                bookshelf_button.id="bookshelf_button";
                bookshelf_button.classList.add("btn","btn-success","dropdown-toggle");
                bookshelf_button.dataset.bsToggle="dropdown";
                bookshelf_button.type="button";
                    fetch('/in_bookshelf',{
                        method:"POST",
                        body:JSON.stringify({
                            user_id:user_id,
                            isbn:isbn
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if(data["in_bookshelf"]){
                            bookshelf_button.textContent="Remove from Bookshelf";
                            bookshelf_button.classList.add("btn-danger");
                            bookshelf_button.classList.remove("btn-success","dropdown-toggle");
                            bookshelf_button.setAttribute("data-bs-toggle", "");
                            bookshelf_button.onclick = (event) => manage_bookshelf(event.target,user_id,isbn,'remove',search_target=target);
                        }
                        else{
                            bookshelf_button.textContent="Add to Bookshelf";
                            bookshelf_button.classList.add("btn-success","dropdown-toggle");
                            bookshelf_button.classList.remove("btn-danger");
                            bookshelf_button.setAttribute("data-bs-toggle", "dropdown");
                            bookshelf_button.onclick = (event) => manage_bookshelf(event.target,user_id,isbn,search_target=target);
                        }
                        const bookshelf_button_div=document.createElement("div");
                        bookshelf_button_div.id="bookshelf_button_div";
                        bookshelf_button_div.classList.add("dropdown");
                        const bookshelf_dropdown_menu=document.createElement("ul");
                        bookshelf_dropdown_menu.classList.add("dropdown-menu");
                        for (let i=0;i<3;i++){
                            const bookshelf_item=document.createElement("li");
                            bookshelf_item.classList.add("dropdown-item");
                            if (i===0){
                                bookshelf_item.textContent="Read";
                            }
                            else if (i===1){
                                bookshelf_item.textContent="Currently Reading";
                            }
                            else if (i===2){
                                bookshelf_item.textContent="Want to Read";
                            }
                            bookshelf_item.onclick = (event) => manage_bookshelf(event.target.parentElement.parentElement.querySelector("#bookshelf_button"),user_id, isbn, action=event.target.textContent, search_target=target);
                            bookshelf_dropdown_menu.append(bookshelf_item);
                        }
                        bookshelf_button_div.append(bookshelf_button, bookshelf_dropdown_menu);
                        cover_image_div.append(bookshelf_button_div);
                    });
                const user_rating_div=document.createElement("div");
                user_rating_div.className="user_rating_div";
                const user_ratings_stars=document.createElement("div");
                user_ratings_stars.className="user_ratings_stars";
                for (let i=1;i<6;i++){
                    const star=document.createElement("div");
                    star.className="user_ratings_star";
                    star.dataset.id=i;
                    user_ratings_stars.append(star);
                    star.onclick = (event) => manage_rating(i,isbn,event.target, flag="book",search_target=target);
                }
                    fetch('/get_user_rating',{
                        method:"POST",
                        body:JSON.stringify({
                            user_id:user_id,
                            isbn:isbn
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        const user_rating=data["rating"];
                        const user_rating_bar_div=document.createElement('div');
                        user_rating_bar_div.className="user_rating_bar_div";
                        const user_rating_bar=document.createElement("div");
                        user_rating_bar.className="user_rating_bar";
                        user_rating_bar.classList.add("progress","progress-bar", "bg-warning");
                        const user_rating_content=document.createElement('p');
                        user_rating_content.className='user_rating_content';
                        const clear_rating_div=document.createElement('div');
                        clear_rating_div.className="result_clear_rating_div";
                        const clear_rating=document.createElement('button');
                        clear_rating.className="result_clear_rating_button";
                        clear_rating.innerHTML="Clear Rating";
                        clear_rating.classList.add("btn","btn-link");
                        clear_rating.onclick = (event) => manage_rating(0,isbn,event.target, flag="book", search_target=target);
                        if (user_rating){
                            user_rating_bar.style.width=`${user_rating*20}%`;
                            user_rating_content.textContent=`Your Rating: ${user_rating}`;
                            clear_rating.style.display="block";
                        }
                        else{
                            user_rating_bar.style.width=`${0}%`;
                            user_rating_content.textContent="Rate this book:";
                            clear_rating.style.display="none";
                        }
                        user_rating_bar_div.append(user_rating_bar);
                        clear_rating_div.append(clear_rating);
                        user_rating_div.append(user_rating_content,user_rating_bar_div,user_ratings_stars, clear_rating_div);
                        user_ratings_stars.querySelectorAll(".user_ratings_star").forEach(star => {
                            if(star.dataset.id == 1){
                                star.onpointerleave = () => {
                                    user_rating_bar.style.width="0%";
                                }
                            }
                            star.onpointerenter= (event) => {
                                value=event.target.dataset.id*20;
                                user_rating_bar.style.width=`${value}%`;
                            }
                        });
                        cover_image_div.append(user_rating_div);
                    });
                }
                book_result_div.append(cover_image_div);
        }
        const title=document.createElement("p");
        title.className="result_book_title";
        title.textContent=result["title"];
        const author=document.createElement("p");
        author.className="result_book_author";
        author.textContent=`by ${result["authors"]}`;
        const avg_rating_div=document.createElement("div");
        fetch('/get_book_rating', {
            method:"POST",
            body:JSON.stringify({
                isbn:isbn
            })
        })
        .then(response => response.json())
        .then(data => {
            const avg_rating=data["avg_rating"];
            const ratings_count=data["ratings_count"];
            avg_rating_div.className="result_rating_div";
            const result_ratings_bar_div=document.createElement("div");
            result_ratings_bar_div.className="result_ratings_bar_div";
            const result_rating_bar=document.createElement("div");
            result_rating_bar.className="result_rating_bar";
            result_rating_bar.classList.add("progress","progress-bar", "bg-warning");
            result_rating_bar.style.width=`${avg_rating*20}%`;
            const result_ratings_count_div=document.createElement('div');
            result_ratings_count_div.className="result_ratings_count_div"
            const result_rating_info=document.createElement('div');
            result_rating_info.className="result_rating_info";
            result_rating_info.textContent=`${avg_rating} (${ratings_count} ratings)`;
            const result_ratings_stars_div=document.createElement('div');
            result_ratings_stars_div.className="result_ratings_stars_div";
            result_ratings_bar_div.append(result_rating_bar);
            for (let i=0;i<5;i++){
                const star=document.createElement("div");
                star.className="result_ratings_star";
                result_ratings_stars_div.append(star);
            }
            result_ratings_count_div.append(result_rating_info);
            avg_rating_div.append(result_ratings_bar_div,result_ratings_stars_div,result_ratings_count_div);
        });
        const ratings=document.createElement("p");
        ratings.className="google_book_ratings";
        const average_rating=result["averageRating"];
        const ratings_info=document.createElement("p");
        ratings_info.className="google_ratings_info";
        const ratings_stars=document.createElement("div");
        ratings_stars.className="ratings_stars";
        for (let i=0;i<5;i++){
            const star=document.createElement("div");
            star.className="ratings_star";
            ratings_stars.append(star);
        }
        if (average_rating){
            const ratings_stars_div=document.createElement("div");
            ratings_stars_div.className="google_ratings_stars_div";
            ratings_stars_div.classList.add("progress","progress-bar", "bg-warning");
            ratings_stars_div.style.width=`${average_rating*20}%`;
            if(result["ratingsCount"]){
                ratings_info.textContent=`${result["averageRating"]} (${result["ratingsCount"]} ratings)`;
                ratings.append(ratings_stars_div, ratings_stars, ratings_info);
            }
            else{
                ratings_info.textContent=`${result["averageRating"]}`;
                ratings.append(ratings_stars_div,ratings_stars, ratings_info);
            }
        }
        else{
            ratings_info.textContent="No Ratings";
            ratings.append(ratings_stars,ratings_info);
        }
        const publish_info=document.createElement("li");
        publish_info.className="result_book_publish_info";
        if (result["publishedDate"]){
            if(result["publisher"]){
                publish_info.textContent=`Published on: ${result["publishedDate"] } (${result["publisher"]})`;
            }
            else{
            publish_info.textContent=`Published on: ${result["publishedDate"]}`;
            }
        }
        const description=document.createElement('p');
        description.textContent=result["description"];
        const sale_info=document.createElement("div");;
        if (sale){
            fetch('/get_listing', {
                method:"POST",
                body:JSON.stringify({
                    id:sale
                })
            })
            .then(response => response.json())
            .then(data => {
                listing=data["listing"][0];
                sale_info.className="result_sale_info";
                const price=document.createElement("p");
                price.className="result_price";
                price.textContent=`Price: ${listing["price"]} Credits`;
                const stock=document.createElement("p");
                stock.className="result_stock";
                if (parseInt(listing["stock"])===1){
                    stock.textContent=`${listing["stock"]} copy available`;
                }
                else{
                    stock.textContent=`${listing["stock"]} copies available`;
                }
                sale_info.append(price,stock);
                fetch('/user_status', {
                method:"POST",
                body:JSON.stringify({
                    id:user_id
                })
            })
            .then(response => response.json())
            .then(data => {
                const status=data["status"];
                if (status === true){
                const update_listing_button=document.createElement("button");
                update_listing_button.className="update_listing_button";
                update_listing_button.classList.add("btn", "btn-info");
                update_listing_button.innerHTML="Update Listing";
                const delete_listing_button=document.createElement("button");
                delete_listing_button.className="delete_listing_button";
                delete_listing_button.classList.add("btn", "btn-danger");
                delete_listing_button.innerHTML="Delete Listing";
                sale_info.append(update_listing_button,delete_listing_button);
                update_listing_button.onclick = () => manage_listing(sale,flag="update");
                delete_listing_button.onclick = () => manage_listing(sale,flag="delete");
                }
                else if (status===false){
                    const purchase_button=document.createElement("button");
                    purchase_button.className="purchase_button";
                    purchase_button.classList.add("btn", "btn-success");
                    purchase_button.innerHTML="Purchase";
                    purchase_button.onclick = () => purchase_listing(sale);
                    const cart_button=document.createElement("button");
                        cart_button.className="cart_button";
                        fetch('/in_cart',{
                        method:"POST",
                        body:JSON.stringify({
                            isbn:isbn,
                            id:user_id,
                        })
                        })
                        .then(response => response.json())
                        .then(data => {
                        const in_cart=data["status"];
                        if (in_cart){
                            cart_button.classList.add("btn", "btn-info");
                            cart_button.innerHTML=`<i class="bi bi-cart-dash"></i> Remove From Cart`;
                        }
                        else{
                            cart_button.classList.add("btn", "btn-warning");
                            cart_button.innerHTML=`<i class="bi bi-cart-plus"></i> Add to Cart`;
                        }
                        cart_button.onclick = () => {
                            manage_cart(isbn, cart_button, sale);
                        };
                        sale_info.append(purchase_button, cart_button);
                        });

                }
        });
            });
        }
        const categories=document.createElement('p');
        categories.textContent=`Categories: ${result["categories"]}`;
        const additional_info=document.createElement('ul');
        const isbn_li=document.createElement('li');
        isbn_li.textContent=`ISBN: ${isbn}`;
        const page_count_li=document.createElement('li');
        page_count_li.textContent=`${result["pageCount"]} pages`;
        const ratings_li=document.createElement('li');
        ratings_li.textContent=`Google Books Sourced Rating:`;
        ratings_li.append(ratings);
        additional_info.append(ratings_li,publish_info,isbn_li,page_count_li);
        const book_info=document.createElement("div");
        book_info.className="result_book_info";
        const additional_info_header=document.createElement('p');
        additional_info_header.textContent="Edition Information";
        const reviews_div=document.createElement('div');
        reviews_div.className='reviews_div';
        const reviews_div_header=document.createElement('p');
        reviews_div_header.className="reviews_div_header";
        reviews_div_header.textContent="Community Reviews";
        reviews_div.append(reviews_div_header);
        const user_review_button_div=document.createElement('div');
        const sort_by_div=document.createElement("div");
        sort_by_div.className="sort_by_div";
        const sort_by=document.createElement("select");
        sort_by.className="sort_by";
        sort_by.classList.add("form-select");
        sort_by.onchange = (event) => refresh_review(isbn, user_id, event.target.value.toLowerCase());
        for (let i=0;i<5;i++){
            const sort_by_option=document.createElement("option");
            sort_by_option.className="sort_by_option";
            if (i==0){
                sort_by_option.textContent="Highest Rated";
            }
            else if (i==1){
                sort_by_option.textContent="Latest";
            }
            else if (i==2){
                sort_by_option.textContent="Oldest";
            }
            else if (i==3){
                sort_by_option.textContent="Most Liked";
            }
            else if (i==4){
                sort_by_option.textContent="Lowest Rated";
            }
            sort_by.append(sort_by_option);
        }
        const refresh_reviews_button=document.createElement("div");
        refresh_reviews_button.className="refresh_reviews_button";
        refresh_reviews_button.innerHTML=
        `
        <i class="bi bi-arrow-repeat"></i>
        Refresh Reviews
        `;
        refresh_reviews_button.onclick= () => refresh_review(isbn, user_id, sort_by.value);
        sort_by_div.append(sort_by, refresh_reviews_button);
        if (current_user){
            user_review_button_div.className='user_review_button_div';
            const user_review_button=document.createElement('button');
            user_review_button.className="user_review_button";
            user_review_button.classList.add("btn", "btn-outline-light");
            user_review_button.innerHTML=
            `
            <i class="bi bi-pen"></i>
            Write a Review
            `;
            user_review_button.onclick = (event) => manage_review(isbn, event.target);
            user_review_button_div.append(user_review_button);
            reviews_div.append(user_review_button_div);
        }
        reviews_div.append(sort_by_div);
        const community_reviews_div=document.createElement("div");
        community_reviews_div.className="community_reviews_div";
        fetch("/get_book_reviews",{
            method:"POST",
            body:JSON.stringify({
                isbn:isbn,
                page:review_page,
                user_id:user_id,
                flag:"highest_rated",
            })
        })
        .then(response => response.json())
        .then(data => {
            const reviews=data["reviews"];
            reviews.forEach(review => {
                const book_review=document.createElement("div");
                book_review.dataset.id=review["id"];
                const username_header=document.createElement("div");
                username_header.className="review_username_header";
                const username_header_content=document.createElement("p");
                username_header_content.textContent=review["user_id__username"];
                username_header_content.onclick = () => {
                    window.location.href=`/user/${review["user_id__username"]}`;
                };
                Array.from(username_header.children).forEach(child => { if (child.tagName.toLowerCase() === "p") {child.remove();}}); username_header.append(username_header_content);
                const review_content_div=document.createElement("div");
                const review_content=document.createElement("div");
                review_content.textContent=review["content"];
                const review_timestamp_div=document.createElement("div");
                review_timestamp_div.className="review_timestamp_div";
                let timestamp=new Date(review["timestamp"]);
                timestamp=timestamp.toLocaleDateString("en-US",options={month:"short",year:"numeric",day:"numeric"});
                review_timestamp_div.textContent=`${timestamp}`;
                review_content_div.append(review_content);
                book_review.append(username_header, review_content_div);
                const review_like_button_div=document.createElement("div");
                review_like_button_div.className="review_like_button_div";
                const review_like_button=document.createElement("div");
                review_like_button.onclick= (event) => manage_like(book_review.dataset.id, event.target);
                const review_like_count_div=document.createElement("div");
                review_like_count_div.className="review_like_count_div";
                if (current_user){
                    review_like_button.style.cursor="pointer";
                }
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
                book_review.append(review_like_button_div,review_timestamp_div);
                if (current_user && review["user_id__username"]==current_user){
                    const username_header_content=document.createElement("p");
                username_header_content.textContent=review["user_id__username"];
                username_header_content.onclick = () => {
                    window.location.href=`/user/${review["user_id__username"]}`;
                };
                Array.from(username_header.children).forEach(child => { if (child.tagName.toLowerCase() === "p") {child.remove();}}); username_header.append(username_header_content);
                    book_review.className="user_review_div";
                    review_content_div.className="user_review_content_div";
                    review_content.className="user_review_content";
                    user_review_button_div.style.display="none";
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
                            review_option.onclick= () => manage_review(isbn, review_option, action="edit");
                        }
                        else if (i==1){
                            review_option.textContent="Delete";
                            review_option.onclick= () => manage_review(isbn, review_option, action="delete");
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
                    community_reviews_div.prepend(book_review);
                }
                else{
                    const username_header_content=document.createElement("p");
                username_header_content.textContent=review["user_id__username"];
                username_header_content.onclick = () => {
                    window.location.href=`/user/${review["user_id__username"]}`;
                };
                Array.from(username_header.children).forEach(child => { if (child.tagName.toLowerCase() === "p") {child.remove();}}); username_header.append(username_header_content);
            }
                    book_review.className="book_review";
                    review_content.className="review_content";
                    review_content_div.className="review_content_div";
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
                    }
                    );
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
                        if (current_user){
                            book_review.append(bookmark);
                        }
                        book_review.append(review_rating_div,review_content_div, review_like_button_div, review_timestamp_div);
                        bookmark.onclick = () => {
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
                        }
                        else{
                            bookmark.classList.add("btn-warning");
                            bookmark.classList.remove("btn-primary");
                            bookmark.innerHTML=`<i class="bi bi-bookmark-dash"></i> Remove Bookmark`;
                        }
                            });
                        }
                    });
                    community_reviews_div.append(book_review);
            });
        const load_more_reviews_div=document.createElement("div");
        load_more_reviews_div.className="load_more_reviews_div";
        const load_more_reviews_button=document.createElement("button");
        load_more_reviews_button.innerHTML="Load More Reviews";
        load_more_reviews_button.onclick = (event) => load_reviews(event.target, community_reviews_div, isbn);
        load_more_reviews_button.className="load_more_reviews_button";
        load_more_reviews_button.classList.add("btn", "btn-secondary");
        load_more_reviews_div.append(load_more_reviews_button);
        if (data["next"]){
            community_reviews_div.append(load_more_reviews_div);
        }
        });
        reviews_div.append(community_reviews_div);
        book_info.append(title,author,avg_rating_div,snippet,sale_info,description,categories,additional_info_header,additional_info, reviews_div);
        book_result_div.append(book_info);
        if (window.location.pathname !== `/codex/${isbn}`) {
            history.pushState({view: "book"}, "", `/codex/${isbn}`);
        }
        window.scrollTo(0,0);
    });
}
function purchase_listing(listing_id){
    fetch('/get_listing', {
        method:"POST",
        body:JSON.stringify({
            id:listing_id
        })
    })
    .then(response => response.json())
    .then(data => {
        const listing=data["listing"][0];
        const checkout=document.querySelector(".checkout");
        checkout.style.display='block';
        const cover_image=checkout.querySelector(".cover_image");
        fetch('/book_result',{
            method:"POST",
            body:JSON.stringify({
                isbn:listing["book_isbn"]
            })
        })
        .then(response => response.json())
        .then(data => {
            cover_image.src=data["result"]["items"][0]["volumeInfo"]["imageLinks"]["thumbnail"];
        });
        const purchase_form=checkout.querySelector(".purchase_form");
        purchase_form.style.display="block";
        const book_result=document.querySelector("#book_result");
        book_result.style.display="none";
        purchase_form.querySelector("#id_price").value=listing["price"];
        const quantity=purchase_form.querySelector("#id_quantity");
        quantity.max=listing["stock"];
        quantity.value=1;
        purchase_form.querySelector("#id_book_isbn").value=listing["book_isbn"];
        purchase_form.dataset.listing_id=listing_id;
        const total=purchase_form.querySelector(".total");
        total.textContent=`Total: ${listing["price"]}`;
        const grand_total=checkout.querySelector(".grand_total");
        grand_total.textContent=`Grand Total: ${listing["price"]}`;
        const user_credits=checkout.querySelector(".user_credits");
        fetch("/get_user_credits",{
            method:"POST",
            body:JSON.stringify({
                id:user_id
            })
        })
        .then(response => response.json())
        .then(data => {
            user_credits.textContent=`Your Credits: ${data["credits"]}`;
        })
        const purchase_button=checkout.querySelector("#purchase_button");
        const cancel_button=checkout.querySelector("#cancel_purchase_button");
        quantity.onchange = () => {
            const value=quantity.value;
            grand_total.textContent=`Grand Total: ${listing["price"]*value}`;
            total.textContent=`Total: ${listing["price"]*value}`;
        }
        cancel_button.onclick = () => {
            window.location.href=`/codex/${listing["book_isbn"]}/${listing_id}`;
            purchase_form.reset();
        };
        purchase_button.onclick = () => {
            purchase_form.dispatchEvent(new Event('submit', {cancelable: true}));
        }
    });
}
function manage_cart(isbn, button, listing_id){
    fetch('/update_cart',{
        method:"POST",
        body:JSON.stringify({
            id:user_id,
            isbn:isbn,
            listing_id:listing_id,
        })
    })
    .then(response => response.json())
    .then(data => {
        const status=data["status"];
        if (status){
            button.classList.add("btn-info");
            button.classList.remove("btn-warning");
            button.innerHTML=`<i class="bi bi-cart-dash"></i> Remove From Cart`;
        }
        else{
            button.classList.add("btn-warning");
            button.classList.remove("btn-info");
            button.innerHTML=`<i class="bi bi-cart-plus"></i> Add to Cart`;
        }
    })
}
function manage_listing(listing_id, flag="update"){
    if (flag=="delete"){
        fetch("/delete_listing", {
            method:"POST",
            body:JSON.stringify({
                id:listing_id
            })
        })
        .then(response => response.json())
        .then(data => {
            window.location.href="/book_crate";
        });
    }
    else if (flag=="update"){
        const listing_form=document.querySelector("#listing_form");
        const sale_info = document.querySelector(".result_sale_info");
        sale_info.append(listing_form);
        listing_form.style.display="block";
        fetch('/get_listing', {
            method:"POST",
            body:JSON.stringify({
                id:listing_id
            })
        })
        .then(response =>  response.json())
        .then(data => {
            const listing_info=data["listing"][0];
            const isbn=listing_info["book_isbn"];
            listing_form.querySelector("#id_book_isbn").value=isbn;
            listing_form.querySelector("#id_price").value=listing_info["price"];
            listing_form.querySelector("#id_stock").value=listing_info["stock"];
            listing_form.onsubmit = (event) => {
                event.preventDefault();
                fetch('/update_listing', {
                    method:"POST",
                    headers: {
                        'Content-Type': 'application/json',
                        "X-CSRFToken": document.getElementsByName("csrfmiddlewaretoken")[1].value,
                    },
                    body:JSON.stringify({
                        librarian_id:user_id,
                        isbn:listing_form.querySelector("#id_book_isbn").value,
                        price:listing_form.querySelector("#id_price").value,
                        stock:listing_form.querySelector("#id_stock").value
                    })
                })
                .then(response => response.json())
                .then(data => {
                    listing_form.reset();
                    const updated_listing=data["listing"][0];
                    sale_info.querySelector(".result_price").innerHTML=`Price: ${updated_listing["price"]} Credits`;
                    if (updated_listing["stock"] === 1){
                        sale_info.querySelector(".result_stock").innerHTML=`${updated_listing["stock"]} copy available`;
                    }
                    else{
                        sale_info.querySelector(".result_stock").innerHTML=`${updated_listing["stock"]} copies available`;
                    }
                });
                }
        });
    }
}
function refresh_review(isbn, user_id, flag="highest_rated"){
    review_page=1;
    fetch('/get_book_reviews',{
        method:"POST",
        body:JSON.stringify({
            isbn:isbn,
            page:review_page,
            user_id:user_id,
            flag:flag,
        })
    })
    .then(response => response.json())
    .then(data => {
        reviews=data["reviews"];
        const community_reviews_div=document.querySelector(".community_reviews_div");
        community_reviews_div.innerHTML="";
        const user_review_button_div=document.querySelector(".user_review_button_div");
        reviews.forEach(review => {
            const book_review=document.createElement("div");
            book_review.dataset.id=review["id"];
            const username_header=document.createElement("div");
            username_header.className="review_username_header";
            const username_header_content=document.createElement("p");
                username_header_content.textContent=review["user_id__username"];
                username_header_content.onclick = () => {
                    window.location.href=`/user/${review["user_id__username"]}`;
                };
                Array.from(username_header.children).forEach(child => { if (child.tagName.toLowerCase() === "p") {child.remove();}}); username_header.append(username_header_content);
            const review_content_div=document.createElement("div");
            const review_content=document.createElement("div");
            review_content.textContent=review["content"];
            const review_timestamp_div=document.createElement("div");
            review_timestamp_div.className="review_timestamp_div";
            let timestamp=new Date(review["timestamp"]);
            timestamp=timestamp.toLocaleDateString("en-US",options={month:"short",year:"numeric",day:"numeric"});
            review_timestamp_div.textContent=`${timestamp}`;
            review_content_div.append(review_content);
            book_review.append(username_header, review_content_div);
            const review_like_button_div=document.createElement("div");
            review_like_button_div.className="review_like_button_div";
            const review_like_button=document.createElement("div");
            review_like_button.onclick= (event) => manage_like(book_review.dataset.id, event.target);
            const review_like_count_div=document.createElement("div");
            review_like_count_div.className="review_like_count_div";
            if (current_user){
                review_like_button.style.cursor="pointer";
            }
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
            book_review.append(review_like_button_div,review_timestamp_div);
            if (current_user && review["user_id__username"]==current_user){
                const username_header_content=document.createElement("p");
                username_header_content.textContent=review["user_id__username"];
                username_header_content.onclick = () => {
                    window.location.href=`/user/${review["user_id__username"]}`;
                };
                Array.from(username_header.children).forEach(child => { if (child.tagName.toLowerCase() === "p") {child.remove();}}); username_header.append(username_header_content);
                book_review.className="user_review_div";
                review_content_div.className="user_review_content_div";
                review_content.className="user_review_content";
                user_review_button_div.style.display="none";
                community_reviews_div.prepend(book_review);
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
                        review_option.onclick= () => manage_review(isbn, review_option, action="edit");
                    }
                    else if (i==1){
                        review_option.textContent="Delete";
                        review_option.onclick= () => manage_review(isbn, review_option, action="delete");
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
                }
                );
            }
            else{
                const username_header_content=document.createElement("p");
                username_header_content.textContent=review["user_id__username"];
                username_header_content.onclick = () => {
                    window.location.href=`/user/${review["user_id__username"]}`;
                };
                Array.from(username_header.children).forEach(child => { if (child.tagName.toLowerCase() === "p") {child.remove();}}); username_header.append(username_header_content);
                book_review.className="book_review";
                review_content.className="review_content";
                review_content_div.className="review_content_div";
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
                }
                );
                const bookmark=document.createElement("button");
                bookmark.className="bookmark_button";
                bookmark.classList.add("btn");
                bookmark.innerHTML="Bookmark";
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
                        if (current_user){
                            book_review.append(bookmark);
                        }
                        book_review.append(review_rating_div,review_content_div, review_like_button_div, review_timestamp_div);
                        bookmark.onclick = () => {
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
                        }
                        else{
                            bookmark.classList.add("btn-warning");
                            bookmark.classList.remove("btn-primary");
                            bookmark.innerHTML=`<i class="bi bi-bookmark-dash"></i> Remove Bookmark`;
                        }
                            })
                        }
                    });
                community_reviews_div.append(book_review);
            }
        });
    const load_more_reviews_div=document.createElement("div");
    load_more_reviews_div.className="load_more_reviews_div";
    const load_more_reviews_button=document.createElement("button");
    load_more_reviews_button.innerHTML="Load More Reviews";
    load_more_reviews_button.onclick = (event) => load_reviews(event.target, community_reviews_div, isbn);
    load_more_reviews_button.className="load_more_reviews_button";
    load_more_reviews_button.classList.add("btn", "btn-secondary");
    load_more_reviews_div.append(load_more_reviews_button);
    if (data["next"]){
        community_reviews_div.append(load_more_reviews_div);
    }
    });
}
function load_reviews(button, reviews_div, isbn){
    review_page+=1;
    fetch('/get_book_reviews', {
        method:"POST",
        body:JSON.stringify({
            isbn:isbn,
            page:review_page,
        })
    })
    .then(response => response.json())
    .then(data => {
        reviews=data["reviews"];
        reviews.forEach(review => {
            const book_review=document.createElement("div");
            book_review.dataset.id=review["id"];
            const username_header=document.createElement("div");
            username_header.className="review_username_header";
            const username_header_content=document.createElement("p");
                username_header_content.textContent=review["user_id__username"];
                username_header_content.onclick = () => {
                    window.location.href=`/user/${review["user_id__username"]}`;
                };
                Array.from(username_header.children).forEach(child => { if (child.tagName.toLowerCase() === "p") {child.remove();}}); username_header.append(username_header_content);
            const review_content_div=document.createElement("div");
            const review_content=document.createElement("div");
            review_content.textContent=review["content"];
            const review_timestamp_div=document.createElement("div");
            review_timestamp_div.className="review_timestamp_div";
            let timestamp=new Date(review["timestamp"]);
            timestamp=timestamp.toLocaleDateString("en-US",options={month:"short",year:"numeric",day:"numeric"});
            review_timestamp_div.textContent=`${timestamp}`;
            review_content_div.append(review_content);
            book_review.append(username_header);
            const review_like_button_div=document.createElement("div");
            review_like_button_div.className="review_like_button_div";
            const review_like_button=document.createElement("div");
            review_like_button.onclick= (event) => manage_like(book_review.dataset.id, event.target);
            const review_like_count_div=document.createElement("div");
            review_like_count_div.className="review_like_count_div";
            if (current_user){
                review_like_button.style.cursor="pointer";
            }
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
            review_like_button_div.append(review_like_button,review_like_count_div);
            const bookmark=document.createElement("button");
            bookmark.className="bookmark_button";
            bookmark.classList.add("btn");
            bookmark.innerHTML="Bookmark";
            book_review.append(username_header,bookmark,review_rating_div,review_content_div, review_like_button_div, review_timestamp_div);
            reviews_div.append(book_review);
        });
        reviews_div.append(button);
        if (!data["next"]){
            button.remove();
        }
    });
}
function manage_review(isbn, button, action="add"){
    const user_review_form=document.querySelector("#user_review_form").cloneNode(true);
    if (action=="add"){
        const reviews_div=document.querySelector(".community_reviews_div");
        reviews_div.prepend(user_review_form);
        user_review_form.style.display="block";
        user_review_form.onreset = () => {
        user_review_form.style.display="none";
        }
        user_review_form.onsubmit = (event) => {
            event.preventDefault();
            fetch('/manage_review', {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "X-CSRFToken": document.getElementsByName("csrfmiddlewaretoken")[1].value,
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
            user_review_form.style.display="none";
            button.parentElement.style.display="none";
            const user_review_div=document.createElement("div");
            user_review_div.className="user_review_div";
            const username_header=document.createElement("div");
            username_header.className="review_username_header";
            const username_header_content=document.createElement("p");
                username_header_content.textContent=current_user;
                username_header_content.onclick = () => {
                    window.location.href=`/user/${user_review["user_id__username"]}`;
                };
                Array.from(username_header.children).forEach(child => { if (child.tagName.toLowerCase() === "p") {child.remove();}}); username_header.append(username_header_content);
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
                    review_option.onclick= () => manage_review(isbn, review_option, action="edit");
                }
                else if (i==1){
                    review_option.textContent="Delete";
                    review_option.onclick= () => manage_review(isbn, review_option, action="delete");
                }
                review_options_dropdown.append(review_option);
            }
            review_options.append(review_options_dropdown);
            review_options.onclick = () => {
                if (review_options_dropdown.style.display==="block"){
                    review_options_dropdown.style.display="none";
                }
                else{
                    review_options_dropdown.style.display="block";
                }
            };
            username_header.append(review_options);
            const user_review_content_div=document.createElement("div");
            user_review_content_div.className="user_review_content_div";
            const user_review_content=document.createElement("div");
            user_review_content.className="user_review_content";
            user_review_content.textContent=user_review;
            user_review_content_div.append(user_review_content);
            const user_review_timestamp_div=document.createElement("div");
            user_review_timestamp_div.className="review_timestamp_div";
            let timestamp=new Date();
            timestamp=timestamp.toLocaleDateString("en-US",options={month:"short",year:"numeric",day:"numeric"});
            user_review_timestamp_div.textContent=`${timestamp}`;
            const review_like_button_div=document.createElement("div");
            review_like_button_div.className="review_like_button_div";
            const review_like_button=document.createElement("div");
            review_like_button.onclick= (event) => manage_like(data["id"], event.target);
            if (current_user){
                review_like_button.style.cursor="pointer";
            }
            const review_like_count_div=document.createElement("div");
            review_like_count_div.className="review_like_count_div";
            review_like_button_div.append(review_like_button,review_like_count_div);
            review_like_button.className="like_button";
            review_like_count_div.textContent="0";
            user_review_div.append(username_header,user_review_content_div, review_like_button_div,user_review_timestamp_div);
            const community_reviews_div=document.querySelector(".community_reviews_div");
            community_reviews_div.prepend(user_review_div);
            user_review_form.dispatchEvent(new Event("reset"));
        });
        }
    }
    else if(action=="edit"){
        user_review_form.style.display="block";
        const user_review=document.querySelector(".user_review_div");
        const user_review_content=user_review.querySelector(".user_review_content");
        const user_review_content_div=user_review.querySelector(".user_review_content_div");
        user_review_form.querySelector("#id_content").value=user_review_content.textContent;
        user_review_content.style.display="none";
        user_review_content_div.append(user_review_form);
        user_review_form.onreset = () => {
            user_review_content.style.display="block"
        user_review_form.style.display="none"
        };
        user_review_form.onsubmit = (event) => {
        event.preventDefault();
        fetch('/manage_review', {
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "X-CSRFToken": document.getElementsByName("csrfmiddlewaretoken")[1].value,
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

function search_books(query, type){
    const pagination_div=document.querySelector("#pagination_div");
    const book_results=document.querySelector("#book_results");
    const book_result_div=document.querySelector("#book_result");
    book_result_div.style.display="none";
    book_results.innerHTML="";
    book_results.style.display='block';
    const token=document.getElementsByName("csrfmiddlewaretoken")[0].value;
    const search_books_spinner=document.querySelector("#search_books_spinner");
    search_books_spinner.style.display="block";
    setTimeout(() => {search_books_spinner.style="none";}, 1800);
    fetch("book_results",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "X-CSRFToken": token,
        },
        body: JSON.stringify({
            query:query,
            page:page,
            select:type
        })
    })
    .then(response => response.json())
    .then(data => {
        const results=data["results"]["items"];
        if (!results || results.length==0){
            book_results.innerHTML="No results found";
            pagination_div.style.display='none';
            return;
        }
        else{
            results.forEach(result => {
                let snippet=document.createElement("p");
                snippet.className="search_book_snippet";
                try{
                    snippet.textContent=new DOMParser().parseFromString(result["searchInfo"]["textSnippet"],"text/html").body.textContent;
                }
                catch{
                    snippet="";
                }
                result=result["volumeInfo"];
                let isbn=null;
                try{
                    const identifiers=result["industryIdentifiers"];
                    identifiers.forEach(identifier => {
                        if (identifier["type"].toUpperCase() === "ISBN_13"){
                            isbn=identifier["identifier"].match(/^(\d{13})$/)[1];
                        }
                    });
                }
                catch{
                    return; //Remove to stop ommitting results with no isbn
                }
                const div_element=document.createElement("div");
                div_element.className="search_book_result";
                const title=document.createElement("p");
                title.className="search_book_title";
                title.textContent=result["title"];
                const author=document.createElement("p");
                author.className="search_book_author";
                author.textContent=`by ${result["authors"]}`;
                const avg_rating_div=document.createElement("div");
                fetch('/get_book_rating', {
                    method:"POST",
                    body:JSON.stringify({
                    isbn:isbn
                    })
                })
                .then(response => response.json())
                .then(data => {
                    const avg_rating=data["avg_rating"];
                    const ratings_count=data["ratings_count"];
                    avg_rating_div.className="search_rating_div";
                    const search_ratings_bar_div=document.createElement("div");
                    search_ratings_bar_div.className="search_ratings_bar_div";
                    const search_rating_bar=document.createElement("div");
                    search_rating_bar.className="search_rating_bar";
                    search_rating_bar.classList.add("progress","progress-bar", "bg-warning");
                    search_rating_bar.style.width=`${avg_rating*20}%`;
                    const search_ratings_count_div=document.createElement('div');
                    search_ratings_count_div.className="search_ratings_count_div"
                    const search_rating_info=document.createElement('div');
                    search_rating_info.className="search_rating_info";
                    search_rating_info.textContent=`${avg_rating} (${ratings_count} ratings)`;
                    const search_ratings_stars_div=document.createElement('div');
                    search_ratings_stars_div.className="search_ratings_stars_div";
                    search_ratings_bar_div.append(search_rating_bar);
                    for (let i=0;i<5;i++){
                        const star=document.createElement("div");
                        star.className="search_ratings_star";
                        search_ratings_stars_div.append(star);
                    }
                    search_ratings_count_div.append(search_rating_info);
                    avg_rating_div.append(search_ratings_bar_div,search_ratings_stars_div,search_ratings_count_div);
                });
                const publishinfo=document.createElement("p");
                publishinfo.className="search_book_publish_info";
                if (result["publishedDate"]){
                    if(result["publisher"]){
                        publishinfo.textContent=`Published on: ${result["publishedDate"] } (${result["publisher"]})`;
                    }
                    else{
                    publishinfo.textContent=`Published on: ${result["publishedDate"]}`;
                    }
                }
                const book_info=document.createElement("div");
                book_info.className="search_book_info";
                book_info.append(title,author,avg_rating_div,publishinfo,snippet);
                let cover_image_div=document.createElement("div");
                cover_image_div.className="search_book_cover_image_div";
                const cover_image=new Image();
                cover_image.className="search_book_cover_image";
                try{
                    const image_link=result["imageLinks"]["thumbnail"];
                    cover_image.src=image_link;
                }
                catch{
                    return; //Remove this to stop omitting results with no images
                }
                cover_image_div.append(cover_image);
                if (current_user){
                    const bookshelf_button=document.createElement("button");
                    bookshelf_button.className="search_bookshelf_button";
                    bookshelf_button.classList.add("btn","btn-success","dropdown-toggle");
                    bookshelf_button.dataset.bsToggle="dropdown";
                    bookshelf_button.type="button";
                    fetch('/in_bookshelf',{
                        method:"POST",
                        body:JSON.stringify({
                            user_id:user_id,
                            isbn:isbn
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if(data["in_bookshelf"]){
                            bookshelf_button.textContent="Remove from Bookshelf";
                            bookshelf_button.classList.add("btn-danger");
                            bookshelf_button.classList.remove("btn-success","dropdown-toggle");
                            bookshelf_button.setAttribute("data-bs-toggle", "");
                            bookshelf_button.onclick = (event) => manage_bookshelf(event.target,user_id,isbn,'remove');
                        }
                        else{
                            bookshelf_button.textContent="Add to Bookshelf";
                            bookshelf_button.classList.add("btn-success","dropdown-toggle");
                            bookshelf_button.classList.remove("btn-danger");
                            bookshelf_button.setAttribute("data-bs-toggle", "dropdown");
                            bookshelf_button.onclick = (event) => manage_bookshelf(event.target,user_id,isbn);
                        }
                        const bookshelf_button_div=document.createElement("div");
                        bookshelf_button_div.id="bookshelf_button_div";
                        bookshelf_button_div.classList.add("dropdown");
                        const bookshelf_dropdown_menu=document.createElement("ul");
                        bookshelf_dropdown_menu.classList.add("dropdown-menu");
                        for (let i=0;i<3;i++){
                            const bookshelf_item=document.createElement("li");
                            bookshelf_item.classList.add("dropdown-item");
                            if (i===0){
                                bookshelf_item.textContent="Read";
                            }
                            else if (i===1){
                                bookshelf_item.textContent="Currently Reading";
                            }
                            else if (i===2){
                                bookshelf_item.textContent="Want to Read";
                            }
                            bookshelf_item.onclick = (event) => manage_bookshelf(event.target.parentElement.parentElement.querySelector(".search_bookshelf_button"),user_id, isbn, action=event.target.textContent);
                            bookshelf_dropdown_menu.append(bookshelf_item);
                        }
                        bookshelf_button_div.append(bookshelf_button, bookshelf_dropdown_menu);
                        cover_image_div.append(bookshelf_button_div);
                        fetch('/get_user_rating',{
                            method:"POST",
                            body:JSON.stringify({
                                user_id:user_id,
                                isbn:isbn
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            const search_user_rating_div=document.createElement("div");
                            search_user_rating_div.className="search_user_rating_div";
                            const search_user_ratings_stars=document.createElement("div");
                            search_user_ratings_stars.className="search_user_ratings_stars";
                            for (let i=1;i<6;i++){
                                const star=document.createElement("div");
                                star.className="search_user_ratings_star";
                                star.dataset.id=i;
                                search_user_ratings_stars.append(star);
                                star.onclick = (event) => manage_rating(i,isbn,event.target, flag="search");
                            }
                            const search_user_rating=data["rating"];
                            const search_user_rating_bar_div=document.createElement('div');
                            search_user_rating_bar_div.className="search_user_rating_bar_div";
                            const search_user_rating_bar=document.createElement("div");
                            search_user_rating_bar.className="search_user_rating_bar";
                            search_user_rating_bar.classList.add("progress","progress-bar", "bg-warning");
                            const search_user_rating_content=document.createElement('p');
                            search_user_rating_content.className='search_user_rating_content';
                            const clear_rating_div=document.createElement('div');
                            clear_rating_div.className="search_clear_rating_div";
                            const clear_rating=document.createElement('button');
                            clear_rating.className="search_clear_rating_button";
                            clear_rating.innerHTML="Clear Rating";
                            clear_rating.classList.add("btn","btn-link");
                            clear_rating.onclick = (event) => manage_rating(0,isbn,event.target, flag="search");
                            if (search_user_rating){
                                search_user_rating_bar.style.width=`${search_user_rating*20}%`;
                                search_user_rating_content.textContent=`Your Rating: ${search_user_rating}`;
                                clear_rating.style.display="block";
                            }
                            else{
                                search_user_rating_bar.style.width=`${0}%`;
                                search_user_rating_content.textContent="Rate this book:";
                                clear_rating.style.display="none";
                            }
                            search_user_rating_bar_div.append(search_user_rating_bar);
                            clear_rating_div.append(clear_rating);
                            search_user_rating_div.append(search_user_rating_content,search_user_rating_bar_div,search_user_ratings_stars, clear_rating_div);
                            search_user_ratings_stars.querySelectorAll(".search_user_ratings_star").forEach(star => {
                                if(star.dataset.id == 1){
                                    star.onpointerleave = () => {
                                        search_user_rating_bar.style.width="0%";
                                    }
                                }
                                star.onpointerenter= (event) => {
                                    value=event.target.dataset.id*20;
                                    search_user_rating_bar.style.width=`${value}%`;
                                }
                            });
                            cover_image_div.append(search_user_rating_div);
                    });
                    });
            }
                book_info.onclick = (event) => book_result(isbn, book_info);
                div_element.append(cover_image_div);
                div_element.append(book_info);
                book_results.append(div_element);
            });
            if (type!=="isbn"){
            pagination_div.style.display='block';
            }
            history.pushState({view: "search", type:type}, "");
        }
    });
}
function update_view(state){
    const pagination_div=document.querySelector("#pagination_div");
    const book_results=document.querySelector("#book_results");
    const book_result_div=document.querySelector("#book_result");
    const search_book_form_div=document.querySelector("#search_book_form_div");
    if (state && state.view==="search"){
        book_result_div.style.display="none";
        book_results.style.display="block";
        search_book_form_div.style.display="block";
        if (state.type && state.type!=="isbn"){
            pagination_div.style.display="block";
        }
    }
    else if (state && state.view==="book"){
        book_result_div.style.display="block";
        book_results.style.display="none";
        pagination_div.style.display="none";
        search_book_form_div.style.display="none";
    }
}
