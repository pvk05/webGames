
export default function chatNsp(io) {
	const chatNsp = io.of("/chat");
	chatNsp.on("connection", (socket) =>
	{
		let username = `User ${Math.round(Math.random() * 999999)}`;
		socket.emit("name", username);

		socket.on("message", (message) =>
		{
			chatNsp.emit("message", {
				from: username,
				message: message,
				time: new Date().toLocaleString()
			});
		});
	});
	console.log("Chat namespace created");
}