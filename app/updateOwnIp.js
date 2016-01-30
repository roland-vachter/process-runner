"use strict";

const env = require('../env');
const needle = require('needle');
const ipify = require('ipify');
const randomstring = require("randomstring");
const crypto = require('./utils/crypto');

let ownIp = null;
let ownAddress = null;
let readOnlyApiKey = null;
let adminApiKey = null;


let initialized = false;
exports.init = function () {
	if (!initialized) {
		initialized = true;

		setInterval(regenerateApiKeys, 60 * 60 * 1000);
		regenerateApiKeys();

		setInterval(updateOwnIp, 30000);
		updateOwnIp();
	}
};

function updateOwnIp() {
	ipify((err, ip) => {
		if (!err && ip) {
			console.log('register');
			ownIp = ip;

			ownAddress = env.inDevMode ? 'http://localhost:3000' : 'http://' + ip + ':3000';

			needle.post(env.registryAddress, {
				address: ownAddress,
				readOnlyApiKey: crypto.encrypt(readOnlyApiKey),
				adminApiKey: crypto.encrypt(adminApiKey)
			}, {
				headers: {
					API_KEY: env.apiKeys.registry
				}
			});
		}
	});
}




function regenerateApiKeys () {
	readOnlyApiKey = randomstring.generate(Math.round(Math.random() * 10) + 25);
	adminApiKey = randomstring.generate(Math.round(Math.random() * 10) + 25);
}





exports.getIp = function () {
	return ownIp;
};

exports.getAddress = function () {
	return ownAddress;
};

exports.getReadOnlyApiKey = function () {
	return readOnlyApiKey;
};

exports.getAdminApiKey = function () {
	return adminApiKey;
};
