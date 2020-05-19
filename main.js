$(function () {
	var googleSheet = 'https://spreadsheets.google.com/feeds/list/1QrEHAN4o6dQe4PqCXg5_AkQ8u_j1nqt1GCpz90Lv5g4/od6/public/values?alt=json',
		template = $('#movie-template').html(),
		$movieList = $('.js-movies'),
		$movieCards = $('.js-movie-card'),
		$filterBtn = $('.js-filter-btn'),
		$filterPanel = $('.js-filter-panel'),
		$sortOptions = $('.js-sort'),
		$searchField = $('.js-search'),
		$count = $('.js-count'),
		$randomBtn = $('.js-random');

	$.getJSON(googleSheet, function (data) {
		// get json data from google sheets
		movies = data.feed.entry;

		// render the list with Handlebars
		var templateScript = Handlebars.compile(template);

		Handlebars.registerHelper('eq', function () {
			const args = Array.prototype.slice.call(arguments, 0, -1);
			return args.every(function (expression) {
				return args[0] === expression;
			});
		});

		$movieList.html(templateScript({ movies: movies }));

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
		$cards.attr('data-random-hidden', true).hide().eq(random).show().removeAttr('data-random-hidden');

		updateCount();

		resetStates();
	};

	var searchMovies = function () {
		var searchTerm = $searchField.val().toLowerCase();

		// remove data-random-hidden attribute because we are performing a new search
		$('.movie-card[data-random-hidden]').removeAttr('data-random-hidden');

		$movieList.find('.movie-card').filter(function () {
			return $(this).find('.movie-card-title').text().toLowerCase().indexOf(searchTerm) > -1;
		}).show().end().filter(':visible').filter(function () {
			return $(this).find('.movie-card-title').text().toLowerCase().indexOf(searchTerm) === -1;
		}).hide();

		updateCount();

		resetStates();
	}

	var resetStates = function () {
		$('.movie-card').removeClass('active').blur();
		$movieList.removeClass('card-expanded');
	};

	var updateCount = function () {
		$count.text($movieList.find('.movie-card:visible').length);
	};

	$filterBtn.on('click', function () {
		$filterPanel.toggleClass('active');
	});

	$sortOptions.on('change', sortMovies);

	$searchField.on('input', searchMovies);

	$randomBtn.on('click', randomMovie);

	$movieList.on('click keypress', '.movie-card', function (e) {
		if (e.type === 'click' || (e.type === 'keypress' && e.keyCode === 13)) {
			$('.movie-card').not(this).removeClass('active');

			if ($(this).hasClass('active')) {
				resetStates();
			} else {
				$(this).addClass('active');
				$movieList.addClass('card-expanded');
			}
		}
	});
});