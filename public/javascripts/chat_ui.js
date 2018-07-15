/**
 * create by wangyw on 18.07.15
 * @type {jQuery|HTMLElement}
 */


let send_message = $('#send-message');
let messages = $('#messages');
let send_form = $("#send-form");
let room_list = $('#room-list');
let room_list_div = $("#room-list div");
let _room = $('#room');

function divEscapedContentElement(message) {
	return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
	return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp, socket) {
	var message = send_message.val();
	var systemMessage;

	if (message.charAt(0) === '/') {
		systemMessage = chatApp.processCommand(message);
		if (systemMessage) {
            messages.append(divSystemContentElement(systemMessage));
		}
	} else {
		chatApp.sendMessage(_room.text(), message);
        messages.append(divEscapedContentElement(message));
        messages.scrollTop(messages.prop('scrollHeight'));
	}

	send_message.val('');
}

var socket = io.connect();

$(document).ready(function () {
	var chatApp = new Chat(socket);

	socket.on('nameResult', function (result) {
		var message;
		if (result.success) {
			message = 'You are now known as ' + result.name + '.';
		} else {
			message = result.message;
		}
        messages.append(divSystemContentElement(message));
	});

	socket.on('joinResult', function (result) {
        _room.text(result.room);
		messages.append(divSystemContentElement('Room changed.'));
	});

	socket.on('message', function (message) {
		var newElement = $('<div></div>').text(message.text);
        messages.append(newElement);
	});

	socket.on('rooms', function (rooms) {
		room_list.empty();

		for (var room in rooms) {
			if (!rooms.hasOwnProperty(room)) {return;}
			room = room.substring(1, room.length);
			if (room !== '') {
				room_list.append(divEscapedContentElement(room));
			}
		}

		room_list_div.click(function () {
			chatApp.processCommand('/join ' + $(this).text());
			send_message.focus();
		});
	});

	setInterval(function () {
		socket.emit('rooms');
	}, 1000);

	send_message.focus();

    send_form.submit(function () {
		processUserInput(chatApp, socket);
		return false;
	});
});

