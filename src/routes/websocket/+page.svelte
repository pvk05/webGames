<script>
    import { onMount } from 'svelte';

    let messages = [];
    let ws;
	let newMessage = '';

    onMount(() => {
        // Connect to the WebSocket server
        ws = new WebSocket('ws://localhost:3001');

        ws.onopen = () => {
            console.log('WebSocket connection opened');
            ws.send('Hello from the client!');
        };

        ws.onmessage = (event) => {
            console.log('Message from server:', event.data);
            messages = [...messages, event.data];
        };

        ws.onclose = () => {
            console.log('WebSocket connection closed');
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            ws.close(); // Cleanup on component unmount
        };
    });

    function sendMessage() {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(newMessage);
			newMessage = '';
        }
    }
</script>

<div>
    <h1>WebSocket Messages</h1>
    <ul>
        {#each messages as message}
            <li>{message}</li>
        {/each}
    </ul>
	<input type="text" name="in+p" id="inp" bind:value={newMessage}>
    <button on:click={sendMessage}>Send Message</button>
</div>
