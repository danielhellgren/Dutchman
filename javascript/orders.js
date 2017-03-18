/**
 * Created by daniel.hellgren on 2017-03-06.
 */
$(document).ready(function() {
    getOrders();
    createEventHandlers();
});


// gets "all" orders from the database
function getOrders(){
    // json call
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=purchases_get_all",

        function(data) {
            var orders = [];
            var size = data.payload.length - 1;

            for (var i = 0; i < size + 1; i++) {
                if (data.payload[size - i].namn !== "") { //remove drinks with no name.
                    orders.push(data.payload[size - i]);
                }
            }
            renderOrders(orders);
        });
}

//render a single order to the list
function renderOrder(order){
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
    nameDiv.className = "order-item-customer-name";
    nameDiv.innerHTML = order.first_name + " " + order.last_name + " [" + order.username + "]";
    //add to div
    orderDiv.appendChild(nameDiv);

    //get name of the beer
    var beerDiv = document.createElement('div');
    beerDiv.className = "order-item-drink-name";
    beerDiv.innerHTML = order.namn;
    if(order.namn2 != "") {
        beerDiv.innerHTML += " <br> " + order.namn2;
        beerDiv.style.lineHeight = "15px";
        beerDiv.style.padding = "5px 0 0 0"
    }
    //add to div
    orderDiv.appendChild(beerDiv);

    //get time of order
    var timeDiv = document.createElement('div');
    timeDiv.className = "order-item-time";
    timeDiv.innerHTML = order.timestamp;
    //add to div
    orderDiv.appendChild(timeDiv);

    //get price of order
    var priceDiv = document.createElement('div');
    priceDiv.className = "order-item-price";
    priceDiv.innerHTML = order.price + ":-";
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