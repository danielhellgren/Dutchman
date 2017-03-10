/**
 * Created by daniel.hellgren on 2017-02-28.
 */

var lang = getParameterByName("lang");
var lexicon;

$(document).ready(function() {
    // load lexicon
    $.getJSON("./language.json", function(data) {
        lexicon = data;
        // console.log(lexicon);
        translateText();
        changeLoginButton();
    });

});

/*
 takes an argument to be fetched from the language.json file
 with the current language specified in the url (i.e index.html?lang=en)
 */
function getText(arg){
    // if url is messed up or function returned something bad - default to english
    //  console.log(lexicon);
    if (lang != "en" && lang != "se"){
        lang = "en";
    }
    return lexicon[arg][lang];
}

// return an extension for the href to keep the current language across pages
// i.e: ?lang=se
//it defaults to English (en) if sent null or value that is no se
function langRef(language){
    var ref = "?lang=";
    if(language == null){
        return ref + lang;
    }
    return ref + language;

}

//returns the opposite of the current language
// i.e if the current language is English it returns "se"
function langSwap(){
    if(lang != "se"){
        return "se";
    }
    return "en";
}

/*
 get the langauge from url (index.html?lang=en)
 function taken from:
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

/* a function that loops through all divs with class text-translate
 *takes their attributes and translates them accordingly
 */
function translateText(){
    var divs = document.getElementsByClassName("text-translate");
    // alert("translating divs: " + divs.length);
    for(var i = 0; i < divs.length; i++){
        var div = divs[i];
        var arg = div.getAttribute("data-translate-key");
        // alert("translating key:" + arg);
        div.innerHTML = getText(arg);
    }
}