#!/bin/bash

# Comprehensive test script for all test types
# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Running Comprehensive Test Suite"
echo "===================================="
echo ""

# Track test results
UNIT_PASS=0
INTEGRATION_PASS=0
E2E_PASS=0
A11Y_PASS=0

# 1. Unit Tests
echo "📋 Running Unit Tests..."
if npm run test:unit; then
  echo -e "${GREEN}✓ Unit tests passed${NC}"
  UNIT_PASS=1
else
  echo -e "${RED}✗ Unit tests failed${NC}"
fi
echo ""

# 2. Integration Tests  
echo "🔗 Running Integration Tests..."
if npm run test:integration; then
  echo -e "${GREEN}✓ Integration tests passed${NC}"
  INTEGRATION_PASS=1
else
  echo -e "${RED}✗ Integration tests failed${NC}"
fi
echo ""

# 3. E2E Tests
echo "🎭 Running E2E Tests..."
if npm run test:e2e; then
  echo -e "${GREEN}✓ E2E tests passed${NC}"
  E2E_PASS=1
else
  echo -e "${RED}✗ E2E tests failed${NC}"
fi
echo ""

# 4. Accessibility Tests
echo "♿ Running Accessibility Tests..."
if npm run test:a11y; then
  echo -e "${GREEN}✓ Accessibility tests passed${NC}"
  A11Y_PASS=1
else
  echo -e "${RED}✗ Accessibility tests failed${NC}"
fi
echo ""

# Summary
echo "===================================="
echo "📊 Test Summary"
echo "===================================="
echo -e "Unit Tests:        $([[ $UNIT_PASS -eq 1 ]] && echo -e ${GREEN}PASS${NC} || echo -e ${RED}FAIL${NC})"
echo -e "Integration Tests: $([[ $INTEGRATION_PASS -eq 1 ]] && echo -e ${GREEN}PASS${NC} || echo -e ${RED}FAIL${NC})"
echo -e "E2E Tests:         $([[ $E2E_PASS -eq 1 ]] && echo -e ${GREEN}PASS${NC} || echo -e ${RED}FAIL${NC})"
echo -e "Accessibility:     $([[ $A11Y_PASS -eq 1 ]] && echo -e ${GREEN}PASS${NC} || echo -e ${RED}FAIL${NC})"
echo ""

# Exit with error if any test failed
TOTAL=$((UNIT_PASS + INTEGRATION_PASS + E2E_PASS + A11Y_PASS))
if [ $TOTAL -eq 4 ]; then
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi
