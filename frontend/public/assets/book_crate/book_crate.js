var current_user=null;
var user_id=null;
var listing_page=1;
var user_status=null;
var admin_donation_page=1;
var admin_donation_next=true;
var maximum_pages=10;
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#id_select").classList.add("form-select");
    const search_book_form=document.querySelector("#search_book_form");
    search_book_form.onsubmit = (event) => {
        event.preventDefault();
        load_listings(search_book_form.querySelector("#id_query").value, search_book_form.querySelector("#id_select").value);
    }
    search_book_form.onreset = () => {
        listing_page=1;
        load_listings();
    }
    window.onpopstate = (event) => {
        update_view(event.state.view);
    }
    try{
    current_user=document.querySelector("#username").value;
    if (current_user && current_user!=="AnonymousUser"){
    fetch('/get_user_id',{
        method:"POST",
        body:JSON.stringify({
            username:current_user
        })
    })
    .then(response => response.json())
    .then(data => {
        user_id=data["user_id"];
        load_listings();
        fetch("/user_status", {
            method:"POST",
            body:JSON.stringify({
                id:user_id
            })
        })
        .then(response => response.json())
        .then(data => {
            user_status=data["status"];
            if (user_status !=="no user"){
            if (user_status){
    const create_listing_button = document.querySelector("#create_listing");
    const listing_search_form=document.querySelector("#search_listing_form");
    const search_result=document.querySelector("#search_result");
    const listing_form=document.querySelector("#listing_form");
    create_listing_button.onclick = () => {
        listing_search_form.style.display="block";
    }
    listing_search_form.onreset = () => {
        listing_search_form.style.display="none";
        search_result.style.display="none";
    }
    listing_search_form.onsubmit = (event) => {
        event.preventDefault();
        search_listing(listing_search_form);
    }
    search_result.style.display="none";
    listing_form.onreset = () => {
        search_result.style.display="none";
    }
    const manage_donations=document.querySelector("#manage_donations");
    manage_donations.onclick = () => {
        manage_donations.style.display="none";
        admin_donation_page=1;
        admin_donation_next=true;
        load_admin_donations();
    }
        }
        else{
            const donate_search_form=document.querySelector("#donate_search_form");
            donate_search_form.onreset = () =>{
                donate_search_form.style.display="none";
            }
            const donate_form=document.querySelector("#donate_form");
            donate_form.onreset = () =>{
                donate_form.parentElement.parentElement.style.display="none";
            }
            donate_form.onsubmit = () => {
                donate_form.parentElement.parentElement.style.display="none";
            }
            const donate_icon=document.querySelector("#donate_books");
            donate_icon.onclick = () => {
                donate_icon.style.display="none";
                load_donations();
            };
            const cart_icon=document.querySelector("#cart_icon");
            cart_icon.onclick = () => {
                cart_icon.style.display="none";
                const user_cart=document.querySelector("#user_cart");
                const listing_results=document.querySelector("#listing_results");
                listing_results.style.display="none";
                user_cart.style.display="block";
                load_cart();
            const checkout_button=document.querySelector("#checkout_button");
            checkout_button.onclick = () => {
                const checkboxes=[];
                document.querySelectorAll(".check_cart_item").forEach(checkbox => {
                    if (checkbox.value){
                        checkboxes.push(checkbox.value);
                    }
                });
                if (checkboxes.length===0){
                    const no_items_alert=document.querySelector("#no_items");
                    no_items_alert.style.display="block";
                    setTimeout(() => {no_items_alert.style.display="none";}, 3000);
                }
                else{
                    load_checkout(checkboxes);
                }
            }
            };
        }
    }
    else{
        load_listings();
    }
        });
        });
    }
    else{
        load_listings();
    }
}
catch{
 load_listings();
}
});

