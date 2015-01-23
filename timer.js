// todo create template for timer
/*
* - counts down seconds
* - has check to mark it as done
* - shows task name
* - shows time left
* - triggers alert when time is up
* */


var Timer = {
    init: function() {

    },

    appendTimer: function() {}
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var badTab = request.tab;

    if (badTab) {
        // todo show alert with form for task creation
    }
});

Timer.init();