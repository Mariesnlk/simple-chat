let isAdmin = false;
const socket = io();

$(document).ready(function(){
	add_all_messages();
});

function add_all_messages(){
	console.log('emiting adding messages');
	socket.emit('add_all_messages', 'msgs');
}

$(function(){
	
	var message = $("#message-area");
	var username = $("#username");
	var send_message = $("#send_message");
	var send_username = $("#login");
	var chatroom = $("#chatroom");

	socket.on("Hello", (data) =>{
		for(let i=0; i<data.lenth; i++){
			let th = document.getElementsByClassName("message")[0];
			let item = th.cloneNode(true);
			item.style.display= "block";
			item.getElementsByClassName("text")[0].innerHTML=data[i].message;
			document.getElementById("chatroom").appendChild(item);
		}	
	});

	let th = document.getElementsByClassName("message")[0];
	let item = th.cloneNode(true);
	item.style.display = "block";
	//emit message
	send_message.click (function(){
		socket.emit('new_message', {message : message.val()});
	});
	//emit a username
	send_username.click (function(){
		console.log(username.val());
		if(username.val()=="mariesnlk"){
			isAdmin = true;

			let del = document.querySelectorAll(".button-delete");
			console.log(del);
			for(let i=0; i<del.length; i++){
				del[i].innerHTML = "Delete";
				del[i].addEventListener('click ', function del() {
          			$(this).parent().detach();
                	socket.emit('delete', $(this).siblings(".text").html());
                	console.log("Delete");
        		});
				// del[i].style.display = "inline-block";
				
			}
			$('.button-delete').show();
		} else{
			isAdmin = false;
			let del = document.getElementsByClassName("button-delete");
			for(let i=0; i<del.lenght; i++){
				del[i].innerHTML = "Delete";
				//del[i].style.display = "none";
				
				console.log(del[i]);
			}
			 $('.button-delete').hide();
		}
		socket.emit('change_username', {username: username.val()});
	});
	
	//listen on new_message
	socket.on("new_message", (data) =>{
		//console.log(data)
		document.getElementById("message-area").value="";
		let th = document.getElementsByClassName("message")[0];
		let item = th.cloneNode(true);
		item.style.display="block";
		item.getElementsByClassName("text")[0].innerHTML = '<div class="user">' + data.username +'</div>'+ '<div class="pole">' + data.message + '</div>';
		document.getElementById("chatroom").appendChild(item);
		//message.val('');
		//chatroom.append("<p class='message'>" + data.username + ":" + data.message + "</p>")
	});

	socket.on('add_all_messages', function(data){
		console.log('adding all messages');
		for(let i = 0; i < data.length; i++){
			socket.emit('new_message', data[i]);
	}
	});

});

