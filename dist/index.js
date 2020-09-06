module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 2932:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

const core = __webpack_require__(2186);
const github = __webpack_require__(5438);
const pkgReader = __webpack_require__(4366);
const fs = __webpack_require__(5747);
const { manifestContentMaker } = __webpack_require__(3463);
const FileType = __webpack_require__(4930);

const main = async () => {
  const [repoOwner, repoName] = process.env.GITHUB_REPOSITORY.split("/");

  const tagName = github.context.ref;

  const tag = tagName.replace("refs/tags/", "");

  const ipaPath = core.getInput("ipaPath");

  const fileName = ipaPath.split(".")[0];

  const uploadUrl = `https://github.com/${repoOwner}/${repoName}/releases/download/${tag}`;

  const iconPath = fileName + ".png";
  const manifestPath = fileName + ".plist";

  console.log((await uploadFile(ipaPath)).data.value);

  const data = new pkgReader(ipaPath, "ipa", { withIcon: true });
  data.parse((err, pkgInfo) => {
    if (err) {
      console.error(err);
    } else {
      console.log(uploadUrl);
      fs.writeFile(iconPath, pkgInfo.icon.split(";base64,").pop(), {
        encoding: "base64",
      });
      fs.writeFile(
        manifestPath,
        manifestContentMaker(ipaPath, {
          iconUrl: iconUrl,
          bundleId: pkgInfo.CFBundleIdentifier,
          title: pkgInfo.CFBundleName,
          version: pkgInfo.CFBundleShortVersionString,
        })
      );

      core.setOutput("manifestPath", manifestPath);
    }
  });
};

/**
 *
 * @param {String} filePath
 */
const uploadFile = async (filePath) => {
  const octokit = new github.getOctokit(process.env.GITHUB_TOKEN);
  const [repoOwner, repoName] = process.env.GITHUB_REPOSITORY.split("/");

  const tagName = github.context.ref;

  const tag = tagName.replace("refs/tags/", "");

  const fileName = filePath.split(".")[0].split("/").pop();
  console.log(
    (
      await octokit.repos.getReleaseByTag({
        repoOwner,
        repoName,
        tag,
      })
    ).data
  );

  const data = {
    url: (
      await octokit.repos.getReleaseByTag({
        repoOwner,
        repoName,
        tag,
      })
    ).data.upload_url,
    headers: {
      "content-type": (await FileType.fromFile(filePath)).mime,
      "content-length": fs.statSync(filePath).size,
    },
    name: fileName,
    file: fs.readFileSync(filePath),
  };
  console.log(data);
  return await octokit.repos.uploadReleaseAsset(data);
};

main().catch((e) => {
  core.setFailed(e);
});


/***/ }),

/***/ 3463:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "manifestContentMaker": () => /* binding */ manifestContentMaker
/* harmony export */ });
const manifestContentMaker = (ipaUrl, {iconUrl, bundleId, title, version }) => `
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>items</key>
    <array>
        <dict>
            <key>assets</key>
            <array>
                <dict>
                    <key>kind</key>
                    <string>software-package</string>
                    <key>url</key>
                    <string>${ipaUrl}</string>
                </dict>
                <dict>
                    <key>kind</key>
                    <string>display-image</string>
                    <key>url</key>
                    <string>${iconUrl}</string>
                </dict>
            </array>
            <key>metadata</key>
            <dict>
                <key>bundle-identifier</key>
                <string>${bundleId}</string>
                <key>bundle-version</key>
                <string>${version}</string>
                <key>kind</key>
                <string>software</string>
                <key>subtitle</key>
                <string>HierenLee</string>
                <key>title</key>
                <string>${title}</string>
            </dict>
        </dict>
    </array>
</dict>
</plist>`;


/***/ }),

/***/ 7351:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const os = __importStar(__webpack_require__(2087));
/**
 * Commands
 *
 * Command Format:
 *   ::name key=value,key=value::message
 *
 * Examples:
 *   ::warning::This is the message
 *   ::set-env name=MY_VAR::some value
 */
function issueCommand(command, properties, message) {
    const cmd = new Command(command, properties, message);
    process.stdout.write(cmd.toString() + os.EOL);
}
exports.issueCommand = issueCommand;
function issue(name, message = '') {
    issueCommand(name, {}, message);
}
exports.issue = issue;
const CMD_STRING = '::';
class Command {
    constructor(command, properties, message) {
        if (!command) {
            command = 'missing.command';
        }
        this.command = command;
        this.properties = properties;
        this.message = message;
    }
    toString() {
        let cmdStr = CMD_STRING + this.command;
        if (this.properties && Object.keys(this.properties).length > 0) {
            cmdStr += ' ';
            let first = true;
            for (const key in this.properties) {
                if (this.properties.hasOwnProperty(key)) {
                    const val = this.properties[key];
                    if (val) {
                        if (first) {
                            first = false;
                        }
                        else {
                            cmdStr += ',';
                        }
                        cmdStr += `${key}=${escapeProperty(val)}`;
                    }
                }
            }
        }
        cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
        return cmdStr;
    }
}
/**
 * Sanitizes an input into a string so it can be passed into issueCommand safely
 * @param input input to sanitize into a string
 */
function toCommandValue(input) {
    if (input === null || input === undefined) {
        return '';
    }
    else if (typeof input === 'string' || input instanceof String) {
        return input;
    }
    return JSON.stringify(input);
}
exports.toCommandValue = toCommandValue;
function escapeData(s) {
    return toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A');
}
function escapeProperty(s) {
    return toCommandValue(s)
        .replace(/%/g, '%25')
        .replace(/\r/g, '%0D')
        .replace(/\n/g, '%0A')
        .replace(/:/g, '%3A')
        .replace(/,/g, '%2C');
}
//# sourceMappingURL=command.js.map

/***/ }),

/***/ 2186:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const command_1 = __webpack_require__(7351);
const os = __importStar(__webpack_require__(2087));
const path = __importStar(__webpack_require__(5622));
/**
 * The code to exit an action
 */
var ExitCode;
(function (ExitCode) {
    /**
     * A code indicating that the action was successful
     */
    ExitCode[ExitCode["Success"] = 0] = "Success";
    /**
     * A code indicating that the action was a failure
     */
    ExitCode[ExitCode["Failure"] = 1] = "Failure";
})(ExitCode = exports.ExitCode || (exports.ExitCode = {}));
//-----------------------------------------------------------------------
// Variables
//-----------------------------------------------------------------------
/**
 * Sets env variable for this action and future actions in the job
 * @param name the name of the variable to set
 * @param val the value of the variable. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportVariable(name, val) {
    const convertedVal = command_1.toCommandValue(val);
    process.env[name] = convertedVal;
    command_1.issueCommand('set-env', { name }, convertedVal);
}
exports.exportVariable = exportVariable;
/**
 * Registers a secret which will get masked from logs
 * @param secret value of the secret
 */
function setSecret(secret) {
    command_1.issueCommand('add-mask', {}, secret);
}
exports.setSecret = setSecret;
/**
 * Prepends inputPath to the PATH (for this action and future actions)
 * @param inputPath
 */
function addPath(inputPath) {
    command_1.issueCommand('add-path', {}, inputPath);
    process.env['PATH'] = `${inputPath}${path.delimiter}${process.env['PATH']}`;
}
exports.addPath = addPath;
/**
 * Gets the value of an input.  The value is also trimmed.
 *
 * @param     name     name of the input to get
 * @param     options  optional. See InputOptions.
 * @returns   string
 */
function getInput(name, options) {
    const val = process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] || '';
    if (options && options.required && !val) {
        throw new Error(`Input required and not supplied: ${name}`);
    }
    return val.trim();
}
exports.getInput = getInput;
/**
 * Sets the value of an output.
 *
 * @param     name     name of the output to set
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setOutput(name, value) {
    command_1.issueCommand('set-output', { name }, value);
}
exports.setOutput = setOutput;
/**
 * Enables or disables the echoing of commands into stdout for the rest of the step.
 * Echoing is disabled by default if ACTIONS_STEP_DEBUG is not set.
 *
 */
function setCommandEcho(enabled) {
    command_1.issue('echo', enabled ? 'on' : 'off');
}
exports.setCommandEcho = setCommandEcho;
//-----------------------------------------------------------------------
// Results
//-----------------------------------------------------------------------
/**
 * Sets the action status to failed.
 * When the action exits it will be with an exit code of 1
 * @param message add error issue message
 */
function setFailed(message) {
    process.exitCode = ExitCode.Failure;
    error(message);
}
exports.setFailed = setFailed;
//-----------------------------------------------------------------------
// Logging Commands
//-----------------------------------------------------------------------
/**
 * Gets whether Actions Step Debug is on or not
 */
function isDebug() {
    return process.env['RUNNER_DEBUG'] === '1';
}
exports.isDebug = isDebug;
/**
 * Writes debug message to user log
 * @param message debug message
 */
function debug(message) {
    command_1.issueCommand('debug', {}, message);
}
exports.debug = debug;
/**
 * Adds an error issue
 * @param message error issue message. Errors will be converted to string via toString()
 */
function error(message) {
    command_1.issue('error', message instanceof Error ? message.toString() : message);
}
exports.error = error;
/**
 * Adds an warning issue
 * @param message warning issue message. Errors will be converted to string via toString()
 */
function warning(message) {
    command_1.issue('warning', message instanceof Error ? message.toString() : message);
}
exports.warning = warning;
/**
 * Writes info to log with console.log.
 * @param message info message
 */
function info(message) {
    process.stdout.write(message + os.EOL);
}
exports.info = info;
/**
 * Begin an output group.
 *
 * Output until the next `groupEnd` will be foldable in this group
 *
 * @param name The name of the output group
 */
function startGroup(name) {
    command_1.issue('group', name);
}
exports.startGroup = startGroup;
/**
 * End an output group.
 */
function endGroup() {
    command_1.issue('endgroup');
}
exports.endGroup = endGroup;
/**
 * Wrap an asynchronous function call in a group.
 *
 * Returns the same type as the function itself.
 *
 * @param name The name of the group
 * @param fn The function to wrap in the group
 */
function group(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        startGroup(name);
        let result;
        try {
            result = yield fn();
        }
        finally {
            endGroup();
        }
        return result;
    });
}
exports.group = group;
//-----------------------------------------------------------------------
// Wrapper action state
//-----------------------------------------------------------------------
/**
 * Saves state for current action, the state can only be retrieved by this action's post job execution.
 *
 * @param     name     name of the state to store
 * @param     value    value to store. Non-string values will be converted to a string via JSON.stringify
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function saveState(name, value) {
    command_1.issueCommand('save-state', { name }, value);
}
exports.saveState = saveState;
/**
 * Gets the value of an state set by this action's main execution.
 *
 * @param     name     name of the state to get
 * @returns   string
 */
function getState(name) {
    return process.env[`STATE_${name}`] || '';
}
exports.getState = getState;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 4087:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Context = void 0;
const fs_1 = __webpack_require__(5747);
const os_1 = __webpack_require__(2087);
class Context {
    /**
     * Hydrate the context from the environment
     */
    constructor() {
        this.payload = {};
        if (process.env.GITHUB_EVENT_PATH) {
            if (fs_1.existsSync(process.env.GITHUB_EVENT_PATH)) {
                this.payload = JSON.parse(fs_1.readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' }));
            }
            else {
                const path = process.env.GITHUB_EVENT_PATH;
                process.stdout.write(`GITHUB_EVENT_PATH ${path} does not exist${os_1.EOL}`);
            }
        }
        this.eventName = process.env.GITHUB_EVENT_NAME;
        this.sha = process.env.GITHUB_SHA;
        this.ref = process.env.GITHUB_REF;
        this.workflow = process.env.GITHUB_WORKFLOW;
        this.action = process.env.GITHUB_ACTION;
        this.actor = process.env.GITHUB_ACTOR;
        this.job = process.env.GITHUB_JOB;
        this.runNumber = parseInt(process.env.GITHUB_RUN_NUMBER, 10);
        this.runId = parseInt(process.env.GITHUB_RUN_ID, 10);
    }
    get issue() {
        const payload = this.payload;
        return Object.assign(Object.assign({}, this.repo), { number: (payload.issue || payload.pull_request || payload).number });
    }
    get repo() {
        if (process.env.GITHUB_REPOSITORY) {
            const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
            return { owner, repo };
        }
        if (this.payload.repository) {
            return {
                owner: this.payload.repository.owner.login,
                repo: this.payload.repository.name
            };
        }
        throw new Error("context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'");
    }
}
exports.Context = Context;
//# sourceMappingURL=context.js.map

/***/ }),

/***/ 5438:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getOctokit = exports.context = void 0;
const Context = __importStar(__webpack_require__(4087));
const utils_1 = __webpack_require__(3030);
exports.context = new Context.Context();
/**
 * Returns a hydrated octokit ready to use for GitHub Actions
 *
 * @param     token    the repo PAT or GITHUB_TOKEN
 * @param     options  other options to set
 */
function getOctokit(token, options) {
    return new utils_1.GitHub(utils_1.getOctokitOptions(token, options));
}
exports.getOctokit = getOctokit;
//# sourceMappingURL=github.js.map

/***/ }),

/***/ 7914:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getApiBaseUrl = exports.getProxyAgent = exports.getAuthString = void 0;
const httpClient = __importStar(__webpack_require__(9925));
function getAuthString(token, options) {
    if (!token && !options.auth) {
        throw new Error('Parameter token or opts.auth is required');
    }
    else if (token && options.auth) {
        throw new Error('Parameters token and opts.auth may not both be specified');
    }
    return typeof options.auth === 'string' ? options.auth : `token ${token}`;
}
exports.getAuthString = getAuthString;
function getProxyAgent(destinationUrl) {
    const hc = new httpClient.HttpClient();
    return hc.getAgent(destinationUrl);
}
exports.getProxyAgent = getProxyAgent;
function getApiBaseUrl() {
    return process.env['GITHUB_API_URL'] || 'https://api.github.com';
}
exports.getApiBaseUrl = getApiBaseUrl;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 3030:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getOctokitOptions = exports.GitHub = exports.context = void 0;
const Context = __importStar(__webpack_require__(4087));
const Utils = __importStar(__webpack_require__(7914));
// octokit + plugins
const core_1 = __webpack_require__(6762);
const plugin_rest_endpoint_methods_1 = __webpack_require__(3044);
const plugin_paginate_rest_1 = __webpack_require__(4193);
exports.context = new Context.Context();
const baseUrl = Utils.getApiBaseUrl();
const defaults = {
    baseUrl,
    request: {
        agent: Utils.getProxyAgent(baseUrl)
    }
};
exports.GitHub = core_1.Octokit.plugin(plugin_rest_endpoint_methods_1.restEndpointMethods, plugin_paginate_rest_1.paginateRest).defaults(defaults);
/**
 * Convience function to correctly format Octokit Options to pass into the constructor.
 *
 * @param     token    the repo PAT or GITHUB_TOKEN
 * @param     options  other options to set
 */
function getOctokitOptions(token, options) {
    const opts = Object.assign({}, options || {}); // Shallow clone - don't mutate the object provided by the caller
    // Auth
    const auth = Utils.getAuthString(token, opts);
    if (auth) {
        opts.auth = auth;
    }
    return opts;
}
exports.getOctokitOptions = getOctokitOptions;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ 9925:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const url = __webpack_require__(8835);
const http = __webpack_require__(8605);
const https = __webpack_require__(7211);
const pm = __webpack_require__(6443);
let tunnel;
var HttpCodes;
(function (HttpCodes) {
    HttpCodes[HttpCodes["OK"] = 200] = "OK";
    HttpCodes[HttpCodes["MultipleChoices"] = 300] = "MultipleChoices";
    HttpCodes[HttpCodes["MovedPermanently"] = 301] = "MovedPermanently";
    HttpCodes[HttpCodes["ResourceMoved"] = 302] = "ResourceMoved";
    HttpCodes[HttpCodes["SeeOther"] = 303] = "SeeOther";
    HttpCodes[HttpCodes["NotModified"] = 304] = "NotModified";
    HttpCodes[HttpCodes["UseProxy"] = 305] = "UseProxy";
    HttpCodes[HttpCodes["SwitchProxy"] = 306] = "SwitchProxy";
    HttpCodes[HttpCodes["TemporaryRedirect"] = 307] = "TemporaryRedirect";
    HttpCodes[HttpCodes["PermanentRedirect"] = 308] = "PermanentRedirect";
    HttpCodes[HttpCodes["BadRequest"] = 400] = "BadRequest";
    HttpCodes[HttpCodes["Unauthorized"] = 401] = "Unauthorized";
    HttpCodes[HttpCodes["PaymentRequired"] = 402] = "PaymentRequired";
    HttpCodes[HttpCodes["Forbidden"] = 403] = "Forbidden";
    HttpCodes[HttpCodes["NotFound"] = 404] = "NotFound";
    HttpCodes[HttpCodes["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HttpCodes[HttpCodes["NotAcceptable"] = 406] = "NotAcceptable";
    HttpCodes[HttpCodes["ProxyAuthenticationRequired"] = 407] = "ProxyAuthenticationRequired";
    HttpCodes[HttpCodes["RequestTimeout"] = 408] = "RequestTimeout";
    HttpCodes[HttpCodes["Conflict"] = 409] = "Conflict";
    HttpCodes[HttpCodes["Gone"] = 410] = "Gone";
    HttpCodes[HttpCodes["TooManyRequests"] = 429] = "TooManyRequests";
    HttpCodes[HttpCodes["InternalServerError"] = 500] = "InternalServerError";
    HttpCodes[HttpCodes["NotImplemented"] = 501] = "NotImplemented";
    HttpCodes[HttpCodes["BadGateway"] = 502] = "BadGateway";
    HttpCodes[HttpCodes["ServiceUnavailable"] = 503] = "ServiceUnavailable";
    HttpCodes[HttpCodes["GatewayTimeout"] = 504] = "GatewayTimeout";
})(HttpCodes = exports.HttpCodes || (exports.HttpCodes = {}));
var Headers;
(function (Headers) {
    Headers["Accept"] = "accept";
    Headers["ContentType"] = "content-type";
})(Headers = exports.Headers || (exports.Headers = {}));
var MediaTypes;
(function (MediaTypes) {
    MediaTypes["ApplicationJson"] = "application/json";
})(MediaTypes = exports.MediaTypes || (exports.MediaTypes = {}));
/**
 * Returns the proxy URL, depending upon the supplied url and proxy environment variables.
 * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
 */
function getProxyUrl(serverUrl) {
    let proxyUrl = pm.getProxyUrl(url.parse(serverUrl));
    return proxyUrl ? proxyUrl.href : '';
}
exports.getProxyUrl = getProxyUrl;
const HttpRedirectCodes = [
    HttpCodes.MovedPermanently,
    HttpCodes.ResourceMoved,
    HttpCodes.SeeOther,
    HttpCodes.TemporaryRedirect,
    HttpCodes.PermanentRedirect
];
const HttpResponseRetryCodes = [
    HttpCodes.BadGateway,
    HttpCodes.ServiceUnavailable,
    HttpCodes.GatewayTimeout
];
const RetryableHttpVerbs = ['OPTIONS', 'GET', 'DELETE', 'HEAD'];
const ExponentialBackoffCeiling = 10;
const ExponentialBackoffTimeSlice = 5;
class HttpClientResponse {
    constructor(message) {
        this.message = message;
    }
    readBody() {
        return new Promise(async (resolve, reject) => {
            let output = Buffer.alloc(0);
            this.message.on('data', (chunk) => {
                output = Buffer.concat([output, chunk]);
            });
            this.message.on('end', () => {
                resolve(output.toString());
            });
        });
    }
}
exports.HttpClientResponse = HttpClientResponse;
function isHttps(requestUrl) {
    let parsedUrl = url.parse(requestUrl);
    return parsedUrl.protocol === 'https:';
}
exports.isHttps = isHttps;
class HttpClient {
    constructor(userAgent, handlers, requestOptions) {
        this._ignoreSslError = false;
        this._allowRedirects = true;
        this._allowRedirectDowngrade = false;
        this._maxRedirects = 50;
        this._allowRetries = false;
        this._maxRetries = 1;
        this._keepAlive = false;
        this._disposed = false;
        this.userAgent = userAgent;
        this.handlers = handlers || [];
        this.requestOptions = requestOptions;
        if (requestOptions) {
            if (requestOptions.ignoreSslError != null) {
                this._ignoreSslError = requestOptions.ignoreSslError;
            }
            this._socketTimeout = requestOptions.socketTimeout;
            if (requestOptions.allowRedirects != null) {
                this._allowRedirects = requestOptions.allowRedirects;
            }
            if (requestOptions.allowRedirectDowngrade != null) {
                this._allowRedirectDowngrade = requestOptions.allowRedirectDowngrade;
            }
            if (requestOptions.maxRedirects != null) {
                this._maxRedirects = Math.max(requestOptions.maxRedirects, 0);
            }
            if (requestOptions.keepAlive != null) {
                this._keepAlive = requestOptions.keepAlive;
            }
            if (requestOptions.allowRetries != null) {
                this._allowRetries = requestOptions.allowRetries;
            }
            if (requestOptions.maxRetries != null) {
                this._maxRetries = requestOptions.maxRetries;
            }
        }
    }
    options(requestUrl, additionalHeaders) {
        return this.request('OPTIONS', requestUrl, null, additionalHeaders || {});
    }
    get(requestUrl, additionalHeaders) {
        return this.request('GET', requestUrl, null, additionalHeaders || {});
    }
    del(requestUrl, additionalHeaders) {
        return this.request('DELETE', requestUrl, null, additionalHeaders || {});
    }
    post(requestUrl, data, additionalHeaders) {
        return this.request('POST', requestUrl, data, additionalHeaders || {});
    }
    patch(requestUrl, data, additionalHeaders) {
        return this.request('PATCH', requestUrl, data, additionalHeaders || {});
    }
    put(requestUrl, data, additionalHeaders) {
        return this.request('PUT', requestUrl, data, additionalHeaders || {});
    }
    head(requestUrl, additionalHeaders) {
        return this.request('HEAD', requestUrl, null, additionalHeaders || {});
    }
    sendStream(verb, requestUrl, stream, additionalHeaders) {
        return this.request(verb, requestUrl, stream, additionalHeaders);
    }
    /**
     * Gets a typed object from an endpoint
     * Be aware that not found returns a null.  Other errors (4xx, 5xx) reject the promise
     */
    async getJson(requestUrl, additionalHeaders = {}) {
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        let res = await this.get(requestUrl, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    async postJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.post(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    async putJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.put(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    async patchJson(requestUrl, obj, additionalHeaders = {}) {
        let data = JSON.stringify(obj, null, 2);
        additionalHeaders[Headers.Accept] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.Accept, MediaTypes.ApplicationJson);
        additionalHeaders[Headers.ContentType] = this._getExistingOrDefaultHeader(additionalHeaders, Headers.ContentType, MediaTypes.ApplicationJson);
        let res = await this.patch(requestUrl, data, additionalHeaders);
        return this._processResponse(res, this.requestOptions);
    }
    /**
     * Makes a raw http request.
     * All other methods such as get, post, patch, and request ultimately call this.
     * Prefer get, del, post and patch
     */
    async request(verb, requestUrl, data, headers) {
        if (this._disposed) {
            throw new Error('Client has already been disposed.');
        }
        let parsedUrl = url.parse(requestUrl);
        let info = this._prepareRequest(verb, parsedUrl, headers);
        // Only perform retries on reads since writes may not be idempotent.
        let maxTries = this._allowRetries && RetryableHttpVerbs.indexOf(verb) != -1
            ? this._maxRetries + 1
            : 1;
        let numTries = 0;
        let response;
        while (numTries < maxTries) {
            response = await this.requestRaw(info, data);
            // Check if it's an authentication challenge
            if (response &&
                response.message &&
                response.message.statusCode === HttpCodes.Unauthorized) {
                let authenticationHandler;
                for (let i = 0; i < this.handlers.length; i++) {
                    if (this.handlers[i].canHandleAuthentication(response)) {
                        authenticationHandler = this.handlers[i];
                        break;
                    }
                }
                if (authenticationHandler) {
                    return authenticationHandler.handleAuthentication(this, info, data);
                }
                else {
                    // We have received an unauthorized response but have no handlers to handle it.
                    // Let the response return to the caller.
                    return response;
                }
            }
            let redirectsRemaining = this._maxRedirects;
            while (HttpRedirectCodes.indexOf(response.message.statusCode) != -1 &&
                this._allowRedirects &&
                redirectsRemaining > 0) {
                const redirectUrl = response.message.headers['location'];
                if (!redirectUrl) {
                    // if there's no location to redirect to, we won't
                    break;
                }
                let parsedRedirectUrl = url.parse(redirectUrl);
                if (parsedUrl.protocol == 'https:' &&
                    parsedUrl.protocol != parsedRedirectUrl.protocol &&
                    !this._allowRedirectDowngrade) {
                    throw new Error('Redirect from HTTPS to HTTP protocol. This downgrade is not allowed for security reasons. If you want to allow this behavior, set the allowRedirectDowngrade option to true.');
                }
                // we need to finish reading the response before reassigning response
                // which will leak the open socket.
                await response.readBody();
                // strip authorization header if redirected to a different hostname
                if (parsedRedirectUrl.hostname !== parsedUrl.hostname) {
                    for (let header in headers) {
                        // header names are case insensitive
                        if (header.toLowerCase() === 'authorization') {
                            delete headers[header];
                        }
                    }
                }
                // let's make the request with the new redirectUrl
                info = this._prepareRequest(verb, parsedRedirectUrl, headers);
                response = await this.requestRaw(info, data);
                redirectsRemaining--;
            }
            if (HttpResponseRetryCodes.indexOf(response.message.statusCode) == -1) {
                // If not a retry code, return immediately instead of retrying
                return response;
            }
            numTries += 1;
            if (numTries < maxTries) {
                await response.readBody();
                await this._performExponentialBackoff(numTries);
            }
        }
        return response;
    }
    /**
     * Needs to be called if keepAlive is set to true in request options.
     */
    dispose() {
        if (this._agent) {
            this._agent.destroy();
        }
        this._disposed = true;
    }
    /**
     * Raw request.
     * @param info
     * @param data
     */
    requestRaw(info, data) {
        return new Promise((resolve, reject) => {
            let callbackForResult = function (err, res) {
                if (err) {
                    reject(err);
                }
                resolve(res);
            };
            this.requestRawWithCallback(info, data, callbackForResult);
        });
    }
    /**
     * Raw request with callback.
     * @param info
     * @param data
     * @param onResult
     */
    requestRawWithCallback(info, data, onResult) {
        let socket;
        if (typeof data === 'string') {
            info.options.headers['Content-Length'] = Buffer.byteLength(data, 'utf8');
        }
        let callbackCalled = false;
        let handleResult = (err, res) => {
            if (!callbackCalled) {
                callbackCalled = true;
                onResult(err, res);
            }
        };
        let req = info.httpModule.request(info.options, (msg) => {
            let res = new HttpClientResponse(msg);
            handleResult(null, res);
        });
        req.on('socket', sock => {
            socket = sock;
        });
        // If we ever get disconnected, we want the socket to timeout eventually
        req.setTimeout(this._socketTimeout || 3 * 60000, () => {
            if (socket) {
                socket.end();
            }
            handleResult(new Error('Request timeout: ' + info.options.path), null);
        });
        req.on('error', function (err) {
            // err has statusCode property
            // res should have headers
            handleResult(err, null);
        });
        if (data && typeof data === 'string') {
            req.write(data, 'utf8');
        }
        if (data && typeof data !== 'string') {
            data.on('close', function () {
                req.end();
            });
            data.pipe(req);
        }
        else {
            req.end();
        }
    }
    /**
     * Gets an http agent. This function is useful when you need an http agent that handles
     * routing through a proxy server - depending upon the url and proxy environment variables.
     * @param serverUrl  The server URL where the request will be sent. For example, https://api.github.com
     */
    getAgent(serverUrl) {
        let parsedUrl = url.parse(serverUrl);
        return this._getAgent(parsedUrl);
    }
    _prepareRequest(method, requestUrl, headers) {
        const info = {};
        info.parsedUrl = requestUrl;
        const usingSsl = info.parsedUrl.protocol === 'https:';
        info.httpModule = usingSsl ? https : http;
        const defaultPort = usingSsl ? 443 : 80;
        info.options = {};
        info.options.host = info.parsedUrl.hostname;
        info.options.port = info.parsedUrl.port
            ? parseInt(info.parsedUrl.port)
            : defaultPort;
        info.options.path =
            (info.parsedUrl.pathname || '') + (info.parsedUrl.search || '');
        info.options.method = method;
        info.options.headers = this._mergeHeaders(headers);
        if (this.userAgent != null) {
            info.options.headers['user-agent'] = this.userAgent;
        }
        info.options.agent = this._getAgent(info.parsedUrl);
        // gives handlers an opportunity to participate
        if (this.handlers) {
            this.handlers.forEach(handler => {
                handler.prepareRequest(info.options);
            });
        }
        return info;
    }
    _mergeHeaders(headers) {
        const lowercaseKeys = obj => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
        if (this.requestOptions && this.requestOptions.headers) {
            return Object.assign({}, lowercaseKeys(this.requestOptions.headers), lowercaseKeys(headers));
        }
        return lowercaseKeys(headers || {});
    }
    _getExistingOrDefaultHeader(additionalHeaders, header, _default) {
        const lowercaseKeys = obj => Object.keys(obj).reduce((c, k) => ((c[k.toLowerCase()] = obj[k]), c), {});
        let clientHeader;
        if (this.requestOptions && this.requestOptions.headers) {
            clientHeader = lowercaseKeys(this.requestOptions.headers)[header];
        }
        return additionalHeaders[header] || clientHeader || _default;
    }
    _getAgent(parsedUrl) {
        let agent;
        let proxyUrl = pm.getProxyUrl(parsedUrl);
        let useProxy = proxyUrl && proxyUrl.hostname;
        if (this._keepAlive && useProxy) {
            agent = this._proxyAgent;
        }
        if (this._keepAlive && !useProxy) {
            agent = this._agent;
        }
        // if agent is already assigned use that agent.
        if (!!agent) {
            return agent;
        }
        const usingSsl = parsedUrl.protocol === 'https:';
        let maxSockets = 100;
        if (!!this.requestOptions) {
            maxSockets = this.requestOptions.maxSockets || http.globalAgent.maxSockets;
        }
        if (useProxy) {
            // If using proxy, need tunnel
            if (!tunnel) {
                tunnel = __webpack_require__(4294);
            }
            const agentOptions = {
                maxSockets: maxSockets,
                keepAlive: this._keepAlive,
                proxy: {
                    proxyAuth: proxyUrl.auth,
                    host: proxyUrl.hostname,
                    port: proxyUrl.port
                }
            };
            let tunnelAgent;
            const overHttps = proxyUrl.protocol === 'https:';
            if (usingSsl) {
                tunnelAgent = overHttps ? tunnel.httpsOverHttps : tunnel.httpsOverHttp;
            }
            else {
                tunnelAgent = overHttps ? tunnel.httpOverHttps : tunnel.httpOverHttp;
            }
            agent = tunnelAgent(agentOptions);
            this._proxyAgent = agent;
        }
        // if reusing agent across request and tunneling agent isn't assigned create a new agent
        if (this._keepAlive && !agent) {
            const options = { keepAlive: this._keepAlive, maxSockets: maxSockets };
            agent = usingSsl ? new https.Agent(options) : new http.Agent(options);
            this._agent = agent;
        }
        // if not using private agent and tunnel agent isn't setup then use global agent
        if (!agent) {
            agent = usingSsl ? https.globalAgent : http.globalAgent;
        }
        if (usingSsl && this._ignoreSslError) {
            // we don't want to set NODE_TLS_REJECT_UNAUTHORIZED=0 since that will affect request for entire process
            // http.RequestOptions doesn't expose a way to modify RequestOptions.agent.options
            // we have to cast it to any and change it directly
            agent.options = Object.assign(agent.options || {}, {
                rejectUnauthorized: false
            });
        }
        return agent;
    }
    _performExponentialBackoff(retryNumber) {
        retryNumber = Math.min(ExponentialBackoffCeiling, retryNumber);
        const ms = ExponentialBackoffTimeSlice * Math.pow(2, retryNumber);
        return new Promise(resolve => setTimeout(() => resolve(), ms));
    }
    static dateTimeDeserializer(key, value) {
        if (typeof value === 'string') {
            let a = new Date(value);
            if (!isNaN(a.valueOf())) {
                return a;
            }
        }
        return value;
    }
    async _processResponse(res, options) {
        return new Promise(async (resolve, reject) => {
            const statusCode = res.message.statusCode;
            const response = {
                statusCode: statusCode,
                result: null,
                headers: {}
            };
            // not found leads to null obj returned
            if (statusCode == HttpCodes.NotFound) {
                resolve(response);
            }
            let obj;
            let contents;
            // get the result from the body
            try {
                contents = await res.readBody();
                if (contents && contents.length > 0) {
                    if (options && options.deserializeDates) {
                        obj = JSON.parse(contents, HttpClient.dateTimeDeserializer);
                    }
                    else {
                        obj = JSON.parse(contents);
                    }
                    response.result = obj;
                }
                response.headers = res.message.headers;
            }
            catch (err) {
                // Invalid resource (contents not json);  leaving result obj null
            }
            // note that 3xx redirects are handled by the http layer.
            if (statusCode > 299) {
                let msg;
                // if exception/error in body, attempt to get better error
                if (obj && obj.message) {
                    msg = obj.message;
                }
                else if (contents && contents.length > 0) {
                    // it may be the case that the exception is in the body message as string
                    msg = contents;
                }
                else {
                    msg = 'Failed request: (' + statusCode + ')';
                }
                let err = new Error(msg);
                // attach statusCode and body obj (if available) to the error object
                err['statusCode'] = statusCode;
                if (response.result) {
                    err['result'] = response.result;
                }
                reject(err);
            }
            else {
                resolve(response);
            }
        });
    }
}
exports.HttpClient = HttpClient;


/***/ }),

/***/ 6443:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const url = __webpack_require__(8835);
function getProxyUrl(reqUrl) {
    let usingSsl = reqUrl.protocol === 'https:';
    let proxyUrl;
    if (checkBypass(reqUrl)) {
        return proxyUrl;
    }
    let proxyVar;
    if (usingSsl) {
        proxyVar = process.env['https_proxy'] || process.env['HTTPS_PROXY'];
    }
    else {
        proxyVar = process.env['http_proxy'] || process.env['HTTP_PROXY'];
    }
    if (proxyVar) {
        proxyUrl = url.parse(proxyVar);
    }
    return proxyUrl;
}
exports.getProxyUrl = getProxyUrl;
function checkBypass(reqUrl) {
    if (!reqUrl.hostname) {
        return false;
    }
    let noProxy = process.env['no_proxy'] || process.env['NO_PROXY'] || '';
    if (!noProxy) {
        return false;
    }
    // Determine the request port
    let reqPort;
    if (reqUrl.port) {
        reqPort = Number(reqUrl.port);
    }
    else if (reqUrl.protocol === 'http:') {
        reqPort = 80;
    }
    else if (reqUrl.protocol === 'https:') {
        reqPort = 443;
    }
    // Format the request hostname and hostname with port
    let upperReqHosts = [reqUrl.hostname.toUpperCase()];
    if (typeof reqPort === 'number') {
        upperReqHosts.push(`${upperReqHosts[0]}:${reqPort}`);
    }
    // Compare request host against noproxy
    for (let upperNoProxyItem of noProxy
        .split(',')
        .map(x => x.trim().toUpperCase())
        .filter(x => x)) {
        if (upperReqHosts.some(x => x === upperNoProxyItem)) {
            return true;
        }
    }
    return false;
}
exports.checkBypass = checkBypass;


/***/ }),

/***/ 334:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

async function auth(token) {
  const tokenType = token.split(/\./).length === 3 ? "app" : /^v\d+\./.test(token) ? "installation" : "oauth";
  return {
    type: "token",
    token: token,
    tokenType
  };
}

/**
 * Prefix token for usage in the Authorization header
 *
 * @param token OAuth token or JSON Web Token
 */
function withAuthorizationPrefix(token) {
  if (token.split(/\./).length === 3) {
    return `bearer ${token}`;
  }

  return `token ${token}`;
}

async function hook(token, request, route, parameters) {
  const endpoint = request.endpoint.merge(route, parameters);
  endpoint.headers.authorization = withAuthorizationPrefix(token);
  return request(endpoint);
}

const createTokenAuth = function createTokenAuth(token) {
  if (!token) {
    throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");
  }

  if (typeof token !== "string") {
    throw new Error("[@octokit/auth-token] Token passed to createTokenAuth is not a string");
  }

  token = token.replace(/^(token|bearer) +/i, "");
  return Object.assign(auth.bind(null, token), {
    hook: hook.bind(null, token)
  });
};

exports.createTokenAuth = createTokenAuth;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 6762:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var universalUserAgent = __webpack_require__(5030);
var beforeAfterHook = __webpack_require__(3682);
var request = __webpack_require__(6234);
var graphql = __webpack_require__(8467);
var authToken = __webpack_require__(334);

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

const VERSION = "3.1.2";

class Octokit {
  constructor(options = {}) {
    const hook = new beforeAfterHook.Collection();
    const requestDefaults = {
      baseUrl: request.request.endpoint.DEFAULTS.baseUrl,
      headers: {},
      request: Object.assign({}, options.request, {
        hook: hook.bind(null, "request")
      }),
      mediaType: {
        previews: [],
        format: ""
      }
    }; // prepend default user agent with `options.userAgent` if set

    requestDefaults.headers["user-agent"] = [options.userAgent, `octokit-core.js/${VERSION} ${universalUserAgent.getUserAgent()}`].filter(Boolean).join(" ");

    if (options.baseUrl) {
      requestDefaults.baseUrl = options.baseUrl;
    }

    if (options.previews) {
      requestDefaults.mediaType.previews = options.previews;
    }

    if (options.timeZone) {
      requestDefaults.headers["time-zone"] = options.timeZone;
    }

    this.request = request.request.defaults(requestDefaults);
    this.graphql = graphql.withCustomRequest(this.request).defaults(_objectSpread2(_objectSpread2({}, requestDefaults), {}, {
      baseUrl: requestDefaults.baseUrl.replace(/\/api\/v3$/, "/api")
    }));
    this.log = Object.assign({
      debug: () => {},
      info: () => {},
      warn: console.warn.bind(console),
      error: console.error.bind(console)
    }, options.log);
    this.hook = hook; // (1) If neither `options.authStrategy` nor `options.auth` are set, the `octokit` instance
    //     is unauthenticated. The `this.auth()` method is a no-op and no request hook is registred.
    // (2) If only `options.auth` is set, use the default token authentication strategy.
    // (3) If `options.authStrategy` is set then use it and pass in `options.auth`. Always pass own request as many strategies accept a custom request instance.
    // TODO: type `options.auth` based on `options.authStrategy`.

    if (!options.authStrategy) {
      if (!options.auth) {
        // (1)
        this.auth = async () => ({
          type: "unauthenticated"
        });
      } else {
        // (2)
        const auth = authToken.createTokenAuth(options.auth); // @ts-ignore  ¯\_(ツ)_/¯

        hook.wrap("request", auth.hook);
        this.auth = auth;
      }
    } else {
      const auth = options.authStrategy(Object.assign({
        request: this.request
      }, options.auth)); // @ts-ignore  ¯\_(ツ)_/¯

      hook.wrap("request", auth.hook);
      this.auth = auth;
    } // apply plugins
    // https://stackoverflow.com/a/16345172


    const classConstructor = this.constructor;
    classConstructor.plugins.forEach(plugin => {
      Object.assign(this, plugin(this, options));
    });
  }

  static defaults(defaults) {
    const OctokitWithDefaults = class extends this {
      constructor(...args) {
        const options = args[0] || {};

        if (typeof defaults === "function") {
          super(defaults(options));
          return;
        }

        super(Object.assign({}, defaults, options, options.userAgent && defaults.userAgent ? {
          userAgent: `${options.userAgent} ${defaults.userAgent}`
        } : null));
      }

    };
    return OctokitWithDefaults;
  }
  /**
   * Attach a plugin (or many) to your Octokit instance.
   *
   * @example
   * const API = Octokit.plugin(plugin1, plugin2, plugin3, ...)
   */


  static plugin(...newPlugins) {
    var _a;

    const currentPlugins = this.plugins;
    const NewOctokit = (_a = class extends this {}, _a.plugins = currentPlugins.concat(newPlugins.filter(plugin => !currentPlugins.includes(plugin))), _a);
    return NewOctokit;
  }

}
Octokit.VERSION = VERSION;
Octokit.plugins = [];

exports.Octokit = Octokit;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 9440:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var isPlainObject = _interopDefault(__webpack_require__(8840));
var universalUserAgent = __webpack_require__(5030);

function lowercaseKeys(object) {
  if (!object) {
    return {};
  }

  return Object.keys(object).reduce((newObj, key) => {
    newObj[key.toLowerCase()] = object[key];
    return newObj;
  }, {});
}

function mergeDeep(defaults, options) {
  const result = Object.assign({}, defaults);
  Object.keys(options).forEach(key => {
    if (isPlainObject(options[key])) {
      if (!(key in defaults)) Object.assign(result, {
        [key]: options[key]
      });else result[key] = mergeDeep(defaults[key], options[key]);
    } else {
      Object.assign(result, {
        [key]: options[key]
      });
    }
  });
  return result;
}

function merge(defaults, route, options) {
  if (typeof route === "string") {
    let [method, url] = route.split(" ");
    options = Object.assign(url ? {
      method,
      url
    } : {
      url: method
    }, options);
  } else {
    options = Object.assign({}, route);
  } // lowercase header names before merging with defaults to avoid duplicates


  options.headers = lowercaseKeys(options.headers);
  const mergedOptions = mergeDeep(defaults || {}, options); // mediaType.previews arrays are merged, instead of overwritten

  if (defaults && defaults.mediaType.previews.length) {
    mergedOptions.mediaType.previews = defaults.mediaType.previews.filter(preview => !mergedOptions.mediaType.previews.includes(preview)).concat(mergedOptions.mediaType.previews);
  }

  mergedOptions.mediaType.previews = mergedOptions.mediaType.previews.map(preview => preview.replace(/-preview/, ""));
  return mergedOptions;
}

function addQueryParameters(url, parameters) {
  const separator = /\?/.test(url) ? "&" : "?";
  const names = Object.keys(parameters);

  if (names.length === 0) {
    return url;
  }

  return url + separator + names.map(name => {
    if (name === "q") {
      return "q=" + parameters.q.split("+").map(encodeURIComponent).join("+");
    }

    return `${name}=${encodeURIComponent(parameters[name])}`;
  }).join("&");
}

const urlVariableRegex = /\{[^}]+\}/g;

function removeNonChars(variableName) {
  return variableName.replace(/^\W+|\W+$/g, "").split(/,/);
}

function extractUrlVariableNames(url) {
  const matches = url.match(urlVariableRegex);

  if (!matches) {
    return [];
  }

  return matches.map(removeNonChars).reduce((a, b) => a.concat(b), []);
}

function omit(object, keysToOmit) {
  return Object.keys(object).filter(option => !keysToOmit.includes(option)).reduce((obj, key) => {
    obj[key] = object[key];
    return obj;
  }, {});
}

// Based on https://github.com/bramstein/url-template, licensed under BSD
// TODO: create separate package.
//
// Copyright (c) 2012-2014, Bram Stein
// All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions
// are met:
//  1. Redistributions of source code must retain the above copyright
//     notice, this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright
//     notice, this list of conditions and the following disclaimer in the
//     documentation and/or other materials provided with the distribution.
//  3. The name of the author may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR "AS IS" AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
// EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
// OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
// EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

/* istanbul ignore file */
function encodeReserved(str) {
  return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
    if (!/%[0-9A-Fa-f]/.test(part)) {
      part = encodeURI(part).replace(/%5B/g, "[").replace(/%5D/g, "]");
    }

    return part;
  }).join("");
}

function encodeUnreserved(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return "%" + c.charCodeAt(0).toString(16).toUpperCase();
  });
}

function encodeValue(operator, value, key) {
  value = operator === "+" || operator === "#" ? encodeReserved(value) : encodeUnreserved(value);

  if (key) {
    return encodeUnreserved(key) + "=" + value;
  } else {
    return value;
  }
}

function isDefined(value) {
  return value !== undefined && value !== null;
}

function isKeyOperator(operator) {
  return operator === ";" || operator === "&" || operator === "?";
}

function getValues(context, operator, key, modifier) {
  var value = context[key],
      result = [];

  if (isDefined(value) && value !== "") {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      value = value.toString();

      if (modifier && modifier !== "*") {
        value = value.substring(0, parseInt(modifier, 10));
      }

      result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
    } else {
      if (modifier === "*") {
        if (Array.isArray(value)) {
          value.filter(isDefined).forEach(function (value) {
            result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : ""));
          });
        } else {
          Object.keys(value).forEach(function (k) {
            if (isDefined(value[k])) {
              result.push(encodeValue(operator, value[k], k));
            }
          });
        }
      } else {
        const tmp = [];

        if (Array.isArray(value)) {
          value.filter(isDefined).forEach(function (value) {
            tmp.push(encodeValue(operator, value));
          });
        } else {
          Object.keys(value).forEach(function (k) {
            if (isDefined(value[k])) {
              tmp.push(encodeUnreserved(k));
              tmp.push(encodeValue(operator, value[k].toString()));
            }
          });
        }

        if (isKeyOperator(operator)) {
          result.push(encodeUnreserved(key) + "=" + tmp.join(","));
        } else if (tmp.length !== 0) {
          result.push(tmp.join(","));
        }
      }
    }
  } else {
    if (operator === ";") {
      if (isDefined(value)) {
        result.push(encodeUnreserved(key));
      }
    } else if (value === "" && (operator === "&" || operator === "?")) {
      result.push(encodeUnreserved(key) + "=");
    } else if (value === "") {
      result.push("");
    }
  }

  return result;
}

function parseUrl(template) {
  return {
    expand: expand.bind(null, template)
  };
}

function expand(template, context) {
  var operators = ["+", "#", ".", "/", ";", "?", "&"];
  return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
    if (expression) {
      let operator = "";
      const values = [];

      if (operators.indexOf(expression.charAt(0)) !== -1) {
        operator = expression.charAt(0);
        expression = expression.substr(1);
      }

      expression.split(/,/g).forEach(function (variable) {
        var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
        values.push(getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
      });

      if (operator && operator !== "+") {
        var separator = ",";

        if (operator === "?") {
          separator = "&";
        } else if (operator !== "#") {
          separator = operator;
        }

        return (values.length !== 0 ? operator : "") + values.join(separator);
      } else {
        return values.join(",");
      }
    } else {
      return encodeReserved(literal);
    }
  });
}

function parse(options) {
  // https://fetch.spec.whatwg.org/#methods
  let method = options.method.toUpperCase(); // replace :varname with {varname} to make it RFC 6570 compatible

  let url = (options.url || "/").replace(/:([a-z]\w+)/g, "{+$1}");
  let headers = Object.assign({}, options.headers);
  let body;
  let parameters = omit(options, ["method", "baseUrl", "url", "headers", "request", "mediaType"]); // extract variable names from URL to calculate remaining variables later

  const urlVariableNames = extractUrlVariableNames(url);
  url = parseUrl(url).expand(parameters);

  if (!/^http/.test(url)) {
    url = options.baseUrl + url;
  }

  const omittedParameters = Object.keys(options).filter(option => urlVariableNames.includes(option)).concat("baseUrl");
  const remainingParameters = omit(parameters, omittedParameters);
  const isBinaryRequset = /application\/octet-stream/i.test(headers.accept);

  if (!isBinaryRequset) {
    if (options.mediaType.format) {
      // e.g. application/vnd.github.v3+json => application/vnd.github.v3.raw
      headers.accept = headers.accept.split(/,/).map(preview => preview.replace(/application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/, `application/vnd$1$2.${options.mediaType.format}`)).join(",");
    }

    if (options.mediaType.previews.length) {
      const previewsFromAcceptHeader = headers.accept.match(/[\w-]+(?=-preview)/g) || [];
      headers.accept = previewsFromAcceptHeader.concat(options.mediaType.previews).map(preview => {
        const format = options.mediaType.format ? `.${options.mediaType.format}` : "+json";
        return `application/vnd.github.${preview}-preview${format}`;
      }).join(",");
    }
  } // for GET/HEAD requests, set URL query parameters from remaining parameters
  // for PATCH/POST/PUT/DELETE requests, set request body from remaining parameters


  if (["GET", "HEAD"].includes(method)) {
    url = addQueryParameters(url, remainingParameters);
  } else {
    if ("data" in remainingParameters) {
      body = remainingParameters.data;
    } else {
      if (Object.keys(remainingParameters).length) {
        body = remainingParameters;
      } else {
        headers["content-length"] = 0;
      }
    }
  } // default content-type for JSON if body is set


  if (!headers["content-type"] && typeof body !== "undefined") {
    headers["content-type"] = "application/json; charset=utf-8";
  } // GitHub expects 'content-length: 0' header for PUT/PATCH requests without body.
  // fetch does not allow to set `content-length` header, but we can set body to an empty string


  if (["PATCH", "PUT"].includes(method) && typeof body === "undefined") {
    body = "";
  } // Only return body/request keys if present


  return Object.assign({
    method,
    url,
    headers
  }, typeof body !== "undefined" ? {
    body
  } : null, options.request ? {
    request: options.request
  } : null);
}

function endpointWithDefaults(defaults, route, options) {
  return parse(merge(defaults, route, options));
}

function withDefaults(oldDefaults, newDefaults) {
  const DEFAULTS = merge(oldDefaults, newDefaults);
  const endpoint = endpointWithDefaults.bind(null, DEFAULTS);
  return Object.assign(endpoint, {
    DEFAULTS,
    defaults: withDefaults.bind(null, DEFAULTS),
    merge: merge.bind(null, DEFAULTS),
    parse
  });
}

const VERSION = "6.0.5";

const userAgent = `octokit-endpoint.js/${VERSION} ${universalUserAgent.getUserAgent()}`; // DEFAULTS has all properties set that EndpointOptions has, except url.
// So we use RequestParameters and add method as additional required property.

const DEFAULTS = {
  method: "GET",
  baseUrl: "https://api.github.com",
  headers: {
    accept: "application/vnd.github.v3+json",
    "user-agent": userAgent
  },
  mediaType: {
    format: "",
    previews: []
  }
};

const endpoint = withDefaults(null, DEFAULTS);

exports.endpoint = endpoint;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 8467:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var request = __webpack_require__(6234);
var universalUserAgent = __webpack_require__(5030);

const VERSION = "4.5.4";

class GraphqlError extends Error {
  constructor(request, response) {
    const message = response.data.errors[0].message;
    super(message);
    Object.assign(this, response.data);
    Object.assign(this, {
      headers: response.headers
    });
    this.name = "GraphqlError";
    this.request = request; // Maintains proper stack trace (only available on V8)

    /* istanbul ignore next */

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

}

const NON_VARIABLE_OPTIONS = ["method", "baseUrl", "url", "headers", "request", "query", "mediaType"];
function graphql(request, query, options) {
  options = typeof query === "string" ? options = Object.assign({
    query
  }, options) : options = query;
  const requestOptions = Object.keys(options).reduce((result, key) => {
    if (NON_VARIABLE_OPTIONS.includes(key)) {
      result[key] = options[key];
      return result;
    }

    if (!result.variables) {
      result.variables = {};
    }

    result.variables[key] = options[key];
    return result;
  }, {});
  return request(requestOptions).then(response => {
    if (response.data.errors) {
      const headers = {};

      for (const key of Object.keys(response.headers)) {
        headers[key] = response.headers[key];
      }

      throw new GraphqlError(requestOptions, {
        headers,
        data: response.data
      });
    }

    return response.data.data;
  });
}

function withDefaults(request$1, newDefaults) {
  const newRequest = request$1.defaults(newDefaults);

  const newApi = (query, options) => {
    return graphql(newRequest, query, options);
  };

  return Object.assign(newApi, {
    defaults: withDefaults.bind(null, newRequest),
    endpoint: request.request.endpoint
  });
}

const graphql$1 = withDefaults(request.request, {
  headers: {
    "user-agent": `octokit-graphql.js/${VERSION} ${universalUserAgent.getUserAgent()}`
  },
  method: "POST",
  url: "/graphql"
});
function withCustomRequest(customRequest) {
  return withDefaults(customRequest, {
    method: "POST",
    url: "/graphql"
  });
}

exports.graphql = graphql$1;
exports.withCustomRequest = withCustomRequest;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 4193:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

const VERSION = "2.3.2";

/**
 * Some “list” response that can be paginated have a different response structure
 *
 * They have a `total_count` key in the response (search also has `incomplete_results`,
 * /installation/repositories also has `repository_selection`), as well as a key with
 * the list of the items which name varies from endpoint to endpoint.
 *
 * Octokit normalizes these responses so that paginated results are always returned following
 * the same structure. One challenge is that if the list response has only one page, no Link
 * header is provided, so this header alone is not sufficient to check wether a response is
 * paginated or not.
 *
 * We check if a "total_count" key is present in the response data, but also make sure that
 * a "url" property is not, as the "Get the combined status for a specific ref" endpoint would
 * otherwise match: https://developer.github.com/v3/repos/statuses/#get-the-combined-status-for-a-specific-ref
 */
function normalizePaginatedListResponse(response) {
  const responseNeedsNormalization = "total_count" in response.data && !("url" in response.data);
  if (!responseNeedsNormalization) return response; // keep the additional properties intact as there is currently no other way
  // to retrieve the same information.

  const incompleteResults = response.data.incomplete_results;
  const repositorySelection = response.data.repository_selection;
  const totalCount = response.data.total_count;
  delete response.data.incomplete_results;
  delete response.data.repository_selection;
  delete response.data.total_count;
  const namespaceKey = Object.keys(response.data)[0];
  const data = response.data[namespaceKey];
  response.data = data;

  if (typeof incompleteResults !== "undefined") {
    response.data.incomplete_results = incompleteResults;
  }

  if (typeof repositorySelection !== "undefined") {
    response.data.repository_selection = repositorySelection;
  }

  response.data.total_count = totalCount;
  return response;
}

function iterator(octokit, route, parameters) {
  const options = typeof route === "function" ? route.endpoint(parameters) : octokit.request.endpoint(route, parameters);
  const requestMethod = typeof route === "function" ? route : octokit.request;
  const method = options.method;
  const headers = options.headers;
  let url = options.url;
  return {
    [Symbol.asyncIterator]: () => ({
      next() {
        if (!url) {
          return Promise.resolve({
            done: true
          });
        }

        return requestMethod({
          method,
          url,
          headers
        }).then(normalizePaginatedListResponse).then(response => {
          // `response.headers.link` format:
          // '<https://api.github.com/users/aseemk/followers?page=2>; rel="next", <https://api.github.com/users/aseemk/followers?page=2>; rel="last"'
          // sets `url` to undefined if "next" URL is not present or `link` header is not set
          url = ((response.headers.link || "").match(/<([^>]+)>;\s*rel="next"/) || [])[1];
          return {
            value: response
          };
        });
      }

    })
  };
}

function paginate(octokit, route, parameters, mapFn) {
  if (typeof parameters === "function") {
    mapFn = parameters;
    parameters = undefined;
  }

  return gather(octokit, [], iterator(octokit, route, parameters)[Symbol.asyncIterator](), mapFn);
}

function gather(octokit, results, iterator, mapFn) {
  return iterator.next().then(result => {
    if (result.done) {
      return results;
    }

    let earlyExit = false;

    function done() {
      earlyExit = true;
    }

    results = results.concat(mapFn ? mapFn(result.value, done) : result.value.data);

    if (earlyExit) {
      return results;
    }

    return gather(octokit, results, iterator, mapFn);
  });
}

/**
 * @param octokit Octokit instance
 * @param options Options passed to Octokit constructor
 */

function paginateRest(octokit) {
  return {
    paginate: Object.assign(paginate.bind(null, octokit), {
      iterator: iterator.bind(null, octokit)
    })
  };
}
paginateRest.VERSION = VERSION;

exports.paginateRest = paginateRest;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 3044:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

const Endpoints = {
  actions: {
    addSelectedRepoToOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],
    cancelWorkflowRun: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel"],
    createOrUpdateOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}"],
    createOrUpdateRepoSecret: ["PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
    createRegistrationTokenForOrg: ["POST /orgs/{org}/actions/runners/registration-token"],
    createRegistrationTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/registration-token"],
    createRemoveTokenForOrg: ["POST /orgs/{org}/actions/runners/remove-token"],
    createRemoveTokenForRepo: ["POST /repos/{owner}/{repo}/actions/runners/remove-token"],
    createWorkflowDispatch: ["POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches"],
    deleteArtifact: ["DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
    deleteOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}"],
    deleteRepoSecret: ["DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
    deleteSelfHostedRunnerFromOrg: ["DELETE /orgs/{org}/actions/runners/{runner_id}"],
    deleteSelfHostedRunnerFromRepo: ["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}"],
    deleteWorkflowRun: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}"],
    deleteWorkflowRunLogs: ["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
    downloadArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}"],
    downloadJobLogsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs"],
    downloadWorkflowRunLogs: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],
    getArtifact: ["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],
    getJobForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/jobs/{job_id}"],
    getOrgPublicKey: ["GET /orgs/{org}/actions/secrets/public-key"],
    getOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}"],
    getRepoPublicKey: ["GET /repos/{owner}/{repo}/actions/secrets/public-key"],
    getRepoSecret: ["GET /repos/{owner}/{repo}/actions/secrets/{secret_name}"],
    getSelfHostedRunnerForOrg: ["GET /orgs/{org}/actions/runners/{runner_id}"],
    getSelfHostedRunnerForRepo: ["GET /repos/{owner}/{repo}/actions/runners/{runner_id}"],
    getWorkflow: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}"],
    getWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}"],
    getWorkflowRunUsage: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing"],
    getWorkflowUsage: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing"],
    listArtifactsForRepo: ["GET /repos/{owner}/{repo}/actions/artifacts"],
    listJobsForWorkflowRun: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs"],
    listOrgSecrets: ["GET /orgs/{org}/actions/secrets"],
    listRepoSecrets: ["GET /repos/{owner}/{repo}/actions/secrets"],
    listRepoWorkflows: ["GET /repos/{owner}/{repo}/actions/workflows"],
    listRunnerApplicationsForOrg: ["GET /orgs/{org}/actions/runners/downloads"],
    listRunnerApplicationsForRepo: ["GET /repos/{owner}/{repo}/actions/runners/downloads"],
    listSelectedReposForOrgSecret: ["GET /orgs/{org}/actions/secrets/{secret_name}/repositories"],
    listSelfHostedRunnersForOrg: ["GET /orgs/{org}/actions/runners"],
    listSelfHostedRunnersForRepo: ["GET /repos/{owner}/{repo}/actions/runners"],
    listWorkflowRunArtifacts: ["GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts"],
    listWorkflowRuns: ["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"],
    listWorkflowRunsForRepo: ["GET /repos/{owner}/{repo}/actions/runs"],
    reRunWorkflow: ["POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun"],
    removeSelectedRepoFromOrgSecret: ["DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],
    setSelectedReposForOrgSecret: ["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories"]
  },
  activity: {
    checkRepoIsStarredByAuthenticatedUser: ["GET /user/starred/{owner}/{repo}"],
    deleteRepoSubscription: ["DELETE /repos/{owner}/{repo}/subscription"],
    deleteThreadSubscription: ["DELETE /notifications/threads/{thread_id}/subscription"],
    getFeeds: ["GET /feeds"],
    getRepoSubscription: ["GET /repos/{owner}/{repo}/subscription"],
    getThread: ["GET /notifications/threads/{thread_id}"],
    getThreadSubscriptionForAuthenticatedUser: ["GET /notifications/threads/{thread_id}/subscription"],
    listEventsForAuthenticatedUser: ["GET /users/{username}/events"],
    listNotificationsForAuthenticatedUser: ["GET /notifications"],
    listOrgEventsForAuthenticatedUser: ["GET /users/{username}/events/orgs/{org}"],
    listPublicEvents: ["GET /events"],
    listPublicEventsForRepoNetwork: ["GET /networks/{owner}/{repo}/events"],
    listPublicEventsForUser: ["GET /users/{username}/events/public"],
    listPublicOrgEvents: ["GET /orgs/{org}/events"],
    listReceivedEventsForUser: ["GET /users/{username}/received_events"],
    listReceivedPublicEventsForUser: ["GET /users/{username}/received_events/public"],
    listRepoEvents: ["GET /repos/{owner}/{repo}/events"],
    listRepoNotificationsForAuthenticatedUser: ["GET /repos/{owner}/{repo}/notifications"],
    listReposStarredByAuthenticatedUser: ["GET /user/starred"],
    listReposStarredByUser: ["GET /users/{username}/starred"],
    listReposWatchedByUser: ["GET /users/{username}/subscriptions"],
    listStargazersForRepo: ["GET /repos/{owner}/{repo}/stargazers"],
    listWatchedReposForAuthenticatedUser: ["GET /user/subscriptions"],
    listWatchersForRepo: ["GET /repos/{owner}/{repo}/subscribers"],
    markNotificationsAsRead: ["PUT /notifications"],
    markRepoNotificationsAsRead: ["PUT /repos/{owner}/{repo}/notifications"],
    markThreadAsRead: ["PATCH /notifications/threads/{thread_id}"],
    setRepoSubscription: ["PUT /repos/{owner}/{repo}/subscription"],
    setThreadSubscription: ["PUT /notifications/threads/{thread_id}/subscription"],
    starRepoForAuthenticatedUser: ["PUT /user/starred/{owner}/{repo}"],
    unstarRepoForAuthenticatedUser: ["DELETE /user/starred/{owner}/{repo}"]
  },
  apps: {
    addRepoToInstallation: ["PUT /user/installations/{installation_id}/repositories/{repository_id}"],
    checkToken: ["POST /applications/{client_id}/token"],
    createContentAttachment: ["POST /content_references/{content_reference_id}/attachments", {
      mediaType: {
        previews: ["corsair"]
      }
    }],
    createFromManifest: ["POST /app-manifests/{code}/conversions"],
    createInstallationAccessToken: ["POST /app/installations/{installation_id}/access_tokens"],
    deleteAuthorization: ["DELETE /applications/{client_id}/grant"],
    deleteInstallation: ["DELETE /app/installations/{installation_id}"],
    deleteToken: ["DELETE /applications/{client_id}/token"],
    getAuthenticated: ["GET /app"],
    getBySlug: ["GET /apps/{app_slug}"],
    getInstallation: ["GET /app/installations/{installation_id}"],
    getOrgInstallation: ["GET /orgs/{org}/installation"],
    getRepoInstallation: ["GET /repos/{owner}/{repo}/installation"],
    getSubscriptionPlanForAccount: ["GET /marketplace_listing/accounts/{account_id}"],
    getSubscriptionPlanForAccountStubbed: ["GET /marketplace_listing/stubbed/accounts/{account_id}"],
    getUserInstallation: ["GET /users/{username}/installation"],
    listAccountsForPlan: ["GET /marketplace_listing/plans/{plan_id}/accounts"],
    listAccountsForPlanStubbed: ["GET /marketplace_listing/stubbed/plans/{plan_id}/accounts"],
    listInstallationReposForAuthenticatedUser: ["GET /user/installations/{installation_id}/repositories"],
    listInstallations: ["GET /app/installations"],
    listInstallationsForAuthenticatedUser: ["GET /user/installations"],
    listPlans: ["GET /marketplace_listing/plans"],
    listPlansStubbed: ["GET /marketplace_listing/stubbed/plans"],
    listReposAccessibleToInstallation: ["GET /installation/repositories"],
    listSubscriptionsForAuthenticatedUser: ["GET /user/marketplace_purchases"],
    listSubscriptionsForAuthenticatedUserStubbed: ["GET /user/marketplace_purchases/stubbed"],
    removeRepoFromInstallation: ["DELETE /user/installations/{installation_id}/repositories/{repository_id}"],
    resetToken: ["PATCH /applications/{client_id}/token"],
    revokeInstallationAccessToken: ["DELETE /installation/token"],
    suspendInstallation: ["PUT /app/installations/{installation_id}/suspended"],
    unsuspendInstallation: ["DELETE /app/installations/{installation_id}/suspended"]
  },
  billing: {
    getGithubActionsBillingOrg: ["GET /orgs/{org}/settings/billing/actions"],
    getGithubActionsBillingUser: ["GET /users/{username}/settings/billing/actions"],
    getGithubPackagesBillingOrg: ["GET /orgs/{org}/settings/billing/packages"],
    getGithubPackagesBillingUser: ["GET /users/{username}/settings/billing/packages"],
    getSharedStorageBillingOrg: ["GET /orgs/{org}/settings/billing/shared-storage"],
    getSharedStorageBillingUser: ["GET /users/{username}/settings/billing/shared-storage"]
  },
  checks: {
    create: ["POST /repos/{owner}/{repo}/check-runs", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    createSuite: ["POST /repos/{owner}/{repo}/check-suites", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    get: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    getSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    listAnnotations: ["GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    listForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-runs", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    listForSuite: ["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    listSuitesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/check-suites", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    rerequestSuite: ["POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    setSuitesPreferences: ["PATCH /repos/{owner}/{repo}/check-suites/preferences", {
      mediaType: {
        previews: ["antiope"]
      }
    }],
    update: ["PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}", {
      mediaType: {
        previews: ["antiope"]
      }
    }]
  },
  codeScanning: {
    getAlert: ["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_id}"],
    listAlertsForRepo: ["GET /repos/{owner}/{repo}/code-scanning/alerts"]
  },
  codesOfConduct: {
    getAllCodesOfConduct: ["GET /codes_of_conduct", {
      mediaType: {
        previews: ["scarlet-witch"]
      }
    }],
    getConductCode: ["GET /codes_of_conduct/{key}", {
      mediaType: {
        previews: ["scarlet-witch"]
      }
    }],
    getForRepo: ["GET /repos/{owner}/{repo}/community/code_of_conduct", {
      mediaType: {
        previews: ["scarlet-witch"]
      }
    }]
  },
  emojis: {
    get: ["GET /emojis"]
  },
  gists: {
    checkIsStarred: ["GET /gists/{gist_id}/star"],
    create: ["POST /gists"],
    createComment: ["POST /gists/{gist_id}/comments"],
    delete: ["DELETE /gists/{gist_id}"],
    deleteComment: ["DELETE /gists/{gist_id}/comments/{comment_id}"],
    fork: ["POST /gists/{gist_id}/forks"],
    get: ["GET /gists/{gist_id}"],
    getComment: ["GET /gists/{gist_id}/comments/{comment_id}"],
    getRevision: ["GET /gists/{gist_id}/{sha}"],
    list: ["GET /gists"],
    listComments: ["GET /gists/{gist_id}/comments"],
    listCommits: ["GET /gists/{gist_id}/commits"],
    listForUser: ["GET /users/{username}/gists"],
    listForks: ["GET /gists/{gist_id}/forks"],
    listPublic: ["GET /gists/public"],
    listStarred: ["GET /gists/starred"],
    star: ["PUT /gists/{gist_id}/star"],
    unstar: ["DELETE /gists/{gist_id}/star"],
    update: ["PATCH /gists/{gist_id}"],
    updateComment: ["PATCH /gists/{gist_id}/comments/{comment_id}"]
  },
  git: {
    createBlob: ["POST /repos/{owner}/{repo}/git/blobs"],
    createCommit: ["POST /repos/{owner}/{repo}/git/commits"],
    createRef: ["POST /repos/{owner}/{repo}/git/refs"],
    createTag: ["POST /repos/{owner}/{repo}/git/tags"],
    createTree: ["POST /repos/{owner}/{repo}/git/trees"],
    deleteRef: ["DELETE /repos/{owner}/{repo}/git/refs/{ref}"],
    getBlob: ["GET /repos/{owner}/{repo}/git/blobs/{file_sha}"],
    getCommit: ["GET /repos/{owner}/{repo}/git/commits/{commit_sha}"],
    getRef: ["GET /repos/{owner}/{repo}/git/ref/{ref}"],
    getTag: ["GET /repos/{owner}/{repo}/git/tags/{tag_sha}"],
    getTree: ["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"],
    listMatchingRefs: ["GET /repos/{owner}/{repo}/git/matching-refs/{ref}"],
    updateRef: ["PATCH /repos/{owner}/{repo}/git/refs/{ref}"]
  },
  gitignore: {
    getAllTemplates: ["GET /gitignore/templates"],
    getTemplate: ["GET /gitignore/templates/{name}"]
  },
  interactions: {
    getRestrictionsForOrg: ["GET /orgs/{org}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }],
    getRestrictionsForRepo: ["GET /repos/{owner}/{repo}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }],
    removeRestrictionsForOrg: ["DELETE /orgs/{org}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }],
    removeRestrictionsForRepo: ["DELETE /repos/{owner}/{repo}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }],
    setRestrictionsForOrg: ["PUT /orgs/{org}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }],
    setRestrictionsForRepo: ["PUT /repos/{owner}/{repo}/interaction-limits", {
      mediaType: {
        previews: ["sombra"]
      }
    }]
  },
  issues: {
    addAssignees: ["POST /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
    addLabels: ["POST /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    checkUserCanBeAssigned: ["GET /repos/{owner}/{repo}/assignees/{assignee}"],
    create: ["POST /repos/{owner}/{repo}/issues"],
    createComment: ["POST /repos/{owner}/{repo}/issues/{issue_number}/comments"],
    createLabel: ["POST /repos/{owner}/{repo}/labels"],
    createMilestone: ["POST /repos/{owner}/{repo}/milestones"],
    deleteComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    deleteLabel: ["DELETE /repos/{owner}/{repo}/labels/{name}"],
    deleteMilestone: ["DELETE /repos/{owner}/{repo}/milestones/{milestone_number}"],
    get: ["GET /repos/{owner}/{repo}/issues/{issue_number}"],
    getComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    getEvent: ["GET /repos/{owner}/{repo}/issues/events/{event_id}"],
    getLabel: ["GET /repos/{owner}/{repo}/labels/{name}"],
    getMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}"],
    list: ["GET /issues"],
    listAssignees: ["GET /repos/{owner}/{repo}/assignees"],
    listComments: ["GET /repos/{owner}/{repo}/issues/{issue_number}/comments"],
    listCommentsForRepo: ["GET /repos/{owner}/{repo}/issues/comments"],
    listEvents: ["GET /repos/{owner}/{repo}/issues/{issue_number}/events"],
    listEventsForRepo: ["GET /repos/{owner}/{repo}/issues/events"],
    listEventsForTimeline: ["GET /repos/{owner}/{repo}/issues/{issue_number}/timeline", {
      mediaType: {
        previews: ["mockingbird"]
      }
    }],
    listForAuthenticatedUser: ["GET /user/issues"],
    listForOrg: ["GET /orgs/{org}/issues"],
    listForRepo: ["GET /repos/{owner}/{repo}/issues"],
    listLabelsForMilestone: ["GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels"],
    listLabelsForRepo: ["GET /repos/{owner}/{repo}/labels"],
    listLabelsOnIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    listMilestones: ["GET /repos/{owner}/{repo}/milestones"],
    lock: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/lock"],
    removeAllLabels: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    removeAssignees: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees"],
    removeLabel: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}"],
    setLabels: ["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels"],
    unlock: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/lock"],
    update: ["PATCH /repos/{owner}/{repo}/issues/{issue_number}"],
    updateComment: ["PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}"],
    updateLabel: ["PATCH /repos/{owner}/{repo}/labels/{name}"],
    updateMilestone: ["PATCH /repos/{owner}/{repo}/milestones/{milestone_number}"]
  },
  licenses: {
    get: ["GET /licenses/{license}"],
    getAllCommonlyUsed: ["GET /licenses"],
    getForRepo: ["GET /repos/{owner}/{repo}/license"]
  },
  markdown: {
    render: ["POST /markdown"],
    renderRaw: ["POST /markdown/raw", {
      headers: {
        "content-type": "text/plain; charset=utf-8"
      }
    }]
  },
  meta: {
    get: ["GET /meta"]
  },
  migrations: {
    cancelImport: ["DELETE /repos/{owner}/{repo}/import"],
    deleteArchiveForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/archive", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    deleteArchiveForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/archive", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    downloadArchiveForOrg: ["GET /orgs/{org}/migrations/{migration_id}/archive", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    getArchiveForAuthenticatedUser: ["GET /user/migrations/{migration_id}/archive", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    getCommitAuthors: ["GET /repos/{owner}/{repo}/import/authors"],
    getImportStatus: ["GET /repos/{owner}/{repo}/import"],
    getLargeFiles: ["GET /repos/{owner}/{repo}/import/large_files"],
    getStatusForAuthenticatedUser: ["GET /user/migrations/{migration_id}", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    getStatusForOrg: ["GET /orgs/{org}/migrations/{migration_id}", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    listForAuthenticatedUser: ["GET /user/migrations", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    listForOrg: ["GET /orgs/{org}/migrations", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    listReposForOrg: ["GET /orgs/{org}/migrations/{migration_id}/repositories", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    listReposForUser: ["GET /user/migrations/{migration_id}/repositories", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    mapCommitAuthor: ["PATCH /repos/{owner}/{repo}/import/authors/{author_id}"],
    setLfsPreference: ["PATCH /repos/{owner}/{repo}/import/lfs"],
    startForAuthenticatedUser: ["POST /user/migrations"],
    startForOrg: ["POST /orgs/{org}/migrations"],
    startImport: ["PUT /repos/{owner}/{repo}/import"],
    unlockRepoForAuthenticatedUser: ["DELETE /user/migrations/{migration_id}/repos/{repo_name}/lock", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    unlockRepoForOrg: ["DELETE /orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock", {
      mediaType: {
        previews: ["wyandotte"]
      }
    }],
    updateImport: ["PATCH /repos/{owner}/{repo}/import"]
  },
  orgs: {
    blockUser: ["PUT /orgs/{org}/blocks/{username}"],
    checkBlockedUser: ["GET /orgs/{org}/blocks/{username}"],
    checkMembershipForUser: ["GET /orgs/{org}/members/{username}"],
    checkPublicMembershipForUser: ["GET /orgs/{org}/public_members/{username}"],
    convertMemberToOutsideCollaborator: ["PUT /orgs/{org}/outside_collaborators/{username}"],
    createInvitation: ["POST /orgs/{org}/invitations"],
    createWebhook: ["POST /orgs/{org}/hooks"],
    deleteWebhook: ["DELETE /orgs/{org}/hooks/{hook_id}"],
    get: ["GET /orgs/{org}"],
    getMembershipForAuthenticatedUser: ["GET /user/memberships/orgs/{org}"],
    getMembershipForUser: ["GET /orgs/{org}/memberships/{username}"],
    getWebhook: ["GET /orgs/{org}/hooks/{hook_id}"],
    list: ["GET /organizations"],
    listAppInstallations: ["GET /orgs/{org}/installations"],
    listBlockedUsers: ["GET /orgs/{org}/blocks"],
    listForAuthenticatedUser: ["GET /user/orgs"],
    listForUser: ["GET /users/{username}/orgs"],
    listInvitationTeams: ["GET /orgs/{org}/invitations/{invitation_id}/teams"],
    listMembers: ["GET /orgs/{org}/members"],
    listMembershipsForAuthenticatedUser: ["GET /user/memberships/orgs"],
    listOutsideCollaborators: ["GET /orgs/{org}/outside_collaborators"],
    listPendingInvitations: ["GET /orgs/{org}/invitations"],
    listPublicMembers: ["GET /orgs/{org}/public_members"],
    listWebhooks: ["GET /orgs/{org}/hooks"],
    pingWebhook: ["POST /orgs/{org}/hooks/{hook_id}/pings"],
    removeMember: ["DELETE /orgs/{org}/members/{username}"],
    removeMembershipForUser: ["DELETE /orgs/{org}/memberships/{username}"],
    removeOutsideCollaborator: ["DELETE /orgs/{org}/outside_collaborators/{username}"],
    removePublicMembershipForAuthenticatedUser: ["DELETE /orgs/{org}/public_members/{username}"],
    setMembershipForUser: ["PUT /orgs/{org}/memberships/{username}"],
    setPublicMembershipForAuthenticatedUser: ["PUT /orgs/{org}/public_members/{username}"],
    unblockUser: ["DELETE /orgs/{org}/blocks/{username}"],
    update: ["PATCH /orgs/{org}"],
    updateMembershipForAuthenticatedUser: ["PATCH /user/memberships/orgs/{org}"],
    updateWebhook: ["PATCH /orgs/{org}/hooks/{hook_id}"]
  },
  projects: {
    addCollaborator: ["PUT /projects/{project_id}/collaborators/{username}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    createCard: ["POST /projects/columns/{column_id}/cards", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    createColumn: ["POST /projects/{project_id}/columns", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    createForAuthenticatedUser: ["POST /user/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    createForOrg: ["POST /orgs/{org}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    createForRepo: ["POST /repos/{owner}/{repo}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    delete: ["DELETE /projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    deleteCard: ["DELETE /projects/columns/cards/{card_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    deleteColumn: ["DELETE /projects/columns/{column_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    get: ["GET /projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    getCard: ["GET /projects/columns/cards/{card_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    getColumn: ["GET /projects/columns/{column_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    getPermissionForUser: ["GET /projects/{project_id}/collaborators/{username}/permission", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listCards: ["GET /projects/columns/{column_id}/cards", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listCollaborators: ["GET /projects/{project_id}/collaborators", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listColumns: ["GET /projects/{project_id}/columns", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listForOrg: ["GET /orgs/{org}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listForRepo: ["GET /repos/{owner}/{repo}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listForUser: ["GET /users/{username}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    moveCard: ["POST /projects/columns/cards/{card_id}/moves", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    moveColumn: ["POST /projects/columns/{column_id}/moves", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    removeCollaborator: ["DELETE /projects/{project_id}/collaborators/{username}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    update: ["PATCH /projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    updateCard: ["PATCH /projects/columns/cards/{card_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    updateColumn: ["PATCH /projects/columns/{column_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }]
  },
  pulls: {
    checkIfMerged: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
    create: ["POST /repos/{owner}/{repo}/pulls"],
    createReplyForReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies"],
    createReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
    createReviewComment: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
    deletePendingReview: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
    deleteReviewComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
    dismissReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals"],
    get: ["GET /repos/{owner}/{repo}/pulls/{pull_number}"],
    getReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
    getReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}"],
    list: ["GET /repos/{owner}/{repo}/pulls"],
    listCommentsForReview: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments"],
    listCommits: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"],
    listFiles: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"],
    listRequestedReviewers: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
    listReviewComments: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/comments"],
    listReviewCommentsForRepo: ["GET /repos/{owner}/{repo}/pulls/comments"],
    listReviews: ["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],
    merge: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge"],
    removeRequestedReviewers: ["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
    requestReviewers: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],
    submitReview: ["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events"],
    update: ["PATCH /repos/{owner}/{repo}/pulls/{pull_number}"],
    updateBranch: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch", {
      mediaType: {
        previews: ["lydian"]
      }
    }],
    updateReview: ["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],
    updateReviewComment: ["PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}"]
  },
  rateLimit: {
    get: ["GET /rate_limit"]
  },
  reactions: {
    createForCommitComment: ["POST /repos/{owner}/{repo}/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    createForIssue: ["POST /repos/{owner}/{repo}/issues/{issue_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    createForIssueComment: ["POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    createForPullRequestReviewComment: ["POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    createForTeamDiscussionCommentInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    createForTeamDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForIssue: ["DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForIssueComment: ["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForPullRequestComment: ["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForTeamDiscussion: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteForTeamDiscussionComment: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    deleteLegacy: ["DELETE /reactions/{reaction_id}", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }, {
      deprecated: "octokit.reactions.deleteLegacy() is deprecated, see https://developer.github.com/v3/reactions/#delete-a-reaction-legacy"
    }],
    listForCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    listForIssue: ["GET /repos/{owner}/{repo}/issues/{issue_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    listForIssueComment: ["GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    listForPullRequestReviewComment: ["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    listForTeamDiscussionCommentInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }],
    listForTeamDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions", {
      mediaType: {
        previews: ["squirrel-girl"]
      }
    }]
  },
  repos: {
    acceptInvitation: ["PATCH /user/repository_invitations/{invitation_id}"],
    addAppAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
      mapToData: "apps"
    }],
    addCollaborator: ["PUT /repos/{owner}/{repo}/collaborators/{username}"],
    addStatusCheckContexts: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
      mapToData: "contexts"
    }],
    addTeamAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
      mapToData: "teams"
    }],
    addUserAccessRestrictions: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
      mapToData: "users"
    }],
    checkCollaborator: ["GET /repos/{owner}/{repo}/collaborators/{username}"],
    checkVulnerabilityAlerts: ["GET /repos/{owner}/{repo}/vulnerability-alerts", {
      mediaType: {
        previews: ["dorian"]
      }
    }],
    compareCommits: ["GET /repos/{owner}/{repo}/compare/{base}...{head}"],
    createCommitComment: ["POST /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
    createCommitSignatureProtection: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
      mediaType: {
        previews: ["zzzax"]
      }
    }],
    createCommitStatus: ["POST /repos/{owner}/{repo}/statuses/{sha}"],
    createDeployKey: ["POST /repos/{owner}/{repo}/keys"],
    createDeployment: ["POST /repos/{owner}/{repo}/deployments"],
    createDeploymentStatus: ["POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
    createDispatchEvent: ["POST /repos/{owner}/{repo}/dispatches"],
    createForAuthenticatedUser: ["POST /user/repos"],
    createFork: ["POST /repos/{owner}/{repo}/forks"],
    createInOrg: ["POST /orgs/{org}/repos"],
    createOrUpdateFileContents: ["PUT /repos/{owner}/{repo}/contents/{path}"],
    createPagesSite: ["POST /repos/{owner}/{repo}/pages", {
      mediaType: {
        previews: ["switcheroo"]
      }
    }],
    createRelease: ["POST /repos/{owner}/{repo}/releases"],
    createUsingTemplate: ["POST /repos/{template_owner}/{template_repo}/generate", {
      mediaType: {
        previews: ["baptiste"]
      }
    }],
    createWebhook: ["POST /repos/{owner}/{repo}/hooks"],
    declineInvitation: ["DELETE /user/repository_invitations/{invitation_id}"],
    delete: ["DELETE /repos/{owner}/{repo}"],
    deleteAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],
    deleteAdminBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
    deleteBranchProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"],
    deleteCommitComment: ["DELETE /repos/{owner}/{repo}/comments/{comment_id}"],
    deleteCommitSignatureProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
      mediaType: {
        previews: ["zzzax"]
      }
    }],
    deleteDeployKey: ["DELETE /repos/{owner}/{repo}/keys/{key_id}"],
    deleteDeployment: ["DELETE /repos/{owner}/{repo}/deployments/{deployment_id}"],
    deleteFile: ["DELETE /repos/{owner}/{repo}/contents/{path}"],
    deleteInvitation: ["DELETE /repos/{owner}/{repo}/invitations/{invitation_id}"],
    deletePagesSite: ["DELETE /repos/{owner}/{repo}/pages", {
      mediaType: {
        previews: ["switcheroo"]
      }
    }],
    deletePullRequestReviewProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
    deleteRelease: ["DELETE /repos/{owner}/{repo}/releases/{release_id}"],
    deleteReleaseAsset: ["DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}"],
    deleteWebhook: ["DELETE /repos/{owner}/{repo}/hooks/{hook_id}"],
    disableAutomatedSecurityFixes: ["DELETE /repos/{owner}/{repo}/automated-security-fixes", {
      mediaType: {
        previews: ["london"]
      }
    }],
    disableVulnerabilityAlerts: ["DELETE /repos/{owner}/{repo}/vulnerability-alerts", {
      mediaType: {
        previews: ["dorian"]
      }
    }],
    downloadArchive: ["GET /repos/{owner}/{repo}/{archive_format}/{ref}"],
    enableAutomatedSecurityFixes: ["PUT /repos/{owner}/{repo}/automated-security-fixes", {
      mediaType: {
        previews: ["london"]
      }
    }],
    enableVulnerabilityAlerts: ["PUT /repos/{owner}/{repo}/vulnerability-alerts", {
      mediaType: {
        previews: ["dorian"]
      }
    }],
    get: ["GET /repos/{owner}/{repo}"],
    getAccessRestrictions: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],
    getAdminBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
    getAllStatusCheckContexts: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts"],
    getAllTopics: ["GET /repos/{owner}/{repo}/topics", {
      mediaType: {
        previews: ["mercy"]
      }
    }],
    getAppsWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps"],
    getBranch: ["GET /repos/{owner}/{repo}/branches/{branch}"],
    getBranchProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection"],
    getClones: ["GET /repos/{owner}/{repo}/traffic/clones"],
    getCodeFrequencyStats: ["GET /repos/{owner}/{repo}/stats/code_frequency"],
    getCollaboratorPermissionLevel: ["GET /repos/{owner}/{repo}/collaborators/{username}/permission"],
    getCombinedStatusForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/status"],
    getCommit: ["GET /repos/{owner}/{repo}/commits/{ref}"],
    getCommitActivityStats: ["GET /repos/{owner}/{repo}/stats/commit_activity"],
    getCommitComment: ["GET /repos/{owner}/{repo}/comments/{comment_id}"],
    getCommitSignatureProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures", {
      mediaType: {
        previews: ["zzzax"]
      }
    }],
    getCommunityProfileMetrics: ["GET /repos/{owner}/{repo}/community/profile", {
      mediaType: {
        previews: ["black-panther"]
      }
    }],
    getContent: ["GET /repos/{owner}/{repo}/contents/{path}"],
    getContributorsStats: ["GET /repos/{owner}/{repo}/stats/contributors"],
    getDeployKey: ["GET /repos/{owner}/{repo}/keys/{key_id}"],
    getDeployment: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}"],
    getDeploymentStatus: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}"],
    getLatestPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/latest"],
    getLatestRelease: ["GET /repos/{owner}/{repo}/releases/latest"],
    getPages: ["GET /repos/{owner}/{repo}/pages"],
    getPagesBuild: ["GET /repos/{owner}/{repo}/pages/builds/{build_id}"],
    getParticipationStats: ["GET /repos/{owner}/{repo}/stats/participation"],
    getPullRequestReviewProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
    getPunchCardStats: ["GET /repos/{owner}/{repo}/stats/punch_card"],
    getReadme: ["GET /repos/{owner}/{repo}/readme"],
    getRelease: ["GET /repos/{owner}/{repo}/releases/{release_id}"],
    getReleaseAsset: ["GET /repos/{owner}/{repo}/releases/assets/{asset_id}"],
    getReleaseByTag: ["GET /repos/{owner}/{repo}/releases/tags/{tag}"],
    getStatusChecksProtection: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
    getTeamsWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams"],
    getTopPaths: ["GET /repos/{owner}/{repo}/traffic/popular/paths"],
    getTopReferrers: ["GET /repos/{owner}/{repo}/traffic/popular/referrers"],
    getUsersWithAccessToProtectedBranch: ["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users"],
    getViews: ["GET /repos/{owner}/{repo}/traffic/views"],
    getWebhook: ["GET /repos/{owner}/{repo}/hooks/{hook_id}"],
    listBranches: ["GET /repos/{owner}/{repo}/branches"],
    listBranchesForHeadCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head", {
      mediaType: {
        previews: ["groot"]
      }
    }],
    listCollaborators: ["GET /repos/{owner}/{repo}/collaborators"],
    listCommentsForCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/comments"],
    listCommitCommentsForRepo: ["GET /repos/{owner}/{repo}/comments"],
    listCommitStatusesForRef: ["GET /repos/{owner}/{repo}/commits/{ref}/statuses"],
    listCommits: ["GET /repos/{owner}/{repo}/commits"],
    listContributors: ["GET /repos/{owner}/{repo}/contributors"],
    listDeployKeys: ["GET /repos/{owner}/{repo}/keys"],
    listDeploymentStatuses: ["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],
    listDeployments: ["GET /repos/{owner}/{repo}/deployments"],
    listForAuthenticatedUser: ["GET /user/repos"],
    listForOrg: ["GET /orgs/{org}/repos"],
    listForUser: ["GET /users/{username}/repos"],
    listForks: ["GET /repos/{owner}/{repo}/forks"],
    listInvitations: ["GET /repos/{owner}/{repo}/invitations"],
    listInvitationsForAuthenticatedUser: ["GET /user/repository_invitations"],
    listLanguages: ["GET /repos/{owner}/{repo}/languages"],
    listPagesBuilds: ["GET /repos/{owner}/{repo}/pages/builds"],
    listPublic: ["GET /repositories"],
    listPullRequestsAssociatedWithCommit: ["GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls", {
      mediaType: {
        previews: ["groot"]
      }
    }],
    listReleaseAssets: ["GET /repos/{owner}/{repo}/releases/{release_id}/assets"],
    listReleases: ["GET /repos/{owner}/{repo}/releases"],
    listTags: ["GET /repos/{owner}/{repo}/tags"],
    listTeams: ["GET /repos/{owner}/{repo}/teams"],
    listWebhooks: ["GET /repos/{owner}/{repo}/hooks"],
    merge: ["POST /repos/{owner}/{repo}/merges"],
    pingWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/pings"],
    removeAppAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
      mapToData: "apps"
    }],
    removeCollaborator: ["DELETE /repos/{owner}/{repo}/collaborators/{username}"],
    removeStatusCheckContexts: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
      mapToData: "contexts"
    }],
    removeStatusCheckProtection: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
    removeTeamAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
      mapToData: "teams"
    }],
    removeUserAccessRestrictions: ["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
      mapToData: "users"
    }],
    replaceAllTopics: ["PUT /repos/{owner}/{repo}/topics", {
      mediaType: {
        previews: ["mercy"]
      }
    }],
    requestPagesBuild: ["POST /repos/{owner}/{repo}/pages/builds"],
    setAdminBranchProtection: ["POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],
    setAppAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps", {}, {
      mapToData: "apps"
    }],
    setStatusCheckContexts: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts", {}, {
      mapToData: "contexts"
    }],
    setTeamAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams", {}, {
      mapToData: "teams"
    }],
    setUserAccessRestrictions: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users", {}, {
      mapToData: "users"
    }],
    testPushWebhook: ["POST /repos/{owner}/{repo}/hooks/{hook_id}/tests"],
    transfer: ["POST /repos/{owner}/{repo}/transfer"],
    update: ["PATCH /repos/{owner}/{repo}"],
    updateBranchProtection: ["PUT /repos/{owner}/{repo}/branches/{branch}/protection"],
    updateCommitComment: ["PATCH /repos/{owner}/{repo}/comments/{comment_id}"],
    updateInformationAboutPagesSite: ["PUT /repos/{owner}/{repo}/pages"],
    updateInvitation: ["PATCH /repos/{owner}/{repo}/invitations/{invitation_id}"],
    updatePullRequestReviewProtection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],
    updateRelease: ["PATCH /repos/{owner}/{repo}/releases/{release_id}"],
    updateReleaseAsset: ["PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}"],
    updateStatusCheckPotection: ["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],
    updateWebhook: ["PATCH /repos/{owner}/{repo}/hooks/{hook_id}"],
    uploadReleaseAsset: ["POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}", {
      baseUrl: "https://uploads.github.com"
    }]
  },
  search: {
    code: ["GET /search/code"],
    commits: ["GET /search/commits", {
      mediaType: {
        previews: ["cloak"]
      }
    }],
    issuesAndPullRequests: ["GET /search/issues"],
    labels: ["GET /search/labels"],
    repos: ["GET /search/repositories"],
    topics: ["GET /search/topics", {
      mediaType: {
        previews: ["mercy"]
      }
    }],
    users: ["GET /search/users"]
  },
  teams: {
    addOrUpdateMembershipForUserInOrg: ["PUT /orgs/{org}/teams/{team_slug}/memberships/{username}"],
    addOrUpdateProjectPermissionsInOrg: ["PUT /orgs/{org}/teams/{team_slug}/projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    addOrUpdateRepoPermissionsInOrg: ["PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
    checkPermissionsForProjectInOrg: ["GET /orgs/{org}/teams/{team_slug}/projects/{project_id}", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    checkPermissionsForRepoInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
    create: ["POST /orgs/{org}/teams"],
    createDiscussionCommentInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],
    createDiscussionInOrg: ["POST /orgs/{org}/teams/{team_slug}/discussions"],
    deleteDiscussionCommentInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
    deleteDiscussionInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
    deleteInOrg: ["DELETE /orgs/{org}/teams/{team_slug}"],
    getByName: ["GET /orgs/{org}/teams/{team_slug}"],
    getDiscussionCommentInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
    getDiscussionInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
    getMembershipForUserInOrg: ["GET /orgs/{org}/teams/{team_slug}/memberships/{username}"],
    list: ["GET /orgs/{org}/teams"],
    listChildInOrg: ["GET /orgs/{org}/teams/{team_slug}/teams"],
    listDiscussionCommentsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],
    listDiscussionsInOrg: ["GET /orgs/{org}/teams/{team_slug}/discussions"],
    listForAuthenticatedUser: ["GET /user/teams"],
    listMembersInOrg: ["GET /orgs/{org}/teams/{team_slug}/members"],
    listPendingInvitationsInOrg: ["GET /orgs/{org}/teams/{team_slug}/invitations"],
    listProjectsInOrg: ["GET /orgs/{org}/teams/{team_slug}/projects", {
      mediaType: {
        previews: ["inertia"]
      }
    }],
    listReposInOrg: ["GET /orgs/{org}/teams/{team_slug}/repos"],
    removeMembershipForUserInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}"],
    removeProjectInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/projects/{project_id}"],
    removeRepoInOrg: ["DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],
    updateDiscussionCommentInOrg: ["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],
    updateDiscussionInOrg: ["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],
    updateInOrg: ["PATCH /orgs/{org}/teams/{team_slug}"]
  },
  users: {
    addEmailForAuthenticated: ["POST /user/emails"],
    block: ["PUT /user/blocks/{username}"],
    checkBlocked: ["GET /user/blocks/{username}"],
    checkFollowingForUser: ["GET /users/{username}/following/{target_user}"],
    checkPersonIsFollowedByAuthenticated: ["GET /user/following/{username}"],
    createGpgKeyForAuthenticated: ["POST /user/gpg_keys"],
    createPublicSshKeyForAuthenticated: ["POST /user/keys"],
    deleteEmailForAuthenticated: ["DELETE /user/emails"],
    deleteGpgKeyForAuthenticated: ["DELETE /user/gpg_keys/{gpg_key_id}"],
    deletePublicSshKeyForAuthenticated: ["DELETE /user/keys/{key_id}"],
    follow: ["PUT /user/following/{username}"],
    getAuthenticated: ["GET /user"],
    getByUsername: ["GET /users/{username}"],
    getContextForUser: ["GET /users/{username}/hovercard"],
    getGpgKeyForAuthenticated: ["GET /user/gpg_keys/{gpg_key_id}"],
    getPublicSshKeyForAuthenticated: ["GET /user/keys/{key_id}"],
    list: ["GET /users"],
    listBlockedByAuthenticated: ["GET /user/blocks"],
    listEmailsForAuthenticated: ["GET /user/emails"],
    listFollowedByAuthenticated: ["GET /user/following"],
    listFollowersForAuthenticatedUser: ["GET /user/followers"],
    listFollowersForUser: ["GET /users/{username}/followers"],
    listFollowingForUser: ["GET /users/{username}/following"],
    listGpgKeysForAuthenticated: ["GET /user/gpg_keys"],
    listGpgKeysForUser: ["GET /users/{username}/gpg_keys"],
    listPublicEmailsForAuthenticated: ["GET /user/public_emails"],
    listPublicKeysForUser: ["GET /users/{username}/keys"],
    listPublicSshKeysForAuthenticated: ["GET /user/keys"],
    setPrimaryEmailVisibilityForAuthenticated: ["PATCH /user/email/visibility"],
    unblock: ["DELETE /user/blocks/{username}"],
    unfollow: ["DELETE /user/following/{username}"],
    updateAuthenticated: ["PATCH /user"]
  }
};

const VERSION = "4.1.4";

function endpointsToMethods(octokit, endpointsMap) {
  const newMethods = {};

  for (const [scope, endpoints] of Object.entries(endpointsMap)) {
    for (const [methodName, endpoint] of Object.entries(endpoints)) {
      const [route, defaults, decorations] = endpoint;
      const [method, url] = route.split(/ /);
      const endpointDefaults = Object.assign({
        method,
        url
      }, defaults);

      if (!newMethods[scope]) {
        newMethods[scope] = {};
      }

      const scopeMethods = newMethods[scope];

      if (decorations) {
        scopeMethods[methodName] = decorate(octokit, scope, methodName, endpointDefaults, decorations);
        continue;
      }

      scopeMethods[methodName] = octokit.request.defaults(endpointDefaults);
    }
  }

  return newMethods;
}

function decorate(octokit, scope, methodName, defaults, decorations) {
  const requestWithDefaults = octokit.request.defaults(defaults);
  /* istanbul ignore next */

  function withDecorations(...args) {
    // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488
    let options = requestWithDefaults.endpoint.merge(...args); // There are currently no other decorations than `.mapToData`

    if (decorations.mapToData) {
      options = Object.assign({}, options, {
        data: options[decorations.mapToData],
        [decorations.mapToData]: undefined
      });
      return requestWithDefaults(options);
    }

    if (decorations.renamed) {
      const [newScope, newMethodName] = decorations.renamed;
      octokit.log.warn(`octokit.${scope}.${methodName}() has been renamed to octokit.${newScope}.${newMethodName}()`);
    }

    if (decorations.deprecated) {
      octokit.log.warn(decorations.deprecated);
    }

    if (decorations.renamedParameters) {
      // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488
      const options = requestWithDefaults.endpoint.merge(...args);

      for (const [name, alias] of Object.entries(decorations.renamedParameters)) {
        if (name in options) {
          octokit.log.warn(`"${name}" parameter is deprecated for "octokit.${scope}.${methodName}()". Use "${alias}" instead`);

          if (!(alias in options)) {
            options[alias] = options[name];
          }

          delete options[name];
        }
      }

      return requestWithDefaults(options);
    } // @ts-ignore https://github.com/microsoft/TypeScript/issues/25488


    return requestWithDefaults(...args);
  }

  return Object.assign(withDecorations, requestWithDefaults);
}

/**
 * This plugin is a 1:1 copy of internal @octokit/rest plugins. The primary
 * goal is to rebuild @octokit/rest on top of @octokit/core. Once that is
 * done, we will remove the registerEndpoints methods and return the methods
 * directly as with the other plugins. At that point we will also remove the
 * legacy workarounds and deprecations.
 *
 * See the plan at
 * https://github.com/octokit/plugin-rest-endpoint-methods.js/pull/1
 */

function restEndpointMethods(octokit) {
  return endpointsToMethods(octokit, Endpoints);
}
restEndpointMethods.VERSION = VERSION;

exports.restEndpointMethods = restEndpointMethods;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 537:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var deprecation = __webpack_require__(8932);
var once = _interopDefault(__webpack_require__(1223));

const logOnce = once(deprecation => console.warn(deprecation));
/**
 * Error with extra properties to help with debugging
 */

class RequestError extends Error {
  constructor(message, statusCode, options) {
    super(message); // Maintains proper stack trace (only available on V8)

    /* istanbul ignore next */

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = "HttpError";
    this.status = statusCode;
    Object.defineProperty(this, "code", {
      get() {
        logOnce(new deprecation.Deprecation("[@octokit/request-error] `error.code` is deprecated, use `error.status`."));
        return statusCode;
      }

    });
    this.headers = options.headers || {}; // redact request credentials without mutating original request options

    const requestCopy = Object.assign({}, options.request);

    if (options.request.headers.authorization) {
      requestCopy.headers = Object.assign({}, options.request.headers, {
        authorization: options.request.headers.authorization.replace(/ .*$/, " [REDACTED]")
      });
    }

    requestCopy.url = requestCopy.url // client_id & client_secret can be passed as URL query parameters to increase rate limit
    // see https://developer.github.com/v3/#increasing-the-unauthenticated-rate-limit-for-oauth-applications
    .replace(/\bclient_secret=\w+/g, "client_secret=[REDACTED]") // OAuth tokens can be passed as URL query parameters, although it is not recommended
    // see https://developer.github.com/v3/#oauth2-token-sent-in-a-header
    .replace(/\baccess_token=\w+/g, "access_token=[REDACTED]");
    this.request = requestCopy;
  }

}

exports.RequestError = RequestError;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 6234:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var endpoint = __webpack_require__(9440);
var universalUserAgent = __webpack_require__(5030);
var isPlainObject = _interopDefault(__webpack_require__(8840));
var nodeFetch = _interopDefault(__webpack_require__(467));
var requestError = __webpack_require__(537);

const VERSION = "5.4.7";

function getBufferResponse(response) {
  return response.arrayBuffer();
}

function fetchWrapper(requestOptions) {
  if (isPlainObject(requestOptions.body) || Array.isArray(requestOptions.body)) {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  let headers = {};
  let status;
  let url;
  const fetch = requestOptions.request && requestOptions.request.fetch || nodeFetch;
  return fetch(requestOptions.url, Object.assign({
    method: requestOptions.method,
    body: requestOptions.body,
    headers: requestOptions.headers,
    redirect: requestOptions.redirect
  }, requestOptions.request)).then(response => {
    url = response.url;
    status = response.status;

    for (const keyAndValue of response.headers) {
      headers[keyAndValue[0]] = keyAndValue[1];
    }

    if (status === 204 || status === 205) {
      return;
    } // GitHub API returns 200 for HEAD requests


    if (requestOptions.method === "HEAD") {
      if (status < 400) {
        return;
      }

      throw new requestError.RequestError(response.statusText, status, {
        headers,
        request: requestOptions
      });
    }

    if (status === 304) {
      throw new requestError.RequestError("Not modified", status, {
        headers,
        request: requestOptions
      });
    }

    if (status >= 400) {
      return response.text().then(message => {
        const error = new requestError.RequestError(message, status, {
          headers,
          request: requestOptions
        });

        try {
          let responseBody = JSON.parse(error.message);
          Object.assign(error, responseBody);
          let errors = responseBody.errors; // Assumption `errors` would always be in Array format

          error.message = error.message + ": " + errors.map(JSON.stringify).join(", ");
        } catch (e) {// ignore, see octokit/rest.js#684
        }

        throw error;
      });
    }

    const contentType = response.headers.get("content-type");

    if (/application\/json/.test(contentType)) {
      return response.json();
    }

    if (!contentType || /^text\/|charset=utf-8$/.test(contentType)) {
      return response.text();
    }

    return getBufferResponse(response);
  }).then(data => {
    return {
      status,
      url,
      headers,
      data
    };
  }).catch(error => {
    if (error instanceof requestError.RequestError) {
      throw error;
    }

    throw new requestError.RequestError(error.message, 500, {
      headers,
      request: requestOptions
    });
  });
}

function withDefaults(oldEndpoint, newDefaults) {
  const endpoint = oldEndpoint.defaults(newDefaults);

  const newApi = function (route, parameters) {
    const endpointOptions = endpoint.merge(route, parameters);

    if (!endpointOptions.request || !endpointOptions.request.hook) {
      return fetchWrapper(endpoint.parse(endpointOptions));
    }

    const request = (route, parameters) => {
      return fetchWrapper(endpoint.parse(endpoint.merge(route, parameters)));
    };

    Object.assign(request, {
      endpoint,
      defaults: withDefaults.bind(null, endpoint)
    });
    return endpointOptions.request.hook(request, endpointOptions);
  };

  return Object.assign(newApi, {
    endpoint,
    defaults: withDefaults.bind(null, endpoint)
  });
}

const request = withDefaults(endpoint.endpoint, {
  headers: {
    "user-agent": `octokit-request.js/${VERSION} ${universalUserAgent.getUserAgent()}`
  }
});

exports.request = request;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 3682:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var register = __webpack_require__(4670)
var addHook = __webpack_require__(5549)
var removeHook = __webpack_require__(6819)

// bind with array of arguments: https://stackoverflow.com/a/21792913
var bind = Function.bind
var bindable = bind.bind(bind)

function bindApi (hook, state, name) {
  var removeHookRef = bindable(removeHook, null).apply(null, name ? [state, name] : [state])
  hook.api = { remove: removeHookRef }
  hook.remove = removeHookRef

  ;['before', 'error', 'after', 'wrap'].forEach(function (kind) {
    var args = name ? [state, kind, name] : [state, kind]
    hook[kind] = hook.api[kind] = bindable(addHook, null).apply(null, args)
  })
}

function HookSingular () {
  var singularHookName = 'h'
  var singularHookState = {
    registry: {}
  }
  var singularHook = register.bind(null, singularHookState, singularHookName)
  bindApi(singularHook, singularHookState, singularHookName)
  return singularHook
}

function HookCollection () {
  var state = {
    registry: {}
  }

  var hook = register.bind(null, state)
  bindApi(hook, state)

  return hook
}

var collectionHookDeprecationMessageDisplayed = false
function Hook () {
  if (!collectionHookDeprecationMessageDisplayed) {
    console.warn('[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4')
    collectionHookDeprecationMessageDisplayed = true
  }
  return HookCollection()
}

Hook.Singular = HookSingular.bind()
Hook.Collection = HookCollection.bind()

module.exports = Hook
// expose constructors as a named property for TypeScript
module.exports.Hook = Hook
module.exports.Singular = Hook.Singular
module.exports.Collection = Hook.Collection


/***/ }),

/***/ 5549:
/***/ ((module) => {

module.exports = addHook

function addHook (state, kind, name, hook) {
  var orig = hook
  if (!state.registry[name]) {
    state.registry[name] = []
  }

  if (kind === 'before') {
    hook = function (method, options) {
      return Promise.resolve()
        .then(orig.bind(null, options))
        .then(method.bind(null, options))
    }
  }

  if (kind === 'after') {
    hook = function (method, options) {
      var result
      return Promise.resolve()
        .then(method.bind(null, options))
        .then(function (result_) {
          result = result_
          return orig(result, options)
        })
        .then(function () {
          return result
        })
    }
  }

  if (kind === 'error') {
    hook = function (method, options) {
      return Promise.resolve()
        .then(method.bind(null, options))
        .catch(function (error) {
          return orig(error, options)
        })
    }
  }

  state.registry[name].push({
    hook: hook,
    orig: orig
  })
}


/***/ }),

/***/ 4670:
/***/ ((module) => {

module.exports = register

function register (state, name, method, options) {
  if (typeof method !== 'function') {
    throw new Error('method for before hook must be a function')
  }

  if (!options) {
    options = {}
  }

  if (Array.isArray(name)) {
    return name.reverse().reduce(function (callback, name) {
      return register.bind(null, state, name, callback, options)
    }, method)()
  }

  return Promise.resolve()
    .then(function () {
      if (!state.registry[name]) {
        return method(options)
      }

      return (state.registry[name]).reduce(function (method, registered) {
        return registered.hook.bind(null, method, options)
      }, method)()
    })
}


/***/ }),

/***/ 6819:
/***/ ((module) => {

module.exports = removeHook

function removeHook (state, name, method) {
  if (!state.registry[name]) {
    return
  }

  var index = state.registry[name]
    .map(function (registered) { return registered.orig })
    .indexOf(method)

  if (index === -1) {
    return
  }

  state.registry[name].splice(index, 1)
}


/***/ }),

/***/ 4794:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var Buffer = __webpack_require__(4293).Buffer;

var CRC_TABLE = [
  0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419,
  0x706af48f, 0xe963a535, 0x9e6495a3, 0x0edb8832, 0x79dcb8a4,
  0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07,
  0x90bf1d91, 0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de,
  0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7, 0x136c9856,
  0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9,
  0xfa0f3d63, 0x8d080df5, 0x3b6e20c8, 0x4c69105e, 0xd56041e4,
  0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b,
  0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3,
  0x45df5c75, 0xdcd60dcf, 0xabd13d59, 0x26d930ac, 0x51de003a,
  0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599,
  0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924,
  0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d, 0x76dc4190,
  0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f,
  0x9fbfe4a5, 0xe8b8d433, 0x7807c9a2, 0x0f00f934, 0x9609a88e,
  0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01,
  0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed,
  0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950,
  0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3,
  0xfbd44c65, 0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2,
  0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a,
  0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5,
  0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa, 0xbe0b1010,
  0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f,
  0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17,
  0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6,
  0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615,
  0x73dc1683, 0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8,
  0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1, 0xf00f9344,
  0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb,
  0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a,
  0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5,
  0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1,
  0xa6bc5767, 0x3fb506dd, 0x48b2364b, 0xd80d2bda, 0xaf0a1b4c,
  0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef,
  0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236,
  0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe,
  0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31,
  0x2cd99e8b, 0x5bdeae1d, 0x9b64c2b0, 0xec63f226, 0x756aa39c,
  0x026d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713,
  0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b,
  0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21, 0x86d3d2d4, 0xf1d4e242,
  0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1,
  0x18b74777, 0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c,
  0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45, 0xa00ae278,
  0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7,
  0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc, 0x40df0b66,
  0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
  0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605,
  0xcdd70693, 0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8,
  0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b,
  0x2d02ef8d
];

if (typeof Int32Array !== 'undefined') {
  CRC_TABLE = new Int32Array(CRC_TABLE);
}

function ensureBuffer(input) {
  if (Buffer.isBuffer(input)) {
    return input;
  }

  var hasNewBufferAPI =
      typeof Buffer.alloc === "function" &&
      typeof Buffer.from === "function";

  if (typeof input === "number") {
    return hasNewBufferAPI ? Buffer.alloc(input) : new Buffer(input);
  }
  else if (typeof input === "string") {
    return hasNewBufferAPI ? Buffer.from(input) : new Buffer(input);
  }
  else {
    throw new Error("input must be buffer, number, or string, received " +
                    typeof input);
  }
}

function bufferizeInt(num) {
  var tmp = ensureBuffer(4);
  tmp.writeInt32BE(num, 0);
  return tmp;
}

function _crc32(buf, previous) {
  buf = ensureBuffer(buf);
  if (Buffer.isBuffer(previous)) {
    previous = previous.readUInt32BE(0);
  }
  var crc = ~~previous ^ -1;
  for (var n = 0; n < buf.length; n++) {
    crc = CRC_TABLE[(crc ^ buf[n]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1);
}

function crc32() {
  return bufferizeInt(_crc32.apply(null, arguments));
}
crc32.signed = function () {
  return _crc32.apply(null, arguments);
};
crc32.unsigned = function () {
  return _crc32.apply(null, arguments) >>> 0;
};

module.exports = crc32;


/***/ }),

/***/ 7626:
/***/ ((module) => {

/*!
 *  Copyright 2008 Fair Oaks Labs, Inc.
 *  All rights reserved.
 */

// Utility object:  Encode/Decode C-style binary primitives to/from octet arrays
function BufferPack() {
  // Module-level (private) variables
  var el,  bBE = false, m = this;

  // Raw byte arrays
  m._DeArray = function (a, p, l) {
    return [a.slice(p,p+l)];
  };
  m._EnArray = function (a, p, l, v) {
    for (var i = 0; i < l; a[p+i] = v[i]?v[i]:0, i++);
  };

  // ASCII characters
  m._DeChar = function (a, p) {
    return String.fromCharCode(a[p]);
  };
  m._EnChar = function (a, p, v) {
    a[p] = v.charCodeAt(0);
  };

  // Little-endian (un)signed N-byte integers
  m._DeInt = function (a, p) {
    var lsb = bBE?(el.len-1):0, nsb = bBE?-1:1, stop = lsb+nsb*el.len, rv, i, f;
    for (rv = 0, i = lsb, f = 1; i != stop; rv+=(a[p+i]*f), i+=nsb, f*=256);
    if (el.bSigned && (rv & Math.pow(2, el.len*8-1))) {
      rv -= Math.pow(2, el.len*8);
    }
    return rv;
  };
  m._EnInt = function (a, p, v) {
    var lsb = bBE?(el.len-1):0, nsb = bBE?-1:1, stop = lsb+nsb*el.len, i;
    v = (v<el.min)?el.min:(v>el.max)?el.max:v;
    for (i = lsb; i != stop; a[p+i]=v&0xff, i+=nsb, v>>=8);
  };

  // ASCII character strings
  m._DeString = function (a, p, l) {
    for (var rv = new Array(l), i = 0; i < l; rv[i] = String.fromCharCode(a[p+i]), i++);
    return rv.join('');
  };
  m._EnString = function (a, p, l, v) {
    for (var t, i = 0; i < l; a[p+i] = (t=v.charCodeAt(i))?t:0, i++);
  };

  // ASCII character strings null terminated
  m._DeNullString = function (a, p, l, v) {
    var str = m._DeString(a, p, l, v);
    return str.substring(0, str.length - 1);
  };

  // Little-endian N-bit IEEE 754 floating point
  m._De754 = function (a, p) {
    var s, e, m, i, d, nBits, mLen, eLen, eBias, eMax;
    mLen = el.mLen, eLen = el.len*8-el.mLen-1, eMax = (1<<eLen)-1, eBias = eMax>>1;

    i = bBE?0:(el.len-1); d = bBE?1:-1; s = a[p+i]; i+=d; nBits = -7;
    for (e = s&((1<<(-nBits))-1), s>>=(-nBits), nBits += eLen; nBits > 0; e=e*256+a[p+i], i+=d, nBits-=8);
    for (m = e&((1<<(-nBits))-1), e>>=(-nBits), nBits += mLen; nBits > 0; m=m*256+a[p+i], i+=d, nBits-=8);

    switch (e) {
    case 0:
      // Zero, or denormalized number
      e = 1-eBias;
      break;
    case eMax:
      // NaN, or +/-Infinity
      return m?NaN:((s?-1:1)*Infinity);
    default:
      // Normalized number
      m = m + Math.pow(2, mLen);
      e = e - eBias;
      break;
    }
    return (s?-1:1) * m * Math.pow(2, e-mLen);
  };
  m._En754 = function (a, p, v) {
    var s, e, m, i, d, c, mLen, eLen, eBias, eMax;
    mLen = el.mLen, eLen = el.len*8-el.mLen-1, eMax = (1<<eLen)-1, eBias = eMax>>1;

    s = v<0?1:0;
    v = Math.abs(v);
    if (isNaN(v) || (v == Infinity)) {
      m = isNaN(v)?1:0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(v)/Math.LN2);			// Calculate log2 of the value

      if (v*(c = Math.pow(2, -e)) < 1) {
        e--; c*=2;						// Math.log() isn't 100% reliable
      }

      // Round by adding 1/2 the significand's LSD
      if (e+eBias >= 1) {
        v += el.rt/c;                                           // Normalized:  mLen significand digits
      } else {
        v += el.rt*Math.pow(2, 1-eBias);                        // Denormalized:  <= mLen significand digits
      }

      if (v*c >= 2) {
        e++; c/=2;						// Rounding can increment the exponent
      }

      if (e+eBias >= eMax) {
        // Overflow
        m = 0;
        e = eMax;
      } else if (e+eBias >= 1) {
        // Normalized - term order matters, as Math.pow(2, 52-e) and v*Math.pow(2, 52) can overflow
        m = (v*c-1)*Math.pow(2, mLen);
        e = e + eBias;
      } else {
        // Denormalized - also catches the '0' case, somewhat by chance
        m = v*Math.pow(2, eBias-1)*Math.pow(2, mLen);
        e = 0;
      }
    }

    for (i = bBE?(el.len-1):0, d=bBE?-1:1; mLen >= 8; a[p+i]=m&0xff, i+=d, m/=256, mLen-=8);
    for (e=(e<<mLen)|m, eLen+=mLen; eLen > 0; a[p+i]=e&0xff, i+=d, e/=256, eLen-=8);
    a[p+i-d] |= s*128;
  };

  // Class data
  m._sPattern = '(\\d+)?([AxcbBhHsSfdiIlL])(\\(([a-zA-Z0-9]+)\\))?';
  m._lenLut = {'A': 1, 'x': 1, 'c': 1, 'b': 1, 'B': 1, 'h': 2, 'H': 2, 's': 1,
               'S': 1, 'f': 4, 'd': 8, 'i': 4, 'I': 4, 'l': 4, 'L': 4};
  m._elLut = {'A': {en: m._EnArray, de: m._DeArray},
              's': {en: m._EnString, de: m._DeString},
              'S': {en: m._EnString, de: m._DeNullString},
              'c': {en: m._EnChar, de: m._DeChar},
              'b': {en: m._EnInt, de: m._DeInt, len: 1, bSigned: true, min: -Math.pow(2, 7), max: Math.pow(2, 7) - 1},
              'B': {en: m._EnInt, de: m._DeInt, len: 1, bSigned: false, min: 0, max: Math.pow(2, 8) - 1},
              'h': {en: m._EnInt, de: m._DeInt, len: 2, bSigned: true, min: -Math.pow(2, 15), max: Math.pow(2, 15) - 1},
              'H': {en: m._EnInt, de: m._DeInt, len: 2, bSigned: false, min: 0, max: Math.pow(2, 16) - 1},
              'i': {en: m._EnInt, de: m._DeInt, len: 4, bSigned: true, min: -Math.pow(2, 31), max: Math.pow(2, 31) - 1},
              'I': {en: m._EnInt, de: m._DeInt, len: 4, bSigned: false, min: 0, max: Math.pow(2, 32) - 1},
              'l': {en: m._EnInt, de: m._DeInt, len: 4, bSigned: true, min: -Math.pow(2, 31), max: Math.pow(2, 31) - 1},
              'L': {en: m._EnInt, de: m._DeInt, len: 4, bSigned: false, min: 0, max: Math.pow(2, 32) - 1},
              'f': {en: m._En754, de: m._De754, len: 4, mLen: 23, rt: Math.pow(2, -24) - Math.pow(2, -77)},
              'd': {en: m._En754, de: m._De754, len: 8, mLen: 52, rt: 0}};

  // Unpack a series of n elements of size s from array a at offset p with fxn
  m._UnpackSeries = function (n, s, a, p) {
    for (var fxn = el.de, rv = [], i = 0; i < n; rv.push(fxn(a, p+i*s)), i++);
    return rv;
  };

  // Pack a series of n elements of size s from array v at offset i to array a at offset p with fxn
  m._PackSeries = function (n, s, a, p, v, i) {
    for (var fxn = el.en, o = 0; o < n; fxn(a, p+o*s, v[i+o]), o++);
  };

  m._zip = function (keys, values) {
    var result = {};

    for (var i = 0; i < keys.length; i++) {
      result[keys[i]] = values[i];
    }

    return result;
  }

  // Unpack the octet array a, beginning at offset p, according to the fmt string
  m.unpack = function (fmt, a, p) {
    // Set the private bBE flag based on the format string - assume big-endianness
    bBE = (fmt.charAt(0) != '<');

    p = p?p:0;
    var re = new RegExp(this._sPattern, 'g');
    var m;
    var n;
    var s;
    var rk = [];
    var rv = [];
    
    while (m = re.exec(fmt)) {
      n = ((m[1]==undefined)||(m[1]==''))?1:parseInt(m[1]);

      if(m[2] === 'S') { // Null term string support
        n = 0; // Need to deal with empty  null term strings
        while(a[p + n] !== 0) {
          n++;
        }
        n++; // Add one for null byte
      }

      s = this._lenLut[m[2]];

      if ((p + n*s) > a.length) {
        return undefined;
      }

      switch (m[2]) {
      case 'A': case 's': case 'S':
        rv.push(this._elLut[m[2]].de(a, p, n));
        break;
      case 'c': case 'b': case 'B': case 'h': case 'H':
      case 'i': case 'I': case 'l': case 'L': case 'f': case 'd':
        el = this._elLut[m[2]];
        rv.push(this._UnpackSeries(n, s, a, p));
        break;
      }

      rk.push(m[4]); // Push key on to array

      p += n*s;
    }   

    rv = Array.prototype.concat.apply([], rv)

    if(rk.indexOf(undefined) !== -1) {
      return rv;
    } else {
      return this._zip(rk, rv);
    }
  };

  // Pack the supplied values into the octet array a, beginning at offset p, according to the fmt string
  m.packTo = function (fmt, a, p, values) {
    // Set the private bBE flag based on the format string - assume big-endianness
    bBE = (fmt.charAt(0) != '<');

    var re = new RegExp(this._sPattern, 'g');
    var m;
    var n;
    var s;
    var i = 0;
    var j;

    while (m = re.exec(fmt)) {
      n = ((m[1]==undefined)||(m[1]==''))?1:parseInt(m[1]);

      // Null term string support
      if(m[2] === 'S') {
        n = values[i].length + 1; // Add one for null byte
      }

      s = this._lenLut[m[2]];

      if ((p + n*s) > a.length) {
        return false;
      }

      switch (m[2]) {
      case 'A': case 's': case 'S':
        if ((i + 1) > values.length) { return false; }
        this._elLut[m[2]].en(a, p, n, values[i]);
        i += 1;
        break;
      case 'c': case 'b': case 'B': case 'h': case 'H':
      case 'i': case 'I': case 'l': case 'L': case 'f': case 'd':
        el = this._elLut[m[2]];
        if ((i + n) > values.length) { return false; }
        this._PackSeries(n, s, a, p, values, i);
        i += n;
        break;
      case 'x':
        for (j = 0; j < n; j++) { a[p+j] = 0; }
        break;
      }
      p += n*s;
    }

    return a;
  };

  // Pack the supplied values into a new octet array, according to the fmt string
  m.pack = function (fmt, values) {
    return this.packTo(fmt, new Buffer(this.calcLength(fmt, values)), 0, values);
  };

  // Determine the number of bytes represented by the format string
  m.calcLength = function (format, values) {
    var re = new RegExp(this._sPattern, 'g'), m, sum = 0, i = 0;
    while (m = re.exec(format)) {
      var n = (((m[1]==undefined)||(m[1]==''))?1:parseInt(m[1])) * this._lenLut[m[2]];

      if(m[2] === 'S') {
        n = values[i].length + 1; // Add one for null byte
      }

      sum += n;
      i++;
    }
    return sum;
  };
};

module.exports = new BufferPack();


/***/ }),

/***/ 9835:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
 Copyright 2013-2014 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @license bytebuffer.js (c) 2015 Daniel Wirtz <dcode@dcode.io>
 * Backing buffer / Accessor: node Buffer
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/bytebuffer.js for details
 */
module.exports = (function() {
    "use strict";

    var buffer = __webpack_require__(4293),
        Buffer = buffer["Buffer"],
        Long = __webpack_require__(8884),
        memcpy = null; try { memcpy = __webpack_require__(2237); } catch (e) {}

    /**
     * Constructs a new ByteBuffer.
     * @class The swiss army knife for binary data in JavaScript.
     * @exports ByteBuffer
     * @constructor
     * @param {number=} capacity Initial capacity. Defaults to {@link ByteBuffer.DEFAULT_CAPACITY}.
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @expose
     */
    var ByteBuffer = function(capacity, littleEndian, noAssert) {
        if (typeof capacity === 'undefined')
            capacity = ByteBuffer.DEFAULT_CAPACITY;
        if (typeof littleEndian === 'undefined')
            littleEndian = ByteBuffer.DEFAULT_ENDIAN;
        if (typeof noAssert === 'undefined')
            noAssert = ByteBuffer.DEFAULT_NOASSERT;
        if (!noAssert) {
            capacity = capacity | 0;
            if (capacity < 0)
                throw RangeError("Illegal capacity");
            littleEndian = !!littleEndian;
            noAssert = !!noAssert;
        }

        /**
         * Backing node Buffer.
         * @type {!Buffer}
         * @expose
         */
        this.buffer = capacity === 0 ? EMPTY_BUFFER : new Buffer(capacity);

        /**
         * Absolute read/write offset.
         * @type {number}
         * @expose
         * @see ByteBuffer#flip
         * @see ByteBuffer#clear
         */
        this.offset = 0;

        /**
         * Marked offset.
         * @type {number}
         * @expose
         * @see ByteBuffer#mark
         * @see ByteBuffer#reset
         */
        this.markedOffset = -1;

        /**
         * Absolute limit of the contained data. Set to the backing buffer's capacity upon allocation.
         * @type {number}
         * @expose
         * @see ByteBuffer#flip
         * @see ByteBuffer#clear
         */
        this.limit = capacity;

        /**
         * Whether to use little endian byte order, defaults to `false` for big endian.
         * @type {boolean}
         * @expose
         */
        this.littleEndian = littleEndian;

        /**
         * Whether to skip assertions of offsets and values, defaults to `false`.
         * @type {boolean}
         * @expose
         */
        this.noAssert = noAssert;
    };

    /**
     * ByteBuffer version.
     * @type {string}
     * @const
     * @expose
     */
    ByteBuffer.VERSION = "5.0.1";

    /**
     * Little endian constant that can be used instead of its boolean value. Evaluates to `true`.
     * @type {boolean}
     * @const
     * @expose
     */
    ByteBuffer.LITTLE_ENDIAN = true;

    /**
     * Big endian constant that can be used instead of its boolean value. Evaluates to `false`.
     * @type {boolean}
     * @const
     * @expose
     */
    ByteBuffer.BIG_ENDIAN = false;

    /**
     * Default initial capacity of `16`.
     * @type {number}
     * @expose
     */
    ByteBuffer.DEFAULT_CAPACITY = 16;

    /**
     * Default endianess of `false` for big endian.
     * @type {boolean}
     * @expose
     */
    ByteBuffer.DEFAULT_ENDIAN = ByteBuffer.BIG_ENDIAN;

    /**
     * Default no assertions flag of `false`.
     * @type {boolean}
     * @expose
     */
    ByteBuffer.DEFAULT_NOASSERT = false;

    /**
     * A `Long` class for representing a 64-bit two's-complement integer value.
     * @type {!Long}
     * @const
     * @see https://npmjs.org/package/long
     * @expose
     */
    ByteBuffer.Long = Long;

    /**
     * @alias ByteBuffer.prototype
     * @inner
     */
    var ByteBufferPrototype = ByteBuffer.prototype;

    /**
     * An indicator used to reliably determine if an object is a ByteBuffer or not.
     * @type {boolean}
     * @const
     * @expose
     * @private
     */
    ByteBufferPrototype.__isByteBuffer__;

    Object.defineProperty(ByteBufferPrototype, "__isByteBuffer__", {
        value: true,
        enumerable: false,
        configurable: false
    });

    // helpers

    /**
     * @type {!Buffer}
     * @inner
     */
    var EMPTY_BUFFER = new Buffer(0);

    /**
     * String.fromCharCode reference for compile-time renaming.
     * @type {function(...number):string}
     * @inner
     */
    var stringFromCharCode = String.fromCharCode;

    /**
     * Creates a source function for a string.
     * @param {string} s String to read from
     * @returns {function():number|null} Source function returning the next char code respectively `null` if there are
     *  no more characters left.
     * @throws {TypeError} If the argument is invalid
     * @inner
     */
    function stringSource(s) {
        var i=0; return function() {
            return i < s.length ? s.charCodeAt(i++) : null;
        };
    }

    /**
     * Creates a destination function for a string.
     * @returns {function(number=):undefined|string} Destination function successively called with the next char code.
     *  Returns the final string when called without arguments.
     * @inner
     */
    function stringDestination() {
        var cs = [], ps = []; return function() {
            if (arguments.length === 0)
                return ps.join('')+stringFromCharCode.apply(String, cs);
            if (cs.length + arguments.length > 1024)
                ps.push(stringFromCharCode.apply(String, cs)),
                    cs.length = 0;
            Array.prototype.push.apply(cs, arguments);
        };
    }

    /**
     * Gets the accessor type.
     * @returns {Function} `Buffer` under node.js, `Uint8Array` respectively `DataView` in the browser (classes)
     * @expose
     */
    ByteBuffer.accessor = function() {
        return Buffer;
    };
    /**
     * Allocates a new ByteBuffer backed by a buffer of the specified capacity.
     * @param {number=} capacity Initial capacity. Defaults to {@link ByteBuffer.DEFAULT_CAPACITY}.
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer}
     * @expose
     */
    ByteBuffer.allocate = function(capacity, littleEndian, noAssert) {
        return new ByteBuffer(capacity, littleEndian, noAssert);
    };

    /**
     * Concatenates multiple ByteBuffers into one.
     * @param {!Array.<!ByteBuffer|!Buffer|!ArrayBuffer|!Uint8Array|string>} buffers Buffers to concatenate
     * @param {(string|boolean)=} encoding String encoding if `buffers` contains a string ("base64", "hex", "binary",
     *  defaults to "utf8")
     * @param {boolean=} littleEndian Whether to use little or big endian byte order for the resulting ByteBuffer. Defaults
     *  to {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values for the resulting ByteBuffer. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} Concatenated ByteBuffer
     * @expose
     */
    ByteBuffer.concat = function(buffers, encoding, littleEndian, noAssert) {
        if (typeof encoding === 'boolean' || typeof encoding !== 'string') {
            noAssert = littleEndian;
            littleEndian = encoding;
            encoding = undefined;
        }
        var capacity = 0;
        for (var i=0, k=buffers.length, length; i<k; ++i) {
            if (!ByteBuffer.isByteBuffer(buffers[i]))
                buffers[i] = ByteBuffer.wrap(buffers[i], encoding);
            length = buffers[i].limit - buffers[i].offset;
            if (length > 0) capacity += length;
        }
        if (capacity === 0)
            return new ByteBuffer(0, littleEndian, noAssert);
        var bb = new ByteBuffer(capacity, littleEndian, noAssert),
            bi;
        i=0; while (i<k) {
            bi = buffers[i++];
            length = bi.limit - bi.offset;
            if (length <= 0) continue;
            bi.buffer.copy(bb.buffer, bb.offset, bi.offset, bi.limit);
            bb.offset += length;
        }
        bb.limit = bb.offset;
        bb.offset = 0;
        return bb;
    };

    /**
     * Tests if the specified type is a ByteBuffer.
     * @param {*} bb ByteBuffer to test
     * @returns {boolean} `true` if it is a ByteBuffer, otherwise `false`
     * @expose
     */
    ByteBuffer.isByteBuffer = function(bb) {
        return (bb && bb["__isByteBuffer__"]) === true;
    };
    /**
     * Gets the backing buffer type.
     * @returns {Function} `Buffer` under node.js, `ArrayBuffer` in the browser (classes)
     * @expose
     */
    ByteBuffer.type = function() {
        return Buffer;
    };
    /**
     * Wraps a buffer or a string. Sets the allocated ByteBuffer's {@link ByteBuffer#offset} to `0` and its
     *  {@link ByteBuffer#limit} to the length of the wrapped data.
     * @param {!ByteBuffer|!Buffer|!ArrayBuffer|!Uint8Array|string|!Array.<number>} buffer Anything that can be wrapped
     * @param {(string|boolean)=} encoding String encoding if `buffer` is a string ("base64", "hex", "binary", defaults to
     *  "utf8")
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} A ByteBuffer wrapping `buffer`
     * @expose
     */
    ByteBuffer.wrap = function(buffer, encoding, littleEndian, noAssert) {
        if (typeof encoding !== 'string') {
            noAssert = littleEndian;
            littleEndian = encoding;
            encoding = undefined;
        }
        if (typeof buffer === 'string') {
            if (typeof encoding === 'undefined')
                encoding = "utf8";
            switch (encoding) {
                case "base64":
                    return ByteBuffer.fromBase64(buffer, littleEndian);
                case "hex":
                    return ByteBuffer.fromHex(buffer, littleEndian);
                case "binary":
                    return ByteBuffer.fromBinary(buffer, littleEndian);
                case "utf8":
                    return ByteBuffer.fromUTF8(buffer, littleEndian);
                case "debug":
                    return ByteBuffer.fromDebug(buffer, littleEndian);
                default:
                    throw Error("Unsupported encoding: "+encoding);
            }
        }
        if (buffer === null || typeof buffer !== 'object')
            throw TypeError("Illegal buffer");
        var bb;
        if (ByteBuffer.isByteBuffer(buffer)) {
            bb = ByteBufferPrototype.clone.call(buffer);
            bb.markedOffset = -1;
            return bb;
        }
        var i = 0,
            k = 0,
            b;
        if (buffer instanceof Uint8Array) { // Extract bytes from Uint8Array
            b = new Buffer(buffer.length);
            if (memcpy) { // Fast
                memcpy(b, 0, buffer.buffer, buffer.byteOffset, buffer.byteOffset + buffer.length);
            } else { // Slow
                for (i=0, k=buffer.length; i<k; ++i)
                    b[i] = buffer[i];
            }
            buffer = b;
        } else if (buffer instanceof ArrayBuffer) { // Convert ArrayBuffer to Buffer
            b = new Buffer(buffer.byteLength);
            if (memcpy) { // Fast
                memcpy(b, 0, buffer, 0, buffer.byteLength);
            } else { // Slow
                buffer = new Uint8Array(buffer);
                for (i=0, k=buffer.length; i<k; ++i) {
                    b[i] = buffer[i];
                }
            }
            buffer = b;
        } else if (!(buffer instanceof Buffer)) { // Create from octets if it is an error, otherwise fail
            if (Object.prototype.toString.call(buffer) !== "[object Array]")
                throw TypeError("Illegal buffer");
            buffer = new Buffer(buffer);
        }
        bb = new ByteBuffer(0, littleEndian, noAssert);
        if (buffer.length > 0) { // Avoid references to more than one EMPTY_BUFFER
            bb.buffer = buffer;
            bb.limit = buffer.length;
        }
        return bb;
    };

    /**
     * Writes the array as a bitset.
     * @param {Array<boolean>} value Array of booleans to write
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `length` if omitted.
     * @returns {!ByteBuffer}
     * @expose
     */
    ByteBufferPrototype.writeBitSet = function(value, offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;
      if (!this.noAssert) {
        if (!(value instanceof Array))
          throw TypeError("Illegal BitSet: Not an array");
        if (typeof offset !== 'number' || offset % 1 !== 0)
            throw TypeError("Illegal offset: "+offset+" (not an integer)");
        offset >>>= 0;
        if (offset < 0 || offset + 0 > this.buffer.length)
            throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
      }

      var start = offset,
          bits = value.length,
          bytes = (bits >> 3),
          bit = 0,
          k;

      offset += this.writeVarint32(bits,offset);

      while(bytes--) {
        k = (!!value[bit++] & 1) |
            ((!!value[bit++] & 1) << 1) |
            ((!!value[bit++] & 1) << 2) |
            ((!!value[bit++] & 1) << 3) |
            ((!!value[bit++] & 1) << 4) |
            ((!!value[bit++] & 1) << 5) |
            ((!!value[bit++] & 1) << 6) |
            ((!!value[bit++] & 1) << 7);
        this.writeByte(k,offset++);
      }

      if(bit < bits) {
        var m = 0; k = 0;
        while(bit < bits) k = k | ((!!value[bit++] & 1) << (m++));
        this.writeByte(k,offset++);
      }

      if (relative) {
        this.offset = offset;
        return this;
      }
      return offset - start;
    }

    /**
     * Reads a BitSet as an array of booleans.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `length` if omitted.
     * @returns {Array<boolean>
     * @expose
     */
    ByteBufferPrototype.readBitSet = function(offset) {
      var relative = typeof offset === 'undefined';
      if (relative) offset = this.offset;

      var ret = this.readVarint32(offset),
          bits = ret.value,
          bytes = (bits >> 3),
          bit = 0,
          value = [],
          k;

      offset += ret.length;

      while(bytes--) {
        k = this.readByte(offset++);
        value[bit++] = !!(k & 0x01);
        value[bit++] = !!(k & 0x02);
        value[bit++] = !!(k & 0x04);
        value[bit++] = !!(k & 0x08);
        value[bit++] = !!(k & 0x10);
        value[bit++] = !!(k & 0x20);
        value[bit++] = !!(k & 0x40);
        value[bit++] = !!(k & 0x80);
      }

      if(bit < bits) {
        var m = 0;
        k = this.readByte(offset++);
        while(bit < bits) value[bit++] = !!((k >> (m++)) & 1);
      }

      if (relative) {
        this.offset = offset;
      }
      return value;
    }
    /**
     * Reads the specified number of bytes.
     * @param {number} length Number of bytes to read
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `length` if omitted.
     * @returns {!ByteBuffer}
     * @expose
     */
    ByteBufferPrototype.readBytes = function(length, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + length > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+length+") <= "+this.buffer.length);
        }
        var slice = this.slice(offset, offset + length);
        if (relative) this.offset += length;
        return slice;
    };

    /**
     * Writes a payload of bytes. This is an alias of {@link ByteBuffer#append}.
     * @function
     * @param {!ByteBuffer|!Buffer|!ArrayBuffer|!Uint8Array|string} source Data to write. If `source` is a ByteBuffer, its
     * offsets will be modified according to the performed read operation.
     * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeBytes = ByteBufferPrototype.append;

    // types/ints/int8

    /**
     * Writes an 8bit signed integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeInt8 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number' || value % 1 !== 0)
                throw TypeError("Illegal value: "+value+" (not an integer)");
            value |= 0;
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        offset += 1;
        var capacity0 = this.buffer.length;
        if (offset > capacity0)
            this.resize((capacity0 *= 2) > offset ? capacity0 : offset);
        offset -= 1;
        this.buffer[offset] = value;
        if (relative) this.offset += 1;
        return this;
    };

    /**
     * Writes an 8bit signed integer. This is an alias of {@link ByteBuffer#writeInt8}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeByte = ByteBufferPrototype.writeInt8;

    /**
     * Reads an 8bit signed integer.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {number} Value read
     * @expose
     */
    ByteBufferPrototype.readInt8 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 1 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+1+") <= "+this.buffer.length);
        }
        var value = this.buffer[offset];
        if ((value & 0x80) === 0x80) value = -(0xFF - value + 1); // Cast to signed
        if (relative) this.offset += 1;
        return value;
    };

    /**
     * Reads an 8bit signed integer. This is an alias of {@link ByteBuffer#readInt8}.
     * @function
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {number} Value read
     * @expose
     */
    ByteBufferPrototype.readByte = ByteBufferPrototype.readInt8;

    /**
     * Writes an 8bit unsigned integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeUint8 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number' || value % 1 !== 0)
                throw TypeError("Illegal value: "+value+" (not an integer)");
            value >>>= 0;
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        offset += 1;
        var capacity1 = this.buffer.length;
        if (offset > capacity1)
            this.resize((capacity1 *= 2) > offset ? capacity1 : offset);
        offset -= 1;
        this.buffer[offset] = value;
        if (relative) this.offset += 1;
        return this;
    };

    /**
     * Writes an 8bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint8}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeUInt8 = ByteBufferPrototype.writeUint8;

    /**
     * Reads an 8bit unsigned integer.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {number} Value read
     * @expose
     */
    ByteBufferPrototype.readUint8 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 1 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+1+") <= "+this.buffer.length);
        }
        var value = this.buffer[offset];
        if (relative) this.offset += 1;
        return value;
    };

    /**
     * Reads an 8bit unsigned integer. This is an alias of {@link ByteBuffer#readUint8}.
     * @function
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `1` if omitted.
     * @returns {number} Value read
     * @expose
     */
    ByteBufferPrototype.readUInt8 = ByteBufferPrototype.readUint8;

    // types/ints/int16

    /**
     * Writes a 16bit signed integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @throws {TypeError} If `offset` or `value` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */
    ByteBufferPrototype.writeInt16 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number' || value % 1 !== 0)
                throw TypeError("Illegal value: "+value+" (not an integer)");
            value |= 0;
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        offset += 2;
        var capacity2 = this.buffer.length;
        if (offset > capacity2)
            this.resize((capacity2 *= 2) > offset ? capacity2 : offset);
        offset -= 2;
        if (this.littleEndian) {
            this.buffer[offset+1] = (value & 0xFF00) >>> 8;
            this.buffer[offset  ] =  value & 0x00FF;
        } else {
            this.buffer[offset]   = (value & 0xFF00) >>> 8;
            this.buffer[offset+1] =  value & 0x00FF;
        }
        if (relative) this.offset += 2;
        return this;
    };

    /**
     * Writes a 16bit signed integer. This is an alias of {@link ByteBuffer#writeInt16}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @throws {TypeError} If `offset` or `value` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */
    ByteBufferPrototype.writeShort = ByteBufferPrototype.writeInt16;

    /**
     * Reads a 16bit signed integer.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @returns {number} Value read
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */
    ByteBufferPrototype.readInt16 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 2 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+2+") <= "+this.buffer.length);
        }
        var value = 0;
        if (this.littleEndian) {
            value  = this.buffer[offset  ];
            value |= this.buffer[offset+1] << 8;
        } else {
            value  = this.buffer[offset  ] << 8;
            value |= this.buffer[offset+1];
        }
        if ((value & 0x8000) === 0x8000) value = -(0xFFFF - value + 1); // Cast to signed
        if (relative) this.offset += 2;
        return value;
    };

    /**
     * Reads a 16bit signed integer. This is an alias of {@link ByteBuffer#readInt16}.
     * @function
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @returns {number} Value read
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */
    ByteBufferPrototype.readShort = ByteBufferPrototype.readInt16;

    /**
     * Writes a 16bit unsigned integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @throws {TypeError} If `offset` or `value` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */
    ByteBufferPrototype.writeUint16 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number' || value % 1 !== 0)
                throw TypeError("Illegal value: "+value+" (not an integer)");
            value >>>= 0;
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        offset += 2;
        var capacity3 = this.buffer.length;
        if (offset > capacity3)
            this.resize((capacity3 *= 2) > offset ? capacity3 : offset);
        offset -= 2;
        if (this.littleEndian) {
            this.buffer[offset+1] = (value & 0xFF00) >>> 8;
            this.buffer[offset  ] =  value & 0x00FF;
        } else {
            this.buffer[offset]   = (value & 0xFF00) >>> 8;
            this.buffer[offset+1] =  value & 0x00FF;
        }
        if (relative) this.offset += 2;
        return this;
    };

    /**
     * Writes a 16bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint16}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @throws {TypeError} If `offset` or `value` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */
    ByteBufferPrototype.writeUInt16 = ByteBufferPrototype.writeUint16;

    /**
     * Reads a 16bit unsigned integer.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @returns {number} Value read
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */
    ByteBufferPrototype.readUint16 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 2 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+2+") <= "+this.buffer.length);
        }
        var value = 0;
        if (this.littleEndian) {
            value  = this.buffer[offset  ];
            value |= this.buffer[offset+1] << 8;
        } else {
            value  = this.buffer[offset  ] << 8;
            value |= this.buffer[offset+1];
        }
        if (relative) this.offset += 2;
        return value;
    };

    /**
     * Reads a 16bit unsigned integer. This is an alias of {@link ByteBuffer#readUint16}.
     * @function
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `2` if omitted.
     * @returns {number} Value read
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @expose
     */
    ByteBufferPrototype.readUInt16 = ByteBufferPrototype.readUint16;

    // types/ints/int32

    /**
     * Writes a 32bit signed integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @expose
     */
    ByteBufferPrototype.writeInt32 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number' || value % 1 !== 0)
                throw TypeError("Illegal value: "+value+" (not an integer)");
            value |= 0;
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        offset += 4;
        var capacity4 = this.buffer.length;
        if (offset > capacity4)
            this.resize((capacity4 *= 2) > offset ? capacity4 : offset);
        offset -= 4;
        if (this.littleEndian) {
            this.buffer[offset+3] = (value >>> 24) & 0xFF;
            this.buffer[offset+2] = (value >>> 16) & 0xFF;
            this.buffer[offset+1] = (value >>>  8) & 0xFF;
            this.buffer[offset  ] =  value         & 0xFF;
        } else {
            this.buffer[offset  ] = (value >>> 24) & 0xFF;
            this.buffer[offset+1] = (value >>> 16) & 0xFF;
            this.buffer[offset+2] = (value >>>  8) & 0xFF;
            this.buffer[offset+3] =  value         & 0xFF;
        }
        if (relative) this.offset += 4;
        return this;
    };

    /**
     * Writes a 32bit signed integer. This is an alias of {@link ByteBuffer#writeInt32}.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @expose
     */
    ByteBufferPrototype.writeInt = ByteBufferPrototype.writeInt32;

    /**
     * Reads a 32bit signed integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number} Value read
     * @expose
     */
    ByteBufferPrototype.readInt32 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 4 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+4+") <= "+this.buffer.length);
        }
        var value = 0;
        if (this.littleEndian) {
            value  = this.buffer[offset+2] << 16;
            value |= this.buffer[offset+1] <<  8;
            value |= this.buffer[offset  ];
            value += this.buffer[offset+3] << 24 >>> 0;
        } else {
            value  = this.buffer[offset+1] << 16;
            value |= this.buffer[offset+2] <<  8;
            value |= this.buffer[offset+3];
            value += this.buffer[offset  ] << 24 >>> 0;
        }
        value |= 0; // Cast to signed
        if (relative) this.offset += 4;
        return value;
    };

    /**
     * Reads a 32bit signed integer. This is an alias of {@link ByteBuffer#readInt32}.
     * @param {number=} offset Offset to read from. Will use and advance {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number} Value read
     * @expose
     */
    ByteBufferPrototype.readInt = ByteBufferPrototype.readInt32;

    /**
     * Writes a 32bit unsigned integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @expose
     */
    ByteBufferPrototype.writeUint32 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number' || value % 1 !== 0)
                throw TypeError("Illegal value: "+value+" (not an integer)");
            value >>>= 0;
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        offset += 4;
        var capacity5 = this.buffer.length;
        if (offset > capacity5)
            this.resize((capacity5 *= 2) > offset ? capacity5 : offset);
        offset -= 4;
        if (this.littleEndian) {
            this.buffer[offset+3] = (value >>> 24) & 0xFF;
            this.buffer[offset+2] = (value >>> 16) & 0xFF;
            this.buffer[offset+1] = (value >>>  8) & 0xFF;
            this.buffer[offset  ] =  value         & 0xFF;
        } else {
            this.buffer[offset  ] = (value >>> 24) & 0xFF;
            this.buffer[offset+1] = (value >>> 16) & 0xFF;
            this.buffer[offset+2] = (value >>>  8) & 0xFF;
            this.buffer[offset+3] =  value         & 0xFF;
        }
        if (relative) this.offset += 4;
        return this;
    };

    /**
     * Writes a 32bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint32}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @expose
     */
    ByteBufferPrototype.writeUInt32 = ByteBufferPrototype.writeUint32;

    /**
     * Reads a 32bit unsigned integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number} Value read
     * @expose
     */
    ByteBufferPrototype.readUint32 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 4 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+4+") <= "+this.buffer.length);
        }
        var value = 0;
        if (this.littleEndian) {
            value  = this.buffer[offset+2] << 16;
            value |= this.buffer[offset+1] <<  8;
            value |= this.buffer[offset  ];
            value += this.buffer[offset+3] << 24 >>> 0;
        } else {
            value  = this.buffer[offset+1] << 16;
            value |= this.buffer[offset+2] <<  8;
            value |= this.buffer[offset+3];
            value += this.buffer[offset  ] << 24 >>> 0;
        }
        if (relative) this.offset += 4;
        return value;
    };

    /**
     * Reads a 32bit unsigned integer. This is an alias of {@link ByteBuffer#readUint32}.
     * @function
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number} Value read
     * @expose
     */
    ByteBufferPrototype.readUInt32 = ByteBufferPrototype.readUint32;

    // types/ints/int64

    if (Long) {

        /**
         * Writes a 64bit signed integer.
         * @param {number|!Long} value Value to write
         * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
         * @returns {!ByteBuffer} this
         * @expose
         */
        ByteBufferPrototype.writeInt64 = function(value, offset) {
            var relative = typeof offset === 'undefined';
            if (relative) offset = this.offset;
            if (!this.noAssert) {
                if (typeof value === 'number')
                    value = Long.fromNumber(value);
                else if (typeof value === 'string')
                    value = Long.fromString(value);
                else if (!(value && value instanceof Long))
                    throw TypeError("Illegal value: "+value+" (not an integer or Long)");
                if (typeof offset !== 'number' || offset % 1 !== 0)
                    throw TypeError("Illegal offset: "+offset+" (not an integer)");
                offset >>>= 0;
                if (offset < 0 || offset + 0 > this.buffer.length)
                    throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
            }
            if (typeof value === 'number')
                value = Long.fromNumber(value);
            else if (typeof value === 'string')
                value = Long.fromString(value);
            offset += 8;
            var capacity6 = this.buffer.length;
            if (offset > capacity6)
                this.resize((capacity6 *= 2) > offset ? capacity6 : offset);
            offset -= 8;
            var lo = value.low,
                hi = value.high;
            if (this.littleEndian) {
                this.buffer[offset+3] = (lo >>> 24) & 0xFF;
                this.buffer[offset+2] = (lo >>> 16) & 0xFF;
                this.buffer[offset+1] = (lo >>>  8) & 0xFF;
                this.buffer[offset  ] =  lo         & 0xFF;
                offset += 4;
                this.buffer[offset+3] = (hi >>> 24) & 0xFF;
                this.buffer[offset+2] = (hi >>> 16) & 0xFF;
                this.buffer[offset+1] = (hi >>>  8) & 0xFF;
                this.buffer[offset  ] =  hi         & 0xFF;
            } else {
                this.buffer[offset  ] = (hi >>> 24) & 0xFF;
                this.buffer[offset+1] = (hi >>> 16) & 0xFF;
                this.buffer[offset+2] = (hi >>>  8) & 0xFF;
                this.buffer[offset+3] =  hi         & 0xFF;
                offset += 4;
                this.buffer[offset  ] = (lo >>> 24) & 0xFF;
                this.buffer[offset+1] = (lo >>> 16) & 0xFF;
                this.buffer[offset+2] = (lo >>>  8) & 0xFF;
                this.buffer[offset+3] =  lo         & 0xFF;
            }
            if (relative) this.offset += 8;
            return this;
        };

        /**
         * Writes a 64bit signed integer. This is an alias of {@link ByteBuffer#writeInt64}.
         * @param {number|!Long} value Value to write
         * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
         * @returns {!ByteBuffer} this
         * @expose
         */
        ByteBufferPrototype.writeLong = ByteBufferPrototype.writeInt64;

        /**
         * Reads a 64bit signed integer.
         * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
         * @returns {!Long}
         * @expose
         */
        ByteBufferPrototype.readInt64 = function(offset) {
            var relative = typeof offset === 'undefined';
            if (relative) offset = this.offset;
            if (!this.noAssert) {
                if (typeof offset !== 'number' || offset % 1 !== 0)
                    throw TypeError("Illegal offset: "+offset+" (not an integer)");
                offset >>>= 0;
                if (offset < 0 || offset + 8 > this.buffer.length)
                    throw RangeError("Illegal offset: 0 <= "+offset+" (+"+8+") <= "+this.buffer.length);
            }
            var lo = 0,
                hi = 0;
            if (this.littleEndian) {
                lo  = this.buffer[offset+2] << 16;
                lo |= this.buffer[offset+1] <<  8;
                lo |= this.buffer[offset  ];
                lo += this.buffer[offset+3] << 24 >>> 0;
                offset += 4;
                hi  = this.buffer[offset+2] << 16;
                hi |= this.buffer[offset+1] <<  8;
                hi |= this.buffer[offset  ];
                hi += this.buffer[offset+3] << 24 >>> 0;
            } else {
                hi  = this.buffer[offset+1] << 16;
                hi |= this.buffer[offset+2] <<  8;
                hi |= this.buffer[offset+3];
                hi += this.buffer[offset  ] << 24 >>> 0;
                offset += 4;
                lo  = this.buffer[offset+1] << 16;
                lo |= this.buffer[offset+2] <<  8;
                lo |= this.buffer[offset+3];
                lo += this.buffer[offset  ] << 24 >>> 0;
            }
            var value = new Long(lo, hi, false);
            if (relative) this.offset += 8;
            return value;
        };

        /**
         * Reads a 64bit signed integer. This is an alias of {@link ByteBuffer#readInt64}.
         * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
         * @returns {!Long}
         * @expose
         */
        ByteBufferPrototype.readLong = ByteBufferPrototype.readInt64;

        /**
         * Writes a 64bit unsigned integer.
         * @param {number|!Long} value Value to write
         * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
         * @returns {!ByteBuffer} this
         * @expose
         */
        ByteBufferPrototype.writeUint64 = function(value, offset) {
            var relative = typeof offset === 'undefined';
            if (relative) offset = this.offset;
            if (!this.noAssert) {
                if (typeof value === 'number')
                    value = Long.fromNumber(value);
                else if (typeof value === 'string')
                    value = Long.fromString(value);
                else if (!(value && value instanceof Long))
                    throw TypeError("Illegal value: "+value+" (not an integer or Long)");
                if (typeof offset !== 'number' || offset % 1 !== 0)
                    throw TypeError("Illegal offset: "+offset+" (not an integer)");
                offset >>>= 0;
                if (offset < 0 || offset + 0 > this.buffer.length)
                    throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
            }
            if (typeof value === 'number')
                value = Long.fromNumber(value);
            else if (typeof value === 'string')
                value = Long.fromString(value);
            offset += 8;
            var capacity7 = this.buffer.length;
            if (offset > capacity7)
                this.resize((capacity7 *= 2) > offset ? capacity7 : offset);
            offset -= 8;
            var lo = value.low,
                hi = value.high;
            if (this.littleEndian) {
                this.buffer[offset+3] = (lo >>> 24) & 0xFF;
                this.buffer[offset+2] = (lo >>> 16) & 0xFF;
                this.buffer[offset+1] = (lo >>>  8) & 0xFF;
                this.buffer[offset  ] =  lo         & 0xFF;
                offset += 4;
                this.buffer[offset+3] = (hi >>> 24) & 0xFF;
                this.buffer[offset+2] = (hi >>> 16) & 0xFF;
                this.buffer[offset+1] = (hi >>>  8) & 0xFF;
                this.buffer[offset  ] =  hi         & 0xFF;
            } else {
                this.buffer[offset  ] = (hi >>> 24) & 0xFF;
                this.buffer[offset+1] = (hi >>> 16) & 0xFF;
                this.buffer[offset+2] = (hi >>>  8) & 0xFF;
                this.buffer[offset+3] =  hi         & 0xFF;
                offset += 4;
                this.buffer[offset  ] = (lo >>> 24) & 0xFF;
                this.buffer[offset+1] = (lo >>> 16) & 0xFF;
                this.buffer[offset+2] = (lo >>>  8) & 0xFF;
                this.buffer[offset+3] =  lo         & 0xFF;
            }
            if (relative) this.offset += 8;
            return this;
        };

        /**
         * Writes a 64bit unsigned integer. This is an alias of {@link ByteBuffer#writeUint64}.
         * @function
         * @param {number|!Long} value Value to write
         * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
         * @returns {!ByteBuffer} this
         * @expose
         */
        ByteBufferPrototype.writeUInt64 = ByteBufferPrototype.writeUint64;

        /**
         * Reads a 64bit unsigned integer.
         * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
         * @returns {!Long}
         * @expose
         */
        ByteBufferPrototype.readUint64 = function(offset) {
            var relative = typeof offset === 'undefined';
            if (relative) offset = this.offset;
            if (!this.noAssert) {
                if (typeof offset !== 'number' || offset % 1 !== 0)
                    throw TypeError("Illegal offset: "+offset+" (not an integer)");
                offset >>>= 0;
                if (offset < 0 || offset + 8 > this.buffer.length)
                    throw RangeError("Illegal offset: 0 <= "+offset+" (+"+8+") <= "+this.buffer.length);
            }
            var lo = 0,
                hi = 0;
            if (this.littleEndian) {
                lo  = this.buffer[offset+2] << 16;
                lo |= this.buffer[offset+1] <<  8;
                lo |= this.buffer[offset  ];
                lo += this.buffer[offset+3] << 24 >>> 0;
                offset += 4;
                hi  = this.buffer[offset+2] << 16;
                hi |= this.buffer[offset+1] <<  8;
                hi |= this.buffer[offset  ];
                hi += this.buffer[offset+3] << 24 >>> 0;
            } else {
                hi  = this.buffer[offset+1] << 16;
                hi |= this.buffer[offset+2] <<  8;
                hi |= this.buffer[offset+3];
                hi += this.buffer[offset  ] << 24 >>> 0;
                offset += 4;
                lo  = this.buffer[offset+1] << 16;
                lo |= this.buffer[offset+2] <<  8;
                lo |= this.buffer[offset+3];
                lo += this.buffer[offset  ] << 24 >>> 0;
            }
            var value = new Long(lo, hi, true);
            if (relative) this.offset += 8;
            return value;
        };

        /**
         * Reads a 64bit unsigned integer. This is an alias of {@link ByteBuffer#readUint64}.
         * @function
         * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
         * @returns {!Long}
         * @expose
         */
        ByteBufferPrototype.readUInt64 = ByteBufferPrototype.readUint64;

    } // Long


    // types/floats/float32

    /**
     * Writes a 32bit float.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeFloat32 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number')
                throw TypeError("Illegal value: "+value+" (not a number)");
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        offset += 4;
        var capacity8 = this.buffer.length;
        if (offset > capacity8)
            this.resize((capacity8 *= 2) > offset ? capacity8 : offset);
        offset -= 4;
        this.littleEndian
            ? this.buffer.writeFloatLE(value, offset, true)
            : this.buffer.writeFloatBE(value, offset, true);
        if (relative) this.offset += 4;
        return this;
    };

    /**
     * Writes a 32bit float. This is an alias of {@link ByteBuffer#writeFloat32}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeFloat = ByteBufferPrototype.writeFloat32;

    /**
     * Reads a 32bit float.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number}
     * @expose
     */
    ByteBufferPrototype.readFloat32 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 4 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+4+") <= "+this.buffer.length);
        }
        var value = this.littleEndian
            ? this.buffer.readFloatLE(offset, true)
            : this.buffer.readFloatBE(offset, true);
        if (relative) this.offset += 4;
        return value;
    };

    /**
     * Reads a 32bit float. This is an alias of {@link ByteBuffer#readFloat32}.
     * @function
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `4` if omitted.
     * @returns {number}
     * @expose
     */
    ByteBufferPrototype.readFloat = ByteBufferPrototype.readFloat32;

    // types/floats/float64

    /**
     * Writes a 64bit float.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeFloat64 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number')
                throw TypeError("Illegal value: "+value+" (not a number)");
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        offset += 8;
        var capacity9 = this.buffer.length;
        if (offset > capacity9)
            this.resize((capacity9 *= 2) > offset ? capacity9 : offset);
        offset -= 8;
        this.littleEndian
            ? this.buffer.writeDoubleLE(value, offset, true)
            : this.buffer.writeDoubleBE(value, offset, true);
        if (relative) this.offset += 8;
        return this;
    };

    /**
     * Writes a 64bit float. This is an alias of {@link ByteBuffer#writeFloat64}.
     * @function
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.writeDouble = ByteBufferPrototype.writeFloat64;

    /**
     * Reads a 64bit float.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {number}
     * @expose
     */
    ByteBufferPrototype.readFloat64 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 8 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+8+") <= "+this.buffer.length);
        }
        var value = this.littleEndian
            ? this.buffer.readDoubleLE(offset, true)
            : this.buffer.readDoubleBE(offset, true);
        if (relative) this.offset += 8;
        return value;
    };

    /**
     * Reads a 64bit float. This is an alias of {@link ByteBuffer#readFloat64}.
     * @function
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by `8` if omitted.
     * @returns {number}
     * @expose
     */
    ByteBufferPrototype.readDouble = ByteBufferPrototype.readFloat64;


    // types/varints/varint32

    /**
     * Maximum number of bytes required to store a 32bit base 128 variable-length integer.
     * @type {number}
     * @const
     * @expose
     */
    ByteBuffer.MAX_VARINT32_BYTES = 5;

    /**
     * Calculates the actual number of bytes required to store a 32bit base 128 variable-length integer.
     * @param {number} value Value to encode
     * @returns {number} Number of bytes required. Capped to {@link ByteBuffer.MAX_VARINT32_BYTES}
     * @expose
     */
    ByteBuffer.calculateVarint32 = function(value) {
        // ref: src/google/protobuf/io/coded_stream.cc
        value = value >>> 0;
             if (value < 1 << 7 ) return 1;
        else if (value < 1 << 14) return 2;
        else if (value < 1 << 21) return 3;
        else if (value < 1 << 28) return 4;
        else                      return 5;
    };

    /**
     * Zigzag encodes a signed 32bit integer so that it can be effectively used with varint encoding.
     * @param {number} n Signed 32bit integer
     * @returns {number} Unsigned zigzag encoded 32bit integer
     * @expose
     */
    ByteBuffer.zigZagEncode32 = function(n) {
        return (((n |= 0) << 1) ^ (n >> 31)) >>> 0; // ref: src/google/protobuf/wire_format_lite.h
    };

    /**
     * Decodes a zigzag encoded signed 32bit integer.
     * @param {number} n Unsigned zigzag encoded 32bit integer
     * @returns {number} Signed 32bit integer
     * @expose
     */
    ByteBuffer.zigZagDecode32 = function(n) {
        return ((n >>> 1) ^ -(n & 1)) | 0; // // ref: src/google/protobuf/wire_format_lite.h
    };

    /**
     * Writes a 32bit base 128 variable-length integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} this if `offset` is omitted, else the actual number of bytes written
     * @expose
     */
    ByteBufferPrototype.writeVarint32 = function(value, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof value !== 'number' || value % 1 !== 0)
                throw TypeError("Illegal value: "+value+" (not an integer)");
            value |= 0;
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        var size = ByteBuffer.calculateVarint32(value),
            b;
        offset += size;
        var capacity10 = this.buffer.length;
        if (offset > capacity10)
            this.resize((capacity10 *= 2) > offset ? capacity10 : offset);
        offset -= size;
        value >>>= 0;
        while (value >= 0x80) {
            b = (value & 0x7f) | 0x80;
            this.buffer[offset++] = b;
            value >>>= 7;
        }
        this.buffer[offset++] = value;
        if (relative) {
            this.offset = offset;
            return this;
        }
        return size;
    };

    /**
     * Writes a zig-zag encoded (signed) 32bit base 128 variable-length integer.
     * @param {number} value Value to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} this if `offset` is omitted, else the actual number of bytes written
     * @expose
     */
    ByteBufferPrototype.writeVarint32ZigZag = function(value, offset) {
        return this.writeVarint32(ByteBuffer.zigZagEncode32(value), offset);
    };

    /**
     * Reads a 32bit base 128 variable-length integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {number|!{value: number, length: number}} The value read if offset is omitted, else the value read
     *  and the actual number of bytes read.
     * @throws {Error} If it's not a valid varint. Has a property `truncated = true` if there is not enough data available
     *  to fully decode the varint.
     * @expose
     */
    ByteBufferPrototype.readVarint32 = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 1 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+1+") <= "+this.buffer.length);
        }
        var c = 0,
            value = 0 >>> 0,
            b;
        do {
            if (!this.noAssert && offset > this.limit) {
                var err = Error("Truncated");
                err['truncated'] = true;
                throw err;
            }
            b = this.buffer[offset++];
            if (c < 5)
                value |= (b & 0x7f) << (7*c);
            ++c;
        } while ((b & 0x80) !== 0);
        value |= 0;
        if (relative) {
            this.offset = offset;
            return value;
        }
        return {
            "value": value,
            "length": c
        };
    };

    /**
     * Reads a zig-zag encoded (signed) 32bit base 128 variable-length integer.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {number|!{value: number, length: number}} The value read if offset is omitted, else the value read
     *  and the actual number of bytes read.
     * @throws {Error} If it's not a valid varint
     * @expose
     */
    ByteBufferPrototype.readVarint32ZigZag = function(offset) {
        var val = this.readVarint32(offset);
        if (typeof val === 'object')
            val["value"] = ByteBuffer.zigZagDecode32(val["value"]);
        else
            val = ByteBuffer.zigZagDecode32(val);
        return val;
    };

    // types/varints/varint64

    if (Long) {

        /**
         * Maximum number of bytes required to store a 64bit base 128 variable-length integer.
         * @type {number}
         * @const
         * @expose
         */
        ByteBuffer.MAX_VARINT64_BYTES = 10;

        /**
         * Calculates the actual number of bytes required to store a 64bit base 128 variable-length integer.
         * @param {number|!Long} value Value to encode
         * @returns {number} Number of bytes required. Capped to {@link ByteBuffer.MAX_VARINT64_BYTES}
         * @expose
         */
        ByteBuffer.calculateVarint64 = function(value) {
            if (typeof value === 'number')
                value = Long.fromNumber(value);
            else if (typeof value === 'string')
                value = Long.fromString(value);
            // ref: src/google/protobuf/io/coded_stream.cc
            var part0 = value.toInt() >>> 0,
                part1 = value.shiftRightUnsigned(28).toInt() >>> 0,
                part2 = value.shiftRightUnsigned(56).toInt() >>> 0;
            if (part2 == 0) {
                if (part1 == 0) {
                    if (part0 < 1 << 14)
                        return part0 < 1 << 7 ? 1 : 2;
                    else
                        return part0 < 1 << 21 ? 3 : 4;
                } else {
                    if (part1 < 1 << 14)
                        return part1 < 1 << 7 ? 5 : 6;
                    else
                        return part1 < 1 << 21 ? 7 : 8;
                }
            } else
                return part2 < 1 << 7 ? 9 : 10;
        };

        /**
         * Zigzag encodes a signed 64bit integer so that it can be effectively used with varint encoding.
         * @param {number|!Long} value Signed long
         * @returns {!Long} Unsigned zigzag encoded long
         * @expose
         */
        ByteBuffer.zigZagEncode64 = function(value) {
            if (typeof value === 'number')
                value = Long.fromNumber(value, false);
            else if (typeof value === 'string')
                value = Long.fromString(value, false);
            else if (value.unsigned !== false) value = value.toSigned();
            // ref: src/google/protobuf/wire_format_lite.h
            return value.shiftLeft(1).xor(value.shiftRight(63)).toUnsigned();
        };

        /**
         * Decodes a zigzag encoded signed 64bit integer.
         * @param {!Long|number} value Unsigned zigzag encoded long or JavaScript number
         * @returns {!Long} Signed long
         * @expose
         */
        ByteBuffer.zigZagDecode64 = function(value) {
            if (typeof value === 'number')
                value = Long.fromNumber(value, false);
            else if (typeof value === 'string')
                value = Long.fromString(value, false);
            else if (value.unsigned !== false) value = value.toSigned();
            // ref: src/google/protobuf/wire_format_lite.h
            return value.shiftRightUnsigned(1).xor(value.and(Long.ONE).toSigned().negate()).toSigned();
        };

        /**
         * Writes a 64bit base 128 variable-length integer.
         * @param {number|Long} value Value to write
         * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
         *  written if omitted.
         * @returns {!ByteBuffer|number} `this` if offset is omitted, else the actual number of bytes written.
         * @expose
         */
        ByteBufferPrototype.writeVarint64 = function(value, offset) {
            var relative = typeof offset === 'undefined';
            if (relative) offset = this.offset;
            if (!this.noAssert) {
                if (typeof value === 'number')
                    value = Long.fromNumber(value);
                else if (typeof value === 'string')
                    value = Long.fromString(value);
                else if (!(value && value instanceof Long))
                    throw TypeError("Illegal value: "+value+" (not an integer or Long)");
                if (typeof offset !== 'number' || offset % 1 !== 0)
                    throw TypeError("Illegal offset: "+offset+" (not an integer)");
                offset >>>= 0;
                if (offset < 0 || offset + 0 > this.buffer.length)
                    throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
            }
            if (typeof value === 'number')
                value = Long.fromNumber(value, false);
            else if (typeof value === 'string')
                value = Long.fromString(value, false);
            else if (value.unsigned !== false) value = value.toSigned();
            var size = ByteBuffer.calculateVarint64(value),
                part0 = value.toInt() >>> 0,
                part1 = value.shiftRightUnsigned(28).toInt() >>> 0,
                part2 = value.shiftRightUnsigned(56).toInt() >>> 0;
            offset += size;
            var capacity11 = this.buffer.length;
            if (offset > capacity11)
                this.resize((capacity11 *= 2) > offset ? capacity11 : offset);
            offset -= size;
            switch (size) {
                case 10: this.buffer[offset+9] = (part2 >>>  7) & 0x01;
                case 9 : this.buffer[offset+8] = size !== 9 ? (part2       ) | 0x80 : (part2       ) & 0x7F;
                case 8 : this.buffer[offset+7] = size !== 8 ? (part1 >>> 21) | 0x80 : (part1 >>> 21) & 0x7F;
                case 7 : this.buffer[offset+6] = size !== 7 ? (part1 >>> 14) | 0x80 : (part1 >>> 14) & 0x7F;
                case 6 : this.buffer[offset+5] = size !== 6 ? (part1 >>>  7) | 0x80 : (part1 >>>  7) & 0x7F;
                case 5 : this.buffer[offset+4] = size !== 5 ? (part1       ) | 0x80 : (part1       ) & 0x7F;
                case 4 : this.buffer[offset+3] = size !== 4 ? (part0 >>> 21) | 0x80 : (part0 >>> 21) & 0x7F;
                case 3 : this.buffer[offset+2] = size !== 3 ? (part0 >>> 14) | 0x80 : (part0 >>> 14) & 0x7F;
                case 2 : this.buffer[offset+1] = size !== 2 ? (part0 >>>  7) | 0x80 : (part0 >>>  7) & 0x7F;
                case 1 : this.buffer[offset  ] = size !== 1 ? (part0       ) | 0x80 : (part0       ) & 0x7F;
            }
            if (relative) {
                this.offset += size;
                return this;
            } else {
                return size;
            }
        };

        /**
         * Writes a zig-zag encoded 64bit base 128 variable-length integer.
         * @param {number|Long} value Value to write
         * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
         *  written if omitted.
         * @returns {!ByteBuffer|number} `this` if offset is omitted, else the actual number of bytes written.
         * @expose
         */
        ByteBufferPrototype.writeVarint64ZigZag = function(value, offset) {
            return this.writeVarint64(ByteBuffer.zigZagEncode64(value), offset);
        };

        /**
         * Reads a 64bit base 128 variable-length integer. Requires Long.js.
         * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
         *  read if omitted.
         * @returns {!Long|!{value: Long, length: number}} The value read if offset is omitted, else the value read and
         *  the actual number of bytes read.
         * @throws {Error} If it's not a valid varint
         * @expose
         */
        ByteBufferPrototype.readVarint64 = function(offset) {
            var relative = typeof offset === 'undefined';
            if (relative) offset = this.offset;
            if (!this.noAssert) {
                if (typeof offset !== 'number' || offset % 1 !== 0)
                    throw TypeError("Illegal offset: "+offset+" (not an integer)");
                offset >>>= 0;
                if (offset < 0 || offset + 1 > this.buffer.length)
                    throw RangeError("Illegal offset: 0 <= "+offset+" (+"+1+") <= "+this.buffer.length);
            }
            // ref: src/google/protobuf/io/coded_stream.cc
            var start = offset,
                part0 = 0,
                part1 = 0,
                part2 = 0,
                b  = 0;
            b = this.buffer[offset++]; part0  = (b & 0x7F)      ; if ( b & 0x80                                                   ) {
            b = this.buffer[offset++]; part0 |= (b & 0x7F) <<  7; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            b = this.buffer[offset++]; part0 |= (b & 0x7F) << 14; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            b = this.buffer[offset++]; part0 |= (b & 0x7F) << 21; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            b = this.buffer[offset++]; part1  = (b & 0x7F)      ; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            b = this.buffer[offset++]; part1 |= (b & 0x7F) <<  7; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            b = this.buffer[offset++]; part1 |= (b & 0x7F) << 14; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            b = this.buffer[offset++]; part1 |= (b & 0x7F) << 21; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            b = this.buffer[offset++]; part2  = (b & 0x7F)      ; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            b = this.buffer[offset++]; part2 |= (b & 0x7F) <<  7; if ((b & 0x80) || (this.noAssert && typeof b === 'undefined')) {
            throw Error("Buffer overrun"); }}}}}}}}}}
            var value = Long.fromBits(part0 | (part1 << 28), (part1 >>> 4) | (part2) << 24, false);
            if (relative) {
                this.offset = offset;
                return value;
            } else {
                return {
                    'value': value,
                    'length': offset-start
                };
            }
        };

        /**
         * Reads a zig-zag encoded 64bit base 128 variable-length integer. Requires Long.js.
         * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
         *  read if omitted.
         * @returns {!Long|!{value: Long, length: number}} The value read if offset is omitted, else the value read and
         *  the actual number of bytes read.
         * @throws {Error} If it's not a valid varint
         * @expose
         */
        ByteBufferPrototype.readVarint64ZigZag = function(offset) {
            var val = this.readVarint64(offset);
            if (val && val['value'] instanceof Long)
                val["value"] = ByteBuffer.zigZagDecode64(val["value"]);
            else
                val = ByteBuffer.zigZagDecode64(val);
            return val;
        };

    } // Long


    // types/strings/cstring

    /**
     * Writes a NULL-terminated UTF8 encoded string. For this to work the specified string must not contain any NULL
     *  characters itself.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  contained in `str` + 1 if omitted.
     * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written
     * @expose
     */
    ByteBufferPrototype.writeCString = function(str, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        var i,
            k = str.length;
        if (!this.noAssert) {
            if (typeof str !== 'string')
                throw TypeError("Illegal str: Not a string");
            for (i=0; i<k; ++i) {
                if (str.charCodeAt(i) === 0)
                    throw RangeError("Illegal str: Contains NULL-characters");
            }
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        // UTF8 strings do not contain zero bytes in between except for the zero character, so:
        k = Buffer.byteLength(str, "utf8");
        offset += k+1;
        var capacity12 = this.buffer.length;
        if (offset > capacity12)
            this.resize((capacity12 *= 2) > offset ? capacity12 : offset);
        offset -= k+1;
        offset += this.buffer.write(str, offset, k, "utf8");
        this.buffer[offset++] = 0;
        if (relative) {
            this.offset = offset;
            return this;
        }
        return k;
    };

    /**
     * Reads a NULL-terminated UTF8 encoded string. For this to work the string read must not contain any NULL characters
     *  itself.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     */
    ByteBufferPrototype.readCString = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 1 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+1+") <= "+this.buffer.length);
        }
        var start = offset,
            temp;
        // UTF8 strings do not contain zero bytes in between except for the zero character itself, so:
        do {
            if (offset >= this.buffer.length)
                throw RangeError("Index out of range: "+offset+" <= "+this.buffer.length);
            temp = this.buffer[offset++];
        } while (temp !== 0);
        var str = this.buffer.toString("utf8", start, offset-1);
        if (relative) {
            this.offset = offset;
            return str;
        } else {
            return {
                "string": str,
                "length": offset - start
            };
        }
    };

    // types/strings/istring

    /**
     * Writes a length as uint32 prefixed UTF8 encoded string.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} `this` if `offset` is omitted, else the actual number of bytes written
     * @expose
     * @see ByteBuffer#writeVarint32
     */
    ByteBufferPrototype.writeIString = function(str, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof str !== 'string')
                throw TypeError("Illegal str: Not a string");
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        var start = offset,
            k;
        k = Buffer.byteLength(str, "utf8");
        offset += 4+k;
        var capacity13 = this.buffer.length;
        if (offset > capacity13)
            this.resize((capacity13 *= 2) > offset ? capacity13 : offset);
        offset -= 4+k;
        if (this.littleEndian) {
            this.buffer[offset+3] = (k >>> 24) & 0xFF;
            this.buffer[offset+2] = (k >>> 16) & 0xFF;
            this.buffer[offset+1] = (k >>>  8) & 0xFF;
            this.buffer[offset  ] =  k         & 0xFF;
        } else {
            this.buffer[offset  ] = (k >>> 24) & 0xFF;
            this.buffer[offset+1] = (k >>> 16) & 0xFF;
            this.buffer[offset+2] = (k >>>  8) & 0xFF;
            this.buffer[offset+3] =  k         & 0xFF;
        }
        offset += 4;
        offset += this.buffer.write(str, offset, k, "utf8");
        if (relative) {
            this.offset = offset;
            return this;
        }
        return offset - start;
    };

    /**
     * Reads a length as uint32 prefixed UTF8 encoded string.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     * @see ByteBuffer#readVarint32
     */
    ByteBufferPrototype.readIString = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 4 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+4+") <= "+this.buffer.length);
        }
        var start = offset;
        var len = this.readUint32(offset);
        var str = this.readUTF8String(len, ByteBuffer.METRICS_BYTES, offset += 4);
        offset += str['length'];
        if (relative) {
            this.offset = offset;
            return str['string'];
        } else {
            return {
                'string': str['string'],
                'length': offset - start
            };
        }
    };

    // types/strings/utf8string

    /**
     * Metrics representing number of UTF8 characters. Evaluates to `c`.
     * @type {string}
     * @const
     * @expose
     */
    ByteBuffer.METRICS_CHARS = 'c';

    /**
     * Metrics representing number of bytes. Evaluates to `b`.
     * @type {string}
     * @const
     * @expose
     */
    ByteBuffer.METRICS_BYTES = 'b';

    /**
     * Writes an UTF8 encoded string.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} if omitted.
     * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
     * @expose
     */
    ByteBufferPrototype.writeUTF8String = function(str, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        var k;
        k = Buffer.byteLength(str, "utf8");
        offset += k;
        var capacity14 = this.buffer.length;
        if (offset > capacity14)
            this.resize((capacity14 *= 2) > offset ? capacity14 : offset);
        offset -= k;
        offset += this.buffer.write(str, offset, k, "utf8");
        if (relative) {
            this.offset = offset;
            return this;
        }
        return k;
    };

    /**
     * Writes an UTF8 encoded string. This is an alias of {@link ByteBuffer#writeUTF8String}.
     * @function
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} if omitted.
     * @returns {!ByteBuffer|number} this if offset is omitted, else the actual number of bytes written.
     * @expose
     */
    ByteBufferPrototype.writeString = ByteBufferPrototype.writeUTF8String;

    /**
     * Calculates the number of UTF8 characters of a string. JavaScript itself uses UTF-16, so that a string's
     *  `length` property does not reflect its actual UTF8 size if it contains code points larger than 0xFFFF.
     * @param {string} str String to calculate
     * @returns {number} Number of UTF8 characters
     * @expose
     */
    ByteBuffer.calculateUTF8Chars = function(str) {
        return utfx.calculateUTF16asUTF8(stringSource(str))[0];
    };

    /**
     * Calculates the number of UTF8 bytes of a string.
     * @param {string} str String to calculate
     * @returns {number} Number of UTF8 bytes
     * @expose
     */
    ByteBuffer.calculateUTF8Bytes = function(str) {
        if (typeof str !== 'string')
            throw TypeError("Illegal argument: "+(typeof str));
        return Buffer.byteLength(str, "utf8");
    };

    /**
     * Calculates the number of UTF8 bytes of a string. This is an alias of {@link ByteBuffer.calculateUTF8Bytes}.
     * @function
     * @param {string} str String to calculate
     * @returns {number} Number of UTF8 bytes
     * @expose
     */
    ByteBuffer.calculateString = ByteBuffer.calculateUTF8Bytes;

    /**
     * Reads an UTF8 encoded string.
     * @param {number} length Number of characters or bytes to read.
     * @param {string=} metrics Metrics specifying what `length` is meant to count. Defaults to
     *  {@link ByteBuffer.METRICS_CHARS}.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     */
    ByteBufferPrototype.readUTF8String = function(length, metrics, offset) {
        if (typeof metrics === 'number') {
            offset = metrics;
            metrics = undefined;
        }
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (typeof metrics === 'undefined') metrics = ByteBuffer.METRICS_CHARS;
        if (!this.noAssert) {
            if (typeof length !== 'number' || length % 1 !== 0)
                throw TypeError("Illegal length: "+length+" (not an integer)");
            length |= 0;
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        var i = 0,
            start = offset,
            temp,
            sd;
        if (metrics === ByteBuffer.METRICS_CHARS) { // The same for node and the browser
            sd = stringDestination();
            utfx.decodeUTF8(function() {
                return i < length && offset < this.limit ? this.buffer[offset++] : null;
            }.bind(this), function(cp) {
                ++i; utfx.UTF8toUTF16(cp, sd);
            });
            if (i !== length)
                throw RangeError("Illegal range: Truncated data, "+i+" == "+length);
            if (relative) {
                this.offset = offset;
                return sd();
            } else {
                return {
                    "string": sd(),
                    "length": offset - start
                };
            }
        } else if (metrics === ByteBuffer.METRICS_BYTES) {
            if (!this.noAssert) {
                if (typeof offset !== 'number' || offset % 1 !== 0)
                    throw TypeError("Illegal offset: "+offset+" (not an integer)");
                offset >>>= 0;
                if (offset < 0 || offset + length > this.buffer.length)
                    throw RangeError("Illegal offset: 0 <= "+offset+" (+"+length+") <= "+this.buffer.length);
            }
            temp = this.buffer.toString("utf8", offset, offset+length);
            if (relative) {
                this.offset += length;
                return temp;
            } else {
                return {
                    'string': temp,
                    'length': length
                };
            }
        } else
            throw TypeError("Unsupported metrics: "+metrics);
    };

    /**
     * Reads an UTF8 encoded string. This is an alias of {@link ByteBuffer#readUTF8String}.
     * @function
     * @param {number} length Number of characters or bytes to read
     * @param {number=} metrics Metrics specifying what `n` is meant to count. Defaults to
     *  {@link ByteBuffer.METRICS_CHARS}.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     */
    ByteBufferPrototype.readString = ByteBufferPrototype.readUTF8String;

    // types/strings/vstring

    /**
     * Writes a length as varint32 prefixed UTF8 encoded string.
     * @param {string} str String to write
     * @param {number=} offset Offset to write to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer|number} `this` if `offset` is omitted, else the actual number of bytes written
     * @expose
     * @see ByteBuffer#writeVarint32
     */
    ByteBufferPrototype.writeVString = function(str, offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof str !== 'string')
                throw TypeError("Illegal str: Not a string");
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        var start = offset,
            k, l;
        k = Buffer.byteLength(str, "utf8");
        l = ByteBuffer.calculateVarint32(k);
        offset += l+k;
        var capacity15 = this.buffer.length;
        if (offset > capacity15)
            this.resize((capacity15 *= 2) > offset ? capacity15 : offset);
        offset -= l+k;
        offset += this.writeVarint32(k, offset);
        offset += this.buffer.write(str, offset, k, "utf8");
        if (relative) {
            this.offset = offset;
            return this;
        }
        return offset - start;
    };

    /**
     * Reads a length as varint32 prefixed UTF8 encoded string.
     * @param {number=} offset Offset to read from. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {string|!{string: string, length: number}} The string read if offset is omitted, else the string
     *  read and the actual number of bytes read.
     * @expose
     * @see ByteBuffer#readVarint32
     */
    ByteBufferPrototype.readVString = function(offset) {
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 1 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+1+") <= "+this.buffer.length);
        }
        var start = offset;
        var len = this.readVarint32(offset);
        var str = this.readUTF8String(len['value'], ByteBuffer.METRICS_BYTES, offset += len['length']);
        offset += str['length'];
        if (relative) {
            this.offset = offset;
            return str['string'];
        } else {
            return {
                'string': str['string'],
                'length': offset - start
            };
        }
    };


    /**
     * Appends some data to this ByteBuffer. This will overwrite any contents behind the specified offset up to the appended
     *  data's length.
     * @param {!ByteBuffer|!Buffer|!ArrayBuffer|!Uint8Array|string} source Data to append. If `source` is a ByteBuffer, its
     * offsets will be modified according to the performed read operation.
     * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
     * @param {number=} offset Offset to append at. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     * @example A relative `<01 02>03.append(<04 05>)` will result in `<01 02 04 05>, 04 05|`
     * @example An absolute `<01 02>03.append(04 05>, 1)` will result in `<01 04>05, 04 05|`
     */
    ByteBufferPrototype.append = function(source, encoding, offset) {
        if (typeof encoding === 'number' || typeof encoding !== 'string') {
            offset = encoding;
            encoding = undefined;
        }
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        if (!(source instanceof ByteBuffer))
            source = ByteBuffer.wrap(source, encoding);
        var length = source.limit - source.offset;
        if (length <= 0) return this; // Nothing to append
        offset += length;
        var capacity16 = this.buffer.length;
        if (offset > capacity16)
            this.resize((capacity16 *= 2) > offset ? capacity16 : offset);
        offset -= length;
        source.buffer.copy(this.buffer, offset, source.offset, source.limit);
        source.offset += length;
        if (relative) this.offset += length;
        return this;
    };

    /**
     * Appends this ByteBuffer's contents to another ByteBuffer. This will overwrite any contents at and after the
        specified offset up to the length of this ByteBuffer's data.
     * @param {!ByteBuffer} target Target ByteBuffer
     * @param {number=} offset Offset to append to. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  read if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     * @see ByteBuffer#append
     */
    ByteBufferPrototype.appendTo = function(target, offset) {
        target.append(this, offset);
        return this;
    };

    /**
     * Enables or disables assertions of argument types and offsets. Assertions are enabled by default but you can opt to
     *  disable them if your code already makes sure that everything is valid.
     * @param {boolean} assert `true` to enable assertions, otherwise `false`
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.assert = function(assert) {
        this.noAssert = !assert;
        return this;
    };

    /**
     * Gets the capacity of this ByteBuffer's backing buffer.
     * @returns {number} Capacity of the backing buffer
     * @expose
     */
    ByteBufferPrototype.capacity = function() {
        return this.buffer.length;
    };
    /**
     * Clears this ByteBuffer's offsets by setting {@link ByteBuffer#offset} to `0` and {@link ByteBuffer#limit} to the
     *  backing buffer's capacity. Discards {@link ByteBuffer#markedOffset}.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.clear = function() {
        this.offset = 0;
        this.limit = this.buffer.length;
        this.markedOffset = -1;
        return this;
    };

    /**
     * Creates a cloned instance of this ByteBuffer, preset with this ByteBuffer's values for {@link ByteBuffer#offset},
     *  {@link ByteBuffer#markedOffset} and {@link ByteBuffer#limit}.
     * @param {boolean=} copy Whether to copy the backing buffer or to return another view on the same, defaults to `false`
     * @returns {!ByteBuffer} Cloned instance
     * @expose
     */
    ByteBufferPrototype.clone = function(copy) {
        var bb = new ByteBuffer(0, this.littleEndian, this.noAssert);
        if (copy) {
            var buffer = new Buffer(this.buffer.length);
            this.buffer.copy(buffer);
            bb.buffer = buffer;
        } else {
            bb.buffer = this.buffer;
        }
        bb.offset = this.offset;
        bb.markedOffset = this.markedOffset;
        bb.limit = this.limit;
        return bb;
    };

    /**
     * Compacts this ByteBuffer to be backed by a {@link ByteBuffer#buffer} of its contents' length. Contents are the bytes
     *  between {@link ByteBuffer#offset} and {@link ByteBuffer#limit}. Will set `offset = 0` and `limit = capacity` and
     *  adapt {@link ByteBuffer#markedOffset} to the same relative position if set.
     * @param {number=} begin Offset to start at, defaults to {@link ByteBuffer#offset}
     * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.compact = function(begin, end) {
        if (typeof begin === 'undefined') begin = this.offset;
        if (typeof end === 'undefined') end = this.limit;
        if (!this.noAssert) {
            if (typeof begin !== 'number' || begin % 1 !== 0)
                throw TypeError("Illegal begin: Not an integer");
            begin >>>= 0;
            if (typeof end !== 'number' || end % 1 !== 0)
                throw TypeError("Illegal end: Not an integer");
            end >>>= 0;
            if (begin < 0 || begin > end || end > this.buffer.length)
                throw RangeError("Illegal range: 0 <= "+begin+" <= "+end+" <= "+this.buffer.length);
        }
        if (begin === 0 && end === this.buffer.length)
            return this; // Already compacted
        var len = end - begin;
        if (len === 0) {
            this.buffer = EMPTY_BUFFER;
            if (this.markedOffset >= 0) this.markedOffset -= begin;
            this.offset = 0;
            this.limit = 0;
            return this;
        }
        var buffer = new Buffer(len);
        this.buffer.copy(buffer, 0, begin, end);
        this.buffer = buffer;
        if (this.markedOffset >= 0) this.markedOffset -= begin;
        this.offset = 0;
        this.limit = len;
        return this;
    };

    /**
     * Creates a copy of this ByteBuffer's contents. Contents are the bytes between {@link ByteBuffer#offset} and
     *  {@link ByteBuffer#limit}.
     * @param {number=} begin Begin offset, defaults to {@link ByteBuffer#offset}.
     * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
     * @returns {!ByteBuffer} Copy
     * @expose
     */
    ByteBufferPrototype.copy = function(begin, end) {
        if (typeof begin === 'undefined') begin = this.offset;
        if (typeof end === 'undefined') end = this.limit;
        if (!this.noAssert) {
            if (typeof begin !== 'number' || begin % 1 !== 0)
                throw TypeError("Illegal begin: Not an integer");
            begin >>>= 0;
            if (typeof end !== 'number' || end % 1 !== 0)
                throw TypeError("Illegal end: Not an integer");
            end >>>= 0;
            if (begin < 0 || begin > end || end > this.buffer.length)
                throw RangeError("Illegal range: 0 <= "+begin+" <= "+end+" <= "+this.buffer.length);
        }
        if (begin === end)
            return new ByteBuffer(0, this.littleEndian, this.noAssert);
        var capacity = end - begin,
            bb = new ByteBuffer(capacity, this.littleEndian, this.noAssert);
        bb.offset = 0;
        bb.limit = capacity;
        if (bb.markedOffset >= 0) bb.markedOffset -= begin;
        this.copyTo(bb, 0, begin, end);
        return bb;
    };

    /**
     * Copies this ByteBuffer's contents to another ByteBuffer. Contents are the bytes between {@link ByteBuffer#offset} and
     *  {@link ByteBuffer#limit}.
     * @param {!ByteBuffer} target Target ByteBuffer
     * @param {number=} targetOffset Offset to copy to. Will use and increase the target's {@link ByteBuffer#offset}
     *  by the number of bytes copied if omitted.
     * @param {number=} sourceOffset Offset to start copying from. Will use and increase {@link ByteBuffer#offset} by the
     *  number of bytes copied if omitted.
     * @param {number=} sourceLimit Offset to end copying from, defaults to {@link ByteBuffer#limit}
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.copyTo = function(target, targetOffset, sourceOffset, sourceLimit) {
        var relative,
            targetRelative;
        if (!this.noAssert) {
            if (!ByteBuffer.isByteBuffer(target))
                throw TypeError("Illegal target: Not a ByteBuffer");
        }
        targetOffset = (targetRelative = typeof targetOffset === 'undefined') ? target.offset : targetOffset | 0;
        sourceOffset = (relative = typeof sourceOffset === 'undefined') ? this.offset : sourceOffset | 0;
        sourceLimit = typeof sourceLimit === 'undefined' ? this.limit : sourceLimit | 0;

        if (targetOffset < 0 || targetOffset > target.buffer.length)
            throw RangeError("Illegal target range: 0 <= "+targetOffset+" <= "+target.buffer.length);
        if (sourceOffset < 0 || sourceLimit > this.buffer.length)
            throw RangeError("Illegal source range: 0 <= "+sourceOffset+" <= "+this.buffer.length);

        var len = sourceLimit - sourceOffset;
        if (len === 0)
            return target; // Nothing to copy

        target.ensureCapacity(targetOffset + len);

        this.buffer.copy(target.buffer, targetOffset, sourceOffset, sourceLimit);

        if (relative) this.offset += len;
        if (targetRelative) target.offset += len;

        return this;
    };

    /**
     * Makes sure that this ByteBuffer is backed by a {@link ByteBuffer#buffer} of at least the specified capacity. If the
     *  current capacity is exceeded, it will be doubled. If double the current capacity is less than the required capacity,
     *  the required capacity will be used instead.
     * @param {number} capacity Required capacity
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.ensureCapacity = function(capacity) {
        var current = this.buffer.length;
        if (current < capacity)
            return this.resize((current *= 2) > capacity ? current : capacity);
        return this;
    };

    /**
     * Overwrites this ByteBuffer's contents with the specified value. Contents are the bytes between
     *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}.
     * @param {number|string} value Byte value to fill with. If given as a string, the first character is used.
     * @param {number=} begin Begin offset. Will use and increase {@link ByteBuffer#offset} by the number of bytes
     *  written if omitted. defaults to {@link ByteBuffer#offset}.
     * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
     * @returns {!ByteBuffer} this
     * @expose
     * @example `someByteBuffer.clear().fill(0)` fills the entire backing buffer with zeroes
     */
    ByteBufferPrototype.fill = function(value, begin, end) {
        var relative = typeof begin === 'undefined';
        if (relative) begin = this.offset;
        if (typeof value === 'string' && value.length > 0)
            value = value.charCodeAt(0);
        if (typeof begin === 'undefined') begin = this.offset;
        if (typeof end === 'undefined') end = this.limit;
        if (!this.noAssert) {
            if (typeof value !== 'number' || value % 1 !== 0)
                throw TypeError("Illegal value: "+value+" (not an integer)");
            value |= 0;
            if (typeof begin !== 'number' || begin % 1 !== 0)
                throw TypeError("Illegal begin: Not an integer");
            begin >>>= 0;
            if (typeof end !== 'number' || end % 1 !== 0)
                throw TypeError("Illegal end: Not an integer");
            end >>>= 0;
            if (begin < 0 || begin > end || end > this.buffer.length)
                throw RangeError("Illegal range: 0 <= "+begin+" <= "+end+" <= "+this.buffer.length);
        }
        if (begin >= end)
            return this; // Nothing to fill
        this.buffer.fill(value, begin, end);
        begin = end;
        if (relative) this.offset = begin;
        return this;
    };

    /**
     * Makes this ByteBuffer ready for a new sequence of write or relative read operations. Sets `limit = offset` and
     *  `offset = 0`. Make sure always to flip a ByteBuffer when all relative read or write operations are complete.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.flip = function() {
        this.limit = this.offset;
        this.offset = 0;
        return this;
    };
    /**
     * Marks an offset on this ByteBuffer to be used later.
     * @param {number=} offset Offset to mark. Defaults to {@link ByteBuffer#offset}.
     * @returns {!ByteBuffer} this
     * @throws {TypeError} If `offset` is not a valid number
     * @throws {RangeError} If `offset` is out of bounds
     * @see ByteBuffer#reset
     * @expose
     */
    ByteBufferPrototype.mark = function(offset) {
        offset = typeof offset === 'undefined' ? this.offset : offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        this.markedOffset = offset;
        return this;
    };
    /**
     * Sets the byte order.
     * @param {boolean} littleEndian `true` for little endian byte order, `false` for big endian
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.order = function(littleEndian) {
        if (!this.noAssert) {
            if (typeof littleEndian !== 'boolean')
                throw TypeError("Illegal littleEndian: Not a boolean");
        }
        this.littleEndian = !!littleEndian;
        return this;
    };

    /**
     * Switches (to) little endian byte order.
     * @param {boolean=} littleEndian Defaults to `true`, otherwise uses big endian
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.LE = function(littleEndian) {
        this.littleEndian = typeof littleEndian !== 'undefined' ? !!littleEndian : true;
        return this;
    };

    /**
     * Switches (to) big endian byte order.
     * @param {boolean=} bigEndian Defaults to `true`, otherwise uses little endian
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.BE = function(bigEndian) {
        this.littleEndian = typeof bigEndian !== 'undefined' ? !bigEndian : false;
        return this;
    };
    /**
     * Prepends some data to this ByteBuffer. This will overwrite any contents before the specified offset up to the
     *  prepended data's length. If there is not enough space available before the specified `offset`, the backing buffer
     *  will be resized and its contents moved accordingly.
     * @param {!ByteBuffer|string||!Buffer} source Data to prepend. If `source` is a ByteBuffer, its offset will be modified
     *  according to the performed read operation.
     * @param {(string|number)=} encoding Encoding if `data` is a string ("base64", "hex", "binary", defaults to "utf8")
     * @param {number=} offset Offset to prepend at. Will use and decrease {@link ByteBuffer#offset} by the number of bytes
     *  prepended if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     * @example A relative `00<01 02 03>.prepend(<04 05>)` results in `<04 05 01 02 03>, 04 05|`
     * @example An absolute `00<01 02 03>.prepend(<04 05>, 2)` results in `04<05 02 03>, 04 05|`
     */
    ByteBufferPrototype.prepend = function(source, encoding, offset) {
        if (typeof encoding === 'number' || typeof encoding !== 'string') {
            offset = encoding;
            encoding = undefined;
        }
        var relative = typeof offset === 'undefined';
        if (relative) offset = this.offset;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: "+offset+" (not an integer)");
            offset >>>= 0;
            if (offset < 0 || offset + 0 > this.buffer.length)
                throw RangeError("Illegal offset: 0 <= "+offset+" (+"+0+") <= "+this.buffer.length);
        }
        if (!(source instanceof ByteBuffer))
            source = ByteBuffer.wrap(source, encoding);
        var len = source.limit - source.offset;
        if (len <= 0) return this; // Nothing to prepend
        var diff = len - offset;
        if (diff > 0) { // Not enough space before offset, so resize + move
            var buffer = new Buffer(this.buffer.length + diff);
            this.buffer.copy(buffer, len, offset, this.buffer.length);
            this.buffer = buffer;
            this.offset += diff;
            if (this.markedOffset >= 0) this.markedOffset += diff;
            this.limit += diff;
            offset += diff;
        }        source.buffer.copy(this.buffer, offset - len, source.offset, source.limit);

        source.offset = source.limit;
        if (relative)
            this.offset -= len;
        return this;
    };

    /**
     * Prepends this ByteBuffer to another ByteBuffer. This will overwrite any contents before the specified offset up to the
     *  prepended data's length. If there is not enough space available before the specified `offset`, the backing buffer
     *  will be resized and its contents moved accordingly.
     * @param {!ByteBuffer} target Target ByteBuffer
     * @param {number=} offset Offset to prepend at. Will use and decrease {@link ByteBuffer#offset} by the number of bytes
     *  prepended if omitted.
     * @returns {!ByteBuffer} this
     * @expose
     * @see ByteBuffer#prepend
     */
    ByteBufferPrototype.prependTo = function(target, offset) {
        target.prepend(this, offset);
        return this;
    };
    /**
     * Prints debug information about this ByteBuffer's contents.
     * @param {function(string)=} out Output function to call, defaults to console.log
     * @expose
     */
    ByteBufferPrototype.printDebug = function(out) {
        if (typeof out !== 'function') out = console.log.bind(console);
        out(
            this.toString()+"\n"+
            "-------------------------------------------------------------------\n"+
            this.toDebug(/* columns */ true)
        );
    };

    /**
     * Gets the number of remaining readable bytes. Contents are the bytes between {@link ByteBuffer#offset} and
     *  {@link ByteBuffer#limit}, so this returns `limit - offset`.
     * @returns {number} Remaining readable bytes. May be negative if `offset > limit`.
     * @expose
     */
    ByteBufferPrototype.remaining = function() {
        return this.limit - this.offset;
    };
    /**
     * Resets this ByteBuffer's {@link ByteBuffer#offset}. If an offset has been marked through {@link ByteBuffer#mark}
     *  before, `offset` will be set to {@link ByteBuffer#markedOffset}, which will then be discarded. If no offset has been
     *  marked, sets `offset = 0`.
     * @returns {!ByteBuffer} this
     * @see ByteBuffer#mark
     * @expose
     */
    ByteBufferPrototype.reset = function() {
        if (this.markedOffset >= 0) {
            this.offset = this.markedOffset;
            this.markedOffset = -1;
        } else {
            this.offset = 0;
        }
        return this;
    };
    /**
     * Resizes this ByteBuffer to be backed by a buffer of at least the given capacity. Will do nothing if already that
     *  large or larger.
     * @param {number} capacity Capacity required
     * @returns {!ByteBuffer} this
     * @throws {TypeError} If `capacity` is not a number
     * @throws {RangeError} If `capacity < 0`
     * @expose
     */
    ByteBufferPrototype.resize = function(capacity) {
        if (!this.noAssert) {
            if (typeof capacity !== 'number' || capacity % 1 !== 0)
                throw TypeError("Illegal capacity: "+capacity+" (not an integer)");
            capacity |= 0;
            if (capacity < 0)
                throw RangeError("Illegal capacity: 0 <= "+capacity);
        }
        if (this.buffer.length < capacity) {
            var buffer = new Buffer(capacity);
            this.buffer.copy(buffer);
            this.buffer = buffer;
        }
        return this;
    };
    /**
     * Reverses this ByteBuffer's contents.
     * @param {number=} begin Offset to start at, defaults to {@link ByteBuffer#offset}
     * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.reverse = function(begin, end) {
        if (typeof begin === 'undefined') begin = this.offset;
        if (typeof end === 'undefined') end = this.limit;
        if (!this.noAssert) {
            if (typeof begin !== 'number' || begin % 1 !== 0)
                throw TypeError("Illegal begin: Not an integer");
            begin >>>= 0;
            if (typeof end !== 'number' || end % 1 !== 0)
                throw TypeError("Illegal end: Not an integer");
            end >>>= 0;
            if (begin < 0 || begin > end || end > this.buffer.length)
                throw RangeError("Illegal range: 0 <= "+begin+" <= "+end+" <= "+this.buffer.length);
        }
        if (begin === end)
            return this; // Nothing to reverse
        Array.prototype.reverse.call(this.buffer.slice(begin, end));
        return this;
    };
    /**
     * Skips the next `length` bytes. This will just advance
     * @param {number} length Number of bytes to skip. May also be negative to move the offset back.
     * @returns {!ByteBuffer} this
     * @expose
     */
    ByteBufferPrototype.skip = function(length) {
        if (!this.noAssert) {
            if (typeof length !== 'number' || length % 1 !== 0)
                throw TypeError("Illegal length: "+length+" (not an integer)");
            length |= 0;
        }
        var offset = this.offset + length;
        if (!this.noAssert) {
            if (offset < 0 || offset > this.buffer.length)
                throw RangeError("Illegal length: 0 <= "+this.offset+" + "+length+" <= "+this.buffer.length);
        }
        this.offset = offset;
        return this;
    };

    /**
     * Slices this ByteBuffer by creating a cloned instance with `offset = begin` and `limit = end`.
     * @param {number=} begin Begin offset, defaults to {@link ByteBuffer#offset}.
     * @param {number=} end End offset, defaults to {@link ByteBuffer#limit}.
     * @returns {!ByteBuffer} Clone of this ByteBuffer with slicing applied, backed by the same {@link ByteBuffer#buffer}
     * @expose
     */
    ByteBufferPrototype.slice = function(begin, end) {
        if (typeof begin === 'undefined') begin = this.offset;
        if (typeof end === 'undefined') end = this.limit;
        if (!this.noAssert) {
            if (typeof begin !== 'number' || begin % 1 !== 0)
                throw TypeError("Illegal begin: Not an integer");
            begin >>>= 0;
            if (typeof end !== 'number' || end % 1 !== 0)
                throw TypeError("Illegal end: Not an integer");
            end >>>= 0;
            if (begin < 0 || begin > end || end > this.buffer.length)
                throw RangeError("Illegal range: 0 <= "+begin+" <= "+end+" <= "+this.buffer.length);
        }
        var bb = this.clone();
        bb.offset = begin;
        bb.limit = end;
        return bb;
    };
    /**
     * Returns a copy of the backing buffer that contains this ByteBuffer's contents. Contents are the bytes between
     *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}.
     * @param {boolean=} forceCopy If `true` returns a copy, otherwise returns a view referencing the same memory if
     *  possible. Defaults to `false`
     * @returns {!Buffer} Contents as a Buffer
     * @expose
     */
    ByteBufferPrototype.toBuffer = function(forceCopy) {
        var offset = this.offset,
            limit = this.limit;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: Not an integer");
            offset >>>= 0;
            if (typeof limit !== 'number' || limit % 1 !== 0)
                throw TypeError("Illegal limit: Not an integer");
            limit >>>= 0;
            if (offset < 0 || offset > limit || limit > this.buffer.length)
                throw RangeError("Illegal range: 0 <= "+offset+" <= "+limit+" <= "+this.buffer.length);
        }
        if (forceCopy) {
            var buffer = new Buffer(limit - offset);
            this.buffer.copy(buffer, 0, offset, limit);
            return buffer;
        } else {
            if (offset === 0 && limit === this.buffer.length)
                return this.buffer;
            else
                return this.buffer.slice(offset, limit);
        }
    };

    /**
     * Returns a copy of the backing buffer compacted to contain this ByteBuffer's contents. Contents are the bytes between
     *  {@link ByteBuffer#offset} and {@link ByteBuffer#limit}.
     * @returns {!ArrayBuffer} Contents as an ArrayBuffer
     */
    ByteBufferPrototype.toArrayBuffer = function() {
        var offset = this.offset,
            limit = this.limit;
        if (!this.noAssert) {
            if (typeof offset !== 'number' || offset % 1 !== 0)
                throw TypeError("Illegal offset: Not an integer");
            offset >>>= 0;
            if (typeof limit !== 'number' || limit % 1 !== 0)
                throw TypeError("Illegal limit: Not an integer");
            limit >>>= 0;
            if (offset < 0 || offset > limit || limit > this.buffer.length)
                throw RangeError("Illegal range: 0 <= "+offset+" <= "+limit+" <= "+this.buffer.length);
        }
        var ab = new ArrayBuffer(limit - offset);
        if (memcpy) { // Fast
            memcpy(ab, 0, this.buffer, offset, limit);
        } else { // Slow
            var dst = new Uint8Array(ab);
            for (var i=offset; i<limit; ++i)
                dst[i-offset] = this.buffer[i];
        }
        return ab;
    };

    /**
     * Converts the ByteBuffer's contents to a string.
     * @param {string=} encoding Output encoding. Returns an informative string representation if omitted but also allows
     *  direct conversion to "utf8", "hex", "base64" and "binary" encoding. "debug" returns a hex representation with
     *  highlighted offsets.
     * @param {number=} begin Offset to begin at, defaults to {@link ByteBuffer#offset}
     * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}
     * @returns {string} String representation
     * @throws {Error} If `encoding` is invalid
     * @expose
     */
    ByteBufferPrototype.toString = function(encoding, begin, end) {
        if (typeof encoding === 'undefined')
            return "ByteBufferNB(offset="+this.offset+",markedOffset="+this.markedOffset+",limit="+this.limit+",capacity="+this.capacity()+")";
        if (typeof encoding === 'number')
            encoding = "utf8",
            begin = encoding,
            end = begin;
        switch (encoding) {
            case "utf8":
                return this.toUTF8(begin, end);
            case "base64":
                return this.toBase64(begin, end);
            case "hex":
                return this.toHex(begin, end);
            case "binary":
                return this.toBinary(begin, end);
            case "debug":
                return this.toDebug();
            case "columns":
                return this.toColumns();
            default:
                throw Error("Unsupported encoding: "+encoding);
        }
    };

    // encodings/base64

    /**
     * Encodes this ByteBuffer's contents to a base64 encoded string.
     * @param {number=} begin Offset to begin at, defaults to {@link ByteBuffer#offset}.
     * @param {number=} end Offset to end at, defaults to {@link ByteBuffer#limit}.
     * @returns {string} Base64 encoded string
     * @throws {RangeError} If `begin` or `end` is out of bounds
     * @expose
     */
    ByteBufferPrototype.toBase64 = function(begin, end) {
        if (typeof begin === 'undefined')
            begin = this.offset;
        if (typeof end === 'undefined')
            end = this.limit;
        begin = begin | 0; end = end | 0;
        if (begin < 0 || end > this.capacity || begin > end)
            throw RangeError("begin, end");
        return this.buffer.toString("base64", begin, end);
    };

    /**
     * Decodes a base64 encoded string to a ByteBuffer.
     * @param {string} str String to decode
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     */
    ByteBuffer.fromBase64 = function(str, littleEndian) {
        return ByteBuffer.wrap(new Buffer(str, "base64"), littleEndian);
        return bb;
    };

    /**
     * Encodes a binary string to base64 like `window.btoa` does.
     * @param {string} str Binary string
     * @returns {string} Base64 encoded string
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.btoa
     * @expose
     */
    ByteBuffer.btoa = function(str) {
        return ByteBuffer.fromBinary(str).toBase64();
    };

    /**
     * Decodes a base64 encoded string to binary like `window.atob` does.
     * @param {string} b64 Base64 encoded string
     * @returns {string} Binary string
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Window.atob
     * @expose
     */
    ByteBuffer.atob = function(b64) {
        return ByteBuffer.fromBase64(b64).toBinary();
    };

    // encodings/binary

    /**
     * Encodes this ByteBuffer to a binary encoded string, that is using only characters 0x00-0xFF as bytes.
     * @param {number=} begin Offset to begin at. Defaults to {@link ByteBuffer#offset}.
     * @param {number=} end Offset to end at. Defaults to {@link ByteBuffer#limit}.
     * @returns {string} Binary encoded string
     * @throws {RangeError} If `offset > limit`
     * @expose
     */
    ByteBufferPrototype.toBinary = function(begin, end) {
        if (typeof begin === 'undefined')
            begin = this.offset;
        if (typeof end === 'undefined')
            end = this.limit;
        begin |= 0; end |= 0;
        if (begin < 0 || end > this.capacity() || begin > end)
            throw RangeError("begin, end");
        return this.buffer.toString("binary", begin, end);
    };

    /**
     * Decodes a binary encoded string, that is using only characters 0x00-0xFF as bytes, to a ByteBuffer.
     * @param {string} str String to decode
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     */
    ByteBuffer.fromBinary = function(str, littleEndian) {
        return ByteBuffer.wrap(new Buffer(str, "binary"), littleEndian);
        return bb;
    };

    // encodings/debug

    /**
     * Encodes this ByteBuffer to a hex encoded string with marked offsets. Offset symbols are:
     * * `<` : offset,
     * * `'` : markedOffset,
     * * `>` : limit,
     * * `|` : offset and limit,
     * * `[` : offset and markedOffset,
     * * `]` : markedOffset and limit,
     * * `!` : offset, markedOffset and limit
     * @param {boolean=} columns If `true` returns two columns hex + ascii, defaults to `false`
     * @returns {string|!Array.<string>} Debug string or array of lines if `asArray = true`
     * @expose
     * @example `>00'01 02<03` contains four bytes with `limit=0, markedOffset=1, offset=3`
     * @example `00[01 02 03>` contains four bytes with `offset=markedOffset=1, limit=4`
     * @example `00|01 02 03` contains four bytes with `offset=limit=1, markedOffset=-1`
     * @example `|` contains zero bytes with `offset=limit=0, markedOffset=-1`
     */
    ByteBufferPrototype.toDebug = function(columns) {
        var i = -1,
            k = this.buffer.length,
            b,
            hex = "",
            asc = "",
            out = "";
        while (i<k) {
            if (i !== -1) {
                b = this.buffer[i];
                if (b < 0x10) hex += "0"+b.toString(16).toUpperCase();
                else hex += b.toString(16).toUpperCase();
                if (columns)
                    asc += b > 32 && b < 127 ? String.fromCharCode(b) : '.';
            }
            ++i;
            if (columns) {
                if (i > 0 && i % 16 === 0 && i !== k) {
                    while (hex.length < 3*16+3) hex += " ";
                    out += hex+asc+"\n";
                    hex = asc = "";
                }
            }
            if (i === this.offset && i === this.limit)
                hex += i === this.markedOffset ? "!" : "|";
            else if (i === this.offset)
                hex += i === this.markedOffset ? "[" : "<";
            else if (i === this.limit)
                hex += i === this.markedOffset ? "]" : ">";
            else
                hex += i === this.markedOffset ? "'" : (columns || (i !== 0 && i !== k) ? " " : "");
        }
        if (columns && hex !== " ") {
            while (hex.length < 3*16+3)
                hex += " ";
            out += hex + asc + "\n";
        }
        return columns ? out : hex;
    };

    /**
     * Decodes a hex encoded string with marked offsets to a ByteBuffer.
     * @param {string} str Debug string to decode (not be generated with `columns = true`)
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     * @see ByteBuffer#toDebug
     */
    ByteBuffer.fromDebug = function(str, littleEndian, noAssert) {
        var k = str.length,
            bb = new ByteBuffer(((k+1)/3)|0, littleEndian, noAssert);
        var i = 0, j = 0, ch, b,
            rs = false, // Require symbol next
            ho = false, hm = false, hl = false, // Already has offset (ho), markedOffset (hm), limit (hl)?
            fail = false;
        while (i<k) {
            switch (ch = str.charAt(i++)) {
                case '!':
                    if (!noAssert) {
                        if (ho || hm || hl) {
                            fail = true;
                            break;
                        }
                        ho = hm = hl = true;
                    }
                    bb.offset = bb.markedOffset = bb.limit = j;
                    rs = false;
                    break;
                case '|':
                    if (!noAssert) {
                        if (ho || hl) {
                            fail = true;
                            break;
                        }
                        ho = hl = true;
                    }
                    bb.offset = bb.limit = j;
                    rs = false;
                    break;
                case '[':
                    if (!noAssert) {
                        if (ho || hm) {
                            fail = true;
                            break;
                        }
                        ho = hm = true;
                    }
                    bb.offset = bb.markedOffset = j;
                    rs = false;
                    break;
                case '<':
                    if (!noAssert) {
                        if (ho) {
                            fail = true;
                            break;
                        }
                        ho = true;
                    }
                    bb.offset = j;
                    rs = false;
                    break;
                case ']':
                    if (!noAssert) {
                        if (hl || hm) {
                            fail = true;
                            break;
                        }
                        hl = hm = true;
                    }
                    bb.limit = bb.markedOffset = j;
                    rs = false;
                    break;
                case '>':
                    if (!noAssert) {
                        if (hl) {
                            fail = true;
                            break;
                        }
                        hl = true;
                    }
                    bb.limit = j;
                    rs = false;
                    break;
                case "'":
                    if (!noAssert) {
                        if (hm) {
                            fail = true;
                            break;
                        }
                        hm = true;
                    }
                    bb.markedOffset = j;
                    rs = false;
                    break;
                case ' ':
                    rs = false;
                    break;
                default:
                    if (!noAssert) {
                        if (rs) {
                            fail = true;
                            break;
                        }
                    }
                    b = parseInt(ch+str.charAt(i++), 16);
                    if (!noAssert) {
                        if (isNaN(b) || b < 0 || b > 255)
                            throw TypeError("Illegal str: Not a debug encoded string");
                    }
                    bb.buffer[j++] = b;
                    rs = true;
            }
            if (fail)
                throw TypeError("Illegal str: Invalid symbol at "+i);
        }
        if (!noAssert) {
            if (!ho || !hl)
                throw TypeError("Illegal str: Missing offset or limit");
            if (j<bb.buffer.length)
                throw TypeError("Illegal str: Not a debug encoded string (is it hex?) "+j+" < "+k);
        }
        return bb;
    };

    // encodings/hex

    /**
     * Encodes this ByteBuffer's contents to a hex encoded string.
     * @param {number=} begin Offset to begin at. Defaults to {@link ByteBuffer#offset}.
     * @param {number=} end Offset to end at. Defaults to {@link ByteBuffer#limit}.
     * @returns {string} Hex encoded string
     * @expose
     */
    ByteBufferPrototype.toHex = function(begin, end) {
        begin = typeof begin === 'undefined' ? this.offset : begin;
        end = typeof end === 'undefined' ? this.limit : end;
        if (!this.noAssert) {
            if (typeof begin !== 'number' || begin % 1 !== 0)
                throw TypeError("Illegal begin: Not an integer");
            begin >>>= 0;
            if (typeof end !== 'number' || end % 1 !== 0)
                throw TypeError("Illegal end: Not an integer");
            end >>>= 0;
            if (begin < 0 || begin > end || end > this.buffer.length)
                throw RangeError("Illegal range: 0 <= "+begin+" <= "+end+" <= "+this.buffer.length);
        }
        return this.buffer.toString("hex", begin, end);
    };

    /**
     * Decodes a hex encoded string to a ByteBuffer.
     * @param {string} str String to decode
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     */
    ByteBuffer.fromHex = function(str, littleEndian, noAssert) {
        if (!noAssert) {
            if (typeof str !== 'string')
                throw TypeError("Illegal str: Not a string");
            if (str.length % 2 !== 0)
                throw TypeError("Illegal str: Length not a multiple of 2");
        }
        var bb = new ByteBuffer(0, littleEndian, true);
        bb.buffer = new Buffer(str, "hex");
        bb.limit = bb.buffer.length;
        return bb;
    };

    // utfx-embeddable

    /**
     * utfx-embeddable (c) 2014 Daniel Wirtz <dcode@dcode.io>
     * Released under the Apache License, Version 2.0
     * see: https://github.com/dcodeIO/utfx for details
     */
    var utfx = function() {
        "use strict";

        /**
         * utfx namespace.
         * @inner
         * @type {!Object.<string,*>}
         */
        var utfx = {};

        /**
         * Maximum valid code point.
         * @type {number}
         * @const
         */
        utfx.MAX_CODEPOINT = 0x10FFFF;

        /**
         * Encodes UTF8 code points to UTF8 bytes.
         * @param {(!function():number|null) | number} src Code points source, either as a function returning the next code point
         *  respectively `null` if there are no more code points left or a single numeric code point.
         * @param {!function(number)} dst Bytes destination as a function successively called with the next byte
         */
        utfx.encodeUTF8 = function(src, dst) {
            var cp = null;
            if (typeof src === 'number')
                cp = src,
                src = function() { return null; };
            while (cp !== null || (cp = src()) !== null) {
                if (cp < 0x80)
                    dst(cp&0x7F);
                else if (cp < 0x800)
                    dst(((cp>>6)&0x1F)|0xC0),
                    dst((cp&0x3F)|0x80);
                else if (cp < 0x10000)
                    dst(((cp>>12)&0x0F)|0xE0),
                    dst(((cp>>6)&0x3F)|0x80),
                    dst((cp&0x3F)|0x80);
                else
                    dst(((cp>>18)&0x07)|0xF0),
                    dst(((cp>>12)&0x3F)|0x80),
                    dst(((cp>>6)&0x3F)|0x80),
                    dst((cp&0x3F)|0x80);
                cp = null;
            }
        };

        /**
         * Decodes UTF8 bytes to UTF8 code points.
         * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if there
         *  are no more bytes left.
         * @param {!function(number)} dst Code points destination as a function successively called with each decoded code point.
         * @throws {RangeError} If a starting byte is invalid in UTF8
         * @throws {Error} If the last sequence is truncated. Has an array property `bytes` holding the
         *  remaining bytes.
         */
        utfx.decodeUTF8 = function(src, dst) {
            var a, b, c, d, fail = function(b) {
                b = b.slice(0, b.indexOf(null));
                var err = Error(b.toString());
                err.name = "TruncatedError";
                err['bytes'] = b;
                throw err;
            };
            while ((a = src()) !== null) {
                if ((a&0x80) === 0)
                    dst(a);
                else if ((a&0xE0) === 0xC0)
                    ((b = src()) === null) && fail([a, b]),
                    dst(((a&0x1F)<<6) | (b&0x3F));
                else if ((a&0xF0) === 0xE0)
                    ((b=src()) === null || (c=src()) === null) && fail([a, b, c]),
                    dst(((a&0x0F)<<12) | ((b&0x3F)<<6) | (c&0x3F));
                else if ((a&0xF8) === 0xF0)
                    ((b=src()) === null || (c=src()) === null || (d=src()) === null) && fail([a, b, c ,d]),
                    dst(((a&0x07)<<18) | ((b&0x3F)<<12) | ((c&0x3F)<<6) | (d&0x3F));
                else throw RangeError("Illegal starting byte: "+a);
            }
        };

        /**
         * Converts UTF16 characters to UTF8 code points.
         * @param {!function():number|null} src Characters source as a function returning the next char code respectively
         *  `null` if there are no more characters left.
         * @param {!function(number)} dst Code points destination as a function successively called with each converted code
         *  point.
         */
        utfx.UTF16toUTF8 = function(src, dst) {
            var c1, c2 = null;
            while (true) {
                if ((c1 = c2 !== null ? c2 : src()) === null)
                    break;
                if (c1 >= 0xD800 && c1 <= 0xDFFF) {
                    if ((c2 = src()) !== null) {
                        if (c2 >= 0xDC00 && c2 <= 0xDFFF) {
                            dst((c1-0xD800)*0x400+c2-0xDC00+0x10000);
                            c2 = null; continue;
                        }
                    }
                }
                dst(c1);
            }
            if (c2 !== null) dst(c2);
        };

        /**
         * Converts UTF8 code points to UTF16 characters.
         * @param {(!function():number|null) | number} src Code points source, either as a function returning the next code point
         *  respectively `null` if there are no more code points left or a single numeric code point.
         * @param {!function(number)} dst Characters destination as a function successively called with each converted char code.
         * @throws {RangeError} If a code point is out of range
         */
        utfx.UTF8toUTF16 = function(src, dst) {
            var cp = null;
            if (typeof src === 'number')
                cp = src, src = function() { return null; };
            while (cp !== null || (cp = src()) !== null) {
                if (cp <= 0xFFFF)
                    dst(cp);
                else
                    cp -= 0x10000,
                    dst((cp>>10)+0xD800),
                    dst((cp%0x400)+0xDC00);
                cp = null;
            }
        };

        /**
         * Converts and encodes UTF16 characters to UTF8 bytes.
         * @param {!function():number|null} src Characters source as a function returning the next char code respectively `null`
         *  if there are no more characters left.
         * @param {!function(number)} dst Bytes destination as a function successively called with the next byte.
         */
        utfx.encodeUTF16toUTF8 = function(src, dst) {
            utfx.UTF16toUTF8(src, function(cp) {
                utfx.encodeUTF8(cp, dst);
            });
        };

        /**
         * Decodes and converts UTF8 bytes to UTF16 characters.
         * @param {!function():number|null} src Bytes source as a function returning the next byte respectively `null` if there
         *  are no more bytes left.
         * @param {!function(number)} dst Characters destination as a function successively called with each converted char code.
         * @throws {RangeError} If a starting byte is invalid in UTF8
         * @throws {Error} If the last sequence is truncated. Has an array property `bytes` holding the remaining bytes.
         */
        utfx.decodeUTF8toUTF16 = function(src, dst) {
            utfx.decodeUTF8(src, function(cp) {
                utfx.UTF8toUTF16(cp, dst);
            });
        };

        /**
         * Calculates the byte length of an UTF8 code point.
         * @param {number} cp UTF8 code point
         * @returns {number} Byte length
         */
        utfx.calculateCodePoint = function(cp) {
            return (cp < 0x80) ? 1 : (cp < 0x800) ? 2 : (cp < 0x10000) ? 3 : 4;
        };

        /**
         * Calculates the number of UTF8 bytes required to store UTF8 code points.
         * @param {(!function():number|null)} src Code points source as a function returning the next code point respectively
         *  `null` if there are no more code points left.
         * @returns {number} The number of UTF8 bytes required
         */
        utfx.calculateUTF8 = function(src) {
            var cp, l=0;
            while ((cp = src()) !== null)
                l += (cp < 0x80) ? 1 : (cp < 0x800) ? 2 : (cp < 0x10000) ? 3 : 4;
            return l;
        };

        /**
         * Calculates the number of UTF8 code points respectively UTF8 bytes required to store UTF16 char codes.
         * @param {(!function():number|null)} src Characters source as a function returning the next char code respectively
         *  `null` if there are no more characters left.
         * @returns {!Array.<number>} The number of UTF8 code points at index 0 and the number of UTF8 bytes required at index 1.
         */
        utfx.calculateUTF16asUTF8 = function(src) {
            var n=0, l=0;
            utfx.UTF16toUTF8(src, function(cp) {
                ++n; l += (cp < 0x80) ? 1 : (cp < 0x800) ? 2 : (cp < 0x10000) ? 3 : 4;
            });
            return [n,l];
        };

        return utfx;
    }();

    // encodings/utf8

    /**
     * Encodes this ByteBuffer's contents between {@link ByteBuffer#offset} and {@link ByteBuffer#limit} to an UTF8 encoded
     *  string.
     * @returns {string} Hex encoded string
     * @throws {RangeError} If `offset > limit`
     * @expose
     */
    ByteBufferPrototype.toUTF8 = function(begin, end) {
        if (typeof begin === 'undefined') begin = this.offset;
        if (typeof end === 'undefined') end = this.limit;
        if (!this.noAssert) {
            if (typeof begin !== 'number' || begin % 1 !== 0)
                throw TypeError("Illegal begin: Not an integer");
            begin >>>= 0;
            if (typeof end !== 'number' || end % 1 !== 0)
                throw TypeError("Illegal end: Not an integer");
            end >>>= 0;
            if (begin < 0 || begin > end || end > this.buffer.length)
                throw RangeError("Illegal range: 0 <= "+begin+" <= "+end+" <= "+this.buffer.length);
        }
        return this.buffer.toString("utf8", begin, end);
    };

    /**
     * Decodes an UTF8 encoded string to a ByteBuffer.
     * @param {string} str String to decode
     * @param {boolean=} littleEndian Whether to use little or big endian byte order. Defaults to
     *  {@link ByteBuffer.DEFAULT_ENDIAN}.
     * @param {boolean=} noAssert Whether to skip assertions of offsets and values. Defaults to
     *  {@link ByteBuffer.DEFAULT_NOASSERT}.
     * @returns {!ByteBuffer} ByteBuffer
     * @expose
     */
    ByteBuffer.fromUTF8 = function(str, littleEndian, noAssert) {
        if (!noAssert)
            if (typeof str !== 'string')
                throw TypeError("Illegal str: Not a string");
        var bb = new ByteBuffer(0, littleEndian, noAssert);
        bb.buffer = new Buffer(str, "utf8");
        bb.limit = bb.buffer.length;
        return bb;
    };


    /**
     * node-memcpy. This is an optional binding dependency and may not be present.
     * @function
     * @param {!(Buffer|ArrayBuffer|Uint8Array)} target Destination
     * @param {number|!(Buffer|ArrayBuffer)} targetStart Destination start, defaults to 0.
     * @param {(!(Buffer|ArrayBuffer|Uint8Array)|number)=} source Source
     * @param {number=} sourceStart Source start, defaults to 0.
     * @param {number=} sourceEnd Source end, defaults to capacity.
     * @returns {number} Number of bytes copied
     * @throws {Error} If any index is out of bounds
     * @expose
     */
    ByteBuffer.memcpy = memcpy;

    return ByteBuffer;

})();


/***/ }),

/***/ 2722:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


(function() {
  var PNGHEADER_BASE64,
    bufferpack,
    crc,
    ignoreChunkTypes,
    revertCgBIBuffer,
    streamToBuffer,
    streamifier,
    zlib,
    indexOf =
      [].indexOf ||
      function(item) {
        for (var i = 0, l = this.length; i < l; i++) {
          if (i in this && this[i] === item) return i;
        }
        return -1;
      };

  streamToBuffer = __webpack_require__(1119);

  bufferpack = __webpack_require__(7626);

  streamifier = __webpack_require__(4651);

  zlib = __webpack_require__(8761);

  crc = __webpack_require__(3973);

  PNGHEADER_BASE64 = "iVBORw0KGgo=";

  ignoreChunkTypes = ["CgBI", "iDOT"];

  module.exports = function(stream, callback) {
    return streamToBuffer(stream, function(err, buffer) {
      var output;
      if (err) {
        return callback(err);
      }
      try {
        output = revertCgBIBuffer(buffer);
        return callback(null, streamifier.createReadStream(output));
      } catch (e) {
        return callback(e);
      }
    });
  };

  module.exports.revert = revertCgBIBuffer = function(buffer) {
    let isIphoneCompressed = false;
    let offset = 0;
    let chunks = [];
    let idatCgbiData = new Buffer(0);
    let headerData = buffer.slice(0, 8);
    let ref,
      width,
      height,
      chunk,
      uncompressed,
      newData,
      j,
      y,
      ref1,
      ref2,
      k,
      x,
      idatData,
      chunkCRC,
      idat_chunk;
    offset += 8;
    if (headerData.toString("base64") !== PNGHEADER_BASE64) {
      throw new Error("not a png file");
    }
    while (offset < buffer.length) {
      chunk = {};
      let data = buffer.slice(offset, offset + 4);
      offset += 4;
      chunk.length = bufferpack.unpack("L>", data, 0)[0];
      data = buffer.slice(offset, offset + 4);
      offset += 4;
      chunk.type = data.toString();
      chunk.data = data = buffer.slice(offset, offset + chunk.length);
      offset += chunk.length;
      let dataCrc = buffer.slice(offset, offset + 4);
      offset += 4;
      chunk.crc = bufferpack.unpack("L>", dataCrc, 0)[0];
      if (chunk.type === "CgBI") {
        isIphoneCompressed = true;
      }
      if (((ref = chunk.type), indexOf.call(ignoreChunkTypes, ref) >= 0)) {
        continue;
      }
      if (chunk.type === "IHDR") {
        width = bufferpack.unpack("L>", data)[0];
        height = bufferpack.unpack("L>", data, 4)[0];
      }
      if (chunk.type === "IDAT" && isIphoneCompressed) {
        idatCgbiData = Buffer.concat([idatCgbiData, data]);
        continue;
      }
      if (chunk.type === "IEND" && isIphoneCompressed) {
        uncompressed = zlib.inflateRawSync(idatCgbiData);
        newData = new Buffer(uncompressed.length);
        let i = 0;
        for (
          y = j = 0, ref1 = height - 1;
          0 <= ref1 ? j <= ref1 : j >= ref1;
          y = 0 <= ref1 ? ++j : --j
        ) {
          newData[i] = uncompressed[i];
          i++;
          for (
            x = k = 0, ref2 = width - 1;
            0 <= ref2 ? k <= ref2 : k >= ref2;
            x = 0 <= ref2 ? ++k : --k
          ) {
            newData[i + 0] = uncompressed[i + 2];
            newData[i + 1] = uncompressed[i + 1];
            newData[i + 2] = uncompressed[i + 0];
            newData[i + 3] = uncompressed[i + 3];
            i += 4;
          }
        }
        idatData = zlib.deflateSync(newData);
        chunkCRC = crc.crc32("IDAT");
        chunkCRC = crc.crc32(idatData, chunkCRC);
        chunkCRC = (chunkCRC + 0x100000000) % 0x100000000;
        idat_chunk = {
          type: "IDAT",
          length: idatData.length,
          data: idatData,
          crc: chunkCRC
        };
        chunks.push(idat_chunk);
      }
      chunks.push(chunk);
    }
    let output = headerData;
    for (let l = 0, len = chunks.length; l < len; l++) {
      chunk = chunks[l];
      output = Buffer.concat([output, bufferpack.pack("L>", [chunk.length])]);
      output = Buffer.concat([output, new Buffer(chunk.type)]);
      if (chunk.length > 0) {
        output = Buffer.concat([output, new Buffer(chunk.data)]);
      }
      output = Buffer.concat([output, bufferpack.pack("L>", [chunk.crc])]);
    }
    return output;
  };
}.call(this));


/***/ }),

/***/ 1331:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(5570).default;


/***/ }),

/***/ 2394:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(5816).default;


/***/ }),

/***/ 4336:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(5842).default;


/***/ }),

/***/ 3377:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(3328).default;


/***/ }),

/***/ 753:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(2837).default;


/***/ }),

/***/ 8813:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(1602).default;


/***/ }),

/***/ 2034:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(5418).default;


/***/ }),

/***/ 4312:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(2937).default;


/***/ }),

/***/ 3214:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(5423).default;


/***/ }),

/***/ 7019:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(534).default;


/***/ }),

/***/ 4096:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(3139).default;


/***/ }),

/***/ 5570:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});

var _buffer = __webpack_require__(4293);

var _create_buffer = __webpack_require__(9038);

var _create_buffer2 = _interopRequireDefault(_create_buffer);

var _define_crc = __webpack_require__(1498);

var _define_crc2 = _interopRequireDefault(_define_crc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var crc1 = (0, _define_crc2.default)('crc1', function (buf, previous) {
  if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);

  var crc = ~~previous;
  var accum = 0;

  for (var index = 0; index < buf.length; index++) {
    var byte = buf[index];
    accum += byte;
  }

  crc += accum % 256;
  return crc % 256;
});

exports.default = crc1;


/***/ }),

/***/ 5816:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});

var _buffer = __webpack_require__(4293);

var _create_buffer = __webpack_require__(9038);

var _create_buffer2 = _interopRequireDefault(_create_buffer);

var _define_crc = __webpack_require__(1498);

var _define_crc2 = _interopRequireDefault(_define_crc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Generated by `./pycrc.py --algorithm=table-driven --model=crc-16 --generate=c`
// prettier-ignore
var TABLE = [0x0000, 0xc0c1, 0xc181, 0x0140, 0xc301, 0x03c0, 0x0280, 0xc241, 0xc601, 0x06c0, 0x0780, 0xc741, 0x0500, 0xc5c1, 0xc481, 0x0440, 0xcc01, 0x0cc0, 0x0d80, 0xcd41, 0x0f00, 0xcfc1, 0xce81, 0x0e40, 0x0a00, 0xcac1, 0xcb81, 0x0b40, 0xc901, 0x09c0, 0x0880, 0xc841, 0xd801, 0x18c0, 0x1980, 0xd941, 0x1b00, 0xdbc1, 0xda81, 0x1a40, 0x1e00, 0xdec1, 0xdf81, 0x1f40, 0xdd01, 0x1dc0, 0x1c80, 0xdc41, 0x1400, 0xd4c1, 0xd581, 0x1540, 0xd701, 0x17c0, 0x1680, 0xd641, 0xd201, 0x12c0, 0x1380, 0xd341, 0x1100, 0xd1c1, 0xd081, 0x1040, 0xf001, 0x30c0, 0x3180, 0xf141, 0x3300, 0xf3c1, 0xf281, 0x3240, 0x3600, 0xf6c1, 0xf781, 0x3740, 0xf501, 0x35c0, 0x3480, 0xf441, 0x3c00, 0xfcc1, 0xfd81, 0x3d40, 0xff01, 0x3fc0, 0x3e80, 0xfe41, 0xfa01, 0x3ac0, 0x3b80, 0xfb41, 0x3900, 0xf9c1, 0xf881, 0x3840, 0x2800, 0xe8c1, 0xe981, 0x2940, 0xeb01, 0x2bc0, 0x2a80, 0xea41, 0xee01, 0x2ec0, 0x2f80, 0xef41, 0x2d00, 0xedc1, 0xec81, 0x2c40, 0xe401, 0x24c0, 0x2580, 0xe541, 0x2700, 0xe7c1, 0xe681, 0x2640, 0x2200, 0xe2c1, 0xe381, 0x2340, 0xe101, 0x21c0, 0x2080, 0xe041, 0xa001, 0x60c0, 0x6180, 0xa141, 0x6300, 0xa3c1, 0xa281, 0x6240, 0x6600, 0xa6c1, 0xa781, 0x6740, 0xa501, 0x65c0, 0x6480, 0xa441, 0x6c00, 0xacc1, 0xad81, 0x6d40, 0xaf01, 0x6fc0, 0x6e80, 0xae41, 0xaa01, 0x6ac0, 0x6b80, 0xab41, 0x6900, 0xa9c1, 0xa881, 0x6840, 0x7800, 0xb8c1, 0xb981, 0x7940, 0xbb01, 0x7bc0, 0x7a80, 0xba41, 0xbe01, 0x7ec0, 0x7f80, 0xbf41, 0x7d00, 0xbdc1, 0xbc81, 0x7c40, 0xb401, 0x74c0, 0x7580, 0xb541, 0x7700, 0xb7c1, 0xb681, 0x7640, 0x7200, 0xb2c1, 0xb381, 0x7340, 0xb101, 0x71c0, 0x7080, 0xb041, 0x5000, 0x90c1, 0x9181, 0x5140, 0x9301, 0x53c0, 0x5280, 0x9241, 0x9601, 0x56c0, 0x5780, 0x9741, 0x5500, 0x95c1, 0x9481, 0x5440, 0x9c01, 0x5cc0, 0x5d80, 0x9d41, 0x5f00, 0x9fc1, 0x9e81, 0x5e40, 0x5a00, 0x9ac1, 0x9b81, 0x5b40, 0x9901, 0x59c0, 0x5880, 0x9841, 0x8801, 0x48c0, 0x4980, 0x8941, 0x4b00, 0x8bc1, 0x8a81, 0x4a40, 0x4e00, 0x8ec1, 0x8f81, 0x4f40, 0x8d01, 0x4dc0, 0x4c80, 0x8c41, 0x4400, 0x84c1, 0x8581, 0x4540, 0x8701, 0x47c0, 0x4680, 0x8641, 0x8201, 0x42c0, 0x4380, 0x8341, 0x4100, 0x81c1, 0x8081, 0x4040];

if (typeof Int32Array !== 'undefined') TABLE = new Int32Array(TABLE);

var crc16 = (0, _define_crc2.default)('crc-16', function (buf, previous) {
  if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);

  var crc = ~~previous;

  for (var index = 0; index < buf.length; index++) {
    var byte = buf[index];
    crc = (TABLE[(crc ^ byte) & 0xff] ^ crc >> 8) & 0xffff;
  }

  return crc;
});

exports.default = crc16;


/***/ }),

/***/ 5842:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});

var _buffer = __webpack_require__(4293);

var _create_buffer = __webpack_require__(9038);

var _create_buffer2 = _interopRequireDefault(_create_buffer);

var _define_crc = __webpack_require__(1498);

var _define_crc2 = _interopRequireDefault(_define_crc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Generated by `./pycrc.py --algorithm=table-driven --model=ccitt --generate=c`
// prettier-ignore
var TABLE = [0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7, 0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef, 0x1231, 0x0210, 0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6, 0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de, 0x2462, 0x3443, 0x0420, 0x1401, 0x64e6, 0x74c7, 0x44a4, 0x5485, 0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d, 0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6, 0x5695, 0x46b4, 0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc, 0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823, 0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b, 0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12, 0xdbfd, 0xcbdc, 0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a, 0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41, 0xedae, 0xfd8f, 0xcdec, 0xddcd, 0xad2a, 0xbd0b, 0x8d68, 0x9d49, 0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70, 0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a, 0x9f59, 0x8f78, 0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f, 0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067, 0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e, 0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256, 0xb5ea, 0xa5cb, 0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d, 0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405, 0xa7db, 0xb7fa, 0x8799, 0x97b8, 0xe75f, 0xf77e, 0xc71d, 0xd73c, 0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634, 0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9, 0xb98a, 0xa9ab, 0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3, 0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a, 0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92, 0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9, 0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1, 0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8, 0x6e17, 0x7e36, 0x4e55, 0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0];

if (typeof Int32Array !== 'undefined') TABLE = new Int32Array(TABLE);

var crc16ccitt = (0, _define_crc2.default)('ccitt', function (buf, previous) {
  if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);

  var crc = typeof previous !== 'undefined' ? ~~previous : 0xffff;

  for (var index = 0; index < buf.length; index++) {
    var byte = buf[index];
    crc = (TABLE[(crc >> 8 ^ byte) & 0xff] ^ crc << 8) & 0xffff;
  }

  return crc;
});

exports.default = crc16ccitt;


/***/ }),

/***/ 3328:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});

var _buffer = __webpack_require__(4293);

var _create_buffer = __webpack_require__(9038);

var _create_buffer2 = _interopRequireDefault(_create_buffer);

var _define_crc = __webpack_require__(1498);

var _define_crc2 = _interopRequireDefault(_define_crc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Generated by `./pycrc.py --algorithm=table-driven --model=kermit --generate=c`
// prettier-ignore
var TABLE = [0x0000, 0x1189, 0x2312, 0x329b, 0x4624, 0x57ad, 0x6536, 0x74bf, 0x8c48, 0x9dc1, 0xaf5a, 0xbed3, 0xca6c, 0xdbe5, 0xe97e, 0xf8f7, 0x1081, 0x0108, 0x3393, 0x221a, 0x56a5, 0x472c, 0x75b7, 0x643e, 0x9cc9, 0x8d40, 0xbfdb, 0xae52, 0xdaed, 0xcb64, 0xf9ff, 0xe876, 0x2102, 0x308b, 0x0210, 0x1399, 0x6726, 0x76af, 0x4434, 0x55bd, 0xad4a, 0xbcc3, 0x8e58, 0x9fd1, 0xeb6e, 0xfae7, 0xc87c, 0xd9f5, 0x3183, 0x200a, 0x1291, 0x0318, 0x77a7, 0x662e, 0x54b5, 0x453c, 0xbdcb, 0xac42, 0x9ed9, 0x8f50, 0xfbef, 0xea66, 0xd8fd, 0xc974, 0x4204, 0x538d, 0x6116, 0x709f, 0x0420, 0x15a9, 0x2732, 0x36bb, 0xce4c, 0xdfc5, 0xed5e, 0xfcd7, 0x8868, 0x99e1, 0xab7a, 0xbaf3, 0x5285, 0x430c, 0x7197, 0x601e, 0x14a1, 0x0528, 0x37b3, 0x263a, 0xdecd, 0xcf44, 0xfddf, 0xec56, 0x98e9, 0x8960, 0xbbfb, 0xaa72, 0x6306, 0x728f, 0x4014, 0x519d, 0x2522, 0x34ab, 0x0630, 0x17b9, 0xef4e, 0xfec7, 0xcc5c, 0xddd5, 0xa96a, 0xb8e3, 0x8a78, 0x9bf1, 0x7387, 0x620e, 0x5095, 0x411c, 0x35a3, 0x242a, 0x16b1, 0x0738, 0xffcf, 0xee46, 0xdcdd, 0xcd54, 0xb9eb, 0xa862, 0x9af9, 0x8b70, 0x8408, 0x9581, 0xa71a, 0xb693, 0xc22c, 0xd3a5, 0xe13e, 0xf0b7, 0x0840, 0x19c9, 0x2b52, 0x3adb, 0x4e64, 0x5fed, 0x6d76, 0x7cff, 0x9489, 0x8500, 0xb79b, 0xa612, 0xd2ad, 0xc324, 0xf1bf, 0xe036, 0x18c1, 0x0948, 0x3bd3, 0x2a5a, 0x5ee5, 0x4f6c, 0x7df7, 0x6c7e, 0xa50a, 0xb483, 0x8618, 0x9791, 0xe32e, 0xf2a7, 0xc03c, 0xd1b5, 0x2942, 0x38cb, 0x0a50, 0x1bd9, 0x6f66, 0x7eef, 0x4c74, 0x5dfd, 0xb58b, 0xa402, 0x9699, 0x8710, 0xf3af, 0xe226, 0xd0bd, 0xc134, 0x39c3, 0x284a, 0x1ad1, 0x0b58, 0x7fe7, 0x6e6e, 0x5cf5, 0x4d7c, 0xc60c, 0xd785, 0xe51e, 0xf497, 0x8028, 0x91a1, 0xa33a, 0xb2b3, 0x4a44, 0x5bcd, 0x6956, 0x78df, 0x0c60, 0x1de9, 0x2f72, 0x3efb, 0xd68d, 0xc704, 0xf59f, 0xe416, 0x90a9, 0x8120, 0xb3bb, 0xa232, 0x5ac5, 0x4b4c, 0x79d7, 0x685e, 0x1ce1, 0x0d68, 0x3ff3, 0x2e7a, 0xe70e, 0xf687, 0xc41c, 0xd595, 0xa12a, 0xb0a3, 0x8238, 0x93b1, 0x6b46, 0x7acf, 0x4854, 0x59dd, 0x2d62, 0x3ceb, 0x0e70, 0x1ff9, 0xf78f, 0xe606, 0xd49d, 0xc514, 0xb1ab, 0xa022, 0x92b9, 0x8330, 0x7bc7, 0x6a4e, 0x58d5, 0x495c, 0x3de3, 0x2c6a, 0x1ef1, 0x0f78];

if (typeof Int32Array !== 'undefined') TABLE = new Int32Array(TABLE);

var crc16kermit = (0, _define_crc2.default)('kermit', function (buf, previous) {
  if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);

  var crc = typeof previous !== 'undefined' ? ~~previous : 0x0000;

  for (var index = 0; index < buf.length; index++) {
    var byte = buf[index];
    crc = (TABLE[(crc ^ byte) & 0xff] ^ crc >> 8) & 0xffff;
  }

  return crc;
});

exports.default = crc16kermit;


/***/ }),

/***/ 2837:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});

var _buffer = __webpack_require__(4293);

var _create_buffer = __webpack_require__(9038);

var _create_buffer2 = _interopRequireDefault(_create_buffer);

var _define_crc = __webpack_require__(1498);

var _define_crc2 = _interopRequireDefault(_define_crc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Generated by `./pycrc.py --algorithm=table-driven --model=crc-16-modbus --generate=c`
// prettier-ignore
var TABLE = [0x0000, 0xc0c1, 0xc181, 0x0140, 0xc301, 0x03c0, 0x0280, 0xc241, 0xc601, 0x06c0, 0x0780, 0xc741, 0x0500, 0xc5c1, 0xc481, 0x0440, 0xcc01, 0x0cc0, 0x0d80, 0xcd41, 0x0f00, 0xcfc1, 0xce81, 0x0e40, 0x0a00, 0xcac1, 0xcb81, 0x0b40, 0xc901, 0x09c0, 0x0880, 0xc841, 0xd801, 0x18c0, 0x1980, 0xd941, 0x1b00, 0xdbc1, 0xda81, 0x1a40, 0x1e00, 0xdec1, 0xdf81, 0x1f40, 0xdd01, 0x1dc0, 0x1c80, 0xdc41, 0x1400, 0xd4c1, 0xd581, 0x1540, 0xd701, 0x17c0, 0x1680, 0xd641, 0xd201, 0x12c0, 0x1380, 0xd341, 0x1100, 0xd1c1, 0xd081, 0x1040, 0xf001, 0x30c0, 0x3180, 0xf141, 0x3300, 0xf3c1, 0xf281, 0x3240, 0x3600, 0xf6c1, 0xf781, 0x3740, 0xf501, 0x35c0, 0x3480, 0xf441, 0x3c00, 0xfcc1, 0xfd81, 0x3d40, 0xff01, 0x3fc0, 0x3e80, 0xfe41, 0xfa01, 0x3ac0, 0x3b80, 0xfb41, 0x3900, 0xf9c1, 0xf881, 0x3840, 0x2800, 0xe8c1, 0xe981, 0x2940, 0xeb01, 0x2bc0, 0x2a80, 0xea41, 0xee01, 0x2ec0, 0x2f80, 0xef41, 0x2d00, 0xedc1, 0xec81, 0x2c40, 0xe401, 0x24c0, 0x2580, 0xe541, 0x2700, 0xe7c1, 0xe681, 0x2640, 0x2200, 0xe2c1, 0xe381, 0x2340, 0xe101, 0x21c0, 0x2080, 0xe041, 0xa001, 0x60c0, 0x6180, 0xa141, 0x6300, 0xa3c1, 0xa281, 0x6240, 0x6600, 0xa6c1, 0xa781, 0x6740, 0xa501, 0x65c0, 0x6480, 0xa441, 0x6c00, 0xacc1, 0xad81, 0x6d40, 0xaf01, 0x6fc0, 0x6e80, 0xae41, 0xaa01, 0x6ac0, 0x6b80, 0xab41, 0x6900, 0xa9c1, 0xa881, 0x6840, 0x7800, 0xb8c1, 0xb981, 0x7940, 0xbb01, 0x7bc0, 0x7a80, 0xba41, 0xbe01, 0x7ec0, 0x7f80, 0xbf41, 0x7d00, 0xbdc1, 0xbc81, 0x7c40, 0xb401, 0x74c0, 0x7580, 0xb541, 0x7700, 0xb7c1, 0xb681, 0x7640, 0x7200, 0xb2c1, 0xb381, 0x7340, 0xb101, 0x71c0, 0x7080, 0xb041, 0x5000, 0x90c1, 0x9181, 0x5140, 0x9301, 0x53c0, 0x5280, 0x9241, 0x9601, 0x56c0, 0x5780, 0x9741, 0x5500, 0x95c1, 0x9481, 0x5440, 0x9c01, 0x5cc0, 0x5d80, 0x9d41, 0x5f00, 0x9fc1, 0x9e81, 0x5e40, 0x5a00, 0x9ac1, 0x9b81, 0x5b40, 0x9901, 0x59c0, 0x5880, 0x9841, 0x8801, 0x48c0, 0x4980, 0x8941, 0x4b00, 0x8bc1, 0x8a81, 0x4a40, 0x4e00, 0x8ec1, 0x8f81, 0x4f40, 0x8d01, 0x4dc0, 0x4c80, 0x8c41, 0x4400, 0x84c1, 0x8581, 0x4540, 0x8701, 0x47c0, 0x4680, 0x8641, 0x8201, 0x42c0, 0x4380, 0x8341, 0x4100, 0x81c1, 0x8081, 0x4040];

if (typeof Int32Array !== 'undefined') TABLE = new Int32Array(TABLE);

var crc16modbus = (0, _define_crc2.default)('crc-16-modbus', function (buf, previous) {
  if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);

  var crc = typeof previous !== 'undefined' ? ~~previous : 0xffff;

  for (var index = 0; index < buf.length; index++) {
    var byte = buf[index];
    crc = (TABLE[(crc ^ byte) & 0xff] ^ crc >> 8) & 0xffff;
  }

  return crc;
});

exports.default = crc16modbus;


/***/ }),

/***/ 1602:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});

var _buffer = __webpack_require__(4293);

var _create_buffer = __webpack_require__(9038);

var _create_buffer2 = _interopRequireDefault(_create_buffer);

var _define_crc = __webpack_require__(1498);

var _define_crc2 = _interopRequireDefault(_define_crc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var crc16xmodem = (0, _define_crc2.default)('xmodem', function (buf, previous) {
  if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);

  var crc = typeof previous !== 'undefined' ? ~~previous : 0x0;

  for (var index = 0; index < buf.length; index++) {
    var byte = buf[index];
    var code = crc >>> 8 & 0xff;

    code ^= byte & 0xff;
    code ^= code >>> 4;
    crc = crc << 8 & 0xffff;
    crc ^= code;
    code = code << 5 & 0xffff;
    crc ^= code;
    code = code << 7 & 0xffff;
    crc ^= code;
  }

  return crc;
});

exports.default = crc16xmodem;


/***/ }),

/***/ 5418:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});

var _buffer = __webpack_require__(4293);

var _create_buffer = __webpack_require__(9038);

var _create_buffer2 = _interopRequireDefault(_create_buffer);

var _define_crc = __webpack_require__(1498);

var _define_crc2 = _interopRequireDefault(_define_crc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Generated by `./pycrc.py --algorithm=table-drive --model=crc-24 --generate=c`
// prettier-ignore
var TABLE = [0x000000, 0x864cfb, 0x8ad50d, 0x0c99f6, 0x93e6e1, 0x15aa1a, 0x1933ec, 0x9f7f17, 0xa18139, 0x27cdc2, 0x2b5434, 0xad18cf, 0x3267d8, 0xb42b23, 0xb8b2d5, 0x3efe2e, 0xc54e89, 0x430272, 0x4f9b84, 0xc9d77f, 0x56a868, 0xd0e493, 0xdc7d65, 0x5a319e, 0x64cfb0, 0xe2834b, 0xee1abd, 0x685646, 0xf72951, 0x7165aa, 0x7dfc5c, 0xfbb0a7, 0x0cd1e9, 0x8a9d12, 0x8604e4, 0x00481f, 0x9f3708, 0x197bf3, 0x15e205, 0x93aefe, 0xad50d0, 0x2b1c2b, 0x2785dd, 0xa1c926, 0x3eb631, 0xb8faca, 0xb4633c, 0x322fc7, 0xc99f60, 0x4fd39b, 0x434a6d, 0xc50696, 0x5a7981, 0xdc357a, 0xd0ac8c, 0x56e077, 0x681e59, 0xee52a2, 0xe2cb54, 0x6487af, 0xfbf8b8, 0x7db443, 0x712db5, 0xf7614e, 0x19a3d2, 0x9fef29, 0x9376df, 0x153a24, 0x8a4533, 0x0c09c8, 0x00903e, 0x86dcc5, 0xb822eb, 0x3e6e10, 0x32f7e6, 0xb4bb1d, 0x2bc40a, 0xad88f1, 0xa11107, 0x275dfc, 0xdced5b, 0x5aa1a0, 0x563856, 0xd074ad, 0x4f0bba, 0xc94741, 0xc5deb7, 0x43924c, 0x7d6c62, 0xfb2099, 0xf7b96f, 0x71f594, 0xee8a83, 0x68c678, 0x645f8e, 0xe21375, 0x15723b, 0x933ec0, 0x9fa736, 0x19ebcd, 0x8694da, 0x00d821, 0x0c41d7, 0x8a0d2c, 0xb4f302, 0x32bff9, 0x3e260f, 0xb86af4, 0x2715e3, 0xa15918, 0xadc0ee, 0x2b8c15, 0xd03cb2, 0x567049, 0x5ae9bf, 0xdca544, 0x43da53, 0xc596a8, 0xc90f5e, 0x4f43a5, 0x71bd8b, 0xf7f170, 0xfb6886, 0x7d247d, 0xe25b6a, 0x641791, 0x688e67, 0xeec29c, 0x3347a4, 0xb50b5f, 0xb992a9, 0x3fde52, 0xa0a145, 0x26edbe, 0x2a7448, 0xac38b3, 0x92c69d, 0x148a66, 0x181390, 0x9e5f6b, 0x01207c, 0x876c87, 0x8bf571, 0x0db98a, 0xf6092d, 0x7045d6, 0x7cdc20, 0xfa90db, 0x65efcc, 0xe3a337, 0xef3ac1, 0x69763a, 0x578814, 0xd1c4ef, 0xdd5d19, 0x5b11e2, 0xc46ef5, 0x42220e, 0x4ebbf8, 0xc8f703, 0x3f964d, 0xb9dab6, 0xb54340, 0x330fbb, 0xac70ac, 0x2a3c57, 0x26a5a1, 0xa0e95a, 0x9e1774, 0x185b8f, 0x14c279, 0x928e82, 0x0df195, 0x8bbd6e, 0x872498, 0x016863, 0xfad8c4, 0x7c943f, 0x700dc9, 0xf64132, 0x693e25, 0xef72de, 0xe3eb28, 0x65a7d3, 0x5b59fd, 0xdd1506, 0xd18cf0, 0x57c00b, 0xc8bf1c, 0x4ef3e7, 0x426a11, 0xc426ea, 0x2ae476, 0xaca88d, 0xa0317b, 0x267d80, 0xb90297, 0x3f4e6c, 0x33d79a, 0xb59b61, 0x8b654f, 0x0d29b4, 0x01b042, 0x87fcb9, 0x1883ae, 0x9ecf55, 0x9256a3, 0x141a58, 0xefaaff, 0x69e604, 0x657ff2, 0xe33309, 0x7c4c1e, 0xfa00e5, 0xf69913, 0x70d5e8, 0x4e2bc6, 0xc8673d, 0xc4fecb, 0x42b230, 0xddcd27, 0x5b81dc, 0x57182a, 0xd154d1, 0x26359f, 0xa07964, 0xace092, 0x2aac69, 0xb5d37e, 0x339f85, 0x3f0673, 0xb94a88, 0x87b4a6, 0x01f85d, 0x0d61ab, 0x8b2d50, 0x145247, 0x921ebc, 0x9e874a, 0x18cbb1, 0xe37b16, 0x6537ed, 0x69ae1b, 0xefe2e0, 0x709df7, 0xf6d10c, 0xfa48fa, 0x7c0401, 0x42fa2f, 0xc4b6d4, 0xc82f22, 0x4e63d9, 0xd11cce, 0x575035, 0x5bc9c3, 0xdd8538];

if (typeof Int32Array !== 'undefined') TABLE = new Int32Array(TABLE);

var crc24 = (0, _define_crc2.default)('crc-24', function (buf, previous) {
  if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);

  var crc = typeof previous !== 'undefined' ? ~~previous : 0xb704ce;

  for (var index = 0; index < buf.length; index++) {
    var byte = buf[index];
    crc = (TABLE[(crc >> 16 ^ byte) & 0xff] ^ crc << 8) & 0xffffff;
  }

  return crc;
});

exports.default = crc24;


/***/ }),

/***/ 2937:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});

var _buffer = __webpack_require__(4293);

var _create_buffer = __webpack_require__(9038);

var _create_buffer2 = _interopRequireDefault(_create_buffer);

var _define_crc = __webpack_require__(1498);

var _define_crc2 = _interopRequireDefault(_define_crc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Generated by `./pycrc.py --algorithm=table-driven --model=crc-32 --generate=c`
// prettier-ignore
var TABLE = [0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419, 0x706af48f, 0xe963a535, 0x9e6495a3, 0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91, 0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7, 0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9, 0xfa0f3d63, 0x8d080df5, 0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b, 0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59, 0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599, 0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924, 0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d, 0x76dc4190, 0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433, 0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01, 0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950, 0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65, 0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa, 0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f, 0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683, 0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1, 0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb, 0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5, 0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b, 0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef, 0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236, 0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe, 0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d, 0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713, 0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21, 0x86d3d2d4, 0xf1d4e242, 0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777, 0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45, 0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc, 0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9, 0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693, 0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d];

if (typeof Int32Array !== 'undefined') TABLE = new Int32Array(TABLE);

var crc32 = (0, _define_crc2.default)('crc-32', function (buf, previous) {
  if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);

  var crc = previous === 0 ? 0 : ~~previous ^ -1;

  for (var index = 0; index < buf.length; index++) {
    var byte = buf[index];
    crc = TABLE[(crc ^ byte) & 0xff] ^ crc >>> 8;
  }

  return crc ^ -1;
});

exports.default = crc32;


/***/ }),

/***/ 5423:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});

var _buffer = __webpack_require__(4293);

var _create_buffer = __webpack_require__(9038);

var _create_buffer2 = _interopRequireDefault(_create_buffer);

var _define_crc = __webpack_require__(1498);

var _define_crc2 = _interopRequireDefault(_define_crc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Generated by `./pycrc.py --algorithm=table-driven --model=crc-8 --generate=c`
// prettier-ignore
var TABLE = [0x00, 0x07, 0x0e, 0x09, 0x1c, 0x1b, 0x12, 0x15, 0x38, 0x3f, 0x36, 0x31, 0x24, 0x23, 0x2a, 0x2d, 0x70, 0x77, 0x7e, 0x79, 0x6c, 0x6b, 0x62, 0x65, 0x48, 0x4f, 0x46, 0x41, 0x54, 0x53, 0x5a, 0x5d, 0xe0, 0xe7, 0xee, 0xe9, 0xfc, 0xfb, 0xf2, 0xf5, 0xd8, 0xdf, 0xd6, 0xd1, 0xc4, 0xc3, 0xca, 0xcd, 0x90, 0x97, 0x9e, 0x99, 0x8c, 0x8b, 0x82, 0x85, 0xa8, 0xaf, 0xa6, 0xa1, 0xb4, 0xb3, 0xba, 0xbd, 0xc7, 0xc0, 0xc9, 0xce, 0xdb, 0xdc, 0xd5, 0xd2, 0xff, 0xf8, 0xf1, 0xf6, 0xe3, 0xe4, 0xed, 0xea, 0xb7, 0xb0, 0xb9, 0xbe, 0xab, 0xac, 0xa5, 0xa2, 0x8f, 0x88, 0x81, 0x86, 0x93, 0x94, 0x9d, 0x9a, 0x27, 0x20, 0x29, 0x2e, 0x3b, 0x3c, 0x35, 0x32, 0x1f, 0x18, 0x11, 0x16, 0x03, 0x04, 0x0d, 0x0a, 0x57, 0x50, 0x59, 0x5e, 0x4b, 0x4c, 0x45, 0x42, 0x6f, 0x68, 0x61, 0x66, 0x73, 0x74, 0x7d, 0x7a, 0x89, 0x8e, 0x87, 0x80, 0x95, 0x92, 0x9b, 0x9c, 0xb1, 0xb6, 0xbf, 0xb8, 0xad, 0xaa, 0xa3, 0xa4, 0xf9, 0xfe, 0xf7, 0xf0, 0xe5, 0xe2, 0xeb, 0xec, 0xc1, 0xc6, 0xcf, 0xc8, 0xdd, 0xda, 0xd3, 0xd4, 0x69, 0x6e, 0x67, 0x60, 0x75, 0x72, 0x7b, 0x7c, 0x51, 0x56, 0x5f, 0x58, 0x4d, 0x4a, 0x43, 0x44, 0x19, 0x1e, 0x17, 0x10, 0x05, 0x02, 0x0b, 0x0c, 0x21, 0x26, 0x2f, 0x28, 0x3d, 0x3a, 0x33, 0x34, 0x4e, 0x49, 0x40, 0x47, 0x52, 0x55, 0x5c, 0x5b, 0x76, 0x71, 0x78, 0x7f, 0x6a, 0x6d, 0x64, 0x63, 0x3e, 0x39, 0x30, 0x37, 0x22, 0x25, 0x2c, 0x2b, 0x06, 0x01, 0x08, 0x0f, 0x1a, 0x1d, 0x14, 0x13, 0xae, 0xa9, 0xa0, 0xa7, 0xb2, 0xb5, 0xbc, 0xbb, 0x96, 0x91, 0x98, 0x9f, 0x8a, 0x8d, 0x84, 0x83, 0xde, 0xd9, 0xd0, 0xd7, 0xc2, 0xc5, 0xcc, 0xcb, 0xe6, 0xe1, 0xe8, 0xef, 0xfa, 0xfd, 0xf4, 0xf3];

if (typeof Int32Array !== 'undefined') TABLE = new Int32Array(TABLE);

var crc8 = (0, _define_crc2.default)('crc-8', function (buf, previous) {
  if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);

  var crc = ~~previous;

  for (var index = 0; index < buf.length; index++) {
    var byte = buf[index];
    crc = TABLE[(crc ^ byte) & 0xff] & 0xff;
  }

  return crc;
});

exports.default = crc8;


/***/ }),

/***/ 534:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});

var _buffer = __webpack_require__(4293);

var _create_buffer = __webpack_require__(9038);

var _create_buffer2 = _interopRequireDefault(_create_buffer);

var _define_crc = __webpack_require__(1498);

var _define_crc2 = _interopRequireDefault(_define_crc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Generated by `./pycrc.py --algorithm=table-driven --model=dallas-1-wire --generate=c`
// prettier-ignore
var TABLE = [0x00, 0x5e, 0xbc, 0xe2, 0x61, 0x3f, 0xdd, 0x83, 0xc2, 0x9c, 0x7e, 0x20, 0xa3, 0xfd, 0x1f, 0x41, 0x9d, 0xc3, 0x21, 0x7f, 0xfc, 0xa2, 0x40, 0x1e, 0x5f, 0x01, 0xe3, 0xbd, 0x3e, 0x60, 0x82, 0xdc, 0x23, 0x7d, 0x9f, 0xc1, 0x42, 0x1c, 0xfe, 0xa0, 0xe1, 0xbf, 0x5d, 0x03, 0x80, 0xde, 0x3c, 0x62, 0xbe, 0xe0, 0x02, 0x5c, 0xdf, 0x81, 0x63, 0x3d, 0x7c, 0x22, 0xc0, 0x9e, 0x1d, 0x43, 0xa1, 0xff, 0x46, 0x18, 0xfa, 0xa4, 0x27, 0x79, 0x9b, 0xc5, 0x84, 0xda, 0x38, 0x66, 0xe5, 0xbb, 0x59, 0x07, 0xdb, 0x85, 0x67, 0x39, 0xba, 0xe4, 0x06, 0x58, 0x19, 0x47, 0xa5, 0xfb, 0x78, 0x26, 0xc4, 0x9a, 0x65, 0x3b, 0xd9, 0x87, 0x04, 0x5a, 0xb8, 0xe6, 0xa7, 0xf9, 0x1b, 0x45, 0xc6, 0x98, 0x7a, 0x24, 0xf8, 0xa6, 0x44, 0x1a, 0x99, 0xc7, 0x25, 0x7b, 0x3a, 0x64, 0x86, 0xd8, 0x5b, 0x05, 0xe7, 0xb9, 0x8c, 0xd2, 0x30, 0x6e, 0xed, 0xb3, 0x51, 0x0f, 0x4e, 0x10, 0xf2, 0xac, 0x2f, 0x71, 0x93, 0xcd, 0x11, 0x4f, 0xad, 0xf3, 0x70, 0x2e, 0xcc, 0x92, 0xd3, 0x8d, 0x6f, 0x31, 0xb2, 0xec, 0x0e, 0x50, 0xaf, 0xf1, 0x13, 0x4d, 0xce, 0x90, 0x72, 0x2c, 0x6d, 0x33, 0xd1, 0x8f, 0x0c, 0x52, 0xb0, 0xee, 0x32, 0x6c, 0x8e, 0xd0, 0x53, 0x0d, 0xef, 0xb1, 0xf0, 0xae, 0x4c, 0x12, 0x91, 0xcf, 0x2d, 0x73, 0xca, 0x94, 0x76, 0x28, 0xab, 0xf5, 0x17, 0x49, 0x08, 0x56, 0xb4, 0xea, 0x69, 0x37, 0xd5, 0x8b, 0x57, 0x09, 0xeb, 0xb5, 0x36, 0x68, 0x8a, 0xd4, 0x95, 0xcb, 0x29, 0x77, 0xf4, 0xaa, 0x48, 0x16, 0xe9, 0xb7, 0x55, 0x0b, 0x88, 0xd6, 0x34, 0x6a, 0x2b, 0x75, 0x97, 0xc9, 0x4a, 0x14, 0xf6, 0xa8, 0x74, 0x2a, 0xc8, 0x96, 0x15, 0x4b, 0xa9, 0xf7, 0xb6, 0xe8, 0x0a, 0x54, 0xd7, 0x89, 0x6b, 0x35];

if (typeof Int32Array !== 'undefined') TABLE = new Int32Array(TABLE);

var crc81wire = (0, _define_crc2.default)('dallas-1-wire', function (buf, previous) {
  if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);

  var crc = ~~previous;

  for (var index = 0; index < buf.length; index++) {
    var byte = buf[index];
    crc = TABLE[(crc ^ byte) & 0xff] & 0xff;
  }

  return crc;
});

exports.default = crc81wire;


/***/ }),

/***/ 3139:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});

var _buffer = __webpack_require__(4293);

var _create_buffer = __webpack_require__(9038);

var _create_buffer2 = _interopRequireDefault(_create_buffer);

var _define_crc = __webpack_require__(1498);

var _define_crc2 = _interopRequireDefault(_define_crc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Generated by `./pycrc.py --algorithm=table-driven --model=jam --generate=c`
// prettier-ignore
var TABLE = [0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419, 0x706af48f, 0xe963a535, 0x9e6495a3, 0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91, 0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7, 0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9, 0xfa0f3d63, 0x8d080df5, 0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b, 0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59, 0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599, 0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924, 0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d, 0x76dc4190, 0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433, 0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01, 0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950, 0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65, 0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa, 0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f, 0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683, 0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1, 0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb, 0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5, 0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b, 0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef, 0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236, 0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe, 0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d, 0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713, 0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21, 0x86d3d2d4, 0xf1d4e242, 0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777, 0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45, 0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc, 0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9, 0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693, 0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d];

if (typeof Int32Array !== 'undefined') TABLE = new Int32Array(TABLE);

var crcjam = (0, _define_crc2.default)('jam', function (buf) {
  var previous = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;

  if (!_buffer.Buffer.isBuffer(buf)) buf = (0, _create_buffer2.default)(buf);

  var crc = previous === 0 ? 0 : ~~previous;

  for (var index = 0; index < buf.length; index++) {
    var byte = buf[index];
    crc = TABLE[(crc ^ byte) & 0xff] ^ crc >>> 8;
  }

  return crc;
});

exports.default = crcjam;


/***/ }),

/***/ 9038:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));

var _buffer = __webpack_require__(4293);

var createBuffer = _buffer.Buffer.from && _buffer.Buffer.alloc && _buffer.Buffer.allocUnsafe && _buffer.Buffer.allocUnsafeSlow ? _buffer.Buffer.from : // support for Node < 5.10
function (val) {
  return new _buffer.Buffer(val);
};

exports.default = createBuffer;


/***/ }),

/***/ 1498:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({
  value: true
}));

exports.default = function (model, calc) {
  var fn = function fn(buf, previous) {
    return calc(buf, previous) >>> 0;
  };
  fn.signed = calc;
  fn.unsigned = fn;
  fn.model = model;

  return fn;
};


/***/ }),

/***/ 3973:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = {
  crc1: __webpack_require__(1331),
  crc8: __webpack_require__(3214),
  crc81wire: __webpack_require__(7019),
  crc16: __webpack_require__(2394),
  crc16ccitt: __webpack_require__(4336),
  crc16modbus: __webpack_require__(753),
  crc16xmodem: __webpack_require__(8813),
  crc16kermit: __webpack_require__(3377),
  crc24: __webpack_require__(2034),
  crc32: __webpack_require__(4312),
  crcjam: __webpack_require__(4096)
};


/***/ }),

/***/ 8932:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

class Deprecation extends Error {
  constructor(message) {
    super(message); // Maintains proper stack trace (only available on V8)

    /* istanbul ignore next */

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = 'Deprecation';
  }

}

exports.Deprecation = Deprecation;


/***/ }),

/***/ 5010:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var fs = __webpack_require__(5747);
var util = __webpack_require__(1669);
var stream = __webpack_require__(2413);
var Readable = stream.Readable;
var Writable = stream.Writable;
var PassThrough = stream.PassThrough;
var Pend = __webpack_require__(4833);
var EventEmitter = __webpack_require__(8614).EventEmitter;

exports.createFromBuffer = createFromBuffer;
exports.createFromFd = createFromFd;
exports.BufferSlicer = BufferSlicer;
exports.FdSlicer = FdSlicer;

util.inherits(FdSlicer, EventEmitter);
function FdSlicer(fd, options) {
  options = options || {};
  EventEmitter.call(this);

  this.fd = fd;
  this.pend = new Pend();
  this.pend.max = 1;
  this.refCount = 0;
  this.autoClose = !!options.autoClose;
}

FdSlicer.prototype.read = function(buffer, offset, length, position, callback) {
  var self = this;
  self.pend.go(function(cb) {
    fs.read(self.fd, buffer, offset, length, position, function(err, bytesRead, buffer) {
      cb();
      callback(err, bytesRead, buffer);
    });
  });
};

FdSlicer.prototype.write = function(buffer, offset, length, position, callback) {
  var self = this;
  self.pend.go(function(cb) {
    fs.write(self.fd, buffer, offset, length, position, function(err, written, buffer) {
      cb();
      callback(err, written, buffer);
    });
  });
};

FdSlicer.prototype.createReadStream = function(options) {
  return new ReadStream(this, options);
};

FdSlicer.prototype.createWriteStream = function(options) {
  return new WriteStream(this, options);
};

FdSlicer.prototype.ref = function() {
  this.refCount += 1;
};

FdSlicer.prototype.unref = function() {
  var self = this;
  self.refCount -= 1;

  if (self.refCount > 0) return;
  if (self.refCount < 0) throw new Error("invalid unref");

  if (self.autoClose) {
    fs.close(self.fd, onCloseDone);
  }

  function onCloseDone(err) {
    if (err) {
      self.emit('error', err);
    } else {
      self.emit('close');
    }
  }
};

util.inherits(ReadStream, Readable);
function ReadStream(context, options) {
  options = options || {};
  Readable.call(this, options);

  this.context = context;
  this.context.ref();

  this.start = options.start || 0;
  this.endOffset = options.end;
  this.pos = this.start;
  this.destroyed = false;
}

ReadStream.prototype._read = function(n) {
  var self = this;
  if (self.destroyed) return;

  var toRead = Math.min(self._readableState.highWaterMark, n);
  if (self.endOffset != null) {
    toRead = Math.min(toRead, self.endOffset - self.pos);
  }
  if (toRead <= 0) {
    self.destroyed = true;
    self.push(null);
    self.context.unref();
    return;
  }
  self.context.pend.go(function(cb) {
    if (self.destroyed) return cb();
    var buffer = new Buffer(toRead);
    fs.read(self.context.fd, buffer, 0, toRead, self.pos, function(err, bytesRead) {
      if (err) {
        self.destroy(err);
      } else if (bytesRead === 0) {
        self.destroyed = true;
        self.push(null);
        self.context.unref();
      } else {
        self.pos += bytesRead;
        self.push(buffer.slice(0, bytesRead));
      }
      cb();
    });
  });
};

ReadStream.prototype.destroy = function(err) {
  if (this.destroyed) return;
  err = err || new Error("stream destroyed");
  this.destroyed = true;
  this.emit('error', err);
  this.context.unref();
};

util.inherits(WriteStream, Writable);
function WriteStream(context, options) {
  options = options || {};
  Writable.call(this, options);

  this.context = context;
  this.context.ref();

  this.start = options.start || 0;
  this.endOffset = (options.end == null) ? Infinity : +options.end;
  this.bytesWritten = 0;
  this.pos = this.start;
  this.destroyed = false;

  this.on('finish', this.destroy.bind(this));
}

WriteStream.prototype._write = function(buffer, encoding, callback) {
  var self = this;
  if (self.destroyed) return;

  if (self.pos + buffer.length > self.endOffset) {
    var err = new Error("maximum file length exceeded");
    err.code = 'ETOOBIG';
    self.destroy();
    callback(err);
    return;
  }
  self.context.pend.go(function(cb) {
    if (self.destroyed) return cb();
    fs.write(self.context.fd, buffer, 0, buffer.length, self.pos, function(err, bytes) {
      if (err) {
        self.destroy();
        cb();
        callback(err);
      } else {
        self.bytesWritten += bytes;
        self.pos += bytes;
        self.emit('progress');
        cb();
        callback();
      }
    });
  });
};

WriteStream.prototype.destroy = function() {
  if (this.destroyed) return;
  this.destroyed = true;
  this.context.unref();
};

util.inherits(BufferSlicer, EventEmitter);
function BufferSlicer(buffer, options) {
  EventEmitter.call(this);

  options = options || {};
  this.refCount = 0;
  this.buffer = buffer;
  this.maxChunkSize = options.maxChunkSize || Number.MAX_SAFE_INTEGER;
}

BufferSlicer.prototype.read = function(buffer, offset, length, position, callback) {
  var end = position + length;
  var delta = end - this.buffer.length;
  var written = (delta > 0) ? delta : length;
  this.buffer.copy(buffer, offset, position, end);
  setImmediate(function() {
    callback(null, written);
  });
};

BufferSlicer.prototype.write = function(buffer, offset, length, position, callback) {
  buffer.copy(this.buffer, position, offset, offset + length);
  setImmediate(function() {
    callback(null, length, buffer);
  });
};

BufferSlicer.prototype.createReadStream = function(options) {
  options = options || {};
  var readStream = new PassThrough(options);
  readStream.destroyed = false;
  readStream.start = options.start || 0;
  readStream.endOffset = options.end;
  // by the time this function returns, we'll be done.
  readStream.pos = readStream.endOffset || this.buffer.length;

  // respect the maxChunkSize option to slice up the chunk into smaller pieces.
  var entireSlice = this.buffer.slice(readStream.start, readStream.pos);
  var offset = 0;
  while (true) {
    var nextOffset = offset + this.maxChunkSize;
    if (nextOffset >= entireSlice.length) {
      // last chunk
      if (offset < entireSlice.length) {
        readStream.write(entireSlice.slice(offset, entireSlice.length));
      }
      break;
    }
    readStream.write(entireSlice.slice(offset, nextOffset));
    offset = nextOffset;
  }

  readStream.end();
  readStream.destroy = function() {
    readStream.destroyed = true;
  };
  return readStream;
};

BufferSlicer.prototype.createWriteStream = function(options) {
  var bufferSlicer = this;
  options = options || {};
  var writeStream = new Writable(options);
  writeStream.start = options.start || 0;
  writeStream.endOffset = (options.end == null) ? this.buffer.length : +options.end;
  writeStream.bytesWritten = 0;
  writeStream.pos = writeStream.start;
  writeStream.destroyed = false;
  writeStream._write = function(buffer, encoding, callback) {
    if (writeStream.destroyed) return;

    var end = writeStream.pos + buffer.length;
    if (end > writeStream.endOffset) {
      var err = new Error("maximum file length exceeded");
      err.code = 'ETOOBIG';
      writeStream.destroyed = true;
      callback(err);
      return;
    }
    buffer.copy(bufferSlicer.buffer, writeStream.pos, 0, buffer.length);

    writeStream.bytesWritten += buffer.length;
    writeStream.pos = end;
    writeStream.emit('progress');
    callback();
  };
  writeStream.destroy = function() {
    writeStream.destroyed = true;
  };
  return writeStream;
};

BufferSlicer.prototype.ref = function() {
  this.refCount += 1;
};

BufferSlicer.prototype.unref = function() {
  this.refCount -= 1;

  if (this.refCount < 0) {
    throw new Error("invalid unref");
  }
};

function createFromBuffer(buffer, options) {
  return new BufferSlicer(buffer, options);
}

function createFromFd(fd, options) {
  return new FdSlicer(fd, options);
}


/***/ }),

/***/ 4126:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const Token = __webpack_require__(4261);
const strtok3 = __webpack_require__(3026);
const {
	stringToBytes,
	tarHeaderChecksumMatches,
	uint32SyncSafeToken
} = __webpack_require__(4875);
const supported = __webpack_require__(7860);

const minimumBytes = 4100; // A fair amount of file-types are detectable within this range

async function fromStream(stream) {
	const tokenizer = await strtok3.fromStream(stream);
	try {
		return await fromTokenizer(tokenizer);
	} finally {
		await tokenizer.close();
	}
}

async function fromBuffer(input) {
	if (!(input instanceof Uint8Array || input instanceof ArrayBuffer || Buffer.isBuffer(input))) {
		throw new TypeError(`Expected the \`input\` argument to be of type \`Uint8Array\` or \`Buffer\` or \`ArrayBuffer\`, got \`${typeof input}\``);
	}

	const buffer = input instanceof Buffer ? input : Buffer.from(input);

	if (!(buffer && buffer.length > 1)) {
		return;
	}

	const tokenizer = strtok3.fromBuffer(buffer);
	return fromTokenizer(tokenizer);
}

function _check(buffer, headers, options) {
	options = {
		offset: 0,
		...options
	};

	for (const [index, header] of headers.entries()) {
		// If a bitmask is set
		if (options.mask) {
			// If header doesn't equal `buf` with bits masked off
			if (header !== (options.mask[index] & buffer[index + options.offset])) {
				return false;
			}
		} else if (header !== buffer[index + options.offset]) {
			return false;
		}
	}

	return true;
}

async function _checkSequence(sequence, tokenizer, ignoreBytes) {
	const buffer = Buffer.alloc(minimumBytes);
	await tokenizer.ignore(ignoreBytes);

	await tokenizer.peekBuffer(buffer, {mayBeLess: true});

	return buffer.includes(Buffer.from(sequence));
}

async function fromTokenizer(tokenizer) {
	try {
		return _fromTokenizer(tokenizer);
	} catch (error) {
		if (!(error instanceof strtok3.EndOfStreamError)) {
			throw error;
		}
	}
}

async function _fromTokenizer(tokenizer) {
	let buffer = Buffer.alloc(minimumBytes);
	const bytesRead = 12;
	const check = (header, options) => _check(buffer, header, options);
	const checkString = (header, options) => check(stringToBytes(header), options);
	const checkSequence = (sequence, ignoreBytes) => _checkSequence(sequence, tokenizer, ignoreBytes);

	// Keep reading until EOF if the file size is unknown.
	if (!tokenizer.fileInfo.size) {
		tokenizer.fileInfo.size = Number.MAX_SAFE_INTEGER;
	}

	await tokenizer.peekBuffer(buffer, {length: bytesRead, mayBeLess: true});

	// -- 2-byte signatures --

	if (check([0x42, 0x4D])) {
		return {
			ext: 'bmp',
			mime: 'image/bmp'
		};
	}

	if (check([0x0B, 0x77])) {
		return {
			ext: 'ac3',
			mime: 'audio/vnd.dolby.dd-raw'
		};
	}

	if (check([0x78, 0x01])) {
		return {
			ext: 'dmg',
			mime: 'application/x-apple-diskimage'
		};
	}

	if (check([0x4D, 0x5A])) {
		return {
			ext: 'exe',
			mime: 'application/x-msdownload'
		};
	}

	if (check([0x25, 0x21])) {
		await tokenizer.peekBuffer(buffer, {length: 24, mayBeLess: true});

		if (checkString('PS-Adobe-', {offset: 2}) &&
			checkString(' EPSF-', {offset: 14})) {
			return {
				ext: 'eps',
				mime: 'application/eps'
			};
		}

		return {
			ext: 'ps',
			mime: 'application/postscript'
		};
	}

	if (
		check([0x1F, 0xA0]) ||
		check([0x1F, 0x9D])
	) {
		return {
			ext: 'Z',
			mime: 'application/x-compress'
		};
	}

	// -- 3-byte signatures --

	if (check([0xFF, 0xD8, 0xFF])) {
		return {
			ext: 'jpg',
			mime: 'image/jpeg'
		};
	}

	if (check([0x49, 0x49, 0xBC])) {
		return {
			ext: 'jxr',
			mime: 'image/vnd.ms-photo'
		};
	}

	if (check([0x1F, 0x8B, 0x8])) {
		return {
			ext: 'gz',
			mime: 'application/gzip'
		};
	}

	if (check([0x42, 0x5A, 0x68])) {
		return {
			ext: 'bz2',
			mime: 'application/x-bzip2'
		};
	}

	if (checkString('ID3')) {
		await tokenizer.ignore(6); // Skip ID3 header until the header size
		const id3HeaderLen = await tokenizer.readToken(uint32SyncSafeToken);
		if (tokenizer.position + id3HeaderLen > tokenizer.fileInfo.size) {
			// Guess file type based on ID3 header for backward compatibility
			return {
				ext: 'mp3',
				mime: 'audio/mpeg'
			};
		}

		await tokenizer.ignore(id3HeaderLen);
		return fromTokenizer(tokenizer); // Skip ID3 header, recursion
	}

	// Musepack, SV7
	if (checkString('MP+')) {
		return {
			ext: 'mpc',
			mime: 'audio/x-musepack'
		};
	}

	if (
		(buffer[0] === 0x43 || buffer[0] === 0x46) &&
		check([0x57, 0x53], {offset: 1})
	) {
		return {
			ext: 'swf',
			mime: 'application/x-shockwave-flash'
		};
	}

	// -- 4-byte signatures --

	if (check([0x47, 0x49, 0x46])) {
		return {
			ext: 'gif',
			mime: 'image/gif'
		};
	}

	if (checkString('FLIF')) {
		return {
			ext: 'flif',
			mime: 'image/flif'
		};
	}

	if (checkString('8BPS')) {
		return {
			ext: 'psd',
			mime: 'image/vnd.adobe.photoshop'
		};
	}

	if (checkString('WEBP', {offset: 8})) {
		return {
			ext: 'webp',
			mime: 'image/webp'
		};
	}

	// Musepack, SV8
	if (checkString('MPCK')) {
		return {
			ext: 'mpc',
			mime: 'audio/x-musepack'
		};
	}

	if (checkString('FORM')) {
		return {
			ext: 'aif',
			mime: 'audio/aiff'
		};
	}

	if (checkString('icns', {offset: 0})) {
		return {
			ext: 'icns',
			mime: 'image/icns'
		};
	}

	// Zip-based file formats
	// Need to be before the `zip` check
	if (check([0x50, 0x4B, 0x3, 0x4])) { // Local file header signature
		try {
			while (tokenizer.position + 30 < tokenizer.fileInfo.size) {
				await tokenizer.readBuffer(buffer, {length: 30});

				// https://en.wikipedia.org/wiki/Zip_(file_format)#File_headers
				const zipHeader = {
					compressedSize: buffer.readUInt32LE(18),
					uncompressedSize: buffer.readUInt32LE(22),
					filenameLength: buffer.readUInt16LE(26),
					extraFieldLength: buffer.readUInt16LE(28)
				};

				zipHeader.filename = await tokenizer.readToken(new Token.StringType(zipHeader.filenameLength, 'utf-8'));
				await tokenizer.ignore(zipHeader.extraFieldLength);

				// Assumes signed `.xpi` from addons.mozilla.org
				if (zipHeader.filename === 'META-INF/mozilla.rsa') {
					return {
						ext: 'xpi',
						mime: 'application/x-xpinstall'
					};
				}

				if (zipHeader.filename.endsWith('.rels') || zipHeader.filename.endsWith('.xml')) {
					const type = zipHeader.filename.split('/')[0];
					switch (type) {
						case '_rels':
							break;
						case 'word':
							return {
								ext: 'docx',
								mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
							};
						case 'ppt':
							return {
								ext: 'pptx',
								mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
							};
						case 'xl':
							return {
								ext: 'xlsx',
								mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
							};
						default:
							break;
					}
				}

				if (zipHeader.filename.startsWith('xl/')) {
					return {
						ext: 'xlsx',
						mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
					};
				}

				// The docx, xlsx and pptx file types extend the Office Open XML file format:
				// https://en.wikipedia.org/wiki/Office_Open_XML_file_formats
				// We look for:
				// - one entry named '[Content_Types].xml' or '_rels/.rels',
				// - one entry indicating specific type of file.
				// MS Office, OpenOffice and LibreOffice may put the parts in different order, so the check should not rely on it.
				if (zipHeader.filename === 'mimetype' && zipHeader.compressedSize === zipHeader.uncompressedSize) {
					const mimeType = await tokenizer.readToken(new Token.StringType(zipHeader.compressedSize, 'utf-8'));

					switch (mimeType) {
						case 'application/epub+zip':
							return {
								ext: 'epub',
								mime: 'application/epub+zip'
							};
						case 'application/vnd.oasis.opendocument.text':
							return {
								ext: 'odt',
								mime: 'application/vnd.oasis.opendocument.text'
							};
						case 'application/vnd.oasis.opendocument.spreadsheet':
							return {
								ext: 'ods',
								mime: 'application/vnd.oasis.opendocument.spreadsheet'
							};
						case 'application/vnd.oasis.opendocument.presentation':
							return {
								ext: 'odp',
								mime: 'application/vnd.oasis.opendocument.presentation'
							};
						default:
					}
				}

				// Try to find next header manually when current one is corrupted
				if (zipHeader.compressedSize === 0) {
					let nextHeaderIndex = -1;

					while (nextHeaderIndex < 0 && (tokenizer.position < tokenizer.fileInfo.size)) {
						await tokenizer.peekBuffer(buffer, {mayBeLess: true});

						nextHeaderIndex = buffer.indexOf('504B0304', 0, 'hex');
						// Move position to the next header if found, skip the whole buffer otherwise
						await tokenizer.ignore(nextHeaderIndex >= 0 ? nextHeaderIndex : buffer.length);
					}
				} else {
					await tokenizer.ignore(zipHeader.compressedSize);
				}
			}
		} catch (error) {
			if (!(error instanceof strtok3.EndOfStreamError)) {
				throw error;
			}
		}

		return {
			ext: 'zip',
			mime: 'application/zip'
		};
	}

	if (checkString('OggS')) {
		// This is an OGG container
		await tokenizer.ignore(28);
		const type = Buffer.alloc(8);
		await tokenizer.readBuffer(type);

		// Needs to be before `ogg` check
		if (_check(type, [0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64])) {
			return {
				ext: 'opus',
				mime: 'audio/opus'
			};
		}

		// If ' theora' in header.
		if (_check(type, [0x80, 0x74, 0x68, 0x65, 0x6F, 0x72, 0x61])) {
			return {
				ext: 'ogv',
				mime: 'video/ogg'
			};
		}

		// If '\x01video' in header.
		if (_check(type, [0x01, 0x76, 0x69, 0x64, 0x65, 0x6F, 0x00])) {
			return {
				ext: 'ogm',
				mime: 'video/ogg'
			};
		}

		// If ' FLAC' in header  https://xiph.org/flac/faq.html
		if (_check(type, [0x7F, 0x46, 0x4C, 0x41, 0x43])) {
			return {
				ext: 'oga',
				mime: 'audio/ogg'
			};
		}

		// 'Speex  ' in header https://en.wikipedia.org/wiki/Speex
		if (_check(type, [0x53, 0x70, 0x65, 0x65, 0x78, 0x20, 0x20])) {
			return {
				ext: 'spx',
				mime: 'audio/ogg'
			};
		}

		// If '\x01vorbis' in header
		if (_check(type, [0x01, 0x76, 0x6F, 0x72, 0x62, 0x69, 0x73])) {
			return {
				ext: 'ogg',
				mime: 'audio/ogg'
			};
		}

		// Default OGG container https://www.iana.org/assignments/media-types/application/ogg
		return {
			ext: 'ogx',
			mime: 'application/ogg'
		};
	}

	if (
		check([0x50, 0x4B]) &&
		(buffer[2] === 0x3 || buffer[2] === 0x5 || buffer[2] === 0x7) &&
		(buffer[3] === 0x4 || buffer[3] === 0x6 || buffer[3] === 0x8)
	) {
		return {
			ext: 'zip',
			mime: 'application/zip'
		};
	}

	//

	// File Type Box (https://en.wikipedia.org/wiki/ISO_base_media_file_format)
	// It's not required to be first, but it's recommended to be. Almost all ISO base media files start with `ftyp` box.
	// `ftyp` box must contain a brand major identifier, which must consist of ISO 8859-1 printable characters.
	// Here we check for 8859-1 printable characters (for simplicity, it's a mask which also catches one non-printable character).
	if (
		checkString('ftyp', {offset: 4}) &&
		(buffer[8] & 0x60) !== 0x00 // Brand major, first character ASCII?
	) {
		// They all can have MIME `video/mp4` except `application/mp4` special-case which is hard to detect.
		// For some cases, we're specific, everything else falls to `video/mp4` with `mp4` extension.
		const brandMajor = buffer.toString('binary', 8, 12).replace('\0', ' ').trim();
		switch (brandMajor) {
			case 'avif':
				return {ext: 'avif', mime: 'image/avif'};
			case 'mif1':
				return {ext: 'heic', mime: 'image/heif'};
			case 'msf1':
				return {ext: 'heic', mime: 'image/heif-sequence'};
			case 'heic':
			case 'heix':
				return {ext: 'heic', mime: 'image/heic'};
			case 'hevc':
			case 'hevx':
				return {ext: 'heic', mime: 'image/heic-sequence'};
			case 'qt':
				return {ext: 'mov', mime: 'video/quicktime'};
			case 'M4V':
			case 'M4VH':
			case 'M4VP':
				return {ext: 'm4v', mime: 'video/x-m4v'};
			case 'M4P':
				return {ext: 'm4p', mime: 'video/mp4'};
			case 'M4B':
				return {ext: 'm4b', mime: 'audio/mp4'};
			case 'M4A':
				return {ext: 'm4a', mime: 'audio/x-m4a'};
			case 'F4V':
				return {ext: 'f4v', mime: 'video/mp4'};
			case 'F4P':
				return {ext: 'f4p', mime: 'video/mp4'};
			case 'F4A':
				return {ext: 'f4a', mime: 'audio/mp4'};
			case 'F4B':
				return {ext: 'f4b', mime: 'audio/mp4'};
			case 'crx':
				return {ext: 'cr3', mime: 'image/x-canon-cr3'};
			default:
				if (brandMajor.startsWith('3g')) {
					if (brandMajor.startsWith('3g2')) {
						return {ext: '3g2', mime: 'video/3gpp2'};
					}

					return {ext: '3gp', mime: 'video/3gpp'};
				}

				return {ext: 'mp4', mime: 'video/mp4'};
		}
	}

	if (checkString('MThd')) {
		return {
			ext: 'mid',
			mime: 'audio/midi'
		};
	}

	if (
		checkString('wOFF') &&
		(
			check([0x00, 0x01, 0x00, 0x00], {offset: 4}) ||
			checkString('OTTO', {offset: 4})
		)
	) {
		return {
			ext: 'woff',
			mime: 'font/woff'
		};
	}

	if (
		checkString('wOF2') &&
		(
			check([0x00, 0x01, 0x00, 0x00], {offset: 4}) ||
			checkString('OTTO', {offset: 4})
		)
	) {
		return {
			ext: 'woff2',
			mime: 'font/woff2'
		};
	}

	if (check([0xD4, 0xC3, 0xB2, 0xA1]) || check([0xA1, 0xB2, 0xC3, 0xD4])) {
		return {
			ext: 'pcap',
			mime: 'application/vnd.tcpdump.pcap'
		};
	}

	// Sony DSD Stream File (DSF)
	if (checkString('DSD ')) {
		return {
			ext: 'dsf',
			mime: 'audio/x-dsf' // Non-standard
		};
	}

	if (checkString('LZIP')) {
		return {
			ext: 'lz',
			mime: 'application/x-lzip'
		};
	}

	if (checkString('fLaC')) {
		return {
			ext: 'flac',
			mime: 'audio/x-flac'
		};
	}

	if (check([0x42, 0x50, 0x47, 0xFB])) {
		return {
			ext: 'bpg',
			mime: 'image/bpg'
		};
	}

	if (checkString('wvpk')) {
		return {
			ext: 'wv',
			mime: 'audio/wavpack'
		};
	}

	if (checkString('%PDF')) {
		// Check if this is an Adobe Illustrator file
		const isAiFile = await checkSequence('Adobe Illustrator', 1350);
		if (isAiFile) {
			return {
				ext: 'ai',
				mime: 'application/postscript'
			};
		}

		// Assume this is just a normal PDF
		return {
			ext: 'pdf',
			mime: 'application/pdf'
		};
	}

	if (check([0x00, 0x61, 0x73, 0x6D])) {
		return {
			ext: 'wasm',
			mime: 'application/wasm'
		};
	}

	// TIFF, little-endian type
	if (check([0x49, 0x49, 0x2A, 0x0])) {
		if (checkString('CR', {offset: 8})) {
			return {
				ext: 'cr2',
				mime: 'image/x-canon-cr2'
			};
		}

		if (check([0x1C, 0x00, 0xFE, 0x00], {offset: 8}) || check([0x1F, 0x00, 0x0B, 0x00], {offset: 8})) {
			return {
				ext: 'nef',
				mime: 'image/x-nikon-nef'
			};
		}

		if (
			check([0x08, 0x00, 0x00, 0x00], {offset: 4}) &&
			(check([0x2D, 0x00, 0xFE, 0x00], {offset: 8}) ||
				check([0x27, 0x00, 0xFE, 0x00], {offset: 8}))
		) {
			return {
				ext: 'dng',
				mime: 'image/x-adobe-dng'
			};
		}

		buffer = Buffer.alloc(24);
		await tokenizer.peekBuffer(buffer);
		if (
			(check([0x10, 0xFB, 0x86, 0x01], {offset: 4}) || check([0x08, 0x00, 0x00, 0x00], {offset: 4})) &&
			// This pattern differentiates ARW from other TIFF-ish file types:
			check([0x00, 0xFE, 0x00, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x01], {offset: 9})
		) {
			return {
				ext: 'arw',
				mime: 'image/x-sony-arw'
			};
		}

		return {
			ext: 'tif',
			mime: 'image/tiff'
		};
	}

	// TIFF, big-endian type
	if (check([0x4D, 0x4D, 0x0, 0x2A])) {
		return {
			ext: 'tif',
			mime: 'image/tiff'
		};
	}

	if (checkString('MAC ')) {
		return {
			ext: 'ape',
			mime: 'audio/ape'
		};
	}

	// https://github.com/threatstack/libmagic/blob/master/magic/Magdir/matroska
	if (check([0x1A, 0x45, 0xDF, 0xA3])) { // Root element: EBML
		async function readField() {
			const msb = await tokenizer.peekNumber(Token.UINT8);
			let mask = 0x80;
			let ic = 0; // 0 = A, 1 = B, 2 = C, 3 = D

			while ((msb & mask) === 0) {
				++ic;
				mask >>= 1;
			}

			const id = Buffer.alloc(ic + 1);
			await tokenizer.readBuffer(id);
			return id;
		}

		async function readElement() {
			const id = await readField();
			const lenField = await readField();
			lenField[0] ^= 0x80 >> (lenField.length - 1);
			const nrLen = Math.min(6, lenField.length); // JavaScript can max read 6 bytes integer
			return {
				id: id.readUIntBE(0, id.length),
				len: lenField.readUIntBE(lenField.length - nrLen, nrLen)
			};
		}

		async function readChildren(level, children) {
			while (children > 0) {
				const e = await readElement();
				if (e.id === 0x4282) {
					return tokenizer.readToken(new Token.StringType(e.len, 'utf-8')); // Return DocType
				}

				await tokenizer.ignore(e.len); // ignore payload
				--children;
			}
		}

		const re = await readElement();
		const docType = await readChildren(1, re.len);

		switch (docType) {
			case 'webm':
				return {
					ext: 'webm',
					mime: 'video/webm'
				};

			case 'matroska':
				return {
					ext: 'mkv',
					mime: 'video/x-matroska'
				};

			default:
				return;
		}
	}

	// RIFF file format which might be AVI, WAV, QCP, etc
	if (check([0x52, 0x49, 0x46, 0x46])) {
		if (check([0x41, 0x56, 0x49], {offset: 8})) {
			return {
				ext: 'avi',
				mime: 'video/vnd.avi'
			};
		}

		if (check([0x57, 0x41, 0x56, 0x45], {offset: 8})) {
			return {
				ext: 'wav',
				mime: 'audio/vnd.wave'
			};
		}

		// QLCM, QCP file
		if (check([0x51, 0x4C, 0x43, 0x4D], {offset: 8})) {
			return {
				ext: 'qcp',
				mime: 'audio/qcelp'
			};
		}
	}

	if (checkString('SQLi')) {
		return {
			ext: 'sqlite',
			mime: 'application/x-sqlite3'
		};
	}

	if (check([0x4E, 0x45, 0x53, 0x1A])) {
		return {
			ext: 'nes',
			mime: 'application/x-nintendo-nes-rom'
		};
	}

	if (checkString('Cr24')) {
		return {
			ext: 'crx',
			mime: 'application/x-google-chrome-extension'
		};
	}

	if (
		checkString('MSCF') ||
		checkString('ISc(')
	) {
		return {
			ext: 'cab',
			mime: 'application/vnd.ms-cab-compressed'
		};
	}

	if (check([0xED, 0xAB, 0xEE, 0xDB])) {
		return {
			ext: 'rpm',
			mime: 'application/x-rpm'
		};
	}

	if (check([0xC5, 0xD0, 0xD3, 0xC6])) {
		return {
			ext: 'eps',
			mime: 'application/eps'
		};
	}

	// -- 5-byte signatures --

	if (check([0x4F, 0x54, 0x54, 0x4F, 0x00])) {
		return {
			ext: 'otf',
			mime: 'font/otf'
		};
	}

	if (checkString('#!AMR')) {
		return {
			ext: 'amr',
			mime: 'audio/amr'
		};
	}

	if (checkString('{\\rtf')) {
		return {
			ext: 'rtf',
			mime: 'application/rtf'
		};
	}

	if (check([0x46, 0x4C, 0x56, 0x01])) {
		return {
			ext: 'flv',
			mime: 'video/x-flv'
		};
	}

	if (checkString('IMPM')) {
		return {
			ext: 'it',
			mime: 'audio/x-it'
		};
	}

	if (
		checkString('-lh0-', {offset: 2}) ||
		checkString('-lh1-', {offset: 2}) ||
		checkString('-lh2-', {offset: 2}) ||
		checkString('-lh3-', {offset: 2}) ||
		checkString('-lh4-', {offset: 2}) ||
		checkString('-lh5-', {offset: 2}) ||
		checkString('-lh6-', {offset: 2}) ||
		checkString('-lh7-', {offset: 2}) ||
		checkString('-lzs-', {offset: 2}) ||
		checkString('-lz4-', {offset: 2}) ||
		checkString('-lz5-', {offset: 2}) ||
		checkString('-lhd-', {offset: 2})
	) {
		return {
			ext: 'lzh',
			mime: 'application/x-lzh-compressed'
		};
	}

	// MPEG program stream (PS or MPEG-PS)
	if (check([0x00, 0x00, 0x01, 0xBA])) {
		//  MPEG-PS, MPEG-1 Part 1
		if (check([0x21], {offset: 4, mask: [0xF1]})) {
			return {
				ext: 'mpg', // May also be .ps, .mpeg
				mime: 'video/MP1S'
			};
		}

		// MPEG-PS, MPEG-2 Part 1
		if (check([0x44], {offset: 4, mask: [0xC4]})) {
			return {
				ext: 'mpg', // May also be .mpg, .m2p, .vob or .sub
				mime: 'video/MP2P'
			};
		}
	}

	// -- 6-byte signatures --

	if (check([0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00])) {
		return {
			ext: 'xz',
			mime: 'application/x-xz'
		};
	}

	if (checkString('<?xml ')) {
		return {
			ext: 'xml',
			mime: 'application/xml'
		};
	}

	if (checkString('BEGIN:')) {
		return {
			ext: 'ics',
			mime: 'text/calendar'
		};
	}

	if (check([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C])) {
		return {
			ext: '7z',
			mime: 'application/x-7z-compressed'
		};
	}

	if (
		check([0x52, 0x61, 0x72, 0x21, 0x1A, 0x7]) &&
		(buffer[6] === 0x0 || buffer[6] === 0x1)
	) {
		return {
			ext: 'rar',
			mime: 'application/x-rar-compressed'
		};
	}

	// -- 7-byte signatures --

	if (checkString('BLENDER')) {
		return {
			ext: 'blend',
			mime: 'application/x-blender'
		};
	}

	if (checkString('!<arch>')) {
		await tokenizer.ignore(8);
		const str = await tokenizer.readToken(new Token.StringType(13, 'ascii'));
		if (str === 'debian-binary') {
			return {
				ext: 'deb',
				mime: 'application/x-deb'
			};
		}

		return {
			ext: 'ar',
			mime: 'application/x-unix-archive'
		};
	}

	// -- 8-byte signatures --

	if (check([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
		// APNG format (https://wiki.mozilla.org/APNG_Specification)
		// 1. Find the first IDAT (image data) chunk (49 44 41 54)
		// 2. Check if there is an "acTL" chunk before the IDAT one (61 63 54 4C)

		// Offset calculated as follows:
		// - 8 bytes: PNG signature
		// - 4 (length) + 4 (chunk type) + 13 (chunk data) + 4 (CRC): IHDR chunk

		await tokenizer.ignore(8); // ignore PNG signature

		async function readChunkHeader() {
			return {
				length: await tokenizer.readToken(Token.INT32_BE),
				type: await tokenizer.readToken(new Token.StringType(4, 'binary'))
			};
		}

		do {
			const chunk = await readChunkHeader();
			switch (chunk.type) {
				case 'IDAT':
					return {
						ext: 'png',
						mime: 'image/png'
					};
				case 'acTL':
					return {
						ext: 'apng',
						mime: 'image/apng'
					};
				default:
					await tokenizer.ignore(chunk.length + 4); // Ignore chunk-data + CRC
			}
		} while (tokenizer.position < tokenizer.fileInfo.size);

		return {
			ext: 'png',
			mime: 'image/png'
		};
	}

	if (check([0x41, 0x52, 0x52, 0x4F, 0x57, 0x31, 0x00, 0x00])) {
		return {
			ext: 'arrow',
			mime: 'application/x-apache-arrow'
		};
	}

	if (check([0x67, 0x6C, 0x54, 0x46, 0x02, 0x00, 0x00, 0x00])) {
		return {
			ext: 'glb',
			mime: 'model/gltf-binary'
		};
	}

	// `mov` format variants
	if (
		check([0x66, 0x72, 0x65, 0x65], {offset: 4}) || // `free`
		check([0x6D, 0x64, 0x61, 0x74], {offset: 4}) || // `mdat` MJPEG
		check([0x6D, 0x6F, 0x6F, 0x76], {offset: 4}) || // `moov`
		check([0x77, 0x69, 0x64, 0x65], {offset: 4}) // `wide`
	) {
		return {
			ext: 'mov',
			mime: 'video/quicktime'
		};
	}

	// -- 9-byte signatures --

	if (check([0x49, 0x49, 0x52, 0x4F, 0x08, 0x00, 0x00, 0x00, 0x18])) {
		return {
			ext: 'orf',
			mime: 'image/x-olympus-orf'
		};
	}

	// -- 12-byte signatures --

	if (check([0x49, 0x49, 0x55, 0x00, 0x18, 0x00, 0x00, 0x00, 0x88, 0xE7, 0x74, 0xD8])) {
		return {
			ext: 'rw2',
			mime: 'image/x-panasonic-rw2'
		};
	}

	// ASF_Header_Object first 80 bytes
	if (check([0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9])) {
		async function readHeader() {
			const guid = Buffer.alloc(16);
			await tokenizer.readBuffer(guid);
			return {
				id: guid,
				size: await tokenizer.readToken(Token.UINT64_LE)
			};
		}

		await tokenizer.ignore(30);
		// Search for header should be in first 1KB of file.
		while (tokenizer.position + 24 < tokenizer.fileInfo.size) {
			const header = await readHeader();
			let payload = header.size - 24;
			if (_check(header.id, [0x91, 0x07, 0xDC, 0xB7, 0xB7, 0xA9, 0xCF, 0x11, 0x8E, 0xE6, 0x00, 0xC0, 0x0C, 0x20, 0x53, 0x65])) {
				// Sync on Stream-Properties-Object (B7DC0791-A9B7-11CF-8EE6-00C00C205365)
				const typeId = Buffer.alloc(16);
				payload -= await tokenizer.readBuffer(typeId);

				if (_check(typeId, [0x40, 0x9E, 0x69, 0xF8, 0x4D, 0x5B, 0xCF, 0x11, 0xA8, 0xFD, 0x00, 0x80, 0x5F, 0x5C, 0x44, 0x2B])) {
					// Found audio:
					return {
						ext: 'wma',
						mime: 'audio/x-ms-wma'
					};
				}

				if (_check(typeId, [0xC0, 0xEF, 0x19, 0xBC, 0x4D, 0x5B, 0xCF, 0x11, 0xA8, 0xFD, 0x00, 0x80, 0x5F, 0x5C, 0x44, 0x2B])) {
					// Found video:
					return {
						ext: 'wmv',
						mime: 'video/x-ms-asf'
					};
				}

				break;
			}

			await tokenizer.ignore(payload);
		}

		// Default to ASF generic extension
		return {
			ext: 'asf',
			mime: 'application/vnd.ms-asf'
		};
	}

	if (check([0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A])) {
		return {
			ext: 'ktx',
			mime: 'image/ktx'
		};
	}

	if ((check([0x7E, 0x10, 0x04]) || check([0x7E, 0x18, 0x04])) && check([0x30, 0x4D, 0x49, 0x45], {offset: 4})) {
		return {
			ext: 'mie',
			mime: 'application/x-mie'
		};
	}

	if (check([0x27, 0x0A, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], {offset: 2})) {
		return {
			ext: 'shp',
			mime: 'application/x-esri-shape'
		};
	}

	if (check([0x00, 0x00, 0x00, 0x0C, 0x6A, 0x50, 0x20, 0x20, 0x0D, 0x0A, 0x87, 0x0A])) {
		// JPEG-2000 family

		await tokenizer.ignore(20);
		const type = await tokenizer.readToken(new Token.StringType(4, 'ascii'));
		switch (type) {
			case 'jp2 ':
				return {
					ext: 'jp2',
					mime: 'image/jp2'
				};
			case 'jpx ':
				return {
					ext: 'jpx',
					mime: 'image/jpx'
				};
			case 'jpm ':
				return {
					ext: 'jpm',
					mime: 'image/jpm'
				};
			case 'mjp2':
				return {
					ext: 'mj2',
					mime: 'image/mj2'
				};
			default:
				return;
		}
	}

	// -- Unsafe signatures --

	if (
		check([0x0, 0x0, 0x1, 0xBA]) ||
		check([0x0, 0x0, 0x1, 0xB3])
	) {
		return {
			ext: 'mpg',
			mime: 'video/mpeg'
		};
	}

	if (check([0x00, 0x01, 0x00, 0x00, 0x00])) {
		return {
			ext: 'ttf',
			mime: 'font/ttf'
		};
	}

	if (check([0x00, 0x00, 0x01, 0x00])) {
		return {
			ext: 'ico',
			mime: 'image/x-icon'
		};
	}

	if (check([0x00, 0x00, 0x02, 0x00])) {
		return {
			ext: 'cur',
			mime: 'image/x-icon'
		};
	}

	if (check([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])) {
		// Detected Microsoft Compound File Binary File (MS-CFB) Format.
		return {
			ext: 'cfb',
			mime: 'application/x-cfb'
		};
	}

	// Increase sample size from 12 to 256.
	await tokenizer.peekBuffer(buffer, {length: Math.min(256, tokenizer.fileInfo.size), mayBeLess: true});

	// `raf` is here just to keep all the raw image detectors together.
	if (checkString('FUJIFILMCCD-RAW')) {
		return {
			ext: 'raf',
			mime: 'image/x-fujifilm-raf'
		};
	}

	if (checkString('Extended Module:')) {
		return {
			ext: 'xm',
			mime: 'audio/x-xm'
		};
	}

	if (checkString('Creative Voice File')) {
		return {
			ext: 'voc',
			mime: 'audio/x-voc'
		};
	}

	if (check([0x04, 0x00, 0x00, 0x00]) && buffer.length >= 16) { // Rough & quick check Pickle/ASAR
		const jsonSize = buffer.readUInt32LE(12);
		if (jsonSize > 12 && jsonSize < 240 && buffer.length >= jsonSize + 16) {
			try {
				const header = buffer.slice(16, jsonSize + 16).toString();
				const json = JSON.parse(header);
				// Check if Pickle is ASAR
				if (json.files) { // Final check, assuring Pickle/ASAR format
					return {
						ext: 'asar',
						mime: 'application/x-asar'
					};
				}
			} catch (_) {
			}
		}
	}

	if (check([0x06, 0x0E, 0x2B, 0x34, 0x02, 0x05, 0x01, 0x01, 0x0D, 0x01, 0x02, 0x01, 0x01, 0x02])) {
		return {
			ext: 'mxf',
			mime: 'application/mxf'
		};
	}

	if (checkString('SCRM', {offset: 44})) {
		return {
			ext: 's3m',
			mime: 'audio/x-s3m'
		};
	}

	if (check([0x47], {offset: 4}) && (check([0x47], {offset: 192}) || check([0x47], {offset: 196}))) {
		return {
			ext: 'mts',
			mime: 'video/mp2t'
		};
	}

	if (check([0x42, 0x4F, 0x4F, 0x4B, 0x4D, 0x4F, 0x42, 0x49], {offset: 60})) {
		return {
			ext: 'mobi',
			mime: 'application/x-mobipocket-ebook'
		};
	}

	if (check([0x44, 0x49, 0x43, 0x4D], {offset: 128})) {
		return {
			ext: 'dcm',
			mime: 'application/dicom'
		};
	}

	if (check([0x4C, 0x00, 0x00, 0x00, 0x01, 0x14, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0xC0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x46])) {
		return {
			ext: 'lnk',
			mime: 'application/x.ms.shortcut' // Invented by us
		};
	}

	if (check([0x62, 0x6F, 0x6F, 0x6B, 0x00, 0x00, 0x00, 0x00, 0x6D, 0x61, 0x72, 0x6B, 0x00, 0x00, 0x00, 0x00])) {
		return {
			ext: 'alias',
			mime: 'application/x.apple.alias' // Invented by us
		};
	}

	if (
		check([0x4C, 0x50], {offset: 34}) &&
		(
			check([0x00, 0x00, 0x01], {offset: 8}) ||
			check([0x01, 0x00, 0x02], {offset: 8}) ||
			check([0x02, 0x00, 0x02], {offset: 8})
		)
	) {
		return {
			ext: 'eot',
			mime: 'application/vnd.ms-fontobject'
		};
	}

	if (check([0x06, 0x06, 0xED, 0xF5, 0xD8, 0x1D, 0x46, 0xE5, 0xBD, 0x31, 0xEF, 0xE7, 0xFE, 0x74, 0xB7, 0x1D])) {
		return {
			ext: 'indd',
			mime: 'application/x-indesign'
		};
	}

	// Increase sample size from 256 to 512
	await tokenizer.peekBuffer(buffer, {length: Math.min(512, tokenizer.fileInfo.size), mayBeLess: true});

	// Requires a buffer size of 512 bytes
	if (tarHeaderChecksumMatches(buffer)) {
		return {
			ext: 'tar',
			mime: 'application/x-tar'
		};
	}

	if (check([0xFF, 0xFE, 0xFF, 0x0E, 0x53, 0x00, 0x6B, 0x00, 0x65, 0x00, 0x74, 0x00, 0x63, 0x00, 0x68, 0x00, 0x55, 0x00, 0x70, 0x00, 0x20, 0x00, 0x4D, 0x00, 0x6F, 0x00, 0x64, 0x00, 0x65, 0x00, 0x6C, 0x00])) {
		return {
			ext: 'skp',
			mime: 'application/vnd.sketchup.skp'
		};
	}

	if (checkString('-----BEGIN PGP MESSAGE-----')) {
		return {
			ext: 'pgp',
			mime: 'application/pgp-encrypted'
		};
	}

	// Check for MPEG header at different starting offsets
	for (let start = 0; start < 2 && start < (buffer.length - 16); start++) {
		// Check MPEG 1 or 2 Layer 3 header, or 'layer 0' for ADTS (MPEG sync-word 0xFFE)
		if (buffer.length >= start + 2 && check([0xFF, 0xE0], {offset: start, mask: [0xFF, 0xE0]})) {
			if (check([0x10], {offset: start + 1, mask: [0x16]})) {
				// Check for (ADTS) MPEG-2
				if (check([0x08], {offset: start + 1, mask: [0x08]})) {
					return {
						ext: 'aac',
						mime: 'audio/aac'
					};
				}

				// Must be (ADTS) MPEG-4
				return {
					ext: 'aac',
					mime: 'audio/aac'
				};
			}

			// MPEG 1 or 2 Layer 3 header
			// Check for MPEG layer 3
			if (check([0x02], {offset: start + 1, mask: [0x06]})) {
				return {
					ext: 'mp3',
					mime: 'audio/mpeg'
				};
			}

			// Check for MPEG layer 2
			if (check([0x04], {offset: start + 1, mask: [0x06]})) {
				return {
					ext: 'mp2',
					mime: 'audio/mpeg'
				};
			}

			// Check for MPEG layer 1
			if (check([0x06], {offset: start + 1, mask: [0x06]})) {
				return {
					ext: 'mp1',
					mime: 'audio/mpeg'
				};
			}
		}
	}
}

const stream = readableStream => new Promise((resolve, reject) => {
	// Using `eval` to work around issues when bundling with Webpack
	const stream = eval('require')('stream'); // eslint-disable-line no-eval

	readableStream.on('error', reject);
	readableStream.once('readable', async () => {
		// Set up output stream
		const pass = new stream.PassThrough();
		let outputStream;
		if (stream.pipeline) {
			outputStream = stream.pipeline(readableStream, pass, () => {
			});
		} else {
			outputStream = readableStream.pipe(pass);
		}

		// Read the input stream and detect the filetype
		const chunk = readableStream.read(minimumBytes) || readableStream.read() || Buffer.alloc(0);
		try {
			const fileType = await fromBuffer(chunk);
			pass.fileType = fileType;
		} catch (error) {
			reject(error);
		}

		resolve(outputStream);
	});
});

const fileType = {
	fromStream,
	fromTokenizer,
	fromBuffer,
	stream
};

Object.defineProperty(fileType, 'extensions', {
	get() {
		return new Set(supported.extensions);
	}
});

Object.defineProperty(fileType, 'mimeTypes', {
	get() {
		return new Set(supported.mimeTypes);
	}
});

module.exports = fileType;


/***/ }),

/***/ 4930:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

const strtok3 = __webpack_require__(8569);
const core = __webpack_require__(4126);

async function fromFile(path) {
	const tokenizer = await strtok3.fromFile(path);
	try {
		return await core.fromTokenizer(tokenizer);
	} finally {
		await tokenizer.close();
	}
}

const fileType = {
	fromFile
};

Object.assign(fileType, core);

Object.defineProperty(fileType, 'extensions', {
	get() {
		return core.extensions;
	}
});

Object.defineProperty(fileType, 'mimeTypes', {
	get() {
		return core.mimeTypes;
	}
});

module.exports = fileType;


/***/ }),

/***/ 7860:
/***/ ((module) => {

"use strict";


module.exports = {
	extensions: [
		'jpg',
		'png',
		'apng',
		'gif',
		'webp',
		'flif',
		'cr2',
		'cr3',
		'orf',
		'arw',
		'dng',
		'nef',
		'rw2',
		'raf',
		'tif',
		'bmp',
		'icns',
		'jxr',
		'psd',
		'indd',
		'zip',
		'tar',
		'rar',
		'gz',
		'bz2',
		'7z',
		'dmg',
		'mp4',
		'mid',
		'mkv',
		'webm',
		'mov',
		'avi',
		'mpg',
		'mp2',
		'mp3',
		'm4a',
		'oga',
		'ogg',
		'ogv',
		'opus',
		'flac',
		'wav',
		'spx',
		'amr',
		'pdf',
		'epub',
		'exe',
		'swf',
		'rtf',
		'wasm',
		'woff',
		'woff2',
		'eot',
		'ttf',
		'otf',
		'ico',
		'flv',
		'ps',
		'xz',
		'sqlite',
		'nes',
		'crx',
		'xpi',
		'cab',
		'deb',
		'ar',
		'rpm',
		'Z',
		'lz',
		'cfb',
		'mxf',
		'mts',
		'blend',
		'bpg',
		'docx',
		'pptx',
		'xlsx',
		'3gp',
		'3g2',
		'jp2',
		'jpm',
		'jpx',
		'mj2',
		'aif',
		'qcp',
		'odt',
		'ods',
		'odp',
		'xml',
		'mobi',
		'heic',
		'cur',
		'ktx',
		'ape',
		'wv',
		'wmv',
		'wma',
		'dcm',
		'ics',
		'glb',
		'pcap',
		'dsf',
		'lnk',
		'alias',
		'voc',
		'ac3',
		'm4v',
		'm4p',
		'm4b',
		'f4v',
		'f4p',
		'f4b',
		'f4a',
		'mie',
		'asf',
		'ogm',
		'ogx',
		'mpc',
		'arrow',
		'shp',
		'aac',
		'mp1',
		'it',
		's3m',
		'xm',
		'ai',
		'skp',
		'avif',
		'eps',
		'lzh',
		'pgp',
		'asar'
	],
	mimeTypes: [
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/webp',
		'image/flif',
		'image/x-canon-cr2',
		'image/x-canon-cr3',
		'image/tiff',
		'image/bmp',
		'image/vnd.ms-photo',
		'image/vnd.adobe.photoshop',
		'application/x-indesign',
		'application/epub+zip',
		'application/x-xpinstall',
		'application/vnd.oasis.opendocument.text',
		'application/vnd.oasis.opendocument.spreadsheet',
		'application/vnd.oasis.opendocument.presentation',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'application/zip',
		'application/x-tar',
		'application/x-rar-compressed',
		'application/gzip',
		'application/x-bzip2',
		'application/x-7z-compressed',
		'application/x-apple-diskimage',
		'application/x-apache-arrow',
		'video/mp4',
		'audio/midi',
		'video/x-matroska',
		'video/webm',
		'video/quicktime',
		'video/vnd.avi',
		'audio/vnd.wave',
		'audio/qcelp',
		'audio/x-ms-wma',
		'video/x-ms-asf',
		'application/vnd.ms-asf',
		'video/mpeg',
		'video/3gpp',
		'audio/mpeg',
		'audio/mp4', // RFC 4337
		'audio/opus',
		'video/ogg',
		'audio/ogg',
		'application/ogg',
		'audio/x-flac',
		'audio/ape',
		'audio/wavpack',
		'audio/amr',
		'application/pdf',
		'application/x-msdownload',
		'application/x-shockwave-flash',
		'application/rtf',
		'application/wasm',
		'font/woff',
		'font/woff2',
		'application/vnd.ms-fontobject',
		'font/ttf',
		'font/otf',
		'image/x-icon',
		'video/x-flv',
		'application/postscript',
		'application/eps',
		'application/x-xz',
		'application/x-sqlite3',
		'application/x-nintendo-nes-rom',
		'application/x-google-chrome-extension',
		'application/vnd.ms-cab-compressed',
		'application/x-deb',
		'application/x-unix-archive',
		'application/x-rpm',
		'application/x-compress',
		'application/x-lzip',
		'application/x-cfb',
		'application/x-mie',
		'application/mxf',
		'video/mp2t',
		'application/x-blender',
		'image/bpg',
		'image/jp2',
		'image/jpx',
		'image/jpm',
		'image/mj2',
		'audio/aiff',
		'application/xml',
		'application/x-mobipocket-ebook',
		'image/heif',
		'image/heif-sequence',
		'image/heic',
		'image/heic-sequence',
		'image/icns',
		'image/ktx',
		'application/dicom',
		'audio/x-musepack',
		'text/calendar',
		'model/gltf-binary',
		'application/vnd.tcpdump.pcap',
		'audio/x-dsf', // Non-standard
		'application/x.ms.shortcut', // Invented by us
		'application/x.apple.alias', // Invented by us
		'audio/x-voc',
		'audio/vnd.dolby.dd-raw',
		'audio/x-m4a',
		'image/apng',
		'image/x-olympus-orf',
		'image/x-sony-arw',
		'image/x-adobe-dng',
		'image/x-nikon-nef',
		'image/x-panasonic-rw2',
		'image/x-fujifilm-raf',
		'video/x-m4v',
		'video/3gpp2',
		'application/x-esri-shape',
		'audio/aac',
		'audio/x-it',
		'audio/x-s3m',
		'audio/x-xm',
		'video/MP1S',
		'video/MP2P',
		'application/vnd.sketchup.skp',
		'image/avif',
		'application/x-lzh-compressed',
		'application/pgp-encrypted',
		'application/x-asar'
	]
};


/***/ }),

/***/ 4875:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


exports.stringToBytes = string => [...string].map(character => character.charCodeAt(0));

/**
Checks whether the TAR checksum is valid.

@param {Buffer} buffer - The TAR header `[offset ... offset + 512]`.
@param {number} offset - TAR header offset.
@returns {boolean} `true` if the TAR checksum is valid, otherwise `false`.
*/
exports.tarHeaderChecksumMatches = (buffer, offset = 0) => {
	const readSum = parseInt(buffer.toString('utf8', 148, 154).replace(/\0.*$/, '').trim(), 8); // Read sum in header
	if (isNaN(readSum)) {
		return false;
	}

	let sum = 8 * 0x20; // Initialize signed bit sum

	for (let i = offset; i < offset + 148; i++) {
		sum += buffer[i];
	}

	for (let i = offset + 156; i < offset + 512; i++) {
		sum += buffer[i];
	}

	return readSum === sum;
};

/**
ID3 UINT32 sync-safe tokenizer token.
28 bits (representing up to 256MB) integer, the msb is 0 to avoid "false syncsignals".
*/
exports.uint32SyncSafeToken = {
	get: (buffer, offset) => {
		return (buffer[offset + 3] & 0x7F) | ((buffer[offset + 2]) << 7) | ((buffer[offset + 1]) << 14) | ((buffer[offset]) << 21);
	},
	len: 4
};


/***/ }),

/***/ 3092:
/***/ ((__unused_webpack_module, exports) => {

exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),

/***/ 8840:
/***/ ((module) => {

"use strict";


/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

function isPlainObject(o) {
  var ctor,prot;

  if (isObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (ctor === undefined) return true;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
}

module.exports = isPlainObject;


/***/ }),

/***/ 8884:
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

/* module decorator */ module = __webpack_require__.nmd(module);
/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>
 Copyright 2009 The Closure Library Authors. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS-IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @license long.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/long.js for details
 */
(function(global, factory) {

    /* AMD */ if (typeof define === 'function' && define["amd"])
        define([], factory);
    /* CommonJS */ else if ( true && module && module["exports"])
        module["exports"] = factory();
    /* Global */ else
        (global["dcodeIO"] = global["dcodeIO"] || {})["Long"] = factory();

})(this, function() {
    "use strict";

    /**
     * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
     *  See the from* functions below for more convenient ways of constructing Longs.
     * @exports Long
     * @class A Long class for representing a 64 bit two's-complement integer value.
     * @param {number} low The low (signed) 32 bits of the long
     * @param {number} high The high (signed) 32 bits of the long
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @constructor
     */
    function Long(low, high, unsigned) {

        /**
         * The low 32 bits as a signed value.
         * @type {number}
         */
        this.low = low | 0;

        /**
         * The high 32 bits as a signed value.
         * @type {number}
         */
        this.high = high | 0;

        /**
         * Whether unsigned or not.
         * @type {boolean}
         */
        this.unsigned = !!unsigned;
    }

    // The internal representation of a long is the two given signed, 32-bit values.
    // We use 32-bit pieces because these are the size of integers on which
    // Javascript performs bit-operations.  For operations like addition and
    // multiplication, we split each number into 16 bit pieces, which can easily be
    // multiplied within Javascript's floating-point representation without overflow
    // or change in sign.
    //
    // In the algorithms below, we frequently reduce the negative case to the
    // positive case by negating the input(s) and then post-processing the result.
    // Note that we must ALWAYS check specially whether those values are MIN_VALUE
    // (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
    // a positive number, it overflows back into a negative).  Not handling this
    // case would often result in infinite recursion.
    //
    // Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the from*
    // methods on which they depend.

    /**
     * An indicator used to reliably determine if an object is a Long or not.
     * @type {boolean}
     * @const
     * @private
     */
    Long.prototype.__isLong__;

    Object.defineProperty(Long.prototype, "__isLong__", {
        value: true,
        enumerable: false,
        configurable: false
    });

    /**
     * @function
     * @param {*} obj Object
     * @returns {boolean}
     * @inner
     */
    function isLong(obj) {
        return (obj && obj["__isLong__"]) === true;
    }

    /**
     * Tests if the specified object is a Long.
     * @function
     * @param {*} obj Object
     * @returns {boolean}
     */
    Long.isLong = isLong;

    /**
     * A cache of the Long representations of small integer values.
     * @type {!Object}
     * @inner
     */
    var INT_CACHE = {};

    /**
     * A cache of the Long representations of small unsigned integer values.
     * @type {!Object}
     * @inner
     */
    var UINT_CACHE = {};

    /**
     * @param {number} value
     * @param {boolean=} unsigned
     * @returns {!Long}
     * @inner
     */
    function fromInt(value, unsigned) {
        var obj, cachedObj, cache;
        if (unsigned) {
            value >>>= 0;
            if (cache = (0 <= value && value < 256)) {
                cachedObj = UINT_CACHE[value];
                if (cachedObj)
                    return cachedObj;
            }
            obj = fromBits(value, (value | 0) < 0 ? -1 : 0, true);
            if (cache)
                UINT_CACHE[value] = obj;
            return obj;
        } else {
            value |= 0;
            if (cache = (-128 <= value && value < 128)) {
                cachedObj = INT_CACHE[value];
                if (cachedObj)
                    return cachedObj;
            }
            obj = fromBits(value, value < 0 ? -1 : 0, false);
            if (cache)
                INT_CACHE[value] = obj;
            return obj;
        }
    }

    /**
     * Returns a Long representing the given 32 bit integer value.
     * @function
     * @param {number} value The 32 bit integer in question
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @returns {!Long} The corresponding Long value
     */
    Long.fromInt = fromInt;

    /**
     * @param {number} value
     * @param {boolean=} unsigned
     * @returns {!Long}
     * @inner
     */
    function fromNumber(value, unsigned) {
        if (isNaN(value) || !isFinite(value))
            return unsigned ? UZERO : ZERO;
        if (unsigned) {
            if (value < 0)
                return UZERO;
            if (value >= TWO_PWR_64_DBL)
                return MAX_UNSIGNED_VALUE;
        } else {
            if (value <= -TWO_PWR_63_DBL)
                return MIN_VALUE;
            if (value + 1 >= TWO_PWR_63_DBL)
                return MAX_VALUE;
        }
        if (value < 0)
            return fromNumber(-value, unsigned).neg();
        return fromBits((value % TWO_PWR_32_DBL) | 0, (value / TWO_PWR_32_DBL) | 0, unsigned);
    }

    /**
     * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
     * @function
     * @param {number} value The number in question
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @returns {!Long} The corresponding Long value
     */
    Long.fromNumber = fromNumber;

    /**
     * @param {number} lowBits
     * @param {number} highBits
     * @param {boolean=} unsigned
     * @returns {!Long}
     * @inner
     */
    function fromBits(lowBits, highBits, unsigned) {
        return new Long(lowBits, highBits, unsigned);
    }

    /**
     * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
     *  assumed to use 32 bits.
     * @function
     * @param {number} lowBits The low 32 bits
     * @param {number} highBits The high 32 bits
     * @param {boolean=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @returns {!Long} The corresponding Long value
     */
    Long.fromBits = fromBits;

    /**
     * @function
     * @param {number} base
     * @param {number} exponent
     * @returns {number}
     * @inner
     */
    var pow_dbl = Math.pow; // Used 4 times (4*8 to 15+4)

    /**
     * @param {string} str
     * @param {(boolean|number)=} unsigned
     * @param {number=} radix
     * @returns {!Long}
     * @inner
     */
    function fromString(str, unsigned, radix) {
        if (str.length === 0)
            throw Error('empty string');
        if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity")
            return ZERO;
        if (typeof unsigned === 'number') {
            // For goog.math.long compatibility
            radix = unsigned,
            unsigned = false;
        } else {
            unsigned = !! unsigned;
        }
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
            throw RangeError('radix');

        var p;
        if ((p = str.indexOf('-')) > 0)
            throw Error('interior hyphen');
        else if (p === 0) {
            return fromString(str.substring(1), unsigned, radix).neg();
        }

        // Do several (8) digits each time through the loop, so as to
        // minimize the calls to the very expensive emulated div.
        var radixToPower = fromNumber(pow_dbl(radix, 8));

        var result = ZERO;
        for (var i = 0; i < str.length; i += 8) {
            var size = Math.min(8, str.length - i),
                value = parseInt(str.substring(i, i + size), radix);
            if (size < 8) {
                var power = fromNumber(pow_dbl(radix, size));
                result = result.mul(power).add(fromNumber(value));
            } else {
                result = result.mul(radixToPower);
                result = result.add(fromNumber(value));
            }
        }
        result.unsigned = unsigned;
        return result;
    }

    /**
     * Returns a Long representation of the given string, written using the specified radix.
     * @function
     * @param {string} str The textual representation of the Long
     * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to `false` for signed
     * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
     * @returns {!Long} The corresponding Long value
     */
    Long.fromString = fromString;

    /**
     * @function
     * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val
     * @returns {!Long}
     * @inner
     */
    function fromValue(val) {
        if (val /* is compatible */ instanceof Long)
            return val;
        if (typeof val === 'number')
            return fromNumber(val);
        if (typeof val === 'string')
            return fromString(val);
        // Throws for non-objects, converts non-instanceof Long:
        return fromBits(val.low, val.high, val.unsigned);
    }

    /**
     * Converts the specified value to a Long.
     * @function
     * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val Value
     * @returns {!Long}
     */
    Long.fromValue = fromValue;

    // NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
    // no runtime penalty for these.

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_16_DBL = 1 << 16;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_24_DBL = 1 << 24;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;

    /**
     * @type {number}
     * @const
     * @inner
     */
    var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;

    /**
     * @type {!Long}
     * @const
     * @inner
     */
    var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);

    /**
     * @type {!Long}
     * @inner
     */
    var ZERO = fromInt(0);

    /**
     * Signed zero.
     * @type {!Long}
     */
    Long.ZERO = ZERO;

    /**
     * @type {!Long}
     * @inner
     */
    var UZERO = fromInt(0, true);

    /**
     * Unsigned zero.
     * @type {!Long}
     */
    Long.UZERO = UZERO;

    /**
     * @type {!Long}
     * @inner
     */
    var ONE = fromInt(1);

    /**
     * Signed one.
     * @type {!Long}
     */
    Long.ONE = ONE;

    /**
     * @type {!Long}
     * @inner
     */
    var UONE = fromInt(1, true);

    /**
     * Unsigned one.
     * @type {!Long}
     */
    Long.UONE = UONE;

    /**
     * @type {!Long}
     * @inner
     */
    var NEG_ONE = fromInt(-1);

    /**
     * Signed negative one.
     * @type {!Long}
     */
    Long.NEG_ONE = NEG_ONE;

    /**
     * @type {!Long}
     * @inner
     */
    var MAX_VALUE = fromBits(0xFFFFFFFF|0, 0x7FFFFFFF|0, false);

    /**
     * Maximum signed value.
     * @type {!Long}
     */
    Long.MAX_VALUE = MAX_VALUE;

    /**
     * @type {!Long}
     * @inner
     */
    var MAX_UNSIGNED_VALUE = fromBits(0xFFFFFFFF|0, 0xFFFFFFFF|0, true);

    /**
     * Maximum unsigned value.
     * @type {!Long}
     */
    Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;

    /**
     * @type {!Long}
     * @inner
     */
    var MIN_VALUE = fromBits(0, 0x80000000|0, false);

    /**
     * Minimum signed value.
     * @type {!Long}
     */
    Long.MIN_VALUE = MIN_VALUE;

    /**
     * @alias Long.prototype
     * @inner
     */
    var LongPrototype = Long.prototype;

    /**
     * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
     * @returns {number}
     */
    LongPrototype.toInt = function toInt() {
        return this.unsigned ? this.low >>> 0 : this.low;
    };

    /**
     * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
     * @returns {number}
     */
    LongPrototype.toNumber = function toNumber() {
        if (this.unsigned)
            return ((this.high >>> 0) * TWO_PWR_32_DBL) + (this.low >>> 0);
        return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
    };

    /**
     * Converts the Long to a string written in the specified radix.
     * @param {number=} radix Radix (2-36), defaults to 10
     * @returns {string}
     * @override
     * @throws {RangeError} If `radix` is out of range
     */
    LongPrototype.toString = function toString(radix) {
        radix = radix || 10;
        if (radix < 2 || 36 < radix)
            throw RangeError('radix');
        if (this.isZero())
            return '0';
        if (this.isNegative()) { // Unsigned Longs are never negative
            if (this.eq(MIN_VALUE)) {
                // We need to change the Long value before it can be negated, so we remove
                // the bottom-most digit in this base and then recurse to do the rest.
                var radixLong = fromNumber(radix),
                    div = this.div(radixLong),
                    rem1 = div.mul(radixLong).sub(this);
                return div.toString(radix) + rem1.toInt().toString(radix);
            } else
                return '-' + this.neg().toString(radix);
        }

        // Do several (6) digits each time through the loop, so as to
        // minimize the calls to the very expensive emulated div.
        var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned),
            rem = this;
        var result = '';
        while (true) {
            var remDiv = rem.div(radixToPower),
                intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
                digits = intval.toString(radix);
            rem = remDiv;
            if (rem.isZero())
                return digits + result;
            else {
                while (digits.length < 6)
                    digits = '0' + digits;
                result = '' + digits + result;
            }
        }
    };

    /**
     * Gets the high 32 bits as a signed integer.
     * @returns {number} Signed high bits
     */
    LongPrototype.getHighBits = function getHighBits() {
        return this.high;
    };

    /**
     * Gets the high 32 bits as an unsigned integer.
     * @returns {number} Unsigned high bits
     */
    LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
        return this.high >>> 0;
    };

    /**
     * Gets the low 32 bits as a signed integer.
     * @returns {number} Signed low bits
     */
    LongPrototype.getLowBits = function getLowBits() {
        return this.low;
    };

    /**
     * Gets the low 32 bits as an unsigned integer.
     * @returns {number} Unsigned low bits
     */
    LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
        return this.low >>> 0;
    };

    /**
     * Gets the number of bits needed to represent the absolute value of this Long.
     * @returns {number}
     */
    LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
        if (this.isNegative()) // Unsigned Longs are never negative
            return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
        var val = this.high != 0 ? this.high : this.low;
        for (var bit = 31; bit > 0; bit--)
            if ((val & (1 << bit)) != 0)
                break;
        return this.high != 0 ? bit + 33 : bit + 1;
    };

    /**
     * Tests if this Long's value equals zero.
     * @returns {boolean}
     */
    LongPrototype.isZero = function isZero() {
        return this.high === 0 && this.low === 0;
    };

    /**
     * Tests if this Long's value is negative.
     * @returns {boolean}
     */
    LongPrototype.isNegative = function isNegative() {
        return !this.unsigned && this.high < 0;
    };

    /**
     * Tests if this Long's value is positive.
     * @returns {boolean}
     */
    LongPrototype.isPositive = function isPositive() {
        return this.unsigned || this.high >= 0;
    };

    /**
     * Tests if this Long's value is odd.
     * @returns {boolean}
     */
    LongPrototype.isOdd = function isOdd() {
        return (this.low & 1) === 1;
    };

    /**
     * Tests if this Long's value is even.
     * @returns {boolean}
     */
    LongPrototype.isEven = function isEven() {
        return (this.low & 1) === 0;
    };

    /**
     * Tests if this Long's value equals the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.equals = function equals(other) {
        if (!isLong(other))
            other = fromValue(other);
        if (this.unsigned !== other.unsigned && (this.high >>> 31) === 1 && (other.high >>> 31) === 1)
            return false;
        return this.high === other.high && this.low === other.low;
    };

    /**
     * Tests if this Long's value equals the specified's. This is an alias of {@link Long#equals}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.eq = LongPrototype.equals;

    /**
     * Tests if this Long's value differs from the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.notEquals = function notEquals(other) {
        return !this.eq(/* validates */ other);
    };

    /**
     * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.neq = LongPrototype.notEquals;

    /**
     * Tests if this Long's value is less than the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.lessThan = function lessThan(other) {
        return this.comp(/* validates */ other) < 0;
    };

    /**
     * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.lt = LongPrototype.lessThan;

    /**
     * Tests if this Long's value is less than or equal the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
        return this.comp(/* validates */ other) <= 0;
    };

    /**
     * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.lte = LongPrototype.lessThanOrEqual;

    /**
     * Tests if this Long's value is greater than the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.greaterThan = function greaterThan(other) {
        return this.comp(/* validates */ other) > 0;
    };

    /**
     * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.gt = LongPrototype.greaterThan;

    /**
     * Tests if this Long's value is greater than or equal the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
        return this.comp(/* validates */ other) >= 0;
    };

    /**
     * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {boolean}
     */
    LongPrototype.gte = LongPrototype.greaterThanOrEqual;

    /**
     * Compares this Long's value with the specified's.
     * @param {!Long|number|string} other Other value
     * @returns {number} 0 if they are the same, 1 if the this is greater and -1
     *  if the given one is greater
     */
    LongPrototype.compare = function compare(other) {
        if (!isLong(other))
            other = fromValue(other);
        if (this.eq(other))
            return 0;
        var thisNeg = this.isNegative(),
            otherNeg = other.isNegative();
        if (thisNeg && !otherNeg)
            return -1;
        if (!thisNeg && otherNeg)
            return 1;
        // At this point the sign bits are the same
        if (!this.unsigned)
            return this.sub(other).isNegative() ? -1 : 1;
        // Both are positive if at least one is unsigned
        return (other.high >>> 0) > (this.high >>> 0) || (other.high === this.high && (other.low >>> 0) > (this.low >>> 0)) ? -1 : 1;
    };

    /**
     * Compares this Long's value with the specified's. This is an alias of {@link Long#compare}.
     * @function
     * @param {!Long|number|string} other Other value
     * @returns {number} 0 if they are the same, 1 if the this is greater and -1
     *  if the given one is greater
     */
    LongPrototype.comp = LongPrototype.compare;

    /**
     * Negates this Long's value.
     * @returns {!Long} Negated Long
     */
    LongPrototype.negate = function negate() {
        if (!this.unsigned && this.eq(MIN_VALUE))
            return MIN_VALUE;
        return this.not().add(ONE);
    };

    /**
     * Negates this Long's value. This is an alias of {@link Long#negate}.
     * @function
     * @returns {!Long} Negated Long
     */
    LongPrototype.neg = LongPrototype.negate;

    /**
     * Returns the sum of this and the specified Long.
     * @param {!Long|number|string} addend Addend
     * @returns {!Long} Sum
     */
    LongPrototype.add = function add(addend) {
        if (!isLong(addend))
            addend = fromValue(addend);

        // Divide each number into 4 chunks of 16 bits, and then sum the chunks.

        var a48 = this.high >>> 16;
        var a32 = this.high & 0xFFFF;
        var a16 = this.low >>> 16;
        var a00 = this.low & 0xFFFF;

        var b48 = addend.high >>> 16;
        var b32 = addend.high & 0xFFFF;
        var b16 = addend.low >>> 16;
        var b00 = addend.low & 0xFFFF;

        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 + b00;
        c16 += c00 >>> 16;
        c00 &= 0xFFFF;
        c16 += a16 + b16;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c32 += a32 + b32;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c48 += a48 + b48;
        c48 &= 0xFFFF;
        return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };

    /**
     * Returns the difference of this and the specified Long.
     * @param {!Long|number|string} subtrahend Subtrahend
     * @returns {!Long} Difference
     */
    LongPrototype.subtract = function subtract(subtrahend) {
        if (!isLong(subtrahend))
            subtrahend = fromValue(subtrahend);
        return this.add(subtrahend.neg());
    };

    /**
     * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
     * @function
     * @param {!Long|number|string} subtrahend Subtrahend
     * @returns {!Long} Difference
     */
    LongPrototype.sub = LongPrototype.subtract;

    /**
     * Returns the product of this and the specified Long.
     * @param {!Long|number|string} multiplier Multiplier
     * @returns {!Long} Product
     */
    LongPrototype.multiply = function multiply(multiplier) {
        if (this.isZero())
            return ZERO;
        if (!isLong(multiplier))
            multiplier = fromValue(multiplier);
        if (multiplier.isZero())
            return ZERO;
        if (this.eq(MIN_VALUE))
            return multiplier.isOdd() ? MIN_VALUE : ZERO;
        if (multiplier.eq(MIN_VALUE))
            return this.isOdd() ? MIN_VALUE : ZERO;

        if (this.isNegative()) {
            if (multiplier.isNegative())
                return this.neg().mul(multiplier.neg());
            else
                return this.neg().mul(multiplier).neg();
        } else if (multiplier.isNegative())
            return this.mul(multiplier.neg()).neg();

        // If both longs are small, use float multiplication
        if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24))
            return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned);

        // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
        // We can skip products that would overflow.

        var a48 = this.high >>> 16;
        var a32 = this.high & 0xFFFF;
        var a16 = this.low >>> 16;
        var a00 = this.low & 0xFFFF;

        var b48 = multiplier.high >>> 16;
        var b32 = multiplier.high & 0xFFFF;
        var b16 = multiplier.low >>> 16;
        var b00 = multiplier.low & 0xFFFF;

        var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
        c00 += a00 * b00;
        c16 += c00 >>> 16;
        c00 &= 0xFFFF;
        c16 += a16 * b00;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c16 += a00 * b16;
        c32 += c16 >>> 16;
        c16 &= 0xFFFF;
        c32 += a32 * b00;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c32 += a16 * b16;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c32 += a00 * b32;
        c48 += c32 >>> 16;
        c32 &= 0xFFFF;
        c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
        c48 &= 0xFFFF;
        return fromBits((c16 << 16) | c00, (c48 << 16) | c32, this.unsigned);
    };

    /**
     * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
     * @function
     * @param {!Long|number|string} multiplier Multiplier
     * @returns {!Long} Product
     */
    LongPrototype.mul = LongPrototype.multiply;

    /**
     * Returns this Long divided by the specified. The result is signed if this Long is signed or
     *  unsigned if this Long is unsigned.
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Quotient
     */
    LongPrototype.divide = function divide(divisor) {
        if (!isLong(divisor))
            divisor = fromValue(divisor);
        if (divisor.isZero())
            throw Error('division by zero');
        if (this.isZero())
            return this.unsigned ? UZERO : ZERO;
        var approx, rem, res;
        if (!this.unsigned) {
            // This section is only relevant for signed longs and is derived from the
            // closure library as a whole.
            if (this.eq(MIN_VALUE)) {
                if (divisor.eq(ONE) || divisor.eq(NEG_ONE))
                    return MIN_VALUE;  // recall that -MIN_VALUE == MIN_VALUE
                else if (divisor.eq(MIN_VALUE))
                    return ONE;
                else {
                    // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
                    var halfThis = this.shr(1);
                    approx = halfThis.div(divisor).shl(1);
                    if (approx.eq(ZERO)) {
                        return divisor.isNegative() ? ONE : NEG_ONE;
                    } else {
                        rem = this.sub(divisor.mul(approx));
                        res = approx.add(rem.div(divisor));
                        return res;
                    }
                }
            } else if (divisor.eq(MIN_VALUE))
                return this.unsigned ? UZERO : ZERO;
            if (this.isNegative()) {
                if (divisor.isNegative())
                    return this.neg().div(divisor.neg());
                return this.neg().div(divisor).neg();
            } else if (divisor.isNegative())
                return this.div(divisor.neg()).neg();
            res = ZERO;
        } else {
            // The algorithm below has not been made for unsigned longs. It's therefore
            // required to take special care of the MSB prior to running it.
            if (!divisor.unsigned)
                divisor = divisor.toUnsigned();
            if (divisor.gt(this))
                return UZERO;
            if (divisor.gt(this.shru(1))) // 15 >>> 1 = 7 ; with divisor = 8 ; true
                return UONE;
            res = UZERO;
        }

        // Repeat the following until the remainder is less than other:  find a
        // floating-point that approximates remainder / other *from below*, add this
        // into the result, and subtract it from the remainder.  It is critical that
        // the approximate value is less than or equal to the real value so that the
        // remainder never becomes negative.
        rem = this;
        while (rem.gte(divisor)) {
            // Approximate the result of division. This may be a little greater or
            // smaller than the actual value.
            approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber()));

            // We will tweak the approximate result by changing it in the 48-th digit or
            // the smallest non-fractional digit, whichever is larger.
            var log2 = Math.ceil(Math.log(approx) / Math.LN2),
                delta = (log2 <= 48) ? 1 : pow_dbl(2, log2 - 48),

            // Decrease the approximation until it is smaller than the remainder.  Note
            // that if it is too large, the product overflows and is negative.
                approxRes = fromNumber(approx),
                approxRem = approxRes.mul(divisor);
            while (approxRem.isNegative() || approxRem.gt(rem)) {
                approx -= delta;
                approxRes = fromNumber(approx, this.unsigned);
                approxRem = approxRes.mul(divisor);
            }

            // We know the answer can't be zero... and actually, zero would cause
            // infinite recursion since we would make no progress.
            if (approxRes.isZero())
                approxRes = ONE;

            res = res.add(approxRes);
            rem = rem.sub(approxRem);
        }
        return res;
    };

    /**
     * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
     * @function
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Quotient
     */
    LongPrototype.div = LongPrototype.divide;

    /**
     * Returns this Long modulo the specified.
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Remainder
     */
    LongPrototype.modulo = function modulo(divisor) {
        if (!isLong(divisor))
            divisor = fromValue(divisor);
        return this.sub(this.div(divisor).mul(divisor));
    };

    /**
     * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
     * @function
     * @param {!Long|number|string} divisor Divisor
     * @returns {!Long} Remainder
     */
    LongPrototype.mod = LongPrototype.modulo;

    /**
     * Returns the bitwise NOT of this Long.
     * @returns {!Long}
     */
    LongPrototype.not = function not() {
        return fromBits(~this.low, ~this.high, this.unsigned);
    };

    /**
     * Returns the bitwise AND of this Long and the specified.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     */
    LongPrototype.and = function and(other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
    };

    /**
     * Returns the bitwise OR of this Long and the specified.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     */
    LongPrototype.or = function or(other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
    };

    /**
     * Returns the bitwise XOR of this Long and the given one.
     * @param {!Long|number|string} other Other Long
     * @returns {!Long}
     */
    LongPrototype.xor = function xor(other) {
        if (!isLong(other))
            other = fromValue(other);
        return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
    };

    /**
     * Returns this Long with bits shifted to the left by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shiftLeft = function shiftLeft(numBits) {
        if (isLong(numBits))
            numBits = numBits.toInt();
        if ((numBits &= 63) === 0)
            return this;
        else if (numBits < 32)
            return fromBits(this.low << numBits, (this.high << numBits) | (this.low >>> (32 - numBits)), this.unsigned);
        else
            return fromBits(0, this.low << (numBits - 32), this.unsigned);
    };

    /**
     * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shl = LongPrototype.shiftLeft;

    /**
     * Returns this Long with bits arithmetically shifted to the right by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shiftRight = function shiftRight(numBits) {
        if (isLong(numBits))
            numBits = numBits.toInt();
        if ((numBits &= 63) === 0)
            return this;
        else if (numBits < 32)
            return fromBits((this.low >>> numBits) | (this.high << (32 - numBits)), this.high >> numBits, this.unsigned);
        else
            return fromBits(this.high >> (numBits - 32), this.high >= 0 ? 0 : -1, this.unsigned);
    };

    /**
     * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shr = LongPrototype.shiftRight;

    /**
     * Returns this Long with bits logically shifted to the right by the given amount.
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
        if (isLong(numBits))
            numBits = numBits.toInt();
        numBits &= 63;
        if (numBits === 0)
            return this;
        else {
            var high = this.high;
            if (numBits < 32) {
                var low = this.low;
                return fromBits((low >>> numBits) | (high << (32 - numBits)), high >>> numBits, this.unsigned);
            } else if (numBits === 32)
                return fromBits(high, 0, this.unsigned);
            else
                return fromBits(high >>> (numBits - 32), 0, this.unsigned);
        }
    };

    /**
     * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
     * @function
     * @param {number|!Long} numBits Number of bits
     * @returns {!Long} Shifted Long
     */
    LongPrototype.shru = LongPrototype.shiftRightUnsigned;

    /**
     * Converts this Long to signed.
     * @returns {!Long} Signed long
     */
    LongPrototype.toSigned = function toSigned() {
        if (!this.unsigned)
            return this;
        return fromBits(this.low, this.high, false);
    };

    /**
     * Converts this Long to unsigned.
     * @returns {!Long} Unsigned long
     */
    LongPrototype.toUnsigned = function toUnsigned() {
        if (this.unsigned)
            return this;
        return fromBits(this.low, this.high, true);
    };

    /**
     * Converts this Long to its byte representation.
     * @param {boolean=} le Whether little or big endian, defaults to big endian
     * @returns {!Array.<number>} Byte representation
     */
    LongPrototype.toBytes = function(le) {
        return le ? this.toBytesLE() : this.toBytesBE();
    }

    /**
     * Converts this Long to its little endian byte representation.
     * @returns {!Array.<number>} Little endian byte representation
     */
    LongPrototype.toBytesLE = function() {
        var hi = this.high,
            lo = this.low;
        return [
             lo         & 0xff,
            (lo >>>  8) & 0xff,
            (lo >>> 16) & 0xff,
            (lo >>> 24) & 0xff,
             hi         & 0xff,
            (hi >>>  8) & 0xff,
            (hi >>> 16) & 0xff,
            (hi >>> 24) & 0xff
        ];
    }

    /**
     * Converts this Long to its big endian byte representation.
     * @returns {!Array.<number>} Big endian byte representation
     */
    LongPrototype.toBytesBE = function() {
        var hi = this.high,
            lo = this.low;
        return [
            (hi >>> 24) & 0xff,
            (hi >>> 16) & 0xff,
            (hi >>>  8) & 0xff,
             hi         & 0xff,
            (lo >>> 24) & 0xff,
            (lo >>> 16) & 0xff,
            (lo >>>  8) & 0xff,
             lo         & 0xff
        ];
    }

    return Long;
});


/***/ }),

/***/ 467:
/***/ ((module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Stream = _interopDefault(__webpack_require__(2413));
var http = _interopDefault(__webpack_require__(8605));
var Url = _interopDefault(__webpack_require__(8835));
var https = _interopDefault(__webpack_require__(7211));
var zlib = _interopDefault(__webpack_require__(8761));

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = __webpack_require__(2877).convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
		if (!res) {
			res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
			if (res) {
				res.pop(); // drop last quote
			}
		}

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url.parse;
const format_url = Url.format;

const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream.PassThrough;
const resolve_url = Url.resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout,
							size: request.size
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

module.exports = exports = fetch;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.default = exports;
exports.Headers = Headers;
exports.Request = Request;
exports.Response = Response;
exports.FetchError = FetchError;


/***/ }),

/***/ 1223:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var wrappy = __webpack_require__(2940)
module.exports = wrappy(once)
module.exports.strict = wrappy(onceStrict)

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
})

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  var name = fn.name || 'Function wrapped with `once`'
  f.onceError = name + " shouldn't be called more than once"
  f.called = false
  return f
}


/***/ }),

/***/ 7770:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultMessages = 'End-Of-Stream';
/**
 * Thrown on read operation of the end of file or stream has been reached
 */
class EndOfStreamError extends Error {
    constructor() {
        super(exports.defaultMessages);
    }
}
exports.EndOfStreamError = EndOfStreamError;
//# sourceMappingURL=EndOfFileStream.js.map

/***/ }),

/***/ 3752:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const assert = __webpack_require__(2357);
const EndOfFileStream_1 = __webpack_require__(7770);
var EndOfFileStream_2 = __webpack_require__(7770);
exports.EndOfStreamError = EndOfFileStream_2.EndOfStreamError;
class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.reject = reject;
            this.resolve = resolve;
        });
    }
}
const maxStreamReadSize = 1 * 1024 * 1024; // Maximum request length on read-stream operation
class StreamReader {
    constructor(s) {
        this.s = s;
        this.endOfStream = false;
        /**
         * Store peeked data
         * @type {Array}
         */
        this.peekQueue = [];
        if (!s.read || !s.once) {
            throw new Error('Expected an instance of stream.Readable');
        }
        this.s.once('end', () => this.reject(new EndOfFileStream_1.EndOfStreamError()));
        this.s.once('error', err => this.reject(err));
        this.s.once('close', () => this.reject(new Error('Stream closed')));
    }
    /**
     * Read ahead (peek) from stream. Subsequent read or peeks will return the same data
     * @param buffer - Buffer to store data read from stream in
     * @param offset - Offset buffer
     * @param length - Number of bytes to read
     * @returns Number of bytes peeked
     */
    async peek(buffer, offset, length) {
        const bytesRead = await this.read(buffer, offset, length);
        this.peekQueue.push(buffer.slice(offset, offset + bytesRead)); // Put read data back to peek buffer
        return bytesRead;
    }
    /**
     * Read chunk from stream
     * @param buffer - Target buffer to store data read from stream in
     * @param offset - Offset of target buffer
     * @param length - Number of bytes to read
     * @returns Number of bytes read
     */
    async read(buffer, offset, length) {
        if (length === 0) {
            return 0;
        }
        if (this.peekQueue.length === 0 && this.endOfStream) {
            throw new EndOfFileStream_1.EndOfStreamError();
        }
        let remaining = length;
        let bytesRead = 0;
        // consume peeked data first
        while (this.peekQueue.length > 0 && remaining > 0) {
            const peekData = this.peekQueue.pop(); // Front of queue
            const lenCopy = Math.min(peekData.length, remaining);
            peekData.copy(buffer, offset + bytesRead, 0, lenCopy);
            bytesRead += lenCopy;
            remaining -= lenCopy;
            if (lenCopy < peekData.length) {
                // remainder back to queue
                this.peekQueue.push(peekData.slice(lenCopy));
            }
        }
        // continue reading from stream if required
        while (remaining > 0 && !this.endOfStream) {
            const reqLen = Math.min(remaining, maxStreamReadSize);
            const chunkLen = await this._read(buffer, offset + bytesRead, reqLen);
            bytesRead += chunkLen;
            if (chunkLen < reqLen)
                break;
            remaining -= chunkLen;
        }
        return bytesRead;
    }
    /**
     * Read chunk from stream
     * @param buffer Buffer to store data read from stream in
     * @param offset Offset buffer
     * @param length Number of bytes to read
     * @returns {any}
     */
    async _read(buffer, offset, length) {
        assert.ok(!this.request, 'Concurrent read operation?');
        const readBuffer = this.s.read(length);
        if (readBuffer) {
            readBuffer.copy(buffer, offset);
            return readBuffer.length;
        }
        else {
            this.request = {
                buffer,
                offset,
                length,
                deferred: new Deferred()
            };
            this.s.once('readable', () => {
                this.tryRead();
            });
            return this.request.deferred.promise.then(n => {
                this.request = null;
                return n;
            }, err => {
                this.request = null;
                throw err;
            });
        }
    }
    tryRead() {
        const readBuffer = this.s.read(this.request.length);
        if (readBuffer) {
            readBuffer.copy(this.request.buffer, this.request.offset);
            this.request.deferred.resolve(readBuffer.length);
        }
        else {
            this.s.once('readable', () => {
                this.tryRead();
            });
        }
    }
    reject(err) {
        this.endOfStream = true;
        if (this.request) {
            this.request.deferred.reject(err);
            this.request = null;
        }
    }
}
exports.StreamReader = StreamReader;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 4833:
/***/ ((module) => {

module.exports = Pend;

function Pend() {
  this.pending = 0;
  this.max = Infinity;
  this.listeners = [];
  this.waiting = [];
  this.error = null;
}

Pend.prototype.go = function(fn) {
  if (this.pending < this.max) {
    pendGo(this, fn);
  } else {
    this.waiting.push(fn);
  }
};

Pend.prototype.wait = function(cb) {
  if (this.pending === 0) {
    cb(this.error);
  } else {
    this.listeners.push(cb);
  }
};

Pend.prototype.hold = function() {
  return pendHold(this);
};

function pendHold(self) {
  self.pending += 1;
  var called = false;
  return onCb;
  function onCb(err) {
    if (called) throw new Error("callback called twice");
    called = true;
    self.error = self.error || err;
    self.pending -= 1;
    if (self.waiting.length > 0 && self.pending < self.max) {
      pendGo(self, self.waiting.shift());
    } else if (self.pending === 0) {
      var listeners = self.listeners;
      self.listeners = [];
      listeners.forEach(cbListener);
    }
  }
  function cbListener(listener) {
    listener(self.error);
  }
}

function pendGo(self, fn) {
  fn(pendHold(self));
}


/***/ }),

/***/ 7016:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Reader = __webpack_require__(2811);

var ManifestParser = __webpack_require__(8924);

var utils = __webpack_require__(5786);

var MANIFEST_FTIL_NAME = /^androidmanifest\.xml$/;
var RESOURCE_FILE_NAME = /^resources\.arsc$/;
var DEFAULT_OPTIONS = {
  ignore: ['uses-sdk.minSdkVersion', 'application.activity', 'application.service', 'application.receiver', 'application.provider'],
  searchResource: true,
  withIcon: false
};

var ApkReader =
/*#__PURE__*/
function (_Reader) {
  _inherits(ApkReader, _Reader);

  function ApkReader(path, options) {
    var _this;

    _classCallCheck(this, ApkReader);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ApkReader).call(this, path));
    _this.options = utils.extend({}, DEFAULT_OPTIONS, options || {});
    return _this;
  }

  _createClass(ApkReader, [{
    key: "parse",
    value: function parse(callback) {
      var that = this;
      var whatYouNeed = [MANIFEST_FTIL_NAME];
      if (this.options.searchResource) whatYouNeed.push(RESOURCE_FILE_NAME);
      this.getEntries(whatYouNeed, function (error, buffers) {
        if (error) return callback(error);
        that.parseManifest(buffers[MANIFEST_FTIL_NAME], function (error, apkInfo) {
          if (error) return callback(error);

          if (that.options.searchResource) {
            that.parseResorceMap(buffers[RESOURCE_FILE_NAME], function (error, resourceMapStr) {
              if (error) {
                return callback(error);
              }

              utils.findOutResources(apkInfo, resourceMapStr);

              if (that.options.withIcon) {
                var iconPath = utils.findOutIcon(apkInfo, 'apk');

                if (iconPath) {
                  return that.getEntry(iconPath, function (error, icon) {
                    if (error) {
                      console.error('Error happened when try paring icon.');
                      console.error(error);
                      return callback(null, apkInfo);
                    }

                    apkInfo.icon = 'data:image/png;base64,' + icon.toString('base64');
                    callback(null, apkInfo);
                  });
                }
              }

              callback(null, apkInfo);
            });
          }
        });
      });
    }
  }, {
    key: "parseManifest",
    value: function parseManifest(manifestBuffer, callback) {
      var apkInfo;

      try {
        apkInfo = new ManifestParser(manifestBuffer, {
          ignore: ['application.activity', 'application.service', 'application.receiver', 'application.provider', 'permission-group']
        }).parse();
      } catch (e) {
        return callback(e);
      }

      callback(null, apkInfo);
    }
  }]);

  return ApkReader;
}(Reader);

module.exports = ApkReader;

/***/ }),

/***/ 4528:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Reader = __webpack_require__(2811);

var utils = __webpack_require__(5786);

var plist = __webpack_require__(9251);

var cgbiToPng = __webpack_require__(2722);

var PLIST_REG = new RegExp(/payload\/.+?\.app\/info.plist$/i);
var PROVISION_REG = new RegExp(/payload\/.+?\.app\/embedded.mobileprovision/);
var DEFAULT_OPTIONS = {
  withIcon: false
};

var IpaReader =
/*#__PURE__*/
function (_Reader) {
  _inherits(IpaReader, _Reader);

  function IpaReader(path, options) {
    var _this;

    _classCallCheck(this, IpaReader);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(IpaReader).call(this, path));
    _this.options = utils.extend({}, DEFAULT_OPTIONS, options || {});
    return _this;
  }

  _createClass(IpaReader, [{
    key: "parse",
    value: function parse(callback) {
      var whatYouNeed = [PLIST_REG, PROVISION_REG];
      var that = this;
      this.getEntries(whatYouNeed, function (error, buffers) {
        if (error) return callback(error);
        var plistInfo;
        var provisionInfo;

        if (buffers[PLIST_REG]) {
          try {
            plistInfo = plist.parse(buffers[PLIST_REG]);

            if (!plistInfo) {
              return callback(new Error('Parse ipa file failed, info.plist is not existed.'));
            }
          } catch (e) {
            return callback(e);
          }
        } else {
          return callback(new Error('Parse ipa file failed, can not find info.plist.'));
        }

        if (buffers[PROVISION_REG]) {
          try {
            provisionInfo = buffers[PROVISION_REG].toString('utf-8');
            var firstIndex = provisionInfo.indexOf('<');
            var lastIndex = provisionInfo.lastIndexOf('</plist>');
            provisionInfo = provisionInfo.slice(firstIndex, lastIndex);
            provisionInfo += '</plist>';
            provisionInfo = plist.parse(provisionInfo);
          } catch (e) {
            return callback(e);
          }
        }

        plistInfo.mobileProvision = provisionInfo;

        if (that.options.withIcon) {
          var iconPath = utils.findOutIcon(plistInfo, 'ipa');
          return that.getEntry(new RegExp(iconPath.toLowerCase()), function (error, icon) {
            if (error) {
              callback(null, plistInfo);
            } else {
              try {
                var pngBuffer = cgbiToPng.revert(icon);
                plistInfo.icon = 'data:image/png;base64,' + pngBuffer.toString('base64');
                callback(null, plistInfo);
              } catch (e) {
                callback(null, plistInfo);
              }
            }
          });
        } else {
          callback(null, plistInfo);
        }
      });
    }
  }]);

  return IpaReader;
}(Reader);

module.exports = IpaReader;

/***/ }),

/***/ 2811:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Unzip = typeof window === 'undefined' ? __webpack_require__(5039) : __webpack_require__(2988);

var ResourceFinder = __webpack_require__(8486);

var utils = __webpack_require__(5786);
/**
 *
 * @param {Any} path    In browser, path must be a File object or a Blob. In NodeJS, this must be a string of your file's path.
 * @constructor
 */


var Reader =
/*#__PURE__*/
function () {
  function Reader(path) {
    _classCallCheck(this, Reader);

    this.path = path;
    this.unzip = new Unzip(path);
  }

  _createClass(Reader, [{
    key: "parseResorceMap",
    value: function parseResorceMap(resourceBuffer, callback) {
      var res;

      try {
        res = new ResourceFinder().processResourceTable(resourceBuffer);
      } catch (e) {
        return callback(e);
      }

      callback(null, res);
    }
    /**
     *
     *
     * @param {Array<String>} whatYouNeed    Entries' name
     * @param {Object}        options        (Optional)
     * @param {String}        options.type   By default, this function will return an Object of buffers.
     *                                       If options.type='blob', it will return blobs in browser.
     *                                       It won't do anything in NodeJS.
     * @param {Function}      callback       Will be called like `callback(error, buffers)`
     */

  }, {
    key: "getEntries",
    value: function getEntries(whatYouNeed, options, callback) {
      if (utils.isFunction(options)) {
        callback = options;
        options = {};
      }

      whatYouNeed = whatYouNeed.map(function (rule) {
        if (typeof rule === 'string') rule = rule.split("\0").join('');
        return rule;
      });
      this.unzip.getBuffer(whatYouNeed, options, function (error, buffers, entryCount) {
        callback(error, buffers, entryCount);
      });
    }
  }, {
    key: "getEntry",
    value: function getEntry(entryName, options, callback) {
      if (utils.isFunction(options)) {
        callback = options;
        options = {};
      }

      if (typeof entryName === 'string') entryName = entryName.split("\0").join('');
      this.unzip.getBuffer([entryName], options, function (error, buffers) {
        callback(error, buffers[entryName]);
      });
    }
  }]);

  return Reader;
}();

module.exports = Reader;

/***/ }),

/***/ 8486:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";

/**
 * Code translated from a C# project https://github.com/hylander0/Iteedee.ApkReader/blob/master/Iteedee.ApkReader/ApkResourceFinder.cs
 *
 * Decode binary file `resources.arsc` from a .apk file to a JavaScript Object.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var ByteBuffer = __webpack_require__(9835);

var DEBUG = false;
var RES_STRING_POOL_TYPE = 0x0001;
var RES_TABLE_TYPE = 0x0002;
var RES_TABLE_PACKAGE_TYPE = 0x0200;
var RES_TABLE_TYPE_TYPE = 0x0201;
var RES_TABLE_TYPE_SPEC_TYPE = 0x0202; // // Contains no data.
// var TYPE_NULL = 0x00;
// // The 'data' holds an attribute resource identifier.
// var TYPE_ATTRIBUTE = 0x02;
// // The 'data' holds a single-precision floating point number.
// var TYPE_FLOAT = 0x04;
// // The 'data' holds a complex number encoding a dimension value,
// // such as "100in".
// var TYPE_DIMENSION = 0x05;
// // The 'data' holds a complex number encoding a fraction of a
// // container.
// var TYPE_FRACTION = 0x06;
// // The 'data' is a raw integer value of the form n..n.
// var TYPE_INT_DEC = 0x10;
// // The 'data' is a raw integer value of the form 0xn..n.
// var TYPE_INT_HEX = 0x11;
// // The 'data' is either 0 or 1, for input "false" or "true" respectively.
// var TYPE_INT_BOOLEAN = 0x12;
// // The 'data' is a raw integer value of the form #aarrggbb.
// var TYPE_INT_COLOR_ARGB8 = 0x1c;
// // The 'data' is a raw integer value of the form #rrggbb.
// var TYPE_INT_COLOR_RGB8 = 0x1d;
// // The 'data' is a raw integer value of the form #argb.
// var TYPE_INT_COLOR_ARGB4 = 0x1e;
// // The 'data' is a raw integer value of the form #rgb.
// var TYPE_INT_COLOR_RGB4 = 0x1f;
// The 'data' holds a ResTable_ref, a reference to another resource
// table entry.

var TYPE_REFERENCE = 0x01; // The 'data' holds an index into the containing resource table's
// global value string pool.

var TYPE_STRING = 0x03;

var ResourceFinder =
/*#__PURE__*/
function () {
  function ResourceFinder() {
    _classCallCheck(this, ResourceFinder);

    this.valueStringPool = null;
    this.typeStringPool = null;
    this.keyStringPool = null;
    this.package_id = 0;
    this.responseMap = {};
    this.entryMap = {};
  } // Same to C# BinaryReader.readBytes


  _createClass(ResourceFinder, [{
    key: "readBytes",
    value: function readBytes(bb, len) {
      var uint8Array = new Uint8Array(len);

      for (var i = 0; i < len; i++) {
        uint8Array[i] = bb.readUint8();
      }

      return ByteBuffer.wrap(uint8Array, 'binary', true);
    }
  }, {
    key: "processResourceTable",
    value: function processResourceTable(resourceBuffer) {
      var bb = ByteBuffer.wrap(resourceBuffer, 'binary', true); // Resource table structure

      var type = bb.readShort();
      var headerSize = bb.readShort();
      var size = bb.readInt();
      var packageCount = bb.readInt();

      if (type !== RES_TABLE_TYPE) {
        throw new Error('No RES_TABLE_TYPE found!');
      }

      if (size !== bb.limit) {
        throw new Error('The buffer size not matches to the resource table size.');
      }

      bb.offset = headerSize;
      var realStringPoolCount = 0;
      var realPackageCount = 0;
      var pos;
      var t;
      var s;

      for (;;) {
        try {
          pos = bb.offset;
          t = bb.readShort(); // hs

          bb.readShort();
          s = bb.readInt();
        } catch (e) {
          break;
        }

        if (t === RES_STRING_POOL_TYPE) {
          // Process the string pool
          if (realStringPoolCount === 0) {
            // Only the first string pool is processed.
            if (DEBUG) {
              console.log('Processing the string pool ...');
            }

            var buffer = new ByteBuffer(s);
            bb.offset = pos;
            bb.prependTo(buffer);
            var bb2 = ByteBuffer.wrap(buffer, 'binary', true);
            bb2.LE();
            this.valueStringPool = this.processStringPool(bb2);
          }

          realStringPoolCount++;
        } else if (t === RES_TABLE_PACKAGE_TYPE) {
          // Process the package
          if (DEBUG) {
            console.log('Processing the package ' + realPackageCount + ' ...');
          }

          var _buffer = new ByteBuffer(s);

          bb.offset = pos;
          bb.prependTo(_buffer);

          var _bb = ByteBuffer.wrap(_buffer, 'binary', true);

          _bb.LE();

          this.processPackage(_bb);
          realPackageCount++;
        } else {
          console.error('Unsupported type');
        }

        bb.offset = pos + s;

        if (!bb.remaining()) {
          break;
        }
      }

      if (realStringPoolCount !== 1) {
        throw new Error('More than 1 string pool found!');
      }

      if (realPackageCount !== packageCount) {
        throw new Error('Real package count not equals the declared count.');
      }

      return this.responseMap;
    }
  }, {
    key: "processPackage",
    value: function processPackage(bb) {
      // Package structure
      // type
      bb.readShort();
      var headerSize = bb.readShort(); // size

      bb.readInt();
      var id = bb.readInt();
      this.package_id = id;

      for (var i = 0; i < 256; ++i) {
        bb.readUint8();
      }

      var typeStrings = bb.readInt(); // lastPublicType

      bb.readInt();
      var keyStrings = bb.readInt(); // lastPublicKey

      bb.readInt();

      if (typeStrings !== headerSize) {
        throw new Error('TypeStrings must immediately following the package structure header.');
      }

      if (DEBUG) {
        console.log('Type strings:');
      }

      var lastPosition = bb.offset;
      bb.offset = typeStrings;
      var bbTypeStrings = this.readBytes(bb, bb.limit - bb.offset);
      bb.offset = lastPosition;
      this.typeStringPool = this.processStringPool(bbTypeStrings); // Key strings

      if (DEBUG) {
        console.log('Key strings:');
      }

      bb.offset = keyStrings; // key_type

      bb.readShort(); // key_headerSize

      bb.readShort();
      var key_size = bb.readInt();
      lastPosition = bb.offset;
      bb.offset = keyStrings;
      var bbKeyStrings = this.readBytes(bb, bb.limit - bb.offset);
      bb.offset = lastPosition;
      this.keyStringPool = this.processStringPool(bbKeyStrings); // Iterate through all chunks

      bb.offset = keyStrings + key_size;
      var bb2;
      var pos;
      var t;
      var s;

      for (;;) {
        pos = bb.offset;

        try {
          t = bb.readShort(); // hs

          bb.readShort();
          s = bb.readInt();
        } catch (e) {
          break;
        } // let typeSpecCount = 0;
        // let typeCount = 0;


        if (t === RES_TABLE_TYPE_SPEC_TYPE) {
          bb.offset = pos;
          bb2 = this.readBytes(bb, s);
          this.processTypeSpec(bb2); // typeSpecCount++;
        } else if (t === RES_TABLE_TYPE_TYPE) {
          bb.offset = pos;
          bb2 = this.readBytes(bb, s);
          this.processType(bb2); // typeCount++;
        }

        if (s === 0) {
          break;
        }

        bb.offset = pos + s;

        if (!bb.remaining()) {
          break;
        }
      }
    }
  }, {
    key: "processType",
    value: function processType(bb) {
      // type
      bb.readShort();
      var headerSize = bb.readShort(); // size

      bb.readInt();
      var id = bb.readByte(); // res0

      bb.readByte(); // res1

      bb.readShort();
      var entryCount = bb.readInt();
      var entriesStart = bb.readInt();
      var refKeys = {}; // config_size

      bb.readInt(); // Skip the config data

      bb.offset = headerSize;

      if (headerSize + entryCount * 4 !== entriesStart) {
        throw new Error('HeaderSize, entryCount and entriesStart are not valid.');
      } // Start to get entry indices


      var entryIndices = new Array(entryCount);

      for (var i = 0; i < entryCount; ++i) {
        entryIndices[i] = bb.readInt();
      } // Get entries


      for (var _i = 0; _i < entryCount; ++_i) {
        if (entryIndices[_i] === -1) {
          continue;
        }

        var resource_id = this.package_id << 24 | id << 16 | _i; // pos

        bb.offset; // entry_size

        bb.readShort();
        var entry_flag = bb.readShort();
        var entry_key = bb.readInt(); // Get the value (simple) or map (complex)

        var FLAG_COMPLEX = 0x0001;

        if ((entry_flag & FLAG_COMPLEX) === 0) {
          // value_size
          bb.readShort(); // value_res0

          bb.readByte();
          var value_dataType = bb.readByte();
          var value_data = bb.readInt();
          var idStr = Number(resource_id).toString(16);
          var keyStr = this.keyStringPool[entry_key];

          if (DEBUG) {
            console.log('Entry 0x' + idStr + ', key: ' + keyStr + ', simple value type: ');
          }

          var key = parseInt(idStr, 16);
          var entryArr = this.entryMap[key];

          if (entryArr == null) {
            entryArr = [];
          }

          entryArr.push(keyStr);
          this.entryMap[key] = entryArr;
          var data = void 0;

          if (value_dataType === TYPE_STRING) {
            data = this.valueStringPool[value_data];

            if (DEBUG) {
              console.log(', data: ' + data + '');
            }
          } else if (value_dataType === TYPE_REFERENCE) {
            // const hexIndex = Number(value_data).toString(16);
            refKeys[idStr] = value_data;
          } else {
            data = value_data;

            if (DEBUG) {
              console.log(', data: ' + data + '');
            }
          }

          this.putIntoMap('@' + idStr, data);
        } else {
          // Complex case
          // entry_parent
          bb.readInt();
          var entry_count = bb.readInt();

          for (var j = 0; j < entry_count; ++j) {
            // ref_name
            bb.readInt(); // value_size

            bb.readShort(); // value_res0

            bb.readByte(); // value_dataType

            bb.readByte(); // value_data

            bb.readInt();
          }

          if (DEBUG) {
            console.log('Entry 0x' + Number(resource_id).toString(16) + ', key: ' + this.keyStringPool[entry_key] + ', complex value, not printed.');
          }
        }
      }

      for (var refK in refKeys) {
        var values = this.responseMap['@' + Number(refKeys[refK]).toString(16).toUpperCase()];

        if (values != null) {
          for (var value in values) {
            this.putIntoMap('@' + refK, value);
          }
        }
      }
    }
  }, {
    key: "processStringPool",
    value: function processStringPool(bb) {
      // String pool structure
      // type
      bb.readShort(); // headerSize

      bb.readShort(); // size

      bb.readInt();
      var stringCount = bb.readInt(); // styleCount

      bb.readInt();
      var flags = bb.readInt();
      var stringsStart = bb.readInt(); // stylesStart

      bb.readInt();
      var isUTF_8 = (flags & 256) !== 0;
      var offsets = new Array(stringCount);

      for (var i = 0; i < stringCount; ++i) {
        offsets[i] = bb.readInt();
      }

      var strings = new Array(stringCount);

      for (var _i2 = 0; _i2 < stringCount; ++_i2) {
        var pos = stringsStart + offsets[_i2];
        bb.offset = pos;
        strings[_i2] = '';

        if (isUTF_8) {
          var u16len = bb.readUint8();

          if ((u16len & 0x80) !== 0) {
            u16len = ((u16len & 0x7F) << 8) + bb.readUint8();
          }

          var u8len = bb.readUint8();

          if ((u8len & 0x80) !== 0) {
            u8len = ((u8len & 0x7F) << 8) + bb.readUint8();
          }

          if (u8len > 0) {
            var buffer = this.readBytes(bb, u8len);

            try {
              strings[_i2] = ByteBuffer.wrap(buffer, 'utf8', true).toString('utf8');
            } catch (e) {
              if (DEBUG) {
                console.error(e);
                console.log('Error when turning buffer to utf-8 string.');
              }
            }
          } else {
            strings[_i2] = '';
          }
        } else {
          var _u16len = bb.readUint16();

          if ((_u16len & 0x8000) !== 0) {
            // larger than 32768
            _u16len = ((_u16len & 0x7FFF) << 16) + bb.readUint16();
          }

          if (_u16len > 0) {
            var len = _u16len * 2;

            var _buffer2 = this.readBytes(bb, len);

            try {
              strings[_i2] = ByteBuffer.wrap(_buffer2, 'utf8', true).toString('utf8');
            } catch (e) {
              if (DEBUG) {
                console.error(e);
                console.log('Error when turning buffer to utf-8 string.');
              }
            }
          }
        }

        if (DEBUG) {
          console.log('Parsed value: {0}', strings[_i2]);
        }
      }

      return strings;
    }
  }, {
    key: "processTypeSpec",
    value: function processTypeSpec(bb) {
      // type
      bb.readShort(); // headerSize

      bb.readShort(); // size

      bb.readInt();
      var id = bb.readByte(); // res0

      bb.readByte(); // res1

      bb.readShort();
      var entryCount = bb.readInt();

      if (DEBUG) {
        console.log('Processing type spec ' + this.typeStringPool[id - 1] + '...');
      }

      var flags = new Array(entryCount);

      for (var i = 0; i < entryCount; ++i) {
        flags[i] = bb.readInt();
      }
    }
  }, {
    key: "putIntoMap",
    value: function putIntoMap(resId, value) {
      var valueList = this.responseMap[resId.toUpperCase()];

      if (valueList == null) {
        valueList = [];
      }

      valueList.push(value);
      this.responseMap[resId.toUpperCase()] = valueList;
    }
  }]);

  return ResourceFinder;
}();

module.exports = ResourceFinder;

/***/ }),

/***/ 7944:
/***/ ((module) => {

"use strict";
 // Code extracted from https://github.com/openstf/adbkit-apkreader

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var debug = false;
var NodeType = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  CDATA_SECTION_NODE: 4
};
var ChunkType = {
  NULL: 0x0000,
  STRING_POOL: 0x0001,
  TABLE: 0x0002,
  XML: 0x0003,
  XML_FIRST_CHUNK: 0x0100,
  XML_START_NAMESPACE: 0x0100,
  XML_END_NAMESPACE: 0x0101,
  XML_START_ELEMENT: 0x0102,
  XML_END_ELEMENT: 0x0103,
  XML_CDATA: 0x0104,
  XML_LAST_CHUNK: 0x017f,
  XML_RESOURCE_MAP: 0x0180,
  TABLE_PACKAGE: 0x0200,
  TABLE_TYPE: 0x0201,
  TABLE_TYPE_SPEC: 0x0202
};
var StringFlags = {
  SORTED: 1 << 0,
  UTF8: 1 << 8
}; // Taken from android.util.TypedValue

var TypedValue = {
  COMPLEX_MANTISSA_MASK: 0x00ffffff,
  COMPLEX_MANTISSA_SHIFT: 0x00000008,
  COMPLEX_RADIX_0p23: 0x00000003,
  COMPLEX_RADIX_16p7: 0x00000001,
  COMPLEX_RADIX_23p0: 0x00000000,
  COMPLEX_RADIX_8p15: 0x00000002,
  COMPLEX_RADIX_MASK: 0x00000003,
  COMPLEX_RADIX_SHIFT: 0x00000004,
  COMPLEX_UNIT_DIP: 0x00000001,
  COMPLEX_UNIT_FRACTION: 0x00000000,
  COMPLEX_UNIT_FRACTION_PARENT: 0x00000001,
  COMPLEX_UNIT_IN: 0x00000004,
  COMPLEX_UNIT_MASK: 0x0000000f,
  COMPLEX_UNIT_MM: 0x00000005,
  COMPLEX_UNIT_PT: 0x00000003,
  COMPLEX_UNIT_PX: 0x00000000,
  COMPLEX_UNIT_SHIFT: 0x00000000,
  COMPLEX_UNIT_SP: 0x00000002,
  DENSITY_DEFAULT: 0x00000000,
  DENSITY_NONE: 0x0000ffff,
  TYPE_ATTRIBUTE: 0x00000002,
  TYPE_DIMENSION: 0x00000005,
  TYPE_FIRST_COLOR_INT: 0x0000001c,
  TYPE_FIRST_INT: 0x00000010,
  TYPE_FLOAT: 0x00000004,
  TYPE_FRACTION: 0x00000006,
  TYPE_INT_BOOLEAN: 0x00000012,
  TYPE_INT_COLOR_ARGB4: 0x0000001e,
  TYPE_INT_COLOR_ARGB8: 0x0000001c,
  TYPE_INT_COLOR_RGB4: 0x0000001f,
  TYPE_INT_COLOR_RGB8: 0x0000001d,
  TYPE_INT_DEC: 0x00000010,
  TYPE_INT_HEX: 0x00000011,
  TYPE_LAST_COLOR_INT: 0x0000001f,
  TYPE_LAST_INT: 0x0000001f,
  TYPE_NULL: 0x00000000,
  TYPE_REFERENCE: 0x00000001,
  TYPE_STRING: 0x00000003
};

var BinaryXmlParser =
/*#__PURE__*/
function () {
  function BinaryXmlParser(buffer) {
    _classCallCheck(this, BinaryXmlParser);

    this.buffer = buffer;
    this.cursor = 0;
    this.strings = [];
    this.resources = [];
    this.document = null;
    this.parent = null;
    this.stack = [];
  }

  _createClass(BinaryXmlParser, [{
    key: "readU8",
    value: function readU8() {
      var val = this.buffer[this.cursor];
      this.cursor += 1;
      return val;
    }
  }, {
    key: "readU16",
    value: function readU16() {
      var val = this.buffer.readUInt16LE(this.cursor);
      this.cursor += 2;
      return val;
    }
  }, {
    key: "readS32",
    value: function readS32() {
      var val = this.buffer.readInt32LE(this.cursor);
      this.cursor += 4;
      return val;
    }
  }, {
    key: "readU32",
    value: function readU32() {
      var val = this.buffer.readUInt32LE(this.cursor);
      this.cursor += 4;
      return val;
    }
  }, {
    key: "readLength8",
    value: function readLength8() {
      var len = this.readU8();

      if (len & 0x80) {
        len = (len & 0x7f) << 8;
        len += this.readU8();
      }

      return len;
    }
  }, {
    key: "readLength16",
    value: function readLength16() {
      var len = this.readU16();

      if (len & 0x8000) {
        len = (len & 0x7fff) << 16;
        len += this.readU16();
      }

      return len;
    }
  }, {
    key: "readDimension",
    value: function readDimension() {
      var dimension = {
        value: null,
        unit: null,
        rawUnit: null
      };
      var value = this.readU32();
      var unit = dimension.value & 0xff;
      dimension.value = value >> 8;
      dimension.rawUnit = unit;

      switch (unit) {
        case TypedValue.COMPLEX_UNIT_MM:
          dimension.unit = 'mm';
          break;

        case TypedValue.COMPLEX_UNIT_PX:
          dimension.unit = 'px';
          break;

        case TypedValue.COMPLEX_UNIT_DIP:
          dimension.unit = 'dp';
          break;

        case TypedValue.COMPLEX_UNIT_SP:
          dimension.unit = 'sp';
          break;

        case TypedValue.COMPLEX_UNIT_PT:
          dimension.unit = 'pt';
          break;

        case TypedValue.COMPLEX_UNIT_IN:
          dimension.unit = 'in';
          break;
      }

      return dimension;
    }
  }, {
    key: "readFraction",
    value: function readFraction() {
      var fraction = {
        value: null,
        type: null,
        rawType: null
      };
      var value = this.readU32();
      var type = value & 0xf;
      fraction.value = this.convertIntToFloat(value >> 4);
      fraction.rawType = type;

      switch (type) {
        case TypedValue.COMPLEX_UNIT_FRACTION:
          fraction.type = '%';
          break;

        case TypedValue.COMPLEX_UNIT_FRACTION_PARENT:
          fraction.type = '%p';
          break;
      }

      return fraction;
    }
  }, {
    key: "readHex24",
    value: function readHex24() {
      return (this.readU32() & 0xffffff).toString(16);
    }
  }, {
    key: "readHex32",
    value: function readHex32() {
      return this.readU32().toString(16);
    }
  }, {
    key: "readTypedValue",
    value: function readTypedValue() {
      var typedValue = {
        value: null,
        type: null,
        rawType: null
      };
      var start = this.cursor;
      var size = this.readU16();
      /* const zero = */

      this.readU8();
      var dataType = this.readU8(); // Yes, there has been a real world APK where the size is malformed.

      if (size === 0) {
        size = 8;
      }

      typedValue.rawType = dataType;

      switch (dataType) {
        case TypedValue.TYPE_INT_DEC:
          typedValue.value = this.readS32();
          typedValue.type = 'int_dec';
          break;

        case TypedValue.TYPE_INT_HEX:
          typedValue.value = this.readS32();
          typedValue.type = 'int_hex';
          break;

        case TypedValue.TYPE_STRING:
          var ref = this.readS32();
          typedValue.value = ref > 0 ? this.strings[ref] : '';
          typedValue.type = 'string';
          break;

        case TypedValue.TYPE_REFERENCE:
          var id = this.readU32();
          typedValue.value = "resourceId:0x".concat(id.toString(16));
          typedValue.type = 'reference';
          break;

        case TypedValue.TYPE_INT_BOOLEAN:
          typedValue.value = this.readS32() !== 0;
          typedValue.type = 'boolean';
          break;

        case TypedValue.TYPE_NULL:
          this.readU32();
          typedValue.value = null;
          typedValue.type = 'null';
          break;

        case TypedValue.TYPE_INT_COLOR_RGB8:
          typedValue.value = this.readHex24();
          typedValue.type = 'rgb8';
          break;

        case TypedValue.TYPE_INT_COLOR_RGB4:
          typedValue.value = this.readHex24();
          typedValue.type = 'rgb4';
          break;

        case TypedValue.TYPE_INT_COLOR_ARGB8:
          typedValue.value = this.readHex32();
          typedValue.type = 'argb8';
          break;

        case TypedValue.TYPE_INT_COLOR_ARGB4:
          typedValue.value = this.readHex32();
          typedValue.type = 'argb4';
          break;

        case TypedValue.TYPE_DIMENSION:
          typedValue.value = this.readDimension();
          typedValue.type = 'dimension';
          break;

        case TypedValue.TYPE_FRACTION:
          typedValue.value = this.readFraction();
          typedValue.type = 'fraction';
          break;

        default:
          {
            var type = dataType.toString(16);

            if (debug) {
              console.log("Not sure what to do with typed value of type 0x".concat(type, ", falling           back to reading an uint32."));
            }

            typedValue.value = this.readU32();
            typedValue.type = 'unknown';
          }
      } // Ensure we consume the whole value


      var end = start + size;

      if (this.cursor !== end) {
        var _type = dataType.toString(16);

        var diff = end - this.cursor;

        if (debug) {
          console.log("Cursor is off by ".concat(diff, " bytes at ").concat(this.cursor, " at supposed end of typed value of type 0x").concat(_type, ". The typed value started at offset ").concat(start, " and is supposed to end at offset ").concat(end, ". Ignoring the rest of the value."));
        }

        this.cursor = end;
      }

      return typedValue;
    } // https://twitter.com/kawasima/status/427730289201139712

  }, {
    key: "convertIntToFloat",
    value: function convertIntToFloat(int) {
      var buf = new ArrayBuffer(4);
      new Int32Array(buf)[0] = int;
      return new Float32Array(buf)[0];
    }
  }, {
    key: "readString",
    value: function readString(encoding) {
      switch (encoding) {
        case 'utf-8':
          var stringLength = this.readLength8(encoding);
          var byteLength = this.readLength8(encoding);
          var value = this.buffer.toString(encoding, this.cursor, this.cursor += byteLength);
          this.readU8(); // Trailing zero

          return value;

        case 'ucs2':
          stringLength = this.readLength16(encoding);
          byteLength = stringLength * 2;
          value = this.buffer.toString(encoding, this.cursor, this.cursor += byteLength);
          this.readU16(); // Trailing zero

          return value;

        default:
          throw new Error("Unsupported encoding '".concat(encoding, "'"));
      }
    }
  }, {
    key: "readChunkHeader",
    value: function readChunkHeader() {
      return {
        chunkType: this.readU16(),
        headerSize: this.readU16(),
        chunkSize: this.readU32()
      };
    }
  }, {
    key: "readStringPool",
    value: function readStringPool(header) {
      header.stringCount = this.readU32();
      header.styleCount = this.readU32();
      header.flags = this.readU32();
      header.stringsStart = this.readU32();
      header.stylesStart = this.readU32();

      if (header.chunkType !== ChunkType.STRING_POOL) {
        throw new Error('Invalid string pool header');
      }

      var anchor = this.cursor;
      var offsets = [];

      for (var i = 0, l = header.stringCount; i < l; ++i) {
        offsets.push(this.readU32());
      } // sorted = (header.flags & StringFlags.SORTED) === StringFlags.SORTED


      var encoding = (header.flags & StringFlags.UTF8) === StringFlags.UTF8 ? 'utf-8' : 'ucs2';
      this.cursor = anchor + header.stringsStart - header.headerSize;

      for (var _i = 0, _l = header.stringCount; _i < _l; ++_i) {
        this.strings.push(this.readString(encoding));
      } // Skip styles


      this.cursor = anchor + header.chunkSize - header.headerSize;
      return null;
    }
  }, {
    key: "readResourceMap",
    value: function readResourceMap(header) {
      var count = Math.floor((header.chunkSize - header.headerSize) / 4);

      for (var i = 0; i < count; ++i) {
        this.resources.push(this.readU32());
      }

      return null;
    }
  }, {
    key: "readXmlNamespaceStart",
    value: function readXmlNamespaceStart()
    /* header */
    {
      /* const line = */
      this.readU32();
      /* const commentRef = */

      this.readU32();
      /* const prefixRef = */

      this.readS32();
      /* const uriRef = */

      this.readS32(); // We don't currently care about the values, but they could
      // be accessed like so:
      //
      // namespaceURI.prefix = this.strings[prefixRef] // if prefixRef > 0
      // namespaceURI.uri = this.strings[uriRef] // if uriRef > 0

      return null;
    }
  }, {
    key: "readXmlNamespaceEnd",
    value: function readXmlNamespaceEnd()
    /* header */
    {
      /* const line = */
      this.readU32();
      /* const commentRef = */

      this.readU32();
      /* const prefixRef = */

      this.readS32();
      /* const uriRef = */

      this.readS32(); // We don't currently care about the values, but they could
      // be accessed like so:
      //
      // namespaceURI.prefix = this.strings[prefixRef] // if prefixRef > 0
      // namespaceURI.uri = this.strings[uriRef] // if uriRef > 0

      return null;
    }
  }, {
    key: "readXmlElementStart",
    value: function readXmlElementStart()
    /* header */
    {
      var node = {
        namespaceURI: null,
        nodeType: NodeType.ELEMENT_NODE,
        nodeName: null,
        attributes: [],
        childNodes: []
      };
      /* const line = */

      this.readU32();
      /* const commentRef = */

      this.readU32();
      var nsRef = this.readS32();
      var nameRef = this.readS32();

      if (nsRef > 0) {
        node.namespaceURI = this.strings[nsRef];
      }

      node.nodeName = this.strings[nameRef];
      /* const attrStart = */

      this.readU16();
      /* const attrSize = */

      this.readU16();
      var attrCount = this.readU16();
      /* const idIndex = */

      this.readU16();
      /* const classIndex = */

      this.readU16();
      /* const styleIndex = */

      this.readU16();

      for (var i = 0; i < attrCount; ++i) {
        node.attributes.push(this.readXmlAttribute());
      }

      if (this.document) {
        this.parent.childNodes.push(node);
        this.parent = node;
      } else {
        this.document = this.parent = node;
      }

      this.stack.push(node);
      return node;
    }
  }, {
    key: "readXmlAttribute",
    value: function readXmlAttribute() {
      var attr = {
        namespaceURI: null,
        nodeType: NodeType.ATTRIBUTE_NODE,
        nodeName: null,
        name: null,
        value: null,
        typedValue: null
      };
      var nsRef = this.readS32();
      var nameRef = this.readS32();
      var valueRef = this.readS32();

      if (nsRef > 0) {
        attr.namespaceURI = this.strings[nsRef];
      }

      attr.nodeName = attr.name = this.strings[nameRef];

      if (valueRef > 0) {
        attr.value = this.strings[valueRef];
      }

      attr.typedValue = this.readTypedValue();
      return attr;
    }
  }, {
    key: "readXmlElementEnd",
    value: function readXmlElementEnd()
    /* header */
    {
      /* const line = */
      this.readU32();
      /* const commentRef = */

      this.readU32();
      /* const nsRef = */

      this.readS32();
      /* const nameRef = */

      this.readS32();
      this.stack.pop();
      this.parent = this.stack[this.stack.length - 1];
      return null;
    }
  }, {
    key: "readXmlCData",
    value: function readXmlCData()
    /* header */
    {
      var cdata = {
        namespaceURI: null,
        nodeType: NodeType.CDATA_SECTION_NODE,
        nodeName: '#cdata',
        data: null,
        typedValue: null
      };
      /* const line = */

      this.readU32();
      /* const commentRef = */

      this.readU32();
      var dataRef = this.readS32();

      if (dataRef > 0) {
        cdata.data = this.strings[dataRef];
      }

      cdata.typedValue = this.readTypedValue();
      this.parent.childNodes.push(cdata);
      return cdata;
    }
  }, {
    key: "readNull",
    value: function readNull(header) {
      this.cursor += header.chunkSize - header.headerSize;
      return null;
    }
  }, {
    key: "parse",
    value: function parse() {
      var xmlHeader = this.readChunkHeader();

      if (xmlHeader.chunkType !== ChunkType.XML) {
        throw new Error('Invalid XML header');
      }

      this.readStringPool(this.readChunkHeader());
      var resMapHeader = this.readChunkHeader();

      if (resMapHeader.chunkType === ChunkType.XML_RESOURCE_MAP) {
        this.readResourceMap(resMapHeader);
        this.readXmlNamespaceStart(this.readChunkHeader());
      } else {
        this.readXmlNamespaceStart(resMapHeader);
      }

      while (this.cursor < this.buffer.length) {
        var start = this.cursor;
        var header = this.readChunkHeader();

        switch (header.chunkType) {
          case ChunkType.XML_START_NAMESPACE:
            this.readXmlNamespaceStart(header);
            break;

          case ChunkType.XML_END_NAMESPACE:
            this.readXmlNamespaceEnd(header);
            break;

          case ChunkType.XML_START_ELEMENT:
            this.readXmlElementStart(header);
            break;

          case ChunkType.XML_END_ELEMENT:
            this.readXmlElementEnd(header);
            break;

          case ChunkType.XML_CDATA:
            this.readXmlCData(header);
            break;

          case ChunkType.NULL:
            this.readNull(header);
            break;

          default:
            throw new Error("Unsupported chunk type '".concat(header.chunkType, "'"));
        } // Ensure we consume the whole chunk


        var end = start + header.chunkSize;

        if (this.cursor !== end) {
          var diff = end - this.cursor;
          var type = header.chunkType.toString(16);

          if (debug) {
            console.log("Cursor is off by ".concat(diff, " bytes at ").concat(this.cursor, " at supposed end of chunk of type 0x").concat(type, ". The chunk started at offset ").concat(start, " and is supposed to end at offset ").concat(end, ". Ignoring the rest of the chunk."));
          }

          this.cursor = end;
        }
      }

      return this.document;
    }
  }]);

  return BinaryXmlParser;
}();

module.exports = BinaryXmlParser;

/***/ }),

/***/ 4366:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var ApkReader = __webpack_require__(7016);

var IpaReader = __webpack_require__(4528);

function PkgReader(path, extension, options) {
  return new (extension === 'ipa' ? IpaReader : ApkReader)(path, options);
}

module.exports = PkgReader;

/***/ }),

/***/ 8924:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
 // Code extracted from https://github.com/openstf/adbkit-apkreader

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var BinaryXmlParser = __webpack_require__(7944); // const NS_ANDROID = 'http://schemas.android.com/apk/res/android'


var INTENT_MAIN = 'android.intent.action.MAIN';
var CATEGORY_LAUNCHER = 'android.intent.category.LAUNCHER';

var ManifestParser =
/*#__PURE__*/
function () {
  function ManifestParser(buffer) {
    _classCallCheck(this, ManifestParser);

    this.buffer = buffer;
    this.xmlParser = new BinaryXmlParser(this.buffer);
  }

  _createClass(ManifestParser, [{
    key: "collapseAttributes",
    value: function collapseAttributes(element) {
      var collapsed = Object.create(null);

      for (var _i = 0, _Array$from = Array.from(element.attributes); _i < _Array$from.length; _i++) {
        var attr = _Array$from[_i];
        collapsed[attr.name] = attr.typedValue.value;
      }

      return collapsed;
    }
  }, {
    key: "parseIntents",
    value: function parseIntents(element, target) {
      var _this = this;

      target.intentFilters = [];
      target.metaData = [];
      return element.childNodes.forEach(function (element) {
        switch (element.nodeName) {
          case 'intent-filter':
            {
              var intentFilter = _this.collapseAttributes(element);

              intentFilter.actions = [];
              intentFilter.categories = [];
              intentFilter.data = [];
              element.childNodes.forEach(function (element) {
                switch (element.nodeName) {
                  case 'action':
                    intentFilter.actions.push(_this.collapseAttributes(element));
                    break;

                  case 'category':
                    intentFilter.categories.push(_this.collapseAttributes(element));
                    break;

                  case 'data':
                    intentFilter.data.push(_this.collapseAttributes(element));
                    break;
                }
              });
              target.intentFilters.push(intentFilter);
              break;
            }

          case 'meta-data':
            target.metaData.push(_this.collapseAttributes(element));
            break;
        }
      });
    }
  }, {
    key: "parseApplication",
    value: function parseApplication(element) {
      var _this2 = this;

      var app = this.collapseAttributes(element);
      app.activities = [];
      app.activityAliases = [];
      app.launcherActivities = [];
      app.services = [];
      app.receivers = [];
      app.providers = [];
      app.usesLibraries = [];
      app.metaData = [];
      element.childNodes.forEach(function (element) {
        switch (element.nodeName) {
          case 'activity':
            {
              var activity = _this2.collapseAttributes(element);

              _this2.parseIntents(element, activity);

              app.activities.push(activity);

              if (_this2.isLauncherActivity(activity)) {
                app.launcherActivities.push(activity);
              }

              break;
            }

          case 'activity-alias':
            {
              var activityAlias = _this2.collapseAttributes(element);

              _this2.parseIntents(element, activityAlias);

              app.activityAliases.push(activityAlias);

              if (_this2.isLauncherActivity(activityAlias)) {
                app.launcherActivities.push(activityAlias);
              }

              break;
            }

          case 'service':
            {
              var service = _this2.collapseAttributes(element);

              _this2.parseIntents(element, service);

              app.services.push(service);
              break;
            }

          case 'receiver':
            {
              var receiver = _this2.collapseAttributes(element);

              _this2.parseIntents(element, receiver);

              app.receivers.push(receiver);
              break;
            }

          case 'provider':
            {
              var provider = _this2.collapseAttributes(element);

              provider.grantUriPermissions = [];
              provider.metaData = [];
              provider.pathPermissions = [];
              element.childNodes.forEach(function (element) {
                switch (element.nodeName) {
                  case 'grant-uri-permission':
                    provider.grantUriPermissions.push(_this2.collapseAttributes(element));
                    break;

                  case 'meta-data':
                    provider.metaData.push(_this2.collapseAttributes(element));
                    break;

                  case 'path-permission':
                    provider.pathPermissions.push(_this2.collapseAttributes(element));
                    break;
                }
              });
              app.providers.push(provider);
              break;
            }

          case 'uses-library':
            app.usesLibraries.push(_this2.collapseAttributes(element));
            break;

          case 'meta-data':
            app.metaData.push(_this2.collapseAttributes(element));
            break;
        }
      });
      return app;
    }
  }, {
    key: "isLauncherActivity",
    value: function isLauncherActivity(activity) {
      return activity.intentFilters.some(function (filter) {
        var hasMain = filter.actions.some(function (action) {
          return action.name === INTENT_MAIN;
        });

        if (!hasMain) {
          return false;
        }

        return filter.categories.some(function (category) {
          return category.name === CATEGORY_LAUNCHER;
        });
      });
    }
  }, {
    key: "parse",
    value: function parse() {
      var _this3 = this;

      var document = this.xmlParser.parse();
      var manifest = this.collapseAttributes(document);
      manifest.usesPermissions = [];
      manifest.permissions = [];
      manifest.permissionTrees = [];
      manifest.permissionGroups = [];
      manifest.instrumentation = null;
      manifest.usesSdk = null;
      manifest.usesConfiguration = null;
      manifest.usesFeatures = [];
      manifest.supportsScreens = null;
      manifest.compatibleScreens = [];
      manifest.supportsGlTextures = [];
      manifest.application = Object.create(null);
      document.childNodes.forEach(function (element) {
        switch (element.nodeName) {
          case 'uses-permission':
            manifest.usesPermissions.push(_this3.collapseAttributes(element));
            break;

          case 'permission':
            manifest.permissions.push(_this3.collapseAttributes(element));
            break;

          case 'permission-tree':
            manifest.permissionTrees.push(_this3.collapseAttributes(element));
            break;

          case 'permission-group':
            manifest.permissionGroups.push(_this3.collapseAttributes(element));
            break;

          case 'instrumentation':
            manifest.instrumentation = _this3.collapseAttributes(element);
            break;

          case 'uses-sdk':
            manifest.usesSdk = _this3.collapseAttributes(element);
            break;

          case 'uses-configuration':
            manifest.usesConfiguration = _this3.collapseAttributes(element);
            break;

          case 'uses-feature':
            manifest.usesFeatures.push(_this3.collapseAttributes(element));
            break;

          case 'supports-screens':
            manifest.supportsScreens = _this3.collapseAttributes(element);
            break;

          case 'compatible-screens':
            element.childNodes.forEach(function (screen) {
              return manifest.compatibleScreens.push(_this3.collapseAttributes(screen));
            });
            break;

          case 'supports-gl-texture':
            manifest.supportsGlTextures.push(_this3.collapseAttributes(element));
            break;

          case 'application':
          case 'com.stub.StubApp':
            manifest.application = _this3.parseApplication(element);
            break;
        }
      });
      return manifest;
    }
  }]);

  return ManifestParser;
}();

module.exports = ManifestParser;

/***/ }),

/***/ 3843:
/***/ ((__unused_webpack_module, exports) => {

"use strict";
 // adapted from http://code.google.com/p/plist/source/browse/trunk/src/com/dd/plist/BinaryPropertyListParser.java

var debug = false;
exports.maxObjectSize = 100 * 1000 * 1000; // 100Meg

exports.maxObjectCount = 32768; // EPOCH = new SimpleDateFormat("yyyy MM dd zzz").parse("2001 01 01 GMT").getTime();
// ...but that's annoying in a static initializer because it can throw exceptions, ick.
// So we just hardcode the correct value.

var EPOCH = 978307200000;

exports.parseBuffer = function (buffer) {
  // check header
  var header = buffer.slice(0, 'bplist'.length).toString('utf8');

  if (header !== 'bplist') {
    throw new Error('Invalid binary plist. Expected "bplist" at offset 0.');
  } // Handle trailer, last 32 bytes of the file


  var trailer = buffer.slice(buffer.length - 32, buffer.length); // 6 null bytes (index 0 to 5)

  var offsetSize = trailer.readUInt8(6);

  if (debug) {
    console.log('offsetSize: ' + offsetSize);
  }

  var objectRefSize = trailer.readUInt8(7);

  if (debug) {
    console.log('objectRefSize: ' + objectRefSize);
  }

  var numObjects = readUInt64BE(trailer, 8);

  if (debug) {
    console.log('numObjects: ' + numObjects);
  }

  var topObject = readUInt64BE(trailer, 16);

  if (debug) {
    console.log('topObject: ' + topObject);
  }

  var offsetTableOffset = readUInt64BE(trailer, 24);

  if (debug) {
    console.log('offsetTableOffset: ' + offsetTableOffset);
  }

  if (numObjects > exports.maxObjectCount) {
    throw new Error('maxObjectCount exceeded');
  } // Handle offset table


  var offsetTable = [];

  for (var i = 0; i < numObjects; i++) {
    var offsetBytes = buffer.slice(offsetTableOffset + i * offsetSize, offsetTableOffset + (i + 1) * offsetSize);
    offsetTable[i] = readUInt(offsetBytes, 0);

    if (debug) {
      console.log('Offset for Object #' + i + ' is ' + offsetTable[i] + ' [' + offsetTable[i].toString(16) + ']');
    }
  } // Parses an object inside the currently parsed binary property list.
  // For the format specification check
  // <a href="http://www.opensource.apple.com/source/CF/CF-635/CFBinaryPList.c">
  // Apple's binary property list parser implementation</a>.


  function parseObject(tableOffset) {
    var offset = offsetTable[tableOffset];
    var type = buffer[offset];
    var objType = (type & 0xF0) >> 4; // First  4 bits

    var objInfo = type & 0x0F; // Second 4 bits

    switch (objType) {
      case 0x0:
        return parseSimple();

      case 0x1:
        return parseInteger();

      case 0x8:
        return parseUID();

      case 0x2:
        return parseReal();

      case 0x3:
        return parseDate();

      case 0x4:
        return parseData();

      case 0x5:
        // ASCII
        return parsePlistString();

      case 0x6:
        // UTF-16
        return parsePlistString(true);

      case 0xA:
        return parseArray();

      case 0xD:
        return parseDictionary();

      default:
        throw new Error('Unhandled type 0x' + objType.toString(16));
    }

    function parseSimple() {
      // Simple
      switch (objInfo) {
        case 0x0:
          // null
          return null;

        case 0x8:
          // false
          return false;

        case 0x9:
          // true
          return true;

        case 0xF:
          // filler byte
          return null;

        default:
          throw new Error('Unhandled simple type 0x' + objType.toString(16));
      }
    }

    function parseInteger() {
      var length = Math.pow(2, objInfo);

      if (length < exports.maxObjectSize) {
        return readUInt(buffer.slice(offset + 1, offset + 1 + length));
      }

      throw new Error('To little heap space available! Wanted to read ' + length + ' bytes, but only ' + exports.maxObjectSize + ' are available.');
    }

    function parseUID() {
      var length = objInfo + 1;

      if (length < exports.maxObjectSize) {
        return readUInt(buffer.slice(offset + 1, offset + 1 + length));
      }

      throw new Error('To little heap space available! Wanted to read ' + length + ' bytes, but only ' + exports.maxObjectSize + ' are available.');
    }

    function parseReal() {
      var length = Math.pow(2, objInfo);

      if (length < exports.maxObjectSize) {
        var realBuffer = buffer.slice(offset + 1, offset + 1 + length);

        if (length === 4) {
          return realBuffer.readFloatBE(0);
        } else if (length === 8) {
          return realBuffer.readDoubleBE(0);
        }
      }

      throw new Error('To little heap space available! Wanted to read ' + length + ' bytes, but only ' + exports.maxObjectSize + ' are available.');
    }

    function parseDate() {
      if (objInfo !== 0x3) {
        console.error('Unknown date type :' + objInfo + '. Parsing anyway...');
      }

      var dateBuffer = buffer.slice(offset + 1, offset + 9);
      return new Date(EPOCH + 1000 * dateBuffer.readDoubleBE(0));
    }

    function parseData() {
      var dataoffset = 1;
      var length = objInfo;

      if (objInfo === 0xF) {
        var int_type = buffer[offset + 1];
        var intType = (int_type & 0xF0) / 0x10;

        if (intType !== 0x1) {
          console.error('0x4: UNEXPECTED LENGTH-INT TYPE! ' + intType);
        }

        var intInfo = int_type & 0x0F;
        var intLength = Math.pow(2, intInfo);
        dataoffset = 2 + intLength;

        if (intLength < 3) {
          length = readUInt(buffer.slice(offset + 2, offset + 2 + intLength));
        } else {
          length = readUInt(buffer.slice(offset + 2, offset + 2 + intLength));
        }
      }

      if (length < exports.maxObjectSize) {
        return buffer.slice(offset + dataoffset, offset + dataoffset + length);
      }

      throw new Error('To little heap space available! Wanted to read ' + length + ' bytes, but only ' + exports.maxObjectSize + ' are available.');
    }

    function parsePlistString(isUtf16) {
      isUtf16 = isUtf16 || 0;
      var enc = 'utf8';
      var length = objInfo;
      var stroffset = 1;

      if (objInfo === 0xF) {
        var int_type = buffer[offset + 1];
        var intType = (int_type & 0xF0) / 0x10;

        if (intType !== 0x1) {
          console.err('UNEXPECTED LENGTH-INT TYPE! ' + intType);
        }

        var intInfo = int_type & 0x0F;
        var intLength = Math.pow(2, intInfo);
        stroffset = 2 + intLength;

        if (intLength < 3) {
          length = readUInt(buffer.slice(offset + 2, offset + 2 + intLength));
        } else {
          length = readUInt(buffer.slice(offset + 2, offset + 2 + intLength));
        }
      } // length is String length -> to get byte length multiply by 2, as 1 character takes 2 bytes in UTF-16


      length *= isUtf16 + 1;

      if (length < exports.maxObjectSize) {
        var plistString = buffer.slice(offset + stroffset, offset + stroffset + length);

        if (isUtf16) {
          plistString = swapBytes(plistString);
          enc = 'ucs2';
        }

        return plistString.toString(enc);
      }

      throw new Error('To little heap space available! Wanted to read ' + length + ' bytes, but only ' + exports.maxObjectSize + ' are available.');
    }

    function parseArray() {
      var length = objInfo;
      var arrayoffset = 1;

      if (objInfo === 0xF) {
        var int_type = buffer[offset + 1];
        var intType = (int_type & 0xF0) / 0x10;

        if (intType !== 0x1) {
          console.error('0xa: UNEXPECTED LENGTH-INT TYPE! ' + intType);
        }

        var intInfo = int_type & 0x0F;
        var intLength = Math.pow(2, intInfo);
        arrayoffset = 2 + intLength;

        if (intLength < 3) {
          length = readUInt(buffer.slice(offset + 2, offset + 2 + intLength));
        } else {
          length = readUInt(buffer.slice(offset + 2, offset + 2 + intLength));
        }
      }

      if (length * objectRefSize > exports.maxObjectSize) {
        throw new Error('To little heap space available!');
      }

      var array = [];

      for (var _i = 0; _i < length; _i++) {
        var objRef = readUInt(buffer.slice(offset + arrayoffset + _i * objectRefSize, offset + arrayoffset + (_i + 1) * objectRefSize));
        array[_i] = parseObject(objRef);
      }

      return array;
    }

    function parseDictionary() {
      var length = objInfo;
      var dictoffset = 1;

      if (objInfo === 0xF) {
        var int_type = buffer[offset + 1];
        var intType = (int_type & 0xF0) / 0x10;

        if (intType !== 0x1) {
          console.error('0xD: UNEXPECTED LENGTH-INT TYPE! ' + intType);
        }

        var intInfo = int_type & 0x0F;
        var intLength = Math.pow(2, intInfo);
        dictoffset = 2 + intLength;

        if (intLength < 3) {
          length = readUInt(buffer.slice(offset + 2, offset + 2 + intLength));
        } else {
          length = readUInt(buffer.slice(offset + 2, offset + 2 + intLength));
        }
      }

      if (length * 2 * objectRefSize > exports.maxObjectSize) {
        throw new Error('To little heap space available!');
      }

      if (debug) {
        console.log('Parsing dictionary #' + tableOffset);
      }

      var dict = {};

      for (var _i2 = 0; _i2 < length; _i2++) {
        var keyRef = readUInt(buffer.slice(offset + dictoffset + _i2 * objectRefSize, offset + dictoffset + (_i2 + 1) * objectRefSize));
        var valRef = readUInt(buffer.slice(offset + dictoffset + length * objectRefSize + _i2 * objectRefSize, offset + dictoffset + length * objectRefSize + (_i2 + 1) * objectRefSize));
        var key = parseObject(keyRef);
        var val = parseObject(valRef);

        if (debug) {
          console.log('  DICT #' + tableOffset + ': Mapped ' + key + ' to ' + val);
        }

        dict[key] = val;
      }

      return dict;
    }
  }

  return [parseObject(topObject)];
};

function readUInt(buffer, start) {
  start = start || 0;
  var l = 0;

  for (var i = start; i < buffer.length; i++) {
    l <<= 8;
    l |= buffer[i] & 0xFF;
  }

  return l;
} // we're just going to toss the high order bits because javascript doesn't have 64-bit ints


function readUInt64BE(buffer, start) {
  var data = buffer.slice(start, start + 8);
  return data.readUInt32BE(4, 8);
}

function swapBytes(buffer) {
  var len = buffer.length;

  for (var i = 0; i < len; i += 2) {
    var a = buffer[i];
    buffer[i] = buffer[i + 1];
    buffer[i + 1] = a;
  }

  return buffer;
}

/***/ }),

/***/ 9251:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var plist = __webpack_require__(6731);

var bplist = __webpack_require__(3843);

exports.parse = function (aStringOrBuffer) {
  var results;
  var firstByte = aStringOrBuffer[0];

  try {
    if (firstByte === 60 || firstByte === '<' || firstByte === 239) {
      results = plist.parse(aStringOrBuffer.toString());
    } else if (firstByte === 98) {
      results = bplist.parseBuffer(aStringOrBuffer)[0];
    } else {
      console.error('Unable to determine format for plist aStringOrBuffer: "%s"', aStringOrBuffer);
      results = {};
    }
  } catch (e) {
    console.error(e);
  }

  return results;
};

/***/ }),

/***/ 6731:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Module dependencies.
 */

var DOMParser = __webpack_require__(6881)/* .DOMParser */ .a;
/**
 * Module exports.
 */


exports.parse = parse;
var TEXT_NODE = 3;
var CDATA_NODE = 4;
var COMMENT_NODE = 8;
/**
 * We ignore raw text (usually whitespace), <!-- xml comments -->,
 * and raw CDATA nodes.
 *
 * @param {Element} node
 * @returns {Boolean}
 * @api private
 */

function shouldIgnoreNode(node) {
  return node.nodeType === TEXT_NODE || node.nodeType === COMMENT_NODE || node.nodeType === CDATA_NODE;
}
/**
 * Check if the node is empty. Some plist file has such node:
 * <key />
 * this node shoud be ignored.
 *
 * @see https://github.com/TooTallNate/plist.js/issues/66
 * @param {Element} node
 * @returns {Boolean}
 * @api private
 */


function isEmptyNode(node) {
  if (!node.childNodes || node.childNodes.length === 0) {
    return true;
  } else {
    return false;
  }
}

function invariant(test, message) {
  if (!test) {
    throw new Error(message);
  }
}
/**
 * Parses a Plist XML string. Returns an Object.
 *
 * @param {String} xml - the XML String to decode
 * @returns {Mixed} the decoded value from the Plist XML
 * @api public
 */


function parse(xml) {
  var doc = new DOMParser().parseFromString(xml);
  invariant(doc.documentElement.nodeName === 'plist', 'malformed document. First element should be <plist>');
  var plist = parsePlistXML(doc.documentElement); // the root <plist> node gets interpreted as an Array,
  // so pull out the inner data first

  if (plist.length === 1) plist = plist[0];
  return plist;
}
/**
 * Convert an XML based plist document into a JSON representation.
 *
 * @param {Object} xml_node - current XML node in the plist
 * @returns {Mixed} built up JSON object
 * @api private
 */


function parsePlistXML(node) {
  var i, new_obj, key, val, new_arr, res, counter, type;
  if (!node) return null;

  if (node.nodeName === 'plist') {
    new_arr = [];

    if (isEmptyNode(node)) {
      return new_arr;
    }

    for (i = 0; i < node.childNodes.length; i++) {
      if (!shouldIgnoreNode(node.childNodes[i])) {
        new_arr.push(parsePlistXML(node.childNodes[i]));
      }
    }

    return new_arr;
  } else if (node.nodeName === 'dict') {
    new_obj = {};
    key = null;
    counter = 0;

    if (isEmptyNode(node)) {
      return new_obj;
    }

    for (i = 0; i < node.childNodes.length; i++) {
      if (shouldIgnoreNode(node.childNodes[i])) continue;

      if (counter % 2 === 0) {
        invariant(node.childNodes[i].nodeName === 'key', 'Missing key while parsing <dict/>.');
        key = parsePlistXML(node.childNodes[i]);
      } else {
        invariant(node.childNodes[i].nodeName !== 'key', 'Unexpected key "' + parsePlistXML(node.childNodes[i]) + '" while parsing <dict/>.');
        new_obj[key] = parsePlistXML(node.childNodes[i]);
      }

      counter += 1;
    }

    if (counter % 2 === 1) {
      throw new Error('Missing value for "' + key + '" while parsing <dict/>');
    }

    return new_obj;
  } else if (node.nodeName === 'array') {
    new_arr = [];

    if (isEmptyNode(node)) {
      return new_arr;
    }

    for (i = 0; i < node.childNodes.length; i++) {
      if (!shouldIgnoreNode(node.childNodes[i])) {
        res = parsePlistXML(node.childNodes[i]);
        if (null != res) new_arr.push(res);
      }
    }

    return new_arr;
  } else if (node.nodeName === '#text') {// TODO: what should we do with text types? (CDATA sections)
  } else if (node.nodeName === 'key') {
    if (isEmptyNode(node)) {
      return '';
    }

    return node.childNodes[0].nodeValue;
  } else if (node.nodeName === 'string') {
    res = '';

    if (isEmptyNode(node)) {
      return res;
    }

    for (i = 0; i < node.childNodes.length; i++) {
      var type = node.childNodes[i].nodeType;

      if (type === TEXT_NODE || type === CDATA_NODE) {
        res += node.childNodes[i].nodeValue;
      }
    }

    return res;
  } else if (node.nodeName === 'integer') {
    invariant(!isEmptyNode(node), 'Cannot parse "" as integer.');
    return parseInt(node.childNodes[0].nodeValue, 10);
  } else if (node.nodeName === 'real') {
    invariant(!isEmptyNode(node), 'Cannot parse "" as real.');
    res = '';

    for (i = 0; i < node.childNodes.length; i++) {
      if (node.childNodes[i].nodeType === TEXT_NODE) {
        res += node.childNodes[i].nodeValue;
      }
    }

    return parseFloat(res);
  } else if (node.nodeName === 'data') {
    res = '';

    if (isEmptyNode(node)) {
      return Buffer.from(res, 'base64');
    }

    for (i = 0; i < node.childNodes.length; i++) {
      if (node.childNodes[i].nodeType === TEXT_NODE) {
        res += node.childNodes[i].nodeValue.replace(/\s+/g, '');
      }
    }

    return Buffer.from(res, 'base64');
  } else if (node.nodeName === 'date') {
    invariant(!isEmptyNode(node), 'Cannot parse "" as Date.');
    return new Date(node.childNodes[0].nodeValue);
  } else if (node.nodeName === 'true') {
    return true;
  } else if (node.nodeName === 'false') {
    return false;
  }
}

/***/ }),

/***/ 7858:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/* global Blob, FileReader */
// Code exacted from https://github.com/feross/blob-to-buffer.
// Because it have not import Buffer module for browser usage.
var Buffer = __webpack_require__(4293).Buffer;

module.exports = function blobToBuffer(blob, cb) {
  if (typeof Blob === 'undefined' || !(blob instanceof Blob)) {
    throw new Error('first argument must be a Blob');
  }

  if (typeof cb !== 'function') {
    throw new Error('second argument must be a function');
  }

  var reader = new FileReader();

  function onLoadEnd(e) {
    reader.removeEventListener('loadend', onLoadEnd, false);
    if (e.error) cb(e.error);else cb(null, new Buffer(reader.result));
  }

  reader.addEventListener('loadend', onLoadEnd, false);
  reader.readAsArrayBuffer(blob);
};

/***/ }),

/***/ 1293:
/***/ ((module) => {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function toArray(arrayLikeObj) {
  if (!arrayLikeObj) return [];
  return Array.prototype.slice.call(arrayLikeObj);
}

function extend(destObject) {
  var args = toArray(arguments);

  if (args.length == 1) {
    return destObject;
  }

  args.shift(); // 从前往后遍历

  for (var i = 0, l = args.length; i < l; i++) {
    for (var key in args[i]) {
      if (args[i].hasOwnProperty(key)) {
        destObject[key] = args[i][key];
      }
    }
  }

  return destObject;
}

function isTypeOf(something, type) {
  if (!type) return false;
  type = type.toLowerCase();
  var realTypeString = Object.prototype.toString.call(something);
  return realTypeString.toLowerCase() === '[object ' + type + ']';
}

function isArray(something) {
  return isTypeOf(something, 'array');
}

function isFunction(something) {
  return typeof something === 'function';
}

function isString(something) {
  return typeof something === 'string';
}

function isDefined(something) {
  return !(typeof something === 'undefined');
}

function isObject(something) {
  return _typeof(something) === 'object';
}

function isReg(something) {
  return isTypeOf(something, 'regexp');
}
/**
 *
 * @param {Function/String/RegExp} rule
 * @param {String}                 entryName
 * @return {Boolean}
 */


function isThisWhatYouNeed(rule, entryName) {
  return isFunction(rule) ? rule(entryName) : isString(rule) ? entryName.toLowerCase().indexOf(rule.toLowerCase()) > -1 : isReg(rule) ? rule.test(entryName.toLowerCase()) : false;
}
/**
 *
 * @param str
 * @param prefix
 * @returns {boolean}
 */


function startWith(str, prefix) {
  return str.indexOf(prefix) === 0;
}

function isResouces(attrValue) {
  return startWith(attrValue, 'resourceId:');
}

function transKeyToMatchResourceMap(resourceId) {
  return '@' + resourceId.replace('resourceId:0x', '').toUpperCase();
}

function castLogger(doWhat, fromWhen) {
  console.log(doWhat + ' cost: ' + (Date.now() - fromWhen) + 'ms');
}

module.exports = {
  toArray: toArray,
  extend: extend,
  startWith: startWith,
  isResouces: isResouces,
  transKeyToMatchResourceMap: transKeyToMatchResourceMap,
  castLogger: castLogger,
  isTypeOf: isTypeOf,
  isArray: isArray,
  isFunction: isFunction,
  isString: isString,
  isDefined: isDefined,
  isObject: isObject,
  isReg: isReg,
  isThisWhatYouNeed: isThisWhatYouNeed
};

/***/ }),

/***/ 7064:
/***/ ((module) => {

"use strict";


/**
 *  From zip.js/z-worker.js, combined with inflate.js, exports as raw string so it can be requied and to use as a blob.
 */
module.exports = 'function inflate(a){"use strict";function w(){function m(a,b,d,h,m,n,o,p,q,r,s){var t,u,w,x,z,A,B,C,E,F,G,H,I,D=0,y=d;do e[a[b+D]]++,D++,y--;while(0!==y);if(e[0]==d)return o[0]=-1,p[0]=0,c;for(B=p[0],z=1;v>=z&&0===e[z];z++);for(A=z,z>B&&(B=z),y=v;0!==y&&0===e[y];y--);for(w=y,B>y&&(B=y),p[0]=B,H=1<<z;y>z;z++,H<<=1)if((H-=e[z])<0)return g;if((H-=e[y])<0)return g;for(e[y]+=H,l[1]=z=0,D=1,G=2;0!==--y;)l[G]=z+=e[D],G++,D++;y=0,D=0;do 0!==(z=a[b+D])&&(s[l[z]++]=y),D++;while(++y<d);for(d=l[w],l[0]=y=0,D=0,x=-1,F=-B,j[0]=0,E=0,I=0;w>=A;A++)for(t=e[A];0!==t--;){for(;A>F+B;){if(x++,F+=B,I=w-F,I=I>B?B:I,(u=1<<(z=A-F))>t+1&&(u-=t+1,G=A,I>z))for(;++z<I&&!((u<<=1)<=e[++G]);)u-=e[G];if(I=1<<z,r[0]+I>k)return g;j[x]=E=r[0],r[0]+=I,0!==x?(l[x]=y,f[0]=z,f[1]=B,z=y>>>F-B,f[2]=E-j[x-1]-z,q.set(f,3*(j[x-1]+z))):o[0]=E}for(f[1]=A-F,D>=d?f[0]=192:s[D]<h?(f[0]=s[D]<256?0:96,f[2]=s[D++]):(f[0]=n[s[D]-h]+16+64,f[2]=m[s[D++]-h]),u=1<<A-F,z=y>>>F;I>z;z+=u)q.set(f,3*(E+z));for(z=1<<A-1;0!==(y&z);z>>>=1)y^=z;for(y^=z,C=(1<<F)-1;(y&C)!=l[x];)x--,F-=B,C=(1<<F)-1}return 0!==H&&1!=w?i:c}function n(a){var c;for(b||(b=[],d=[],e=new Int32Array(v+1),f=[],j=new Int32Array(v),l=new Int32Array(v+1)),d.length<a&&(d=[]),c=0;a>c;c++)d[c]=0;for(c=0;v+1>c;c++)e[c]=0;for(c=0;3>c;c++)f[c]=0;j.set(e.subarray(0,v),0),l.set(e.subarray(0,v+1),0)}var b,d,e,f,j,l,a=this;a.inflate_trees_bits=function(a,c,e,f,h){var j;return n(19),b[0]=0,j=m(a,0,19,19,null,null,e,c,f,b,d),j==g?h.msg="oversubscribed dynamic bit lengths tree":(j==i||0===c[0])&&(h.msg="incomplete dynamic bit lengths tree",j=g),j},a.inflate_trees_dynamic=function(a,e,f,j,k,l,o,p,q){var v;return n(288),b[0]=0,v=m(f,0,a,257,r,s,l,j,p,b,d),v!=c||0===j[0]?(v==g?q.msg="oversubscribed literal/length tree":v!=h&&(q.msg="incomplete literal/length tree",v=g),v):(n(288),v=m(f,a,e,0,t,u,o,k,p,b,d),v!=c||0===k[0]&&a>257?(v==g?q.msg="oversubscribed distance tree":v==i?(q.msg="incomplete distance tree",v=g):v!=h&&(q.msg="empty distance tree with lengths",v=g),v):c)}}function H(){function u(a,b,e,f,h,i,k,l){var m,n,o,p,y,z,A,B,s=l.next_in_index,t=l.avail_in,q=k.bitb,r=k.bitk,u=k.write,v=u<k.read?k.read-u-1:k.end-u,w=j[a],x=j[b];do{for(;20>r;)t--,q|=(255&l.read_byte(s++))<<r,r+=8;if(m=q&w,n=e,o=f,B=3*(o+m),0!==(p=n[B]))for(;;){if(q>>=n[B+1],r-=n[B+1],0!==(16&p)){for(p&=15,y=n[B+2]+(q&j[p]),q>>=p,r-=p;15>r;)t--,q|=(255&l.read_byte(s++))<<r,r+=8;for(m=q&x,n=h,o=i,B=3*(o+m),p=n[B];;){if(q>>=n[B+1],r-=n[B+1],0!==(16&p)){for(p&=15;p>r;)t--,q|=(255&l.read_byte(s++))<<r,r+=8;if(z=n[B+2]+(q&j[p]),q>>=p,r-=p,v-=y,u>=z)A=u-z,u-A>0&&2>u-A?(k.window[u++]=k.window[A++],k.window[u++]=k.window[A++],y-=2):(k.window.set(k.window.subarray(A,A+2),u),u+=2,A+=2,y-=2);else{A=u-z;do A+=k.end;while(0>A);if(p=k.end-A,y>p){if(y-=p,u-A>0&&p>u-A){do k.window[u++]=k.window[A++];while(0!==--p)}else k.window.set(k.window.subarray(A,A+p),u),u+=p,A+=p,p=0;A=0}}if(u-A>0&&y>u-A){do k.window[u++]=k.window[A++];while(0!==--y)}else k.window.set(k.window.subarray(A,A+y),u),u+=y,A+=y,y=0;break}if(0!==(64&p))return l.msg="invalid distance code",y=l.avail_in-t,y=y>r>>3?r>>3:y,t+=y,s-=y,r-=y<<3,k.bitb=q,k.bitk=r,l.avail_in=t,l.total_in+=s-l.next_in_index,l.next_in_index=s,k.write=u,g;m+=n[B+2],m+=q&j[p],B=3*(o+m),p=n[B]}break}if(0!==(64&p))return 0!==(32&p)?(y=l.avail_in-t,y=y>r>>3?r>>3:y,t+=y,s-=y,r-=y<<3,k.bitb=q,k.bitk=r,l.avail_in=t,l.total_in+=s-l.next_in_index,l.next_in_index=s,k.write=u,d):(l.msg="invalid literal/length code",y=l.avail_in-t,y=y>r>>3?r>>3:y,t+=y,s-=y,r-=y<<3,k.bitb=q,k.bitk=r,l.avail_in=t,l.total_in+=s-l.next_in_index,l.next_in_index=s,k.write=u,g);if(m+=n[B+2],m+=q&j[p],B=3*(o+m),0===(p=n[B])){q>>=n[B+1],r-=n[B+1],k.window[u++]=n[B+2],v--;break}}else q>>=n[B+1],r-=n[B+1],k.window[u++]=n[B+2],v--}while(v>=258&&t>=10);return y=l.avail_in-t,y=y>r>>3?r>>3:y,t+=y,s-=y,r-=y<<3,k.bitb=q,k.bitk=r,l.avail_in=t,l.total_in+=s-l.next_in_index,l.next_in_index=s,k.write=u,c}var b,h,q,s,a=this,e=0,i=0,k=0,l=0,m=0,n=0,o=0,p=0,r=0,t=0;a.init=function(a,c,d,e,f,g){b=x,o=a,p=c,q=d,r=e,s=f,t=g,h=null},a.proc=function(a,v,w){var H,I,J,N,O,P,Q,K=0,L=0,M=0;for(M=v.next_in_index,N=v.avail_in,K=a.bitb,L=a.bitk,O=a.write,P=O<a.read?a.read-O-1:a.end-O;;)switch(b){case x:if(P>=258&&N>=10&&(a.bitb=K,a.bitk=L,v.avail_in=N,v.total_in+=M-v.next_in_index,v.next_in_index=M,a.write=O,w=u(o,p,q,r,s,t,a,v),M=v.next_in_index,N=v.avail_in,K=a.bitb,L=a.bitk,O=a.write,P=O<a.read?a.read-O-1:a.end-O,w!=c)){b=w==d?E:G;break}k=o,h=q,i=r,b=y;case y:for(H=k;H>L;){if(0===N)return a.bitb=K,a.bitk=L,v.avail_in=N,v.total_in+=M-v.next_in_index,v.next_in_index=M,a.write=O,a.inflate_flush(v,w);w=c,N--,K|=(255&v.read_byte(M++))<<L,L+=8}if(I=3*(i+(K&j[H])),K>>>=h[I+1],L-=h[I+1],J=h[I],0===J){l=h[I+2],b=D;break}if(0!==(16&J)){m=15&J,e=h[I+2],b=z;break}if(0===(64&J)){k=J,i=I/3+h[I+2];break}if(0!==(32&J)){b=E;break}return b=G,v.msg="invalid literal/length code",w=g,a.bitb=K,a.bitk=L,v.avail_in=N,v.total_in+=M-v.next_in_index,v.next_in_index=M,a.write=O,a.inflate_flush(v,w);case z:for(H=m;H>L;){if(0===N)return a.bitb=K,a.bitk=L,v.avail_in=N,v.total_in+=M-v.next_in_index,v.next_in_index=M,a.write=O,a.inflate_flush(v,w);w=c,N--,K|=(255&v.read_byte(M++))<<L,L+=8}e+=K&j[H],K>>=H,L-=H,k=p,h=s,i=t,b=A;case A:for(H=k;H>L;){if(0===N)return a.bitb=K,a.bitk=L,v.avail_in=N,v.total_in+=M-v.next_in_index,v.next_in_index=M,a.write=O,a.inflate_flush(v,w);w=c,N--,K|=(255&v.read_byte(M++))<<L,L+=8}if(I=3*(i+(K&j[H])),K>>=h[I+1],L-=h[I+1],J=h[I],0!==(16&J)){m=15&J,n=h[I+2],b=B;break}if(0===(64&J)){k=J,i=I/3+h[I+2];break}return b=G,v.msg="invalid distance code",w=g,a.bitb=K,a.bitk=L,v.avail_in=N,v.total_in+=M-v.next_in_index,v.next_in_index=M,a.write=O,a.inflate_flush(v,w);case B:for(H=m;H>L;){if(0===N)return a.bitb=K,a.bitk=L,v.avail_in=N,v.total_in+=M-v.next_in_index,v.next_in_index=M,a.write=O,a.inflate_flush(v,w);w=c,N--,K|=(255&v.read_byte(M++))<<L,L+=8}n+=K&j[H],K>>=H,L-=H,b=C;case C:for(Q=O-n;0>Q;)Q+=a.end;for(;0!==e;){if(0===P&&(O==a.end&&0!==a.read&&(O=0,P=O<a.read?a.read-O-1:a.end-O),0===P&&(a.write=O,w=a.inflate_flush(v,w),O=a.write,P=O<a.read?a.read-O-1:a.end-O,O==a.end&&0!==a.read&&(O=0,P=O<a.read?a.read-O-1:a.end-O),0===P)))return a.bitb=K,a.bitk=L,v.avail_in=N,v.total_in+=M-v.next_in_index,v.next_in_index=M,a.write=O,a.inflate_flush(v,w);a.window[O++]=a.window[Q++],P--,Q==a.end&&(Q=0),e--}b=x;break;case D:if(0===P&&(O==a.end&&0!==a.read&&(O=0,P=O<a.read?a.read-O-1:a.end-O),0===P&&(a.write=O,w=a.inflate_flush(v,w),O=a.write,P=O<a.read?a.read-O-1:a.end-O,O==a.end&&0!==a.read&&(O=0,P=O<a.read?a.read-O-1:a.end-O),0===P)))return a.bitb=K,a.bitk=L,v.avail_in=N,v.total_in+=M-v.next_in_index,v.next_in_index=M,a.write=O,a.inflate_flush(v,w);w=c,a.window[O++]=l,P--,b=x;break;case E:if(L>7&&(L-=8,N++,M--),a.write=O,w=a.inflate_flush(v,w),O=a.write,P=O<a.read?a.read-O-1:a.end-O,a.read!=a.write)return a.bitb=K,a.bitk=L,v.avail_in=N,v.total_in+=M-v.next_in_index,v.next_in_index=M,a.write=O,a.inflate_flush(v,w);b=F;case F:return w=d,a.bitb=K,a.bitk=L,v.avail_in=N,v.total_in+=M-v.next_in_index,v.next_in_index=M,a.write=O,a.inflate_flush(v,w);case G:return w=g,a.bitb=K,a.bitk=L,v.avail_in=N,v.total_in+=M-v.next_in_index,v.next_in_index=M,a.write=O,a.inflate_flush(v,w);default:return w=f,a.bitb=K,a.bitk=L,v.avail_in=N,v.total_in+=M-v.next_in_index,v.next_in_index=M,a.write=O,a.inflate_flush(v,w)}},a.free=function(){}}function T(a,b){var o,e=this,h=J,l=0,m=0,n=0,p=[0],q=[0],r=new H,s=0,t=new Int32Array(3*k),u=0,v=new w;e.bitk=0,e.bitb=0,e.window=new Uint8Array(b),e.end=b,e.read=0,e.write=0,e.reset=function(a,b){b&&(b[0]=u),h==P&&r.free(a),h=J,e.bitk=0,e.bitb=0,e.read=e.write=0},e.reset(a,null),e.inflate_flush=function(a,b){var f=a.next_out_index,g=e.read,d=(g<=e.write?e.write:e.end)-g;return d>a.avail_out&&(d=a.avail_out),0!==d&&b==i&&(b=c),a.avail_out-=d,a.total_out+=d,a.next_out.set(e.window.subarray(g,g+d),f),f+=d,g+=d,g==e.end&&(g=0,e.write==e.end&&(e.write=0),d=e.write-g,d>a.avail_out&&(d=a.avail_out),0!==d&&b==i&&(b=c),a.avail_out-=d,a.total_out+=d,a.next_out.set(e.window.subarray(g,g+d),f),f+=d,g+=d),a.next_out_index=f,e.read=g,b},e.proc=function(a,b){for(var i,B,C,D,E,F,G,H,T,U,V,W,x=a.next_in_index,y=a.avail_in,k=e.bitb,u=e.bitk,z=e.write,A=z<e.read?e.read-z-1:e.end-z;;)switch(h){case J:for(;3>u;){if(0===y)return e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b);b=c,y--,k|=(255&a.read_byte(x++))<<u,u+=8}switch(i=7&k,s=1&i,i>>>1){case 0:k>>>=3,u-=3,i=7&u,k>>>=i,u-=i,h=K;break;case 1:C=[],D=[],E=[[]],F=[[]],w.inflate_trees_fixed(C,D,E,F),r.init(C[0],D[0],E[0],0,F[0],0),k>>>=3,u-=3,h=P;break;case 2:k>>>=3,u-=3,h=M;break;case 3:return k>>>=3,u-=3,h=S,a.msg="invalid block type",b=g,e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b)}break;case K:for(;32>u;){if(0===y)return e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b);b=c,y--,k|=(255&a.read_byte(x++))<<u,u+=8}if((65535&~k>>>16)!=(65535&k))return h=S,a.msg="invalid stored block lengths",b=g,e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b);l=65535&k,k=u=0,h=0!==l?L:0!==s?Q:J;break;case L:if(0===y)return e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b);if(0===A&&(z==e.end&&0!==e.read&&(z=0,A=z<e.read?e.read-z-1:e.end-z),0===A&&(e.write=z,b=e.inflate_flush(a,b),z=e.write,A=z<e.read?e.read-z-1:e.end-z,z==e.end&&0!==e.read&&(z=0,A=z<e.read?e.read-z-1:e.end-z),0===A)))return e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b);if(b=c,i=l,i>y&&(i=y),i>A&&(i=A),e.window.set(a.read_buf(x,i),z),x+=i,y-=i,z+=i,A-=i,0!==(l-=i))break;h=0!==s?Q:J;break;case M:for(;14>u;){if(0===y)return e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b);b=c,y--,k|=(255&a.read_byte(x++))<<u,u+=8}if(m=i=16383&k,(31&i)>29||(31&i>>5)>29)return h=S,a.msg="too many length or distance symbols",b=g,e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b);if(i=258+(31&i)+(31&i>>5),!o||o.length<i)o=[];else for(B=0;i>B;B++)o[B]=0;k>>>=14,u-=14,n=0,h=N;case N:for(;4+(m>>>10)>n;){for(;3>u;){if(0===y)return e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b);b=c,y--,k|=(255&a.read_byte(x++))<<u,u+=8}o[I[n++]]=7&k,k>>>=3,u-=3}for(;19>n;)o[I[n++]]=0;if(p[0]=7,i=v.inflate_trees_bits(o,p,q,t,a),i!=c)return b=i,b==g&&(o=null,h=S),e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b);n=0,h=O;case O:for(;;){if(i=m,n>=258+(31&i)+(31&i>>5))break;for(i=p[0];i>u;){if(0===y)return e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b);b=c,y--,k|=(255&a.read_byte(x++))<<u,u+=8}if(i=t[3*(q[0]+(k&j[i]))+1],H=t[3*(q[0]+(k&j[i]))+2],16>H)k>>>=i,u-=i,o[n++]=H;else{for(B=18==H?7:H-14,G=18==H?11:3;i+B>u;){if(0===y)return e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b);b=c,y--,k|=(255&a.read_byte(x++))<<u,u+=8}if(k>>>=i,u-=i,G+=k&j[B],k>>>=B,u-=B,B=n,i=m,B+G>258+(31&i)+(31&i>>5)||16==H&&1>B)return o=null,h=S,a.msg="invalid bit length repeat",b=g,e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b);H=16==H?o[B-1]:0;do o[B++]=H;while(0!==--G);n=B}}if(q[0]=-1,T=[],U=[],V=[],W=[],T[0]=9,U[0]=6,i=m,i=v.inflate_trees_dynamic(257+(31&i),1+(31&i>>5),o,T,U,V,W,t,a),i!=c)return i==g&&(o=null,h=S),b=i,e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b);r.init(T[0],U[0],t,V[0],t,W[0]),h=P;case P:if(e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,(b=r.proc(e,a,b))!=d)return e.inflate_flush(a,b);if(b=c,r.free(a),x=a.next_in_index,y=a.avail_in,k=e.bitb,u=e.bitk,z=e.write,A=z<e.read?e.read-z-1:e.end-z,0===s){h=J;break}h=Q;case Q:if(e.write=z,b=e.inflate_flush(a,b),z=e.write,A=z<e.read?e.read-z-1:e.end-z,e.read!=e.write)return e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b);h=R;case R:return b=d,e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b);case S:return b=g,e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b);default:return b=f,e.bitb=k,e.bitk=u,a.avail_in=y,a.total_in+=x-a.next_in_index,a.next_in_index=x,e.write=z,e.inflate_flush(a,b)}},e.free=function(a){e.reset(a,null),e.window=null,t=null},e.set_dictionary=function(a,b,c){e.window.set(a.subarray(b,b+c),0),e.read=e.write=c},e.sync_point=function(){return h==K?1:0}}function fb(){function b(a){return a&&a.istate?(a.total_in=a.total_out=0,a.msg=null,a.istate.mode=bb,a.istate.blocks.reset(a,null),c):f}var a=this;a.mode=0,a.method=0,a.was=[0],a.need=0,a.marker=0,a.wbits=0,a.inflateEnd=function(b){return a.blocks&&a.blocks.free(b),a.blocks=null,c},a.inflateInit=function(d,e){return d.msg=null,a.blocks=null,8>e||e>15?(a.inflateEnd(d),f):(a.wbits=e,d.istate.blocks=new T(d,1<<e),b(d),c)},a.inflate=function(a,b){var h,j;if(!a||!a.istate||!a.next_in)return f;for(b=b==m?i:c,h=i;;)switch(a.istate.mode){case W:if(0===a.avail_in)return h;if(h=b,a.avail_in--,a.total_in++,(15&(a.istate.method=a.read_byte(a.next_in_index++)))!=V){a.istate.mode=db,a.msg="unknown compression method",a.istate.marker=5;break}if((a.istate.method>>4)+8>a.istate.wbits){a.istate.mode=db,a.msg="invalid window size",a.istate.marker=5;break}a.istate.mode=X;case X:if(0===a.avail_in)return h;if(h=b,a.avail_in--,a.total_in++,j=255&a.read_byte(a.next_in_index++),0!==((a.istate.method<<8)+j)%31){a.istate.mode=db,a.msg="incorrect header check",a.istate.marker=5;break}if(0===(j&U)){a.istate.mode=bb;break}a.istate.mode=Y;case Y:if(0===a.avail_in)return h;h=b,a.avail_in--,a.total_in++,a.istate.need=4278190080&(255&a.read_byte(a.next_in_index++))<<24,a.istate.mode=Z;case Z:if(0===a.avail_in)return h;h=b,a.avail_in--,a.total_in++,a.istate.need+=16711680&(255&a.read_byte(a.next_in_index++))<<16,a.istate.mode=$;case $:if(0===a.avail_in)return h;h=b,a.avail_in--,a.total_in++,a.istate.need+=65280&(255&a.read_byte(a.next_in_index++))<<8,a.istate.mode=_;case _:return 0===a.avail_in?h:(h=b,a.avail_in--,a.total_in++,a.istate.need+=255&a.read_byte(a.next_in_index++),a.istate.mode=ab,e);case ab:return a.istate.mode=db,a.msg="need dictionary",a.istate.marker=0,f;case bb:if(h=a.istate.blocks.proc(a,h),h==g){a.istate.mode=db,a.istate.marker=0;break}if(h==c&&(h=b),h!=d)return h;h=b,a.istate.blocks.reset(a,a.istate.was),a.istate.mode=cb;case cb:return d;case db:return g;default:return f}},a.inflateSetDictionary=function(a,b,d){var e=0,g=d;return a&&a.istate&&a.istate.mode==ab?(g>=1<<a.istate.wbits&&(g=(1<<a.istate.wbits)-1,e=d-g),a.istate.blocks.set_dictionary(b,e,g),a.istate.mode=bb,c):f},a.inflateSync=function(a){var d,e,h,j,k;if(!a||!a.istate)return f;if(a.istate.mode!=db&&(a.istate.mode=db,a.istate.marker=0),0===(d=a.avail_in))return i;for(e=a.next_in_index,h=a.istate.marker;0!==d&&4>h;)a.read_byte(e)==eb[h]?h++:h=0!==a.read_byte(e)?0:4-h,e++,d--;return a.total_in+=e-a.next_in_index,a.next_in_index=e,a.avail_in=d,a.istate.marker=h,4!=h?g:(j=a.total_in,k=a.total_out,b(a),a.total_in=j,a.total_out=k,a.istate.mode=bb,c)},a.inflateSyncPoint=function(a){return a&&a.istate&&a.istate.blocks?a.istate.blocks.sync_point():f}}function gb(){}function hb(){var a=this,b=new gb,e=512,f=l,g=new Uint8Array(e),h=!1;b.inflateInit(),b.next_out=g,a.append=function(a,j){var k,p,l=[],m=0,n=0,o=0;if(0!==a.length){b.next_in_index=0,b.next_in=a,b.avail_in=a.length;do{if(b.next_out_index=0,b.avail_out=e,0!==b.avail_in||h||(b.next_in_index=0,h=!0),k=b.inflate(f),h&&k===i){if(0!==b.avail_in)throw new Error("inflating: bad input")}else if(k!==c&&k!==d)throw new Error("inflating: "+b.msg);if((h||k===d)&&b.avail_in===a.length)throw new Error("inflating: bad input");b.next_out_index&&(b.next_out_index===e?l.push(new Uint8Array(g)):l.push(new Uint8Array(g.subarray(0,b.next_out_index)))),o+=b.next_out_index,j&&b.next_in_index>0&&b.next_in_index!=m&&(j(b.next_in_index),m=b.next_in_index)}while(b.avail_in>0||0===b.avail_out);return p=new Uint8Array(o),l.forEach(function(a){p.set(a,n),n+=a.length}),p}},a.flush=function(){b.inflateEnd()}}var x,y,z,A,B,C,D,E,F,G,I,J,K,L,M,N,O,P,Q,R,S,U,V,W,X,Y,Z,$,_,ab,bb,cb,db,eb,ib,b=15,c=0,d=1,e=2,f=-2,g=-3,h=-4,i=-5,j=[0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535],k=1440,l=0,m=4,n=9,o=5,p=[96,7,256,0,8,80,0,8,16,84,8,115,82,7,31,0,8,112,0,8,48,0,9,192,80,7,10,0,8,96,0,8,32,0,9,160,0,8,0,0,8,128,0,8,64,0,9,224,80,7,6,0,8,88,0,8,24,0,9,144,83,7,59,0,8,120,0,8,56,0,9,208,81,7,17,0,8,104,0,8,40,0,9,176,0,8,8,0,8,136,0,8,72,0,9,240,80,7,4,0,8,84,0,8,20,85,8,227,83,7,43,0,8,116,0,8,52,0,9,200,81,7,13,0,8,100,0,8,36,0,9,168,0,8,4,0,8,132,0,8,68,0,9,232,80,7,8,0,8,92,0,8,28,0,9,152,84,7,83,0,8,124,0,8,60,0,9,216,82,7,23,0,8,108,0,8,44,0,9,184,0,8,12,0,8,140,0,8,76,0,9,248,80,7,3,0,8,82,0,8,18,85,8,163,83,7,35,0,8,114,0,8,50,0,9,196,81,7,11,0,8,98,0,8,34,0,9,164,0,8,2,0,8,130,0,8,66,0,9,228,80,7,7,0,8,90,0,8,26,0,9,148,84,7,67,0,8,122,0,8,58,0,9,212,82,7,19,0,8,106,0,8,42,0,9,180,0,8,10,0,8,138,0,8,74,0,9,244,80,7,5,0,8,86,0,8,22,192,8,0,83,7,51,0,8,118,0,8,54,0,9,204,81,7,15,0,8,102,0,8,38,0,9,172,0,8,6,0,8,134,0,8,70,0,9,236,80,7,9,0,8,94,0,8,30,0,9,156,84,7,99,0,8,126,0,8,62,0,9,220,82,7,27,0,8,110,0,8,46,0,9,188,0,8,14,0,8,142,0,8,78,0,9,252,96,7,256,0,8,81,0,8,17,85,8,131,82,7,31,0,8,113,0,8,49,0,9,194,80,7,10,0,8,97,0,8,33,0,9,162,0,8,1,0,8,129,0,8,65,0,9,226,80,7,6,0,8,89,0,8,25,0,9,146,83,7,59,0,8,121,0,8,57,0,9,210,81,7,17,0,8,105,0,8,41,0,9,178,0,8,9,0,8,137,0,8,73,0,9,242,80,7,4,0,8,85,0,8,21,80,8,258,83,7,43,0,8,117,0,8,53,0,9,202,81,7,13,0,8,101,0,8,37,0,9,170,0,8,5,0,8,133,0,8,69,0,9,234,80,7,8,0,8,93,0,8,29,0,9,154,84,7,83,0,8,125,0,8,61,0,9,218,82,7,23,0,8,109,0,8,45,0,9,186,0,8,13,0,8,141,0,8,77,0,9,250,80,7,3,0,8,83,0,8,19,85,8,195,83,7,35,0,8,115,0,8,51,0,9,198,81,7,11,0,8,99,0,8,35,0,9,166,0,8,3,0,8,131,0,8,67,0,9,230,80,7,7,0,8,91,0,8,27,0,9,150,84,7,67,0,8,123,0,8,59,0,9,214,82,7,19,0,8,107,0,8,43,0,9,182,0,8,11,0,8,139,0,8,75,0,9,246,80,7,5,0,8,87,0,8,23,192,8,0,83,7,51,0,8,119,0,8,55,0,9,206,81,7,15,0,8,103,0,8,39,0,9,174,0,8,7,0,8,135,0,8,71,0,9,238,80,7,9,0,8,95,0,8,31,0,9,158,84,7,99,0,8,127,0,8,63,0,9,222,82,7,27,0,8,111,0,8,47,0,9,190,0,8,15,0,8,143,0,8,79,0,9,254,96,7,256,0,8,80,0,8,16,84,8,115,82,7,31,0,8,112,0,8,48,0,9,193,80,7,10,0,8,96,0,8,32,0,9,161,0,8,0,0,8,128,0,8,64,0,9,225,80,7,6,0,8,88,0,8,24,0,9,145,83,7,59,0,8,120,0,8,56,0,9,209,81,7,17,0,8,104,0,8,40,0,9,177,0,8,8,0,8,136,0,8,72,0,9,241,80,7,4,0,8,84,0,8,20,85,8,227,83,7,43,0,8,116,0,8,52,0,9,201,81,7,13,0,8,100,0,8,36,0,9,169,0,8,4,0,8,132,0,8,68,0,9,233,80,7,8,0,8,92,0,8,28,0,9,153,84,7,83,0,8,124,0,8,60,0,9,217,82,7,23,0,8,108,0,8,44,0,9,185,0,8,12,0,8,140,0,8,76,0,9,249,80,7,3,0,8,82,0,8,18,85,8,163,83,7,35,0,8,114,0,8,50,0,9,197,81,7,11,0,8,98,0,8,34,0,9,165,0,8,2,0,8,130,0,8,66,0,9,229,80,7,7,0,8,90,0,8,26,0,9,149,84,7,67,0,8,122,0,8,58,0,9,213,82,7,19,0,8,106,0,8,42,0,9,181,0,8,10,0,8,138,0,8,74,0,9,245,80,7,5,0,8,86,0,8,22,192,8,0,83,7,51,0,8,118,0,8,54,0,9,205,81,7,15,0,8,102,0,8,38,0,9,173,0,8,6,0,8,134,0,8,70,0,9,237,80,7,9,0,8,94,0,8,30,0,9,157,84,7,99,0,8,126,0,8,62,0,9,221,82,7,27,0,8,110,0,8,46,0,9,189,0,8,14,0,8,142,0,8,78,0,9,253,96,7,256,0,8,81,0,8,17,85,8,131,82,7,31,0,8,113,0,8,49,0,9,195,80,7,10,0,8,97,0,8,33,0,9,163,0,8,1,0,8,129,0,8,65,0,9,227,80,7,6,0,8,89,0,8,25,0,9,147,83,7,59,0,8,121,0,8,57,0,9,211,81,7,17,0,8,105,0,8,41,0,9,179,0,8,9,0,8,137,0,8,73,0,9,243,80,7,4,0,8,85,0,8,21,80,8,258,83,7,43,0,8,117,0,8,53,0,9,203,81,7,13,0,8,101,0,8,37,0,9,171,0,8,5,0,8,133,0,8,69,0,9,235,80,7,8,0,8,93,0,8,29,0,9,155,84,7,83,0,8,125,0,8,61,0,9,219,82,7,23,0,8,109,0,8,45,0,9,187,0,8,13,0,8,141,0,8,77,0,9,251,80,7,3,0,8,83,0,8,19,85,8,195,83,7,35,0,8,115,0,8,51,0,9,199,81,7,11,0,8,99,0,8,35,0,9,167,0,8,3,0,8,131,0,8,67,0,9,231,80,7,7,0,8,91,0,8,27,0,9,151,84,7,67,0,8,123,0,8,59,0,9,215,82,7,19,0,8,107,0,8,43,0,9,183,0,8,11,0,8,139,0,8,75,0,9,247,80,7,5,0,8,87,0,8,23,192,8,0,83,7,51,0,8,119,0,8,55,0,9,207,81,7,15,0,8,103,0,8,39,0,9,175,0,8,7,0,8,135,0,8,71,0,9,239,80,7,9,0,8,95,0,8,31,0,9,159,84,7,99,0,8,127,0,8,63,0,9,223,82,7,27,0,8,111,0,8,47,0,9,191,0,8,15,0,8,143,0,8,79,0,9,255],q=[80,5,1,87,5,257,83,5,17,91,5,4097,81,5,5,89,5,1025,85,5,65,93,5,16385,80,5,3,88,5,513,84,5,33,92,5,8193,82,5,9,90,5,2049,86,5,129,192,5,24577,80,5,2,87,5,385,83,5,25,91,5,6145,81,5,7,89,5,1537,85,5,97,93,5,24577,80,5,4,88,5,769,84,5,49,92,5,12289,82,5,13,90,5,3073,86,5,193,192,5,24577],r=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],s=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,112,112],t=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],u=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],v=15;w.inflate_trees_fixed=function(a,b,d,e){return a[0]=n,b[0]=o,d[0]=p,e[0]=q,c},x=0,y=1,z=2,A=3,B=4,C=5,D=6,E=7,F=8,G=9,I=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],J=0,K=1,L=2,M=3,N=4,O=5,P=6,Q=7,R=8,S=9,U=32,V=8,W=0,X=1,Y=2,Z=3,$=4,_=5,ab=6,bb=7,cb=12,db=13,eb=[0,0,255,255],gb.prototype={inflateInit:function(a){var c=this;return c.istate=new fb,a||(a=b),c.istate.inflateInit(c,a)},inflate:function(a){var b=this;return b.istate?b.istate.inflate(b,a):f},inflateEnd:function(){var b,a=this;return a.istate?(b=a.istate.inflateEnd(a),a.istate=null,b):f},inflateSync:function(){var a=this;return a.istate?a.istate.inflateSync(a):f},inflateSetDictionary:function(a,b){var c=this;return c.istate?c.istate.inflateSetDictionary(c,a,b):f},read_byte:function(a){var b=this;return b.next_in.subarray(a,a+1)[0]},read_buf:function(a,b){var c=this;return c.next_in.subarray(a,a+b)}},ib=a.zip||a,ib.Inflater=ib._jzlib_Inflater=hb}!function(a){"use strict";function d(){inflate(a),postMessage({type:"importScripts"})}function e(b){var d=a[b.codecClass],e=b.sn;if(c[e])throw Error("duplicated sn");c[e]={codec:new d(b.options),crcInput:"input"===b.crcType,crcOutput:"output"===b.crcType,crc:new j},postMessage({type:"newTask",sn:e})}function g(a){var i,j,k,m,n,o,p,b=a.sn,d=a.type,g=a.data,h=c[b];if(!h&&a.codecClass&&(e(a),h=c[b]),i="append"===d,j=f(),i)try{k=h.codec.append(g,function(a){postMessage({type:"progress",sn:b,loaded:a})})}catch(l){throw delete c[b],l}else delete c[b],k=h.codec.flush();m=f()-j,j=f(),g&&h.crcInput&&h.crc.append(g),k&&h.crcOutput&&h.crc.append(k),n=f()-j,o={type:d,sn:b,codecTime:m,crcTime:n},p=[],k&&(o.data=k,p.push(k.buffer)),i||!h.crcInput&&!h.crcOutput||(o.crc=h.crc.get());try{postMessage(o,p)}catch(q){postMessage(o)}}function h(a,b,c){var d={type:a,sn:b,error:i(c)};postMessage(d)}function i(a){return{message:a.message,stack:a.stack}}function j(){this.crc=-1}function k(){}var b,c,f;if(a.zWorkerInitialized)throw new Error("z-worker.js should be run only once");a.zWorkerInitialized=!0,addEventListener("message",function(a){var c=a.data,d=c.type,e=c.sn,f=b[d];if(f)try{f(c)}catch(g){h(d,e,g)}postMessage({type:"echo",originalType:d,sn:e})}),b={importScripts:d,newTask:e,append:g,flush:g},c={},f=a.performance?a.performance.now.bind(a.performance):Date.now,j.prototype.append=function(a){var d,e,b=0|this.crc,c=this.table;for(d=0,e=0|a.length;e>d;d++)b=b>>>8^c[255&(b^a[d])];this.crc=b},j.prototype.get=function(){return~this.crc},j.prototype.table=function(){var a,b,c,d=[];for(a=0;256>a;a++){for(c=a,b=0;8>b;b++)1&c?c=3988292384^c>>>1:c>>>=1;d[a]=c}return d}(),a.NOOP=k,k.prototype.append=function(a){return a},k.prototype.flush=function(){}}(this);';

/***/ }),

/***/ 2988:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var zip = __webpack_require__(5623);

var blobToBuffer = __webpack_require__(7858);

var utils = __webpack_require__(1293);

function Unzip(file
/* or blob */
) {
  if (!(file instanceof Blob)) {
    throw new Error('Invalid input, expect the first param to be a File/Blob.');
  }

  if (!(this instanceof Unzip)) return new Unzip(file);
  this.file = file;
}

Unzip.prototype.destroy = function () {
  this.file = null;
};
/**
 *
 * @param {Array<String>} whatYouNeed
 * @param {Object} options       (Optional)
 * @param {String} options.type  Currently, only support 'blob', by default it will return Buffers
 * @param {Boolean} options.multiple If true, it will collect all the file which match the whtaYouNeed rule
 * @param callback Will be called like callback(err, buffers)
 */


Unzip.prototype.getBuffer = function (whatYouNeed, options, callback) {
  if (!utils.isArray(whatYouNeed) || !utils.isFunction(callback)) {
    return callback(new Error('getBuffer: invalid param, expect first param to be an Array and the second param to be a callback function'));
  }

  if (utils.isFunction(options)) {
    callback = options;
    options = {};
  }

  whatYouNeed = whatYouNeed.map(function (rule) {
    if (typeof rule === 'string') {
      rule = rule.split("\0").join('');
    }

    return rule;
  });
  var isMultiple = options && options.multiple || false;
  this.getEntries(function (error, entries) {
    if (error) return callback(error);
    var matchedEntries = {};
    entries.forEach(function (entry) {
      // Add regexp support
      return whatYouNeed.some(function (entryName) {
        if (utils.isThisWhatYouNeed(entryName, entry.filename)) {
          if (isMultiple) {
            var obj = {
              fileName: entryName,
              buffer: entry
            };
            matchedEntries[entryName] ? matchedEntries[entryName].push(obj) : matchedEntries[entryName] = [obj];
          } else {
            matchedEntries[entryName] = entry;
          }

          return true;
        }
      });
    });
    iterator(matchedEntries, options, function (error, bufferArray) {
      callback(error, bufferArray, entries.length);
    });
  });
};

Unzip.prototype.getEntries = function (callback) {
  zip.createReader(new zip.BlobReader(this.file), function (zipReader) {
    zipReader.getEntries(function (entries) {
      callback(null, entries, entries.length);
    });
  }, callback);
};

Unzip.getEntryData = function (entry, callback) {
  var writerType = 'blob';
  var writer = new zip.BlobWriter();
  entry.getData(writer, function (blob) {
    callback(null, blob, entry.length);
  });
};

function iterator(entries, options, callback) {
  var output = {};
  var serialize = [];
  var index = 0;

  for (var entryName in entries) {
    serialize.push({
      name: entryName,
      entry: entries[entryName]
    });
  }

  if (!serialize.length) {
    callback(null, {}, serialize.length);
  }

  serialize.forEach(function (entryInfo) {
    (function (name, entry) {
      Unzip.getEntryData(entry, function (err, blob) {
        if (err) return callback(err);

        if (options.type === 'blob') {
          add(name, blob);

          if (index >= serialize.length) {
            callback(null, output, serialize.length);
          }
        } else {
          blobToBuffer(blob, function (error, buffer) {
            if (error) {
              console.error(error);
              return callback(error);
            }

            add(name, buffer);

            if (index >= serialize.length) {
              callback(null, output, serialize.length);
            }
          });
        }
      });
    })(entryInfo.name, entryInfo.entry);
  });

  function add(name, data) {
    index++;
    output[name] = data;
  }
}

module.exports = Unzip;

/***/ }),

/***/ 5039:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var yauzl = __webpack_require__(8781);

var utils = __webpack_require__(1293);

function Unzip(destPath) {
  if (!(this instanceof Unzip)) return new Unzip(path);
  this.path = destPath;
}

Unzip.prototype.destroy = function () {
  this.path = null;
};
/**
 * Iterator all entries,
 *
 * @param callback
 * @param onEnd
 */


Unzip.prototype.getEntries = function (callback, onEnd) {
  yauzl.open(this.path, {
    lazyEntries: true
  }, function (err, zipfile) {
    if (err) {
      callback(err);
      return;
    }

    function next() {
      zipfile.readEntry();
    }

    zipfile.on('entry', function (entry) {
      callback(null, zipfile, entry, next);
    });
    zipfile.on('end', function () {
      if (utils.isFunction(onEnd)) {
        onEnd();
      }
    });
    next();
  });
};
/**
 *
 * @param {Array<String>} whatYouNeed
 * @param {Object}        options       In node, we don't support any options now.
 * @param callback Will be called like callback(err, buffers)
 * 
 * @param options.multiple {boolean} if this param is true, getBuffer will return all the file which match the whatYouNeed reg in an array, each item would be an Object with two props, fileName and buffer
 */


Unzip.prototype.getBuffer = function (whatYouNeed, options, callback) {
  var finishedNumber = 0;
  var output = {};
  var entryCount = 0;
  var isMutiple = options && options.multiple || false;
  var currentIndex = 0;

  if (utils.isFunction(options)) {
    callback = options;
  }

  whatYouNeed = whatYouNeed.map(function (rule) {
    if (typeof rule === 'string') {
      rule = rule.split("\0").join('');
    }

    return rule;
  });
  this.getEntries(function (error, zipfile, entry, next) {
    if (error) return callback(error);
    entryCount = zipfile.entryCount;
    currentIndex++;
    var findIt = whatYouNeed.some(function (rule) {
      if (utils.isThisWhatYouNeed(rule, entry.fileName)) {
        Unzip.getEntryData(zipfile, entry, function (error, buffer) {
          if (error) {
            callback(error);
            return;
          }

          if (isMutiple) {
            var obj = {
              fileName: entry.fileName,
              buffer: buffer
            };

            if (output[rule]) {
              output[rule].push(obj);
            } else {
              output[rule] = [obj];
              finishedNumber++;
            }
          } else {
            output[rule] = buffer;
            finishedNumber++;
          }

          if (finishedNumber >= whatYouNeed.length && !isMutiple) {
            zipfile.close();
            callback(null, output, entryCount);
          } else {
            next();
          }
        });
        return true;
      }
    });
    if (!findIt) next();
  }, function () {
    if (finishedNumber < whatYouNeed.length || isMutiple && currentIndex >= entryCount) {
      callback(null, output, entryCount);
    }
  });
};

Unzip.getEntryData = function (zipfile, entry, callback) {
  var bufferArr = [];
  zipfile.openReadStream(entry, function (err, readStream) {
    if (err) {
      callback(err);
      readStream.destroy();
      return;
    }

    readStream.on('data', function (chunk) {
      bufferArr.push(chunk);
    });
    readStream.on('end', function () {
      var buffer = Buffer.concat(bufferArr);
      callback(null, buffer);
      readStream.destroy();
    });
  });
};

module.exports = Unzip;

/***/ }),

/***/ 5623:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


/*
 Modified from https://gildas-lormeau.github.io/zip.js/, we do a little change to let it work fine with Browserfy/Webpack.

 Copyright (c) 2013 Gildas Lormeau. All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions are met:

 1. Redistributions of source code must retain the above copyright notice,
 this list of conditions and the following disclaimer.

 2. Redistributions in binary form must reproduce the above copyright
 notice, this list of conditions and the following disclaimer in
 the documentation and/or other materials provided with the distribution.

 3. The names of the authors may not be used to endorse or promote products
 derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED WARRANTIES,
 INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL JCRAFT,
 INC. OR ANY CONTRIBUTORS TO THIS SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT,
 INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
// import zWorkerCode from './z-worker';
// import zWorkerCode from 'raw!./z-worker';
var workerRawString = __webpack_require__(7064);

var zWorker = URL.createObjectURL(new Blob([workerRawString], {
  type: 'text/javascript'
}));
var ERR_BAD_FORMAT = 'File format is not recognized.';
var ERR_CRC = 'CRC failed.';
var ERR_ENCRYPTED = 'File contains encrypted entry.';
var ERR_ZIP64 = 'File is using Zip64 (4gb+ file size).';
var ERR_READ = 'Error while reading zip file.';
var ERR_WRITE = 'Error while writing zip file.';
var ERR_WRITE_DATA = 'Error while writing file data.';
var ERR_READ_DATA = 'Error while reading file data.';
var ERR_DUPLICATED_NAME = 'File already exists.';
var CHUNK_SIZE = 512 * 1024;
var TEXT_PLAIN = 'text/plain';
var appendABViewSupported;

try {
  appendABViewSupported = new Blob([new DataView(new ArrayBuffer(0))]).size === 0;
} catch (err) {
  appendABViewSupported = undefined;
}

var zip = {}; ////////////

function Crc32() {
  this.crc = -1;
}

Crc32.prototype.append = function append(data) {
  var crc = this.crc | 0,
      table = this.table;

  for (var offset = 0, len = data.length | 0; offset < len; offset++) {
    crc = crc >>> 8 ^ table[(crc ^ data[offset]) & 0xFF];
  }

  this.crc = crc;
};

Crc32.prototype.get = function get() {
  return ~this.crc;
};

Crc32.prototype.table = function () {
  var i,
      j,
      t,
      table = []; // Uint32Array is actually slower than []

  for (i = 0; i < 256; i++) {
    t = i;

    for (j = 0; j < 8; j++) {
      if (t & 1) t = t >>> 1 ^ 0xEDB88320;else t = t >>> 1;
    }

    table[i] = t;
  }

  return table;
}(); // "no-op" codec


function NOOP() {}

NOOP.prototype.append = function append(bytes, onprogress) {
  return bytes;
};

NOOP.prototype.flush = function flush() {};

function blobSlice(blob, index, length) {
  if (index < 0 || length < 0 || index + length > blob.size) throw new RangeError('offset:' + index + ', length:' + length + ', size:' + blob.size);
  if (blob.slice) return blob.slice(index, index + length);else if (blob.webkitSlice) return blob.webkitSlice(index, index + length);else if (blob.mozSlice) return blob.mozSlice(index, index + length);else if (blob.msSlice) return blob.msSlice(index, index + length);
}

function getDataHelper(byteLength, bytes) {
  var dataBuffer, dataArray;
  dataBuffer = new ArrayBuffer(byteLength);
  dataArray = new Uint8Array(dataBuffer);
  if (bytes) dataArray.set(bytes, 0);
  return {
    buffer: dataBuffer,
    array: dataArray,
    view: new DataView(dataBuffer)
  };
} // Readers


function Reader() {}

function TextReader(text) {
  var that = this,
      blobReader;

  function init(callback, onerror) {
    var blob = new Blob([text], {
      type: TEXT_PLAIN
    });
    blobReader = new BlobReader(blob);
    blobReader.init(function () {
      that.size = blobReader.size;
      callback();
    }, onerror);
  }

  function readUint8Array(index, length, callback, onerror) {
    blobReader.readUint8Array(index, length, callback, onerror);
  }

  that.size = 0;
  that.init = init;
  that.readUint8Array = readUint8Array;
}

TextReader.prototype = new Reader();
TextReader.prototype.constructor = TextReader;

function Data64URIReader(dataURI) {
  var that = this,
      dataStart;

  function init(callback) {
    var dataEnd = dataURI.length;

    while (dataURI.charAt(dataEnd - 1) == "=") {
      dataEnd--;
    }

    dataStart = dataURI.indexOf(",") + 1;
    that.size = Math.floor((dataEnd - dataStart) * 0.75);
    callback();
  }

  function readUint8Array(index, length, callback) {
    var i,
        data = getDataHelper(length);
    var start = Math.floor(index / 3) * 4;
    var end = Math.ceil((index + length) / 3) * 4;
    var bytes = atob(dataURI.substring(start + dataStart, end + dataStart));
    var delta = index - Math.floor(start / 4) * 3;

    for (i = delta; i < delta + length; i++) {
      data.array[i - delta] = bytes.charCodeAt(i);
    }

    callback(data.array);
  }

  that.size = 0;
  that.init = init;
  that.readUint8Array = readUint8Array;
}

Data64URIReader.prototype = new Reader();
Data64URIReader.prototype.constructor = Data64URIReader;

function BlobReader(blob) {
  var that = this;

  function init(callback) {
    that.size = blob.size;
    callback();
  }

  function readUint8Array(index, length, callback, onerror) {
    var reader = new FileReader();

    reader.onload = function (e) {
      callback(new Uint8Array(e.target.result));
    };

    reader.onerror = onerror;

    try {
      reader.readAsArrayBuffer(blobSlice(blob, index, length));
    } catch (e) {
      onerror(e);
    }
  }

  that.size = 0;
  that.init = init;
  that.readUint8Array = readUint8Array;
}

BlobReader.prototype = new Reader();
BlobReader.prototype.constructor = BlobReader; // Writers

function Writer() {}

Writer.prototype.getData = function (callback) {
  callback(this.data);
};

function TextWriter(encoding) {
  var that = this,
      blob;

  function init(callback) {
    blob = new Blob([], {
      type: TEXT_PLAIN
    });
    callback();
  }

  function writeUint8Array(array, callback) {
    blob = new Blob([blob, appendABViewSupported ? array : array.buffer], {
      type: TEXT_PLAIN
    });
    callback();
  }

  function getData(callback, onerror) {
    var reader = new FileReader();

    reader.onload = function (e) {
      callback(e.target.result);
    };

    reader.onerror = onerror;
    reader.readAsText(blob, encoding);
  }

  that.init = init;
  that.writeUint8Array = writeUint8Array;
  that.getData = getData;
}

TextWriter.prototype = new Writer();
TextWriter.prototype.constructor = TextWriter;

function Data64URIWriter(contentType) {
  var that = this,
      data = "",
      pending = "";

  function init(callback) {
    data += "data:" + (contentType || "") + ";base64,";
    callback();
  }

  function writeUint8Array(array, callback) {
    var i,
        delta = pending.length,
        dataString = pending;
    pending = "";

    for (i = 0; i < Math.floor((delta + array.length) / 3) * 3 - delta; i++) {
      dataString += String.fromCharCode(array[i]);
    }

    for (; i < array.length; i++) {
      pending += String.fromCharCode(array[i]);
    }

    if (dataString.length > 2) data += btoa(dataString);else pending = dataString;
    callback();
  }

  function getData(callback) {
    callback(data + btoa(pending));
  }

  that.init = init;
  that.writeUint8Array = writeUint8Array;
  that.getData = getData;
}

Data64URIWriter.prototype = new Writer();
Data64URIWriter.prototype.constructor = Data64URIWriter;

function BlobWriter(contentType) {
  var blob,
      that = this;

  function init(callback) {
    blob = new Blob([], {
      type: contentType
    });
    callback();
  }

  function writeUint8Array(array, callback) {
    blob = new Blob([blob, appendABViewSupported ? array : array.buffer], {
      type: contentType
    });
    callback();
  }

  function getData(callback) {
    callback(blob);
  }

  that.init = init;
  that.writeUint8Array = writeUint8Array;
  that.getData = getData;
}

BlobWriter.prototype = new Writer();
BlobWriter.prototype.constructor = BlobWriter;
/**
 * inflate/deflate core functions
 * @param worker {Worker} web worker for the task.
 * @param initialMessage {Object} initial message to be sent to the worker. should contain
 *   sn(serial number for distinguishing multiple tasks sent to the worker), and codecClass.
 *   This function may add more properties before sending.
 */

function launchWorkerProcess(worker, initialMessage, reader, writer, offset, size, onprogress, onend, onreaderror, onwriteerror) {
  var chunkIndex = 0,
      index,
      outputSize,
      sn = initialMessage.sn,
      crc;

  function onflush() {
    worker.removeEventListener('message', onmessage, false);
    onend(outputSize, crc);
  }

  function onmessage(event) {
    var message = event.data,
        data = message.data,
        err = message.error;

    if (err) {
      err.toString = function () {
        return 'Error: ' + this.message;
      };

      onreaderror(err);
      return;
    }

    if (message.sn !== sn) return;
    if (typeof message.codecTime === 'number') worker.codecTime += message.codecTime; // should be before onflush()

    if (typeof message.crcTime === 'number') worker.crcTime += message.crcTime;

    switch (message.type) {
      case 'append':
        if (data) {
          outputSize += data.length;
          writer.writeUint8Array(data, function () {
            step();
          }, onwriteerror);
        } else step();

        break;

      case 'flush':
        crc = message.crc;

        if (data) {
          outputSize += data.length;
          writer.writeUint8Array(data, function () {
            onflush();
          }, onwriteerror);
        } else onflush();

        break;

      case 'progress':
        if (onprogress) onprogress(index + message.loaded, size);
        break;

      case 'importScripts': //no need to handle here

      case 'newTask':
      case 'echo':
        break;

      default:
        console.warn('zip.js:launchWorkerProcess: unknown message: ', message);
    }
  }

  function step() {
    index = chunkIndex * CHUNK_SIZE; // use `<=` instead of `<`, because `size` may be 0.

    if (index <= size) {
      reader.readUint8Array(offset + index, Math.min(CHUNK_SIZE, size - index), function (array) {
        if (onprogress) onprogress(index, size);
        var msg = index === 0 ? initialMessage : {
          sn: sn
        };
        msg.type = 'append';
        msg.data = array; // posting a message with transferables will fail on IE10

        try {
          worker.postMessage(msg, [array.buffer]);
        } catch (ex) {
          worker.postMessage(msg); // retry without transferables
        }

        chunkIndex++;
      }, onreaderror);
    } else {
      worker.postMessage({
        sn: sn,
        type: 'flush'
      });
    }
  }

  outputSize = 0;
  worker.addEventListener('message', onmessage, false);
  step();
}

function launchProcess(process, reader, writer, offset, size, crcType, onprogress, onend, onreaderror, onwriteerror) {
  var chunkIndex = 0,
      index,
      outputSize = 0,
      crcInput = crcType === 'input',
      crcOutput = crcType === 'output',
      crc = new Crc32();

  function step() {
    var outputData;
    index = chunkIndex * CHUNK_SIZE;
    if (index < size) reader.readUint8Array(offset + index, Math.min(CHUNK_SIZE, size - index), function (inputData) {
      var outputData;

      try {
        outputData = process.append(inputData, function (loaded) {
          if (onprogress) onprogress(index + loaded, size);
        });
      } catch (e) {
        onreaderror(e);
        return;
      }

      if (outputData) {
        outputSize += outputData.length;
        writer.writeUint8Array(outputData, function () {
          chunkIndex++;
          setTimeout(step, 1);
        }, onwriteerror);
        if (crcOutput) crc.append(outputData);
      } else {
        chunkIndex++;
        setTimeout(step, 1);
      }

      if (crcInput) crc.append(inputData);
      if (onprogress) onprogress(index, size);
    }, onreaderror);else {
      try {
        outputData = process.flush();
      } catch (e) {
        onreaderror(e);
        return;
      }

      if (outputData) {
        if (crcOutput) crc.append(outputData);
        outputSize += outputData.length;
        writer.writeUint8Array(outputData, function () {
          onend(outputSize, crc.get());
        }, onwriteerror);
      } else onend(outputSize, crc.get());
    }
  }

  step();
}

function inflate(worker, sn, reader, writer, offset, size, computeCrc32, onend, onprogress, onreaderror, onwriteerror) {
  var crcType = computeCrc32 ? 'output' : 'none';

  if (zip.useWebWorkers) {
    var initialMessage = {
      sn: sn,
      codecClass: 'Inflater',
      crcType: crcType
    };
    launchWorkerProcess(worker, initialMessage, reader, writer, offset, size, onprogress, onend, onreaderror, onwriteerror);
  } else launchProcess(new zip.Inflater(), reader, writer, offset, size, crcType, onprogress, onend, onreaderror, onwriteerror);
}

function deflate(worker, sn, reader, writer, level, onend, onprogress, onreaderror, onwriteerror) {
  var crcType = 'input';

  if (zip.useWebWorkers) {
    var initialMessage = {
      sn: sn,
      options: {
        level: level
      },
      codecClass: 'Deflater',
      crcType: crcType
    };
    launchWorkerProcess(worker, initialMessage, reader, writer, 0, reader.size, onprogress, onend, onreaderror, onwriteerror);
  } else launchProcess(new zip.Deflater(), reader, writer, 0, reader.size, crcType, onprogress, onend, onreaderror, onwriteerror);
}

function copy(worker, sn, reader, writer, offset, size, computeCrc32, onend, onprogress, onreaderror, onwriteerror) {
  var crcType = 'input';

  if (zip.useWebWorkers && computeCrc32) {
    var initialMessage = {
      sn: sn,
      codecClass: 'NOOP',
      crcType: crcType
    };
    launchWorkerProcess(worker, initialMessage, reader, writer, offset, size, onprogress, onend, onreaderror, onwriteerror);
  } else launchProcess(new NOOP(), reader, writer, offset, size, crcType, onprogress, onend, onreaderror, onwriteerror);
} // ZipReader


function decodeASCII(str) {
  var i,
      out = "",
      charCode,
      extendedASCII = ["\xC7", "\xFC", "\xE9", "\xE2", "\xE4", "\xE0", "\xE5", "\xE7", "\xEA", "\xEB", "\xE8", "\xEF", "\xEE", "\xEC", "\xC4", "\xC5", "\xC9", "\xE6", "\xC6", "\xF4", "\xF6", "\xF2", "\xFB", "\xF9", "\xFF", "\xD6", "\xDC", "\xF8", "\xA3", "\xD8", "\xD7", "\u0192", "\xE1", "\xED", "\xF3", "\xFA", "\xF1", "\xD1", "\xAA", "\xBA", "\xBF", "\xAE", "\xAC", "\xBD", "\xBC", "\xA1", "\xAB", "\xBB", '_', '_', '_', "\xA6", "\xA6", "\xC1", "\xC2", "\xC0", "\xA9", "\xA6", "\xA6", '+', '+', "\xA2", "\xA5", '+', '+', '-', '-', '+', '-', '+', "\xE3", "\xC3", '+', '+', '-', '-', "\xA6", '-', '+', "\xA4", "\xF0", "\xD0", "\xCA", "\xCB", "\xC8", 'i', "\xCD", "\xCE", "\xCF", '+', '+', '_', '_', "\xA6", "\xCC", '_', "\xD3", "\xDF", "\xD4", "\xD2", "\xF5", "\xD5", "\xB5", "\xFE", "\xDE", "\xDA", "\xDB", "\xD9", "\xFD", "\xDD", "\xAF", "\xB4", "\xAD", "\xB1", '_', "\xBE", "\xB6", "\xA7", "\xF7", "\xB8", "\xB0", "\xA8", "\xB7", "\xB9", "\xB3", "\xB2", '_', ' '];

  for (i = 0; i < str.length; i++) {
    charCode = str.charCodeAt(i) & 0xFF;
    if (charCode > 127) out += extendedASCII[charCode - 128];else out += String.fromCharCode(charCode);
  }

  return out;
}

function decodeUTF8(string) {
  return decodeURIComponent(escape(string));
}

function getString(bytes) {
  var i,
      str = "";

  for (i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }

  return str;
}

function getDate(timeRaw) {
  var date = (timeRaw & 0xffff0000) >> 16,
      time = timeRaw & 0x0000ffff;

  try {
    return new Date(1980 + ((date & 0xFE00) >> 9), ((date & 0x01E0) >> 5) - 1, date & 0x001F, (time & 0xF800) >> 11, (time & 0x07E0) >> 5, (time & 0x001F) * 2, 0);
  } catch (e) {}
}

function readCommonHeader(entry, data, index, centralDirectory, onerror) {
  entry.version = data.view.getUint16(index, true);
  entry.bitFlag = data.view.getUint16(index + 2, true);
  entry.compressionMethod = data.view.getUint16(index + 4, true);
  entry.lastModDateRaw = data.view.getUint32(index + 6, true);
  entry.lastModDate = getDate(entry.lastModDateRaw);

  if ((entry.bitFlag & 0x01) === 0x01) {
    onerror(ERR_ENCRYPTED);
    return;
  }

  if (centralDirectory || (entry.bitFlag & 0x0008) != 0x0008) {
    entry.crc32 = data.view.getUint32(index + 10, true);
    entry.compressedSize = data.view.getUint32(index + 14, true);
    entry.uncompressedSize = data.view.getUint32(index + 18, true);
  }

  if (entry.compressedSize === 0xFFFFFFFF || entry.uncompressedSize === 0xFFFFFFFF) {
    onerror(ERR_ZIP64);
    return;
  }

  entry.filenameLength = data.view.getUint16(index + 22, true);
  entry.extraFieldLength = data.view.getUint16(index + 24, true);
}

function createZipReader(reader, callback, onerror) {
  var inflateSN = 0;

  function Entry() {}

  Entry.prototype.getData = function (writer, onend, onprogress, checkCrc32) {
    var that = this;

    function testCrc32(crc32) {
      var dataCrc32 = getDataHelper(4);
      dataCrc32.view.setUint32(0, crc32);
      return that.crc32 == dataCrc32.view.getUint32(0);
    }

    function getWriterData(uncompressedSize, crc32) {
      if (checkCrc32 && !testCrc32(crc32)) onerror(ERR_CRC);else writer.getData(function (data) {
        onend(data);
      });
    }

    function onreaderror(err) {
      onerror(err || ERR_READ_DATA);
    }

    function onwriteerror(err) {
      onerror(err || ERR_WRITE_DATA);
    }

    reader.readUint8Array(that.offset, 30, function (bytes) {
      var data = getDataHelper(bytes.length, bytes),
          dataOffset;

      if (data.view.getUint32(0) != 0x504b0304) {
        onerror(ERR_BAD_FORMAT);
        return;
      }

      readCommonHeader(that, data, 4, false, onerror);
      dataOffset = that.offset + 30 + that.filenameLength + that.extraFieldLength;
      writer.init(function () {
        if (that.compressionMethod === 0) copy(that._worker, inflateSN++, reader, writer, dataOffset, that.compressedSize, checkCrc32, getWriterData, onprogress, onreaderror, onwriteerror);else inflate(that._worker, inflateSN++, reader, writer, dataOffset, that.compressedSize, checkCrc32, getWriterData, onprogress, onreaderror, onwriteerror);
      }, onwriteerror);
    }, onreaderror);
  };

  function seekEOCDR(eocdrCallback) {
    // "End of central directory record" is the last part of a zip archive, and is at least 22 bytes long.
    // Zip file comment is the last part of EOCDR and has max length of 64KB,
    // so we only have to search the last 64K + 22 bytes of a archive for EOCDR signature (0x06054b50).
    var EOCDR_MIN = 22;

    if (reader.size < EOCDR_MIN) {
      onerror(ERR_BAD_FORMAT);
      return;
    }

    var ZIP_COMMENT_MAX = 256 * 256,
        EOCDR_MAX = EOCDR_MIN + ZIP_COMMENT_MAX; // In most cases, the EOCDR is EOCDR_MIN bytes long

    doSeek(EOCDR_MIN, function () {
      // If not found, try within EOCDR_MAX bytes
      doSeek(Math.min(EOCDR_MAX, reader.size), function () {
        onerror(ERR_BAD_FORMAT);
      });
    }); // seek last length bytes of file for EOCDR

    function doSeek(length, eocdrNotFoundCallback) {
      reader.readUint8Array(reader.size - length, length, function (bytes) {
        for (var i = bytes.length - EOCDR_MIN; i >= 0; i--) {
          if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x05 && bytes[i + 3] === 0x06) {
            eocdrCallback(new DataView(bytes.buffer, i, EOCDR_MIN));
            return;
          }
        }

        eocdrNotFoundCallback();
      }, function () {
        onerror(ERR_READ);
      });
    }
  }

  var zipReader = {
    getEntries: function getEntries(callback) {
      var worker = this._worker; // look for End of central directory record

      seekEOCDR(function (dataView) {
        var datalength, fileslength;
        datalength = dataView.getUint32(16, true);
        fileslength = dataView.getUint16(8, true);

        if (datalength < 0 || datalength >= reader.size) {
          onerror(ERR_BAD_FORMAT);
          return;
        }

        reader.readUint8Array(datalength, reader.size - datalength, function (bytes) {
          var i,
              index = 0,
              entries = [],
              entry,
              filename,
              comment,
              data = getDataHelper(bytes.length, bytes);

          for (i = 0; i < fileslength; i++) {
            entry = new Entry();
            entry._worker = worker;

            if (data.view.getUint32(index) != 0x504b0102) {
              onerror(ERR_BAD_FORMAT);
              return;
            }

            readCommonHeader(entry, data, index + 6, true, onerror);
            entry.commentLength = data.view.getUint16(index + 32, true);
            entry.directory = (data.view.getUint8(index + 38) & 0x10) == 0x10;
            entry.offset = data.view.getUint32(index + 42, true);
            filename = getString(data.array.subarray(index + 46, index + 46 + entry.filenameLength));
            entry.filename = (entry.bitFlag & 0x0800) === 0x0800 ? decodeUTF8(filename) : decodeASCII(filename);
            if (!entry.directory && entry.filename.charAt(entry.filename.length - 1) == "/") entry.directory = true;
            comment = getString(data.array.subarray(index + 46 + entry.filenameLength + entry.extraFieldLength, index + 46 + entry.filenameLength + entry.extraFieldLength + entry.commentLength));
            entry.comment = (entry.bitFlag & 0x0800) === 0x0800 ? decodeUTF8(comment) : decodeASCII(comment);
            entries.push(entry);
            index += 46 + entry.filenameLength + entry.extraFieldLength + entry.commentLength;
          }

          callback(entries);
        }, function () {
          onerror(ERR_READ);
        });
      });
    },
    close: function close(callback) {
      if (this._worker) {
        this._worker.terminate();

        this._worker = null;
      }

      if (callback) callback();
    },
    _worker: null
  };
  if (!zip.useWebWorkers) callback(zipReader);else {
    createWorker('inflater', function (worker) {
      zipReader._worker = worker;
      callback(zipReader);
    }, function (err) {
      onerror(err);
    });
  }
} // ZipWriter


function encodeUTF8(string) {
  return unescape(encodeURIComponent(string));
}

function getBytes(str) {
  var i,
      array = [];

  for (i = 0; i < str.length; i++) {
    array.push(str.charCodeAt(i));
  }

  return array;
}

function createZipWriter(writer, callback, onerror, dontDeflate) {
  var files = {},
      filenames = [],
      datalength = 0;
  var deflateSN = 0;

  function onwriteerror(err) {
    onerror(err || ERR_WRITE);
  }

  function onreaderror(err) {
    onerror(err || ERR_READ_DATA);
  }

  var zipWriter = {
    add: function add(name, reader, onend, onprogress, options) {
      var header, filename, date;
      var worker = this._worker;

      function writeHeader(callback) {
        var data;
        date = options.lastModDate || new Date();
        header = getDataHelper(26);
        files[name] = {
          headerArray: header.array,
          directory: options.directory,
          filename: filename,
          offset: datalength,
          comment: getBytes(encodeUTF8(options.comment || ''))
        };
        header.view.setUint32(0, 0x14000808);
        if (options.version) header.view.setUint8(0, options.version);
        if (!dontDeflate && options.level !== 0 && !options.directory) header.view.setUint16(4, 0x0800);
        header.view.setUint16(6, (date.getHours() << 6 | date.getMinutes()) << 5 | date.getSeconds() / 2, true);
        header.view.setUint16(8, (date.getFullYear() - 1980 << 4 | date.getMonth() + 1) << 5 | date.getDate(), true);
        header.view.setUint16(22, filename.length, true);
        data = getDataHelper(30 + filename.length);
        data.view.setUint32(0, 0x504b0304);
        data.array.set(header.array, 4);
        data.array.set(filename, 30);
        datalength += data.array.length;
        writer.writeUint8Array(data.array, callback, onwriteerror);
      }

      function writeFooter(compressedLength, crc32) {
        var footer = getDataHelper(16);
        datalength += compressedLength || 0;
        footer.view.setUint32(0, 0x504b0708);

        if (typeof crc32 !== 'undefined') {
          header.view.setUint32(10, crc32, true);
          footer.view.setUint32(4, crc32, true);
        }

        if (reader) {
          footer.view.setUint32(8, compressedLength, true);
          header.view.setUint32(14, compressedLength, true);
          footer.view.setUint32(12, reader.size, true);
          header.view.setUint32(18, reader.size, true);
        }

        writer.writeUint8Array(footer.array, function () {
          datalength += 16;
          onend();
        }, onwriteerror);
      }

      function writeFile() {
        options = options || {};
        name = name.trim();
        if (options.directory && name.charAt(name.length - 1) != "/") name += "/";

        if (files.hasOwnProperty(name)) {
          onerror(ERR_DUPLICATED_NAME);
          return;
        }

        filename = getBytes(encodeUTF8(name));
        filenames.push(name);
        writeHeader(function () {
          if (reader) {
            if (dontDeflate || options.level === 0) copy(worker, deflateSN++, reader, writer, 0, reader.size, true, writeFooter, onprogress, onreaderror, onwriteerror);else deflate(worker, deflateSN++, reader, writer, options.level, writeFooter, onprogress, onreaderror, onwriteerror);
          } else writeFooter();
        }, onwriteerror);
      }

      if (reader) reader.init(writeFile, onreaderror);else writeFile();
    },
    close: function close(callback) {
      if (this._worker) {
        this._worker.terminate();

        this._worker = null;
      }

      var data,
          length = 0,
          index = 0,
          indexFilename,
          file;

      for (indexFilename = 0; indexFilename < filenames.length; indexFilename++) {
        file = files[filenames[indexFilename]];
        length += 46 + file.filename.length + file.comment.length;
      }

      data = getDataHelper(length + 22);

      for (indexFilename = 0; indexFilename < filenames.length; indexFilename++) {
        file = files[filenames[indexFilename]];
        data.view.setUint32(index, 0x504b0102);
        data.view.setUint16(index + 4, 0x1400);
        data.array.set(file.headerArray, index + 6);
        data.view.setUint16(index + 32, file.comment.length, true);
        if (file.directory) data.view.setUint8(index + 38, 0x10);
        data.view.setUint32(index + 42, file.offset, true);
        data.array.set(file.filename, index + 46);
        data.array.set(file.comment, index + 46 + file.filename.length);
        index += 46 + file.filename.length + file.comment.length;
      }

      data.view.setUint32(index, 0x504b0506);
      data.view.setUint16(index + 8, filenames.length, true);
      data.view.setUint16(index + 10, filenames.length, true);
      data.view.setUint32(index + 12, length, true);
      data.view.setUint32(index + 16, datalength, true);
      writer.writeUint8Array(data.array, function () {
        writer.getData(callback);
      }, onwriteerror);
    },
    _worker: null
  };
  if (!zip.useWebWorkers) callback(zipWriter);else {
    createWorker('deflater', function (worker) {
      zipWriter._worker = worker;
      callback(zipWriter);
    }, function (err) {
      onerror(err);
    });
  }
}

function resolveURLs(urls) {
  var a = document.createElement('a');
  return urls.map(function (url) {
    a.href = url;
    return a.href;
  });
} // var DEFAULT_WORKER_SCRIPTS = {
//   deflater: ['z-worker.js', 'deflate.js'],
//   inflater: ['z-worker.js', 'inflate.js']
// };


function createWorker(type, callback, onerror) {
  if (zip.workerScripts !== null && zip.workerScriptsPath !== null) {
    onerror(new Error('Either zip.workerScripts or zip.workerScriptsPath may be set, not both.'));
    return;
  }

  var scripts; // var worker = new Worker(blobBuilder(zWorkerCode));

  var worker = new Worker(zWorker); // record total consumed time by inflater/deflater/crc32 in this worker

  worker.codecTime = worker.crcTime = 0;
  worker.postMessage({
    type: 'importScripts',
    scripts: ['inflate.js']
  });
  worker.addEventListener('message', onmessage);

  function onmessage(ev) {
    var msg = ev.data;

    if (msg.error) {
      worker.terminate(); // should before onerror(), because onerror() may throw.

      onerror(msg.error);
      return;
    }

    if (msg.type === 'importScripts') {
      worker.removeEventListener('message', onmessage);
      worker.removeEventListener('error', errorHandler);
      callback(worker);
    }
  } // catch entry script loading error and other unhandled errors


  worker.addEventListener('error', errorHandler);

  function errorHandler(err) {
    worker.terminate();
    onerror(err);
  }
}

function onerror_default(error) {
  console.error(error);
}

var extendsOpts = {
  Reader: Reader,
  Writer: Writer,
  BlobReader: BlobReader,
  Data64URIReader: Data64URIReader,
  TextReader: TextReader,
  BlobWriter: BlobWriter,
  Data64URIWriter: Data64URIWriter,
  TextWriter: TextWriter,
  createReader: function createReader(reader, callback, onerror) {
    onerror = onerror || onerror_default;
    reader.init(function () {
      createZipReader(reader, callback, onerror);
    }, onerror);
  },
  createWriter: function createWriter(writer, callback, onerror, dontDeflate) {
    onerror = onerror || onerror_default;
    dontDeflate = !!dontDeflate;
    writer.init(function () {
      createZipWriter(writer, callback, onerror, dontDeflate);
    }, onerror);
  },
  useWebWorkers: true,

  /**
   * Directory containing the default worker scripts (z-worker.js, deflate.js, and inflate.js), relative to current base url.
   * E.g.: zip.workerScripts = './';
   */
  workerScriptsPath: null,

  /**
   * Advanced option to control which scripts are loaded in the Web worker. If this option is specified, then workerScriptsPath must not be set.
   * workerScripts.deflater/workerScripts.inflater should be arrays of urls to scripts for deflater/inflater, respectively.
   * Scripts in the array are executed in order, and the first one should be z-worker.js, which is used to start the worker.
   * All urls are relative to current base url.
   * E.g.:
   * zip.workerScripts = {
   *   deflater: ['z-worker.js', 'deflate.js'],
   *   inflater: ['z-worker.js', 'inflate.js']
   * };
   */
  workerScripts: null
};

for (var i in extendsOpts) {
  zip[i] = extendsOpts[i];
}

module.exports = zip;

/***/ }),

/***/ 5786:
/***/ ((module) => {

"use strict";


function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function toArray(arrayLikeObj) {
  if (!arrayLikeObj) return [];
  return Array.prototype.slice.call(arrayLikeObj);
}

function extend(destObject) {
  var args = toArray(arguments);

  if (args.length === 1) {
    return destObject;
  }

  args.shift(); // 从前往后遍历

  for (var i = 0, l = args.length; i < l; i++) {
    for (var key in args[i]) {
      if (args[i].hasOwnProperty(key)) {
        destObject[key] = args[i][key];
      }
    }
  }

  return destObject;
}

function isEmpty(obj) {
  for (var i in obj) {
    return false;
  }

  return true;
}

function isTypeOf(something, type) {
  if (!type) return false;
  type = type.toLowerCase();
  var realTypeString = Object.prototype.toString.call(something);
  return realTypeString.toLowerCase() === '[object ' + type + ']';
}

function isArray(something) {
  return isTypeOf(something, 'array');
}

function isFunction(something) {
  return typeof something === 'function';
}

function isString(something) {
  return typeof something === 'string';
}

function isDefined(something) {
  return !(typeof something === 'undefined');
}

function isObject(something) {
  return _typeof(something) === 'object';
}

function isPrimitive(something) {
  return something === null || typeof something === 'boolean' || typeof something === 'number' || typeof something === 'string' || typeof something === 'undefined';
}

function isReg(something) {
  return isTypeOf(something, 'regexp');
}

function findOutResources(apkInfo, resourceMapStr) {
  var resourceMap = {};
  iteratorObj(apkInfo);
  return resourceMap;

  function iteratorObj(obj) {
    for (var i in obj) {
      if (isArray(obj[i])) {
        iteratorArray(obj[i]);
      } else if (isObject(obj[i])) {
        iteratorObj(obj[i]);
      } else if (isPrimitive(obj[i])) {
        if (isResouces(obj[i])) {
          obj[i] = resourceMapStr[transKeyToMatchResourceMap(obj[i])];
        }
      }
    }
  }

  function iteratorArray(array) {
    for (var i = 0, l = array.length; i < l; i++) {
      if (isArray(array[i])) {
        iteratorArray(array[i]);
      } else if (isObject(array[i])) {
        iteratorObj(array[i]);
      } else if (isPrimitive(array[i])) {
        if (isResouces(array[i])) {
          array[i] = resourceMapStr[transKeyToMatchResourceMap(array[i])];
        }
      }
    }
  }
}

function startWith(str, prefix) {
  return str.indexOf(prefix) === 0;
}

function isResouces(attrValue) {
  if (!attrValue) return false;

  if (typeof attrValue !== 'string') {
    attrValue = attrValue.toString();
  }

  return startWith(attrValue, 'resourceId:');
}

function transKeyToMatchResourceMap(resourceId) {
  return '@' + resourceId.replace('resourceId:0x', '').toUpperCase();
}

function castLogger(doWhat, fromWhen) {
  console.log(doWhat + ' cost: ' + (Date.now() - fromWhen) + 'ms');
}

function findOutIcon(pkgInfo, extension) {
  if (extension === 'apk') {
    if (pkgInfo.application.icon && pkgInfo.application.icon.splice) {
      var _ret = function () {
        var rulesMap = {
          p: 144,
          h: 288,
          y: 432,
          ldpi: 120,
          mdpi: 160,
          hdpi: 240,
          xhdpi: 320,
          xxhdpi: 480,
          xxxhdpi: 640
        };
        var resultMap = {};
        var maxDpiIcon = {
          dpi: 120,
          icon: ''
        };

        var _loop = function _loop(i) {
          pkgInfo.application.icon.some(function (icon) {
            if (icon && icon.indexOf(i) > -1) {
              resultMap['application-icon-' + rulesMap[i]] = icon;
              return true;
            }

            return false;
          }); // 单独取出最大的

          if (resultMap['application-icon-' + rulesMap[i]] && rulesMap[i] >= maxDpiIcon.dpi) {
            maxDpiIcon = {
              dpi: rulesMap[i],
              icon: resultMap['application-icon-' + rulesMap[i]]
            };
          }
        };

        for (var i in rulesMap) {
          _loop(i);
        }

        if (isEmpty(resultMap) || !maxDpiIcon.icon) {
          maxDpiIcon = {
            dpi: 120,
            icon: pkgInfo.application.icon[0] || ''
          };
          resultMap['applicataion-icon-120'] = maxDpiIcon.icon;
        }

        return {
          v: maxDpiIcon.icon
        };
      }();

      if (_typeof(_ret) === "object") return _ret.v;
    }

    console.error('Unexpected icon type,', pkgInfo.application.icon);
  } else if (extension === 'ipa') {
    if (pkgInfo.CFBundleIcons && pkgInfo.CFBundleIcons.CFBundlePrimaryIcon && pkgInfo.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles && pkgInfo.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles.length) {
      return pkgInfo.CFBundleIcons.CFBundlePrimaryIcon.CFBundleIconFiles.slice(-1)[0];
    } // Maybe there is a default one


    return '.app/Icon.png';
  } else {
    console.warn('Unexpected extension', extension);
  }
}

module.exports = {
  findOutResources: findOutResources,
  toArray: toArray,
  extend: extend,
  startWith: startWith,
  isResouces: isResouces,
  transKeyToMatchResourceMap: transKeyToMatchResourceMap,
  castLogger: castLogger,
  isTypeOf: isTypeOf,
  isArray: isArray,
  isFunction: isFunction,
  isString: isString,
  isDefined: isDefined,
  isObject: isObject,
  isReg: isReg,
  findOutIcon: findOutIcon,
  isEmpty: isEmpty
};

/***/ }),

/***/ 1119:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(3612).buffer

/***/ }),

/***/ 3612:
/***/ ((__unused_webpack_module, exports) => {

var __webpack_unused_export__;
__webpack_unused_export__ = toArray
exports.buffer = toBuffer

function toArray(stream, callback) {
  var arr = []

  stream.on('data', onData)
  stream.once('end', onEnd)
  stream.once('error', callback)
  stream.once('error', cleanup)
  stream.once('close', cleanup)

  function onData(doc) {
    arr.push(doc)
  }

  function onEnd() {
    callback(null, arr)
    cleanup()
  }

  function cleanup() {
    arr = null
    stream.removeListener('data', onData)
    stream.removeListener('end', onEnd)
    stream.removeListener('error', callback)
    stream.removeListener('error', cleanup)
    stream.removeListener('close', cleanup)
  }

  return stream
}

function toBuffer(stream, callback) {
  toArray(stream, function (err, arr) {
    if (err || !arr)
      callback(err)
    else
      callback(null, Buffer.concat(arr))
  })

  return stream
}

/***/ }),

/***/ 4651:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


var util = __webpack_require__(1669);
var stream = __webpack_require__(2413);

module.exports.createReadStream = function (object, options) {
  return new MultiStream (object, options);
};

var MultiStream = function (object, options) {
  if (object instanceof Buffer || typeof object === 'string') {
    options = options || {};
    stream.Readable.call(this, {
      highWaterMark: options.highWaterMark,
      encoding: options.encoding
    });
  } else {
    stream.Readable.call(this, { objectMode: true });
  }
  this._object = object;
};

util.inherits(MultiStream, stream.Readable);

MultiStream.prototype._read = function () {
  this.push(this._object);
  this._object = null;
};

/***/ }),

/***/ 5051:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AbstractTokenizer = void 0;
const peek_readable_1 = __webpack_require__(3752);
/**
 * Core tokenizer
 */
class AbstractTokenizer {
    constructor(fileInfo) {
        /**
         * Tokenizer-stream position
         */
        this.position = 0;
        this.numBuffer = Buffer.alloc(10);
        this.fileInfo = fileInfo ? fileInfo : {};
    }
    /**
     * Read a token from the tokenizer-stream
     * @param token - The token to read
     * @param position - If provided, the desired position in the tokenizer-stream
     * @returns Promise with token data
     */
    async readToken(token, position) {
        const buffer = Buffer.alloc(token.len);
        const len = await this.readBuffer(buffer, { position });
        if (len < token.len)
            throw new peek_readable_1.EndOfStreamError();
        return token.get(buffer, 0);
    }
    /**
     * Peek a token from the tokenizer-stream.
     * @param token - Token to peek from the tokenizer-stream.
     * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
     * @returns Promise with token data
     */
    async peekToken(token, position = this.position) {
        const buffer = Buffer.alloc(token.len);
        const len = await this.peekBuffer(buffer, { position });
        if (len < token.len)
            throw new peek_readable_1.EndOfStreamError();
        return token.get(buffer, 0);
    }
    /**
     * Read a numeric token from the stream
     * @param token - Numeric token
     * @returns Promise with number
     */
    async readNumber(token) {
        const len = await this.readBuffer(this.numBuffer, { length: token.len });
        if (len < token.len)
            throw new peek_readable_1.EndOfStreamError();
        return token.get(this.numBuffer, 0);
    }
    /**
     * Read a numeric token from the stream
     * @param token - Numeric token
     * @returns Promise with number
     */
    async peekNumber(token) {
        const len = await this.peekBuffer(this.numBuffer, { length: token.len });
        if (len < token.len)
            throw new peek_readable_1.EndOfStreamError();
        return token.get(this.numBuffer, 0);
    }
    async close() {
        // empty
    }
}
exports.AbstractTokenizer = AbstractTokenizer;
//# sourceMappingURL=AbstractTokenizer.js.map

/***/ }),

/***/ 8054:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BufferTokenizer = void 0;
const peek_readable_1 = __webpack_require__(3752);
class BufferTokenizer {
    /**
     * Construct BufferTokenizer
     * @param buffer - Buffer to tokenize
     * @param fileInfo - Pass additional file information to the tokenizer
     */
    constructor(buffer, fileInfo) {
        this.buffer = buffer;
        this.position = 0;
        this.fileInfo = fileInfo ? fileInfo : {};
        this.fileInfo.size = this.fileInfo.size ? this.fileInfo.size : buffer.length;
    }
    /**
     * Read buffer from tokenizer
     * @param buffer
     * @param options - Read behaviour options
     * @returns {Promise<number>}
     */
    async readBuffer(buffer, options) {
        if (options && options.position) {
            if (options.position < this.position) {
                throw new Error('`options.position` must be equal or greater than `tokenizer.position`');
            }
            this.position = options.position;
        }
        return this.peekBuffer(buffer, options).then(bytesRead => {
            this.position += bytesRead;
            return bytesRead;
        });
    }
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param buffer
     * @param options - Read behaviour options
     * @returns {Promise<number>}
     */
    async peekBuffer(buffer, options) {
        let offset = 0;
        let length = buffer.length;
        let position = this.position;
        if (options) {
            if (options.position) {
                if (options.position < this.position) {
                    throw new Error('`options.position` can be less than `tokenizer.position`');
                }
                position = options.position;
            }
            if (Number.isInteger(options.length)) {
                length = options.length;
            }
            else {
                length -= options.offset || 0;
            }
            if (options.offset) {
                offset = options.offset;
            }
        }
        if (length === 0) {
            return Promise.resolve(0);
        }
        position = position || this.position;
        if (!length) {
            length = buffer.length;
        }
        const bytes2read = Math.min(this.buffer.length - position, length);
        if ((!options || !options.mayBeLess) && bytes2read < length) {
            throw new peek_readable_1.EndOfStreamError();
        }
        else {
            this.buffer.copy(buffer, offset, position, position + bytes2read);
            return bytes2read;
        }
    }
    async readToken(token, position) {
        this.position = position || this.position;
        try {
            const tv = this.peekToken(token, this.position);
            this.position += token.len;
            return tv;
        }
        catch (err) {
            this.position += this.buffer.length - position;
            throw err;
        }
    }
    async peekToken(token, position = this.position) {
        if (this.buffer.length - position < token.len) {
            throw new peek_readable_1.EndOfStreamError();
        }
        return token.get(this.buffer, position);
    }
    async readNumber(token) {
        return this.readToken(token);
    }
    async peekNumber(token) {
        return this.peekToken(token);
    }
    /**
     * @return actual number of bytes ignored
     */
    async ignore(length) {
        const bytesIgnored = Math.min(this.buffer.length - this.position, length);
        this.position += bytesIgnored;
        return bytesIgnored;
    }
    async close() {
        // empty
    }
}
exports.BufferTokenizer = BufferTokenizer;
//# sourceMappingURL=BufferTokenizer.js.map

/***/ }),

/***/ 561:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fromFile = exports.FileTokenizer = void 0;
const AbstractTokenizer_1 = __webpack_require__(5051);
const peek_readable_1 = __webpack_require__(3752);
const fs = __webpack_require__(3915);
class FileTokenizer extends AbstractTokenizer_1.AbstractTokenizer {
    constructor(fd, fileInfo) {
        super(fileInfo);
        this.fd = fd;
    }
    /**
     * Read buffer from file
     * @param buffer
     * @param options - Read behaviour options
     * @returns Promise number of bytes read
     */
    async readBuffer(buffer, options) {
        let offset = 0;
        let length = buffer.length;
        if (options) {
            if (options.position) {
                if (options.position < this.position) {
                    throw new Error('`options.position` must be equal or greater than `tokenizer.position`');
                }
                this.position = options.position;
            }
            if (Number.isInteger(options.length)) {
                length = options.length;
            }
            else {
                length -= options.offset || 0;
            }
            if (options.offset) {
                offset = options.offset;
            }
        }
        if (length === 0) {
            return Promise.resolve(0);
        }
        const res = await fs.read(this.fd, buffer, offset, length, this.position);
        this.position += res.bytesRead;
        if (res.bytesRead < length && (!options || !options.mayBeLess)) {
            throw new peek_readable_1.EndOfStreamError();
        }
        return res.bytesRead;
    }
    /**
     * Peek buffer from file
     * @param buffer
     * @param options - Read behaviour options
     * @returns Promise number of bytes read
     */
    async peekBuffer(buffer, options) {
        let offset = 0;
        let length = buffer.length;
        let position = this.position;
        if (options) {
            if (options.position) {
                if (options.position < this.position) {
                    throw new Error('`options.position` must be equal or greater than `tokenizer.position`');
                }
                position = options.position;
            }
            if (Number.isInteger(options.length)) {
                length = options.length;
            }
            else {
                length -= options.offset || 0;
            }
            if (options.offset) {
                offset = options.offset;
            }
        }
        if (length === 0) {
            return Promise.resolve(0);
        }
        const res = await fs.read(this.fd, buffer, offset, length, position);
        if ((!options || !options.mayBeLess) && res.bytesRead < length) {
            throw new peek_readable_1.EndOfStreamError();
        }
        return res.bytesRead;
    }
    /**
     * @param length - Number of bytes to ignore
     * @return resolves the number of bytes ignored, equals length if this available, otherwise the number of bytes available
     */
    async ignore(length) {
        const bytesLeft = this.fileInfo.size - this.position;
        if (length <= bytesLeft) {
            this.position += length;
            return length;
        }
        else {
            this.position += bytesLeft;
            return bytesLeft;
        }
    }
    async close() {
        return fs.close(this.fd);
    }
}
exports.FileTokenizer = FileTokenizer;
async function fromFile(sourceFilePath) {
    const stat = await fs.stat(sourceFilePath);
    if (!stat.isFile) {
        throw new Error(`File not a file: ${sourceFilePath}`);
    }
    const fd = await fs.open(sourceFilePath, 'r');
    return new FileTokenizer(fd, { path: sourceFilePath, size: stat.size });
}
exports.fromFile = fromFile;
//# sourceMappingURL=FileTokenizer.js.map

/***/ }),

/***/ 3915:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Module convert fs functions to promise based functions
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.readFile = exports.writeFileSync = exports.writeFile = exports.read = exports.open = exports.close = exports.stat = exports.createReadStream = exports.pathExists = void 0;
const fs = __webpack_require__(5747);
exports.pathExists = fs.existsSync;
exports.createReadStream = fs.createReadStream;
async function stat(path) {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if (err)
                reject(err);
            else
                resolve(stats);
        });
    });
}
exports.stat = stat;
async function close(fd) {
    return new Promise((resolve, reject) => {
        fs.close(fd, err => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
exports.close = close;
async function open(path, mode) {
    return new Promise((resolve, reject) => {
        fs.open(path, mode, (err, fd) => {
            if (err)
                reject(err);
            else
                resolve(fd);
        });
    });
}
exports.open = open;
async function read(fd, buffer, offset, length, position) {
    return new Promise((resolve, reject) => {
        fs.read(fd, buffer, offset, length, position, (err, bytesRead, _buffer) => {
            if (err)
                reject(err);
            else
                resolve({ bytesRead, buffer: _buffer });
        });
    });
}
exports.read = read;
async function writeFile(path, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, err => {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
exports.writeFile = writeFile;
function writeFileSync(path, data) {
    fs.writeFileSync(path, data);
}
exports.writeFileSync = writeFileSync;
async function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, buffer) => {
            if (err)
                reject(err);
            else
                resolve(buffer);
        });
    });
}
exports.readFile = readFile;
//# sourceMappingURL=FsPromise.js.map

/***/ }),

/***/ 8888:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ReadStreamTokenizer = void 0;
const AbstractTokenizer_1 = __webpack_require__(5051);
const peek_readable_1 = __webpack_require__(3752);
// import * as _debug from 'debug';
// const debug = _debug('strtok3:ReadStreamTokenizer');
const maxBufferSize = 256000;
class ReadStreamTokenizer extends AbstractTokenizer_1.AbstractTokenizer {
    constructor(stream, fileInfo) {
        super(fileInfo);
        this.streamReader = new peek_readable_1.StreamReader(stream);
    }
    /**
     * Get file information, an HTTP-client may implement this doing a HEAD request
     * @return Promise with file information
     */
    async getFileInfo() {
        return this.fileInfo;
    }
    /**
     * Read buffer from tokenizer
     * @param buffer - Target buffer to fill with data read from the tokenizer-stream
     * @param options - Read behaviour options
     * @returns Promise with number of bytes read
     */
    async readBuffer(buffer, options) {
        // const _offset = position ? position : this.position;
        // debug(`readBuffer ${_offset}...${_offset + length - 1}`);
        let offset = 0;
        let length = buffer.length;
        if (options) {
            if (Number.isInteger(options.length)) {
                length = options.length;
            }
            else {
                length -= options.offset || 0;
            }
            if (options.position) {
                const skipBytes = options.position - this.position;
                if (skipBytes > 0) {
                    await this.ignore(skipBytes);
                    return this.readBuffer(buffer, options);
                }
                else if (skipBytes < 0) {
                    throw new Error('`options.position` must be equal or greater than `tokenizer.position`');
                }
            }
            if (options.offset) {
                offset = options.offset;
            }
        }
        if (length === 0) {
            return 0;
        }
        const bytesRead = await this.streamReader.read(buffer, offset, length);
        this.position += bytesRead;
        if ((!options || !options.mayBeLess) && bytesRead < length) {
            throw new peek_readable_1.EndOfStreamError();
        }
        return bytesRead;
    }
    /**
     * Peek (read ahead) buffer from tokenizer
     * @param buffer - Target buffer to write the data read to
     * @param options - Read behaviour options
     * @returns Promise with number of bytes peeked
     */
    async peekBuffer(buffer, options) {
        // const _offset = position ? position : this.position;
        // debug(`peek ${_offset}...${_offset + length - 1}`);
        let offset = 0;
        let bytesRead;
        let length = buffer.length;
        if (options) {
            if (options.offset) {
                offset = options.offset;
            }
            if (Number.isInteger(options.length)) {
                length = options.length;
            }
            else {
                length -= options.offset || 0;
            }
            if (options.position) {
                const skipBytes = options.position - this.position;
                if (skipBytes > 0) {
                    const skipBuffer = Buffer.alloc(length + skipBytes);
                    bytesRead = await this.peekBuffer(skipBuffer, { mayBeLess: options.mayBeLess });
                    skipBuffer.copy(buffer, offset, skipBytes);
                    return bytesRead - skipBytes;
                }
                else if (skipBytes < 0) {
                    throw new Error('Cannot peek from a negative offset in a stream');
                }
            }
        }
        try {
            bytesRead = await this.streamReader.peek(buffer, offset, length);
        }
        catch (err) {
            if (options && options.mayBeLess && err instanceof peek_readable_1.EndOfStreamError) {
                return 0;
            }
            throw err;
        }
        if ((!options || !options.mayBeLess) && bytesRead < length) {
            throw new peek_readable_1.EndOfStreamError();
        }
        return bytesRead;
    }
    async ignore(length) {
        // debug(`ignore ${this.position}...${this.position + length - 1}`);
        const bufSize = Math.min(maxBufferSize, length);
        const buf = Buffer.alloc(bufSize);
        let totBytesRead = 0;
        while (totBytesRead < length) {
            const remaining = length - totBytesRead;
            const bytesRead = await this.readBuffer(buf, { length: Math.min(bufSize, remaining) });
            if (bytesRead < 0) {
                return bytesRead;
            }
            totBytesRead += bytesRead;
        }
        return totBytesRead;
    }
}
exports.ReadStreamTokenizer = ReadStreamTokenizer;
//# sourceMappingURL=ReadStreamTokenizer.js.map

/***/ }),

/***/ 3026:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fromBuffer = exports.fromStream = void 0;
const ReadStreamTokenizer_1 = __webpack_require__(8888);
const BufferTokenizer_1 = __webpack_require__(8054);
var peek_readable_1 = __webpack_require__(3752);
Object.defineProperty(exports, "EndOfStreamError", ({ enumerable: true, get: function () { return peek_readable_1.EndOfStreamError; } }));
/**
 * Construct ReadStreamTokenizer from given Stream.
 * Will set fileSize, if provided given Stream has set the .path property/
 * @param stream - Read from Node.js Stream.Readable
 * @param fileInfo - Pass the file information, like size and MIME-type of the correspnding stream.
 * @returns ReadStreamTokenizer
 */
function fromStream(stream, fileInfo) {
    fileInfo = fileInfo ? fileInfo : {};
    return new ReadStreamTokenizer_1.ReadStreamTokenizer(stream, fileInfo);
}
exports.fromStream = fromStream;
/**
 * Construct ReadStreamTokenizer from given Buffer.
 * @param buffer - Buffer to tokenize
 * @param fileInfo - Pass additional file information to the tokenizer
 * @returns BufferTokenizer
 */
function fromBuffer(buffer, fileInfo) {
    return new BufferTokenizer_1.BufferTokenizer(buffer, fileInfo);
}
exports.fromBuffer = fromBuffer;
//# sourceMappingURL=core.js.map

/***/ }),

/***/ 8569:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fromStream = void 0;
const fs = __webpack_require__(3915);
const core = __webpack_require__(3026);
var FileTokenizer_1 = __webpack_require__(561);
Object.defineProperty(exports, "fromFile", ({ enumerable: true, get: function () { return FileTokenizer_1.fromFile; } }));
var core_1 = __webpack_require__(3026);
Object.defineProperty(exports, "EndOfStreamError", ({ enumerable: true, get: function () { return core_1.EndOfStreamError; } }));
Object.defineProperty(exports, "fromBuffer", ({ enumerable: true, get: function () { return core_1.fromBuffer; } }));
/**
 * Construct ReadStreamTokenizer from given Stream.
 * Will set fileSize, if provided given Stream has set the .path property.
 * @param stream - Node.js Stream.Readable
 * @param fileInfo - Pass additional file information to the tokenizer
 * @returns Tokenizer
 */
async function fromStream(stream, fileInfo) {
    fileInfo = fileInfo ? fileInfo : {};
    if (stream.path) {
        const stat = await fs.stat(stream.path);
        fileInfo.path = stream.path;
        fileInfo.size = stat.size;
    }
    return core.fromStream(stream, fileInfo);
}
exports.fromStream = fromStream;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 4261:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const assert = __webpack_require__(2357);
const ieee754 = __webpack_require__(3092);
// Primitive types
/**
 * 8-bit unsigned integer
 */
exports.UINT8 = {
    len: 1,
    get(buf, off) {
        return buf.readUInt8(off);
    },
    put(buf, off, v) {
        assert.equal(typeof off, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= 0 && v <= 0xff);
        assert.ok(off >= 0);
        assert.ok(this.len <= buf.length);
        return buf.writeUInt8(v, off);
    }
};
/**
 * 16-bit unsigned integer, Little Endian byte order
 */
exports.UINT16_LE = {
    len: 2,
    get(buf, off) {
        return buf.readUInt16LE(off);
    },
    put(buf, off, v) {
        assert.equal(typeof off, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= 0 && v <= 0xffff);
        assert.ok(off >= 0);
        assert.ok(this.len <= buf.length);
        return buf.writeUInt16LE(v, off);
    }
};
/**
 * 16-bit unsigned integer, Big Endian byte order
 */
exports.UINT16_BE = {
    len: 2,
    get(buf, off) {
        return buf.readUInt16BE(off);
    },
    put(buf, off, v) {
        assert.equal(typeof off, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= 0 && v <= 0xffff);
        assert.ok(off >= 0);
        assert.ok(this.len <= buf.length);
        return buf.writeUInt16BE(v, off);
    }
};
/**
 * 24-bit unsigned integer, Little Endian byte order
 */
exports.UINT24_LE = {
    len: 3,
    get(buf, off) {
        return buf.readUIntLE(off, 3);
    },
    put(buf, off, v) {
        assert.equal(typeof off, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= 0 && v <= 0xffffff);
        assert.ok(off >= 0);
        assert.ok(this.len <= buf.length);
        return buf.writeUIntLE(v, off, 3);
    }
};
/**
 * 24-bit unsigned integer, Big Endian byte order
 */
exports.UINT24_BE = {
    len: 3,
    get(buf, off) {
        return buf.readUIntBE(off, 3);
    },
    put(buf, off, v) {
        assert.equal(typeof off, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= 0 && v <= 0xffffff);
        assert.ok(off >= 0);
        assert.ok(this.len <= buf.length);
        return buf.writeUIntBE(v, off, 3);
    }
};
/**
 * 32-bit unsigned integer, Little Endian byte order
 */
exports.UINT32_LE = {
    len: 4,
    get(buf, off) {
        return buf.readUInt32LE(off);
    },
    put(b, o, v) {
        assert.equal(typeof o, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= 0 && v <= 0xffffffff);
        assert.ok(o >= 0);
        assert.ok(this.len <= b.length);
        return b.writeUInt32LE(v, o);
    }
};
/**
 * 32-bit unsigned integer, Big Endian byte order
 */
exports.UINT32_BE = {
    len: 4,
    get(buf, off) {
        return buf.readUInt32BE(off);
    },
    put(buf, off, v) {
        assert.equal(typeof off, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= 0 && v <= 0xffffffff);
        assert.ok(off >= 0);
        assert.ok(this.len <= buf.length);
        return buf.writeUInt32BE(v, off);
    }
};
/**
 * 8-bit signed integer
 */
exports.INT8 = {
    len: 1,
    get(buf, off) {
        return buf.readInt8(off);
    },
    put(buf, off, v) {
        assert.equal(typeof off, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= -128 && v <= 127);
        assert.ok(off >= 0);
        assert.ok(this.len <= buf.length);
        return buf.writeInt8(v, off);
    }
};
/**
 * 16-bit signed integer, Big Endian byte order
 */
exports.INT16_BE = {
    len: 2,
    get(buf, off) {
        return buf.readInt16BE(off);
    },
    put(b, o, v) {
        assert.equal(typeof o, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= -32768 && v <= 32767);
        assert.ok(o >= 0);
        assert.ok(this.len <= b.length);
        return b.writeInt16BE(v, o);
    }
};
/**
 * 16-bit signed integer, Little Endian byte order
 */
exports.INT16_LE = {
    len: 2,
    get(buf, off) {
        return buf.readInt16LE(off);
    },
    put(b, o, v) {
        assert.equal(typeof o, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= -32768 && v <= 32767);
        assert.ok(o >= 0);
        assert.ok(this.len <= b.length);
        return b.writeInt16LE(v, o);
    }
};
/**
 * 24-bit signed integer, Little Endian byte order
 */
exports.INT24_LE = {
    len: 3,
    get(buf, off) {
        return buf.readIntLE(off, 3);
    },
    put(b, o, v) {
        assert.equal(typeof o, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= -0x800000 && v <= 0x7fffff);
        assert.ok(o >= 0);
        assert.ok(this.len <= b.length);
        return b.writeIntLE(v, o, 3);
    }
};
/**
 * 24-bit signed integer, Big Endian byte order
 */
exports.INT24_BE = {
    len: 3,
    get(buf, off) {
        return buf.readIntBE(off, 3);
    },
    put(b, o, v) {
        assert.equal(typeof o, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= -0x800000 && v <= 0x7fffff);
        assert.ok(o >= 0);
        assert.ok(this.len <= b.length);
        return b.writeIntBE(v, o, 3);
    }
};
/**
 * 32-bit signed integer, Big Endian byte order
 */
exports.INT32_BE = {
    len: 4,
    get(buf, off) {
        return buf.readInt32BE(off);
    },
    put(b, o, v) {
        assert.equal(typeof o, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= -2147483648 && v <= 2147483647);
        assert.ok(o >= 0);
        assert.ok(this.len <= b.length);
        return b.writeInt32BE(v, o);
    }
};
/**
 * 32-bit signed integer, Big Endian byte order
 */
exports.INT32_LE = {
    len: 4,
    get(buf, off) {
        return buf.readInt32LE(off);
    },
    put(b, o, v) {
        assert.equal(typeof o, 'number');
        assert.equal(typeof v, 'number');
        assert.ok(v >= -2147483648 && v <= 2147483647);
        assert.ok(o >= 0);
        assert.ok(this.len <= b.length);
        return b.writeInt32LE(v, o);
    }
};
/**
 * 64-bit unsigned integer, Little Endian byte order
 */
exports.UINT64_LE = {
    len: 8,
    get(buf, off) {
        return readUIntLE(buf, off, this.len);
    },
    put(b, o, v) {
        return writeUIntLE(b, v, o, this.len);
    }
};
/**
 * 64-bit signed integer, Little Endian byte order
 */
exports.INT64_LE = {
    len: 8,
    get(buf, off) {
        return readIntLE(buf, off, this.len);
    },
    put(b, off, v) {
        return writeIntLE(b, v, off, this.len);
    }
};
/**
 * 64-bit unsigned integer, Big Endian byte order
 */
exports.UINT64_BE = {
    len: 8,
    get(b, off) {
        return readUIntBE(b, off, this.len);
    },
    put(b, o, v) {
        return writeUIntBE(b, v, o, this.len);
    }
};
/**
 * 64-bit signed integer, Big Endian byte order
 */
exports.INT64_BE = {
    len: 8,
    get(b, off) {
        return readIntBE(b, off, this.len);
    },
    put(b, off, v) {
        return writeIntBE(b, v, off, this.len);
    }
};
/**
 * IEEE 754 16-bit (half precision) float, big endian
 */
exports.Float16_BE = {
    len: 2,
    get(b, off) {
        return ieee754.read(b, off, false, 10, this.len);
    },
    put(b, off, v) {
        return ieee754.write(b, v, off, false, 10, this.len);
    }
};
/**
 * IEEE 754 16-bit (half precision) float, little endian
 */
exports.Float16_LE = {
    len: 2,
    get(b, off) {
        return ieee754.read(b, off, true, 10, this.len);
    },
    put(b, off, v) {
        return ieee754.write(b, v, off, true, 10, this.len);
    }
};
/**
 * IEEE 754 32-bit (single precision) float, big endian
 */
exports.Float32_BE = {
    len: 4,
    get(b, off) {
        return b.readFloatBE(off);
    },
    put(b, off, v) {
        return b.writeFloatBE(v, off);
    }
};
/**
 * IEEE 754 32-bit (single precision) float, little endian
 */
exports.Float32_LE = {
    len: 4,
    get(b, off) {
        return b.readFloatLE(off);
    },
    put(b, off, v) {
        return b.writeFloatLE(v, off);
    }
};
/**
 * IEEE 754 64-bit (double precision) float, big endian
 */
exports.Float64_BE = {
    len: 8,
    get(b, off) {
        return b.readDoubleBE(off);
    },
    put(b, off, v) {
        return b.writeDoubleBE(v, off);
    }
};
/**
 * IEEE 754 64-bit (double precision) float, little endian
 */
exports.Float64_LE = {
    len: 8,
    get(b, off) {
        return b.readDoubleLE(off);
    },
    put(b, off, v) {
        return b.writeDoubleLE(v, off);
    }
};
/**
 * IEEE 754 80-bit (extended precision) float, big endian
 */
exports.Float80_BE = {
    len: 10,
    get(b, off) {
        return ieee754.read(b, off, false, 63, this.len);
    },
    put(b, off, v) {
        return ieee754.write(b, v, off, false, 63, this.len);
    }
};
/**
 * IEEE 754 80-bit (extended precision) float, little endian
 */
exports.Float80_LE = {
    len: 10,
    get(b, off) {
        return ieee754.read(b, off, true, 63, this.len);
    },
    put(b, off, v) {
        return ieee754.write(b, v, off, true, 63, this.len);
    }
};
/**
 * Ignore a given number of bytes
 */
class IgnoreType {
    /**
     * @param len number of bytes to ignore
     */
    constructor(len) {
        this.len = len;
    }
    // ToDo: don't read, but skip data
    get(buf, off) {
    }
}
exports.IgnoreType = IgnoreType;
class BufferType {
    constructor(len) {
        this.len = len;
    }
    get(buf, off) {
        return buf.slice(off, off + this.len);
    }
}
exports.BufferType = BufferType;
/**
 * Consume a fixed number of bytes from the stream and return a string with a specified encoding.
 */
class StringType {
    constructor(len, encoding) {
        this.len = len;
        this.encoding = encoding;
    }
    get(buf, off) {
        return buf.toString(this.encoding, off, off + this.len);
    }
}
exports.StringType = StringType;
/**
 * ANSI Latin 1 String
 * Using windows-1252 / ISO 8859-1 decoding
 */
class AnsiStringType {
    constructor(len) {
        this.len = len;
    }
    static decode(buffer, off, until) {
        let str = '';
        for (let i = off; i < until; ++i) {
            str += AnsiStringType.codePointToString(AnsiStringType.singleByteDecoder(buffer[i]));
        }
        return str;
    }
    static inRange(a, min, max) {
        return min <= a && a <= max;
    }
    static codePointToString(cp) {
        if (cp <= 0xFFFF) {
            return String.fromCharCode(cp);
        }
        else {
            cp -= 0x10000;
            return String.fromCharCode((cp >> 10) + 0xD800, (cp & 0x3FF) + 0xDC00);
        }
    }
    static singleByteDecoder(bite) {
        if (AnsiStringType.inRange(bite, 0x00, 0x7F)) {
            return bite;
        }
        const codePoint = AnsiStringType.windows1252[bite - 0x80];
        if (codePoint === null) {
            throw Error('invaliding encoding');
        }
        return codePoint;
    }
    get(buf, off = 0) {
        return AnsiStringType.decode(buf, off, off + this.len);
    }
}
exports.AnsiStringType = AnsiStringType;
AnsiStringType.windows1252 = [8364, 129, 8218, 402, 8222, 8230, 8224, 8225, 710, 8240, 352,
    8249, 338, 141, 381, 143, 144, 8216, 8217, 8220, 8221, 8226, 8211, 8212, 732,
    8482, 353, 8250, 339, 157, 382, 376, 160, 161, 162, 163, 164, 165, 166, 167, 168,
    169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184,
    185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200,
    201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216,
    217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232,
    233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247,
    248, 249, 250, 251, 252, 253, 254, 255];
/**
 * Best effort approach to read up to 64 bit unsigned integer, little endian.
 * Note that JavasScript is limited to 2^53 - 1 bit.
 */
function readUIntLE(buf, offset, byteLength) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    let val = buf[offset];
    let mul = 1;
    let i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
        val += buf[offset + i] * mul;
    }
    return val;
}
/**
 * Best effort approach to write up to 64 bit unsigned integer, little endian.
 * Note that JavasScript is limited to 2^53 - 1 bit.
 */
function writeUIntLE(buf, value, offset, byteLength) {
    value = +value;
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    let mul = 1;
    let i = 0;
    buf[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
        buf[offset + i] = (value / mul) & 0xFF;
    }
    return offset + byteLength;
}
/**
 * Best effort approach to read 64 but signed integer, little endian.
 * Note that JavasScript is limited to 2^53 - 1 bit.
 */
function readIntLE(buf, offset, byteLength) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    let val = buf[offset];
    let mul = 1;
    let i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
        val += buf[offset + i] * mul;
    }
    mul *= 0x80;
    if (val >= mul)
        val -= Math.pow(2, 8 * byteLength);
    return val;
}
/**
 * Best effort approach to write 64 but signed integer, little endian.
 * Note that JavasScript is limited to 2^53 - 1 bit.
 */
function writeIntLE(buf, value, offset, byteLength) {
    value = +value;
    offset = offset >>> 0;
    let i = 0;
    let mul = 1;
    let sub = 0;
    buf[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && buf[offset + i - 1] !== 0) {
            sub = 1;
        }
        buf[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }
    return offset + byteLength;
}
exports.writeIntLE = writeIntLE;
/**
 * Best effort approach to read up to 64 bit unsigned integer, big endian.
 * Note that JavasScript is limited to 2^53 - 1 bit.
 */
function readUIntBE(buf, offset, byteLength) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    let val = buf[offset + --byteLength];
    let mul = 1;
    while (byteLength > 0 && (mul *= 0x100)) {
        val += buf[offset + --byteLength] * mul;
    }
    return val;
}
exports.readUIntBE = readUIntBE;
/**
 * Best effort approach to write up to 64 bit unsigned integer, big endian.
 * Note that JavasScript is limited to 2^53 - 1 bit.
 */
function writeUIntBE(buf, value, offset, byteLength) {
    value = +value;
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    let i = byteLength - 1;
    let mul = 1;
    buf[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
        buf[offset + i] = (value / mul) & 0xFF;
    }
    return offset + byteLength;
}
exports.writeUIntBE = writeUIntBE;
/**
 * Best effort approach to read 64 but signed integer, big endian.
 * Note that JavasScript is limited to 2^53 - 1 bit.
 */
function readIntBE(buf, offset, byteLength) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    let i = byteLength;
    let mul = 1;
    let val = buf[offset + --i];
    while (i > 0 && (mul *= 0x100)) {
        val += buf[offset + --i] * mul;
    }
    mul *= 0x80;
    if (val >= mul)
        val -= Math.pow(2, 8 * byteLength);
    return val;
}
exports.readIntBE = readIntBE;
/**
 * Best effort approach to write 64 but signed integer, big endian.
 * Note that JavasScript is limited to 2^53 - 1 bit.
 */
function writeIntBE(buf, value, offset, byteLength) {
    value = +value;
    offset = offset >>> 0;
    let i = byteLength - 1;
    let mul = 1;
    let sub = 0;
    buf[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
        if (value < 0 && sub === 0 && buf[offset + i + 1] !== 0) {
            sub = 1;
        }
        buf[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }
    return offset + byteLength;
}
exports.writeIntBE = writeIntBE;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 4294:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(4219);


/***/ }),

/***/ 4219:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


var net = __webpack_require__(1631);
var tls = __webpack_require__(4016);
var http = __webpack_require__(8605);
var https = __webpack_require__(7211);
var events = __webpack_require__(8614);
var assert = __webpack_require__(2357);
var util = __webpack_require__(1669);


exports.httpOverHttp = httpOverHttp;
exports.httpsOverHttp = httpsOverHttp;
exports.httpOverHttps = httpOverHttps;
exports.httpsOverHttps = httpsOverHttps;


function httpOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  return agent;
}

function httpsOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}

function httpOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  return agent;
}

function httpsOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent;
}


function TunnelingAgent(options) {
  var self = this;
  self.options = options || {};
  self.proxyOptions = self.options.proxy || {};
  self.maxSockets = self.options.maxSockets || http.Agent.defaultMaxSockets;
  self.requests = [];
  self.sockets = [];

  self.on('free', function onFree(socket, host, port, localAddress) {
    var options = toOptions(host, port, localAddress);
    for (var i = 0, len = self.requests.length; i < len; ++i) {
      var pending = self.requests[i];
      if (pending.host === options.host && pending.port === options.port) {
        // Detect the request to connect same origin server,
        // reuse the connection.
        self.requests.splice(i, 1);
        pending.request.onSocket(socket);
        return;
      }
    }
    socket.destroy();
    self.removeSocket(socket);
  });
}
util.inherits(TunnelingAgent, events.EventEmitter);

TunnelingAgent.prototype.addRequest = function addRequest(req, host, port, localAddress) {
  var self = this;
  var options = mergeOptions({request: req}, self.options, toOptions(host, port, localAddress));

  if (self.sockets.length >= this.maxSockets) {
    // We are over limit so we'll add it to the queue.
    self.requests.push(options);
    return;
  }

  // If we are under maxSockets create a new one.
  self.createSocket(options, function(socket) {
    socket.on('free', onFree);
    socket.on('close', onCloseOrRemove);
    socket.on('agentRemove', onCloseOrRemove);
    req.onSocket(socket);

    function onFree() {
      self.emit('free', socket, options);
    }

    function onCloseOrRemove(err) {
      self.removeSocket(socket);
      socket.removeListener('free', onFree);
      socket.removeListener('close', onCloseOrRemove);
      socket.removeListener('agentRemove', onCloseOrRemove);
    }
  });
};

TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
  var self = this;
  var placeholder = {};
  self.sockets.push(placeholder);

  var connectOptions = mergeOptions({}, self.proxyOptions, {
    method: 'CONNECT',
    path: options.host + ':' + options.port,
    agent: false,
    headers: {
      host: options.host + ':' + options.port
    }
  });
  if (options.localAddress) {
    connectOptions.localAddress = options.localAddress;
  }
  if (connectOptions.proxyAuth) {
    connectOptions.headers = connectOptions.headers || {};
    connectOptions.headers['Proxy-Authorization'] = 'Basic ' +
        new Buffer(connectOptions.proxyAuth).toString('base64');
  }

  debug('making CONNECT request');
  var connectReq = self.request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false; // for v0.6
  connectReq.once('response', onResponse); // for v0.6
  connectReq.once('upgrade', onUpgrade);   // for v0.6
  connectReq.once('connect', onConnect);   // for v0.7 or later
  connectReq.once('error', onError);
  connectReq.end();

  function onResponse(res) {
    // Very hacky. This is necessary to avoid http-parser leaks.
    res.upgrade = true;
  }

  function onUpgrade(res, socket, head) {
    // Hacky.
    process.nextTick(function() {
      onConnect(res, socket, head);
    });
  }

  function onConnect(res, socket, head) {
    connectReq.removeAllListeners();
    socket.removeAllListeners();

    if (res.statusCode !== 200) {
      debug('tunneling socket could not be established, statusCode=%d',
        res.statusCode);
      socket.destroy();
      var error = new Error('tunneling socket could not be established, ' +
        'statusCode=' + res.statusCode);
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    if (head.length > 0) {
      debug('got illegal response body from proxy');
      socket.destroy();
      var error = new Error('got illegal response body from proxy');
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
      return;
    }
    debug('tunneling connection has established');
    self.sockets[self.sockets.indexOf(placeholder)] = socket;
    return cb(socket);
  }

  function onError(cause) {
    connectReq.removeAllListeners();

    debug('tunneling socket could not be established, cause=%s\n',
          cause.message, cause.stack);
    var error = new Error('tunneling socket could not be established, ' +
                          'cause=' + cause.message);
    error.code = 'ECONNRESET';
    options.request.emit('error', error);
    self.removeSocket(placeholder);
  }
};

TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
  var pos = this.sockets.indexOf(socket)
  if (pos === -1) {
    return;
  }
  this.sockets.splice(pos, 1);

  var pending = this.requests.shift();
  if (pending) {
    // If we have pending requests and a socket gets closed a new one
    // needs to be created to take over in the pool for the one that closed.
    this.createSocket(pending, function(socket) {
      pending.request.onSocket(socket);
    });
  }
};

function createSecureSocket(options, cb) {
  var self = this;
  TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
    var hostHeader = options.request.getHeader('host');
    var tlsOptions = mergeOptions({}, self.options, {
      socket: socket,
      servername: hostHeader ? hostHeader.replace(/:.*$/, '') : options.host
    });

    // 0 is dummy port for v0.6
    var secureSocket = tls.connect(0, tlsOptions);
    self.sockets[self.sockets.indexOf(socket)] = secureSocket;
    cb(secureSocket);
  });
}


function toOptions(host, port, localAddress) {
  if (typeof host === 'string') { // since v0.10
    return {
      host: host,
      port: port,
      localAddress: localAddress
    };
  }
  return host; // for v0.11 or later
}

function mergeOptions(target) {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var overrides = arguments[i];
    if (typeof overrides === 'object') {
      var keys = Object.keys(overrides);
      for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
        var k = keys[j];
        if (overrides[k] !== undefined) {
          target[k] = overrides[k];
        }
      }
    }
  }
  return target;
}


var debug;
if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
  debug = function() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] === 'string') {
      args[0] = 'TUNNEL: ' + args[0];
    } else {
      args.unshift('TUNNEL:');
    }
    console.error.apply(console, args);
  }
} else {
  debug = function() {};
}
exports.debug = debug; // for test


/***/ }),

/***/ 5030:
/***/ ((__unused_webpack_module, exports) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

function getUserAgent() {
  if (typeof navigator === "object" && "userAgent" in navigator) {
    return navigator.userAgent;
  }

  if (typeof process === "object" && "version" in process) {
    return `Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`;
  }

  return "<environment undetectable>";
}

exports.getUserAgent = getUserAgent;
//# sourceMappingURL=index.js.map


/***/ }),

/***/ 2940:
/***/ ((module) => {

// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
module.exports = wrappy
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k]
  })

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    var ret = fn.apply(this, args)
    var cb = args[args.length-1]
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k]
      })
    }
    return ret
  }
}


/***/ }),

/***/ 6881:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

function DOMParser(options){
	this.options = options ||{locator:{}};
	
}
DOMParser.prototype.parseFromString = function(source,mimeType){
	var options = this.options;
	var sax =  new XMLReader();
	var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
	var errorHandler = options.errorHandler;
	var locator = options.locator;
	var defaultNSMap = options.xmlns||{};
	var entityMap = {'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"}
	if(locator){
		domBuilder.setDocumentLocator(locator)
	}
	
	sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
	sax.domBuilder = options.domBuilder || domBuilder;
	if(/\/x?html?$/.test(mimeType)){
		entityMap.nbsp = '\xa0';
		entityMap.copy = '\xa9';
		defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
	}
	defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
	if(source){
		sax.parse(source,defaultNSMap,entityMap);
	}else{
		sax.errorHandler.error("invalid doc source");
	}
	return domBuilder.doc;
}
function buildErrorHandler(errorImpl,domBuilder,locator){
	if(!errorImpl){
		if(domBuilder instanceof DOMHandler){
			return domBuilder;
		}
		errorImpl = domBuilder ;
	}
	var errorHandler = {}
	var isCallback = errorImpl instanceof Function;
	locator = locator||{}
	function build(key){
		var fn = errorImpl[key];
		if(!fn && isCallback){
			fn = errorImpl.length == 2?function(msg){errorImpl(key,msg)}:errorImpl;
		}
		errorHandler[key] = fn && function(msg){
			fn('[xmldom '+key+']\t'+msg+_locator(locator));
		}||function(){};
	}
	build('warning');
	build('error');
	build('fatalError');
	return errorHandler;
}

//console.log('#\n\n\n\n\n\n\n####')
/**
 * +ContentHandler+ErrorHandler
 * +LexicalHandler+EntityResolver2
 * -DeclHandler-DTDHandler 
 * 
 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
 */
function DOMHandler() {
    this.cdata = false;
}
function position(locator,node){
	node.lineNumber = locator.lineNumber;
	node.columnNumber = locator.columnNumber;
}
/**
 * @see org.xml.sax.ContentHandler#startDocument
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
 */ 
DOMHandler.prototype = {
	startDocument : function() {
    	this.doc = new DOMImplementation().createDocument(null, null, null);
    	if (this.locator) {
        	this.doc.documentURI = this.locator.systemId;
    	}
	},
	startElement:function(namespaceURI, localName, qName, attrs) {
		var doc = this.doc;
	    var el = doc.createElementNS(namespaceURI, qName||localName);
	    var len = attrs.length;
	    appendElement(this, el);
	    this.currentElement = el;
	    
		this.locator && position(this.locator,el)
	    for (var i = 0 ; i < len; i++) {
	        var namespaceURI = attrs.getURI(i);
	        var value = attrs.getValue(i);
	        var qName = attrs.getQName(i);
			var attr = doc.createAttributeNS(namespaceURI, qName);
			this.locator &&position(attrs.getLocator(i),attr);
			attr.value = attr.nodeValue = value;
			el.setAttributeNode(attr)
	    }
	},
	endElement:function(namespaceURI, localName, qName) {
		var current = this.currentElement
		var tagName = current.tagName;
		this.currentElement = current.parentNode;
	},
	startPrefixMapping:function(prefix, uri) {
	},
	endPrefixMapping:function(prefix) {
	},
	processingInstruction:function(target, data) {
	    var ins = this.doc.createProcessingInstruction(target, data);
	    this.locator && position(this.locator,ins)
	    appendElement(this, ins);
	},
	ignorableWhitespace:function(ch, start, length) {
	},
	characters:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
		//console.log(chars)
		if(chars){
			if (this.cdata) {
				var charNode = this.doc.createCDATASection(chars);
			} else {
				var charNode = this.doc.createTextNode(chars);
			}
			if(this.currentElement){
				this.currentElement.appendChild(charNode);
			}else if(/^\s*$/.test(chars)){
				this.doc.appendChild(charNode);
				//process xml
			}
			this.locator && position(this.locator,charNode)
		}
	},
	skippedEntity:function(name) {
	},
	endDocument:function() {
		this.doc.normalize();
	},
	setDocumentLocator:function (locator) {
	    if(this.locator = locator){// && !('lineNumber' in locator)){
	    	locator.lineNumber = 0;
	    }
	},
	//LexicalHandler
	comment:function(chars, start, length) {
		chars = _toString.apply(this,arguments)
	    var comm = this.doc.createComment(chars);
	    this.locator && position(this.locator,comm)
	    appendElement(this, comm);
	},
	
	startCDATA:function() {
	    //used in characters() methods
	    this.cdata = true;
	},
	endCDATA:function() {
	    this.cdata = false;
	},
	
	startDTD:function(name, publicId, systemId) {
		var impl = this.doc.implementation;
	    if (impl && impl.createDocumentType) {
	        var dt = impl.createDocumentType(name, publicId, systemId);
	        this.locator && position(this.locator,dt)
	        appendElement(this, dt);
	    }
	},
	/**
	 * @see org.xml.sax.ErrorHandler
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
	 */
	warning:function(error) {
		console.warn('[xmldom warning]\t'+error,_locator(this.locator));
	},
	error:function(error) {
		console.error('[xmldom error]\t'+error,_locator(this.locator));
	},
	fatalError:function(error) {
		console.error('[xmldom fatalError]\t'+error,_locator(this.locator));
	    throw error;
	}
}
function _locator(l){
	if(l){
		return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
	}
}
function _toString(chars,start,length){
	if(typeof chars == 'string'){
		return chars.substr(start,length)
	}else{//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
		if(chars.length >= start+length || start){
			return new java.lang.String(chars,start,length)+'';
		}
		return chars;
	}
}

/*
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
 * used method of org.xml.sax.ext.LexicalHandler:
 *  #comment(chars, start, length)
 *  #startCDATA()
 *  #endCDATA()
 *  #startDTD(name, publicId, systemId)
 *
 *
 * IGNORED method of org.xml.sax.ext.LexicalHandler:
 *  #endDTD()
 *  #startEntity(name)
 *  #endEntity(name)
 *
 *
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
 * IGNORED method of org.xml.sax.ext.DeclHandler
 * 	#attributeDecl(eName, aName, type, mode, value)
 *  #elementDecl(name, model)
 *  #externalEntityDecl(name, publicId, systemId)
 *  #internalEntityDecl(name, value)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
 * IGNORED method of org.xml.sax.EntityResolver2
 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
 *  #resolveEntity(publicId, systemId)
 *  #getExternalSubset(name, baseURI)
 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
 * IGNORED method of org.xml.sax.DTDHandler
 *  #notationDecl(name, publicId, systemId) {};
 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
 */
"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
	DOMHandler.prototype[key] = function(){return null}
})

/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
function appendElement (hander,node) {
    if (!hander.currentElement) {
        hander.doc.appendChild(node);
    } else {
        hander.currentElement.appendChild(node);
    }
}//appendChild and setAttributeNS are preformance key

//if(typeof require == 'function'){
	var XMLReader = __webpack_require__(6618)/* .XMLReader */ .G;
	var DOMImplementation = /* unused reexport */ __webpack_require__(1810).DOMImplementation;
	/* unused reexport */ __webpack_require__(1810) ;
	exports.a = DOMParser;
//}


/***/ }),

/***/ 1810:
/***/ ((__unused_webpack_module, exports) => {

var __webpack_unused_export__;
/*
 * DOM Level 2
 * Object DOMException
 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
 */

function copy(src,dest){
	for(var p in src){
		dest[p] = src[p];
	}
}
/**
^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
 */
function _extends(Class,Super){
	var pt = Class.prototype;
	if(Object.create){
		var ppt = Object.create(Super.prototype)
		pt.__proto__ = ppt;
	}
	if(!(pt instanceof Super)){
		function t(){};
		t.prototype = Super.prototype;
		t = new t();
		copy(pt,t);
		Class.prototype = pt = t;
	}
	if(pt.constructor != Class){
		if(typeof Class != 'function'){
			console.error("unknow Class:"+Class)
		}
		pt.constructor = Class
	}
}
var htmlns = 'http://www.w3.org/1999/xhtml' ;
// Node Types
var NodeType = {}
var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

// ExceptionCode
var ExceptionCode = {}
var ExceptionMessage = {};
var INDEX_SIZE_ERR              = ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
var DOMSTRING_SIZE_ERR          = ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
var WRONG_DOCUMENT_ERR          = ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
var INVALID_CHARACTER_ERR       = ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
var NO_DATA_ALLOWED_ERR         = ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
var NO_MODIFICATION_ALLOWED_ERR = ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
var NOT_SUPPORTED_ERR           = ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
//level2
var INVALID_STATE_ERR        	= ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
var SYNTAX_ERR               	= ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
var INVALID_MODIFICATION_ERR 	= ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
var NAMESPACE_ERR            	= ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
var INVALID_ACCESS_ERR       	= ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);


function DOMException(code, message) {
	if(message instanceof Error){
		var error = message;
	}else{
		error = this;
		Error.call(this, ExceptionMessage[code]);
		this.message = ExceptionMessage[code];
		if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
	}
	error.code = code;
	if(message) this.message = this.message + ": " + message;
	return error;
};
DOMException.prototype = Error.prototype;
copy(ExceptionCode,DOMException)
/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
 * The items in the NodeList are accessible via an integral index, starting from 0.
 */
function NodeList() {
};
NodeList.prototype = {
	/**
	 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
	 * @standard level1
	 */
	length:0, 
	/**
	 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
	 * @standard level1
	 * @param index  unsigned long 
	 *   Index into the collection.
	 * @return Node
	 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
	 */
	item: function(index) {
		return this[index] || null;
	},
	toString:function(isHTML,nodeFilter){
		for(var buf = [], i = 0;i<this.length;i++){
			serializeToString(this[i],buf,isHTML,nodeFilter);
		}
		return buf.join('');
	}
};
function LiveNodeList(node,refresh){
	this._node = node;
	this._refresh = refresh
	_updateLiveList(this);
}
function _updateLiveList(list){
	var inc = list._node._inc || list._node.ownerDocument._inc;
	if(list._inc != inc){
		var ls = list._refresh(list._node);
		//console.log(ls.length)
		__set__(list,'length',ls.length);
		copy(ls,list);
		list._inc = inc;
	}
}
LiveNodeList.prototype.item = function(i){
	_updateLiveList(this);
	return this[i];
}

_extends(LiveNodeList,NodeList);
/**
 * 
 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
 * NamedNodeMap objects in the DOM are live.
 * used for attributes or DocumentType entities 
 */
function NamedNodeMap() {
};

function _findNodeIndex(list,node){
	var i = list.length;
	while(i--){
		if(list[i] === node){return i}
	}
}

function _addNamedNode(el,list,newAttr,oldAttr){
	if(oldAttr){
		list[_findNodeIndex(list,oldAttr)] = newAttr;
	}else{
		list[list.length++] = newAttr;
	}
	if(el){
		newAttr.ownerElement = el;
		var doc = el.ownerDocument;
		if(doc){
			oldAttr && _onRemoveAttribute(doc,el,oldAttr);
			_onAddAttribute(doc,el,newAttr);
		}
	}
}
function _removeNamedNode(el,list,attr){
	//console.log('remove attr:'+attr)
	var i = _findNodeIndex(list,attr);
	if(i>=0){
		var lastIndex = list.length-1
		while(i<lastIndex){
			list[i] = list[++i]
		}
		list.length = lastIndex;
		if(el){
			var doc = el.ownerDocument;
			if(doc){
				_onRemoveAttribute(doc,el,attr);
				attr.ownerElement = null;
			}
		}
	}else{
		throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
	}
}
NamedNodeMap.prototype = {
	length:0,
	item:NodeList.prototype.item,
	getNamedItem: function(key) {
//		if(key.indexOf(':')>0 || key == 'xmlns'){
//			return null;
//		}
		//console.log()
		var i = this.length;
		while(i--){
			var attr = this[i];
			//console.log(attr.nodeName,key)
			if(attr.nodeName == key){
				return attr;
			}
		}
	},
	setNamedItem: function(attr) {
		var el = attr.ownerElement;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		var oldAttr = this.getNamedItem(attr.nodeName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},
	/* returns Node */
	setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
		var el = attr.ownerElement, oldAttr;
		if(el && el!=this._ownerElement){
			throw new DOMException(INUSE_ATTRIBUTE_ERR);
		}
		oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
		_addNamedNode(this._ownerElement,this,attr,oldAttr);
		return oldAttr;
	},

	/* returns Node */
	removeNamedItem: function(key) {
		var attr = this.getNamedItem(key);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
		
		
	},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
	
	//for level2
	removeNamedItemNS:function(namespaceURI,localName){
		var attr = this.getNamedItemNS(namespaceURI,localName);
		_removeNamedNode(this._ownerElement,this,attr);
		return attr;
	},
	getNamedItemNS: function(namespaceURI, localName) {
		var i = this.length;
		while(i--){
			var node = this[i];
			if(node.localName == localName && node.namespaceURI == namespaceURI){
				return node;
			}
		}
		return null;
	}
};
/**
 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
 */
function DOMImplementation(/* Object */ features) {
	this._features = {};
	if (features) {
		for (var feature in features) {
			 this._features = features[feature];
		}
	}
};

DOMImplementation.prototype = {
	hasFeature: function(/* string */ feature, /* string */ version) {
		var versions = this._features[feature.toLowerCase()];
		if (versions && (!version || version in versions)) {
			return true;
		} else {
			return false;
		}
	},
	// Introduced in DOM Level 2:
	createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
		var doc = new Document();
		doc.implementation = this;
		doc.childNodes = new NodeList();
		doc.doctype = doctype;
		if(doctype){
			doc.appendChild(doctype);
		}
		if(qualifiedName){
			var root = doc.createElementNS(namespaceURI,qualifiedName);
			doc.appendChild(root);
		}
		return doc;
	},
	// Introduced in DOM Level 2:
	createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
		var node = new DocumentType();
		node.name = qualifiedName;
		node.nodeName = qualifiedName;
		node.publicId = publicId;
		node.systemId = systemId;
		// Introduced in DOM Level 2:
		//readonly attribute DOMString        internalSubset;
		
		//TODO:..
		//  readonly attribute NamedNodeMap     entities;
		//  readonly attribute NamedNodeMap     notations;
		return node;
	}
};


/**
 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
 */

function Node() {
};

Node.prototype = {
	firstChild : null,
	lastChild : null,
	previousSibling : null,
	nextSibling : null,
	attributes : null,
	parentNode : null,
	childNodes : null,
	ownerDocument : null,
	nodeValue : null,
	namespaceURI : null,
	prefix : null,
	localName : null,
	// Modified in DOM Level 2:
	insertBefore:function(newChild, refChild){//raises 
		return _insertBefore(this,newChild,refChild);
	},
	replaceChild:function(newChild, oldChild){//raises 
		this.insertBefore(newChild,oldChild);
		if(oldChild){
			this.removeChild(oldChild);
		}
	},
	removeChild:function(oldChild){
		return _removeChild(this,oldChild);
	},
	appendChild:function(newChild){
		return this.insertBefore(newChild,null);
	},
	hasChildNodes:function(){
		return this.firstChild != null;
	},
	cloneNode:function(deep){
		return cloneNode(this.ownerDocument||this,this,deep);
	},
	// Modified in DOM Level 2:
	normalize:function(){
		var child = this.firstChild;
		while(child){
			var next = child.nextSibling;
			if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
				this.removeChild(next);
				child.appendData(next.data);
			}else{
				child.normalize();
				child = next;
			}
		}
	},
  	// Introduced in DOM Level 2:
	isSupported:function(feature, version){
		return this.ownerDocument.implementation.hasFeature(feature,version);
	},
    // Introduced in DOM Level 2:
    hasAttributes:function(){
    	return this.attributes.length>0;
    },
    lookupPrefix:function(namespaceURI){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			for(var n in map){
    				if(map[n] == namespaceURI){
    					return n;
    				}
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    lookupNamespaceURI:function(prefix){
    	var el = this;
    	while(el){
    		var map = el._nsMap;
    		//console.dir(map)
    		if(map){
    			if(prefix in map){
    				return map[prefix] ;
    			}
    		}
    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
    	}
    	return null;
    },
    // Introduced in DOM Level 3:
    isDefaultNamespace:function(namespaceURI){
    	var prefix = this.lookupPrefix(namespaceURI);
    	return prefix == null;
    }
};


function _xmlEncoder(c){
	return c == '<' && '&lt;' ||
         c == '>' && '&gt;' ||
         c == '&' && '&amp;' ||
         c == '"' && '&quot;' ||
         '&#'+c.charCodeAt()+';'
}


copy(NodeType,Node);
copy(NodeType,Node.prototype);

/**
 * @param callback return true for continue,false for break
 * @return boolean true: break visit;
 */
function _visitNode(node,callback){
	if(callback(node)){
		return true;
	}
	if(node = node.firstChild){
		do{
			if(_visitNode(node,callback)){return true}
        }while(node=node.nextSibling)
    }
}



function Document(){
}
function _onAddAttribute(doc,el,newAttr){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value
	}
}
function _onRemoveAttribute(doc,el,newAttr,remove){
	doc && doc._inc++;
	var ns = newAttr.namespaceURI ;
	if(ns == 'http://www.w3.org/2000/xmlns/'){
		//update namespace
		delete el._nsMap[newAttr.prefix?newAttr.localName:'']
	}
}
function _onUpdateChild(doc,el,newChild){
	if(doc && doc._inc){
		doc._inc++;
		//update childNodes
		var cs = el.childNodes;
		if(newChild){
			cs[cs.length++] = newChild;
		}else{
			//console.log(1)
			var child = el.firstChild;
			var i = 0;
			while(child){
				cs[i++] = child;
				child =child.nextSibling;
			}
			cs.length = i;
		}
	}
}

/**
 * attributes;
 * children;
 * 
 * writeable properties:
 * nodeValue,Attr:value,CharacterData:data
 * prefix
 */
function _removeChild(parentNode,child){
	var previous = child.previousSibling;
	var next = child.nextSibling;
	if(previous){
		previous.nextSibling = next;
	}else{
		parentNode.firstChild = next
	}
	if(next){
		next.previousSibling = previous;
	}else{
		parentNode.lastChild = previous;
	}
	_onUpdateChild(parentNode.ownerDocument,parentNode);
	return child;
}
/**
 * preformance key(refChild == null)
 */
function _insertBefore(parentNode,newChild,nextChild){
	var cp = newChild.parentNode;
	if(cp){
		cp.removeChild(newChild);//remove and update
	}
	if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
		var newFirst = newChild.firstChild;
		if (newFirst == null) {
			return newChild;
		}
		var newLast = newChild.lastChild;
	}else{
		newFirst = newLast = newChild;
	}
	var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

	newFirst.previousSibling = pre;
	newLast.nextSibling = nextChild;
	
	
	if(pre){
		pre.nextSibling = newFirst;
	}else{
		parentNode.firstChild = newFirst;
	}
	if(nextChild == null){
		parentNode.lastChild = newLast;
	}else{
		nextChild.previousSibling = newLast;
	}
	do{
		newFirst.parentNode = parentNode;
	}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
	_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
	//console.log(parentNode.lastChild.nextSibling == null)
	if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
		newChild.firstChild = newChild.lastChild = null;
	}
	return newChild;
}
function _appendSingleChild(parentNode,newChild){
	var cp = newChild.parentNode;
	if(cp){
		var pre = parentNode.lastChild;
		cp.removeChild(newChild);//remove and update
		var pre = parentNode.lastChild;
	}
	var pre = parentNode.lastChild;
	newChild.parentNode = parentNode;
	newChild.previousSibling = pre;
	newChild.nextSibling = null;
	if(pre){
		pre.nextSibling = newChild;
	}else{
		parentNode.firstChild = newChild;
	}
	parentNode.lastChild = newChild;
	_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
	return newChild;
	//console.log("__aa",parentNode.lastChild.nextSibling == null)
}
Document.prototype = {
	//implementation : null,
	nodeName :  '#document',
	nodeType :  DOCUMENT_NODE,
	doctype :  null,
	documentElement :  null,
	_inc : 1,
	
	insertBefore :  function(newChild, refChild){//raises 
		if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
			var child = newChild.firstChild;
			while(child){
				var next = child.nextSibling;
				this.insertBefore(child,refChild);
				child = next;
			}
			return newChild;
		}
		if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
			this.documentElement = newChild;
		}
		
		return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
	},
	removeChild :  function(oldChild){
		if(this.documentElement == oldChild){
			this.documentElement = null;
		}
		return _removeChild(this,oldChild);
	},
	// Introduced in DOM Level 2:
	importNode : function(importedNode,deep){
		return importNode(this,importedNode,deep);
	},
	// Introduced in DOM Level 2:
	getElementById :	function(id){
		var rtv = null;
		_visitNode(this.documentElement,function(node){
			if(node.nodeType == ELEMENT_NODE){
				if(node.getAttribute('id') == id){
					rtv = node;
					return true;
				}
			}
		})
		return rtv;
	},
	
	//document factory method:
	createElement :	function(tagName){
		var node = new Element();
		node.ownerDocument = this;
		node.nodeName = tagName;
		node.tagName = tagName;
		node.childNodes = new NodeList();
		var attrs	= node.attributes = new NamedNodeMap();
		attrs._ownerElement = node;
		return node;
	},
	createDocumentFragment :	function(){
		var node = new DocumentFragment();
		node.ownerDocument = this;
		node.childNodes = new NodeList();
		return node;
	},
	createTextNode :	function(data){
		var node = new Text();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createComment :	function(data){
		var node = new Comment();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createCDATASection :	function(data){
		var node = new CDATASection();
		node.ownerDocument = this;
		node.appendData(data)
		return node;
	},
	createProcessingInstruction :	function(target,data){
		var node = new ProcessingInstruction();
		node.ownerDocument = this;
		node.tagName = node.target = target;
		node.nodeValue= node.data = data;
		return node;
	},
	createAttribute :	function(name){
		var node = new Attr();
		node.ownerDocument	= this;
		node.name = name;
		node.nodeName	= name;
		node.localName = name;
		node.specified = true;
		return node;
	},
	createEntityReference :	function(name){
		var node = new EntityReference();
		node.ownerDocument	= this;
		node.nodeName	= name;
		return node;
	},
	// Introduced in DOM Level 2:
	createElementNS :	function(namespaceURI,qualifiedName){
		var node = new Element();
		var pl = qualifiedName.split(':');
		var attrs	= node.attributes = new NamedNodeMap();
		node.childNodes = new NodeList();
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.tagName = qualifiedName;
		node.namespaceURI = namespaceURI;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		attrs._ownerElement = node;
		return node;
	},
	// Introduced in DOM Level 2:
	createAttributeNS :	function(namespaceURI,qualifiedName){
		var node = new Attr();
		var pl = qualifiedName.split(':');
		node.ownerDocument = this;
		node.nodeName = qualifiedName;
		node.name = qualifiedName;
		node.namespaceURI = namespaceURI;
		node.specified = true;
		if(pl.length == 2){
			node.prefix = pl[0];
			node.localName = pl[1];
		}else{
			//el.prefix = null;
			node.localName = qualifiedName;
		}
		return node;
	}
};
_extends(Document,Node);


function Element() {
	this._nsMap = {};
};
Element.prototype = {
	nodeType : ELEMENT_NODE,
	hasAttribute : function(name){
		return this.getAttributeNode(name)!=null;
	},
	getAttribute : function(name){
		var attr = this.getAttributeNode(name);
		return attr && attr.value || '';
	},
	getAttributeNode : function(name){
		return this.attributes.getNamedItem(name);
	},
	setAttribute : function(name, value){
		var attr = this.ownerDocument.createAttribute(name);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	removeAttribute : function(name){
		var attr = this.getAttributeNode(name)
		attr && this.removeAttributeNode(attr);
	},
	
	//four real opeartion method
	appendChild:function(newChild){
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			return this.insertBefore(newChild,null);
		}else{
			return _appendSingleChild(this,newChild);
		}
	},
	setAttributeNode : function(newAttr){
		return this.attributes.setNamedItem(newAttr);
	},
	setAttributeNodeNS : function(newAttr){
		return this.attributes.setNamedItemNS(newAttr);
	},
	removeAttributeNode : function(oldAttr){
		//console.log(this == oldAttr.ownerElement)
		return this.attributes.removeNamedItem(oldAttr.nodeName);
	},
	//get real attribute name,and remove it by removeAttributeNode
	removeAttributeNS : function(namespaceURI, localName){
		var old = this.getAttributeNodeNS(namespaceURI, localName);
		old && this.removeAttributeNode(old);
	},
	
	hasAttributeNS : function(namespaceURI, localName){
		return this.getAttributeNodeNS(namespaceURI, localName)!=null;
	},
	getAttributeNS : function(namespaceURI, localName){
		var attr = this.getAttributeNodeNS(namespaceURI, localName);
		return attr && attr.value || '';
	},
	setAttributeNS : function(namespaceURI, qualifiedName, value){
		var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
		attr.value = attr.nodeValue = "" + value;
		this.setAttributeNode(attr)
	},
	getAttributeNodeNS : function(namespaceURI, localName){
		return this.attributes.getNamedItemNS(namespaceURI, localName);
	},
	
	getElementsByTagName : function(tagName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
					ls.push(node);
				}
			});
			return ls;
		});
	},
	getElementsByTagNameNS : function(namespaceURI, localName){
		return new LiveNodeList(this,function(base){
			var ls = [];
			_visitNode(base,function(node){
				if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
					ls.push(node);
				}
			});
			return ls;
			
		});
	}
};
Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


_extends(Element,Node);
function Attr() {
};
Attr.prototype.nodeType = ATTRIBUTE_NODE;
_extends(Attr,Node);


function CharacterData() {
};
CharacterData.prototype = {
	data : '',
	substringData : function(offset, count) {
		return this.data.substring(offset, offset+count);
	},
	appendData: function(text) {
		text = this.data+text;
		this.nodeValue = this.data = text;
		this.length = text.length;
	},
	insertData: function(offset,text) {
		this.replaceData(offset,0,text);
	
	},
	appendChild:function(newChild){
		throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
	},
	deleteData: function(offset, count) {
		this.replaceData(offset,count,"");
	},
	replaceData: function(offset, count, text) {
		var start = this.data.substring(0,offset);
		var end = this.data.substring(offset+count);
		text = start + text + end;
		this.nodeValue = this.data = text;
		this.length = text.length;
	}
}
_extends(CharacterData,Node);
function Text() {
};
Text.prototype = {
	nodeName : "#text",
	nodeType : TEXT_NODE,
	splitText : function(offset) {
		var text = this.data;
		var newText = text.substring(offset);
		text = text.substring(0, offset);
		this.data = this.nodeValue = text;
		this.length = text.length;
		var newNode = this.ownerDocument.createTextNode(newText);
		if(this.parentNode){
			this.parentNode.insertBefore(newNode, this.nextSibling);
		}
		return newNode;
	}
}
_extends(Text,CharacterData);
function Comment() {
};
Comment.prototype = {
	nodeName : "#comment",
	nodeType : COMMENT_NODE
}
_extends(Comment,CharacterData);

function CDATASection() {
};
CDATASection.prototype = {
	nodeName : "#cdata-section",
	nodeType : CDATA_SECTION_NODE
}
_extends(CDATASection,CharacterData);


function DocumentType() {
};
DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
_extends(DocumentType,Node);

function Notation() {
};
Notation.prototype.nodeType = NOTATION_NODE;
_extends(Notation,Node);

function Entity() {
};
Entity.prototype.nodeType = ENTITY_NODE;
_extends(Entity,Node);

function EntityReference() {
};
EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
_extends(EntityReference,Node);

function DocumentFragment() {
};
DocumentFragment.prototype.nodeName =	"#document-fragment";
DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
_extends(DocumentFragment,Node);


function ProcessingInstruction() {
}
ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
_extends(ProcessingInstruction,Node);
function XMLSerializer(){}
XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
	return nodeSerializeToString.call(node,isHtml,nodeFilter);
}
Node.prototype.toString = nodeSerializeToString;
function nodeSerializeToString(isHtml,nodeFilter){
	var buf = [];
	var refNode = this.nodeType == 9?this.documentElement:this;
	var prefix = refNode.prefix;
	var uri = refNode.namespaceURI;
	
	if(uri && prefix == null){
		//console.log(prefix)
		var prefix = refNode.lookupPrefix(uri);
		if(prefix == null){
			//isHTML = true;
			var visibleNamespaces=[
			{namespace:uri,prefix:null}
			//{namespace:uri,prefix:''}
			]
		}
	}
	serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
	//console.log('###',this.nodeType,uri,prefix,buf.join(''))
	return buf.join('');
}
function needNamespaceDefine(node,isHTML, visibleNamespaces) {
	var prefix = node.prefix||'';
	var uri = node.namespaceURI;
	if (!prefix && !uri){
		return false;
	}
	if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
		|| uri == 'http://www.w3.org/2000/xmlns/'){
		return false;
	}
	
	var i = visibleNamespaces.length 
	//console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
	while (i--) {
		var ns = visibleNamespaces[i];
		// get namespace prefix
		//console.log(node.nodeType,node.tagName,ns.prefix,prefix)
		if (ns.prefix == prefix){
			return ns.namespace != uri;
		}
	}
	//console.log(isHTML,uri,prefix=='')
	//if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
	//	return false;
	//}
	//node.flag = '11111'
	//console.error(3,true,node.flag,node.prefix,node.namespaceURI)
	return true;
}
function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
	if(nodeFilter){
		node = nodeFilter(node);
		if(node){
			if(typeof node == 'string'){
				buf.push(node);
				return;
			}
		}else{
			return;
		}
		//buf.sort.apply(attrs, attributeSorter);
	}
	switch(node.nodeType){
	case ELEMENT_NODE:
		if (!visibleNamespaces) visibleNamespaces = [];
		var startVisibleNamespaces = visibleNamespaces.length;
		var attrs = node.attributes;
		var len = attrs.length;
		var child = node.firstChild;
		var nodeName = node.tagName;
		
		isHTML =  (htmlns === node.namespaceURI) ||isHTML 
		buf.push('<',nodeName);
		
		
		
		for(var i=0;i<len;i++){
			// add namespaces for attributes
			var attr = attrs.item(i);
			if (attr.prefix == 'xmlns') {
				visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
			}else if(attr.nodeName == 'xmlns'){
				visibleNamespaces.push({ prefix: '', namespace: attr.value });
			}
		}
		for(var i=0;i<len;i++){
			var attr = attrs.item(i);
			if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
				var prefix = attr.prefix||'';
				var uri = attr.namespaceURI;
				var ns = prefix ? ' xmlns:' + prefix : " xmlns";
				buf.push(ns, '="' , uri , '"');
				visibleNamespaces.push({ prefix: prefix, namespace:uri });
			}
			serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
		}
		// add namespace for current node		
		if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
			var prefix = node.prefix||'';
			var uri = node.namespaceURI;
			var ns = prefix ? ' xmlns:' + prefix : " xmlns";
			buf.push(ns, '="' , uri , '"');
			visibleNamespaces.push({ prefix: prefix, namespace:uri });
		}
		
		if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
			buf.push('>');
			//if is cdata child node
			if(isHTML && /^script$/i.test(nodeName)){
				while(child){
					if(child.data){
						buf.push(child.data);
					}else{
						serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					}
					child = child.nextSibling;
				}
			}else
			{
				while(child){
					serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
					child = child.nextSibling;
				}
			}
			buf.push('</',nodeName,'>');
		}else{
			buf.push('/>');
		}
		// remove added visible namespaces
		//visibleNamespaces.length = startVisibleNamespaces;
		return;
	case DOCUMENT_NODE:
	case DOCUMENT_FRAGMENT_NODE:
		var child = node.firstChild;
		while(child){
			serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
			child = child.nextSibling;
		}
		return;
	case ATTRIBUTE_NODE:
		return buf.push(' ',node.name,'="',node.value.replace(/[<&"]/g,_xmlEncoder),'"');
	case TEXT_NODE:
		return buf.push(node.data.replace(/[<&]/g,_xmlEncoder));
	case CDATA_SECTION_NODE:
		return buf.push( '<![CDATA[',node.data,']]>');
	case COMMENT_NODE:
		return buf.push( "<!--",node.data,"-->");
	case DOCUMENT_TYPE_NODE:
		var pubid = node.publicId;
		var sysid = node.systemId;
		buf.push('<!DOCTYPE ',node.name);
		if(pubid){
			buf.push(' PUBLIC "',pubid);
			if (sysid && sysid!='.') {
				buf.push( '" "',sysid);
			}
			buf.push('">');
		}else if(sysid && sysid!='.'){
			buf.push(' SYSTEM "',sysid,'">');
		}else{
			var sub = node.internalSubset;
			if(sub){
				buf.push(" [",sub,"]");
			}
			buf.push(">");
		}
		return;
	case PROCESSING_INSTRUCTION_NODE:
		return buf.push( "<?",node.target," ",node.data,"?>");
	case ENTITY_REFERENCE_NODE:
		return buf.push( '&',node.nodeName,';');
	//case ENTITY_NODE:
	//case NOTATION_NODE:
	default:
		buf.push('??',node.nodeName);
	}
}
function importNode(doc,node,deep){
	var node2;
	switch (node.nodeType) {
	case ELEMENT_NODE:
		node2 = node.cloneNode(false);
		node2.ownerDocument = doc;
		//var attrs = node2.attributes;
		//var len = attrs.length;
		//for(var i=0;i<len;i++){
			//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
		//}
	case DOCUMENT_FRAGMENT_NODE:
		break;
	case ATTRIBUTE_NODE:
		deep = true;
		break;
	//case ENTITY_REFERENCE_NODE:
	//case PROCESSING_INSTRUCTION_NODE:
	////case TEXT_NODE:
	//case CDATA_SECTION_NODE:
	//case COMMENT_NODE:
	//	deep = false;
	//	break;
	//case DOCUMENT_NODE:
	//case DOCUMENT_TYPE_NODE:
	//cannot be imported.
	//case ENTITY_NODE:
	//case NOTATION_NODE：
	//can not hit in level3
	//default:throw e;
	}
	if(!node2){
		node2 = node.cloneNode(false);//false
	}
	node2.ownerDocument = doc;
	node2.parentNode = null;
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(importNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}
//
//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
function cloneNode(doc,node,deep){
	var node2 = new node.constructor();
	for(var n in node){
		var v = node[n];
		if(typeof v != 'object' ){
			if(v != node2[n]){
				node2[n] = v;
			}
		}
	}
	if(node.childNodes){
		node2.childNodes = new NodeList();
	}
	node2.ownerDocument = doc;
	switch (node2.nodeType) {
	case ELEMENT_NODE:
		var attrs	= node.attributes;
		var attrs2	= node2.attributes = new NamedNodeMap();
		var len = attrs.length
		attrs2._ownerElement = node2;
		for(var i=0;i<len;i++){
			node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
		}
		break;;
	case ATTRIBUTE_NODE:
		deep = true;
	}
	if(deep){
		var child = node.firstChild;
		while(child){
			node2.appendChild(cloneNode(doc,child,deep));
			child = child.nextSibling;
		}
	}
	return node2;
}

function __set__(object,key,value){
	object[key] = value
}
//do dynamic
try{
	if(Object.defineProperty){
		Object.defineProperty(LiveNodeList.prototype,'length',{
			get:function(){
				_updateLiveList(this);
				return this.$$length;
			}
		});
		Object.defineProperty(Node.prototype,'textContent',{
			get:function(){
				return getTextContent(this);
			},
			set:function(data){
				switch(this.nodeType){
				case ELEMENT_NODE:
				case DOCUMENT_FRAGMENT_NODE:
					while(this.firstChild){
						this.removeChild(this.firstChild);
					}
					if(data || String(data)){
						this.appendChild(this.ownerDocument.createTextNode(data));
					}
					break;
				default:
					//TODO:
					this.data = data;
					this.value = data;
					this.nodeValue = data;
				}
			}
		})
		
		function getTextContent(node){
			switch(node.nodeType){
			case ELEMENT_NODE:
			case DOCUMENT_FRAGMENT_NODE:
				var buf = [];
				node = node.firstChild;
				while(node){
					if(node.nodeType!==7 && node.nodeType !==8){
						buf.push(getTextContent(node));
					}
					node = node.nextSibling;
				}
				return buf.join('');
			default:
				return node.nodeValue;
			}
		}
		__set__ = function(object,key,value){
			//console.log(value)
			object['$$'+key] = value
		}
	}
}catch(e){//ie8
}

//if(typeof require == 'function'){
	exports.DOMImplementation = DOMImplementation;
	__webpack_unused_export__ = XMLSerializer;
//}


/***/ }),

/***/ 6618:
/***/ ((__unused_webpack_module, exports) => {

//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
//[5]   	Name	   ::=   	NameStartChar (NameChar)*
var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]///\u10000-\uEFFFF
var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
var S_TAG = 0;//tag name offerring
var S_ATTR = 1;//attr name offerring 
var S_ATTR_SPACE=2;//attr name end and space offer
var S_EQ = 3;//=space?
var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
var S_ATTR_END = 5;//attr value end and no space(quot end)
var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
var S_TAG_CLOSE = 7;//closed el<el />

function XMLReader(){
	
}

XMLReader.prototype = {
	parse:function(source,defaultNSMap,entityMap){
		var domBuilder = this.domBuilder;
		domBuilder.startDocument();
		_copy(defaultNSMap ,defaultNSMap = {})
		parse(source,defaultNSMap,entityMap,
				domBuilder,this.errorHandler);
		domBuilder.endDocument();
	}
}
function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
	function fixedFromCharCode(code) {
		// String.prototype.fromCharCode does not supports
		// > 2 bytes unicode chars directly
		if (code > 0xffff) {
			code -= 0x10000;
			var surrogate1 = 0xd800 + (code >> 10)
				, surrogate2 = 0xdc00 + (code & 0x3ff);

			return String.fromCharCode(surrogate1, surrogate2);
		} else {
			return String.fromCharCode(code);
		}
	}
	function entityReplacer(a){
		var k = a.slice(1,-1);
		if(k in entityMap){
			return entityMap[k]; 
		}else if(k.charAt(0) === '#'){
			return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
		}else{
			errorHandler.error('entity not found:'+a);
			return a;
		}
	}
	function appendText(end){//has some bugs
		if(end>start){
			var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
			locator&&position(start);
			domBuilder.characters(xt,0,end-start);
			start = end
		}
	}
	function position(p,m){
		while(p>=lineEnd && (m = linePattern.exec(source))){
			lineStart = m.index;
			lineEnd = lineStart + m[0].length;
			locator.lineNumber++;
			//console.log('line++:',locator,startPos,endPos)
		}
		locator.columnNumber = p-lineStart+1;
	}
	var lineStart = 0;
	var lineEnd = 0;
	var linePattern = /.*(?:\r\n?|\n)|.*$/g
	var locator = domBuilder.locator;
	
	var parseStack = [{currentNSMap:defaultNSMapCopy}]
	var closeMap = {};
	var start = 0;
	while(true){
		try{
			var tagStart = source.indexOf('<',start);
			if(tagStart<0){
				if(!source.substr(start).match(/^\s*$/)){
					var doc = domBuilder.doc;
	    			var text = doc.createTextNode(source.substr(start));
	    			doc.appendChild(text);
	    			domBuilder.currentElement = text;
				}
				return;
			}
			if(tagStart>start){
				appendText(tagStart);
			}
			switch(source.charAt(tagStart+1)){
			case '/':
				var end = source.indexOf('>',tagStart+3);
				var tagName = source.substring(tagStart+2,end);
				var config = parseStack.pop();
				if(end<0){
					
	        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
	        		//console.error('#@@@@@@'+tagName)
	        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
	        		end = tagStart+1+tagName.length;
	        	}else if(tagName.match(/\s</)){
	        		tagName = tagName.replace(/[\s<].*/,'');
	        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
	        		end = tagStart+1+tagName.length;
				}
				//console.error(parseStack.length,parseStack)
				//console.error(config);
				var localNSMap = config.localNSMap;
				var endMatch = config.tagName == tagName;
				var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase()
		        if(endIgnoreCaseMach){
		        	domBuilder.endElement(config.uri,config.localName,tagName);
					if(localNSMap){
						for(var prefix in localNSMap){
							domBuilder.endPrefixMapping(prefix) ;
						}
					}
					if(!endMatch){
		            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName );
					}
		        }else{
		        	parseStack.push(config)
		        }
				
				end++;
				break;
				// end elment
			case '?':// <?...?>
				locator&&position(tagStart);
				end = parseInstruction(source,tagStart,domBuilder);
				break;
			case '!':// <!doctype,<![CDATA,<!--
				locator&&position(tagStart);
				end = parseDCC(source,tagStart,domBuilder,errorHandler);
				break;
			default:
				locator&&position(tagStart);
				var el = new ElementAttributes();
				var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
				//elStartEnd
				var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
				var len = el.length;
				
				
				if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
					el.closed = true;
					if(!entityMap.nbsp){
						errorHandler.warning('unclosed xml attribute');
					}
				}
				if(locator && len){
					var locator2 = copyLocator(locator,{});
					//try{//attribute position fixed
					for(var i = 0;i<len;i++){
						var a = el[i];
						position(a.offset);
						a.locator = copyLocator(locator,{});
					}
					//}catch(e){console.error('@@@@@'+e)}
					domBuilder.locator = locator2
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
					domBuilder.locator = locator;
				}else{
					if(appendElement(el,domBuilder,currentNSMap)){
						parseStack.push(el)
					}
				}
				
				
				
				if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
					end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder)
				}else{
					end++;
				}
			}
		}catch(e){
			errorHandler.error('element parse error: '+e)
			//errorHandler.error('element parse error: '+e);
			end = -1;
			//throw e;
		}
		if(end>start){
			start = end;
		}else{
			//TODO: 这里有可能sax回退，有位置错误风险
			appendText(Math.max(tagStart,start)+1);
		}
	}
}
function copyLocator(f,t){
	t.lineNumber = f.lineNumber;
	t.columnNumber = f.columnNumber;
	return t;
}

/**
 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
 */
function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){
	var attrName;
	var value;
	var p = ++start;
	var s = S_TAG;//status
	while(true){
		var c = source.charAt(p);
		switch(c){
		case '=':
			if(s === S_ATTR){//attrName
				attrName = source.slice(start,p);
				s = S_EQ;
			}else if(s === S_ATTR_SPACE){
				s = S_EQ;
			}else{
				//fatalError: equal must after attrName or space after attrName
				throw new Error('attribute equal must after attrName');
			}
			break;
		case '\'':
		case '"':
			if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
				){//equal
				if(s === S_ATTR){
					errorHandler.warning('attribute value must after "="')
					attrName = source.slice(start,p)
				}
				start = p+1;
				p = source.indexOf(c,start)
				if(p>0){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					el.add(attrName,value,start-1);
					s = S_ATTR_END;
				}else{
					//fatalError: no end quot match
					throw new Error('attribute value no end \''+c+'\' match');
				}
			}else if(s == S_ATTR_NOQUOT_VALUE){
				value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
				//console.log(attrName,value,start,p)
				el.add(attrName,value,start);
				//console.dir(el)
				errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
				start = p+1;
				s = S_ATTR_END
			}else{
				//fatalError: no equal before
				throw new Error('attribute value must after "="');
			}
			break;
		case '/':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				s =S_TAG_CLOSE;
				el.closed = true;
			case S_ATTR_NOQUOT_VALUE:
			case S_ATTR:
			case S_ATTR_SPACE:
				break;
			//case S_EQ:
			default:
				throw new Error("attribute invalid close char('/')")
			}
			break;
		case ''://end document
			//throw new Error('unexpected end of input')
			errorHandler.error('unexpected end of input');
			if(s == S_TAG){
				el.setTagName(source.slice(start,p));
			}
			return p;
		case '>':
			switch(s){
			case S_TAG:
				el.setTagName(source.slice(start,p));
			case S_ATTR_END:
			case S_TAG_SPACE:
			case S_TAG_CLOSE:
				break;//normal
			case S_ATTR_NOQUOT_VALUE://Compatible state
			case S_ATTR:
				value = source.slice(start,p);
				if(value.slice(-1) === '/'){
					el.closed  = true;
					value = value.slice(0,-1)
				}
			case S_ATTR_SPACE:
				if(s === S_ATTR_SPACE){
					value = attrName;
				}
				if(s == S_ATTR_NOQUOT_VALUE){
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value.replace(/&#?\w+;/g,entityReplacer),start)
				}else{
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!')
					}
					el.add(value,value,start)
				}
				break;
			case S_EQ:
				throw new Error('attribute value missed!!');
			}
//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
			return p;
		/*xml space '\x20' | #x9 | #xD | #xA; */
		case '\u0080':
			c = ' ';
		default:
			if(c<= ' '){//space
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));//tagName
					s = S_TAG_SPACE;
					break;
				case S_ATTR:
					attrName = source.slice(start,p)
					s = S_ATTR_SPACE;
					break;
				case S_ATTR_NOQUOT_VALUE:
					var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					errorHandler.warning('attribute "'+value+'" missed quot(")!!');
					el.add(attrName,value,start)
				case S_ATTR_END:
					s = S_TAG_SPACE;
					break;
				//case S_TAG_SPACE:
				//case S_EQ:
				//case S_ATTR_SPACE:
				//	void();break;
				//case S_TAG_CLOSE:
					//ignore warning
				}
			}else{//not space
//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
				switch(s){
				//case S_TAG:void();break;
				//case S_ATTR:void();break;
				//case S_ATTR_NOQUOT_VALUE:void();break;
				case S_ATTR_SPACE:
					var tagName =  el.tagName;
					if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
						errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!')
					}
					el.add(attrName,attrName,start);
					start = p;
					s = S_ATTR;
					break;
				case S_ATTR_END:
					errorHandler.warning('attribute space is required"'+attrName+'"!!')
				case S_TAG_SPACE:
					s = S_ATTR;
					start = p;
					break;
				case S_EQ:
					s = S_ATTR_NOQUOT_VALUE;
					start = p;
					break;
				case S_TAG_CLOSE:
					throw new Error("elements closed character '/' and '>' must be connected to");
				}
			}
		}//end outer switch
		//console.log('p++',p)
		p++;
	}
}
/**
 * @return true if has new namespace define
 */
function appendElement(el,domBuilder,currentNSMap){
	var tagName = el.tagName;
	var localNSMap = null;
	//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
	var i = el.length;
	while(i--){
		var a = el[i];
		var qName = a.qName;
		var value = a.value;
		var nsp = qName.indexOf(':');
		if(nsp>0){
			var prefix = a.prefix = qName.slice(0,nsp);
			var localName = qName.slice(nsp+1);
			var nsPrefix = prefix === 'xmlns' && localName
		}else{
			localName = qName;
			prefix = null
			nsPrefix = qName === 'xmlns' && ''
		}
		//can not set prefix,because prefix !== ''
		a.localName = localName ;
		//prefix == null for no ns prefix attribute 
		if(nsPrefix !== false){//hack!!
			if(localNSMap == null){
				localNSMap = {}
				//console.log(currentNSMap,0)
				_copy(currentNSMap,currentNSMap={})
				//console.log(currentNSMap,1)
			}
			currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
			a.uri = 'http://www.w3.org/2000/xmlns/'
			domBuilder.startPrefixMapping(nsPrefix, value) 
		}
	}
	var i = el.length;
	while(i--){
		a = el[i];
		var prefix = a.prefix;
		if(prefix){//no prefix attribute has no namespace
			if(prefix === 'xml'){
				a.uri = 'http://www.w3.org/XML/1998/namespace';
			}if(prefix !== 'xmlns'){
				a.uri = currentNSMap[prefix || '']
				
				//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
			}
		}
	}
	var nsp = tagName.indexOf(':');
	if(nsp>0){
		prefix = el.prefix = tagName.slice(0,nsp);
		localName = el.localName = tagName.slice(nsp+1);
	}else{
		prefix = null;//important!!
		localName = el.localName = tagName;
	}
	//no prefix element has default namespace
	var ns = el.uri = currentNSMap[prefix || ''];
	domBuilder.startElement(ns,localName,tagName,el);
	//endPrefixMapping and startPrefixMapping have not any help for dom builder
	//localNSMap = null
	if(el.closed){
		domBuilder.endElement(ns,localName,tagName);
		if(localNSMap){
			for(prefix in localNSMap){
				domBuilder.endPrefixMapping(prefix) 
			}
		}
	}else{
		el.currentNSMap = currentNSMap;
		el.localNSMap = localNSMap;
		//parseStack.push(el);
		return true;
	}
}
function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
	if(/^(?:script|textarea)$/i.test(tagName)){
		var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
		var text = source.substring(elStartEnd+1,elEndStart);
		if(/[&<]/.test(text)){
			if(/^script$/i.test(tagName)){
				//if(!/\]\]>/.test(text)){
					//lexHandler.startCDATA();
					domBuilder.characters(text,0,text.length);
					//lexHandler.endCDATA();
					return elEndStart;
				//}
			}//}else{//text area
				text = text.replace(/&#?\w+;/g,entityReplacer);
				domBuilder.characters(text,0,text.length);
				return elEndStart;
			//}
			
		}
	}
	return elStartEnd+1;
}
function fixSelfClosed(source,elStartEnd,tagName,closeMap){
	//if(tagName in closeMap){
	var pos = closeMap[tagName];
	if(pos == null){
		//console.log(tagName)
		pos =  source.lastIndexOf('</'+tagName+'>')
		if(pos<elStartEnd){//忘记闭合
			pos = source.lastIndexOf('</'+tagName)
		}
		closeMap[tagName] =pos
	}
	return pos<elStartEnd;
	//} 
}
function _copy(source,target){
	for(var n in source){target[n] = source[n]}
}
function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
	var next= source.charAt(start+2)
	switch(next){
	case '-':
		if(source.charAt(start + 3) === '-'){
			var end = source.indexOf('-->',start+4);
			//append comment source.substring(4,end)//<!--
			if(end>start){
				domBuilder.comment(source,start+4,end-start-4);
				return end+3;
			}else{
				errorHandler.error("Unclosed comment");
				return -1;
			}
		}else{
			//error
			return -1;
		}
	default:
		if(source.substr(start+3,6) == 'CDATA['){
			var end = source.indexOf(']]>',start+9);
			domBuilder.startCDATA();
			domBuilder.characters(source,start+9,end-start-9);
			domBuilder.endCDATA() 
			return end+3;
		}
		//<!DOCTYPE
		//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
		var matchs = split(source,start);
		var len = matchs.length;
		if(len>1 && /!doctype/i.test(matchs[0][0])){
			var name = matchs[1][0];
			var pubid = len>3 && /^public$/i.test(matchs[2][0]) && matchs[3][0]
			var sysid = len>4 && matchs[4][0];
			var lastMatch = matchs[len-1]
			domBuilder.startDTD(name,pubid && pubid.replace(/^(['"])(.*?)\1$/,'$2'),
					sysid && sysid.replace(/^(['"])(.*?)\1$/,'$2'));
			domBuilder.endDTD();
			
			return lastMatch.index+lastMatch[0].length
		}
	}
	return -1;
}



function parseInstruction(source,start,domBuilder){
	var end = source.indexOf('?>',start);
	if(end){
		var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
		if(match){
			var len = match[0].length;
			domBuilder.processingInstruction(match[1], match[2]) ;
			return end+2;
		}else{//error
			return -1;
		}
	}
	return -1;
}

/**
 * @param source
 */
function ElementAttributes(source){
	
}
ElementAttributes.prototype = {
	setTagName:function(tagName){
		if(!tagNamePattern.test(tagName)){
			throw new Error('invalid tagName:'+tagName)
		}
		this.tagName = tagName
	},
	add:function(qName,value,offset){
		if(!tagNamePattern.test(qName)){
			throw new Error('invalid attribute:'+qName)
		}
		this[this.length++] = {qName:qName,value:value,offset:offset}
	},
	length:0,
	getLocalName:function(i){return this[i].localName},
	getLocator:function(i){return this[i].locator},
	getQName:function(i){return this[i].qName},
	getURI:function(i){return this[i].uri},
	getValue:function(i){return this[i].value}
//	,getIndex:function(uri, localName)){
//		if(localName){
//			
//		}else{
//			var qName = uri
//		}
//	},
//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
//	getType:function(uri,localName){}
//	getType:function(i){},
}




function _set_proto_(thiz,parent){
	thiz.__proto__ = parent;
	return thiz;
}
if(!(_set_proto_({},_set_proto_.prototype) instanceof _set_proto_)){
	_set_proto_ = function(thiz,parent){
		function p(){};
		p.prototype = parent;
		p = new p();
		for(parent in thiz){
			p[parent] = thiz[parent];
		}
		return p;
	}
}

function split(source,start){
	var match;
	var buf = [];
	var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
	reg.lastIndex = start;
	reg.exec(source);//skip <
	while(match = reg.exec(source)){
		buf.push(match);
		if(match[1])return buf;
	}
}

exports.G = XMLReader;



/***/ }),

/***/ 8781:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var fs = __webpack_require__(5747);
var zlib = __webpack_require__(8761);
var fd_slicer = __webpack_require__(5010);
var crc32 = __webpack_require__(4794);
var util = __webpack_require__(1669);
var EventEmitter = __webpack_require__(8614).EventEmitter;
var Transform = __webpack_require__(2413).Transform;
var PassThrough = __webpack_require__(2413).PassThrough;
var Writable = __webpack_require__(2413).Writable;

exports.open = open;
exports.fromFd = fromFd;
exports.fromBuffer = fromBuffer;
exports.fromRandomAccessReader = fromRandomAccessReader;
exports.dosDateTimeToDate = dosDateTimeToDate;
exports.validateFileName = validateFileName;
exports.ZipFile = ZipFile;
exports.Entry = Entry;
exports.RandomAccessReader = RandomAccessReader;

function open(path, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = null;
  }
  if (options == null) options = {};
  if (options.autoClose == null) options.autoClose = true;
  if (options.lazyEntries == null) options.lazyEntries = false;
  if (options.decodeStrings == null) options.decodeStrings = true;
  if (options.validateEntrySizes == null) options.validateEntrySizes = true;
  if (options.strictFileNames == null) options.strictFileNames = false;
  if (callback == null) callback = defaultCallback;
  fs.open(path, "r", function(err, fd) {
    if (err) return callback(err);
    fromFd(fd, options, function(err, zipfile) {
      if (err) fs.close(fd, defaultCallback);
      callback(err, zipfile);
    });
  });
}

function fromFd(fd, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = null;
  }
  if (options == null) options = {};
  if (options.autoClose == null) options.autoClose = false;
  if (options.lazyEntries == null) options.lazyEntries = false;
  if (options.decodeStrings == null) options.decodeStrings = true;
  if (options.validateEntrySizes == null) options.validateEntrySizes = true;
  if (options.strictFileNames == null) options.strictFileNames = false;
  if (callback == null) callback = defaultCallback;
  fs.fstat(fd, function(err, stats) {
    if (err) return callback(err);
    var reader = fd_slicer.createFromFd(fd, {autoClose: true});
    fromRandomAccessReader(reader, stats.size, options, callback);
  });
}

function fromBuffer(buffer, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = null;
  }
  if (options == null) options = {};
  options.autoClose = false;
  if (options.lazyEntries == null) options.lazyEntries = false;
  if (options.decodeStrings == null) options.decodeStrings = true;
  if (options.validateEntrySizes == null) options.validateEntrySizes = true;
  if (options.strictFileNames == null) options.strictFileNames = false;
  // limit the max chunk size. see https://github.com/thejoshwolfe/yauzl/issues/87
  var reader = fd_slicer.createFromBuffer(buffer, {maxChunkSize: 0x10000});
  fromRandomAccessReader(reader, buffer.length, options, callback);
}

function fromRandomAccessReader(reader, totalSize, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = null;
  }
  if (options == null) options = {};
  if (options.autoClose == null) options.autoClose = true;
  if (options.lazyEntries == null) options.lazyEntries = false;
  if (options.decodeStrings == null) options.decodeStrings = true;
  var decodeStrings = !!options.decodeStrings;
  if (options.validateEntrySizes == null) options.validateEntrySizes = true;
  if (options.strictFileNames == null) options.strictFileNames = false;
  if (callback == null) callback = defaultCallback;
  if (typeof totalSize !== "number") throw new Error("expected totalSize parameter to be a number");
  if (totalSize > Number.MAX_SAFE_INTEGER) {
    throw new Error("zip file too large. only file sizes up to 2^52 are supported due to JavaScript's Number type being an IEEE 754 double.");
  }

  // the matching unref() call is in zipfile.close()
  reader.ref();

  // eocdr means End of Central Directory Record.
  // search backwards for the eocdr signature.
  // the last field of the eocdr is a variable-length comment.
  // the comment size is encoded in a 2-byte field in the eocdr, which we can't find without trudging backwards through the comment to find it.
  // as a consequence of this design decision, it's possible to have ambiguous zip file metadata if a coherent eocdr was in the comment.
  // we search backwards for a eocdr signature, and hope that whoever made the zip file was smart enough to forbid the eocdr signature in the comment.
  var eocdrWithoutCommentSize = 22;
  var maxCommentSize = 0xffff; // 2-byte size
  var bufferSize = Math.min(eocdrWithoutCommentSize + maxCommentSize, totalSize);
  var buffer = newBuffer(bufferSize);
  var bufferReadStart = totalSize - buffer.length;
  readAndAssertNoEof(reader, buffer, 0, bufferSize, bufferReadStart, function(err) {
    if (err) return callback(err);
    for (var i = bufferSize - eocdrWithoutCommentSize; i >= 0; i -= 1) {
      if (buffer.readUInt32LE(i) !== 0x06054b50) continue;
      // found eocdr
      var eocdrBuffer = buffer.slice(i);

      // 0 - End of central directory signature = 0x06054b50
      // 4 - Number of this disk
      var diskNumber = eocdrBuffer.readUInt16LE(4);
      if (diskNumber !== 0) {
        return callback(new Error("multi-disk zip files are not supported: found disk number: " + diskNumber));
      }
      // 6 - Disk where central directory starts
      // 8 - Number of central directory records on this disk
      // 10 - Total number of central directory records
      var entryCount = eocdrBuffer.readUInt16LE(10);
      // 12 - Size of central directory (bytes)
      // 16 - Offset of start of central directory, relative to start of archive
      var centralDirectoryOffset = eocdrBuffer.readUInt32LE(16);
      // 20 - Comment length
      var commentLength = eocdrBuffer.readUInt16LE(20);
      var expectedCommentLength = eocdrBuffer.length - eocdrWithoutCommentSize;
      if (commentLength !== expectedCommentLength) {
        return callback(new Error("invalid comment length. expected: " + expectedCommentLength + ". found: " + commentLength));
      }
      // 22 - Comment
      // the encoding is always cp437.
      var comment = decodeStrings ? decodeBuffer(eocdrBuffer, 22, eocdrBuffer.length, false)
                                  : eocdrBuffer.slice(22);

      if (!(entryCount === 0xffff || centralDirectoryOffset === 0xffffffff)) {
        return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options.autoClose, options.lazyEntries, decodeStrings, options.validateEntrySizes, options.strictFileNames));
      }

      // ZIP64 format

      // ZIP64 Zip64 end of central directory locator
      var zip64EocdlBuffer = newBuffer(20);
      var zip64EocdlOffset = bufferReadStart + i - zip64EocdlBuffer.length;
      readAndAssertNoEof(reader, zip64EocdlBuffer, 0, zip64EocdlBuffer.length, zip64EocdlOffset, function(err) {
        if (err) return callback(err);

        // 0 - zip64 end of central dir locator signature = 0x07064b50
        if (zip64EocdlBuffer.readUInt32LE(0) !== 0x07064b50) {
          return callback(new Error("invalid zip64 end of central directory locator signature"));
        }
        // 4 - number of the disk with the start of the zip64 end of central directory
        // 8 - relative offset of the zip64 end of central directory record
        var zip64EocdrOffset = readUInt64LE(zip64EocdlBuffer, 8);
        // 16 - total number of disks

        // ZIP64 end of central directory record
        var zip64EocdrBuffer = newBuffer(56);
        readAndAssertNoEof(reader, zip64EocdrBuffer, 0, zip64EocdrBuffer.length, zip64EocdrOffset, function(err) {
          if (err) return callback(err);

          // 0 - zip64 end of central dir signature                           4 bytes  (0x06064b50)
          if (zip64EocdrBuffer.readUInt32LE(0) !== 0x06064b50) {
            return callback(new Error("invalid zip64 end of central directory record signature"));
          }
          // 4 - size of zip64 end of central directory record                8 bytes
          // 12 - version made by                                             2 bytes
          // 14 - version needed to extract                                   2 bytes
          // 16 - number of this disk                                         4 bytes
          // 20 - number of the disk with the start of the central directory  4 bytes
          // 24 - total number of entries in the central directory on this disk         8 bytes
          // 32 - total number of entries in the central directory            8 bytes
          entryCount = readUInt64LE(zip64EocdrBuffer, 32);
          // 40 - size of the central directory                               8 bytes
          // 48 - offset of start of central directory with respect to the starting disk number     8 bytes
          centralDirectoryOffset = readUInt64LE(zip64EocdrBuffer, 48);
          // 56 - zip64 extensible data sector                                (variable size)
          return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options.autoClose, options.lazyEntries, decodeStrings, options.validateEntrySizes, options.strictFileNames));
        });
      });
      return;
    }
    callback(new Error("end of central directory record signature not found"));
  });
}

util.inherits(ZipFile, EventEmitter);
function ZipFile(reader, centralDirectoryOffset, fileSize, entryCount, comment, autoClose, lazyEntries, decodeStrings, validateEntrySizes, strictFileNames) {
  var self = this;
  EventEmitter.call(self);
  self.reader = reader;
  // forward close events
  self.reader.on("error", function(err) {
    // error closing the fd
    emitError(self, err);
  });
  self.reader.once("close", function() {
    self.emit("close");
  });
  self.readEntryCursor = centralDirectoryOffset;
  self.fileSize = fileSize;
  self.entryCount = entryCount;
  self.comment = comment;
  self.entriesRead = 0;
  self.autoClose = !!autoClose;
  self.lazyEntries = !!lazyEntries;
  self.decodeStrings = !!decodeStrings;
  self.validateEntrySizes = !!validateEntrySizes;
  self.strictFileNames = !!strictFileNames;
  self.isOpen = true;
  self.emittedError = false;

  if (!self.lazyEntries) self._readEntry();
}
ZipFile.prototype.close = function() {
  if (!this.isOpen) return;
  this.isOpen = false;
  this.reader.unref();
};

function emitErrorAndAutoClose(self, err) {
  if (self.autoClose) self.close();
  emitError(self, err);
}
function emitError(self, err) {
  if (self.emittedError) return;
  self.emittedError = true;
  self.emit("error", err);
}

ZipFile.prototype.readEntry = function() {
  if (!this.lazyEntries) throw new Error("readEntry() called without lazyEntries:true");
  this._readEntry();
};
ZipFile.prototype._readEntry = function() {
  var self = this;
  if (self.entryCount === self.entriesRead) {
    // done with metadata
    setImmediate(function() {
      if (self.autoClose) self.close();
      if (self.emittedError) return;
      self.emit("end");
    });
    return;
  }
  if (self.emittedError) return;
  var buffer = newBuffer(46);
  readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, function(err) {
    if (err) return emitErrorAndAutoClose(self, err);
    if (self.emittedError) return;
    var entry = new Entry();
    // 0 - Central directory file header signature
    var signature = buffer.readUInt32LE(0);
    if (signature !== 0x02014b50) return emitErrorAndAutoClose(self, new Error("invalid central directory file header signature: 0x" + signature.toString(16)));
    // 4 - Version made by
    entry.versionMadeBy = buffer.readUInt16LE(4);
    // 6 - Version needed to extract (minimum)
    entry.versionNeededToExtract = buffer.readUInt16LE(6);
    // 8 - General purpose bit flag
    entry.generalPurposeBitFlag = buffer.readUInt16LE(8);
    // 10 - Compression method
    entry.compressionMethod = buffer.readUInt16LE(10);
    // 12 - File last modification time
    entry.lastModFileTime = buffer.readUInt16LE(12);
    // 14 - File last modification date
    entry.lastModFileDate = buffer.readUInt16LE(14);
    // 16 - CRC-32
    entry.crc32 = buffer.readUInt32LE(16);
    // 20 - Compressed size
    entry.compressedSize = buffer.readUInt32LE(20);
    // 24 - Uncompressed size
    entry.uncompressedSize = buffer.readUInt32LE(24);
    // 28 - File name length (n)
    entry.fileNameLength = buffer.readUInt16LE(28);
    // 30 - Extra field length (m)
    entry.extraFieldLength = buffer.readUInt16LE(30);
    // 32 - File comment length (k)
    entry.fileCommentLength = buffer.readUInt16LE(32);
    // 34 - Disk number where file starts
    // 36 - Internal file attributes
    entry.internalFileAttributes = buffer.readUInt16LE(36);
    // 38 - External file attributes
    entry.externalFileAttributes = buffer.readUInt32LE(38);
    // 42 - Relative offset of local file header
    entry.relativeOffsetOfLocalHeader = buffer.readUInt32LE(42);

    if (entry.generalPurposeBitFlag & 0x40) return emitErrorAndAutoClose(self, new Error("strong encryption is not supported"));

    self.readEntryCursor += 46;

    buffer = newBuffer(entry.fileNameLength + entry.extraFieldLength + entry.fileCommentLength);
    readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, function(err) {
      if (err) return emitErrorAndAutoClose(self, err);
      if (self.emittedError) return;
      // 46 - File name
      var isUtf8 = (entry.generalPurposeBitFlag & 0x800) !== 0;
      entry.fileName = self.decodeStrings ? decodeBuffer(buffer, 0, entry.fileNameLength, isUtf8)
                                          : buffer.slice(0, entry.fileNameLength);

      // 46+n - Extra field
      var fileCommentStart = entry.fileNameLength + entry.extraFieldLength;
      var extraFieldBuffer = buffer.slice(entry.fileNameLength, fileCommentStart);
      entry.extraFields = [];
      var i = 0;
      while (i < extraFieldBuffer.length - 3) {
        var headerId = extraFieldBuffer.readUInt16LE(i + 0);
        var dataSize = extraFieldBuffer.readUInt16LE(i + 2);
        var dataStart = i + 4;
        var dataEnd = dataStart + dataSize;
        if (dataEnd > extraFieldBuffer.length) return emitErrorAndAutoClose(self, new Error("extra field length exceeds extra field buffer size"));
        var dataBuffer = newBuffer(dataSize);
        extraFieldBuffer.copy(dataBuffer, 0, dataStart, dataEnd);
        entry.extraFields.push({
          id: headerId,
          data: dataBuffer,
        });
        i = dataEnd;
      }

      // 46+n+m - File comment
      entry.fileComment = self.decodeStrings ? decodeBuffer(buffer, fileCommentStart, fileCommentStart + entry.fileCommentLength, isUtf8)
                                             : buffer.slice(fileCommentStart, fileCommentStart + entry.fileCommentLength);
      // compatibility hack for https://github.com/thejoshwolfe/yauzl/issues/47
      entry.comment = entry.fileComment;

      self.readEntryCursor += buffer.length;
      self.entriesRead += 1;

      if (entry.uncompressedSize            === 0xffffffff ||
          entry.compressedSize              === 0xffffffff ||
          entry.relativeOffsetOfLocalHeader === 0xffffffff) {
        // ZIP64 format
        // find the Zip64 Extended Information Extra Field
        var zip64EiefBuffer = null;
        for (var i = 0; i < entry.extraFields.length; i++) {
          var extraField = entry.extraFields[i];
          if (extraField.id === 0x0001) {
            zip64EiefBuffer = extraField.data;
            break;
          }
        }
        if (zip64EiefBuffer == null) {
          return emitErrorAndAutoClose(self, new Error("expected zip64 extended information extra field"));
        }
        var index = 0;
        // 0 - Original Size          8 bytes
        if (entry.uncompressedSize === 0xffffffff) {
          if (index + 8 > zip64EiefBuffer.length) {
            return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include uncompressed size"));
          }
          entry.uncompressedSize = readUInt64LE(zip64EiefBuffer, index);
          index += 8;
        }
        // 8 - Compressed Size        8 bytes
        if (entry.compressedSize === 0xffffffff) {
          if (index + 8 > zip64EiefBuffer.length) {
            return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include compressed size"));
          }
          entry.compressedSize = readUInt64LE(zip64EiefBuffer, index);
          index += 8;
        }
        // 16 - Relative Header Offset 8 bytes
        if (entry.relativeOffsetOfLocalHeader === 0xffffffff) {
          if (index + 8 > zip64EiefBuffer.length) {
            return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include relative header offset"));
          }
          entry.relativeOffsetOfLocalHeader = readUInt64LE(zip64EiefBuffer, index);
          index += 8;
        }
        // 24 - Disk Start Number      4 bytes
      }

      // check for Info-ZIP Unicode Path Extra Field (0x7075)
      // see https://github.com/thejoshwolfe/yauzl/issues/33
      if (self.decodeStrings) {
        for (var i = 0; i < entry.extraFields.length; i++) {
          var extraField = entry.extraFields[i];
          if (extraField.id === 0x7075) {
            if (extraField.data.length < 6) {
              // too short to be meaningful
              continue;
            }
            // Version       1 byte      version of this extra field, currently 1
            if (extraField.data.readUInt8(0) !== 1) {
              // > Changes may not be backward compatible so this extra
              // > field should not be used if the version is not recognized.
              continue;
            }
            // NameCRC32     4 bytes     File Name Field CRC32 Checksum
            var oldNameCrc32 = extraField.data.readUInt32LE(1);
            if (crc32.unsigned(buffer.slice(0, entry.fileNameLength)) !== oldNameCrc32) {
              // > If the CRC check fails, this UTF-8 Path Extra Field should be
              // > ignored and the File Name field in the header should be used instead.
              continue;
            }
            // UnicodeName   Variable    UTF-8 version of the entry File Name
            entry.fileName = decodeBuffer(extraField.data, 5, extraField.data.length, true);
            break;
          }
        }
      }

      // validate file size
      if (self.validateEntrySizes && entry.compressionMethod === 0) {
        var expectedCompressedSize = entry.uncompressedSize;
        if (entry.isEncrypted()) {
          // traditional encryption prefixes the file data with a header
          expectedCompressedSize += 12;
        }
        if (entry.compressedSize !== expectedCompressedSize) {
          var msg = "compressed/uncompressed size mismatch for stored file: " + entry.compressedSize + " != " + entry.uncompressedSize;
          return emitErrorAndAutoClose(self, new Error(msg));
        }
      }

      if (self.decodeStrings) {
        if (!self.strictFileNames) {
          // allow backslash
          entry.fileName = entry.fileName.replace(/\\/g, "/");
        }
        var errorMessage = validateFileName(entry.fileName, self.validateFileNameOptions);
        if (errorMessage != null) return emitErrorAndAutoClose(self, new Error(errorMessage));
      }
      self.emit("entry", entry);

      if (!self.lazyEntries) self._readEntry();
    });
  });
};

ZipFile.prototype.openReadStream = function(entry, options, callback) {
  var self = this;
  // parameter validation
  var relativeStart = 0;
  var relativeEnd = entry.compressedSize;
  if (callback == null) {
    callback = options;
    options = {};
  } else {
    // validate options that the caller has no excuse to get wrong
    if (options.decrypt != null) {
      if (!entry.isEncrypted()) {
        throw new Error("options.decrypt can only be specified for encrypted entries");
      }
      if (options.decrypt !== false) throw new Error("invalid options.decrypt value: " + options.decrypt);
      if (entry.isCompressed()) {
        if (options.decompress !== false) throw new Error("entry is encrypted and compressed, and options.decompress !== false");
      }
    }
    if (options.decompress != null) {
      if (!entry.isCompressed()) {
        throw new Error("options.decompress can only be specified for compressed entries");
      }
      if (!(options.decompress === false || options.decompress === true)) {
        throw new Error("invalid options.decompress value: " + options.decompress);
      }
    }
    if (options.start != null || options.end != null) {
      if (entry.isCompressed() && options.decompress !== false) {
        throw new Error("start/end range not allowed for compressed entry without options.decompress === false");
      }
      if (entry.isEncrypted() && options.decrypt !== false) {
        throw new Error("start/end range not allowed for encrypted entry without options.decrypt === false");
      }
    }
    if (options.start != null) {
      relativeStart = options.start;
      if (relativeStart < 0) throw new Error("options.start < 0");
      if (relativeStart > entry.compressedSize) throw new Error("options.start > entry.compressedSize");
    }
    if (options.end != null) {
      relativeEnd = options.end;
      if (relativeEnd < 0) throw new Error("options.end < 0");
      if (relativeEnd > entry.compressedSize) throw new Error("options.end > entry.compressedSize");
      if (relativeEnd < relativeStart) throw new Error("options.end < options.start");
    }
  }
  // any further errors can either be caused by the zipfile,
  // or were introduced in a minor version of yauzl,
  // so should be passed to the client rather than thrown.
  if (!self.isOpen) return callback(new Error("closed"));
  if (entry.isEncrypted()) {
    if (options.decrypt !== false) return callback(new Error("entry is encrypted, and options.decrypt !== false"));
  }
  // make sure we don't lose the fd before we open the actual read stream
  self.reader.ref();
  var buffer = newBuffer(30);
  readAndAssertNoEof(self.reader, buffer, 0, buffer.length, entry.relativeOffsetOfLocalHeader, function(err) {
    try {
      if (err) return callback(err);
      // 0 - Local file header signature = 0x04034b50
      var signature = buffer.readUInt32LE(0);
      if (signature !== 0x04034b50) {
        return callback(new Error("invalid local file header signature: 0x" + signature.toString(16)));
      }
      // all this should be redundant
      // 4 - Version needed to extract (minimum)
      // 6 - General purpose bit flag
      // 8 - Compression method
      // 10 - File last modification time
      // 12 - File last modification date
      // 14 - CRC-32
      // 18 - Compressed size
      // 22 - Uncompressed size
      // 26 - File name length (n)
      var fileNameLength = buffer.readUInt16LE(26);
      // 28 - Extra field length (m)
      var extraFieldLength = buffer.readUInt16LE(28);
      // 30 - File name
      // 30+n - Extra field
      var localFileHeaderEnd = entry.relativeOffsetOfLocalHeader + buffer.length + fileNameLength + extraFieldLength;
      var decompress;
      if (entry.compressionMethod === 0) {
        // 0 - The file is stored (no compression)
        decompress = false;
      } else if (entry.compressionMethod === 8) {
        // 8 - The file is Deflated
        decompress = options.decompress != null ? options.decompress : true;
      } else {
        return callback(new Error("unsupported compression method: " + entry.compressionMethod));
      }
      var fileDataStart = localFileHeaderEnd;
      var fileDataEnd = fileDataStart + entry.compressedSize;
      if (entry.compressedSize !== 0) {
        // bounds check now, because the read streams will probably not complain loud enough.
        // since we're dealing with an unsigned offset plus an unsigned size,
        // we only have 1 thing to check for.
        if (fileDataEnd > self.fileSize) {
          return callback(new Error("file data overflows file bounds: " +
              fileDataStart + " + " + entry.compressedSize + " > " + self.fileSize));
        }
      }
      var readStream = self.reader.createReadStream({
        start: fileDataStart + relativeStart,
        end: fileDataStart + relativeEnd,
      });
      var endpointStream = readStream;
      if (decompress) {
        var destroyed = false;
        var inflateFilter = zlib.createInflateRaw();
        readStream.on("error", function(err) {
          // setImmediate here because errors can be emitted during the first call to pipe()
          setImmediate(function() {
            if (!destroyed) inflateFilter.emit("error", err);
          });
        });
        readStream.pipe(inflateFilter);

        if (self.validateEntrySizes) {
          endpointStream = new AssertByteCountStream(entry.uncompressedSize);
          inflateFilter.on("error", function(err) {
            // forward zlib errors to the client-visible stream
            setImmediate(function() {
              if (!destroyed) endpointStream.emit("error", err);
            });
          });
          inflateFilter.pipe(endpointStream);
        } else {
          // the zlib filter is the client-visible stream
          endpointStream = inflateFilter;
        }
        // this is part of yauzl's API, so implement this function on the client-visible stream
        endpointStream.destroy = function() {
          destroyed = true;
          if (inflateFilter !== endpointStream) inflateFilter.unpipe(endpointStream);
          readStream.unpipe(inflateFilter);
          // TODO: the inflateFilter may cause a memory leak. see Issue #27.
          readStream.destroy();
        };
      }
      callback(null, endpointStream);
    } finally {
      self.reader.unref();
    }
  });
};

function Entry() {
}
Entry.prototype.getLastModDate = function() {
  return dosDateTimeToDate(this.lastModFileDate, this.lastModFileTime);
};
Entry.prototype.isEncrypted = function() {
  return (this.generalPurposeBitFlag & 0x1) !== 0;
};
Entry.prototype.isCompressed = function() {
  return this.compressionMethod === 8;
};

function dosDateTimeToDate(date, time) {
  var day = date & 0x1f; // 1-31
  var month = (date >> 5 & 0xf) - 1; // 1-12, 0-11
  var year = (date >> 9 & 0x7f) + 1980; // 0-128, 1980-2108

  var millisecond = 0;
  var second = (time & 0x1f) * 2; // 0-29, 0-58 (even numbers)
  var minute = time >> 5 & 0x3f; // 0-59
  var hour = time >> 11 & 0x1f; // 0-23

  return new Date(year, month, day, hour, minute, second, millisecond);
}

function validateFileName(fileName) {
  if (fileName.indexOf("\\") !== -1) {
    return "invalid characters in fileName: " + fileName;
  }
  if (/^[a-zA-Z]:/.test(fileName) || /^\//.test(fileName)) {
    return "absolute path: " + fileName;
  }
  if (fileName.split("/").indexOf("..") !== -1) {
    return "invalid relative path: " + fileName;
  }
  // all good
  return null;
}

function readAndAssertNoEof(reader, buffer, offset, length, position, callback) {
  if (length === 0) {
    // fs.read will throw an out-of-bounds error if you try to read 0 bytes from a 0 byte file
    return setImmediate(function() { callback(null, newBuffer(0)); });
  }
  reader.read(buffer, offset, length, position, function(err, bytesRead) {
    if (err) return callback(err);
    if (bytesRead < length) {
      return callback(new Error("unexpected EOF"));
    }
    callback();
  });
}

util.inherits(AssertByteCountStream, Transform);
function AssertByteCountStream(byteCount) {
  Transform.call(this);
  this.actualByteCount = 0;
  this.expectedByteCount = byteCount;
}
AssertByteCountStream.prototype._transform = function(chunk, encoding, cb) {
  this.actualByteCount += chunk.length;
  if (this.actualByteCount > this.expectedByteCount) {
    var msg = "too many bytes in the stream. expected " + this.expectedByteCount + ". got at least " + this.actualByteCount;
    return cb(new Error(msg));
  }
  cb(null, chunk);
};
AssertByteCountStream.prototype._flush = function(cb) {
  if (this.actualByteCount < this.expectedByteCount) {
    var msg = "not enough bytes in the stream. expected " + this.expectedByteCount + ". got only " + this.actualByteCount;
    return cb(new Error(msg));
  }
  cb();
};

util.inherits(RandomAccessReader, EventEmitter);
function RandomAccessReader() {
  EventEmitter.call(this);
  this.refCount = 0;
}
RandomAccessReader.prototype.ref = function() {
  this.refCount += 1;
};
RandomAccessReader.prototype.unref = function() {
  var self = this;
  self.refCount -= 1;

  if (self.refCount > 0) return;
  if (self.refCount < 0) throw new Error("invalid unref");

  self.close(onCloseDone);

  function onCloseDone(err) {
    if (err) return self.emit('error', err);
    self.emit('close');
  }
};
RandomAccessReader.prototype.createReadStream = function(options) {
  var start = options.start;
  var end = options.end;
  if (start === end) {
    var emptyStream = new PassThrough();
    setImmediate(function() {
      emptyStream.end();
    });
    return emptyStream;
  }
  var stream = this._readStreamForRange(start, end);

  var destroyed = false;
  var refUnrefFilter = new RefUnrefFilter(this);
  stream.on("error", function(err) {
    setImmediate(function() {
      if (!destroyed) refUnrefFilter.emit("error", err);
    });
  });
  refUnrefFilter.destroy = function() {
    stream.unpipe(refUnrefFilter);
    refUnrefFilter.unref();
    stream.destroy();
  };

  var byteCounter = new AssertByteCountStream(end - start);
  refUnrefFilter.on("error", function(err) {
    setImmediate(function() {
      if (!destroyed) byteCounter.emit("error", err);
    });
  });
  byteCounter.destroy = function() {
    destroyed = true;
    refUnrefFilter.unpipe(byteCounter);
    refUnrefFilter.destroy();
  };

  return stream.pipe(refUnrefFilter).pipe(byteCounter);
};
RandomAccessReader.prototype._readStreamForRange = function(start, end) {
  throw new Error("not implemented");
};
RandomAccessReader.prototype.read = function(buffer, offset, length, position, callback) {
  var readStream = this.createReadStream({start: position, end: position + length});
  var writeStream = new Writable();
  var written = 0;
  writeStream._write = function(chunk, encoding, cb) {
    chunk.copy(buffer, offset + written, 0, chunk.length);
    written += chunk.length;
    cb();
  };
  writeStream.on("finish", callback);
  readStream.on("error", function(error) {
    callback(error);
  });
  readStream.pipe(writeStream);
};
RandomAccessReader.prototype.close = function(callback) {
  setImmediate(callback);
};

util.inherits(RefUnrefFilter, PassThrough);
function RefUnrefFilter(context) {
  PassThrough.call(this);
  this.context = context;
  this.context.ref();
  this.unreffedYet = false;
}
RefUnrefFilter.prototype._flush = function(cb) {
  this.unref();
  cb();
};
RefUnrefFilter.prototype.unref = function(cb) {
  if (this.unreffedYet) return;
  this.unreffedYet = true;
  this.context.unref();
};

var cp437 = '\u0000☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ';
function decodeBuffer(buffer, start, end, isUtf8) {
  if (isUtf8) {
    return buffer.toString("utf8", start, end);
  } else {
    var result = "";
    for (var i = start; i < end; i++) {
      result += cp437[buffer[i]];
    }
    return result;
  }
}

function readUInt64LE(buffer, offset) {
  // there is no native function for this, because we can't actually store 64-bit integers precisely.
  // after 53 bits, JavaScript's Number type (IEEE 754 double) can't store individual integers anymore.
  // but since 53 bits is a whole lot more than 32 bits, we do our best anyway.
  var lower32 = buffer.readUInt32LE(offset);
  var upper32 = buffer.readUInt32LE(offset + 4);
  // we can't use bitshifting here, because JavaScript bitshifting only works on 32-bit integers.
  return upper32 * 0x100000000 + lower32;
  // as long as we're bounds checking the result of this function against the total file size,
  // we'll catch any overflow errors, because we already made sure the total file size was within reason.
}

// Node 10 deprecated new Buffer().
var newBuffer;
if (typeof Buffer.allocUnsafe === "function") {
  newBuffer = function(len) {
    return Buffer.allocUnsafe(len);
  };
} else {
  newBuffer = function(len) {
    return new Buffer(len);
  };
}

function defaultCallback(err) {
  if (err) throw err;
}


/***/ }),

/***/ 2877:
/***/ ((module) => {

module.exports = eval("require")("encoding");


/***/ }),

/***/ 2237:
/***/ ((module) => {

module.exports = eval("require")("memcpy");


/***/ }),

/***/ 2357:
/***/ ((module) => {

"use strict";
module.exports = require("assert");

/***/ }),

/***/ 4293:
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ 8614:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 5747:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 8605:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 7211:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 1631:
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ 2087:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 5622:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 2413:
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ 4016:
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ 8835:
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ 1669:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ 8761:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	__webpack_require__.ab = __dirname + "/";/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(2932);
/******/ })()
;