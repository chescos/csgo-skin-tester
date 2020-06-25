const _ = require('lodash');

class ErrorResponse {
  static inspectionFailed() {
    return {
      id: 'INSPECTION_FAILED',
      message: 'Failed to inspect the given CS:GO inspect link, please try again.',
    };
  }

  static unsupportedSkin() {
    return {
      id: 'UNSUPPORTED_SKIN',
      message: 'This skin is currently not supported.',
    };
  }

  static notFound() {
    return {
      id: 'NOT_FOUND',
      message: 'Whoops, this endpoint does not exist.',
    };
  }

  static serverError() {
    return {
      id: 'SERVER_ERROR',
      message: 'An unexpected server error occurred.',
    };
  }

  static validationError(error) {
    const firstError = _.first(error.array());

    return {
      id: 'VALIDATION_ERROR',
      message: `Parameter "${firstError.param}" failed validation: "${firstError.msg}"`,
    };
  }
}

module.exports = ErrorResponse;
