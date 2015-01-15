var TaskCreator = {
    defaults: {
        delay: .4
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
        this.createAlarm(taskName, { delayInMinutes: delay });
    },

    /*
     * @param taskName {string}
     */
    deleteTask: function(taskName) {
        var activeTasks = this.getTasks(),
            taskIndex;

        activeTasks.forEach(function(task, i){
            debugger;
            if (task.name == taskName) {
                taskIndex = i;
            }
        });

        console.log('newTasks: ', activeTasks.splice(taskIndex, 1));
        this.setTasks(activeTasks.splice(taskIndex, 1));
        chrome.alarms.clear(taskName);
    },

    /*
     * @param alarmName {string}
     * @param alarmInfo {object}
     */
    createAlarm: function(alarmName, alarmInfo) {
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

// events

chrome.alarms.onAlarm.addListener(function(alarm) {
    // notify alert.js to show alart
    TaskCreator.sendMessageToContentScript({alarm: alarm});
});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // alarms can be created from popup.js or from alert.js (on snooze)
    var action = request.action,
        taskName = request.taskName;

    if (action && action == 'create' && taskName) {
        TaskCreator.createTask(taskName);
        sendResponse({success: true});
    }

    if (action && action == 'delete' && taskName) {
        TaskCreator.deleteTask(taskName);
        sendResponse({success: true});
    }
});

// Start it up
TaskCreator.init();



// TODO check for current browsing tab every time new tab is opened
// if it is facebook then open popup

// TODO on install, open popup asking which sites you'd like to auto detect

// TODO create options popup that allows you to change sites you are autodetecting
