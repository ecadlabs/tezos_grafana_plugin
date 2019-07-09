define(["app/plugins/sdk"], function(__WEBPACK_EXTERNAL_MODULE_grafana_app_plugins_sdk__) { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./module.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./datasource.ts":
/*!***********************!*\
  !*** ./datasource.ts ***!
  \***********************/
/*! exports provided: GenericDatasource */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GenericDatasource", function() { return GenericDatasource; });
/* harmony import */ var _rpc__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./rpc */ "./rpc.ts");
/* harmony import */ var _queries_account__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./queries/account */ "./queries/account.ts");
/* harmony import */ var _queries_block__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./queries/block */ "./queries/block.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};



var GenericDatasource = /** @class */ (function () {
    function GenericDatasource(instanceSettings, backendSrv, templateSrv) {
        this.templateSrv = templateSrv;
        this.type = instanceSettings.type;
        this.url = instanceSettings.jsonData.rpcURL;
        this.name = instanceSettings.name;
        this.backendSrv = backendSrv;
        this.rpc = new _rpc__WEBPACK_IMPORTED_MODULE_0__["RPCClient"](this.url, this.backendSrv);
    }
    GenericDatasource.prototype.prepareQueryTarget = function (target, options) {
        // Replace grafana variables
        var interpolated = this.templateSrv.replace(target, options.scopedVars, 'pipe');
        return interpolated;
    };
    GenericDatasource.prototype.query = function (options) {
        var _this = this;
        var q = options.targets.map(function (target) {
            var queryType = target.queryType;
            var subQueryType = target.subQueryType;
            var returnedQuery = null;
            switch (queryType) {
                case 'account':
                    var query = _queries_account__WEBPACK_IMPORTED_MODULE_1__["queries"].find(function (x) { return x.query_type == subQueryType; });
                    if (query) {
                        returnedQuery = new query().query(_this.rpc, _this.prepareQueryTarget(target.address, options));
                    }
                case 'block':
                    var blockQuery = _queries_block__WEBPACK_IMPORTED_MODULE_2__["blockQueries"].find(function (x) { return x.query_type == subQueryType; });
                    if (blockQuery) {
                        returnedQuery = new blockQuery().query(_this.rpc);
                    }
            }
            if (!returnedQuery) {
                throw new Error('Unsupported query');
            }
            return returnedQuery.then(function (x) {
                if (Array.isArray(x)) {
                    return x.map(function (y) {
                        return __assign({}, y, { target: target.target });
                    });
                }
                return [
                    __assign({}, x, { target: target.target })
                ];
            });
        });
        return Promise.all(q).then(function (results) {
            return { data: results.reduce(function (prev, x) { return prev.concat(x); }, []) };
        });
    };
    GenericDatasource.prototype.testDatasource = function () {
        return this.rpc.head().then(function (response) {
            return {
                status: 'success',
                message: 'Data source is working',
                title: 'Success'
            };
        });
    };
    GenericDatasource.prototype.annotationQuery = function () { };
    GenericDatasource.prototype.metricFindQuery = function () { };
    return GenericDatasource;
}());



/***/ }),

/***/ "./module.ts":
/*!*******************!*\
  !*** ./module.ts ***!
  \*******************/
/*! exports provided: Datasource, QueryCtrl, ConfigCtrl, AnnotationsQueryCtrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ConfigCtrl", function() { return TezosConfigCtrl; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AnnotationsQueryCtrl", function() { return TezosAnnotationsQueryCtrl; });
/* harmony import */ var _datasource__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./datasource */ "./datasource.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Datasource", function() { return _datasource__WEBPACK_IMPORTED_MODULE_0__["GenericDatasource"]; });

/* harmony import */ var _query_ctrl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./query_ctrl */ "./query_ctrl.ts");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "QueryCtrl", function() { return _query_ctrl__WEBPACK_IMPORTED_MODULE_1__["TezosQueryCtrl"]; });



var TezosAnnotationsQueryCtrl = /** @class */ (function () {
    function TezosAnnotationsQueryCtrl() {
    }
    TezosAnnotationsQueryCtrl.templateUrl = 'partials/annotations.editor.html';
    return TezosAnnotationsQueryCtrl;
}());
var TezosConfigCtrl = /** @class */ (function () {
    /** @ngInject */
    function TezosConfigCtrl($scope) {
        this.current.jsonData = this.current.jsonData || {};
    }
    TezosConfigCtrl.templateUrl = 'partials/config.html';
    return TezosConfigCtrl;
}());



