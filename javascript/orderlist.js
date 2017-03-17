/**
 * Created by erikmelander on 2017-02-18.
 */

/*
 Creates a list of the four attributes defining a beverage in the Orderlist cart
 */
function Beverage(
    { id = 0, name = "Unnamed", name2 = "", quantity = "0", price = "0"}
) {
    return([id, name, quantity,price])
}

/*
 Orderlist consisting of a card, an undobuffer and a redobuffer.
 */
function Orderlist(){
    //cart stores current state of the orderlist
    var cart = [];
    //undobuffer stores 10 previous states of the orderlist
    var undoBuffer = [[]];
    //redobuffer used to store poped states from the undobuffer
    var redoBuffer = [];

    //Adds an item to cart, takes a beverage as input.
    this.addItem = function(bev){
        cart.push(bev);
        this._updateUndoRedo();
    }

    //Removes an item from cart based on id
    this.removeItem = function(bevid){
        var l = cart.length;
        for (i=0;i<l;i++){
            if (cart[i][0] == bevid){
                cart.splice(i,1);
                console.log("removed " + bevid);
                this._updateUndoRedo();
                return;
            }
        }
    }

    //returns the cart as a list
    this.showItems = function(){
        return(cart);
    }

    //performs one step undo
    this.undo = function(){
        if (undoBuffer.length > 0){
            temp = undoBuffer.pop();
            if (undoBuffer.length == 0){
            }
            else {
                redoBuffer.push(temp);
                var currentstate = undoBuffer[undoBuffer.length-1];
                cart.length = 0;
                for (i=0;i<currentstate.length;i++){
                    var tempcart;
                    tempcart=currentstate[i].slice(0);
                    cart.push(tempcart);
                }
            }
        }
    }

    //Performs one step redo
    this.redo = function(){
        //add check to see if buffer is emtpy
        if (redoBuffer.length > 0){
            temp = redoBuffer.pop();
            undoBuffer.push(temp);
            var currentstate = temp;
            cart.length = 0;
            for (i=0;i<currentstate.length;i++){
                var tempcart;
                tempcart=currentstate[i].slice(0);
                cart.push(tempcart);
            }
        }
    }


    //Adds one to the quantity of beverage with id bevid
    this.increase = function(bevid){
        var l = cart.length;
        for (i=0;i<l;i++){
            if (cart[i][0] == bevid){
                if (findDrinkById(bevid).count > cart[i][2]){
                    cart[i][2]++;
                    var q = cart[i];
                    this._updateUndoRedo();
                }
                else {
                    console.log("not enough in stock of " + bevid + " only " +findDrinkById(bevid).count);
                }
            }
        }
        return q
    }

    //Decreases quantity of a beverage with one to a minimum of zero.
    this.decrease = function(bevid){
        var l = cart.length;
        for (i=0;i<l;i++){
            if (cart[i][0] == bevid){
                if (cart[i][2] > 0){
                    cart[i][2]--;
                    if (cart[i][2] == 0){
                        this.removeItem(bevid);
                        return;
                    }
                    var q = cart[i];
                }

            }
        }
        this._updateUndoRedo();
        return q;
    }

    //Clears cart and undo/redo buffers
    this.cancelOrder= function(){
        cart.length = 0;
        redoBuffer.length = 0;
        undoBuffer.push([]);
    }

    //Private function that update the undo and redo buffers
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
            redoBuffer.length = 0;
        }
    }

    //some debugfunctions
    this.debugUndo = function(){
        return(undoBuffer);
    }

    this.debugRedo = function(){
        return(redoBuffer);
    }
}
/*Removes and redraws the orderlist and updates quantities on the drink card.*/
function drawOrderList(list){
    // console.log(JSON.stringify(list));
    resetDrawQuantity();
    if (list.length == 0){
        $("ul").remove(".orderList");
        var orderButton = document.getElementsByClassName("order-button")[0];

        if (orderButton) {
            orderButton.innerHTML = getText('order');
        }
        else {
            document.getElementsByClassName("order-button-admin")[0].innerHTML = getText('order');
        }
        return;
    }

    $("ul").remove(".orderList");
    var bevList = document.createElement('ul');
    bevList.setAttribute("class","orderList");
    document.getElementsByClassName("currentOrder")[0].appendChild(bevList);

    for (var i = 0; i<list.length;i++){
        //creates and populates the rows of the orderlist
        var bevId = list[i][0];
        var bName = list[i][1];
        var q = list[i][2];
        var bTot = q*list[i][3];
        var row = document.createElement('li');
        row.className = "ordered-drink-row";

        row.setAttribute("beverageid", bevId);

        var template =
            "<span class = remove>X</span>" +
            "<span class = beername>" + bName + "</span>" +
            "<span class = orderQuantity>" +
            "<span class = decrease-ol>-</span>" +
            "<span class = quantity> " + q + " </span>" +
            "<span class = increase-ol>+</span>"+
            "<span class = bSum >" + bTot + " kr</span>"+

            "</span>";
        row.innerHTML = template;
        document.getElementsByClassName("orderList")[0].appendChild(row);
        //updates the quantity of the cards
        updateDrawQuantity(bevId,q);
    }
    ////calculate and set the element for total cost of the orderlist
    //var summary = document.createElement('div');
    //var sumText = "<span class = 'ordersum'>Total: " + orderSum(list) + "</span>";
    //summary.innerHTML = sumText;
    //document.getElementsByClassName("orderList")[0].appendChild(summary);

    var orderButton = document.getElementsByClassName("order-button")[0];

    if (orderButton) {
        orderButton.innerHTML = getText('order') + " (" + orderSum(list) + ":-)";
    }
    else {
        document.getElementsByClassName("order-button-admin")[0].innerHTML = getText('order') + " (" + orderSum(list) + ":-)";
    }
}

function updateDrawQuantity(bevId, quantity){
    var drinkcard = $("div[data-beer-id=" + bevId +"]").next().find("span.current-quantity");
    drinkcard.text(quantity);
}

/*
 Resets the quantity of all cards to 0
 */
function resetDrawQuantity(){
    $(".current-quantity").text("0");
}
/*
Returns the div element associated with a beverageid
 */
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

/*
Calculates the sum of the current order
 */
function orderSum(list){
    var sum = 0;
    for (i=0;i<list.length;i++){
        sum = sum + Number(list[i][3])*Number(list[i][2]);
    }
    return sum;
}