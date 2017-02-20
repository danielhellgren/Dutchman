/* To be able to show the beer names from the API
 we have to make a JSON query and from there add each
   beer name to divs with class=drink*/

$(document).ready(function() {
    changeLoginButton();
    getDrinks();
    createEventHandlers();
    createEventHandlers2();
    createEventHandlers3();
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

/*Call the API so that we can use the inventory information.
For each drink we have to get its information so that we know
in which tab we are gonna put it.
*/

function getDrinks() {
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=inventory_get",
    function(data) {
        var drinkId = [];
        for (var i = 0; i< data.payload.length; i++) {
            if (data.payload[i].namn !=="") { //remove drinks with no name.
                drinkId[i-7] = data.payload[i].beer_id;
            }
        }
        getDrinksInfo(drinkId);
    });
}
/*
Get the drink information from each drink. Compare it to the
type of drink it is in the database. Depending on what type of
drink it is call different functions that puts the drink into
different tabs on the webpage. The parsing into tabs is done
by four different functions - one for each tab.
 */
function getDrinksInfo(drinkId) {
    for (var j = 0; j < drinkId.length; j++) {
        $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=beer_data_get&beer_id="
            + drinkId[j], function(data) {
            var drinkTypeReal =data.payload[0].varugrupp;
            var drinkType = drinkTypeReal.split(',')[0]; //remove everything after a "," from the drink type description
            if (drinkType == "Öl") {
                parseBeer(data.payload);
            }
            else if (drinkType == "Rött vin" || drinkType == "Vitt vin") {
                parseWine(data.payload);
            }
            else if (drinkType == "Cider" || drinkType == "Blanddrycker") {
                parseCider(data.payload);
            }
            else if (drinkType == "Alkoholfritt") {
                parseNonAlcoholic(data.payload);
            }
        });
    }
}

/* Loop each item in the inventory and add it to the html.
  This has to be done to show the selection of drinks */
function parseBeer(beers) {
    for (var i = 0; i < beers.length; i++) {
        var beerDiv = document.createElement('div');
        beerDiv.className = "drink";
        var beerId = beers[i].nr;
        beerDiv.setAttribute("data-beer-id",beerId);

        var beerNameDiv = document.createElement('div');
        beerNameDiv.className = "drink-name";
        beerNameDiv.innerHTML = beers[i].namn + "<br>";
        beerNameDiv.innerHTML += beers[i].namn2;

        var infoButtonDiv = document.createElement('div');
        infoButtonDiv.className = 'info-button';
        infoButtonDiv.innerHTML = '?';

        beerDiv.appendChild(infoButtonDiv);
        beerDiv.appendChild(beerNameDiv);

        document.getElementsByClassName("drinks-grid")[0]
            .appendChild(beerDiv);
        }


}

function parseWine(wines) {
    for (var i = 0; i < wines.length; i++) {
        var wineDiv = document.createElement('div');
        wineDiv.className = "drink";
        var beerId = wines[i].nr;
        wineDiv.setAttribute("data-beer-id",beerId);

        var wineNameDiv = document.createElement('div');
        wineNameDiv.className = "drink-name";
        wineNameDiv.innerHTML = wines[i].namn + "<br>";
        wineNameDiv.innerHTML += wines[i].namn2;

        var infoButtonDiv = document.createElement('div');
        infoButtonDiv.className = 'info-button';
        infoButtonDiv.innerHTML = '?';

        wineDiv.appendChild(infoButtonDiv);
        wineDiv.appendChild(wineNameDiv);

        document.getElementsByClassName("wine-grid")[0]
                .appendChild(wineDiv);
        }
}

function parseCider(ciders) {
    for (var i = 0; i < ciders.length; i++) {
        var ciderDiv = document.createElement('div');
        ciderDiv.className = "drink";
        var beerId = ciders[i].nr;
        ciderDiv.setAttribute("data-beer-id",beerId);

        var ciderNameDiv = document.createElement('div');
        ciderNameDiv.className = "drink-name";
        ciderNameDiv.innerHTML = ciders[i].namn + "<br>";
        ciderNameDiv.innerHTML += ciders[i].namn2;

        var infoButtonDiv = document.createElement('div');
        infoButtonDiv.className = 'info-button';
        infoButtonDiv.innerHTML = '?';

        ciderDiv.appendChild(infoButtonDiv);
        ciderDiv.appendChild(ciderNameDiv);

        document.getElementsByClassName("cider-grid")[0]
            .appendChild(ciderDiv);
    }
}

function parseNonAlcoholic(nas) {
    for (var i = 0; i < nas.length; i++) {
        var nasDiv = document.createElement('div');
        nasDiv.className = "drink";
        var beerId = nas[i].nr;
        nasDiv.setAttribute("data-beer-id",beerId);

        var nasNameDiv = document.createElement('div');
        nasNameDiv.className = "drink-name";
        nasNameDiv.innerHTML = nas[i].namn + "<br>";
        nasNameDiv.innerHTML += nas[i].namn2;

        var infoButtonDiv = document.createElement('div');
        infoButtonDiv.className = 'info-button';
        infoButtonDiv.innerHTML = '?';

        nasDiv.appendChild(infoButtonDiv);
        nasDiv.appendChild(nasNameDiv);

        document.getElementsByClassName("na-grid")[0]
            .appendChild(nasDiv);
    }
}

