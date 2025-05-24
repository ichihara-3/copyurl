# Test Suite Documentation

This directory contains comprehensive unit and integration tests for the CopyURL Chrome extension.

## Test Structure

```
tests/
├── setup.js                           # Test environment setup and mocks
├── Copy.test.js                       # Unit tests for Copy module
├── background.test.js                 # Unit tests for background script
├── README.md                          # This documentation
└── integration/                       # Integration test suite
    ├── clipboard.integration.test.js      # Clipboard operations tests
    ├── background.integration.test.js     # Background script integration
    ├── options.integration.test.js        # Options page interaction tests
    ├── contextmenu.integration.test.js    # Context menu functionality tests
    ├── error-scenarios.integration.test.js # Error handling tests
    └── cross-browser.integration.test.js  # Cross-browser compatibility tests
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Test Coverage
```bash
npm run test:coverage
```

## Test Coverage Areas

### Unit Tests
- Basic Copy module functionality
- Background script menu initialization
- Core module exports and imports

### Integration Tests

#### Clipboard Operations (`clipboard.integration.test.js`)
- URL copying with different formats
- Rich link copying with HTML and text
- Clipboard API fallback mechanisms
- Notification handling
- Cross-browser clipboard compatibility
- Error scenarios for clipboard failures

#### Background Script (`background.integration.test.js`)
- Extension lifecycle (install, startup)
- Menu initialization and updates
- Storage caching and synchronization
- Message handling between components
- Script execution and error handling
- Chrome API integration

#### Options Page (`options.integration.test.js`)
- Notification settings loading/saving
- Context menu configuration
- Default format selection
- Internationalization support
- User interaction simulation
- Storage persistence

#### Context Menus (`contextmenu.integration.test.js`)
- Context menu creation and configuration
- Menu visibility updates
- Click event handling
- Menu validation
- Storage integration
- Error handling for menu operations

#### Error Scenarios (`error-scenarios.integration.test.js`)
- Clipboard API failures and fallbacks
- Storage errors and recovery
- Script execution errors on restricted pages
- Network connectivity issues
- Browser API unavailability
- Permission denied scenarios

#### Cross-Browser Compatibility (`cross-browser.integration.test.js`)
- Chrome browser specific features
- Firefox limitations and workarounds
- Safari clipboard restrictions
- Edge compatibility
- Mobile browser support
- Legacy browser fallbacks
- Extension context variations

## Test Environment

The tests use Jest with Node.js environment and extensive mocking of:
- Chrome Extension APIs (`chrome.*`)
- Browser APIs (`navigator.clipboard`, `document`, etc.)
- DOM methods and properties
- Network and storage operations

## Mock Strategy

### Chrome API Mocking
All Chrome extension APIs are mocked to simulate:
- Storage operations (`chrome.storage.sync`)
- Context menu operations (`chrome.contextMenus`)
- Script execution (`chrome.scripting.executeScript`)
- Runtime messaging (`chrome.runtime`)
- Internationalization (`chrome.i18n`)

### DOM and Browser API Mocking
Browser APIs are mocked to test:
- Clipboard operations (`navigator.clipboard`)
- DOM manipulation (`document.createElement`, etc.)
- Event handling (`addEventListener`)
- Element interactions

### Cross-Browser Simulation
Different browser environments are simulated by:
- Modifying available APIs
- Changing error messages and behavior
- Testing API limitations and restrictions
- Validating fallback mechanisms

## Error Testing Strategy

### Comprehensive Error Coverage
- API unavailability (missing methods/objects)
- Permission denied errors
- Network failures
- Quota exceeded errors
- Invalid parameters and states
- Unexpected exceptions

### Graceful Degradation
Tests verify that the extension:
- Falls back appropriately when APIs fail
- Logs errors appropriately
- Continues functioning with reduced features
- Provides user feedback when appropriate

## Best Practices for Adding Tests

### When Adding New Features
1. Add unit tests for core functionality
2. Add integration tests for user workflows
3. Test error scenarios and edge cases
4. Verify cross-browser compatibility
5. Update this documentation

### Test Naming Convention
- Use descriptive test names: `should handle X when Y occurs`
- Group related tests in `describe` blocks
- Use consistent patterns across test files

### Mocking Guidelines
- Mock external dependencies completely
- Simulate realistic error conditions
- Test both success and failure paths
- Verify proper cleanup and resource management

## Continuous Integration

The test suite is designed to run in CI/CD environments and provides:
- Exit codes for build success/failure
- Coverage reporting
- Detailed error messages for debugging
- Consistent behavior across environments