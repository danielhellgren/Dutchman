/**
 * Created by daniel.hellgren on 2017-03-06.
 */
$(document).ready(function() {
    //changeLoginButton();
    getOrders();
    createEventHandlers();
});


// gets "all" orders from the database
function getOrders(){
    // json call
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=purchases_get_all",

        function(data) {
            var orders = [];
            for (var i = 0; i< data.payload.length; i++) {
                if (data.payload[i].namn !=="") { //remove drinks with no name.
                    //drinkId[i-7] = data.payload[i].beer_id;
                    orders.push(data.payload[i]);
                }
            }
            renderOrders(orders);
        });
}

//render a single order to the list
function renderOrder(order){
    console.log(order);
    // EXAMPLE of order:
    // namn: "",
    // namn2: "",
    // transaction_id: "4086",
    // user_id: "2",
    // beer_id: "2259",
    // timestamp: "2017-03-06 15:54:19",
    // price: "100.00",
    // first_name: "Jory",
    // last_name: "Assies",
    // username: "jorass"
    //create new div for the order list item
    var orderDiv = document.createElement('div');
    orderDiv.className="order-item";
    //set transaction id to attribute of order item
    // so that we can access more info by clicking on it later
    orderDiv.setAttribute("data-order-id",order.transaction_id);

    //creating subdiv for the list item
    //get the name of the customer
    var nameDiv = document.createElement('div');
    nameDiv.className = "customer-name";
    nameDiv.innerHTML = order.first_name + " " + order.last_name + " [" + order.username + "]";
    //add to div
    orderDiv.appendChild(nameDiv);

    //get name of the beer
    var beerDiv = document.createElement('div');
    beerDiv.className = "drink-name";
    beerDiv.innerHTML = order.namn;
    if(order.namn2 != "")
        beerDiv.innerHTML += " <br> " + order.namn2;
    //add to div
    orderDiv.appendChild(beerDiv);

    //get time of order
    var timeDiv = document.createElement('div');
    timeDiv.className = "time";
    timeDiv.innerHTML = order.timestamp;
    //add to div
    orderDiv.appendChild(timeDiv);

    //get price of order
    var priceDiv = document.createElement('div');
    priceDiv.className = "price";
    priceDiv.innerHTML = order.price;
    //add to div
    orderDiv.appendChild(priceDiv);

    document.getElementsByClassName("orders-grid")[0].appendChild(orderDiv);
}

//renders the whole list of orders to the listview
function renderOrders(orders){
    for(var i=0; i < orders.length; i++){
        renderOrder(orders[i]);
    }
}

// eventhandlers
function createEventHandlers() {

}