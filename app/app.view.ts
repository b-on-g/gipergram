namespace $.$$ {

	export class $bog_gipergram_app extends $.$bog_gipergram_app {

		chat_current() {
			return this.$.$mol_state_arg.value( 'chat' )
		}

		mine_opened() {
			return this.$.$mol_state_arg.value( 'mine' ) !== null
		}

		devices_opened() {
			return this.$.$mol_state_arg.value( 'devices' ) !== null
		}

		pages() {
			if( !this.tg().authorized() ) return [ this.Login() ]
			const current = this.chat_current()
			return [
				this.Menu(),
				... this.store().split().filter( id => id !== current ).map( id => this.Chat( id ) ),
				... current ? [ this.Chat( current ) ] : [],
				... this.mine_opened() ? [ this.Mine() ] : [],
				... this.devices_opened() ? [ this.Devices() ] : [],
			]
		}

		auto() {
			this.Devices().imported()
			this.store().data()
		}

		chat_peer( id: string ) {
			return id
		}

		@ $mol_mem
		tab_ids() {
			const tabs = this.store().tabs()
			const current = this.chat_current()
			return current && !tabs.includes( current ) ? [ ... tabs, current ] : tabs
		}

		tab_rows() {
			return this.tab_ids().map( id => this.Tab( id ) )
		}

		chat_rows() {
			const tabs = new Set( this.tab_ids() )
			return this.tg().dialogs()
				.filter( dialog => !tabs.has( dialog.id ) )
				.map( dialog => this.Chat_row( dialog.id ) )
		}

		row_peer( id: string ) {
			return id
		}

		row_title( id: string ) {
			return this.tg().dialog( id )?.title ?? id
		}

		row_preview( id: string ) {
			const dialog = this.tg().dialog( id )
			if( !dialog ) return ''
			return ( dialog.top_out ? '↗ ' : '' ) + dialog.top_text
		}

		time_text( date: number ) {
			if( !date ) return ''
			const moment = new $mol_time_moment( date * 1000 )
			const today = new $mol_time_moment().toString( 'YYYY-MM-DD' )
			return moment.toString( moment.toString( 'YYYY-MM-DD' ) === today ? 'hh:mm' : 'DD.MM' )
		}

		row_time( id: string ) {
			return this.time_text( this.tg().dialog( id )?.top_date ?? 0 )
		}

		row_arg( id: string ) {
			return { chat: id, mine: null }
		}

		tab_unread( id: string ) {
			return this.Chat( id ).unread_count()
		}

		chat_unread( id: string ) {
			return this.tg().dialog( id )?.unread ?? 0
		}

		@ $mol_action
		chat_open( key: string, event?: Event ) {
			this.store().tab_open( this.mine_peer( key ) )
			return event
		}

		@ $mol_action
		logout() {
			this.tg().logout()
		}

		@ $mol_action
		message_out( next?: [ string, $bog_gipergram_tg_message ] | null ) {
			if( !next ) return null
			const [ peer, message ] = next
			this.store().mine_add( peer, message.id )
			return next
		}

		mine_rows() {
			return this.store().mine().map( key => this.Mine_row( key ) )
		}

		mine_item( key: string ) {
			const [ peer, id ] = key.split( ':' )
			return this.tg().message_one( [ peer, Number( id ) ] )
		}

		mine_peer( key: string ) {
			return key.split( ':' )[ 0 ]
		}

		mine_title( key: string ) {
			return this.row_title( this.mine_peer( key ) )
		}

		mine_text( key: string ) {
			return this.mine_item( key )?.text ?? ''
		}

		mine_time( key: string ) {
			return this.time_text( this.mine_item( key )?.date ?? 0 )
		}

		mine_arg( key: string ) {
			return { chat: this.mine_peer( key ), mine: null }
		}

	}

}
