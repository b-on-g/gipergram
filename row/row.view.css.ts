namespace $.$$ {

	$mol_style_define( $bog_gipergram_row, {
		gap: $mol_gap.space,
		align: { items: 'center' },

		Avatar: {
			width: '2.5rem',
			height: '2.5rem',
			flex: { shrink: 0 },
		},

		Info: {
			flex: { direction: 'column', grow: 1 },
			minWidth: 0,
		},

		Head: {
			justify: { content: 'space-between' },
			gap: $mol_gap.space,
		},

		Title: {
			font: { weight: 'bold' },
			overflow: 'hidden',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
		},

		Time: {
			color: $mol_theme.shade,
			font: { size: '0.75rem' },
			flex: { shrink: 0 },
		},

		Foot: {
			justify: { content: 'space-between' },
			gap: $mol_gap.space,
		},

		Preview: {
			color: $mol_theme.shade,
			overflow: 'hidden',
			whiteSpace: 'nowrap',
			textOverflow: 'ellipsis',
		},

		Unread: {
			flex: { shrink: 0 },
			padding: { left: '0.375rem', right: '0.375rem' },
			border: { radius: '1rem' },
			background: { color: $mol_theme.focus },
			color: $mol_theme.back,
			font: { size: '0.75rem' },
		},
	} )

}
