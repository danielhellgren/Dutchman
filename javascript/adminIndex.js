var orders = new Orderlist();
var drinks = [];

$(document).ready(function() {
    //changeLoginButton();
    getDrinks();
    createEventHandlers();
});

//function changeLoginButton() {
//    var isCookie = readCookie("uid");
//    if (isCookie) {
//        var buttonNode = document.getElementsByClassName("login-button")[0];
//        buttonNode.innerHTML = "Logout";
//    }
//}




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
            //var drinks = [];
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
 Get the drink information from all drinks. Compare it to the
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

/*
 Get the drink information from all individual drinks. Parse the information from the two different
 API-calls into a render-drink function so that it can be showed on the website.
 */
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
        // var drinkType = beerDataGetDrink.varugrupp;
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
        // if (drinkType.includes("Öl")) {
            renderDrinks(inventoryGetDrink, beerDataGetDrink);
        // }
    });
}

function findDrinkById(drinkId) {
    for (var i = 0; i < drinks.length; i++) {
        if (drinkId == drinks[i].beer_id) {
            return drinks[i];
        }
    }
}
/* For each drink in the API create different divs and then depending on what kind of drink it is
 parse it into a specific div so that it is showed in the correct tab. */
function renderDrinks(inventoryGetDrink, beerDataGetDrink) {
    var beerDiv = document.createElement('div');
    beerDiv.className = "drink";
    beerDiv.setAttribute("data-beer-id",inventoryGetDrink.beer_id);

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

    //Get price and stock of beer
    var priceDiv = document.createElement('div');
    var stockDiv = document.createElement('div');
    priceDiv.className = "price";
    priceDiv.innerHTML = inventoryGetDrink.pub_price + ':-';
    beerDiv.appendChild(priceDiv);
    stockDiv.className = "stock";
    stockDiv.innerHTML = inventoryGetDrink.count;
    beerDiv.appendChild(stockDiv);

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
    var qDiv = document.createElement('div');
    var quantityControls =
        "<div class='drink-quantity'>" +
        "<button type='button' class='change-quantity increase'>+</button>" +
        "</div>";
    qDiv.innerHTML = quantityControls;

    beerDiv.appendChild(qDiv);
}


function createEventHandlers() {
    $(document).on('click', '.login-button', function() {
        eraseCookie("uid");
    });

    $(document).on('click', '.category', function() {
        changeCategoryColor(this.id);
    });

    $(document).on('click', '.order-button-admin', function () { //THIS IS NOT WORKING
        showPaymentDiv();
    });

    $(document).on('click', '.numpad-button', function () {
       var inputForm = document.getElementsByClassName('added-payment')[0];
       inputForm.value += this.value;
    });

    $(document).on('click', '.numpad-erase-button', function () {
       var inputForm =  document.getElementsByClassName('added-payment')[0];
       inputForm.value = "";
    });

    $(document).on('click', '.credit-card-button', function () {
        console.log("hello");
        location.reload();
    });
    $(document).on('click', '.increase-ol', function(){
        var bevId = $(this).parent().parent().attr('beverageid');
        orders.increase(bevId);
        drawOrderList(orders.showItems());
    });
    //on click increase quantity for one line in orderlist
    $(document).on('click', ".change-quantity.increase", function(){
        console.log("increase");
        var bevId = $(this).parent().parent().parent().attr("data-beer-id");
        console.log(bevId);
        var correctDrinkInfo = findDrinkById(bevId);
        var drinkName = correctDrinkInfo.namn;
        var secondDrinkName = correctDrinkInfo.namn2;
        var drinkPriceInt = Number(correctDrinkInfo.pub_price);
        if (findDrinkRowById(bevId) == false){
            orders.addItem(new Beverage({id: bevId, name: drinkName, name2: secondDrinkName,quantity: 1,  price: drinkPriceInt}));
        }
        else {
            orders.increase(bevId);
        }
        drawOrderList(orders.showItems());
    });
    //on click decrease quantity for one line in orderlist
    $(document).on('click', '.change-quantity.decrease', function(){
        console.log("decrease");
        var bevId = $(this).parent().parent().parent().attr("data-beer-id");
        console.log(bevId);
        orders.decrease(bevId);
        console.log("Undo " + JSON.stringify(orders.debugUndo()));

        drawOrderList(orders.showItems());
    });

    //on click decrease quantity for one line in orderlist
    $(document).on('click', '.decrease-ol', function(){
        var bevId = $(this).parent().parent().attr('beverageid');
        orders.decrease(bevId);
        drawOrderList(orders.showItems());
    });

    //on click to completely remove a beverage from orderlist
    $(document).on('click', '.remove', function(){
        var bevId = $(this).parent().attr('beverageid');
        orders.removeItem(bevId);
        console.log(bevId);
        drawOrderList(orders.showItems());
    });

    //on click undo one step
    $(document).on('click', '.undo', function(){
        orders.undo();
        //console.log(JSON.stringify(orders.showItems()));
        console.log("Undo " + JSON.stringify(orders.debugUndo()));
        console.log("Redo " + JSON.stringify(orders.debugRedo()));

        drawOrderList(orders.showItems());
    });

    //on click redo a step
    $(document).on('click', '.redo', function(){
        orders.redo();
        console.log("Undo " + JSON.stringify(orders.debugUndo()));
        console.log("Redo " + JSON.stringify(orders.debugRedo()));
        drawOrderList(orders.showItems());
    });

    //on click remove everything from order
    $(document).on('click', '.cancel', function() {
        orders.cancelOrder();
        console.log("Undo " + JSON.stringify(orders.debugUndo()));
        console.log("Redo " + JSON.stringify(orders.debugRedo()));
        drawOrderList(orders.showItems());
    });
}

function showPaymentDiv() {
    var paymentDiv = document.getElementsByClassName("payment")[0];
    paymentDiv.style.display = "block";
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