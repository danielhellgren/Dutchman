/* To be able to show the beer names from the API
 we have to make a JSON query and from there add each
   beer name to divs with class=drink*/

$(document).ready(function() {
    changeLoginButton();
    getDrinks();
    createEventHandlers();
});

/*
 Check if a cookie has been created and if so change the text
 of the login-button to logout instead. Then also show the
 credits of that user.
 If the login-button's text has been changed to logout also
 show the credits of that user under the button. This function
 calls the API so that we can get the logged in user's credit
 information.
 */
function changeLoginButton() {
    var isCookie = readCookie("uid");
    if (isCookie) {
        var buttonNode = document.getElementsByClassName("login-button")[0];
        buttonNode.innerHTML = "Logout";

        var myUserArray=isCookie.split('|'); //userId and userName are split by a "|"
        var userName=myUserArray[1]; //Get the userName from the array.
        console.log(userName);

        getAndShowCredits(userName);
    }
}

function getAndShowCredits(userName) {
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=" + userName + "&password=" + userName + "&action=iou_get",
        function(data) {
            var userInformation = data.payload;
            var userCredits = userInformation[0].assets;
            var creditsNode =document.getElementsByClassName("credits")[0];
            creditsNode.innerHTML = "Credits: " + userCredits + ":-";

    });
}


/*Call the API so that we can use the inventory information.
For each drink we have to get its information so that we know
in which tab we are gonna put it.
*/

function getDrinks() {
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=inventory_get",
    function(data) {
        var drinks = [];
        for (var i = 0; i< data.payload.length; i++) {
            if (data.payload[i].namn !=="") { //remove drinks with no name.
                drinks.push(data.payload[i]);
            }
        }
        getDrinksInfo(drinks);
    });
}

/*
Get the drink information from each drink. Compare it to the
type of drink it is in the database. Depending on what type of
drink it is call different functions that puts the drink into
different tabs on the webpage. The parsing into tabs is done
by four different functions - one for each tab.
 */
function getDrinksInfo(drinks) {
    for (var j = 0; j < drinks.length; j++) {
        getInfoForIndividualDrink(drinks[j]);
    }
}

function getInfoForIndividualDrink(inventoryGetDrink) {
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=beer_data_get&beer_id="
        + inventoryGetDrink.beer_id, function(data) {

        /* Returns an array with 1 object like:
         {
         "nr": "197702",
         "artikelid": "644574",
         "varnummer": "1977",
         "namn": "BEO",
         "namn2": "Apple Green Tea",
         "prisinklmoms": "12.90",
         "volymiml": "",
         "prisperliter": "",
         "saljstart": "2012-06-01",
         "slutlev": " ",
         "varugrupp": "Alkoholfritt, Övrigt",
         "forpackning": "Flaska",
         "forslutning": "",
         "ursprung": "",
         "ursprunglandnamn": "Danmark",
         "producent": "Carlsberg Sverige AB",
         "leverantor": "Carlsberg Sverige AB",
         "argang": "",
         "provadargang": "",
         "alkoholhalt": "0.1%",
         "modul": "",
         "sortiment": "FSÖ",
         "ekologisk": "0",
         "koscher": "0"
         }*/

        var beerDataGetDrink = data.payload[0];

        renderDrinks(inventoryGetDrink, beerDataGetDrink);
    });
}

/* Loop each item in the inventory and add it to the html.
  This has to be done to show the selection of drinks */
