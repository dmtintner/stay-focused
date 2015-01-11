var SF_utils = {
    createElementWithID: function(elementType, id, classname, textContent) {
        var obj = document.createElement(elementType);
        if (id) {
            obj.setAttribute('id', id);
        }
        if ((typeof classname !== 'undefined') && classname && (classname !== '')) {
            obj.setAttribute('class', classname);
        }
        if (textContent) {
            obj.textContent = textContent;
        }
        return obj;
    }
};