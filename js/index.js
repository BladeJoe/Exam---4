let {
    log: log
} = console;
let form = document.querySelector(".form")
let searchbar = document.querySelector(".searchbar")
let elBookmarkWrapper = document.querySelector(".bookmark_wrapper")
let elBookWrapper = document.querySelector(".books_wrapper")
let elTotalBooks = document.querySelector(".total_found")
let elTotalRenderedBooks = document.querySelector(".total_rendered")
let elBooksTemplate = document.querySelector("#books_template").content
let elBookmarksTemplate = document.querySelector("#bookmarks_template").content


let elPageWrapper = document.querySelector(".pagination");

let savedBooks
if (localStorage.getItem("savedBooks")) {
    savedBooks = JSON.parse(localStorage.getItem("savedBooks"))
} else {
    savedBooks = []
}

let currentPage = 1;
let maxResults = 12;
let startIndex = 0;


function DarkMode() {
    document.querySelector("body").classList.toggle("dark")
    document.querySelector(".moon").classList.toggle("sun")
    document.querySelector(".searchbar").classList.toggle("bg-dark")
    document.querySelector(".searchbar").classList.toggle("bg-light")
    document.querySelector(".books_wrapper").classList.toggle("bg-light")
    let dark = document.querySelectorAll(".card");
    dark.forEach(e => {
        e.classList.toggle("bg-dark")
    })
    let light = document.querySelectorAll(".bookmark-item");
    light.forEach(e => {
        e.classList.toggle("bg-light")
        e.classList.toggle("border-dark")
    })
}

function renderBook(array) {
    elBookWrapper.innerHTML = null;
    let newFragment = document.createDocumentFragment();
    for (const item of array) {
        let newLi = elBooksTemplate.cloneNode(true);

        if (item.volumeInfo.imageLinks && item.volumeInfo.imageLinks.thumbnail) {
            newLi.querySelector(".card-img-top").src = item.volumeInfo.imageLinks.thumbnail;
        } else if (item.volumeInfo.imageLinks && item.volumeInfo.imageLinks.smallThumbnail) {
            newLi.querySelector(".card-img-top").src = item.volumeInfo.imageLinks.smallThumbnail;
        }
        if (item.volumeInfo.title) {
            newLi.querySelector(".card_title").innerHTML = item.volumeInfo.title;
        }
        if (item.volumeInfo.publishedDate) {
            newLi.querySelector(".card_year").innerHTML = item.volumeInfo.publishedDate;
        }
        if (item.volumeInfo.authors) {
            let newDiv = document.createElement("div")
            for (let i = 0; i < item.volumeInfo.authors.length; i++) {
                let newP = document.createElement("span")
                newP.style.padding = "0 !important"
                newP.innerHTML = `${item.volumeInfo.authors[i]} <br>`;


                newDiv.appendChild(newP)
            }
            newLi.querySelector(".card_author").appendChild(newDiv)

        }

        newLi.querySelector(".bookmark_btn").dataset.bookmarkId = item.id;
        newLi.querySelector(".more__info").dataset.infoId = item.id;
        newLi.querySelector(".read").href = `http://books.google.co.uz/books?id=${item.id}`;


        newFragment.appendChild(newLi);
    }

    elBookWrapper.appendChild(newFragment);
}

form.addEventListener("submit", function (evt) {
    evt.preventDefault()
    fetch(`https://www.googleapis.com/books/v1/volumes?maxResults=${maxResults}&q=${searchbar.value}&startIndex=${startIndex}`)
        .then(res => res.json())
        .then(data => {
            if (data.totalItems != 0) {
                total = Math.ceil(data.totalItems / maxResults)
                renderBook(data.items)
                elTotalBooks.innerHTML = data.totalItems;
                elTotalRenderedBooks.innerHTML = maxResults;
                renderPagination(total - 5);
                currentPage = 1
            } else {
                elBookWrapper.querySelector(".label").textContent = "Not found";

            }
        })
})

function orderByNewest() {
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchbar.value}&orderBy=newest`)
        .then(res => res.json())
        .then(data => {
            renderBook(data.items)
        })

    document.querySelector(".order").innerHTML = `<button onclick="noOrder()" class="btn btn-secondary order ps-5 d-flex  position-relative"><img
    src="./images/calendar.svg" alt="calendar" style="position: absolute;left: 0.5rem;">Do not order</button>`

}

function noOrder() {
    fetch(`
    https://www.googleapis.com/books/v1/volumes?q=${searchbar.value}`)
        .then(res => res.json())
        .then(data => {
            renderBook(data.items)
        })

    document.querySelector(".order").innerHTML = `<button onclick="orderByNewest()" class="btn btn-secondary order ps-5 d-flex  position-relative"><img
    src="./images/calendar.svg" alt="calendar" style="position: absolute;left: 0.5rem;">Order by
newest</button>`

}


elBookWrapper.addEventListener("click", function (evt) {
    let dataBookmarkId = evt.target.dataset.bookmarkId
    let dataInfoId = evt.target.dataset.infoId
    if (dataBookmarkId) {
        if (savedBooks.length == 0) {
            fetch(`https://www.googleapis.com/books/v1/volumes/${dataBookmarkId}`)
                .then(res => res.json())
                .then(data => {
                    savedBooks.unshift(data)
                    renderBookmarks(savedBooks);
                    localStorage.setItem("savedBooks", JSON.stringify(savedBooks));
                })

        } else if (!savedBooks.find(item => item.id == dataBookmarkId)) {
            fetch(`https://www.googleapis.com/books/v1/volumes/${dataBookmarkId}`)
                .then(res => res.json())
                .then(data => {
                    savedBooks.unshift(data)
                    renderBookmarks(savedBooks);
                    localStorage.setItem("savedBooks", JSON.stringify(savedBooks));
                })
        }
    }

    if (dataInfoId) {
        fetch(`https://www.googleapis.com/books/v1/volumes/${dataInfoId}`)
            .then(res => res.json())
            .then(data => {
                renderOffcanvas(data)
            })
    }

})
renderBookmarks(savedBooks);