function renderDrinks(inventoryGetDrink, beerDataGetDrink) {
    var drinkId = beerDataGetDrink.nr;
    var beerDiv = document.createElement('div');
    beerDiv.className = "drink";
    beerDiv.setAttribute("data-beer-id", drinkId);

    //Get name of beer
    var beerNameDiv = document.createElement('div');
    beerNameDiv.className = "drink-name";
    beerNameDiv.innerHTML = inventoryGetDrink.namn + "<br>";
    beerNameDiv.innerHTML += inventoryGetDrink.namn2;
    //Add the beer name to div
    beerDiv.appendChild(beerNameDiv);

    //Get alcohol % of beer
    var alcDiv = document.createElement('div');
    alcDiv.className = "alcohol";
    alcDiv.innerHTML = beerDataGetDrink.alkoholhalt;
    beerDiv.appendChild(alcDiv);

    //Add the information button
    var infoButtonDiv = document.createElement('div');
    infoButtonDiv.className = "info-button";
    infoButtonDiv.innerHTML = "?";
    beerDiv.appendChild(infoButtonDiv);

    //Add a checkbox to the drink and put its' value equal to the drink's id.
    var orderCheckbox = document.createElement('input');
    orderCheckbox.type = "checkbox";
    orderCheckbox.className = "drink-checkbox";
    // var  orderCheckBoxInformation = [];
    // orderCheckBoxInformation[0] = inventoryGetDrink.pub_price;
    // orderCheckBoxInformation[1] = drinkId;
    // orderCheckbox.value = orderCheckBoxInformation;
    orderCheckbox.value = inventoryGetDrink.pub_price;
    beerDiv.appendChild(orderCheckbox);

    var drinkType = beerDataGetDrink.varugrupp;

    if (drinkType.includes("Alkoholfritt")) {
        document.getElementsByClassName("na-grid")[0]
            .appendChild(beerDiv);
    }
    else if (drinkType.includes("Rött vin") || drinkType.includes("Vitt vin")) {
        document.getElementsByClassName("wine-grid")[0]
            .appendChild(beerDiv);
    }
    else if (drinkType.includes("Cider") || drinkType.includes("Blanddrycker")) {
        document.getElementsByClassName("cider-grid")[0]
            .appendChild(beerDiv);
    }
    else if (drinkType.includes("Öl")) {
        document.getElementsByClassName("drinks-grid")[0]
            .appendChild(beerDiv);
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

    var infoHeader = document.createElement('div');
    var infoSubHeader = document.createElement('div');
    infoSubHeader.className = 'info-sub-header';
    infoHeader.className = "info-header";
    infoHeader.style.fontSize = "30px";
    infoHeader.innerHTML = beer_info[0].namn;
    if(beer_info[0].namn2.length > 0){
        //infoSubHeader.innerHTML += "<br>" + beer_info[0].namn2;
        infoSubHeader.innerHTML += beer_info[0].namn2;
    }

    // add everything to header
    document.getElementsByClassName("info-box-header")[0].appendChild(infoHeader);
    document.getElementsByClassName("info-box-header")[0].appendChild(infoSubHeader);

    /* get everything else and add it to the main body of infobox*/
    var infoBody = document.createElement('div');
    infoBody.className= "info-body";
    // Ecological
    // alert("ekologisk: " + beer_info[0].ekologisk);
    infoBody.innerHTML = "Ecologic: ";
    if(beer_info[0].ekologisk == "1"){
        infoBody.innerHTML += "<b>Yes</b>";
    }
    else {
        infoBody.innerHTML += "<b>No</b>";
    }

    infoBody.innerHTML += "<br><br>Alcohol: <b>" + beer_info[0].alkoholhalt + "</b>";
    // GROUP
    infoBody.innerHTML += "<br><br>Tags: <b>" + beer_info[0].varugrupp + "</b>";
    //Origin country
    infoBody.innerHTML += "<br><br>Country: <b>" + beer_info[0].ursprunglandnamn + "</b>";

    //add final resuilt
    document.getElementsByClassName("info-box-body")[0].appendChild(infoBody);
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
    $(document).on('click', '.info-button', function() {
        var beerId = $(this).parent()[0].getAttribute('data-beer-id');
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

    // This event handler listens to the category buttons and if one of
    // them is pressed it has to change the view and change the color
    // of the highlighted button.
    $(document).on('click', '.category', function() {
        changeCategoryColor(this.id);
    });

    /*
     Each time the login/logout-button is pressed the userId-cookie
     will be deleted. The login/logout-button's hyperref will also
     be changed if the user is logged in. Instead of taking the user
     to the login-screen the page will be reloaded and the user is
     not logged in anympre. */

    $(document).on('click', '.login-button', function() {
        var loggedIn = readCookie("uid");
        if (loggedIn) {
            document.getElementsByClassName("login-link")[0].href = "index.html";
        }
        eraseCookie("uid");
    });

    /*
    When the order-button is pressed a function that checks which checkboxes are filled.
     */
    $(document).on('click', '.order-button', function() {
        var isLoggedIn = readCookie('uid');
        if (isLoggedIn) { //An user can't make a purchase if he/she is not logged in
            var myUserArray = isLoggedIn.split('|'); //userId and credits are split by a "|"
            var userId = myUserArray[0]; //Get the userId from the array.
            var selectedDrinks = []; //Create an array to store all the checked drinks.
            $('.drink-checkbox:checked').each(function () {
                selectedDrinks.push(this.value);

            });
            // console.log(selectedDrinks);
            changeLoggedInUserCredits(selectedDrinks, userId);
        }
        else showErrorMessage();
    });

}
/*
Firstly the function creates the total price of the order and then it performs the payment_append
API-call so that the credits for the logged in user is changed. Then reload the page so that the right
updated amount of credits are shown to the user.
 */
function changeLoggedInUserCredits(selectedDrinks, userId) {
    var totalPrice = 0;
    for (var k = 0; k < selectedDrinks.length; k++) {
        totalPrice += Number(selectedDrinks[k]); //Have to change the price from string to integer
    }
    var removeFromCredits = totalPrice * -1;
    /*
    This API-call will change the assets that are available for a specific user when
    performing the iou-get call. If the credits are positive it will be added to the assets,
    while a negative price will remove its' value from the credits.
     */
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=payments_append&amount="
        + removeFromCredits +"&user_id="+userId, function(data) {
        location.reload();
    });
}

/*
This function uses the infobox and populates it with an error message so that users
who do not know the pub ordering system will not try to order drinks without an account.
 */
function showErrorMessage() {
    showInfo();
    var errorHeader = "ERROR";
    var errorMessage = "You cannot order drinks without logging in first";
    document.getElementsByClassName("info-box-header")[0].innerHTML = errorHeader;
    document.getElementsByClassName("info-box-body")[0].innerHTML = errorMessage;
}

/*
Remove the selected class from all category buttons and then
add it to the pressed button so that it gets highlighted
 */
function changeCategoryColor(buttonId) {
    $('.category').removeClass('selected');
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
            // console.log(c.substring(nameEQ.length,c.length));
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