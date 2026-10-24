namespace $.$$ {

	export class $bog_gipergram_message extends $.$bog_gipergram_message {

		bubble_content() {
			return [
				... this.author() && !this.out() ? [ this.Author() ] : [],
				this.Text(),
				this.Time(),
			]
		}

	}

}
