from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.timezone import now
from django.core.validators import MaxValueValidator

# Create your models here.


class User(AbstractUser):
    credits = models.IntegerField(default=0)
    quote = models.CharField(default="", blank=True, null=True, max_length=2000)


class Bookmark(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follower")
    bookmark_id = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="follows"
    )

    def __str__(self):
        return f"{self.user_id} {self.bookmark_id}"


class Listing(models.Model):
    id = models.AutoField(primary_key=True)
    librarian_id = models.ForeignKey(User, on_delete=models.CASCADE)
    book_isbn = models.CharField(max_length=13)
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    publisher = models.CharField(max_length=255)
    price = models.PositiveIntegerField()
    stock = models.PositiveIntegerField()
    timestamp = models.DateTimeField(default=now)


class Cart(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    book_isbn = models.CharField(max_length=13)
    listing_id = models.ForeignKey(Listing, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(default=now)


class Donate(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    book_isbn = models.CharField(max_length=13)
    quantity = models.PositiveIntegerField()
    timestamp = models.DateTimeField(default=now)


class Invoice(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    book_isbn = models.CharField(max_length=13)
    quantity = models.PositiveIntegerField()
    transaction_amount = models.PositiveIntegerField()
    transaction_type = models.CharField(choices={"sale": "sale", "purchase": "purchase"}, max_length=8)  # type: ignore
    timestamp = models.DateTimeField(default=now)


class Bookshelf(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    book_isbn = models.CharField(max_length=13)
    tag = models.CharField(choices={"Read": "Read", "Currently Reading": "Currently Reading", "Want To Read": "Want To Read"}, max_length=20)  # type: ignore
    timestamp = models.DateTimeField(default=now)


class Review(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    book_isbn = models.CharField(max_length=13)
    rating = models.PositiveSmallIntegerField(
        default=0, validators=[MaxValueValidator(5)]
    )
    content = models.TextField(blank=True, null=True, default="")
    timestamp = models.DateTimeField(blank=True, null=True)


class Like(models.Model):
    id = models.AutoField(primary_key=True)
    review_id = models.ForeignKey(Review, on_delete=models.CASCADE)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user_id} {self.review_id}"
