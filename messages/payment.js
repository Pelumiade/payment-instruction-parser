module.exports = {
  TRANSACTION_SUCCESSFUL: 'Transaction executed successfully',
  TRANSACTION_PENDING: 'Transaction scheduled for future execution',
  INVALID_AMOUNT: 'Amount must be a positive integer',
  UNSUPPORTED_CURRENCY: 'Unsupported currency. Only NGN, USD, GBP, and GHS are supported',
  CURRENCY_MISMATCH: 'Currency mismatch between transaction and account',
  INSUFFICIENT_FUNDS: 'Insufficient funds in debit account',
  SAME_ACCOUNT_ERROR: 'Debit and credit accounts cannot be the same',
  ACCOUNT_NOT_FOUND: 'Account not found',
  MALFORMED_INSTRUCTION: 'Malformed instruction: unable to parse keywords',
  INVALID_DATE_FORMAT: 'Invalid date format',
  MISSING_REQUIRED_FIELDS: 'Missing required fields in instruction',
};
