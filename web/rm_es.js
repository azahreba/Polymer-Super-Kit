//chrome.extension.*
//chrome.browserAction.*
//chrome.pageAction.*
//chrome.windows.*

chrome.extension;
//chrome.extension.*
  //.sendRequest(req) -> onRequest.addListener(fn(req, sender, sendResponse))
  //.getViews()
//chrome.runtime.*
//.getBackgroundPage()

chrome.runtime;
//chrome.runtime.onInstalled - initialization
//chrome.runtime.onSuspend
/* event page loads:
 - installed
 - event dispatched
 - other part sends a message
 - popup calls runtime.getBackgroundPage()
 unloads:
 - runtime.onSuspend event is dispatched -> runtime.onSuspendCanceled()
 */
chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  console.log(response.farewell);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action == "show") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'close'});
      chrome.pageAction.show(tabs[0].id);
    });
  }

  sendResponse({farewell: "goodbye"});

  return true;
});

var port = chrome.runtime.connect({name: "knockknock"});
port.postMessage({joke: "Knock knock"});

chrome.runtime.onConnect.addListener(function(port) {
  if(port.name == "my-channel"){
    port.onMessage.addListener(function(msg) {
      // do some stuff here
    });
  }

  port.onMessage.addListener(function(msg) {
    if (msg.question == "Who's there?")
      port.postMessage({answer: "Madame"});
    else if (msg.question == "Madame who?")
      port.postMessage({answer: "Madame... Bovary"});
  });
});

chrome.runtime.openOptionsPage();
document.querySelector('#go-to-options').addEventListener(function() {
  if (chrome.runtime.openOptionsPage) {
    // New way to open options pages, if supported (Chrome 42+).
    chrome.runtime.openOptionsPage();
  } else {
    // Reasonable fallback.
    window.open(chrome.runtime.getURL('options.html'));
  }
});

//chrome.alarms.*
//chrome.events.*
chrome.alarms;
/*
 chrome.alarms.onAlarm.addListener(function(alarm) {
 appendToLog('alarms.onAlarm --'
 + ' name: '          + alarm.name
 + ' scheduledTime: ' + alarm.scheduledTime);
 });
*/

chrome.i18n;
//chrome.i18n.getMessage("messagename")


chrome.storage.onChanged.addListener((changes) => {
  chrome.browserAction.setBadgeBackgroundColor({
    color: [255, 0, 0, 255]
  });
  chrome.browserAction.setBadgeText({text: changes.length.toString()});
});

chrome.storage.sync.set({
  favoriteColor: color,
  likesColor: likesColor
}, function() {
  // Update status to let user know options were saved.
  var status = document.getElementById('status');
  status.textContent = 'Options saved.';
  setTimeout(function() {
    status.textContent = '';
  }, 750);
});

chrome.contextMenus.create({
  "id": "add",
  "title": "Add",
  "contexts": ["selection"]
});

chrome.contextMenus.onCliked.addListener((clickData) => {
  if (clickData.menuItemId == "add" && clickData.selectionText) {

  }
});

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  switch(request.type) {
    case "dom-loaded":
      alert(request.data.myProperty);
      break;
  }
  return true;
});

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
  suggest([
    {content: text + " one", description: "the first one"},
    {content: text + " number two", description: "the second entry"}
  ]);
});
chrome.omnibox.onInputEntered.addListener(function(text) {
  alert('You just typed "' + text + '"');
});

// This function will eventually contain some logic
// for receiving background-color values from the
// current tab.
function getBgColors (tab) {
  // But for now, let's just make sure what we have so
  // far is working as expected.
  alert('The browser action was clicked! Yay!');
}

// When the browser action is clicked, call the
// getBgColors function.
chrome.browserAction.onClicked.addListener(getBgColors);

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
  // No tabs or host permissions needed!
  console.log('Turning ' + tab.url + ' red!');
  chrome.tabs.executeScript({
    code: 'document.body.style.backgroundColor="red"'
  });
});

/*
 https://src.chromium.org/viewvc/chrome/trunk/src/chrome/common/extensions/docs/examples/extensions/gmail/background.jshttps://src.chromium.org/viewvc/chrome/trunk/src/chrome/common/extensions/docs/examples/extensions/gmail/background.js
* function goToInbox() {
   console.log('Going to inbox...');
   chrome.tabs.getAllInWindow(undefined, function(tabs) {
     for (var i = 0, tab; tab = tabs[i]; i++) {
       if (tab.url && isGmailUrl(tab.url)) {
         console.log('Found Gmail tab: ' + tab.url + '. ' +
            'Focusing and refreshing count...');
         chrome.tabs.update(tab.id, {selected: true});
         startRequest({scheduleRequest:false, showLoadingAnimation:false});
         return;
       }
     }
     console.log('Could not find Gmail tab. Creating one...');
     chrome.tabs.create({url: getGmailUrl()});
   });
 }

 function scheduleRequest() {
   console.log('scheduleRequest');
   var randomness = Math.random() * 2;
   var exponent = Math.pow(2, localStorage.requestFailureCount || 0);
   var multiplier = Math.max(randomness * exponent, 1);
   var delay = Math.min(multiplier * pollIntervalMin, pollIntervalMax);
   delay = Math.round(delay);
   console.log('Scheduling for: ' + delay);

   if (oldChromeVersion) {
     if (requestTimerId) {
       window.clearTimeout(requestTimerId);
     }
     requestTimerId = window.setTimeout(onAlarm, delay*60*1000);
   } else {
     console.log('Creating alarm');
     // Use a repeating alarm so that it fires again if there was a problem
     // setting the next alarm.
     chrome.alarms.create('refresh', {periodInMinutes: delay});
   }
 }

 // ajax stuff
 function startRequest(params) {
   // Schedule request immediately. We want to be sure to reschedule, even in the
   // case where the extension process shuts down while this request is
   // outstanding.
   if (params && params.scheduleRequest) scheduleRequest();

   function stopLoadingAnimation() {
     if (params && params.showLoadingAnimation) loadingAnimation.stop();
   }

   if (params && params.showLoadingAnimation)
     loadingAnimation.start();

   getInboxCount(
     function(count) {
       stopLoadingAnimation();
       updateUnreadCount(count);
     },
     function() {
       stopLoadingAnimation();
       delete localStorage.unreadCount;
       updateIcon();
     }
   );
 }
* */