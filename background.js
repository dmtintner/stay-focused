var TaskCreator = {
    safeToCreateNewTask: true,

    /*
     * @param alarmName {string}
     * @param alarmInfo {object}
     */
    createAlarm: function(alarmName, alarmInfo){
        if (!alarmInfo){
            alarmInfo = {
                delayInMinutes:.01 // wont be less than a minute in prod. env.
            };
        }

        chrome.alarms.create(alarmName, alarmInfo);

        // TODO set counter to update badge text
        /*chrome.browserAction.setBadgeText({
               text: json.Count.toString()
           });*/
    },

    sendMessageToContentScript: function(info){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, info);
        });
    }
};

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