var Alert = {
    defaults: {
        alertId: 'sfAlert',
        alertMaskId: 'sfAlertMask'
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

    // todo create template for alert html after time is up
    appendAlert: function(taskName) {
        // create Alert
        var _this = this,
            d = this.defaults,
            body = document.body,
            alertContent = '<h1>Bam! Time\'s up.</h1>' +
                '<p>Did you ' + taskName + '?</p>' +
                '<button id="alert-btn-yes" class="sf-btn" type="button">Hell Yeah</button>' +
                '<button id="alert-btn-no" class="sf-btn" type="button">Sh*t! Snooze for 5 more mins please</button>',
            alert = this.createElementWithContent('div', d.alertId, 'sf-alert', alertContent),
            alertMask = this.createElementWithContent('div', d.alertMaskId, 'sf-alert-mask');

        // Append to body
        body.appendChild(alert);
        body.appendChild(alertMask);

        // event listeners for buttons
        document.getElementById('alert-btn-yes').addEventListener('click', function(e) {
            _this.closeAlert("delete", taskName);
        });
        document.getElementById('alert-btn-no').addEventListener('click', function(e) {
            _this.closeAlert("create", taskName);
        });
    },

    closeAlert: function(actionToTake, taskName) {
        var d = this.defaults,
            body = document.body,
            alert = document.getElementById(d.alertId),
            alertMask = document.getElementById(d.alertMaskId);

        // must go to parent first in order to remove el in native js
        body.removeChild(alert);
        body.removeChild(alertMask);
        chrome.runtime.sendMessage({ action: actionToTake, taskName: taskName });
    }
};

// events
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    var alarm = request.alarm;

    console.log('received message in alert.js');
    if (alarm && alarm.name) {
        Alert.appendAlert(alarm.name);
    }
});