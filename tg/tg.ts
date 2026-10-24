namespace $ {

	export type $bog_gipergram_tg_dialog = {
		id: string
		title: string
		unread: number
		read_max: number
		top_id: number
		top_text: string
		top_date: number
		top_out: boolean
	}

	export type $bog_gipergram_tg_message = {
		id: number
		text: string
		date: number
		out: boolean
		author: string
	}

	export class $bog_gipergram_tg extends $mol_object {

		api_id() {
			return 0
		}

		api_hash() {
			return ''
		}

		configured() {
			return this.api_id() > 0 && this.api_hash().length > 0
		}

		lib_uri() {
			return 'https://esm.sh/telegram@2.26.22'
		}

		lib() {
			return this.$.$mol_import.module( this.lib_uri() )
		}

		session( next?: string ) {
			return this.$.$mol_state_local.value( 'bog_gipergram_session', next ) ?? ''
		}

		@ $mol_mem
		client_raw() {
			const lib = this.lib()
			const client = new lib.TelegramClient(
				new lib.sessions.StringSession( this.session() ),
				this.api_id(),
				this.api_hash(),
				{ connectionRetries: 5, useWSS: true },
			)
			client.setLogLevel( 'error' )
			return client
		}

		@ $mol_mem
		client() {
			const client = this.client_raw()
			$mol_wire_sync( client ).connect()
			return client
		}

		session_save() {
			this.session( this.client().session.save() )
		}

		@ $mol_mem
		authorized( next?: boolean ): boolean {
			if( next !== undefined ) return next
			if( !this.configured() ) return false
			return $mol_wire_sync( this.client() ).checkAuthorization()
		}

		credentials() {
			return { apiId: this.api_id(), apiHash: this.api_hash() }
		}

		@ $mol_mem
		code_hash( next?: string ) {
			return next ?? ''
		}

		@ $mol_mem
		password_needed( next?: boolean ) {
			return next ?? false
		}

		@ $mol_action
		code_send( phone: string ) {
			const sent = $mol_wire_sync( this.client() ).sendCode( this.credentials(), phone )
			this.code_hash( sent.phoneCodeHash )
		}

		@ $mol_action
		code_check( phone: string, code: string ) {
			const lib = this.lib()
			try {
				$mol_wire_sync( this.client() ).invoke( new lib.Api.auth.SignIn( {
					phoneNumber: phone,
					phoneCodeHash: this.code_hash(),
					phoneCode: code,
				} ) )
			} catch( error: any ) {
				if( $mol_promise_like( error ) ) $mol_fail_hidden( error )
				if( error?.errorMessage !== 'SESSION_PASSWORD_NEEDED' ) $mol_fail_hidden( error )
				this.password_needed( true )
				return
			}
			this.session_save()
			this.authorized( true )
		}

		@ $mol_action
		password_check( password: string ) {
			$mol_wire_sync( this.client() ).signInWithPassword( this.credentials(), {
				password: async()=> password,
				onError: async( error: Error )=> { throw error },
			} )
			this.session_save()
			this.authorized( true )
		}

		@ $mol_action
		logout() {
			$mol_wire_sync( this.client() ).invoke( new ( this.lib().Api.auth.LogOut )() )
			this.session( '' )
			this.authorized( false )
		}

		@ $mol_mem
		me() {
			const user = $mol_wire_sync( this.client() ).getMe()
			return { id: String( user.id ), name: this.name_of( user ) }
		}

		name_of( entity: any ): string {
			if( !entity ) return ''
			if( entity.title ) return entity.title
			return [ entity.firstName, entity.lastName ].filter( Boolean ).join( ' ' ) || entity.username || ''
		}

		@ $mol_mem
		dialogs_raw() {
			return $mol_wire_sync( this.client() ).getDialogs( { limit: 100 } ) as any[]
		}

		@ $mol_mem
		dialogs( next?: $bog_gipergram_tg_dialog[] ): $bog_gipergram_tg_dialog[] {
			this.updates()
			if( next ) return next
			return this.dialogs_raw().map( dialog => ( {
				id: String( dialog.id ),
				title: dialog.title || this.name_of( dialog.entity ),
				unread: dialog.unreadCount ?? 0,
				read_max: dialog.dialog?.readInboxMaxId ?? 0,
				top_id: dialog.message?.id ?? 0,
				top_text: this.text_of( dialog.message ),
				top_date: dialog.message?.date ?? 0,
				top_out: Boolean( dialog.message?.out ),
			} ) )
		}

		dialog( id: string ) {
			return this.dialogs().find( dialog => dialog.id === id ) ?? null
		}

		entity( id: string ) {
			const found = this.dialogs_raw().find( dialog => String( dialog.id ) === id )
			return found?.inputEntity ?? id
		}

		text_of( message: any ): string {
			if( !message ) return ''
			if( message.message ) return message.message
			if( message.media ) return '📎'
			if( message.action ) return '·'
			return ''
		}

		message_of( message: any ): $bog_gipergram_tg_message {
			return {
				id: message.id,
				text: this.text_of( message ),
				date: message.date,
				out: Boolean( message.out ),
				author: this.name_of( message.sender ),
			}
		}

		@ $mol_mem_key
		messages( peer: string, next?: $bog_gipergram_tg_message[] ): $bog_gipergram_tg_message[] {
			if( next ) return next
			const list = $mol_wire_sync( this.client() ).getMessages( this.entity( peer ), { limit: 50 } ) as any[]
			return list.map( message => this.message_of( message ) ).reverse()
		}

		@ $mol_action
		send( peer: string, text: string ) {
			const sent = $mol_wire_sync( this.client() ).sendMessage( this.entity( peer ), { message: text } )
			const message = this.message_of( sent )
			this.message_add( peer, message )
			return message
		}

		@ $mol_action
		read( peer: string, max_id: number ) {
			$mol_wire_sync( this.client() ).markAsRead( this.entity( peer ), max_id )
		}

		message_out( next?: [ string, $bog_gipergram_tg_message ] | null ) {
			return next ?? null
		}

		message_add( peer: string, message: $bog_gipergram_tg_message ) {
			if( message.out ) this.message_out( [ peer, message ] )
			const cached = $mol_wire_probe( ()=> this.messages( peer ) )
			if( cached && !cached.some( item => item.id === message.id ) ) {
				this.messages( peer, [ ... cached, message ] )
			}
			const dialogs = $mol_wire_probe( ()=> this.dialogs() ) ?? []
			const dialog = dialogs.find( item => item.id === peer )
			if( !dialog ) return
			this.dialogs( [
				{
					... dialog,
					top_id: message.id,
					top_text: message.text,
					top_date: message.date,
					top_out: message.out,
					unread: message.out ? dialog.unread : dialog.unread + 1,
				},
				... dialogs.filter( item => item !== dialog ),
			] )
		}

		peer_of( update: any ): [ string, number ] | null {
			const lib = this.lib()
			if( update.message?.peerId ) return [ String( lib.utils.getPeerId( update.message.peerId ) ), update.message.id ]
			if( update.className === 'UpdateShortMessage' ) return [ String( update.userId ), update.id ]
			if( update.className === 'UpdateShortChatMessage' ) return [ '-' + update.chatId, update.id ]
			return null
		}

		async update_handle( update: any ) {
			const found = this.peer_of( update )
			if( !found ) return
			const [ peer, id ] = found
			const client = this.client_raw()
			const [ message ] = await client.getMessages( this.entity( peer ), { ids: [ id ] } )
			if( message ) this.message_add( peer, this.message_of( message ) )
		}

		@ $mol_mem
		updates() {
			const client = this.client()
			const handler = ( update: any )=> this.update_handle( update )
			client.addEventHandler( handler )
			return {
				destructor: ()=> client.removeEventHandler( handler ),
			}
		}

	}

}
