var popup = {
    defaults: {
        $popup: document.getElementById('stayFocusedPopup'),
        $form: document.getElementById('stayFocusedForm'),
        $name: document.getElementById('taskName'),
        $currentTasks: document.getElementById('currentTasks'),
        $cancelBtn: document.getElementsByClassName('js-alarm-cancel')
    },

    init: function() {
        console.log('init popup');
        this.removeAllTasks();
        this.appendTasks();
        this.defaults.$name.focus(); // so you can start typing a new task right away
    },

    close: function() {
        window.close();
    },

    open: function() {
        window.open();
    },

    createElementWithContent: function(elementType, id, classname, innerHtml) {
        var obj = document.createElement(elementType);
        if (id) {
            obj.setAttribute('id', id);
        }
        if ((typeof classname !== 'undefined') && classname && (classname !== '')) {
            obj.setAttribute('class', classname);
        }
        if (innerHtml) {
            obj.innerHTML = innerHtml;
        }
        return obj;
    },

    /*
    * @returns {DOM element object}
    */
    createTaskTemplate: function(alarmName){
        var newAlarmTemplate = '<div class="alarm-name">'+ alarmName +'</div>' +
            '<div class="alarm-time">Time: </div>' +
            '<button class="alarm-btn js-alarm-cancel" data-alarm-name="'+ alarmName +'" type="button">Cancel</button>';

        return this.createElementWithContent('div', '', 'alarm', newAlarmTemplate);
    },

    appendTimeRemainingToTask: function(time, taskName) {
        // find task parent element
        // find child element 'alarm-time'
        // change text of element to time
    },

    appendTask: function(taskName) {
        this.defaults.$currentTasks.appendChild(this.createTaskTemplate(taskName));
    },

    appendTasks: function() {
        var _this = this;
        this.getTasks(function(tasks) {
            tasks.forEach(function(task, i) {
                _this.appendTask(tasks[i].name);
            });
        });
    },

    getTasks: function(callback) {
        chrome.runtime.getBackgroundPage(function(bg){
            var activeTasks = bg.TaskCreator.getTasks();
            callback(activeTasks);
        });
    },

    removeTask: function(taskName) {
        var $task = document.querySelectorAll('[data-alarm-name="'+ taskName +'"]')[0].parentElement;
        this.defaults.$currentTasks.removeChild($task);
        chrome.runtime.getBackgroundPage(function(bg){
            bg.TaskCreator.deleteTask(taskName);
        });
    },

    removeAllTasks: function() {
        this.defaults.$currentTasks.innerHTML = '';
    },

    getTimeRemaining: function(alarmName) {
        var scheduledTime = alarm.scheduledTime;
        var now = Date.now();
        return (scheduledTime - now) / 1000;
    },

    /*
    * @param alarmName {string}
    * @returns {string time hh:mm:ss}
    */
    formatTimeTilAlarm: function(seconds) {
        var date = new Date(seconds);
        var hh = date.getUTCHours();
        var mm = date.getUTCMinutes();
        var ss = date.getSeconds();

        // These lines ensure you have two-digits
        if (hh < 10) {
            hh = "0"+hh;
        }
        if (mm < 10) {
            mm = "0"+mm;
        }
        if (ss < 10) {
            ss = "0"+ss;
        }
        return hh+":"+mm+":"+ss;
    },

    // TODO create countdown to update time in active alarms
    countDown: function() {
        // count down seconds
        // update alarm
    }
};


// Events
popup.defaults.$form.addEventListener('submit', function(e) {
    var name = popup.defaults.$name.value;

    e.preventDefault();
    chrome.runtime.sendMessage({action: "create", taskName: name}, function(response) {
        if (response.success) {
            console.log('background success creating: ', name);
            popup.appendTask(name);
        }
    });
});

popup.defaults.$currentTasks.addEventListener('click', function(e) {
    // attaching event to parent and checking event target because alarm might not be created yet
    var target = e.target;

    if (target.classList.contains('js-alarm-cancel')) {
        var alarm = target.dataset.alarmName;
        popup.removeTask(alarm);
    }
});

popup.init();