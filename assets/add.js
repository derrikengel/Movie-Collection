firebase.initializeApp({
    apiKey: 'AIzaSyDzKCN-wjRWLk7ojLlvqgWxi6jfC9e99Wc',
    authDomain: 'movies-4348d.firebaseapp.com',
    projectId: 'movies-4348d'
});

var db = firebase.firestore();

var addMovie = new Vue({
    el: '#add-movie',
    data() {
        return {
            user: {
                email: null,
                password: null,
                authenticated: false,
                errorMsg: false
            },
            movie: {
                title: '',
                year: '',
                imageUrl: '',
                vuduUrl: '',
                genre: [],
                genreValid: false,
                rating: '',
                vuduQuality: '',
                gpQuality: '',
                maQuality: '',
                discFormat: '',
                notes: ''
            },
            result: '',
            resultMessage: ''
        }
    },
    mounted() {
        var vm = this
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                vm.user.authenticated = true
            } else {
                vm.user.authenticated = false
            }
        });
    },
    methods: {
        signIn() {
            var vm = this
            firebase.auth().signInWithEmailAndPassword(vm.user.email, vm.user.password).catch(error => {
                vm.user.errorMsg = true
            });
        },
        updateImage() {
            var vm = this
            if (vm.movie.vuduUrl && !vm.movie.imageUrl) {
                var movieId = vm.movie.vuduUrl.substring(vm.movie.vuduUrl.lastIndexOf('/') + 1)
                vm.movie.imageUrl = 'https://images2.vudu.com/poster2/' + movieId + '-360'
            }
        },
        addMovie() {
            var vm = this

            // check if at least 1 genre is selected
            if (vm.movie.genre < 1) {
                // scroll up to genre
                this.$refs.genreLabel.scrollIntoView();
            } else {
                // add movie to db
                db.collection('movies').add({
                    title: vm.movie.title,
                    year: vm.movie.year,
                    image: vm.movie.imageUrl,
                    vudu: vm.movie.vuduQuality,
                    googlePlay: vm.movie.gpQuality,
                    moviesAnywhere: vm.movie.maQuality,
                    disc: vm.movie.discFormat,
                    genre: vm.movie.genre,
                    rating: vm.movie.rating,
                    dateAcquired: firebase.firestore.Timestamp.fromDate(new Date()),
                    notes: vm.movie.notes
                })
                .then(() => {
                    // show success message
                    vm.result = 'success'
                    vm.resultMessage = vm.movie.title + ' successfully added!'
    
                    // clear form and vm data to easily add another
                    vm.resetForm()
                })
                .catch(error => {
                    // show error message
                    vm.result = 'error'
                    vm.resultMessage = 'Error: ' + error
                })
    
                // jump back to the top
                window.scrollTo(0, 0)

                // notify users of new movie
                vm.sendNotification()
            }
        },
        resetForm() {
            var vm = this

            vm.movie.title = ''
            vm.movie.year = ''
            vm.movie.imageUrl = ''
            vm.movie.vuduUrl = ''
            vm.movie.genre = []
            vm.movie.rating = ''
            vm.movie.vuduQuality = ''
            vm.movie.gpQuality = ''
            vm.movie.maQuality = ''
            vm.movie.discFormat = ''
            vm.movie.notes = ''
        },
        sendNotification() {
            // notify users of new movie
        }
    }
});