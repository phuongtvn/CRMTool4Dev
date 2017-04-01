var CUSTOM_RULE = (function () {

    var canEnable = function (userLcId) {
        console.log(userLcId);
        return true;
    }
    return {
        canEnable: canEnable
    }
})();