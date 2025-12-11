interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface WalletBalanceWithPriority extends WalletBalance {
  priority: number;
}

interface Props extends BoxProps {

}

const getPriority = (blockchain: string): number => {
  switch (blockchain) {
    case 'Osmosis':
      return 100
    case 'Ethereum':
      return 50
    case 'Arbitrum':
      return 30
    case 'Zilliqa':
    case 'Neo':
      return 20
    default:
      return -1
  }
}

// we should export WalletPage or it will not be used anywhere
export const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances: WalletBalance[] = useMemo(() => {
    return balances
    .filter((balance: WalletBalance) => balance.amount > 0)   // filter out wallets with balance 0 or negative
    .map((balance: WalletBalance) => ({
      ...balance,
      priority: getPriority(balance.blockchain), // compute once per item
    }))
    .filter((balance: WalletBalanceWithPriority) => balance.priority > -1) // filter out wallets with no priority
    .sort((lhs: WalletBalanceWithPriority, rhs: WalletBalanceWithPriority) => rhs.priority - lhs.priority); // simplified comparator
  }, [balances]);

  const rows = sortedBalances.map((balance: WalletBalance) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow 
        className={classes.row}
        key={balance.currency}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.amount.toFixed(2)}
      />
    )
  })

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}