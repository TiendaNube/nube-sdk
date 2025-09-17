# @tiendanube/nube-sdk-helper

Utility functions and type guards for NubeSDK.

## Installation

```bash
npm install @tiendanube/nube-sdk-helper
```

## Usage

### Type Guards

```typescript
import { isObject, isPlainObject, isNonEmptyString, isValidNumber, isDefined } from '@tiendanube/nube-sdk-helper';

// Check if value is any kind of object (arrays, dates, etc.)
if (isObject(value)) {
  // value is object
}

// Check if value is a plain object only (not arrays, dates, etc.)
if (isPlainObject(value)) {
  // value is Record<string, unknown>
}

// Check if value is a non-empty string
if (isNonEmptyString(value)) {
  // value is string
}

// Check if value is a valid number (not NaN)
if (isValidNumber(value)) {
  // value is number
}

// Check if value is defined (not null or undefined)
if (isDefined(value)) {
  // value is T (non-null, non-undefined)
}
```

### Utility Functions

```typescript
import { deepClone, debounce, throttle } from '@tiendanube/nube-sdk-helper';

// Deep clone an object
const cloned = deepClone(originalObject);

// Debounce a function
const debouncedFn = debounce(myFunction, 300);

// Throttle a function
const throttledFn = throttle(myFunction, 100);
```

## API Reference

### Type Guards

- `isObject(value)` - Checks if value is any kind of object (including arrays, dates, etc.)
- `isPlainObject(value)` - Checks if value is a plain object (excludes arrays, dates, etc.)
- `isNonEmptyString(value)` - Checks if value is a non-empty string
- `isValidNumber(value)` - Checks if value is a valid number (not NaN)
- `isDefined(value)` - Checks if value is defined (not null or undefined)

### Utilities

- `deepClone<T>(obj: T): T` - Deep clones an object using JSON serialization
- `debounce<T>(func: T, wait: number)` - Creates a debounced version of a function
- `throttle<T>(func: T, limit: number)` - Creates a throttled version of a function

## License

MIT
