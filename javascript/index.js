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
 of the login-button to logout instead. Then also show the
 credits of that user.
 */
function changeLoginButton() {
    var isCookie = readCookie("uid");
    if (isCookie) {
        var buttonNode = document.getElementsByClassName("login-button")[0];
        buttonNode.innerHTML = "Logout";
        getCredits(isCookie);
    }
}

/*
 If the login-button's text has been changed to logout also
 show the credits of that user under the button. This function
 calls the API so that we can get the logged in user's credit
 information.
 */
function getCredits(loggedInUser) {
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=iou_get_all",
        function(data) {
            var arrayOfUsers = data.payload;
            for(var k = 0; k < arrayOfUsers.length; k++) {
                if (loggedInUser == arrayOfUsers[k].username) {
                    var credits = arrayOfUsers[k].assets;
                    var creditsNode =document.getElementsByClassName("credits")[0];
                    creditsNode.innerHTML = "Credits:" + credits;
                }
            }
        });
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

function parseBeerInfo(beer_info){
    // beeer info:
    //
    //     nr: "197702",
    //     artikelid: "644574",
    //     varnummer: "1977",
    //     namn: "BEO",
    //     namn2: "Apple Green Tea",
    //     prisinklmoms: "12.90",
    //     volymiml: "",
    //     prisperliter: "",
    //     saljstart: "2012-06-01",
    //     slutlev: " ",
    //     varugrupp: "Alkoholfritt, Övrigt",
    //     forpackning: "Flaska",
    //     forslutning: "",
    //     ursprung: "",
    //     ursprunglandnamn: "Danmark",
    //     producent: "Carlsberg Sverige AB",
    //     leverantor: "Carlsberg Sverige AB",
    //     argang: "",
    //     provadargang: "",
    //     alkoholhalt: "0.1%",
    //     modul: "",
    //     sortiment: "FSÖ",
    //     ekologisk: "0",
    //     koscher: "0"

    /* Get beer name and name2 into header
     * two different divs because namn should be in bigger font than namn2 */

    var infoHeader = document.createElement('div');
    var infoSubHeader = document.createElement('div');
    infoHeader.className = "info-header";
    infoHeader.style.fontSize = "30px";
    infoHeader.innerHTML = beer_info[0].namn;
    if(beer_info[0].namn2.length > 0){
        infoSubHeader.innerHTML += "<br>" + beer_info[0].namn2;
    }

    // add everything to header
    document.getElementsByClassName("info-box-header")[0].appendChild(infoHeader);
    document.getElementsByClassName("info-box-header")[0].appendChild(infoSubHeader);

    /* get everything else and add it to the main body of infobox*/
    var infoBody = document.createElement('div');
    infoBody.className= "info-body";
    // Ecological
    // alert("ekologisk: " + beer_info[0].ekologisk);
    infoBody.innerHTML = "Ecological: ";
    if(beer_info[0].ekologisk == "1"){
        infoBody.innerHTML += "Yes";
    }
    else {
        infoBody.innerHTML += "No";
    }
    // GROUP
    infoBody.innerHTML += "<br><br>Group: " + beer_info[0].varugrupp;
    //Origin country
    infoBody.innerHTML += "<br><br>Country: " + beer_info[0].ursprunglandnamn;

    //add final resuilt
    document.getElementsByClassName("info-box-body")[0].appendChild(infoBody);
}

function getBeerInfo(beer_id){
    // alert("You clicked on a drink - " + beer_id);
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=beer_data_get&beer_id="
        + beer_id, function(data) {
        parseBeerInfo(data.payload);
        });
}

// shows the overlay and information box
function showInfo(overlay) {
    // alert("Trying to show info");
    var overlay = document.getElementsByClassName("overlay")[0];
    overlay.style.display = "block";
}


// hide infobox and clear contents
function hideInfo() {
    // alert("Trying to hide info");
    // get classes
    var headerDiv = document.getElementsByClassName("info-box-header");
    var bodyDiv = document.getElementsByClassName("info-box-body");
    var overlay = document.getElementsByClassName("overlay")[0];

    // delete subdivs
    while(headerDiv[0].firstChild) {
        headerDiv[0].removeChild(headerDiv[0].firstChild);
    }
    while(bodyDiv[0].firstChild){
        bodyDiv[0].removeChild(bodyDiv[0].firstChild);
    }

    // hide overlay
    overlay.style.display = "none";
}


//EVENT handlers
function createEventHandlers() {

    //on click on one of the beers
    $(document).on('click', '.drink', function() {
        var beerId = this.getAttribute('data-beer-id');
        getBeerInfo(beerId);
        showInfo();
        // alert("You clicked on a drink - " + beerId);
    });
    $(document).on('click', '.close-info-box', function() {
        hideInfo();
    });

    $(document).on('click', 'window', function(event) {
        var overlay = document.getElementsByClassName("overlay")[0];
        if(event.target == overlay){
            hideInfo(overlay);
        }

    });
}

/*
 Each time the login/logout-button is pressed the userId-cookie
 will be deleted. The login/logout-button's hyperref will also
 be changed if the user is logged in. Instead of taking the user
 to the login-screen the page will be reloaded and the user is
 not logged in anympre.
 */
function createEventHandlers2() {
    $(document).on('click', '.login-button', function() {
        var loggedIn = readCookie("uid");
        if (loggedIn) {
            document.getElementsByClassName("login-link")[0].href = "index.html";
        }
        eraseCookie("uid");
    });
}

/*
The three cookie-functions are used to check if a cookie has
been created, create a cookie and delete a cookie. There
are all used in connection with if an user is logged in or not.
 */
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