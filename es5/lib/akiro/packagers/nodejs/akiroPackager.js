"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var AkiroPackager = (function () {
	function AkiroPackager(event, context) {
		_classCallCheck(this, AkiroPackager);

		this.temp = context.temp || _temp2["default"];
		this.npmPath = context.npmPath || "./node_modules/npm";
	}

	_createClass(AkiroPackager, [{
		key: "invoke",
		value: function invoke(event, context) {
			var _this = this;

			_flowsync2["default"].waterfall([function (done) {
				_this.temp.mkdir("akiroPackager", done);
			}, function (temporaryDirectoryPath, done) {
				var temporaryNpmPath = temporaryDirectoryPath + "/node_modules/npm";
				_fsExtra2["default"].copy(_this.npmPath, temporaryNpmPath, done);
			}], function (error) {
				if (error) {
					context.fail(error);
				} else {
					context.succeed();
				}
			});
		}
	}]);

	return AkiroPackager;
})();

exports["default"] = AkiroPackager;
module.exports = exports["default"];