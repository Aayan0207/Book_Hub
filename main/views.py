from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.http import (
    HttpResponse,
    HttpResponseRedirect,
    JsonResponse,
    HttpResponseNotFound,
)
from django.urls import reverse
from django.db import IntegrityError
from django import forms
from json import loads
from requests import get
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Avg
from .models import *
from django.utils import timezone
from django.core.paginator import Paginator
from django.views.decorators.csrf import ensure_csrf_cookie
from re import search, IGNORECASE


# Create your views here.
class ListingSearchForm(forms.Form):
    select = forms.ChoiceField(
        choices=[
            ("title", "Title"),
            ("author", "Author"),
            ("isbn", "ISBN"),
            ("publisher", "Publisher"),
        ],
        widget=forms.Select,
        label="",
    )
    query = forms.CharField(
        label="", widget=forms.TextInput(attrs={"autocomplete": "off"})
    )


class SearchBookForm(forms.Form):
    select = forms.ChoiceField(
        choices=[
            ("title", "Title"),
            ("author", "Author"),
            ("isbn", "ISBN"),
            ("publisher", "Publisher"),
            ("subject", "Category"),
        ],
        widget=forms.Select,
        label="",
    )
    query = forms.CharField(
        label="", widget=forms.TextInput(attrs={"autocomplete": "off"})
    )


class ReviewForm(forms.Form):
    content = forms.CharField(label="", widget=forms.Textarea)


class ListingFormSearch(forms.Form):
    book_isbn = forms.CharField(
        label="ISBN",
        max_length=13,
        widget=forms.TextInput(attrs={"autocomplete": "off"}),
    )


class DonateFormSearch(forms.Form):
    book_isbn = forms.CharField(
        label="ISBN",
        max_length=13,
        widget=forms.TextInput(attrs={"autocomplete": "off"}),
    )


class ListingForm(forms.Form):
    price = forms.IntegerField(label="Price (Credits)", min_value=1, max_value=100000)
    stock = forms.IntegerField(label="Stock", min_value=1, max_value=10000)
    book_isbn = forms.CharField(
        label="ISBN", max_length=13, widget=forms.TextInput(attrs={"readonly": True})
    )


class CreditsForm(forms.Form):
    credit_amount = forms.IntegerField(
        label="Add Credits", min_value=1, max_value=10000
    )


class DonateForm(forms.Form):
    quantity = forms.IntegerField(label="Quantity", min_value=1, max_value=100)
    book_isbn = forms.CharField(
        label="ISBN",
        max_length=13,
        widget=forms.TextInput(attrs={"readonly": True, "autocomplete": "off"}),
    )


class PurchaseForm(forms.Form):
    price = forms.IntegerField(
        label="Price per book (Credits)",
        min_value=1,
        max_value=100000,
        widget=forms.TextInput(attrs={"readonly": True, "autocomplete": "off"}),
    )
    quantity = forms.IntegerField(label="Quantity", min_value=1, max_value=10000)
    book_isbn = forms.CharField(
        label="ISBN",
        max_length=13,
        widget=forms.TextInput(attrs={"readonly": True, "autocomplete": "off"}),
    )


class BookmarkSearch(forms.Form):
    username = forms.CharField(max_length=255)


class QuoteForm(forms.Form):
    quote = forms.CharField(label="", max_length=2000, widget=forms.Textarea)


@ensure_csrf_cookie
def csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set"})

def user(request, profile):
    try:
        user = User.objects.get(username=profile)
        return render(
            request,
            "main/user.html",
            {"profile": profile, "add_review_form": ReviewForm()},
        )
    except User.DoesNotExist:
        return HttpResponseNotFound(
            f'<html lang="en"><body><div align="center"><h1>User {profile} Not Found</h1></div></body></html>'
        )


def user_exists(request):
    if request.method == "POST":
        data = loads(request.body)
        username = data["username"].capitalize()
        try:
            user = list(User.objects.filter(username=username).values("id", "username"))
            return JsonResponse({"user": user})
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


