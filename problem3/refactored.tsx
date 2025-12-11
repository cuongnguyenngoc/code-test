interface WalletBalance {
  currency: string;
  amount: number;
}
// FormattedWalletBalance and WalletBalance, both interfaces shared same fields currency and amount
// and FormattedWalletBalance has new field formatted so FormattedWalletBalance can extends from WalletBalance to avoid duplicate code and not take benefit of extends  
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends BoxProps {

}

// we should export WalletPage or it will not be used anywhere
export const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  // we should add type for balances, make sure it returns correct type
  // and easier in access fields later
  const balances: WalletBalance[] = useWalletBalances();
  const prices = usePrices();

	const getPriority = (blockchain: any): number => {
	  switch (blockchain) {
	    case 'Osmosis':
	      return 100
	    case 'Ethereum':
	      return 50
	    case 'Arbitrum':
	      return 30
	    case 'Zilliqa':
	      return 20
	    case 'Neo':
	      return 20
	    default:
	      return -99
	  }
	}

  const sortedBalances: WalletBalance[] = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
		  const balancePriority = getPriority(balance.blockchain);
      // lhsPriority is not defined, it should be balancePriority here
      // the return code is a bit messy and long, we can just return balancePriority > -99 && balance.amount <= 0;
		  return balancePriority > -99 && balance.amount <= 0;
		}).sort((lhs: WalletBalance, rhs: WalletBalance) => {
			const leftPriority = getPriority(lhs.blockchain);
		  const rightPriority = getPriority(rhs.blockchain);
		  if (leftPriority > rightPriority) {
		    return -1;
		  } else if (rightPriority > leftPriority) {
		    return 1;
		  }
      // missing return where the case rightPriority == leftPriority
      // add new return 0;
      return 0;
    });

    // prices are not used here so we can remove it from import list to avoid unexpected behavior
  }, [balances]);

  // we can add type FormattedWalletBalance[] for formattedBalances here to make sure it returns intended fields
  const formattedBalances: FormattedWalletBalance[] = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })

  // formattedBalances is sortedBalances but with formatted field
  // sortedBalances doesnt have formatted field so it will throw error
  const rows = formattedBalances.map((balance: FormattedWalletBalance, index: number) => {
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

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}