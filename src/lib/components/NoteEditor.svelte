<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { marked } from 'marked';

	let {
		lessonId,
		initialContent = '',
		onSave
	}: {
		lessonId: string;
		initialContent?: string;
		onSave?: (content: string, isFirst: boolean) => void;
	} = $props();

	let editorEl: HTMLDivElement;
	// Intentional: content is initialized once from prop (the editor owns this state from here)
	// eslint-disable-next-line svelte/reactivity
	let content = $state(initialContent);
	let saveStatus = $state<'idle' | 'saving' | 'saved'>('idle');
	// eslint-disable-next-line svelte/reactivity
	let isFirstSave = $state(!initialContent);
	let editorView: import('@codemirror/view').EditorView | null = null;
	let debounceTimer: ReturnType<typeof setTimeout>;

	// Mobile tab state: 'write' | 'preview'
	let activeTab = $state<'write' | 'preview'>('write');

	const renderedHtml = $derived(
		marked(content || '*Start writing your notes here...*', { breaks: true, gfm: true }) as string
	);

	async function save(text: string) {
		if (!text.trim()) return;
		saveStatus = 'saving';
		try {
			const res = await fetch('/api/notes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ lessonId, content: text })
			});
			if (res.ok) {
				const data = await res.json();
				onSave?.(text, isFirstSave && data.isFirst);
				if (isFirstSave && data.isFirst) isFirstSave = false;
				saveStatus = 'saved';
				setTimeout(() => (saveStatus = 'idle'), 2000);
			}
		} catch {
			saveStatus = 'idle';
		}
	}

	function handleChange(value: string) {
		content = value;
		saveStatus = 'saving';
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => save(value), 1500);
	}

	onMount(async () => {
		const { EditorView, keymap } = await import('@codemirror/view');
		const { EditorState } = await import('@codemirror/state');
		const { markdown } = await import('@codemirror/lang-markdown');
		const { defaultKeymap, historyKeymap } = await import('@codemirror/commands');
		const { history } = await import('@codemirror/commands');
		const { syntaxHighlighting, defaultHighlightStyle } = await import('@codemirror/language');

		const customTheme = EditorView.theme({
			'&': {
				height: '100%',
				background: 'transparent',
				fontSize: '14px',
				fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace"
			},
			'.cm-content': {
				padding: '16px',
				caretColor: '#10b981',
				color: '#e2e8f0',
				lineHeight: '1.7'
			},
			'.cm-cursor': { borderLeftColor: '#10b981', borderLeftWidth: '2px' },
			'.cm-selectionBackground, &.cm-focused .cm-selectionBackground': {
				background: 'rgba(16,185,129,0.15) !important'
			},
			'.cm-line': { padding: '0 4px' },
			'.cm-activeLine': { background: 'rgba(255,255,255,0.03)' },
			'&.cm-focused': { outline: 'none' },
			'.cm-scroller': { overflow: 'auto', scrollbarWidth: 'thin', scrollbarColor: '#1e1e35 transparent' },
			// Markdown syntax colors
			'.tok-heading': { color: '#f1f5f9', fontWeight: 'bold' },
			'.tok-strong': { color: '#f1f5f9', fontWeight: 'bold' },
			'.tok-emphasis': { color: '#cbd5e1', fontStyle: 'italic' },
			'.tok-monospace': { color: '#10b981', background: 'rgba(16,185,129,0.1)', borderRadius: '3px', padding: '0 3px' },
			'.tok-url, .tok-link': { color: '#06b6d4', textDecoration: 'underline' },
			'.tok-quote': { color: '#64748b', fontStyle: 'italic' },
			'.tok-list': { color: '#94a3b8' }
		});

		const state = EditorState.create({
			doc: content,
			extensions: [
				history(),
				keymap.of([...defaultKeymap, ...historyKeymap]),
				markdown(),
				syntaxHighlighting(defaultHighlightStyle),
				customTheme,
				EditorView.lineWrapping,
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						handleChange(update.state.doc.toString());
					}
				})
			]
		});

		editorView = new EditorView({ state, parent: editorEl });
	});

	onDestroy(() => {
		clearTimeout(debounceTimer);
		editorView?.destroy();
	});
</script>

<div class="flex flex-col h-full">
	<!-- Toolbar -->
	<div
		class="flex items-center justify-between px-4 py-2 border-b shrink-0"
		style="background:#0b0b15;border-color:#1e1e35"
	>
		<!-- Mobile tabs + desktop labels -->
		<div class="flex items-center gap-1">
			<!-- Mobile tab buttons -->
			<button
				class="md:hidden px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors"
				style="background:{activeTab === 'write' ? 'rgba(16,185,129,0.12)' : 'transparent'};color:{activeTab === 'write' ? '#10b981' : '#64748b'};border:none"
				onclick={() => (activeTab = 'write')}
			>
				Write
			</button>
			<button
				class="md:hidden px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors"
				style="background:{activeTab === 'preview' ? 'rgba(6,182,212,0.12)' : 'transparent'};color:{activeTab === 'preview' ? '#06b6d4' : '#64748b'};border:none"
				onclick={() => (activeTab = 'preview')}
			>
				Preview
			</button>
			<!-- Desktop labels -->
			<span class="hidden md:inline text-xs font-medium" style="color:#64748b">Markdown</span>
			<span class="hidden md:inline text-xs mx-2" style="color:#2a2a45">|</span>
			<span class="hidden md:inline text-xs" style="color:#64748b">Preview</span>
		</div>

		<div class="flex items-center gap-2">
			{#if saveStatus === 'saving'}
				<span class="w-2 h-2 rounded-full dot-pulse" style="background:#f59e0b"></span>
				<span class="text-xs" style="color:#64748b">Saving...</span>
			{:else if saveStatus === 'saved'}
				<span class="w-2 h-2 rounded-full" style="background:#10b981"></span>
				<span class="text-xs" style="color:#10b981">Saved</span>
			{:else}
				<span class="w-2 h-2 rounded-full" style="background:#2a2a45"></span>
				<span class="text-xs" style="color:#2a2a45">Auto-save</span>
			{/if}
		</div>
	</div>

	<!-- Panes: stacked tabs on mobile, side-by-side on md+ -->
	<div class="flex flex-1 overflow-hidden">
		<!-- Editor pane -->
		<div
			class="overflow-hidden border-r {activeTab === 'write' ? 'flex' : 'hidden'} md:flex flex-1"
			style="border-color:#1e1e35;min-width:0"
		>
			<div bind:this={editorEl} class="h-full w-full"></div>
		</div>

		<!-- Preview pane -->
		<div
			class="overflow-y-auto p-4 {activeTab === 'preview' ? 'flex' : 'hidden'} md:flex flex-1 flex-col"
			style="background:#09091a;min-width:0"
		>
			<div class="prose-dark max-w-none">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html renderedHtml}
			</div>
		</div>
	</div>
</div>
