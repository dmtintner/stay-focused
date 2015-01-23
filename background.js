var settings = {
    blackList: ['hackingui.com']
};

// TODO use default chrome alarms object and methods instead of doing this work twice
var TaskCreator = {
    defaults: {
        delay: .1
    },

    init: function(){
        // clear any alarms that might have been left from old browser session
        chrome.alarms.clearAll();
    },

    /*
     * {array of objects}
     */
    tasks: [],

    getTasks: function() {
        return this.tasks;
    },

    setTasks: function(tasks) {
        this.tasks = tasks;
    },

    /*
     * @param task {object}
     */
    createTask: function(taskName) {
        var delay = this.defaults.delay,
            task = {
                name: taskName
                // todo add endTime
            };
        this.tasks.push(task);
        AlarmCreator.create(taskName, { delayInMinutes: delay });
    },

    /*
     * @param taskName {string}
     */
    deleteTask: function(taskName) {
        var activeTasks = this.getTasks(),
            taskIndex;

        activeTasks.forEach(function(task, i) {
            if (task.name == taskName) {
                taskIndex = i;
            }
        });

        this.setTasks(activeTasks.splice(taskIndex, 1));
        chrome.alarms.clear(taskName);
    }
};

var AlarmCreator = {
    /*
     * @param alarmName {string}
     * @param alarmInfo {object}
     */
    create: function(alarmName, alarmInfo) {
        if (!alarmInfo) {
            alarmInfo = {
                delayInMinutes: this.defaults.delay // wont be less than a minute in prod. env.
            };
        }

        chrome.alarms.create(alarmName, alarmInfo);
    },

    sendMessageToContentScript: function(info) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, info);
        });
    }
};

var TabChecker = {

    /*
    * @param url {string}
    * @returns {Boolean}
    */
    isBlackListed: function(url) {
        // if site exists in url, returns true
        return settings.blackList.some(function(site, i) {
            return (url.indexOf(site) > -1);
        });
    },

    sendMessageToContentScript: function(info) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, info);
        });
    }
};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if (TabChecker.isBlackListed(tab.url)) {
        TabChecker.sendMessageToContentScript({tab: tab});
    }
});

chrome.tabs.onCreated.addListener(function(tab) {
    if (TabChecker.isBlackListed(tab.url)) {
        TabChecker.sendMessageToContentScript({tab: tab});
    }
});




// Alarm Goes off
chrome.alarms.onAlarm.addListener(function(alarm) {
    // notify alert.js to show alert
    AlarmCreator.sendMessageToContentScript({alarm: alarm});
});

// Receives Message
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // alarms can be created from popup.js or from alert.js (on snooze)
    var action = request.action,
        taskName = request.taskName,
        changedTab = request.changedTab;

    if (changedTab) {

    }

    if (action && taskName) {
        if (action == 'create') {
            TaskCreator.createTask(taskName);
            sendResponse({success: true});
        } else if (action == 'delete') {
            TaskCreator.deleteTask(taskName);
            sendResponse({success: true});
        }
    }
});




// TODO switch to using default chrome alarms object and methods
/*
* update the taskCreator to not store tasks there, but just create them
* create alarms from the popup or content scripts instead of from the background
*/


// TODO Detect current tab
/*
* listen for switching of the active tab
* check if current tab matches one of the sites in the black list
* if it does match, send a message to the content script
* add a check in the onMessage listener in alert.js for messages that contain site
* if message contains a site, open an alert
* append a template to the alert with a form to create tasks
*/

// TODO on install, open popup with set up info
/*
* ask your name
* ask which sites you'd like to auto detect
* how aggressive you'd like it to be
* default time for tasks
*/

// TODO score points for tasks completed and display score in popup???
