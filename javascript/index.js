/* To be able to show the beer names from the API
 we have to make a JSON query and from there add each
   beer name to divs with class=drink*/

$(document).ready(function() {
    getBeer();
});

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