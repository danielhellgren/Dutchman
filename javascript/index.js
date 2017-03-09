/* To be able to show the beer names from the API
 we have to make a JSON query and from there add each
   beer name to divs with class=drink*/

var orders = new Orderlist();

$(document).ready(function() {
    //changeLoginButton();
    getDrinks();
    createEventHandlers();
});

function getAndShowCredits(userName) {
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=" + userName + "&password=" + userName + "&action=iou_get",
        function(data) {
            var userInformation = data.payload;
            var userCredits = userInformation[0].assets;
            var creditsNode =document.getElementsByClassName("credits")[0];
            creditsNode.innerHTML = getText("credit") + ": " + userCredits + ":-";

    });
}


/*Call the API so that we can use the inventory information.
For each drink we have to get its information so that we know
in which tab we are gonna put it.
*/

function getDrinks() {
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=inventory_get",
    function(data) {
        drinks = [];
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

        renderDrink(inventoryGetDrink, beerDataGetDrink);
    });
}

/*
Takes the data from the div that is dragged at the moment. The data that is taken is the
beerId and the beerPrice. This data is then needed in the order summary to show the correct
drinks and then to be able to call the different APIs when a purchase is being completed.
 */
function drag(ev) {
    var dragDrinkId = ev.target.getAttribute("data-beer-id");
    // var dragDrinkPrice = ev.target.getAttribute("data-beer-price");
    // var dragDrinkName = ev.target.getAttribute("data-beer-name");
    ev.dataTransfer.setData("dragDrinkId", dragDrinkId);
    // ev.dataTransfer.setData("dragDrinkPrice", dragDrinkPrice);
    // ev.dataTransfer.setData("dragDrinkName", dragDrinkName);
    // console.log("Div is dragged");
}

/*
Allows a drink-div to be dropped into the order-summary side of the page
 */
function allowDrop(ev) {
    ev.preventDefault();

}

/*
When a drink is dropped it has to give the drinkId, drinkPrice and drinkName so that
we can show the correct information in the order summary.
 */
function drop(ev) {
    ev.preventDefault();
    var draggedDrinkId = ev.dataTransfer.getData("dragDrinkId");
    var draggedDrinkPriceString = ev.dataTransfer.getData("dragDrinkPrice");
    var draggedDrinkPriceInt = Number(draggedDrinkPriceString); //Convert the price into an integer
    // var draggedDrinkName = ev.dataTransfer.getData("dragDrinkName");
    // console.log("Div is dropped");
    console.log(draggedDrinkId);
    console.log(draggedDrinkPriceString);
    var correctDrinkInfo = findDrinkById(draggedDrinkId);
    // console.log(correctDrinkInfo);
    var draggedDrinkName = correctDrinkInfo.namn;
    var secondDraggedDrinkName = correctDrinkInfo.namn2;
    var draggedDrinkPriceInt = Number(correctDrinkInfo.pub_price);
    if (findDrinkRowById(draggedDrinkId) == false){
        orders.addItem(new Beverage({id: draggedDrinkId, name: draggedDrinkName, name2: secondDraggedDrinkName,quantity: 1,  price: draggedDrinkPriceInt}));
    }
    else {
        orders.increase(draggedDrinkId);
    }
    drawOrderList(orders.showItems());

}

function findDrinkById(drinkId) {
    for (var i = 0; i < drinks.length; i++) {
        if (drinkId == drinks[i].beer_id) {
            return drinks[i];
        }
    }
}

/* Loop each item in the inventory and add it to the html.
  This has to be done to show the selection of drinks */
