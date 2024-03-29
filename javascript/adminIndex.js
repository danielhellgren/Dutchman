/*
This document behaves in a similar way as index.js. It creates information for different drinks
together with tabs for the different drink-categories in the bartender view of the application.
 */

var orders = new Orderlist();
var drinks = [];

$(document).ready(function() {
    getDrinks();
    createEventHandlers();
});

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
            for (var i = 0; i< data.payload.length; i++) {
                if (data.payload[i].namn !=="") { //remove drinks with no name.
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
        renderDrinks(inventoryGetDrink, beerDataGetDrink);
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
    beerNameDiv.innerHTML =
        "<div class='drink-name-inner'>" +
            "<div class='namn'>" + inventoryGetDrink.namn + "</div>" +
            "<div class='namn2'>" + inventoryGetDrink.namn2 + "</div>" +
        "</div>";
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

    // Add to different tabs depending on drink category.
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

    //Add a plus button next to each drink so that it can be added to the order summary
    var qDiv = document.createElement('div');
    qDiv.className = 'order-drink';
    var quantityControls =
        "<div class='drink-quantity'>" +
        "<button type='button' class='change-quantity increase'>+</button>" +
        "</div>";

    qDiv.innerHTML = quantityControls;
    beerDiv.appendChild(qDiv);

    //Add a small grey box if the drink isn't in stock.
    if (inventoryGetDrink.count < 1) {
        var outOfStockDiv = document.createElement('div');
        outOfStockDiv.className = 'admin-out-of-stock';
        qDiv.appendChild(outOfStockDiv);
    }
}


function createEventHandlers() {
    //logs out
    $(document).on('click', '.login-button', function() {
        eraseCookie("uid");
    });

    //Changes beverage category
    $(document).on('click', '.category', function() {
        changeCategoryColor(this.id);
    });

    // show the payment screen when the order button is pressed
    $(document).on('click', '.order-button-admin', function () { //THIS IS NOT WORKING
        showPaymentDiv();
    });

    //numpad paybutton when entering cash payment
    $(document).on('click', '.numpad-button', function () {
       var inputForm = document.getElementsByClassName('added-payment')[0];
       inputForm.value += this.value;
    });

    //Erase the values entered when doing a cash payment
    $(document).on('click', '.numpad-erase-button', function () {
       var inputForm =  document.getElementsByClassName('added-payment')[0];
        inputForm.value = "";
    });

    //button to simulate credit card payment
    $(document).on('click', '.credit-card-button', function () {
        location.reload();
    });

    //Increase quantity of a beverage in orderlist
    $(document).on('click', '.increase-ol', function(){
        var bevId = $(this).parent().parent().attr('beverageid');
        orders.increase(bevId);
        drawOrderList(orders.showItems());
    });
    //on click increase quantity for one line in orderlist
    $(document).on('click', ".change-quantity.increase", function(){
        var bevId = $(this).parent().parent().parent().attr("data-beer-id");
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
        var bevId = $(this).parent().parent().parent().attr("data-beer-id");
        orders.decrease(bevId);
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
        drawOrderList(orders.showItems());
    });

    //on click undo one step
    $(document).on('click', '.undo', function(){
        orders.undo();
        drawOrderList(orders.showItems());
    });

    //on click redo a step
    $(document).on('click', '.redo', function(){
        orders.redo();
        drawOrderList(orders.showItems());
    });

    //on click remove everything from order
    $(document).on('click', '.cancel', function() {
        orders.cancelOrder();
        drawOrderList(orders.showItems());
    });

    /*
    If a customer pays with cash the drinks ordered and the payment entered will be used when
    calling the completePurchase-function.
     */
    $(document).on('click', '.cash-pay-button', function () {
        var orderList = orders.showItems();
        var enteredPayment = document.getElementsByClassName('added-payment')[0].value;
        completeAdminPurchase(orderList,enteredPayment);
    });
}

/*
Put another div on top of the menu where the admin can put in information about the payment.
 */
function showPaymentDiv() {
    var paymentDiv = document.getElementsByClassName("payment")[0];
    paymentDiv.style.display = "block";
}

/*
Calculate the total amount of the order and check the entered amount so that it can look
if the entered amount is less than the total. If it is less then the payment will not go through.
 */
function completeAdminPurchase(orderList, enteredPayment) {
    var totalAmount = 0;
    for (var i = 0; i < orderList.length; i++) {
        var singleDrink = orderList[i];
        var singleDrinkQuantity = singleDrink[2];
        var singleDrinkPrice = singleDrink[3];
        var priceForDrink = singleDrinkQuantity*singleDrinkPrice;
        totalAmount += priceForDrink;
    }
    if (enteredPayment < totalAmount) { //Give an error message.
        var errorText = document.getElementsByClassName('entered-payment-error')[0];
        errorText.style.color = "red";
    }
    else { //the entered payment was enough.
        showConfirmationMessageAndChange(enteredPayment, totalAmount);
    }
}

/*
Show a pop-up with a confimration message that the order was completed. The message also
shows the change if the order was payed with cash so that the bartender doesn't have to
calculate it himself/herself.
 */
function showConfirmationMessageAndChange(enteredPayment, totalAmount) {
    var overlay = document.getElementsByClassName("confirmation-overlay")[0];
    overlay.style.display = "block";

    var confirmationHeader = document.getElementsByClassName("confirmation-box-header")[0];
    var confirmationBody = document.getElementsByClassName("confirmation-box-body")[0];

    confirmationHeader.innerHTML = getText("confirmation-change-header");
    confirmationBody.innerHTML = getText("confirmation-change-body1") + enteredPayment + ":-" + "<br>";
    var change = enteredPayment - totalAmount;
    confirmationBody.innerHTML += getText("confirmation-change-body2") + change + ":-";

    var confirmationButton = document.createElement('button');
    confirmationButton.className = "confirmation-button";

    confirmationButton.innerHTML = getText("confirmation-button");
    confirmationButton.onclick = function() { //when the accept button is pressed.
        //clear orderlist and reload page
        orders.cancelOrder();
        drawOrderList(orders.showItems());
        location.reload();
    };
    confirmationBody.appendChild(confirmationButton);

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
Here are the same three cookie functions as in the index.js-file
 */
function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) {
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