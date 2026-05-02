# Mermaid Render Report

## Summary

- Total: 4
- Passed: 3
- Failed: 1

## By Type

| Type | Total | Failed |
|---|---:|---:|
| flowchart | 2 | 1 |
| pie | 1 | 0 |
| xychart | 1 | 0 |

## Failed Diagrams

### SELFTEST:1

- ID: `selftest-invalid-flowchart`
- Type: `flowchart`
- Hash: `selftest004`

Error:

````txt
Parse error on line 3:
...wchart TB    A -->
---------------------^
Expecting 'AMP', 'COLON', 'PIPE', 'TESTSTR', 'DOWN', 'DEFAULT', 'NUM', 'COMMA', 'NODE_STRING', 'BRKT', 'MINUS', 'MULT', 'UNICODE_TEXT', got 'EOF'
````

Code:

````mermaid
flowchart TB
    A -->
````
