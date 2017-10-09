export default function CategoryService(client) {
    /**
     * Defines the return format for the API. The API can provide the content as JSON (json) or XML (xml).
     * @type {String} [returnFormat=json]
     */
    let returnFormat = 'json';

    return {
        readAll,
        readByUuid,
        getReturnFormat,
        setReturnFormat
    };

    /**
     * Receives categories from the API end point as a paginated list.
     *
     * @param {Number} limit - The limit of products you want to receive
     * @param {Number} offset - Offset of the products you want to receive
     * @returns {Promise}
     */
    function readAll(limit = 25, offset = 0) {
        return client.get(`category.${returnFormat}?limit=${limit}&offset=${offset}`).then((response) => {
            return response.data;
        });
    }

    /**
     * Receives a single category from the API end point.
     *
     * @param {String} uuid - Category manufacturer UUID
     * @returns {Promise}
     */
    function readByUuid(uuid) {
        if (!uuid) {
            return Promise.reject(new Error('"uuid" argument needs to be provided'));
        }

        return client.get(`category/${uuid}.${returnFormat}`).then((response) => {
            return response.data;
        });
    }

    /**
     * Getter for the return format of the service.
     * @returns {string} [returnFormat]
     */
    function getReturnFormat() {
        return returnFormat;
    }

    /**
     * Setter for the return format of the service.
     * @param {String} newReturnFormat
     * @returns {String}
     */
    function setReturnFormat(newReturnFormat) {
        returnFormat = newReturnFormat;

        return returnFormat;
    }
}
