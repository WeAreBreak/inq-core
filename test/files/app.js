var app = {
    showMessage: function(message) {
        document.querySelector("ul#messages").appendChild(new Node("<li>" + message + "</li>"));
    }
};

cell.registerBridge('chat.app', app);