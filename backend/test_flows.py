import urllib.request
import json

base = 'http://127.0.0.1:8001'

def post(url, data):
    req = urllib.request.Request(
        base + url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

def get(url):
    req = urllib.request.Request(base + url)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

def patch(url, data):
    req = urllib.request.Request(
        base + url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='PATCH'
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

print('=== 16. TEST COMPLETE FLOW ===')

# Flow A: Register new citizen
email = 'testcitizen@example.com'
reg_payload = {
    'name': 'Test Citizen',
    'age': 21,
    'area': 'Anna Nagar',
    'email': email,
    'password': 'test123',
    'role': 'citizen'
}

status, body = post('/api/auth/register', reg_payload)
print('Register status:', status)
print('Register body:', body)
if status == 409:
    print('User already registered in previous run, testing login...')
    status, body = post('/api/auth/login', {'email': email, 'password': 'test123'})
    assert status == 200
else:
    assert status == 201, f'Expected 201, got {status}'
    assert 'password' not in body, 'Password must not be returned'

citizen_id = body['id']
assert body['name'] == 'Test Citizen'
assert body['age'] == 21
assert body['area'] == 'Anna Nagar'
assert body['email'] == email
assert body['role'] == 'citizen'
print('Flow A passed: Citizen registered with correct profile data.')

# Flow B: Login citizen
status, login_user = post('/api/auth/login', {'email': email, 'password': 'test123'})
print('\nLogin status:', status)
print('Login user profile:', login_user)
assert status == 200
assert 'password' not in login_user
assert login_user['id'] == citizen_id
assert login_user['name'] == 'Test Citizen'
assert login_user['age'] == 21
assert login_user['area'] == 'Anna Nagar'
assert login_user['email'] == email
assert login_user['role'] == 'citizen'
print('Flow B passed: Citizen login succeeded with full profile.')

# Flow D / 12: GET /api/users/{user_id}
status, profile = get(f'/api/users/{citizen_id}')
print('\nGET Profile status:', status)
print('GET Profile body:', profile)
assert status == 200
assert profile['id'] == citizen_id
assert profile['name'] == 'Test Citizen'
assert profile['age'] == 21
assert profile['area'] == 'Anna Nagar'
assert 'password' not in profile
print('Flow D & Requirement 12 passed: User profile endpoint works without returning password.')

# Flow E & F: Citizen creates a report
status, new_report = post('/api/issues', {
    'title': 'Broken Pavement near 2nd Avenue',
    'category': 'Roads & Footpaths',
    'description': 'Damaged pedestrian pathway near 2nd Avenue roundtana.',
    'location': 'Anna Nagar 2nd Avenue',
    'zone': 'Zone 4 • Anna Nagar',
    'ward': 'Ward 104',
    'priority': 'High',
    'reporter_id': citizen_id
})
print('\nCreate report status:', status)
print('Created report ID:', new_report['id'])
print('Reported by ID:', new_report['reporter_id'])
report_rep_id = new_report['reporter_id']
assert report_rep_id == citizen_id, f'reporter_id {report_rep_id} != {citizen_id}'
report_id = new_report['id']
print('Flow E & F passed: Issue created with reporter_id = citizen_id.')

# Flow G: My Reports only shows this citizen's reports
status, user_issues = get(f'/api/users/{citizen_id}/issues')
print('\nUser reports count:', len(user_issues))
assert status == 200
assert any(i['id'] == report_id for i in user_issues)
for iss in user_issues:
    iss_rep_id = iss['reporter_id']
    assert iss_rep_id == citizen_id, f'Report {iss["id"]} does not belong to citizen {citizen_id}'
print('Flow G passed: Only citizen\'s own reports are returned by /api/users/{id}/issues.')

# Flow H & I: Logout & Login again
status, relogin_user = post('/api/auth/login', {'email': email, 'password': 'test123'})
assert status == 200
assert relogin_user['id'] == citizen_id
assert relogin_user['name'] == 'Test Citizen'
assert relogin_user['age'] == 21
assert relogin_user['area'] == 'Anna Nagar'
print('\nFlow H & I passed: Re-login successful.')

# Flow J & K: Profile still shows citizen data & My Reports still contains submitted report
status, user_issues_after = get(f'/api/users/{citizen_id}/issues')
assert status == 200
assert any(i['id'] == report_id for i in user_issues_after)
print('Flow J & K passed: Profile and reports persisted across re-login.')

# Test duplicate email HTTP 409
status, dup = post('/api/auth/register', reg_payload)
print('\nDuplicate register status:', status)
assert status == 409, f'Expected 409 for duplicate email, got {status}'
print('Duplicate email returns HTTP 409 as required.')

# Flow 17: Authority regression test
status, auth_user = post('/api/auth/login', {
    'email': 'authority@civicconnect.in',
    'password': 'authority123'
})
print('\nAuthority login status:', status)
print('Authority profile:', auth_user)
assert status == 200
assert auth_user['role'] == 'authority'
assert 'password' not in auth_user

# Authority view all reports
status, all_reports = get('/api/issues')
assert status == 200
assert any(i['id'] == report_id for i in all_reports)
print(f'Authority can view all reports (total count: {len(all_reports)}).')

# Authority update status + remarks
status, updated_report = patch(f'/api/issues/{report_id}/status', {
    'status': 'In Progress',
    'remarks': 'Zone 4 road crew dispatched to repair pavement.',
    'updated_by': 'Zone 4 Municipal Authority'
})
assert status == 200
assert updated_report['status'] == 'In Progress'
print('Authority updated report status to In Progress with remarks.')

# Citizen checks updated status
status, citizen_check = get(f'/api/users/{citizen_id}/issues')
curr_issue = next(i for i in citizen_check if i['id'] == report_id)
assert curr_issue['status'] == 'In Progress'
print('Citizen sees updated status In Progress.')

print('\n========================================')
print('ALL TESTS (FLOWS A - K & 17) PASSED 100%')
print('========================================')
