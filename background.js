var TaskCreator = {
    defaults: {
        delay: .1
    },

    init: function(){
        console.log('init');
        // clear any alarms that might have been left from old browser session
        chrome.alarms.clearAll();
    },

    /*
     * @param alarmName {string}
     * @param alarmInfo {object}
     */
    createAlarm: function(alarmName, alarmInfo){
        if (!alarmInfo){
            alarmInfo = {
                delayInMinutes: this.defaults.delay // wont be less than a minute in prod. env.
            };
        }

        chrome.alarms.create(alarmName, alarmInfo);
    },

    sendMessageToContentScript: function(info){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, info);
        });
    }
};

// TODO check for current browsing tab every time new tab is opened
// if it is facebook then open popup

// TODO on install, open popup asking which sites you'd like to auto detect

// TODO create options popup that allows you to change sites you are autodetecting

// events
chrome.alarms.onAlarm.addListener(function(alarm){
    TaskCreator.sendMessageToContentScript({alarm: alarm});
});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var taskName = request.taskName;
    console.log(taskName, sender);
    if (taskName) {
        TaskCreator.createAlarm(taskName);
        sendResponse({success: true});
    }
});

// Start it up
TaskCreator.init();
