namespace $.$$ {

	export class $bog_gipergram_message extends $.$bog_gipergram_message {

		media_content() {
			switch( this.media() ) {
				case 'photo': return [ this.Image() ]
				case 'voice': return [ this.Voice() ]
				case 'file': return [ this.File() ]
				default: return []
			}
		}

		bubble_content() {
			return [
				... this.author() && !this.out() ? [ this.Author() ] : [],
				... this.media_content(),
				... this.text() ? [ this.Text() ] : [],
				this.Time(),
			]
		}

	}

}
