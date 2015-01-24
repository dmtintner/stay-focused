var Utils = {
    settings: {
        contentClass: 'sf-alert-content'
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
    }
};

var TaskCreator = {
    defaults: {
        formWrapperId: 'taskCreatorPopup',
        formId: 'stayFocusedForm',
        inputId: 'taskName'
    },

    templateHTML: function() {
        var u = Utils.settings;
        return '<div class="'+ u.contentClass +'">' +
            '<form id="stayFocusedForm">' +
            '<h2>Ok, focus.</h2>' +
            '<label class="placeholdertxt" for="taskName">I came here to</label>' +
            '<input class="taskName" id="taskName" type="text" />' +
            '<button id="taskCreatorSubmit" type="submit">Ok, Go!</button>' +
            '</form>' +
        '</div>';
    },

    appendForm: function() {
        var _this = this,
            d = this.defaults,
            body = document.body,
            template = this.templateHTML(),
            form = Utils.createElementWithContent('div', d.formWrapperId, 'sf-alert-wrapper', template);

        // Append to body
        body.appendChild(form);

        document.getElementById(d.formId).addEventListener('submit', function(e) {
            var taskName = document.getElementById(d.inputId).value;
            _this.submit(taskName);

            // need all of these to prevent it from reloading page on facebook
            e.preventDefault();
            e.stopPropagation();
            return false;
        });

        //todo add event listener for closing form without submitting a task (cancel)
        // so you can start typing right away
        document.getElementById(d.inputId).focus();
    },

    removeForm: function() {
        var form = document.getElementById(this.defaults.formWrapperId);

        // must go to parent first in order to remove el in native js
        if (form) {
            document.body.removeChild(form);
        }
    },

    submit: function(taskName) {
        var _this = this;
        chrome.runtime.sendMessage({ action: 'create', taskName: taskName }, function(resp) {
            if (resp.success) {
                _this.removeForm();
                Timer.appendTimer(taskName);
            }
        });
    }
};

var Timer = {
    defaults: {
        timerWrapperId: 'timerWrapper',
        btnCompleteId: 'btnTaskComplete',
        taskNameId: 'timerTaskName',
        counterId: 'timerCounter',
        minutes: 5
    },

    templateHTML: function(taskName) {
        var d = this.defaults;

        return '<div id="'+ d.timerWrapperId +'">' +
            '<div id="'+ d.taskNameId +'">'+ taskName +'</div>' +
            '<div id="'+ d.counterId +'"s></div>' +
            '<button id="btnTaskComplete">I\'m Done, take me out of here</button>' +
        '</div>';
    },

    countdown: function(minutes) {
        var clock = document.getElementById(this.defaults.counterId),
            now = new Date(),
            targetDate = new Date(now.getTime() + minutes * 60000);

        clock.innerHTML = countdown(targetDate).toString();
        setInterval(function(){
            clock.innerHTML = countdown(targetDate).toString();
        }, 1000);
        // todo clearInterval when canceling timer
    },

    appendTimer: function(taskName) {
        var d = this.defaults,
            _this = this,
            body = document.body,
            template = this.templateHTML(taskName),
            timer = Utils.createElementWithContent('div', d.timerWrapperId, '', template);

        body.appendChild(timer);
        document.getElementById(d.taskNameId).innerHTML = taskName;

        this.countdown();

        document.getElementById(d.btnCompleteId).addEventListener('click', function(e) {
            _this.cancelAlarm(taskName);
        });
    },

    removeTimer: function() {
        var timer = document.getElementById(this.defaults.timerWrapperId);

        // must go to parent first in order to remove el in native js
        if (timer) {
            document.body.removeChild(timer);
        }
    },

    cancelAlarm: function(taskName) {
        var _this = this;
        chrome.runtime.sendMessage({ action: 'remove', taskName: taskName }, function(resp) {
            if (resp.success) {
                _this.removeTimer();
            }
        });
    }
};

var Alert = {
    defaults: {
        alertWrapperId: 'sfAlertWrapper'
    },

    templateHTML: function() {
        var u = Utils.settings;
        return '<div class="'+ u.contentClass +'">' +
                '<h1>Bam! Time\'s up.</h1>' +
                '<p>Did you <span id="alertTaskName"></span> ?</p>' +
                '<button id="alert-btn-yes" class="sf-btn" type="button">Hell Yeah</button>' +
                '<button id="alert-btn-no" class="sf-btn" type="button">Sh*t! Snooze for 5 more mins please</button>' +
            '</div>';
    },

    appendAlert: function(taskName) {
        var _this = this,
            d = this.defaults,
            template = this.templateHTML(),
            alert = Utils.createElementWithContent('div', d.alertWrapperId, 'sf-alert-wrapper', template);

        // Append to body
        document.body.appendChild(alert);

        // event listeners for buttons
        document.getElementById('alert-btn-yes').addEventListener('click', function(e) {
            _this.closeAlert();
            chrome.runtime.sendMessage({ action: 'remove', taskName: taskName });
        });
        document.getElementById('alert-btn-no').addEventListener('click', function(e) {
            _this.closeAlert();
            Timer.appendTimer(taskName);
            chrome.runtime.sendMessage({ action: 'create', taskName: taskName });
        });
    },

    closeAlert: function() {
        var alert = document.getElementById(this.defaults.alertWrapperId);

        document.body.removeChild(alert);
    }
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var badTab = request.tab,
        alarm = request.alarm;

    console.log('message received', request);
    if (badTab) {
        TaskCreator.appendForm();
    }

    if (alarm) {
        TaskCreator.removeForm();
        Timer.removeTimer();
        Alert.appendAlert(alarm.name);
    }
});