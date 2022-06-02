import { ReportPretty } from '../types'

const callback = (first: ReportPretty, second: ReportPretty) => {
  return {
    start: first.start,
    end: first.end,
    val: first.val! / second.val!,
    fp: first.fp,
    fy: first.fy,
  } as ReportPretty
}

export const ratios = {
  ReturnOnAssets: {
    tags: ['NetIncomeLoss', 'Assets'] as const,
    callback,
  },
  ReturnOnEquity: {
    tags: ['NetIncomeLoss', 'Equity'] as const,
    callback,
  },
  ReturnOnOperations: {
    tags: ['NetCashFlowsOperating', 'Equity'] as const,
    callback,
  },
  ReturnOnSales: {
    tags: ['NetIncomeLoss', 'Revenues'] as const,
    callback,
  },
} as const

const weights = {
  //
  NetCashProvidedByUsedInOperatingActivities: 19,
  // Revenue
  Revenues: 2,
  // RevenueFromContractWithCustomerExcludingAssessedTax: 2,
  // RevenueFromContractWithCustomerIncludingAssessedTax: 2,
  // (Net Income)
  // ProfitLoss: 8,
  // NetIncomeLoss: 8,
  // //
  // StockholdersEquity: 5,
  // CashAndCashEquivalentsAtCarryingValue: 2,
  // Cash: 2,
  // PaymentsToAcquireProductiveAssets: -10,
  // PaymentsToAcquirePropertyPlantAndEquipment: -8,
  // PaymentsToAcquireBusinessesNetOfCashAcquired: -3,
  // NetCashProvidedByUsedInInvestingActivities: -7,
  // NetCashProvidedByUsedInFinancingActivities: -5,
  // InventoryNet: -12,
  // // Income tax payable
  // IncreaseDecreaseInIncomeTaxesPayableNetOfIncomeTaxesReceivable: -9,
  // // Deferred Income tax
  // DeferredIncomeTaxExpenseBenefit: -6,
  // // Share based compensation
  // ShareBasedCompensation: -3,
  // // Impairment of Long-Lived Assets to be Disposed of
  // ImpairmentOfLongLivedAssetsToBeDisposedOf: 4,
  // AssetsCurrent: 3,
  // Liabilities: -1,
  // LiabilitiesCurrent: 0,
  //PaymentsOfDividendsCommonStock: 2,
  //Assets: 3,
}

// financial health score
// assets / equity ratio
// assets / liability ratio
// income growth
// NetCashProvidedByUsedInOperatingActivities growth & positive to equity
// Rev growth & positive relative to equity

//
export type Weights = typeof weights

export const config = {
  useCache: true,
  filePath: './processor/cache',
  earningsChunkSize: 11,
  waitTime: 1000,
  date: '2022-05-12',
  weights,
  quaters: 1,
  currencies: ['USD'],
}
