<script>
    import { onMount } from "svelte";
    let ws;
    let msg = "";

    let messages = [];
    onMount(() => {
        ws = new WebSocket("ws://localhost:8080");

        ws.onopen = () => {
            console.log("connected");
        };

        ws.onmessage = (event) => {
            console.log(event.data);
            messages = [...messages, event.data];
        };

        ws.onclose = () => {
            console.log("disconnected");
        };
    });

    function sendMsg() {
        let data = JSON.stringify({
            type: "chatMsg",
            channel: "ludo",
            message: msg,
        });

        ws.send(data);
    }

    function subscribeToWs(topic) {
        let data = JSON.stringify({
            type: "subscribe",
            topicName: topic,
        })

        ws.send(data);
    }
</script>

<h1 class=" h1">Websocket</h1>

<h3>
    {#if ws}
        Connected
    {:else}
        Not Connected
    {/if}
</h3>
<br />
<button
    class=" border-2 m-2 px-1 rounded-md border-black"
    on:click={() => subscribeToWs("ludo")}
>
    Sub to 'Ludo'
</button>
<button
    class=" border-2 m-2 px-1 rounded-md border-black"
    on:click={() => subscribeToWs("yatzy")}>Sub to 'yatzy'</button
>
<button
    class=" border-2 m-2 px-1 rounded-md border-black"
    on:click={() => subscribeToWs("gemgo")}>Sub to 'gemgo'</button
>

<form on:submit={sendMsg}>
    <input type="text" name="msgInp" id="msgInp" bind:value={msg} />
    <input type="submit" value="Send" />
</form>

<div id="messages">
    {#each messages as message}
        <p>{message}</p>
    {/each}
</div>
