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
      message: 'Sorry but this skin is currently not supported.',
    };
  }

  static allServersFull() {
    return {
      id: 'ALL_SERVERS_FULL',
      message: 'Sorry, all of our CS:GO test servers are currently full. Please try again later.',
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
      message: 'Ouch! An unexpected server error occurred.',
    };
  }

  static validationError(message) {
    return {
      id: 'VALIDATION_ERROR',
      message,
    };
  }
}

module.exports = ErrorResponse;
