//-----------------------------------------------
// Backbone Implementation
//-----------------------------------------------

// Model object
var Message = Backbone.Model.extend({


   url: 'https://api.parse.com/1/classes/chatterbox/',
  // can be used to specify default values for a model
  defaults: {
    username: 'Alexander Hamilton',
    text: 'I\'m not throwin\' away my shot'
  }

});

// Collection object - an ordered set of models
var Messages = Backbone.Collection.extend({

  // specify the model class that the collection contains
  // by providing the class constructor function
  model: Message,

  // references the location of the collection on the server
  // this is where to fetch the data
  url: 'https://api.parse.com/1/classes/chatterbox/',

  loadMsgs: function(){
    this.fetch({data: {order: '-createdAt' }});
  },

  // called when results come back from server
  // by default just returns results
  parse: function(response, options){
    var results = [];
    for ( var i = response.results.length - 1; i >= 0; i-- ){
      results.push(response.results[i]);
    }
    return results;
  }

});

// View object
var FormView = Backbone.View.extend({

  initialize: function(){
    this.collection.on('sync', this.stopSpinner, this);
  },

  events: {
    'submit #send': 'handleSubmit'
  },



  handleSubmit: function(e){

    e.preventDefault();

    this.startSpinner();

    var $text = this.$('#message');

    this.collection.create({
      username: window.location.search.substring(10),
      text: $text.val()
    });

    $text.val('');

    // These two lines can be replaced with the line below!
    // var message = new Message(message);
    // message.save();
  },

  startSpinner: function(){
    this.$('.spinner img').show();
    this.$('form input[type=submit]').attr('disabled', "true");
  },

  stopSpinner: function(){
    this.$('.spinner img').fadeOut('fast');
    this.$('form input[type=submit]').attr('disabled', null);
  }


});


// View object
var MessageView = Backbone.View.extend({

  // Use underbar templating to create a template
  template: _.template('<div class="chat" data-id="<%- objectId %>"> \
                        <div class="user"><%- username %></div> \
                        <div class="text"><%- text %></div> \
                        </div>'),

  // renders an individual message
  render: function(){
    this.$el.html(this.template(this.model.attributes));
    return this.$el;
  }

});

// View object
var MessagesView = Backbone.View.extend({

  initialize: function(){
    this.collection.on('sync', this.render, this);
    this.onscreenMessages = {};
  },

  // append itself to the DOM
  render: function(){
    // must pass in context 'this' to ensure that 
    // we pass correct 'this' binding to render message
    this.collection.forEach(this.renderMessage, this);
  },

  renderMessage: function(message){
    // backbone is pseudoclassical, so we need to instantiate
    // we must pass in some model data representing

    if (!this.onscreenMessages[message.get('objectId')]) {

      var messageView = new MessageView({model: message});
      this.$el.prepend(messageView.render());
      this.onscreenMessages[message.get('objectId')] = true;
    }



  }


});



//-----------------------------------------------
// jQuery Implementation
//-----------------------------------------------






// var removeBadStuff = function(originalString) {
  
//   var tempString = originalString.slice();
//   var resultString = "";

//   //escape out the bad characters
//   for (var i = 0; i < tempString.length; i++){
//     if (tempString.charAt(i) === "<") {
//       resultString += '&lt;';
//     } else if (tempString.charAt(i) === ">") {
//       resultString += '&gt;';
//     } else if (tempString.charAt(i) === "&") {
//       resultString += '&amp;';
//     } else if (tempString.charAt(i) === '"') {
//       resultString += '&quot;';
//     } else if (tempString.charAt(i) === "'") {
//       resultString += '&#x27;';
//     } else if (tempString.charAt(i) === "/") {
//       resultString += '&#x2F;';
//     } else {
//       resultString = resultString + tempString.charAt(i);
//     }
//   }
//   return resultString;
// };

// $(document).ready( function() {
//     $('.chatter-submit').on('click', function() {
//       var textbox = $(this).parent().find('.chatter-box');
//       var msgText = textbox.val();
//       textbox.val("Type it");
//       app.addMessage(msgText);
//       app.fetch();
//     });

//     $("select").change(function(){
//       var sel = $("select option:selected").text();
//       app.activeRoom = sel;
//       app.clearMessages();
//       app.fetch();
//     });

//     $('#chats').on('click', '.chatterUserName', function(){
//       app.addFriend();
//       var clickedUser = $(this).data('username');
//       app.buddies[clickedUser] = clickedUser;
//       console.log(app.buddies);

