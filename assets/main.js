firebase.initializeApp({
    apiKey: 'AIzaSyDzKCN-wjRWLk7ojLlvqgWxi6jfC9e99Wc',
    authDomain: 'movies-4348d.firebaseapp.com',
    projectId: 'movies-4348d'
});

var db = firebase.firestore();
var lastUpdateRef = db.collection('lastUpdated').doc('lastUpdated');
var moviesRef = db.collection('movies');

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
                scrollIncrement: 30
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
                var format = self.filter.format.length ? (self.filter.format.includes(movie.vudu) || self.filter.format.includes(movie.googlePlay) || self.filter.format.includes(movie.disc)) : true
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
            console.log('Could not get lastUpdated.');
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
                vm.movieData = querySnapshot.docs.map(doc => doc.data())
                
                // convert firestore timestamp
                vm.movieData.forEach(movie => {
                    movie.dateAcquired = movie.dateAcquired.toDate()
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
            var mergedFormats = [...vuduFormats, ...gpFormats]
            vm.filterData.digital = [...new Set(mergedFormats)].filter(el => el != '').sort()

            var discFormats = vm.movieData.flatMap(movie => movie.disc)
            vm.filterData.physical = [...new Set(discFormats)].filter(el => el != '').sort()

            var ratings = [...new Set(vm.movieData.flatMap(movie => movie.rating))]
            var ratingsOrder = ['G', 'TV-G', 'PG', 'TV-PG', 'PG-13', 'TV-14', 'R', 'TV-MA', 'NR']
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
        selectItem(index) {
            // handle click for movie cards
            index === this.activeCard ? this.activeCard = null : this.activeCard = index

            this.filter.active = null

            // close the side panel for narrow views
            this.filter.panelActive = false
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

            if (this.request.formActive)
                this.$refs.requestTitle.focus()
        },
        signIn() {
            var vm = this
            firebase.auth().signInWithEmailAndPassword(vm.user.email, vm.user.password).catch(error => {
                vm.user.errorMsg = true
            });
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