/***/ }),

/***/ "./queries/account.ts":
/*!****************************!*\
  !*** ./queries/account.ts ***!
  \****************************/
/*! exports provided: queries */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "queries", function() { return queries; });
/* harmony import */ var _response_parser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../response_parser */ "./response_parser.ts");

var AccountBalanceQuery = /** @class */ (function () {
    function AccountBalanceQuery() {
    }
    AccountBalanceQuery.prototype.query = function (rpc, address) {
        return rpc
            .balance(address)
            .then(function (x) { return Number(x) / 1000000; })
            .then(_response_parser__WEBPACK_IMPORTED_MODULE_0__["parseNumber"]);
    };
    AccountBalanceQuery.query_type = 'balance';
    AccountBalanceQuery.display_name = 'Balance';
    return AccountBalanceQuery;
}());
var AccountCounterQuery = /** @class */ (function () {
    function AccountCounterQuery() {
    }
    AccountCounterQuery.prototype.query = function (rpc, address) {
        return rpc
            .contract(address)
            .then(function (_a) {
            var counter = _a.counter;
            return counter;
        })
            .then(_response_parser__WEBPACK_IMPORTED_MODULE_0__["parseNumber"]);
    };
    AccountCounterQuery.query_type = 'counter';
    AccountCounterQuery.display_name = 'Counter';
    return AccountCounterQuery;
}());
var AccountManagerQuery = /** @class */ (function () {
    function AccountManagerQuery() {
    }
    AccountManagerQuery.prototype.query = function (rpc, address) {
        return rpc
            .contract(address)
            .then(function (_a) {
            var manager = _a.manager;
            return manager;
        })
            .then(_response_parser__WEBPACK_IMPORTED_MODULE_0__["parseString"]);
    };
    AccountManagerQuery.query_type = 'manager';
    AccountManagerQuery.display_name = 'Manager';
    return AccountManagerQuery;
}());
var queries = [
    AccountBalanceQuery,
    AccountCounterQuery,
    AccountManagerQuery
];


/***/ }),

/***/ "./queries/block.ts":
/*!**************************!*\
  !*** ./queries/block.ts ***!
  \**************************/
/*! exports provided: blockQueries */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "blockQueries", function() { return blockQueries; });
/* harmony import */ var _response_parser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../response_parser */ "./response_parser.ts");

