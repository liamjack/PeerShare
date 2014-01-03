Date.prototype.today = function(){ 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear() 
};
Date.prototype.timeNow = function(){
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
};

function getTimestamp() {
	var newDate = new Date();
	var timestamp = "<strong>[" + newDate.today() + " " + newDate.timeNow() + "]</strong> ";
	
	return timestamp;
}

function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Bytes';
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

jQuery.fn.selectText = function(){
    this.find('input').each(function() {
        if($(this).prev().length == 0 || !$(this).prev().hasClass('p_copy')) { 
            $('<p class="p_copy" style="position: absolute; z-index: -1;"></p>').insertBefore($(this));
        }
        $(this).prev().html($(this).val());
    });
    var doc = document;
    var element = this[0];
    if (doc.body.createTextRange) {
        var range = document.body.createTextRange();
        range.moveToElementText(element);
        range.select();
    } else if (window.getSelection) {
        var selection = window.getSelection();        
        var range = document.createRange();
        range.selectNodeContents(element);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

$(document).ready(function() {
	var peer = new Peer({key: 'YOUR PEERCLOUD API KEY', debug: 0});

	peer.on('error', function(err) {
		$("#container").html('<h2>Error encountered</h2>' + err);
		
		peer.disconnect();
		peer.destroy();
		
		return false;
	});
		
	if(!window.location.hash) {
		$("#container").html('<h2>Send file</h2><form id="send"><input type="file" id="file" name=file" /><input type="submit" value="Choose file" /></form>');
		
		$("#send").submit(function(event) {
			event.preventDefault();
			
			var file = document.getElementById('file').files[0];
			
			$("#container").html('<h2>Send file</h2>File name : ' + file.name + '<br>File size : ' + bytesToSize(file.size) + '<br><br>Your link : <span id="link">http://peershare.cuonic.com/#' + peer.id + '</span><div id="log"></div>');
			$("#log").append(getTimestamp() + "Awaiting connection..." + "<br>");
			$('#log').scrollTop($('#log')[0].scrollHeight);
			
			$("#link").on("click", function () {
			   $('#link').selectText();
			});
			
			peer.on('connection', function(dataConnection) {
				dataConnection.on('open', function() {
					var data = new Object();
					
					data.type = "transfer-info";
					data.filename = file.name;
					data.filesize = file.size;
										
					dataConnection.send(data);
					
					$("#log").append(getTimestamp() + "File information successfully sent to " + dataConnection.peer + "<br>");
					$('#log').scrollTop($('#log')[0].scrollHeight);
				});
				
				dataConnection.on('data', function(data) {
				
					console.log(data);
				
					if(data.type == "transfer-request") {
						data = new Object();
						
						data.type = "transfer-file";
						data.file = file;
						data.sent = (new Date()).getTime();
						
						dataConnection.send(data);
						
						$("#log").append(getTimestamp() + "Sending file to " + dataConnection.peer + "<br>");
						$('#log').scrollTop($('#log')[0].scrollHeight);
					} else if(data.type == "transfer-complete") {
						$("#log").append(getTimestamp() + "File sent to " + dataConnection.peer + " (" + data.time + " s | " + data.speed + " kb/s)<br>");
						$('#log').scrollTop($('#log')[0].scrollHeight);
					} else {
						$("#log").append(getTimestamp() + "Unknown data stream received from " + dataConnection.peer + "<br>");
						$('#log').scrollTop($('#log')[0].scrollHeight);
					}
				});
			});
		});
	} else {
		$("#container").html('<h2>Receive file</h2>Connecting to peer<br><br><img src="img/loader.gif" />');
	
		var dataConnection = peer.connect(window.location.hash.substring(1), {reliable: true});
		
		dataConnection.on('error', function(err) {
			$("#container").html('<h2>Receive file</h2>Error encountered : <br>' + err);
		});
		
		dataConnection.on('data', function(data) {
			if(data.type == "transfer-info") {
				window.filename = data.filename;
				window.filesize = data.filesize;
				
				$("#container").html('<h2>Receive file</h2>File name : ' + data.filename + '<br>File size : ' + bytesToSize(data.filesize) + '<form id="receive"><input type="submit" value="Receive file" /></form>');
			} else if(data.type == "transfer-file") {
				data.received = (new Date()).getTime();
				
				var reply = new Object();
				reply.type = "transfer-complete";
				reply.time = ((data.received - data.sent) / 1000).toFixed(2);
				reply.speed = (window.filesize / 1024 / reply.time).toFixed(2);
				
				dataConnection.send(reply);
				
				$("#container").html('<h2>Receive file</h2>File transfer terminated.<br><br>Transfer time : <strong>' + reply.time + ' seconds</strong><br>Transfer speed : <strong>' + reply.speed + ' kb/s</strong>');
				
				var dataView = new Uint8Array(data.file);
				var dataBlob = new Blob([dataView]);
				
				saveAs(dataBlob, window.filename);
			} else {		
				$("#container").html('<h2>Receive file</h2>Error encountered :<br>Unexpected data received.');
			}
			
			$("#receive").submit(function(event) {
				event.preventDefault();
				
				data = new Object();
				data.type = "transfer-request";
				
				dataConnection.send(data);
				
				$("#receive").html('<br><br><img src="img/loader.gif" width="14" /> Downloading file...');
			});
		});
		
	}
});