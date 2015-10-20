// YOUR CODE HERE:
var removeBadStuff = function(originalString) {
  
  var tempString = originalString.slice();
  var resultString = ""

  //escape out the bad characters
  for (var i = 0; i < tempString.length; i++){
    if (tempString.charAt(i) === "<") {
      resultString += '&lt;';
    } else if (tempString.charAt(i) === ">") {
      resultString += '&gt;';
    } else if (tempString.charAt(i) === "&") {
      resultString += '&amp;';
    } else if (tempString.charAt(i) === '"') {
      resultString += '&quot;';
    } else if (tempString.charAt(i) === "'") {
      resultString += '&#x27;';
    } else if (tempString.charAt(i) === "/") {
      resultString += '&#x2F;';
    } else {
      resultString = resultString + tempString.charAt(i);
    }
  }
  return resultString;
};

// var removeMoreBadStuff = function(str) 
//   if (str) {
//     return str.replace(/</, "");
//   }
// };


$(document).ready( function() {
    $('.chatter-submit').on('click', function() {
      var textbox = $(this).parent().find('.chatter-box')
      var msgText = textbox.val();
      textbox.val("Type it");
      app.addMessage(msgText);
      app.fetch();
    });

    // $('.chatter-submit').submit(function() {
    //   console.log("CHARLIE!!");
    //   var msgText = $(this).parent().find('.chatter-box').val();
    //   app.addMessage(msgText);
    //   return false;
    // });
    $("select").change(function(){
      var sel = $("select option:selected").text();
      app.activeRoom = sel;
      app.clearMessages();
      app.fetch();
    });

    $('#chats').on('click', '.chatterUserName', function(){
      app.addFriend();
      var clickedUser = $(this).data('username');
      app.buddies[clickedUser] = clickedUser;
      console.log(app.buddies);
      //console.log(clickedUser);
      // console.log("SUP");
    });

    $('.room-create').on('click', function() {
      var roomBox = $(this).parent().find('.room-add')
      var rName = roomBox.val();
      app.addRoom(rName);
      app.init();
      app.fetch();
    });

});


var app = {
  activeRoom: "lobby",
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
          
          var roomName = element.roomname || "Lost Humans";
          roomName = removeBadStuff(roomName);
          app.rooms[roomName] = roomName;
          
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

            var u = element.username || "Misguided Human";
            var t = element.text || "The boys are back in town";
            var r = element.roomname || "Misguided Humans";

            u = removeBadStuff(u);
            t = removeBadStuff(t);
            r = removeBadStuff(r);

            var userClass;

            if(app.buddies[u]){
              userClass = 'chatterUserName buddy';
            } else {
              userClass = 'chatterUserName'
            }

            if ( r === app.activeRoom ){

              var $chatter = $('<div/>', {'class': 'chatterContainer'});
              
              $chatter.append($('<div/>', {'class': userClass, 'data-username': u, text: "@"+u}));
              $chatter.append($('<div/>', {'class': 'chatterText', text: t}));
              $chatter.append($('<div/>', {'class': 'chatterRoom', text: "["+r+"]"}));

              $chatter.prependTo('#chats');


              // $('#chats').append('<div class="message">' + removeBadStuff(u) + ': ' + removeBadStuff(t) + ' ['+ removeBadStuff(r) +']</div>');
            }

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
  addMessage: function(msgTxt, room){

    var url = window.location.href;
    var userIndex = url.indexOf("username")+9;
    var user = url.slice(userIndex);
    
    msgTxt = msgTxt || user + " created new room!";
    room = room || app.activeRoom;

    var message = {
      username: user,
      text: msgTxt,
      roomname: room
    };
    this.send(message);
  
  },
  addRoom: function(roomName){
    app.addMessage(undefined,roomName);
    console.log("adding new room: ", roomName);
  },
  addFriend: function() {

  }
};

app.init();