var BlockLevelQuery = /** @class */ (function () {
    function BlockLevelQuery() {
    }
    BlockLevelQuery.prototype.query = function (rpc) {
        return rpc
            .head()
            .then(function (_a) {
            var level = _a.header.level;
            return level;
        })
            .then(_response_parser__WEBPACK_IMPORTED_MODULE_0__["parseNumber"]);
    };
    BlockLevelQuery.query_type = 'level';
    BlockLevelQuery.display_name = 'Level';
    return BlockLevelQuery;
}());
var BlockCycleQuery = /** @class */ (function () {
    function BlockCycleQuery() {
    }
    BlockCycleQuery.prototype.query = function (rpc) {
        return rpc
            .head()
            .then(function (_a) {
            var cycle = _a.metadata.level.cycle;
            return cycle;
        })
            .then(_response_parser__WEBPACK_IMPORTED_MODULE_0__["parseNumber"]);
    };
    BlockCycleQuery.query_type = 'current_cycle';
    BlockCycleQuery.display_name = 'Cycle';
    return BlockCycleQuery;
}());
var BlockTimeCycleEndQuery = /** @class */ (function () {
    function BlockTimeCycleEndQuery() {
    }
    BlockTimeCycleEndQuery.prototype.query = function (rpc) {
        return rpc.context().then(function (_a) {
            var blocks_per_cycle = _a.blocks_per_cycle;
            return rpc
                .head()
                .then(function (_a) {
                var cycle_position = _a.metadata.level.cycle_position;
                return (Number(blocks_per_cycle) - cycle_position) * 60 * 1000;
            })
                .then(_response_parser__WEBPACK_IMPORTED_MODULE_0__["parseNumber"]);
        });
    };
    BlockTimeCycleEndQuery.query_type = 'time_until_cycle_end';
    BlockTimeCycleEndQuery.display_name = 'Time until cycle end';
    return BlockTimeCycleEndQuery;
}());
var BlockVotingPeriodEndQuery = /** @class */ (function () {
    function BlockVotingPeriodEndQuery() {
    }
    BlockVotingPeriodEndQuery.prototype.query = function (rpc) {
        return rpc.context().then(function (_a) {
            var blocks_per_voting_period = _a.blocks_per_voting_period;
            return rpc
                .head()
                .then(function (_a) {
                var voting_period_position = _a.metadata.level.voting_period_position;
                return ((Number(blocks_per_voting_period) - voting_period_position) *
                    60 *
                    1000);
            })
                .then(_response_parser__WEBPACK_IMPORTED_MODULE_0__["parseNumber"]);
        });
    };
    BlockVotingPeriodEndQuery.query_type = 'time_until_voting_end';
    BlockVotingPeriodEndQuery.display_name = 'Time until voting period end';
    return BlockVotingPeriodEndQuery;
}());
var BlockTimestampQuery = /** @class */ (function () {
    function BlockTimestampQuery() {
    }
    BlockTimestampQuery.prototype.query = function (rpc) {
        return rpc
            .head()
            .then(function (_a) {
            var timestamp = _a.header.timestamp;
            var ts = new Date(timestamp);
            return Math.abs(new Date() - ts);
        })
            .then(_response_parser__WEBPACK_IMPORTED_MODULE_0__["parseNumber"]);
    };
    BlockTimestampQuery.query_type = 'timestamp';
    BlockTimestampQuery.display_name = 'Time since last block';
    return BlockTimestampQuery;
}());
var BlockVotingPeriodKindQuery = /** @class */ (function () {
    function BlockVotingPeriodKindQuery() {
    }
    BlockVotingPeriodKindQuery.prototype.query = function (rpc) {
        return rpc
            .head()
            .then(function (_a) {
            var voting_period_kind = _a.metadata.voting_period_kind;
            return voting_period_kind.replace('testing_vote', 'exploration_vote');
        })
            .then(_response_parser__WEBPACK_IMPORTED_MODULE_0__["parseString"]);
    };
    BlockVotingPeriodKindQuery.query_type = 'voting_period_kind';
    BlockVotingPeriodKindQuery.display_name = 'Voting Period Kind';
    return BlockVotingPeriodKindQuery;
}());
var BlockLatestBakerQuery = /** @class */ (function () {
    function BlockLatestBakerQuery() {
    }
    BlockLatestBakerQuery.prototype.query = function (rpc) {
        return rpc
            .head()
            .then(function (_a) {
            var baker = _a.metadata.baker;
            return baker;
        })
            .then(_response_parser__WEBPACK_IMPORTED_MODULE_0__["parseString"]);
    };
    BlockLatestBakerQuery.query_type = 'latest_baker';
    BlockLatestBakerQuery.display_name = 'Latest Baker';
    return BlockLatestBakerQuery;
}());
var BlockVotingPeriodQuery = /** @class */ (function () {
    function BlockVotingPeriodQuery() {
    }
    BlockVotingPeriodQuery.prototype.query = function (rpc) {
        return rpc
            .head()
            .then(function (_a) {
            var voting_period = _a.metadata.level.voting_period;
            return voting_period;
        })
            .then(_response_parser__WEBPACK_IMPORTED_MODULE_0__["parseNumber"]);
    };
    BlockVotingPeriodQuery.query_type = 'voting_period';
    BlockVotingPeriodQuery.display_name = 'Voting Period';
    return BlockVotingPeriodQuery;
}());
var BlockBakingRightQuery = /** @class */ (function () {
    function BlockBakingRightQuery() {
    }
    BlockBakingRightQuery.prototype.query = function (rpc) {
        return rpc.backingRight().then(function (rights) {
            return rights.map(function (x) {
                return { datapoints: [[x.delegate, Date.now()]] };
            });
        });
    };
    BlockBakingRightQuery.query_type = 'baking_rights';
    BlockBakingRightQuery.display_name = 'Baking rights';
    return BlockBakingRightQuery;
}());
var BlockNumberOfOpsQuery = /** @class */ (function () {
    function BlockNumberOfOpsQuery() {
    }
    BlockNumberOfOpsQuery.prototype.query = function (rpc) {
        return rpc
            .head()
            .then(function (_a) {
            var operations = _a.operations;
            return (operations || []).reduce(function (prevSum, op) {
                return (prevSum +
                    op.reduce(function (prev, subOp) {
                        return prev + subOp.contents.length;
                    }, 0));
            }, 0);
        })
            .then(_response_parser__WEBPACK_IMPORTED_MODULE_0__["parseNumber"]);
    };
    BlockNumberOfOpsQuery.query_type = 'number_of_ops';
    BlockNumberOfOpsQuery.display_name = 'Number of operations';
    return BlockNumberOfOpsQuery;
}());
var BlockVolumeQuery = /** @class */ (function () {
    function BlockVolumeQuery() {
    }
    BlockVolumeQuery.prototype.query = function (rpc) {
        return rpc
            .head()
            .then(function (_a) {
            var operations = _a.operations;
            return (operations || []).reduce(function (prevSum, op) {
                return (prevSum +
                    op.reduce(function (prev, subOp) {
                        return (prev +
                            subOp.contents
                                .filter(function (x) { return x.kind === 'transaction'; })
                                .reduce(function (prevAmount, x) { return prevAmount + Number(x.amount) / 1000000; }, 0));
                    }, 0));
            }, 0);
        })
            .then(_response_parser__WEBPACK_IMPORTED_MODULE_0__["parseNumber"]);
    };
    BlockVolumeQuery.query_type = 'volume';
    BlockVolumeQuery.display_name = 'Volume';
    return BlockVolumeQuery;
}());
var blockQueries = [
    BlockLevelQuery,
    BlockCycleQuery,
    BlockTimestampQuery,
    BlockVotingPeriodQuery,
    BlockTimeCycleEndQuery,
    BlockVotingPeriodKindQuery,
    BlockLatestBakerQuery,
    BlockNumberOfOpsQuery,
    BlockVolumeQuery,
    BlockVotingPeriodEndQuery,
    BlockBakingRightQuery
];


