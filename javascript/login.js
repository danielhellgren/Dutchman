

$(document).ready(function() {
    validateForm();

});

/*
Save the entered username and password into variables. Then lookup
the username and password database to check if the entered information
is also found in the database. If so the user is logged in and
otherwise he/she will get an error message.
 */

function validateForm() {
    $(document).on('click', '.login-button', function() {
        var enteredUsername = document.getElementsByClassName('username-field')[0];
        var enteredPassword = document.getElementsByClassName('password-field')[0];
        getUsers(enteredUsername.value, enteredPassword.value);
    });
}

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
 check username and password and also that the user entered
 something into the field. If this is correct redirect the user to the right page.
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

//Check the credits for the specific user
// function getUserCredits(selectedUser) {
//     /*
//     The iou_get_all API-call is used to get the credits for a specific user.
//      */
//     //console.log(selectedUser.username);
//     $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=" + selectedUser.username + "&password=" + selectedUser.username + "&action=iou_get",
//         function(data) {
//             var userInformation = data.payload;
//             redirectToRightPageWithCookie(selectedUser, userInformation);
//         });
// }

//Check if the user is a regular or an admin. Then create a cookie that stores the
//userId and the username  so that it can be used to show the right amount of credits
function redirectToRightPageWithCookie(selectedUser) {
    var userId = selectedUser.user_id;
    var userName = selectedUser.username;
    var userCredentials = selectedUser.credentials;

    if (userCredentials != 0) { //A regular user
        var cookieInformation = userId +"|" +userName;
        createCookie('uid', cookieInformation, 7);
        window.location.href = 'index.html';
        return false
    }
    else {
        var cookieInformation = userId; //An admin
        createCookie('uid',cookieInformation,7);
        window.location.href = 'adminindex.html';
        return false;
    }
}



/*
 create a cookie containing the user_id
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
If something of the if statements above are false the input
fields will be cleared and an error message will be displayed.
This will happen in a loop until the user goes backwards or enters
the right information
 */
function wrongUsernameOrPassword() {
    document.getElementsByClassName("username-field")[0].value= ""; //update username and password fields
    document.getElementsByClassName("password-field")[0].value= "";
    var errorMsg = "*Wrong username or password";
    document.getElementsByClassName("error-msg")[0].innerHTML =errorMsg;
}
/*
Erase a cookie by putting the expiration date to a date that
has already been.
 */
function eraseCookie(name) {
    createCookie(name,"",-1);
}