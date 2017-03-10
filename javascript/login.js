/*
This document is used when an user is logging in. If the user enters a correct username
and password it will be stored in a cookie. To move backwards from the page the user can
press on the flying dutchman-name in the top-left corner of the page.
 */

$(document).ready(function() {
    createEventHandlers();
});

//The only thing needed on this page are eventhandlers that handles different button presses.
function createEventHandlers() {
    $(document).on('click', '.info-button', function () { //show the information message if the "?"-button is pressed
       showInformationMessage();
    });

    $(document).on('click', '.login-page-login-button', function() { //if button is clicked regularly
        validateForm();
    });

    $(document).keydown(function(event) { //if the return-button is pressed instead
        if(event.keyCode == 13) {
            $('.login-page-login-button').click();
        }
    });
}

/*
The information message contains an overlay that grays everything else out and then shows a
small box with a message to the user so that he/she does not get confused about the login procesdure
and when and how it is supposed to be used.
 */
function showInformationMessage() {
    var overlay = document.getElementsByClassName("confirmation-overlay")[0];
    overlay.style.display = "block";

    var confirmationHeader = document.getElementsByClassName("confirmation-box-header")[0];
    var confirmationBody = document.getElementsByClassName("confirmation-box-body")[0];

    confirmationHeader.innerHTML = getText("login-information-header");
    confirmationBody.innerHTML = getText("login-information-body");

    var confirmationButton = document.createElement('button');
    confirmationButton.className = "confirmation-button";

    confirmationButton.innerHTML = getText("confirmation-button");
    confirmationButton.onclick = function() {
        //make the overlay disappear
        overlay.style.display = "none";
    };
    confirmationBody.appendChild(confirmationButton);
}

/*
The function gets the entered username and password from the two text fields. It then
calls another function.
 */
function validateForm() {

        var enteredUsername = document.getElementsByClassName('username-field')[0];
        var enteredPassword = document.getElementsByClassName('password-field')[0];
        getUsers(enteredUsername.value, enteredPassword.value);

}

/*
This function just calls the user_get_all-API so that we can get all the usernames and their passwords.
The function that then is called will check if the entered username and password is equal to one
of the entries in the API.
 */
function getUsers(enteredUsername, enteredPassword) {
    /*
    The user_get_all API-call is used to get the userid, credentials, username and password
     */
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=user_get_all",
        function(data) {
            var userGetAll = data.payload;
            validateUsernamePassword(userGetAll, enteredUsername, enteredPassword);
        });
}

/*
 Check username and password and also that the user entered
 something into the field. If this is correct redirect the user to the right page.
 Otherwise show a little error message and remove the information entered in the two forms
 so that the user can try again.
 */
function validateUsernamePassword(userGetAll, enteredUsername, enteredPassword) {
    for (var i = 0; i < userGetAll.length; i++) {
        if (enteredUsername == userGetAll[i].username &&
            enteredPassword == userGetAll[i].username &&
            enteredUsername != "" && enteredPassword != "") {
            redirectToRightPageWithCookie(userGetAll[i]);
            return false;
        }
    }
    wrongUsernameOrPassword()
}


//Check if the user is a regular (credentials != 0) or an admin (credentials = 0.
// Then create a cookie that stores the userId and the username so that it can be used
// to show the right amount of credits on the customer view together with some
// other API-calls.. If it is an admin that logs in
// a cookie is still created to store the session.
function redirectToRightPageWithCookie(selectedUser) {
    var userId = selectedUser.user_id;
    var userName = selectedUser.username;
    var userCredentials = selectedUser.credentials;

    if (userCredentials != 0) { //A regular user
        var cookieInformation = userId +"|" +userName;
        createCookie('uid', cookieInformation, 7);
        if(lang=="se"){
            window.location.href = 'index.html?lang=se'
        } else {
            window.location.href = 'index.html?lang=en';
        }
        return false
    }
    else { //an admin
        var cookieInformation = userId; //An admin
        createCookie('uid',cookieInformation,7);
        if(lang=="se"){
            window.location.href = 'adminindex.html?lang=se'
        } else {
            window.location.href = 'adminindex.html?lang=en';
        }
        return false;
    }
}

/*
 If something in the if- statements in the validateUsernamePassword-function
 above is false the input fields will be cleared and an error message will be displayed.
 This will happen in a loop until the user goes backwards or enters
 the right information
 */
function wrongUsernameOrPassword() {
    document.getElementsByClassName("username-field")[0].value= ""; //update username and password fields
    document.getElementsByClassName("password-field")[0].value= "";
    var errorMsg = getText("login-error");
    document.getElementsByClassName("error-msg")[0].innerHTML =errorMsg;
}


/*
 create a cookie containing the user_id and username. add a long expiration date to the
 cookie.
*/
function createCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

/*
 Erase a cookie by putting the expiration date to a date that
 has already been.
 */
function eraseCookie(name) {
    createCookie(name,"",-1);
}



