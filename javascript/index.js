/*
 This javascript-document is used to populate everything in the user's order screen.
*/


/*
Create an orderList object with a lot of different methods that will be called later on
when an user adds a drink to the order-summary. This has to be defined when the html-document
is created.
 */
var orders = new Orderlist();

$(document).ready(function() {
    //changeLoginButton();
    getDrinks();
    createEventHandlers();
});

/*
Call the iou-get-API to get the credits from the specific user. The username and password used is gotten
from the cookie that was created when the user logged in. We want to show the user's credit to
so that he/she knows how much they can order for.
 */
function getAndShowCredits(userName) {
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=" + userName + "&password=" + userName + "&action=iou_get",
        function(data) {
            var userInformation = data.payload;
            var userCredits = userInformation[0].assets;
            var creditsNode =document.getElementsByClassName("credits")[0];
            creditsNode.innerHTML = getText("credit") + ": <span class='credits-value'>" + userCredits + ":-</span>";

    });
}


/*
Call the API so that we can use the inventory information. We put each drink from the inventory
into an array called drinks. We define drinks as a global variable so that it can be called from other functions as well.
Because all the information of a specific drink is not located in the inventory_get-API we have to call another API as well.
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
This function loops through the inventory and then calls another function that gets
the specific information of that drink so that it can be displayed to the user.
 */
function getDrinksInfo(drinks) {
    for (var j = 0; j < drinks.length; j++) {
        getInfoForIndividualDrink(drinks[j]);
    }
}

/*
It is this function that calls the API to get the rest of the information. It uses the chosen
beer from for-loop in the function above and then sends that information, together with the new
information to a renderDrink-function that then can create html-objects that are shows to the user.
 */
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
    var dragDrinkId = ev.target.getAttribute("data-beer-id"); //get the drinkId

    ev.dataTransfer.setData("dragDrinkId", dragDrinkId);


}

/*
Allows a drink-div to be dropped into the order-summary side of the page. If this
function is not called it won't be droppable. Go
 */
function allowDrop(ev) {
    ev.preventDefault();

}

/*
When a drink is dropped it has to give the drinkId. We then call the findDrinkById-function
to get the drinkPrice and drinkName so thatwe can show the correct information in
the order summary. To show the added drinks we call the order.addItem-function that we created.
 */
function drop(ev) {
    ev.preventDefault();
    var draggedDrinkId = ev.dataTransfer.getData("dragDrinkId");

    var correctDrinkInfo = findDrinkById(draggedDrinkId);
    // console.log(correctDrinkInfo);
    var draggedDrinkName = correctDrinkInfo.namn;
    var secondDraggedDrinkName = correctDrinkInfo.namn2;
    var draggedDrinkPriceInt = Number(correctDrinkInfo.pub_price);
    if (findDrinkRowById(draggedDrinkId) == false){ //If the added drink is not already in the order summary.
        orders.addItem(new Beverage({id: draggedDrinkId, name: draggedDrinkName, name2: secondDraggedDrinkName, quantity: 1,  price: draggedDrinkPriceInt}));
    }
    else { //If it's already in the summary just increase the quantity.
        orders.increase(draggedDrinkId);
    }
    drawOrderList(orders.showItems());

}

/*
This function is used to just get information about a specific drink. If you have the
drinkId you can call this function and get the rest of the information that is located
in the inventory_get-API for the specific drink.
 */
function findDrinkById(drinkId) {
    for (var i = 0; i < drinks.length; i++) {
        if (drinkId == drinks[i].beer_id) {
            return drinks[i];
        }
    }
}



/* Loop each item in the inventory and add it to the html.
   The procedure is done by creating a lot of divs and adding beer information from
   the two different API-calls to the divs.
  This has to be done to show the selection of drinks
*/

