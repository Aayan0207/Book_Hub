from django.urls import path

from . import views

urlpatterns = [
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("user_liked", views.user_liked, name="user_liked"),
    path("in_bookshelf", views.in_bookshelf, name="in_bookshelf"),
    path("in_cart", views.in_cart, name="in_cart"),
    path("get_bookshelf", views.get_bookshelf, name="get_bookshelf"),
    path("update_bookshelf", views.update_bookshelf, name="update_bookshelf"),
    path("update_cart", views.update_cart, name="update_cart"),
    path("update_rating", views.update_rating, name="update_rating"),
    path("update_listing", views.update_listing, name="update_listing"),
    path("update_donation", views.update_donation, name="update_donation"),
    path("update_bookmark", views.update_bookmark, name="update_bookmark"),
    path("get_listing", views.get_listing, name="get_listing"),
    path("random_reviews", views.random_reviews, name="random_reviews"),
    path("add_credits", views.add_credits, name="add_credits"),
    path("purchase_listing", views.purchase_listing, name="purchase_listing"),
    path("manage_review", views.manage_review, name="manage_review"),
    path(
        "manage_admin_donation",
        views.manage_admin_donation,
        name="manage_admin_donation",
    ),
    path("update_like", views.update_like, name="update_like"),
    path("get_user_rating", views.get_user_rating, name="get_user_rating"),
    path("get_book_rating", views.get_book_rating, name="get_book_rating"),
    path("get_book_reviews", views.get_book_reviews, name="get_book_reviews"),
    path("get_user_reviews", views.get_user_reviews, name="get_user_reviews"),
    path("get_user_invoices", views.get_user_invoices, name="get_user_invoices"),
    path("update_quote", views.update_quote, name="update_quote"),
    path("user_exists", views.user_exists, name="user_exists"),
    path("load_listings", views.load_listings, name="load_listings"),
    path("user_activity_info", views.user_activity_info, name="user_activity_info"),
    path("load_cart", views.load_cart, name="load_cart"),
    path("load_donations", views.load_donations, name="load_donations"),
    path("user_bookmarked", views.user_bookmarked, name="user_bookmarked"),
    path(
        "load_bookmark_reviews",
        views.load_bookmark_reviews,
        name="load_bookmark_reviews",
    ),
    path(
        "load_admin_donations", views.load_admin_donations, name="load_admin_donations"
    ),
    path("book_results", views.book_results, name="book_results"),
    path("book_result", views.book_result, name="book_result"),
    path("csrf_token", views.csrf_token, name="token"),
]
