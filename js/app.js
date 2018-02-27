"use strict";

//sorts items in descending order
function descending(comparator) {
    return function(rec1, rec2) {
        return -(comparator(rec1, rec2));
    }
}

//compares titles for ordering
function compareByTitle(rec1, rec2) {
    if(rec1.title < rec2.title) {
         return -1;
    }
    if(rec1.title > rec2.title) {
        return 1;
    }
    return 0;
}

//compares ticket sales for ordering
function compareByTickets(rec1, rec2) {
    if(rec1.tickets < rec2.tickets) {
         return -1;
    }
    if(rec1.tickets > rec2.tickets) {
        return 1;
    }
    return 0;
}

//compares sales for ordering
function compareBySales(rec1, rec2) {
    if(rec1.sales < rec2.sales) {
         return -1;
    }
    if(rec1.sales > rec2.sales) {
        return 1;
    }
    return 0;
}

//compares release date for ordering
function compareByRelease(rec1, rec2) {
    if(rec1.released < rec2.released) {
         return -1;
    }
    if(rec1.released > rec2.released) {
        return 1;
    }
    return 0;
}

//compares genres for ordering
function compareByGenre(rec1, rec2) {
    if(rec1.genre < rec2.genre) {
         return -1;
    }
    if(rec1.genre > rec2.genre) {
        return 1;
    }
    return 0;
}

//compares year for ordering
function compareByYear(rec1, rec2) {
    if(rec1.year < rec2.year) {
         return -1;
    }
    if(rec1.year > rec2.year) {
        return 1;
    }
    return 0;
}

var tbody = document.querySelector("tbody");

//removes redundancy for table rendering
function createElement(elemName, text) {
    var elem = document.createElement(elemName);
    if (text) {
        elem.textContent = text;
    }
    return elem;
}

//joins duplicate movie titles
function joinDuplicates(moviesByTitle) {
    var joinedMovies = [];
    for(var i = 0; i < moviesByTitle.length - 1; i+=1) {
        if(moviesByTitle[i].title === moviesByTitle[i + 1].title) {
            moviesByTitle[i].tickets += moviesByTitle[i + 1].tickets;
            moviesByTitle[i].title = moviesByTitle[i].title + " (" + moviesByTitle[i].year + ")";
            moviesByTitle.splice(i + 1, 1);
            i-=1;
        }
    }
}

//joins movie genres together
function joinGenre(moviesByGenre) {
    var genres = [];
    var genreSales = movieGenre[0].sales;
    var count = 1;
    for(var i = 1; i < moviesByGenre.length - 1; i+=1) {
        if(moviesByGenre[i].genre == moviesByGenre[i-1].genre) {
            genreSales += movieGenre[i].sales;
            count++;
        } else {
            var genreObject = {
                genre: movieGenre[i - 1].genre,
                sales: genreSales / count
            };
            genres.push(genreObject);
            count = 0;
            genreSales = 0;
        }
    }
    return genres;
}

//removes any movie released after January 1, 2000
function removeBeforeDate(moviesByTitle) {
    var oldMovies = [];
    for(var i = 0; i < moviesByTitle.length - 1; i+=1) {
        if(moviesByTitle[i].released < "2000-01-01T00:00:00Z") {
            oldMovies.push(moviesByTitle[i]);
        }
    }
    return oldMovies;
}

//reformats table for average sales by genre query
function toggleGenreFormat() {
    document.getElementById("table").classList.toggle("hide1");
    document.getElementById("table").classList.toggle("hide2");
    document.getElementById("table").classList.toggle("hide3");
    document.getElementById("table").classList.toggle("hide5");
    document.getElementById("table").classList.toggle("hide6");
    document.getElementById("table").classList.toggle("hide8");
}

//reformats table for top 100 movies sorted by ticket sales
function toggleTopFormat() {
    document.getElementById("table").classList.toggle("hide2");
    document.getElementById("table").classList.toggle("hide3");
    document.getElementById("table").classList.toggle("hide4");
    document.getElementById("table").classList.toggle("hide5");
    document.getElementById("table").classList.toggle("hide6");
    document.getElementById("table").classList.toggle("hide7");
}

//renders table
function render(records) {
    tbody.innerHTML = "";

    records.forEach(function(record) {
        var tr = document.createElement("tr");
        tr.appendChild(createElement("td", record.title));
        tr.appendChild(createElement("td", moment(record.released).format("l"))).style.textAlign="left";
        tr.appendChild(createElement("td", record.distributor));
        tr.appendChild(createElement("td", record.genre));
        tr.appendChild(createElement("td", record.rating));
        tr.appendChild(createElement("td", record.year));
        tr.appendChild(createElement("td", numeral(record.sales).format("$0,0"))).style.textAlign="right";
        tr.appendChild(createElement("td", numeral(record.tickets).format("0,0"))).style.textAlign="right";
        tbody.appendChild(tr);
    });
}

//global format state variables
var formatTriggered = false;
var topFormatTriggered = false;

//main filter function
var selector = document.getElementById("report-select");
selector.addEventListener("change", function(element) {
    if(formatTriggered) {
        toggleGenreFormat();
        formatTriggered = false;
    }

    if(topFormatTriggered) {
        toggleTopFormat();
        topFormatTriggered = false;
    }
    //renders table data according to menu item toggled
    if (element.target.value === "star-wars") {
        document.getElementById("report-title").innerHTML = "Only Star Wars";
        render(starWarsMovies.sort(compareByTitle));
    } else if (element.target.value === "20th") {
        document.getElementById("report-title").innerHTML = "Re-Released 20th Century Movies";
        var moviesByTitle = titles.sort(compareByRelease);
        render(removeBeforeDate(moviesByTitle));
    } else if (element.target.value === "top-by-tickets") {
        document.getElementById("report-title").innerHTML = "Top 100 by Tickets Sold";
        var moviesByTitle = titles.sort(compareByTitle);
        joinDuplicates(moviesByTitle);
        var top100 = moviesByTitle.sort(descending(compareByTickets)).slice(0,100);
        render(top100);
        toggleTopFormat();
        topFormatTriggered = true;
    } else if (element.target.value === "avg-by-genre") {
        document.getElementById("report-title").innerHTML = "Average Sales by Genre";
        var moviesByGenre = movieGenre.sort(compareByGenre);
        var genreArray = joinGenre(moviesByGenre);
        render(genreArray.sort(descending(compareBySales)));
        toggleGenreFormat();
        formatTriggered = true;
    }
});

//returns genre of movies
var movieGenre = MOVIES.filter(function(record) {
    return record.genre;
});

//returns movies with titles that contain 'star wars'
var starWarsMovies = MOVIES.filter(function(record) {
    return record.title.toLowerCase().includes("star wars");
});

//returns movie record
var titles = MOVIES.filter(function(record) {    
    return record.title;
});

render(MOVIES);