function update_view(flag){
    const listing_results=document.querySelector("#listing_results");
    const user_cart=document.querySelector("#user_cart");
    const header=document.querySelector("#header");
    const checkout_button=document.querySelector("#checkout_button");
    const cart_icon=document.querySelector("#cart_icon");
    const checkout=document.querySelector(".checkout");
    const donations_div=document.querySelector("#user_donations");
    const admin_donations_div=document.querySelector("#donations_div");
    const donate_icon=document.querySelector("#donate_books");
    const manage_donations=document.querySelector("#manage_donations");
    const search_book_form_div=document.querySelector("#search_book_form_div");
    const create_listing=document.querySelector("#create_listing");
    const checkout_listings=document.querySelector(".checkout_listings");
    const pagination_div=document.querySelector("#pagination_div");
    if (flag==="donations"){
        user_cart.style.display="none";
        checkout.style.display="none";
        listing_results.style.display="none";
        header.textContent="Donations";
        checkout_button.style.display="none";
        donations_div.style.display="block";
        cart_icon.style.display="none";
        search_book_form_div.style.display="none";
        donate_icon.style.display="none";
        pagination_div.style.display="none";
    }
    else if (flag=="checkout"){
        user_cart.style.display="none";
        checkout.style.display="block";
        header.style.display="none";
        checkout_button.style.display="none";
        checkout_listings.style.display="block";
        pagination_div.style.display="none";
    }
    else if (flag==="cart"){
        user_cart.style.display="block";
        header.textContent="Cart";
        header.style.display="block";
        checkout.style.display="none";
        checkout_button.style.display="block";
        listing_results.style.display="none";
        cart_icon.style.display="none";
        donate_icon.style.display="inline-block";
        search_book_form_div.style.display="none";
        pagination_div.style.display="none";
    }
    else if (flag==="listings"){
        header.textContent="Book Crate";
        listing_results.style.display="block";
        search_book_form_div.style.display="block";
        pagination_div.style.display="block";
        if (user_cart){
            checkout_button.style.display="none";
            user_cart.style.display="none";
            donate_icon.style.display="inline-block";
            checkout.style.display="none";
            cart_icon.style.display="block";
            donations_div.style.display="none";
        }
        if (manage_donations){
            admin_donations_div.style.display="none";
            create_listing.style.display="inline-block";
            manage_donations.style.display="inline-block";
        }
    }
    else if (flag==="admin_donations"){
        listing_results.style.display="none";
        admin_donations_div.style.display="block";
        search_book_form_div.style.display="none";
        create_listing.style.display="none";
        manage_donations.style.display="none";
        pagination_div.style.display="none";
    }
}

