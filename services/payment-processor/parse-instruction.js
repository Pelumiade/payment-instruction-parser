/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable no-undef */
const validator = require('@app-core/validator');
const { appLogger } = require('@app-core/logger');
const PaymentMessages = require('@app/messages/payment');

const spec = `root {
  accounts[] {
    id string
    balance number
    currency string
  }
  instruction string
}`;

const parsedSpec = validator.parse(spec);

const SUPPORTED_CURRENCIES = ['NGN', 'USD', 'GBP', 'GHS'];

function parseInstruction(serviceData, options = {}) {
  let response;

  const data = validator.validate(serviceData, parsedSpec);

  try {
    const instruction = data.instruction.trim();
    const { accounts } = data;

    const instructionLower = instruction.toLowerCase();
    const parsed = parseInstructionText(instruction, instructionLower);

    if (!parsed.valid) {
      response = {
        type: null,
        amount: null,
        currency: null,
        debit_account: null,
        credit_account: null,
        execute_by: null,
        status: 'failed',
        status_reason: parsed.reason || PaymentMessages.MALFORMED_INSTRUCTION,
        status_code: 'SY03',
        accounts: [],
      };
      return response;
    }

    const { type, amount, currency, debitAccountId, creditAccountId, executeBy } = parsed;

    const currencyUpper = currency ? currency.toUpperCase() : null;

    if (!isValidAmount(amount)) {
      const accountMap = createAccountMap(accounts);
      const accountIds = [debitAccountId, creditAccountId].filter(
        (id) => findAccount(accounts, id) !== undefined
      );
      const orderedAccounts = maintainAccountOrder(accounts, accountIds);

      let amountValue = null;
      const amountNum = parseInt(amount, 10);
      if (!Number.isNaN(amountNum)) {
        amountValue = amountNum;
      }

      response = {
        type: type.toUpperCase(),
        amount: amountValue,
        currency: currencyUpper,
        debit_account: debitAccountId,
        credit_account: creditAccountId,
        execute_by: executeBy,
        status: 'failed',
        status_reason: PaymentMessages.INVALID_AMOUNT,
        status_code: 'AM01',
        accounts: orderedAccounts.map((accId) => {
          const acc = accountMap[accId];
          return {
            id: acc.id,
            balance: acc.balance,
            balance_before: acc.balance,
            currency: acc.currency.toUpperCase(),
          };
        }),
      };
      return response;
    }

    if (!currencyUpper || !SUPPORTED_CURRENCIES.includes(currencyUpper)) {
      const accountMap = createAccountMap(accounts);
      const accountIds = [debitAccountId, creditAccountId].filter(
        (id) => findAccount(accounts, id) !== undefined
      );
      const orderedAccounts = maintainAccountOrder(accounts, accountIds);

      response = {
        type: type.toUpperCase(),
        amount: parseInt(amount, 10),
        currency: currencyUpper,
        debit_account: debitAccountId,
        credit_account: creditAccountId,
        execute_by: executeBy,
        status: 'failed',
        status_reason: PaymentMessages.UNSUPPORTED_CURRENCY,
        status_code: 'CU02',
        accounts: orderedAccounts.map((accId) => {
          const acc = accountMap[accId];
          return {
            id: acc.id,
            balance: acc.balance,
            balance_before: acc.balance,
            currency: acc.currency.toUpperCase(),
          };
        }),
      };
      return response;
    }

    const debitAccount = findAccount(accounts, debitAccountId);
    const creditAccount = findAccount(accounts, creditAccountId);

    if (!debitAccount || !creditAccount) {
      const missingAccountId = !debitAccount ? debitAccountId : creditAccountId;
      const accountMap = createAccountMap(accounts);
      const accountIds = [debitAccountId, creditAccountId].filter((id) => {
        const acc = findAccount(accounts, id);
        return acc !== undefined;
      });
      const orderedAccounts = maintainAccountOrder(accounts, accountIds);

      response = {
        type: type.toUpperCase(),
        amount: parseInt(amount, 10),
        currency: currencyUpper,
        debit_account: debitAccountId,
        credit_account: creditAccountId,
        execute_by: executeBy,
        status: 'failed',
        status_reason: `${PaymentMessages.ACCOUNT_NOT_FOUND}: ${missingAccountId}`,
        status_code: 'AC03',
        accounts: orderedAccounts.map((accId) => {
          const acc = accountMap[accId];
          return {
            id: acc.id,
            balance: acc.balance,
            balance_before: acc.balance,
            currency: acc.currency.toUpperCase(),
          };
        }),
      };
      return response;
    }

    const validationError = validateTransaction({
      amount,
      currency: currencyUpper,
      debitAccount,
      creditAccount,
    });

    if (validationError) {
      const accountMap = createAccountMap(accounts);
      const orderedAccounts = maintainAccountOrder(accounts, [debitAccountId, creditAccountId]);

      response = {
        type: type.toUpperCase(),
        amount: parseInt(amount, 10),
        currency: currencyUpper,
        debit_account: debitAccountId,
        credit_account: creditAccountId,
        execute_by: executeBy,
        status: 'failed',
        status_reason: validationError.reason,
        status_code: validationError.code,
        accounts: orderedAccounts.map((accId) => {
          const acc = accountMap[accId];
          return {
            id: acc.id,
            balance: acc.balance,
            balance_before: acc.balance,
            currency: acc.currency.toUpperCase(),
          };
        }),
      };
      return response;
    }

    const isFutureDate = executeBy ? isDateInFuture(executeBy) : false;
    const shouldExecute = !executeBy || !isFutureDate;

    const accountMap = createAccountMap(accounts);
    const orderedAccounts = maintainAccountOrder(accounts, [debitAccountId, creditAccountId]);

    const processedAccounts = orderedAccounts.map((accId) => {
      const acc = accountMap[accId];
      const isDebitAccount = accId === debitAccountId;

      let newBalance = acc.balance;
      if (shouldExecute) {
        newBalance = isDebitAccount
          ? acc.balance - parseInt(amount, 10)
          : acc.balance + parseInt(amount, 10);
      }

      return {
        id: acc.id,
        balance: newBalance,
        balance_before: acc.balance,
        currency: acc.currency.toUpperCase(),
      };
    });

    response = {
      type: type.toUpperCase(),
      amount: parseInt(amount, 10),
      currency: currencyUpper,
      debit_account: debitAccountId,
      credit_account: creditAccountId,
      execute_by: executeBy,
      status: shouldExecute ? 'successful' : 'pending',
      status_reason: shouldExecute
        ? PaymentMessages.TRANSACTION_SUCCESSFUL
        : PaymentMessages.TRANSACTION_PENDING,
      status_code: shouldExecute ? 'AP00' : 'AP02',
      accounts: processedAccounts,
    };
  } catch (error) {
    appLogger.errorX(error, 'parse-instruction-error');
    throw error;
  }

  return response;
}