/***/ }),

/***/ "./query_ctrl.ts":
/*!***********************!*\
  !*** ./query_ctrl.ts ***!
  \***********************/
/*! exports provided: TezosQueryCtrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TezosQueryCtrl", function() { return TezosQueryCtrl; });
/* harmony import */ var grafana_app_plugins_sdk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! grafana/app/plugins/sdk */ "grafana/app/plugins/sdk");
/* harmony import */ var grafana_app_plugins_sdk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(grafana_app_plugins_sdk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _queries_account__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./queries/account */ "./queries/account.ts");
/* harmony import */ var _queries_block__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./queries/block */ "./queries/block.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();



var TezosQueryCtrl = /** @class */ (function (_super) {
    __extends(TezosQueryCtrl, _super);
    /** @ngInject **/
    function TezosQueryCtrl($scope, $injector) {
        var _this = _super.call(this, $scope, $injector) || this;
        _this.accountSubQueryTypes = _queries_account__WEBPACK_IMPORTED_MODULE_1__["queries"].map(function (_a) {
            var display_name = _a.display_name, query_type = _a.query_type;
            return ({
                value: query_type,
                text: display_name
            });
        });
        _this.blockSubQueryTypes = _queries_block__WEBPACK_IMPORTED_MODULE_2__["blockQueries"].map(function (_a) {
            var display_name = _a.display_name, query_type = _a.query_type;
            return ({
                value: query_type,
                text: display_name
            });
        });
        _this.queryTypes = [
            { value: 'block', text: 'Block', defaults: _queries_block__WEBPACK_IMPORTED_MODULE_2__["blockQueries"] },
            { value: 'account', text: 'Account', defaults: _queries_account__WEBPACK_IMPORTED_MODULE_1__["queries"] }
        ];
        _this.onSave();
        return _this;
    }
    TezosQueryCtrl.prototype.onSave = function () {
        var _this = this;
        if (!this.target.queryType) {
            this.target.queryType = 'block';
        }
        if (!this.target.subQueryType) {
            this.target.subQueryType = this.queryTypes.find(function (x) { return x.value === _this.target.queryType; }).defaults[0].query_type;
        }
        this.panelCtrl.refresh();
    };
    Object.defineProperty(TezosQueryCtrl.prototype, "subQueryTypes", {
        get: function () {
            switch (this.target.queryType) {
                case 'account':
                    return this.accountSubQueryTypes;
                default:
                    return this.blockSubQueryTypes;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TezosQueryCtrl.prototype, "showAccount", {
        get: function () {
            return this.target && this.target.queryType === 'account';
        },
        enumerable: true,
        configurable: true
    });
    TezosQueryCtrl.templateUrl = 'partials/query.editor.html';
    return TezosQueryCtrl;
}(grafana_app_plugins_sdk__WEBPACK_IMPORTED_MODULE_0__["QueryCtrl"]));



/***/ }),

/***/ "./response_parser.ts":
/*!****************************!*\
  !*** ./response_parser.ts ***!
  \****************************/
/*! exports provided: parseNumber, parseString */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseNumber", function() { return parseNumber; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "parseString", function() { return parseString; });
function parseNumber(data) {
    return { datapoints: [[Number(data), Date.now()]] };
}
function parseString(data) {
    return { datapoints: [[data, Date.now()]] };
}


/***/ }),

