firebase.initializeApp({
    apiKey: 'AIzaSyDzKCN-wjRWLk7ojLlvqgWxi6jfC9e99Wc',
    authDomain: 'movies-4348d.firebaseapp.com',
    projectId: 'movies-4348d'
});

var db = firebase.firestore();
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
            var filteredMovies = _.filter(movies, movie => {
                var search = self.filter.search ? new RegExp('\\b' + self.filter.search, 'gi').test(movie.title) : true
                var format = self.filter.format.length ? (self.filter.format.includes(movie.vudu) || self.filter.format.includes(movie.googlePlay) || self.filter.format.includes(movie.disc)) : true
                var rating = self.filter.rating.length ? self.filter.rating.includes(movie.rating) : true
                var genre = self.filter.genre.length ? self.filter.genre.every(item => movie.genre.includes(item)) : true
                var year = (self.filter.startYear ? movie.year >= self.filter.startYear : self.filterData.minYear) && (self.filter.endYear ? movie.year <= self.filter.endYear : self.filterData.maxYear)

                return search && format && rating && genre && year
            })

            self.movieCount = filteredMovies.length

            self.activeCard = null

            var randomNum = _.random(filteredMovies.length - 1)

            if (self.filter.randomMovie && randomNum > -1) {
                self.movieCount = 1
                return [filteredMovies[randomNum]]
            } else if (self.filter.sort == 'alpha') {
                return _.take(_.orderBy(filteredMovies, ['title'], ['asc']), self.lazy.totalShown)
            } else {
                return _.take(_.orderBy(filteredMovies, m => m.dateAcquired.toDate(), ['desc']), self.lazy.totalShown)
            }
        }
    },
    mounted() {
        var vm = this
        moviesRef.get().then(querySnapshot => {
            this.movieData = querySnapshot.docs.map(doc => doc.data())

            // set up filters
            this.filterData.genres = [...new Set(this.movieData.flatMap(movie => movie.genre))].sort()
            this.filterData.minYear = _.min(this.movieData.flatMap(movie => movie.year))
            this.filterData.maxYear = _.max(this.movieData.flatMap(movie => movie.year))

            var vuduFormats = this.movieData.flatMap(movie => movie.vudu)
            var gpFormats = this.movieData.flatMap(movie => movie.googlePlay)
            var mergedFormats = [...vuduFormats, ...gpFormats]
            this.filterData.digital = [...new Set(mergedFormats)].filter(el => el != '').sort()

            var discFormats = this.movieData.flatMap(movie => movie.disc)
            this.filterData.physical = [...new Set(discFormats)].filter(el => el != '').sort()

            var ratings = [...new Set(this.movieData.flatMap(movie => movie.rating))]
            var ratingsOrder = ['G', 'TV-G', 'PG', 'TV-PG', 'PG-13', 'TV-14', 'R', 'TV-MA', 'NR']
            var orderedratings = []

            for (var i = 0; i < ratingsOrder.length; i++)
                if (ratings.indexOf(ratingsOrder[i]) > -1)
                    orderedratings.push(ratingsOrder[i])

            this.filterData.ratings = orderedratings
        })
        .catch(error => {
            console.log(error)
            this.errored = true
        })
        .finally(() => this.loading = false)

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
        });
    },
    methods: {
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
            // set to false, then back to true to force recomputed
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