## Here are the list of computational inefficiencies and anti-patterns found in the code in original.tsx

1. Dulicated code:
- `FormattedWalletBalance` and `WalletBalance`, both interfaces shared same fields `currency` and `amount`. `FormattedWalletBalance` has new field `formatted` so `FormattedWalletBalance` can `extends` from `WalletBalance` to avoid duplicate code and have benefits of extends (like `FormattedWalletBalance` can be used anywhere a `WalletBalance` is expected)

Fix: 
```typescript
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}
```

2. `WalletPage` function is not export so it will not be able to be used anywhere
Fix:
```typescript
export const WalletPage: React.FC<Props> = (props: Props) => {
```

3. `getPriority` has some anti-patterns and inefficiency issue
- it is defined in `WalletPage` so it got re-created everytime page render
- `any` should be avoid as much as possible, param `blockchain` of function `getPriority`, it should have type `string` instead of `any` to avoid unintended value
- `Zilliqa` and `Neo` value have same return `20` so we can shortern code by 
```typescript
case "Zilliqa":
case "Neo": return 20;
```
- `return -99` is not neccessary and magic number, `return -1` should serve same objective and it's commonly used.

Fix: move `getPriority` outside from `WalletPage`
```typescript
function getPriority(blockchain: string): number {
  switch (blockchain) {
    case "Osmosis": return 100;
    case "Ethereum": return 50;
    case "Arbitrum": return 30;
    case "Zilliqa":
    case "Neo": return 20;
    default: return -1;
  }
}
```

4. Incorrect filtering logic, condition, referencing undefined variables
- Inside the `filter` of `useMemo` code block
```typescript
const balancePriority = getPriority(balance.blockchain);
if (lhsPriority > -99) {
```
`lhsPriority` is undefined, causing the filter to behave incorrectly and will throw error.

- Incorrect filter condition (wrong logic)
```typescript
if (balance.amount <= 0) return true;
```
This means balances with zero/negative amounts are kept,
but usually wallets hide assets with amount <= 0.

so should be `amount > 0`.

- The sort function:
```typescript
if (leftPriority > rightPriority) return -1;
else if (rightPriority > leftPriority) return 1;
```
Missing return 0 → unstable comparison.

Also, getPriority() is called multiple times per item.

Better to compute priorities once.

Fix:
```typescript
  return balances
    .filter((b) => b.amount > 0)   // correct filter
    .map((b) => ({
      ...b,
      priority: getPriority(b.blockchain), // compute once per item
    }))
    .filter((b) => b.priority > -1)
    .sort((a, b) => b.priority - a.priority); // simplified comparator
```

5. No type for `blockchain` in `WalletBalance`
```typescript
currency: string;
amount: number;
```
but later 
```typescript
balance.blockchain
```
This type mismatch means TypeScript is not enforcing correctness and will throw error

Fix: 
```typescript
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}
```

6. `Prices` dependency in useMemo is not used
```typescript
const sortedBalances = useMemo(..., [balances, prices]);
```
The computation does not use prices, causing unnecessary recomputation, causes unnecessary re-sort on every render that prices changed.

Fix:
```typescript
const sortedBalances = useMemo(..., [balances]);
```

7. Using `.toFixed()` without specifying decimals
```typescript
balance.amount.toFixed()
```
This defaults to "0" decimals → misleading formatting.

Fix:
```typescript
balance.amount.toFixed(2)
```

8. Mapping `formattedBalances` is unused
`formattedBalances` is calculated:
```typescript
const formattedBalances = sortedBalances.map(...)
```

But not used => Dead computation => inefficiency.

9. Have 2 map operations for `sortedBalances` array is not neccessary
```typescript
const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
        className={classes.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })
```
Fix: We don't need to have formattedBalances, just format balance directly in calculating `rows` so only 1 map operation
```typescript
const rows = sortedBalances.map((balance: WalletBalance, index: number) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
        className={classes.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.amount.toFixed(2)}
      />
    )
  })
```

10. Rendering rows using index as key
```
key={index}
```
This is an anti-pattern in React lists.
Should use a unique deterministic value (like currency).

Fix:
```typescript
<WalletRow
  className={classes.row}
  key={balance.currency} // use currency as key here
  amount={balance.amount}
  usdValue={usdValue}
  formattedAmount={balance.amount.toFixed()}
/>
```
