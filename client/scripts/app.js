// YOUR CODE HERE:
var app = {
  server: 'https://api.parse.com/1/classes/chatterbox',
  init: function(){

  },
  send: function(message){
    $.ajax({
      url: app.server,
      type: "POST",
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function(data){
        console.log("chatterbox: message sent");
      },
      error: function(data){
        console.error("chatterbox: failed to send message");
      }
    });
  },
  fetch: function(){

    $.ajax({
      url: app.server,
      type: "GET",
      dataType: "json",
      contentType: 'application/json',
      success: function(data) {
        _.each(data.results, function(element, index){
           $('#chats').append('<div class="message">' + element.username + ': ' + element.text + '</div>');
        });
      },
      error: function(data) {
        console.error("errorroror");
      }
    });
  },
  clearMessages: function(){
    $('#chats').empty();
  },
  addMessage: function(message){
    $('#chats').append('<div class="message">' + message.username + ': ' + message.text + '</div>');
  }
};

app.fetch();