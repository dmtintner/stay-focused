var popup = {
    defaults: {
        $popup: document.getElementById('stayFocusedPopup'),
        $form: document.getElementById('stayFocusedForm'),
        $name: document.getElementById('taskName')
    },

    close: function(){
        window.close();
    }
};

// TODO when you open popup show currently running alarms
// TODO give option to cancel alarms
// TODO score points for tasks completed and display score in popup???

// Events
popup.defaults.$form.addEventListener('submit', function(e) {
    var name = popup.defaults.$name.value;

    e.preventDefault();
    chrome.runtime.sendMessage({taskName: name}, function(response) {
        if (response.success){
            popup.close();
        }
    });
});