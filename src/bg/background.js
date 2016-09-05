const REFRESH_DELAY_SECONDS = 24 * 60 * 60; // 24 hours

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
  xhr.withCredentials = true;
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
setInterval(extractSubscriptions, REFRESH_DELAY_SECONDS);