function renderDrink(inventoryGetDrink, beerDataGetDrink) {
    // var drinkPrice = inventoryGetDrink.pub_price;
    var drinkId = beerDataGetDrink.nr;


    // var drinkName = inventoryGetDrink.namn;
    var beerInfoDiv = document.createElement('div');
    beerInfoDiv.className = 'drink-info';
    beerInfoDiv.setAttribute("draggable", "true"); //Make it draggable
    beerInfoDiv.setAttribute("ondragstart", "drag(event)");

    beerInfoDiv.setAttribute("data-beer-id", drinkId);
    // beerInfoDiv.setAttribute("data-beer-price", drinkPrice);
    // beerInfoDiv.setAttribute("data-beer-name", drinkName);

    var beerDiv = document.createElement('div');
    beerDiv.className = "drink";

    //Get name of beer
    var beerNameDiv = document.createElement('div');
    beerNameDiv.className = "drink-name";
    beerNameDiv.innerHTML = inventoryGetDrink.namn + "<br>";
    beerNameDiv.innerHTML += inventoryGetDrink.namn2;
    //Add the beer name to div
    beerInfoDiv.appendChild(beerNameDiv);

    //Get image for beer
    var beerImage = document.createElement('div');
    beerImage.className = 'drink-image';

    beerImage.innerHTML = '<img src="resources/beer.png" draggable="false">';
    beerInfoDiv.appendChild(beerImage);

    //Get alcohol % of beer
    var alcDiv = document.createElement('div');
    alcDiv.className = "alcohol";
    alcDiv.innerHTML = beerDataGetDrink.alkoholhalt;
    beerInfoDiv.appendChild(alcDiv);

    //Add the information button
    var infoButtonDiv = document.createElement('div');
    infoButtonDiv.className = "info-button";
    infoButtonDiv.innerHTML = "?";
    beerInfoDiv.appendChild(infoButtonDiv);

    beerDiv.appendChild(beerInfoDiv);


    var quantityControls =
        "<div class='drink-quantity'>" +
        "<button type='button' class='change-quantity decrease'>-</button>" +
        "<span class='current-quantity'>0</span>" +
        "<button type='button' class='change-quantity increase'>+</button>" +
        "</div>";
    $(beerDiv).append(quantityControls);


    var drinkType = beerDataGetDrink.varugrupp;

    var stockInfoString = inventoryGetDrink.count;
    var stockInfoInt = Number(stockInfoString);
    if (stockInfoInt < 1) { //If the drink isn't in stock.
        var outOfStockDiv = document.createElement('div');
        outOfStockDiv.className = 'out-of-stock-drink';
        beerDiv.appendChild(outOfStockDiv);
        var notInStockTextDiv = document.createElement('div');
        notInStockTextDiv.className = 'out-of-stock-text';
        notInStockTextDiv.innerHTML = getText("not-in-stock");
        outOfStockDiv.appendChild(notInStockTextDiv);

    }

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

    var namn = beer_info[0].namn;
    var nameString = "<span class = 'namn'>" + namn + "</span>";

    var namn2 = beer_info[0].namn2;

    if(namn2.length > 0){
        nameString += "<span class = 'namn2'>" + namn2 + "</span>";
    }

    document.getElementsByClassName("info-box-header")[0].innerHTML = nameString;

    var bodyString = " "+ getText("ecological") + ": ";
    if(beer_info[0].ekologisk == "1"){
            bodyString += getText("yes");
    }
    else {
        bodyString +=  getText("no");
    }

    //Alcoholic percent
    bodyString += "<br><br>" + getText("alcohol") + ": " + beer_info[0].alkoholhalt;
    // // GROUP
    bodyString += "<br><br>"+ getText("tags") +": " + beer_info[0].varugrupp;
    // //Origin country
    bodyString += "<br><br>" + getText("country") + ": " + beer_info[0].ursprunglandnamn ;
    //Price
    var correctPrice = findDrinkById(beer_info[0].nr);
    bodyString += "<br><br>" + getText("price") + ": " + correctPrice.pub_price + ":-";
    // bodyString += "<br><br>" + getText("price") + ": " + beer_info[0].prisinklmoms ;
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
    var overlay = document.getElementsByClassName("overlay")[0];
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

    //if the orderlist is not empty the user gets a warning message window
    // before redirecting to another page
    // that would result in a loss of the orderlist
    $(window).bind('beforeunload', function(){
        var num = orders.showItems().length;
        console.log(num);
        if(num > 0) {
            return getText("leave-confirm");
        }
    });
        // window.onbeforeunload = function () {
        //     if(orders.length > 0) {
        //         return 'Are you sure you want to leave?';
        //     }
        // };


    $(document).on('click', 'window', function(event) {
        var overlay = document.getElementsByClassName("overlay")[0];
        if(event.target == overlay){
            hideInfo(overlay);
        }
    });

    // $(document).on('click', '.language', function() {
    //     var dir;
    //     if(lang=="se"){
    //         dir = "en";
    //     }
    //
    // }

    // This event handler listens to the category buttons and if one of
    // them is pressed it has to change the view and change the color
    // of the highlighted button.
    $(document).on('click', '.category', function() {
        changeCategoryColor(this.id);
    });
    
    //on click increase quantity for one line in orderlist
    $(document).on('click', '.increase-ol', function(){
        var bevId = $(this).parent().parent().attr('beverageid');
        orders.increase(bevId);
        drawOrderList(orders.showItems());
    });
    //on click increase quantity for one line in orderlist
    $(document).on('click', ".change-quantity.increase", function(){
        console.log("increase");
        var bevId = $(this).parent().prev().attr("data-beer-id");
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
        var bevId = $(this).parent().prev().attr("data-beer-id");
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
    $(document).on('click', '.cancel', function(){
        orders.cancelOrder();
        console.log("Undo " + JSON.stringify(orders.debugUndo()));
        console.log("Redo " + JSON.stringify(orders.debugRedo()));
        drawOrderList(orders.showItems());
    })


    /*
     Each time the login/logout-button is pressed the userId-cookie
     will be deleted. The login/logout-button's hyperref will also
     be changed if the user is logged in. Instead of taking the user
     to the login-screen the page will be reloaded and the user is
     not logged in anympre. */

    $(document).on('click', '.login-button', function() {
        var loggedIn = readCookie("uid");
        if (loggedIn) {
            document.getElementsByClassName("login-link")[0].href = "index.html" + langRef();
        }
        eraseCookie("uid");
    });

    /*
    When the order-button is pressed a function that checks which checkboxes are filled.
     */
    $(document).on('click', '.order-button', function() {
        var isLoggedIn = readCookie('uid');
        if (isLoggedIn) { //An user can't make a purchase if he/she is not logged in
            var myUserArray = isLoggedIn.split('|'); //userId and userName are split by a "|"
            var userId = myUserArray[0]; //Get the userId from the array.
            var userName = myUserArray[1];
            // var selectedDrinks = []; //Create an array to store all the checked drinks.
            /*$('.drink-checkbox:checked').each(function () {
                selectedDrinks.push(this.value);

            }); */
            var orderList= orders.showItems();
            if (orderList.length < 1) {
                showZeroDrinksErrorMessage();
            }

            //changeLoggedInUserCredits(orderList, userId);
            //console.log(orderList);
            else{
                addOrderToSystem(orderList, userName);
            }

            //location.reload(); //reload the page after an order has been created
        }
        else showErrorMessage();
    });

    // $(document).on('click', 'confirmation-button', function() {
    //    location.reload();
    // });



}



/*
This functions calls the purchase_append API. For each drink in the order summary
the API is called and if there are two or more of the same beer it goes into an if-statement
where it calls the API as many times as the number of beers ordered. It also updates the
logged in user's credits at the same time.
 */
function addOrderToSystem(orderList, userName) {
    for (var i = 0; i < orderList.length; i++) {
        var singleDrink = orderList[i];
        var singleDrinkId = singleDrink[0];
        console.log("drinkid = " + singleDrinkId);
        var quantity = singleDrink[2];
        if (quantity > 1) { //If a customer orders two or more of a single beer.
            for (var j = 0; j < quantity; j++) {
                $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=" + userName + "&password=" + userName + "&action=purchases_append&beer_id=" + singleDrinkId,
                    function(data) {
                });
            }
        }
        else {
            $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username="+userName+"&password="+userName+"&action=purchases_append&beer_id=" + singleDrinkId,
                function(data) {
            });
        }
    }
    showConfirmationMessage(orderList);
}

