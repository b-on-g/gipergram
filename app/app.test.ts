namespace $ {

	function message_make(
		id: number,
		text: string,
		out: boolean,
		media: $bog_gipergram_tg_message[ 'media' ] = '',
	): $bog_gipergram_tg_message {
		return {
			id, text, out, media,
			date: 1,
			author: out ? '' : 'Alice',
			width: media === 'photo' ? 800 : 0,
			height: media === 'photo' ? 600 : 0,
			duration: media === 'voice' ? 3 : 0,
		}
	}

	class $bog_gipergram_tg_fake extends $bog_gipergram_tg {

		sent = [] as string[]
		files = [] as string[]
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
				message_make( 10, 'one', true ),
				message_make( 11, 'two', false ),
				message_make( 12, 'three', false ),
				message_make( 13, 'four', false ),
			] : [
				message_make( 20, 'hi', true ),
				message_make( 21, 'look', false, 'photo' ),
				message_make( 22, '', false, 'voice' ),
			] )
		}

		media_uri( [ peer, id ]: [ string, number ] ) {
			return `blob:${ peer }:${ id }`
		}

		send( peer: string, text: string ) {
			this.sent.push( text )
			const message = message_make( 100 + this.sent.length, text, true )
			this.message_add( peer, message )
			return message
		}

		photo_send( peer: string, file: File ) {
			this.files.push( file.name )
			const message = message_make( 200 + this.files.length, '', true, 'photo' )
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
		new $mol_wire_atom( 'bog_gipergram_test_keep_store', ()=> app.store().data() ).fresh()
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
			$mol_assert_equal( app.store().data().Tabs()!.items()[ 0 ], '1' )
		},

		'device link carries the baza key and is parsed back'( $ ) {
			const { app } = app_make( $ )
			const devices = app.Devices() as $$.$bog_gipergram_devices
			const key = devices.key()
			$mol_assert_equal( devices.link().endsWith( '#!account=' + key ), true )
			$mol_assert_equal( devices.key_of( devices.link() ), key )
			$mol_assert_equal( devices.key_of( 'https://b-on-g.github.io/gipergram/' ), '' )
			$mol_assert_equal( devices.switch( key ), false )
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

		'photo and voice render in their bubbles'( $ ) {
			const { app } = app_make( $ )
			const chat = app.Chat( '2' )
			const photo = chat.Message( 21 )
			$mol_assert_equal( photo.bubble_content()[ 1 ], photo.Image() )
			$mol_assert_equal( photo.Image().uri(), 'blob:2:21' )
			$mol_assert_equal( photo.Image().natural_width(), 800 )
			$mol_assert_equal( photo.bubble_content()[ 2 ], photo.Text() )
			const voice = chat.Message( 22 )
			$mol_assert_equal( voice.bubble_content()[ 1 ], voice.Voice() )
			$mol_assert_equal( voice.voice_uri(), 'blob:2:22' )
			$mol_assert_equal( voice.bubble_content().includes( voice.Text() ), false )
		},

		'picked photo is sent and lands in my messages'( $ ) {
			const { app, tg } = app_make( $ )
			const chat = app.Chat( '1' )
			new $mol_wire_atom( 'bog_gipergram_test_keep', ()=> chat.message_rows() ).fresh()
			chat.photo_pick( [ new File( [ 'x' ], 'cat.jpg', { type: 'image/jpeg' } ) ] )
			$mol_assert_equal( tg.files.length, 1 )
			$mol_assert_equal( tg.files[ 0 ], 'cat.jpg' )
			$mol_assert_equal( chat.message_rows().length, 5 )
			$mol_assert_equal( chat.message_rows()[ 4 ], chat.Message( 201 ) )
			$mol_assert_equal( app.mine_text( '1:201' ), '🖼' )
			$mol_assert_equal( app.row_preview( '1' ), '↗ 🖼' )
		},

		'composer swaps voice and send buttons'( $ ) {
			const { app } = app_make( $ )
			const chat = app.Chat( '1' )
			$mol_assert_equal( chat.compose().at( -1 ), chat.Voice() )
			chat.draft( 'x' )
			$mol_assert_equal( chat.compose().at( -1 ), chat.Send() )
			chat.draft( '' )
			chat.recorder().session( { recorder: { stop() {} }, started: 0, done: Promise.resolve( new Blob ) } )
			$mol_assert_equal( chat.compose()[ 0 ], chat.Recording() )
			$mol_assert_equal( chat.voice_content()[ 0 ], chat.Voice_stop_icon() )
			chat.voice_cancel()
			$mol_assert_equal( chat.compose()[ 0 ], chat.Attach() )
		},

	})

}
