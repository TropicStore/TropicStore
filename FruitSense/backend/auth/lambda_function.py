import base64
import hashlib
import hmac
import json
import os
import re
import secrets
import time

import boto3

USERS_TABLE = os.environ.get('USERS_TABLE', 'FruitSense-Users')
TOKEN_SECRET = os.environ.get('AUTH_TOKEN_SECRET', '')

PBKDF2_ITERATIONS = 180000
TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30

EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(USERS_TABLE)


def json_response(status_code, body):
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
            'Access-Control-Allow-Credentials': 'false',
        },
        'body': json.dumps(body),
    }


def now_iso():
    return time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())


def parse_body(event):
    if event.get('body') is None:
        return {}
    try:
        return json.loads(event['body'])
    except (ValueError, TypeError):
        return {}


def hash_password(password):
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, PBKDF2_ITERATIONS, dklen=32)
    return (
        base64.b64encode(salt).decode('ascii'),
        base64.b64encode(dk).decode('ascii'),
        PBKDF2_ITERATIONS,
    )


def verify_password(password, salt_b64, hash_b64, iterations):
    try:
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(hash_b64)
        dk = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations, dklen=32)
        return hmac.compare_digest(dk, expected)
    except (ValueError, TypeError):
        return False


def b64url_encode(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('ascii')


def b64url_decode(text):
    return base64.urlsafe_b64decode(text + '=' * (-len(text) % 4))


def issue_token(uid):
    exp = int(time.time()) + TOKEN_TTL_SECONDS
    payload_b64 = b64url_encode(f'{uid}\n{exp}'.encode('utf-8'))
    signature = hmac.new(TOKEN_SECRET.encode('utf-8'), payload_b64.encode('ascii'), hashlib.sha256).digest()
    return f'{payload_b64}.{b64url_encode(signature)}'


def verify_token(token):
    if not TOKEN_SECRET:
        return None
    try:
        payload_b64, signature_b64 = token.split('.', 1)
        expected = hmac.new(TOKEN_SECRET.encode('utf-8'), payload_b64.encode('ascii'), hashlib.sha256).digest()
        if not hmac.compare_digest(b64url_decode(signature_b64), expected):
            return None
        payload = b64url_decode(payload_b64).decode('utf-8')
        uid, exp = payload.rsplit('\n', 1)
        if int(exp) < int(time.time()):
            return None
        return uid
    except Exception:
        return None


def bearer_uid(event):
    headers = event.get('headers') or {}
    authorization = headers.get('Authorization') or headers.get('authorization') or ''
    if not authorization.startswith('Bearer '):
        return None
    return verify_token(authorization[len('Bearer '):].strip())


def public_user(item):
    return {
        'uid': item.get('email', ''),
        'email': item.get('email', ''),
        'displayName': item.get('display_name', ''),
        'phoneNumber': item.get('phone_number'),
        'photoURL': item.get('photo_url'),
        'createdAt': item.get('created_at'),
    }


def handle_signup(event):
    body = parse_body(event)
    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''
    display_name = (body.get('displayName') or '').strip()

    if not EMAIL_RE.match(email):
        return json_response(400, {'message': 'Please enter a valid email address.'})
    if len(password) < 6:
        return json_response(400, {'message': 'Password must be at least 6 characters.'})

    existing = table.get_item(Key={'email': email}).get('Item')
    if existing:
        return json_response(409, {'message': 'An account with this email already exists.'})

    salt, password_hash, iterations = hash_password(password)
    created = now_iso()
    table.put_item(Item={
        'email': email,
        'password_salt': salt,
        'password_hash': password_hash,
        'password_iterations': iterations,
        'display_name': display_name,
        'created_at': created,
        'updated_at': created,
    })

    item = table.get_item(Key={'email': email}).get('Item')
    return json_response(201, {'user': public_user(item)})


def handle_login(event):
    body = parse_body(event)
    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''

    item = table.get_item(Key={'email': email}).get('Item')
    if not item:
        return json_response(401, {'message': 'Invalid credentials. Please check your email and password.'})

    if not verify_password(
        password,
        item.get('password_salt', ''),
        item.get('password_hash', ''),
        int(item.get('password_iterations', 0)),
    ):
        return json_response(401, {'message': 'Invalid credentials. Please check your email and password.'})

    token = issue_token(email)
    return json_response(200, {
        'token': token,
        'expiresIn': TOKEN_TTL_SECONDS,
        'user': public_user(item),
    })


def handle_me(event):
    uid = bearer_uid(event)
    if not uid:
        return json_response(401, {'message': 'Unauthorized. Please sign in again.'})

    item = table.get_item(Key={'email': uid}).get('Item')
    if not item:
        return json_response(401, {'message': 'Unauthorized. Please sign in again.'})

    return json_response(200, {'user': public_user(item)})


def handle_logout(event):
    if not bearer_uid(event):
        return json_response(401, {'message': 'Unauthorized.'})
    return json_response(200, {'ok': True})


def lambda_handler(event, context):
    route_key = event.get('routeKey', '')
    method = event.get('httpMethod') or (event.get('requestContext') or {}).get('http', {}).get('method', '')
    path = event.get('path') or (event.get('requestContext') or {}).get('http', {}).get('path', '')

    try:
        if route_key == 'POST /auth/signup' or (method == 'POST' and path.endswith('/auth/signup')):
            return handle_signup(event)
        if route_key == 'POST /auth/login' or (method == 'POST' and path.endswith('/auth/login')):
            return handle_login(event)
        if route_key == 'GET /auth/me' or (method == 'GET' and path.endswith('/auth/me')):
            return handle_me(event)
        if route_key == 'POST /auth/logout' or (method == 'POST' and path.endswith('/auth/logout')):
            return handle_logout(event)
        if method == 'OPTIONS':
            return json_response(200, {})
        return json_response(404, {'message': 'Route not found.'})
    except Exception as error:  # pragma: no cover
        return json_response(500, {'message': f'Server error: {error}'})