/* parses the info from beer_info payload to the infobox - popup
* */
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

    var namn = beer_info[0].namn;
    var nameString = "<span class = 'namn'>" + namn + "</span>";

    var namn2 = beer_info[0].namn2;

    if(namn2.length > 0){
        nameString += "<span class = 'namn2'> " + namn2 + "</span>";
    }

    document.getElementsByClassName("info-box-header")[0].innerHTML = nameString;

    var bodyString = " Ecological: ";
    if(beer_info[0].ekologisk == "1"){
            bodyString += "Yes";
    }
    else {
        bodyString +=  "No";
    }

    //Alcoholic percent
    bodyString += "<br><br>Alcohol: " + beer_info[0].alkoholhalt;
    // // GROUP
    bodyString += "<br><br>Tags: " + beer_info[0].varugrupp;
    // //Origin country
    bodyString += "<br><br>Country: " + beer_info[0].ursprunglandnamn ;

    document.getElementsByClassName("info-box-body")[0].innerHTML = bodyString;

    var drinkTypeReal = beer_info[0].varugrupp;
    var drinkType = drinkTypeReal.split(',')[0]; //remove everything after a "," from the drink type description

    /*check drink type and decide which image to use*/
    if (drinkType == "Rött vin" || drinkType == "Vitt vin") {
        // set image to wine
        document.getElementsByClassName("info-box-drink-image")[0].innerHTML = "<img src='resources/wine.png' height='300px' width='120px'/>";
        //  infoImage.innerHTML = "<img src='resources/wine.png' height='300px' width='120px'/>";
    }
    else if (drinkType == "Cider" || drinkType == "Blanddrycker") {
        // set iamge to cider
        document.getElementsByClassName("info-box-drink-image")[0].innerHTML = "<img src='resources/cider.png' height='300px' width='120px'/>";
        // infoImage.innerHTML = "<img src='resources/cider.png' height='300px' width='120px'/>";
    }
    else if (drinkType == "Alkoholfritt") {
        // set image to non-alco
        document.getElementsByClassName("info-box-drink-image")[0].innerHTML = "<img src='resources/soda.png' height='300px' width='120px'/>";
        // infoImage.innerHTML = "<img src='resources/soda.png' height='300px' width='120px'/>";
    }
    else {
        // alert("SETTING TO BEER IMG");
        // set image to beer
        document.getElementsByClassName("info-box-drink-image")[0].innerHTML = "<img src='resources/beer.png' height='300px' width='120px'/>";
        // infoImage.innerHTML = "<img src='resources/beer.png'  height='300px' width='120px'/>";
    }
}

// gets the info from beer_data_get for a beer_id
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
    // var headerDiv = document.getElementsByClassName("info-box-header");
    // var bodyDiv = document.getElementsByClassName("info-box-body");
    // var imageDiv = document.getElementsByClassName("info-image");
    var overlay = document.getElementsByClassName("overlay")[0];
    //
    // // delete subdivs
    // while(headerDiv[0].firstChild) {
    //     headerDiv[0].removeChild(headerDiv[0].firstChild);
    // }
    // while(imageDiv[0].firstChild) {
    //     imageDiv[0].removeChild(imageDiv[0].firstChild);
    // }
    // while(bodyDiv[0].firstChild){
    //     bodyDiv[0].removeChild(bodyDiv[0].firstChild);
    // }

    // hide overlay
    overlay.style.display = "none";
}



//EVENT handlers
function createEventHandlers() {

    //on click on one of the beers
    $(document).on('click', '.info-button', function() {
        var beerId = $(this).parent()[0].getAttribute('data-beer-id');
        getBeerInfo(beerId);
        showInfo();
        // alert("You clicked on a drink - " + beerId);
    });
    $(document).on('click', '.close-info-box', function() {
        hideInfo();
    });

    // $(document).on('click', 'window', function(event) {
    //     var overlay = document.getElementsByClassName("overlay")[0];
    //     if(event.target == overlay){
    //         hideInfo(overlay);
    //     }
    //
    // });
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
This event handler listens to the category buttons and if one of
them is pressed it has to change the view and change the color
of the highlighted button.
 */
function createEventHandlers3() {
    $(document).on('click', '.category', function() {
        changeCategoryColor(this.id);
    });
}

/*
Remove the selected class from all category buttons and then
add it to the pressed button so that it gets highlighted
 */
function changeCategoryColor(buttonId) {
    // $('.category').each(function(){
        $('.category').removeClass('selected');
    // });
    $('#' +buttonId).addClass('selected');
    showCorrectCategory(buttonId);
}

/*
The function first hides all the different drink category grids.
It then checks which button the user pressed on so that it can
show the appropriate grid.
 */
function showCorrectCategory(buttonId) {
    document.getElementsByClassName("drinks-grid")[0].style.display="none";
    document.getElementsByClassName("wine-grid")[0].style.display="none";
    document.getElementsByClassName("cider-grid")[0].style.display="none";
    document.getElementsByClassName("na-grid")[0].style.display="none";

    if (buttonId == "b-category") {
        document.getElementsByClassName("drinks-grid")[0].style.display="flex";
    }
    else if (buttonId == "w-category") {
        document.getElementsByClassName("wine-grid")[0].style.display="flex";
    }
    else if (buttonId == "c-category") {
        document.getElementsByClassName("cider-grid")[0].style.display = "flex";
    }
    else if (buttonId == "na-category") {
        document.getElementsByClassName("na-grid")[0].style.display = "flex";
    }
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