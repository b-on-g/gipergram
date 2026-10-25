namespace $.$$ {

	$mol_style_define( $bog_gipergram_message, {
		padding: {
			top: '0.125rem',
			bottom: '0.125rem',
			left: $mol_gap.block,
			right: $mol_gap.block,
		},

		'@': {
			bog_gipergram_message_out: {
				true: {
					justify: { content: 'flex-end' },
					Bubble: {
						background: { color: $mol_theme.current },
					},
				},
			},
		},

		Bubble: {
			flex: { direction: 'column' },
			gap: $mol_gap.space,
			maxWidth: '36rem',
			padding: $mol_gap.text,
			border: { radius: $mol_gap.round },
			background: { color: $mol_theme.card },
		},

		Author: {
			color: $mol_theme.special,
			font: { weight: 'bold' },
		},

		Image: {
			maxWidth: '100%',
			maxHeight: '24rem',
			height: 'auto',
			objectFit: 'contain',
			border: { radius: $mol_gap.round },
		},

		Voice: {
			maxWidth: '100%',
			height: '2.5rem',
		},

		Text: {
			whiteSpace: 'pre-wrap',
			overflowWrap: 'anywhere',
		},

		Time: {
			align: { self: 'flex-end' },
			color: $mol_theme.shade,
			font: { size: '0.75rem' },
		},
	} )

}
