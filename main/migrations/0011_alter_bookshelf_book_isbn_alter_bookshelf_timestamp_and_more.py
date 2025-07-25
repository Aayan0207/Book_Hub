# Generated by Django 5.0.6 on 2025-06-10 06:33

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0010_rename_profile_id_bookmark_bookmark_id_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="bookshelf",
            name="book_isbn",
            field=models.CharField(max_length=13),
        ),
        migrations.AlterField(
            model_name="bookshelf",
            name="timestamp",
            field=models.DateTimeField(
                default=datetime.datetime(2025, 6, 10, 12, 3, 47, 162068)
            ),
        ),
        migrations.AlterField(
            model_name="cart",
            name="timestamp",
            field=models.DateTimeField(
                default=datetime.datetime(2025, 6, 10, 12, 3, 47, 162068)
            ),
        ),
        migrations.AlterField(
            model_name="donate",
            name="timestamp",
            field=models.DateTimeField(
                default=datetime.datetime(2025, 6, 10, 12, 3, 47, 162068)
            ),
        ),
        migrations.AlterField(
            model_name="invoice",
            name="timestamp",
            field=models.DateTimeField(
                default=datetime.datetime(2025, 6, 10, 12, 3, 47, 162068)
            ),
        ),
        migrations.AlterField(
            model_name="listing",
            name="timestamp",
            field=models.DateTimeField(
                default=datetime.datetime(2025, 6, 10, 12, 3, 47, 153527)
            ),
        ),
    ]
