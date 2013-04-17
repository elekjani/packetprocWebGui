$(document).ready(function() {
	$('#jsonSend').click(function() {
		
		try {
			socket.emit('webgui', $.parseJSON($('#jsonArea').val()));
			$.jGrowl('Message sent.', { header: 'JSON', theme: 'notification success', life: 1000 });
		} catch (err) {
			$.jGrowl('Error parsing.', { header: 'JSON', theme: 'notification failure', life: 1000 });
		}
		
	});
});