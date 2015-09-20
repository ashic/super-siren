import Promise from 'bluebird';
import Immutable from 'immutable';
import SirenLink from './SirenLink';
import _ from 'lodash';
import superagent from 'superagent';
var request = require('superagent-promise')(superagent, Promise);

superagent.parse['application/vnd.siren+json'] = (res) => Siren.fromJson(JSON.parse(res));

class Siren extends Immutable.Record({
	classes: Immutable.Set(),
	properties: Immutable.Map(),
	entities: Immutable.Map(),
	actions: Immutable.Map(),
	links: Immutable.Map()
}) {
	constructor(args) {
		if (!args && empty) {
			return empty;
		}
		else {
			super(args);
		}
	}

	/**
	 * Parses a JSON representation of a Siren entity
	 * and returns the Siren representation.
	 * @param {Object} [obj] The JSON object to be parsed as Siren
	 * @return {Siren} Parsed Siren entity
	 */
	static fromJson(obj) {
		return empty.withMutations(map => {
			map.set('classes', map.classes.union(obj.class ? Immutable.fromJS(obj.class) : new Immutable.List()));

			for (var key in obj.properties) {
				map.set('properties', map.properties.set(key, obj.properties[key]));
			}

			map.set('links',
				new Immutable.Map(_.flatten(
					_.map(obj.links, (item) => new SirenLink(item.rel, item.href))
					.map(link => _.map(link.rels.toJS(), rel => [rel, link]))
				))
			);
		});
	}

	/**
	 * Returns an empty siren representation.  This Siren entity
	 * contains no afforances.
	 * @return {Siren} Empty siren structure
	 */
	static get empty() {
		return empty;
	}

	/**
	 * Returns a Superagent Promise instance which will perform an HTTP Get against
	 * the provided href returning the response as a SuperAgent response.
	 * If the response is Siren ('application/vnd.siren+json'),
	 * then the body should be a Siren instance.
	 *
	 * @param {String} href The URL to perform an HTTP get against
	 * @return {superagent-promise} Superagent Promise Object
	 */
	static get(href) {
		return request.get(href);
	}
}

var empty = new Siren();

module.exports = Siren;