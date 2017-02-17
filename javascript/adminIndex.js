$(document).ready(function() {
    changeLoginButton();
    getBeer();
    createEventHandlers2();
});

function changeLoginButton() {
    var isCookie = readCookie("uid");
    if (isCookie) {
        var buttonNode = document.getElementsByClassName("login-button")[0];
        buttonNode.innerHTML = "Logout";
    }
}

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
        if (beers[i].namn !== "") { //Don't add beers with no name
            var beerDiv = document.createElement('div');
            beerDiv.className = "drink";
            //beerDiv.setAttribute("data-beer-id",beers[i].beer_id);

            //Get name of beer
            var beerNameDiv = document.createElement('div');
            beerNameDiv.className = "drink-name";
            beerNameDiv.innerHTML = beers[i].namn + "<br>";
            beerNameDiv.innerHTML += beers[i].namn2;
            //Add the beer name to div
            beerDiv.appendChild(beerNameDiv);
            getBeerInfo(beers[i].beer_id, i);


            //Get price of beer
            var priceDiv = document.createElement('div');
            priceDiv.className = "price";
            priceDiv.innerHTML = beers[i].price + ":-";
            //Add price to div
            beerDiv.appendChild(priceDiv);

            //Get stock of beer
            var stockDiv = document.createElement('div');
            stockDiv.className = "stock";
            stockDiv.innerHTML = beers[i].count;
            //Add stock to div
            beerDiv.appendChild(stockDiv);


            document.getElementsByClassName("drinks-grid")[0]
                .appendChild(beerDiv);
        }

    }
}
/*
GetBeerInfo gathers the information about each beer. It also wants
to have the loop id so that the parseBeetInfo can put the
correct alcohol percentage to the right beer.
 */
function getBeerInfo(beer_id, i){
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=beer_data_get&beer_id="
        + beer_id, function(data) {
        parseBeerInfo(data.payload, i);
    });
}

function parseBeerInfo(info, beerDivIndex) {
    var alcInfo = info[0].alkoholhalt;
    var alcDiv = document.createElement('div');
    alcDiv.className = "alcohol";
    alcDiv.innerHTML = alcInfo;
    document.getElementsByClassName("drink")[beerDivIndex-6]
        .appendChild(alcDiv);

}

function createEventHandlers2() {
    $(document).on('click', '.login-button', function() {
        eraseCookie("uid");
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