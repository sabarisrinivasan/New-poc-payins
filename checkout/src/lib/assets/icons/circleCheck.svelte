<script lang="ts">
interface propType {
	class?: string;
	width?: string;
	height?: string;
	stroke?: string;
}
let {width,height,class:className,stroke}:propType=$props()
</script>

<svg
	{width}
	{height}
	viewBox="0 0 15 10"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	class={className}
>
	<path
		d="M3.75 6.5L5.25 8L8.25 5M11 6.5C11 9.2614 8.7614 11.5 6 11.5C3.23858 11.5 1 9.2614 1 6.5C1 3.73858 3.23858 1.5 6 1.5C8.7614 1.5 11 3.73858 11 6.5Z"
		{stroke}
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>