function manage_pagination(query,type){
    if (type!=="isbn"){
    const pagination_div=document.querySelector("#pagination_div");
    const pagination_list=document.querySelector("#pagination_list");
    pagination_list.innerHTML="";
    pagination_div.style.display='none';
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
    preceding.textContent=(listing_page-1).toString();
    current.textContent=listing_page.toString();
    succeeding.textContent=(listing_page+1).toString();
    pagination_list.append(previous, preceding, current, succeeding, next);
    if (listing_page<=1){
        listing_page=1;
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
    if (listing_page>=maximum_pages){
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
        listing_page=parseInt(preceding.textContent);
        load_listings(query,type);
    };
    succeeding.onclick = ()=>{
        listing_page=parseInt(succeeding.textContent);
        load_listings(query,type);
    };
    previous.onclick = ()=> {
        listing_page--;
        load_listings(query,type);
    };
    next.onclick = ()=>{
        listing_page++;
        load_listings(query,type);
    };
    pagination_div.style.display='block';
}
}


function load_admin_donations(){
    update_view("admin_donations");
    const donations_div=document.querySelector("#donations_div");
    Array.from(donations_div.children).forEach(child =>{
        if (child.id!=="donations_spinner"){
            child.remove();
        }
    });
    const spinner=donations_div.querySelector("#donations_spinner");
    spinner.style.display="block";
    setTimeout(() => {spinner.style.display="none";}, 1500);
    const header=document.querySelector("#header");
    if (admin_donation_page === 1){
        header.textContent=`Book Donation Requests`;
    }
    if (admin_donation_next){
    fetch("/load_admin_donations", {
        method:"POST",
        body:JSON.stringify({
            page:admin_donation_page
        })
    })
    .then(response => response.json())
    .then(data => {
        const donations=data["donations"];
        if (!donations || donations.length===0){
            donations_div.innerHTML="<h2>No Book Donations Yet.</h2>"
        }
        donations.forEach(donation => {
            const isbn=donation["book_isbn"];
            fetch("/book_result", {
                method:"POST",
                body:JSON.stringify({
                    isbn:isbn
                })
            })
            .then(response =>  response.json())
            .then(data => {
                const donate_book=data["result"]["items"][0]["volumeInfo"];
                const div_element=document.createElement("div");
                div_element.dataset.cart_id=donation["id"];
                div_element.className="donate_book_result";
                const cover_image_div=document.createElement("div");
                cover_image_div.className="donate_cover_image_div";
                const cover_image=new Image();
                cover_image.className="donate_cover_image";
                cover_image.src=donate_book["imageLinks"]["thumbnail"];
                const accept=document.createElement("button");
                accept.className="accept_donation_button";
                accept.classList.add("btn", "btn-success");
                accept.innerHTML=`<i class="bi bi-journal-check"></i> Accept`;
                const reject=document.createElement("button");
                reject.className="reject_donation_button";
                reject.classList.add("btn", "btn-danger");
                reject.innerHTML=`<i class="bi bi-journal-x"></i> Reject`;
                accept.onclick = () => {
                    fetch("/manage_admin_donation", {
                        method:"POST",
                        body:JSON.stringify({
                            id:donation["id"],
                            status:true
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        div_element.remove();
                    });
                }
                reject.onclick = () => {
                    fetch("/manage_admin_donation", {
                        method:"POST",
                        body:JSON.stringify({
                            id:donation["id"],
                            status:false
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        div_element.remove();
                    });
                }
                cover_image_div.append(cover_image, accept, reject);
                div_element.append(cover_image_div);
                const book_info_div=document.createElement("div");
                book_info_div.className="donate_book_info_div";
                const title=document.createElement("p");
                title.className="donate_book_title";
                title.textContent=donate_book["title"];
                const author=document.createElement("p");
                author.className="donate_book_author";
                author.textContent=`by ${donate_book["authors"]}`;
                const quantity=document.createElement("p");
                quantity.textContent=`Quantity: ${donation["quantity"]}`;
                quantity.className="donate_book_quantity";
                const timestamp=document.createElement("p");
                const by=document.createElement("p");
                by.textContent=`Request by: ${donation["user_id__username"]}`;
                by.className="donate_book_username";
                by.textContent.onclick = () => {
                    window.location.href=`/user/${donation["user_id__username"]}`;
                }
                timestamp.textContent=`Timestamp: ${new Date(donation["timestamp"]).toLocaleString("en-US",options={timeZone:"UTC",year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"numeric"})}`;
                book_info_div.append(title,author,quantity,by,timestamp);
                div_element.append(book_info_div);
                donations_div.append(div_element);
            });
        });
    });
    }
    if(history.state.view !== "admin_donations"){
        history.pushState({view:"admin_donations"},"");
    }
}
function load_donations(){
    update_view("donations");
    const donations_div=document.querySelector("#user_donations");
    Array.from(donations_div.children).forEach(child => {
        if (child.tagName.toLowerCase()!=="form" && child.id.toLowerCase()!=="no_donate_result_alert" && child.id!=="donate_result" && child.id!=="donate_book_spinner"){
            child.remove();
        }
    });
    const spinner=donations_div.querySelector("#donate_book_spinner");
    spinner.style.display="block";
    setTimeout(() => {spinner.style.display="none";},1800);
    donations_div.querySelector("#donate_result").style.display="none";
    donations_div.style.display="block";
    const add_donation_button=document.createElement("button");
    add_donation_button.className="add_donation_button";
    add_donation_button.classList.add("btn","btn-success");
    add_donation_button.innerHTML=`<i class="bi bi-bookmark-plus"></i> Add Book Donation Request`;
    donations_div.prepend(add_donation_button);
    fetch('/load_donations', {
        method:"POST",
        body:JSON.stringify({
            id:user_id
        })
    })
    .then(response => response.json())
    .then(data => {
        const user_donations=data["donations"];
        user_donations.forEach(donation => {
            const isbn=donation["book_isbn"];
            fetch("/book_result", {
                method:"POST",
                body:JSON.stringify({
                    isbn:isbn
                })
            })
            .then(response =>  response.json())
            .then(data => {
                const donate_book=data["result"]["items"][0]["volumeInfo"];
                const div_element=document.createElement("div");
                div_element.dataset.cart_id=donation["id"];
                div_element.className="donate_book_result";
                const cover_image_div=document.createElement("div");
                cover_image_div.className="donate_cover_image_div";
                const cover_image=new Image();
                cover_image.className="donate_cover_image";
                cover_image.src=donate_book["imageLinks"]["thumbnail"];
                const delete_donation=document.createElement("button");
                delete_donation.innerHTML="Delete Donation";
                delete_donation.className="delete_donation_button";
                delete_donation.classList.add("btn", "btn-danger");
                delete_donation.onclick = () => {
                    fetch('/delete_donation',{
                        method:"POST",
                        body:JSON.stringify({
                            id:donation["id"]
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        div_element.remove();
                    });
                }
                const update_donation=document.createElement("button");
                update_donation.innerHTML="Update Donation";
                update_donation.className="update_donation_button";
                update_donation.classList.add("btn", "btn-info");
                cover_image_div.append(cover_image, update_donation , delete_donation);
                div_element.append(cover_image_div);
                const book_info_div=document.createElement("div");
                book_info_div.className="donate_book_info_div";
                const title=document.createElement("p");
                title.className="donate_book_title";
                title.textContent=donate_book["title"];
                const author=document.createElement("p");
                author.className="donate_book_author";
                author.textContent=`by ${donate_book["authors"]}`;
                const quantity=document.createElement("p");
                quantity.textContent=`Quantity: ${donation["quantity"]}`;
                quantity.className="donate_book_quantity";
                update_donation.onclick = (event) => {
                    const donate_form=donations_div.querySelector("#donate_form");
                    const donate_result=donations_div.querySelector("#donate_result");
                    donate_form.querySelector("#id_book_isbn").value=donation["book_isbn"];
                    donate_form.querySelector("#id_quantity").value=event.target.parentElement.parentElement.querySelector(".donate_book_quantity").textContent.match(/Quantity: (\d+)/)[1];
                    donate_result.querySelector(".result_book_cover_image").src=donate_book["imageLinks"]["thumbnail"];
                    donate_result.querySelector(".result_book_title").textContent=donate_book["title"];
                    donate_result.querySelector(".result_book_author").textContent=`by ${donate_book["authors"]}`;
                    donate_form.style.display="block";
                    donate_result.style.display="grid";
                    window.scrollTo(0,0);
                donate_form.onsubmit = (event) => {
                event.preventDefault();
                fetch('/update_donation',{
                    method:"POST",
                    headers:{
                        'Content-Type': 'application/json',
                        "X-CSRFToken": donate_form.querySelector(`[name="csrfmiddlewaretoken"]`).value,
                    },
                    body:JSON.stringify({
                        isbn:donate_form.querySelector("#id_book_isbn").value,
                        quantity:donate_form.querySelector("#id_quantity").value,
                        id:user_id,
                    })
                })
                .then(response => response.json())
                .then(data => {
                    donate_search_form.reset();
                    donate_form.reset();
                    const donation=data["donation"][0];
                    const new_quantity=donation["quantity"];
                    quantity.textContent=`Quantity: ${new_quantity}`;
                });
            }
                }
                const timestamp=document.createElement("p");
                timestamp.textContent=`Timestamp: ${new Date(donation["timestamp"]).toLocaleString("en-US",options={timeZone:"UTC",year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"numeric"})}`;
                book_info_div.append(title,author,quantity, timestamp);
                div_element.append(book_info_div);
                donations_div.append(div_element);
        });
    });
    });
    const donate_search_form=document.querySelector("#donate_search_form");
    donate_search_form.onsubmit = (event) => {
        event.preventDefault();
        const spinner=donations_div.querySelector("#donate_book_spinner");
        spinner.style.display="block";
        setTimeout(() => {spinner.style.display="none";}, 1600);
        fetch('/book_result', {
            method:"POST",
            body:JSON.stringify({
                isbn:donate_search_form.querySelector("#id_book_isbn").value
            })
        })
        .then(response => response.json())
        .then(data => {
            let result=data["result"]["items"];
            if (!result){
                const no_donate_result_alert=document.querySelector("#no_donate_result_alert");
                no_donate_result_alert.style.display="block";
                const close_button=no_donate_result_alert.querySelector("#close_no_donate_result_alert");
                close_button.onclick = () => {
                    no_donate_result_alert.style.display="none";
                };
                return;
            }
            result=result[0]["volumeInfo"];
            const donate_result=donations_div.querySelector("#donate_result");
            const donate_form=donations_div.querySelector("#donate_form");
            donate_form.style.display="block";
            donate_result.style.display="grid";
            donate_form.querySelector("#id_book_isbn").value=donate_search_form.querySelector("#id_book_isbn").value;
            donate_result.querySelector(".result_book_title").textContent=result["title"];
            donate_result.querySelector(".result_book_author").textContent=`by ${result["authors"]}`;
            donate_result.querySelector(".result_book_cover_image").src=result["imageLinks"]["thumbnail"];
            donate_result.querySelector("#id_quantity").value=1;
            donate_form.onsubmit = (event) => {
                event.preventDefault();
                fetch('/update_donation',{
                    method:"POST",
                    headers:{
                        'Content-Type': 'application/json',
                        "X-CSRFToken": donate_form.querySelector(`[name="csrfmiddlewaretoken"]`).value,
                    },
                    body:JSON.stringify({
                        isbn:donate_form.querySelector("#id_book_isbn").value,
                        quantity:donate_form.querySelector("#id_quantity").value,
                        id:user_id,
                    })
                })
                .then(response => response.json())
                .then(data => {
                    donate_search_form.reset();
                    donate_form.reset();
                    const donation=data["donation"][0];
                    const isbn=donation["book_isbn"];
            fetch("/book_result", {
                method:"POST",
                body:JSON.stringify({
                    isbn:isbn
                })
            })
            .then(response =>  response.json())
            .then(data => {
                const donate_book=data["result"]["items"][0]["volumeInfo"];
                const div_element=document.createElement("div");
                div_element.dataset.cart_id=donation["id"];
                div_element.className="donate_book_result";
                const cover_image_div=document.createElement("div");
                cover_image_div.className="donate_cover_image_div";
                const cover_image=new Image();
                cover_image.className="donate_cover_image";
                cover_image.src=donate_book["imageLinks"]["thumbnail"];
                cover_image_div.append(cover_image);
                div_element.append(cover_image_div);
                const book_info_div=document.createElement("div");
                book_info_div.className="donate_book_info_div";
                const delete_donation=document.createElement("button");
                delete_donation.innerHTML="Delete Donation";
                delete_donation.className="delete_donation_button";
                delete_donation.classList.add("btn", "btn-danger");
                delete_donation.onclick = () => {
                    fetch('/delete_donation',{
                        method:"POST",
                        body:JSON.stringify({
                            id:donation["id"]
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        div_element.remove();
                    });
                }
                const update_donation=document.createElement("button");
                update_donation.innerHTML="Update Donation";
                update_donation.className="update_donation_button";
                update_donation.classList.add("btn", "btn-info");
        cover_image_div.append(update_donation, delete_donation);
                const title=document.createElement("p");
                title.className="donate_book_title";
                title.textContent=donate_book["title"];
                const author=document.createElement("p");
                author.className="donate_book_author";
                author.textContent=`by ${donate_book["authors"]}`;
                const quantity=document.createElement("p");
                quantity.textContent=`Quantity: ${donation["quantity"]}`;
                quantity.className="donate_book_quantity";
                update_donation.onclick = () => {
                    donate_form.querySelector("#id_book_isbn").value=donation["book_isbn"];
                    donate_form.querySelector("#id_quantity").value=donation["quantity"];
                    fetch("/book_result", {
                        method:"POST",
                        body:JSON.stringify({
                            isbn:donation["book_isbn"]
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        const book=data["result"]["items"][0]["volumeInfo"];
                        donate_result.querySelector(".result_book_cover_image").src=book["imageLinks"]["thumbnail"];
                        donate_result.querySelector(".result_book_title").textContent=book["title"];
                        donate_result.querySelector(".result_book_author").textContent=`by ${book["authors"]}`;
                        donate_form.style.display="block";
                        donate_result.style.display="block";
                        window.scrollTo(0,0);
                    });
                    donate_form.onsubmit = (event) => {
                    event.preventDefault();
                    fetch('/update_donation',{
                    method:"POST",
                    headers:{
                        'Content-Type': 'application/json',
                        "X-CSRFToken": donate_form.querySelector(`[name="csrfmiddlewaretoken"]`).value,
                    },
                    body:JSON.stringify({
                        isbn:donate_form.querySelector("#id_book_isbn").value,
                        quantity:donate_form.querySelector("#id_quantity").value,
                        id:user_id,
                    })
                })
                .then(response => response.json())
                .then(data => {
                    donate_search_form.reset();
                    donate_form.reset();
                    const donation=data["donation"][0];
                    const new_quantity=donation["quantity"];
                    quantity.textContent=`Quantity: ${new_quantity}`;
                });
            }
        }
                const timestamp=document.createElement("p");
                timestamp.textContent=`Timestamp: ${new Date(donation["timestamp"]).toLocaleString("en-US",options={timeZone:"UTC",year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"numeric"})}`;
                book_info_div.append(title,author,quantity, timestamp);
                div_element.append(book_info_div);
                try{
                donations_div.querySelector(".donate_book_result").before(div_element);
                }
                catch{
                    donations_div.append(div_element);
                }
            });
                });
            }
        });
    }
    add_donation_button.onclick = () => {
        donate_search_form.style.display="block";
    };
    history.pushState({view: "donations"},"");
}

function load_checkout(listings){
    update_view("checkout");
    const checkout=document.querySelector(".checkout");
    const parent_element=document.querySelector(".checkout_listing");
    const checkout_listings=document.querySelector(".checkout_listings");
    checkout_listings.innerHTML="";
    var grand_total_amount=0;
    const grand_total=checkout.querySelector(".grand_total");
    const fetches=[];
    listings.forEach(listing_id=>{
        const child_element=parent_element.cloneNode(true);
        child_element.className="checkout_item";
        const fetch_promise=fetch('/get_listing', {
            method:"POST",
            body:JSON.stringify({
                id:listing_id
            })
        })
        .then(response => response.json())
        .then(data => {
        const listing=data["listing"][0];
        const cover_image=child_element.querySelector(".cover_image");
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
        const purchase_form=child_element.querySelector(".purchase_form");
        purchase_form.querySelector("#id_price").value=listing["price"];
        const quantity=purchase_form.querySelector("#id_quantity");
        quantity.max=listing["stock"];
        quantity.value=1;
        purchase_form.querySelector("#id_book_isbn").value=listing["book_isbn"];
        purchase_form.dataset.listing_id=listing_id;
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
                });
            };
        const total=purchase_form.querySelector(".total");
        total.textContent=`Total: ${listing["price"]}`;
        grand_total_amount+=parseInt(listing["price"]);
        quantity.onchange = () => {
            let value=quantity.value;
            if (parseInt(value)>parseInt(quantity.max)){
                value=quantity.max;
                quantity.value=value;
            }
            grand_total_amount-=parseInt(total.textContent.match(/^Total: (\d+)$/)[1]);
            total.textContent=`Total: ${listing["price"]*value}`;
            grand_total_amount+=parseInt(listing["price"]*value);
            grand_total.textContent=`Grand Total: ${grand_total_amount}`;
        }
        });
        fetches.push(fetch_promise);
        checkout_listings.append(child_element);
    });
    Promise.all(fetches).then(() => {
        grand_total.textContent=`Grand Total: ${grand_total_amount}`;
         const user_credits=checkout.querySelector(".user_credits");
         var user_credits_amount=null;
        fetch("/get_user_credits",{
            method:"POST",
            body:JSON.stringify({
                id:user_id
            })
        })
        .then(response => response.json())
        .then(data => {
            user_credits.textContent=`Your Credits: ${data["credits"]}`;
            user_credits_amount=parseInt(data["credits"]);
        });
        const cancel_button=checkout.querySelector("#cancel_purchase_button");
        cancel_button.onclick = () => {
            checkout.innerHTML="";
            const user_cart=document.querySelector("#user_cart");
            user_cart.style.display="block";
            checkout.style.display="none";
            const checkout_button=document.querySelector("#checkout_button");
            checkout_button.style.display="block";
            const header=document.querySelector("#header");
            header.textContent="Cart";
            header.style.display="block";
        };
        const purchase_button=checkout.querySelector("#purchase_button");
        purchase_button.onclick = () => {
            const transaction_failed=document.querySelector("#failed_transaction");
            transaction_failed.style.display="none";
            if (grand_total_amount>user_credits_amount){
                transaction_failed.style.display="block";
                return;
            }
            Array.from(checkout_listings.children).forEach(checkout_item => {
                const purchase_form=checkout_item.querySelector(".purchase_form");
                purchase_form.dispatchEvent(new Event('submit'));
            });
            load_cart();
        }
    });
}

function load_cart(){
    update_view("cart");
    const user_cart=document.querySelector("#user_cart");
    Array.from(user_cart.children).forEach(child => {
        if (child.id!=="cart_spinner"){
            child.remove();
        }
    });
    const spinner=user_cart.querySelector("#cart_spinner");
    spinner.style.display="block";
    setTimeout(() => {spinner.style.display="none";}, 1600);
    fetch("/load_cart", {
        method:"POST",
        body:JSON.stringify({
            id:user_id,
        })
    })
    .then(response => response.json())
    .then(data=> {
        const books=data["books"];
        books.forEach(book => {
            const isbn=book["book_isbn"];
            const listing_id=book["listing_id"];
            fetch("/book_result", {
                method:"POST",
                body:JSON.stringify({
                    isbn:isbn
                })
            })
            .then(response =>  response.json())
            .then(data => {
                const listing_book=data["result"]["items"][0]["volumeInfo"];
                const div_element=document.createElement("div");
                div_element.dataset.cart_id=book["id"];
                div_element.className="listing_book_result";
                const title=document.createElement("p");
                title.className="listing_book_title";
                title.textContent=listing_book["title"];
                const author=document.createElement("p");
                author.className="listing_book_author";
                author.textContent=`by ${listing_book["authors"]}`;
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
                    avg_rating_div.className="listing_book_rating_div";
                    const listing_book_ratings_bar_div=document.createElement("div");
                    listing_book_ratings_bar_div.className="listing_book_ratings_bar_div";
                    const listing_book_rating_bar=document.createElement("div");
                    listing_book_rating_bar.className="listing_book_rating_bar";
                    listing_book_rating_bar.classList.add("progress","progress-bar", "bg-warning");
                    listing_book_rating_bar.style.width=`${avg_rating*20}%`;
                    const listing_book_ratings_count_div=document.createElement('div');
                    listing_book_ratings_count_div.className="listing_book_ratings_count_div"
                    const listing_book_rating_info=document.createElement('div');
                    listing_book_rating_info.className="listing_book_rating_info";
                    listing_book_rating_info.textContent=`${avg_rating} (${ratings_count} ratings)`;
                    const listing_book_ratings_stars_div=document.createElement('div');
                    listing_book_ratings_stars_div.className="listing_book_ratings_stars_div";
                    listing_book_ratings_bar_div.append(listing_book_rating_bar);
                    for (let i=0;i<5;i++){
                        const star=document.createElement("div");
                        star.className="listing_book_ratings_star";
                        listing_book_ratings_stars_div.append(star);
                    }
                    listing_book_ratings_count_div.append(listing_book_rating_info);
                    avg_rating_div.append(listing_book_ratings_bar_div,listing_book_ratings_stars_div,listing_book_ratings_count_div);
                });
                const book_info=document.createElement("div");
                book_info.className="listing_book_info";
                const price=document.createElement("p");
                let cover_image_div=document.createElement("div");
                fetch("/get_listing", {
                    method:"POST",
                    body:JSON.stringify({
                        id:listing_id
                    })
                })
                .then(reponse => reponse.json())
                .then(data => {
                    const listing=data["listing"][0];
                    price.className="listing_book_price";
                price.textContent=`Price: ${listing["price"]} Credits`;
                const stock=document.createElement("p");
                stock.className="listing_book_stock";
                if (parseInt(listing["stock"])>1) {
                    stock.textContent=`${listing["stock"]} copies available`;
                }
                else{
                    stock.textContent=`${listing["stock"]} copy available`;
                }
                book_info.append(title,author,avg_rating_div, price, stock);
                book_info.onclick = () => {
                    window.location.href=`/codex/${isbn}/${listing_id}`;
                };
                cover_image_div.className="listing_book_cover_image_div";
                const cover_image=new Image();
                cover_image.className="listing_book_cover_image";
                try{
                    const image_link=listing_book["imageLinks"]["thumbnail"];
                    cover_image.src=image_link;
                    cover_image_div.append(cover_image);
                }
                catch{
                    return; //Remove this to stop omitting results with no images
                }
                const cart_button=document.createElement("button");
                cart_button.className="cart_button";
                cart_button.classList.add("btn", "btn-info");
                cart_button.innerHTML=`<i class="bi bi-cart-dash"></i> Remove From Cart`;
                cart_button.onclick = () => {
                    div_element.remove();
                    manage_cart(isbn, cart_button);
                };
                cover_image_div.append(cart_button);
                });
                div_element.append(cover_image_div);
                div_element.append(book_info);
                const checkbox=document.createElement("input");
                checkbox.type="checkbox";
                checkbox.className="check_cart_item";
                checkbox.value="";
                checkbox.onclick = () => {
                    if (checkbox.value){
                        checkbox.value="";
                    }
                    else{
                    checkbox.value=`${listing_id}`;
                    }
                }
                div_element.prepend(checkbox);
                user_cart.append(div_element);
                });
            });
        });
    history.pushState({view: "cart"}, "");
}

function load_listings(query=null, select=null){
    update_view("listings");
    fetch('/load_listings', {
        method:"POST",
        body:JSON.stringify({
            page:listing_page,
            query:query,
            select:select,
        })
    })
    .then(response => response.json())
    .then(data => {
        maximum_pages=data["maximum"]
        const listings=data["listings"];
        const listing_results=document.querySelector("#listing_results");
        listing_results.innerHTML="";
        const pagination_div=document.querySelector("#pagination_div");
        if (!listings || listings.length==0){
            listing_results.innerHTML="No results found";
            pagination_div.style.display='none';
            return;
        }
        if (listings.length<10 && listing_page===1){
            pagination_div.style.display='none';
        }
        else{
            manage_pagination(query,select);
        }
        listings.forEach(listing => {
            const isbn=listing["book_isbn"];
            fetch("/book_result", {
                method:"POST",
                body:JSON.stringify({
                    isbn:isbn
                })
            })
            .then(response =>  response.json())
            .then(data => {
                listing_book=data["result"]["items"][0]["volumeInfo"];
                const listing_id=listing["id"];
                const div_element=document.createElement("div");
                div_element.dataset.id=listing_id;
                div_element.className="listing_load_book_result";
                const title=document.createElement("p");
                title.className="listing_book_title";
                title.textContent=listing_book["title"];
                const author=document.createElement("p");
                author.className="listing_book_author";
                author.textContent=`by ${listing_book["authors"]}`;
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
                    avg_rating_div.className="listing_book_rating_div";
                    const listing_book_ratings_bar_div=document.createElement("div");
                    listing_book_ratings_bar_div.className="listing_book_ratings_bar_div";
                    const listing_book_rating_bar=document.createElement("div");
                    listing_book_rating_bar.className="listing_book_rating_bar";
                    listing_book_rating_bar.classList.add("progress","progress-bar", "bg-warning");
                    listing_book_rating_bar.style.width=`${avg_rating*20}%`;
                    const listing_book_ratings_count_div=document.createElement('div');
                    listing_book_ratings_count_div.className="listing_book_ratings_count_div"
                    const listing_book_rating_info=document.createElement('div');
                    listing_book_rating_info.className="listing_book_rating_info";
                    listing_book_rating_info.textContent=`${avg_rating} (${ratings_count} ratings)`;
                    const listing_book_ratings_stars_div=document.createElement('div');
                    listing_book_ratings_stars_div.className="listing_book_ratings_stars_div";
                    listing_book_ratings_bar_div.append(listing_book_rating_bar);
                    for (let i=0;i<5;i++){
                        const star=document.createElement("div");
                        star.className="listing_book_ratings_star";
                        listing_book_ratings_stars_div.append(star);
                    }
                    listing_book_ratings_count_div.append(listing_book_rating_info);
                    avg_rating_div.append(listing_book_ratings_bar_div,listing_book_ratings_stars_div,listing_book_ratings_count_div);
                });
                const book_info=document.createElement("div");
                book_info.className="listing_book_info";
                const price=document.createElement("p");
                price.className="listing_book_price";
                price.textContent=`Price: ${listing["price"]} Credits`;
                const stock=document.createElement("p");
                stock.className="listing_book_stock";
                if (parseInt(listing["stock"])>1) {
                    stock.textContent=`${listing["stock"]} copies available`;
                }
                else{
                    stock.textContent=`${listing["stock"]} copy available`;
                }
                book_info.append(title,author,avg_rating_div, price, stock);
                book_info.onclick = () => {
                    window.location.href=`/codex/${isbn}/${listing_id}`;
                };
                let cover_image_div=document.createElement("div");
                cover_image_div.className="listing_book_cover_image_div";
                const cover_image=new Image();
                cover_image.className="listing_book_cover_image";
                try{
                    const image_link=listing_book["imageLinks"]["thumbnail"];
                    cover_image.src=image_link;
                }
                catch{
                    return; //Remove this to stop omitting results with no images
                }
                cover_image_div.append(cover_image);
            if (user_status!=="no user"){
                if (user_status === true){
                    const update_listing_button=document.createElement("button");
                    update_listing_button.className="update_listing_button";
                    update_listing_button.classList.add("btn", "btn-info");
                    update_listing_button.innerHTML="Update Listing";
                    const delete_listing_button=document.createElement("button");
                    delete_listing_button.className="delete_listing_button";
                    delete_listing_button.classList.add("btn", "btn-danger");
                    delete_listing_button.innerHTML="Delete Listing";
                    cover_image_div.append(update_listing_button,delete_listing_button);
                    update_listing_button.onclick = () => manage_listing(listing_id, div_element,"update");
                    delete_listing_button.onclick = () => manage_listing(listing_id, div_element,"delete");
                }
                else{
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
                            manage_cart(isbn, cart_button, listing_id);
                        };
                        if (user_status===false){
                            cover_image_div.append(cart_button);
                        }
                        });
                }
                }
                div_element.append(cover_image_div);
                div_element.append(book_info);
                listing_results.append(div_element);
                });
            });
        });
        history.pushState({view: "listings"}, "");
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
function manage_listing(listing_id, listing_div=null, flag="update"){
    if (flag=="delete"){
        fetch("/delete_listing", {
            method:"POST",
            body:JSON.stringify({
                id:listing_id
            })
        })
        .then(response => response.json())
        .then(data => {
            listing_div.remove();
        });
    }
    else if (flag=="update"){
        const search_result=document.querySelector("#search_result");
        const listing_form=document.querySelector("#listing_form");
        search_result.style.display="grid";
        fetch('/get_listing', {
            method:"POST",
            body:JSON.stringify({
                id:listing_id
            })
        })
        .then(response =>  response.json())
        .then(data => {
            window.scrollTo(0,0);
            const listing_info=data["listing"][0];
            const isbn=listing_info["book_isbn"];
            listing_form.querySelector("#id_book_isbn").value=isbn;
            search_result.querySelector("#search_cover_image").src=listing_div.querySelector(".listing_book_cover_image").src;
            search_result.querySelector("#search_book_title").textContent=listing_div.querySelector(".listing_book_title").textContent;
            search_result.querySelector("#search_book_author").textContent=listing_div.querySelector(".listing_book_author").textContent;
            listing_form.querySelector("#id_price").value=listing_info["price"];
            listing_form.querySelector("#id_stock").value=listing_info["stock"];
            const listing_search_form=document.querySelector("#search_listing_form");
            listing_search_form.querySelector("#id_book_isbn").value=isbn;
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
                        stock:listing_form.querySelector("#id_stock").value,
                    })
                })
                .then(response => response.json())
                .then(data => {
                    updated_listing=data["listing"][0];
                    listing_search_form.reset();
                    listing_form.reset();
                    listing_div.querySelector(".listing_book_price").innerHTML=`Price: ${updated_listing["price"]} Credits`;
                    if (updated_listing["stock"] === 1){
                        listing_div.querySelector(".listing_book_stock").innerHTML=`${updated_listing["stock"]} copy available`;
                    }
                    else{
                        listing_div.querySelector(".listing_book_stock").innerHTML=`${updated_listing["stock"]} copies available`;
                    }
                });
                }
        });
    }
}
function search_listing(form){
    const query=form.querySelector("#id_book_isbn").value;
    const search_book_spinner=document.querySelector("#search_book_spinner");
    search_book_spinner.style.display="block";
    const listing_form=document.querySelector("#listing_form");
    const listing_search_form=document.querySelector("#search_listing_form");
    setTimeout(() => {search_book_spinner.style="none";}, 1800);
    fetch('/book_result', {
        method:"POST",
        body: JSON.stringify({
            isbn:query
        })
    })
    .then(response => response.json())
    .then(data => {
        let result=data["result"]["items"]
         if (!result || result.length==0){
            const no_result=document.querySelector("#no_search_result_alert");
            no_result.style.display="block";
            const close_result=document.querySelector("#close_no_result_alert");
            close_result.onclick = () => {
                no_result.style.display="none";
            }
            return;
        }
        result=result[0]["volumeInfo"];
        const search_result=document.querySelector("#search_result");
        search_result.style.display="grid";
        listing_form.querySelector("#id_book_isbn").value=query.trim();
        search_result.querySelector("#search_cover_image").src=result["imageLinks"]["thumbnail"];
        search_result.querySelector("#search_book_title").textContent=result["title"];
        search_result.querySelector("#search_book_author").textContent=`by ${result["authors"]}`;
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
                stock:listing_form.querySelector("#id_stock").value,
                title:result["title"],
                author:result["authors"],
                publisher:result["publisher"],
            })
        })
        .then(response => response.json())
        .then(data => {
            const listing_id=data["listing"][0]["id"];
            const isbn=listing_form.querySelector("#id_book_isbn").value;
            listing_search_form.reset();
            listing_form.reset();
            window.location.href=`/codex/${isbn}/${listing_id}`;
        });
        }
    });
}
