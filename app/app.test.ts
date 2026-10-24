namespace $ {

	class $bog_gipergram_tg_fake extends $bog_gipergram_tg {

		sent = [] as string[]
		read_marks = [] as number[]

		configured() {
			return true
		}

		@ $mol_mem
		authorized( next?: boolean ) {
			return next ?? true
		}

		@ $mol_mem
		dialogs( next?: $bog_gipergram_tg_dialog[] ): $bog_gipergram_tg_dialog[] {
			return next ?? [
				{ id: '1', title: 'Alice', unread: 2, read_max: 11, top_id: 13, top_text: 'three', top_date: 1, top_out: false },
				{ id: '2', title: 'Bob', unread: 0, read_max: 20, top_id: 20, top_text: 'hi', top_date: 1, top_out: true },
			]
		}

		@ $mol_mem_key
		messages( peer: string, next?: $bog_gipergram_tg_message[] ): $bog_gipergram_tg_message[] {
			return next ?? ( peer === '1' ? [
				{ id: 10, text: 'one', date: 1, out: true, author: '' },
				{ id: 11, text: 'two', date: 1, out: false, author: 'Alice' },
				{ id: 12, text: 'three', date: 1, out: false, author: 'Alice' },
				{ id: 13, text: 'four', date: 1, out: false, author: 'Alice' },
			] : [
				{ id: 20, text: 'hi', date: 1, out: true, author: '' },
			] )
		}

		send( peer: string, text: string ) {
			this.sent.push( text )
			const message = { id: 100 + this.sent.length, text, date: 2, out: true, author: '' }
			this.message_add( peer, message )
			return message
		}

		read( peer: string, max_id: number ) {
			this.read_marks.push( max_id )
		}

	}

	function app_make( $: $ ) {
		const app = $bog_gipergram_app.make({ $ })
		const tg = $bog_gipergram_tg_fake.make({ $ })
		app.tg = ()=> tg
		tg.message_out = next => app.message_out( next )
		return { app, tg }
	}

	$mol_test({

		'unauthorized user sees only login'( $ ) {
			const { app, tg } = app_make( $ )
			tg.authorized( false )
			$mol_assert_equal( app.pages().length, 1 )
			$mol_assert_equal( app.pages()[ 0 ], app.Login() )
		},

		'opened chat becomes a tab and leaves the chat list'( $ ) {
			const { app } = app_make( $ )
			app.chat_open( '1' )
			$mol_assert_equal( app.tab_rows().length, 1 )
			$mol_assert_equal( app.tab_rows()[ 0 ], app.Tab( '1' ) )
			$mol_assert_equal( app.chat_rows().length, 1 )
			$mol_assert_equal( app.chat_rows()[ 0 ], app.Chat_row( '2' ) )
		},

		'bump lifts a tab to the top'( $ ) {
			const { app } = app_make( $ )
			app.chat_open( '1' )
			app.chat_open( '2' )
			$mol_assert_equal( app.tab_rows()[ 0 ], app.Tab( '1' ) )
			app.Chat( '2' ).bump()
			$mol_assert_equal( app.tab_rows()[ 0 ], app.Tab( '2' ) )
		},

		'split keeps chats side by side'( $ ) {
			const { app } = app_make( $ )
			app.chat_open( '1' )
			app.chat_open( '2' )
			app.Chat( '1' ).split( true )
			$.$mol_state_arg.value( 'chat', '2' )
			$mol_assert_equal( app.pages().length, 3 )
			$mol_assert_equal( app.pages()[ 1 ], app.Chat( '1' ) )
			$mol_assert_equal( app.pages()[ 2 ], app.Chat( '2' ) )
			app.Chat( '1' ).close()
			$mol_assert_equal( app.pages().length, 2 )
			$.$mol_state_arg.dict( {} )
		},

		'own anchor starts at server read mark and survives a skip'( $ ) {
			const { app, tg } = app_make( $ )
			const chat = app.Chat( '1' )
			$mol_assert_equal( app.tab_unread( '1' ), 2 )
			$mol_assert_equal( chat.message_rows()[ 2 ], chat.Unread() )
			chat.read()
			$mol_assert_equal( app.tab_unread( '1' ), 0 )
			$mol_assert_equal( tg.read_marks.length, 1 )
			$mol_assert_equal( tg.read_marks[ 0 ], 13 )
			chat.restore()
			$mol_assert_equal( app.tab_unread( '1' ), 2 )
			$mol_assert_equal( chat.message_rows()[ 2 ], chat.Unread() )
		},

		'sent message lands in the chat and in my messages'( $ ) {
			const { app, tg } = app_make( $ )
			const chat = app.Chat( '1' )
			new $mol_wire_atom( 'bog_gipergram_test_keep', ()=> chat.message_rows() ).fresh()
			$mol_assert_equal( chat.message_rows().length, 5 )
			chat.draft( 'hello' )
			chat.send()
			$mol_assert_equal( tg.sent.length, 1 )
			$mol_assert_equal( chat.draft(), '' )
			$mol_assert_equal( chat.message_rows().length, 5 )
			$mol_assert_equal( chat.message_rows()[ 4 ], chat.Message( 101 ) )
			$mol_assert_equal( app.tab_unread( '1' ), 0 )
			$mol_assert_equal( app.mine_rows().length, 1 )
			$mol_assert_equal( app.mine_text( '1:101' ), 'hello' )
			$mol_assert_equal( app.row_preview( '1' ), '↗ hello' )
		},

	})

}
