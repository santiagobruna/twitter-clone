"""Respostas de erro padronizadas para as views."""

from rest_framework import status
from rest_framework.response import Response


def error_response(code, message, http_status, fields=None):
    payload = {
        'error': {
            'code': code,
            'message': message,
        }
    }
    if fields:
        payload['error']['fields'] = fields
    return Response(payload, status=http_status)


def bad_request(message, code='BAD_REQUEST', fields=None):
    return error_response(code, message, status.HTTP_400_BAD_REQUEST, fields)


def unauthorized(message='Autenticação necessária.', code='UNAUTHORIZED'):
    return error_response(code, message, status.HTTP_401_UNAUTHORIZED)


def forbidden(message='Você não tem permissão para esta ação.', code='FORBIDDEN'):
    return error_response(code, message, status.HTTP_403_FORBIDDEN)


def not_found(message='Recurso não encontrado.', code='NOT_FOUND'):
    return error_response(code, message, status.HTTP_404_NOT_FOUND)


def conflict(message, code='CONFLICT'):
    return error_response(code, message, status.HTTP_409_CONFLICT)
