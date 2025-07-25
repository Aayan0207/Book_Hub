# Generated by Django 5.0.6 on 2025-06-10 05:34

import datetime
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0008_remove_invoice_listing_id_alter_bookshelf_timestamp_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="bookshelf",
            name="timestamp",
            field=models.DateTimeField(
                default=datetime.datetime(2025, 6, 10, 11, 4, 52, 341477)
            ),
        ),
        migrations.AlterField(
            model_name="cart",
            name="timestamp",
            field=models.DateTimeField(
                default=datetime.datetime(2025, 6, 10, 11, 4, 52, 341477)
            ),
        ),
        migrations.AlterField(
            model_name="donate",
            name="timestamp",
            field=models.DateTimeField(
                default=datetime.datetime(2025, 6, 10, 11, 4, 52, 341477)
            ),
        ),
        migrations.AlterField(
            model_name="invoice",
            name="timestamp",
            field=models.DateTimeField(
                default=datetime.datetime(2025, 6, 10, 11, 4, 52, 341477)
            ),
        ),
        migrations.AlterField(
            model_name="listing",
            name="timestamp",
            field=models.DateTimeField(
                default=datetime.datetime(2025, 6, 10, 11, 4, 52, 341477)
            ),
        ),
        migrations.CreateModel(
            name="Bookmark",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                (
                    "profile_id",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="follows",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "user_id",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="follower",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
    ]
