# Backend Engineers Wanted - Contract to Full-Time Opportunity

**Resilience 17 Venture Studio** is seeking **exceptional backend engineers**. This is a **1-year contract** with strong potential for conversion to full-time for candidates who demonstrate outstanding work ethics and execution.

## What We're Looking For

We need engineers who can:
- **Follow instructions carefully** - Strong attention to detail and precision
- **Work efficiently** - Ability to move quickly while maintaining quality
- **Code confidently with AI assistants** - Must be comfortable using GitHub Copilot, Cursor, or similar AI coding tools
- **Master vanilla JavaScript fundamentals** - Strong grasp of core JavaScript concepts (you'll use Express.js for routing, but we value engineers who understand the fundamentals)
- **Take initiative** - Identify and solve problems proactively
- **Produce quality work** - Consistently deliver clean, functional code
- **Start immediately** - We need people available to begin right away

## The Role

You'll be implementing well-defined and thoroughly documented API/backend service contracts and business requirements. This role focuses on precise execution of clear specifications in a fast-paced environment.

**Key Responsibilities:**
- Build robust backend services using Node.js and Express
- Implement API contracts with precision and attention to detail  
- Work with MongoDB for data persistence
- Deploy applications on cloud platforms (Heroku/Render)
- Collaborate in an agile team environment
- Report directly to the Engineering Lead

## Essential Requirements

- **Immediate availability** - We need engineers ready to start as soon as possible
- **Node.js** (vanilla JavaScript) and **Express.js**
- **MongoDB** experience
- Experience with **cloud deployment** (Heroku, Render, or similar)
- Understanding of **RESTful API** design and implementation
- **Git/GitHub** proficiency
- Strong debugging and problem-solving skills
- Ability to follow project templates and coding standards precisely

## What We Offer

- **100% remote work**
- **Flexible schedule** - deliverables matter more than hours
- **Real conversion opportunity** - Exceptional performers will be offered full-time positions
- **Fintech/Banking industry exposure** - Work on cutting-edge financial technology
- **Venture Studio environment** - Fast-paced, innovative, entrepreneurial culture

## How to Apply

**DEADLINE: [SUBMISSION_DEADLINE]**

Complete our technical assessment and submit it via this [Google form](https://docs.google.com/forms/d/e/1FAIpQLSd0X19LG0iKaqMI57UvePwacc7Cb9KmF3W05m0HD93ddGgvUg/viewform?usp=publish-editor). You must provide:
1. **Publicly accessible GitHub repository** with your solution
2. **Full deployed endpoint URL** including the path (e.g., `https://myassessmentapp.herokuapp.com/payment-instructions`)

---

## Technical Assessment

**IMPORTANT: You must use the provided project template**  
📦 [Backend Template Repository](https://github.com/the17thstudio/node-template)

Build a **payment instruction parser and executor** that processes financial transaction instructions in a structured format.

### Overview

Your task is to create a REST API that parses payment instructions, validates them against business rules, and executes transactions on provided accounts. This simulates a core component of payment processing systems used in fintech applications.

### Endpoint Specification

**Path:** `POST /payment-instructions`

**Request Format:**
```json
{
  "accounts": [
    {"id": "a", "balance": 230, "currency": "USD"},
    {"id": "b", "balance": 300, "currency": "USD"}
  ],
  "instruction": "DEBIT 30 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b"
}
```

**Response Format (Success):**
```json
{
  "type": "DEBIT",
  "amount": 30,
  "currency": "USD",
  "debit_account": "a",
  "credit_account": "b",
  "execute_by": null,
  "status": "successful",
  "status_reason": "Transaction executed successfully",
  "status_code": "AP00",
  "accounts": [
    {
      "id": "a",
      "balance": 200,
      "balance_before": 230,
      "currency": "USD"
    },
    {
      "id": "b",
      "balance": 330,
      "balance_before": 300,
      "currency": "USD"
    }
  ]
}
```
*Note: Account "a" is the debit account (losing money), account "b" is the credit account (gaining money)*

**Response Format (Error):**
```json
{
  "type": "DEBIT",
  "amount": 30,
  "currency": "EUR",
  "debit_account": "a",
  "credit_account": "b",
  "execute_by": null,
  "status": "failed",
  "status_reason": "Unsupported currency. Only NGN, USD, GBP, and GHS are supported",
  "status_code": "CU02",
  "accounts": [
    {
      "id": "a",
      "balance": 230,
      "balance_before": 230,
      "currency": "USD"
    },
    {
      "id": "b",
      "balance": 300,
      "balance_before": 300,
      "currency": "USD"
    }
  ]
}
```
*Note: For failed transactions, balances remain unchanged*

**Response Format (Unparseable Instruction):**
```json
{
  "type": null,
  "amount": null,
  "currency": null,
  "debit_account": null,
  "credit_account": null,
  "execute_by": null,
  "status": "failed",
  "status_reason": "Malformed instruction: unable to parse keywords",
  "status_code": "SY03",
  "accounts": []
}
```
*Note: When instruction cannot be parsed at all, return null for all parseable fields (type, amount, currency, accounts, execute_by) and empty array for accounts. Only status, status_reason, and status_code should have values.*

### Instruction Syntax

Your parser must support **TWO distinct instruction formats:**

**Format 1 - DEBIT instruction:**
```
DEBIT [amount] [currency] FROM ACCOUNT [account_id] FOR CREDIT TO ACCOUNT [account_id] [ON [date]]
```

**Format 2 - CREDIT instruction:**
```
CREDIT [amount] [currency] TO ACCOUNT [account_id] FOR DEBIT FROM ACCOUNT [account_id] [ON [date]]
```

**Important:** Both formats perform the **same transaction** - money moves from one account to another. The difference is only in phrasing:
- **DEBIT format** emphasizes the source account (FROM ACCOUNT)
- **CREDIT format** emphasizes the destination account (TO ACCOUNT)

In both cases, one account loses money (debit) and one account gains money (credit).

**Keywords (case-insensitive):**
- `DEBIT` / `CREDIT` - Transaction type keyword
- `FROM` - Source account indicator
- `FOR` - Transaction purpose connector
- `TO` - Destination account indicator
- `ACCOUNT` - Account identifier prefix
- `ON` - Optional execution date (YYYY-MM-DD format)

**Supported Currencies (case-insensitive, but must output as UPPERCASE):**
- `NGN` (Nigerian Naira)
- `USD` (US Dollar)
- `GBP` (British Pound)
- `GHS` (Ghanaian Cedi)

**Valid Example Instructions:**
```
DEBIT 500 USD FROM ACCOUNT N90394 FOR CREDIT TO ACCOUNT N9122 ON 2026-09-20
CREDIT 450 NGN TO ACCOUNT acc-002 FOR DEBIT FROM ACCOUNT acc-001 ON 2026-02-21
DEBIT 30 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b
credit 100 gbp to account xyz@bank for debit from account abc
```

### Parsing Rules

1. **Keyword Order:** Keywords must appear in the exact order specified for each format
   - DEBIT format: `DEBIT → FROM ACCOUNT → FOR CREDIT TO ACCOUNT → [ON]`
   - CREDIT format: `CREDIT → TO ACCOUNT → FOR DEBIT FROM ACCOUNT → [ON]`

2. **Case Sensitivity:** 
   - Keywords (`DEBIT`, `CREDIT`, `FROM`, `TO`, etc.) are case-insensitive during parsing
   - Currency codes are case-insensitive during parsing but **must be returned as UPPERCASE** in responses
   - Account IDs are case-sensitive

3. **Spacing:** Keywords must be separated by one or more whitespace characters (spaces, tabs, etc.)
   - Instructions may contain leading/trailing whitespace - handle appropriately
   - Multiple consecutive spaces between keywords should be handled gracefully
   - Example: Both `DEBIT 100 USD` and `DEBIT  100   USD` (multiple spaces) are valid

4. **Account ID Format:** Can contain letters, numbers, hyphens (-), periods (.), and at symbols (@). Any other characters are invalid.

5. **Amount:** Must be a positive integer (no decimals, no negatives)

6. **Date Format:** Must be `YYYY-MM-DD` if the `ON` clause is present (e.g., `2026-09-20`)

7. **Date Comparison Logic:**
   - Use **UTC timezone** for all date comparisons
   - Compare only the date portion (ignore time)
   - If `ON date <= current UTC date`: Execute immediately (status: "successful", code: AP00)
   - If `ON date > current UTC date`: Mark as pending (status: "pending", code: AP02)

8. **Optional Date:** The `ON [date]` clause is optional

9. **No Regular Expressions:** You must parse the instruction using string manipulation methods only (`.split()`, `.indexOf()`, `.substring()`, etc.). **Do not use regex patterns anywhere in your parsing logic.**

### Validation Rules & Status Codes

Your parser must validate the following business rules and return appropriate status codes:

| Validation Rule | Status Code | Example Status Reason |
|----------------|-------------|----------------------|
| Amount must be positive integer | `AM01` | "Amount must be a positive integer" |
| Currencies must match between accounts | `CU01` | "Account currency mismatch" |
| Only NGN, USD, GBP, GHS supported | `CU02` | "Unsupported currency" |
| Sufficient funds required | `AC01` | "Insufficient funds in debit account" |
| Debit and credit accounts must differ | `AC02` | "Debit and credit accounts cannot be the same" |
| Account must exist in accounts array | `AC03` | "Account not found" |
| Account ID must have valid characters | `AC04` | "Invalid account ID format" |
| Date must be in YYYY-MM-DD format | `DT01` | "Invalid date format" |
| Required keywords must be present | `SY01` | "Missing required keyword" |
| Keywords must be in correct order | `SY02` | "Invalid keyword order" |
| General parsing/syntax errors | `SY03` | "Malformed instruction" |
| Successful execution | `AP00` | "Transaction executed successfully" |
| Pending future execution | `AP02` | "Transaction scheduled for future execution" |

**Important Notes on Validation:**
- Your parser should catch and return validation errors with appropriate status codes
- The `status_reason` field should contain a clear, human-readable message (never empty)
  - The status reasons in the table are **examples** - you may customize messages to be more descriptive
  - Example: Instead of "Insufficient funds", you can write "Insufficient funds in account A: has 100 USD, needs 500 USD"
- The `status_code` must match exactly as specified in the table above
- **If multiple validation errors exist, you may return ANY ONE valid error**
  - Our test suite will verify that you caught a valid error, not necessarily a specific one
  - Both syntax errors (SY01, SY02, SY03, AM01, AC04, DT01) and business rule errors (AC01, AC02, AC03, CU01, CU02) are acceptable
  - You can validate in any order - syntax first, business rules first, or as-you-parse

### Transaction Mechanics & Response Fields

**Understanding Debit and Credit:**

Following accounting principles:
- **Debit account** = The account losing money (source)
- **Credit account** = The account gaining money (destination)

**Both instruction formats execute the same transaction:**

Example 1:
```
DEBIT 100 USD FROM ACCOUNT A FOR CREDIT TO ACCOUNT B
```
- Account A loses 100 USD (debit)
- Account B gains 100 USD (credit)
- Response: `debit_account: "A"`, `credit_account: "B"`, `type: "DEBIT"`

Example 2:
```
CREDIT 100 USD TO ACCOUNT B FOR DEBIT FROM ACCOUNT A
```
- Account A loses 100 USD (debit)
- Account B gains 100 USD (credit)  
- Response: `debit_account: "A"`, `credit_account: "B"`, `type: "CREDIT"`

**The `type` field in the response reflects the first keyword used (DEBIT or CREDIT), but the transaction mechanics are identical.**

**Execution Logic:**

**Immediate Execution:**
- If `ON` date is omitted or in the past: Execute immediately, update balances, return `status: "successful"` and `status_code: "AP00"`

**Future Execution:**
- If `ON` date is in the future: Do NOT update balances, return `status: "pending"` and `status_code: "AP02"`
- Balances remain unchanged for pending transactions

### Response Requirements

**HTTP Status Codes:**
- Return **HTTP 200** for successful transactions and pending transactions
- Return **HTTP 400** for all validation errors and parsing failures

**All responses must include these fields:**

1. `type` - "DEBIT" or "CREDIT" (based on first keyword in instruction, or `null` if unparseable)
2. `amount` - The parsed amount as an integer (or `null` if unparseable)
3. `currency` - The parsed currency code in **UPPERCASE** (or `null` if unparseable)
4. `debit_account` - The account losing money (or `null` if unparseable)
5. `credit_account` - The account gaining money (or `null` if unparseable)
6. `execute_by` - The date string (YYYY-MM-DD) or `null` if not provided or unparseable
7. `status` - "successful", "pending", or "failed"
8. `status_reason` - Human-readable message (never empty, always include a meaningful message)
9. `status_code` - Exact code from the validation rules table
10. `accounts` - Array of ONLY the two accounts involved in the transaction (empty array if accounts cannot be identified)
    - **Must maintain the exact order from the request accounts array**
    - If request has accounts in order `[b, a, c]` and transaction uses `a` and `b`, return `[b, a]` in that order

**For completely unparseable instructions:**
- Set all parseable fields (`type`, `amount`, `currency`, etc.) to `null`
- Include appropriate error status, status_reason, and status_code
- Return empty accounts array if accounts cannot be identified

**Account Objects in Response:**
- `id` - Account identifier
- `balance` - Current/final balance after transaction (or unchanged if pending/failed)
- `balance_before` - Original balance before transaction
- `currency` - Account currency in **UPPERCASE**

### Requirements

1. **Use the provided Node.js project scaffold template** - [Backend Template](https://github.com/Resilience-17-Labs/assessment-profold)
   - You must follow the backend template structure exactly
   - Do not deviate from the project organization

2. **No Regular Expressions** - Build the parser using string manipulation methods only
   - ✅ Allowed: `.split('string')`, `.indexOf()`, `.substring()`, `.slice()`, `.trim()`, `.toLowerCase()`, `.toUpperCase()`, `.replace('string', 'string')`, etc.
   - ❌ Not allowed: Regex patterns, `.match()`, `.split(/regex/)`, `.replace(/regex/, 'string')`, `.test()`, etc.
   - Parse instructions using basic string operations only
   - You may use `.split()` and `.replace()` with **string arguments**, but not with regex patterns

3. **Deploy your solution** to Heroku, Render, or similar platform
   - Your endpoint must be publicly accessible at `POST /payment-instructions`
   - **No authentication required** - no bearer tokens, API keys, or any auth mechanisms
   - **No database required** - this assessment doesn't need any database connection

4. **Error Handling** - All errors must return appropriate JSON responses with proper status codes

5. **Code Quality** - Clean, readable, well-organized code that follows the template structure

### Testing Your Solution

**Valid Test Cases:**

Test Case 1 - DEBIT format:
```json
{
  "accounts": [
    {"id": "N90394", "balance": 1000, "currency": "USD"},
    {"id": "N9122", "balance": 500, "currency": "USD"}
  ],
  "instruction": "DEBIT 500 USD FROM ACCOUNT N90394 FOR CREDIT TO ACCOUNT N9122"
}
```
*Expected: Successfully debit 500 from N90394 and credit to N9122*

Test Case 2 - CREDIT format with future date:
```json
{
  "accounts": [
    {"id": "acc-001", "balance": 1000, "currency": "NGN"},
    {"id": "acc-002", "balance": 500, "currency": "NGN"}
  ],
  "instruction": "CREDIT 300 NGN TO ACCOUNT acc-002 FOR DEBIT FROM ACCOUNT acc-001 ON 2026-12-31"
}
```
*Expected: Status "pending", balances unchanged*

Test Case 3 - Case insensitive keywords:
```json
{
  "accounts": [
    {"id": "a", "balance": 500, "currency": "GBP"},
    {"id": "b", "balance": 200, "currency": "GBP"}
  ],
  "instruction": "debit 100 gbp from account a for credit to account b"
}
```
*Expected: Successfully execute, currency returned as "GBP" (uppercase)*

Test Case 4 - Past date (immediate execution):
```json
{
  "accounts": [
    {"id": "x", "balance": 500, "currency": "NGN"},
    {"id": "y", "balance": 200, "currency": "NGN"}
  ],
  "instruction": "DEBIT 100 NGN FROM ACCOUNT x FOR CREDIT TO ACCOUNT y ON 2024-01-15"
}
```
*Expected: Execute immediately with status "successful" (AP00) since date is in the past*

**Invalid Test Cases:**

Test Case 5 - Currency mismatch:
```json
{
  "accounts": [
    {"id": "a", "balance": 100, "currency": "USD"},
    {"id": "b", "balance": 500, "currency": "GBP"}
  ],
  "instruction": "DEBIT 50 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b"
}
```
*Expected: CU01 - Currency mismatch*

Test Case 6 - Insufficient funds:
```json
{
  "accounts": [
    {"id": "a", "balance": 100, "currency": "USD"},
    {"id": "b", "balance": 500, "currency": "USD"}
  ],
  "instruction": "DEBIT 500 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b"
}
```
*Expected: AC01 - Insufficient funds*

Test Case 7 - Unsupported currency:
```json
{
  "accounts": [
    {"id": "a", "balance": 100, "currency": "EUR"},
    {"id": "b", "balance": 500, "currency": "EUR"}
  ],
  "instruction": "DEBIT 50 EUR FROM ACCOUNT a FOR CREDIT TO ACCOUNT b"
}
```
*Expected: CU02 - Unsupported currency*

Test Case 8 - Same account:
```json
{
  "accounts": [
    {"id": "a", "balance": 500, "currency": "USD"}
  ],
  "instruction": "DEBIT 100 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT a"
}
```
*Expected: AC02 - Debit and credit accounts cannot be the same*

Test Case 9 - Negative amount:
```json
{
  "accounts": [
    {"id": "a", "balance": 500, "currency": "USD"},
    {"id": "b", "balance": 200, "currency": "USD"}
  ],
  "instruction": "DEBIT -100 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b"
}
```
*Expected: AM01 - Invalid amount*

Test Case 10 - Account not found:
```json
{
  "accounts": [
    {"id": "a", "balance": 500, "currency": "USD"}
  ],
  "instruction": "DEBIT 100 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT xyz"
}
```
*Expected: AC03 - Account not found*

Test Case 11 - Decimal amount (should be rejected):
```json
{
  "accounts": [
    {"id": "a", "balance": 500, "currency": "USD"},
    {"id": "b", "balance": 200, "currency": "USD"}
  ],
  "instruction": "DEBIT 100.50 USD FROM ACCOUNT a FOR CREDIT TO ACCOUNT b"
}
```
*Expected: AM01 - Amount must be a positive integer (no decimals)*

Test Case 12 - Malformed instruction:
```json
{
  "accounts": [
    {"id": "a", "balance": 500, "currency": "USD"},
    {"id": "b", "balance": 200, "currency": "USD"}
  ],
  "instruction": "SEND 100 USD TO ACCOUNT b"
}
```
*Expected: SY01 or SY03 - Missing required keywords or malformed instruction*

### Submission Checklist

Before submitting, ensure:
- ✅ Your GitHub repository is public and contains clean, well-documented code
- ✅ Your solution follows the provided template structure exactly
- ✅ Your endpoint is deployed and accessible at `POST /payment-instructions`
- ✅ All validation rules are implemented with correct status codes
- ✅ Parser works without regex
- ✅ Error messages are clear and helpful
- ✅ You've tested with multiple valid and invalid cases

---

## Application Process

**Submissions open:** November 07, 2025.

**Submissions close:** November 18, 2025.

Submit your completed assessment using this [Google form](https://docs.google.com/forms/d/e/1FAIpQLSd0X19LG0iKaqMI57UvePwacc7Cb9KmF3W05m0HD93ddGgvUg/viewform?usp=dialog)

Your submission must include:
- GitHub repository link (public)
- Full endpoint URL with path (e.g., `https://myassessmentapp.herokuapp.com/payment-instructions`)

---

*Ready to demonstrate your skills? We look forward to seeing what you can build.*