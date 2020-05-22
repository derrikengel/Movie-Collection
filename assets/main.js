new Vue({
	el: '#movies',
	data() {
		return {
			movieData: null,
			loading: true,
            errored: false,
            activeItem: null,
            search: '',
            disc: '',
            sort: 'recent'
		}
	},
    computed: {
        movies() {
            var self = this
            var movies = self.movieData
            var filteredMovies = _.filter(movies, function (movie) {
                var disc = self.disc ? (movie.gsx$disc.$t == self.disc) : true
                var search = self.search ? new RegExp('\\b' + self.search, 'gi').test(movie.gsx$movietitle.$t) : true
                return disc && search
            })
            
            if (self.sort == 'alpha')
                return _.orderBy(filteredMovies)
            else
                return _.orderBy(filteredMovies, function (m) {
                    return m.gsx$acquired.$t ? new Date(m.gsx$acquired.$t) : ''
                }, ['desc'])
        }
    },
    mounted() {
        axios.get('https://spreadsheets.google.com/feeds/list/1QrEHAN4o6dQe4PqCXg5_AkQ8u_j1nqt1GCpz90Lv5g4/od6/public/values?alt=json')
            .then(response => {
                this.movieData = response.data.feed.entry
            })
            .catch(error => {
                console.log(error)
                this.errored = true
            })
            .finally(() => this.loading = false)
    },
    methods: {
        selectItem(index) {
            if (index === this.activeItem)
                this.activeItem = null
            else
                this.activeItem = index
        }
    }
})