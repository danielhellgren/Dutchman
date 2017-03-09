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
    var cart = [];
    var undoBuffer = [[]];
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
                updateDrawQuantity(bevid,0);
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
                console.log(JSON.stringify(currentstate));
                cart.length = 0;
                for (i=0;i<currentstate.length;i++){
                    var tempcart;
                    console.log(i);
                    console.log(JSON.stringify(currentstate[i]));
                    tempcart=currentstate[i].slice(0);
                    cart.push(tempcart);
                    console.log(JSON.stringify(tempcart));

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
            console.log(JSON.stringify(currentstate));
            cart.length = 0;
            for (i=0;i<currentstate.length;i++){
                var tempcart;
                console.log(i);
                console.log(JSON.stringify(currentstate[i]));
                tempcart=currentstate[i].slice(0);
                cart.push(tempcart);
                console.log(JSON.stringify(tempcart));

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
            redoBuffer.length = 0;
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
/*Removes and redraws the orderlist and updates quantities on the drink card.*/
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
            "</span>";
        row.innerHTML = template;
        document.getElementsByClassName("orderList")[0].appendChild(row);

        updateDrawQuantity(bevId,q);/*
         var drinkcard = $("div[data-beer-id=" + bevId +"]").next().find("span.current-quantity");
         drinkcard.text(q);
         */
    }
}

function updateDrawQuantity(bevId, quantity){
    var drinkcard = $("div[data-beer-id=" + bevId +"]").next().find("span.current-quantity");
    drinkcard.text(quantity);
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