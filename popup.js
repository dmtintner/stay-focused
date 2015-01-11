var popup = {
    $popup: document.getElementById('stayFocusedPopup'),
    $form: document.getElementById('stayFocusedForm'),
    $name: document.getElementById('taskName'),
    $submit: document.getElementById('taskCreatorSubmit')
};

// Events
popup.$form.addEventListener('submit', function (e) {
    console.log('submit');

    var name = popup.$name.value;

    e.preventDefault();
    // send message with taskName
    chrome.runtime.sendMessage({taskName: name}, function(response) {
        // TODO on success response from background.js, show success message
        console.log(response);
    });

    // TODO close popup or show success message
});