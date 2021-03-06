var Popup = {
    defaults: {
        minutes: 5,
        sites: ['facebook.com'],
        $form: document.querySelectorAll('.sf-optionsForm'),
        $nameForm: document.getElementById('sf-optionsNameForm'),
        $nameInput: document.getElementById('sf-optionsName'),
        $name: document.getElementById('sf-name'),
        $timeForm: document.getElementById('sf-optionsTimeForm'),
        $timeInput: document.getElementById('sf-optionsTime'),
        $time: document.getElementById('sf-time'),
        $sitesForm: document.getElementById('sf-optionsSitesForm'),
        $sitesInput: document.getElementById('sf-optionsSites'),
        $sitesList: document.getElementById('sf-sitesList')
    },

    sites: [],
    getSites: function() {
        return this.sites;
    },

    /*
    * @param sites {array of strings}
    * @param clearList {boolean} default: false
    */
    setSites: function(sites, clearList) {
        var siteList = this.getSites();
        if (clearList) {
            siteList = [];
        }
        sites.forEach(function(site, i){
            siteList.push(site);
        });
        this.sites = siteList;
    },

    init: function() {
        var _this = this;
        // update name
        this.getLocalStorage(['name', 'time', 'sites'], function(data) {
            var name = data.name,
                time = data.time || _this.defaults.minutes,
                sites = data.sites || _this.defaults.sites;

            console.log('sites: ', sites);
            if (name) {
                _this.replaceName(name);
            }
            _this.replaceTime(time);
            _this.updateSites(sites);
        });
    },

    close: function() {
        window.close();
    },

    open: function() {
        window.open();
    },

    /*
     * @param name {string}
     */
    replaceName: function(name) {
        this.defaults.$name.innerHTML = name;
    },

    /*
     * @param minutes {integer}
     */
    replaceTime: function(minutes) {
        this.defaults.$time.innerHTML = minutes;
    },

    /*
     * @param site {string}
     * @returns {DOM element}
     */
    createSiteHtml: function(site) {
        var _this = this,
            listItem = document.createElement('li'),
            btnClass = 'sf-btnRemoveSite';

        listItem.innerHTML = '<span class="sf-siteName">'+site + '</span>' +
        '<button class="'+ btnClass +'" type="button">-</button>';
        listItem.setAttribute('class', 'sf-listItem');
        listItem.setAttribute('data-site-name', site);

        listItem.querySelector('.' + btnClass).addEventListener('click', function(e) {
            var site = this.parentNode.dataset.siteName;
            _this.removeSite(site);
        });
        return listItem;
    },

    /*
    * @param site {string}
    */
    appendSite: function(site) {
        var el = this.createSiteHtml(site);
        this.defaults.$sitesList.appendChild(el);
    },

    /*
    * @param sites {array of strings}
    */
    updateSites: function(sites) {
        var _this = this,
            siteList = this.defaults.$sitesList,
            docfrag = document.createDocumentFragment();

        sites.forEach(function(site, i) {
            var li = _this.createSiteHtml(site);
            docfrag.appendChild(li);
        });
        siteList.innerHTML = ''; // clear old sites first
        this.setSites(sites, true);
        siteList.appendChild(docfrag);
    },

    removeSite: function(site) {
        var _this = this;

        this.getLocalStorage('sites', function(data) {
            var sites = data.sites;
            sites.some(function(name, i) {
                if (name == site) {
                    sites.splice(i, 1);
                    return true;
                }
            });
            console.log('sites is now: ', sites);
            var el = document.querySelectorAll('[data-site-name="'+ site +'"')[0];
            if (el) {
                _this.setLocalStorage({sites: sites});
                el.parentNode.removeChild(el);
            }
        });
    },

    showErrorMessage: function(message) {
        // add message to html
    },

    setLocalStorage: function(dataObj, callBack) {
        chrome.storage.sync.set(dataObj, function() {
            console.log('set', dataObj);
            if (callBack) {
                callBack();
            }
        });
    },

    /*
    * @param data {string key} or {array of keys} or {object}
    * @param callBack {function}
    * @returns {object}
    */
    getLocalStorage: function(data, callBack) {
        chrome.storage.sync.get(data, function(a) {
            console.log('get: ', a);
            if (callBack) {
                callBack(a);
            }
        });
    }
};

// Updating the name
Popup.defaults.$nameForm.addEventListener('submit', function(e) {
    var d = Popup.defaults,
        name = d.$nameInput.value;

    e.preventDefault();
    if (!name) {
        Popup.showErrorMessage('Enter a name');
        return false;
    }
    Popup.setLocalStorage({name: name}, function() {
        Popup.replaceName(name);
    });
    d.$nameInput.value = ''; // clear input
    return false;
});

// Updating the time
Popup.defaults.$timeForm.addEventListener('submit', function(e) {
    var d = Popup.defaults,
        time = parseInt(d.$timeInput.value, 10);

    e.preventDefault();
    if (!time) {
        Popup.showErrorMessage('Enter a time');
        return false;
    }
    Popup.setLocalStorage({time: time}, function() {
        Popup.replaceTime(time);
    });
    d.$timeInput.value = ''; // clear input
    return false;
});

// Updating the sites
Popup.defaults.$sitesForm.addEventListener('submit', function(e) {
    var d = Popup.defaults,
        site = d.$sitesInput.value;

    e.preventDefault();
    if (!site) {
        Popup.showErrorMessage('Enter a site');
        return false;
    }
    Popup.setSites([site]);
    Popup.setLocalStorage({sites: Popup.getSites()}, function() {
        Popup.appendSite(site);
    });
    d.$sitesInput.value = ''; // clear input
    return false;
});

// removing a site

Popup.init();

// TODO get correct name, time, sites in content script