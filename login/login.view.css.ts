namespace $.$$ {

	$mol_style_define( $bog_gipergram_login, {
		Body_content: {
			flex: { direction: 'column', grow: 1 },
			minHeight: '100%',
			boxSizing: 'border-box',
			justify: { content: 'center' },
			align: { items: 'center' },
			padding: $mol_gap.block,
		},

		Form: {
			gap: $mol_gap.block,
			width: '22rem',
			maxWidth: '100%',
			padding: $mol_gap.block,
			align: { items: 'stretch' },
			border: { radius: $mol_gap.round },
			background: { color: $mol_theme.card },
			box: {
				shadow: [ {
					x: 0,
					y: '0.5rem',
					blur: '2rem',
					spread: 0,
					color: $mol_theme.line,
				} ],
			},
		},

		Qr: {
			width: '16rem',
			height: '16rem',
			align: { self: 'center' },
		},

		Qr_wait: {
			justify: { content: 'center' },
			minHeight: '16rem',
			align: { items: 'center' },
			color: $mol_theme.shade,
		},

		Qr_hint: {
			textAlign: 'center',
			color: $mol_theme.shade,
		},

		Phone_mode: {
			justify: { content: 'center' },
		},

		Qr_mode: {
			justify: { content: 'center' },
		},

		Error: {
			textAlign: 'center',
			color: $mol_theme.special,
		},
	} )

}
