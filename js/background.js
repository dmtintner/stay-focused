var settings = {
    name: '',
    time: 5,
    sites: [],
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
        info.settings = settings;
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
        return settings.sites.some(function(site, i) {
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
    init: function(){
        // clear any alarms that might have been left from old browser session
        chrome.alarms.clearAll();
        chrome.storage.sync.get(null, function(data) {
            var name = data.name,
                time = data.time,
                sites = data.sites;
            console.log('name: ', name);
            console.log('time: ', time);
            console.log('sites: ', sites);

            settings.name = name;
            settings.time = time;
            settings.sites = sites;
        });
    },

    /*
     * @param alarmName {string}
     * @param alarmInfo {object}
     */
    create: function(alarmName, alarmInfo) {
        if (!alarmInfo) {
            alarmInfo = {
                delayInMinutes: settings.time // wont be less than a minute in prod. env.
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
    // only show task creator once for each bad domain
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

// Settings are updated
chrome.storage.onChanged.addListener(function(changes, storageArea){
    console.log('settings changed: ', changes);
    console.log('settings storageArea: ', storageArea);
    for (var setting in changes) {
        if(changes.hasOwnProperty(setting)) {
            console.log("o." + setting + " = " + changes[setting].newValue);
            settings[setting] = changes[setting].newValue;
        }
    }
});

// Receives Message
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // alarms can be created from task-creator.js or from alert.js (on snooze)
    var action = request.action,
        taskName = request.taskName;

    if (action && taskName) {
        switch (action) {
            case 'create':
                Alarms.create(taskName);
                break;
            case 'remove':
                Alarms.remove(taskName);
                break;
            default:
                break;
        }
        sendResponse({success: true});
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
