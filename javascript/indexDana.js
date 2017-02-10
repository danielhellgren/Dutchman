/* To be able to show the beer names from the API
 we have to make a JSON query and from there add each
 beer name to divs with class=drink*/

$(document).ready(function() {
    changeLoginButton();
    getBeer();
    createEventHandlers();
    createEventHandlers2();
});

/*
Check if a cookie has been created and if so change the text
in the login-button to logout instead.
 */
function changeLoginButton() {
    var isCookie = readCookie("uid");
    if (isCookie) {
        var bNode = document.getElementsByClassName("login-button")[0];
        bNode.innerHTML = "Logout";
        getCredits(isCookie);
    }
}

/*
 If the login-button's text has been changed to logout also
 show the credits of that user under the button
 */
function getCredits(uName) {
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=iou_get_all",
        function(data) {
            var users = data.payload;
            for(var k = 0; k < users.length; k++) {
                if (uName == users[k].username) {
                   var credits = users[k].assets;
                   var cNode =document.getElementsByClassName("credits")[0];
                   cNode.innerHTML = "Credits:" + credits;
               }
           }
        });
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) {
            console.log(c.substring(nameEQ.length,c.length));
            return c.substring(nameEQ.length,c.length);
        }

    }
    return null;
}

function createCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}

//Call the API so that we can use the inventory information
function getBeer() {
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=inventory_get",
        function(data) {
            parseBeer(data.payload);
        });
}

/* Loop each item in the inventory and add it to the html.
 This has to be done to show the selection of drinks */
function parseBeer(beers) {
    for (var i = 0; i < beers.length; i++) {
        if (beers[i].namn == "") { //Beers with no name is named "Unknown"
            beers[i].namn = "Unknown";
        }
        var beerDiv = document.createElement('div');
        beerDiv.className = "drink";
        beerDiv.setAttribute("data-beer-id",beers[i].beer_id);

        var beerNameDiv = document.createElement('div');
        beerNameDiv.className = "drink-name";
        beerNameDiv.innerHTML = beers[i].namn + "<br>";
        beerNameDiv.innerHTML += beers[i].namn2;

        beerDiv.appendChild(beerNameDiv);

        document.getElementsByClassName("drinks-grid")[0]
            .appendChild(beerDiv);
    }
}

function createEventHandlers() {
    $(document).on('click', '.drink', function() {
        var beerId = this.getAttribute('data-beer-id');
        alert("You clicked on a drink - " + beerId);
    });
}

/*
Each time the login/logout-button is pressed the userId-cookie
will be deleted
 */
function createEventHandlers2() {
    $(document).on('click', '.login-button', function() {
        eraseCookie("uid");

    });
}
