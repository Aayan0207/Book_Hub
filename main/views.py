from django.contrib.auth import authenticate, login, logout
from django.http import (
    JsonResponse,
)
from django.db import IntegrityError
from json import loads
from requests import get
from django.db.models import Avg, Count
from .models import *
from django.utils import timezone
from django.core.paginator import Paginator
from django.views.decorators.csrf import ensure_csrf_cookie
from re import search, IGNORECASE
from django.forms.models import model_to_dict

# Create your views here.


@ensure_csrf_cookie
def csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set"})


def user_exists(request):
    if request.method == "POST":
        data = loads(request.body)
        username = data["username"].capitalize()
        try:
            user = User.objects.get(username=username)
            return JsonResponse(
                {
                    "user": user.username,
                    "userId": user.id,  # type: ignore
                    "isUser": user.is_authenticated,
                    "isSuper": user.is_superuser,
                    "credits": user.credits,
                    "quote": user.quote,
                }
            )
        except User.DoesNotExist:
            return JsonResponse({"user": False})


def add_credits(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        amount = int(data["amount"])
        user = User.objects.get(id=user_id)
        user.credits += amount
        user.save()
        return JsonResponse({"credits": user.credits})


def update_quote(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        content = data["content"]
        user = User.objects.get(id=user_id)
        if user.quote != content:
            user.quote = content
            user.save()
        return JsonResponse({"content": user.quote})


def user_activity_info(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        reviews_count = (
            Review.objects.filter(user_id=user_id)
            .exclude(content="")
            .exclude(content=None)
            .count()
        )
        ratings_count = Review.objects.filter(user_id=user_id).exclude(rating=0).count()
        bookmarks_count = Bookmark.objects.filter(user_id=user_id).count()
        bookshelf_all_count = Bookshelf.objects.filter(user_id=user_id).count()
        bookshelf_read_count = Bookshelf.objects.filter(
            user_id=user_id, tag="Read"
        ).count()
        bookshelf_currently_reading_count = Bookshelf.objects.filter(
            user_id=user_id, tag="Currently Reading"
        ).count()
        bookshelf_want_to_read_count = Bookshelf.objects.filter(
            user_id=user_id, tag="Want To Read"
        ).count()
        activity = {
            "reviews_count": reviews_count,
            "ratings_count": ratings_count,
            "bookmarks_count": bookmarks_count,
            "bookshelf_all_count": bookshelf_all_count,
            "bookshelf_read_count": bookshelf_read_count,
            "bookshelf_currently_reading_count": bookshelf_currently_reading_count,
            "bookshelf_want_to_read_count": bookshelf_want_to_read_count,
        }
        return JsonResponse({"activity": activity})


def random_reviews(request):
    if request.method == "POST":
        reviews = list(
            Review.objects.select_related("user_id")
            .select_related("id")
            .exclude(content="")
            .exclude(content=None)
            .annotate(likes_count=Count("like"))
            .order_by("?")
            .values(
                "id",
                "book_isbn",
                "rating",
                "content",
                "timestamp",
                "user_id__username",
                "user_id",
                "likes_count",
            )
        )[:30]
        return JsonResponse({"reviews": reviews})


def load_bookmark_reviews(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        bookmarks = (
            Bookmark.objects.select_related("bookmark_id")
            .filter(user_id=user_id)
            .values("bookmark_id")
        )
        reviews = list(
            Review.objects.select_related("user_id")
            .select_related("id")
            .filter(user_id__in=bookmarks)
            .annotate(likes_count=Count("like"))
            .order_by("-timestamp")
            .values(
                "id",
                "book_isbn",
                "rating",
                "content",
                "timestamp",
                "user_id__username",
                "user_id",
                "likes_count",
            )
        )[:30]
        return JsonResponse({"reviews": reviews})


def update_bookmark(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["user_id"]
        profile_id = data["profile_id"]
        bookmark = Bookmark.objects.filter(user_id=user_id, bookmark_id=profile_id)
        if bookmark.exists():
            bookmark.delete()
            return JsonResponse({"bookmark": False})
        else:
            user = User.objects.get(id=user_id)
            profile = User.objects.get(id=profile_id)
            Bookmark.objects.create(user_id=user, bookmark_id=profile)
            return JsonResponse({"bookmark": True})


def user_bookmarked(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["user_id"]
        profile_id = data["profile_id"]
        bookmark = Bookmark.objects.filter(user_id=user_id, bookmark_id=profile_id)
        return JsonResponse({"bookmark": bookmark.exists()})


def manage_admin_donation(request):
    if request.method == "POST":
        data = loads(request.body)
        donation_id = data["id"]
        donation = Donate.objects.get(id=donation_id)
        status = bool(data["status"])
        user = User.objects.get(id=donation.user_id.id)  # type: ignore
        if status:
            Invoice.objects.create(
                user_id=user,
                book_isbn=donation.book_isbn,
                quantity=donation.quantity,
                transaction_amount=donation.quantity,
                transaction_type="sale",
            )
            user.credits += donation.quantity
            user.save()
        else:
            Invoice.objects.create(
                user_id=user,
                book_isbn=donation.book_isbn,
                quantity=donation.quantity,
                transaction_amount=0,
                transaction_type="sale",
            )
        donation.delete()
        return JsonResponse({"donation": "managed"})


def load_admin_donations(request):
    if request.method == "POST":
        data = loads(request.body)
        page = data["page"]
        donations = list(
            Donate.objects.select_related("user_id")
            .order_by("-timestamp")
            .values("id", "book_isbn", "quantity", "timestamp", "user_id__username")
        )
        donations = Paginator(donations, 10).page(page)
        return JsonResponse(
            {"donations": donations.object_list, "next": donations.has_next()}
        )


def load_donations(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        page = data.get("page", 1)
        donations = list(
            Donate.objects.filter(user_id=user_id)
            .order_by("-timestamp")
            .values("id", "book_isbn", "quantity", "timestamp")
        )
        donations = Paginator(donations, 10).page(page)
        return JsonResponse(
            {"donations": donations.object_list, "next": donations.has_next()}
        )


def update_donation(request):
    if request.method == "POST":
        data = loads(request.body)
        delete = data.get("delete", False)
        donation_id = data.get("donation_id", None)
        quantity = int(data.get("quantity", 0))
        if donation_id:
            donation = Donate.objects.get(id=donation_id)
            if delete:
                donation.delete()
                return JsonResponse({"donation": None})
            if donation.quantity != quantity:
                donation.quantity = quantity
                donation.save()
            return JsonResponse(
                {
                    "donation": {
                        "id": donation.id,
                        "book_isbn": donation.book_isbn,
                        "quantity": donation.quantity,
                        "timestamp": donation.timestamp,
                    }
                }
            )

        user_id = data["id"]
        book_isbn = data["isbn"]
        user = User.objects.get(id=user_id)
        donation = Donate.objects.create(
            user_id=user, book_isbn=book_isbn, quantity=quantity
        )
        return JsonResponse(
            {
                "donation": {
                    "id": donation.id,
                    "book_isbn": donation.book_isbn,
                    "quantity": donation.quantity,
                    "timestamp": donation.timestamp,
                }
            }
        )


def get_user_invoices(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        page = data["page"]
        invoices = list(
            Invoice.objects.filter(user_id=user_id)
            .order_by("-timestamp")
            .values(
                "id",
                "book_isbn",
                "quantity",
                "transaction_amount",
                "transaction_type",
                "timestamp",
            )
        )
        invoices = Paginator(invoices, 10).page(page)
        return JsonResponse(
            {"invoices": invoices.object_list, "next": invoices.has_next()}
        )


def purchase_listing(request):
    if request.method == "POST":
        data = loads(request.body)
        listing_id = data["listing_id"]
        listing = Listing.objects.get(id=listing_id)
        quantity = min(int(data["quantity"]), listing.stock)
        amount = listing.price * quantity
        user_id = data["user_id"]
        user = User.objects.get(id=user_id)
        if user.credits >= amount:
            user.credits -= amount
            user.save()
            Invoice.objects.create(
                user_id=user,
                book_isbn=listing.book_isbn,
                quantity=quantity,
                transaction_amount=amount,
                transaction_type="purchase",
            )
            listing.stock -= quantity
            listing.save()
            if listing.stock == 0:
                listing.delete()
            return JsonResponse({"transaction": True, "credits": user.credits})
        return JsonResponse({"transaction": False})


def load_cart(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        page = data.get("page", 1)
        cart_books = list(
            Cart.objects.select_related("listing_id")
            .filter(user_id=user_id)
            .order_by("-timestamp")
            .values(
                "id",
                "book_isbn",
                "listing_id",
                "listing_id__price",
                "listing_id__stock",
            )
        )
        cart_books = Paginator(cart_books, 10).page(page)
        return JsonResponse(
            {"books": cart_books.object_list, "next": cart_books.has_next()}
        )


def update_cart(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        book_isbn = data["isbn"]
        listing_id = data.get("listing_id", None)
        user = User.objects.get(id=user_id)
        try:
            book_cart = Cart.objects.get(user_id=user_id, book_isbn=book_isbn)
            book_cart.delete()
            return JsonResponse({"status": False})
        except Cart.DoesNotExist:
            listing = Listing.objects.get(id=listing_id)
            Cart.objects.create(user_id=user, book_isbn=book_isbn, listing_id=listing)
            return JsonResponse({"status": True})


def in_cart(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        book_isbn = data["isbn"]
        book_cart = Cart.objects.filter(user_id=user_id, book_isbn=book_isbn)
        return JsonResponse({"status": book_cart.exists()})


def get_listing(request):
    if request.method == "POST":
        data = loads(request.body)
        listing_id = data["id"]
        listing = list(
            Listing.objects.filter(id=listing_id).values(
                "id", "book_isbn", "price", "stock", "timestamp"
            )
        )
        return JsonResponse({"listing": listing})


def load_listings(request):
    if request.method == "POST":
        data = loads(request.body)
        query = data.get("query", "")
        select = data.get("select", None)
        if select:
            select = select.lower()
        page = data["page"]
        listings = list(
            Listing.objects.all()
            .exclude(stock=0)
            .order_by("book_isbn")
            .values(
                "id",
                "title",
                "author",
                "publisher",
                "book_isbn",
                "price",
                "stock",
                "timestamp",
            )
        )
        if select == "title":
            listings = list(
                filter(
                    lambda x: search(rf"\w*{query}\w*", x["title"], IGNORECASE),
                    listings,
                )
            )
        elif select == "isbn":
            listings = list(
                filter(
                    lambda x: search(rf"^{query}$", x["book_isbn"], IGNORECASE),
                    listings,
                )
            )
        elif select == "author":
            listings = list(
                filter(
                    lambda x: search(
                        rf"\w*{query}\w*",
                        " ".join(
                            [
                                author.strip(" '")
                                for author in x["author"][2:-2].split(",")
                            ]
                        ),
                        IGNORECASE,
                    ),
                    listings,
                )
            )
        elif select == "publisher":
            listings = list(
                filter(
                    lambda x: search(rf"\w*{query}\w*", x["publisher"], IGNORECASE),
                    listings,
                )
            )
        listings = Paginator(listings, 10)
        maximum = listings.num_pages
        listings = listings.page(page)
        return JsonResponse({"listings": listings.object_list, "maximum": maximum})


def update_listing(request):
    if request.method == "POST":
        data = loads(request.body)
        isbn = data["isbn"]
        delete = data.get("delete", False)
        if delete:
            listing = Listing.objects.get(book_isbn=isbn)
            listing.delete()
            return JsonResponse({"listing": "deleted"})
        price = int(data["price"])
        stock = int(data["stock"])
        librarian_id = data.get("librarian_id", None)
        if librarian_id:
            librarian_id = int(librarian_id)
        try:
            listing = Listing.objects.get(book_isbn=isbn)
            if price != listing.price:
                listing.price = price
            if stock != listing.stock:
                listing.stock = stock
            listing.save()
        except Listing.DoesNotExist:
            title = data["title"]
            author = data["author"]
            publisher = data["publisher"]
            librarian = User.objects.get(id=librarian_id)
            if librarian_id:
                listing = Listing.objects.create(
                    librarian_id=librarian,
                    book_isbn=isbn,
                    stock=stock,
                    price=price,
                    title=title,
                    author=author,
                    publisher=publisher,
                )
        return JsonResponse({"listing": model_to_dict(listing)})  # type: ignore


def get_user_reviews(request):
    if request.method == "POST":
        data = loads(request.body)
        page = data["page"]
        try:  # Remove this
            user = data["username"]
            user_id = User.objects.get(username=user)
        except:
            user_id = data["id"]
        reviews = list(
            Review.objects.select_related("user_id")
            .select_related("id")
            .filter(user_id=user_id)
            .annotate(likes_count=Count("like"))
            .order_by("-timestamp")
            .values(
                "id",
                "book_isbn",
                "user_id",
                "rating",
                "content",
                "timestamp",
                "user_id__username",
                "likes_count",
            )
        )
        reviews = Paginator(reviews, 10).page(page)
        return JsonResponse(
            {"reviews": reviews.object_list, "next": reviews.has_next()}
        )


def get_book_rating(request):
    if request.method == "POST":
        data = loads(request.body)
        book_isbn = data["isbn"]
        ratings = Review.objects.filter(book_isbn=book_isbn)
        ratings = ratings.exclude(rating=0)
        ratings_count = ratings.count()
        avg_rating = ratings.aggregate(Avg("rating"))
        if not avg_rating["rating__avg"]:
            avg_rating["rating__avg"] = 0
        return JsonResponse(
            {
                "avg_rating": round(avg_rating["rating__avg"], 2),
                "ratings_count": ratings_count,
            }
        )


def update_rating(request):
    if request.method == "POST":
        data = loads(request.body)
        book_isbn = data["isbn"]
        user_id = data["user_id"]
        new_rating = int(data["rating"])
        user = User.objects.get(id=user_id)
        try:
            user_rating = Review.objects.get(user_id=user_id, book_isbn=book_isbn)
            if user_rating.rating != new_rating:
                user_rating.rating = new_rating
                user_rating.save()
        except Review.DoesNotExist:
            user_rating = Review.objects.create(
                user_id=user, book_isbn=book_isbn, rating=new_rating
            )
        return JsonResponse({"rating": user_rating.rating})


def update_like(request):
    if request.method == "POST":
        data = loads(request.body)
        review_id = data["review_id"]
        user_id = data["user_id"]
        like = Like.objects.filter(review_id=review_id, user_id=user_id)
        if like.exists():
            like.delete()
            return JsonResponse({"liked": False})
        else:
            user = User.objects.get(id=user_id)
            review = Review.objects.get(id=review_id)
            Like.objects.create(user_id=user, review_id=review)
            return JsonResponse({"liked": True})


def user_liked(request):
    if request.method == "POST":
        data = loads(request.body)
        review_id = data["review_id"]
        user_id = data["user_id"]
        like = Like.objects.filter(review_id=review_id, user_id=user_id)
        return JsonResponse({"liked": like.exists()})


def get_book_reviews(request):
    if request.method == "POST":
        data = loads(request.body)
        isbn = data["isbn"]
        page = data["page"]
        user_id = data.get("user_id", None)
        flag = data["flag"].lower()
        user_reviewed = False
        reviews = (
            Review.objects.select_related("user_id")
            .select_related("id")
            .annotate(likes_count=Count("like"))
            .filter(book_isbn=isbn)
            .exclude(content="")
        )
        if flag == "highest rated":
            reviews = reviews.order_by("-rating")
        elif flag == "lowest rated":
            reviews = reviews.order_by("rating")
        elif flag == "latest":
            reviews = reviews.order_by("-timestamp")
        elif flag == "oldest":
            reviews = reviews.order_by("timestamp")
        elif flag == "most liked":
            reviews = reviews.order_by("-likes_count")
        reviews = list(
            reviews.values(
                "user_id",
                "user_id__username",
                "rating",
                "content",
                "timestamp",
                "likes_count",
                "id",
            )
        )
        if user_id:
            try:
                user_review = list(
                    Review.objects.select_related("user_id")
                    .select_related("id")
                    .filter(book_isbn=isbn, user_id=user_id)
                    .exclude(content="")
                    .annotate(likes_count=Count("like"))
                    .values(
                        "user_id",
                        "user_id__username",
                        "rating",
                        "content",
                        "timestamp",
                        "likes_count",
                        "id",
                    )
                )
                if user_review:
                    reviews.remove(user_review[0])  # type: ignore
                    reviews.insert(0, user_review[0])  # type: ignore
                    user_reviewed = True
            except Review.DoesNotExist:
                pass
        reviews = Paginator(reviews, 10).page(page)
        return JsonResponse(
            {
                "reviews": reviews.object_list,
                "next": reviews.has_next(),
                "user_reviewed": user_reviewed,
            }
        )


def get_user_rating(request):
    if request.method == "POST":
        data = loads(request.body)
        book_isbn = data["isbn"]
        user_id = data["user_id"]
        try:
            rating = Review.objects.get(user_id=user_id, book_isbn=book_isbn)
            return JsonResponse({"rating": rating.rating})
        except Review.DoesNotExist:
            return JsonResponse({"rating": None})


def get_bookshelf(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["user_id"]
        shelf = data["shelf"].lower()
        page = data["page"]
        limit = 30
        query = []
        if shelf == "all":
            query = (
                Bookshelf.objects.filter(user_id=user_id)
                .order_by("timestamp")
                .values("book_isbn", "tag")
            )
        elif shelf == "read":
            query = (
                Bookshelf.objects.filter(user_id=user_id, tag="Read")
                .order_by("timestamp")
                .values("book_isbn", "tag")
            )
        elif shelf == "currently reading":
            query = (
                Bookshelf.objects.filter(user_id=user_id, tag="Currently Reading")
                .order_by("timestamp")
                .values("book_isbn", "tag")
            )
        elif shelf == "want to read":
            query = (
                Bookshelf.objects.filter(user_id=user_id, tag="Want To Read")
                .order_by("timestamp")
                .values("book_isbn", "tag")
            )
        query = Paginator(list(query), limit).page(page)
        return JsonResponse({"bookshelf": query.object_list, "next": query.has_next()})  # type: ignore


def manage_review(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["user_id"]
        isbn = data["isbn"]
        delete = data.get("delete", False)

        if delete:
            review = Review.objects.get(user_id=user_id, book_isbn=isbn)
            review.content = ""
            review.timestamp = None
            review.save()
            return JsonResponse({"deleted": True})

        content = data["content"]

        try:
            user_review = Review.objects.get(user_id=user_id, book_isbn=isbn)
            if not user_review.timestamp:
                user_review.timestamp = timezone.localtime()
            if user_review.content != content:
                user_review.content = content
            user_review.save()

        except Review.DoesNotExist:
            user = User.objects.get(id=user_id)
            user_review = Review.objects.create(
                user_id=user,
                book_isbn=isbn,
                content=content,
                timestamp=timezone.localtime(),
            )

        return JsonResponse(
            {"review": {**model_to_dict(user_review), "user_id__username": None}}
        )


def update_bookshelf(request):
    if request.method == "POST":
        data = loads(request.body)
        book_isbn = data["isbn"]
        user_id = data["user_id"]
        action = data["action"]
        book_in_shelf = Bookshelf.objects.filter(user_id=user_id, book_isbn=book_isbn)
        if book_in_shelf.exists():
            book_in_shelf.delete()
            return JsonResponse({"in_bookshelf": False})
        if not action:
            return JsonResponse({"in_bookshelf": None})
        user = User.objects.get(id=int(user_id))
        Bookshelf.objects.create(user_id=user, book_isbn=book_isbn, tag=action.title())
        return JsonResponse({"in_bookshelf": True})


def in_bookshelf(request):
    if request.method == "POST":
        data = loads(request.body)
        book_isbn = data["isbn"]
        user_id = data["user_id"]
        shelf = Bookshelf.objects.filter(user_id=user_id, book_isbn=book_isbn)
        return JsonResponse({"in_bookshelf": shelf.exists()})


def book_result(request):
    if request.method == "POST":
        data = loads(request.body)
        book_isbn = data["isbn"]
        query = rf"https://www.googleapis.com/books/v1/volumes?q=isbn:{book_isbn}&projection=full"
        result = get(query).json()
        return JsonResponse({"result": result})


def book_results(request):
    if request.method == "POST":
        data = loads(request.body)
        query = data["query"]
        select = data["select"]

        query = data["query"].replace(" ", "+")
        select = data["select"].lower().replace(" ", "+")
        page = (int(data["page"]) - 1) * 10
        if select == "title":
            query = rf"https://www.googleapis.com/books/v1/volumes?q=intitle:{query}&printType=books&startIndex={page}"
        elif select == "isbn":
            query = rf"https://www.googleapis.com/books/v1/volumes?q=isbn:{query}&printType=books&startIndex={page}"
        elif select == "author":
            query = rf"https://www.googleapis.com/books/v1/volumes?q=inauthor:{query}&printType=books&startIndex={page}"
        elif select == "publisher":
            query = rf"https://www.googleapis.com/books/v1/volumes?q=inpublisher:{query}&printType=books&startIndex={page}"
        elif select == "subject":
            query = rf"https://www.googleapis.com/books/v1/volumes?q=subject:{query}&printType=books&startIndex={page}"
        results = get(query).json()
        return JsonResponse({"results": results})


def login_view(request):
    if request.method == "POST":

        data = loads(request.body)
        username = data["username"]
        password = data["password"]
        request_from = "react"

        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)
            user = User.objects.get(username=username)  # type: ignore
            return JsonResponse(
                {
                    "user": username,
                    "userId": user.id,  # type: ignore
                    "isUser": user.is_authenticated,
                    "isSuper": user.is_superuser,
                    "credits": user.credits,
                    "quote": user.quote,
                }
            )
        else:
            return JsonResponse({"message": "Invalid username and/or password"})


def logout_view(request):
    logout(request)
    return JsonResponse({"message": "Logged Out"})


def register(request):
    if request.method == "POST":
        data = loads(request.body)
        username = data["username"]
        email = data["email"]
        password = data["password"]
        confirmation = data["confirmation"]
        if password != confirmation:
            return JsonResponse({"message": "Passwords must match"})
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return JsonResponse({"message": "Username already taken"})
        login(request, user)
        user = User.objects.get(username=username)  # type: ignore
        return JsonResponse(
            {
                "user": username,
                "userId": user.id,  # type: ignore
                "isUser": user.is_authenticated,
                "isSuper": user.is_superuser,
                "credits": user.credits,
                "quote": user.quote,
            }
        )
