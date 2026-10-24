namespace $ {

	export type $bog_gipergram_store_mine = {
		peer: string
		id: number
		text: string
		date: number
	}

	export class $bog_gipergram_store extends $mol_object {

		local< Value >( key: string, next?: Value ) {
			return this.$.$mol_state_local.value< Value >( 'bog_gipergram_' + key, next )
		}

		@ $mol_mem
		tabs( next?: string[] ): string[] {
			return this.local( 'tabs', next ) ?? []
		}

		tab_open( peer: string ) {
			if( this.tabs().includes( peer ) ) return
			this.tabs( [ ... this.tabs(), peer ] )
		}

		tab_bump( peer: string ) {
			this.tabs( [ peer, ... this.tabs().filter( id => id !== peer ) ] )
		}

		tab_close( peer: string ) {
			this.tabs( this.tabs().filter( id => id !== peer ) )
			this.split( this.split().filter( id => id !== peer ) )
		}

		@ $mol_mem
		split( next?: string[] ): string[] {
			return this.local( 'split', next ) ?? []
		}

		split_toggle( peer: string ) {
			const split = this.split()
			this.split( split.includes( peer )
				? split.filter( id => id !== peer )
				: [ ... split, peer ]
			)
		}

		@ $mol_mem_key
		anchor( peer: string, next?: number | null ): number | null {
			return this.local( 'anchor_' + peer, next ) ?? null
		}

		@ $mol_mem_key
		anchor_prev( peer: string, next?: number | null ): number | null {
			return this.local( 'anchor_prev_' + peer, next ) ?? null
		}

		anchor_move( peer: string, from: number, id: number ) {
			if( from >= id ) return
			this.anchor_prev( peer, from )
			this.anchor( peer, id )
		}

		anchor_restore( peer: string ) {
			const prev = this.anchor_prev( peer )
			if( prev === null ) return
			this.anchor( peer, prev )
			this.anchor_prev( peer, null )
		}

		mine_limit() {
			return 500
		}

		@ $mol_mem
		mine( next?: $bog_gipergram_store_mine[] ): $bog_gipergram_store_mine[] {
			return this.local( 'mine', next ) ?? []
		}

		mine_add( item: $bog_gipergram_store_mine ) {
			const mine = this.mine()
			if( mine.some( one => one.peer === item.peer && one.id === item.id ) ) return
			this.mine( [ item, ... mine ].slice( 0, this.mine_limit() ) )
		}

	}

}
