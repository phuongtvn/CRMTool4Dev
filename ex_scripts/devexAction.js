var CUSTOM_ACTION = (function () {

    var extension_Clicked = function () {
        debugger;
        // Check whether if this is a form or not
        var customParameters = encodeURIComponent("");
        Xrm.Utility.openWebResource("ex_html/Extension4Dev.html", customParameters);
    }
    return {
        extension_Clicked: extension_Clicked
    }
})();