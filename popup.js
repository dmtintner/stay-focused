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
        this.clearAllTasks();
        this.appendTasks();
        // TODO focus on input element so you can start typing a new task right away
    },

    close: function() {
        window.close();
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
        // TODO get real time left
        var newAlarmTemplate = '<div class="alarm-name">'+ alarmName +'</div>' +
                '<div class="alarm-time">Time left: '+ Date.now() +'</div>' +
                '<button class="alarm-btn js-alarm-cancel" data-alarm-name="'+ alarmName +'" type="button">Cancel</button>';

        return this.createElementWithContent('div', '', 'alarm', newAlarmTemplate);
    },

    appendTasks: function() {
        var _this = this;

        chrome.runtime.getBackgroundPage(function(bg){
            var activeTasks = bg.TaskCreator.getTasks();

            console.log('popup: ', activeTasks);
            if (activeTasks.length > 0) {
                // loop through tasks and append them to popup
                for (var i = 0; i < activeTasks.length; i++) {
                    _this.defaults.$currentTasks.appendChild(_this.createTaskTemplate(activeTasks[i].name));
                }
            }
        });
    },

    clearAllTasks: function() {
        this.defaults.$currentTasks.innerHTML = '';
    },

    removeTask: function(taskName) {
        var $task = document.querySelectorAll('[data-alarm-name="'+ taskName +'"]')[0].parentElement;
        this.defaults.$currentTasks.removeChild($task);
        chrome.runtime.getBackgroundPage(function(bg){
            bg.TaskCreator.deleteTask(taskName);
        });
    }
};


// Events
popup.defaults.$form.addEventListener('submit', function(e) {
    var name = popup.defaults.$name.value;

    e.preventDefault();
    chrome.runtime.sendMessage({action: "create", taskName: name}, function(response) {
        if (response.success) {
            popup.close();
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


// TODO score points for tasks completed and display score in popup???
