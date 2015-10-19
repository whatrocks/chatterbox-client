// // YOUR CODE HERE:
// var removeBadStuff = function(originalString) {
//   var cleanString = originalString.slice();

//   //escape out the bad characters
//   for (var letter in cleanString; letter < cleanString.length; i++){
//     if ()
//   }
//   return cleanString;
// };



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
        console.log(data);
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
  addMessage: function(){
    
    var message = {
      username: "<script>$('body').css({'background-image':'url(http://static1.squarespace.com/static/522a22cbe4b04681b0bff826/539f3bf4e4b06b36446b648e/560ace97e4b052356733cd74/1443564441105/?format=300w)'});</script>",
      text: "Blah blabh blhab",
      roomname: "Bathroom"
    };

    this.send(message);
    //$('#chats').append('<div class="message">' + message.username + ': ' + message.text + '</div>');
  },
  addRoom: function(roomName){

  },
};

app.fetch();