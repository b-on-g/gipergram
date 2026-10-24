namespace $.$$ {

	export class $bog_gipergram_row extends $.$bog_gipergram_row {

		unread_text() {
			const unread = this.unread()
			return unread > 99 ? '99+' : String( unread )
		}

		foot() {
			return [
				this.Preview(),
				... this.unread() > 0 ? [ this.Unread() ] : [],
			]
		}

	}

}
