/* To be able to show the beer names from the API
 we have to make a JSON query and from there add each
   beer name to divs with class=drink*/

var orders = new Orderlist();
// var lexicon;
// var lang = "";

$(document).ready(function() {
    // getText("country","en");
    // $.getJSON("./language.json", function(data) {
    //     lexicon = data;
    // });
    // lang = getParameterByName("lang");
    changeLoginButton();
    getDrinks();
    createEventHandlers();


//     createEventHandlers2();
//     createEventHandlers3();
//     //just some stuff to fill the orderlist for now
//     var testbev = new Beverage(999,"test",5);
//     orders.addItem(testbev);
//     orders.addItem(new Beverage(111,"test2",12));
//     drawOrderList(orders.showItems());


});

/*
 function taken from
 http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 */
// function getParameterByName(name, url) {
//     if (!url) {
//         url = window.location.href;
//     }
//     name = name.replace(/[\[\]]/g, "\\$&");
//     var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
//         results = regex.exec(url);
//     if (!results) return null;
//     if (!results[2]) return '';
//     return decodeURIComponent(results[2].replace(/\+/g, " "));
// }




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
        buttonNode.innerHTML = getText("logout");

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
            creditsNode.innerHTML = getText("credits") + ": " + userCredits + ":-";

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

        renderDrinks(inventoryGetDrink, beerDataGetDrink);
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

function findDrinkById(drinkId) {
    for (var i = 0; i < drinks.length; i++) {
        if (drinkId == drinks[i].beer_id) {
            return drinks[i];
        }
    }
}

/* Loop each item in the inventory and add it to the html.
  This has to be done to show the selection of drinks */
