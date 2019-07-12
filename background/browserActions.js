chrome.browserAction.onClicked.addListener((tab) => {
    optionsPage();
});

chrome.runtime.onInstalled.addListener(() => {
});

function optionsPage() {
    var optionsUrl = "https://www.tumblr.com/settings/dashboard"; 
    chrome.tabs.query({}, function(extensionTabs) {
        if (extensionTabs.some(function(i){window.optionsTab = i; return i.url.indexOf(optionsUrl) > -1})){
                chrome.tabs.update(window.optionsTab.id, {"selected": true});
            } else {
                chrome.tabs.create({url: optionsUrl});
        };
    });
};