/*
Firstly the function creates the total price of the order and then it performs the payment_append
API-call so that the credits for the logged in user is changed. Then reload the page so that the right
updated amount of credits are shown to the user.
 */
function changeLoggedInUserCredits(orderList, userId) {
    var totalPrice = 0;
    for (var j = 0; j < orderList.length; j++) {
        var singleDrink = orderList[j];
        var quantity= singleDrink[2];
        var price = singleDrink[3];

        totalPrice += quantity*price;
    }
    var removeFromCredits = totalPrice * -1;
    //console.log(removeFromCredits);
    /*
    This API-call will change the assets that are available for a specific user when
    performing the iou-get call. If the credits are positive it will be added to the assets,
    while a negative price will remove its' value from the credits.
     */
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=payments_append&amount="
        + removeFromCredits + "&user_id=" + userId, function(data) {


    });
}

/*
This function created an overlay that darkens the screen behind it so that a
pop-up box can be shown
 */
function showErrorAndConfirmationOverlay() {
    var overlay = document.getElementsByClassName("confirmation-overlay")[0];
    overlay.style.display = "block";
}

/*
This function hides the overlay when a button is pressed.
 */
function hideErrorAndConfirmationOverlay() {
    var overlay = document.getElementsByClassName("confirmation-overlay")[0];
    overlay.style.display = "none";
}

/*
This function shows a confirmation message to the customer. In the confirmation message
the drinks ordered together with the total price will be shown so that the customer knows
what he/she ordered. When the customer has gone through the message he/she has to press
accept to be taken back to the main screen.
 */