function parseInstructionText(instruction, instructionLower) {
  const result = {
    valid: false,
    type: null,
    amount: null,
    currency: null,
    debitAccountId: null,
    creditAccountId: null,
    executeBy: null,
    reason: null,
  };

  const parts = instruction.split(' ').filter((p) => p.length > 0);
  if (parts.length < 8) {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }

  const firstWord = parts[0].toLowerCase();
  const isDebitFormat = firstWord === 'debit';
  const isCreditFormat = firstWord === 'credit';

  if (!isDebitFormat && !isCreditFormat) {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }

  result.type = isDebitFormat ? 'DEBIT' : 'CREDIT';

  if (isDebitFormat) {
    return parseDebitFormat(parts, instructionLower, result);
  }

  return parseCreditFormat(parts, instructionLower, result);
}

function parseDebitFormat(parts, instructionLower, result) {
  // eslint-disable-next-line no-param-reassign
  let idx = 1;

  if (idx >= parts.length) {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }

  const amount = parts[idx];
  result.amount = amount;
  idx += 1;

  if (idx >= parts.length) {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }

  const currency = parts[idx];
  result.currency = currency;
  idx += 1;

  if (idx >= parts.length || parts[idx].toLowerCase() !== 'from') {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }
  idx += 1;

  if (idx >= parts.length || parts[idx].toLowerCase() !== 'account') {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }
  idx += 1;

  if (idx >= parts.length) {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }
  result.debitAccountId = parts[idx];
  idx += 1;

  if (idx >= parts.length || parts[idx].toLowerCase() !== 'for') {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }
  idx += 1;

  if (idx >= parts.length || parts[idx].toLowerCase() !== 'credit') {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }
  idx += 1;

  if (idx >= parts.length || parts[idx].toLowerCase() !== 'to') {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }
  idx += 1;

  if (idx >= parts.length || parts[idx].toLowerCase() !== 'account') {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }
  idx += 1;

  if (idx >= parts.length) {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }
  result.creditAccountId = parts[idx];
  idx += 1;

  if (idx < parts.length) {
    if (parts[idx].toLowerCase() === 'on') {
      idx += 1;
      if (idx >= parts.length) {
        result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
        return result;
      }
      const dateStr = parts[idx];
      if (!isValidDate(dateStr)) {
        result.reason = PaymentMessages.INVALID_DATE_FORMAT;
        return result;
      }
      result.executeBy = dateStr;
    } else {
      result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
      return result;
    }
  }

  result.valid = true;
  return result;
}

function parseCreditFormat(parts, instructionLower, result) {
  // eslint-disable-next-line no-param-reassign
  let idx = 1;

  if (idx >= parts.length) {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }

  const amount = parts[idx];
  result.amount = amount;
  idx += 1;

  if (idx >= parts.length) {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }

  const currency = parts[idx];
  result.currency = currency;
  idx += 1;

  if (idx >= parts.length || parts[idx].toLowerCase() !== 'to') {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }
  idx += 1;

  if (idx >= parts.length || parts[idx].toLowerCase() !== 'account') {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }
  idx += 1;

  if (idx >= parts.length) {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }
  result.creditAccountId = parts[idx];
  idx += 1;

  if (idx >= parts.length || parts[idx].toLowerCase() !== 'for') {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }
  idx += 1;

  if (idx >= parts.length || parts[idx].toLowerCase() !== 'debit') {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }
  idx += 1;

  if (idx >= parts.length || parts[idx].toLowerCase() !== 'from') {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }
  idx += 1;

  if (idx >= parts.length || parts[idx].toLowerCase() !== 'account') {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }
  idx += 1;

  if (idx >= parts.length) {
    result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
    return result;
  }
  result.debitAccountId = parts[idx];
  idx += 1;

  if (idx < parts.length) {
    if (parts[idx].toLowerCase() === 'on') {
      idx += 1;
      if (idx >= parts.length) {
        result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
        return result;
      }
      const dateStr = parts[idx];
      if (!isValidDate(dateStr)) {
        result.reason = PaymentMessages.INVALID_DATE_FORMAT;
        return result;
      }
      result.executeBy = dateStr;
    } else {
      result.reason = PaymentMessages.MALFORMED_INSTRUCTION;
      return result;
    }
  }

  result.valid = true;
  return result;
}

module.exports = parseInstruction;
