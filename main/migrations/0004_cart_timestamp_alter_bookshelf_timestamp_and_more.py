# Generated by Django 5.0.6 on 2025-06-07 15:55

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0003_cart_listing_id_alter_bookshelf_timestamp_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="cart",
            name="timestamp",
            field=models.DateTimeField(
                default=datetime.datetime(2025, 6, 7, 21, 25, 21, 762249)
            ),
        ),
        migrations.AlterField(
            model_name="bookshelf",
            name="timestamp",
            field=models.DateTimeField(
                default=datetime.datetime(2025, 6, 7, 21, 25, 21, 762249)
            ),
        ),
        migrations.AlterField(
            model_name="listing",
            name="timestamp",
            field=models.DateTimeField(
                default=datetime.datetime(2025, 6, 7, 21, 25, 21, 762249)
            ),
        ),
    ]