function renderDrink(inventoryGetDrink, beerDataGetDrink) {
    // var drinkPrice = inventoryGetDrink.pub_price;
    var drinkId = beerDataGetDrink.nr; //The id of the drink


    // var drinkName = inventoryGetDrink.namn;
    var beerInfoDiv = document.createElement('div'); //Add a little information button to each div.
    beerInfoDiv.className = 'drink-info';
    beerInfoDiv.setAttribute("draggable", "true"); //Make it draggable
    beerInfoDiv.setAttribute("ondragstart", "drag(event)"); //If it is dragged call the drag-function

    beerInfoDiv.setAttribute("data-beer-id", drinkId);
    // beerInfoDiv.setAttribute("data-beer-price", drinkPrice);
    // beerInfoDiv.setAttribute("data-beer-name", drinkName);

    var beerDiv = document.createElement('div');
    beerDiv.className = "drink";

    //Get name of the drink
    var beerNameDiv = document.createElement('div');
    beerNameDiv.className = "drink-name";
    beerNameDiv.innerHTML = inventoryGetDrink.namn + "<br>";
    beerNameDiv.innerHTML += inventoryGetDrink.namn2;
    //Add the beer name to div
    beerInfoDiv.appendChild(beerNameDiv);

    //Get image for drink and add it in the if-statements for the different drink categories.
    var beerImage = document.createElement('div');
    beerImage.className = 'drink-image';


    //Get alcohol % of drink and add it
    var alcDiv = document.createElement('div');
    alcDiv.className = "alcohol";
    alcDiv.innerHTML = beerDataGetDrink.alkoholhalt;
    beerInfoDiv.appendChild(alcDiv);

    //Get the price of drink and add it
    var priceDiv = document.createElement('div');
    priceDiv.className = "drink-price-div";
    priceDiv.innerHTML = inventoryGetDrink.pub_price + ":-";
    beerInfoDiv.appendChild(priceDiv);

    //Add the information button
    var infoButtonDiv = document.createElement('div');
    infoButtonDiv.className = "info-button";
    infoButtonDiv.innerHTML = "?";
    beerInfoDiv.appendChild(infoButtonDiv);

    beerDiv.appendChild(beerInfoDiv);

    /*
    Add plus and minus buttons to each drink so that an user can use these
    to change the quantity of their order.
     */
    var quantityControls =
        "<div class='drink-quantity'>" +
        "<button type='button' class='change-quantity decrease'>-</button>" +
        "<span class='current-quantity'>0</span>" +
        "<button type='button' class='change-quantity increase'>+</button>" +
        "</div>";
    $(beerDiv).append(quantityControls);


    /*
    Check if a drink is in stock or not. If it is not in stock then add another div
    above it that grays it out together with an "out-of-order"-text on top of the div.
    This is used so that an user cannot order a drink that is out of stock.
     */

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

    /*
     Get the drink information from each drink. Compare it to the
     type of drink it is in the database. Depending on what type of
     drink it is put the drink intodifferent tabs on the webpage.
     The parsing into tabs is done by four different if-statement - one for each tab.
     */
    var drinkType = beerDataGetDrink.varugrupp;

    if (drinkType.includes("Alkoholfritt")) {//Alkoholfritt first because a drink can both be alcoholfree and a beer.
        beerImage.innerHTML = '<img src="resources/soda.png" draggable="false">';
        beerInfoDiv.appendChild(beerImage);
        document.getElementsByClassName("na-grid")[0]
            .appendChild(beerDiv);
    }
    else if (drinkType.includes("Rött vin") || drinkType.includes("Vitt vin")) {
        beerImage.innerHTML = '<img src="resources/wine.png" draggable="false">';
        beerInfoDiv.appendChild(beerImage);
        document.getElementsByClassName("wine-grid")[0]
            .appendChild(beerDiv);
    }
    else if (drinkType.includes("Cider") || drinkType.includes("Blanddrycker")) {
        beerImage.innerHTML = '<img src="resources/cider.png" draggable="false">';
        beerInfoDiv.appendChild(beerImage);
        document.getElementsByClassName("cider-grid")[0]
            .appendChild(beerDiv);
    }
    else if (drinkType.includes("Öl")) {
        beerImage.innerHTML = '<img src="resources/beer.png" draggable="false">';
        beerInfoDiv.appendChild(beerImage);
        document.getElementsByClassName("drinks-grid")[0]
            .appendChild(beerDiv);
    }
}

/*
parses the info from beer_info payload to the infobox - popup
 */
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

    if(namn2.length > 0){ //do not change anything if there isn't a second name.
        nameString += "<span class = 'namn2'>" + namn2 + "</span>";
    }

    document.getElementsByClassName("info-box-header")[0].innerHTML = nameString;

    var bodyString = " "+ getText("ecological") + ": ";
    /*
    We have to add yes or no to the ecological part so we check if it is ecological or not
    and then add the yes or no-part.
     */
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

