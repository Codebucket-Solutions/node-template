const constant = require("./constant");
const { getSearchAbleData, checkForMatch, getSearchType } = require("./search-util");
const token = require("./token");
const { camelize } = require("./helper");
const { getDate, addDate, updateFormat } = require("./time");
const { compare, hashPassword } = require("./hash");
const { generateOtp, messenger } = require("./message");
const {
	fileUpload,
	fileDownload,
	uploader,
	fileStorage,
	sanitizeFilename,
	buildUploadKey,
	createUploadStorage,
	createMulterUpload,
	createSingleUpload,
	createArrayUpload,
	handleMulterUpload,
	uploadMiddleware,
} = require("./upload");
const { sendMail } = require("./mail");
const { renderPdf } = require("./pdf");
const {
	PagiHelpV2,
	normalizePaginationDialect,
	createPaginationHelper,
	paginationHelper,
	paginate,
	paginateCursor,
	resolveCursorPage,
} = require("./pagination");

module.exports = {
	token,
	getSearchAbleData,
	checkForMatch,
	getSearchType,
	constant,
	camelize,
	getDate,
	updateFormat,
	compare,
	hashPassword,
	addDate,
	generateOtp,
	sendMail,
	messenger,
	fileUpload,
	fileDownload,
	uploader,
	fileStorage,
	sanitizeFilename,
	buildUploadKey,
	createUploadStorage,
	createMulterUpload,
	createSingleUpload,
	createArrayUpload,
	handleMulterUpload,
	uploadMiddleware,
	renderPdf,
	PagiHelpV2,
	normalizePaginationDialect,
	createPaginationHelper,
	paginationHelper,
	paginate,
	paginateCursor,
	resolveCursorPage,
};
