new Vue({
    el: '#movies',
    data() {
        return {
            movieData: null,
            loading: true,
            errored: false,
            activeItem: null,
            panelActive: false,
            activeFilter: null,
            allFormats: [],
            allGenres: [],
            allRatings: [],
            sort: 'recent',
            search: '',
            formatFilter: [],
            ratingFilter: [],
            genreFilter: [],
            startYear: null,
            endYear: null,
            minYear: 0,
            maxYear: 0,
            randomMovie: false
        }
    },
    computed: {
        movies() {
            var self = this
            var movies = self.movieData
            var filteredMovies = _.filter(movies, function (movie) {
                var search = self.search ? new RegExp('\\b' + self.search, 'gi').test(movie.gsx$movietitle.$t) : true
                var format = self.formatFilter.length ? (self.formatFilter.includes(movie.gsx$vudu.$t) || self.formatFilter.includes(movie.gsx$googleplay.$t) || self.formatFilter.includes(movie.gsx$disc.$t)) : true
                var rating = self.ratingFilter.length ? self.ratingFilter.includes(movie.gsx$rating.$t) : true
                var genre = self.genreFilter.length ? self.genreFilter.every(item => movie.gsx$genre.$t.includes(item)) : true
                var year = (self.startYear ? movie.gsx$year.$t >= self.startYear : self.minYear) && (self.endYear ? movie.gsx$year.$t <= self.endYear : self.maxYear)

                return search && format && rating && genre && year
            })

            this.activeItem = null

            var randomNum = _.random(filteredMovies.length - 1)

            if (self.randomMovie && randomNum > -1)
                return [filteredMovies[randomNum]]
            else if (self.sort == 'alpha')
                return _.orderBy(filteredMovies)
            else
                return _.orderBy(filteredMovies, m => m.gsx$acquired.$t ? new Date(m.gsx$acquired.$t) : '', ['desc'])
        }
    },
    mounted() {
        axios.get('https://spreadsheets.google.com/feeds/list/1QrEHAN4o6dQe4PqCXg5_AkQ8u_j1nqt1GCpz90Lv5g4/od6/public/values?alt=json')
            .then(response => {
                this.movieData = response.data.feed.entry
                this.allRatings = [...new Set(this.movieData.flatMap(movie => movie.gsx$rating.$t))].sort()
                var vuduFormats = this.movieData.flatMap(movie => movie.gsx$vudu.$t)
                var gpFormats = this.movieData.flatMap(movie => movie.gsx$googleplay.$t)
                var discFormats = this.movieData.flatMap(movie => movie.gsx$disc.$t)
                var mergedFormats = [...vuduFormats, ...gpFormats, ...discFormats]
                this.allFormats = [...new Set(mergedFormats)].filter(el => el != '').sort()
                this.allGenres = [...new Set(this.movieData.flatMap(movie => movie.gsx$genre.$t.split(', ')))].sort()
                this.minYear = Math.min.apply(Math, this.movieData.flatMap(movie => movie.gsx$year.$t))
                this.maxYear = Math.max.apply(Math, this.movieData.flatMap(movie => movie.gsx$year.$t))
            })
            .catch(error => {
                console.log(error)
                this.errored = true
            })
            .finally(() => this.loading = false)
    },
    methods: {
        selectItem(index) {
            index === this.activeItem ? this.activeItem = null : this.activeItem = index
            this.activeFilter = null
        },
        toggleFilters: function () {
            this.panelActive = !this.panelActive
        },
        selectFilter(filter) {
            filter === this.activeFilter ? this.activeFilter = null : this.activeFilter = filter
            this.activeItem = null
        },
        selectRandom() {
            // set to false, then back to true to force recomputed
            this.randomMovie = false
            this.randomMovie = true

            // close the side panel for narrow views
            this.panelActive = false

            // hide filter menus
            this.activeFilter = null
        }
    }
})