function showConfirmationMessage(orderList) {
    showErrorAndConfirmationOverlay();
    var confirmationHeader = document.getElementsByClassName("confirmation-box-header")[0];
    var confirmationBody = document.getElementsByClassName("confirmation-box-body")[0];

    confirmationHeader.innerHTML = getText("confirmation-box-header");
    confirmationBody.innerHTML = getText("confirmation-box-body1") + "<br>";

    var totalPrice = 0;
    console.log("orderlist length" + orderList);
    for (var i = 0; i < orderList.length; i++) {
        var singleDrink = orderList[i];
        var singleDrinkName = singleDrink[1];
        var drinkQuantity = singleDrink[2];
        var drinkPrice = singleDrink[3];

        totalPrice += drinkPrice*drinkQuantity;

        confirmationBody.innerHTML += + drinkQuantity + " x " + singleDrinkName + "<br>";
    }
    confirmationBody.innerHTML += getText("confirmation-box-body2") + totalPrice + ":-";

    var confirmationButton = document.createElement('button');
    confirmationButton.className = "confirmation-button";


    confirmationButton.innerHTML = getText("confirmation-button");
    confirmationButton.onclick = function() {
        //clear orderlist and reload page
        orders.cancelOrder();
        drawOrderList(orders.showItems());
        location.reload();
    };
    confirmationBody.appendChild(confirmationButton);
}

/*
This function uses the overlay and populates it with an error message so that users
who do not know the pub ordering system will not try to order drinks without an account.
 */
function showErrorMessage() {
    showErrorAndConfirmationOverlay();
    var errorHeader = getText("error-header");
    var errorMessage = getText("error-drink-order");
    document.getElementsByClassName("confirmation-box-header")[0].innerHTML = errorHeader;
    document.getElementsByClassName("confirmation-box-body")[0].innerHTML = errorMessage;

    var confirmationButton = document.createElement('button');
    confirmationButton.className = "confirmation-button";

    confirmationButton.innerHTML = getText("confirmation-button");
    confirmationButton.onclick = function() {
        hideErrorAndConfirmationOverlay();
    };

    document.getElementsByClassName("confirmation-box-body")[0].appendChild(confirmationButton);
}
/*
This function is called if an user presses the order button without adding something to
his/her orders first, since you have to be a regular and have an account to be able to
order from the system.
 */
function showZeroDrinksErrorMessage() {
    console.log("zero function is called");
    showErrorAndConfirmationOverlay();
    var errorHeader = getText("error-header");
    var errorMessage = getText("error-zero-drink-order");
    document.getElementsByClassName("confirmation-box-header")[0].innerHTML = errorHeader;
    document.getElementsByClassName("confirmation-box-body")[0].innerHTML = errorMessage;

    var confirmationButton = document.createElement('button');
    confirmationButton.className = "confirmation-button";

    confirmationButton.innerHTML = getText("confirmation-button");
    confirmationButton.onclick = function() {
        hideErrorAndConfirmationOverlay();
    };
    document.getElementsByClassName("confirmation-box-body")[0].appendChild(confirmationButton);
}

/*
Remove the selected class from all category buttons and then
add it to the pressed button so that it gets highlighted with the "active" blue-color
 */
function changeCategoryColor(buttonId) {
    $('.category').removeClass('selected');
    $('#' +buttonId).addClass('selected');
    showCorrectCategory(buttonId);
}

/*
The function first hides all the different drink category grids.
It then checks which button the user pressed so that it can
show the appropriate grid with the appropriate drinks inside.
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
function drag2(ev) {
    var dragDrinkId = ev.target.getAttribute("beverageid");
    // var dragDrinkPrice = ev.target.getAttribute("data-beer-price");
    // var dragDrinkName = ev.target.getAttribute("data-beer-name");
    ev.dataTransfer.setData("beverageid", dragDrinkId);
    // ev.dataTransfer.setData("dragDrinkPrice", dragDrinkPrice);
    // ev.dataTransfer.setData("dragDrinkName", dragDrinkName);
    console.log("Div is dragged");
}
*/
/*
 Allows a drink-div to be dropped into the order-summary side of the page
 */
/*
function allowDrop2(ev) {
    ev.preventDefault();
}
*/
/*
 When a drink is dropped it has to give the drinkId, drinkPrice and drinkName so that
 we can show the correct information in the order summary.
 */
/*
function drop2(ev) {
    ev.preventDefault();
    var draggedDrinkId = ev.dataTransfer.getData("dragDrinkId");
    // var draggedDrinkPriceString = ev.dataTransfer.getData("dragDrinkPrice");
    // var draggedDrinkPriceInt = Number(draggedDrinkPriceString); //Convert the price into an integer
    // var draggedDrinkName = ev.dataTransfer.getData("dragDrinkName");
    // console.log("Div is dropped");
    console.log(draggedDrinkId);
    //console.log(draggedDrinkPrice);
    var correctDrinkInfo = findDrinkById(draggedDrinkId);
    // console.log(correctDrinkInfo);
    var draggedDrinkName = correctDrinkInfo.namn;
    var secondDraggedDrinkName = correctDrinkInfo.namn2;

    orders.addItem(new Beverage({id: draggedDrinkId, name: draggedDrinkName, name2: secondDraggedDrinkName, quantity: 1}));
    drawOrderList(orders.showItems());

}
*/