/***/ "./rpc.ts":
/*!****************!*\
  !*** ./rpc.ts ***!
  \****************/
/*! exports provided: RPCClient */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RPCClient", function() { return RPCClient; });
var RPCClient = /** @class */ (function () {
    function RPCClient(baseUrl, backend) {
        this.baseUrl = baseUrl;
        this.backend = backend;
        this.rpcHeadEndpoint = '/chains/main/blocks/head';
        this.rpcBalanceEndpoint = '/chains/main/blocks/head/context/contracts/%s/balance';
        this.rpcContractEndpoint = '/chains/main/blocks/head/context/contracts/%s';
        this.rpcContextEndpoint = '/chains/main/blocks/head/context/constants';
        this.rpcBakingRightsEndpoint = '/chains/main/blocks/head/helpers/baking_rights';
        this.cache = new Map();
    }
    RPCClient.prototype.contract = function (pkh) {
        return this.doRequest({
            url: this.baseUrl + this.rpcContractEndpoint.replace('%s', pkh),
            method: 'GET'
        }).then(function (_a) {
            var data = _a.data;
            return data;
        });
    };
    RPCClient.prototype.balance = function (pkh) {
        return this.doRequest({
            url: this.baseUrl + this.rpcBalanceEndpoint.replace('%s', pkh),
            method: 'GET'
        }).then(function (_a) {
            var data = _a.data;
            return data;
        });
    };
    RPCClient.prototype.head = function () {
        return this.doRequest({
            url: this.baseUrl + this.rpcHeadEndpoint,
            method: 'GET'
        }).then(function (_a) {
            var data = _a.data;
            return data;
        });
    };
    RPCClient.prototype.backingRight = function () {
        return this.doRequest({
            url: this.baseUrl + this.rpcBakingRightsEndpoint,
            method: 'GET'
        }).then(function (_a) {
            var data = _a.data;
            return data;
        });
    };
    RPCClient.prototype.context = function () {
        return this.doRequest({
            url: this.baseUrl + this.rpcContextEndpoint,
            method: 'GET'
        }).then(function (_a) {
            var data = _a.data;
            return data;
        });
    };
    RPCClient.prototype.hasOption = function (options) {
        var lastOption = this.cache.get(options);
        var now = new Date();
        return (lastOption && lastOption.timestamp && now - lastOption.timestamp < 5000 // Cache for 5 seconds
        );
    };
    RPCClient.prototype.doRequest = function (options) {
        if (!this.hasOption(options.url)) {
            this.cache.set(options.url, {
                result: this.backend.datasourceRequest(options),
                timestamp: new Date()
            });
        }
        return this.cache.get(options.url).result;
    };
    return RPCClient;
}());



/***/ }),

/***/ "grafana/app/plugins/sdk":
/*!**********************************!*\
  !*** external "app/plugins/sdk" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_grafana_app_plugins_sdk__;

/***/ })

/******/ })});;
//# sourceMappingURL=module.js.map