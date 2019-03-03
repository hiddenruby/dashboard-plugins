chrome.browserAction.onClicked.addListener(function(tab){
    msg={task:"settings"};
    chrome.tabs.sendMessage(tab.id,msg);
});
