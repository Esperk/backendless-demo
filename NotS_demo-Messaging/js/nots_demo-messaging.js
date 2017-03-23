$.holdReady(true);

$.getScript(((window.location.protocol == 'file:') ? "http:" : window.location.protocol) + "//api.backendless.com/sdk/js/latest/backendless.min.js", function() {
    $.holdReady(false);

(function ($) {
    $.fn.wrongInput = function () {
        return this.each(function () {
            var $this = $(this),
                $field = $this.is("input.txt") || $this.is("input[type=text]") ? $this : $this.find("input.txt"),
                rmWrng = function ($field) {
                    $field.removeClass('wronginput');
                };
            if ($field.hasClass('wronginput')) {
                return
            }
            $field.addClass('wronginput');
            $field.one('input', function () {
                rmWrng($field);
            });
        });
    };
})(Zepto);

$(function(){

        function createPopup(text, type) {
            var $popup = $("<div class='popup'></div>"),
                $body = $('body');
            if (type) {
                $popup.addClass(type);
            }
            $popup.text(text);
            if ($body.find('.popup').length) {
                $('.popup').remove();
            }
            $body.append($popup);
            $popup.animate({
                right: '20px',
                opacity: 0.8
            }, 500);
            setTimeout(function () {
                $popup.animate({
                    right: '-' + $popup.width() + 'px',
                    opacity: 0
                }, 500);
                setTimeout(function () {
                    $popup.remove();
                }, 500);
            }, 3000);
        }

    //Backendless: defaults

    var APPLICATION_ID = '15C508DC-9719-9288-FF64-67672CCB9700';
    var SECRET_KEY = '8208A170-3073-5B2D-FF7A-5C388513E800';
    var VERSION = 'v1';
    var CHANNEL = 'default';
    Backendless.serverURL = "https://api.backendless.com";

    if (!APPLICATION_ID || !SECRET_KEY || !VERSION)
        alert("Missing application ID and secret key arguments. Login to Backendless Console, select your app and get the ID and key from the Manage > App Settings screen. Copy/paste the values into the Backendless.initApp call located in UserExample.js");

    init();
    function init() {
        Backendless.initApp(APPLICATION_ID, SECRET_KEY, VERSION);
    }

    var classes = [], $name_field = $( '.name'), $messages_history_field = $( '#messages-history-field'), $message_field = $( '#message-field'), namesQuery = [];

    function Users(args) {
        args = args || {};
        this.___class = 'Users';
        this.objectId = args.objectId || null;
    }

    function ChatUser(args) {
        args = args || {};
        this.___class = 'ChatUser';
        this.objectId = args.objectId || null;
        this.name = args.name || null;
    }

    var nicks = Backendless.Persistence.of(ChatUser);
    Backendless.Persistence.of(ChatUser).save(new ChatUser({
        name: 'defaultUser'
    }));

    function showHideBlocks(show,hide){
        $(show).show();
        $(hide).hide();
    }

    function alphabet(a,b){
        var A = a.toLowerCase();
        var B = b.toLowerCase();
        if (A < B){
            return -1;
        }else if (A > B){
            return  1;
        }else{
            return 0;
        }
    }

    function createUserBlock(updatedNick, userNick){
        if(!updatedNick || !userNick) {
           return;
        }
        classes.push(updatedNick);
        classes.push(userNick);
        classes = classes.sort(alphabet);
        namesQuery += '<div class="block"><span>' + classes[0] + '-' + classes[1] + '</span>' + updatedNick + '</div>';
        classes = [];
    }

    function loadUsers(){
        namesQuery = "";
        if($name_field.val() == ""){
            createPopup('Please, enter nickname!','error');
            return false;
        }
        var users = Backendless.Persistence.of(Users).find();
        var newNick = new ChatUser({
            name: protectXSS($name_field.val())
        });
        var oldNicks = nicks.find();
        for(var i = 0; i<oldNicks.data.length;i++){
            if((newNick.name == oldNicks.data[i].name) || (oldNicks.data[i].name == 'defaultUser')){
                nicks.remove(oldNicks.data[i]);
            }
        }
        nicks.save(newNick);
        var updatedNicks = nicks.find();
        for(var i = 0; i<updatedNicks.data.length;i++){
            if(updatedNicks.data[i].name == newNick.name){
                console.log(updatedNicks.data[i].name);
            } else {
                createUserBlock(updatedNicks.data[i].name, newNick.name);
            }
        }
        for(var i = 0; i<users.data.length;i++){
            createUserBlock(users.data[i].email.split("@")[0], newNick.name);
        }
        $('.pick .tables').html(namesQuery);
        return newNick.name;
    }


    function showUsers(){
        var userName = loadUsers();
        $('.yourNick').html(userName);
        showHideBlocks('.pick','.index');
        $('.pick .back').on('click',function(){
            showHideBlocks('.index','.pick');
        });
        $('.block').each(function(){
            $(this).off("click");
            $(this).click(function(){
                $('.btn').off('click');
                $('.btn').click(function(){
                    console.log($message_field.val());
                    if($message_field.val() == ""){
                        createPopup('Message cannot be empty', 'error');
                        return false;
                    }
                    publish($('.subscribed').find('span').text());
                });
                var $subtopic = $(this);
                $subtopic.addClass('subscribed');
                $("#editor").next().find('.message').text($message_field.val());
                $("#editor").next().find('.publisher').text(userName);
                $("#editor, #editor2").next().find('.subtopic').text($('.subscribed').find('span').text());
                editors.editor.setValue($('#editor').next().text());
                editors.editor.session.selection.clearSelection();
                editors.editor2.setValue($('#editor2').next().text());
                editors.editor2.session.selection.clearSelection();
                $message_field.on('input',function(){
                    $("#editor").next().find('.message').text($message_field.val());
                    editors.editor.setValue($('#editor').next().text());
                    editors.editor.session.selection.clearSelection();
                });
                showHideBlocks('.chat','.pick');
                if($subtopic.find('span').text().split("-")[0] == userName){
                    $('.chatWith').html('You are chatting with <span class="yourNick"></span>');
                    $('.chatWith .yourNick').text($subtopic.find('span').text().split("-")[1]);
                } else {
                    $('.chatWith').html('You are chatting with <span class="yourNick"></span>');
                    $('.chatWith .yourNick').text($subtopic.find('span').text().split("-")[0]);
                }
                var sub = subscribe($subtopic.find('span').text());
                createPopup("You are subscribed on this " + sub.options.subtopic.toUpperCase() + " channel", 'successPopup');
                $('.chat .back').off("click");
                $('.chat .back').click(function(){
                    sub.cancelSubscription();
                    createPopup('You are unsubscribed from ' + sub.options.subtopic.toUpperCase()+ ' channel', 'successPopup');
                    $('.subscribed').remove('class','subscribed');
                    showUsers();
                    showHideBlocks('.pick','.chat');
                });
            });
        });

    }

    $('.send').on('click',function(){
        if($name_field.val() == ""){
            createPopup("Name field cannot be empty", 'error');
            return false;
        }
        showUsers();
    });

    $('.reload').on('click',function(){
        showUsers();
    });

    $('.name').keyup(function(event){
        if(event.keyCode == 13){
            if($name_field.val() == ""){
                createPopup("Name field cannot be empty", 'error');
                return false;
            }
            showUsers();
        }
    });

    function subscribe(subtopic){
        $messages_history_field.html("");
        var subscriptionOptions = new SubscriptionOptions({subtopic:subtopic});
        var sub = Backendless.Messaging.subscribe( CHANNEL, onMessage, subscriptionOptions);
        return sub;
    }

    function publish(subtopic){
        if( !$message_field )
            return;
        var publishOptions = new PublishOptions();
        publishOptions.publisherId = $name_field.val();
        publishOptions.subtopic = subtopic;
        Backendless.Messaging.publish( CHANNEL, $message_field.val(), publishOptions);
        $message_field.val( null );
    }

   function onMessage( result ){
       $.each( result.messages, function (){
          this.data = protectXSS(this.data);
          this.publisherId = protectXSS(this.publisherId);
          $messages_history_field.html( '<div class="quote"><span class="you">[' + this.publisherId + "]</span>: " + this.data + "<br/>" + $messages_history_field.html() + '</div>' );
       });
   }

    function protectXSS(val){
            return val.replace(/(<|>)/g, function (match) {
                return match == '<' ? '&lt;' : '&gt;';
            });
    }

});
});