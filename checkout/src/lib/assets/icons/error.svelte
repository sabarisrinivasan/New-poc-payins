<script lang="ts">
interface PropType {
	class?: string;
	width?: string;
	height?: string;
}
let {height , width , class:className}:PropType = $props()
</script>

<svg
	{width}
	{height}
	viewBox="0 0 16 17"
	class={className}
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
>
	<g clip-path="url(#clip0_662_28080)">
		<path
			fill-rule="evenodd"
			clip-rule="evenodd"
			d="M8 16.5C12.4183 16.5 16 12.9183 16 8.5C16 4.08172 12.4183 0.5 8 0.5C3.58172 0.5 0 4.08172 0 8.5C0 12.9183 3.58172 16.5 8 16.5ZM7.99512 4.25C8.40933 4.25 8.74512 4.58579 8.74512 5V8.99705C8.74512 9.41126 8.40933 9.74705 7.99512 9.74705C7.5809 9.74705 7.24512 9.41126 7.24512 8.99705V5C7.24512 4.58579 7.5809 4.25 7.99512 4.25ZM7.99766 12.8C8.49471 12.8 8.89766 12.3971 8.89766 11.9C8.89766 11.4029 8.49471 11 7.99766 11C7.5006 11 7.09766 11.4029 7.09766 11.9C7.09766 12.3971 7.5006 12.8 7.99766 12.8Z"
			fill="#DC3D43"
		/>
	</g>
	<defs>
		<clipPath id="clip0_662_28080">
			<rect width="16" height="16" fill="white" transform="translate(0 0.5)" />
		</clipPath>
	</defs>
</svg>
