<!--
@component
Here's some documentation for this component.
-->

<script lang='ts'>
	// test string of ugly Vug
	const testString2 = `span.class1.class2.class3(
		id={{boop}}
		class={ferrari}
		class=\`boy\${ah}\`
		class="hello world"
		class!='hey now'
		class=hey
		data-set="test"
		on:click="{doSomething()}"
		disabled
		style="color: red;"
		style!="font-medium!important;"
		).class4.class5 Hello World!`

	const testString =
`div parent
	doctype html
	// this is a comment
	| this is a text node
	span child1
	span child2
		span grandchild1
		span grandchild2
	span child3`

	// svelte functions
	import {onMount} from 'svelte';

	// utils & functions
	import {parseVugElement} from '$functions/parseVugElement';
	import {parseVugDocument} from '$functions/parseVugDocument';

	// refs
	// let input: string;
	let inputField: HTMLTextAreaElement;
	let output: string | string[];

	// variables
	// let focused: Element | null;
	let document: Document;

	// extract attributes
	import { extractAttributes } from "$utils/regExAttributes"

	// local functions
	function parseInput() {
		inputField.value = inputField.value.replace('  ', '	')

		const parsed = parseVugDocument(inputField.value) ? parseVugDocument(inputField.value) : '';
		output = parsed;
	}
	function handleKeyDown(event: KeyboardEvent) {
		const target = event.target as HTMLElement;
		if (event.key === 'Tab' && target === inputField && !event.shiftKey) {
			event.preventDefault();
			// get cursor position

			const start = inputField.selectionStart;
			const end = inputField.selectionEnd;
			// set textarea value to: text before caret + tab + text after caret
			inputField.value = inputField.value.substring(0, start) + `	` + inputField.value.substring(end);

			// put caret at right position again
			inputField.selectionStart = start + 1;
			inputField.selectionEnd = inputField.selectionStart;

			parseInput();
		}

	}

	//- just for dev, we'll parse the input on mount
	onMount(() => {
	inputField.value = testString;
	parseInput();
	});

</script>

<template lang='pug'>
	svelte:window(on:keydown!="{handleKeyDown}")

	template#template
	.w-screen.min-h-screen.bg-slate-100.px-8
		h1.text-26 Vug
		div Inspired by pug. A lightweight templating syntax for Svelte.
		.grid.grid-cols-1.gap-8.py-8(class="lg:grid-cols-2")
			div
				h2 input pug
				textarea#input.w-full.bg-white(bind:this!="{inputField}" on:input!="{parseInput}" class="min-h-[600px]")
			div output html
				textarea#output.w-full.bg-white(disabled bind:value!="{output}" class="min-h-[600px]")

</template>