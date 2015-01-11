var Alert = {
    defaults: {
        alertId: 'sfAlert',
        alertMaskId: 'sfAlertMask',
        blurClass: 'is-blurred'
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

    appendAlert: function(message){
        // create Alert
        var _this = this,
            d = this.defaults,
            body = document.body,
            alertContent = '<h1>Time\'s up!</h1>' +
                '<p>Did you ' + message + '?</p>' +
                '<button id="alert-btn-yes" class="sf-btn" type="button">Yes</button>' +
                '<button id="alert-btn-no" class="sf-btn" type="button">No, Snooze 5 more minutes</button>',
            alert = this.createElementWithContent('div', d.alertId, 'sf-alert', alertContent),
            alertMask = this.createElementWithContent('div', d.alertMaskId, 'sf-alert-mask');

        // Append to body
        body.appendChild(alert);
        body.appendChild(alertMask);

        // add is-blurred class to body
        //body.classList.add(d.blurClass);

        // event listeners for buttons
        document.getElementById('alert-btn-yes').addEventListener('click', function(e) {
            _this.closeAlert();
        });
        document.getElementById('alert-btn-no').addEventListener('click', function(e) {
            _this.sendSnoozeMessage(message);
        });
    },

    sendSnoozeMessage: function(message){
        var _this = this;

        chrome.runtime.sendMessage({ taskName: message }, function(resp){
            if (resp.success){
                _this.closeAlert();
            } else {
                console.log('error snoozing alarm');
                // todo append message to say 'try again'
            }
        });
    },

    closeAlert: function(){
        var d = this.defaults,
            body = document.body,
            alert = document.getElementById(d.alertId),
            alertMask = document.getElementById(d.alertMaskId);

        // must go to parent first in order to remove el in native js
        body.removeChild(alert);
        body.removeChild(alertMask);

        // remove is-blurred class on body
        //document.body.classList.remove(d.blurClass);
    }
};

// events
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var alarm = request.alarm;

    if (alarm && alarm.name) {
        Alert.appendAlert(alarm.name);
    }
});