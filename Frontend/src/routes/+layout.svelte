<script lang="ts">
	import {} from '$lib/index.css';

	interface Props {
		children?: import('svelte').Snippet;
	}
	let { children }: Props = $props();
</script>

<div>
	<header>This is a header</header>
	<main>
		{@render children?.()}
	</main>
	<footer>This is a footer</footer>
</div>

<style>
	div {
		max-width: 108rem;
		margin-inline: auto;
		padding-inline: 0.85em;
		/* border: 2px solid lime; */
	}
</style>
