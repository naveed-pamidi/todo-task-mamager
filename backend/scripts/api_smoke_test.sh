#!/usr/bin/env bash
# End-to-end API check against a running server.
# Usage: ./scripts/api_smoke_test.sh [base_url]     (default http://127.0.0.1:8000)
set -u
BASE="${1:-http://127.0.0.1:8000}/api/tasks"
PASS=0; FAIL=0

check() {  # check "<name>" <expected_status> <actual_status>
  if [ "$2" = "$3" ]; then echo "PASS  $1 (HTTP $3)"; PASS=$((PASS+1)); else echo "FAIL  $1 (expected $2, got $3)"; FAIL=$((FAIL+1)); fi
}
req() { curl -s -o /tmp/resp.json -w "%{http_code}" -X "$1" "$2" -H "Content-Type: application/json" ${3:+-d "$3"}; }

S=$(req POST "$BASE/" '{"title":"Smoke test task","description":"created by script","deadline":"2020-01-01","priority":"high"}')
check "POST create task" 201 "$S"
ID=$(python3 -c "import json;print(json.load(open('/tmp/resp.json'))['id'])")

check "POST empty title is rejected"   400 "$(req POST "$BASE/" '{"title":"   "}')"
check "GET list tasks"                 200 "$(req GET "$BASE/")"
check "GET single task"                200 "$(req GET "$BASE/$ID/")"
check "GET missing task"               404 "$(req GET "$BASE/999999/")"
check "PUT full update"                200 "$(req PUT "$BASE/$ID/" '{"title":"Smoke test updated","description":"","deadline":"2030-05-05","priority":"low","status":"pending"}')"
check "PATCH mark completed"           200 "$(req PATCH "$BASE/$ID/" '{"status":"completed"}')"
check "GET filter status=completed"    200 "$(req GET "$BASE/?status=completed")"
check "GET filter priority + search"   200 "$(req GET "$BASE/?priority=low&search=smoke")"
check "GET overdue"                    200 "$(req GET "$BASE/?overdue=1")"
check "GET stats"                      200 "$(req GET "$BASE/stats/")"
check "GET invalid status filter"      400 "$(req GET "$BASE/?status=bogus")"
check "DELETE task"                    204 "$(req DELETE "$BASE/$ID/")"
check "GET deleted task"               404 "$(req GET "$BASE/$ID/")"

echo "-----"; echo "Passed: $PASS  Failed: $FAIL"
[ "$FAIL" -eq 0 ]
