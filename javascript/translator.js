/*
 * This script handles all of the translation needed in the document
 *
 * if the translator is used from <script> directly in a html file
  * the string to be translated needs to be an attribute "data-translate-key"="some string"
   * and the div needs to have the class "text-translate"
 * if getText(arg) is used from a html file
  * lexicon will not be loaded before it tries to load the string
 *
 * if used from a javascript file getText(arg) works fine since lexicon is loaded
 *
 * the string to be translated must exist in language.json
 */

//global variable that stores the current language - needed to be accessed from all scripts
var lang = getParameterByName("lang");
//the lexicon containing all strings to be translated - needed to be accessed from all scripts
var lexicon;

/*
 * upon ready load - lexicon, translate all the text in the html files
  * and change login button to logut if logged in
 */
$(document).ready(function() {
    // load lexicon
    $.getJSON("./language.json", function(data) {
        lexicon = data;
        // console.log(lexicon);
        translateText();
        changeLoginButton();
        setLangButtonImage();
    });
});

/*
 * takes an argument (i.e "login") to be fetched from the language.json file
  * with the current language (i.e "se") specified in the url (i.e index.html?lang=en)
 */
function getText(arg){
    //  console.log(lexicon);
    // if lang is not specifically "en" or "se" - default to english
    if (lang != "en" && lang != "se"){
        lang = "en";
    }
    //return the correct string for that argument and language
    return lexicon[arg][lang];
}

/* return an extension for the href (i.e: index.html?lang=se - the ?lang=se part)
  * to make sure that the href leads to a page with the requested language
 * if sent null it will return the current language as the href
 * if sent a string as argument it will return that as extension
 * as long as it is either "en" or "se" - else default to "en"
*/
function langRef(reqLang){
    var ref = "?lang=";
    //requested language was null - set it to current lang
    if(reqLang == null){
        //quick check to see if lang is supported - default to en if not
        if(lang == "se" || lang == "en") {
            return ref + lang;
        }
            return ref + "en";
    }
    //requested language was not null so check if that language is supported - default to en
    else if(reqLang != "en" && reqLang != "se"){
        return ref + "en";
    }
    return ref + reqLang;
}

/*
 * returns the opposite of the current language
 * i.e if the current language is English it returns "se"
 */
function langSwap(){
    if(lang != "se"){
        return "se";
    }
    return "en";
}

/*
 * get the lang from url (index.html?lang=en)
 * function taken from:
 * http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
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

/*
 * a function that loops through all divs with class text-translate
 * takes their attributes and translates them accordingly
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

function getLangSwapImgSrc(){
    if(lang != "se"){
        return 'resources/se-flag.png';
    }
    return 'resources/en-flag.png';
}


function setLangButtonImage(){
    var button = document.getElementsByClassName("language")[0];
    if( lang != "se"){
        // button.backgroundImage = "resources/se-flag.png";
        button.innerHTML ="<img id = 'lang-swap-img' src='resources/se-flag.png' height='40px' width='80px' class='lan-swap-img' draggable = 'false'>";
    }
    else{
        button.innerHTML ="<img src='resources/en-flag.png' height='40px' width='80px' draggable = 'false'>";
        // button.ima = "resources/en-flag.png";
        // button.style.width = "80px";
        // button.style.height = "40px";
        // button.innerHTML ="<img src='resources/en-flag.png' draggable = 'false'>";
    }

}