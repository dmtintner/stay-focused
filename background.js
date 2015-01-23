var settings = {
    blackList: ['facebook.com'],

    currentHost: '',

    getCurrentHost: function() {
        return this.currentSite;
    },

    setCurrentHost: function(url) {
        this.currentSite = Utils.getHostname(url);
    }
};

var Utils = {
    sendMessageToContentScript: function(info) {
        console.log('message sent', info);
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, info);
        });
    },

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

    /*
    * @returns {string ex. facebook.com}
    * */
    getHostname: function(url) {
        var a = document.createElement('a');
        a.href = url;

        var host = a.hostname;
        a = null; // to prevent memory leakage

        return host;
    }
};

var Alarms = {
    defaults: {
        delay: .1
    },

    init: function(){
        // clear any alarms that might have been left from old browser session
        chrome.alarms.clearAll();
    },

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

    remove: function(alarmName) {
        chrome.alarms.clear(alarmName);
    }
};

// tab events
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if(changeInfo.status == 'complete' && tab.status == 'complete' && tab.url != undefined) {
        var url = tab.url,
            oldHost = settings.getCurrentHost(),
            newHost = Utils.getHostname(url);

        if (newHost != oldHost && Utils.isBlackListed(url)) {
            settings.setCurrentHost(url);
            Utils.sendMessageToContentScript({tab: tab});
        }
    }
});
chrome.tabs.onCreated.addListener(function(tab) {
    settings.setCurrentHost(tab.url);
    if (Utils.isBlackListed(tab.url)) {
        Utils.sendMessageToContentScript({tab: tab});
    }
});

// Alarm Goes off
chrome.alarms.onAlarm.addListener(function(alarm) {
    Utils.sendMessageToContentScript({alarm: alarm});
});

// Receives Message
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // alarms can be created from task-creator.js or from alert.js (on snooze)
    var action = request.action,
        taskName = request.taskName;

    if (action && taskName) {
        if (action == 'create') {
            Alarms.create(taskName);
            sendResponse({success: true});
        } else if (action == 'remove') {
            Alarms.remove(taskName);
            sendResponse({success: true});
        }
    }
});

Alarms.init();

// TODO on install, open popup with set up info
/*
* ask your name
* ask which sites you'd like to auto detect
* how aggressive you'd like it to be
* default time for tasks
*/

// TODO score points for tasks completed and display score in popup???
