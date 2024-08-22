<script>
    import { writable, get } from "svelte/store";
    import Chat from "./chat.svelte";

    let loggedIn = writable(false)
    console.log(get(loggedIn))
    let username = ""
</script>

{#if $loggedIn}
    <Chat />
{:else}
    <input type="text" name="usernameInp" id="usernameInp" bind:value={username}>
    <button on:click={() => $loggedIn = true}>Enter</button>
{/if}