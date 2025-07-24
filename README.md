# Book Hub
![Book Hub](main/static/main/BookHub%20Icon.png)

## About the Project

Introducing Book Hub! A website primarily designed to pertain to the readers of a fictional library called The Book Hub, but it delves into much more depth than just being a website for the library, and has so much more to offer to its users.

### Codex
![Codex](main/static/codex/Codex%203.png)

Powered with the help of Google Books API, scour the internet for millions of books and find the right ones for you. Offering a method to search using the title but also giving the ability to look up information using a book's ISBN, authors, publishers, and even its genre/category. Each result available has its own result page, containing detailed information that combines both the results from the Google Books API and the thoughts and opinions of the Book Hub community.

### Book Crate
![Book Crate](main/static/book_crate/Book%20crate%20final.png)

The library provides a plethora of books available for sale. Hence, the Book Crate was created as a platform to do so where admins/librarians can add/delete/update listings to be made available to the users providing the stock and price (Credits are used as the currency for monetary transactions. Purely fictional in nature. Not representative of real currency.). Users can search among the available listings using similar parameters to the Codex search system and either purchase books immediately or add them to their cart and save them for later.

However, since at the base, Book Hub is a library thus, it is open to book donations from its community members. Users can make a request to donate books through the book crate. If accepted, they'll get one credit per book donated.

Invoices are generated and provided for each transaction in relation to the user, whether it be a purchase or an accepted/rejected donation request, complete with book information, listing information, transaction amount, and timestamp, available for viewing on the user's profile at Reader's Grove.

### Reader's Grove
![Reader's Grove](main/static/readers_grove/Readers%20Grove%20Final.png)

A community needs an area to convene and discuss. Reader's Grove does the same, serving as a networking area for all members, complete with showing ratings & reviews from across the community on various books as well as a more controlled approach where users can see the ratings & reviews of people they have bookmarked (A bookmark is essentially a following system).

Another core feature is a user's bookshelf. As and when users come across book results on the website, in addition to rating and/or reviewing them, they can also add them to their bookshelf under the tag "Read", "Currently Reading", and "Want to Read" which will later be shown on the user's profile with a backdrop of a bookshelf to evoke the image of an actual book present on a bookshelf.

Finally, the base profile section of the user provides an about section, and a shorthand view of what they are currently reading or what they want to read, alongside numerical data on their bookshelves, ratings, reviews, and bookmarks.

## Distinctiveness and Complexity

In terms of distinctiveness and complexity, the project does indeed draw on the concepts of all the other Projects in the course, but it blends desired features from all of them into one whole application, thus being much more complicated and time-intensive as compared to any individual project while also adding additional features.

**Project 0: Search and Project: 1 Wiki** inspired the creation of Codex and also utilizing Google Books API to provide search results and relevant data, but it also incorporates data from the Book Hub Community itself in terms of ratings and reviews as well as user bookshelves.

**Project 2: Commerce** was the initial inspiration for Book Crate. However, Book Crate is more along the lines of purchasing and donating books to and from the community rather than bidding on listings. The listings are also managed by a librarian/admin at The Book Hub rather than any general user.

**Project 3: Mail** didn't have a direct impact in terms of e-mailing content to users, but it did help inspire the idea of providing Invoices for all transactions concerning a user at Reader's Grove.

**Project 4: Network** was the inspiration for Reader's Grove to become an area for the community to convene and discuss. However, Network involved more of a general discussion on various topics and themes. In this case, the central theme and ideas revolve around books, and specifically users' opinions on them expressed via their ratings and reviews of the same. Also, the concept of a bookshelf was created to represent a user more aptly, keeping in mind the central theme is of a library and a user having a reading list and telling others about books they have read.

## Files and Programs

### views.py
Main file that handles backend work for the application, such as fetching data from the models and providing it to the corresponding fetch call from the front end and initial loading of templates.

### urls.py
Handles urlpatterns to link fetch call links from the front end to corresponding functions and behaviours in views.py as well as Django-templating syntax.

### models.py
Contains the User, Bookmark, Listing, Cart, Donate, Invoice, Bookshelf, Review, and Like relational models for storing data from the site.

### templates

#### layout.html
Base HTML layout for all other HTML files.

#### book_crate.html, codex.html, readers_grove.html, user.html
Base HTML for corresponding sub-apps.

#### index.html
Main landing page base HTML.

#### login.html, register.html
Login and Registration page HTML.

#### book_crate.js, codex.js, readers_grove.js, layout.js, current_user.js
Javascript files to handle the functioning of the corresponding webpages when interacted with, as well as asynchronously fetching and updating relevant Document-Object Model (DOM) elements when required.

#### book_crate.css, codex.css, readers_grove.css, layout.css, current_user.css
CSS files for displaying icons and animations, as well as styling for corresponding web pages and DOM elements.

#### png's and gif's
Source of icons, images, and animations for the website.

## How to run the application

Change the directory into capstone if not already, and execute the following in-order in the command line:
python manage.py makemigrations
python manage.py migrate
python manage.py runserver

## Additional Information

Some Python modules have been outlined in requirements.txt. Kindly ensure that those modules are installed before running the project to ensure it works as intended.

