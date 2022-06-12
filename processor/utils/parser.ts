import { EarningsMetric, OperationType, Report, ReportPretty } from '../types'

const calcOperation = (num: number, num2: number, operation: OperationType) => {
  switch (operation) {
    case '+':
      return num + num2
    case '-':
      return num - num2
    case '/':
      return num / num2
    case '*':
      return num * num2
    default:
      return undefined
  }
}

const getCalculateTag = (
  tag1: ReportPretty[] | undefined,
  tag2: ReportPretty[] | undefined,
  operation: OperationType
) => {
  if (!tag1 || !tag2) return undefined
  const reports1 = tag1
  const report2 = tag2
  return reports1
    .map((r1) => {
      const otherReport = report2.find(
        (r2) => r2.end === r1.end && r1.fp === r2.fp && r1.fy === r2.fy
      )
      if (otherReport) {
        let val = undefined
        return {
          ...r1,
          val,
        } as ReportPretty
      }
      return undefined
    })
    .filter((x) => x) as ReportPretty[]
}

export const load = (earning: EarningsMetric) => {
  const tags = {} as Record<string, ReportPretty[] | undefined>

  // Assets
  tags['Assets'] = [...(earning.metrics['Assets'] ?? [])]

  // Current Assets
  tags['CurrentAssets'] = [...(earning.metrics['AssetsCurrent'] ?? [])]

  // Noncurrent Assets
  tags['NoncurrentAssets'] = [...(earning.metrics['AssetsNoncurrent'] ?? [])]
  if (tags['NoncurrentAssets'] === null) {
    if (tags['Assets'] && tags['CurrentAssets']) {
      tags['NoncurrentAssets'] = getCalculateTag(
        tags['Assets'],
        tags['CurrentAssets'],
        '-'
      )
    } else {
      tags['NoncurrentAssets'] = undefined
    }
  }

  // LiabilitiesAndEquity
  tags['LiabilitiesAndEquity'] =
    earning.metrics['LiabilitiesAndStockholdersEquity']
  if (tags['LiabilitiesAndEquity'] === null) {
    tags['LiabilitiesAndEquity'] =
      earning.metrics['LiabilitiesAndPartnersCapital']
    if (tags['LiabilitiesAndEquity']) {
      tags['LiabilitiesAndEquity'] = undefined
    }
  }

  // Liabilities
  tags['Liabilities'] = [...(earning.metrics['Liabilities'] ?? [])]

  // CurrentLiabilities
  tags['CurrentLiabilities'] = [
    ...(earning.metrics['LiabilitiesCurrent'] ?? []),
  ]

  // Noncurrent Liabilities
  tags['NoncurrentLiabilities'] = [
    ...(earning.metrics['LiabilitiesNoncurrent'] ?? []),
  ]
  if (tags['NoncurrentLiabilities'] === null) {
    if (tags['Liabilities'] && tags['CurrentLiabilities']) {
      tags['NoncurrentLiabilities'] = getCalculateTag(
        tags['Liabilities'],
        tags['CurrentLiabilities'],
        '-'
      )
    } else {
      tags['NoncurrentLiabilities'] = undefined
    }
  }

  // CommitmentsAndContingencies
  // tags['CommitmentsAndContingencies'] = [
  //   ...(earning.metrics['CommitmentsAndContingencies'] ?? []),
  // ]

  // TemporaryEquity
  // tags['TemporaryEquity'] = [
  //   ...(earning.metrics['TemporaryEquityRedemptionValue'] ?? []),
  //   ...(earning.metrics['RedeemablePreferredStockCarryingAmount'] ?? []),
  //   ...(earning.metrics['TemporaryEquityCarryingAmount'] ?? []),
  //   ...(earning.metrics[
  //     'TemporaryEquityValueExcludingAdditionalPaidInCapital'
  //   ] ?? []),
  //   ...(earning.metrics['TemporaryEquityCarryingAmountAttributableToParent'] ??
  //     []),
  //   ...(earning.metrics['RedeemableNoncontrollingInterestEquityFairValue'] ??
  //     []),
  // ]

  // RedeemableNoncontrollingInterest (added to temporary equity)
  // var redeemableNoncontrollingInterest = [
  //   ...(earning.metrics[
  //     'RedeemableNoncontrollingInterestEquityCarryingAmount'
  //   ] ?? []),
  //   ...(earning.metrics[
  //     'RedeemableNoncontrollingInterestEquityCommonCarryingAmount'
  //   ] ?? []),
  // ]

  // // This adds redeemable noncontrolling interest and temporary equity which are rare, but can be reported seperately
  // if (tags['TemporaryEquity']) {
  //   tags['TemporaryEquity'] = getCalculateTag(
  //     tags['TemporaryEquity'],
  //     redeemableNoncontrollingInterest,
  //     '+'
  //   )
  // }

  // Equity
  tags['Equity'] = [
    ...(earning.metrics[
      'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'
    ] ?? []),
    ...(earning.metrics['StockholdersEquity'] ?? []),
    ...(earning.metrics[
      'PartnersCapitalIncludingPortionAttributableToNoncontrollingInterest'
    ] ?? []),
    ...(earning.metrics['PartnersCapital'] ?? []),
    ...(earning.metrics['CommonStockholdersEquity'] ?? []),
    ...(earning.metrics['MemberEquity'] ?? []),
    ...(earning.metrics['AssetsNet'] ?? []),
  ]

  // EquityAttributableToNoncontrollingInterest
  // tags['EquityAttributableToNoncontrollingInterest'] = [
  //   ...(earning.metrics['MinorityInterest'] ?? []),
  //   ...(earning.metrics[
  //     'PartnersCapitalAttributableToNoncontrollingInterest'
  //   ] ?? []),
  // ]

  // EquityAttributableToParent
  // tags['EquityAttributableToParent'] = [
  //   ...(earning.metrics['StockholdersEquity'] ?? []),
  //   ...(earning.metrics['LiabilitiesAndPartnersCapital'] ?? []),
  // ]

  // BS Adjustments
  // If total assets is missing, try using current assets
  if (
    tags['Assets'] === undefined &&
    tags['Assets'] === tags['LiabilitiesAndEquity'] &&
    tags['CurrentAssets'] === tags['LiabilitiesAndEquity']
  ) {
    tags['Assets'] = tags['CurrentAssets']
  }

  // Added to fix Assets
  if (
    tags['Assets'] === undefined &&
    tags['LiabilitiesAndEquity'] !== undefined &&
    tags['CurrentAssets'] === tags['LiabilitiesAndEquity']
  ) {
    tags['Assets'] = tags['CurrentAssets']
  }

  // Added to fix Assets even more
  if (
    tags['Assets'] === undefined &&
    tags['NoncurrentAssets'] === undefined &&
    tags['LiabilitiesAndEquity'] !== undefined &&
    tags['LiabilitiesAndEquity'] ===
      getCalculateTag(tags['Liabilities'], tags['Equity'], '+')
  ) {
    tags['Assets'] = tags['CurrentAssets']
  }

  if (tags['Assets'] !== undefined && tags['CurrentAssets'] !== undefined) {
    tags['NoncurrentAssets'] = getCalculateTag(
      tags['Assets'],
      tags['CurrentAssets'],
      '-'
    )
  }

  if (
    tags['LiabilitiesAndEquity'] === undefined &&
    tags['Assets'] !== undefined
  ) {
    tags['LiabilitiesAndEquity'] = tags['Assets']
  }

  // Impute: Equity based no parent and noncontrolling interest being present
  // if (
  //   tags['EquityAttributableToNoncontrollingInterest'] !== undefined &&
  //   tags['EquityAttributableToParent'] !== undefined
  // ) {
  //   tags['Equity'] = getCalculateTag(
  //     tags['EquityAttributableToParent'],
  //     tags['EquityAttributableToNoncontrollingInterest'],
  //     '+'
  //   )
  // }

  if (
    tags['Equity'] === undefined &&
    tags['EquityAttributableToNoncontrollingInterest'] === undefined &&
    tags['EquityAttributableToParent'] !== undefined
  ) {
    tags['Equity'] = tags['EquityAttributableToParent']
  }

  if (tags['Equity'] === undefined) {
    tags['Equity'] = getCalculateTag(
      tags['EquityAttributableToParent'],
      tags['EquityAttributableToNoncontrollingInterest'],
      '+'
    )
  }

  // Added: Impute Equity attributable to parent based on existence of equity and noncontrolling interest.
  if (
    tags['Equity'] !== undefined &&
    tags['EquityAttributableToNoncontrollingInterest'] !== undefined &&
    tags['EquityAttributableToParent'] === undefined
  ) {
    tags['EquityAttributableToParent'] = getCalculateTag(
      tags['Equity'],
      tags['EquityAttributableToNoncontrollingInterest'],
      '-'
    )
  }

  // Added: Impute Equity attributable to parent based on existence of equity and noncontrolling interest.
  if (
    tags['Equity'] !== undefined &&
    tags['EquityAttributableToNoncontrollingInterest'] === undefined &&
    tags['EquityAttributableToParent'] === undefined
  ) {
    tags['EquityAttributableToParent'] = tags['Equity']
  }

  // if total liabilities is missing, figure it out based on liabilities and equity
  if (tags['Liabilities'] === undefined && tags['Equity'] !== undefined) {
    tags['Liabilities'] = getCalculateTag(
      tags['LiabilitiesAndEquity'],
      getCalculateTag(
        getCalculateTag(
          tags['CommitmentsAndContingencies'],
          tags['TemporaryEquity'],
          '+'
        ),
        tags['Equity'],
        '+'
      ),
      '+'
    )
  }

  // This seems incorrect because liabilities might not be reported
  if (
    tags['Liabilities'] !== undefined &&
    tags['CurrentLiabilities'] !== undefined
  ) {
    tags['NoncurrentLiabilities'] = getCalculateTag(
      tags['Liabilities'],
      tags['CurrentLiabilities'],
      '-'
    )
  }

  // Added to fix liabilities based on current liabilities
  if (
    tags['Liabilities'] === undefined &&
    tags['CurrentLiabilities'] !== undefined &&
    tags['NoncurrentLiabilities'] === undefined
  ) {
    tags['Liabilities'] = tags['CurrentLiabilities']
  }

  // Revenues
  tags['Revenues'] = [
    ...(earning.metrics['SalesRevenueNet'] ?? []),
    ...(earning.metrics['SalesRevenueGoodsNet'] ?? []),
    ...(earning.metrics['SalesRevenueServicesNet'] ?? []),
    ...(earning.metrics['RevenuesNetOfInterestExpense'] ?? []),
    ...(earning.metrics['RegulatedAndUnregulatedOperatingRevenue'] ?? []),
    ...(earning.metrics['HealthCareOrganizationRevenue'] ?? []),
    ...(earning.metrics['InterestAndDividendIncomeOperating'] ?? []),
    ...(earning.metrics['RealEstateRevenueNet'] ?? []),
    ...(earning.metrics['RevenueMineralSales'] ?? []),
    ...(earning.metrics['OilAndGasRevenue'] ?? []),
    ...(earning.metrics['FinancialServicesRevenue'] ?? []),
    ...(earning.metrics['RegulatedAndUnregulatedOperatingRevenue'] ?? []),
    ...(earning.metrics[
      'RevenueFromContractWithCustomerExcludingAssessedTax'
    ] ?? []),
    ...(earning.metrics[
      'RevenueFromContractWithCustomerIncludingAssessedTax'
    ] ?? []),
    ...(earning.metrics['Revenues'] ?? []),
  ]

  // CostOfRevenue
  tags['CostOfRevenue'] = [
    ...(earning.metrics['CostOfRevenue'] ?? []),
    ...(earning.metrics['CostOfServices'] ?? []),
    ...(earning.metrics['CostOfGoodsSold'] ?? []),
    ...(earning.metrics['CostOfGoodsAndServicesSold'] ?? []),
  ]

  // GrossProfit
  tags['GrossProfit'] = [...(earning.metrics['GrossProfit'] ?? [])]

  // OperatingExpenses
  tags['OperatingExpenses'] = [
    ...(earning.metrics['OperatingExpenses'] ?? []),
    ...(earning.metrics['OperatingCostsAndExpenses'] ?? []),
  ]

  // CostsAndExpenses
  tags['CostsAndExpenses'] = [
    ...(earning.metrics['CostsAndExpenses'] ?? []),
    ...(earning.metrics['CostsAndExpenses'] ?? []),
  ]

  // OtherOperatingIncome
  // tags['OtherOperatingIncome'] = [
  //   ...(earning.metrics['OtherOperatingIncome'] ?? []),
  //   ...(earning.metrics['OtherOperatingIncome'] ?? []),
  // ]

  // OperatingIncomeLoss
  tags['OperatingIncomeLoss'] = [
    ...(earning.metrics['OperatingIncomeLoss'] ?? []),
    ...(earning.metrics['OperatingIncomeLoss'] ?? []),
  ]

  // NonoperatingIncomeLoss
  tags['NonoperatingIncomeLoss'] = [
    ...(earning.metrics['NonoperatingIncomeExpense'] ?? []),
    ...(earning.metrics['NonoperatingIncomeExpense'] ?? []),
  ]
  // InterestAndDebtExpense
  tags['InterestAndDebtExpense'] = [
    ...(earning.metrics['InterestAndDebtExpense'] ?? []),
    ...(earning.metrics['InterestAndDebtExpense'] ?? []),
  ]
  // IncomeBeforeEquityMethodInvestments
  tags['IncomeBeforeEquityMethodInvestments'] = [
    ...(earning.metrics[
      'IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments'
    ] ?? []),
    ...(earning.metrics[
      'IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments'
    ] ?? []),
  ]
  // IncomeFromEquityMethodInvestments
  // tags['IncomeFromEquityMethodInvestments'] = [
  //   ...(earning.metrics['IncomeLossFromEquityMethodInvestments'] ?? []),
  //   ...(earning.metrics['IncomeLossFromEquityMethodInvestments'] ?? []),
  // ]
  // // IncomeFromContinuingOperationsBeforeTax
  // tags['IncomeFromContinuingOperationsBeforeTax'] = [
  //   ...(earning.metrics[
  //     'IncomeLossFromContinuingOperationsBeforeIncomeTaxesMinorityInterestAndIncomeLossFromEquityMethodInvestments'
  //   ] ?? []),
  //   ...(earning.metrics[
  //     'IncomeLossFromContinuingOperationsBeforeIncomeTaxesExtraordinaryItemsNoncontrollingInterest'
  //   ] ?? []),
  // ]

  // IncomeTaxExpenseBenefit
  // tags['IncomeTaxExpenseBenefit'] = [
  //   ...(earning.metrics['IncomeTaxExpenseBenefit'] ?? []),
  //   ...(earning.metrics['IncomeTaxExpenseBenefitContinuingOperations'] ?? []),
  // ]
  // // IncomeFromContinuingOperationsAfterTax
  // tags['IncomeFromContinuingOperationsAfterTax'] = [
  //   ...(earning.metrics[
  //     'IncomeLossBeforeExtraordinaryItemsAndCumulativeEffectOfChangeInAccountingPrinciple'
  //   ] ?? []),
  //   ...(earning.metrics[
  //     'IncomeLossBeforeExtraordinaryItemsAndCumulativeEffectOfChangeInAccountingPrinciple'
  //   ] ?? []),
  // ]
  // // IncomeFromDiscontinuedOperations
  // tags['IncomeFromDiscontinuedOperations'] = [
  //   ...(earning.metrics['IncomeLossFromDiscontinuedOperationsNetOfTax'] ?? []),
  //   ...(earning.metrics[
  //     'DiscontinuedOperationGainLossOnDisposalOfDiscontinuedOperationNetOfTax'
  //   ] ?? []),
  //   ...(earning.metrics[
  //     'IncomeLossFromDiscontinuedOperationsNetOfTaxAttributableToReportingEntity'
  //   ] ?? []),
  // ]
  // // ExtraordaryItemsGainLoss
  tags['ExtraordaryItemsGainLoss'] = [
    ...(earning.metrics['ExtraordinaryItemNetOfTax'] ?? []),
    ...(earning.metrics['ExtraordinaryItemNetOfTax'] ?? []),
  ]
  // NetIncomeLoss
  tags['NetIncomeLoss'] = [
    ...(earning.metrics['ProfitLoss'] ?? []),
    ...(earning.metrics['NetIncomeLoss'] ?? []),
    ...(earning.metrics['NetIncomeLossAvailableToCommonStockholdersBasic'] ??
      []),
    ...(earning.metrics['IncomeLossFromContinuingOperations'] ?? []),
    ...(earning.metrics['IncomeLossAttributableToParent'] ?? []),
    ...(earning.metrics[
      'IncomeLossFromContinuingOperationsIncludingPortionAttributableToNoncontrollingInterest'
    ] ?? []),
  ]
  // NetIncomeAvailableToCommonStockholdersBasic
  tags['NetIncomeAvailableToCommonStockholdersBasic'] = [
    ...(earning.metrics['NetIncomeLossAvailableToCommonStockholdersBasic'] ??
      []),
  ]
  // #PreferredStockDividendsAndOtherAdjustments
  tags['PreferredStockDividendsAndOtherAdjustments'] = [
    ...(earning.metrics['PreferredStockDividendsAndOtherAdjustments'] ?? []),
  ]
  // #NetIncomeAttributableToNoncontrollingInterest
  // tags['NetIncomeAttributableToNoncontrollingInterest'] = [
  //   ...(earning.metrics['NetIncomeLossAttributableToNoncontrollingInterest'] ??
  //     []),
  // ]

  // #NetIncomeAttributableToParent
  // tags['NetIncomeAttributableToParent'] = [
  //   ...(earning.metrics['NetIncomeLoss'] ?? []),
  // ]

  // OtherComprehensiveIncome
  // tags['OtherComprehensiveIncome'] = [
  //   ...(earning.metrics['OtherComprehensiveIncomeLossNetOfTax'] ?? []),
  //   ...(earning.metrics['OtherComprehensiveIncomeLossNetOfTax'] ?? []),
  // ]

  // ComprehensiveIncome
  // tags['ComprehensiveIncome'] = [
  //   ...(earning.metrics[
  //     'ComprehensiveIncomeNetOfTaxIncludingPortionAttributableToNoncontrollingInterest'
  //   ] ?? []),
  //   ...(earning.metrics['ComprehensiveIncomeNetOfTax'] ?? []),
  // ]

  // ComprehensiveIncomeAttributableToParent
  // tags['ComprehensiveIncomeAttributableToParent'] = [
  //   ...(earning.metrics['ComprehensiveIncomeNetOfTax'] ?? []),
  //   ...(earning.metrics['ComprehensiveIncomeNetOfTax'] ?? []),
  // ]

  // ComprehensiveIncomeAttributableToNoncontrollingInterest
  // tags['ComprehensiveIncomeAttributableToNoncontrollingInterest'] = [
  //   ...(earning.metrics[
  //     'ComprehensiveIncomeNetOfTaxAttributableToNoncontrollingInterest'
  //   ] ?? []),
  //   ...(earning.metrics[
  //     'ComprehensiveIncomeNetOfTaxAttributableToNoncontrollingInterest'
  //   ] ?? []),
  // ]

  // 'Adjustments to income statement information
  // Impute: NonoperatingIncomeLossPlusInterestAndDebtExpense
  // tags['NonoperatingIncomeLossPlusInterestAndDebtExpense'] = getCalculateTag(
  //   tags['NonoperatingIncomeLoss'],
  //   tags['InterestAndDebtExpense'],
  //   '+'
  // )

  // Impute: Net income available to common stockholders  (if it does not exist)
  // if (
  //   tags['NetIncomeAvailableToCommonStockholdersBasic'] === undefined &&
  //   tags['PreferredStockDividendsAndOtherAdjustments'] === undefined &&
  //   tags['NetIncomeAttributableToParent'] !== undefined
  // ) {
  //   tags['NetIncomeAvailableToCommonStockholdersBasic'] =
  //     tags['NetIncomeAttributableToParent']
  // }

  // Impute NetIncomeLoss
  // if (
  //   tags['NetIncomeLoss'] !== undefined &&
  //   tags['IncomeFromContinuingOperationsAfterTax'] === undefined
  // ) {
  //   tags['IncomeFromContinuingOperationsAfterTax'] = getCalculateTag(
  //     getCalculateTag(
  //       tags['NetIncomeLoss'],
  //       tags['IncomeFromDiscontinuedOperations'],
  //       '-'
  //     ),
  //     tags['ExtraordaryItemsGainLoss'],
  //     '-'
  //   )
  // }

  // Impute: Net income attributable to parent if it does not exist
  // if (
  //   tags['NetIncomeAttributableToParent'] === undefined &&
  //   tags['NetIncomeAttributableToNoncontrollingInterest'] === undefined &&
  //   tags['NetIncomeLoss'] !== undefined
  // ) {
  //   tags['NetIncomeAttributableToParent'] = tags['NetIncomeLoss']
  // }

  // // Impute: PreferredStockDividendsAndOtherAdjustments
  // if (
  //   tags['PreferredStockDividendsAndOtherAdjustments'] === undefined &&
  //   tags['NetIncomeAttributableToParent'] !== undefined &&
  //   tags['NetIncomeAvailableToCommonStockholdersBasic'] !== undefined
  // ) {
  //   tags['PreferredStockDividendsAndOtherAdjustments'] = getCalculateTag(
  //     tags['NetIncomeAttributableToParent'],
  //     tags['NetIncomeAvailableToCommonStockholdersBasic'],
  //     '-'
  //   )
  // }

  // Impute: comprehensive income
  // if (
  //   tags['ComprehensiveIncomeAttributableToParent'] === undefined &&
  //   tags['ComprehensiveIncomeAttributableToNoncontrollingInterest'] ===
  //     undefined &&
  //   tags['ComprehensiveIncome'] === undefined &&
  //   tags['OtherComprehensiveIncome'] === undefined
  // ) {
  //   tags['ComprehensiveIncome'] = tags['NetIncomeLoss']
  // }

  // Impute: other comprehensive income
  // if (
  //   tags['ComprehensiveIncome'] !== undefined &&
  //   tags['OtherComprehensiveIncome'] === undefined
  // ) {
  //   tags['OtherComprehensiveIncome'] = getCalculateTag(
  //     tags['ComprehensiveIncome'],
  //     tags['NetIncomeLoss'],
  //     '-'
  //   )
  // }

  // Impute: comprehensive income attributable to parent if it does not exist
  // if (
  //   tags['ComprehensiveIncomeAttributableToParent'] === undefined &&
  //   tags['ComprehensiveIncomeAttributableToNoncontrollingInterest'] ===
  //     undefined &&
  //   tags['ComprehensiveIncome'] !== undefined
  // ) {
  //   tags['ComprehensiveIncomeAttributableToParent'] =
  //     tags['ComprehensiveIncome']
  // }

  // // Impute: IncomeFromContinuingOperations*Before*Tax
  // if (
  //   tags['IncomeBeforeEquityMethodInvestments'] !== undefined &&
  //   tags['IncomeFromEquityMethodInvestments'] !== undefined &&
  //   tags['IncomeFromContinuingOperationsBeforeTax'] === undefined
  // ) {
  //   tags['IncomeFromContinuingOperationsBeforeTax'] = getCalculateTag(
  //     tags['IncomeBeforeEquityMethodInvestments'],
  //     tags['IncomeFromEquityMethodInvestments'],
  //     '+'
  //   )
  // }

  // // Impute: IncomeFromContinuingOperations*Before*Tax2 (if income before tax is missing)
  // if (
  //   tags['IncomeFromContinuingOperationsBeforeTax'] === undefined &&
  //   tags['IncomeFromContinuingOperationsAfterTax'] !== undefined
  // ) {
  //   tags['IncomeFromContinuingOperationsBeforeTax'] = getCalculateTag(
  //     tags['IncomeFromContinuingOperationsAfterTax'],
  //     tags['IncomeTaxExpenseBenefit'],
  //     '+'
  //   )
  // }

  // // Impute: IncomeFromContinuingOperations*After*Tax
  // if (
  //   tags['IncomeFromContinuingOperationsAfterTax'] === undefined &&
  //   (tags['IncomeTaxExpenseBenefit'] !== undefined ||
  //     tags['IncomeTaxExpenseBenefit'] === undefined) &&
  //   tags['IncomeFromContinuingOperationsBeforeTax'] !== undefined
  // ) {
  //   tags['IncomeFromContinuingOperationsAfterTax'] = getCalculateTag(
  //     tags['IncomeFromContinuingOperationsBeforeTax'],
  //     tags['IncomeTaxExpenseBenefit'],
  //     '-'
  //   )
  // }

  // Impute: GrossProfit
  if (
    tags['GrossProfit'] === undefined &&
    tags['Revenues'] !== undefined &&
    tags['CostOfRevenue'] !== undefined
  ) {
    tags['GrossProfit'] = getCalculateTag(
      tags['Revenues'],
      tags['CostOfRevenue'],
      '-'
    )
  }

  // Impute: Revenues
  if (
    tags['GrossProfit'] !== undefined &&
    tags['Revenues'] === undefined &&
    tags['CostOfRevenue'] !== undefined
  ) {
    tags['Revenues'] = getCalculateTag(
      tags['GrossProfit'],
      tags['CostOfRevenue'],
      '+'
    )
  }

  // Impute: CostOfRevenue
  if (
    tags['GrossProfit'] !== undefined &&
    tags['Revenues'] !== undefined &&
    tags['CostOfRevenue'] === undefined
  ) {
    tags['CostOfRevenue'] = getCalculateTag(
      tags['Revenues'],
      tags['GrossProfit'],
      '-'
    )
  }

  // Impute: CostsAndExpenses (would NEVER have costs and expenses if has gross profit, gross profit is multi-step and costs and expenses is single-step)
  if (
    tags['GrossProfit'] === undefined &&
    tags['CostsAndExpenses'] === undefined &&
    tags['CostOfRevenue'] !== undefined &&
    tags['OperatingExpenses'] !== undefined
  ) {
    tags['CostsAndExpenses'] = getCalculateTag(
      tags['CostOfRevenue'],
      tags['OperatingExpenses'],
      '+'
    )
  }

  // Impute: CostsAndExpenses based on existance of both costs of revenues and operating expenses
  if (
    tags['CostsAndExpenses'] === undefined &&
    tags['OperatingExpenses'] !== undefined &&
    tags['CostOfRevenue'] !== undefined
  ) {
    tags['CostsAndExpenses'] = getCalculateTag(
      tags['CostOfRevenue'],
      tags['OperatingExpenses'],
      '+'
    )
  }

  // Impute: CostsAndExpenses
  if (
    tags['GrossProfit'] === undefined &&
    tags['CostsAndExpenses'] === undefined &&
    tags['Revenues'] !== undefined &&
    tags['OperatingIncomeLoss'] !== undefined &&
    tags['OtherOperatingIncome'] !== undefined
  ) {
    tags['CostsAndExpenses'] = getCalculateTag(
      getCalculateTag(tags['Revenues'], tags['OperatingIncomeLoss'], '-'),
      tags['OtherOperatingIncome'],
      '-'
    )
  }

  // Impute: OperatingExpenses based on existance of costs and expenses and cost of revenues
  if (
    tags['CostOfRevenue'] !== undefined &&
    tags['CostsAndExpenses'] !== undefined &&
    tags['OperatingExpenses'] === undefined
  ) {
    tags['OperatingExpenses'] = getCalculateTag(
      tags['CostsAndExpenses'],
      tags['CostOfRevenue'],
      '-'
    )
  }

  // Impute: CostOfRevenues single-step method
  if (
    tags['Revenues'] !== undefined &&
    tags['GrossProfit'] === undefined &&
    getCalculateTag(tags['Revenues'], tags['CostsAndExpenses'], '-') ==
      tags['OperatingIncomeLoss'] &&
    tags['OperatingExpenses'] === undefined &&
    tags['OtherOperatingIncome'] === undefined
  ) {
    tags['CostOfRevenue'] = getCalculateTag(
      tags['CostsAndExpenses'],
      tags['OperatingExpenses'],
      '-'
    )
  }

  // Impute: IncomeBeforeEquityMethodInvestments
  // if (
  //   tags['IncomeBeforeEquityMethodInvestments'] === undefined &&
  //   tags['IncomeFromContinuingOperationsBeforeTax'] !== undefined
  // ) {
  //   tags['IncomeBeforeEquityMethodInvestments'] = getCalculateTag(
  //     tags['IncomeFromContinuingOperationsBeforeTax'],
  //     tags['IncomeFromEquityMethodInvestments'],
  //     '-'
  //   )
  // }

  // Impute: IncomeBeforeEquityMethodInvestments
  // if (
  //   tags['OperatingIncomeLoss'] !== undefined &&
  //   tags['NonoperatingIncomeLoss'] !== undefined &&
  //   tags['InterestAndDebtExpense'] == undefined &&
  //   tags['IncomeBeforeEquityMethodInvestments'] !== undefined
  // ) {
  //   tags['InterestAndDebtExpense'] = getCalculateTag(
  //     tags['IncomeBeforeEquityMethodInvestments'],
  //     getCalculateTag(
  //       tags['OperatingIncomeLoss'],
  //       tags['NonoperatingIncomeLoss'],
  //       '+'
  //     ),
  //     '-'
  //   )
  // }

  // Impute: OtherOperatingIncome
  // if (
  //   tags['GrossProfit'] !== undefined &&
  //   tags['OperatingExpenses'] !== undefined &&
  //   tags['OperatingIncomeLoss'] !== undefined
  // ) {
  //   tags['OtherOperatingIncome'] = getCalculateTag(
  //     tags['OperatingIncomeLoss'],
  //     getCalculateTag(tags['GrossProfit'], tags['OperatingExpenses'], '-'),
  //     '-'
  //   )
  // }

  // Move IncomeFromEquityMethodInvestments
  // if (
  //   tags['IncomeFromEquityMethodInvestments'] !== undefined &&
  //   tags['IncomeBeforeEquityMethodInvestments'] !== undefined &&
  //   tags['IncomeBeforeEquityMethodInvestments'] !==
  //     tags['IncomeFromContinuingOperationsBeforeTax']
  // ) {
  //   tags['IncomeBeforeEquityMethodInvestments'] = getCalculateTag(
  //     tags['IncomeFromContinuingOperationsBeforeTax'],
  //     tags['IncomeFromEquityMethodInvestments'],
  //     '-'
  //   )
  //   tags['OperatingIncomeLoss'] = getCalculateTag(
  //     tags['OperatingIncomeLoss'],
  //     tags['IncomeFromEquityMethodInvestments'],
  //     '-'
  //   )
  // }

  // DANGEROUS!!  May need to turn off. IS3 had 2085 PASSES WITHOUT this imputing. if it is higher,: keep the test
  // Impute: OperatingIncomeLoss
  // if (
  //   tags['OperatingIncomeLoss'] === undefined &&
  //   tags['IncomeBeforeEquityMethodInvestments'] !== undefined
  // ) {
  //   tags['OperatingIncomeLoss'] = getCalculateTag(
  //     getCalculateTag(
  //       tags['IncomeBeforeEquityMethodInvestments'],
  //       tags['NonoperatingIncomeLoss'],
  //       '+'
  //     ),
  //     tags['InterestAndDebtExpense'],
  //     '-'
  //   )
  // }

  // tags[
  //   'NonoperatingIncomePlusInterestAndDebtExpensePlusIncomeFromEquityMethodInvestments'
  // ] = getCalculateTag(
  //   tags['IncomeFromContinuingOperationsBeforeTax'],
  //   tags['OperatingIncomeLoss'],
  //   '-'
  // )

  // // NonoperatingIncomeLossPlusInterestAndDebtExpense
  // if (
  //   tags['NonoperatingIncomeLossPlusInterestAndDebtExpense'] === undefined &&
  //   tags[
  //     'NonoperatingIncomePlusInterestAndDebtExpensePlusIncomeFromEquityMethodInvestments'
  //   ] !== undefined
  // ) {
  //   tags['NonoperatingIncomeLossPlusInterestAndDebtExpense'] = getCalculateTag(
  //     tags[
  //       'NonoperatingIncomePlusInterestAndDebtExpensePlusIncomeFromEquityMethodInvestments'
  //     ],
  //     tags['IncomeFromEquityMethodInvestments'],
  //     '-'
  //   )
  // }

  // Cash flow statement

  // NetCashFlow
  tags['NetCashFlow'] = [
    ...(earning.metrics['CashAndCashEquivalentsPeriodIncreaseDecrease'] ?? []),
    ...(earning.metrics['CashPeriodIncreaseDecrease'] ?? []),
    ...(earning.metrics['NetCashProvidedByUsedInContinuingOperations'] ?? []),
    ...(earning.metrics[
      'CashCashEquivalentsRestrictedCashAndRestrictedCashEquivalentsPeriodIncreaseDecreaseIncludingExchangeRateEffect'
    ] ?? []),
  ]

  // NetCashFlowsOperating
  tags['NetCashFlowsOperating'] = [
    ...(earning.metrics['NetCashProvidedByUsedInOperatingActivities'] ?? []),
    ...(earning.metrics[
      'NetCashProvidedByUsedInOperatingActivitiesContinuingOperations'
    ] ?? []),
  ]

  // NetCashFlowsInvesting
  tags['NetCashFlowsInvesting'] = [
    ...(earning.metrics['NetCashProvidedByUsedInInvestingActivities'] ?? []),
    ...(earning.metrics[
      'NetCashProvidedByUsedInInvestingActivitiesContinuingOperations'
    ] ?? []),
  ]

  // NetCashFlowsFinancing
  tags['NetCashFlowsFinancing'] = [
    ...(earning.metrics['NetCashProvidedByUsedInFinancingActivities'] ?? []),
    ...(earning.metrics[
      'NetCashProvidedByUsedInFinancingActivitiesContinuingOperations'
    ] ?? []),
  ]

  // // NetCashFlowsOperationContinuing
  // tags['NetCashFlowsOperationContinuing'] = [
  //   ...(earning.metrics[
  //     'NetCashProvidedByUsedInOperatingActivitiesContinuingOperations'
  //   ] ?? []),
  // ]

  // // NetCashFlowsInvestingContinuing
  // tags['NetCashFlowsInvestingContinuing'] = [
  //   ...(earning.metrics[
  //     'NetCashProvidedByUsedInInvestingActivitiesContinuingOperations'
  //   ] ?? []),
  // ]
  // // NetCashFlowsFinancingContinuing
  // tags['NetCashFlowsFinancingContinuing'] =
  //   earning.metrics[
  //     'NetCashProvidedByUsedInFinancingActivitiesContinuingOperations'
  //   ]

  // // NetCashFlowsOperatingDiscontinued
  // tags['NetCashFlowsOperatingDiscontinued'] =
  //   earning.metrics[
  //     'CashProvidedByUsedInOperatingActivitiesDiscontinuedOperations'
  //   ]

  // // NetCashFlowsInvestingDiscontinued
  // tags['NetCashFlowsInvestingDiscontinued'] =
  //   earning.metrics[
  //     'CashProvidedByUsedInInvestingActivitiesDiscontinuedOperations'
  //   ]

  // // NetCashFlowsFinancingDiscontinued
  // tags['NetCashFlowsFinancingDiscontinued'] =
  //   earning.metrics[
  //     'CashProvidedByUsedInFinancingActivitiesDiscontinuedOperations'
  //   ]

  // // NetCashFlowsDiscontinued
  // tags['NetCashFlowsDiscontinued'] = [
  //   ...(earning.metrics['NetCashProvidedByUsedInDiscontinuedOperations'] ?? []),
  // ]

  // ExchangeGainsLosses
  tags['ExchangeGainsLosses'] = [
    ...(earning.metrics['EffectOfExchangeRateOnCashAndCashEquivalents'] ?? []),
    ...(earning.metrics[
      'EffectOfExchangeRateOnCashAndCashEquivalentsContinuingOperations'
    ] ?? []),
    ...(earning.metrics[
      'CashProvidedByUsedInFinancingActivitiesDiscontinuedOperations'
    ] ?? []),
  ]

  // Adjustments
  // Impute: total net cash flows discontinued if not reported
  // if (tags['NetCashFlowsDiscontinued'] === undefined) {
  //   tags['NetCashFlowsDiscontinued'] = getCalculateTag(
  //     getCalculateTag(
  //       tags['NetCashFlowsOperatingDiscontinued'],
  //       tags['NetCashFlowsInvestingDiscontinued'],
  //       '+'
  //     ),
  //     tags['NetCashFlowsFinancingDiscontinued'],
  //     '+'
  //   )
  // }

  // // Impute: cash flows from continuing
  // if (
  //   tags['NetCashFlowsOperating'] !== undefined &&
  //   tags['NetCashFlowsOperatingContinuing'] === undefined
  // ) {
  //   tags['NetCashFlowsOperatingContinuing'] = getCalculateTag(
  //     tags['NetCashFlowsOperating'],
  //     tags['NetCashFlowsOperatingDiscontinued'],
  //     '-'
  //   )
  // }

  // if (
  //   tags['NetCashFlowsInvesting'] !== undefined &&
  //   tags['NetCashFlowsInvestingContinuing'] === undefined
  // ) {
  //   tags['NetCashFlowsInvestingContinuing'] = getCalculateTag(
  //     tags['NetCashFlowsInvesting'],
  //     tags['NetCashFlowsInvestingDiscontinued'],
  //     '-'
  //   )
  // }

  // if (
  //   tags['NetCashFlowsFinancing'] !== undefined &&
  //   tags['NetCashFlowsFinancingContinuing'] === undefined
  // ) {
  //   tags['NetCashFlowsFinancingContinuing'] = getCalculateTag(
  //     tags['NetCashFlowsFinancing'],
  //     tags['NetCashFlowsFinancingDiscontinued'],
  //     '-'
  //   )
  // }

  // if (
  //   tags['NetCashFlowsOperating'] === undefined &&
  //   tags['NetCashFlowsOperatingContinuing'] !== undefined &&
  //   tags['NetCashFlowsOperatingDiscontinued'] === undefined
  // ) {
  //   tags['NetCashFlowsOperating'] = tags['NetCashFlowsOperatingContinuing']
  // }

  // if (
  //   tags['NetCashFlowsInvesting'] === undefined &&
  //   tags['NetCashFlowsInvestingContinuing'] !== undefined &&
  //   tags['NetCashFlowsInvestingDiscontinued'] === undefined
  // ) {
  //   tags['NetCashFlowsInvesting'] = tags['NetCashFlowsInvestingContinuing']
  // }

  // if (
  //   tags['NetCashFlowsFinancing'] === undefined &&
  //   tags['NetCashFlowsFinancingContinuing'] !== undefined &&
  //   tags['NetCashFlowsFinancingDiscontinued'] === undefined
  // ) {
  //   tags['NetCashFlowsFinancing'] = tags['NetCashFlowsFinancingContinuing']
  // }

  // tags['NetCashFlowsContinuing'] = getCalculateTag(
  //   getCalculateTag(
  //     tags['NetCashFlowsOperatingContinuing'],
  //     tags['NetCashFlowsInvestingContinuing'],
  //     '+'
  //   ),
  //   tags['NetCashFlowsFinancingContinuing'],
  //   '+'
  // )

  // // Impute: if net cash flow is missing,: this tries to figure out the value by adding up the detail
  // if (
  //   tags['NetCashFlow'] === undefined &&
  //   (tags['NetCashFlowsOperating'] !== undefined ||
  //     tags['NetCashFlowsInvesting'] !== undefined ||
  //     tags['NetCashFlowsFinancing'] !== undefined)
  // ) {
  //   tags['NetCashFlow'] = getCalculateTag(
  //     getCalculateTag(
  //       tags['NetCashFlowsOperating'],
  //       tags['NetCashFlowsInvesting'],
  //       '+'
  //     ),
  //     tags['NetCashFlowsFinancing'],
  //     '+'
  //   )
  // }

  const NetIncomeLossRevenues = getCalculateTag(
    tags['NetIncomeLoss'],
    tags['Revenues'],
    '/'
  )
  const AssetsEquity = getCalculateTag(tags['Assets'], tags['Equity'], '-')
  const RevenuesAssets = getCalculateTag(tags['Revenues'], tags['Assets'], '/')
  // Key ratios
  // if (NetIncomeLossRevenues && AssetsEquity && RevenuesAssets) {
  //   const AssetsEquityEquity = getCalculateTag(
  //     AssetsEquity,
  //     tags['Equity'],
  //     '/'
  //   )
  //   if (AssetsEquityEquity) {
  //     const AddOneToAssetsEquityEquity = calcNumberToTag(
  //       1,
  //       AssetsEquityEquity,
  //       '+'
  //     )
  //     const DivideOneToRevenuesAssets = calcNumberToTag(1, RevenuesAssets, '/')
  //     if (
  //       AssetsEquityEquity &&
  //       AddOneToAssetsEquityEquity &&
  //       DivideOneToRevenuesAssets
  //     ) {
  //       tags['SGR'] =
  //         getCalculateTag(
  //           getCalculateTag(
  //             NetIncomeLossRevenues,
  //             AddOneToAssetsEquityEquity!,
  //             '*'
  //           ),
  //           getCalculateTag(
  //             DivideOneToRevenuesAssets,
  //             getCalculateTag(
  //               NetIncomeLossRevenues,
  //               AddOneToAssetsEquityEquity!,
  //               '*'
  //             ),
  //             '-'
  //           ),
  //           '/'
  //         ) || undefined
  //     }
  //   }
  // }

  // if (tags['NetIncomeLoss'] && tags['Assets']) {
  //   tags['ReturnOnAssets'] = getCalculateTag(
  //     tags['NetIncomeLoss'],
  //     tags['Assets'],
  //     '/'
  //   )
  // }

  // if (tags['NetIncomeLoss'] && tags['Equity']) {
  //   tags['ReturnOnEquity'] = getCalculateTag(
  //     tags['NetIncomeLoss'],
  //     tags['Equity'],
  //     '/'
  //   )
  // }

  // if (tags['NetCashFlowsOperating'] && tags['Equity']) {
  //   tags['ReturnOnOperations'] = getCalculateTag(
  //     tags['NetCashFlowsOperating'],
  //     tags['Equity'],
  //     '/'
  //   )
  // }
  // if (tags['NetIncomeLoss'] && tags['Revenues']) {
  //   tags['ReturnOnSales'] = getCalculateTag(
  //     tags['NetIncomeLoss'],
  //     tags['Revenues'],
  //     '/'
  //   )
  // }
  return {
    ticker: earning.ticker,
    metrics: tags,
  } as EarningsMetric
}
