/**
 * Created by erikmelander on 2017-02-18.
 */
$(document).ready(function() {
    var orders = new Orderlist();

    console.log("orders" + JSON.stringify(orders.showItems()));
    console.log("undo" + JSON.stringify(orders.debugUndo()));
    for (step = 0; step <12;step++){
        orders.addItem(new Beverage(step,"A",step));
    }
    var testbev = new Beverage(999,"test",999);
    orders.addItem(testbev);
    console.log("orders" + JSON.stringify(orders.showItems()));
    console.log("undo" + JSON.stringify(orders.debugUndo()));
    console.log("redo" + JSON.stringify(orders.debugRedo()));

    orders.removeItem(testbev);
    console.log("orders" + JSON.stringify(orders.showItems()));
    console.log("undo" + JSON.stringify(orders.debugUndo()));
    console.log("redo" + JSON.stringify(orders.debugRedo()));

    orders.cancelOrder();
    console.log("orders" + JSON.stringify(orders.showItems()));
    console.log("undo" + JSON.stringify(orders.debugUndo()));
    console.log("redo" + JSON.stringify(orders.debugRedo()));
});

function Beverage(id,name,quantity){
    this.id = id;
    this.name = name;
    this.quantity = quantity;
}

function Orderlist(){
    var cart = [];
    var undoBuffer = [];
    var redoBuffer = [];

    this.addItem = function(bev){
        cart.push(bev);
        this._updateUndoRedo();
    }

    this.removeItem = function(bev){
        var l = cart.length;
        for (i=0;i<l;i++){
            if (cart[i].id == bev.id){
                cart.splice(i,1);
                console.log("found it");
            }
        }
        this._updateUndoRedo();
    }

    this.showItems = function(){
        return(cart);
    }

    this.undo = function(){
        temp = undoBuffer.pop();
        redoBuffer.push(temp);
        cart = undoBuffer[undoBuffer.length-1];
    }

    this.redo = function(){
        temp = redoBuffer.pop();
        undoBuffer.push(temp);
        cart = temp;
    }



    this.increase = function(bev){

    }

    this.decrease = function(){

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
        undoBuffer.push(cart.slice());
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
