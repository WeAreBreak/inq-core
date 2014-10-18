cell("chat") {
    var clients = {};

    endpoint registerClient(userId : string, clientCell : cell("chat.client")) {
        clients[userId] = clientCell;
    }

    endpoint getClient(targetUserId : string) : cell("chat.client") {
        return clients[targetUserId];
    }
}

cell("chat.client") {
    var server = cell("chat"),
        fb     = cell("http://graph.facebook.com") with contract("facebook"),
        app    = dynamic cell(".app"); // Native module

    endpoint logon(userId) {
        server.registerClient(userId, cell.instance);
    }

    endpoint receive(message) {
        app.showMessage(message);
    }

    endpoint send(targetUserId, message) {
        server.getClient(targetUserId).receive(message);
    }
}