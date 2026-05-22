// lib/debtSimplification.ts
// Simplifies a list of debts into minimum number of transactions

export interface Debt {
  from: string;
  to:   string;
  amount: number;
}

export interface PersonBalance {
  id:       string;
  name:     string;
  balance:  number; // positive = owed money, negative = owes money
}

export function simplifyDebts(balances: PersonBalance[]): Debt[] {
  const result: Debt[] = [];

  // Separate into creditors (balance > 0) and debtors (balance < 0)
  const creditors = balances.filter(p => p.balance > 0.01).map(p => ({ ...p }));
  const debtors   = balances.filter(p => p.balance < -0.01).map(p => ({ ...p }));

  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor   = debtors[i];
    const creditor = creditors[j];
    const amount   = Math.min(Math.abs(debtor.balance), creditor.balance);

    if (amount > 0.01) {
      result.push({
        from:   debtor.id,
        to:     creditor.id,
        amount: parseFloat(amount.toFixed(2)),
      });
    }

    debtor.balance   += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance)   < 0.01) i++;
    if (Math.abs(creditor.balance) < 0.01) j++;
  }

  return result;
}