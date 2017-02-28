/**
 * Created by daniel.hellgren on 2017-02-28.
 */

var lang = "";

$(document).ready(function() {
    $.getJSON("./language.json", function(data) {
        lexicon = data;
    });
    lang = getParameterByName("lang");
});

function getText(arg){
    if (lang != "en" && lang != "se"){
        lang = "en";
    }
    return lexicon[arg][lang];
}


/*
 function taken from
 http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 */
function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}