@csrf_exempt
def get_quote(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        user = User.objects.get(id=user_id)
        return JsonResponse({"quote": user.quote})


def update_quote(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        content = data["content"]
        user = User.objects.get(id=user_id)
        if user.quote != content:
            user.quote = content
            user.save()
        return JsonResponse({"content": User.objects.get(id=user_id).quote})


@csrf_exempt
def delete_quote(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        user = User.objects.get(id=user_id)
        user.quote = ""
        user.save()
        return JsonResponse({"content": "deleted"})


@csrf_exempt
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


@csrf_exempt
def random_reviews(request):
    if request.method == "POST":
        reviews = list(
            Review.objects.select_related("user_id")
            .exclude(content="")
            .exclude(content=None)
            .order_by("?")
            .values(
                "id",
                "book_isbn",
                "rating",
                "content",
                "timestamp",
                "user_id__username",
                "user_id",
            )
        )[:30]
        return JsonResponse({"reviews": reviews})


@csrf_exempt
def load_bookmarks(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        bookmarks = list(
            Bookmark.objects.select_related("bookmark_id")
            .filter(user_id=user_id)
            .order_by("?")
            .values("id", "bookmark_id", "bookmark_id__username")
        )[:10]
        return JsonResponse({"bookmarks": bookmarks})


@csrf_exempt
def update_bookmark(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["user_id"]
        profile_id = data["profile_id"]
        try:
            bookmark = Bookmark.objects.get(user_id=user_id, bookmark_id=profile_id)
            bookmark.delete()
            return JsonResponse({"bookmark": False})
        except Bookmark.DoesNotExist:
            user = User.objects.get(id=user_id)
            profile = User.objects.get(id=profile_id)
            Bookmark.objects.create(user_id=user, bookmark_id=profile)
            return JsonResponse({"bookmark": True})


@csrf_exempt
def user_bookmarked(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["user_id"]
        profile_id = data["profile_id"]
        try:
            bookmark = Bookmark.objects.get(user_id=user_id, bookmark_id=profile_id)
            return JsonResponse({"bookmark": True})
        except Bookmark.DoesNotExist:
            return JsonResponse({"bookmark": False})


@csrf_exempt
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


@csrf_exempt
def delete_donation(request):
    if request.method == "POST":
        data = loads(request.body)
        donation_id = data["id"]
        Donate.objects.get(id=donation_id).delete()
        return JsonResponse({"donation": None})


@csrf_exempt
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
        next_page = donations.has_next()
        return JsonResponse({"donations": donations.object_list, "next": next_page})


@csrf_exempt
def load_donations(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        donations = list(
            Donate.objects.filter(user_id=user_id)
            .order_by("timestamp")
            .values("id", "book_isbn", "quantity", "timestamp")
        )
        return JsonResponse({"donations": donations})


def update_donation(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        book_isbn = data["isbn"]
        quantity = data["quantity"]
        try:
            donation = Donate.objects.get(user_id=user_id, book_isbn=book_isbn)
            if donation.quantity != quantity:
                donation.quantity = quantity
                donation.save()
            donation = list(
                Donate.objects.filter(user_id=user_id, book_isbn=book_isbn).values(
                    "id", "book_isbn", "quantity", "timestamp"
                )
            )
            return JsonResponse({"donation": donation})
        except Donate.DoesNotExist:
            user = User.objects.get(id=user_id)
            Donate.objects.create(user_id=user, book_isbn=book_isbn, quantity=quantity)
            donation = list(
                Donate.objects.filter(user_id=user_id, book_isbn=book_isbn).values(
                    "id", "book_isbn", "quantity", "timestamp"
                )
            )
            return JsonResponse({"donation": donation})


@csrf_exempt
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
        invoices = Paginator(invoices, 10)
        invoices = invoices.page(page)
        next_page = invoices.has_next()
        return JsonResponse({"invoices": invoices.object_list, "next": next_page})


@csrf_exempt
def get_user_credits(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        user = User.objects.get(id=user_id)
        return JsonResponse({"credits": user.credits})


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
            return JsonResponse({"transaction": True})
        return JsonResponse({"transaction": False})


@csrf_exempt
def load_cart(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        cart_books = list(
            Cart.objects.filter(user_id=user_id)
            .order_by("timestamp")
            .values("id", "book_isbn", "listing_id")
        )
        return JsonResponse(
            {
                "books": cart_books,
            }
        )


@csrf_exempt
def update_cart(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        book_isbn = data["isbn"]
        try:
            listing_id = data["listing_id"]
        except:
            listing_id = None
        user = User.objects.get(id=user_id)
        try:
            book_cart = Cart.objects.get(user_id=user_id, book_isbn=book_isbn)
            book_cart.delete()
            return JsonResponse({"status": False})
        except Cart.DoesNotExist:
            listing = Listing.objects.get(id=listing_id)
            Cart.objects.create(user_id=user, book_isbn=book_isbn, listing_id=listing)
            return JsonResponse({"status": True})


@csrf_exempt
def in_cart(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        book_isbn = data["isbn"]
        try:
            book_cart = Cart.objects.get(user_id=user_id, book_isbn=book_isbn)
            return JsonResponse({"status": True})
        except Cart.DoesNotExist:
            return JsonResponse({"status": False})


@csrf_exempt
def get_listing(request):
    if request.method == "POST":
        data = loads(request.body)
        try:
            listing_id = data["id"]
            listing = list(
                Listing.objects.filter(id=listing_id).values(
                    "id", "book_isbn", "price", "stock", "timestamp"
                )
            )
        except:
            isbn=data["isbn"]
            listing = list(
                Listing.objects.filter(book_isbn=isbn).values(
                    "id", "book_isbn", "price", "stock", "timestamp"
                )
            )
        return JsonResponse({"listing": listing})


@csrf_exempt
def delete_listing(request):
    if request.method == "POST":
        data = loads(request.body)
        listing_id = data["id"]
        listing = Listing.objects.get(id=listing_id)
        listing.delete()
        return JsonResponse({"listing": "deleted"})


@csrf_exempt
def user_status(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["id"]
        if user_id:
            user_status = User.objects.get(id=user_id).is_superuser
            return JsonResponse({"status": user_status})
        return JsonResponse({"status": "no user"})


@csrf_exempt
def load_listings(request):
    if request.method == "POST":
        data = loads(request.body)
        query = data["query"]
        if query:
            query = query.strip()
        select = data["select"]
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
        price = int(data["price"])
        stock = int(data["stock"])
        try:
            librarian_id = int(data["librarian_id"])
        except:
            librarian_id = None
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
                Listing.objects.create(
                    librarian_id=librarian,
                    book_isbn=isbn,
                    stock=stock,
                    price=price,
                    title=title,
                    author=author,
                    publisher=publisher,
                )
        listing = list(
            Listing.objects.filter(book_isbn=isbn).values(
                "id",
                "book_isbn",
                "price",
                "stock",
                "timestamp",
                "title",
                "author",
                "publisher",
            )
        )
        return JsonResponse({"listing": listing})


@csrf_exempt
def get_user_reviews(request):
    if request.method == "POST":
        data = loads(request.body)
        user = data["username"]
        page = data["page"]
        user_id = User.objects.get(username=user)
        reviews = list(
            Review.objects.filter(user_id=user_id)
            .order_by("-timestamp")
            .exclude(content=None, rating=0)
            .values(
                "user_id__username", "rating", "content", "timestamp", "id", "book_isbn"
            )
        )
        reviews = Paginator(reviews, 10)
        reviews = reviews.page(page)
        next_page = reviews.has_next()
        return JsonResponse({"reviews": reviews.object_list, "next": next_page})


@csrf_exempt
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


@csrf_exempt
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
            Review.objects.create(user_id=user, book_isbn=book_isbn, rating=new_rating)
        return JsonResponse({"rating": "Updated"})


@csrf_exempt
def get_review_likes(request):
    if request.method == "POST":
        data = loads(request.body)
        review_id = data["review_id"]
        review_likes = Like.objects.filter(review_id=review_id).count()
        return JsonResponse({"like_count": review_likes})


@csrf_exempt
def update_like(request):
    if request.method == "POST":
        data = loads(request.body)
        review_id = data["review_id"]
        user_id = data["user_id"]
        try:
            like = Like.objects.get(review_id=review_id, user_id=user_id)
            like.delete()
            return JsonResponse({"liked": False})
        except Like.DoesNotExist:
            user = User.objects.get(id=user_id)
            review = Review.objects.get(id=review_id)
            Like.objects.create(user_id=user, review_id=review)
            return JsonResponse({"liked": True})


@csrf_exempt
def user_liked(request):
    if request.method == "POST":
        data = loads(request.body)
        review_id = data["review_id"]
        user_id = data["user_id"]
        try:
            if Like.objects.get(review_id=review_id, user_id=user_id):
                return JsonResponse({"liked": True})
        except Like.DoesNotExist:
            return JsonResponse({"liked": False})


@csrf_exempt
def delete_review(request):
    if request.method == "POST":
        data = loads(request.body)
        book_isbn = data["isbn"]
        user_id = data["user_id"]
        try:
            review = Review.objects.get(user_id=user_id, book_isbn=book_isbn)
            review.content = ""
            review.timestamp = None
            review.save()
            for like in Like.objects.filter(review_id=review.id):
                like.delete()
            return JsonResponse({"deleted": True})
        except Review.DoesNotExist:
            return JsonResponse({"deleted": False})


@csrf_exempt
def get_book_reviews(request):
    if request.method == "POST":
        data = loads(request.body)
        isbn = data["isbn"]
        page = data["page"]
        user_id = data["user_id"]
        flag = data["flag"].lower()
        reviews = (
            Review.objects.select_related("user_id")
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
            reviews = list(
                reviews.values(
                    "user_id",
                    "user_id__username",
                    "rating",
                    "content",
                    "timestamp",
                    "id",
                )
            )
            reviews.sort(
                key=lambda x: Like.objects.filter(review_id=x["id"]).count(),
                reverse=True,
            )
        if flag != "most liked":
            reviews = list(
                reviews.values(  # type: ignore
                    "user_id",
                    "user_id__username",
                    "rating",
                    "content",
                    "timestamp",
                    "id",
                )
            )
        if user_id:
            try:
                user_review = list(
                    Review.objects.select_related("user_id")
                    .filter(book_isbn=isbn, user_id=user_id)
                    .exclude(content="")
                    .values(
                        "user_id",
                        "user_id__username",
                        "rating",
                        "content",
                        "timestamp",
                        "id",
                    )
                )
                if user_review:
                    reviews.remove(user_review[0])  # type: ignore
                    reviews.insert(0, user_review[0])  # type: ignore
            except Review.DoesNotExist:
                pass
        reviews = Paginator(reviews, 10)
        reviews = reviews.page(page)
        next_page = reviews.has_next()
        return JsonResponse({"reviews": reviews.object_list, "next": next_page})


@csrf_exempt
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


@csrf_exempt
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
        query = list(query)
        query = Paginator(query, limit)
        query = query.page(page)
        next_page = query.has_next()
        return JsonResponse({"bookshelf": query.object_list, "next": next_page})  # type: ignore


def manage_review(request):
    if request.method == "POST":
        data = loads(request.body)
        user_id = data["user_id"]
        isbn = data["isbn"]
        form_result = ReviewForm(data)
        if form_result.is_valid():
            content = form_result.cleaned_data["content"]
            try:
                user_review = Review.objects.get(user_id=user_id, book_isbn=isbn)
                if not user_review.timestamp:
                    user_review.timestamp = timezone.localtime()
                    user_review.save()
                if user_review.content != content:
                    user_review.content = content
                    user_review.save()
                review_id = user_review.id
            except Review.DoesNotExist:
                user = User.objects.get(id=user_id)
                Review.objects.create(
                    user_id=user,
                    book_isbn=isbn,
                    content=content,
                    timestamp=timezone.localtime(),
                )
                user_review = Review.objects.get(user_id=user_id, book_isbn=isbn)
                review_id = user_review.id
            return JsonResponse({"review": content, "id": review_id})
        return JsonResponse({"review": None})


@csrf_exempt
def update_bookshelf(request):
    if request.method == "POST":
        data = loads(request.body)
        book_isbn = data["isbn"]
        user_id = data["user_id"]
        action = data["action"]
        try:
            if book_in_shelf := Bookshelf.objects.get(
                user_id=user_id, book_isbn=book_isbn
            ):
                book_in_shelf.delete()
            return JsonResponse({"in_bookshelf": False})
        except:
            if action:
                user = User.objects.get(id=int(user_id))
                Bookshelf.objects.create(
                    user_id=user, book_isbn=book_isbn, tag=action.title()
                )
                return JsonResponse({"in_bookshelf": True})
        return JsonResponse({"in_bookshelf": None})


@csrf_exempt
def in_bookshelf(request):
    if request.method == "POST":
        data = loads(request.body)
        book_isbn = data["isbn"]
        user_id = data["user_id"]
        try:
            if Bookshelf.objects.get(user_id=user_id, book_isbn=book_isbn):
                return JsonResponse({"in_bookshelf": True})
        except:
            return JsonResponse({"in_bookshelf": False})


@csrf_exempt
def get_user_id(request):
    if request.method == "POST":
        data = loads(request.body)
        username = data["username"]
        try:
            return JsonResponse({"user_id": User.objects.get(username=username).id})  # type: ignore
        except:
            return JsonResponse({"user_id": None})


@csrf_exempt
def book_result(request):
    if request.method == "POST":
        data = loads(request.body)
        book_isbn = data["isbn"]
        query = rf"https://www.googleapis.com/books/v1/volumes?q=isbn:{book_isbn}&projection=full"
        print(query)
        result = get(query).json()
        return JsonResponse({"result": result})


def book_results(request):
    if request.method == "POST":
        data = loads(request.body)
        form_result = SearchBookForm(data)
        query = data["query"]
        select = data["select"]
        if form_result.is_valid():
            query = form_result.cleaned_data["query"].replace(" ", "+")
            select = form_result.cleaned_data["select"].lower().replace(" ", "+")
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
        print(query)
        results = get(query).json()
        return JsonResponse({"results": results})


def codex(request, isbn=None, sale=None):
    return render(
        request,
        "codex/codex.html",
        {
            "search_book_form": SearchBookForm(),
            "add_review_form": ReviewForm(),
            "listing_form": ListingForm(),
            "purchase_form": PurchaseForm(),
        },
    )


@login_required
def readers_grove(request):
    return render(
        request,
        "readers_grove/readers_grove.html",
        {
            "add_review_form": ReviewForm(),
            "search_bookmark_form": BookmarkSearch(),
            "add_credits_form": CreditsForm(),
            "quote_form": QuoteForm(),
        },
    )


def book_crate(request):
    return render(
        request,
        "book_crate/book_crate.html",
        {
            "search_listing_form": ListingFormSearch(),
            "listing_form": ListingForm(),
            "purchase_form": PurchaseForm(),
            "search_donate_form": DonateFormSearch(),
            "donate_form": DonateForm(),
            "search_book_form": ListingSearchForm(),
        },
    )


def index(request):
    return render(request, "main/index.html")


def login_view(request):
    if request.method == "POST":
        try:
            data=loads(request.body)
            username = data["username"]
            password = data["password"]
            request_from = "react"
        except: # Remove this later
            username = request.POST["username"]
            password = request.POST["password"]
            request_from = "base"
            
        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)
            if request_from=="base":
                return HttpResponseRedirect(reverse("readers_grove"))
            return JsonResponse({"user":username, "isUser": user.is_authenticated, "isSuper": user.is_superuser})
        else:
            return JsonResponse({"message":"Invalid username and/or password"})
            return render(
                request,
                "main/login.html",
                {"message": "Invalid username and/or password."},
            )
    else:
        return render(request, "main/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        data=loads(request.body)
        username = data["username"]
        email = data["email"]
        password = data["password"]
        confirmation = data["confirmation"]
        if password != confirmation:
            return JsonResponse({"message":"Passwords must match"})
            return render(
                request, "main/register.html", {"message": "Passwords must match."}
            )

        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return JsonResponse({"message": "Username already taken"})
            return render(
                request, "main/register.html", {"message": "Username already taken."}
            )
        login(request, user)
        return JsonResponse({"user":username, "isUser": user.is_authenticated,"isSuper":user.is_superuser})
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "main/register.html")
