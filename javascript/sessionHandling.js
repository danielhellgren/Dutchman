// File for handling everything related to handling sessions and dependent states

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