/*
The specific drinkId is located inside each div and when the information-button is pressed
we call the API to get more information about the drink so that it can be shown in an
information pop-up.
 */
function getBeerInfo(beer_id){
     // alert("You clicked on a drink - " + beer_id);
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=beer_data_get&beer_id="
        + beer_id, function(data) {
        parseBeerInfo(data.payload); //call the function that created the information.
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

    //When you click on one of the info-buttons it has to get the drinkId and then
    //show the overlay and information pop up together with the content.
    $(document).on('click', '.info-button', function() {
        var beerId = $(this).parent()[0].getAttribute('data-beer-id');
        getBeerInfo(beerId);
        showInfo();
    });
    //When the X is pressed on the info-pop up hide it.
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


    //you can also hide the overlay and info pop-up by pressing anywhere else on the
    //screen except the info pop-up itself.
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
    
    //on click increase quantity for one line in orderlist
    $(document).on('click', '.increase-ol', function(){
        var bevId = $(this).closest('.ordered-drink-row').attr('beverageid');
        orders.increase(bevId);
        drawOrderList(orders.showItems());
    });

    //on click increase quantity for one line in orderlist
    $(document).on('click', ".change-quantity.increase", function(){
        var bevId = $(this).parent().prev().attr("data-beer-id");
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
        var bevId = $(this).parent().prev().attr("data-beer-id");
        orders.decrease(bevId);
        drawOrderList(orders.showItems());
    });

    //on click decrease quantity for one line in orderlist
    $(document).on('click', '.decrease-ol', function(){
        var bevId = $(this).closest('.ordered-drink-row').attr('beverageid');
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
    $(document).on('click', '.cancel', function(){
        orders.cancelOrder();
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
    When the order-button is pressed it first of all checks if the user is logged in (you cannot
    order without logging in). Then it checks if there is an item in the orderList. If it does not exist
    show an error message to the user. Otherwise use the logged in user's username together with the
    orders and complete the purchase.
     */
    $(document).on('click', '.order-button', function() {
        var isLoggedIn = readCookie('uid');
        if (isLoggedIn) { //An user can't make a purchase if he/she is not logged in
            var myUserArray = isLoggedIn.split('|'); //userId and userName are split by a "|"
            var userId = myUserArray[0]; //Get the userId from the array.
            var userName = myUserArray[1];

            var orderList= orders.showItems();
            if (orderList.length < 1) {
                showZeroDrinksErrorMessage();
            }
            else{
                addOrderToSystem(orderList, userName);
            }
        }
        else showErrorMessage();
    });

    $(document).on('click', '.close-info-box-confirmation', function () {
        hideErrorAndConfirmationOverlay();
    })
}



/*
This functions calls the purchase_append API. For each drink in the order summary
the API is called and if there are two or more of the same beer it goes into an if-statement
where it calls the API as many times as the number of beers ordered. It also updates the
logged in user's credits at the same time so that the user knows that the order actally was
performed. The order is also shown on the bartender screen.
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

    for (var i = 0; i < orderList.length; i++) {
        var singleDrink = orderList[i];
        var singleDrinkName = singleDrink[1];
        var drinkQuantity = singleDrink[2];
        var drinkPrice = singleDrink[3];

        totalPrice += drinkPrice*drinkQuantity; //add to the total price.

        confirmationBody.innerHTML += + drinkQuantity + " x " + singleDrinkName + "<br>";
    }
    confirmationBody.innerHTML += getText("confirmation-box-body2") + totalPrice + ":-";

    var confirmationButton = document.createElement('button');
    confirmationButton.className = "confirmation-button";


    confirmationButton.innerHTML = getText("confirmation-button");
    confirmationButton.onclick = function() { //if the accept button is clicked.
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
his/her orders first, since you have to add an item before ordering.
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
Remove the selected class from all category buttons at the top of the menu and then
add it to the pressed button so that it gets highlighted with the "active" blue-color
 */
function changeCategoryColor(buttonId) {
    $('.category').removeClass('selected');
    $('#' +buttonId).addClass('selected');
    showCorrectCategory(buttonId);
}

/*
The function first hides all the different drink category grids.
It then checks which category-button the user pressed so that it can
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
