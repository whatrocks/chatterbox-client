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
    rooms: {},
    users: {},
    buddies: {},
  server: 'https://api.parse.com/1/classes/chatterbox/',
  init: function(){

    // Grab the rooms from the server
    
    $.ajax({
      url: app.server,
      type: "GET",
      dataType: "json",
      contentType: 'application/json',
      success: function(data){
        _.each(data.results, function(element, index){
          
          var roomName = removeMoreBadStuff(element.roomname);
          app.rooms[roomName] = roomName !== 'undefined' ? roomName : 'Lost Humans';
          
          // var userName = removeMoreBadStuff(element.username);
          // people[userName] = userName;
        });

        for (var room in app.rooms) {
          // console.log("room:", room);
          $(".room-selector-dropdown").append("<option value =" + room + ">" + room + "</option>");
        }

      },
      error: function(data){
        console.error("ERROR");
      }
    });

    app.fetch();


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
        // console.log(data.results);
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

app.init();
