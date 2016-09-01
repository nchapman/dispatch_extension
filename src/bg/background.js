// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

function fetchFeeds(callback) {
  console.log('fetching feeds');

  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://localhost:5000/feeds.json', true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var feeds = JSON.parse(xhr.responseText).feeds;
      callback(feeds);
    }
  }
  xhr.send();
}

function updateSubscriptions(subscriptions) {
  console.log('updating subscriptions');

  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://localhost:5000/subscriptions/import.json', true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.send('subscriptions=' + JSON.stringify(subscriptions));
}

function readHistoryItems(callback) {
  console.log('reading history items');

  chrome.history.search({ 'text': '', startTime: 0, maxResults: 10000 }, callback);
}

function extractSubscriptions() {
  fetchFeeds(function(feeds) {
    console.log(feeds);

    readHistoryItems(function(historyItems) {
      var subscriptions = {};

      feeds.forEach(function(feed) {
        var pattern = new RegExp('^https?://(www\.)?' + feed.domain);
        var count = 0;

        historyItems.forEach(function(historyItem) {
          if (historyItem.url.match(pattern)) {
            count += historyItem.visitCount;
          }
        });

        subscriptions[feed.id] = count;
      });

      console.log('subscriptions', subscriptions);

      updateSubscriptions(subscriptions);
    });
  });
}

extractSubscriptions();


// function readHistoryItems() {
//   var visits = [];
//
//   chrome.history.search({ 'text': '', startTime: 0, maxResults: 10000 }, function (historyItems) {
//     console.log(historyItems.length);
//
//     var urls = historyItems.map(function (historyItem) { return historyItem.url });
//
//     (function getVisits() {
//       console.log('getting visits (again)');
//
//       var url = urls.pop();
//
//       if (url == null) {
//         console.log('our work here is done');
//         console.log(visits.length);
//
//         return;
//       }
//
//       chrome.history.getVisits({ url: url }, function (visitItems) {
//         visitItems.forEach(function (visitItem) {
//           visits.push({ id: visitItem.id, url: url, referringVisitId: visitItem.referringVisitId });
//         });
//
//         // do it again -- but not too fast
//         setTimeout(getVisits, 50);
//       });
//     })();
//   });
// }
