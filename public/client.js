$(function() {
  
    $('#login').click(function() {
      // Call the authorize endpoint, which will return an authorize URL, then redirect to that URL
      $.get('/api/login', function(data) {
        console.log("callback url: " + data)
        window.location.replace(data);
      });
    });
  });

    
    // const hash = window.location.hash
    //   .substring(1)
    //   .split('&')
    //   .reduce(function (initial, item) {
    //     if (item) {
    //       var parts = item.split('=');
    //       initial[parts[0]] = decodeURIComponent(parts[1]);
    //     }
    //     return initial;
    //   }, {});
    //   window.location.hash = '';
    
    // if (hash.access_token) {
    //   $.get({url: '/current', headers: {"Authorization": `Bearer ${hash.access_token}`}}, function(data) {
    //     // "Data" is the array of track objects we get from the API. See server.js for the function that returns it.
    //     console.log(data)
  
    //     var title = $('<h3>Currently playing:</h3>');
    //     title.prependTo('#data-container');
        
        
    //     let content = $(`<h2>${data}</h2>`)
    //     content.prependTo('#data-container');
    //   });

    //   $.get({url: '/me', headers: {"Authorization": `Bearer ${hash.access_token}`}}, function(data) {
    //     // "Data" is the array of track objects we get from the API. See server.js for the function that returns it.
    //     console.log(data)
  
    //     var title = $('<h3>Your stats:</h3>');
    //     title.prependTo('#data-container');
        
        
    //     let content = $(`<h2>${data}</h2>`)
    //     content.prependTo('#data-container');
    //   });
