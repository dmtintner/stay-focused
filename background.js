var SF_TaskCreator = {
    submit: function(){
        var name = SF_popup.$name.value,
            alarmInfo = {
                when: Date.now() + 1000
            };

        // start timer
        this.createAlarm(name, alarmInfo);
    },

    /*
     * @param alarmName {string}
     * @param alarmInfo {object}
     */
    createAlarm: function(alarmName, alarmInfo){
        chrome.alarms.create(alarmName, alarmInfo);

        // set event listener
        this.onAlarm();

        // TODO set counter to update badge text
        /*chrome.browserAction.setBadgeText({
         6:              text: json.Count.toString()
         7:          });*/

        // TODO show success message

    },

    onAlarm: function(){
        var _this = this;

        chrome.alarms.onAlarm.addListener(function(alarm){
            console.log(alarm);
            _this.appendAlert();
        });
    },

    closeAlert: function(){

    },

    appendAlert: function(){
        // append div to document.body
        SF_utils.createElementWithID('div', 'sfAlert', 'sf-alert');

        // fill popup div with form

        // ask if to snooze or if task is complete

        // if snooze create new alarm

        // close popup
    }
};