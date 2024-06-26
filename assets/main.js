firebase.initializeApp({
    apiKey: 'AIzaSyDzKCN-wjRWLk7ojLlvqgWxi6jfC9e99Wc',
    authDomain: 'movies-4348d.firebaseapp.com',
    projectId: 'movies-4348d'
});

var db = firebase.firestore()
var lastUpdateRef = db.collection('lastUpdated').doc('lastUpdated')
var moviesRef = db.collection('movies')

var movies = new Vue({
    el: '#movies',
    data() {
        return {
            movieData: null,
            loading: true,
            errored: false,
            movieCount: 0,
            activeCard: null,
            user: {
                id: null,
                email: null,
                password: null,
                name: null,
                authenticated: false,
                errorMsg: false
            },
            lazy: {
                busy: false,
                totalShown: 0,
                scrollIncrement: 40
            },
            filter: {
                active: null,
                panelActive: false,
                sort: 'recent',
                search: '',
                format: [],
                rating: [],
                genre: [],
                startYear: null,
                endYear: null,
                randomMovie: false
            },
            filterData: {
                digital: [],
                physical: [],
                genres: [],
                ratings: [],
                minYear: 0,
                maxYear: 0
            },
            request: {
                formActive: false,
                title: null,
                status: null
            }
        }
    },
    computed: {
        movies() {
            var self = this
            var movies = self.movieData

            // filter movie data
            var filteredMovies = _.filter(movies, movie => {
                var search = self.filter.search ? new RegExp('\\b' + self.filter.search, 'gi').test(movie.title) : true
                var format = self.filter.format.length ? (self.filter.format.includes(movie.vudu) || self.filter.format.includes(movie.googlePlay) || self.filter.format.includes(movie.plex) || self.filter.format.includes(movie.disc)) : true
                var rating = self.filter.rating.length ? self.filter.rating.includes(movie.rating) : true
                var genre = self.filter.genre.length ? self.filter.genre.every(item => movie.genre.includes(item)) : true
                var year = (self.filter.startYear ? movie.year >= self.filter.startYear : self.filterData.minYear) && (self.filter.endYear ? movie.year <= self.filter.endYear : self.filterData.maxYear)

                return search && format && rating && genre && year
            })

            // update the filtered movie count
            self.movieCount = filteredMovies.length

            // remove selected state from movie cards
            self.activeCard = null

            // generate a random number based on filtered movies
            var randomNum = _.random(filteredMovies.length - 1)

            if (self.filter.randomMovie && randomNum > -1) {
                // return random movie
                self.movieCount = 1
                return [filteredMovies[randomNum]]
            } else if (self.filter.sort == 'alpha') {
                // return filtered movies, ordered alphabetically
                return _.take(_.orderBy(filteredMovies, ['title'], ['asc']), self.lazy.totalShown)
            } else {
                // return filtered movies, ordered by purchase date
                return _.take(_.orderBy(filteredMovies, m => m.dateAcquired, ['desc']), self.lazy.totalShown)
            }
        },
        filtersActive() {
            return this.filter.search ||
                this.filter.format.length > 0 ||
                this.filter.rating.length > 0 ||
                this.filter.genre.length > 0 ||
                this.filter.startYear ||
                this.filter.endYear ||
                this.filter.randomMovie
        }
    },
    mounted() {
        var vm = this

        // get lastUpdated date from db
        lastUpdateRef.get().then(doc => {
            var localUpdated = new Date(localStorage.getItem('lastUpdated')).toISOString()
            var remoteUpdated = doc.data().date.toDate().toISOString()

            if (localUpdated == remoteUpdated) {
                // if localstorage exists and it is up to date, use it
                vm.getLocalData()
            } else {
                vm.getRemoteData(remoteUpdated)
            }    
        }).catch(error => {
            console.log('Could not get lastUpdated.')
        })

        // watch firebase for changes to user authentication
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                vm.user.authenticated = true
                vm.user.id = user.uid
                vm.user.name = user.displayName
                vm.user.errorMsg = null
            } else {
                vm.user.authenticated = false
                vm.user.id = null
                vm.user.name = null
            }
        })
    },
    methods: {
        getRemoteData(remoteUpdated) {
            var vm = this

            moviesRef.get().then(querySnapshot => {
                vm.movieData = querySnapshot.docs.map(doc => {
                    return { id: doc.id, ...doc.data() }
                })
                
                 
                vm.movieData.forEach(movie => {
                    // convert firestore timestamp
                    movie.dateAcquired = movie.dateAcquired.toDate()

                    // convert movie length from minutes to hours and minutes
                    if (movie.length) {
                        var hours = Math.floor(movie.length / 60) + 'h '
                        var minutes = movie.length % 60 + 'm'
                        movie.length = hours + minutes
                    }

                    // sort genres
                    movie.genre = _.sortBy(movie.genre)
                })

                vm.setLocalData(remoteUpdated)
            })
            .catch(error => {
                console.log(error)
                vm.errored = true
            })
        },
        getLocalData() {
            var vm = this

            var localData = localStorage.getItem('movieData')
            vm.movieData = JSON.parse(localData)

            vm.initFilters()
        },
        setLocalData(remoteUpdated) {
            var vm = this

            localStorage.clear()
            
            localStorage.setItem('movieData', JSON.stringify(vm.movieData))

            localStorage.setItem('lastUpdated', remoteUpdated)

            vm.initFilters()
        },
        initFilters() {
            var vm = this

            vm.filterData.genres = [...new Set(vm.movieData.flatMap(movie => movie.genre))].sort()
            vm.filterData.minYear = _.min(vm.movieData.flatMap(movie => movie.year))
            vm.filterData.maxYear = _.max(vm.movieData.flatMap(movie => movie.year))

            var vuduFormats = vm.movieData.flatMap(movie => movie.vudu)
            var gpFormats = vm.movieData.flatMap(movie => movie.googlePlay)
            var plexFormats = vm.movieData.flatMap(movie => movie.plex)
            var mergedFormats = [...vuduFormats, ...gpFormats, ...plexFormats]
            vm.filterData.digital = [...new Set(mergedFormats)].filter(el => el && el != '').sort()

            var discFormats = vm.movieData.flatMap(movie => movie.disc)
            vm.filterData.physical = [...new Set(discFormats)].filter(el => el && el != '').sort()

            var ratings = [...new Set(vm.movieData.flatMap(movie => movie.rating))]
            var ratingsOrder = ['G', 'TV-G', 'PG', 'TV-PG', 'PG-13', 'TV-14', 'R', 'TV-MA', 'NC-17', 'NR']
            var orderedRatings = []

            for (var i = 0; i < ratingsOrder.length; i++)
                if (ratings.indexOf(ratingsOrder[i]) > -1)
                    orderedRatings.push(ratingsOrder[i])
            
            vm.filterData.ratings = orderedRatings

            vm.loading = false
        },
        loadMore() {
            this.lazy.busy = true

            this.lazy.totalShown += this.lazy.scrollIncrement

            this.lazy.busy = false
        },
        openModal(index) {
            this.activeCard = index.toString()

            this.filter.active = null

            // close the side panel for narrow views
            this.filter.panelActive = false

            // set focus on modal
            this.$nextTick(() => {
                this.$refs.modalCard.focus()
                this.$refs.modalCardOverlay.scrollTop = 0
            })
        },
        closeModal() {
            // set focus back to movie card
            this.$refs.movieCard[this.activeCard].focus()

            this.activeCard = null
        },
        toggleFilters() {
            // toggle the filter side panel for narrow screens
            this.filter.panelActive = !this.filter.panelActive

            if (this.filter.panelActive)
                this.activeCard = null
        },
        selectFilter(filter) {
            // handle click for filter dropdowns
            filter === this.filter.active ? this.filter.active = null : this.filter.active = filter
            this.activeCard = null
        },
        closeFilter() {
            this.filter.active = null
        },
        validateMinYear() {
            if (this.filter.startYear && this.filter.startYear < this.filterData.minYear)
                this.filter.startYear = this.filterData.minYear

            if (this.filter.startYear && this.filter.startYear > this.filterData.maxYear)
                this.filter.startYear = this.filterData.maxYear
        },
        validateMaxYear() {
            if (this.filter.endYear && this.filter.endYear < this.filterData.minYear)
                this.filter.endYear = this.filterData.minYear

            if (this.filter.endYear && this.filter.endYear > this.filterData.maxYear)
                this.filter.endYear = this.filterData.maxYear
        },
        selectRandom() {
            // set to false, then back to true to trigger computed property
            this.filter.randomMovie = false
            this.filter.randomMovie = true

            // close the side panel for narrow views
            this.filter.panelActive = false

            // hide filter menus
            this.filter.active = null
        },
        toggleRequestForm(e) {
            this.request.formActive = !this.request.formActive

            e.target.blur()

            if (this.request.formActive) {
                this.user.authenticated ? this.$refs.requestTitle.focus() : this.$refs.userEmail.focus()
            }
        },
        signIn() {
            var vm = this
            firebase.auth().signInWithEmailAndPassword(vm.user.email, vm.user.password).catch(error => {
                vm.user.errorMsg = true
            })
        },
        submitRequest() {
            var scriptURL = 'https://script.google.com/macros/s/AKfycbzDLlzElZKNrEPIcrnQNV9P6duLdkufuq_g8QQSSTgi0yHvU3Y/exec'
            var formData = new FormData()
            formData.append('Movie Title', this.request.title)
            formData.append('Requester', this.user.name)

            this.request.status = 'processing'

            fetch(scriptURL, { method: 'POST', body: formData })
                .then(result => {
                    this.request.status = 'success'
                    this.request.title = null
                })
                .catch(error => {
                    console.error(error.message)
                    this.request.status = 'error'
                })
        },
        reset() {
            this.activeCard = null
            this.filter.active = null
            this.filter.search = ''
            this.filter.format = []
            this.filter.rating = []
            this.filter.genre = []
            this.filter.startYear = null
            this.filter.endYear = null
            this.filter.randomMovie = false
        },
        documentClick(e) {
            var target = e.target

            // close filter panel (narrow views) on click outside
            var filterPanel = this.$refs.filterPanel
            var filterPanelBtn = this.$refs.filterPanelBtn

            if (filterPanel !== target && !filterPanel.contains(target) && filterPanelBtn !== target && !filterPanelBtn.contains(target))
                this.filter.panelActive = false

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
                this.filter.active = null
        }
    },
    created() {
        document.addEventListener('click', this.documentClick)
    },
    destroyed() {
        document.removeEventListener('click', this.documentClick)
    }
})