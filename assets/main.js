Vue.use(VueLazyload, {
    preLoad: 1.6
})

var movies = new Vue({
    el: '#movies',
    data() {
        return {
            movieData: null,
            loading: true,
            errored: false,
            activeCard: null,
            panelActive: false,
            activeFilter: null,
            digitalFormats: [],
            physicalFormats: [],
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
            randomMovie: false,
            requestFormActive: false,
            requestName: null,
            requestTitle: null,
            requestStatus: null
        }
    },
    computed: {
        movies() {
            var self = this
            var movies = self.movieData
            var filteredMovies = _.filter(movies, movie => {
                var search = self.search ? new RegExp('\\b' + self.search, 'gi').test(movie.gsx$movietitle.$t) : true
                var format = self.formatFilter.length ? (self.formatFilter.includes(movie.gsx$vudu.$t) || self.formatFilter.includes(movie.gsx$googleplay.$t) || self.formatFilter.includes(movie.gsx$disc.$t)) : true
                var rating = self.ratingFilter.length ? self.ratingFilter.includes(movie.gsx$rating.$t) : true
                var genre = self.genreFilter.length ? self.genreFilter.every(item => movie.gsx$genre.$t.includes(item)) : true
                var year = (self.startYear ? movie.gsx$year.$t >= self.startYear : self.minYear) && (self.endYear ? movie.gsx$year.$t <= self.endYear : self.maxYear)

                return search && format && rating && genre && year
            })

            this.activeCard = null

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
        axios.get('https://spreadsheets.google.com/feeds/list/1QrEHAN4o6dQe4PqCXg5_AkQ8u_j1nqt1GCpz90Lv5g4/1/public/values?alt=json')
            .then(response => {
                this.movieData = response.data.feed.entry
                this.movieData = Object.freeze(this.movieData);

                // set up filters
                this.allGenres = [...new Set(this.movieData.flatMap(movie => movie.gsx$genre.$t.split(', ')))].sort()
                this.minYear = _.min(this.movieData.flatMap(movie => movie.gsx$year.$t))
                this.maxYear = _.max(this.movieData.flatMap(movie => movie.gsx$year.$t))
                
                var vuduFormats = this.movieData.flatMap(movie => movie.gsx$vudu.$t)
                var gpFormats = this.movieData.flatMap(movie => movie.gsx$googleplay.$t)
                var mergedFormats = [...vuduFormats, ...gpFormats]
                this.digitalFormats = [...new Set(mergedFormats)].filter(el => el != '').sort()
                
                var discFormats = this.movieData.flatMap(movie => movie.gsx$disc.$t)
                this.physicalFormats = [...new Set(discFormats)].filter(el => el != '').sort()
                
                var ratings = [...new Set(this.movieData.flatMap(movie => movie.gsx$rating.$t))]
                var ratingsOrder = ['G', 'TV-G', 'PG', 'TV-PG', 'PG-13', 'R', 'TV-MA', 'NR']
                var orderedratings = []
                
                for (var i = 0; i < ratingsOrder.length; i++)
                    if (ratings.indexOf(ratingsOrder[i]) > -1)
                        orderedratings.push(ratingsOrder[i])
                
                this.allRatings = orderedratings
            })
            .catch(error => {
                console.log(error)
                this.errored = true
            })
            .finally(() => this.loading = false)
    },
    methods: {
        selectItem(index) {
            // handle click for movie cards
            index === this.activeCard ? this.activeCard = null : this.activeCard = index

            this.activeFilter = null

            // close the side panel for narrow views
            this.panelActive = false
        },
        toggleFilters() {
            // toggle the filter side panel for narrow screens
            this.panelActive = !this.panelActive

            if (this.panelActive)
                this.activeCard = null
        },
        selectFilter(filter) {
            // handle click for filter dropdowns
            filter === this.activeFilter ? this.activeFilter = null : this.activeFilter = filter
            this.activeCard = null
        },
        validateMinYear() {
            if (this.startYear && this.startYear < this.minYear)
                this.startYear = this.minYear
            
            if (this.startYear && this.startYear > this.maxYear)
                this.startYear = this.maxYear
        },
        validateMaxYear() {
            if (this.endYear && this.endYear < this.minYear)
                this.endYear = this.minYear

            if (this.endYear && this.endYear > this.maxYear)
                this.endYear = this.maxYear
        },
        selectRandom() {
            // set to false, then back to true to force recomputed
            this.randomMovie = false
            this.randomMovie = true

            // close the side panel for narrow views
            this.panelActive = false

            // hide filter menus
            this.activeFilter = null
        },
        toggleRequestForm(e) {
            this.requestFormActive = !this.requestFormActive

            e.target.blur()

            if (this.requestFormActive && this.requestName)
                this.$refs.requestTitle.focus()
            else if (this.requestFormActive)
                this.$refs.requestName.focus()
        },
        submitRequest() {
            const scriptURL = 'https://script.google.com/macros/s/AKfycbzDLlzElZKNrEPIcrnQNV9P6duLdkufuq_g8QQSSTgi0yHvU3Y/exec'
            const formData = new FormData()
            formData.append('Movie Title', this.requestTitle)
            formData.append('Requester', this.requestName)

            this.requestStatus = 'processing'

            var date = new Date();
            date.setFullYear(date.getFullYear() + 1)
            setCookie('movieRequester', this.requestName, date)

            fetch(scriptURL, { method: 'POST', body: formData })
                .then(result => {
                    this.requestStatus = 'success'
                    this.requestTitle = null
                })
                .catch(error => {
                    console.error(error.message)
                    this.requestStatus = 'error'
                })
        },
        reset() {
            this.activeCard = null
            this.activeFilter = null
            this.search = ''
            this.formatFilter = []
            this.ratingFilter = []
            this.genreFilter = []
            this.startYear = null
            this.endYear = null
            this.randomMovie = false
        },
        documentClick(e) {
            var target = e.target
            
            // close filter panel (narrow views) on click outside
            var filterPanel = this.$refs.filterPanel
            var filterPanelBtn = this.$refs.filterPanelBtn

            if (filterPanel !== target && !filterPanel.contains(target) && filterPanelBtn !== target && !filterPanelBtn.contains(target))
                this.panelActive = false

            // close all filters on click outside
            var filters = this.$refs.filterOption
            var filterClicked = false

            for (var filter of filters) {
                if (filter == target || filter.contains(target)) {
                    filterClicked = true
                    break
                }
            }
            
            if (!filterClicked)
                this.activeFilter = null        
        }
    },
    created() {
        document.addEventListener('click', this.documentClick)
    },
    destroyed() {
        document.removeEventListener('click', this.documentClick)
    }
});

setCookie = function (name, value, date) {
    var expires = '; expires=' + date.toString();
    document.cookie = name + '=' + value + expires + '; path=/';
};

readCookie = function (name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

clearCookie = function (name) {
    setCookie(name, '', -1);
};