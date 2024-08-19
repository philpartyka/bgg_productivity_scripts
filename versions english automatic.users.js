// ==UserScript==
// @name        Automatic English Language filter on the BGG Versions Page
// @description Detects when you visit the Version's page of a board game on boardgamegeek.com and reloads the page so that only the English versions are shown
// @include     https://boardgamegeek.com/boardgame/*
// @version     1
// ==/UserScript==

var pageURLCheckTimer = setInterval (
    function () {
        if (    this.lastPathStr  !== location.pathname
            ||  this.lastQueryStr !== location.search
            ||  this.lastPathStr   === null
            ||  this.lastQueryStr  === null
        ) {
            this.lastPathStr  = location.pathname;
            this.lastQueryStr = location.search;
            gmMain ();
        }
    }
    , 222
);

function gmMain() {
    var currentUrl = window.location.href;
    var regexPattern = /^https:\/\/boardgamegeek\.com\/boardgame\/\d+\/[^\/]+\/versions$/;
    var newQueryParam = "?language=2184";

    if (window.self === window.top) {
        if (regexPattern.test(currentUrl) && !currentUrl.includes(newQueryParam)) {
            window.location.href = currentUrl + newQueryParam;
        }
    }
}