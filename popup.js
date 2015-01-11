var SF_popup = {
    $popup: document.getElementById('stayFocusedPopup'),
    $name: document.getElementById('taskName'),
    $submit: document.getElementById('taskCreatorSubmit')
};

// Events
SF_popup.$submit.addEventListener('click', function (e) {
    e.preventDefault();
    SF_TaskCreator.submit();
});