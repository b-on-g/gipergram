namespace $.$$ {

	$mol_style_define( $bog_gipergram_chat, {
		width: '36rem',

		Messages: {
			padding: { top: $mol_gap.block, bottom: $mol_gap.block },
		},

		Unread: {
			justify: { content: 'center' },
			margin: { top: $mol_gap.block, bottom: $mol_gap.block },
			padding: $mol_gap.text,
			color: $mol_theme.focus,
			background: { color: $mol_theme.card },
		},

		Foot: {
			flex: { direction: 'column' },
		},

		Anchor_bar: {
			align: { items: 'center' },
			justify: { content: 'flex-end' },
		},

		Unread_count: {
			color: $mol_theme.shade,
			flex: { grow: 1 },
			padding: { left: $mol_gap.text },
		},

		Compose: {
			align: { items: 'flex-end' },
			gap: $mol_gap.space,
		},

		Draft: {
			flex: { grow: 1 },
			maxHeight: '12rem',
		},
	} )

}
