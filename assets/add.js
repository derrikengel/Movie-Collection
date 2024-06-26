firebase.initializeApp({
    apiKey: 'AIzaSyDzKCN-wjRWLk7ojLlvqgWxi6jfC9e99Wc',
    authDomain: 'movies-4348d.firebaseapp.com',
    projectId: 'movies-4348d'
})

var db = firebase.firestore()

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
                id: null,
                title: '',
                year: '',
                imageUrl: '',
                heroUrl: '',
                trailerId: '',
                genre: [],
                genreValid: false,
                rating: '',
                vuduUrl: '',
                vuduQuality: '',
                gpUrl: '',
                gpQuality: '',
                itunesUrl: '',
                itunesQuality: '',
                plexUrl: '',
                plexQuality: '',
                maQuality: '',
                discFormat: '',
                length: '',
                description: '',
                dateAcquired: new Date(),
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
        })

        if (vm.movie.id) {
            db.collection('movies').doc(vm.movie.id).get().then(function (doc) {
                if (doc.exists) {
                    var movie = doc.data()

                    vm.movie.title = movie.title || ''
                    vm.movie.year = movie.year || ''
                    vm.movie.imageUrl = movie.image || ''
                    vm.movie.heroUrl = movie.hero || ''
                    vm.movie.trailerId = movie.trailerId || ''
                    vm.movie.vuduUrl = movie.vuduUrl || ''
                    vm.movie.vuduQuality = movie.vudu || ''
                    vm.movie.gpUrl = movie.gpUrl || ''
                    vm.movie.gpQuality = movie.googlePlay || ''
                    vm.movie.itunesUrl = movie.itunesUrl || ''
                    vm.movie.itunesQuality = movie.itunes || ''
                    vm.movie.plexUrl = movie.plexUrl || ''
                    vm.movie.plexQuality = movie.plex || ''
                    vm.movie.maQuality = movie.moviesAnywhere || ''
                    vm.movie.discFormat = movie.disc || ''
                    vm.movie.genre = movie.genre || ''
                    vm.movie.rating = movie.rating || ''
                    vm.movie.length = movie.length || ''
                    vm.movie.description = movie.description || ''
                    vm.movie.dateAcquired = movie.dateAcquired.toDate() || ''
                    vm.movie.notes = movie.notes || ''
                } else {
                    console.log('Document does not exist.');
                }
            }).catch(function (error) {
                console.log("Error getting document: ", error);
            })
        }
    },
    computed: {
        movieLength() {
            // convert movie length from minutes to hours and minutes
            if (this.movie.length) {
                var hours = Math.floor(this.movie.length / 60)
                var minutes = this.movie.length % 60
                return (hours > 0 ? hours + 'h ' : '') + minutes + 'm'
            }
        },
        formattedDate: {
            get() {
                return this.formatDate(this.movie.dateAcquired);
            },
            set(value) {
                console.log(value);
                this.movie.dateAcquired = new Date(value);
            }
        }
    },
    methods: {
        signIn() {
            var vm = this
            firebase.auth().signInWithEmailAndPassword(vm.user.email, vm.user.password).catch(error => {
                vm.user.errorMsg = true
            })
        },
        updateImages() {
            var vm = this
            if (vm.movie.vuduUrl) {
                var movieId = vm.movie.vuduUrl.substring(vm.movie.vuduUrl.lastIndexOf('/') + 1)

                if (!vm.movie.imageUrl) {
                    vm.movie.imageUrl = 'https://images2.vudu.com/poster2/' + movieId + '-360'
                }

                if (!vm.movie.heroUrl) {
                    vm.movie.heroUrl = 'https://images2.vudu.com/background/' + movieId + '-1280a.jpg'
                }
            }
        },
        submitForm() {
            var vm = this
            // check if at least 1 genre is selected
            if (vm.movie.genre < 1) {
                // scroll up to genre
                this.$refs.genreLabel.scrollIntoView({ behavior: 'smooth' })
            } else {
                if (vm.movie.id) {
                    vm.updateMovie()
                } else {
                    vm.addMovie()
                }
            }
        },
        addMovie() {
            var vm = this
    
            // add movie to db
            db.collection('movies').add({
                title: vm.movie.title,
                year: vm.movie.year,
                image: vm.movie.imageUrl,
                hero: vm.movie.heroUrl,
                trailerId: vm.movie.trailerId,
                vuduUrl: vm.movie.vuduUrl,
                vudu: vm.movie.vuduQuality,
                gpUrl: vm.movie.gpUrl,
                googlePlay: vm.movie.gpQuality,
                itunesUrl: vm.movie.itunesUrl,
                itunes: vm.movie.itunesQuality,
                plexUrl: vm.movie.plexUrl,
                plex: vm.movie.plexQuality,
                moviesAnywhere: vm.movie.maQuality,
                disc: vm.movie.discFormat,
                genre: vm.movie.genre,
                rating: vm.movie.rating,
                length: vm.movie.length,
                description: vm.movie.description,
                dateAcquired: firebase.firestore.Timestamp.fromDate(vm.movie.dateAcquired),
                notes: vm.movie.notes
            })
            .then(() => {
                // show success message
                vm.result = 'success'
                vm.resultMessage = vm.movie.title + ' successfully added!'

                // notify users of new movie
                //vm.sendNotification()

                // clear form and vm data to easily add another
                vm.resetForm()
            })
            .catch(error => {
                // show error message
                vm.result = 'error'
                vm.resultMessage = 'Error: ' + error
            })

            // update "lastUpdated" value in db so documents can be cached in local storage until the db has been updated
            db.collection('lastUpdated').doc('lastUpdated').set({
                date: firebase.firestore.Timestamp.fromDate(new Date())
            })
            .then(() => {
            })
            .catch(error => {
            })

            // jump back to the top
            window.scrollTo(0, 0)
        },
        updateMovie() {
            var vm = this

            // update movie
            db.collection('movies').doc(vm.movie.id).update({
                title: vm.movie.title,
                year: vm.movie.year,
                image: vm.movie.imageUrl,
                hero: vm.movie.heroUrl,
                trailerId: vm.movie.trailerId,
                vuduUrl: vm.movie.vuduUrl,
                vudu: vm.movie.vuduQuality,
                gpUrl: vm.movie.gpUrl,
                googlePlay: vm.movie.gpQuality,
                itunesUrl: vm.movie.itunesUrl,
                itunes: vm.movie.itunesQuality,
                plexUrl: vm.movie.plexUrl,
                plex: vm.movie.plexQuality,
                moviesAnywhere: vm.movie.maQuality,
                disc: vm.movie.discFormat,
                genre: vm.movie.genre,
                rating: vm.movie.rating,
                length: vm.movie.length,
                description: vm.movie.description,
                dateAcquired: firebase.firestore.Timestamp.fromDate(vm.movie.dateAcquired),
                notes: vm.movie.notes
            })
            .then(() => {
                // show success message
                vm.result = 'success'
                vm.resultMessage = vm.movie.title + ' successfully updated!'
            })
            .catch(error => {
                // show error message
                vm.result = 'error'
                vm.resultMessage = 'Error: ' + error
            })

            // jump back to the top
            window.scrollTo(0, 0)
        },
        formatDate(date) {
            var dateAcquired = new Date(date);
            dateAcquired.setMinutes(dateAcquired.getMinutes() - dateAcquired.getTimezoneOffset());
            return dateAcquired.toISOString().slice(0, 16);
        },
        resetForm() {
            var vm = this

            vm.movie.title = ''
            vm.movie.year = ''
            vm.movie.imageUrl = ''
            vm.movie.heroUrl = ''
            vm.movie.trailerId = ''
            vm.movie.genre = []
            vm.movie.rating = ''
            vm.movie.vuduUrl = ''
            vm.movie.vuduQuality = ''
            vm.movie.gpUrl = ''
            vm.movie.gpQuality = ''
            vm.movie.itunesUrl = ''
            vm.movie.itunesQuality = ''
            vm.movie.plexUrl = ''
            vm.movie.plexQuality = ''
            vm.movie.maQuality = ''
            vm.movie.discFormat = ''
            vm.movie.length = ''
            vm.movie.description = ''
            vm.movie.notes = ''
        },
        sendNotification() {
            var vm = this

            var message = {
                app_id: '51371f36-89a9-4233-b288-f7b96ef23684',
                headings: { 'en': 'New movie!' },
                contents: { 'en': vm.movie.title + ' (' + vm.movie.year + ') ' + 'was added to the movie collection.' },
                chrome_web_icon: vm.movie.imageUrl,
                chrome_web_badge: 'https://movies.derrikengel.com/assets/chrome-badge.png',
                included_segments: ['All']
            }

            fetch('https://onesignal.com/api/v1/notifications', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': 'Basic YzhmM2M4MzctMGI3Yi00MWI2LTgxODYtZWMyYTQ3NTdkMjAx'
                },
                body: JSON.stringify(message)
            })
                .then(result => {
                    // success
                })
                .catch(error => {
                    // error
                    // console.error(error.message)
                })
        }
    },
    created() {
        var vm = this

        var uri = window.location.search.substring(1)
        var params = new URLSearchParams(uri)

        // check for id and switch to edit mode
        if (params.has('id')) {
            vm.movie.id = params.get('id')
        }
    }
})