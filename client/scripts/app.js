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

var removeBadStuff = function(originalString) {
  
  var tempString = originalString.slice();
  var resultString = "";

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

$(document).ready( function() {
    $('.chatter-submit').on('click', function() {
      var textbox = $(this).parent().find('.chatter-box');
      var msgText = textbox.val();
      textbox.val("Type it");
      app.addMessage(msgText);
      app.fetch();
    });

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

    });

    $('.room-create').on('click', function() {
      var roomBox = $(this).parent().find('.room-add');
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
        });

        for (var room in app.rooms) {
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
              userClass = 'chatterUserName';
            }

            if ( r === app.activeRoom ){
              var $chatter = $('<div/>', {'class': 'chatterContainer'});
              $chatter.append($('<div/>', {'class': userClass, 'data-username': u, text: "@"+u}));
              $chatter.append($('<div/>', {'class': 'chatterText', text: t}));
              $chatter.append($('<div/>', {'class': 'chatterRoom', text: "["+r+"]"}));

              $chatter.prependTo('#chats');
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
