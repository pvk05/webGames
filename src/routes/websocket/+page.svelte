<script>
    import { onMount } from 'svelte';

    let messages = [];
    onMount(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('connected');
            ws.send('Hello Server!');
        };

        ws.onmessage = (event) => {
            console.log(event.data);
            messages = [...messages, event.data];
        };

        ws.onclose = () => {
            console.log('disconnected');
        };

    });
</script>

<h1 class=" h1">Websocket</h1>

<div id="messages">
    {#each messages as message}
        <p>{message}</p>
    {/each}
</div>