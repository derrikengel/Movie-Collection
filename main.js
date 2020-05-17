$(function () {
	var googleSheet = 'https://spreadsheets.google.com/feeds/list/1QrEHAN4o6dQe4PqCXg5_AkQ8u_j1nqt1GCpz90Lv5g4/od6/public/values?alt=json',
		template = $('#movie-template').html(),
		$movieList = $('.js-movies'),
		$movieCards = $('.js-movie-card'),
		$sortOptions = $('.js-sort'),
		$searchField = $('.js-search'),
		$count = $('.js-count'),
		$randomBtn = $('.js-random');

	$.getJSON(googleSheet, function (data) {
		// get json data from google sheets
		movies = data.feed.entry;

		// generate an index for each item
		for (i in movies) {
			movies[i].index = i;
		}

		// render the list with mustache
		$movieList.html(Mustache.render(template, { movies: movies }));

		sortMovies();

		updateCount();
	});

	var sortMovies = function () {
		var $cards = $movieList.find('.movie-card');

		if ($sortOptions.val() == 'recent') {
			// sort by 'acquired' data attribute
			$cards.sort(function (a, b) {
				// send empty values to the end
				if (!$(a).data('acquired')) return 1
				if (!$(b).data('acquired')) return -1
				return new Date($(b).data('acquired')) - new Date($(a).data('acquired'));
			}).appendTo($movieList);
		} else {
			// sort by 'id' data attribute
			$cards.sort(function (a, b) {
				return ($(b).data('id')) < ($(a).data('id')) ? 1 : -1;
			}).appendTo($movieList);
		}
	};

	var randomMovie = function () {
		var $cards = $movieList.find('.movie-card:visible, .movie-card[data-random-hidden]');
		var random = Math.floor(Math.random() * $cards.length);

		// add data attribute to keep trach of which items were hidden with randomize
		// so randomize works multiples times with filtered results
		$cards.attr('data-random-hidden', true).hide().eq(random).show();

		updateCount();
	};

	var searchMovies = function () {
		var searchTerm = $searchField.val().toLowerCase();

		$movieList.find('.movie-card').filter(function () {
			return $(this).find('.movie-card-title').text().toLowerCase().indexOf(searchTerm) > -1;
		}).show().end().filter(':visible').filter(function () {
			return $(this).find('.movie-card-title').text().toLowerCase().indexOf(searchTerm) === -1;
		}).hide();

		updateCount();
	}

	var updateCount = function () {
		$count.text($movieList.find('.movie-card:visible').length);
	};

	$sortOptions.on('change', sortMovies);

	$searchField.on('input', searchMovies);

	$randomBtn.on('click', randomMovie);

	$movieList.on('click', '.movie-card', function () {
		$(this).blur();
	});
});