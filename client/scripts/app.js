// YOUR CODE HERE:
// var removeBadStuff = function(originalString) {
//   var tempString = originalString.slice();
//   var resultString = ""

//   //escape out the bad characters
//   for (var i = 0; i < tempString.length; i++){
//     if (tempString.charAt(i) === "<" || tempString.charAt(i) === ">") {
//       continue;
//     } else {
//       resultString = resultString + tempString.charAt(i);
//     }
//   }
//   return resultString;
// };

var removeMoreBadStuff = function(str) {
  if (str) {
    return str.replace(/</, "");
  }
};


$(document).ready( function() {
    $('.chatter-submit').on('click', function() {
      console.log("CHARLIE!!");
      var msgText = $(this).parent().find('.chatter-box').val();
      console.log(msgText);
      app.addMessage(msgText);
    });
  });






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
           $('#chats').append('<div class="message">' + removeMoreBadStuff(element.username) + ': ' + removeMoreBadStuff(element.text) + '</div>');
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
  addMessage: function(msgTxt){

    var url = window.location.href;
    var userIndex = url.indexOf("username")+9;
    var user = url.slice(userIndex);
    
    var message = {
      username: user,
      text: msgTxt,
      roomname: "Bathroom"
    };
    this.send(message);
  
  },
  addRoom: function(roomName){

  },
};

app.fetch();