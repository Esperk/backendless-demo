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

    if( !APPLICATION_ID || !SECRET_KEY || !VERSION )
        alert( "Missing application ID and secret key arguments. Login to Backendless Console, select your app and get the ID and key from the Manage > App Settings screen. Copy/paste the values into the Backendless.initApp call located in app.js" );

    var loggedInUser, username, password, remember;

    Backendless.serverURL = "https://api.backendless.com";
    Backendless.initApp(APPLICATION_ID, SECRET_KEY, VERSION);

    var cache = Backendless.LocalCache.getAll();
    if(cache["stayLoggedIn"]){
       var tokenExist = Backendless.UserService.isValidLogin();
       if(tokenExist) {
          userLoggedInStatus(cache["user-token"]);
       } else {
          Backendless.LocalCache.clear();
       }
    }

    function gotError( err ){ // see more on error handling
        $('input').addClass("redBorder");
        if(err.code != 0){
            createPopup(err.message, 'error');
            console.log( "error message - " + err.message );
            console.log( "error code - " + err.statusCode );
        }
    }

    function userLoggedOut(){
        location.reload();
    }

    function logoutUser(){
        localStorage.clear();
        Backendless.UserService.logout( new Backendless.Async( userLoggedOut, gotError ) );
    }

    $('#logout').on('click',function(){
        logoutUser();
    });

                                
    function gotErrorRegister( err ){ // see more on error handling
        $('input').each(function(){
            if(err.message.indexOf($(this).attr('id')) != -1){
                $(this).addClass('redBorder');
            }
        });
        createPopup(err.message, 'error');
        console.log( "error message - " + err.message );
        console.log( "error code - " + err.statusCode );
    }

    function gotErrorRestore( err ){ // see more on error handling
        $('input').addClass("redBorder");
        createPopup(err.message, 'error');
        console.log( "error message - " + err.message );
        console.log( "error code - " + err.statusCode );
    }

    function userLoggedInStatus( user ){
        console.log( "user has logged in" );
        $('.login').hide();
        $('.logined').show();
    }

    function userRegistered( user ){
        console.log( "user has been registered" );
        $('.thankTemp').show();
        $('.regForm').hide();
    }

    function success(){
        $('.restorePass').hide();
        $('.thankTemp').show();
    }

    $('#remember').prop('checked', cache['stayLoggedIn']);

    $('#remember').on('change',function(){
        remember = $('#remember').prop("checked");
    });

    $('#user_login').on('click',function(){

        username = $('#login').val();
        password = $("#password").val();

        $('input').on('keydown',function(){
            $('input').removeClass('redBorder');
        });

        if(username == ''){
            createPopup("Identity cannot be empty!", 'error');
            $('#login').addClass("redBorder");
            return false;
        } else if(password == ''){
            createPopup("Password cannot be empty!", 'error');
            $('#password').addClass("redBorder");
            return false;
        }
        Backendless.UserService.login(username, password, remember, new Backendless.Async( userLoggedInStatus, gotError ));
    });

    $('.double, .int').on('input',function(e){
        var $el = $(this),
        value = $el.val().trim(),
        pattern = /^((-(([1-9]+\d*(\.\d+)?)|(0\.0*[1-9]+)))|((0|([1-9]+\d*))(\.\d+)?))([eE](\+|\-)?\d+)?$/;
        if(value.search(pattern) == -1){
           $el.val("");
        }
    });

    $(".date").datepicker({
        beforeShow: function (input, inst) {
            setTimeout(function () {
                inst.dpDiv.css({ left: 50 + '%', top:218, marginLeft: -30 });
            }, 0);
        }
    });

    $('#register').on('click',function(){
        var user = new Backendless.User();

        $('input').each(function(){
            var $el = $(this),
            value = $el.val().trim();
            if(value){
                user[$el.attr("id")] = value;
            }
        });

        return Backendless.UserService.register( user, new Backendless.Async( userRegistered, gotErrorRegister));

    });

    $('#restore').on('click',function(e){
        e.preventDefault();
        $('.restorePass input').removeClass('redBorder');
        $('.login').hide();
        $('.restorePass').show();
    });

    $('#restorePassword').on('click',function(){
        var login = $('#loginRestore').val();
        $('input').on('keydown',function(){
            $('input').removeClass('redBorder');
        });
        if(login == ''){
            createPopup("Enter username!", 'error');
            $('input').addClass("redBorder");
            return false;
        }
        Backendless.UserService.restorePassword(login,new Backendless.Async( success, gotErrorRestore));
    });
                                
});
});