function renderDrinks(inventoryGetDrink, beerDataGetDrink) {
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


    //Add a checkbox to the drink and put its' value equal to the drink's id.
    // var orderCheckbox = document.createElement('input');
    // orderCheckbox.type = "checkbox";
    // orderCheckbox.className = "drink-checkbox";
    // // var  orderCheckBoxInformation = [];
    // // orderCheckBoxInformation[0] = inventoryGetDrink.pub_price;
    // // orderCheckBoxInformation[1] = drinkId;
    // // orderCheckbox.value = orderCheckBoxInformation;
    // orderCheckbox.value = inventoryGetDrink.pub_price;
    // beerDiv.appendChild(orderCheckbox);



    var quantityControls =
        "<div class='drink-quantity'>" +
            "<button type='button' class='change-quantity decrease'>-</button>" +
            "<span class='current-quantity'>0</span>" +
            "<button type='button' class='change-quantity increase'>+</button>" +
        "</div>";
    $(beerDiv).append(quantityControls);

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
// <<<<<<< HEAD

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
// =======
    
    //on click increase quantity for one line in orderlist
    $(document).on('click', '.increase', function(){
        var bevId = $(this).parent().parent().attr('beverageid');
        orders.increase(bevId);
        drawOrderList(orders.showItems());
    });

    //on click decrease quantity for one line in orderlist
    $(document).on('click', '.decrease', function(){
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

// >>>>>>> origin/master

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
        + removeFromCredits + "&user_id=" + userId, function(data) {
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
    var errorMessage = getText("error-drink-order");
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

//Orderlist
function OldBeverage(id,name,quantity){
    return([id,name,quantity]);
}

function Beverage(
    { id = 0, name = "Unnamed", name2 = "", price = "0", quantity = "0"}
) {
    return([id, name, quantity])
}

function Orderlist(){
    var cart = [];
    var undoBuffer = [[]];
    var redoBuffer = [];

    this.addItem = function(bev){
        cart.push(bev);
        this._updateUndoRedo();
    }

    this.removeItem = function(bev){
        var l = cart.length;
        for (i=0;i<l;i++){
            if (cart[i][0] == bev){
                cart.splice(i,1);
                console.log("removed " + bev);
            }
        }
        console.log(JSON.stringify(orders.showItems()));
        this._updateUndoRedo();
    }

    this.showItems = function(){
        return(cart);
    }

    this.undo = function(){
        if (undoBuffer.length > 0){
            temp = undoBuffer.pop();
            if (undoBuffer.length == 0){
            }
            else {
                redoBuffer.push(temp);
                cart = undoBuffer[undoBuffer.length-1];
            }
        }
    }

    this.redo = function(){
        //add check to see if buffer is emtpy
        if (redoBuffer.length > 0){
            temp = redoBuffer.pop();
            undoBuffer.push(temp);
            cart = temp;
        }
    }



    this.increase = function(bevid){
        var l = cart.length;
        for (i=0;i<l;i++){
            if (cart[i][0] == bevid){
                cart[i][2]++;
                var q = cart[i];

            }
        }
        this._updateUndoRedo();
        return q
    }

    this.decrease = function(bevid){
        var l = cart.length;
        for (i=0;i<l;i++){
            if (cart[i][0] == bevid){
                if (cart[i][2] > 0){
                    cart[i][2]--;
                    var q = cart[i];
                }
            }
        }
        this._updateUndoRedo();
        return q;
    }

    this.sendOrder = function(){

    }

    this.cancelOrder= function(){
        cart.length = 0;
        redoBuffer.length = 0;
        undoBuffer.length = 0;
    }

    this._updateUndoRedo = function(){

        if (undoBuffer.length == 10){
            undoBuffer.splice(0,1); //limits undoBuffer to last 10 values
        }
        var temp = [];
        for (i=0;i<cart.length;++i){
            var bev = cart[i].slice();
            temp.push(bev);
        }
        undoBuffer.push(temp);
        if (redoBuffer.length > 0){
            redoBUffer.length = 0;
        }
    }

//just some debugfunctions
    this.debugUndo = function(){
        return(undoBuffer);
    }

    this.debugRedo = function(){
        return(redoBuffer);
    }
}
/*Removes and redraws the orderlist*/
function drawOrderList(list){
    // console.log(JSON.stringify(list));

    if (list.length == 0){
        $("ul").remove(".orderList");
        return;
    }

    $("ul").remove(".orderList");
    var bevList = document.createElement('ul');
    bevList.setAttribute("class","orderList");
    document.getElementsByClassName("currentOrder")[0].appendChild(bevList);

    for (var i = 0; i<list.length;i++){
        // console.log("new for loop");
        var bevId = list[i][0];
        var bName = list[i][1];
        var q = list[i][2];
        // console.log(bevId);
        // console.log(JSON.stringify(list));
        // a row already exists with this bevId
        var existingOrderRow =  findDrinkRowById(bevId);
        // console.log(existingOrderRow);

        if (existingOrderRow) { // Increase quantity in the HTML row by "q" value
            console.log("exists");
            var quantityClass = existingOrderRow.getElementsByClassName("quantity")[0];
            var currentQuantity = quantityClass.innerHTML;
            var currentQuantityInt = Number(currentQuantity);
            quantityClass.innerHTML = currentQuantityInt+1;

        }
        else {
            var row = document.createElement('li');
            row.className = "ordered-drink-row";

            row.setAttribute("beverageid", bevId);

            var template =
                "<span class = remove>X</span>" +
                "<span class = beername>" + bName + "</span>" +
                "<span class = orderQuantity>" +
                "<span class = decrease>-</span>" +
                "<span class = quantity> " + q + " </span>" +
                "<span class = increase>+</span>"+
                "</span>";
            row.innerHTML = template;
            document.getElementsByClassName("orderList")[0].appendChild(row);
        }
    }
}

function findDrinkRowById(id) {
    var orderedDiv = document.getElementsByClassName("ordered-drink-row");
    for (var i = 0; i < orderedDiv.length; i++ ) {
        var divId = orderedDiv[i].getAttribute("beverageid");
        if (id == divId) {
            return orderedDiv[i];
        }
    }
    return false;
}