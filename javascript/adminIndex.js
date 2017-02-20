$(document).ready(function() {
    changeLoginButton();
    getDrinks();
    createEventHandlers2();
    createEventHandlers3();
});

function changeLoginButton() {
    var isCookie = readCookie("uid");
    if (isCookie) {
        var buttonNode = document.getElementsByClassName("login-button")[0];
        buttonNode.innerHTML = "Logout";
    }
}

/*
Gets all the different drinks that has a name.
 */
function getDrinks() {
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=inventory_get",
        /* Returns array of objects like:
         {
             "namn": "BEO",
             "namn2": "Apple Green Tea",
             "sbl_price": "12.90",
             "pub_price": "15",
             "beer_id": "197702",
             "count": "-3",
             "price": "12.90"
         }, */
        function(data) {
            var drinks = [];
            for (var i = 0; i< data.payload.length; i++) {
                if (data.payload[i].namn !=="") { //remove drinks with no name.
                    //drinkId[i-7] = data.payload[i].beer_id;
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
    //var inventoryGetDrink = drinks[j];
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
        var drinkType = beerDataGetDrink.varugrupp;
        //var drinkType = drinkTypeReal.split(',')[0]; //remove everything after a "," from the drink type description

        //if (drinkType.includes("Alkoholfritt")) {
        //    parseNonAlcoholic(beerDataGetDrink);
        //}
        //else if (drinkType.includes("Rött vin") || drinkType.includes("Vitt vin")) {
        //    parseWine(beerDataGetDrink);
        //}
        //else if (drinkType.includes("Cider") || drinkType.includes("Blanddrycker")) {
        //    parseCider(beerDataGetDrink);
        //}
        if (drinkType.includes("Öl")) {
            renderBeer(inventoryGetDrink, beerDataGetDrink);
        }
    });
}

/* Loop each item in the inventory and add it to the html.
 This has to be done to show the selection of drinks */
function renderBeer(inventoryGetDrink, beerDataGetDrink) {
    //console.log("In renderBeer()")
    //console.log(inventoryGetDrink)
    //console.log(beerDataGetDrink)

    var beerDiv = document.createElement('div');
    beerDiv.className = "drink";
    //beerDiv.setAttribute("data-beer-id",beers[i].nr);

    var priceDiv = document.createElement('div');
    var stockDiv = document.createElement('div');
    priceDiv.className = "price";
    stockDiv.className = "stock";

    //Get name of beer
    var beerNameDiv = document.createElement('div');
    beerNameDiv.className = "drink-name";
    beerNameDiv.innerHTML = beer[i].namn + "<br>";
    beerNameDiv.innerHTML += beer[i].namn2;
    //Add the beer name to div
    beerDiv.appendChild(beerNameDiv);

    //Get alcohol % of beer
    var alcDiv = document.createElement('div');
    alcDiv.className = "alcohol";
    alcDiv.innerHTML = beer[i].alkoholhalt;
    beerDiv.appendChild(alcDiv);

    //Get price and stock of beer
    // getDrinkStockPrice(beers[i].nr),i;

    document.getElementsByClassName("drinks-grid")[0]
        .appendChild(beerDiv);
}

function parseWine(wines) {
    for (var i = 0; i < wines.length; i++) {
        var wineDiv = document.createElement('div');
        wineDiv.className = "drink";
        //beerDiv.setAttribute("data-beer-id",beers[i].nr);

        //Get name of beer
        var wineNameDiv = document.createElement('div');
        wineNameDiv.className = "drink-name";
        wineNameDiv.innerHTML = wines[i].namn + "<br>";
        wineNameDiv.innerHTML += wines[i].namn2;
        //Add the beer name to div
        wineDiv.appendChild(wineNameDiv);

        //Get alcohol % of beer
        var alcDiv = document.createElement('div');
        alcDiv.className = "alcohol";
        alcDiv.innerHTML = wines[i].alkoholhalt;
        wineDiv.appendChild(alcDiv);

        document.getElementsByClassName("wine-grid")[0]
            .appendChild(wineDiv);
    }
}

function parseCider(ciders) {
    for (var i = 0; i < ciders.length; i++) {
        var ciderDiv = document.createElement('div');
        ciderDiv.className = "drink";
        //beerDiv.setAttribute("data-beer-id",beers[i].nr);

        //Get name of beer
        var ciderNameDiv = document.createElement('div');
        ciderNameDiv.className = "drink-name";
        ciderNameDiv.innerHTML = ciders[i].namn + "<br>";
        ciderNameDiv.innerHTML += ciders[i].namn2;
        //Add the beer name to div
        ciderDiv.appendChild(ciderNameDiv);

        //Get alcohol % of beer
        var alcDiv = document.createElement('div');
        alcDiv.className = "alcohol";
        alcDiv.innerHTML = ciders[i].alkoholhalt;
        ciderDiv.appendChild(alcDiv);



        document.getElementsByClassName("cider-grid")[0]
            .appendChild(ciderDiv);
    }
}

function parseNonAlcoholic(nas) {
    for (var i = 0; i < nas.length; i++) {
        var nasDiv = document.createElement('div');
        nasDiv.className = "drink";
        //beerDiv.setAttribute("data-beer-id",beers[i].nr);

        //Get name of beer
        var nasNameDiv = document.createElement('div');
        nasNameDiv.className = "drink-name";
        nasNameDiv.innerHTML = nas[i].namn + "<br>";
        nasNameDiv.innerHTML += nas[i].namn2;
        //Add the beer name to div
        nasDiv.appendChild(nasNameDiv);

        //Get alcohol % of beer
        var alcDiv = document.createElement('div');
        alcDiv.className = "alcohol";
        alcDiv.innerHTML = nas[i].alkoholhalt;
        nasDiv.appendChild(alcDiv);

        document.getElementsByClassName("na-grid")[0]
            .appendChild(nasDiv);
    }
}

function createEventHandlers2() {
    $(document).on('click', '.login-button', function() {
        eraseCookie("uid");
    });
}

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
Here are the same three cookie functions as in the index.js-file
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