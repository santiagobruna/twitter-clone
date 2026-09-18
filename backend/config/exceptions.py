from rest_framework import status
from rest_framework.exceptions import (
    AuthenticationFailed,
    NotAuthenticated,
    NotFound,
    PermissionDenied,
    ValidationError,
)
from rest_framework.response import Response
from rest_framework.views import exception_handler


def api_error(code, message, http_status, fields=None):
    """Resposta de erro padronizada da API."""
    payload = {
        'error': {
            'code': code,
            'message': message,
        }
    }
    if fields:
        payload['error']['fields'] = fields
    return Response(payload, status=http_status)


def _flatten_fields(detail):
    if not isinstance(detail, dict):
        return None

    fields = {}
    for key, value in detail.items():
        if key in ('non_field_errors', 'detail'):
            continue
        if isinstance(value, list):
            fields[key] = [str(item) for item in value]
        else:
            fields[key] = [str(value)]
    return fields or None


def _first_message(detail, fallback):
    if isinstance(detail, list) and detail:
        return str(detail[0])
    if isinstance(detail, dict):
        if 'non_field_errors' in detail and detail['non_field_errors']:
            return str(detail['non_field_errors'][0])
        if 'detail' in detail:
            return str(detail['detail'])
        for value in detail.values():
            if isinstance(value, list) and value:
                return str(value[0])
            if value:
                return str(value)
    if isinstance(detail, str) and detail:
        return detail
    return fallback


def custom_exception_handler(exc, context):
    """
    Padroniza erros DRF para:

    {
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "...",
        "fields": { "email": ["..."] }
      }
    }
    """
    response = exception_handler(exc, context)
    if response is None:
        return None

    detail = getattr(exc, 'detail', response.data)

    if isinstance(exc, (NotAuthenticated, AuthenticationFailed)):
        return api_error(
            'UNAUTHORIZED',
            _first_message(detail, 'Autenticação necessária.'),
            status.HTTP_401_UNAUTHORIZED,
        )

    if isinstance(exc, PermissionDenied):
        return api_error(
            'FORBIDDEN',
            _first_message(detail, 'Você não tem permissão para esta ação.'),
            status.HTTP_403_FORBIDDEN,
        )

    if isinstance(exc, NotFound):
        return api_error(
            'NOT_FOUND',
            _first_message(detail, 'Recurso não encontrado.'),
            status.HTTP_404_NOT_FOUND,
        )

    if isinstance(exc, ValidationError):
        return api_error(
            'VALIDATION_ERROR',
            _first_message(detail, 'Dados inválidos. Verifique os campos e tente novamente.'),
            status.HTTP_400_BAD_REQUEST,
            fields=_flatten_fields(detail),
        )

    # Demais exceções DRF (MethodNotAllowed, Throttled, etc.)
    code = getattr(exc, 'default_code', 'ERROR')
    if isinstance(code, str):
        code = code.upper()
    else:
        code = 'ERROR'

    return api_error(
        code,
        _first_message(detail, 'Não foi possível concluir a solicitação.'),
        response.status_code,
        fields=_flatten_fields(detail) if isinstance(detail, dict) else None,
    )
