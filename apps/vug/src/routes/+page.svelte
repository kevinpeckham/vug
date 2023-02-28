<!--
@component
Here's some documentation for this component.
-->

<script lang='ts'>

	//- Goals
	//- stripped down version of Pug
	//- that supports Tailwindclasses and Svelte syntax natively
  //- can have mulitple class attributes and literals
	//- can only have one id attribute or literal
	//- quotes around attribute values are optional (assuming value has no spaces)

	//- what we'll need to do
	// - detect change in input field
	// - parse the input field
	// - organize the input field content into a tree
	// - get single element



	// refs
	let input: string;
	let output: string;


	// $: {
	// 	if (input) {
	// 		output = input;
	// 	}
	// }

	// the tag name is the part of the string from the zero position to the first "." or "#" or "(" or the end of the string if we don't hit any of those
		import {onMount} from 'svelte';
		onMount(() => {
			output = parseVugElement(input);
		});


		function parseInput() {
			output = parseVugElement(input);
		}
		// $: { if (document) output = parseVugElement(input) };



	//import { findFirstCharacterOfSet } from "$utils/stringParsing";






import { extractElementTagFromVug, extractIdFromVug, extractAllClassesFromVug, extractParentheses, regExIdLiteral, regExIdAttribute, regExAllClassLiterals} from "$utils/vugParsing";
  import { construct_svelte_component } from 'svelte/internal';


	// variables
	input = `CustomComponent.text-red.font-medium.w-1/2.hover:text-blue(id="boop" class="ferrari" disabled).underline kubla khan`

	// functions
	function convertPugElementToHtml(pugElement: string) {
		// parts to a pug element = [tag]#id.class1.class2.class3(attr1='value1' attr2='value2')

		// get the element name
		// get the element id
		// get the element classes
		// get the element attributes
		// get the element content
		// get the element children
		// convert the element into HTML
		// return the HTML
		return pugElement;
	}
	function convertToHtml(input: string) {
		// parse the input
		// tabs or spaces
		// map out the hierarchy
		// organize the input into a tree
		// get single node
		// convert the node into HTML
		// store the HTML in a doc fragment?
		// return the element
		return input;
	}

	//- parse single element
	function parseVugElement(input:string) {

			//- trim leading and tailing space
			const trimmedInput = input.trim();

			// look for  first set of parentheses
			const parentheses = extractParentheses(trimmedInput);

			// remove the parentheses from the input
			// but mark where they were with a placeholder
			// so we can keep the same class order
			const noParentheses = (parentheses) ? input.replace(parentheses, '.~') : trimmedInput;


		//- div.test(id="buddy") The content could have parentheses (see).
		// look for first space or line break after the closing parentheses
		const firstSpaceIndex = noParentheses ? noParentheses.indexOf(' ') : -1;

		// separate the tag and attributes from the content
		const  tagAndLiterals = (firstSpaceIndex > 0) ? noParentheses.slice(0,firstSpaceIndex) : noParentheses;
		const content = (firstSpaceIndex > 0) ? noParentheses.slice(firstSpaceIndex + 1) : '';
		console.log(content)

		// get the tag name
		const tag = extractElementTagFromVug(tagAndLiterals);
		console.log(tag)

		// separate the literals from the tag (if it has explicit tag)
		const beginningOfString = tagAndLiterals.slice(0, tag.length);
		const literals = (beginningOfString == tag) ? tagAndLiterals.replace(tag,'') : tagAndLiterals;

		// get the id literal
		const idMatches = literals.match(regExIdLiteral);
		const idLiteral = idMatches && idMatches[0] ? idMatches[0] : '';
		const idLiteralValue = (idLiteral) ? idLiteral.replace('#','') : '';

		// get classLiterals by removing idLiteral
		const classLiterals = (idLiteral) ?	literals.replace(idLiteral,'') : literals;

		//- remove initial dot so we can split on dots
		const classLiteralsAdjusted = classLiterals.substring(1);

		//- separate the class literals into before and after the placeholder
		//- before
		const classLiteralsSplit = classLiteralsAdjusted.split('.~');
		const classLiteralsBeforePlaceholder = (classLiteralsSplit[0]) ? classLiteralsSplit[0] : '';
		const classesBeforePlaceholderArray = classLiteralsBeforePlaceholder.split('.');
		//- after
		const classLiteralsAfterPlaceholder = (classLiteralsSplit[1]) ? classLiteralsSplit[1] : '';
		//- trim initial dot
		const classLiteralsAfterPlaceholderTrimmed = classLiteralsAfterPlaceholder ? classLiteralsAfterPlaceholder.substring(1) : '';
		const classesAfterPlaceholderArray = classLiteralsAfterPlaceholderTrimmed ? classLiteralsAfterPlaceholderTrimmed.split('.') : [];

		//- make array from class literals
		//const classLiteralsArray = classLiteralsAdjusted.split('.');
		// console.log(classLiteralsArray)

		// attributes
		const justAttributes = parentheses.replace(/[()]/g,'');

		//- create a string to hold the final consolidated attributes
		let attributesString = '';

		// create the HTML and add to container
		//- we'll trust the dom parser to add the closing tag as appropriate
		const template = `<${tag} ${justAttributes}>`;

		// create HTML
		const parser = new DOMParser();
		const doc = parser.parseFromString(template, 'text/html');
		const el = doc.body.firstElementChild;

		// if id literal exists, add it to the child
		if (el && idLiteral) {
			el.id = idLiteralValue;
		}

		// if class literals exist, add them to the child
		if (el && (classesBeforePlaceholderArray || classesAfterPlaceholderArray)) {
			// first get the classes that are already on the child
			const elAttributeClassesArray = Array.from(el.classList);

			// now let's clear the child's classes
			el.classList.remove(...elAttributeClassesArray);

			// now let's start a new array to hold all the classes
			const allClasses: string[] = [];

			// add the classes before the placeholder to the array
			if (classesBeforePlaceholderArray.length > 0 && classesBeforePlaceholderArray[0] && classesBeforePlaceholderArray[0] != '~') {
				allClasses.push(...classesBeforePlaceholderArray);
			}

			// add the classes from the child's attributes to the array
			if (elAttributeClassesArray.length > 0 && elAttributeClassesArray[0]) {
				allClasses.push(...elAttributeClassesArray);
			}

			// add the classes after the placeholder to the array
			if (classesAfterPlaceholderArray.length > 0 && classesAfterPlaceholderArray[0]) {
				allClasses.push(...classesAfterPlaceholderArray);
			}

			// add the classes from the array to the child
			if (allClasses && allClasses[0]) el.classList.add(...allClasses);

			//- turn attributes into a string
			attributesString = Array.from(el.attributes).map((attribute) => {
				return `${attribute.name}="${attribute.value}"`
			}).join(' ');

		}

		// if content exists, add it to the child
		if (el && content) {
			el.textContent = content;
		}

		//- get the HTML as a string
		const html = (el) ? el.outerHTML : '';

		//- replace div in html with tag
		const lowerCaseTag = tag.toLowerCase();
		const htmlWithCorrectTag = html.replace(`<${lowerCaseTag}`, `<${tag}`).replace(`${lowerCaseTag}>`,`${tag}>`);


		return htmlWithCorrectTag;

		// return `<${tag} ${attributesString}>${content.trim()}</${tag}>`
		// content: ${content}
		// parentheses: ${parentheses}
		// tag: ${tag}
		// id: ${idLiteral}
		// class: "${child.classList}"



		// // return htmlWithCorrectTag
		// return input

	}



</script>

<template lang='pug'>
	template#template
	.w-screen.min-h-screen.bg-slate-100.px-8
		h1.text-26 Vug
		.grid.grid-cols-1.gap-8.py-8(class="lg:grid-cols-2")
			div
				h2 input pug
				textarea#input.w-full.bg-white(bind:value!="{input}" on:input!="{parseInput}" class="min-h-[600px]")
			div output html
				textarea#output.w-full.bg-white(bind:value!="{output}" class="min-h-[600px]")

</template>