elBookmarkWrapper.addEventListener("click", function (evt) {
    let datasetPostId = evt.target.dataset.id;

    if (datasetPostId) {
        let FoundSavedPost = savedBooks.findIndex(function (item) {
            return item.id == datasetPostId;
        })

        savedBooks.splice(FoundSavedPost, 1);

        localStorage.setItem("savedBooks", JSON.stringify(savedBooks));
    }
    renderBookmarks(savedBooks);

})

function renderBookmarks(array) {
    elBookmarkWrapper.innerHTML = null;
    if (array.length != 0) {

        elTotalRenderedBooks.innerHTML = array.length;
    } else {
        elTotalRenderedBooks.innerHTML = 0;

    }

    let fragment = document.createDocumentFragment();

    for (const item of array) {
        let newLi = elBookmarksTemplate.cloneNode(true);

        newLi.querySelector(".bookmark_title").textContent = item.volumeInfo.title;
        newLi.querySelector(".bookmark_body").textContent = item.volumeInfo.authors[0];
        newLi.querySelector(".delete").dataset.id = item.id;
        newLi.querySelector(".read_more").href = `http://books.google.co.uz/books?id=${item.id}`;

        fragment.appendChild(newLi);
    }

    elBookmarkWrapper.appendChild(fragment)
}

function renderOffcanvas(item) {
    if (item.volumeInfo.imageLinks && item.volumeInfo.imageLinks.thumbnail) {
        offcanvasExample.querySelector(".card-img-top").src = item.volumeInfo.imageLinks.thumbnail
    } else if (item.volumeInfo.imageLinks && item.volumeInfo.imageLinks.smallThumbnail) {
        offcanvasExample.querySelector(".card-img-top").src = item.volumeInfo.imageLinks.smallThumbnail
    }
    offcanvasExample.querySelector(".offcanves_read").href = `http://books.google.co.uz/books?id=${item.id}`
    offcanvasExample.querySelector(".offcanvas-title").textContent = item.volumeInfo.title
    offcanvasExample.querySelector(".card_desc").textContent = item.volumeInfo.description
    let newDiv = document.createElement("span")
    for (let i = 0; i < item.volumeInfo.authors.length; i++) {
        let newP = document.createElement("span")
        newP.style.padding = "0 !important"
        newP.setAttribute("id", "bgblue")
        newP.classList.add("btn", "text-primary", "rounded-4")
        newP.style.color = "rgba(13, 117, 255, 0.09)!important"
        newP.innerHTML = `${item.volumeInfo.authors[i]}`;


        newDiv.appendChild(newP)
    }
    offcanvasExample.querySelector(".card_author").appendChild(newDiv)

    offcanvasExample.querySelector(".card_year").textContent = item.volumeInfo.publishedDate
    offcanvasExample.querySelector(".card_year").setAttribute("id", "bgblue")
    offcanvasExample.querySelector(".card_year").classList.add("btn", "text-primary", "rounded-4")
    offcanvasExample.querySelector(".card_publisher").textContent = item.volumeInfo.publisher
    offcanvasExample.querySelector(".card_publisher").setAttribute("id", "bgblue")
    offcanvasExample.querySelector(".card_publisher").classList.add("btn", "text-primary", "rounded-4")
    let AgainNewDiv = document.createElement("span")
    for (let i = 0; i < item.volumeInfo.categories.length; i++) {
        let newP = document.createElement("span")
        newP.setAttribute("id", "bgblue")
        newP.style.padding = "0 !important"
        newP.classList.add("btn", "text-primary", "rounded-4")
        newP.textContent = `${item.volumeInfo.categories[i]}`;

        AgainNewDiv.appendChild(newP)
    }
    offcanvasExample.querySelector(".card_category").innerHTML = null
    offcanvasExample.querySelector(".card_category").appendChild(AgainNewDiv)
    offcanvasExample.querySelector(".card_count").textContent = item.volumeInfo.pageCount
}


function renderPagination(total, wrapper = elPageWrapper) {
    wrapper.innerHTML = null;
    if (total > 1) {
        for (let i = 1; i <= total; i++) {
            let NewLi = document.createElement("li")
            let Newp = document.createElement("a")
            NewLi.classList.add("page-item")
            if (i == currentPage) {
                NewLi.classList.add("active")
            }
            Newp.classList.add("page-link")
            Newp.textContent = i
            Newp.dataset.pageId = i
            NewLi.appendChild(Newp)
            wrapper.appendChild(NewLi)

        }
    }
}

elPageWrapper.addEventListener("click", function (evt) {
    if (evt.target.dataset.pageId) {
        currentPage = evt.target.dataset.pageId
        startIndex = currentPage * maxResults - 1;
        log(currentPage)
        if (currentPage) {
            fetch(`https://www.googleapis.com/books/v1/volumes?maxResults=${maxResults}&q=${searchbar.value}&startIndex=${startIndex}`)
                .then(res => res.json())
                .then(data => {
                    if (data.totalItems != 0) {
                        renderBook(data.items)

                        elTotalRenderedBooks.innerHTML = maxResults;
                        elTotalBooks.innerHTML = data.totalItems;
                        renderPagination(total - 5)

                    } else {
                        searchbar.value = null;
                        elBookWrapper.querySelector(".label").textContent = "Not found";

                    }
                })
        }
    }
})