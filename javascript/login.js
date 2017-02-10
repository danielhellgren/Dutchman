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
        var username = document.getElementsByClassName('username-field')[0];
        var password = document.getElementsByClassName('password-field')[0];
        getUsers(username.value, password.value);
    });
}

function getUsers(username, password) {
    $.getJSON("http://pub.jamaica-inn.net/fpdb/api.php?username=jorass&password=jorass&action=user_get_all",
        function(data) {
            validateUP(data.payload, username, password);
        });
}

/*
check username and password and also that the user entered
something into the field. If this is correct the user will be
redirected to a logged in version of the main page.
The loop will also check the credentials of the logged in user
since depending on if it is = 0 (admin) or != 0 (customer) he/she
will be redirected to a different page.
*/
function validateUP(users, uname, pword) {
    for (var i = 0; i < users.length; i++) {
        if (uname === users[i].username &&
            pword === users[i].username &&
            uname != "" && pword != "") {
            if (users[i].credentials != 0) {
               //var userId = users[i].user_id;
                createCookie('uid',uname,7);
                window.location.href = 'index.html'; //send to new website where the user is logged in
                return false;
            }
            else {
                window.location.href = 'adminindex.html';
                return false;
            }
        }
    }
    errorUP()
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
function errorUP() {
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