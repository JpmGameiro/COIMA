'use strict'

const Actor = require('./model/Actor')
const CastMember = require('./model/CastMember')
const Director = require('./model/Director')
const Movie = require('./model/Movie')
const MovieListItem = require('./model/MovieListItem')
const MovieList = require('./model/MovieList')
const User = require('./model/User')
const UserList = require('./model/UserList')
const Comment = require('./model/Comment')

/**
 * Maps movie search json object to a movie list container
 * @param {Object} movieList
 * @param {string} query
 * @returns {MovieList} MovieList
 */
function mapToMovieList(movieList, query) {
	return new MovieList(
		query,
		movieList.results.map(item => new MovieListItem(
			item.title,
			item.id,
			item.release_date,
			item.poster_path,
			item.vote_average
		)),
		movieList.page,
		movieList.total_pages,
		movieList.total_results
	)
}

/**
 * Maps user json object to User entity
 * @param {Object} json
 * @returns {User} User
 */
function mapToUser(json) {
	return new User(
		json.username,
		json.password,
		json.fullName,
		json.email,
		json.lists,
		json.commentedOn,
		json._rev
	)
}

/**
 * Maps json list object to UserList entity
 * @param {Object} json
 * @returns {UserList} UserList
 */
function mapToUserList(json) {
	return new UserList(
		json.listName,
        json.listProtection,
		json.listDesc,
		json.owner,
		json.items,
		json._rev,
		json._id,
		json.guests
	)
}

/**
 * Maps filmography of an actor to array of MovieList
 * @param {Object} json
 * @returns {Array<MovieListItem>} Filmography
 */
function mapToFilmography(json) {
	return json.map(
		item => new MovieListItem(
			item.title,
			item.id,
			item.release_date,
			item.poster_path,
			item.vote_average
		)
	)
}

/**
 * Maps json movie object to Movie entity
 * @param {Object} json
 * @returns {Movie} Movie
 */
function mapToMovie(json) {
	return new Movie(
		json.tagline,
		json.id,
		json.original_title,
		json.overview,
		json.release_date,
		json.vote_average,
		json.poster_path,
		json.genres.map(item => item.name).join(' / ')
	)
}

/**
 * Maps crew json array to array of Director entity
 * @param {Object} crew
 * @returns {Array<Director>} Director Array
 */
function mapToDirector(crew) {
	return crew
		.filter(crewMember => crewMember.job === 'Director')
		.map(director => new Director(
			director.name,
			director.id,
			director.profile_path
		))
}

/**
 * Maps cast json array to array of CastMember entity
 * @param {Object} cast
 * @returns {Array<CastMember>} CastMember Array
 */
function mapToCastMember(cast) {
	return cast
		.map(castMember =>
			new CastMember(
				castMember.name,
				castMember.id,
				castMember.character,
				castMember.profile_path
			)
		)
}

/**
 * Maps json actor to Actor entity
 * @param {Object} json
 * @returns {Actor} Actor
 */
function mapToActor(json) {
	return new Actor(
		json.biography,
		json.birthday,
		json.deathday,
		json.id,
		json.name,
		json.popularity,
		json.profile_path
	)
}

/**
 * Maps json to Comment entity
 * @param {Object} json
 * @returns {Comment} Comment
 */
function mapToComment(json) {
	return new Comment(
		json.id,
		json.movieId,
		json.movieName,
		json.author,
		json.text,
		json.replies
	)
}

module.exports = {
	mapToActor,
	mapToCastMember,
	mapToDirector,
	mapToMovie,
	mapToMovieList,
	mapToFilmography,
	mapToUser,
	mapToUserList,
	mapToComment
}