//     });

//     $('.room-create').on('click', function() {
//       var roomBox = $(this).parent().find('.room-add');
//       var rName = roomBox.val();
//       app.addRoom(rName);
//       app.init();
//       app.fetch();
//     });

// });


var app = {
  server: 'https://api.parse.com/1/classes/chatterbox/',
  username: 'Alexander Hamilton',
  roomname: 'lobby',
  lastMessageId: 0,
  friends: {},
  // activeRoom: "lobby",
  // rooms: {},
  // users: {},
  // buddies: {},

  init: function(){

    // Get username
    app.username = window.location.search.substr(10);

    // Cache jQuery selectors
    app.$main = $('.main');
    app.$message = $('#message');
    app.$chats = $('#chats');
    app.$roomSelect = $('#roomSelect');
    app.$send = $('send');


    // Add listeners
    app.$main.on('click', '.username', app.addFriend);
    app.$send.on('submit', app.handleSubmit);
    app.$roomSelect.on('change', app.saveRoom);

    // Fetch previous messages
    app.startSpinner();
    app.fetch(false);

    // Poll for new messages
    setInterval(app.fetch, 3000);

    // // Grab the rooms from the server
    // $.ajax({
    //   url: app.server,
    //   type: "GET",
    //   dataType: "json",
    //   contentType: 'application/json',
    //   success: function(data){
    //     _.each(data.results, function(element, index){
          
    //       var roomName = element.roomname || "Lost Humans";
    //       roomName = removeBadStuff(roomName);
    //       app.rooms[roomName] = roomName;
    //     });

    //     for (var room in app.rooms) {
    //       $(".room-selector-dropdown").append("<option value =" + room + ">" + room + "</option>");
    //     }

    //   },
    //   error: function(data){
    //     console.error("ERROR");
    //   }
    // });
    // app.fetch();
  },

  send: function(data){

    app.startSpinner();
    // clear messages input
    app.$message.val('');

    // POST the message to the server
    $.ajax({
      url: app.server,
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function (data) {
        // Trigger a fetch to update the messages, pass true to animate
        app.fetch();
      },
      error: function (data) {
        console.error('chatterbox: failed to send message');
      }

    });


    // $.ajax({
    //   url: app.server,
    //   type: "POST",
    //   data: JSON.stringify(message),
    //   contentType: 'application/json',
    //   success: function(data){
    //     console.log("chatterbox: message sent");
    //   },
    //   error: function(data){
    //     console.error("chatterbox: failed to send message");
    //   }
    // });
  },

  fetch: function(animate){

    $.ajax({
      url: app.server,
      type: 'GET',
      contentType: 'application/json',
      data: { order: '-createdAt'},
      success: function(data){
        // Dont bother if we have nothing to work with
        
        if (!data.results || !data.results.length){ 
          return; 
        }

        // Get the last message
        console.log(data);
        var mostRecentMessage = data.results[data.results.length - 1];
        var displayedRoom = $('.chat span').first().data('roomname');
        app.stopSpinner();
        // Only bother updating the DOM if we have a new message
        if (mostRecentMessage.objectId !== app.lastMessageId || app.roomname !== displayedRoom) {
          // Update the UI with the fetched rooms
          app.populateRooms(data.results);

          // Update the UI with the fetched messages
          app.populateMessages(data.results, animate);

          // Store the ID of the most recent message
          app.lastMessageId = mostRecentMessage.objectId;
        }
      },
      error: function(data){
        console.error('chatterbox: Failed to fetch messages');
      }

    });





      // $.ajax({
      //   url: app.server,
      //   type: "GET",
      //   dataType: "json",
      //   contentType: 'application/json',
      //   success: function(data) {

      //     _.each(data.results, function(element, index){

      //       var u = element.username || "Misguided Human";
      //       var t = element.text || "The boys are back in town";
      //       var r = element.roomname || "Misguided Humans";

      //       u = removeBadStuff(u);
      //       t = removeBadStuff(t);
      //       r = removeBadStuff(r);

      //       var userClass;

      //       if(app.buddies[u]){
      //         userClass = 'chatterUserName buddy';
      //       } else {
      //         userClass = 'chatterUserName';
      //       }

      //       if ( r === app.activeRoom ){
      //         var $chatter = $('<div/>', {'class': 'chatterContainer'});
      //         $chatter.append($('<div/>', {'class': userClass, 'data-username': u, text: "@"+u}));
      //         $chatter.append($('<div/>', {'class': 'chatterText', text: t}));
      //         $chatter.append($('<div/>', {'class': 'chatterRoom', text: "["+r+"]"}));

      //         $chatter.prependTo('#chats');
      //       }
      //     });
      //   },
      //   error: function(data) {
      //     console.error("errorroror");
      //   }
      // });


  },

  clearMessages: function(){
    app.$chats.html('');
  },

  populateMessages: function(results, animate){

    // clear existing messages
    app.clearMessages();
    app.stopSpinner();
    if (Array.isArray(results)) {
      // Add all the fetched messages
      results.forEach(app.addMessage);
    }

    // Make it scroll to the bottom
    var scrollTop = app.$chats.prop('scrollHeight');
    if (animate) {
      app.$chats.animate({
        scrollTop: scrollTop
      });
    }
    else {
      app.$chats.scrollTop(scrollTop);
    }

  },

  populateRooms: function(results){

    app.$roomSelect.html('<option value="__newRoom">New room...</option><option value="" selected>Lobby</option></select>');

    if (results) {
      var rooms = {};
      results.forEach(function(data){
        var roomname = data.roomname;
        if (roomname && !rooms[roomname]){
          // add the room to the select menu
          app.addRoom(roomname);

          // Store that we've added this room already
          rooms[roomname] = true;
        }
      });
    }

    // Select the menu option
    app.$roomSelect.val(app.roomname);
  },

  addRoom: function(roomname){
    // Prevent XSS by escaping with DOM methods
    var $option = $('<option/>').val(roomname).text(roomname);

    // Add to select
    app.$roomSelect.append($option);
  },

  addMessage: function(data){

    if (!data.roomname){
      data.roomname = 'lobby';
    }

    // Only add messages that are in our current room
    if (data.roomname === app.roomname){
      // Create a div to hold the chats
      var $chat = $('<div class="chat"/>');

      // Add the message data using DOM methods to avoid XSS
      // Store the username in the element's data
      var $username = $('<span class="username"/>');
      $username.text(data.username+': ').attr('data-username', data.username).attr('data-roomname', data.roomname).appendTo($chat);

      // Add the friend class
      if (app.friends[data.username] === true){
        $username.addClass('friend');
      }

      var $message = $('<br><span/>');
      $message.text(data.text).appendTo($chat);

      // Add the message to the UI
      app.$chats.append($chat);

    }


    // var url = window.location.href;
    // var userIndex = url.indexOf("username")+9;
    // var user = url.slice(userIndex);
    
    // msgTxt = msgTxt || user + " created new room!";
    // room = room || app.activeRoom;

    // var message = {
    //   username: user,
    //   text: msgTxt,
    //   roomname: room
    // };
    // this.send(message);
  
  },

  // addRoom: function(roomName){
  //   app.addMessage(undefined,roomName);
  //   console.log("adding new room: ", roomName);
  // },

  addFriend: function(evt) {
    var username = $(evt.currentTarget).attr('data-username');

    if (username !== undefined) {
      // Store as a friend
      app.friends[username] = true;
    }

    // Bold all previous messages
    // Escape the username in case it contains a quote
    var selector = '[data-username="'+username.replace(/"/g, '\\\"')+'"]';
    var $username = $(selector).addClass('friend');

  },

  saveRoom: function(evt){
    var selectIndex = app.$roomSelect.prop('selectedIndex');
    // New room is always the first option

    if (selectIndex === 0) {
      var roomname = prompt('enter room name');
      if (roomname) {
        // Set as current roomname
        app.roomname = roomname;

        // Add the room to the menu
        app.addRoom(roomname);

        // Select the menu option
        app.$roomSelect.val(roomname);

        // Fetch messages again
        app.fetch();
      }
    }
    else {
      app.startSpinner();
      // Store as undefined for empty names
      app.roomname = app.$roomSelect.val();

      // Fetch messages again
      app.fetch();
    }
  },

  handleSubmit: function(evt) {
    var message = {
      username: app.username,
      text: app.$message.val(),
      roomname: app.roomname || 'lobby'
    };

    app.send(message);

    // Stop the form from submitting
    evt.preventDefault();
  },

  startSpinner: function(){
    $('.spinner img').show();
    $('form input[type=submit]').attr('disabled', "true");
  },

  stopSpinner: function(){
    $('.spinner img').fadeOut('fast');
    $('form input[type=submit]').attr('disabled', null);
  }

};
