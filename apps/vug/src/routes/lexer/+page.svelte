<!--
@component
Here's some documentation for this component.
-->

<script lang='ts'>
// variables
let output: string;

// refs
let inputField: HTMLTextAreaElement;

// functions
function parseInput(event:KeyboardEvent) {
  const target = event.target as HTMLTextAreaElement;
  console.log(target.value)
}
</script>

<template lang='pug'>
.w-screen.min-h-screen.bg-slate-100.px-8
		h1.text-26 Lexer Tests
		div The pug lexer. This module is responsible for taking a string and converting it into an array of tokens.
		.grid.grid-cols-1.gap-8.py-8(class="lg:grid-cols-2")
			div
				h2 input pug
				textarea#input.w-full.bg-white(bind:this!="{inputField}" on:input!="{parseInput}" class="min-h-[600px]")
			div output tokens
				textarea#output.w-full.bg-white(disabled bind:value!="{output}" class="min-h-[600px]")
</template>